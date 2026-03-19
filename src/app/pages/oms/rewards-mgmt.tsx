import { useState, useEffect } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface RewardProgram {
  id: string; name: string; type: "welcome_bonus" | "referral" | "weekly_task" | "tier_reward" | "promo";
  status: "active" | "paused" | "expired" | "draft"; budget: number; spent: number;
  claims: number; maxClaims: number; perUserAmount: string; startDate: string; endDate: string;
}

const INITIAL_PROGRAMS: RewardProgram[] = [
  { id: "RWD001", name: "Welcome Bonus ₱600", type: "welcome_bonus", status: "active", budget: 3000000, spent: 1860000, claims: 3100, maxClaims: 5000, perUserAmount: "₱600", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: "RWD002", name: "Referral Program ₱100 Each", type: "referral", status: "active", budget: 1500000, spent: 890000, claims: 8900, maxClaims: 15000, perUserAmount: "₱100 each", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: "RWD003", name: "PBA Weekly Challenge", type: "weekly_task", status: "active", budget: 500000, spent: 320000, claims: 3200, maxClaims: 5000, perUserAmount: "₱100", startDate: "2026-03-10", endDate: "2026-03-16" },
  { id: "RWD004", name: "Tier 1 — Pinakapopular Bonus", type: "tier_reward", status: "active", budget: 2000000, spent: 1200000, claims: 2400, maxClaims: 4000, perUserAmount: "Up to ₱5,000", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: "RWD005", name: "March Madness Promo", type: "promo", status: "active", budget: 800000, spent: 240000, claims: 800, maxClaims: 2000, perUserAmount: "₱300", startDate: "2026-03-01", endDate: "2026-03-31" },
  { id: "RWD006", name: "Valentine's Double Bonus", type: "promo", status: "expired", budget: 500000, spent: 480000, claims: 1600, maxClaims: 1600, perUserAmount: "₱300", startDate: "2026-02-10", endDate: "2026-02-16" },
  { id: "RWD007", name: "Summer Promo (Draft)", type: "promo", status: "draft", budget: 1000000, spent: 0, claims: 0, maxClaims: 3000, perUserAmount: "₱500", startDate: "2026-04-01", endDate: "2026-05-31" },
];

interface TierItem { tier: string; minBets: number; maxBets: number; cashback: string; bonus: string; users: number; }

const INITIAL_TIERS: TierItem[] = [
  { tier: "Tier 1 — Pinakapopular", minBets: 0, maxBets: 50, cashback: "1%", bonus: "₱100/week", users: 156000 },
  { tier: "Tier 2 — Patok na Patok", minBets: 51, maxBets: 200, cashback: "2%", bonus: "₱250/week", users: 98000 },
  { tier: "Tier 3 — Growth Markets", minBets: 201, maxBets: 9999, cashback: "3%", bonus: "₱500/week", users: 58100 },
];

const TYPE_OPTIONS = [
  { value: "welcome_bonus", label: "Welcome Bonus" }, { value: "referral", label: "Referral" },
  { value: "weekly_task", label: "Weekly Task" }, { value: "tier_reward", label: "Tier Reward" },
  { value: "promo", label: "Promo" },
];

function ProgramStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", paused: "bg-amber-500/15 text-amber-400", expired: "bg-gray-500/15 text-gray-400", draft: "bg-blue-500/15 text-blue-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function ProgramTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = { welcome_bonus: "Welcome", referral: "Referral", weekly_task: "Weekly", tier_reward: "Tier", promo: "Promo" };
  const colors: Record<string, string> = { welcome_bonus: "bg-emerald-500/15 text-emerald-400", referral: "bg-purple-500/15 text-purple-400", weekly_task: "bg-blue-500/15 text-blue-400", tier_reward: "bg-[#ff5222]/15 text-[#ff5222]", promo: "bg-amber-500/15 text-amber-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors[type] || ""}`} style={{ fontWeight: 600 }}>{labels[type] || type}</span>;
}

