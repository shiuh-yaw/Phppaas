/**
 * Wallet Page - User Portal
 * Enhanced deposit/withdraw with CVPay integration
 */

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import type { FiatTransaction, CVPayTransactionStatus } from "../services/cvpay-types";

export default function WalletPage() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "deposits" | "withdrawals">("all");

  // Mock data - in production, fetch from API
  const balance = 23450.75;
  const availableBalance = 23450.75;
  const pendingBalance = 0;

  const stats = {
    totalDeposits: 150000,
    totalWithdrawals: 126549.25,
    monthlyDeposits: 25000,
    monthlyWithdrawals: 12340.50,
  };

  const transactions: FiatTransaction[] = [
    {
      id: "DEP_1234567890_abc123",
      userId: "user_123",
      tenantId: "tenant_1",
      type: "DEPOSIT",
      cvpayOrderNo: "CVP1234567890",
      merchantOrderNo: "DEP_1234567890_abc123",
      amount: 5000,
      currency: "PHP",
      fee: 0,
      actualAmount: 5000,
      paymentMethod: "GCASH",
      channelType: "EWALLET",
      status: "SUCCESS",
      statusHistory: [
        { status: "PENDING", timestamp: Date.now() - 10 * 60 * 1000 },
        { status: "SUCCESS", timestamp: Date.now() - 5 * 60 * 1000 },
      ],
      createdAt: Date.now() - 10 * 60 * 1000,
      updatedAt: Date.now() - 5 * 60 * 1000,
      completedAt: Date.now() - 5 * 60 * 1000,
      description: "Wallet deposit",
    },
    {
      id: "WDR_1234567891_xyz456",
      userId: "user_123",
      tenantId: "tenant_1",
      type: "WITHDRAWAL",
      cvpayOrderNo: "CVW1234567891",
      merchantOrderNo: "WDR_1234567891_xyz456",
      amount: 2000,
      currency: "PHP",
      fee: 20,
      actualAmount: 1980,
      paymentMethod: "PAYMAYA",
      channelType: "EWALLET",
      status: "PROCESSING",
      statusHistory: [
        { status: "PENDING", timestamp: Date.now() - 3 * 60 * 1000 },
        { status: "PROCESSING", timestamp: Date.now() - 1 * 60 * 1000 },
      ],
      accountNumber: "09171234567",
      accountName: "Juan Dela Cruz",
      createdAt: Date.now() - 3 * 60 * 1000,
      updatedAt: Date.now() - 1 * 60 * 1000,
      description: "Withdrawal to Maya",
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (selectedTab === "all") return true;
    if (selectedTab === "deposits") return tx.type === "DEPOSIT";
    if (selectedTab === "withdrawals") return tx.type === "WITHDRAWAL";
    return true;
  });

  const theme: ModalTheme = {
    bg: "#ffffff",
    card: "#f9fafb",
    cardBorder: "#e5e7eb",
    text: "#111827",
    textSec: "#6b7280",
    textMut: "#9ca3af",
    textFaint: "#d1d5db",
    inputBg: "#f9fafb",
    inputBorder: "#e5e7eb",
    greenBg: "#d1fae5",
    greenText: "#065f46",
    orangeBg: "#fed7aa",
    orangeText: "#c2410c",
    isDark: false,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your funds and transactions</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setWithdrawModalOpen(true)}
              className="flex items-center gap-2"
            >
              <ArrowUpRight className="size-4" />
              Withdraw
            </Button>
            <Button
              size="lg"
              onClick={() => setDepositModalOpen(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <ArrowDownLeft className="size-4" />
              Deposit
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className="text-3xl">₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="size-4" />
                Available: ₱{availableBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Deposits</CardDescription>
              <CardTitle className="text-2xl">₱{stats.totalDeposits.toLocaleString("en-PH")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="size-4" />
                This month: ₱{stats.monthlyDeposits.toLocaleString("en-PH")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Withdrawals</CardDescription>
              <CardTitle className="text-2xl">₱{stats.totalWithdrawals.toLocaleString("en-PH")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <TrendingDown className="size-4" />
                This month: ₱{stats.monthlyWithdrawals.toLocaleString("en-PH")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Balance</CardDescription>
              <CardTitle className="text-2xl">₱{pendingBalance.toLocaleString("en-PH")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="size-4" />
                No pending transactions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all your deposits and withdrawals</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="size-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4">
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DepositWithdrawModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        mode="deposit"
        theme={theme}
        balance={balance}
      />
      <DepositWithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        mode="withdraw"
        theme={theme}
        balance={balance}
      />
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: FiatTransaction }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${
            transaction.type === "DEPOSIT" ? "bg-green-100" : "bg-orange-100"
          }`}
        >
          {transaction.type === "DEPOSIT" ? (
            <ArrowDownLeft className="size-5 text-green-600" />
          ) : (
            <ArrowUpRight className="size-5 text-orange-600" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {transaction.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
            </span>
            <StatusBadge status={transaction.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <span>{transaction.paymentMethod}</span>
            <span>•</span>
            <span>{new Date(transaction.createdAt).toLocaleString("en-PH")}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${transaction.type === "DEPOSIT" ? "text-green-600" : "text-orange-600"}`}>
          {transaction.type === "DEPOSIT" ? "+" : "-"}₱{transaction.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </div>
        {transaction.fee > 0 && (
          <div className="mt-1 text-sm text-gray-500">
            Fee: ₱{transaction.fee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CVPayTransactionStatus }) {
  const config = {
    PENDING: { label: "Pending", variant: "outline" as const, icon: Clock },
    PROCESSING: { label: "Processing", variant: "default" as const, icon: Clock },
    SUCCESS: { label: "Success", variant: "default" as const, icon: CheckCircle2, className: "bg-green-100 text-green-700 hover:bg-green-100" },
    FAILED: { label: "Failed", variant: "destructive" as const, icon: XCircle },
    CANCELLED: { label: "Cancelled", variant: "outline" as const, icon: XCircle },
    EXPIRED: { label: "Expired", variant: "outline" as const, icon: AlertCircle },
    REFUNDING: { label: "Refunding", variant: "default" as const, icon: Clock },
    REFUNDED: { label: "Refunded", variant: "default" as const, icon: CheckCircle2 },
  };

  const { label, variant, icon: Icon, className } = config[status] || config.PENDING;

  return (
    <Badge variant={variant} className={`flex items-center gap-1 ${className || ""}`}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
