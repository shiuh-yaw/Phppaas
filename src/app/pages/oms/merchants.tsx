import { useState } from "react";
import { useNavigate } from "react-router";
import { useOmsAuth, type Merchant } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { logAudit, type AuditAction } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const inter = { fontFamily: "'Inter', sans-serif" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", onboarding: "bg-amber-500/15 text-amber-400", suspended: "bg-red-500/15 text-red-400", deactivated: "bg-gray-500/15 text-gray-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = { enterprise: "bg-purple-500/15 text-purple-400", growth: "bg-blue-500/15 text-blue-400", starter: "bg-gray-500/15 text-gray-400", custom: "bg-amber-500/15 text-amber-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[plan] || ""}`} style={{ fontWeight: 600 }}>{plan.toUpperCase()}</span>;
}

export default function OmsMerchants() {
  const navigate = useNavigate();
  const { admin, merchants, setActiveMerchant, updateMerchant } = useOmsAuth();

  const doAudit = (action: AuditAction, target: string, detail?: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action, target, detail, merchantId: selected?.id });
  };
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalType, setModalType] = useState<"detail" | "suspend" | "activate" | "edit" | null>(null);
  const [selected, setSelected] = useState<Merchant | null>(null);

  // Edit form
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formPlan, setFormPlan] = useState("starter");
  const [formCountry, setFormCountry] = useState("Philippines");
  const [formCurrency, setFormCurrency] = useState("PHP");

  const filtered = merchants.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.slug.toLowerCase().includes(search.toLowerCase()) && !m.primaryDomain.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  const totalGGR = merchants.reduce((s, m) => s + m.ggr, 0);
  const totalUsers = merchants.reduce((s, m) => s + m.users, 0);
  const activeMerchantCount = merchants.filter(m => m.status === "active").length;

  const openEdit = (m: Merchant) => {
    setSelected(m); setFormName(m.name); setFormSlug(m.slug); setFormDomain(m.primaryDomain);
    setFormPlan(m.plan); setFormCountry(m.country); setFormCurrency(m.currency); setModalType("edit");
  };

  const switchToMerchant = (m: Merchant) => {
    setActiveMerchant(m);
    navigate("/oms/dashboard");
  };

  const { t } = useI18n();
  const { tenantConfig } = useTenantConfig();

  return (
    <div className="space-y-4" style={inter}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Merchants", value: String(merchants.length), color: "text-white" },
          { label: "Active", value: String(activeMerchantCount), color: "text-emerald-400" },
          { label: "Onboarding", value: String(merchants.filter(m => m.status === "onboarding").length), color: "text-amber-400" },
          { label: "Platform GGR (MTD)", value: `₱${(totalGGR / 1000000).toFixed(1)}M`, color: "text-[#ff5222]" },
          { label: "Total Platform Users", value: (totalUsers / 1000).toFixed(0) + "K", color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Onboard via KYB */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 h-8 max-w-[260px]">
            <svg className="size-3.5 text-[#6b7280]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search merchants..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 px-2.5 bg-[#111827] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
        <button onClick={() => navigate("/oms/kyb")} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors flex items-center gap-2" style={{ fontWeight: 600 }}>
          <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          Onboard via KYB
        </button>
      </div>

      {/* KYB-first notice */}
      <div className="flex items-center gap-3 p-3 bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[#ff5222]/10 flex items-center justify-center flex-shrink-0">
          <svg className="size-4 text-[#ff5222]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
            <path d="M8 7h4M8 10h4M8 13h2" />
            <path d="M12 13l1 1 2-3" />
          </svg>
        </div>
        <div>
          <p className="text-[#9ca3af] text-[11px]" style={{ fontWeight: 500 }}>
            New merchants must complete <button onClick={() => navigate("/oms/kyb")} className="text-[#ff5222] hover:underline cursor-pointer" style={{ fontWeight: 600 }}>KYB verification</button> before onboarding. Merchant records are auto-created upon KYB approval and credential issuance.
          </p>
        </div>
      </div>

      {/* Merchant cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(m => (
          <div key={m.id} className={`bg-[#111827] border rounded-xl p-4 hover:bg-[#111827]/80 transition-colors ${m.status === "active" ? "border-[#1f2937]" : m.status === "suspended" ? "border-red-500/20" : m.status === "onboarding" ? "border-amber-500/20" : "border-[#1f2937] opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[14px] flex-shrink-0" style={{ fontWeight: 800 }}>
                  {m.logo}
                </div>
                <div>
                  <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{m.name}</p>
                  <p className="text-[#4b5563] text-[10px]">{m.primaryDomain}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={m.status} />
              <PlanBadge plan={m.plan} />
              <span className="text-[#4b5563] text-[9px]">{m.id}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[8px]">GGR (MTD)</p>
                <p className="text-white text-[11px]" style={{ fontWeight: 600 }}>₱{m.ggr > 0 ? (m.ggr / 1000000).toFixed(1) + "M" : "0"}</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[8px]">Users</p>
                <p className="text-white text-[11px]" style={{ fontWeight: 600 }}>{m.users > 0 ? (m.users / 1000).toFixed(0) + "K" : "0"}</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[8px]">Markets</p>
                <p className="text-white text-[11px]" style={{ fontWeight: 600 }}>{m.markets}</p>
              </div>
            </div>

            <div className="flex gap-1.5">
              {m.status === "active" && (
                <button onClick={() => switchToMerchant(m)} className="flex-1 text-[10px] text-[#ff5222] py-1.5 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Switch To</button>
              )}
              <button onClick={() => { setSelected(m); setModalType("detail"); }} className="flex-1 text-[10px] text-[#9ca3af] hover:text-white py-1.5 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Detail</button>
              <button onClick={() => navigate(`/oms/merchants/${m.id}`)} className="flex-1 text-[10px] text-blue-400 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Configure</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selected} onClose={() => setModalType(null)} title="Merchant Overview" subtitle={selected?.name} width="max-w-[600px]">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-xl bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[20px]" style={{ fontWeight: 800 }}>{selected.logo}</div>
              <div>
                <p className="text-white text-[16px]" style={{ fontWeight: 700 }}>{selected.name}</p>
                <p className="text-[#6b7280] text-[12px]">{selected.primaryDomain}</p>
                <div className="flex gap-2 mt-1"><StatusBadge status={selected.status} /><PlanBadge plan={selected.plan} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Merchant ID", value: selected.id },
                { label: "Slug", value: selected.slug },
                { label: "Country", value: selected.country },
                { label: "Currency", value: selected.currency },
                { label: "Created", value: selected.createdAt },
                { label: "GGR (MTD)", value: `₱${selected.ggr.toLocaleString()}` },
                { label: "Total Users", value: selected.users.toLocaleString() },
                { label: "Active Markets", value: String(selected.markets) },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
              <OmsBtn variant="primary" onClick={() => { setModalType(null); openEdit(selected); }}>Edit</OmsBtn>
              {selected.status === "active" && (
                <OmsBtn variant="danger" onClick={() => setModalType("suspend")}>Suspend</OmsBtn>
              )}
              {(selected.status === "suspended" || selected.status === "deactivated") && (
                <OmsBtn variant="success" onClick={() => setModalType("activate")}>Activate</OmsBtn>
              )}
              {selected.status === "active" && (
                <OmsBtn variant="primary" onClick={() => switchToMerchant(selected)}>Switch To</OmsBtn>
              )}
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Edit Modal */}
      <OmsModal open={modalType === "edit"} onClose={() => setModalType(null)} title="Edit Merchant" subtitle={selected?.id}>
        <div className="space-y-3">
          <OmsField label="Merchant Name" required>
            <OmsInput value={formName} onChange={setFormName} placeholder="e.g. PredictEx" />
          </OmsField>
          <OmsField label="Slug (URL identifier)" required>
            <OmsInput value={formSlug} onChange={setFormSlug} placeholder="e.g. lucky-taya" />
          </OmsField>
          <OmsField label="Primary Domain" required>
            <OmsInput value={formDomain} onChange={setFormDomain} placeholder="e.g. predictex.ph" />
          </OmsField>
          <div className="grid grid-cols-3 gap-3">
            <OmsField label="Plan" required>
              <OmsSelect value={formPlan} onChange={setFormPlan} options={[
                { value: "starter", label: "Starter" },
                { value: "growth", label: "Growth" },
                { value: "enterprise", label: "Enterprise" },
                { value: "custom", label: "Custom" },
              ]} />
            </OmsField>
            <OmsField label="Country" required>
              <OmsSelect value={formCountry} onChange={setFormCountry} options={[
                { value: "Philippines", label: "Philippines" },
              ]} />
            </OmsField>
            <OmsField label="Currency" required>
              <OmsSelect value={formCurrency} onChange={setFormCurrency} options={[
                { value: "PHP", label: "PHP (₱)" },
              ]} />
            </OmsField>
          </div>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!formName || !formSlug || !formDomain) { showOmsToast("Fill all required fields", "error"); return; }
              const changes: string[] = [];
              if (selected!.name !== formName) changes.push(`name: ${selected!.name} → ${formName}`);
              if (selected!.slug !== formSlug) changes.push(`slug: ${selected!.slug} → ${formSlug}`);
              if (selected!.primaryDomain !== formDomain) changes.push(`domain: ${selected!.primaryDomain} → ${formDomain}`);
              if (selected!.plan !== formPlan) changes.push(`plan: ${selected!.plan} → ${formPlan}`);
              updateMerchant(selected!.id, { name: formName, slug: formSlug, primaryDomain: formDomain, plan: formPlan as any, country: formCountry, currency: formCurrency });
              doAudit("merchant_edit", selected!.id, changes.length > 0 ? `Edited ${formName}: ${changes.join(", ")}` : `Edited ${formName} (no field changes)`);
              showOmsToast(`${formName} updated`);
              setModalType(null);
            }}>Save Changes</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Suspend Modal */}
      <OmsModal open={modalType === "suspend" && !!selected} onClose={() => setModalType(null)} title="Suspend Merchant">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Suspend ${selected?.name}? All operations will be paused. Users cannot place bets or access the platform.`} details={[
          { label: "Merchant", value: selected?.name || "" },
          { label: "Active Users", value: selected?.users.toLocaleString() || "0" },
          { label: "Active Markets", value: String(selected?.markets || 0) },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { updateMerchant(selected!.id, { status: "suspended" }); doAudit("merchant_suspend", selected!.id, `Suspended merchant ${selected!.name}. Active users: ${selected!.users}, active markets: ${selected!.markets}`); setModalType(null); showOmsToast(`${selected!.name} suspended`); }}>Suspend Merchant</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Activate Modal */}
      <OmsModal open={modalType === "activate" && !!selected} onClose={() => setModalType(null)} title="Activate Merchant">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Activate ${selected?.name}? The platform will go live and users can resume operations.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { updateMerchant(selected!.id, { status: "active" }); doAudit("merchant_activate", selected!.id, `Activated merchant ${selected!.name}`); setModalType(null); showOmsToast(`${selected!.name} activated`); }}>Activate</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}