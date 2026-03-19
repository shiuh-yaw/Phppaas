/**
 * Two-tone icons matching Figma design style.
 * Primary: #070808, Accent: #FF5222
 * Default size: 56x56 (configurable via `size` prop)
 */
import svgPaths from "../../imports/svg-mv3d228dce";

interface IconProps {
  size?: number;
  className?: string;
}

/* ===== IMPORTED FROM FIGMA ===== */

export function ShieldCheckIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d={svgPaths.p3cb22a00} fill="#070808" />
      <path d={svgPaths.p2f410000} fill="#FF5222" />
    </svg>
  );
}

export function CoinIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <g transform="translate(2.625 9.625) rotate(-45 25.375 18.375)">
        <path d={svgPaths.p37ff1c80} fill="#070808" />
        <path d={svgPaths.p37669b00} fill="#FF5222" />
        <path d={svgPaths.p3e421d80} fill="#FF5222" />
        <path d={svgPaths.pc39f400} fill="#FF5222" />
      </g>
    </svg>
  );
}

export function GlobeIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d={svgPaths.pea3e80} fill="#070808" />
      <path d={svgPaths.p36cd0500} fill="#070808" />
      <path d={svgPaths.p2776ab00} fill="#FF5222" />
    </svg>
  );
}

/* ===== CUSTOM TWO-TONE ICONS (same style) ===== */

export function LinkIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M32.083 23.917a9.333 9.333 0 0 1 0 13.2l-4.666 4.666a9.334 9.334 0 0 1-13.2-13.2l2.333-2.333" stroke="#070808" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M23.917 32.083a9.333 9.333 0 0 1 0-13.2l4.666-4.666a9.334 9.334 0 0 1 13.2 13.2l-2.333 2.333" stroke="#FF5222" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HandshakeIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M10.5 33.25L10.5 19.25L17.5 15.75L28 21L38.5 15.75L45.5 19.25V33.25" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M28 21L17.5 29.75L24.5 36.75L28 33.25L31.5 36.75L38.5 29.75L28 21Z" fill="#FF5222" />
      <circle cx="17.5" cy="38.5" r="3" fill="#070808" />
      <circle cx="38.5" cy="38.5" r="3" fill="#070808" />
    </svg>
  );
}

export function MoneyIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="7" y="14" width="42" height="28" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="28" cy="28" r="7" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M28 23v2m0 6v2" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 27.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2-.9 2-2" stroke="#FF5222" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="28" r="2" fill="#070808" />
      <circle cx="42" cy="28" r="2" fill="#070808" />
    </svg>
  );
}

export function ChartIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="10" y="38" width="8" height="10" rx="2" fill="#070808" />
      <rect x="24" y="26" width="8" height="22" rx="2" fill="#070808" />
      <rect x="38" y="14" width="8" height="34" rx="2" fill="#070808" />
      <path d="M12 26l10-10 8 6 14-12" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="44" cy="10" r="3" fill="#FF5222" />
    </svg>
  );
}

export function CameraIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M8.75 19.25C8.75 17.317 10.317 15.75 12.25 15.75H17.938L21 10.5H35L38.063 15.75H43.75C45.683 15.75 47.25 17.317 47.25 19.25V42C47.25 43.933 45.683 45.5 43.75 45.5H12.25C10.317 45.5 8.75 43.933 8.75 42V19.25Z" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="28" cy="30.625" r="8.75" stroke="#070808" strokeWidth="3" fill="none" />
      <circle cx="28" cy="30.625" r="4" fill="#FF5222" />
    </svg>
  );
}

