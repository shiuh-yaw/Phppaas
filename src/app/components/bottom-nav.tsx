/**
 * Mobile Bottom Navigation — User Portal
 * ========================================
 * Fixed bottom bar visible only on mobile (<lg breakpoints).
 * 5 key navigation items covering the core user journey.
 */
import { useNavigate, useLocation } from "react-router";
import { useT } from "../i18n/useT";

const ss04 = { fontFeatureSettings: "'ss04'" };

interface NavItem {
  label: string;
  path: string;
  /** Matches if location starts with this (for nested routes) */
  matchPaths?: string[];
  icon: (active: boolean) => JSX.Element;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: (a) => (
      <svg className="size-[22px]" fill="none" viewBox="0 0 24 24" stroke={a ? "#ff5222" : "#9ca3af"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Markets",
    path: "/markets",
    matchPaths: ["/markets", "/market/", "/category/"],
    icon: (a) => (
      <svg className="size-[22px]" fill="none" viewBox="0 0 24 24" stroke={a ? "#ff5222" : "#9ca3af"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-10" />
        <path d="M17 7h4v4" />
      </svg>
    ),
  },
  {
    label: "Fast Bet",
    path: "/fast-bet",
    icon: (a) => (
      <svg className="size-[22px]" fill="none" viewBox="0 0 24 24" stroke={a ? "#ff5222" : "#9ca3af"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    matchPaths: ["/profile", "/kyc", "/rewards", "/portfolio", "/leaderboard", "/affiliate", "/notifications", "/creator"],
    icon: (a) => (
      <svg className="size-[22px]" fill="none" viewBox="0 0 24 24" stroke={a ? "#ff5222" : "#9ca3af"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

/** Pages where the bottom nav should be hidden (e.g. login, signup) */
const HIDDEN_PATHS = ["/login", "/signup", "/oms", "/market/"];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const t = useT();

  // Hide on OMS and auth pages
  if (HIDDEN_PATHS.some(p => path.startsWith(p))) return null;

  const isActive = (item: NavItem) => {
    if (item.path === "/" && path === "/") return true;
    if (item.path === "/" && path !== "/") return false;
    if (item.matchPaths) return item.matchPaths.some(mp => path === mp || path.startsWith(mp));
    return path === item.path || path.startsWith(item.path + "/");
  };

  const labelMap: Record<string, string> = {
    "/": t("bottomNav.home"),
    "/markets": t("bottomNav.markets"),
    "/fast-bet": t("bottomNav.fastBet"),
    "/profile": t("bottomNav.profile"),
  };

  return (
    <>
      {/* Spacer so page content doesn't hide behind the fixed nav */}
      <div className="h-[68px] lg:hidden" />
      {/* The actual nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-[#181b24] border-t border-[#f0f1f3] dark:border-[#2a2d3a]"
        style={{
          fontFamily: "'Poppins', sans-serif",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-colors relative"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* Active indicator dot */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#ff5222]" />
                )}
                <div className={`transition-transform ${active ? "scale-110" : ""}`}>
                  {item.icon(active)}
                </div>
                <span
                  className={`text-[10px] leading-tight ${active ? "text-[#ff5222]" : "text-[#9ca3af]"}`}
                  style={{ fontWeight: active ? 600 : 500, ...ss04 }}
                >
                  {labelMap[item.path] ?? item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}