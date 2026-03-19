import { useState, useEffect, useCallback } from "react";
import { OmsModal, OmsBtn, OmsButtonRow, showOmsToast } from "../../components/oms/oms-modal";
import { getAuditLog, AUDIT_ACTION_LABELS, getAuditSeverity, type AuditEntry as LiveAuditEntry } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { downloadCSV } from "../../components/oms/oms-csv-export";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== UNIFIED ENTRY TYPE ==================== */
interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  role: string;
  action: string;
  category: "user" | "market" | "finance" | "system" | "bet" | "reward" | "content" | "security";
  target: string;
  detail: string;
  ip: string;
  changes?: { field: string; from: string; to: string }[];
  source: "static" | "live";
}

/* ==================== STATIC MOCK DATA ==================== */
const MOCK_AUDIT: AuditEntry[] = [
  { id: "AUD001", timestamp: "2026-03-13 09:45:12 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Approved withdrawal", category: "finance", target: "TX-W1234 (JM Reyes)", detail: "GCash withdrawal ₱12,500 approved", ip: "203.177.12.45", changes: [{ field: "status", from: "pending", to: "approved" }], source: "static" },
  { id: "AUD002", timestamp: "2026-03-13 09:38:00 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Suspended user", category: "user", target: "U004 (Ana Dela Cruz)", detail: "Suspended for suspicious betting pattern", ip: "203.177.12.45", changes: [{ field: "status", from: "active", to: "suspended" }], source: "static" },
  { id: "AUD003", timestamp: "2026-03-13 09:22:30 PHT", admin: "Ana Dela Cruz", role: "Moderator", action: "Resolved market", category: "market", target: "MKT-098 (PBA Game 5)", detail: "Resolved: Ginebra wins. 342 bets settled, ₱2.8M payout", ip: "10.0.1.22", changes: [{ field: "status", from: "live", to: "resolved" }, { field: "result", from: "-", to: "Ginebra" }], source: "static" },
  { id: "AUD004", timestamp: "2026-03-13 09:15:00 PHT", admin: "Miguel Torres", role: "Finance", action: "Manual credit", category: "finance", target: "U001 (Maria Santos)", detail: "Credited ₱500 — customer compensation for system downtime", ip: "10.0.1.33", changes: [{ field: "balance", from: "₱44,700", to: "₱45,200" }], source: "static" },
  { id: "AUD005", timestamp: "2026-03-13 08:55:15 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Updated settings", category: "system", target: "Platform Settings", detail: "Changed max withdrawal limit from ₱100K to ₱150K", ip: "203.177.12.45", changes: [{ field: "maxWithdraw", from: "100000", to: "150000" }], source: "static" },
  { id: "AUD006", timestamp: "2026-03-13 08:42:00 PHT", admin: "Jenny Lim", role: "Support", action: "Approved KYC", category: "user", target: "U003 (Ken Villanueva)", detail: "KYC verification approved — valid government ID", ip: "10.0.1.55", changes: [{ field: "kyc", from: "pending", to: "verified" }], source: "static" },
  { id: "AUD007", timestamp: "2026-03-13 08:30:00 PHT", admin: "Ana Dela Cruz", role: "Moderator", action: "Created market", category: "market", target: "MKT-102", detail: "Created: Pacquiao vs Crawford — Winner (Boxing)", ip: "10.0.1.22", source: "static" },
  { id: "AUD008", timestamp: "2026-03-13 08:15:45 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Voided bet", category: "bet", target: "BET-8833 (Rosa Lim)", detail: "Voided ₱5,000 bet — market error, refund issued", ip: "203.177.12.45", changes: [{ field: "status", from: "active", to: "voided" }, { field: "refund", from: "₱0", to: "₱5,000" }], source: "static" },
  { id: "AUD009", timestamp: "2026-03-13 07:50:00 PHT", admin: "System", role: "Automated", action: "AML flag", category: "security", target: "U008 (Bong Ramos)", detail: "Auto-flagged: 8 deposits of ₱49,900 in 24h (structuring)", ip: "System", source: "static" },
  { id: "AUD010", timestamp: "2026-03-13 07:30:00 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Updated reward", category: "reward", target: "RW-003 (Referral Bonus)", detail: "Increased referral bonus from ₱200 to ₱300", ip: "203.177.12.45", changes: [{ field: "amount", from: "₱200", to: "₱300" }], source: "static" },
  { id: "AUD011", timestamp: "2026-03-13 07:20:00 PHT", admin: "Ana Dela Cruz", role: "Moderator", action: "Published banner", category: "content", target: "BNR-005 (PBA Finals Promo)", detail: "Banner published to homepage hero slot", ip: "10.0.1.22", changes: [{ field: "status", from: "draft", to: "published" }], source: "static" },
  { id: "AUD012", timestamp: "2026-03-13 07:00:00 PHT", admin: "System", role: "Automated", action: "System startup", category: "system", target: "OMS Platform", detail: "Daily maintenance window completed. All services healthy.", ip: "System", source: "static" },
  { id: "AUD013", timestamp: "2026-03-12 23:55:00 PHT", admin: "Carlos Reyes", role: "Super Admin", action: "Banned user", category: "user", target: "U008 (Bong Ramos)", detail: "Permanently banned for AML violations and fraud", ip: "203.177.12.45", changes: [{ field: "status", from: "active", to: "banned" }], source: "static" },
  { id: "AUD014", timestamp: "2026-03-12 22:30:00 PHT", admin: "Miguel Torres", role: "Finance", action: "Batch payout", category: "finance", target: "Affiliates", detail: "Processed batch payout for 12 affiliates — total ₱145,000", ip: "10.0.1.33", source: "static" },
  { id: "AUD015", timestamp: "2026-03-12 21:00:00 PHT", admin: "Jenny Lim", role: "Support", action: "Rejected KYC", category: "user", target: "U011 (Fake User)", detail: "KYC rejected — ID document appears fraudulent", ip: "10.0.1.55", changes: [{ field: "kyc", from: "pending", to: "rejected" }], source: "static" },
];

