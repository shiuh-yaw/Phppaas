import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsTextarea, OmsSelect, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type MarketStatus = "live" | "upcoming" | "resolved" | "cancelled" | "pending_review";

interface MarketRecord {
  id: string;
  title: string;
  category: string;
  status: MarketStatus;
  creator: string;
  creatorType: "system" | "user";
  volume: string;
  bettors: number;
  startDate: string;
  endDate: string;
  resolution: string;
  flagged: boolean;
}

const INITIAL_MARKETS: MarketRecord[] = [
  { id: "MKT001", title: "PBA Philippine Cup Finals: Ginebra vs San Miguel", category: "Basketball", status: "live", creator: "System", creatorType: "system", volume: "₱320K", bettors: 1240, startDate: "2026-03-10", endDate: "2026-03-15", resolution: "-", flagged: false },
  { id: "MKT002", title: "Color Game Round #8832 — Anong kulay ang lalabas?", category: "Color Game", status: "live", creator: "System", creatorType: "system", volume: "₱48.2K", bettors: 128, startDate: "2026-03-13", endDate: "2026-03-13", resolution: "-", flagged: false },
  { id: "MKT003", title: "Boxing: Donaire vs Martinez — WBC Bantamweight", category: "Boxing", status: "upcoming", creator: "System", creatorType: "system", volume: "₱1.2M", bettors: 2340, startDate: "2026-04-01", endDate: "2026-04-05", resolution: "-", flagged: false },
  { id: "MKT004", title: "MLBB M6 World Championship — ECHO PH vs ONIC ID", category: "Esports", status: "live", creator: "System", creatorType: "system", volume: "₱1.8M", bettors: 4500, startDate: "2026-03-12", endDate: "2026-03-14", resolution: "-", flagged: true },
  { id: "MKT005", title: "6/45 MegaLotto — May Jackpot Winner ba?", category: "Lottery", status: "upcoming", creator: "System", creatorType: "system", volume: "₱890K", bettors: 2340, startDate: "2026-03-17", endDate: "2026-03-17", resolution: "-", flagged: false },
  { id: "MKT006", title: "Bb. Pilipinas 2026 — Sino ang susunod na queen?", category: "Showbiz", status: "upcoming", creator: "User: @maria_s", creatorType: "user", volume: "₱560K", bettors: 2100, startDate: "2026-07-01", endDate: "2026-07-31", resolution: "-", flagged: false },
  { id: "MKT007", title: "Will it rain in Manila tomorrow?", category: "Weather", status: "resolved", creator: "System", creatorType: "system", volume: "₱125K", bettors: 890, startDate: "2026-03-12", endDate: "2026-03-13", resolution: "YES - Rainy", flagged: false },
  { id: "MKT008", title: "BSP Rate Decision — Will rates hold?", category: "Economy", status: "resolved", creator: "System", creatorType: "system", volume: "₱340K", bettors: 1560, startDate: "2026-03-01", endDate: "2026-03-07", resolution: "YES - Rates held", flagged: false },
  { id: "MKT009", title: "User-Created: Who wins UAAP Finals?", category: "Basketball", status: "pending_review", creator: "User: @jm_reyes", creatorType: "user", volume: "₱0", bettors: 0, startDate: "2026-03-20", endDate: "2026-04-15", resolution: "-", flagged: false },
  { id: "MKT010", title: "User-Created: Pinaka-viral TikTok PH this week?", category: "Showbiz", status: "pending_review", creator: "User: @cherry_a", creatorType: "user", volume: "₱0", bettors: 0, startDate: "2026-03-14", endDate: "2026-03-20", resolution: "-", flagged: false },
  { id: "MKT011", title: "Color Game Round #8830 — Unusual pattern detected", category: "Color Game", status: "live", creator: "System", creatorType: "system", volume: "₱82K", bettors: 340, startDate: "2026-03-13", endDate: "2026-03-13", resolution: "-", flagged: true },
];

const ALL_CATEGORIES = ["Basketball", "Color Game", "Boxing", "Esports", "Bingo", "Lottery", "Showbiz", "Weather", "Economy"];

