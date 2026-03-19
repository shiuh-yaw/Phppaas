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
  status: "active" | "won" | "lost" | "pending";
  expiresAt: string;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: "1", title: "PBA Philippine Cup Finals - SMB vs TNT", emoji: "🏀",
    category: "Sports", outcome: "SMB Wins", shares: 50, avgPrice: 0.62,
    currentPrice: 0.78, status: "active", expiresAt: "Mar 20, 2026",
  },
  {
    id: "2", title: "Manny Pacquiao Returns to Boxing in 2026?", emoji: "🥊",
    category: "Sports", outcome: "Yes", shares: 100, avgPrice: 0.35,
    currentPrice: 0.42, status: "active", expiresAt: "Jun 30, 2026",
  },
  {
    id: "3", title: "PHP/USD Rate Below ₱55 by April", emoji: "💱",
    category: "Finance", outcome: "Yes", shares: 75, avgPrice: 0.45,
    currentPrice: 0.31, status: "active", expiresAt: "Apr 1, 2026",
  },
  {
    id: "4", title: "Next Manila Mayor - Isko Moreno", emoji: "🏛️",
    category: "Politics", outcome: "Isko Moreno", shares: 30, avgPrice: 0.52,
    currentPrice: 0.52, status: "pending", expiresAt: "May 2028",
  },
  {
    id: "5", title: "Typhoon Season 2025 - More than 20 storms", emoji: "🌀",
    category: "Weather", outcome: "Yes", shares: 60, avgPrice: 0.70,
    currentPrice: 1.00, status: "won", expiresAt: "Dec 31, 2025",
  },
  {
    id: "6", title: "Miss Universe 2025 Winner - Philippines", emoji: "👑",
    category: "Entertainment", outcome: "Philippines", shares: 40, avgPrice: 0.15,
    currentPrice: 0.00, status: "lost", expiresAt: "Nov 16, 2025",
  },
];

const SUMMARY = {
  totalValue: 5420,
  totalInvested: 4180,
  totalPnl: 1240,
  pnlPercent: 29.7,
  activeBets: 4,
  wonBets: 1,
  lostBets: 1,
  winRate: 50,
};

/* ==================== HELPERS ==================== */
function pnl(pos: Position) {
  return (pos.currentPrice - pos.avgPrice) * pos.shares;
}
function pnlPct(pos: Position) {
  return ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
}
function statusBadge(status: Position["status"]) {
  switch (status) {
    case "active": return { bg: "#e6fff3", text: "#00bf85", label: "Active" };
    case "won": return { bg: "#e6fff3", text: "#00a36c", label: "Won ✓" };
    case "lost": return { bg: "#fff0f0", text: "#e53e3e", label: "Lost" };
    case "pending": return { bg: "#fff8ed", text: "#d69e2e", label: "Pending" };
  }
}

/* ==================== TABS ==================== */
type TabId = "all" | "active" | "won" | "lost" | "pending";
const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All Positions" },
  { id: "active", label: "Active" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "pending", label: "Pending" },
];

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

/* ==================== POSITION ROW ==================== */
function PositionRow({ pos, onClick }: { pos: Position; onClick: () => void }) {
  const profit = pnl(pos);
  const pct = pnlPct(pos);
  const badge = statusBadge(pos.status);
  const isPositive = profit >= 0;

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
      style={{ border: "1px solid #f0f1f3" }}
      onClick={onClick}
    >
      {/* Icon + Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <EmojiIcon emoji={pos.emoji} size={20} />
          <span className="text-[#070808] text-[14px] truncate" style={{ ...pp, fontWeight: 600 }}>{pos.title}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={ss}>
          <span className="text-[#84888c]">{pos.category}</span>
          <span className="text-[#dfe0e2]">·</span>
          <span className="text-[#070808]" style={{ fontWeight: 600 }}>"{pos.outcome}"</span>
          <span className="text-[#dfe0e2]">·</span>
          <span className="text-[#84888c]">{pos.shares} shares @ ₱{pos.avgPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Current Price */}
      <div className="text-right hidden sm:block">
        <div className="text-[#070808] text-[14px]" style={{ ...ss, fontWeight: 600 }}>₱{pos.currentPrice.toFixed(2)}</div>
        <div className="text-[#84888c] text-[11px]" style={ss}>current</div>
      </div>

      {/* P&L */}
      <div className="text-right w-[90px]">
        <div className="text-[14px]" style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 700, ...ss }}>
          {isPositive ? "+" : ""}₱{profit.toFixed(0)}
        </div>
        <div className="text-[11px]" style={{ color: isPositive ? "#00bf85" : "#e53e3e", fontWeight: 600, ...ss }}>
          {isPositive ? "+" : ""}{pct.toFixed(1)}%
        </div>
      </div>

      {/* Status Badge */}
      <span
        className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: badge.bg, color: badge.text, fontWeight: 700, ...ss }}
      >
        {badge.label}
      </span>

      {/* Expiry */}
      <div className="text-[#84888c] text-[11px] hidden md:block w-[90px] text-right" style={ss}>
        {pos.expiresAt}
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

  const openDeposit = () => setModalOpen(true);

  const filtered = activeTab === "all"
    ? MOCK_POSITIONS
    : MOCK_POSITIONS.filter(p => p.status === activeTab);

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="bg-[#f7f8fa] flex flex-col min-h-screen w-full" style={pp}>
      <div className="flex items-stretch flex-1">
        <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <AuthGate pageName="Portfolio">
            {!isLoggedIn ? (
              <PortfolioSkeleton />
            ) : (
              <div className="px-4 md:px-6 py-5 space-y-5">
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
              <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #f0f1f3" }}>
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

              {/* Positions */}
              <div>
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b mb-4" style={{ borderColor: "#f0f1f3" }}>
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="px-4 py-2.5 text-[13px] relative transition-colors"
                      style={{
                        color: activeTab === tab.id ? "#070808" : "#84888c",
                        fontWeight: activeTab === tab.id ? 700 : 500,
                        ...ss,
                      }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Position List */}
                <div className="space-y-2">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-[#84888c] text-[14px]" style={ss}>
                      <EmojiIcon emoji="📭" size={32} />
                      <p className="mt-2">No positions found</p>
                    </div>
                  ) : (
                    filtered.map(pos => (
                      <PositionRow key={pos.id} pos={pos} onClick={() => navigate(`/market/${pos.id}`)} />
                    ))
                  )}
                </div>
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