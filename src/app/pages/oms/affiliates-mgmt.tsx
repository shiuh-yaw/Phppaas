import { useState, useEffect } from "react";
import { OmsModal, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface AffiliateRecord {
  id: string; name: string; email: string; tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  referrals: number; activeReferrals: number; totalEarnings: number; pendingPayout: number;
  conversionRate: string; status: "active" | "suspended" | "pending"; joinedDate: string;
  phone: string; payoutMethod: string; lastPayout: string;
}

const INITIAL_AFFILIATES: AffiliateRecord[] = [
  { id: "AFF001", name: "Maria Santos", email: "maria.s@gmail.com", tier: "Gold", referrals: 234, activeReferrals: 189, totalEarnings: 58500, pendingPayout: 4200, conversionRate: "32%", status: "active", joinedDate: "2025-08-12", phone: "+63 917 123 4567", payoutMethod: "GCash", lastPayout: "2026-03-07" },
  { id: "AFF002", name: "JM Reyes", email: "jm.reyes@yahoo.com", tier: "Silver", referrals: 89, activeReferrals: 67, totalEarnings: 22250, pendingPayout: 1800, conversionRate: "28%", status: "active", joinedDate: "2025-10-05", phone: "+63 918 234 5678", payoutMethod: "GCash", lastPayout: "2026-03-05" },
  { id: "AFF003", name: "Rosa Lim", email: "rosa.lim@gmail.com", tier: "Diamond", referrals: 567, activeReferrals: 423, totalEarnings: 141750, pendingPayout: 12500, conversionRate: "38%", status: "active", joinedDate: "2025-03-20", phone: "+63 919 345 6789", payoutMethod: "Maya", lastPayout: "2026-03-10" },
  { id: "AFF004", name: "Mark Tan", email: "mark.t@yahoo.com", tier: "Gold", referrals: 178, activeReferrals: 145, totalEarnings: 44500, pendingPayout: 3600, conversionRate: "35%", status: "active", joinedDate: "2025-06-15", phone: "+63 920 456 7890", payoutMethod: "GCash", lastPayout: "2026-03-08" },
  { id: "AFF005", name: "Cherry Aquino", email: "cherry.a@gmail.com", tier: "Bronze", referrals: 23, activeReferrals: 18, totalEarnings: 5750, pendingPayout: 900, conversionRate: "22%", status: "active", joinedDate: "2026-02-28", phone: "+63 921 567 8901", payoutMethod: "GCash", lastPayout: "Never" },
  { id: "AFF006", name: "Dennis Cruz", email: "dennis.c@gmail.com", tier: "Silver", referrals: 56, activeReferrals: 41, totalEarnings: 14000, pendingPayout: 0, conversionRate: "25%", status: "suspended", joinedDate: "2025-12-20", phone: "+63 922 678 9012", payoutMethod: "Maya", lastPayout: "2026-02-15" },
  { id: "AFF007", name: "Patricia Go", email: "pat.go@gmail.com", tier: "Bronze", referrals: 8, activeReferrals: 5, totalEarnings: 2000, pendingPayout: 400, conversionRate: "18%", status: "pending", joinedDate: "2026-03-10", phone: "+63 923 789 0123", payoutMethod: "GCash", lastPayout: "Never" },
];

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = { Bronze: "bg-amber-700/15 text-amber-600", Silver: "bg-gray-400/15 text-gray-300", Gold: "bg-amber-400/15 text-amber-400", Diamond: "bg-cyan-400/15 text-cyan-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[tier] || ""}`} style={{ fontWeight: 600 }}>{tier.toUpperCase()}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", suspended: "bg-red-500/15 text-red-400", pending: "bg-amber-500/15 text-amber-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsAffiliatesMgmt() {
  const [affiliates, setAffiliates] = useState(INITIAL_AFFILIATES);
  const [search, setSearch] = useState("");
  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<AffiliateRecord | null>(null);
  const [payTarget, setPayTarget] = useState<AffiliateRecord | null>(null);
  const [batchPayOpen, setBatchPayOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const doAudit = (target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "config_save", target, detail });
  };

  const filtered = affiliates.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalEarnings = affiliates.reduce((s, a) => s + a.totalEarnings, 0);
  const totalPending = affiliates.reduce((s, a) => s + a.pendingPayout, 0);
  const totalReferrals = affiliates.reduce((s, a) => s + a.referrals, 0);
  const payableAffiliates = affiliates.filter(a => a.pendingPayout > 0 && a.status === "active");

  const handlePaySingle = () => {
    if (!payTarget) return;
    setAffiliates(affiliates.map(a => a.id === payTarget.id ? { ...a, totalEarnings: a.totalEarnings, pendingPayout: 0, lastPayout: "2026-03-13" } : a));
    setPayTarget(null);
    showOmsToast(`₱${payTarget.pendingPayout.toLocaleString()} paid to ${payTarget.name} via ${payTarget.payoutMethod}`);
  };

  const handleBatchPay = () => {
    const total = payableAffiliates.reduce((s, a) => s + a.pendingPayout, 0);
    setAffiliates(affiliates.map(a => a.pendingPayout > 0 && a.status === "active" ? { ...a, pendingPayout: 0, lastPayout: "2026-03-13" } : a));
    setBatchPayOpen(false);
    showOmsToast(`Batch payout ₱${total.toLocaleString()} processed for ${payableAffiliates.length} affiliates`);
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Affiliates", value: affiliates.length.toString(), color: "text-white" },
          { label: "Total Referrals", value: totalReferrals.toLocaleString(), color: "text-emerald-400" },
          { label: "Total Commissions Paid", value: `₱${(totalEarnings / 1000).toFixed(0)}K`, color: "text-[#ff5222]" },
          { label: "Pending Payouts", value: `₱${(totalPending / 1000).toFixed(1)}K`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tier distribution */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { tier: "Diamond", count: affiliates.filter(a => a.tier === "Diamond").length, color: "#22d3ee" },
          { tier: "Gold", count: affiliates.filter(a => a.tier === "Gold").length, color: "#fbbf24" },
          { tier: "Silver", count: affiliates.filter(a => a.tier === "Silver").length, color: "#9ca3af" },
          { tier: "Bronze", count: affiliates.filter(a => a.tier === "Bronze").length, color: "#b45309" },
        ].map(t => (
          <div key={t.tier} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${t.color}15` }}>
              <svg className="size-4" fill="none" viewBox="0 0 20 20" stroke={t.color} strokeWidth="1.5"><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9 5.5-.8L10 2z" /></svg>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: t.color, fontWeight: 600 }}>{t.tier}</p>
              <p className="text-white text-[16px]" style={{ fontWeight: 700 }}>{t.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[280px]">
            <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search affiliates..." />
          </div>
          <button onClick={() => setBatchPayOpen(true)} className="h-8 px-4 bg-emerald-500/15 text-emerald-400 text-[11px] rounded-lg cursor-pointer hover:bg-emerald-500/25 transition-colors" style={{ fontWeight: 600 }}>
            Process Payouts ({payableAffiliates.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["ID", "Affiliate", "Tier", "Referrals", "Active", "Conv. Rate", "Total Earned", "Pending", "Status", "Actions"].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{a.id}</td>
                  <td className="px-3 py-2.5"><div><p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{a.name}</p><p className="text-[#6b7280] text-[10px]">{a.email}</p></div></td>
                  <td className="px-3 py-2.5"><TierBadge tier={a.tier} /></td>
                  <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>{a.referrals}</td>
                  <td className="px-3 py-2.5 text-[#9ca3af] text-[12px]">{a.activeReferrals}</td>
                  <td className="px-3 py-2.5 text-emerald-400 text-[12px]" style={{ fontWeight: 600 }}>{a.conversionRate}</td>
                  <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>₱{a.totalEarnings.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-[#ff5222] text-[12px]" style={{ fontWeight: 600 }}>₱{a.pendingPayout.toLocaleString()}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => setViewTarget(a)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>View</button>
                      {a.pendingPayout > 0 && a.status === "active" && (
                        <button onClick={() => setPayTarget(a)} className="h-6 px-2 bg-emerald-500/15 text-emerald-400 text-[10px] rounded cursor-pointer hover:bg-emerald-500/25" style={{ fontWeight: 600 }}>Pay</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== VIEW AFFILIATE MODAL ========== */}
      <OmsModal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Affiliate Details" subtitle={viewTarget?.id}>
        {viewTarget && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#1f2937]">
              <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center text-[#ff5222] text-[13px]" style={{ fontWeight: 700 }}>{viewTarget.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <p className="text-white text-[14px]" style={{ fontWeight: 600 }}>{viewTarget.name}</p>
                <div className="flex items-center gap-2 mt-0.5"><TierBadge tier={viewTarget.tier} /><StatusBadge status={viewTarget.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { label: "Email", value: viewTarget.email },
                { label: "Phone", value: viewTarget.phone },
                { label: "Joined", value: viewTarget.joinedDate },
                { label: "Payout Method", value: viewTarget.payoutMethod },
                { label: "Total Referrals", value: viewTarget.referrals.toString() },
                { label: "Active Referrals", value: viewTarget.activeReferrals.toString() },
                { label: "Conversion Rate", value: viewTarget.conversionRate },
                { label: "Last Payout", value: viewTarget.lastPayout },
                { label: "Total Earned", value: `₱${viewTarget.totalEarnings.toLocaleString()}` },
                { label: "Pending Payout", value: `₱${viewTarget.pendingPayout.toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-[#1f2937]/50">
                  <span className="text-[#6b7280] text-[11px]">{item.label}</span>
                  <span className="text-white text-[11px]" style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setViewTarget(null)}>Close</OmsBtn>
              {viewTarget.pendingPayout > 0 && viewTarget.status === "active" && (
                <OmsBtn variant="success" onClick={() => { setViewTarget(null); setPayTarget(viewTarget); }} fullWidth>Pay ₱{viewTarget.pendingPayout.toLocaleString()}</OmsBtn>
              )}
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* ========== PAY SINGLE AFFILIATE MODAL ========== */}
      <OmsModal open={!!payTarget} onClose={() => setPayTarget(null)} title="Process Payout">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981"
          message={`Release ₱${payTarget?.pendingPayout.toLocaleString()} to ${payTarget?.name}?`}
          details={[
            { label: "Affiliate", value: `${payTarget?.name || ""} (${payTarget?.id || ""})` },
            { label: "Amount", value: `₱${payTarget?.pendingPayout.toLocaleString() || "0"}` },
            { label: "Method", value: payTarget?.payoutMethod || "" },
            { label: "Tier", value: payTarget?.tier || "" },
            { label: "Last Payout", value: payTarget?.lastPayout || "" },
          ]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setPayTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={handlePaySingle} fullWidth>Confirm Payout</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== BATCH PAYOUT MODAL ========== */}
      <OmsModal open={batchPayOpen} onClose={() => setBatchPayOpen(false)} title="Batch Process Payouts" subtitle={`${payableAffiliates.length} affiliates with pending payouts`}>
        <OmsConfirmContent icon="info" iconColor="#3b82f6" iconBg="#3b82f6"
          message={`Process all pending payouts totaling ₱${payableAffiliates.reduce((s, a) => s + a.pendingPayout, 0).toLocaleString()}?`}
          details={[{ label: "Affiliates", value: payableAffiliates.length.toString() }, { label: "Total Amount", value: `₱${payableAffiliates.reduce((s, a) => s + a.pendingPayout, 0).toLocaleString()}` }]}
        />
        {payableAffiliates.length > 0 && (
          <div className="mt-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-2 max-h-[200px] overflow-y-auto">
            {payableAffiliates.map(a => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-[11px]" style={{ fontWeight: 500 }}>{a.name}</span>
                  <span className="text-[#6b7280] text-[10px]">via {a.payoutMethod}</span>
                </div>
                <span className="text-emerald-400 text-[11px]" style={{ fontWeight: 600 }}>₱{a.pendingPayout.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setBatchPayOpen(false)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={handleBatchPay} disabled={payableAffiliates.length === 0} fullWidth>Process All Payouts</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}