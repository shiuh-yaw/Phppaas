import { useState } from "react";
import { Link, useLocation } from "react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { OmsModal, OmsField, OmsTextarea, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { MOCK_TRANSACTIONS, MOCK_DAILY_FLOW, MOCK_PAYMENT_BREAKDOWN, type OmsTransaction, type TxnStatus } from "../../data/oms-mock";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type Transaction = OmsTransaction;

function TxnStatusBadge({ status }: { status: TxnStatus }) {
  const map: Record<TxnStatus, string> = { completed: "bg-emerald-500/15 text-emerald-400", processing: "bg-blue-500/15 text-blue-400", pending: "bg-amber-500/15 text-amber-400", failed: "bg-red-500/15 text-red-400", review: "bg-orange-500/15 text-orange-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsFinance() {
  const [txns, setTxns] = useState(MOCK_TRANSACTIONS);
  const [tab, setTab] = useState<"all" | "deposits" | "withdrawals" | "review">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hasPermission, canSeeField } = useTenantConfig();
  const { admin } = useOmsAuth();
  const { t } = useI18n();
  const location = useLocation();
  const role = admin?.role || "merchant_ops";
  // Tenant-config-aware helpers
  const canViewAssets = hasPermission("view_assets", role);
  const canExport = hasPermission("export_users", role);
  const canSeeAmount = canSeeField("total_asset", role);
  const canSeePnl = canSeeField("settled_pnl", role);

  // Modal states
  const [approveTarget, setApproveTarget] = useState<Transaction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = txns.filter(t => {
    if (search && !t.user.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "deposits" && t.type !== "deposit") return false;
    if (tab === "withdrawals" && t.type !== "withdrawal") return false;
    if (tab === "review" && !t.needsReview) return false;
    return true;
  });

  const reviewCount = txns.filter(t => t.needsReview).length;

  const handleApprove = () => {
    if (!approveTarget) return;
    setTxns(txns.map(t => t.id === approveTarget.id ? { ...t, status: "completed" as TxnStatus, needsReview: false } : t));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "txn_approve", target: approveTarget.id, detail: `₱${approveTarget.amount.toLocaleString()} to ${approveTarget.user}` });
    setApproveTarget(null);
    showOmsToast(`${approveTarget.id} approved — ₱${approveTarget.amount.toLocaleString()} released to ${approveTarget.user}`);
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    setTxns(txns.map(t => t.id === rejectTarget.id ? { ...t, status: "failed" as TxnStatus, needsReview: false } : t));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "txn_reject", target: rejectTarget.id, detail: `₱${rejectTarget.amount.toLocaleString()} from ${rejectTarget.user}` });
    setRejectTarget(null); setRejectReason("");
    showOmsToast(`${rejectTarget.id} rejected — funds returned to ${rejectTarget.user}`, "error");
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Finance Sub-Navigation */}
      <div className="flex gap-2 border-b border-[#1f2937] pb-3">
        <Link 
          to="/oms/finance" 
          className={`text-[12px] px-4 py-2 rounded-lg transition-colors ${
            location.pathname === "/oms/finance" 
              ? "bg-[#ff5222] text-white" 
              : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
          }`}
          style={{ fontWeight: 600 }}
        >
          Transactions
        </Link>
        <Link 
          to="/oms/finance/fiat-transactions" 
          className={`text-[12px] px-4 py-2 rounded-lg transition-colors ${
            location.pathname === "/oms/finance/fiat-transactions" 
              ? "bg-[#ff5222] text-white" 
              : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
          }`}
          style={{ fontWeight: 600 }}
        >
          Fiat Gateway
        </Link>
        <Link 
          to="/oms/finance/fiat-gateway-config" 
          className={`text-[12px] px-4 py-2 rounded-lg transition-colors ${
            location.pathname === "/oms/finance/fiat-gateway-config" 
              ? "bg-[#ff5222] text-white" 
              : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
          }`}
          style={{ fontWeight: 600 }}
        >
          Gateway Config
        </Link>
        <Link 
          to="/oms/finance/cvpay-config" 
          className={`text-[12px] px-4 py-2 rounded-lg transition-colors ${
            location.pathname === "/oms/finance/cvpay-config" 
              ? "bg-[#ff5222] text-white" 
              : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
          }`}
          style={{ fontWeight: 600 }}
        >
          CVPay Config
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("finance.deposits_today"), value: "₱4.2M", sub: "+18% vs yesterday", positive: true },
          { label: t("finance.withdrawals_today"), value: "₱2.85M", sub: "+12% vs yesterday", positive: false },
          { label: t("finance.net_flow"), value: "+₱1.35M", sub: "Positive inflow", positive: true },
          { label: t("finance.pending_review"), value: reviewCount.toString(), sub: `₱${(txns.filter(t => t.needsReview).reduce((s, t) => s + t.amount, 0) / 1000).toFixed(0)}K total`, positive: false },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className="text-white text-[20px]" style={{ fontWeight: 700 }}>{s.value}</p>
            <p className={`text-[10px] mt-0.5 ${s.positive ? "text-emerald-400" : "text-amber-400"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>{t("finance.cash_flow")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_DAILY_FLOW} id="fin-flow-bar">
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000).toFixed(0)}K`]} />
              <Bar dataKey="deposits" fill="#10b981" radius={[3, 3, 0, 0]} name="Deposits" />
              <Bar dataKey="withdrawals" fill="#ef4444" radius={[3, 3, 0, 0]} name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Payment Methods</h3>
          <div className="space-y-3">
            {MOCK_PAYMENT_BREAKDOWN.map(p => (
              <div key={p.method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#d1d5db] text-[11px]" style={{ fontWeight: 500 }}>{p.method}</span>
                  <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>{p.share}%</span>
                </div>
                <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#ff5222]" style={{ width: `${p.share}%` }} /></div>
                <div className="flex justify-between mt-0.5"><span className="text-[#4b5563] text-[9px]">{p.volume}</span><span className="text-[#4b5563] text-[9px]">{p.txns.toLocaleString()} txns</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-[#0a0e1a] rounded-lg p-0.5">
            {([{ key: "all", label: "All" }, { key: "deposits", label: "Deposits" }, { key: "withdrawals", label: "Withdrawals" }, { key: "review", label: `Review (${reviewCount})` }] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`text-[11px] px-3 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t.key ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>{t.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[260px]">
            <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search transactions..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["ID", "User", "Type", "Method", ...(canSeeAmount ? ["Amount", "Fee"] : []), "Status", "Reference", "Date", ...(canViewAssets ? ["Actions"] : [])].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page, pageSize).map(t => (
                <tr key={t.id} className={`border-b border-[#1f2937]/50 transition-colors ${t.needsReview ? "bg-orange-500/5 hover:bg-orange-500/10" : "hover:bg-[#1f2937]/30"}`}>
                  <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{t.id}</td>
                  <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 500 }}>{t.user}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.type === "deposit" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`} style={{ fontWeight: 600 }}>{t.type === "deposit" ? "DEPOSIT" : "WITHDRAW"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#9ca3af] text-[11px]">{t.method}</td>
                  {canSeeAmount && <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>₱{t.amount.toLocaleString()}</td>}
                  {canSeeAmount && <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{t.fee > 0 ? `₱${t.fee}` : "-"}</td>}
                  <td className="px-3 py-2.5"><TxnStatusBadge status={t.status} /></td>
                  <td className="px-3 py-2.5 text-[#6b7280] text-[10px] font-mono">{t.reference}</td>
                  <td className="px-3 py-2.5 text-[#6b7280] text-[10px]">{t.createdAt}</td>
                  {canViewAssets && (
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {t.needsReview && (
                        <>
                          <button onClick={() => setApproveTarget(t)} className="h-6 px-2 bg-emerald-500/15 text-emerald-400 text-[10px] rounded cursor-pointer hover:bg-emerald-500/25" style={{ fontWeight: 600 }}>Approve</button>
                          <button onClick={() => { setRejectTarget(t); setRejectReason(""); }} className="h-6 px-2 bg-red-500/15 text-red-400 text-[10px] rounded cursor-pointer hover:bg-red-500/25" style={{ fontWeight: 600 }}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <OmsPagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} totalItems={filtered.length} />
      </div>

      {/* ========== APPROVE TXN MODAL ========== */}
      <OmsModal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve Transaction">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981"
          message={`Approve this ${approveTarget?.type} request? Funds will be released immediately.`}
          details={[
            { label: "Transaction", value: approveTarget?.id || "" },
            { label: "User", value: approveTarget?.user || "" },
            { label: "Type", value: approveTarget?.type === "withdrawal" ? "Withdrawal" : "Deposit" },
            { label: "Method", value: approveTarget?.method || "" },
            { label: "Amount", value: `₱${approveTarget?.amount.toLocaleString() || "0"}` },
            { label: "Fee", value: approveTarget?.fee ? `₱${approveTarget.fee}` : "None" },
            { label: "Reference", value: approveTarget?.reference || "" },
          ]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setApproveTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={handleApprove} fullWidth>Approve & Release</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== REJECT TXN MODAL ========== */}
      <OmsModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Transaction">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444"
          message={`Reject this ${rejectTarget?.type} request? Funds will be returned to the user's balance.`}
          details={[
            { label: "Transaction", value: rejectTarget?.id || "" },
            { label: "User", value: rejectTarget?.user || "" },
            { label: "Amount", value: `₱${rejectTarget?.amount.toLocaleString() || "0"}` },
            { label: "Method", value: rejectTarget?.method || "" },
          ]}
        />
        <div className="mt-3">
          <OmsField label="Rejection Reason"><OmsTextarea value={rejectReason} onChange={setRejectReason} placeholder="e.g. Suspicious activity, KYC incomplete, duplicate request..." /></OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={handleReject} fullWidth>Reject Transaction</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}