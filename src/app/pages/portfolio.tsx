import { useState } from "react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { EmojiIcon } from "../components/two-tone-icons";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";
import { useAuth } from "../components/auth-context";
import { PortfolioSkeleton } from "../components/page-skeleton";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== MOCK DATA ==================== */
const PORTFOLIO_CHART_DATA = [
  { day: "Mon", value: 4200 },
  { day: "Tue", value: 4550 },
  { day: "Wed", value: 4380 },
  { day: "Thu", value: 4900 },
  { day: "Fri", value: 5200 },
  { day: "Sat", value: 5050 },
  { day: "Sun", value: 5420 },
];

interface Position {
  id: string;
  title: string;
  emoji: string;
  category: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  probability: number;
  volume: string;
  bettors: number;
  status: "active" | "won" | "lost" | "pending";
  expiresAt: string;
  placedAt: string;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: "1", title: "PBA Philippine Cup Finals - SMB vs TNT", emoji: "🏀",
    category: "Sports", outcome: "SMB Wins", shares: 50, avgPrice: 0.62,
    currentPrice: 0.78, probability: 78, volume: "₱890K", bettors: 3420,
    status: "active", expiresAt: "Mar 20, 2026", placedAt: "Feb 14, 2026",
  },
  {
    id: "2", title: "Manny Pacquiao Returns to Boxing in 2026?", emoji: "🥊",
    category: "Sports", outcome: "Yes", shares: 100, avgPrice: 0.35,
    currentPrice: 0.42, probability: 42, volume: "₱540K", bettors: 2180,
    status: "active", expiresAt: "Jun 30, 2026", placedAt: "Jan 20, 2026",
  },
  {
    id: "3", title: "PHP/USD Rate Below ₱55 by April", emoji: "💱",
    category: "Finance", outcome: "Yes", shares: 75, avgPrice: 0.45,
    currentPrice: 0.31, probability: 31, volume: "₱210K", bettors: 890,
    status: "active", expiresAt: "Apr 1, 2026", placedAt: "Feb 28, 2026",
  },
  {
    id: "7", title: "MLBB M6 World Championship - PH Team Wins", emoji: "🎮",
    category: "Esports", outcome: "Blacklist Intl", shares: 80, avgPrice: 0.55,
    currentPrice: 0.68, probability: 68, volume: "₱320K", bettors: 1540,
    status: "active", expiresAt: "May 15, 2026", placedAt: "Mar 01, 2026",
  },
  {
    id: "8", title: "Color Game - Triple Red Streak (Round #4421)", emoji: "🎲",
    category: "Color Game", outcome: "Triple Red", shares: 25, avgPrice: 0.12,
    currentPrice: 0.18, probability: 18, volume: "₱45K", bettors: 620,
    status: "active", expiresAt: "Apr 13, 2026", placedAt: "Apr 13, 2026",
  },
  {
    id: "9", title: "Super Lotto 6/49 Jackpot Over ₱100M by May", emoji: "🎰",
    category: "Lottery", outcome: "Yes", shares: 40, avgPrice: 0.60,
    currentPrice: 0.72, probability: 72, volume: "₱180K", bettors: 950,
    status: "active", expiresAt: "May 31, 2026", placedAt: "Mar 15, 2026",
  },
  {
    id: "4", title: "Next Manila Mayor - Isko Moreno", emoji: "🏛️",
    category: "Politics", outcome: "Isko Moreno", shares: 30, avgPrice: 0.52,
    currentPrice: 0.52, probability: 52, volume: "₱430K", bettors: 1890,
    status: "pending", expiresAt: "May 2028", placedAt: "Dec 10, 2025",
  },
  {
    id: "10", title: "Bingo Super Card - Pattern B Win Streak", emoji: "🎱",
    category: "Bingo", outcome: "5+ Streak", shares: 15, avgPrice: 0.22,
    currentPrice: 0.22, probability: 22, volume: "₱28K", bettors: 340,
    status: "pending", expiresAt: "Apr 20, 2026", placedAt: "Apr 10, 2026",
  },
  {
    id: "5", title: "Typhoon Season 2025 - More than 20 storms", emoji: "🌀",
    category: "Weather", outcome: "Yes", shares: 60, avgPrice: 0.70,
    currentPrice: 1.00, probability: 100, volume: "₱150K", bettors: 780,
    status: "won", expiresAt: "Dec 31, 2025", placedAt: "Aug 15, 2025",
  },
  {
    id: "11", title: "Gilas Pilipinas FIBA Asia Cup - Top 4 Finish", emoji: "🏀",
    category: "Sports", outcome: "Top 4", shares: 45, avgPrice: 0.40,
    currentPrice: 1.00, probability: 100, volume: "₱280K", bettors: 1230,
    status: "won", expiresAt: "Sep 20, 2025", placedAt: "Jul 05, 2025",
  },
  {
    id: "6", title: "Miss Universe 2025 Winner - Philippines", emoji: "👑",
    category: "Entertainment", outcome: "Philippines", shares: 40, avgPrice: 0.15,
    currentPrice: 0.00, probability: 0, volume: "₱95K", bettors: 560,
    status: "lost", expiresAt: "Nov 16, 2025", placedAt: "Sep 20, 2025",
  },
  {
    id: "12", title: "Bitcoin Hits $100K Before 2026", emoji: "₿",
    category: "Finance", outcome: "Yes", shares: 20, avgPrice: 0.72,
    currentPrice: 0.00, probability: 0, volume: "₱310K", bettors: 2400,
    status: "lost", expiresAt: "Dec 31, 2025", placedAt: "Oct 01, 2025",
  },
];