/* ==================== CATEGORY MAPPING FOR LIVE ENTRIES ==================== */
function actionToCategory(action: string): AuditEntry["category"] {
  if (action.includes("txn_")) return "finance";
  if (action.includes("wallet_")) return "finance";
  if (action.includes("bet_")) return "bet";
  if (action.includes("creator_")) return "user";
  if (action.includes("user_") || action === "password_change") return "user";
  if (action.includes("admin_")) return "system";
  if (action.includes("config_") || action === "export_data") return "system";
  if (action === "login" || action === "logout") return "security";
  return "system";
}

/* ==================== CONVERT LIVE ENTRIES ==================== */
function convertLiveEntry(entry: LiveAuditEntry): AuditEntry {
  return {
    id: entry.id,
    timestamp: new Date(entry.timestamp).toLocaleString("en-PH", { 
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      timeZone: "Asia/Manila"
    }) + " PHT",
    admin: entry.adminEmail,
    role: entry.adminRole,
    action: AUDIT_ACTION_LABELS[entry.action] || entry.action,
    category: actionToCategory(entry.action),
    target: entry.target || "—",
    detail: entry.detail || AUDIT_ACTION_LABELS[entry.action] || entry.action,
    ip: entry.ip || "127.0.0.1",
    source: "live",
  };
}

/* ==================== BADGE COMPONENTS ==================== */
function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    user: "bg-blue-500/15 text-blue-400",
    market: "bg-purple-500/15 text-purple-400",
    finance: "bg-emerald-500/15 text-emerald-400",
    system: "bg-gray-500/15 text-gray-400",
    bet: "bg-amber-500/15 text-amber-400",
    reward: "bg-pink-500/15 text-pink-400",
    content: "bg-cyan-500/15 text-cyan-400",
    security: "bg-red-500/15 text-red-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[category] || ""}`} style={{ fontWeight: 600 }}>{category.toUpperCase()}</span>;
}

function SourceBadge({ source }: { source: "static" | "live" }) {
  return (
    <span className={`text-[8px] px-1.5 py-0.5 rounded ${source === "live" ? "bg-[#ff5222]/10 text-[#ff5222]" : "bg-[#1f2937] text-[#6b7280]"}`} style={{ fontWeight: 600 }}>
      {source === "live" ? "LIVE" : "MOCK"}
    </span>
  );
}