export function PeopleIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="21" cy="19.25" r="7" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M7 43.75c0-7.732 6.268-14 14-14h0c7.732 0 14 6.268 14 14" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="38.5" cy="21" r="5.25" fill="#FF5222" />
      <path d="M45.5 43.75c0-5.523-3.134-10-7-10" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MegaphoneIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M38.5 14L17.5 22.75H12.25C10.317 22.75 8.75 24.317 8.75 26.25V29.75C8.75 31.683 10.317 33.25 12.25 33.25H17.5L38.5 42V14Z" fill="#070808" />
      <path d="M17.5 33.25L21 47.25H24.5L22.75 33.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M43.75 22.75C45.683 22.75 47.25 24.317 47.25 26.25V29.75C47.25 31.683 45.683 33.25 43.75 33.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ImageIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="8.75" y="12.25" width="38.5" height="31.5" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="19.25" cy="22.75" r="3.5" fill="#FF5222" />
      <path d="M8.75 36.75L19.25 26.25L29.75 36.75L36.75 29.75L47.25 40.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PackageIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75L47.25 19.25V36.75L28 47.25L8.75 36.75V19.25L28 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M8.75 19.25L28 29.75L47.25 19.25" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M28 29.75V47.25" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M18.375 14L37.625 24.5" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function GiftIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="8.75" y="22.75" width="38.5" height="22.75" rx="3" stroke="#070808" strokeWidth="3.5" fill="none" />
      <rect x="12.25" y="15.75" width="31.5" height="10.5" rx="3" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M28 15.75V45.5" stroke="#FF5222" strokeWidth="3" />
      <path d="M28 22.75C28 22.75 28 15.75 21 15.75C17.5 15.75 15.75 18.375 17.5 20.125C19.25 21.875 28 22.75 28 22.75Z" fill="#FF5222" />
      <path d="M28 22.75C28 22.75 28 15.75 35 15.75C38.5 15.75 40.25 18.375 38.5 20.125C36.75 21.875 28 22.75 28 22.75Z" fill="#FF5222" />
    </svg>
  );
}

export function TrophyIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M17.5 10.5H38.5V28C38.5 33.799 33.799 38.5 28 38.5C22.201 38.5 17.5 33.799 17.5 28V10.5Z" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M17.5 15.75H12.25C10.317 15.75 8.75 17.317 8.75 19.25V21C8.75 24.866 11.884 28 15.75 28H17.5" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M38.5 15.75H43.75C45.683 15.75 47.25 17.317 47.25 19.25V21C47.25 24.866 44.116 28 40.25 28H38.5" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M21 45.5H35" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M28 38.5V45.5" stroke="#070808" strokeWidth="3.5" />
      <path d="M24.5 19.25L28 24.5L31.5 19.25" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="28" cy="17.5" r="2" fill="#FF5222" />
    </svg>
  );
}

export function LightningIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M30.333 8.75L12.25 31.5H26.25L24.5 47.25L43.75 24.5H29.75L30.333 8.75Z" fill="#070808" />
      <path d="M26.25 31.5L30.333 8.75" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
      <path d="M29.75 24.5L24.5 47.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function TargetIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="19.25" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="28" cy="28" r="12.25" stroke="#070808" strokeWidth="3" fill="none" />
      <circle cx="28" cy="28" r="5.25" fill="#FF5222" />
      <path d="M28 5.25V12.25" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 43.75V50.75" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5.25 28H12.25" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43.75 28H50.75" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75L33.09 22.41H47.25L35.58 30.97L40.67 44.63L28 36.07L15.33 44.63L20.42 30.97L8.75 22.41H22.91L28 8.75Z" fill="#070808" />
      <path d="M28 15.75L31.5 24.5H40.25L33.25 29.75L35.875 38.5L28 33.25L20.125 38.5L22.75 29.75L15.75 24.5H24.5L28 15.75Z" fill="#FF5222" />
    </svg>
  );
}

