import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsTextarea, OmsSelect, OmsButtonRow, OmsBtn, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface Category { slug: string; name: string; emoji: string; markets: number; status: "active" | "hidden"; hot: boolean; order: number; }
interface BannerItem { id: string; title: string; placement: "homepage" | "markets" | "sidebar"; status: "active" | "scheduled" | "expired" | "draft"; startDate: string; endDate: string; impressions: number; clicks: number; ctr: string; targetUrl: string; }
interface PushNotification { id: string; title: string; message: string; audience: string; sentAt: string; recipients: number; opened: number; openRate: string; status: "sent" | "scheduled" | "draft"; }

const INITIAL_CATEGORIES: Category[] = [
  { slug: "basketball", name: "Basketball", emoji: "\u{1F3C0}", markets: 24, status: "active", hot: true, order: 1 },
  { slug: "color-game", name: "Color Game", emoji: "\u{1F3B2}", markets: 15, status: "active", hot: true, order: 2 },
  { slug: "boxing", name: "Boxing", emoji: "\u{1F94A}", markets: 8, status: "active", hot: true, order: 3 },
  { slug: "esports", name: "Esports", emoji: "\u{1F3AE}", markets: 18, status: "active", hot: false, order: 4 },
  { slug: "bingo", name: "Bingo", emoji: "\u{1F4AF}", markets: 6, status: "active", hot: false, order: 5 },
  { slug: "lottery", name: "Lottery", emoji: "\u{1F3B0}", markets: 12, status: "active", hot: false, order: 6 },
  { slug: "showbiz", name: "Showbiz", emoji: "\u2B50", markets: 9, status: "active", hot: false, order: 7 },
  { slug: "weather", name: "Weather", emoji: "\u{1F32A}", markets: 5, status: "active", hot: false, order: 8 },
  { slug: "economy", name: "Economy", emoji: "\u{1F4C8}", markets: 7, status: "active", hot: false, order: 9 },
];

const INITIAL_BANNERS: BannerItem[] = [
  { id: "BNR001", title: "March Madness Promo Banner", placement: "homepage", status: "active", startDate: "2026-03-01", endDate: "2026-03-31", impressions: 245000, clicks: 12250, ctr: "5.0%", targetUrl: "/rewards" },
  { id: "BNR002", title: "PBA Finals Hero Banner", placement: "homepage", status: "active", startDate: "2026-03-10", endDate: "2026-03-20", impressions: 180000, clicks: 14400, ctr: "8.0%", targetUrl: "/market/pba-finals" },
  { id: "BNR003", title: "Fast Bet Feature Spotlight", placement: "markets", status: "active", startDate: "2026-03-01", endDate: "2026-04-30", impressions: 98000, clicks: 5880, ctr: "6.0%", targetUrl: "/fast-bet" },
  { id: "BNR004", title: "Summer Promo Teaser", placement: "homepage", status: "scheduled", startDate: "2026-04-01", endDate: "2026-05-31", impressions: 0, clicks: 0, ctr: "-", targetUrl: "/rewards" },
  { id: "BNR005", title: "Valentine's Promo", placement: "homepage", status: "expired", startDate: "2026-02-10", endDate: "2026-02-16", impressions: 320000, clicks: 22400, ctr: "7.0%", targetUrl: "/rewards" },
];

const INITIAL_PUSH: PushNotification[] = [
  { id: "PUSH001", title: "PBA Finals LIVE!", message: "Ginebra vs San Miguel na! Tumaya na bago mag-start.", audience: "All Users", sentAt: "2026-03-13 07:00 PHT", recipients: 485230, opened: 145569, openRate: "30%", status: "sent" },
  { id: "PUSH002", title: "Claim Your Winnings!", message: "PCSO 6/58 resolved na. Check your portfolio!", audience: "Market Participants", sentAt: "2026-03-13 06:00 PHT", recipients: 2340, opened: 1872, openRate: "80%", status: "sent" },
  { id: "PUSH003", title: "Weekend Promo", message: "Double cashback this weekend! Mag-bet na.", audience: "Active Users", sentAt: "2026-03-14 08:00 PHT", recipients: 0, opened: 0, openRate: "-", status: "scheduled" },
  { id: "PUSH004", title: "Maintenance Notice", message: "Scheduled maintenance on March 15, 2-4 AM PHT.", audience: "All Users", sentAt: "", recipients: 0, opened: 0, openRate: "-", status: "draft" },
];

function StsBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", hidden: "bg-gray-500/15 text-gray-400", scheduled: "bg-blue-500/15 text-blue-400", expired: "bg-gray-500/15 text-gray-400", draft: "bg-purple-500/15 text-purple-400", sent: "bg-emerald-500/15 text-emerald-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsContent() {
  const [tab, setTab] = useState<"categories" | "banners" | "notifications">("categories");
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [pushNotifs, setPushNotifs] = useState(INITIAL_PUSH);

  // Category modals
  const [catCreateOpen, setCatCreateOpen] = useState(false);
  const [catEditTarget, setCatEditTarget] = useState<Category | null>(null);
  const [catToggleTarget, setCatToggleTarget] = useState<Category | null>(null);
  const [ccName, setCcName] = useState(""); const [ccSlug, setCcSlug] = useState(""); const [ccEmoji, setCcEmoji] = useState(""); const [ccHot, setCcHot] = useState("false");
  const [ceName, setCeName] = useState(""); const [ceSlug, setCeSlug] = useState(""); const [ceEmoji, setCeEmoji] = useState(""); const [ceHot, setCeHot] = useState("false");

  // Banner modals
  const [bnrCreateOpen, setBnrCreateOpen] = useState(false);
  const [bnrEditTarget, setBnrEditTarget] = useState<BannerItem | null>(null);
  const [bcTitle, setBcTitle] = useState(""); const [bcPlace, setBcPlace] = useState("homepage"); const [bcStart, setBcStart] = useState(""); const [bcEnd, setBcEnd] = useState(""); const [bcUrl, setBcUrl] = useState("");
  const [beTitle, setBeTitle] = useState(""); const [bePlace, setBePlace] = useState("homepage"); const [beStart, setBeStart] = useState(""); const [beEnd, setBeEnd] = useState(""); const [beUrl, setBeUrl] = useState("");

  // Push modals
  const [pushCreateOpen, setPushCreateOpen] = useState(false);
  const [pushEditTarget, setPushEditTarget] = useState<PushNotification | null>(null);
  const [pushSendTarget, setPushSendTarget] = useState<PushNotification | null>(null);
  const [pcTitle, setPcTitle] = useState(""); const [pcMsg, setPcMsg] = useState(""); const [pcAud, setPcAud] = useState("All Users");
  const [peTitle, setPeTitle] = useState(""); const [peMsg, setPeMsg] = useState(""); const [peAud, setPeAud] = useState("All Users");

  /* ===== CATEGORY HANDLERS ===== */
  const handleCatCreate = () => {
    if (!ccName.trim()) return;
    const slug = ccSlug || ccName.toLowerCase().replace(/\s+/g, "-");
    setCategories([...categories, { slug, name: ccName, emoji: ccEmoji || "📌", markets: 0, status: "active", hot: ccHot === "true", order: categories.length + 1 }]);
    setCatCreateOpen(false); setCcName(""); setCcSlug(""); setCcEmoji(""); setCcHot("false");
    showOmsToast(`Category "${ccName}" created`);
  };
  const openCatEdit = (c: Category) => { setCeName(c.name); setCeSlug(c.slug); setCeEmoji(c.emoji); setCeHot(c.hot ? "true" : "false"); setCatEditTarget(c); };
  const handleCatEdit = () => {
    if (!catEditTarget) return;
    setCategories(categories.map(c => c.slug === catEditTarget.slug ? { ...c, name: ceName, slug: ceSlug || c.slug, emoji: ceEmoji, hot: ceHot === "true" } : c));
    setCatEditTarget(null);
    showOmsToast(`Category "${ceName}" updated`);
  };
  const handleCatToggle = () => {
    if (!catToggleTarget) return;
    const newStatus = catToggleTarget.status === "active" ? "hidden" : "active";
    setCategories(categories.map(c => c.slug === catToggleTarget.slug ? { ...c, status: newStatus as any } : c));
    setCatToggleTarget(null);
    showOmsToast(`Category "${catToggleTarget.name}" ${newStatus === "hidden" ? "hidden" : "visible"}`, newStatus === "hidden" ? "info" : "success");
  };

  /* ===== BANNER HANDLERS ===== */
  const nextBnrId = `BNR${String(banners.length + 1).padStart(3, "0")}`;
  const handleBnrCreate = () => {
    if (!bcTitle.trim() || !bcStart || !bcEnd) return;
    setBanners([...banners, { id: nextBnrId, title: bcTitle, placement: bcPlace as any, status: "draft", startDate: bcStart, endDate: bcEnd, impressions: 0, clicks: 0, ctr: "-", targetUrl: bcUrl || "/" }]);
    setBnrCreateOpen(false); setBcTitle(""); setBcPlace("homepage"); setBcStart(""); setBcEnd(""); setBcUrl("");
    showOmsToast(`Banner ${nextBnrId} created as draft`);
  };
  const openBnrEdit = (b: BannerItem) => { setBeTitle(b.title); setBePlace(b.placement); setBeStart(b.startDate); setBeEnd(b.endDate); setBeUrl(b.targetUrl); setBnrEditTarget(b); };
  const handleBnrEdit = () => {
    if (!bnrEditTarget) return;
    setBanners(banners.map(b => b.id === bnrEditTarget.id ? { ...b, title: beTitle, placement: bePlace as any, startDate: beStart, endDate: beEnd, targetUrl: beUrl } : b));
    setBnrEditTarget(null);
    showOmsToast(`Banner ${bnrEditTarget.id} updated`);
  };

  /* ===== PUSH HANDLERS ===== */
  const nextPushId = `PUSH${String(pushNotifs.length + 1).padStart(3, "0")}`;
  const handlePushCreate = () => {
    if (!pcTitle.trim() || !pcMsg.trim()) return;
    setPushNotifs([...pushNotifs, { id: nextPushId, title: pcTitle, message: pcMsg, audience: pcAud, sentAt: "", recipients: 0, opened: 0, openRate: "-", status: "draft" }]);
    setPushCreateOpen(false); setPcTitle(""); setPcMsg(""); setPcAud("All Users");
    showOmsToast(`Push notification ${nextPushId} saved as draft`);
  };
  const openPushEdit = (n: PushNotification) => { setPeTitle(n.title); setPeMsg(n.message); setPeAud(n.audience); setPushEditTarget(n); };
  const handlePushEdit = () => {
    if (!pushEditTarget) return;
    setPushNotifs(pushNotifs.map(n => n.id === pushEditTarget.id ? { ...n, title: peTitle, message: peMsg, audience: peAud } : n));
    setPushEditTarget(null);
    showOmsToast(`Push ${pushEditTarget.id} updated`);
  };
  const handlePushSend = () => {
    if (!pushSendTarget) return;
    const recipients = pushSendTarget.audience === "All Users" ? 485230 : pushSendTarget.audience === "Active Users" ? 285000 : 12000;
    setPushNotifs(pushNotifs.map(n => n.id === pushSendTarget.id ? { ...n, status: "sent" as any, sentAt: "2026-03-13 09:00 PHT", recipients, opened: 0, openRate: "0%" } : n));
    setPushSendTarget(null);
    showOmsToast(`Push notification sent to ${recipients.toLocaleString()} users`);
  };

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
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit">
        {(["categories", "banners", "notifications"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "categories" ? "Categories" : t === "banners" ? "Banners" : "Push Notifications"}
          </button>
        ))}
      </div>

      {/* ===== CATEGORIES TAB ===== */}
      {tab === "categories" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Categories ({categories.length})</h3>
            <button onClick={() => setCatCreateOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f]" style={{ fontWeight: 600 }}>+ Add Category</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1f2937]">{["Order", "Category", "Slug", "Markets", "Hot", "Status", "Actions"].map(h => <th key={h} className="text-[#6b7280] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.slug} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-4 py-2.5 text-[#6b7280] text-[12px]">{c.order}</td>
                    <td className="px-4 py-2.5"><span className="text-white text-[12px] inline-flex items-center gap-2" style={{ fontWeight: 500 }}><span className="text-[16px]">{c.emoji}</span> {c.name}</span></td>
                    <td className="px-4 py-2.5 text-[#6b7280] text-[11px] font-mono">/category/{c.slug}</td>
                    <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>{c.markets}</td>
                    <td className="px-4 py-2.5">{c.hot ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff5222]/15 text-[#ff5222]" style={{ fontWeight: 600 }}>HOT</span> : <span className="text-[#4b5563] text-[11px]">-</span>}</td>
                    <td className="px-4 py-2.5"><StsBadge status={c.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openCatEdit(c)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>Edit</button>
                        <button onClick={() => setCatToggleTarget(c)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>{c.status === "active" ? "Hide" : "Show"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== BANNERS TAB ===== */}
      {tab === "banners" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Banners ({banners.length})</h3>
            <button onClick={() => setBnrCreateOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f]" style={{ fontWeight: 600 }}>+ New Banner</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b border-[#1f2937]">{["ID", "Title", "Placement", "Status", "Period", "Impressions", "Clicks", "CTR", "Actions"].map(h => <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {banners.map(b => (
                  <tr key={b.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{b.id}</td>
                    <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 500 }}>{b.title}</td>
                    <td className="px-3 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1f2937] text-[#9ca3af]" style={{ fontWeight: 500 }}>{b.placement}</span></td>
                    <td className="px-3 py-2.5"><StsBadge status={b.status} /></td>
                    <td className="px-3 py-2.5 text-[#6b7280] text-[10px]">{b.startDate} — {b.endDate}</td>
                    <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>{b.impressions.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-[#9ca3af] text-[12px]">{b.clicks.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-emerald-400 text-[12px]" style={{ fontWeight: 600 }}>{b.ctr}</td>
                    <td className="px-3 py-2.5"><button onClick={() => openBnrEdit(b)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PUSH NOTIFICATIONS TAB ===== */}
      {tab === "notifications" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Push Notifications</h3>
            <button onClick={() => setPushCreateOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f]" style={{ fontWeight: 600 }}>+ New Push</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b border-[#1f2937]">{["ID", "Title", "Audience", "Status", "Recipients", "Opened", "Open Rate", "Sent At", "Actions"].map(h => <th key={h} className="text-[#6b7280] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {pushNotifs.map(n => (
                  <tr key={n.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-3 py-2.5 text-[#6b7280] text-[11px]">{n.id}</td>
                    <td className="px-3 py-2.5"><div><p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{n.title}</p><p className="text-[#6b7280] text-[10px] max-w-[250px] truncate">{n.message}</p></div></td>
                    <td className="px-3 py-2.5 text-[#9ca3af] text-[11px]">{n.audience}</td>
                    <td className="px-3 py-2.5"><StsBadge status={n.status} /></td>
                    <td className="px-3 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>{n.recipients > 0 ? n.recipients.toLocaleString() : "-"}</td>
                    <td className="px-3 py-2.5 text-[#9ca3af] text-[12px]">{n.opened > 0 ? n.opened.toLocaleString() : "-"}</td>
                    <td className="px-3 py-2.5 text-emerald-400 text-[12px]" style={{ fontWeight: 600 }}>{n.openRate}</td>
                    <td className="px-3 py-2.5 text-[#6b7280] text-[10px]">{n.sentAt || "-"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {(n.status === "draft" || n.status === "scheduled") && (
                          <button onClick={() => setPushSendTarget(n)} className="h-6 px-2 bg-[#ff5222]/15 text-[#ff5222] text-[10px] rounded cursor-pointer hover:bg-[#ff5222]/25" style={{ fontWeight: 600 }}>Send</button>
                        )}
                        {n.status !== "sent" && (
                          <button onClick={() => openPushEdit(n)} className="h-6 px-2 bg-[#1f2937] text-[#9ca3af] text-[10px] rounded cursor-pointer hover:bg-[#374151]" style={{ fontWeight: 600 }}>Edit</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== CATEGORY CREATE MODAL ========== */}
      <OmsModal open={catCreateOpen} onClose={() => setCatCreateOpen(false)} title="Add Category">
        <OmsField label="Category Name" required><OmsInput value={ccName} onChange={setCcName} placeholder="e.g. Volleyball" /></OmsField>
        <OmsField label="URL Slug"><OmsInput value={ccSlug} onChange={setCcSlug} placeholder="auto-generated from name" /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Emoji"><OmsInput value={ccEmoji} onChange={setCcEmoji} placeholder="e.g. \u{1F3D0}" /></OmsField>
          <OmsField label="Hot Tag"><OmsSelect value={ccHot} onChange={setCcHot} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} /></OmsField>
        </div>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setCatCreateOpen(false)}>Cancel</OmsBtn><OmsBtn onClick={handleCatCreate} disabled={!ccName.trim()} fullWidth>Add Category</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== CATEGORY EDIT MODAL ========== */}
      <OmsModal open={!!catEditTarget} onClose={() => setCatEditTarget(null)} title="Edit Category" subtitle={catEditTarget ? `/category/${catEditTarget.slug}` : ""}>
        <OmsField label="Category Name" required><OmsInput value={ceName} onChange={setCeName} /></OmsField>
        <OmsField label="URL Slug"><OmsInput value={ceSlug} onChange={setCeSlug} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Emoji"><OmsInput value={ceEmoji} onChange={setCeEmoji} /></OmsField>
          <OmsField label="Hot Tag"><OmsSelect value={ceHot} onChange={setCeHot} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} /></OmsField>
        </div>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setCatEditTarget(null)}>Cancel</OmsBtn><OmsBtn onClick={handleCatEdit} fullWidth>Save Changes</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== CATEGORY TOGGLE MODAL ========== */}
      <OmsModal open={!!catToggleTarget} onClose={() => setCatToggleTarget(null)} title={catToggleTarget?.status === "active" ? "Hide Category" : "Show Category"}>
        <OmsConfirmContent
          icon={catToggleTarget?.status === "active" ? "warning" : "success"}
          iconColor={catToggleTarget?.status === "active" ? "#f59e0b" : "#10b981"}
          iconBg={catToggleTarget?.status === "active" ? "#f59e0b" : "#10b981"}
          message={catToggleTarget?.status === "active" ? `Hide "${catToggleTarget?.name}"? It will be removed from navigation and category listing.` : `Show "${catToggleTarget?.name}"? It will be visible in navigation and category listing.`}
          details={[{ label: "Category", value: `${catToggleTarget?.emoji} ${catToggleTarget?.name}` }, { label: "Active Markets", value: catToggleTarget?.markets.toString() || "0" }]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setCatToggleTarget(null)}>Cancel</OmsBtn>
          <OmsBtn variant={catToggleTarget?.status === "active" ? "primary" : "success"} onClick={handleCatToggle} fullWidth>
            {catToggleTarget?.status === "active" ? "Hide Category" : "Show Category"}
          </OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ========== BANNER CREATE MODAL ========== */}
      <OmsModal open={bnrCreateOpen} onClose={() => setBnrCreateOpen(false)} title="New Banner" subtitle={`ID: ${nextBnrId}`}>
        <OmsField label="Banner Title" required><OmsInput value={bcTitle} onChange={setBcTitle} placeholder="e.g. Summer Promo Hero Banner" /></OmsField>
        <OmsField label="Placement" required><OmsSelect value={bcPlace} onChange={setBcPlace} options={[{ value: "homepage", label: "Homepage" }, { value: "markets", label: "Markets" }, { value: "sidebar", label: "Sidebar" }]} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date" required><OmsInput type="date" value={bcStart} onChange={setBcStart} /></OmsField>
          <OmsField label="End Date" required><OmsInput type="date" value={bcEnd} onChange={setBcEnd} /></OmsField>
        </div>
        <OmsField label="Target URL"><OmsInput value={bcUrl} onChange={setBcUrl} placeholder="e.g. /rewards" /></OmsField>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setBnrCreateOpen(false)}>Cancel</OmsBtn><OmsBtn onClick={handleBnrCreate} disabled={!bcTitle.trim() || !bcStart || !bcEnd} fullWidth>Create Banner</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== BANNER EDIT MODAL ========== */}
      <OmsModal open={!!bnrEditTarget} onClose={() => setBnrEditTarget(null)} title="Edit Banner" subtitle={bnrEditTarget?.id}>
        <OmsField label="Banner Title" required><OmsInput value={beTitle} onChange={setBeTitle} /></OmsField>
        <OmsField label="Placement" required><OmsSelect value={bePlace} onChange={setBePlace} options={[{ value: "homepage", label: "Homepage" }, { value: "markets", label: "Markets" }, { value: "sidebar", label: "Sidebar" }]} /></OmsField>
        <div className="grid grid-cols-2 gap-3">
          <OmsField label="Start Date"><OmsInput type="date" value={beStart} onChange={setBeStart} /></OmsField>
          <OmsField label="End Date"><OmsInput type="date" value={beEnd} onChange={setBeEnd} /></OmsField>
        </div>
        <OmsField label="Target URL"><OmsInput value={beUrl} onChange={setBeUrl} /></OmsField>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setBnrEditTarget(null)}>Cancel</OmsBtn><OmsBtn onClick={handleBnrEdit} fullWidth>Save Changes</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== PUSH CREATE MODAL ========== */}
      <OmsModal open={pushCreateOpen} onClose={() => setPushCreateOpen(false)} title="New Push Notification" subtitle={`ID: ${nextPushId}`}>
        <OmsField label="Title" required><OmsInput value={pcTitle} onChange={setPcTitle} placeholder="e.g. Weekend Promo Alert" /></OmsField>
        <OmsField label="Message" required><OmsTextarea value={pcMsg} onChange={setPcMsg} placeholder="Notification message body..." /></OmsField>
        <OmsField label="Target Audience" required><OmsSelect value={pcAud} onChange={setPcAud} options={[{ value: "All Users", label: "All Users (485K)" }, { value: "Active Users", label: "Active Users (285K)" }, { value: "Market Participants", label: "Market Participants" }, { value: "New Users", label: "New Users (This Week)" }]} /></OmsField>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setPushCreateOpen(false)}>Cancel</OmsBtn><OmsBtn onClick={handlePushCreate} disabled={!pcTitle.trim() || !pcMsg.trim()} fullWidth>Save as Draft</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== PUSH EDIT MODAL ========== */}
      <OmsModal open={!!pushEditTarget} onClose={() => setPushEditTarget(null)} title="Edit Push Notification" subtitle={pushEditTarget?.id}>
        <OmsField label="Title" required><OmsInput value={peTitle} onChange={setPeTitle} /></OmsField>
        <OmsField label="Message" required><OmsTextarea value={peMsg} onChange={setPeMsg} /></OmsField>
        <OmsField label="Target Audience" required><OmsSelect value={peAud} onChange={setPeAud} options={[{ value: "All Users", label: "All Users (485K)" }, { value: "Active Users", label: "Active Users (285K)" }, { value: "Market Participants", label: "Market Participants" }, { value: "New Users", label: "New Users (This Week)" }]} /></OmsField>
        <OmsButtonRow><OmsBtn variant="secondary" onClick={() => setPushEditTarget(null)}>Cancel</OmsBtn><OmsBtn onClick={handlePushEdit} fullWidth>Save Changes</OmsBtn></OmsButtonRow>
      </OmsModal>

      {/* ========== PUSH SEND CONFIRM MODAL ========== */}
      <OmsModal open={!!pushSendTarget} onClose={() => setPushSendTarget(null)} title="Send Push Notification">
        <OmsConfirmContent icon="warning" iconColor="#ff5222" iconBg="#ff5222"
          message={`Send "${pushSendTarget?.title}" to ${pushSendTarget?.audience}? This action cannot be undone.`}
          details={[
            { label: "Title", value: pushSendTarget?.title || "" },
            { label: "Audience", value: pushSendTarget?.audience || "" },
            { label: "Est. Recipients", value: pushSendTarget?.audience === "All Users" ? "485,230" : pushSendTarget?.audience === "Active Users" ? "285,000" : "~12,000" },
          ]}
        />
        <div className="mt-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
          <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>Message Preview:</p>
          <p className="text-white text-[12px]">{pushSendTarget?.message}</p>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setPushSendTarget(null)}>Cancel</OmsBtn>
          <OmsBtn onClick={handlePushSend} fullWidth>Send Now</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}