/* ==================== MAIN COMPONENT ==================== */
export default function OmsAudit() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "live" | "static">("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [liveEntries, setLiveEntries] = useState<AuditEntry[]>([]);
  const { t } = useI18n();

  // Load live audit log entries from localStorage
  const refreshLive = useCallback(() => {
    const raw = getAuditLog();
    setLiveEntries(raw.map(convertLiveEntry));
  }, []);

  useEffect(() => {
    refreshLive();
    // Poll for changes every 3 seconds
    const interval = setInterval(refreshLive, 3000);
    return () => clearInterval(interval);
  }, [refreshLive]);

  // Merge static + live, deduplicate by ID, sort by timestamp desc
  const allEntries = [...liveEntries, ...MOCK_AUDIT];
  const deduped = allEntries.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);

  const categories = ["all", "user", "market", "finance", "system", "bet", "reward", "content", "security"];
  const admins = ["all", ...Array.from(new Set(deduped.map(a => a.admin)))];

  const filtered = deduped.filter(a => {
    if (search && !a.action.toLowerCase().includes(search.toLowerCase()) && !a.detail.toLowerCase().includes(search.toLowerCase()) && !a.target.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (adminFilter !== "all" && a.admin !== adminFilter) return false;
    if (sourceFilter !== "all" && a.source !== sourceFilter) return false;
    return true;
  });

  const todayCount = deduped.filter(a => a.timestamp.includes("2026-03-13") || a.timestamp.includes("03/13/2026") || a.timestamp.includes("3/13/2026")).length;
  const securityCount = deduped.filter(a => a.category === "security").length;
  const liveCount = liveEntries.length;

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("audit.total_entries"), value: String(deduped.length), color: "text-white" },
          { label: t("audit.todays_actions"), value: String(todayCount), color: "text-[#ff5222]" },
          { label: t("audit.security_events"), value: String(securityCount), color: "text-red-400" },
          { label: t("audit.active_admins"), value: String(new Set(deduped.map(a => a.admin)).size), color: "text-emerald-400" },
          { label: t("audit.live_entries"), value: String(liveCount), color: liveCount > 0 ? "text-[#ff5222]" : "text-[#6b7280]" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Live entries banner */}
      {liveCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-[#ff5222]/5 border border-[#ff5222]/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-[#ff5222] animate-pulse" />
          <p className="text-[#ff5222] text-[11px]" style={{ fontWeight: 500 }}>
            {liveCount} live audit {liveCount === 1 ? "entry" : "entries"} from logAudit() actions (finance approvals, wallet ops, creator actions, etc.)
          </p>
          <button onClick={refreshLive} className="ml-auto text-[10px] text-[#ff5222] hover:text-white bg-[#ff5222]/10 hover:bg-[#ff5222] px-2.5 py-1 rounded cursor-pointer transition-colors" style={{ fontWeight: 600 }}>
            Refresh
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[280px]">
          <svg className="size-3.5 text-[#6b7280]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder={t("audit.search_placeholder")} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 px-2.5 bg-[#111827] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
          {categories.map(c => <option key={c} value={c}>{c === "all" ? t("audit.all_categories") : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)} className="h-8 px-2.5 bg-[#111827] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
          {admins.map(a => <option key={a} value={a}>{a === "all" ? t("audit.all_admins") : a}</option>)}
        </select>
        <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 h-8">
          {(["all", "live", "static"] as const).map(s => (
            <button key={s} onClick={() => setSourceFilter(s)} className={`text-[10px] px-2.5 rounded-md cursor-pointer transition-colors ${sourceFilter === s ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
              {s === "all" ? "All" : s === "live" ? `Live (${liveCount})` : `Mock (${MOCK_AUDIT.length})`}
            </button>
          ))}
        </div>
        <button onClick={() => { showOmsToast("Audit log exported to CSV"); }} className="h-8 px-3 bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] text-[11px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>
          {t("common.export_csv")}
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="space-y-0">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#6b7280] text-[12px]">{t("common.no_data")}</p>
            </div>
          ) : filtered.map((entry, i) => (
            <div key={entry.id} className={`flex gap-3 px-4 py-3 border-b border-[#1f2937]/50 hover:bg-[#1f2937]/10 transition-colors cursor-pointer ${entry.source === "live" ? "bg-[#ff5222]/[0.02]" : ""}`} onClick={() => setSelectedEntry(entry)}>
              {/* Timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${entry.source === "live" ? "bg-[#ff5222] ring-2 ring-[#ff5222]/20" : entry.category === "security" ? "bg-red-400" : entry.category === "finance" ? "bg-emerald-400" : entry.category === "market" ? "bg-purple-400" : entry.category === "user" ? "bg-blue-400" : "bg-[#4b5563]"}`} />
                {i < filtered.length - 1 && <div className="w-px flex-1 bg-[#1f2937] mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <CategoryBadge category={entry.category} />
                  <SourceBadge source={entry.source} />
                  <span className="text-[#6b7280] text-[10px]">{entry.timestamp}</span>
                </div>
                <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{entry.action}</p>
                <p className="text-[#6b7280] text-[11px] mt-0.5">{entry.detail}</p>
                <p className="text-[#4b5563] text-[10px] mt-0.5">by {entry.admin} ({entry.role}) · IP: {entry.ip}</p>
              </div>
              <div className="flex items-center flex-shrink-0">
                <svg className="size-4 text-[#4b5563]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l4 4-4 4" /></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <OmsModal open={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={t("audit.entry_detail")} subtitle={selectedEntry?.id} width="max-w-[560px]">
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("audit.timestamp"), value: selectedEntry.timestamp },
                { label: t("audit.admin"), value: `${selectedEntry.admin} (${selectedEntry.role})` },
                { label: t("audit.action"), value: selectedEntry.action },
                { label: t("audit.target"), value: selectedEntry.target },
                { label: t("audit.ip"), value: selectedEntry.ip },
                { label: t("audit.source"), value: selectedEntry.source === "live" ? "Live (logAudit)" : "Static (Mock)" },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>{t("audit.detail")}</p>
              <p className="text-white text-[12px]">{selectedEntry.detail}</p>
            </div>
            {selectedEntry.changes && selectedEntry.changes.length > 0 && (
              <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[#6b7280] text-[10px] mb-2" style={{ fontWeight: 500 }}>{t("audit.changes")}</p>
                <div className="space-y-2">
                  {selectedEntry.changes.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="text-[#9ca3af]" style={{ fontWeight: 500 }}>{c.field}:</span>
                      <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded line-through">{c.from}</span>
                      <svg className="size-3 text-[#4b5563]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M2 6h8M7 3l3 3-3 3" /></svg>
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{c.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setSelectedEntry(null)}>{t("common.close")}</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>
    </div>
  );
}
