/**
 * CVPay Reconciliation & Reporting Utilities
 * Tools for financial reconciliation and transaction reporting
 */

import type { FiatTransaction, CVPayTransactionStatus, FiatGatewayConfig } from "./cvpay-types";
import { createCVPayClient } from "./cvpay-client";

/* ==================== TYPES ==================== */

export interface ReconciliationReport {
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalDepositAmount: number;
    totalWithdrawalAmount: number;
    totalDepositFees: number;
    totalWithdrawalFees: number;
    netAmount: number;
  };
  byStatus: Record<CVPayTransactionStatus, {
    count: number;
    amount: number;
  }>;
  byPaymentMethod: Record<string, {
    deposits: { count: number; amount: number };
    withdrawals: { count: number; amount: number };
  }>;
  discrepancies: Discrepancy[];
  gatewayBalance?: {
    available: number;
    frozen: number;
    total: number;
    asOf: number;
  };
}

export interface Discrepancy {
  type: "MISSING_WEBHOOK" | "AMOUNT_MISMATCH" | "STATUS_MISMATCH" | "DUPLICATE";
  severity: "LOW" | "MEDIUM" | "HIGH";
  merchantOrderNo: string;
  cvpayOrderNo?: string;
  description: string;
  expectedAmount?: number;
  actualAmount?: number;
  expectedStatus?: CVPayTransactionStatus;
  actualStatus?: CVPayTransactionStatus;
  detectedAt: number;
}

export interface DailyReport {
  date: string;
  deposits: {
    count: number;
    successCount: number;
    failedCount: number;
    totalAmount: number;
    successAmount: number;
    averageAmount: number;
    totalFees: number;
  };
  withdrawals: {
    count: number;
    successCount: number;
    failedCount: number;
    totalAmount: number;
    successAmount: number;
    averageAmount: number;
    totalFees: number;
  };
  topPaymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

/* ==================== RECONCILIATION SERVICE ==================== */

export class ReconciliationService {
  private config: FiatGatewayConfig;
  private client: ReturnType<typeof createCVPayClient>;

  constructor(config: FiatGatewayConfig) {
    this.config = config;
    this.client = createCVPayClient(config);
  }

  /**
   * Generate reconciliation report for a time period
   */
  async generateReport(
    transactions: FiatTransaction[],
    startDate: number,
    endDate: number
  ): Promise<ReconciliationReport> {
    const periodTransactions = transactions.filter(
      tx => tx.createdAt >= startDate && tx.createdAt <= endDate
    );

    // Summary
    const deposits = periodTransactions.filter(tx => tx.type === "DEPOSIT");
    const withdrawals = periodTransactions.filter(tx => tx.type === "WITHDRAWAL");

    const summary = {
      totalDeposits: deposits.length,
      totalWithdrawals: withdrawals.length,
      totalDepositAmount: deposits.reduce((sum, tx) => sum + tx.amount, 0),
      totalWithdrawalAmount: withdrawals.reduce((sum, tx) => sum + tx.amount, 0),
      totalDepositFees: deposits.reduce((sum, tx) => sum + tx.fee, 0),
      totalWithdrawalFees: withdrawals.reduce((sum, tx) => sum + tx.fee, 0),
      netAmount: 0,
    };

    summary.netAmount = summary.totalDepositAmount - summary.totalWithdrawalAmount;

    // By status
    const byStatus: Record<CVPayTransactionStatus, { count: number; amount: number }> = {
      PENDING: { count: 0, amount: 0 },
      PROCESSING: { count: 0, amount: 0 },
      SUCCESS: { count: 0, amount: 0 },
      FAILED: { count: 0, amount: 0 },
      CANCELLED: { count: 0, amount: 0 },
      EXPIRED: { count: 0, amount: 0 },
      REFUNDING: { count: 0, amount: 0 },
      REFUNDED: { count: 0, amount: 0 },
    };

    periodTransactions.forEach(tx => {
      byStatus[tx.status].count++;
      byStatus[tx.status].amount += tx.amount;
    });

    // By payment method
    const byPaymentMethod: Record<string, any> = {};
    periodTransactions.forEach(tx => {
      if (!byPaymentMethod[tx.paymentMethod]) {
        byPaymentMethod[tx.paymentMethod] = {
          deposits: { count: 0, amount: 0 },
          withdrawals: { count: 0, amount: 0 },
        };
      }

      if (tx.type === "DEPOSIT") {
        byPaymentMethod[tx.paymentMethod].deposits.count++;
        byPaymentMethod[tx.paymentMethod].deposits.amount += tx.amount;
      } else {
        byPaymentMethod[tx.paymentMethod].withdrawals.count++;
        byPaymentMethod[tx.paymentMethod].withdrawals.amount += tx.amount;
      }
    });

    // Detect discrepancies
    const discrepancies = await this.detectDiscrepancies(periodTransactions);

    // Get gateway balance
    let gatewayBalance;
    try {
      const balance = await this.client.getBalance();
      gatewayBalance = {
        available: parseFloat(balance.data.availableBalance),
        frozen: parseFloat(balance.data.frozenBalance),
        total: parseFloat(balance.data.totalBalance),
        asOf: Date.now(),
      };
    } catch (error) {
      console.error("Failed to fetch gateway balance:", error);
    }

    return {
      period: { start: startDate, end: endDate },
      summary,
      byStatus,
      byPaymentMethod,
      discrepancies,
      gatewayBalance,
    };
  }

