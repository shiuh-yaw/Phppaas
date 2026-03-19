import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface PromoCode {
  id: string;
  code: string;
  name: string;
  type: "free_bet" | "deposit_match" | "cashback" | "bonus_credit" | "free_entry";
  value: number;
  valueType: "fixed" | "percentage";
  minDeposit: number;
  maxUses: number;
  usedCount: number;
  status: "active" | "expired" | "paused" | "depleted";
  startDate: string;
  endDate: string;
  category: string;
  createdBy: string;
  totalRedeemed: number;
}

const MOCK_PROMOS: PromoCode[] = [
  { id: "PM001", code: "PBAFINALS100", name: "PBA Finals Free Bet", type: "free_bet", value: 100, valueType: "fixed", minDeposit: 500, maxUses: 5000, usedCount: 3200, status: "active", startDate: "2026-03-10", endDate: "2026-03-20", category: "Basketball", createdBy: "Carlos Reyes", totalRedeemed: 320000 },
  { id: "PM002", code: "WELCOME50", name: "Welcome 50% Match", type: "deposit_match", value: 50, valueType: "percentage", minDeposit: 1000, maxUses: 10000, usedCount: 7800, status: "active", startDate: "2026-01-01", endDate: "2026-12-31", category: "All", createdBy: "Carlos Reyes", totalRedeemed: 4200000 },
  { id: "PM003", code: "COLORGAME200", name: "Color Game ₱200 Free", type: "free_bet", value: 200, valueType: "fixed", minDeposit: 0, maxUses: 2000, usedCount: 2000, status: "depleted", startDate: "2026-03-01", endDate: "2026-03-15", category: "Color Game", createdBy: "Ana Dela Cruz", totalRedeemed: 400000 },
  { id: "PM004", code: "CASHBACK10", name: "10% Weekly Cashback", type: "cashback", value: 10, valueType: "percentage", minDeposit: 0, maxUses: 0, usedCount: 12400, status: "active", startDate: "2026-03-01", endDate: "2026-03-31", category: "All", createdBy: "Carlos Reyes", totalRedeemed: 1800000 },
  { id: "PM005", code: "BOXING500", name: "Boxing Night Bonus", type: "bonus_credit", value: 500, valueType: "fixed", minDeposit: 2000, maxUses: 1000, usedCount: 450, status: "active", startDate: "2026-03-12", endDate: "2026-03-14", category: "Boxing", createdBy: "Ana Dela Cruz", totalRedeemed: 225000 },
  { id: "PM006", code: "ESPORTS2024", name: "Esports Promo (Expired)", type: "free_bet", value: 100, valueType: "fixed", minDeposit: 500, maxUses: 3000, usedCount: 1200, status: "expired", startDate: "2025-12-01", endDate: "2025-12-31", category: "Esports", createdBy: "Carlos Reyes", totalRedeemed: 120000 },
  { id: "PM007", code: "PAYDAY300", name: "Payday Bonus", type: "deposit_match", value: 30, valueType: "percentage", minDeposit: 5000, maxUses: 3000, usedCount: 0, status: "paused", startDate: "2026-03-15", endDate: "2026-03-16", category: "All", createdBy: "Carlos Reyes", totalRedeemed: 0 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", expired: "bg-gray-500/15 text-gray-400", paused: "bg-amber-500/15 text-amber-400", depleted: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = { free_bet: "bg-emerald-500/15 text-emerald-400", deposit_match: "bg-blue-500/15 text-blue-400", cashback: "bg-purple-500/15 text-purple-400", bonus_credit: "bg-amber-500/15 text-amber-400", free_entry: "bg-pink-500/15 text-pink-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[type] || ""}`} style={{ fontWeight: 600 }}>{type.replace("_", " ").toUpperCase()}</span>;
}

export default function OmsPromos() {
  const [promos, setPromos] = useState(MOCK_PROMOS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalType, setModalType] = useState<"create" | "edit" | "detail" | "pause" | "resume" | "delete" | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("free_bet");
  const [formValue, setFormValue] = useState("");
  const [formValueType, setFormValueType] = useState("fixed");
  const [formMinDeposit, setFormMinDeposit] = useState("0");
  const [formMaxUses, setFormMaxUses] = useState("1000");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formCategory, setFormCategory] = useState("All");

  const openCreate = () => {
    setFormCode(""); setFormName(""); setFormType("free_bet"); setFormValue("");
    setFormValueType("fixed"); setFormMinDeposit("0"); setFormMaxUses("1000");
    setFormStart(""); setFormEnd(""); setFormCategory("All"); setModalType("create");
  };

  const openEdit = (p: PromoCode) => {
    setSelectedPromo(p); setFormCode(p.code); setFormName(p.name); setFormType(p.type);
    setFormValue(String(p.value)); setFormValueType(p.valueType); setFormMinDeposit(String(p.minDeposit));
    setFormMaxUses(String(p.maxUses)); setFormStart(p.startDate); setFormEnd(p.endDate);
    setFormCategory(p.category); setModalType("edit");
  };

  const filtered = promos.filter(p => {
    if (search && !p.code.toLowerCase().includes(search.toLowerCase()) && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const totalRedeemed = promos.reduce((s, p) => s + p.totalRedeemed, 0);
  const activePromos = promos.filter(p => p.status === "active").length;

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
          { label: "Active Promos", value: String(activePromos), color: "text-emerald-400" },
          { label: "Total Codes", value: String(promos.length), color: "text-white" },
          { label: "Total Redemptions", value: promos.reduce((s, p) => s + p.usedCount, 0).toLocaleString(), color: "text-[#ff5222]" },
          { label: "Total Value Redeemed", value: `₱${(totalRedeemed / 1000000).toFixed(1)}M`, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Create */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 h-8 sm:max-w-[240px]">
            <svg className="size-3.5 text-[#6b7280]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search code, name..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 px-2.5 bg-[#111827] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>
        </div>
        <button onClick={openCreate} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ New Promo Code</button>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                <th className="px-4 py-3">Code</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Usage</th>
                <th className="px-3 py-3">Period</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Redeemed</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[#ff5222] text-[12px] font-mono" style={{ fontWeight: 700 }}>{p.code}</p>
                    <p className="text-[#6b7280] text-[10px]">{p.name}</p>
                  </td>
                  <td className="px-3 py-3"><TypeBadge type={p.type} /></td>
                  <td className="px-3 py-3 text-white" style={{ fontWeight: 600 }}>
                    {p.valueType === "fixed" ? `₱${p.value}` : `${p.value}%`}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-[11px]">{p.usedCount.toLocaleString()}</span>
                      {p.maxUses > 0 && (
                        <>
                          <span className="text-[#4b5563] text-[10px]">/ {p.maxUses.toLocaleString()}</span>
                          <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="h-full bg-[#ff5222] rounded-full" style={{ width: `${Math.min((p.usedCount / p.maxUses) * 100, 100)}%` }} />
                          </div>
                        </>
                      )}
                      {p.maxUses === 0 && <span className="text-[#4b5563] text-[10px]">unlimited</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[#6b7280] text-[10px]">{p.startDate}<br />{p.endDate}</td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3 text-emerald-400" style={{ fontWeight: 600 }}>₱{(p.totalRedeemed / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => { setSelectedPromo(p); setModalType("detail"); }} className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Detail</button>
                      {p.status !== "expired" && p.status !== "depleted" && (
                        <button onClick={() => openEdit(p)} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit</button>
                      )}
                      {p.status === "active" && (
                        <button onClick={() => { setSelectedPromo(p); setModalType("pause"); }} className="text-[10px] text-amber-400 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Pause</button>
                      )}
                      {p.status === "paused" && (
                        <button onClick={() => { setSelectedPromo(p); setModalType("resume"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Resume</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selectedPromo} onClose={() => setModalType(null)} title="Promo Code Detail" subtitle={selectedPromo?.code} width="max-w-[520px]">
        {selectedPromo && (
          <div className="space-y-4">
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-4 text-center">
              <p className="text-[#ff5222] text-[24px] font-mono tracking-wider" style={{ fontWeight: 800 }}>{selectedPromo.code}</p>
              <p className="text-[#6b7280] text-[12px] mt-1">{selectedPromo.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Type", value: selectedPromo.type.replace("_", " ").toUpperCase() },
                { label: "Value", value: selectedPromo.valueType === "fixed" ? `₱${selectedPromo.value}` : `${selectedPromo.value}%` },
                { label: "Min Deposit", value: selectedPromo.minDeposit > 0 ? `₱${selectedPromo.minDeposit.toLocaleString()}` : "None" },
                { label: "Category", value: selectedPromo.category },
                { label: "Usage", value: `${selectedPromo.usedCount.toLocaleString()} / ${selectedPromo.maxUses > 0 ? selectedPromo.maxUses.toLocaleString() : "∞"}` },
                { label: "Total Redeemed", value: `₱${selectedPromo.totalRedeemed.toLocaleString()}` },
                { label: "Period", value: `${selectedPromo.startDate} — ${selectedPromo.endDate}` },
                { label: "Created By", value: selectedPromo.createdBy },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Create/Edit Modal */}
      <OmsModal open={modalType === "create" || modalType === "edit"} onClose={() => setModalType(null)} title={modalType === "create" ? "Create Promo Code" : "Edit Promo Code"}>
        <div className="space-y-3">
          <OmsField label="Promo Code" required>
            <OmsInput value={formCode} onChange={v => setFormCode(v.toUpperCase())} placeholder="e.g. PBAFINALS100" />
          </OmsField>
          <OmsField label="Description" required>
            <OmsInput value={formName} onChange={setFormName} placeholder="e.g. PBA Finals Free Bet" />
          </OmsField>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Promo Type" required>
              <OmsSelect value={formType} onChange={setFormType} options={[
                { value: "free_bet", label: "Free Bet" },
                { value: "deposit_match", label: "Deposit Match" },
                { value: "cashback", label: "Cashback" },
                { value: "bonus_credit", label: "Bonus Credit" },
                { value: "free_entry", label: "Free Entry" },
              ]} />
            </OmsField>
            <OmsField label="Value Type" required>
              <OmsSelect value={formValueType} onChange={setFormValueType} options={[
                { value: "fixed", label: "Fixed (₱)" },
                { value: "percentage", label: "Percentage (%)" },
              ]} />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label={formValueType === "fixed" ? "Value (₱)" : "Value (%)"} required>
              <OmsInput value={formValue} onChange={setFormValue} type="number" />
            </OmsField>
            <OmsField label="Min Deposit (₱)">
              <OmsInput value={formMinDeposit} onChange={setFormMinDeposit} type="number" />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Max Uses (0=unlimited)">
              <OmsInput value={formMaxUses} onChange={setFormMaxUses} type="number" />
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
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Start Date">
              <OmsInput value={formStart} onChange={setFormStart} type="date" />
            </OmsField>
            <OmsField label="End Date">
              <OmsInput value={formEnd} onChange={setFormEnd} type="date" />
            </OmsField>
          </div>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!formCode || !formName || !formValue) { showOmsToast("Fill all required fields", "error"); return; }
              if (modalType === "create") {
                setPromos(prev => [...prev, {
                  id: `PM${String(prev.length + 1).padStart(3, "0")}`, code: formCode, name: formName,
                  type: formType as any, value: Number(formValue), valueType: formValueType as any,
                  minDeposit: Number(formMinDeposit), maxUses: Number(formMaxUses), usedCount: 0,
                  status: "active" as const, startDate: formStart, endDate: formEnd,
                  category: formCategory, createdBy: "Carlos Reyes", totalRedeemed: 0,
                }]);
                showOmsToast(`Promo code ${formCode} created`);
              } else {
                setPromos(prev => prev.map(p => p.id === selectedPromo!.id ? { ...p, code: formCode, name: formName, type: formType as any, value: Number(formValue), valueType: formValueType as any, minDeposit: Number(formMinDeposit), maxUses: Number(formMaxUses), startDate: formStart, endDate: formEnd, category: formCategory } : p));
                showOmsToast(`${formCode} updated`);
              }
              setModalType(null);
            }}>{modalType === "create" ? "Create Promo" : "Save Changes"}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Pause Modal */}
      <OmsModal open={modalType === "pause" && !!selectedPromo} onClose={() => setModalType(null)} title="Pause Promo Code">
        <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={`Pause promo code ${selectedPromo?.code}? Users won't be able to redeem it until resumed.`} details={[
          { label: "Code", value: selectedPromo?.code || "" },
          { label: "Current Usage", value: `${selectedPromo?.usedCount.toLocaleString()} / ${selectedPromo?.maxUses ? selectedPromo.maxUses.toLocaleString() : "∞"}` },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setPromos(prev => prev.map(p => p.id === selectedPromo!.id ? { ...p, status: "paused" as const } : p)); setModalType(null); showOmsToast(`${selectedPromo!.code} paused`); }}>Pause Promo</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Resume Modal */}
      <OmsModal open={modalType === "resume" && !!selectedPromo} onClose={() => setModalType(null)} title="Resume Promo Code">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Resume promo code ${selectedPromo?.code}? Users will be able to redeem it again.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setPromos(prev => prev.map(p => p.id === selectedPromo!.id ? { ...p, status: "active" as const } : p)); setModalType(null); showOmsToast(`${selectedPromo!.code} resumed`); }}>Resume Promo</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}