export default function OmsRewardsMgmt() {
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [tiers, setTiers] = useState(INITIAL_TIERS);
  const [tab, setTab] = useState<"programs" | "tiers">("programs");

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RewardProgram | null>(null);
  const [pauseTarget, setPauseTarget] = useState<RewardProgram | null>(null);
  const [editTiersOpen, setEditTiersOpen] = useState(false);

  // Create form
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState("promo");
  const [cBudget, setCBudget] = useState("");
  const [cMaxClaims, setCMaxClaims] = useState("");
  const [cPerUser, setCPerUser] = useState("");
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");

  // Edit form
  const [eName, setEName] = useState("");
  const [eType, setEType] = useState("");
  const [eBudget, setEBudget] = useState("");
  const [eMaxClaims, setEMaxClaims] = useState("");
  const [ePerUser, setEPerUser] = useState("");
  const [eStart, setEStart] = useState("");
  const [eEnd, setEEnd] = useState("");

  // Tier edit form
  const [tierEdits, setTierEdits] = useState<TierItem[]>([]);

  const totalBudget = programs.reduce((s, p) => s + p.budget, 0);
  const totalSpent = programs.reduce((s, p) => s + p.spent, 0);
  const nextId = `RWD${String(programs.length + 1).padStart(3, "0")}`;

  const handleCreate = () => {
    if (!cName.trim() || !cBudget || !cStart || !cEnd) return;
    setPrograms([...programs, { id: nextId, name: cName, type: cType as any, status: "draft", budget: parseInt(cBudget) || 0, spent: 0, claims: 0, maxClaims: parseInt(cMaxClaims) || 1000, perUserAmount: cPerUser || "₱0", startDate: cStart, endDate: cEnd }]);
    setCreateOpen(false);
    setCName(""); setCType("promo"); setCBudget(""); setCMaxClaims(""); setCPerUser(""); setCStart(""); setCEnd("");
    showOmsToast(`Program ${nextId} created as draft`);
  };

  const openEdit = (p: RewardProgram) => {
    setEName(p.name); setEType(p.type); setEBudget(p.budget.toString()); setEMaxClaims(p.maxClaims.toString()); setEPerUser(p.perUserAmount); setEStart(p.startDate); setEEnd(p.endDate);
    setEditTarget(p);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setPrograms(programs.map(p => p.id === editTarget.id ? { ...p, name: eName, type: eType as any, budget: parseInt(eBudget) || p.budget, maxClaims: parseInt(eMaxClaims) || p.maxClaims, perUserAmount: ePerUser, startDate: eStart, endDate: eEnd } : p));
    setEditTarget(null);
    showOmsToast(`Program ${editTarget.id} updated`);
  };

  const handlePause = () => {
    if (!pauseTarget) return;
    const newStatus = pauseTarget.status === "active" ? "paused" : "active";
    setPrograms(programs.map(p => p.id === pauseTarget.id ? { ...p, status: newStatus as any } : p));
    setPauseTarget(null);
    showOmsToast(`Program ${pauseTarget.id} ${newStatus === "paused" ? "paused" : "resumed"}`, newStatus === "paused" ? "info" : "success");
  };

  const openEditTiers = () => {
    setTierEdits(tiers.map(t => ({ ...t })));
    setEditTiersOpen(true);
  };

  const updateTierEdit = (idx: number, field: keyof TierItem, value: string) => {
    setTierEdits(tierEdits.map((t, i) => i === idx ? { ...t, [field]: field === "minBets" || field === "maxBets" || field === "users" ? parseInt(value) || 0 : value } : t));
  };

  const handleSaveTiers = () => {
    setTiers(tierEdits);
    setEditTiersOpen(false);
    showOmsToast("Tier configuration saved");
  };

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  const doAudit = (target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "config_save", target, detail });
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Budget (Active)", value: `₱${(totalBudget / 1000000).toFixed(1)}M`, color: "text-white" },
          { label: "Total Spent", value: `₱${(totalSpent / 1000000).toFixed(1)}M`, color: "text-[#ff5222]" },
          { label: "Budget Utilization", value: `${((totalSpent / totalBudget) * 100).toFixed(1)}%`, color: "text-amber-400" },
          { label: "Active Programs", value: programs.filter(p => p.status === "active").length.toString(), color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit">
        {(["programs", "tiers"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "programs" ? "Reward Programs" : "Tier Configuration"}
          </button>
        ))}
      </div>

      {tab === "programs" ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Reward Programs</h3>
            <button onClick={() => setCreateOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors" style={{ fontWeight: 600 }}>+ New Program</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["ID", "Program", "Type", "Status", "Budget", "Spent", "Claims", "Per User", "Period", "Actions"].map(h => (
                    <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map(p => {
                  const utilPct = (p.spent / p.budget) * 100;
                  return (
                    <tr key={p.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                      <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{p.id}</td>
                      <td className="px-3 py-2.5 text-white text-[12px] max-w-[200px]" style={{ fontWeight: 500 }}>{p.name}</td>
                      <td className="px-3 py-2.5"><ProgramTypeBadge type={p.type} /></td>
                      <td className="px-3 py-2.5"><ProgramStatusBadge status={p.status} /></td>
                      <td className="px-3 py-2.5">
                        <div>
                          <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>₱{(p.budget / 1000).toFixed(0)}K</span>
                          <div className="w-16 h-1 bg-[#1f2937] rounded-full mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${utilPct}%`, background: utilPct > 80 ? "#ef4444" : "#ff5222" }} /></div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[#ff5222] text-[11px]" style={{ fontWeight: 600 }}>₱{(p.spent / 1000).toFixed(0)}K</td>
                      <td className="px-3 py-2.5 text-[#9ca3af] text-[11px]">{p.claims.toLocaleString()} / {p.maxClaims.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-[#9ca3af] text-[11px]">{p.perUserAmount}</td>
                      <td className="px-3 py-2.5 text-[#6b7280] text-[10px]">{p.startDate} — {p.endDate}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>Edit</button>
                          {(p.status === "active" || p.status === "paused") && (
                            <button onClick={() => setPauseTarget(p)} className={`h-6 px-2 text-[10px] rounded cursor-pointer ${p.status === "active" ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"}`} style={{ fontWeight: 600 }}>
                              {p.status === "active" ? "Pause" : "Resume"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Tier Configuration</h3>
            <button onClick={openEditTiers} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors" style={{ fontWeight: 600 }}>Edit Tiers</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((t, i) => (
              <div key={i} className="bg-[#0a0e1a] border border-[#1f2937] rounded-xl p-4">
                <h4 className="text-[#ff5222] text-[13px] mb-3" style={{ fontWeight: 700 }}>{t.tier}</h4>
                <div className="space-y-2">
                  {[{ label: "Bet Range", value: `${t.minBets} – ${t.maxBets === 9999 ? "∞" : t.maxBets} bets` }, { label: "Cashback", value: t.cashback }, { label: "Weekly Bonus", value: t.bonus }, { label: "Users in Tier", value: t.users.toLocaleString() }].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-[#6b7280] text-[11px]">{item.label}</span>
                      <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== CREATE PROGRAM MODAL ========== */}
      <OmsModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Reward Program" subtitle={`Will be created as draft — ID: ${nextId}`}>
        <OmsField label="Program Name" required><OmsInput value={cName} onChange={setCName} placeholder="e.g. Summer Mega Promo" /></OmsField>
        <OmsField label="Type" required><OmsSelect value={cType} onChange={setCType} options={TYPE_OPTIONS} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Budget (PHP)" required><OmsInput type="number" value={cBudget} onChange={setCBudget} placeholder="1000000" /></OmsField>
          <OmsField label="Max Claims"><OmsInput type="number" value={cMaxClaims} onChange={setCMaxClaims} placeholder="5000" /></OmsField>
        </div>
        <OmsField label="Per User Amount"><OmsInput value={cPerUser} onChange={setCPerUser} placeholder="e.g. ₱500" /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date" required><OmsInput type="date" value={cStart} onChange={setCStart} /></OmsField>
          <OmsField label="End Date" required><OmsInput type="date" value={cEnd} onChange={setCEnd} /></OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleCreate} disabled={!cName.trim() || !cBudget || !cStart || !cEnd} fullWidth>Create Program</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== EDIT PROGRAM MODAL ========== */}
      <OmsModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Program" subtitle={editTarget?.id}>
        <OmsField label="Program Name" required><OmsInput value={eName} onChange={setEName} /></OmsField>
        <OmsField label="Type" required><OmsSelect value={eType} onChange={setEType} options={TYPE_OPTIONS} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Budget (PHP)" required><OmsInput type="number" value={eBudget} onChange={setEBudget} /></OmsField>
          <OmsField label="Max Claims"><OmsInput type="number" value={eMaxClaims} onChange={setEMaxClaims} /></OmsField>
        </div>
        <OmsField label="Per User Amount"><OmsInput value={ePerUser} onChange={setEPerUser} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date"><OmsInput type="date" value={eStart} onChange={setEStart} /></OmsField>
          <OmsField label="End Date"><OmsInput type="date" value={eEnd} onChange={setEEnd} /></OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setEditTarget(null)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleEdit} fullWidth>Save Changes</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== PAUSE/RESUME CONFIRM ========== */}
      <OmsModal open={!!pauseTarget} onClose={() => setPauseTarget(null)} title={pauseTarget?.status === "active" ? "Pause Program" : "Resume Program"}>
        <OmsConfirmContent
          icon={pauseTarget?.status === "active" ? "warning" : "success"}
          iconColor={pauseTarget?.status === "active" ? "#f59e0b" : "#10b981"}
          iconBg={pauseTarget?.status === "active" ? "#f59e0b" : "#10b981"}
          message={pauseTarget?.status === "active" ? `Pause "${pauseTarget?.name}"? Users will not be able to claim rewards while paused.` : `Resume "${pauseTarget?.name}"? Users will be able to claim rewards again.`}
          details={[{ label: "Program", value: pauseTarget?.name || "" }, { label: "Budget Remaining", value: `₱${(((pauseTarget?.budget || 0) - (pauseTarget?.spent || 0)) / 1000).toFixed(0)}K` }, { label: "Claims", value: `${pauseTarget?.claims.toLocaleString()} / ${pauseTarget?.maxClaims.toLocaleString()}` }]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setPauseTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant={pauseTarget?.status === "active" ? "primary" : "success"} onClick={handlePause} fullWidth>
            {pauseTarget?.status === "active" ? "Pause Program" : "Resume Program"}
          </OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== EDIT TIERS MODAL ========== */}
      <OmsModal open={editTiersOpen} onClose={() => setEditTiersOpen(false)} title="Edit Tier Configuration" subtitle="Modify cashback and bonus rates for each tier" width="max-w-[620px]">
        <div className="space-y-4">
          {tierEdits.map((t, i) => (
            <div key={i} className="bg-[#0a0e1a] border border-[#1f2937] rounded-xl p-3">
              <p className="text-[#ff5222] text-[12px] mb-2" style={{ fontWeight: 700 }}>{t.tier}</p>
              <div className="grid grid-cols-2 gap-2">
                <OmsField label="Min Bets"><OmsInput type="number" value={t.minBets.toString()} onChange={v => updateTierEdit(i, "minBets", v)} /></OmsField>
                <OmsField label="Max Bets"><OmsInput type="number" value={t.maxBets.toString()} onChange={v => updateTierEdit(i, "maxBets", v)} /></OmsField>
                <OmsField label="Cashback Rate"><OmsInput value={t.cashback} onChange={v => updateTierEdit(i, "cashback", v)} placeholder="e.g. 2%" /></OmsField>
                <OmsField label="Weekly Bonus"><OmsInput value={t.bonus} onChange={v => updateTierEdit(i, "bonus", v)} placeholder="e.g. ₱250/week" /></OmsField>
              </div>
            </div>
          ))}
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setEditTiersOpen(false)}>Cancel</OmsBtn>
          <OmsBtn onClick={handleSaveTiers} fullWidth>Save Tier Configuration</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}