const SUMMARY = {
  totalValue: 5420,
  totalInvested: 4180,
  totalPnl: 1240,
  pnlPercent: 29.7,
  activeBets: 6,
  wonBets: 2,
  lostBets: 2,
  pendingBets: 2,
  winRate: 50,
};

/* ==================== HELPERS ==================== */
function pnl(pos: Position) {
  return (pos.currentPrice - pos.avgPrice) * pos.shares;
}
function pnlPct(pos: Position) {
  if (pos.avgPrice === 0) return 0;
  return ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
}
function posValue(pos: Position) {
  return pos.currentPrice * pos.shares;
}
function posCost(pos: Position) {
  return pos.avgPrice * pos.shares;
}

const STATUS_CONFIG = {
  active: { bg: "#e6fff3", text: "#00bf85", label: "Active", border: "#00bf85", dot: "#00bf85" },
  won: { bg: "#e6fff3", text: "#00a36c", label: "Won", border: "#00a36c", dot: "#00a36c" },
  lost: { bg: "#fff0f0", text: "#e53e3e", label: "Lost", border: "#e53e3e", dot: "#e53e3e" },
  pending: { bg: "#fff8ed", text: "#d69e2e", label: "Pending", border: "#d69e2e", dot: "#d69e2e" },
};

/* ==================== TABS ==================== */
type TabId = "all" | "active" | "won" | "lost" | "pending";
const TABS: { id: TabId; label: string; count: number }[] = [
  { id: "all", label: "All", count: MOCK_POSITIONS.length },
  { id: "active", label: "Active", count: SUMMARY.activeBets },
  { id: "won", label: "Won", count: SUMMARY.wonBets },
  { id: "lost", label: "Lost", count: SUMMARY.lostBets },
  { id: "pending", label: "Pending", count: SUMMARY.pendingBets },
];

type SortKey = "newest" | "pnl-high" | "pnl-low" | "value-high" | "expiry-soon";

/* ==================== STAT CARD ==================== */
function StatCard({ emoji, label, value, sub, accent }: { emoji: string; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #f0f1f3" }}>
      <div className="flex items-center gap-2 mb-2">
        <EmojiIcon emoji={emoji} size={18} />
        <span className="text-[#84888c] text-[12px]" style={{ ...ss, fontWeight: 500 }}>{label}</span>
      </div>
      <div className="text-[#070808] text-[22px]" style={{ ...pp, fontWeight: 700 }}>{value}</div>
      {sub && <span className="text-[12px]" style={{ color: accent || "#84888c", fontWeight: 600, ...ss }}>{sub}</span>}
    </div>
  );
}