export function UserCheckIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="22.75" cy="19.25" r="8.75" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M7 47.25c0-8.699 7.051-15.75 15.75-15.75 3.12 0 6.03.908 8.477 2.475" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="40.25" cy="36.75" r="10.5" stroke="#FF5222" strokeWidth="3" fill="none" />
      <path d="M35.875 36.75L38.5 39.375L44.625 33.25" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function RocketIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75C28 8.75 38.5 14 38.5 28L33.25 36.75H22.75L17.5 28C17.5 14 28 8.75 28 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <circle cx="28" cy="24.5" r="3.5" fill="#FF5222" />
      <path d="M22.75 36.75L17.5 45.5H24.5L28 40.25L31.5 45.5H38.5L33.25 36.75" stroke="#FF5222" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <path d="M17.5 28L10.5 31.5L15.75 36.75" stroke="#070808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38.5 28L45.5 31.5L40.25 36.75" stroke="#070808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function BarChartIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="10.5" y="33.25" width="7" height="14" rx="2" fill="#070808" />
      <rect x="24.5" y="19.25" width="7" height="28" rx="2" fill="#070808" />
      <rect x="38.5" y="8.75" width="7" height="38.5" rx="2" fill="#070808" />
      <path d="M10.5 33.25L24.5 19.25L38.5 8.75" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" fill="none" />
    </svg>
  );
}

export function WalletIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="8.75" y="15.75" width="38.5" height="28" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M8.75 15.75L36.75 8.75V15.75" stroke="#070808" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <rect x="35" y="26.25" width="12.25" height="7" rx="3.5" stroke="#070808" strokeWidth="2.5" fill="none" />
      <circle cx="40.25" cy="29.75" r="1.75" fill="#FF5222" />
    </svg>
  );
}

export function ClockIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="19.25" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M28 17.5V28L35 33.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="28" cy="28" r="2.5" fill="#FF5222" />
    </svg>
  );
}

export function FireIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75C28 8.75 40.25 19.25 40.25 31.5C40.25 38.266 34.766 43.75 28 43.75C21.234 43.75 15.75 38.266 15.75 31.5C15.75 19.25 28 8.75 28 8.75Z" fill="#070808" />
      <path d="M28 24.5C28 24.5 35 29.75 35 35C35 38.866 31.866 42 28 42C24.134 42 21 38.866 21 35C21 29.75 28 24.5 28 24.5Z" fill="#FF5222" />
    </svg>
  );
}

export function CrownIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M10.5 42V19.25L21 28L28 14L35 28L45.5 19.25V42H10.5Z" fill="#070808" />
      <circle cx="21" cy="22.75" r="2.5" fill="#FF5222" />
      <circle cx="28" cy="17.5" r="2.5" fill="#FF5222" />
      <circle cx="35" cy="22.75" r="2.5" fill="#FF5222" />
      <rect x="10.5" y="42" width="35" height="5.25" rx="2" fill="#070808" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="19.25" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M19.25 28L24.5 33.25L36.75 21" stroke="#FF5222" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ===== CATEGORY-SPECIFIC TWO-TONE ICONS ===== */

export function BasketballIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="17.5" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M14 17C20 24 20 32 14 39" stroke="#070808" strokeWidth="2.5" fill="none" />
      <path d="M42 17C36 24 36 32 42 39" stroke="#070808" strokeWidth="2.5" fill="none" />
      <path d="M10.5 28H45.5" stroke="#FF5222" strokeWidth="2.5" />
      <path d="M28 10.5V45.5" stroke="#FF5222" strokeWidth="2.5" />
    </svg>
  );
}

export function DiceIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="10.5" y="10.5" width="35" height="35" rx="5" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="21" cy="21" r="2.5" fill="#FF5222" />
      <circle cx="35" cy="21" r="2.5" fill="#070808" />
      <circle cx="28" cy="28" r="2.5" fill="#FF5222" />
      <circle cx="21" cy="35" r="2.5" fill="#070808" />
      <circle cx="35" cy="35" r="2.5" fill="#FF5222" />
    </svg>
  );
}

