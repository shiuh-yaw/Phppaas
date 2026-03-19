import { useLocation, useNavigate } from "react-router";

const ss04 = { fontFeatureSettings: "'ss04'" };

interface Crumb {
  label: string;
  path?: string;
}

const PAGE_MAP: Record<string, { label: string; section: string }> = {
  "": { label: "Platform Overview", section: "Platform" },
  dashboard: { label: "Dashboard", section: "Operations" },
  users: { label: "User Management", section: "Operations" },
  markets: { label: "Markets", section: "Operations" },
  bets: { label: "Bets & Wagers", section: "Operations" },
  finance: { label: "Finance", section: "Operations" },
  risk: { label: "Risk Management", section: "Operations" },
  wallet: { label: "Wallet Admin", section: "Operations" },
  "fast-bet": { label: "Fast Bet Config", section: "Operations" },
  odds: { label: "Odds Engine", section: "Operations" },
  creators: { label: "Creator Management", section: "Operations" },
  rewards: { label: "Rewards", section: "Programs" },
  affiliates: { label: "Affiliates", section: "Programs" },
  leaderboard: { label: "Leaderboard", section: "Programs" },
  promos: { label: "Promo Codes", section: "Programs" },
  content: { label: "Content & CMS", section: "Programs" },
  "notif-mgmt": { label: "Notifications", section: "Programs" },
  reports: { label: "Reports", section: "System" },
  audit: { label: "Audit Trail", section: "System" },
  support: { label: "Support Tickets", section: "System" },
  settings: { label: "Settings", section: "System" },
  merchants: { label: "Merchants", section: "Platform" },
  billing: { label: "Billing & Plans", section: "Platform" },
  "paas-config": { label: "PaaS Admin Config", section: "Platform" },
};

export function OmsBreadcrumb({ merchantName }: { merchantName?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse current path: /oms/page or /oms/merchants/:id
  const segments = location.pathname.replace("/oms", "").split("/").filter(Boolean);
  const pageKey = segments[0] || "";
  const pageInfo = PAGE_MAP[pageKey];

  if (!pageInfo) return null;

  const crumbs: Crumb[] = [
    { label: "OMS", path: "/oms" },
  ];

  if (merchantName && pageInfo.section !== "Platform") {
    crumbs.push({ label: merchantName });
  }

  if (pageInfo.section !== "Platform" || pageKey !== "") {
    crumbs.push({ label: pageInfo.section });
  }

  crumbs.push({ label: pageInfo.label });

  // Detail sub-page? e.g. /oms/merchants/:id
  if (segments.length > 1 && pageKey === "merchants") {
    crumbs[crumbs.length - 1] = { label: "Merchants", path: "/oms/merchants" };
    crumbs.push({ label: `Merchant ${segments[1]}` });
  }

  return (
    <nav className="flex items-center gap-1 mb-3 overflow-x-auto">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1 flex-shrink-0">
            {i > 0 && (
              <svg className="size-3 text-[#d1d5db]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4.5 2l3 4-3 4" />
              </svg>
            )}
            {crumb.path && !isLast ? (
              <button
                onClick={() => navigate(crumb.path!)}
                className="text-[11px] text-[#84888c] hover:text-[#ff5222] transition-colors cursor-pointer"
                style={{ fontWeight: 500, ...ss04 }}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className={`text-[11px] ${isLast ? "text-[#070808]" : "text-[#84888c]"}`}
                style={{ fontWeight: isLast ? 600 : 500, ...ss04 }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