/* ==================== POSITION CARD ==================== */
function PositionCard({ pos, onClick }: { pos: Position; onClick: () => void }) {
  const profit = pnl(pos);
  const pct = pnlPct(pos);
  const cost = posCost(pos);
  const value = posValue(pos);
  const cfg = STATUS_CONFIG[pos.status];
  const isPositive = profit >= 0;
  const isSettled = pos.status === "won" || pos.status === "lost";

  return (
    <div
      className="bg-white rounded-xl cursor-pointer hover:shadow-md transition-all group overflow-hidden"
      style={{ border: "1px solid #f0f1f3" }}
      onClick={onClick}
    >
      {/* Color top bar */}
      <div className="h-[3px] w-full" style={{ background: cfg.border }} />

      <div className="p-4 md:p-5">
        {/* Row 1: Header — emoji + title + status + P&L */}
        <div className="flex items-start gap-3">
          {/* Emoji icon */}
          <div
            className="size-10 md:size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${cfg.border}12` }}
          >
            <EmojiIcon emoji={pos.emoji} size={22} />
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#070808] text-[14px] md:text-[15px] truncate" style={{ ...pp, fontWeight: 600 }}>
                {pos.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "#f5f6f7", color: "#84888c", fontWeight: 600, ...ss }}
              >
                {pos.category}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.text, fontWeight: 700, ...ss }}
              >
                {cfg.label}
              </span>
              <span className="text-[#b0b3b8] text-[10px]" style={ss}>
                Expires {pos.expiresAt}
              </span>
            </div>
          </div>

          {/* P&L badge — desktop */}
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div
              className="text-[16px] md:text-[18px]"
              style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 700, ...ss }}
            >
              {isPositive ? "+" : ""}₱{Math.abs(profit).toFixed(0)}
            </div>
            <div
              className="text-[12px] flex items-center gap-1"
              style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 600, ...ss }}
            >
              <svg className="size-3" viewBox="0 0 12 12" fill="none">
                <path
                  d={isPositive ? "M6 2L10 7H2L6 2Z" : "M6 10L2 5H10L6 10Z"}
                  fill="currentColor"
                />
              </svg>
              {Math.abs(pct).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Row 2: Position details grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {/* Your Pick */}
          <div>
            <div className="text-[10px] text-[#b0b3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600, ...ss }}>
              Your Pick
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full" style={{ background: cfg.dot }} />
              <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss }}>
                {pos.outcome}
              </span>
            </div>
          </div>

          {/* Shares & Entry */}
          <div>
            <div className="text-[10px] text-[#b0b3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600, ...ss }}>
              Shares / Entry
            </div>
            <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss }}>
              {pos.shares} <span className="text-[#84888c]" style={{ fontWeight: 500 }}>@ ₱{pos.avgPrice.toFixed(2)}</span>
            </span>
          </div>

          {/* Invested */}
          <div>
            <div className="text-[10px] text-[#b0b3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600, ...ss }}>
              Invested
            </div>
            <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss }}>
              ₱{cost.toFixed(0)}
            </span>
          </div>

          {/* Current Value */}
          <div>
            <div className="text-[10px] text-[#b0b3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600, ...ss }}>
              Current Value
            </div>
            <span className="text-[13px]" style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 700, ...ss }}>
              ₱{value.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Row 3: Probability bar + P&L mobile + action */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Probability bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#b0b3b8] uppercase tracking-wider" style={{ fontWeight: 600, ...ss }}>
                Probability
              </span>
              <span className="text-[12px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>
                {pos.probability}%
              </span>
            </div>
            <div className="h-2 bg-[#f5f6f7] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pos.probability}%`,
                  background: pos.probability >= 60 ? "#00bf85" : pos.probability >= 35 ? "#d69e2e" : "#e53e3e",
                }}
              />
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[10px] text-[#b0b3b8]" style={ss}>
                {pos.volume} vol
              </span>
              <span className="text-[10px] text-[#dfe0e2]">|</span>
              <span className="text-[10px] text-[#b0b3b8]" style={ss}>
                {pos.bettors.toLocaleString()} bettors
              </span>
              <span className="text-[10px] text-[#dfe0e2]">|</span>
              <span className="text-[10px] text-[#b0b3b8]" style={ss}>
                Placed {pos.placedAt}
              </span>
            </div>
          </div>

          {/* P&L mobile */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#b0b3b8] uppercase" style={{ fontWeight: 600, ...ss }}>P&L</span>
              <span
                className="text-[16px]"
                style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 700, ...ss }}
              >
                {isPositive ? "+" : ""}₱{Math.abs(profit).toFixed(0)}
              </span>
              <span
                className="text-[12px]"
                style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 600, ...ss }}
              >
                ({isPositive ? "+" : ""}{pct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isSettled && (
              <button
                className="h-8 px-4 rounded-lg text-[12px] transition-all cursor-pointer"
                style={{
                  background: "#ff5222",
                  color: "#fff",
                  fontWeight: 600,
                  ...ss,
                }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                Sell
              </button>
            )}
            {isSettled && pos.status === "won" && (
              <button
                className="h-8 px-4 rounded-lg text-[12px] transition-all cursor-pointer"
                style={{
                  background: "#e6fff3",
                  color: "#00a36c",
                  fontWeight: 600,
                  ...ss,
                }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                Claim ₱{value.toFixed(0)}
              </button>
            )}
            <button
              className="h-8 px-3 rounded-lg text-[12px] transition-all cursor-pointer hover:bg-[#f5f6f7]"
              style={{
                background: "#fafafa",
                color: "#84888c",
                fontWeight: 500,
                border: "1px solid #f0f1f3",
                ...ss,
              }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function PortfolioPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const openDeposit = () => setModalOpen(true);

  const filtered = activeTab === "all"
    ? MOCK_POSITIONS
    : MOCK_POSITIONS.filter(p => p.status === activeTab);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "pnl-high": return pnl(b) - pnl(a);
      case "pnl-low": return pnl(a) - pnl(b);
      case "value-high": return posValue(b) - posValue(a);
      case "expiry-soon": return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      default: return 0; // newest = original order
    }
  });

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Totals for current filtered view
  const filteredPnl = sorted.reduce((sum, p) => sum + pnl(p), 0);
  const filteredValue = sorted.reduce((sum, p) => sum + posValue(p), 0);
  const filteredCost = sorted.reduce((sum, p) => sum + posCost(p), 0);

  return (
    <div className="bg-[#f7f8fa] flex flex-col min-h-screen w-full" style={pp}>
      <div className="flex items-stretch flex-1">
        <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <AuthGate pageName="Portfolio">
            {!isLoggedIn ? (
              <PortfolioSkeleton />
            ) : (
              <div className="px-4 md:px-6 py-5 space-y-5 max-w-[1200px]">
              {/* Page Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[#070808] text-[22px] flex items-center gap-2" style={{ ...pp, fontWeight: 700 }}>
                    <EmojiIcon emoji="📊" size={24} /> My Portfolio
                  </h1>
                  <p className="text-[#84888c] text-[13px] mt-0.5" style={ss}>Track your positions and performance</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard emoji="💰" label="Portfolio Value" value={`₱${SUMMARY.totalValue.toLocaleString()}`} sub={`+${SUMMARY.pnlPercent}% all time`} accent="#00bf85" />
                <StatCard emoji="📈" label="Total P&L" value={`+₱${SUMMARY.totalPnl.toLocaleString()}`} sub={`on ₱${SUMMARY.totalInvested.toLocaleString()} invested`} accent="#00bf85" />
                <StatCard emoji="🎯" label="Win Rate" value={`${SUMMARY.winRate}%`} sub={`${SUMMARY.wonBets}W / ${SUMMARY.lostBets}L`} />
                <StatCard emoji="🔥" label="Active Bets" value={String(SUMMARY.activeBets)} sub={`${MOCK_POSITIONS.length} total positions`} />
              </div>

              {/* Portfolio Chart */}
              <div className="bg-white rounded-xl p-4 md:p-5" style={{ border: "1px solid #f0f1f3" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <EmojiIcon emoji="📈" size={18} />
                    <span className="text-[#070808] text-[15px]" style={{ ...pp, fontWeight: 600 }}>Portfolio Value (7 Days)</span>
                  </div>
                  <span className="text-[#00bf85] text-[13px]" style={{ ...ss, fontWeight: 700 }}>+₱1,220 (+29.0%)</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={PORTFOLIO_CHART_DATA}>
                    <defs key="defs">
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5222" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#ff5222" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis key="xaxis" dataKey="day" tick={{ fill: "#84888c", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis key="yaxis" tick={{ fill: "#84888c", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 200", "dataMax + 200"]} />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{ background: "#fff", border: "1px solid #f0f1f3", borderRadius: 10, fontSize: 12 }}
                      formatter={(val: number) => [`₱${val.toLocaleString()}`, "Value"]}
                    />
                    <Area key="area" type="monotone" dataKey="value" stroke="#ff5222" strokeWidth={2.5} fill="url(#portfolioGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Positions Section */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #f0f1f3" }}>
                {/* Section header */}
                <div className="px-4 md:px-5 pt-4 md:pt-5 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <EmojiIcon emoji="📋" size={18} />
                      <span className="text-[#070808] text-[15px]" style={{ ...pp, fontWeight: 600 }}>Positions</span>
                      <span className="text-[#b0b3b8] text-[13px]" style={{ fontWeight: 500, ...ss }}>({sorted.length})</span>
                    </div>
                    {/* Sort control */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#b0b3b8] hidden sm:inline" style={{ fontWeight: 500, ...ss }}>Sort by</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        className="h-8 px-2.5 rounded-lg text-[12px] text-[#070808] bg-[#fafafa] border border-[#f0f1f3] cursor-pointer outline-none"
                        style={{ fontWeight: 500, ...ss }}
                      >
                        <option value="newest">Newest First</option>
                        <option value="pnl-high">P&L High → Low</option>
                        <option value="pnl-low">P&L Low → High</option>
                        <option value="value-high">Value High → Low</option>
                        <option value="expiry-soon">Expiry Soonest</option>
                      </select>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="px-3 md:px-4 py-2.5 text-[13px] relative transition-colors whitespace-nowrap cursor-pointer shrink-0"
                        style={{
                          color: activeTab === tab.id ? "#070808" : "#84888c",
                          fontWeight: activeTab === tab.id ? 700 : 500,
                          ...ss,
                        }}
                      >
                        {tab.label}
                        <span
                          className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: activeTab === tab.id ? "#ff5222" : "#f5f6f7",
                            color: activeTab === tab.id ? "#fff" : "#b0b3b8",
                            fontWeight: 700,
                            ...ss,
                          }}
                        >
                          {tab.count}
                        </span>
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#ff5222] rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#f0f1f3]" />

                {/* Position Cards */}
                <div className="p-3 md:p-4 space-y-3">
                  {sorted.length === 0 ? (
                    <div className="text-center py-16 text-[#84888c] text-[14px]" style={ss}>
                      <div className="flex justify-center mb-3"><EmojiIcon emoji="📭" size={40} /></div>
                      <p style={{ fontWeight: 600 }}>No positions found</p>
                      <p className="text-[12px] text-[#b0b3b8] mt-1">Try switching tabs or placing a new bet</p>
                      <button
                        className="mt-4 h-9 px-5 bg-[#ff5222] text-white text-[13px] rounded-lg cursor-pointer hover:bg-[#e84a1e] transition-colors"
                        style={{ fontWeight: 600, ...ss }}
                        onClick={() => navigate("/markets")}
                      >
                        Browse Markets
                      </button>
                    </div>
                  ) : (
                    sorted.map(pos => (
                      <PositionCard key={pos.id} pos={pos} onClick={() => navigate(`/market/${pos.id}`)} />
                    ))
                  )}
                </div>

                {/* Summary footer */}
                {sorted.length > 0 && (
                  <>
                    <div className="h-px bg-[#f0f1f3]" />
                    <div className="px-4 md:px-5 py-3 flex items-center justify-between flex-wrap gap-2 bg-[#fafafa]">
                      <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss }}>Invested:</span>
                          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>₱{filteredCost.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss }}>Value:</span>
                          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>₱{filteredValue.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss }}>P&L:</span>
                          <span
                            className="text-[12px]"
                            style={{ color: filteredPnl >= 0 ? "#00bf85" : "#e53e3e", fontWeight: 700, ...ss }}
                          >
                            {filteredPnl >= 0 ? "+" : ""}₱{filteredPnl.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss }}>
                        Showing {sorted.length} of {MOCK_POSITIONS.length} positions
                      </span>
                    </div>
                  </>
                )}
              </div>
              </div>
            )}
            </AuthGate>
          </div>
        </div>
      </div>
      <Footer />
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={SUMMARY.totalValue} />
    </div>
  );
}