  /**
   * Detect discrepancies in transactions
   */
  async detectDiscrepancies(transactions: FiatTransaction[]): Promise<Discrepancy[]> {
    const discrepancies: Discrepancy[] = [];

    for (const tx of transactions) {
      // Check for missing webhooks (pending for > 30 minutes)
      if (tx.status === "PENDING" && Date.now() - tx.createdAt > 30 * 60 * 1000) {
        try {
          // Query CVPay for actual status
          const response = await this.client.queryTransaction({
            merchantOrderNo: tx.merchantOrderNo,
          });

          if (response.data.status !== "PENDING") {
            discrepancies.push({
              type: "MISSING_WEBHOOK",
              severity: "HIGH",
              merchantOrderNo: tx.merchantOrderNo,
              cvpayOrderNo: tx.cvpayOrderNo,
              description: `Transaction shows ${tx.status} locally but ${response.data.status} on CVPay. Webhook may have been missed.`,
              expectedStatus: response.data.status,
              actualStatus: tx.status,
              detectedAt: Date.now(),
            });
          }
        } catch (error) {
          // Transaction not found on CVPay
          discrepancies.push({
            type: "MISSING_WEBHOOK",
            severity: "MEDIUM",
            merchantOrderNo: tx.merchantOrderNo,
            cvpayOrderNo: tx.cvpayOrderNo,
            description: "Transaction not found on CVPay. May not have been created successfully.",
            detectedAt: Date.now(),
          });
        }
      }

      // Check for amount mismatches
      if (tx.cvpayOrderNo) {
        try {
          const response = await this.client.queryTransaction({
            cvpayOrderNo: tx.cvpayOrderNo,
          });

          const cvpayAmount = parseFloat(response.data.amount);
          if (Math.abs(cvpayAmount - tx.amount) > 0.01) {
            discrepancies.push({
              type: "AMOUNT_MISMATCH",
              severity: "HIGH",
              merchantOrderNo: tx.merchantOrderNo,
              cvpayOrderNo: tx.cvpayOrderNo,
              description: "Amount mismatch between local and CVPay records.",
              expectedAmount: cvpayAmount,
              actualAmount: tx.amount,
              detectedAt: Date.now(),
            });
          }
        } catch (error) {
          // Skip if can't query
        }
      }
    }

    // Check for duplicates
    const orderNos = new Set<string>();
    transactions.forEach(tx => {
      if (orderNos.has(tx.merchantOrderNo)) {
        discrepancies.push({
          type: "DUPLICATE",
          severity: "HIGH",
          merchantOrderNo: tx.merchantOrderNo,
          cvpayOrderNo: tx.cvpayOrderNo,
          description: "Duplicate merchant order number found.",
          detectedAt: Date.now(),
        });
      }
      orderNos.add(tx.merchantOrderNo);
    });

    return discrepancies;
  }

  /**
   * Generate daily report
   */
  generateDailyReport(transactions: FiatTransaction[], date: Date): DailyReport {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayTransactions = transactions.filter(
      tx =>
        tx.createdAt >= startOfDay.getTime() &&
        tx.createdAt <= endOfDay.getTime()
    );

    const deposits = dayTransactions.filter(tx => tx.type === "DEPOSIT");
    const withdrawals = dayTransactions.filter(tx => tx.type === "WITHDRAWAL");

    const depositsSuccess = deposits.filter(tx => tx.status === "SUCCESS");
    const depositsFailed = deposits.filter(tx => tx.status === "FAILED");
    const withdrawalsSuccess = withdrawals.filter(tx => tx.status === "SUCCESS");
    const withdrawalsFailed = withdrawals.filter(tx => tx.status === "FAILED");

    // Top payment methods
    const methodCounts: Record<string, { count: number; amount: number }> = {};
    dayTransactions.forEach(tx => {
      if (!methodCounts[tx.paymentMethod]) {
        methodCounts[tx.paymentMethod] = { count: 0, amount: 0 };
      }
      methodCounts[tx.paymentMethod].count++;
      methodCounts[tx.paymentMethod].amount += tx.amount;
    });

    const topPaymentMethods = Object.entries(methodCounts)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      date: date.toISOString().split("T")[0],
      deposits: {
        count: deposits.length,
        successCount: depositsSuccess.length,
        failedCount: depositsFailed.length,
        totalAmount: deposits.reduce((sum, tx) => sum + tx.amount, 0),
        successAmount: depositsSuccess.reduce((sum, tx) => sum + tx.amount, 0),
        averageAmount: deposits.length > 0
          ? deposits.reduce((sum, tx) => sum + tx.amount, 0) / deposits.length
          : 0,
        totalFees: deposits.reduce((sum, tx) => sum + tx.fee, 0),
      },
      withdrawals: {
        count: withdrawals.length,
        successCount: withdrawalsSuccess.length,
        failedCount: withdrawalsFailed.length,
        totalAmount: withdrawals.reduce((sum, tx) => sum + tx.amount, 0),
        successAmount: withdrawalsSuccess.reduce((sum, tx) => sum + tx.amount, 0),
        averageAmount: withdrawals.length > 0
          ? withdrawals.reduce((sum, tx) => sum + tx.amount, 0) / withdrawals.length
          : 0,
        totalFees: withdrawals.reduce((sum, tx) => sum + tx.fee, 0),
      },
      topPaymentMethods,
    };
  }

