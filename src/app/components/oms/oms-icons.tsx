/* Clean line-style SVG icons for the OMS sidebar navigation */

export function OmsDashboardIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="4" rx="1.5" />
      <rect x="11" y="8" width="7" height="10" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function OmsUsersIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="6" r="3" />
      <path d="M2 17v-1a5 5 0 0110 0v1" />
      <circle cx="14" cy="7" r="2.5" />
      <path d="M14 12a4 4 0 014 4v1" />
    </svg>
  );
}

export function OmsMarketsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-6 3 3 4-5 3 4" />
      <path d="M17 3v14H3" />
    </svg>
  );
}

export function OmsBetsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <circle cx="7" cy="7" r="1" fill={color} stroke="none" />
      <circle cx="13" cy="7" r="1" fill={color} stroke="none" />
      <circle cx="7" cy="13" r="1" fill={color} stroke="none" />
      <circle cx="13" cy="13" r="1" fill={color} stroke="none" />
      <circle cx="10" cy="10" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export function OmsFinanceIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v16" />
      <path d="M14 5H8a3 3 0 000 6h4a3 3 0 010 6H6" />
    </svg>
  );
}

export function OmsRewardsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9 5.5-.8L10 2z" />
    </svg>
  );
}

export function OmsAffiliatesIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M4 18v-1a6 6 0 0112 0v1" />
      <path d="M15 7l2 2-2 2" />
      <path d="M17 9h-4" />
    </svg>
  );
}

export function OmsReportsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2h8l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path d="M13 2v4h4" />
      <path d="M7 10h6" />
      <path d="M7 13h6" />
      <path d="M7 16h3" />
    </svg>
  );
}

export function OmsSettingsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1.5v2M10 16.5v2M3.3 3.3l1.4 1.4M15.3 15.3l1.4 1.4M1.5 10h2M16.5 10h2M3.3 16.7l1.4-1.4M15.3 4.7l1.4-1.4" />
    </svg>
  );
}

export function OmsContentIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 7h6" />
      <path d="M7 10h6" />
      <path d="M7 13h3" />
    </svg>
  );
}

export function OmsLogoutIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3" />
      <path d="M14 14l4-4-4-4" />
      <path d="M18 10H8" />
    </svg>
  );
}

export function OmsChevronIcon({ direction = "down", color = "currentColor" }: { direction?: "up" | "down" | "left" | "right"; color?: string }) {
  const rotations = { up: "rotate(180deg)", down: "rotate(0)", left: "rotate(90deg)", right: "rotate(-90deg)" };
  return (
    <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: rotations[direction] }}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function OmsSearchIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6" />
      <path d="M16 16l-3.5-3.5" />
    </svg>
  );
}

export function OmsAlertIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L2 17h16L10 2z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

export function OmsRiskIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L2 17h16L10 2z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

export function OmsWalletIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="12" rx="2" />
      <path d="M2 5V4a2 2 0 012-2h10a2 2 0 012 2v1" />
      <circle cx="14" cy="11" r="1.5" />
    </svg>
  );
}

export function OmsAuditIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v14l4-2 2 2 2-2 4 2V4a2 2 0 00-2-2z" />
      <path d="M8 7h4" />
      <path d="M8 10h4" />
      <path d="M8 13h2" />
    </svg>
  );
}

export function OmsFastBetIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L5 12h5l-1 6 6-10h-5l1-6z" />
    </svg>
  );
}

export function OmsCreatorIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="4" />
      <path d="M3 18v-1a7 7 0 0114 0v1" />
      <path d="M15 4l2 2-2 2" />
    </svg>
  );
}

export function OmsLeaderboardIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="4" height="8" rx="0.5" />
      <rect x="8" y="4" width="4" height="14" rx="0.5" />
      <rect x="14" y="7" width="4" height="11" rx="0.5" />
    </svg>
  );
}

export function OmsPromoIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h14l-1.5 9H4.5L3 5z" />
      <path d="M3 5l-1-3" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="13" cy="17" r="1.5" />
      <path d="M8 9l4 4M8 13l4-4" />
    </svg>
  );
}

export function OmsSupportIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10c0-4.4-3.6-8-8-8S2 5.6 2 10v5a2 2 0 002 2h1v-6H3" />
      <path d="M17 11h-2v6h1a2 2 0 002-2v-4z" />
      <path d="M15 17a3 3 0 01-3 1H10" />
    </svg>
  );
}

export function OmsNotifMgmtIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a5 5 0 00-5 5v3l-2 2v1h14v-1l-2-2V7a5 5 0 00-5-5z" />
      <path d="M8 15a2 2 0 004 0" />
      <circle cx="15" cy="4" r="2.5" fill={color} stroke="none" />
    </svg>
  );
}

export function OmsOddsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 4v6l4 2" />
      <path d="M14 6l2-2" />
      <path d="M16 8h-2" />
    </svg>
  );
}

export function OmsMerchantIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l7-5 7 5" />
      <path d="M4 7v9h12V7" />
      <rect x="7" y="11" width="6" height="5" rx="0.5" />
      <path d="M7 7v2a3 3 0 006 0V7" />
    </svg>
  );
}

export function OmsWebhookIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="5" r="3" />
      <circle cx="5" cy="15" r="3" />
      <circle cx="15" cy="15" r="3" />
      <path d="M10 8v2l-3 5" />
      <path d="M10 10l3 5" />
    </svg>
  );
}

export function OmsApiKeyIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="10" r="5" />
      <circle cx="8" cy="10" r="2" />
      <path d="M13 10h5" />
      <path d="M15 8v4" />
      <path d="M17 8v4" />
    </svg>
  );
}

export function OmsTenantIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="7" rx="1.5" />
      <rect x="11" y="3" width="7" height="7" rx="1.5" />
      <rect x="2" y="12" width="7" height="6" rx="1.5" />
      <rect x="11" y="12" width="7" height="6" rx="1.5" />
    </svg>
  );
}

export function OmsGlobeIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16" />
      <path d="M10 2c2.5 2.5 4 5.2 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5.2-4-8s1.5-5.5 4-8z" />
    </svg>
  );
}

export function OmsPaasConfigIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2H4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2z" />
      <path d="M16 2h-2a2 2 0 00-2 2v1a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2z" />
      <path d="M16 11h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2z" />
      <path d="M6 14h2M4 17h4" />
    </svg>
  );
}

export function OmsKybIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
      <path d="M8 7h4M8 10h4M8 13h2" />
      <path d="M12 13l1 1 2-3" />
    </svg>
  );
}

export function OmsPaymentMethodsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 8h16" />
      <path d="M6 12h3" />
      <path d="M12 12h2" />
    </svg>
  );
}

export function OmsPaymentProvidersIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg className="size-[18px]" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="5" rx="1.5" />
      <rect x="2" y="12" width="16" height="5" rx="1.5" />
      <circle cx="5" cy="5.5" r="1" />
      <circle cx="5" cy="14.5" r="1" />
      <path d="M8 5.5h7" />
      <path d="M8 14.5h7" />
      <path d="M10 8v4" />
    </svg>
  );
}