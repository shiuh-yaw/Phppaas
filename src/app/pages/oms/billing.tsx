import { useState } from "react";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { logAudit } from "../../components/oms/oms-audit-log";

const inter = { fontFamily: "'Inter', sans-serif" };

interface Invoice {
  id: string;
  merchantId: string;
  merchantName: string;
  period: string;
  amount: number;
  platformFee: number;
  status: "paid" | "pending" | "overdue" | "draft";
  dueDate: string;
  paidDate?: string;
}

interface PlanDef {
  name: string;
  key: string;
  price: string;
  revShare: string;
  features: string[];
  color: string;
  merchants: number;
}

const PLANS: PlanDef[] = [
  { name: "Starter", key: "starter", price: "₱50,000/mo", revShare: "8% GGR", features: ["Up to 10,000 users", "5 market categories", "Basic analytics", "Email support", "1 API key"], color: "#6b7280", merchants: 2 },
  { name: "Growth", key: "growth", price: "₱150,000/mo", revShare: "5% GGR", features: ["Up to 100,000 users", "All market categories", "Advanced analytics", "Priority support", "5 API keys", "Webhook integrations", "Custom branding"], color: "#3b82f6", merchants: 3 },
  { name: "Enterprise", key: "enterprise", price: "₱500,000/mo", revShare: "3% GGR", features: ["Unlimited users", "All market categories", "Real-time analytics", "Dedicated account manager", "Unlimited API keys", "Priority webhook delivery", "Full white-label", "Custom payment gateways", "SLA guarantee 99.99%"], color: "#ff5222", merchants: 2 },
  { name: "Custom", key: "custom", price: "Contact us", revShare: "Negotiable", features: ["Everything in Enterprise", "Custom SLA", "On-premise option", "Dedicated infrastructure", "Custom integrations"], color: "#8b5cf6", merchants: 1 },
];

