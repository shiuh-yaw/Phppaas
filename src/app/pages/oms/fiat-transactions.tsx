/**
 * Fiat Transactions Management - OMS Admin
 * Monitor and manage all CVPay deposit/withdrawal transactions
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useOmsTranslation } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { OmsPagination } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { RbacGuard, useRbac } from "../../components/oms/oms-rbac";
import { logAuditEvent } from "../../components/oms/oms-audit-log";
import type { FiatTransaction, CVPayTransactionStatus } from "../../services/cvpay-types";

export default function FiatTransactionsPage() {
  const { t } = useOmsTranslation();
  const { hasPermission } = useRbac();
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedTransaction, setSelectedTransaction] = useState<FiatTransaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNote, setActionNote] = useState("");

  // Mock data
  const stats = {
    pendingDeposits: { count: 12, amount: 125000 },
    pendingWithdrawals: { count: 8, amount: 45000 },
    todayDeposits: { count: 156, amount: 2350000 },
    todayWithdrawals: { count: 89, amount: 980000 },
    balance: 5678900.50,
  };

  const mockTransactions: FiatTransaction[] = [
    {
      id: "DEP_1234567890_abc123",
      userId: "user_456",
      tenantId: "tenant_1",
      type: "DEPOSIT",
      cvpayOrderNo: "CVP1234567890",
      merchantOrderNo: "DEP_1234567890_abc123",
      amount: 15000,
      currency: "PHP",
      fee: 0,
      actualAmount: 15000,
      paymentMethod: "GCASH",
      channelType: "EWALLET",
      status: "PENDING",
      statusHistory: [
        { status: "PENDING", timestamp: Date.now() - 5 * 60 * 1000 },
      ],
      createdAt: Date.now() - 5 * 60 * 1000,
      updatedAt: Date.now() - 5 * 60 * 1000,
      description: "Wallet deposit",
      ipAddress: "203.177.90.123",
    },
    {
      id: "WDR_1234567891_xyz456",
      userId: "user_789",
      tenantId: "tenant_1",
      type: "WITHDRAWAL",
      cvpayOrderNo: "CVW1234567891",
      merchantOrderNo: "WDR_1234567891_xyz456",
      amount: 25000,
      currency: "PHP",
      fee: 250,
      actualAmount: 24750,
      paymentMethod: "BPI",
      channelType: "BANK",
      status: "PENDING",
      statusHistory: [
        { status: "PENDING", timestamp: Date.now() - 10 * 60 * 1000 },
      ],
      accountNumber: "1234567890",
      accountName: "Maria Santos",
      bankCode: "BPI",
      createdAt: Date.now() - 10 * 60 * 1000,
      updatedAt: Date.now() - 10 * 60 * 1000,
      description: "Withdrawal to BPI",
      ipAddress: "112.199.123.45",
    },
  ];

  const filteredTransactions = mockTransactions.filter(tx => {
    if (selectedTab === "pending" && tx.status !== "PENDING") return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (searchQuery && !tx.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tx.userId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleViewDetails = (tx: FiatTransaction) => {
    setSelectedTransaction(tx);
    setDetailsOpen(true);
    logAuditEvent({
      action: "VIEW_TRANSACTION",
      category: "FIAT",
      details: { transactionId: tx.id },
    });
  };

  const handleAction = (tx: FiatTransaction, action: "approve" | "reject") => {
    setSelectedTransaction(tx);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedTransaction || !actionType) return;

    setLoading(true);
    try {
      // TODO: Call API to approve/reject transaction
      await new Promise(resolve => setTimeout(resolve, 1000));

      logAuditEvent({
        action: actionType === "approve" ? "APPROVE_TRANSACTION" : "REJECT_TRANSACTION",
        category: "FIAT",
        details: {
          transactionId: selectedTransaction.id,
          amount: selectedTransaction.amount,
          note: actionNote,
        },
      });

      setActionDialogOpen(false);
      setActionNote("");
      setSelectedTransaction(null);
      setActionType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = filteredTransactions.map(tx => ({
      "Transaction ID": tx.id,
      "CVPay Order": tx.cvpayOrderNo || "—",
      "User ID": tx.userId,
      "Type": tx.type,
      "Amount": tx.amount,
      "Fee": tx.fee,
      "Net Amount": tx.actualAmount,
      "Payment Method": tx.paymentMethod,
      "Status": tx.status,
      "Created": new Date(tx.createdAt).toLocaleString(),
      "Completed": tx.completedAt ? new Date(tx.completedAt).toLocaleString() : "—",
    }));
    
    downloadCSV(data, `fiat-transactions-${Date.now()}.csv`);
    logAuditEvent({
      action: "EXPORT_TRANSACTIONS",
      category: "FIAT",
      details: { count: data.length },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("Fiat Transactions")}</h1>
          <p className="mt-1 text-sm text-gray-600">{t("Monitor and manage CVPay deposits & withdrawals")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setLoading(!loading)}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>
          <RbacGuard permission="fiat:export">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              {t("Export")}
            </Button>
          </RbacGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("Gateway Balance")}</CardDescription>
            <CardTitle className="text-2xl">₱{stats.balance.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Wallet className="mr-1 size-4" />
              CVPay Account
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("Pending Deposits")}</CardDescription>
            <CardTitle className="text-2xl">{stats.pendingDeposits.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 size-4" />
              ₱{stats.pendingDeposits.amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("Pending Withdrawals")}</CardDescription>
            <CardTitle className="text-2xl">{stats.pendingWithdrawals.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-orange-600">
              <TrendingDown className="mr-1 size-4" />
              ₱{stats.pendingWithdrawals.amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("Today's Deposits")}</CardDescription>
            <CardTitle className="text-2xl">{stats.todayDeposits.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 size-4" />
              ₱{stats.todayDeposits.amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("Today's Withdrawals")}</CardDescription>
            <CardTitle className="text-2xl">{stats.todayWithdrawals.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-orange-600">
              <TrendingDown className="mr-1 size-4" />
              ₱{stats.todayWithdrawals.amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("Transactions")}</CardTitle>
              <CardDescription>{t("Review and approve/reject transactions")}</CardDescription>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t("Search by ID or User ID...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("Type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Types")}</SelectItem>
                <SelectItem value="DEPOSIT">{t("Deposits")}</SelectItem>
                <SelectItem value="WITHDRAWAL">{t("Withdrawals")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                <SelectItem value="PENDING">{t("Pending")}</SelectItem>
                <SelectItem value="PROCESSING">{t("Processing")}</SelectItem>
                <SelectItem value="SUCCESS">{t("Success")}</SelectItem>
                <SelectItem value="FAILED">{t("Failed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
            <TabsList>
              <TabsTrigger value="pending">
                {t("Pending")} ({mockTransactions.filter(tx => tx.status === "PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="all">
                {t("All")} ({mockTransactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              {loading ? (
                <OmsTableSkeleton columns={9} rows={10} />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Transaction ID")}</TableHead>
                          <TableHead>{t("User")}</TableHead>
                          <TableHead>{t("Type")}</TableHead>
                          <TableHead>{t("Amount")}</TableHead>
                          <TableHead>{t("Fee")}</TableHead>
                          <TableHead>{t("Net Amount")}</TableHead>
                          <TableHead>{t("Method")}</TableHead>
                          <TableHead>{t("Status")}</TableHead>
                          <TableHead>{t("Created")}</TableHead>
                          <TableHead className="text-right">{t("Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              {t("No transactions found.")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                              <TableCell className="font-mono text-xs">{tx.userId}</TableCell>
                              <TableCell>
                                <Badge variant={tx.type === "DEPOSIT" ? "default" : "outline"} className={tx.type === "DEPOSIT" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                                  {tx.type}
                                </Badge>
                              </TableCell>
                              <TableCell>₱{tx.amount.toLocaleString()}</TableCell>
                              <TableCell>₱{tx.fee.toLocaleString()}</TableCell>
                              <TableCell className="font-semibold">₱{tx.actualAmount.toLocaleString()}</TableCell>
                              <TableCell>{tx.paymentMethod}</TableCell>
                              <TableCell>
                                <StatusBadge status={tx.status} />
                              </TableCell>
                              <TableCell className="text-xs text-gray-600">
                                {new Date(tx.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(tx)}>
                                    <Eye className="size-4" />
                                  </Button>
                                  {tx.status === "PENDING" && hasPermission("fiat:approve") && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAction(tx, "approve")}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle2 className="size-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAction(tx, "reject")}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <XCircle className="size-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4">
                    <OmsPagination
                      currentPage={page}
                      totalPages={Math.ceil(filteredTransactions.length / pageSize)}
                      onPageChange={setPage}
                      totalRecords={filteredTransactions.length}
                      pageSize={pageSize}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("Transaction Details")}</DialogTitle>
              <DialogDescription>
                {selectedTransaction.type} • {selectedTransaction.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">{t("CVPay Order No")}</Label>
                  <div className="mt-1 font-mono text-sm">{selectedTransaction.cvpayOrderNo || "—"}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Merchant Order No")}</Label>
                  <div className="mt-1 font-mono text-sm">{selectedTransaction.merchantOrderNo}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("User ID")}</Label>
                  <div className="mt-1 font-mono text-sm">{selectedTransaction.userId}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("IP Address")}</Label>
                  <div className="mt-1 font-mono text-sm">{selectedTransaction.ipAddress || "—"}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Payment Method")}</Label>
                  <div className="mt-1 font-semibold">{selectedTransaction.paymentMethod}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Channel Type")}</Label>
                  <div className="mt-1">{selectedTransaction.channelType}</div>
                </div>
                {selectedTransaction.accountNumber && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-600">{t("Account Number")}</Label>
                      <div className="mt-1 font-mono text-sm">{selectedTransaction.accountNumber}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">{t("Account Name")}</Label>
                      <div className="mt-1">{selectedTransaction.accountName}</div>
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-sm text-gray-600">{t("Amount")}</Label>
                  <div className="mt-1 text-lg font-semibold">₱{selectedTransaction.amount.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Fee")}</Label>
                  <div className="mt-1 text-lg">₱{selectedTransaction.fee.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Net Amount")}</Label>
                  <div className="mt-1 text-lg font-semibold text-green-600">₱{selectedTransaction.actualAmount.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("Status")}</Label>
                  <div className="mt-1"><StatusBadge status={selectedTransaction.status} /></div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? t("Approve Transaction") : t("Reject Transaction")}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction && `${selectedTransaction.type} • ₱${selectedTransaction.amount.toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="note">{t("Note")} ({t("Optional")})</Label>
              <Textarea
                id="note"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={actionType === "approve" ? t("Approval note...") : t("Rejection reason...")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={confirmAction}
              disabled={loading}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {loading ? t("Processing...") : actionType === "approve" ? t("Approve") : t("Reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: CVPayTransactionStatus }) {
  const config = {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700", icon: Clock },
    PROCESSING: { label: "Processing", className: "bg-blue-100 text-blue-700", icon: Clock },
    SUCCESS: { label: "Success", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700", icon: XCircle },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700", icon: XCircle },
    EXPIRED: { label: "Expired", className: "bg-gray-100 text-gray-700", icon: AlertTriangle },
    REFUNDING: { label: "Refunding", className: "bg-purple-100 text-purple-700", icon: Clock },
    REFUNDED: { label: "Refunded", className: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
  };

  const { label, className, icon: Icon } = config[status] || config.PENDING;

  return (
    <Badge className={`flex items-center gap-1 ${className}`}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
