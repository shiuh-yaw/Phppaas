import svgPaths from "../../imports/svg-jemw5d3hse";

export function ChartBarIcon({ color = "#070808" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20">
      <rect x="2" y="10" width="4" height="8" rx="1" fill={color} />
      <rect x="8" y="6" width="4" height="12" rx="1" fill={color} />
      <rect x="14" y="2" width="4" height="16" rx="1" fill={color} />
    </svg>
  );
}

export function LightbulbIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.486 8.486-3.535.707.707-3.535 8.486-8.486z" />
      <path d="M12.5 4.5l2.828 2.828" />
    </svg>
  );
}

export function UserIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path d="M7 5V4a3 3 0 016 0v1" />
      <path d="M3 10h14" />
    </svg>
  );
}

export function RankingIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h8v5a4 4 0 01-8 0V3z" />
      <path d="M6 5H4a1 1 0 00-1 1v1a3 3 0 003 3" />
      <path d="M14 5h2a1 1 0 011 1v1a3 3 0 01-3 3" />
      <path d="M10 13v2" />
      <path d="M7 17h6" />
    </svg>
  );
}

export function GiftIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="4" rx="1" />
      <rect x="3" y="11" width="14" height="7" rx="1" />
      <path d="M10 7v11" />
      <path d="M10 7c-1-2-3.5-4-5-3s0 3 5 3" />
      <path d="M10 7c1-2 3.5-4 5-3s0 3-5 3" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg className="size-6" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p29513000} fill="#070808" />
      <circle cx="19" cy="5" fill="#FF5222" r="3" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg className="size-6" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p206aed00} fill="#070808" />
    </svg>
  );
}

export function CaretDownIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 11.5039 6.50377">
      <path d={svgPaths.p12bd8c80} fill="#070808" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 13.5158 13.5164">
      <path d={svgPaths.p140f2580} fill="#84888C" />
    </svg>
  );
}

export function FireIcon() {
  return (
    <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
      <path d={svgPaths.p3e687800} fill="#FF5222" />
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
      <path d={svgPaths.pb328900} fill="#A0A3A7" />
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
      <path d={svgPaths.pb96d4a0} fill="#A0A3A7" />
    </svg>
  );
}

export function PredictExLogoIcon() {
  return (
    <svg className="size-6" fill="none" viewBox="0 0 24 24.0002">
      <path d={svgPaths.p3f45c600} fill="#FF5222" />
    </svg>
  );
}

export function BoltIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" fill={color} stroke="none" />
    </svg>
  );
}

export function AffiliateIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M3 18v-1a5 5 0 0110 0v1" />
      <path d="M15 8l2 2 3-3" />
    </svg>
  );
}

export function NotificationBellIcon({ color = "#84888C" }: { color?: string }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a5 5 0 00-5 5v3l-1.5 2.5a.5.5 0 00.43.75h12.14a.5.5 0 00.43-.75L15 10V7a5 5 0 00-5-5z" />
      <path d="M8 14a2 2 0 004 0" />
    </svg>
  );
}