export function BoxingIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M15.75 21C15.75 16.167 19.667 12.25 24.5 12.25H31.5C36.333 12.25 40.25 16.167 40.25 21V31.5C40.25 36.333 36.333 40.25 31.5 40.25H24.5C19.667 40.25 15.75 36.333 15.75 31.5V21Z" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M22.75 40.25V47.25" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M33.25 40.25V47.25" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M22.75 24.5H33.25" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
      <path d="M22.75 31.5H29.75" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function EsportsIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M12.25 17.5H43.75C45.683 17.5 47.25 19.067 47.25 21V35C47.25 36.933 45.683 38.5 43.75 38.5H12.25C10.317 38.5 8.75 36.933 8.75 35V21C8.75 19.067 10.317 17.5 12.25 17.5Z" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M19.25 24.5V31.5" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15.75 28H22.75" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="35" cy="25.375" r="2" fill="#070808" />
      <circle cx="38.5" cy="28" r="2" fill="#FF5222" />
      <path d="M21 38.5L24.5 45.5H31.5L35 38.5" stroke="#070808" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function BingoIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="10.5" y="10.5" width="35" height="35" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <line x1="10.5" y1="22.167" x2="45.5" y2="22.167" stroke="#070808" strokeWidth="2" />
      <line x1="10.5" y1="33.833" x2="45.5" y2="33.833" stroke="#070808" strokeWidth="2" />
      <line x1="22.167" y1="10.5" x2="22.167" y2="45.5" stroke="#070808" strokeWidth="2" />
      <line x1="33.833" y1="10.5" x2="33.833" y2="45.5" stroke="#070808" strokeWidth="2" />
      <circle cx="28" cy="28" r="4" fill="#FF5222" />
      <circle cx="16.333" cy="16.333" r="2.5" fill="#FF5222" />
      <circle cx="39.667" cy="39.667" r="2.5" fill="#FF5222" />
    </svg>
  );
}

export function LotteryIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="30.625" r="15.75" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M21 10.5H35L38.5 17.5H17.5L21 10.5Z" stroke="#070808" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <circle cx="28" cy="30.625" r="5.25" fill="#FF5222" />
      <text x="28" y="33" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="Poppins, sans-serif">7</text>
    </svg>
  );
}

export function ShowbizIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75L31.5 19.25H42.875L33.688 26.25L37.188 36.75L28 29.75L18.813 36.75L22.313 26.25L13.125 19.25H24.5L28 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M28 15.75L30 21.875H36.5L31.25 26L33 32.125L28 28L23 32.125L24.75 26L19.5 21.875H26L28 15.75Z" fill="#FF5222" />
      <path d="M14 42H42" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M17.5 47.25H38.5" stroke="#070808" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function WeatherIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M38.5 36.75H15.75C11.884 36.75 8.75 33.616 8.75 29.75C8.75 25.884 11.884 22.75 15.75 22.75C15.75 22.75 15.75 22.75 15.75 22.75C15.75 16.151 21.151 10.75 27.75 10.75C33.124 10.75 37.654 14.37 39.05 19.25C43.366 19.7 46.75 23.356 46.75 27.75C46.75 32.583 42.833 36.75 38.5 36.75Z" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M17.5 43.75L15.75 49" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24.5 43.75L22.75 49" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M31.5 43.75L29.75 49" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function EconomyIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M10.5 42L19.25 29.75L26.25 35L33.25 21L45.5 14" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="45.5" cy="14" r="4" fill="#FF5222" />
      <path d="M10.5 42H45.5" stroke="#070808" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19.25 42V35" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26.25 42V38.5" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M33.25 42V28" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40.25 42V21" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ===== ADDITIONAL ICONS ===== */

export function SwordIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M38.5 8.75L47.25 17.5L33.25 31.5L24.5 22.75L38.5 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M24.5 22.75L14 33.25L10.5 38.5L17.5 45.5L22.75 42L33.25 31.5" stroke="#070808" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <path d="M10.5 45.5L17.5 38.5" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43.75" cy="12.25" r="3" fill="#FF5222" />
    </svg>
  );
}

