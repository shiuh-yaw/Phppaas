import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { BellIcon, GlobeIcon } from "./icons";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "./auth-context";
import { EmojiIcon } from "./two-tone-icons";
import { useT } from "../i18n/useT";

const ss04 = { fontFeatureSettings: "'ss04'" };
const pp = { fontFamily: "'Poppins', sans-serif" };

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";

/* ==================== NOTIFICATIONS DATA ==================== */
type NotifCategory = "order" | "security" | "reward" | "system";

interface NotificationItem {
  id: string;
  category: NotifCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const CATEGORY_META: Record<NotifCategory, { label: string; emoji: string; color: string; bg: string }> = {
  order: { label: "Order", emoji: "📋", color: "#3b82f6", bg: "#eef4ff" },
  security: { label: "Security", emoji: "🔒", color: "#ef4444", bg: "#fef2f2" },
  reward: { label: "Reward", emoji: "🎁", color: "#ff5222", bg: "#fff4ed" },
  system: { label: "System", emoji: "⚙️", color: "#8b5cf6", bg: "#f3f0ff" },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", category: "order", title: "Taya Confirmed", message: "Ang taya mo sa PBA Philippine Cup Finals — Ginebra (₱5,000) ay nai-confirm na.", time: "2 min ago", read: false },
  { id: "n2", category: "order", title: "Market Resolved", message: "Ang PCSO 6/58 market ay na-resolve na. Panalo ka ng ₱7,600! I-claim na ang winnings mo.", time: "15 min ago", read: false },
  { id: "n3", category: "security", title: "Bagong Login Detected", message: "May nag-login sa account mo gamit ang Chrome sa Makati City. Kung hindi ikaw ito, palitan ang password mo.", time: "1 oras ago", read: false },
  { id: "n4", category: "reward", title: "Weekly Task Complete!", message: "Na-complete mo na ang PBA Weekly Challenge! I-claim ang ₱100 bonus mo sa Rewards page.", time: "2 oras ago", read: false },
  { id: "n5", category: "reward", title: "Referral Bonus", message: "Si @maria_santos ay nag-sign up gamit ang referral link mo. Parehong may ₱100 bonus!", time: "3 oras ago", read: true },
  { id: "n6", category: "system", title: "Scheduled Maintenance", message: "Magkakaroon ng scheduled maintenance sa March 15, 2026 (2:00 AM - 4:00 AM PHT). I-save ang mga bets mo.", time: "5 oras ago", read: true },
  { id: "n7", category: "order", title: "Taya Matched", message: "Ang limit order mo sa Boxing: Donaire vs Inoue III ay na-match na sa ₱0.280.", time: "6 oras ago", read: true },
  { id: "n8", category: "system", title: "Bagong Feature: Fast Bet", message: "Subukan ang bagong Fast Bet module! Mas mabilis na betting experience para sa Color Game at iba pa.", time: "1 araw ago", read: true },
  { id: "n9", category: "security", title: "2FA Enabled", message: "Na-enable mo na ang Two-Factor Authentication. Mas secure na ang account mo!", time: "2 araw ago", read: true },
  { id: "n10", category: "reward", title: "Sign Up Bonus Claimed", message: "Na-claim mo na ang ₱300 Sign Up Bonus. Simulan mo na ang taya mo!", time: "3 araw ago", read: true },
];

/* ==================== NOTIFICATION DROPDOWN (standalone) ==================== */
function NotificationPanel({
  notifications,
  notifFilter,
  setNotifFilter,
  markAsRead,
  markAllRead,
  onViewAll,
}: {
  notifications: NotificationItem[];
  notifFilter: "all" | NotifCategory;
  setNotifFilter: (f: "all" | NotifCategory) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  onViewAll: () => void;
}) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifs = notifFilter === "all" ? notifications : notifications.filter(n => n.category === notifFilter);

