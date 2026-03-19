import { useState } from "react";
import { OmsModal, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { MOCK_BETS as INITIAL_BETS, type OmsBet, type BetStatus, type BetType } from "../../data/oms-mock";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type BetRecord = OmsBet;

function BetStatusBadge({ status }: { status: BetStatus }) {
  const map: Record<BetStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    won: "bg-blue-500/15 text-blue-400",
    lost: "bg-gray-500/15 text-gray-400",
    void: "bg-red-500/15 text-red-400",
    pending: "bg-amber-500/15 text-amber-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function BetTypeBadge({ type }: { type: BetType }) {
  const map: Record<BetType, { label: string; cls: string }> = {
    standard: { label: "Standard", cls: "bg-[#1f2937] text-[#9ca3af]" },
    fast_bet: { label: "Fast Bet", cls: "bg-[#ff5222]/15 text-[#ff5222]" },
    limit_order: { label: "Limit", cls: "bg-purple-500/15 text-purple-400" },
  };
  const t = map[type];
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.cls}`} style={{ fontWeight: 600 }}>{t.label}</span>;
}

export default function OmsBets() {
  const [bets, setBets] = useState(INITIAL_BETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BetStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BetType | "all">("all");
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const { hasPermission, canSeeField } = useTenantConfig();
  const { admin } = useOmsAuth();
  const { t } = useI18n();
  const role = admin?.role || "merchant_ops";
  // Tenant-config gating
  const canViewTrading = hasPermission("view_trading", role);
  const canSeeVolume = canSeeField("total_volume", role);
  const canSeePnl = canSeeField("settled_pnl", role);

  // Modal states
  const [voidTarget, setVoidTarget] = useState<BetRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<BetRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = bets.filter(b => {
    if (search && !b.user.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase()) && !b.market.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter !== "all" && b.type !== typeFilter) return false;
    if (suspiciousOnly && !b.suspicious) return false;
    return true;
  });

  const totalVolume = bets.reduce((s, b) => s + b.amount, 0);
  const suspiciousCount = bets.filter(b => b.suspicious).length;

  const handleVoid = () => {
    if (!voidTarget) return;
    setBets(bets.map(b => b.id === voidTarget.id ? { ...b, status: "void" as BetStatus } : b));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "bet_void", target: `${voidTarget.id} — ${voidTarget.user} (${voidTarget.userId})`, detail: `Voided bet on "${voidTarget.market}" — ₱${voidTarget.amount.toLocaleString()} refunded. Selection: ${voidTarget.selection}, Odds: ${voidTarget.odds}${voidTarget.suspicious ? " [SUSPICIOUS]" : ""}` });
    setVoidTarget(null);
    showOmsToast(`Bet ${voidTarget.id} voided — ₱${voidTarget.amount.toLocaleString()} refunded to ${voidTarget.user}`, "error");
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("bets.total_today"), value: "24,180", color: "text-white" },
          { label: t("bets.bet_volume"), value: `₱${(totalVolume / 1000).toFixed(0)}K`, color: "text-[#ff5222]" },
          { label: t("bets.active_bets"), value: bets.filter(b => b.status === "active").length.toString(), color: "text-emerald-400" },
          { label: t("bets.fast_bets"), value: bets.filter(b => b.type === "fast_bet").length.toString(), color: "text-amber-400" },
          { label: t("bets.suspicious"), value: suspiciousCount.toString(), color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[260px]">
            <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder={t("bets.search_bets")} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="void">Void</option>
            <option value="pending">Pending</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
            <option value="all">All Types</option>
            <option value="standard">Standard</option>
            <option value="fast_bet">Fast Bet</option>
            <option value="limit_order">Limit Order</option>
          </select>
          <button
            onClick={() => setSuspiciousOnly(!suspiciousOnly)}
            className={`h-8 px-3 rounded-lg text-[11px] cursor-pointer transition-colors ${suspiciousOnly ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af]"}`}
            style={{ fontWeight: 600 }}
          >
            {t("bets.suspicious_only")} ({suspiciousCount})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["ID", "User", "Market", "Type", "Selection", ...(canSeeVolume ? ["Amount", "Odds", "Payout"] : []), "Status", "Placed At", ...(canViewTrading ? ["Actions"] : [])].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page, pageSize).map(b => (
                <tr key={b.id} className={`border-b border-[#1f2937]/50 transition-colors ${b.suspicious ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-[#1f2937]/30"}`}>
                  <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {b.suspicious && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                      {b.id}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 500 }}>{b.user}</td>
                  <td className="px-3 py-2.5 text-[#9ca3af] text-[11px] max-w-[200px] truncate">{b.market}</td>
                  <td className="px-3 py-2.5"><BetTypeBadge type={b.type} /></td>
                  <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 500 }}>{b.selection}</td>
                  {canSeeVolume && <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>₱{b.amount.toLocaleString()}</td>}
                  {canSeeVolume && <td className="px-3 py-2.5 text-[#9ca3af] text-[12px]">{b.odds}</td>}
                  {canSeeVolume && <td className="px-3 py-2.5 text-[#ff5222] text-[12px]" style={{ fontWeight: 600 }}>₱{b.potentialPayout.toLocaleString()}</td>}
                  <td className="px-3 py-2.5"><BetStatusBadge status={b.status} /></td>
                  <td className="px-3 py-2.5 text-[#6b7280] text-[10px]">{b.placedAt}</td>
                  {canViewTrading && (
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {b.status === "active" && (
                        <button
                          className="h-6 px-2 bg-red-500/15 text-red-400 text-[10px] rounded cursor-pointer hover:bg-red-500/25"
                          style={{ fontWeight: 600 }}
                          onClick={() => setVoidTarget(b)}
                        >
                          Void
                        </button>
                      )}
                      <button
                        className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]"
                        style={{ fontWeight: 600 }}
                        onClick={() => setDetailTarget(b)}
                      >
                        Details
                      </button>
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

      {/* ========== VOID BET MODAL ========== */}
      <OmsModal open={!!voidTarget} onClose={() => setVoidTarget(null)} title={t("bets.void_bet")}>
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444"
          message={`Void bet ${voidTarget?.id}? The bet amount will be refunded to the user.`}
          details={[
            { label: "Bet ID", value: voidTarget?.id || "" },
            { label: "User", value: `${voidTarget?.user || ""} (${voidTarget?.userId || ""})` },
            { label: "Market", value: voidTarget?.market || "" },
            { label: "Selection", value: voidTarget?.selection || "" },
            { label: "Amount", value: `₱${voidTarget?.amount.toLocaleString() || "0"}` },
            { label: "Potential Payout", value: `₱${voidTarget?.potentialPayout.toLocaleString() || "0"}` },
            { label: "Suspicious", value: voidTarget?.suspicious ? "Yes" : "No" },
          ]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setVoidTarget(null)}>{t("common.cancel")}</OmsBtn>
          <OmsBtn variant="danger" onClick={handleVoid} fullWidth>Void & Refund</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== BET DETAIL MODAL ========== */}
      <OmsModal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={t("bets.bet_details")} subtitle={detailTarget?.id}>
        {detailTarget && (
          <div>
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3 space-y-2">
              {[
                { label: "User", value: `${detailTarget.user} (${detailTarget.userId})` },
                { label: "Market", value: detailTarget.market },
                { label: "Market ID", value: detailTarget.marketId },
                { label: "Type", value: detailTarget.type === "fast_bet" ? "Fast Bet" : detailTarget.type === "limit_order" ? "Limit Order" : "Standard" },
                { label: "Selection", value: detailTarget.selection },
                { label: "Amount", value: `₱${detailTarget.amount.toLocaleString()}` },
                { label: "Odds", value: detailTarget.odds },
                { label: "Potential Payout", value: `₱${detailTarget.potentialPayout.toLocaleString()}` },
                { label: "Status", value: detailTarget.status.toUpperCase() },
                { label: "Placed At", value: detailTarget.placedAt },
                { label: "Suspicious", value: detailTarget.suspicious ? "Yes — Flagged for review" : "No" },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-[#6b7280] text-[11px]">{item.label}</span>
                  <span className={`text-[11px] text-right max-w-[250px] ${item.label === "Suspicious" && detailTarget.suspicious ? "text-red-400" : "text-white"}`} style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setDetailTarget(null)}>{t("common.close")}</OmsBtn>
              {detailTarget.status === "active" && (
                <OmsBtn variant="danger" onClick={() => { setDetailTarget(null); setVoidTarget(detailTarget); }} fullWidth>Void This Bet</OmsBtn>
              )}
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>
    </div>
  );
}