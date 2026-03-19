import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface LeaderboardPeriod {
  id: string;
  name: string;
  type: "weekly" | "monthly" | "seasonal" | "special";
  status: "active" | "scheduled" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  rankingBy: "profit" | "volume" | "win_rate" | "streak";
  prizePool: number;
  prizes: { rank: string; prize: number; type: string }[];
  participants: number;
  category: string;
}

interface BannedUser {
  id: string;
  name: string;
  reason: string;
  bannedBy: string;
  bannedDate: string;
}

const MOCK_PERIODS: LeaderboardPeriod[] = [
  {
    id: "LB001", name: "Weekly Top Bettors", type: "weekly", status: "active",
    startDate: "2026-03-09", endDate: "2026-03-15", rankingBy: "profit", prizePool: 100000, category: "All",
    prizes: [
      { rank: "1st", prize: 50000, type: "Cash" },
      { rank: "2nd", prize: 25000, type: "Cash" },
      { rank: "3rd", prize: 15000, type: "Cash" },
      { rank: "4th-10th", prize: 1428, type: "Cash" },
    ],
    participants: 1240,
  },
  {
    id: "LB002", name: "March Monthly Championship", type: "monthly", status: "active",
    startDate: "2026-03-01", endDate: "2026-03-31", rankingBy: "profit", prizePool: 500000, category: "All",
    prizes: [
      { rank: "1st", prize: 200000, type: "Cash" },
      { rank: "2nd", prize: 100000, type: "Cash" },
      { rank: "3rd", prize: 50000, type: "Cash" },
      { rank: "4th-10th", prize: 21428, type: "Cash" },
    ],
    participants: 4820,
  },
  {
    id: "LB003", name: "PBA Season Cup", type: "seasonal", status: "active",
    startDate: "2026-02-01", endDate: "2026-04-30", rankingBy: "volume", prizePool: 1000000, category: "Basketball",
    prizes: [
      { rank: "1st", prize: 400000, type: "Cash + VIP" },
      { rank: "2nd", prize: 200000, type: "Cash" },
      { rank: "3rd", prize: 100000, type: "Cash" },
      { rank: "4th-20th", prize: 17647, type: "Cash" },
    ],
    participants: 8900,
  },
  {
    id: "LB004", name: "Color Game Sprint", type: "special", status: "active",
    startDate: "2026-03-10", endDate: "2026-03-16", rankingBy: "streak", prizePool: 50000, category: "Color Game",
    prizes: [
      { rank: "1st", prize: 25000, type: "Cash" },
      { rank: "2nd", prize: 15000, type: "Cash" },
      { rank: "3rd", prize: 10000, type: "Cash" },
    ],
    participants: 670,
  },
  {
    id: "LB005", name: "February Monthly (Completed)", type: "monthly", status: "completed",
    startDate: "2026-02-01", endDate: "2026-02-28", rankingBy: "profit", prizePool: 500000, category: "All",
    prizes: [
      { rank: "1st", prize: 200000, type: "Cash" },
      { rank: "2nd", prize: 100000, type: "Cash" },
      { rank: "3rd", prize: 50000, type: "Cash" },
    ],
    participants: 4200,
  },
  {
    id: "LB006", name: "Easter Special Event", type: "special", status: "scheduled",
    startDate: "2026-04-05", endDate: "2026-04-12", rankingBy: "win_rate", prizePool: 200000, category: "All",
    prizes: [
      { rank: "1st", prize: 80000, type: "Cash + Merch" },
      { rank: "2nd", prize: 50000, type: "Cash" },
      { rank: "3rd", prize: 30000, type: "Cash" },
    ],
    participants: 0,
  },
];