export function ShieldIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75L45.5 17.5V28C45.5 38.5 37.625 46.375 28 49C18.375 46.375 10.5 38.5 10.5 28V17.5L28 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M28 21V35" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
      <path d="M21 28H35" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MicIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="19.25" y="8.75" width="17.5" height="26.25" rx="8.75" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M12.25 28C12.25 36.698 19.302 43.75 28 43.75C36.698 43.75 43.75 36.698 43.75 28" stroke="#070808" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M28 43.75V49" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M21 49H35" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="21" r="3" fill="#FF5222" />
    </svg>
  );
}

export function FlagIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M14 8.75V47.25" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14 8.75H42L35 21L42 33.25H14" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M14 15.75H35L30.625 21L35 26.25H14" fill="#FF5222" />
    </svg>
  );
}

export function ColorDotIcon({ size = 56, className, dotColor }: IconProps & { dotColor?: string }) {
  const c = dotColor || "#FF5222";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="19.25" stroke="#070808" strokeWidth="3.5" fill="none" />
      <circle cx="28" cy="28" r="12" fill={c} />
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.6" />
    </svg>
  );
}

export function BankIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 8.75L8.75 21H47.25L28 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M10.5 42H45.5V47.25H10.5V42Z" stroke="#070808" strokeWidth="3" fill="none" />
      <path d="M15.75 24.5V38.5" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M24.5 24.5V38.5" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <path d="M33.25 24.5V38.5" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 24.5V38.5" stroke="#FF5222" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="15.75" r="2.5" fill="#FF5222" />
    </svg>
  );
}

export function StoreIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M10.5 24.5V45.5H45.5V24.5" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <path d="M8.75 10.5H47.25L45.5 24.5H10.5L8.75 10.5Z" stroke="#070808" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <rect x="21" y="33.25" width="14" height="12.25" rx="2" stroke="#FF5222" strokeWidth="2.5" fill="none" />
      <path d="M17.5 17.5C17.5 20.5 15 24.5 15 24.5H24.5C24.5 24.5 22 20.5 22 17.5" stroke="#FF5222" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function GearIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="8.75" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M28 8.75V14M28 42V47.25M8.75 28H14M42 28H47.25M14.35 14.35L18.2 18.2M37.8 37.8L41.65 41.65M14.35 41.65L18.2 37.8M37.8 18.2L41.65 14.35" stroke="#070808" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="28" r="4" fill="#FF5222" />
    </svg>
  );
}

export function ClipboardIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="14" y="12.25" width="28" height="35" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M22.75 8.75H33.25V14H22.75V8.75Z" stroke="#070808" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M21 24.5H35" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21 31.5H31.5" stroke="#FF5222" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21 38.5H28" stroke="#FF5222" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="15.75" y="8.75" width="24.5" height="38.5" rx="4" stroke="#070808" strokeWidth="3.5" fill="none" />
      <path d="M15.75 38.5H40.25" stroke="#070808" strokeWidth="2" />
      <circle cx="28" cy="43.75" r="2.5" fill="#FF5222" />
      <path d="M24.5 12.25H31.5" stroke="#FF5222" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M47.25 8.75L24.5 31.5" stroke="#070808" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M47.25 8.75L33.25 47.25L24.5 31.5L8.75 22.75L47.25 8.75Z" stroke="#070808" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <circle cx="36.75" cy="19.25" r="3" fill="#FF5222" />
    </svg>
  );
}