  /**
   * Export transactions to CSV format
   */
  exportToCSV(transactions: FiatTransaction[]): string {
    const headers = [
      "Transaction ID",
      "CVPay Order No",
      "User ID",
      "Type",
      "Amount",
      "Fee",
      "Net Amount",
      "Currency",
      "Payment Method",
      "Channel Type",
      "Status",
      "Account Number",
      "Account Name",
      "Created At",
      "Completed At",
      "Failure Reason",
      "IP Address",
    ];

    const rows = transactions.map(tx => [
      tx.id,
      tx.cvpayOrderNo || "",
      tx.userId,
      tx.type,
      tx.amount.toFixed(2),
      tx.fee.toFixed(2),
      tx.actualAmount.toFixed(2),
      tx.currency,
      tx.paymentMethod,
      tx.channelType,
      tx.status,
      tx.accountNumber || "",
      tx.accountName || "",
      new Date(tx.createdAt).toISOString(),
      tx.completedAt ? new Date(tx.completedAt).toISOString() : "",
      tx.failureReason || "",
      tx.ipAddress || "",
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    return csv;
  }

  /**
   * Calculate success rate by payment method
   */
  calculateSuccessRates(transactions: FiatTransaction[]): Record<string, {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  }> {
    const rates: Record<string, any> = {};

    transactions.forEach(tx => {
      if (!rates[tx.paymentMethod]) {
        rates[tx.paymentMethod] = {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0,
        };
      }

      rates[tx.paymentMethod].total++;
      if (tx.status === "SUCCESS") {
        rates[tx.paymentMethod].successful++;
      } else if (tx.status === "FAILED") {
        rates[tx.paymentMethod].failed++;
      }
    });

    // Calculate success rates
    Object.keys(rates).forEach(method => {
      const data = rates[method];
      data.successRate = data.total > 0 ? (data.successful / data.total) * 100 : 0;
    });

    return rates;
  }

  /**
   * Get transaction volume trends (hourly distribution)
   */
  getHourlyDistribution(transactions: FiatTransaction[]): Array<{
    hour: number;
    count: number;
    amount: number;
  }> {
    const distribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      amount: 0,
    }));

    transactions.forEach(tx => {
      const hour = new Date(tx.createdAt).getHours();
      distribution[hour].count++;
      distribution[hour].amount += tx.amount;
    });

    return distribution;
  }

  /**
   * Identify high-risk transactions
   */
  identifyHighRiskTransactions(transactions: FiatTransaction[]): FiatTransaction[] {
    return transactions.filter(tx => {
      // High amount
      if (tx.amount > 50000) return true;

      // Multiple failed attempts from same user
      const userTransactions = transactions.filter(t => t.userId === tx.userId);
      const recentFailed = userTransactions.filter(
        t =>
          t.status === "FAILED" &&
          Date.now() - t.createdAt < 24 * 60 * 60 * 1000
      );
      if (recentFailed.length >= 3) return true;

      // Unusual payment method for user
      const userMethods = userTransactions.map(t => t.paymentMethod);
      const methodCount = userMethods.filter(m => m === tx.paymentMethod).length;
      if (methodCount === 1 && userTransactions.length > 10) return true;

      return false;
    });
  }
}

/* ==================== USAGE EXAMPLES ==================== */

/*
// Initialize reconciliation service
const reconciliationService = new ReconciliationService(gatewayConfig);

// Generate monthly report
const startOfMonth = new Date(2024, 0, 1).getTime();
const endOfMonth = new Date(2024, 0, 31, 23, 59, 59).getTime();
const report = await reconciliationService.generateReport(
  transactions,
  startOfMonth,
  endOfMonth
);

console.log("Monthly Summary:", report.summary);
console.log("Discrepancies found:", report.discrepancies.length);

// Generate daily report
const today = new Date();
const dailyReport = reconciliationService.generateDailyReport(transactions, today);
console.log("Today's deposits:", dailyReport.deposits);

// Export to CSV
const csv = reconciliationService.exportToCSV(transactions);
// Save to file or send as download

// Check success rates
const successRates = reconciliationService.calculateSuccessRates(transactions);
console.log("GCash success rate:", successRates.GCASH.successRate);

// Get hourly distribution
const hourlyDist = reconciliationService.getHourlyDistribution(transactions);
const peakHour = hourlyDist.reduce((max, h) => h.count > max.count ? h : max);
console.log("Peak hour:", peakHour.hour);

// Identify high-risk transactions
const highRisk = reconciliationService.identifyHighRiskTransactions(transactions);
console.log("High-risk transactions:", highRisk.length);
*/