const MOCK_BANNED: BannedUser[] = [
  { id: "U008", name: "Bong Ramos", reason: "Multiple account manipulation", bannedBy: "Carlos Reyes", bannedDate: "2026-03-10" },
  { id: "U016", name: "Fake Account #1", reason: "Bot-detected activity pattern", bannedBy: "System", bannedDate: "2026-03-08" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", scheduled: "bg-blue-500/15 text-blue-400", completed: "bg-gray-500/15 text-gray-400", cancelled: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = { weekly: "bg-blue-500/15 text-blue-400", monthly: "bg-purple-500/15 text-purple-400", seasonal: "bg-amber-500/15 text-amber-400", special: "bg-pink-500/15 text-pink-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[type] || ""}`} style={{ fontWeight: 600 }}>{type.toUpperCase()}</span>;
}

export default function OmsLeaderboardMgmt() {
  const [tab, setTab] = useState<"periods" | "banned">("periods");
  const [periods, setPeriods] = useState(MOCK_PERIODS);
  const [banned, setBanned] = useState(MOCK_BANNED);
  const [modalType, setModalType] = useState<"detail" | "create" | "edit" | "cancel" | "ban" | "unban" | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod | null>(null);
  const [selectedBanned, setSelectedBanned] = useState<BannedUser | null>(null);

  // Create/edit form
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("weekly");
  const [formRanking, setFormRanking] = useState("profit");
  const [formPrizePool, setFormPrizePool] = useState("");
  const [formCategory, setFormCategory] = useState("All");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  // Ban form
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");

  const openCreate = () => {
    setFormName(""); setFormType("weekly"); setFormRanking("profit"); setFormPrizePool("");
    setFormCategory("All"); setFormStart(""); setFormEnd(""); setModalType("create");
  };

  const openEdit = (p: LeaderboardPeriod) => {
    setSelectedPeriod(p); setFormName(p.name); setFormType(p.type); setFormRanking(p.rankingBy);
    setFormPrizePool(String(p.prizePool)); setFormCategory(p.category); setFormStart(p.startDate);
    setFormEnd(p.endDate); setModalType("edit");
  };

  const activePrizePool = periods.filter(p => p.status === "active").reduce((s, p) => s + p.prizePool, 0);

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const [loading, setLoading] = useState(true);
  useState(() => { setTimeout(() => setLoading(false), 500); });

  const doAudit = (target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "config_save", target, detail });
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Leaderboards", value: String(periods.filter(p => p.status === "active").length), color: "text-emerald-400" },
          { label: "Total Prize Pool (Active)", value: `₱${(activePrizePool / 1000).toFixed(0)}K`, color: "text-[#ff5222]" },
          { label: "Total Participants", value: periods.filter(p => p.status === "active").reduce((s, p) => s + p.participants, 0).toLocaleString(), color: "text-white" },
          { label: "Banned Users", value: String(banned.length), color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Action */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5">
          {(["periods", "banned"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
              {t === "periods" ? "Leaderboard Periods" : `Banned Users (${banned.length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === "periods" && (
            <button onClick={openCreate} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ New Period</button>
          )}
          {tab === "banned" && (
            <button onClick={() => { setBanUserId(""); setBanReason(""); setModalType("ban"); }} className="h-8 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ Ban User</button>
          )}
        </div>
      </div>

      {/* Periods Tab */}
      {tab === "periods" && (
        <div className="space-y-2">
          {periods.map(p => (
            <div key={p.id} className={`bg-[#111827] border rounded-xl p-4 ${p.status === "active" ? "border-emerald-500/20" : "border-[#1f2937]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{p.name}</p>
                    <TypeBadge type={p.type} />
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#6b7280] mb-2">
                    <span>{p.startDate} — {p.endDate}</span>
                    <span>Ranked by: <span className="text-[#9ca3af]">{p.rankingBy.replace("_", " ")}</span></span>
                    <span>Category: <span className="text-[#9ca3af]">{p.category}</span></span>
                  </div>
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>₱{p.prizePool.toLocaleString()} prize pool</span>
                    <span className="text-[#6b7280]">{p.participants.toLocaleString()} participants</span>
                    <span className="text-[#6b7280]">{p.prizes.length} prize tiers</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => { setSelectedPeriod(p); setModalType("detail"); }} className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Detail</button>
                  {(p.status === "active" || p.status === "scheduled") && (
                    <>
                      <button onClick={() => openEdit(p)} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit</button>
                      <button onClick={() => { setSelectedPeriod(p); setModalType("cancel"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banned Tab */}
      {tab === "banned" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          {banned.length === 0 ? (
            <p className="text-[#6b7280] text-[13px] text-center py-8">No banned users</p>
          ) : (
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">User</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-3 py-3">Banned By</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {banned.map(b => (
                  <tr key={b.id} className="border-b border-[#1f2937]/50">
                    <td className="px-4 py-3 text-white" style={{ fontWeight: 500 }}>{b.name} ({b.id})</td>
                    <td className="px-3 py-3 text-[#9ca3af]">{b.reason}</td>
                    <td className="px-3 py-3 text-[#6b7280]">{b.bannedBy}</td>
                    <td className="px-3 py-3 text-[#6b7280]">{b.bannedDate}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => { setSelectedBanned(b); setModalType("unban"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Unban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selectedPeriod} onClose={() => setModalType(null)} title="Leaderboard Detail" subtitle={selectedPeriod?.name} width="max-w-[560px]">
        {selectedPeriod && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Period", value: `${selectedPeriod.startDate} — ${selectedPeriod.endDate}` },
                { label: "Ranking Criteria", value: selectedPeriod.rankingBy.replace("_", " ").toUpperCase() },
                { label: "Category", value: selectedPeriod.category },
                { label: "Participants", value: selectedPeriod.participants.toLocaleString() },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[#9ca3af] text-[11px] mb-2" style={{ fontWeight: 500 }}>Prize Distribution — ₱{selectedPeriod.prizePool.toLocaleString()}</p>
              <div className="space-y-1.5">
                {selectedPeriod.prizes.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-[#6b7280]"}`} style={{ fontWeight: 700 }}>{p.rank}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#ff5222] text-[12px]" style={{ fontWeight: 600 }}>₱{p.prize.toLocaleString()}</span>
                      <span className="text-[#4b5563] text-[10px] ml-1">{p.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Create/Edit Form Modal */}
      <OmsModal open={modalType === "create" || modalType === "edit"} onClose={() => setModalType(null)} title={modalType === "create" ? "Create Leaderboard Period" : "Edit Leaderboard Period"}>
        <div className="space-y-3">
          <OmsField label="Period Name" required>
            <OmsInput value={formName} onChange={setFormName} placeholder="e.g. Weekly Top Bettors" />
          </OmsField>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Type" required>
              <OmsSelect value={formType} onChange={setFormType} options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "seasonal", label: "Seasonal" },
                { value: "special", label: "Special Event" },
              ]} />
            </OmsField>
            <OmsField label="Ranking Criteria" required>
              <OmsSelect value={formRanking} onChange={setFormRanking} options={[
                { value: "profit", label: "Highest Profit" },
                { value: "volume", label: "Highest Volume" },
                { value: "win_rate", label: "Best Win Rate" },
                { value: "streak", label: "Longest Streak" },
              ]} />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Start Date" required>
              <OmsInput value={formStart} onChange={setFormStart} type="date" />
            </OmsField>
            <OmsField label="End Date" required>
              <OmsInput value={formEnd} onChange={setFormEnd} type="date" />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Prize Pool (₱)" required>
              <OmsInput value={formPrizePool} onChange={setFormPrizePool} type="number" placeholder="e.g. 100000" />
            </OmsField>
            <OmsField label="Category">
              <OmsSelect value={formCategory} onChange={setFormCategory} options={[
                { value: "All", label: "All Categories" },
                { value: "Basketball", label: "Basketball" },
                { value: "Color Game", label: "Color Game" },
                { value: "Boxing", label: "Boxing" },
                { value: "Esports", label: "Esports" },
                { value: "Lottery", label: "Lottery" },
              ]} />
            </OmsField>
          </div>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!formName || !formPrizePool) { showOmsToast("Fill all required fields", "error"); return; }
              if (modalType === "create") {
                setPeriods(prev => [...prev, {
                  id: `LB${String(prev.length + 1).padStart(3, "0")}`, name: formName, type: formType as any,
                  status: "scheduled" as const, startDate: formStart, endDate: formEnd,
                  rankingBy: formRanking as any, prizePool: Number(formPrizePool),
                  prizes: [{ rank: "1st", prize: Math.floor(Number(formPrizePool) * 0.5), type: "Cash" }],
                  participants: 0, category: formCategory,
                }]);
                showOmsToast(`Leaderboard "${formName}" created`);
              } else {
                setPeriods(prev => prev.map(p => p.id === selectedPeriod!.id ? { ...p, name: formName, type: formType as any, rankingBy: formRanking as any, prizePool: Number(formPrizePool), category: formCategory, startDate: formStart, endDate: formEnd } : p));
                showOmsToast(`"${formName}" updated`);
              }
              setModalType(null);
            }}>{modalType === "create" ? "Create Period" : "Save Changes"}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Cancel Modal */}
      <OmsModal open={modalType === "cancel" && !!selectedPeriod} onClose={() => setModalType(null)} title="Cancel Leaderboard Period">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Cancel "${selectedPeriod?.name}"? Prize pool will be refunded and rankings reset.`} details={[
          { label: "Prize Pool", value: `₱${selectedPeriod?.prizePool.toLocaleString()}` },
          { label: "Participants", value: String(selectedPeriod?.participants || 0) },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Keep Active</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setPeriods(prev => prev.map(p => p.id === selectedPeriod!.id ? { ...p, status: "cancelled" as const } : p)); setModalType(null); showOmsToast(`"${selectedPeriod!.name}" cancelled`); }}>Cancel Period</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Ban User Modal */}
      <OmsModal open={modalType === "ban"} onClose={() => setModalType(null)} title="Ban User from Leaderboard">
        <div className="space-y-3">
          <OmsField label="User ID" required>
            <OmsInput value={banUserId} onChange={setBanUserId} placeholder="e.g. U008" />
          </OmsField>
          <OmsField label="Reason" required>
            <OmsTextarea value={banReason} onChange={setBanReason} placeholder="Reason for leaderboard ban..." />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="danger" onClick={() => {
              if (!banUserId || !banReason) { showOmsToast("Fill all fields", "error"); return; }
              setBanned(prev => [...prev, { id: banUserId, name: `User ${banUserId}`, reason: banReason, bannedBy: "Carlos Reyes", bannedDate: "2026-03-13" }]);
              setModalType(null);
              showOmsToast(`${banUserId} banned from leaderboard`);
            }}>Ban User</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Unban Modal */}
      <OmsModal open={modalType === "unban" && !!selectedBanned} onClose={() => setModalType(null)} title="Unban User">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Remove ${selectedBanned?.name} from the leaderboard ban list?`} details={[
          { label: "Original Reason", value: selectedBanned?.reason || "" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setBanned(prev => prev.filter(b => b.id !== selectedBanned!.id)); setModalType(null); showOmsToast(`${selectedBanned!.name} unbanned from leaderboard`); }}>Unban</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}