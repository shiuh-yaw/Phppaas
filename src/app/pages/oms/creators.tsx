import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { MOCK_CREATOR_APPS as INITIAL_APPS, MOCK_CREATORS as INITIAL_CREATORS, type OmsCreatorApp, type OmsCreator, type CreatorTier, type CreatorAppStatus } from "../../data/oms-mock";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type AppStatus = CreatorAppStatus;
type CreatorApp = OmsCreatorApp;
type Creator = OmsCreator;

function AppStatusBadge({ status }: { status: AppStatus }) {
  const map: Record<AppStatus, string> = { pending: "bg-amber-500/15 text-amber-400", approved: "bg-emerald-500/15 text-emerald-400", rejected: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function TierBadge({ tier }: { tier: CreatorTier }) {
  const map: Record<CreatorTier, string> = { standard: "bg-gray-500/15 text-gray-400", verified: "bg-blue-500/15 text-blue-400", premium: "bg-purple-500/15 text-purple-400", elite: "bg-amber-500/15 text-amber-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[tier]}`} style={{ fontWeight: 600 }}>{tier.toUpperCase()}</span>;
}

export default function OmsCreators() {
  const [tab, setTab] = useState<"applications" | "creators">("applications");
  const [apps, setApps] = useState(INITIAL_APPS);
  const [creators, setCreators] = useState(INITIAL_CREATORS);
  const [modalType, setModalType] = useState<"review" | "approve" | "reject" | "creator-detail" | "edit-tier" | "suspend" | "reinstate" | null>(null);
  const [selectedApp, setSelectedApp] = useState<CreatorApp | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editTier, setEditTier] = useState<CreatorTier>("standard");
  const [editRevShare, setEditRevShare] = useState("");
  const [crPage, setCrPage] = useState(1);
  const [crPageSize, setCrPageSize] = useState(10);
  const { hasPermission, canSeeField } = useTenantConfig();
  const { admin } = useOmsAuth();
  const { t } = useI18n();
  const role = admin?.role || "merchant_ops";
  // Tenant-config gating
  const canModifyRole = hasPermission("modify_role", role);
  const canViewRole = hasPermission("view_role", role);
  const canSeeEarnings = canSeeField("total_asset", role);
  const canSeeVolume = canSeeField("total_volume", role);

  const pendingApps = apps.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("creators.pending_apps"), value: String(pendingApps), color: pendingApps > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: t("creators.active_creators"), value: String(creators.filter(c => c.status === "active").length), color: "text-emerald-400" },
          { label: t("creators.total_markets"), value: String(creators.reduce((s, c) => s + c.marketsCreated, 0)), color: "text-white" },
          { label: t("creators.creator_volume"), value: `₱${(creators.reduce((s, c) => s + c.totalVolume, 0) / 1000000).toFixed(1)}M`, color: "text-[#ff5222]" },
          { label: t("creators.rev_share_paid"), value: `₱${(creators.reduce((s, c) => s + c.earnings, 0) / 1000).toFixed(0)}K`, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit">
        {(["applications", "creators"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "applications" ? `Applications (${pendingApps})` : `Active Creators (${creators.length})`}
          </button>
        ))}
      </div>

      {/* Applications Tab */}
      {tab === "applications" && (
        <div className="space-y-2">
          {apps.map(a => (
            <div key={a.id} className={`bg-[#111827] border rounded-xl p-4 ${a.status === "pending" ? "border-amber-500/20" : "border-[#1f2937]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{a.name}</p>
                    <AppStatusBadge status={a.status} />
                    <span className="text-[#4b5563] text-[10px]">Applied: {a.appliedDate}</span>
                  </div>
                  <p className="text-[#9ca3af] text-[11px] mb-1">{a.reason}</p>
                  <div className="flex gap-2 flex-wrap">
                    {a.categories.map(c => <span key={c} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1f2937] text-[#9ca3af]">{c}</span>)}
                    <span className="text-[#6b7280] text-[10px]">{a.followers.toLocaleString()} followers · {a.experience}</span>
                  </div>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => { setSelectedApp(a); setModalType("review"); }} className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Review</button>
                    <button onClick={() => { setSelectedApp(a); setModalType("approve"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Approve</button>
                    <button onClick={() => { setSelectedApp(a); setRejectReason(""); setModalType("reject"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creators Tab */}
      {tab === "creators" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-3 py-3">Tier</th>
                  <th className="px-3 py-3">Markets</th>
                  {canSeeVolume && <th className="px-3 py-3">Volume</th>}
                  {canSeeEarnings && <th className="px-3 py-3">Rev Share</th>}
                  {canSeeEarnings && <th className="px-3 py-3">Earnings</th>}
                  <th className="px-3 py-3">Rating</th>
                  {canViewRole && <th className="px-3 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginate(creators, crPage, crPageSize).map(c => (
                  <tr key={c.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{c.name}</p>
                      <p className="text-[#6b7280] text-[10px]">{c.id} · {c.lastActive}</p>
                    </td>
                    <td className="px-3 py-3"><TierBadge tier={c.tier} /></td>
                    <td className="px-3 py-3 text-white">{c.marketsCreated} <span className="text-[#6b7280]">({c.marketsLive} live)</span></td>
                    {canSeeVolume && <td className="px-3 py-3 text-white">₱{(c.totalVolume / 1000000).toFixed(1)}M</td>}
                    {canSeeEarnings && <td className="px-3 py-3 text-[#ff5222]" style={{ fontWeight: 600 }}>{c.revShare}%</td>}
                    {canSeeEarnings && <td className="px-3 py-3 text-emerald-400">₱{c.earnings.toLocaleString()}</td>}
                    <td className="px-3 py-3">
                      <span className="text-amber-400">{c.rating.toFixed(1)}</span>
                      <span className="text-[#4b5563]">/5</span>
                    </td>
                    {canViewRole && (
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setSelectedCreator(c); setModalType("creator-detail"); }} className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Detail</button>
                        {canModifyRole && (
                          <button onClick={() => { setSelectedCreator(c); setEditTier(c.tier); setEditRevShare(String(c.revShare)); setModalType("edit-tier"); }} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit</button>
                        )}
                        {canModifyRole && (
                          c.status === "active" ? (
                            <button onClick={() => { setSelectedCreator(c); setModalType("suspend"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Suspend</button>
                          ) : (
                            <button onClick={() => { setSelectedCreator(c); setModalType("reinstate"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Reinstate</button>
                          )
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <OmsPagination page={crPage} setPage={setCrPage} pageSize={crPageSize} setPageSize={setCrPageSize} totalItems={creators.length} />
        </div>
      )}

      {/* Review Modal */}
      <OmsModal open={modalType === "review" && !!selectedApp} onClose={() => setModalType(null)} title="Review Application" subtitle={selectedApp?.name} width="max-w-[560px]">
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email", value: selectedApp.email },
                { label: "User ID", value: selectedApp.userId },
                { label: "Applied", value: selectedApp.appliedDate },
                { label: "Experience", value: selectedApp.experience },
                { label: "Followers", value: selectedApp.followers.toLocaleString() },
                { label: "Social", value: selectedApp.socialLinks },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>Application Reason</p>
              <p className="text-white text-[12px]">{selectedApp.reason}</p>
            </div>
            <div className="flex gap-1 flex-wrap">
              {selectedApp.categories.map(c => <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff5222]/10 text-[#ff5222]">{c}</span>)}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
              <OmsBtn variant="danger" onClick={() => { setRejectReason(""); setModalType("reject"); }}>Reject</OmsBtn>
              <OmsBtn variant="success" onClick={() => setModalType("approve")}>Approve</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Approve Modal */}
      <OmsModal open={modalType === "approve" && !!selectedApp} onClose={() => setModalType(null)} title="Approve Creator Application">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Approve ${selectedApp?.name} as a market creator? They will be able to create prediction markets on the platform.`} details={[
          { label: "Applicant", value: selectedApp?.name || "" },
          { label: "Categories", value: selectedApp?.categories.join(", ") || "" },
          { label: "Initial Tier", value: "Standard (1.5% rev share)" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setApps(prev => prev.map(a => a.id === selectedApp!.id ? { ...a, status: "approved" as const } : a)); setModalType(null); showOmsToast(`${selectedApp!.name} approved as creator`); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "creator_approve", target: `${selectedApp!.name} (${selectedApp!.userId})`, detail: `Approved creator application — categories: ${selectedApp!.categories.join(", ")}` }); }}>Approve</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Reject Modal */}
      <OmsModal open={modalType === "reject" && !!selectedApp} onClose={() => setModalType(null)} title="Reject Application">
        <div className="space-y-3">
          <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Reject ${selectedApp?.name}'s creator application?`} />
          <OmsField label="Rejection Reason" required>
            <OmsTextarea value={rejectReason} onChange={setRejectReason} placeholder="Explain why this application was rejected..." />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="danger" onClick={() => { setApps(prev => prev.map(a => a.id === selectedApp!.id ? { ...a, status: "rejected" as const } : a)); setModalType(null); showOmsToast(`${selectedApp!.name}'s application rejected`); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "creator_reject", target: `${selectedApp!.name} (${selectedApp!.userId})`, detail: `Rejected creator application — reason: ${rejectReason}` }); }}>Reject</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Creator Detail Modal */}
      <OmsModal open={modalType === "creator-detail" && !!selectedCreator} onClose={() => setModalType(null)} title="Creator Profile" subtitle={selectedCreator?.name} width="max-w-[560px]">
        {selectedCreator && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tier", value: selectedCreator.tier.toUpperCase() },
                { label: "Rev Share", value: `${selectedCreator.revShare}%` },
                { label: "Markets Created", value: String(selectedCreator.marketsCreated) },
                { label: "Live Markets", value: String(selectedCreator.marketsLive) },
                { label: "Total Volume", value: `₱${selectedCreator.totalVolume.toLocaleString()}` },
                { label: "Total Earnings", value: `₱${selectedCreator.earnings.toLocaleString()}` },
                { label: "Rating", value: `${selectedCreator.rating}/5` },
                { label: "Joined", value: selectedCreator.joinDate },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Edit Tier/Rev Share Modal */}
      <OmsModal open={modalType === "edit-tier" && !!selectedCreator} onClose={() => setModalType(null)} title="Edit Creator Settings" subtitle={selectedCreator?.name}>
        <div className="space-y-3">
          <OmsField label="Creator Tier" required>
            <OmsSelect value={editTier} onChange={v => setEditTier(v as CreatorTier)} options={[
              { value: "standard", label: "Standard (1.5% rev share)" },
              { value: "verified", label: "Verified (2.5% rev share)" },
              { value: "premium", label: "Premium (3.5% rev share)" },
              { value: "elite", label: "Elite (5.0% rev share)" },
            ]} />
          </OmsField>
          <OmsField label="Revenue Share (%)" required>
            <OmsInput value={editRevShare} onChange={setEditRevShare} type="number" placeholder="e.g. 2.5" />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              setCreators(prev => prev.map(c => c.id === selectedCreator!.id ? { ...c, tier: editTier, revShare: Number(editRevShare) } : c));
              setModalType(null);
              showOmsToast(`${selectedCreator!.name} updated to ${editTier} tier (${editRevShare}% rev share)`);
              logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "creator_edit", target: `${selectedCreator!.name} (${selectedCreator!.id})`, detail: `Updated tier to ${editTier}, rev share to ${editRevShare}%` });
            }}>Save Changes</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Suspend Modal */}
      <OmsModal open={modalType === "suspend" && !!selectedCreator} onClose={() => setModalType(null)} title="Suspend Creator">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Suspend ${selectedCreator?.name}? Their live markets will continue but they cannot create new ones.`} details={[
          { label: "Live Markets", value: String(selectedCreator?.marketsLive) },
          { label: "Total Earnings", value: `₱${selectedCreator?.earnings.toLocaleString()}` },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setCreators(prev => prev.map(c => c.id === selectedCreator!.id ? { ...c, status: "suspended" as const } : c)); setModalType(null); showOmsToast(`${selectedCreator!.name} suspended`); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "creator_suspend", target: `${selectedCreator!.name} (${selectedCreator!.id})`, detail: `Suspended creator — ${selectedCreator!.marketsLive} live markets, ₱${selectedCreator!.earnings.toLocaleString()} total earnings` }); }}>Suspend Creator</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Reinstate Modal */}
      <OmsModal open={modalType === "reinstate" && !!selectedCreator} onClose={() => setModalType(null)} title="Reinstate Creator">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Reinstate ${selectedCreator?.name}? They will regain market creation permissions.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setCreators(prev => prev.map(c => c.id === selectedCreator!.id ? { ...c, status: "active" as const } : c)); setModalType(null); showOmsToast(`${selectedCreator!.name} reinstated`); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "creator_reinstate", target: `${selectedCreator!.name} (${selectedCreator!.id})`, detail: `Reinstated creator` }); }}>Reinstate</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}