/* ===== ICON LOOKUP MAP ===== */
export const TwoToneIconMap: Record<string, React.ComponentType<IconProps>> = {
  "shield-check": ShieldCheckIcon,
  "coin": CoinIcon,
  "globe": GlobeIcon,
  "link": LinkIcon,
  "handshake": HandshakeIcon,
  "money": MoneyIcon,
  "chart": ChartIcon,
  "camera": CameraIcon,
  "people": PeopleIcon,
  "megaphone": MegaphoneIcon,
  "image": ImageIcon,
  "package": PackageIcon,
  "gift": GiftIcon,
  "trophy": TrophyIcon,
  "lightning": LightningIcon,
  "target": TargetIcon,
  "star": StarIcon,
  "user-check": UserCheckIcon,
  "rocket": RocketIcon,
  "bar-chart": BarChartIcon,
  "wallet": WalletIcon,
  "clock": ClockIcon,
  "fire": FireIcon,
  "crown": CrownIcon,
  "check-circle": CheckCircleIcon,
  "basketball": BasketballIcon,
  "dice": DiceIcon,
  "boxing": BoxingIcon,
  "esports": EsportsIcon,
  "bingo": BingoIcon,
  "lottery": LotteryIcon,
  "showbiz": ShowbizIcon,
  "weather": WeatherIcon,
  "economy": EconomyIcon,
  "sword": SwordIcon,
  "shield": ShieldIcon,
  "mic": MicIcon,
  "flag": FlagIcon,
  "bank": BankIcon,
  "store": StoreIcon,
  "gear": GearIcon,
  "clipboard": ClipboardIcon,
  "phone": PhoneIcon,
  "send": SendIcon,
};

/* ===== EMOJI → ICON MAPPER ===== */
const EMOJI_MAP: Record<string, React.ComponentType<IconProps>> = {
  "🏀": BasketballIcon,
  "🎲": DiceIcon,
  "🥊": BoxingIcon,
  "🎮": EsportsIcon,
  "💯": BingoIcon,
  "🎱": BingoIcon,
  "🎰": LotteryIcon,
  "⭐": ShowbizIcon,
  "🌪": WeatherIcon,
  "🌪️": WeatherIcon,
  "📈": EconomyIcon,
  "📊": ChartIcon,
  "💰": MoneyIcon,
  "🇵🇭": FlagIcon,
  "⚡": LightningIcon,
  "🎁": GiftIcon,
  "🏆": TrophyIcon,
  "💡": StarIcon,
  "🤝": HandshakeIcon,
  "🔥": FireIcon,
  "🌟": StarIcon,
  "👑": CrownIcon,
  "✅": CheckCircleIcon,
  "🔗": LinkIcon,
  "📢": MegaphoneIcon,
  "👥": PeopleIcon,
  "🎬": CameraIcon,
  "🖼️": ImageIcon,
  "📦": PackageIcon,
  "🎯": TargetIcon,
  "🚀": RocketIcon,
  "⚔️": SwordIcon,
  "🛡️": ShieldIcon,
  "🗡️": SwordIcon,
  "🎤": MicIcon,
  "📱": PhoneIcon,
  "🎥": CameraIcon,
  "💻": EsportsIcon,
  "🗣️": MegaphoneIcon,
  "✨": StarIcon,
  "💎": StarIcon,
  "🪙": CoinIcon,
  "💳": WalletIcon,
  "🔒": ShieldCheckIcon,
  "💬": MegaphoneIcon,
  "📖": TargetIcon,
  "🚪": LinkIcon,
  "🏦": BankIcon,
  "🏪": StoreIcon,
  "🎭": ShowbizIcon,
  "🌀": WeatherIcon,
  "📋": ClipboardIcon,
  "⚙️": GearIcon,
  "✈️": SendIcon,
  "📞": PhoneIcon,
  "💙": LinkIcon,
  "🔵": GlobeIcon,
  "🔷": GlobeIcon,
  "🔔": StarIcon,
  "📅": ClipboardIcon,
  "⏳": ClockIcon,
  "🔴": TargetIcon,
  "🔍": TargetIcon,
};

/* ===== EmojiIcon COMPONENT ===== */
export function EmojiIcon({ emoji, size = 56, className }: { emoji: string; size?: number; className?: string }) {
  const Comp = EMOJI_MAP[emoji];
  if (Comp) return <Comp size={size} className={className} />;
  return <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{emoji}</span>;
}

export const EMOJI_ICON_MAP = EMOJI_MAP;