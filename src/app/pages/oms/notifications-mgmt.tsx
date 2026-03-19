import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const inter = { fontFamily: "'Inter', sans-serif" };

type NotifType = "bet_result" | "deposit" | "withdrawal" | "market_update" | "promo" | "system" | "reward" | "leaderboard";
type NotifStatus = "sent" | "scheduled" | "draft" | "failed";

interface InAppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  target: "all" | "segment" | "individual";
  targetDetail: string;
  status: NotifStatus;
  sentAt: string;
  readRate: number;
  clickRate: number;
  recipients: number;
  createdBy: string;
}

interface NotifTemplate {
  id: string;
  name: string;
  type: NotifType;
  titleTemplate: string;
  messageTemplate: string;
  trigger: "auto" | "manual";
  enabled: boolean;
}

const MOCK_NOTIFICATIONS: InAppNotification[] = [
  { id: "NTF001", type: "promo", title: "PBA Finals Promo — ₱100 Free Bet!", message: "Use code PBAFINALS100 for a free ₱100 bet on any PBA Finals market. Valid until March 20.", target: "all", targetDetail: "All users", status: "sent", sentAt: "2026-03-13 08:00", readRate: 45.2, clickRate: 18.3, recipients: 285000, createdBy: "Carlos Reyes" },
  { id: "NTF002", type: "system", title: "Scheduled Maintenance Tonight", message: "Lucky Taya will be under maintenance from 2:00 AM - 4:00 AM PHT. Your bets and balances are safe.", target: "all", targetDetail: "All users", status: "scheduled", sentAt: "2026-03-14 00:00", readRate: 0, clickRate: 0, recipients: 485230, createdBy: "Carlos Reyes" },
  { id: "NTF003", type: "market_update", title: "PBA Finals Game 5 Now Live!", message: "Ginebra vs SMB Game 5 is now live! Place your bets before tip-off.", target: "segment", targetDetail: "Basketball followers", status: "sent", sentAt: "2026-03-12 18:00", readRate: 62.8, clickRate: 34.1, recipients: 42000, createdBy: "Ana Dela Cruz" },
  { id: "NTF004", type: "reward", title: "Congrats! You reached Gold Tier!", message: "You've been promoted to Gold Tier! Enjoy 2% cashback on all bets and priority withdrawals.", target: "segment", targetDetail: "Newly promoted Gold users", status: "sent", sentAt: "2026-03-12 12:00", readRate: 78.5, clickRate: 52.3, recipients: 340, createdBy: "System" },
  { id: "NTF005", type: "leaderboard", title: "Weekly Leaderboard — You're #24!", message: "You're currently ranked #24 in this week's Top Bettors leaderboard. Top 10 win cash prizes!", target: "segment", targetDetail: "Top 100 leaderboard participants", status: "sent", sentAt: "2026-03-12 10:00", readRate: 85.0, clickRate: 61.2, recipients: 100, createdBy: "System" },
  { id: "NTF006", type: "promo", title: "Color Game Marathon Weekend!", message: "Non-stop Color Game rounds all weekend! Special 3x multiplier on selected colors.", target: "all", targetDetail: "All users", status: "draft", sentAt: "", readRate: 0, clickRate: 0, recipients: 0, createdBy: "Ana Dela Cruz" },
  { id: "NTF007", type: "deposit", title: "Deposit received — ₱5,000", message: "Your Maya deposit of ₱5,000 has been credited. Updated balance: ₱12,800.", target: "individual", targetDetail: "Auto-triggered for depositors", status: "sent", sentAt: "Auto", readRate: 92.0, clickRate: 15.0, recipients: 1200, createdBy: "System" },
];

