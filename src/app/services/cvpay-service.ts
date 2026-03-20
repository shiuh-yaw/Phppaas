/**
 * CVPay Service Layer
 * Business logic for fiat transactions using CVPay gateway
 */

import type {
  FiatTransaction,
  FiatGatewayConfig,
  CVPayPaymentMethod,
  CVPayCurrency,
  CVPayTransactionStatus,
  PaymentMethodInfo,
  CVPayWebhookNotification,
} from "./cvpay-types";
import { createCVPayClient, verifyWebhookSignature, CVPayError } from "./cvpay-client";

/* ==================== PAYMENT METHOD REGISTRY ==================== */

export const PAYMENT_METHODS: Record<CVPayPaymentMethod, PaymentMethodInfo> = {
  // E-Wallets
  GCASH: {
    id: "GCASH",
    name: "GCash",
    nameLocal: "GCash",
    icon: "G",
    color: "#0070E0",
    textColor: "#fff",
    channelType: "EWALLET",
    minAmount: 100,
    maxAmount: 100000,
    fee: "Free",
    feeType: "FREE",
    processingTime: "Instant",
    available: true,
    popular: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  PAYMAYA: {
    id: "PAYMAYA",
    name: "Maya",
    nameLocal: "Maya (PayMaya)",
    icon: "M",
    color: "#16A34A",
    textColor: "#fff",
    channelType: "EWALLET",
    minAmount: 100,
    maxAmount: 100000,
    fee: "Free",
    feeType: "FREE",
    processingTime: "Instant",
    available: true,
    popular: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  GRABPAY: {
    id: "GRABPAY",
    name: "GrabPay",
    nameLocal: "GrabPay",
    icon: "GP",
    color: "#00B14F",
    textColor: "#fff",
    channelType: "EWALLET",
    minAmount: 100,
    maxAmount: 50000,
    fee: "Free",
    feeType: "FREE",
    processingTime: "Instant",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  SHOPEEPAY: {
    id: "SHOPEEPAY",
    name: "ShopeePay",
    nameLocal: "ShopeePay",
    icon: "SP",
    color: "#EE4D2D",
    textColor: "#fff",
    channelType: "EWALLET",
    minAmount: 100,
    maxAmount: 50000,
    fee: "Free",
    feeType: "FREE",
    processingTime: "Instant",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  COINS_PH: {
    id: "COINS_PH",
    name: "Coins.ph",
    nameLocal: "Coins.ph",
    icon: "CP",
    color: "#0066FF",
    textColor: "#fff",
    channelType: "EWALLET",
    minAmount: 100,
    maxAmount: 50000,
    fee: "Free",
    feeType: "FREE",
    processingTime: "Instant",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  
  // Banks
  BDO: {
    id: "BDO",
    name: "BDO",
    nameLocal: "Banco de Oro",
    icon: "BDO",
    color: "#003087",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-3 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  BPI: {
    id: "BPI",
    name: "BPI",
    nameLocal: "Bank of the Philippine Islands",
    icon: "BPI",
    color: "#A01F1F",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-3 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  UNIONBANK: {
    id: "UNIONBANK",
    name: "UnionBank",
    nameLocal: "UnionBank",
    icon: "UB",
    color: "#F47920",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-3 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  METROBANK: {
    id: "METROBANK",
    name: "Metrobank",
    nameLocal: "Metropolitan Bank",
    icon: "MB",
    color: "#003366",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-5 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  LANDBANK: {
    id: "LANDBANK",
    name: "Landbank",
    nameLocal: "Land Bank of the Philippines",
    icon: "LB",
    color: "#006633",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-5 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  RCBC: {
    id: "RCBC",
    name: "RCBC",
    nameLocal: "Rizal Commercial Banking Corporation",
    icon: "RC",
    color: "#0033A0",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-5 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  PNB: {
    id: "PNB",
    name: "PNB",
    nameLocal: "Philippine National Bank",
    icon: "PNB",
    color: "#003087",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-5 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  SECURITY_BANK: {
    id: "SECURITY_BANK",
    name: "Security Bank",
    nameLocal: "Security Bank",
    icon: "SB",
    color: "#E31837",
    textColor: "#fff",
    channelType: "BANK",
    minAmount: 500,
    maxAmount: 500000,
    fee: "₱15",
    feeType: "FIXED",
    processingTime: "1-5 min",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  
  // OTC
  "7ELEVEN": {
    id: "7ELEVEN",
    name: "7-Eleven",
    nameLocal: "7-Eleven",
    icon: "7E",
    color: "#00703C",
    textColor: "#fff",
    channelType: "OTC",
    minAmount: 200,
    maxAmount: 10000,
    fee: "₱10",
    feeType: "FIXED",
    processingTime: "5-15 min",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  CEBUANA: {
    id: "CEBUANA",
    name: "Cebuana Lhuillier",
    nameLocal: "Cebuana Lhuillier",
    icon: "CL",
    color: "#FFD100",
    textColor: "#333",
    channelType: "OTC",
    minAmount: 200,
    maxAmount: 50000,
    fee: "₱25",
    feeType: "FIXED",
    processingTime: "5-15 min",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  MLHUILLIER: {
    id: "MLHUILLIER",
    name: "M Lhuillier",
    nameLocal: "M Lhuillier",
    icon: "ML",
    color: "#FF0000",
    textColor: "#fff",
    channelType: "OTC",
    minAmount: 200,
    maxAmount: 50000,
    fee: "₱25",
    feeType: "FIXED",
    processingTime: "5-15 min",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  PALAWAN: {
    id: "PALAWAN",
    name: "Palawan Pawnshop",
    nameLocal: "Palawan Pawnshop",
    icon: "PP",
    color: "#FF6600",
    textColor: "#fff",
    channelType: "OTC",
    minAmount: 200,
    maxAmount: 50000,
    fee: "₱25",
    feeType: "FIXED",
    processingTime: "5-15 min",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  WESTERN_UNION: {
    id: "WESTERN_UNION",
    name: "Western Union",
    nameLocal: "Western Union",
    icon: "WU",
    color: "#FFCC00",
    textColor: "#000",
    channelType: "OTC",
    minAmount: 500,
    maxAmount: 100000,
    fee: "₱50",
    feeType: "FIXED",
    processingTime: "10-30 min",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: true,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  
  // Online Banking
  INSTAPAY: {
    id: "INSTAPAY",
    name: "InstaPay",
    nameLocal: "InstaPay",
    icon: "IP",
    color: "#0066CC",
    textColor: "#fff",
    channelType: "ONLINE_BANKING",
    minAmount: 1,
    maxAmount: 50000,
    fee: "₱5",
    feeType: "FIXED",
    processingTime: "Real-time",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  PESONET: {
    id: "PESONET",
    name: "PESONet",
    nameLocal: "PESONet",
    icon: "PN",
    color: "#004080",
    textColor: "#fff",
    channelType: "ONLINE_BANKING",
    minAmount: 1,
    maxAmount: 1000000,
    fee: "₱10",
    feeType: "FIXED",
    processingTime: "1 business day",
    available: true,
    requiresAccountNumber: true,
    requiresAccountName: true,
    requiresBankCode: true,
    requiresBranchCode: false,
  },
  
  // Cards
  VISA: {
    id: "VISA",
    name: "Visa",
    nameLocal: "Visa",
    icon: "V",
    color: "#1A1F71",
    textColor: "#fff",
    channelType: "CARD",
    minAmount: 100,
    maxAmount: 500000,
    fee: "2.5%",
    feeType: "PERCENTAGE",
    processingTime: "Instant",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: false,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
  MASTERCARD: {
    id: "MASTERCARD",
    name: "Mastercard",
    nameLocal: "Mastercard",
    icon: "MC",
    color: "#EB001B",
    textColor: "#fff",
    channelType: "CARD",
    minAmount: 100,
    maxAmount: 500000,
    fee: "2.5%",
    feeType: "PERCENTAGE",
    processingTime: "Instant",
    available: true,
    requiresAccountNumber: false,
    requiresAccountName: false,
    requiresBankCode: false,
    requiresBranchCode: false,
  },
};

/* ==================== FIAT SERVICE CLASS ==================== */

export class FiatService {
  private config: FiatGatewayConfig;
  private client: ReturnType<typeof createCVPayClient>;

  constructor(config: FiatGatewayConfig) {
    this.config = config;
    this.client = createCVPayClient(config);
  }

  /**
   * Create deposit transaction
   */
  async createDeposit(params: {
    userId: string;
    amount: number;
    currency: CVPayCurrency;
    paymentMethod: CVPayPaymentMethod;
    userEmail?: string;
    userPhone?: string;
    description?: string;
  }): Promise<FiatTransaction> {
    const merchantOrderNo = `DEP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await this.client.createDeposit({
      merchantOrderNo,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      notifyUrl: this.config.notifyUrl,
      returnUrl: this.config.returnUrl,
      userId: params.userId,
      userEmail: params.userEmail,
      userPhone: params.userPhone,
      description: params.description,
      expireTime: 1800, // 30 minutes
      language: "tl",
    });

    const transaction: FiatTransaction = {
      id: merchantOrderNo,
      userId: params.userId,
      tenantId: this.config.tenantId,
      type: "DEPOSIT",
      cvpayOrderNo: response.data.cvpayOrderNo,
      merchantOrderNo,
      amount: params.amount,
      currency: params.currency,
      fee: 0,
      actualAmount: params.amount,
      paymentMethod: params.paymentMethod,
      channelType: PAYMENT_METHODS[params.paymentMethod].channelType,
      status: response.data.status,
      statusHistory: [{
        status: response.data.status,
        timestamp: Date.now(),
      }],
      paymentUrl: response.data.paymentUrl,
      qrCodeUrl: response.data.qrCodeUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expireAt: response.data.expireTime,
      description: params.description,
    };

    // TODO: Save to database
    console.log("Created deposit transaction:", transaction);

    return transaction;
  }

  /**
   * Create withdrawal transaction
   */
  async createWithdrawal(params: {
    userId: string;
    amount: number;
    currency: CVPayCurrency;
    paymentMethod: CVPayPaymentMethod;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    description?: string;
  }): Promise<FiatTransaction> {
    const merchantOrderNo = `WDR_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await this.client.createWithdrawal({
      merchantOrderNo,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      notifyUrl: this.config.notifyUrl,
      userId: params.userId,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      bankCode: params.bankCode,
      description: params.description,
    });

    const fee = parseFloat(response.data.fee);
    const actualAmount = parseFloat(response.data.actualAmount);

    const transaction: FiatTransaction = {
      id: merchantOrderNo,
      userId: params.userId,
      tenantId: this.config.tenantId,
      type: "WITHDRAWAL",
      cvpayOrderNo: response.data.cvpayOrderNo,
      merchantOrderNo,
      amount: params.amount,
      currency: params.currency,
      fee,
      actualAmount,
      paymentMethod: params.paymentMethod,
      channelType: PAYMENT_METHODS[params.paymentMethod].channelType,
      status: response.data.status,
      statusHistory: [{
        status: response.data.status,
        timestamp: Date.now(),
      }],
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      bankCode: params.bankCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: params.description,
    };

    // TODO: Save to database
    console.log("Created withdrawal transaction:", transaction);

    return transaction;
  }

  /**
   * Query transaction status
   */
  async queryTransaction(merchantOrderNo: string): Promise<FiatTransaction | null> {
    try {
      const response = await this.client.queryTransaction({ merchantOrderNo });
      
      // TODO: Fetch from database and update
      // For now, create from response
      const transaction: FiatTransaction = {
        id: merchantOrderNo,
        userId: "UNKNOWN",
        tenantId: this.config.tenantId,
        type: merchantOrderNo.startsWith("DEP_") ? "DEPOSIT" : "WITHDRAWAL",
        cvpayOrderNo: response.data.cvpayOrderNo,
        merchantOrderNo: response.data.merchantOrderNo,
        amount: parseFloat(response.data.amount),
        currency: response.data.currency,
        fee: parseFloat(response.data.fee || "0"),
        actualAmount: parseFloat(response.data.actualAmount || response.data.amount),
        paymentMethod: response.data.paymentMethod,
        channelType: PAYMENT_METHODS[response.data.paymentMethod].channelType,
        status: response.data.status,
        statusHistory: [{
          status: response.data.status,
          timestamp: response.data.completedAt || Date.now(),
        }],
        createdAt: response.data.createdAt,
        updatedAt: Date.now(),
        completedAt: response.data.completedAt,
        failureReason: response.data.failureReason,
      };

      return transaction;
    } catch (error) {
      if (error instanceof CVPayError && error.code === "1009") {
        return null;
      }
      throw error;
    }
  }

  /**
   * Handle webhook notification
   */
  async handleWebhook(notification: CVPayWebhookNotification): Promise<void> {
    // Verify signature
    const isValid = await verifyWebhookSignature(
      notification,
      notification.sign,
      this.config.apiSecret
    );

    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    // TODO: Update transaction in database
    console.log("Received webhook notification:", notification);

    // Update transaction status
    const statusUpdate = {
      merchantOrderNo: notification.merchantOrderNo,
      cvpayOrderNo: notification.cvpayOrderNo,
      status: notification.status,
      actualAmount: notification.actualAmount,
      fee: notification.fee,
      completedAt: notification.completedAt,
      failureReason: notification.failureReason,
      updatedAt: Date.now(),
    };

    console.log("Status update:", statusUpdate);

    // TODO: Trigger user notification, update user balance, etc.
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(type?: "DEPOSIT" | "WITHDRAWAL"): PaymentMethodInfo[] {
    return Object.values(PAYMENT_METHODS).filter(method => {
      // Filter by enabled methods in config
      if (!this.config.supportedMethods.includes(method.id)) {
        return false;
      }
      
      // Filter by availability
      if (!method.available) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get payment method info
   */
  getPaymentMethod(methodId: CVPayPaymentMethod): PaymentMethodInfo | null {
    return PAYMENT_METHODS[methodId] || null;
  }

  /**
   * Calculate fees
   */
  calculateFees(amount: number, type: "DEPOSIT" | "WITHDRAWAL"): number {
    if (type === "DEPOSIT") {
      if (this.config.depositFeeType === "PERCENTAGE") {
        return amount * (this.config.depositFeeValue / 100);
      }
      return this.config.depositFeeValue;
    } else {
      if (this.config.withdrawalFeeType === "PERCENTAGE") {
        return amount * (this.config.withdrawalFeeValue / 100);
      }
      return this.config.withdrawalFeeValue;
    }
  }
}
