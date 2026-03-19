import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { DepositWithdrawModal } from "../components/deposit-withdraw-modal";
import { EmojiIcon } from "../components/two-tone-icons";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const LIGHT_THEME = {
  bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
  text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
  inputBg: "#fafafa", inputBorder: "#f5f6f7",
  greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
  isDark: false,
};

type NotifCategory = "all" | "order" | "security" | "reward" | "system";

interface NotificationItem {
  id: string;
  category: Exclude<NotifCategory, "all">;
  title: string;
  message: string;
  time: string;
  timeAgo: string;
  read: boolean;
}

const CATEGORY_META: Record<Exclude<NotifCategory, "all">, { label: string; emoji: string; color: string; bg: string }> = {
  order: { label: "Order", emoji: "📋", color: "#3b82f6", bg: "#eef4ff" },
  security: { label: "Security", emoji: "🔒", color: "#ef4444", bg: "#fef2f2" },
  reward: { label: "Reward", emoji: "🎁", color: "#ff5222", bg: "#fff4ed" },
  system: { label: "System", emoji: "⚙️", color: "#8b5cf6", bg: "#f3f0ff" },
};

const ALL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", category: "order", title: "Taya Confirmed", message: "Ang taya mo sa PBA Philippine Cup Finals — Ginebra (₱5,000) ay nai-confirm na. Tingnan ang market para sa live odds updates.", time: "Mar 13, 2026 10:30 AM", timeAgo: "2 min ago", read: false },
  { id: "n2", category: "order", title: "Market Resolved — Panalo Ka!", message: "Ang PCSO 6/58 market ay na-resolve na. Panalo ka ng ₱7,600! I-claim na ang winnings mo sa Portfolio page.", time: "Mar 13, 2026 10:17 AM", timeAgo: "15 min ago", read: false },
  { id: "n3", category: "security", title: "Bagong Login Detected", message: "May nag-login sa account mo gamit ang Chrome sa Makati City, Philippines. IP: 203.177.XX.XX. Kung hindi ikaw ito, palitan agad ang password mo at i-enable ang 2FA.", time: "Mar 13, 2026 9:32 AM", timeAgo: "1 oras ago", read: false },
  { id: "n4", category: "reward", title: "Weekly Task Complete!", message: "Na-complete mo na ang PBA Weekly Challenge — 5 correct predictions! I-claim ang ₱100 bonus mo sa Rewards page bago mag-expire sa March 20.", time: "Mar 13, 2026 8:30 AM", timeAgo: "2 oras ago", read: false },
  { id: "n5", category: "reward", title: "Referral Bonus Received!", message: "Si @maria_santos ay nag-sign up gamit ang referral link mo at nag-deposit ng ₱1,000. Parehong may ₱100 bonus! Total referral earnings mo: ₱2,400.", time: "Mar 13, 2026 7:30 AM", timeAgo: "3 oras ago", read: true },
  { id: "n6", category: "system", title: "Scheduled Maintenance", message: "Magkakaroon ng scheduled maintenance sa March 15, 2026 (2:00 AM - 4:00 AM PHT) para sa server upgrades. I-save ang mga pending bets mo bago ito. Maa-apektuhan ang deposit at withdrawal sa panahong ito.", time: "Mar 13, 2026 5:30 AM", timeAgo: "5 oras ago", read: true },
  { id: "n7", category: "order", title: "Taya Matched sa Limit Order", message: "Ang limit order mo sa Boxing: Donaire vs Inoue III ay na-match na sa ₱0.280 (500 shares). Tingnan ang position mo sa Portfolio.", time: "Mar 13, 2026 4:30 AM", timeAgo: "6 oras ago", read: true },
  { id: "n8", category: "system", title: "Bagong Feature: Fast Bet Module!", message: "Subukan ang bagong Fast Bet module — mas mabilis na betting experience para sa Color Game, Bingo, at iba pa. Available na sa sidebar o i-visit ang /fast-bet.", time: "Mar 12, 2026 10:00 AM", timeAgo: "1 araw ago", read: true },
  { id: "n9", category: "security", title: "2FA Successfully Enabled", message: "Na-enable mo na ang Two-Factor Authentication gamit ang authenticator app. Mas secure na ang account mo! I-save ang backup codes mo sa safe na lugar.", time: "Mar 11, 2026 3:00 PM", timeAgo: "2 araw ago", read: true },
  { id: "n10", category: "reward", title: "Sign Up Bonus Claimed", message: "Na-claim mo na ang ₱300 Sign Up Bonus. Naka-credit na sa balance mo. Simulan na ang taya mo — tingnan ang mga hot markets ngayon!", time: "Mar 10, 2026 9:00 AM", timeAgo: "3 araw ago", read: true },
  { id: "n11", category: "order", title: "Deposit Successful", message: "Ang deposit mo na ₱5,000 via GCash ay matagumpay na na-process. Bagong balance: ₱12,450.00. Ref: FG-X8K2M4.", time: "Mar 10, 2026 8:45 AM", timeAgo: "3 araw ago", read: true },
  { id: "n12", category: "reward", title: "Tier Upgrade: Patok na Patok!", message: "Nag-level up ka sa Tier 2 — Patok na Patok! Enjoy ng 10% commission boost, priority withdrawals, at exclusive market access. Tingnan ang Rewards page.", time: "Mar 9, 2026 2:00 PM", timeAgo: "4 araw ago", read: true },
  { id: "n13", category: "system", title: "Bagong Category: Economy Markets", message: "Available na ang Economy prediction markets! I-predict ang USD/PHP exchange rate, inflation, at iba pa. Tingnan sa /category/economy.", time: "Mar 8, 2026 10:00 AM", timeAgo: "5 araw ago", read: true },
  { id: "n14", category: "order", title: "Withdrawal Processed", message: "Ang withdrawal mo na ₱3,000 via Maya ay nai-process na at nai-send sa 09171234567. Expected arrival: within 5 minutes.", time: "Mar 7, 2026 4:30 PM", timeAgo: "6 araw ago", read: true },
  { id: "n15", category: "security", title: "Password Changed", message: "Ang password mo ay matagumpay na na-update. Kung hindi ikaw ang gumawa nito, kontakin agad ang support team sa support@luckytaya.ph.", time: "Mar 6, 2026 11:00 AM", timeAgo: "1 linggo ago", read: true },
  { id: "n16", category: "reward", title: "Daily Login Streak: 7 Days!", message: "Congratulations! Na-reach mo ang 7-day login streak. May ₱50 bonus ka! Ituloy ang streak para sa mas malaking rewards — 14 days = ₱150!", time: "Mar 5, 2026 9:00 AM", timeAgo: "1 linggo ago", read: true },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  const [filter, setFilter] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState("");

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications
    .filter(n => filter === "all" || n.category === filter)
    .filter(n => searchTerm === "" || n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase()));

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filterCategories: { key: NotifCategory; label: string; emoji?: string }[] = [
    { key: "all", label: "Lahat" },
    { key: "order", label: "Orders", emoji: "📋" },
    { key: "security", label: "Security", emoji: "🔒" },
    { key: "reward", label: "Rewards", emoji: "🎁" },
    { key: "system", label: "System", emoji: "⚙️" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <AuthGate pageName="Notifications" strict>
        <div className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="max-w-[800px] mx-auto px-3 sm:px-6 py-4 sm:py-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="size-9 rounded-lg bg-white border border-[#f0f1f3] flex items-center justify-center cursor-pointer hover:bg-[#f5f6f7] transition-colors shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="#070808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div>
                  <h1 className="text-[20px] sm:text-[24px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>
                    Notifications
                  </h1>
                  <p className="text-[12px] text-[#84888c]" style={ss}>
                    {unreadCount > 0 ? `${unreadCount} bagong notification` : "Wala kang bagong notification"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[12px] text-[#ff5222] cursor-pointer hover:underline shrink-0 self-start sm:self-auto" style={{ fontWeight: 500, ...ss }}>
                  Basahin Lahat ({unreadCount})
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <EmojiIcon emoji="🔍" size={14} />
              </div>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Hanapin ang notification..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-[#f0f1f3] text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 transition-colors"
                style={ss}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-5 pb-0.5">
              {filterCategories.map(cat => {
                const count = cat.key === "all"
                  ? notifications.filter(n => !n.read).length
                  : notifications.filter(n => n.category === cat.key && !n.read).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFilter(cat.key)}
                    className="shrink-0 h-8 px-3 rounded-full text-[12px] cursor-pointer transition-all flex items-center gap-1.5"
                    style={{
                      background: filter === cat.key ? "#070808" : "#fff",
                      color: filter === cat.key ? "#fff" : "#84888c",
                      border: `1px solid ${filter === cat.key ? "#070808" : "#f0f1f3"}`,
                      fontWeight: filter === cat.key ? 600 : 400, ...ss,
                    }}
                  >
                    {cat.emoji && <EmojiIcon emoji={cat.emoji} size={13} />}
                    {cat.label}
                    {count > 0 && (
                      <span
                        className="text-[9px] size-4 rounded-full flex items-center justify-center leading-none"
                        style={{
                          background: filter === cat.key ? "#ff5222" : "rgba(255,82,34,0.1)",
                          color: filter === cat.key ? "#fff" : "#ff5222",
                          fontWeight: 600,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notification List */}
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <EmojiIcon emoji="🔔" size={40} />
                  <span className="text-[14px] text-[#a0a3a7]" style={ss}>
                    {searchTerm ? "Walang nahanap na notification." : "Walang notification sa category na ito."}
                  </span>
                </div>
              ) : (
                filtered.map(n => {
                  const meta = CATEGORY_META[n.category];
                  return (
                    <div
                      key={n.id}
                      className="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-sm group"
                      style={{
                        borderColor: n.read ? "#f0f1f3" : "rgba(255,82,34,0.15)",
                        background: n.read ? "#fff" : "rgba(255,82,34,0.02)",
                      }}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Icon */}
                        <div className="size-10 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: meta.bg }}>
                          <EmojiIcon emoji={meta.emoji} size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[14px] truncate" style={{ color: "#070808", fontWeight: n.read ? 500 : 600, ...ss }}>{n.title}</span>
                              {!n.read && <div className="size-2 rounded-full bg-[#ff5222] shrink-0" />}
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="size-7 rounded-md flex items-center justify-center hover:bg-[#f5f6f7] cursor-pointer transition-colors"
                                  title="Markahan bilang nabasa"
                                >
                                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="#84888c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="size-7 rounded-md flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer transition-colors"
                                title="I-delete"
                              >
                                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-[12px] leading-[1.6] mb-2" style={{ color: "#84888c", ...ss }}>{n.message}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: meta.bg, color: meta.color, fontWeight: 500, ...ss }}>{meta.label}</span>
                            <span className="text-[10px] text-[#a0a3a7]" style={ss}>{n.timeAgo}</span>
                            <span className="text-[10px] text-[#dfe0e2]">•</span>
                            <span className="text-[10px] text-[#a0a3a7]" style={ss}>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center py-8">
              <span className="text-[11px] text-[#a0a3a7]" style={ss}>
                {filtered.length} notification{filtered.length !== 1 ? "s" : ""} ang naka-display
              </span>
            </div>
          </div>
          <Footer />
        </div>
        </AuthGate>
      </div>

      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode={modalMode} theme={LIGHT_THEME} balance={23450} />
    </div>
  );
}