const MOCK_TEMPLATES: NotifTemplate[] = [
  { id: "TPL001", name: "Bet Won", type: "bet_result", titleTemplate: "You won ₱{amount}!", messageTemplate: "Your bet on {market} paid out ₱{amount}. Updated balance: ₱{balance}.", trigger: "auto", enabled: true },
  { id: "TPL002", name: "Bet Lost", type: "bet_result", titleTemplate: "Bet settled — {market}", messageTemplate: "Your ₱{bet_amount} bet on {market} didn't win. Better luck next time!", trigger: "auto", enabled: true },
  { id: "TPL003", name: "Deposit Confirmed", type: "deposit", titleTemplate: "Deposit received — ₱{amount}", messageTemplate: "Your {method} deposit of ₱{amount} has been credited. Balance: ₱{balance}.", trigger: "auto", enabled: true },
  { id: "TPL004", name: "Withdrawal Processed", type: "withdrawal", titleTemplate: "Withdrawal sent — ₱{amount}", messageTemplate: "Your ₱{amount} withdrawal via {method} has been processed. Allow 1-3 hours for arrival.", trigger: "auto", enabled: true },
  { id: "TPL005", name: "Market Goes Live", type: "market_update", titleTemplate: "{market} is now live!", messageTemplate: "{market} is now accepting bets. Don't miss your chance!", trigger: "auto", enabled: true },
  { id: "TPL006", name: "Reward Tier Upgrade", type: "reward", titleTemplate: "Congrats! You reached {tier}!", messageTemplate: "You've been promoted to {tier}! Enjoy {benefit}.", trigger: "auto", enabled: true },
  { id: "TPL007", name: "Leaderboard Update", type: "leaderboard", titleTemplate: "Leaderboard — You're #{rank}!", messageTemplate: "You're currently ranked #{rank} in {period}. Keep it up!", trigger: "auto", enabled: false },
  { id: "TPL008", name: "System Alert", type: "system", titleTemplate: "{title}", messageTemplate: "{message}", trigger: "manual", enabled: true },
];