const MOCK_INVOICES: Invoice[] = [
  { id: "INV-2026-03-001", merchantId: "MCH001", merchantName: "PredictEx", period: "Mar 2026", amount: 500000, platformFee: 2352000, status: "pending", dueDate: "2026-04-01" },
  { id: "INV-2026-03-002", merchantId: "MCH002", merchantName: "BetManila", period: "Mar 2026", amount: 150000, platformFee: 1605000, status: "pending", dueDate: "2026-04-01" },
  { id: "INV-2026-03-003", merchantId: "MCH003", merchantName: "Sugal PH", period: "Mar 2026", amount: 500000, platformFee: 1704000, status: "pending", dueDate: "2026-04-01" },
  { id: "INV-2026-03-004", merchantId: "MCH006", merchantName: "Tongits Live", period: "Mar 2026", amount: 150000, platformFee: 945000, status: "pending", dueDate: "2026-04-01" },
  { id: "INV-2026-02-001", merchantId: "MCH001", merchantName: "PredictEx", period: "Feb 2026", amount: 500000, platformFee: 2180000, status: "paid", dueDate: "2026-03-01", paidDate: "2026-02-28" },
  { id: "INV-2026-02-002", merchantId: "MCH002", merchantName: "BetManila", period: "Feb 2026", amount: 150000, platformFee: 1420000, status: "paid", dueDate: "2026-03-01", paidDate: "2026-02-27" },
  { id: "INV-2026-02-003", merchantId: "MCH003", merchantName: "Sugal PH", period: "Feb 2026", amount: 500000, platformFee: 1560000, status: "paid", dueDate: "2026-03-01", paidDate: "2026-02-28" },
  { id: "INV-2026-02-004", merchantId: "MCH005", merchantName: "WagerPH", period: "Feb 2026", amount: 150000, platformFee: 620000, status: "overdue", dueDate: "2026-03-01" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { paid: "bg-emerald-500/15 text-emerald-400", pending: "bg-amber-500/15 text-amber-400", overdue: "bg-red-500/15 text-red-400", draft: "bg-gray-500/15 text-gray-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsBilling() {
  const { merchants } = useOmsAuth();
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [tab, setTab] = useState<"overview" | "invoices" | "plans" | "revenue-share">("overview");
  const [modalType, setModalType] = useState<"change-plan" | "mark-paid" | "send-reminder" | null>(null);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useTenantConfig();
  const { t } = useI18n();

  const totalMRR = PLANS.reduce((s, p) => {
    const price = parseInt(p.price.replace(/[^0-9]/g, "")) || 0;
    return s + (price * p.merchants);
  }, 0);

  const totalPlatformFees = invoices.filter(i => i.period === "Mar 2026").reduce((s, i) => s + i.platformFee, 0);
  const pendingInvoices = invoices.filter(i => i.status === "pending").length;
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length;

  return (
    <div className="space-y-4" style={inter}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Monthly Recurring Revenue", value: `₱${(totalMRR / 1000).toFixed(0)}K`, color: "text-[#ff5222]" },
          { label: "Platform Fees (MTD)", value: `₱${(totalPlatformFees / 1000000).toFixed(1)}M`, color: "text-emerald-400" },
          { label: "Active Subscriptions", value: String(merchants.filter(m => m.status === "active").length), color: "text-white" },
          { label: "Pending Invoices", value: String(pendingInvoices), color: "text-amber-400" },
          { label: "Overdue", value: String(overdueInvoices), color: overdueInvoices > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 overflow-x-auto">
        {(["overview", "invoices", "plans", "revenue-share"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[11px] px-3 py-1.5 rounded-md cursor-pointer transition-colors whitespace-nowrap ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "overview" ? "Overview" : t === "invoices" ? `Invoices (${invoices.length})` : t === "plans" ? "Plans" : "Revenue Share"}
          </button>
        ))}
      </div>

      {/* ==================== OVERVIEW ==================== */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Revenue breakdown by merchant */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Revenue Breakdown by Merchant (MTD)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                    <th className="py-2">Merchant</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Base Fee</th>
                    <th className="py-2">GGR</th>
                    <th className="py-2">Rev Share %</th>
                    <th className="py-2">Platform Fee</th>
                    <th className="py-2">Total Due</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.filter(m => m.status === "active").map(m => {
                    const plan = PLANS.find(p => p.key === m.plan);
                    const basePrice = parseInt(plan?.price.replace(/[^0-9]/g, "") || "0");
                    const revSharePct = m.plan === "enterprise" ? 3 : m.plan === "growth" ? 5 : 8;
                    const revShareAmt = Math.round(m.ggr * revSharePct / 100);
                    return (
                      <tr key={m.id} className="border-b border-[#1f2937]/50">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[8px]" style={{ fontWeight: 700 }}>{m.logo}</div>
                            <span className="text-white" style={{ fontWeight: 500 }}>{m.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400`} style={{ fontWeight: 600 }}>{m.plan.toUpperCase()}</span></td>
                        <td className="py-2.5 text-[#9ca3af]">₱{basePrice.toLocaleString()}</td>
                        <td className="py-2.5 text-white" style={{ fontWeight: 500 }}>₱{(m.ggr / 1000000).toFixed(1)}M</td>
                        <td className="py-2.5 text-[#9ca3af]">{revSharePct}%</td>
                        <td className="py-2.5 text-emerald-400" style={{ fontWeight: 600 }}>₱{(revShareAmt / 1000).toFixed(0)}K</td>
                        <td className="py-2.5 text-white" style={{ fontWeight: 600 }}>₱{((basePrice + revShareAmt) / 1000).toFixed(0)}K</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Recent Invoices</h3>
              <button onClick={() => setTab("invoices")} className="text-[#ff5222] text-[11px] cursor-pointer hover:underline" style={{ fontWeight: 500 }}>View All →</button>
            </div>
            <div className="space-y-2">
              {invoices.slice(0, 4).map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-[#1f2937]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[#6b7280] text-[11px] font-mono">{inv.id}</span>
                    <span className="text-white text-[12px]" style={{ fontWeight: 500 }}>{inv.merchantName}</span>
                    <span className="text-[#4b5563] text-[10px]">{inv.period}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-[12px]" style={{ fontWeight: 600 }}>₱{(inv.amount + inv.platformFee).toLocaleString()}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== INVOICES ==================== */}
      {tab === "invoices" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-3 py-3">Merchant</th>
                <th className="px-3 py-3">Period</th>
                <th className="px-3 py-3">Base Fee</th>
                <th className="px-3 py-3">Platform Fee</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Due Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <OmsTableSkeleton rows={pageSize} cols={9} />
              ) : (
                paginate(invoices, currentPage, pageSize).map(inv => (
                  <tr key={inv.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3 text-[#9ca3af] font-mono text-[11px]">{inv.id}</td>
                    <td className="px-3 py-3 text-white" style={{ fontWeight: 500 }}>{inv.merchantName}</td>
                    <td className="px-3 py-3 text-[#9ca3af]">{inv.period}</td>
                    <td className="px-3 py-3 text-[#9ca3af]">₱{inv.amount.toLocaleString()}</td>
                    <td className="px-3 py-3 text-emerald-400" style={{ fontWeight: 500 }}>₱{inv.platformFee.toLocaleString()}</td>
                    <td className="px-3 py-3 text-white" style={{ fontWeight: 600 }}>₱{(inv.amount + inv.platformFee).toLocaleString()}</td>
                    <td className="px-3 py-3 text-[#6b7280]">{inv.dueDate}</td>
                    <td className="px-3 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        {inv.status === "pending" && (
                          <button onClick={() => { setSelectedInv(inv); setModalType("mark-paid"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Mark Paid</button>
                        )}
                        {inv.status === "overdue" && (
                          <button onClick={() => { setSelectedInv(inv); setModalType("send-reminder"); }} className="text-[10px] text-amber-400 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Remind</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <OmsPagination
            page={currentPage}
            setPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={invoices.length}
          />
        </div>
      )}

      {/* ==================== PLANS ==================== */}
      {tab === "plans" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map(plan => (
            <div key={plan.key} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex flex-col" style={{ borderColor: plan.key === "enterprise" ? "#ff5222" + "30" : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white text-[16px]" style={{ fontWeight: 700, color: plan.color }}>{plan.name}</h3>
                  <p className="text-[#6b7280] text-[11px]">{plan.merchants} merchant{plan.merchants !== 1 ? "s" : ""} on this plan</p>
                </div>
                {plan.key === "enterprise" && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff5222]/15 text-[#ff5222]" style={{ fontWeight: 600 }}>POPULAR</span>
                )}
              </div>
              <div className="mb-3">
                <p className="text-white text-[22px]" style={{ fontWeight: 700 }}>{plan.price}</p>
                <p className="text-[#6b7280] text-[11px]">+ {plan.revShare} revenue share</p>
              </div>
              <div className="flex-1 space-y-1.5 mb-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <svg className="size-3 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-[#9ca3af] text-[11px]">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setSelectedPlan(plan.key); setSelectedMerchant(""); setModalType("change-plan"); }} className="w-full h-8 text-[11px] rounded-lg cursor-pointer transition-colors border" style={{ fontWeight: 600, borderColor: plan.color + "40", color: plan.color, background: plan.color + "10" }}>
                Assign to Merchant
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ==================== REVENUE SHARE ==================== */}
      {tab === "revenue-share" && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Revenue Share Configuration</h3>
            <p className="text-[#6b7280] text-[11px] mb-4">Platform takes a percentage of each merchant's Gross Gaming Revenue (GGR) based on their plan tier.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Base Fee</th>
                    <th className="py-2">GGR Rev Share</th>
                    <th className="py-2">Min Guarantee</th>
                    <th className="py-2">Settlement</th>
                    <th className="py-2">Payment Terms</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: "Starter", base: "₱50,000", share: "8%", min: "₱50,000", settle: "Monthly", terms: "Net 30" },
                    { plan: "Growth", base: "₱150,000", share: "5%", min: "₱150,000", settle: "Monthly", terms: "Net 30" },
                    { plan: "Enterprise", base: "₱500,000", share: "3%", min: "₱500,000", settle: "Monthly", terms: "Net 15" },
                    { plan: "Custom", base: "Negotiable", share: "Negotiable", min: "Negotiable", settle: "Custom", terms: "Custom" },
                  ].map(r => (
                    <tr key={r.plan} className="border-b border-[#1f2937]/50">
                      <td className="py-2.5 text-white" style={{ fontWeight: 600 }}>{r.plan}</td>
                      <td className="py-2.5 text-[#9ca3af]">{r.base}</td>
                      <td className="py-2.5 text-[#ff5222]" style={{ fontWeight: 600 }}>{r.share}</td>
                      <td className="py-2.5 text-[#9ca3af]">{r.min}</td>
                      <td className="py-2.5 text-[#9ca3af]">{r.settle}</td>
                      <td className="py-2.5 text-[#9ca3af]">{r.terms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Per-Merchant Revenue Share Overrides</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                    <th className="py-2">Merchant</th>
                    <th className="py-2">Plan Rate</th>
                    <th className="py-2">Override Rate</th>
                    <th className="py-2">Effective Rate</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "PredictEx", planRate: "3%", override: "2.5%", effective: "2.5%", notes: "Volume discount — flagship partner" },
                    { name: "BetManila", planRate: "5%", override: "—", effective: "5%", notes: "Standard rate" },
                    { name: "Sugal PH", planRate: "3%", override: "—", effective: "3%", notes: "Standard rate" },
                    { name: "Tongits Live", planRate: "5%", override: "4%", effective: "4%", notes: "Early adopter discount" },
                    { name: "ColorBet Arena", planRate: "8%", override: "—", effective: "8%", notes: "Standard rate" },
                  ].map(r => (
                    <tr key={r.name} className="border-b border-[#1f2937]/50">
                      <td className="py-2.5 text-white" style={{ fontWeight: 500 }}>{r.name}</td>
                      <td className="py-2.5 text-[#9ca3af]">{r.planRate}</td>
                      <td className="py-2.5 text-[#ff5222]" style={{ fontWeight: r.override !== "—" ? 600 : 400 }}>{r.override}</td>
                      <td className="py-2.5 text-white" style={{ fontWeight: 600 }}>{r.effective}</td>
                      <td className="py-2.5 text-[#6b7280] text-[11px]">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Change Plan */}
      <OmsModal open={modalType === "change-plan"} onClose={() => setModalType(null)} title="Assign Plan to Merchant">
        <div className="space-y-3">
          <OmsField label="Select Merchant" required>
            <OmsSelect value={selectedMerchant} onChange={setSelectedMerchant} options={[
              { value: "", label: "— Choose merchant —" },
              ...merchants.filter(m => m.status === "active" || m.status === "onboarding").map(m => ({ value: m.id, label: `${m.name} (${m.plan})` })),
            ]} />
          </OmsField>
          <OmsField label="New Plan" required>
            <OmsSelect value={selectedPlan} onChange={setSelectedPlan} options={PLANS.map(p => ({ value: p.key, label: `${p.name} — ${p.price}` }))} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!selectedMerchant) { showOmsToast("Select a merchant", "error"); return; }
              const m = merchants.find(m => m.id === selectedMerchant);
              showOmsToast(`${m?.name} upgraded to ${selectedPlan.toUpperCase()}`);
              setModalType(null);
              logAudit(`Assigned ${selectedPlan.toUpperCase()} plan to ${m?.name}`);
            }}>Assign Plan</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Mark Paid */}
      <OmsModal open={modalType === "mark-paid" && !!selectedInv} onClose={() => setModalType(null)} title="Mark Invoice as Paid">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Mark ${selectedInv?.id} as paid?`} details={[
          { label: "Merchant", value: selectedInv?.merchantName || "" },
          { label: "Total", value: `₱${((selectedInv?.amount || 0) + (selectedInv?.platformFee || 0)).toLocaleString()}` },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => {
            setInvoices(prev => prev.map(i => i.id === selectedInv!.id ? { ...i, status: "paid" as const, paidDate: "2026-03-13" } : i));
            setModalType(null);
            showOmsToast(`${selectedInv!.id} marked as paid`);
            logAudit(`Marked ${selectedInv!.id} as paid`);
          }}>Mark Paid</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Send Reminder */}
      <OmsModal open={modalType === "send-reminder" && !!selectedInv} onClose={() => setModalType(null)} title="Send Payment Reminder">
        <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={`Send overdue payment reminder to ${selectedInv?.merchantName}?`} details={[
          { label: "Invoice", value: selectedInv?.id || "" },
          { label: "Amount Due", value: `₱${((selectedInv?.amount || 0) + (selectedInv?.platformFee || 0)).toLocaleString()}` },
          { label: "Due Date", value: selectedInv?.dueDate || "" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="primary" onClick={() => { setModalType(null); showOmsToast(`Reminder sent to ${selectedInv!.merchantName}`); logAudit(`Sent payment reminder to ${selectedInv!.merchantName}`); }}>Send Reminder</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}