  return (
    <div
      className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-[#f0f1f3] shadow-xl overflow-hidden z-[100]"
      style={{
        animation: "notif-in 0.18s ease-out",
        width: "min(400px, calc(100vw - 24px))",
        maxHeight: "min(540px, calc(100vh - 80px))",
      }}
    >
      <style>{`@keyframes notif-in { 0%{opacity:0;transform:scale(0.96) translateY(-6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }`}</style>

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#f5f6f7] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-[#ff5222] text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none" style={{ fontWeight: 600, ...ss04 }}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={(e) => { e.stopPropagation(); markAllRead(); }} className="text-[11px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss04 }}>
            Basahin Lahat
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={(e) => { e.stopPropagation(); setNotifFilter("all"); }}
          className="shrink-0 h-7 px-3 rounded-full text-[11px] cursor-pointer transition-all"
          style={{ background: notifFilter === "all" ? "#070808" : "#f5f6f7", color: notifFilter === "all" ? "#fff" : "#84888c", fontWeight: 500, ...ss04 }}
        >
          Lahat
        </button>
        {(Object.keys(CATEGORY_META) as NotifCategory[]).map((key) => {
          const meta = CATEGORY_META[key];
          const count = notifications.filter(n => n.category === key && !n.read).length;
          return (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); setNotifFilter(key); }}
              className="shrink-0 h-7 px-3 rounded-full text-[11px] cursor-pointer transition-all flex items-center gap-1"
              style={{ background: notifFilter === key ? meta.bg : "#f5f6f7", color: notifFilter === key ? meta.color : "#84888c", fontWeight: 500, ...ss04 }}
            >
              <EmojiIcon emoji={meta.emoji} size={14} />
              {meta.label}
              {count > 0 && (
                <span className="text-[9px] bg-[#ff5222] text-white size-4 rounded-full flex items-center justify-center leading-none" style={{ fontWeight: 600 }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
        {filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <EmojiIcon emoji="🔔" size={32} />
            <span className="text-[13px] text-[#a0a3a7]" style={ss04}>Walang notification dito.</span>
          </div>
        ) : (
          filteredNotifs.map(n => {
            const meta = CATEGORY_META[n.category];
            return (
              <div
                key={n.id}
                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors cursor-pointer border-b border-[#f9fafb]"
                style={{ background: n.read ? "transparent" : "rgba(255,82,34,0.03)" }}
              >
                {/* Icon */}
                <div className="size-9 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: meta.bg }}>
                  <EmojiIcon emoji={meta.emoji} size={18} />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] truncate" style={{ color: "#070808", fontWeight: n.read ? 500 : 600, ...ss04 }}>{n.title}</span>
                    {!n.read && <div className="size-2 rounded-full bg-[#ff5222] shrink-0" />}
                  </div>
                  <span className="text-[11px] line-clamp-2" style={{ color: "#84888c", ...ss04, lineHeight: "1.5" }}>{n.message}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: meta.bg, color: meta.color, fontWeight: 500, ...ss04 }}>{meta.label}</span>
                    <span className="text-[10px] text-[#a0a3a7]" style={ss04}>{n.time}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#f5f6f7] flex items-center justify-center">
        <button onClick={(e) => { e.stopPropagation(); onViewAll(); }} className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss04 }}>
          Tingnan Lahat ng Notifications
        </button>
      </div>
    </div>
  );
}

/* ==================== BELL BUTTON WITH DROPDOWN ==================== */
function BellWithDropdown() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | NotifCategory>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  const onViewAll = () => {
    setNotifOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setNotifOpen(prev => !prev)}
        className="cursor-pointer relative flex items-center justify-center size-8 rounded-lg hover:bg-[#f5f6f7] transition-colors"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 size-[16px] bg-[#ff5222] text-white text-[9px] rounded-full flex items-center justify-center leading-none" style={{ fontWeight: 700 }}>
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <NotificationPanel
          notifications={notifications}
          notifFilter={notifFilter}
          setNotifFilter={setNotifFilter}
          markAsRead={markAsRead}
          markAllRead={markAllRead}
          onViewAll={onViewAll}
        />
      )}
    </div>
  );
}

/* ==================== HEADER ==================== */
interface HeaderProps {
  onDeposit?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onDeposit, onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, locale, setLocale, darkMode, toggleDarkMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleAvatarClick = () => {
    if (isLoggedIn) {
      setDropdownOpen(!dropdownOpen);
    } else {
      navigate("/login");
    }
  };

  const t = useT();

  const dropdownLabels: Record<string, string> = {
    "/profile": t("nav.profile"),
    "/portfolio": t("header.menu.portfolio"),
    "/rewards": t("header.menu.rewards"),
    "/leaderboard": t("header.menu.leaderboard"),
    "/creator": t("header.menu.creator"),
  };

  return (
    <>
      <header className="h-14 md:h-16 w-full flex items-center justify-between px-3 md:px-6 border-b border-[#f5f6f7] dark:border-[#2a2d3a] bg-white dark:bg-[#181b24]" style={pp}>
        {/* Left side: hamburger (mobile) */}
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <button onClick={onMenuToggle} className="lg:hidden size-9 flex items-center justify-center rounded-lg hover:bg-[#f5f6f7] cursor-pointer transition-colors">
              <svg className="size-5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          {/* Testnet Toggle */}
          <div className="flex items-center gap-1.5">
            <div className="bg-[#ff5222] rounded-full flex items-center justify-end pl-[13.5px] pr-[1.5px] py-[1.5px]">
              <div className="bg-white rounded-full size-[13px] shadow-[0px_0px_2.6px_0px_rgba(4,9,25,0.15)]" />
            </div>
            <span className="text-[12px] text-[#070808] leading-[1.5] hidden sm:inline" style={ss04}>Testnet</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {isLoggedIn ? (
            <>
              {/* Portfolio - hidden on very small */}
              <div
                className="hidden sm:flex items-center gap-1 text-[12px] leading-[1.5] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/portfolio")}
              >
                <span className="text-[#84888c]" style={ss04}>Portfolio</span>
                <span className="text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>
                  &#8369;{user?.portfolio?.toLocaleString("en-PH", { minimumFractionDigits: 2 }) ?? "0.00"}
                </span>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-1 text-[11px] md:text-[12px] leading-[1.5]">
                <span className="text-[#84888c] hidden sm:inline" style={ss04}>Bal</span>
                <span className="text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>
                  ₱{user?.balance?.toLocaleString("en-PH") ?? "0"}
                </span>
              </div>

              <div className="bg-[#dfe0e2] h-4 w-px hidden sm:block" />

              {/* Deposit Button */}
              <button onClick={onDeposit} className="bg-[#ff5222] hover:bg-[#e8491e] transition-colors text-white h-8 px-3 md:px-4 rounded-[6px] text-[12px] md:text-[14px] leading-[1.5] cursor-pointer" style={{ fontWeight: 500, ...ss04 }}>
                {t("header.deposit")}
              </button>

              {/* Bell with Notification Dropdown */}
              <div className="hidden sm:block">
                <BellWithDropdown />
              </div>

              {/* Globe */}
              <div className="relative hidden md:block">
                <button onClick={() => {
                  const next = locale === "fil" ? "en" : "fil";
                  setLocale(next);
                }} className="flex items-center gap-1 cursor-pointer hover:bg-[#f5f6f7] rounded-lg px-1.5 py-1 transition-colors" title={`Switch to ${locale === "fil" ? "English" : "Filipino"}`}>
                  <GlobeIcon />
                  <span className="text-[11px] text-[#84888c]" style={ss04}>{locale === "fil" ? "FIL" : "EN"}</span>
                </button>
              </div>

              {/* Dark mode toggle */}
              <button onClick={toggleDarkMode} className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f5f6f7] cursor-pointer transition-colors" title={darkMode ? "Light mode" : "Dark mode"}>
                {darkMode ? (
                  <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="4" /><path d="M10 2v1m0 14v1m8-8h-1M3 10H2m13.66-5.66l-.71.71M5.05 14.95l-.71.71m11.32 0l-.71-.71M5.05 5.05l-.71-.71" strokeLinecap="round" /></svg>
                ) : (
                  <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>

              {/* Avatar with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAvatarClick}
                  className="size-8 rounded-full overflow-hidden border-2 border-[#ff5222]/20 cursor-pointer hover:border-[#ff5222]/50 transition-all hover:scale-105"
                >
                  <ImageWithFallback src={user?.avatar ?? DEFAULT_AVATAR} alt={user?.name ?? "User"} className="size-full object-cover" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#f0f1f3] shadow-lg overflow-hidden z-50" style={{ animation: "modal-in 0.15s ease-out" }}>
                    <style>{`@keyframes modal-in { 0%{opacity:0;transform:scale(0.95) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }`}</style>
                    <div className="px-4 py-3 border-b border-[#f5f6f7]">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-full overflow-hidden ring-2 ring-[#ff5222]/15 shrink-0">
                          <ImageWithFallback src={user?.avatar ?? DEFAULT_AVATAR} alt={user?.name ?? ""} className="size-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] text-[#070808] truncate" style={{ fontWeight: 600, ...ss04 }}>{user?.name}</span>
                          <span className="text-[10px] text-[#84888c]" style={ss04}>{user?.handle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        { label: "Profile Ko", icon: (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" fill="#8B93A0" />
                            <path d="M10 12c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="#B0B7C3" />
                          </svg>
                        ), route: "/profile" },
                        { label: "Portfolio Ko", icon: (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="10" width="4" height="8" rx="1" fill="#B0B7C3" />
                            <rect x="8" y="6" width="4" height="12" rx="1" fill="#8B93A0" />
                            <rect x="14" y="2" width="4" height="16" rx="1" fill="#FF5222" />
                          </svg>
                        ), route: "/portfolio" },
                        { label: "Mga Rewards", icon: (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="8" width="16" height="3.5" rx="1" fill="#8B93A0" />
                            <rect x="3" y="11.5" width="14" height="7" rx="1" fill="#B0B7C3" />
                            <path d="M10 8v10.5" stroke="#fff" strokeWidth="1.5" />
                            <path d="M10 8c-1-2.2-3.8-4.2-5-3.2s0 3.2 5 3.2" fill="#FF5222" />
                            <path d="M10 8c1-2.2 3.8-4.2 5-3.2s0 3.2-5 3.2" fill="#FF5222" />
                          </svg>
                        ), route: "/rewards" },
                        { label: "Leaderboard", icon: (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M6 3h8v5a4 4 0 01-8 0V3z" fill="#8B93A0" />
                            <path d="M6 5H4a1 1 0 00-1 1v1a3 3 0 003 3" stroke="#B0B7C3" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                            <path d="M14 5h2a1 1 0 011 1v1a3 3 0 01-3 3" stroke="#B0B7C3" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                            <path d="M10 13v2" stroke="#8B93A0" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M7 17h6" stroke="#FF5222" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        ), route: "/leaderboard" },
                        { label: "Creator Center", icon: (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2l2.47 5.01L18 7.75l-4 3.9.94 5.5L10 14.52l-4.94 2.63.94-5.5-4-3.9 5.53-.74L10 2z" fill="#B0B7C3" />
                            <path d="M10 2l2.47 5.01L18 7.75l-4 3.9.94 5.5L10 14.52V2z" fill="#FF5222" />
                          </svg>
                        ), route: "/creator" },
                      ].map((item) => (
                        <button key={item.route} onClick={() => { setDropdownOpen(false); navigate(item.route); }} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#fafafa] transition-colors cursor-pointer text-left">
                          {item.icon}
                          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{dropdownLabels[item.route]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-[#f5f6f7]" />
                    <div className="py-1">
                      <button onClick={() => { setDropdownOpen(false); logout(); navigate("/"); }} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#fef2f2] transition-colors cursor-pointer text-left">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                          <path d="M9 7l-4 3 4 3" stroke="#FF5222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          <path d="M5 10h9" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span className="text-[12px] text-[#dc2626]" style={{ fontWeight: 500, ...ss04 }}>{t("header.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Not logged in */}
              <div className="hidden sm:flex items-center gap-1 text-[12px] leading-[1.5]">
                <span className="text-[#84888c]" style={ss04}>Balance</span>
                <span className="text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>₱0</span>
              </div>

              <div className="bg-[#dfe0e2] h-4 w-px hidden sm:block" />

              <button onClick={() => navigate("/login")} className="bg-white border border-[#f0f1f3] hover:border-[#dfe0e2] text-[#070808] h-8 px-3 md:px-4 rounded-[6px] text-[12px] md:text-[13px] leading-[1.5] cursor-pointer transition-colors" style={{ fontWeight: 500, ...ss04 }}>
                {t("header.login")}
              </button>
              <button onClick={() => navigate("/signup")} className="bg-[#ff5222] hover:bg-[#e8491e] transition-colors text-white h-8 px-3 md:px-4 rounded-[6px] text-[12px] md:text-[13px] leading-[1.5] cursor-pointer" style={{ fontWeight: 600, ...ss04 }}>
                {t("header.signup")}
              </button>

              <button onClick={handleAvatarClick} className="size-8 rounded-full overflow-hidden border-2 border-[#dfe0e2] cursor-pointer hover:border-[#ff5222]/30 transition-all hover:scale-105 bg-[#f7f8f9] flex items-center justify-center">
                <svg className="size-4 text-[#b0b3b8]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}