import { useNavigate, useLocation } from "react-router";
import { ChartBarIcon, LightbulbIcon, UserIcon, RankingIcon, GiftIcon, BoltIcon, AffiliateIcon, NotificationBellIcon } from "./icons";
import { EmojiIcon } from "./two-tone-icons";
import { useT } from "../i18n/useT";

const ss04 = { fontFeatureSettings: "'ss04'" };

const navItemsLocalized = [
  { label: "sidebar.markets", icon: ChartBarIcon, route: "/markets" },
  { label: "sidebar.fastBet", icon: BoltIcon, route: "/fast-bet" },
  { label: "sidebar.creator", icon: LightbulbIcon, route: "/creator" },
  { label: "sidebar.portfolio", icon: UserIcon, route: "/portfolio" },
  { label: "sidebar.leaderboard", icon: RankingIcon, route: "/leaderboard" },
  { label: "sidebar.rewards", icon: GiftIcon, route: "/rewards" },
  { label: "sidebar.affiliate", icon: AffiliateIcon, route: "/affiliate" },
  { label: "sidebar.notifications", icon: NotificationBellIcon, route: "/notifications" },
];

const quickLinks = [
  { label: "Basketball", emoji: "🏀", hot: true, route: "/category/basketball" },
  { label: "Color Game", emoji: "🎲", hot: true, route: "/category/color-game" },
  { label: "Boxing", emoji: "🥊", hot: true, route: "/category/boxing" },
  { label: "Esports", emoji: "🎮", hot: false, route: "/category/esports" },
  { label: "Bingo", emoji: "💯", hot: false, route: "/category/bingo" },
];

const moreCategories = [
  { label: "Lottery", emoji: "🎰", route: "/category/lottery" },
  { label: "Showbiz", emoji: "⭐", route: "/category/showbiz" },
  { label: "Weather", emoji: "🌪", route: "/category/weather" },
  { label: "Economy", emoji: "📈", route: "/category/economy" },
];

interface SidebarProps {
  onDeposit?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onDeposit, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const t = useT();

  const handleNav = (route: string) => {
    navigate(route);
    onClose?.();
  };

  const sidebarContent = (
    <div className="bg-white dark:bg-[#181b24] w-[210px] shrink-0 flex flex-col min-h-full border-r border-[#f5f6f7] dark:border-[#2a2d3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div
            className="h-6 cursor-pointer text-[#ff5222] leading-none"
            onClick={() => handleNav("/")}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}
          >
            PrediEx
          </div>
          <span className="text-[10px] text-[#84888c] leading-[1.5] tracking-wide" style={ss04}>
            PredictEx Edition
          </span>
        </div>
        {/* Close button - mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden size-8 flex items-center justify-center rounded-lg hover:bg-[#f5f6f7] cursor-pointer transition-colors">
            <svg className="size-5 text-[#84888c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2">
        {navItemsLocalized.map((item) => {
          const isActive = currentPath === item.route || currentPath.startsWith(item.route + "/");
          return (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                isActive ? "bg-[#fff4ed]" : "hover:bg-[#f9f9fa]"
              }`}
            >
              <item.icon color={isActive ? "#ff5222" : "#84888C"} />
              <span
                className={`text-[13px] leading-[1.5] ${
                  isActive ? "text-[#ff5222]" : "text-[#84888c]"
                }`}
                style={{ fontWeight: 500, ...ss04 }}
              >
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Quick Links */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] text-[#b0b3b8] uppercase tracking-wider" style={{ fontWeight: 600, ...ss04 }}>
          {t("sidebar.quickLinks")}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {quickLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNav(link.route)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f9f9fa] transition-all cursor-pointer"
          >
            <EmojiIcon emoji={link.emoji} size={16} />
            <span className="text-[12px] text-[#555] leading-[1.5] flex-1 text-left" style={{ fontWeight: 500, ...ss04 }}>
              {link.label}
            </span>
            {link.hot && (
              <span className="bg-[#ff5222] text-white text-[8px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                HOT
              </span>
            )}
          </button>
        ))}
      </div>

      {/* More Categories */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] text-[#b0b3b8] uppercase tracking-wider" style={{ fontWeight: 600, ...ss04 }}>
          {t("sidebar.moreCategories")}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {moreCategories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleNav(cat.route)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f9f9fa] transition-all cursor-pointer"
          >
            <EmojiIcon emoji={cat.emoji} size={16} />
            <span className="text-[12px] text-[#555] leading-[1.5] flex-1 text-left" style={{ fontWeight: 500, ...ss04 }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-auto px-4 pb-5">
        <div className="bg-gradient-to-br from-[#ff5222] to-[#ff7a4f] rounded-xl px-3.5 py-3 flex flex-col gap-1.5">
          <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss04 }}>{t("sidebar.depositNow")}</span>
          <span className="text-[10px] text-white/80 leading-[1.4]" style={ss04}>GCash, Maya, Bank Transfer</span>
          <button onClick={() => { onDeposit?.(); onClose?.(); }} className="bg-white text-[#ff5222] text-[11px] h-7 rounded-md mt-1 hover:bg-white/90 transition-colors cursor-pointer" style={{ fontWeight: 600, ...ss04 }}>
            {t("header.deposit")} ₱
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - overlay drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <div className="relative z-10 h-full overflow-y-auto" style={{ animation: "sidebar-slide-in 0.2s ease-out" }}>
            <style>{`@keyframes sidebar-slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}