function StatusBadge({ status }: { status: MarketStatus }) {
  const map: Record<MarketStatus, string> = { live: "bg-emerald-500/15 text-emerald-400", upcoming: "bg-blue-500/15 text-blue-400", resolved: "bg-gray-500/15 text-gray-400", cancelled: "bg-red-500/15 text-red-400", pending_review: "bg-amber-500/15 text-amber-400" };
  const labels: Record<MarketStatus, string> = { live: "LIVE", upcoming: "UPCOMING", resolved: "RESOLVED", cancelled: "CANCELLED", pending_review: "PENDING REVIEW" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{labels[status]}</span>;
}

export default function OmsMarkets() {
  const [markets, setMarkets] = useState(INITIAL_MARKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketStatus | "all">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";

  // Simulate loading
  useState(() => { setTimeout(() => setLoading(false), 600); });

  const doAudit = (action: string, target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: action as any, target, detail });
  };

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MarketRecord | null>(null);
  const [resolveTarget, setResolveTarget] = useState<MarketRecord | null>(null);
  const [approveTarget, setApproveTarget] = useState<MarketRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MarketRecord | null>(null);

  // Create form
  const [cTitle, setCTitle] = useState("");
  const [cCategory, setCCategory] = useState("Basketball");
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");
  const [cDesc, setCDesc] = useState("");

  // Edit form
  const [eTitle, setETitle] = useState("");
  const [eCategory, setECategory] = useState("");
  const [eStart, setEStart] = useState("");
  const [eEnd, setEEnd] = useState("");

  // Resolve form
  const [rOutcome, setROutcome] = useState("");

  const categories = [...new Set(markets.map(m => m.category))];
  const filtered = markets.filter(m => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (catFilter !== "all" && m.category !== catFilter) return false;
    return true;
  });

  const nextId = `MKT${String(markets.length + 1).padStart(3, "0")}`;

  const handleCreate = () => {
    if (!cTitle.trim() || !cStart || !cEnd) return;
    setMarkets([...markets, { id: nextId, title: cTitle, category: cCategory, status: "upcoming", creator: "System", creatorType: "system", volume: "₱0", bettors: 0, startDate: cStart, endDate: cEnd, resolution: "-", flagged: false }]);
    setCreateOpen(false);
    setCTitle(""); setCCategory("Basketball"); setCStart(""); setCEnd(""); setCDesc("");
    showOmsToast(`Market ${nextId} created successfully`);
    doAudit("config_save", nextId, `Created market: ${cTitle} (${cCategory})`);
  };

  const openEdit = (m: MarketRecord) => {
    setETitle(m.title); setECategory(m.category); setEStart(m.startDate); setEEnd(m.endDate);
    setEditTarget(m);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setMarkets(markets.map(m => m.id === editTarget.id ? { ...m, title: eTitle, category: eCategory, startDate: eStart, endDate: eEnd } : m));
    setEditTarget(null);
    showOmsToast(`Market ${editTarget.id} updated`);
    doAudit("config_save", editTarget.id, `Edited market: ${eTitle}`);
  };

  const handleResolve = () => {
    if (!resolveTarget || !rOutcome.trim()) return;
    setMarkets(markets.map(m => m.id === resolveTarget.id ? { ...m, status: "resolved" as MarketStatus, resolution: rOutcome } : m));
    setResolveTarget(null); setROutcome("");
    showOmsToast(`Market ${resolveTarget.id} resolved`);
    doAudit("config_save", resolveTarget.id, `Resolved market with outcome: ${rOutcome}`);
  };

  const handleApprove = () => {
    if (!approveTarget) return;
    setMarkets(markets.map(m => m.id === approveTarget.id ? { ...m, status: "upcoming" as MarketStatus } : m));
    setApproveTarget(null);
    showOmsToast(`Market ${approveTarget.id} approved`, "success");
    doAudit("config_save", approveTarget.id, `Approved user-created market: ${approveTarget.title}`);
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    setMarkets(markets.map(m => m.id === cancelTarget.id ? { ...m, status: "cancelled" as MarketStatus } : m));
    setCancelTarget(null);
    showOmsToast(`Market ${cancelTarget.id} cancelled`, "error");
    doAudit("config_save", cancelTarget.id, `Cancelled market: ${cancelTarget.title} — ${cancelTarget.bettors} bettors affected`);
  };

  if (loading) return <OmsTableSkeleton columns={9} rows={8} showStats={5} />;

  const paged = paginate(filtered, page, pageSize);

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Markets", value: markets.length.toString(), color: "text-white" },
          { label: "Live", value: markets.filter(m => m.status === "live").length.toString(), color: "text-emerald-400" },
          { label: "Pending Review", value: markets.filter(m => m.status === "pending_review").length.toString(), color: "text-amber-400" },
          { label: "Flagged", value: markets.filter(m => m.flagged).length.toString(), color: "text-red-400" },
          { label: "Total Volume", value: "₱5.37M", color: "text-[#ff5222]" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap flex-1">
            <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[280px]">
              <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search markets..." />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="live">Live</option><option value="upcoming">Upcoming</option><option value="resolved">Resolved</option><option value="pending_review">Pending Review</option><option value="cancelled">Cancelled</option>
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => setCreateOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
            + Create Market
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["ID", "Market", "Category", "Status", "Creator", "Volume", "Bettors", "End Date", "Actions"].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(m => (
                <tr key={m.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-2.5 text-[#6b7280] text-[11px]">{m.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {m.flagged && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" title="Flagged" />}
                      <span className="text-white text-[12px] max-w-[280px] truncate" style={{ fontWeight: 500 }}>{m.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1f2937] text-[#9ca3af]" style={{ fontWeight: 500 }}>{m.category}</span></td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-2.5"><span className={`text-[11px] ${m.creatorType === "user" ? "text-[#ff5222]" : "text-[#6b7280]"}`}>{m.creator}</span></td>
                  <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>{m.volume}</td>
                  <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]">{m.bettors.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-[#6b7280] text-[11px]">{m.endDate}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {m.status === "pending_review" && (
                        <button onClick={() => setApproveTarget(m)} className="h-6 px-2 bg-emerald-500/15 text-emerald-400 text-[10px] rounded cursor-pointer hover:bg-emerald-500/25" style={{ fontWeight: 600 }}>Approve</button>
                      )}
                      {m.status === "live" && (
                        <button onClick={() => { setResolveTarget(m); setROutcome(""); }} className="h-6 px-2 bg-blue-500/15 text-blue-400 text-[10px] rounded cursor-pointer hover:bg-blue-500/25" style={{ fontWeight: 600 }}>Resolve</button>
                      )}
                      {m.status !== "resolved" && m.status !== "cancelled" && (
                        <button onClick={() => openEdit(m)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>Edit</button>
                      )}
                      {m.status !== "resolved" && m.status !== "cancelled" && (
                        <button onClick={() => setCancelTarget(m)} className="h-6 px-2 bg-red-500/15 text-red-400 text-[10px] rounded cursor-pointer hover:bg-red-500/25" style={{ fontWeight: 600 }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[#1f2937] flex items-center justify-between">
          <OmsPagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} totalItems={filtered.length} />
        </div>
      </div>

      {/* ========== CREATE MARKET MODAL ========== */}
      <OmsModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Market" subtitle={`New market will be assigned ID: ${nextId}`}>
        <OmsField label="Market Title" required><OmsInput value={cTitle} onChange={setCTitle} placeholder="e.g. PBA Finals: Ginebra vs San Miguel" /></OmsField>
        <OmsField label="Category" required><OmsSelect value={cCategory} onChange={setCCategory} options={ALL_CATEGORIES.map(c => ({ value: c, label: c }))} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date" required><OmsInput type="date" value={cStart} onChange={setCStart} /></OmsField>
          <OmsField label="End Date" required><OmsInput type="date" value={cEnd} onChange={setCEnd} /></OmsField>
        </div>
        <OmsField label="Description (Optional)"><OmsTextarea value={cDesc} onChange={setCDesc} placeholder="Market description and rules..." /></OmsField>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleCreate} disabled={!cTitle.trim() || !cStart || !cEnd} fullWidth>Create Market</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== EDIT MARKET MODAL ========== */}
      <OmsModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Market" subtitle={editTarget?.id}>
        <OmsField label="Market Title" required><OmsInput value={eTitle} onChange={setETitle} /></OmsField>
        <OmsField label="Category" required><OmsSelect value={eCategory} onChange={setECategory} options={ALL_CATEGORIES.map(c => ({ value: c, label: c }))} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date" required><OmsInput type="date" value={eStart} onChange={setEStart} /></OmsField>
          <OmsField label="End Date" required><OmsInput type="date" value={eEnd} onChange={setEEnd} /></OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setEditTarget(null)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleEdit} fullWidth>Save Changes</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== RESOLVE MARKET MODAL ========== */}
      <OmsModal open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve Market" subtitle={resolveTarget?.id}>
        <OmsConfirmContent icon="info" iconColor="#3b82f6" iconBg="#3b82f6" message={`Resolve "${resolveTarget?.title}". This will finalize all bets and distribute payouts.`}
          details={[{ label: "Market", value: resolveTarget?.title || "" }, { label: "Volume", value: resolveTarget?.volume || "" }, { label: "Bettors", value: resolveTarget?.bettors.toLocaleString() || "" }]}
        />
        <div className="mt-3">
          <OmsField label="Resolution Outcome" required><OmsInput value={rOutcome} onChange={setROutcome} placeholder="e.g. YES — Ginebra Wins" /></OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setResolveTarget(null)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleResolve} disabled={!rOutcome.trim()} fullWidth>Confirm Resolution</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== APPROVE MARKET MODAL ========== */}
      <OmsModal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve Market">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Approve user-created market "${approveTarget?.title}"? It will go live as "Upcoming".`}
          details={[{ label: "ID", value: approveTarget?.id || "" }, { label: "Creator", value: approveTarget?.creator || "" }, { label: "Category", value: approveTarget?.category || "" }, { label: "Period", value: `${approveTarget?.startDate} — ${approveTarget?.endDate}` }]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setApproveTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={handleApprove} fullWidth>Approve Market</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== CANCEL MARKET MODAL ========== */}
      <OmsModal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Market">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Cancel "${cancelTarget?.title}"? All active bets will be voided and refunded.`}
          details={[{ label: "ID", value: cancelTarget?.id || "" }, { label: "Volume", value: cancelTarget?.volume || "" }, { label: "Active Bettors", value: cancelTarget?.bettors.toLocaleString() || "" }]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setCancelTarget(null)}>Keep Market</OmsBtn>
          <OmsBtn variant="danger" onClick={handleCancel} fullWidth>Cancel Market</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}