function StatusBadge({ status }: { status: NotifStatus }) {
  const map: Record<NotifStatus, string> = { sent: "bg-emerald-500/15 text-emerald-400", scheduled: "bg-blue-500/15 text-blue-400", draft: "bg-gray-500/15 text-gray-400", failed: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function TypeBadge({ type }: { type: NotifType }) {
  const map: Record<NotifType, string> = { bet_result: "text-emerald-400", deposit: "text-blue-400", withdrawal: "text-amber-400", market_update: "text-purple-400", promo: "text-pink-400", system: "text-gray-400", reward: "text-amber-400", leaderboard: "text-cyan-400" };
  return <span className={`text-[10px] ${map[type]}`} style={{ fontWeight: 500 }}>{type.replace("_", " ")}</span>;
}

export default function OmsNotificationsMgmt() {
  const [tab, setTab] = useState<"notifications" | "templates">("notifications");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [modalType, setModalType] = useState<"create" | "detail" | "send" | "delete" | "edit-template" | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<InAppNotification | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotifTemplate | null>(null);

  // Create form
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<string>("promo");
  const [formTarget, setFormTarget] = useState("all");
  const [formTargetDetail, setFormTargetDetail] = useState("");
  const [formSchedule, setFormSchedule] = useState("");

  const openCreate = () => {
    setFormTitle(""); setFormMessage(""); setFormType("promo"); setFormTarget("all");
    setFormTargetDetail("All users"); setFormSchedule(""); setModalType("create");
  };

  const sentCount = notifications.filter(n => n.status === "sent").length;
  const avgReadRate = notifications.filter(n => n.status === "sent" && n.readRate > 0).reduce((s, n) => s + n.readRate, 0) / (sentCount || 1);

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
    <div className="space-y-4" style={inter}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: String(sentCount), color: "text-emerald-400" },
          { label: "Scheduled", value: String(notifications.filter(n => n.status === "scheduled").length), color: "text-blue-400" },
          { label: "Avg Read Rate", value: `${avgReadRate.toFixed(1)}%`, color: "text-[#ff5222]" },
          { label: "Active Templates", value: String(templates.filter(t => t.enabled).length), color: "text-white" },
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
          {(["notifications", "templates"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
              {t === "notifications" ? "Sent & Scheduled" : "Auto Templates"}
            </button>
          ))}
        </div>
        {tab === "notifications" && (
          <button onClick={openCreate} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ New Notification</button>
        )}
      </div>

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 cursor-pointer hover:bg-[#111827]/80 transition-colors" onClick={() => { setSelectedNotif(n); setModalType("detail"); }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={n.status} />
                    <TypeBadge type={n.type} />
                    <span className="text-[#4b5563] text-[10px]">{n.target === "all" ? "All Users" : n.targetDetail}</span>
                  </div>
                  <p className="text-white text-[13px] mb-0.5" style={{ fontWeight: 500 }}>{n.title}</p>
                  <p className="text-[#6b7280] text-[11px] truncate">{n.message}</p>
                  <div className="flex gap-4 mt-1.5 text-[10px] text-[#4b5563]">
                    <span>{n.sentAt || "Not sent"}</span>
                    {n.status === "sent" && (
                      <>
                        <span>Read: <span className="text-emerald-400">{n.readRate}%</span></span>
                        <span>Click: <span className="text-blue-400">{n.clickRate}%</span></span>
                        <span>{n.recipients.toLocaleString()} recipients</span>
                      </>
                    )}
                  </div>
                </div>
                {n.status === "draft" && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedNotif(n); setModalType("send"); }} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors flex-shrink-0" style={{ fontWeight: 500 }}>Send Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {tab === "templates" && (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className={`bg-[#111827] border rounded-xl p-4 ${t.enabled ? "border-[#1f2937]" : "border-[#1f2937] opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-[13px]" style={{ fontWeight: 500 }}>{t.name}</p>
                    <TypeBadge type={t.type} />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.trigger === "auto" ? "bg-blue-500/15 text-blue-400" : "bg-gray-500/15 text-gray-400"}`} style={{ fontWeight: 500 }}>{t.trigger.toUpperCase()}</span>
                  </div>
                  <p className="text-[#6b7280] text-[11px]">Title: <span className="text-[#9ca3af]">{t.titleTemplate}</span></p>
                  <p className="text-[#6b7280] text-[11px]">Body: <span className="text-[#9ca3af]">{t.messageTemplate}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setTemplates(prev => prev.map(tp => tp.id === t.id ? { ...tp, enabled: !tp.enabled } : tp)); showOmsToast(`${t.name} ${t.enabled ? "disabled" : "enabled"}`); }}
                    className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${t.enabled ? "bg-[#ff5222]" : "bg-[#374151]"}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" style={{ marginLeft: t.enabled ? 18 : 2 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selectedNotif} onClose={() => setModalType(null)} title="Notification Detail" subtitle={selectedNotif?.id} width="max-w-[560px]">
        {selectedNotif && (
          <div className="space-y-4">
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-4">
              <p className="text-white text-[14px] mb-1" style={{ fontWeight: 600 }}>{selectedNotif.title}</p>
              <p className="text-[#9ca3af] text-[12px] leading-[1.6]">{selectedNotif.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Type", value: selectedNotif.type.replace("_", " ").toUpperCase() },
                { label: "Target", value: selectedNotif.targetDetail },
                { label: "Recipients", value: selectedNotif.recipients.toLocaleString() },
                { label: "Sent At", value: selectedNotif.sentAt || "Not sent" },
                ...(selectedNotif.status === "sent" ? [
                  { label: "Read Rate", value: `${selectedNotif.readRate}%` },
                  { label: "Click Rate", value: `${selectedNotif.clickRate}%` },
                ] : []),
                { label: "Created By", value: selectedNotif.createdBy },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
              {selectedNotif.status === "draft" && (
                <OmsBtn variant="primary" onClick={() => setModalType("send")}>Send Now</OmsBtn>
              )}
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Create Modal */}
      <OmsModal open={modalType === "create"} onClose={() => setModalType(null)} title="Create Notification">
        <div className="space-y-3">
          <OmsField label="Title" required>
            <OmsInput value={formTitle} onChange={setFormTitle} placeholder="e.g. PBA Finals Promo!" />
          </OmsField>
          <OmsField label="Message" required>
            <OmsTextarea value={formMessage} onChange={setFormMessage} placeholder="Notification body..." rows={3} />
          </OmsField>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Type" required>
              <OmsSelect value={formType} onChange={setFormType} options={[
                { value: "promo", label: "Promo" },
                { value: "system", label: "System" },
                { value: "market_update", label: "Market Update" },
                { value: "reward", label: "Reward" },
                { value: "leaderboard", label: "Leaderboard" },
              ]} />
            </OmsField>
            <OmsField label="Target Audience" required>
              <OmsSelect value={formTarget} onChange={v => { setFormTarget(v); setFormTargetDetail(v === "all" ? "All users" : ""); }} options={[
                { value: "all", label: "All Users" },
                { value: "segment", label: "User Segment" },
                { value: "individual", label: "Individual User" },
              ]} />
            </OmsField>
          </div>
          {formTarget !== "all" && (
            <OmsField label={formTarget === "segment" ? "Segment Description" : "User ID"}>
              <OmsInput value={formTargetDetail} onChange={setFormTargetDetail} placeholder={formTarget === "segment" ? "e.g. Basketball followers" : "e.g. U001"} />
            </OmsField>
          )}
          <OmsField label="Schedule (leave empty to save as draft)">
            <OmsInput value={formSchedule} onChange={setFormSchedule} type="datetime-local" />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="ghost" onClick={() => {
              if (!formTitle || !formMessage) { showOmsToast("Fill required fields", "error"); return; }
              setNotifications(prev => [...prev, {
                id: `NTF${String(prev.length + 1).padStart(3, "0")}`, type: formType as NotifType, title: formTitle,
                message: formMessage, target: formTarget as any, targetDetail: formTargetDetail || "All users",
                status: "draft" as const, sentAt: "", readRate: 0, clickRate: 0, recipients: 0, createdBy: "Carlos Reyes",
              }]);
              setModalType(null); showOmsToast("Notification saved as draft");
            }}>Save Draft</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!formTitle || !formMessage) { showOmsToast("Fill required fields", "error"); return; }
              const status = formSchedule ? "scheduled" as const : "sent" as const;
              setNotifications(prev => [...prev, {
                id: `NTF${String(prev.length + 1).padStart(3, "0")}`, type: formType as NotifType, title: formTitle,
                message: formMessage, target: formTarget as any, targetDetail: formTargetDetail || "All users",
                status, sentAt: formSchedule || "2026-03-13 09:55", readRate: 0, clickRate: 0,
                recipients: formTarget === "all" ? 485230 : 0, createdBy: "Carlos Reyes",
              }]);
              setModalType(null); showOmsToast(status === "scheduled" ? "Notification scheduled" : "Notification sent!");
            }}>{formSchedule ? "Schedule" : "Send Now"}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Send Draft Modal */}
      <OmsModal open={modalType === "send" && !!selectedNotif} onClose={() => setModalType(null)} title="Send Notification">
        <OmsConfirmContent icon="info" iconColor="#ff5222" iconBg="#ff5222" message={`Send "${selectedNotif?.title}" to ${selectedNotif?.targetDetail}?`} details={[
          { label: "Target", value: selectedNotif?.targetDetail || "" },
          { label: "Type", value: selectedNotif?.type.replace("_", " ").toUpperCase() || "" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="primary" onClick={() => {
            setNotifications(prev => prev.map(n => n.id === selectedNotif!.id ? { ...n, status: "sent" as const, sentAt: "2026-03-13 09:55", recipients: n.target === "all" ? 485230 : 1000 } : n));
            setModalType(null); showOmsToast(`"${selectedNotif!.title}" sent!`);
          }}>Send Now</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}