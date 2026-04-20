import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  EmojiIcon, ColorDotIcon,
} from "../components/two-tone-icons";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import type { ComponentType } from "react";
import { useAuth } from "../components/auth-context";
import { Footer } from "../components/footer";
import { usePageTheme, toModalTheme } from "../components/theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ====================== GAME TYPES ====================== */
type GameType = "pba" | "color-game" | "nba" | "boxing" | "esports" | "bingo" | "lottery";
type RoundStatus = "settled" | "closed" | "live" | "later";
type BetSide = "up" | "down";

interface GameConfig {
  id: GameType;
  label: string;
  emoji: string;
  Icon?: ComponentType<{ size?: number; className?: string }>;
  tier: number;
  upLabel: string;
  downLabel: string;
  upColor: string;
  downColor: string;
  description: string;
  metric: string;
}

const GAMES: GameConfig[] = [
  { id: "pba", label: "PBA Basketball", emoji: "🏀", tier: 1, upLabel: "Taas", downLabel: "Baba", upColor: "#00bf85", downColor: "#f5222d", description: "Philippine Cup — Ginebra vs SMB", metric: "Score Spread" },
  { id: "color-game", label: "Color Game", emoji: "🎲", tier: 1, upLabel: "Hot", downLabel: "Cold", upColor: "#ff5222", downColor: "#722ed1", description: "Perya Digital — Round #8832", metric: "Color Streak" },
  { id: "nba", label: "NBA Basketball", emoji: "🏀", tier: 1, upLabel: "Taas", downLabel: "Baba", upColor: "#00bf85", downColor: "#f5222d", description: "Celtics vs Lakers — Game 3", metric: "Score Spread" },
  { id: "boxing", label: "Boxing", emoji: "🥊", tier: 2, upLabel: "PH Fighter", downLabel: "Challenger", upColor: "#00bf85", downColor: "#f5222d", description: "Donaire vs Inoue III", metric: "Punch Stats" },
  { id: "esports", label: "Esports (MLBB)", emoji: "🎮", tier: 2, upLabel: "Blacklist", downLabel: "ECHO", upColor: "#00bf85", downColor: "#f5222d", description: "MPL PH S15 Finals", metric: "Gold Diff" },
  { id: "bingo", label: "Bingo", emoji: "🎱", tier: 2, upLabel: "Over", downLabel: "Under", upColor: "#00bf85", downColor: "#f5222d", description: "Super Bingo — Pattern Race", metric: "Number Called" },
  { id: "lottery", label: "PCSO Lottery", emoji: "🎰", tier: 3, upLabel: "Over", downLabel: "Under", upColor: "#00bf85", downColor: "#f5222d", description: "6/45 Mega Lotto — Number Sum", metric: "Winning Sum" },
];

/* ====================== ROUND DATA ====================== */
interface Round {
  id: number;
  status: RoundStatus;
  settleValue?: number;
  lockedValue?: number;
  prizePool: number;
  upPool: number;
  downPool: number;
  pnl?: number;
  countdown?: number;
}

function generateRounds(game: GameConfig): Round[] {
  const base = game.id === "pba" ? 98 : game.id === "color-game" ? 42 : 105;
  return [
    { id: 2321, status: "settled", settleValue: base + 3.2, lockedValue: base + 1.5, prizePool: 125340, upPool: 72000, downPool: 53340, pnl: 1230 },
    { id: 2322, status: "closed", settleValue: undefined, lockedValue: base + 2.8, prizePool: 232232, upPool: 127000, downPool: 105232, countdown: 62 },
    { id: 2323, status: "live", prizePool: 185450, upPool: 102000, downPool: 83450, countdown: 83 },
    { id: 2324, status: "later", prizePool: 0, upPool: 0, downPool: 0, countdown: 154 },
  ];
}

/* ====================== CHART DATA ====================== */
function generateChartData(game: GameConfig) {
  const base = game.id === "pba" ? 98 : game.id === "color-game" ? 38 : game.id === "nba" ? 105 : game.id === "boxing" ? 1.8 : game.id === "esports" ? 3200 : game.id === "bingo" ? 28 : 145;
  const vol = game.id === "color-game" ? 5 : game.id === "esports" ? 400 : game.id === "bingo" ? 4 : game.id === "lottery" ? 12 : 3;
  const points: { time: string; value: number }[] = [];
  const now = new Date();
  let v = base;
  for (let i = 0; i < 24; i++) {
    const t = new Date(now.getTime() - (23 - i) * 15000);
    v += (Math.random() - 0.45) * vol;
    points.push({ time: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`, value: parseFloat(v.toFixed(2)) });
  }
  return points;
}

/* ====================== POSITION DATA ====================== */
interface Position {
  id: string;
  game: string;
  emoji: string;
  roundId: number;
  side: BetSide;
  amount: number;
  status: "Open" | "Won" | "Lost";
  pnl: number;
}

function generatePositions(game: GameConfig): Position[] {
  return [
    { id: "fb1", game: game.label, emoji: game.emoji, roundId: 2320, side: "up", amount: 500, status: "Won", pnl: 455 },
    { id: "fb2", game: game.label, emoji: game.emoji, roundId: 2319, side: "down", amount: 1000, status: "Lost", pnl: -1000 },
    { id: "fb3", game: game.label, emoji: game.emoji, roundId: 2318, side: "up", amount: 750, status: "Won", pnl: 612 },
    { id: "fb4", game: game.label, emoji: game.emoji, roundId: 2317, side: "down", amount: 300, status: "Open", pnl: 0 },
    { id: "fb5", game: game.label, emoji: game.emoji, roundId: 2316, side: "up", amount: 2000, status: "Won", pnl: 1834 },
    { id: "fb6", game: game.label, emoji: game.emoji, roundId: 2315, side: "down", amount: 500, status: "Lost", pnl: -500 },
    { id: "fb7", game: game.label, emoji: game.emoji, roundId: 2314, side: "up", amount: 1500, status: "Won", pnl: 1350 },
    { id: "fb8", game: game.label, emoji: game.emoji, roundId: 2313, side: "down", amount: 800, status: "Lost", pnl: -800 },
    { id: "fb9", game: game.label, emoji: game.emoji, roundId: 2312, side: "up", amount: 250, status: "Open", pnl: 0 },
  ];
}

/* ====================== ROUND CARD COMPONENT ====================== */
function RoundCard({ round, game, isActive, onClick }: { round: Round; game: GameConfig; isActive: boolean; onClick: () => void }) {
  const [countdown, setCountdown] = useState(round.countdown || 0);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (round.status === "live" || round.status === "closed") {
      const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [round.status]);

  const upPct = round.prizePool > 0 ? Math.round((round.upPool / round.prizePool) * 100) : 50;
  const downPct = 100 - upPct;
  const fmt = (n: number) => `₱${n.toLocaleString()}`;
  const fmtMin = (s: number) => `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, "0")}s`;

  if (round.status === "later") {
    return (
      <div onClick={onClick} className={`shrink-0 w-[96px] h-[255px] rounded-xl overflow-hidden cursor-pointer transition-shadow flex flex-col items-center justify-center gap-2 ${isActive ? "shadow-[0_2px_24px_rgba(0,0,0,0.12)]" : "shadow-[0_2px_24px_rgba(0,0,0,0.04)]"}`}
        style={{ background: "#fff", border: isActive ? "2px solid #ff5222" : "1px solid #f5f6f7" }}>
        <span className="text-[12px]" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>Susunod</span>
        <span className="text-[11px]" style={{ color: "#84888c", ...ss, ...pp }}>#{round.id}</span>
        <span className="text-[18px] mt-2" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>{fmtMin(countdown)}</span>
        <span className="text-[11px]" style={{ color: "#84888c", ...ss, ...pp }}>Magsisimula</span>
      </div>
    );
  }

  return (
    <div onClick={onClick} className={`shrink-0 w-[400px] h-[255px] rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-pointer transition-shadow ${isActive ? "shadow-[0_2px_24px_rgba(0,0,0,0.12)]" : "shadow-[0_2px_24px_rgba(0,0,0,0.04)]"}`}
      style={{ background: "#fff", border: isActive ? "2px solid #ff5222" : "1px solid #f5f6f7", opacity: round.status === "settled" ? 0.5 : 1 }}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {round.status === "live" && (
              <div className="relative size-2.5">
                <div className="absolute inset-0 rounded-full bg-[#ff5222] opacity-40 animate-ping" />
                <div className="absolute inset-[25%] rounded-full bg-[#ff5222]" />
              </div>
            )}
            <span className="text-[12px]" style={{ color: round.status === "live" ? "#ff5222" : "#84888c", fontWeight: 500, ...ss, ...pp }}>
              {round.status === "settled" ? "Tapos na" : round.status === "closed" ? "Sarado" : "Live"}
            </span>
            {(round.status === "closed" || round.status === "live") && (
              <span className="text-[12px]" style={{ color: "#a0a3a7", ...ss, ...pp }}>
                {round.status === "closed" ? `Settlement: ${fmtMin(countdown)}` : `Taya hanggang: ${fmtMin(countdown)}`}
              </span>
            )}
          </div>
          <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>#{round.id}</span>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px]" style={{ color: "#84888c", ...ss, ...pp }}>
              {round.status === "settled" ? `${game.metric} (Settled)` : round.status === "closed" ? `${game.metric} (Huling presyo)` : "Prize Pool"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[28px]" style={{ color: round.pnl && round.pnl > 0 ? "#00bf85" : "#070808", fontWeight: 600, ...ss, ...pp }}>
                {round.status === "live" ? fmt(round.prizePool) : round.settleValue ? round.settleValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : round.lockedValue?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
              {round.pnl && round.pnl !== 0 && (
                <span className="text-[12px] px-2 py-0.5 rounded flex items-center gap-0.5" style={{ background: round.pnl > 0 ? "#e6fff3" : "#fff1f0", color: round.pnl > 0 ? "#00bf85" : "#f5222d", fontWeight: 500, ...ss, ...pp }}>
                  {round.pnl > 0 ? "▲" : "▼"}{round.pnl > 0 ? "+" : ""}₱{Math.abs(round.pnl).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {round.lockedValue && round.status !== "live" && (
            <div className="flex justify-between text-[14px]" style={{ ...ss, ...pp }}>
              <span style={{ color: "#84888c" }}>Naka-lock</span>
              <span style={{ color: "#070808", fontWeight: 500 }}>{round.lockedValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {round.prizePool > 0 && (
            <div className="flex justify-between text-[14px]" style={{ ...ss, ...pp }}>
              <span style={{ color: "#84888c" }}>Prize Pool</span>
              <span style={{ color: "#070808", fontWeight: 500 }}>{fmt(round.prizePool)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pool bar */}
      {round.prizePool > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[14px]" style={{ ...ss, ...pp }}>
            <span style={{ color: game.upColor }}>{game.upLabel}: {fmt(round.upPool)} {upPct}%</span>
            <span style={{ color: game.downColor }}>{game.downLabel}: {fmt(round.downPool)} {downPct}%</span>
          </div>
          <div className="flex items-center w-full gap-0.5">
            <div className="h-[7px] rounded-l" style={{ width: `${upPct}%`, background: game.upColor }} />
            <div className="h-[7px] rounded-r" style={{ width: `${downPct}%`, background: game.downColor }} />
          </div>
        </div>
      )}

      {/* Bet buttons for live round */}
      {round.status === "live" && (
        isLoggedIn ? (
        <div className="flex gap-3 mt-1">
          <button className="flex-1 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90" style={{ background: `${game.upColor}15`, ...ss, ...pp }}>
            <span className="text-[16px]" style={{ color: game.upColor, fontWeight: 500 }}>{game.upLabel}</span>
          </button>
          <button className="flex-1 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90" style={{ background: `${game.downColor}15`, ...ss, ...pp }}>
            <span className="text-[16px]" style={{ color: game.downColor, fontWeight: 500 }}>{game.downLabel}</span>
          </button>
        </div>
        ) : (
        <div className="flex gap-2 mt-1">
          <button onClick={(e) => { e.stopPropagation(); navigate("/login"); }} className="flex-1 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors bg-[#ff5222] hover:bg-[#e84a1e]" style={{ ...ss, ...pp }}>
            <span className="text-[14px] text-white" style={{ fontWeight: 600 }}>Sign In</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate("/signup"); }} className="flex-1 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[#f0f1f3]" style={{ background: "#f7f8f9", border: "1px solid #f0f1f3", ...ss, ...pp }}>
            <span className="text-[14px] text-[#070808]" style={{ fontWeight: 500 }}>Sign Up</span>
          </button>
        </div>
        )
      )}
    </div>
  );
}

/* ====================== COLOR GAME SPECIAL ====================== */
const COLORS = [
  { name: "Pula", color: "#f5222d", emoji: "🔴" },
  { name: "Asul", color: "#1890ff", emoji: "🔵" },
  { name: "Berde", color: "#52c41a", emoji: "🟢" },
  { name: "Dilaw", color: "#fadb14", emoji: "🟡" },
  { name: "Puti", color: "#d9d9d9", emoji: "⚪" },
  { name: "Pink", color: "#eb2f96", emoji: "💗" },
];

function ColorGamePanel({ onBet }: { onBet: (color: string, amount: number) => void }) {
  const [amount, setAmount] = useState("100");
  const [selected, setSelected] = useState<string[]>([]);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const toggleColor = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border" style={{ background: "#fff", borderColor: "#f5f6f7" }}>
      <span className="text-[14px] inline-flex items-center gap-1.5" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}><EmojiIcon emoji="🎲" size={18} /> Pumili ng Kulay</span>
      <div className="grid grid-cols-3 gap-2">
        {COLORS.map(c => (
          <button key={c.name} onClick={() => toggleColor(c.name)}
            className="h-14 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ background: selected.includes(c.name) ? `${c.color}20` : "#fafafa", border: selected.includes(c.name) ? `2px solid ${c.color}` : "2px solid transparent" }}>
            <ColorDotIcon size={20} dotColor={c.color} />
            <span className="text-[13px]" style={{ color: selected.includes(c.name) ? c.color : "#84888c", fontWeight: 500, ...ss, ...pp }}>{c.name}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Halaga ng Taya (₱)</span>
        <div className="flex gap-2">
          {["50", "100", "500", "1000"].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className="flex-1 h-9 rounded-md cursor-pointer transition-colors text-[13px]"
              style={{ background: amount === v ? "#ff5222" : "#fafafa", color: amount === v ? "#fff" : "#070808", fontWeight: 500, ...ss, ...pp }}>
              ₱{v}
            </button>
          ))}
        </div>
        <input type="text" value={amount} onChange={e => setAmount(e.target.value)}
          className="h-10 rounded-lg px-3 text-[14px] w-full outline-none"
          style={{ background: "#fafafa", border: "1px solid #f5f6f7", color: "#070808", ...ss, ...pp }} />
      </div>
      {isLoggedIn ? (
        <button disabled={selected.length === 0}
          onClick={() => selected.forEach(c => onBet(c, parseInt(amount) || 100))}
          className="h-12 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#ff5222", ...ss, ...pp }}>
          <span className="text-[16px] text-white" style={{ fontWeight: 600 }}>
            Tumaya sa {selected.length} na kulay — ₱{((parseInt(amount) || 0) * selected.length).toLocaleString()}
          </span>
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="flex-1 h-12 rounded-lg cursor-pointer transition-colors bg-[#ff5222] hover:bg-[#e84a1e]" style={{ ...ss, ...pp }}>
            <span className="text-[16px] text-white" style={{ fontWeight: 600 }}>Mag-sign In para Tumaya</span>
          </button>
          <button onClick={() => navigate("/signup")} className="h-12 px-5 rounded-lg cursor-pointer transition-colors hover:bg-[#f0f1f3]" style={{ background: "#f7f8f9", border: "1px solid #f0f1f3", ...ss, ...pp }}>
            <span className="text-[14px] text-[#070808]" style={{ fontWeight: 500 }}>Sign Up</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ====================== BET PANEL ====================== */
function BetPanel({ game, onBet }: { game: GameConfig; onBet: (side: BetSide, amount: number) => void }) {
  const [amount, setAmount] = useState("100");
  const [selectedSide, setSelectedSide] = useState<BetSide | null>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border" style={{ background: "#fff", borderColor: "#f5f6f7" }}>
      <div className="flex items-center gap-2">
        <EmojiIcon emoji={game.emoji} size={22} />
        <span className="text-[14px]" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>Quick Bet — {game.label}</span>
      </div>

      {/* Side selection */}
      <div className="flex gap-3">
        <button onClick={() => setSelectedSide("up")}
          className="flex-1 h-14 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          style={{ background: selectedSide === "up" ? `${game.upColor}15` : "#fafafa", border: selectedSide === "up" ? `2px solid ${game.upColor}` : "2px solid transparent" }}>
          <span className="text-[16px]" style={{ color: selectedSide === "up" ? game.upColor : "#84888c", fontWeight: 600, ...ss, ...pp }}>{game.upLabel}</span>
        </button>
        <button onClick={() => setSelectedSide("down")}
          className="flex-1 h-14 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          style={{ background: selectedSide === "down" ? `${game.downColor}15` : "#fafafa", border: selectedSide === "down" ? `2px solid ${game.downColor}` : "2px solid transparent" }}>
          <span className="text-[16px]" style={{ color: selectedSide === "down" ? game.downColor : "#84888c", fontWeight: 600, ...ss, ...pp }}>{game.downLabel}</span>
        </button>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-2">
        <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Halaga ng Taya (₱)</span>
        <div className="flex gap-2">
          {["50", "100", "500", "1000", "5000"].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className="flex-1 h-9 rounded-md cursor-pointer transition-colors text-[13px]"
              style={{ background: amount === v ? "#ff5222" : "#fafafa", color: amount === v ? "#fff" : "#070808", fontWeight: 500, ...ss, ...pp }}>
              ₱{parseInt(v).toLocaleString()}
            </button>
          ))}
        </div>
        <input type="text" value={amount} onChange={e => setAmount(e.target.value)}
          className="h-10 rounded-lg px-3 text-[14px] w-full outline-none"
          style={{ background: "#fafafa", border: "1px solid #f5f6f7", color: "#070808", ...ss, ...pp }} />
      </div>

      {/* Payout estimate */}
      <div className="flex justify-between text-[13px] px-1" style={{ ...ss, ...pp }}>
        <span style={{ color: "#84888c" }}>Estimated Payout</span>
        <span style={{ color: "#070808", fontWeight: 600 }}>₱{((parseInt(amount) || 0) * 1.85).toLocaleString()} (1.85x)</span>
      </div>

      {/* Confirm */}
      {isLoggedIn ? (
        <button disabled={!selectedSide}
          onClick={() => selectedSide && onBet(selectedSide, parseInt(amount) || 100)}
          className="h-12 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: selectedSide === "up" ? game.upColor : selectedSide === "down" ? game.downColor : "#ff5222", ...ss, ...pp }}>
          <span className="text-[16px] text-white" style={{ fontWeight: 600 }}>
            {selectedSide ? `Tumaya ${selectedSide === "up" ? game.upLabel : game.downLabel} — ₱${(parseInt(amount) || 0).toLocaleString()}` : "Pumili ng side"}
          </span>
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="flex-1 h-12 rounded-lg cursor-pointer transition-colors bg-[#ff5222] hover:bg-[#e84a1e]" style={{ ...ss, ...pp }}>
            <span className="text-[16px] text-white" style={{ fontWeight: 600 }}>Mag-sign In para Tumaya</span>
          </button>
          <button onClick={() => navigate("/signup")} className="h-12 px-5 rounded-lg cursor-pointer transition-colors hover:bg-[#f0f1f3]" style={{ background: "#f7f8f9", border: "1px solid #f0f1f3", ...ss, ...pp }}>
            <span className="text-[14px] text-[#070808]" style={{ fontWeight: 500 }}>Sign Up</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ====================== MAIN PAGE ====================== */
export default function FastBetPage() {
  const [activeGame, setActiveGame] = useState<GameConfig>(GAMES[0]);
  const [rounds, setRounds] = useState(() => generateRounds(GAMES[0]));
  const [chartData, setChartData] = useState(() => generateChartData(GAMES[0]));
  const [positions, setPositions] = useState(() => generatePositions(GAMES[0]));
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [betConfirmed, setBetConfirmed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const modalTheme: ModalTheme = toModalTheme(usePageTheme());

  const selectGame = useCallback((g: GameConfig) => {
    setActiveGame(g);
    setRounds(generateRounds(g));
    setChartData(generateChartData(g));
    setPositions(generatePositions(g));
    setShowGameDropdown(false);
  }, []);

  // Animate chart
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const vol = activeGame.id === "color-game" ? 5 : activeGame.id === "esports" ? 400 : 3;
        const now = new Date();
        const newVal = last.value + (Math.random() - 0.48) * vol;
        const newPoint = {
          time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
          value: parseFloat(newVal.toFixed(2)),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGame]);

  const handleBet = (side: BetSide | string, amount: number) => {
    setBetConfirmed(true);
    setTimeout(() => setBetConfirmed(false), 2000);
  };

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const prevValue = chartData[chartData.length - 2]?.value || currentValue;
  const isUp = currentValue >= prevValue;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...pp, background: modalTheme.bg === "#16171a" ? "#0d0e10" : "#f7f8fa" }}>
      <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 pb-24 md:pb-6">

            {/* ===== TAB BAR: Events / Fast Bet ===== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5 h-10">
                <button onClick={() => navigate("/markets")} className="text-[14px] cursor-pointer transition-colors" style={{ color: "#84888c", fontWeight: 500, ...ss, ...pp }}>Events</button>
                <button className="relative text-[14px] cursor-pointer" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>
                  Fast Bet
                  <div className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />
                </button>
              </div>

              {/* Game selector */}
              <div className="relative">
                <button onClick={() => setShowGameDropdown(!showGameDropdown)}
                  className="flex items-center gap-2 h-10 px-3 rounded-lg cursor-pointer transition-colors"
                  style={{ background: "#fafafa", border: "1px solid #f5f6f7" }}>
                  <EmojiIcon emoji={activeGame.emoji} size={20} />
                  <span className="text-[14px]" style={{ color: "#070808", ...ss, ...pp }}>{activeGame.label}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "#fff4ed", color: "#ff5222", fontWeight: 600, ...ss, ...pp }}>
                    Tier {activeGame.tier}
                  </span>
                  <svg className={`size-4 transition-transform ${showGameDropdown ? "rotate-180" : ""}`} viewBox="0 0 11.5039 6.50377" fill="none">
                    <path d="M11.2826 1.28318L6.28255 6.28318C6.21287 6.3531 6.13008 6.40857 6.03892 6.44643C5.94775 6.48428 5.85001 6.50377 5.7513 6.50377C5.65259 6.50377 5.55485 6.48428 5.46369 6.44643C5.37252 6.40857 5.28973 6.3531 5.22005 6.28318L0.220051 1.28318C0.0791548 1.14228 -2.09952e-09 0.951183 0 0.751926C2.09952e-09 0.552669 0.0791548 0.361572 0.220051 0.220676C0.360947 0.0797797 0.552044 0.000625136 0.751301 0.000625134C0.950558 0.000625131 1.14165 0.0797797 1.28255 0.220676L5.75193 4.69005L10.2213 0.220051C10.3622 0.079155 10.5533 0 10.7526 0C10.9518 0 11.1429 0.079155 11.2838 0.220051C11.4247 0.360948 11.5039 0.552044 11.5039 0.751301C11.5039 0.950559 11.4247 1.14166 11.2838 1.28255L11.2826 1.28318Z" fill="#070808" />
                  </svg>
                </button>

                {showGameDropdown && (
                  <div className="absolute top-12 left-0 z-50 rounded-xl border py-2 min-w-[320px] max-h-[400px] overflow-y-auto"
                    style={{ background: "#fff", borderColor: "#f5f6f7", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                    {[1, 2, 3].map(tier => (
                      <div key={tier}>
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: "#a0a3a7", fontWeight: 600, ...ss, ...pp }}>
                            Tier {tier} {tier === 1 ? "— Pinaka-Popular" : tier === 2 ? "— High Value" : "— Growth"}
                          </span>
                        </div>
                        {GAMES.filter(g => g.tier === tier).map(g => (
                          <button key={g.id} onClick={() => selectGame(g)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-left"
                            style={{ background: activeGame.id === g.id ? "#fff4ed" : "transparent" }}>
                            <EmojiIcon emoji={g.emoji} size={22} />
                            <div className="flex flex-col flex-1">
                              <span className="text-[13px]" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>{g.label}</span>
                              <span className="text-[11px]" style={{ color: "#84888c", ...ss, ...pp }}>{g.description}</span>
                            </div>
                            {activeGame.id === g.id && <div className="size-2 rounded-full bg-[#ff5222]" />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===== CHART ===== */}
            <div className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#f5f6f7" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>{activeGame.metric}:</span>
                  <span className="text-[16px]" style={{ color: isUp ? "#00bf85" : "#f5222d", fontWeight: 600, ...ss, ...pp }}>
                    {currentValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[12px]" style={{ color: isUp ? "#00bf85" : "#f5222d", fontWeight: 500, ...ss, ...pp }}>
                    {isUp ? "▲" : "▼"} {Math.abs(currentValue - prevValue).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative size-2"><div className="absolute inset-0 rounded-full bg-[#ff5222] opacity-40 animate-ping" /><div className="absolute inset-[25%] rounded-full bg-[#ff5222]" /></div>
                  <span className="text-[11px]" style={{ color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>LIVE</span>
                </div>
              </div>
              <div className="h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis key="xaxis" dataKey="time" tick={{ fontSize: 11, fill: "#84888c", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#84888c", fontFamily: "Poppins" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={60} />
                    <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #f5f6f7", borderRadius: 8, fontFamily: "Poppins", fontSize: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }} />
                    <Area key="area" type="monotone" dataKey="value" stroke="#ff5222" strokeWidth={2} fill="rgba(255,82,34,0.08)" dot={false} activeDot={{ r: 5, fill: "#ff5222", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ===== ROUND CARDS ===== */}
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {rounds.map(r => (
                  <RoundCard key={r.id} round={r} game={activeGame} isActive={r.status === "live"} onClick={() => {}} />
                ))}
              </div>
              {/* Fade edge */}
              <div className="absolute right-0 top-0 bottom-2 w-10 pointer-events-none" style={{ background: "linear-gradient(to left, #f7f8fa, transparent)" }} />
            </div>

            {/* ===== BET PANEL ===== */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6">
              <div className="flex flex-col gap-6">
                {/* ===== POSITIONS / HISTORY ===== */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-5 h-10">
                    {(["positions", "history"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="relative text-[14px] cursor-pointer h-full flex items-center"
                        style={{ color: activeTab === tab ? "#070808" : "#84888c", fontWeight: 500, ...ss, ...pp }}>
                        {tab === "positions" ? "Mga Posisyon" : "Kasaysayan"}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />}
                      </button>
                    ))}
                  </div>

                  {/* Table header - desktop */}
                  <div className="hidden sm:flex items-center gap-2 py-2 border-b" style={{ borderColor: "#f5f6f7" }}>
                    <div className="w-[240px] shrink-0"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Market</span></div>
                    <div className="flex-1"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>#</span></div>
                    <div className="flex-1"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Direksiyon</span></div>
                    <div className="flex-1"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Halaga</span></div>
                    <div className="flex-1"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Status</span></div>
                    <div className="w-[100px] shrink-0 text-right"><span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>Est. PNL</span></div>
                  </div>

                  {/* Table rows - desktop */}
                  {positions.map(pos => (
                    <div key={pos.id}>
                      {/* Desktop row */}
                      <div className="hidden sm:flex items-center gap-2 py-3 border-b transition-colors hover:bg-[#fafafa]" style={{ borderColor: "#f5f6f7" }}>
                        <div className="w-[240px] shrink-0 flex items-center gap-2">
                          <EmojiIcon emoji={pos.emoji} size={22} />
                          <span className="text-[13px]" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>{pos.game}</span>
                        </div>
                        <div className="flex-1"><span className="text-[13px]" style={{ color: "#070808", ...ss, ...pp }}>{pos.roundId}</span></div>
                        <div className="flex-1">
                          <span className="text-[13px] px-2 py-0.5 rounded" style={{
                            background: pos.side === "up" ? "#e6fff3" : "#fff1f0",
                            color: pos.side === "up" ? "#00bf85" : "#f5222d",
                            fontWeight: 500, ...ss, ...pp,
                          }}>
                            {pos.side === "up" ? activeGame.upLabel : activeGame.downLabel}
                          </span>
                        </div>
                        <div className="flex-1"><span className="text-[13px]" style={{ color: "#070808", ...ss, ...pp }}>₱{pos.amount.toLocaleString()}</span></div>
                        <div className="flex-1">
                          <span className="text-[13px]" style={{
                            color: pos.status === "Won" ? "#00bf85" : pos.status === "Lost" ? "#f5222d" : "#84888c",
                            fontWeight: 500, ...ss, ...pp,
                          }}>{pos.status === "Won" ? "Panalo" : pos.status === "Lost" ? "Talo" : "Open"}</span>
                        </div>
                        <div className="w-[100px] shrink-0 text-right">
                          <span className="text-[13px]" style={{
                            color: pos.pnl > 0 ? "#00bf85" : pos.pnl < 0 ? "#f5222d" : "#84888c",
                            fontWeight: 600, ...ss, ...pp,
                          }}>
                            {pos.pnl > 0 ? "+" : ""}{pos.pnl === 0 ? "-" : `₱${Math.abs(pos.pnl).toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="sm:hidden bg-white rounded-xl border border-[#f0f1f3] p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <EmojiIcon emoji={pos.emoji} size={20} />
                            <span className="text-[13px]" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>{pos.game}</span>
                            <span className="text-[11px] text-[#b0b3b8]" style={ss}>#{pos.roundId}</span>
                          </div>
                          <span className="text-[13px]" style={{
                            color: pos.pnl > 0 ? "#00bf85" : pos.pnl < 0 ? "#f5222d" : "#84888c",
                            fontWeight: 600, ...ss, ...pp,
                          }}>
                            {pos.pnl > 0 ? "+" : ""}{pos.pnl === 0 ? "-" : `₱${Math.abs(pos.pnl).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[12px] px-2 py-0.5 rounded" style={{
                            background: pos.side === "up" ? "#e6fff3" : "#fff1f0",
                            color: pos.side === "up" ? "#00bf85" : "#f5222d",
                            fontWeight: 500, ...ss,
                          }}>
                            {pos.side === "up" ? activeGame.upLabel : activeGame.downLabel}
                          </span>
                          <span className="text-[12px] text-[#070808]" style={{ ...ss }}>₱{pos.amount.toLocaleString()}</span>
                          <span className="text-[12px]" style={{
                            color: pos.status === "Won" ? "#00bf85" : pos.status === "Lost" ? "#f5222d" : "#84888c",
                            fontWeight: 500, ...ss,
                          }}>{pos.status === "Won" ? "Panalo" : pos.status === "Lost" ? "Talo" : "Open"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side: Bet panel */}
              <div className="flex flex-col gap-4">
                {activeGame.id === "color-game" ? (
                  <ColorGamePanel onBet={handleBet} />
                ) : (
                  <BetPanel game={activeGame} onBet={handleBet} />
                )}

                {/* Bet confirmation toast */}
                {betConfirmed && (
                  <div className="rounded-lg px-4 py-3 flex items-center gap-2 animate-pulse" style={{ background: "#e6fff3" }}>
                    <svg className="size-5" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 010 1.4l-6 6a1 1 0 01-1.4 0l-3-3a1 1 0 011.4-1.4L6.6 9.6l5.3-5.3a1 1 0 011.4 0z" fill="#00bf85"/></svg>
                    <span className="text-[13px]" style={{ color: "#00bf85", fontWeight: 600, ...ss, ...pp }}>Na-submit na ang taya mo!</span>
                  </div>
                )}

                {/* Quick info */}
                <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ background: "#fff", borderColor: "#f5f6f7" }}>
                  <span className="text-[13px]" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>Paano ito gumagana?</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { step: "1", text: "Pumili ng laro at round" },
                      { step: "2", text: activeGame.id === "color-game" ? "Pumili ng kulay at halaga" : `Pumili ng ${activeGame.upLabel} o ${activeGame.downLabel}` },
                      { step: "3", text: "I-confirm ang taya bago matapos ang countdown" },
                      { step: "4", text: "Kapag tama ka, instant payout sa GCash/Maya!" },
                    ].map(s => (
                      <div key={s.step} className="flex items-start gap-2">
                        <span className="size-5 shrink-0 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: "#ff5222", fontWeight: 700 }}>{s.step}</span>
                        <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAGCOR disclaimer */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#fafafa" }}>
                  <EmojiIcon emoji="🇵🇭" size={16} />
                  <span className="text-[10px]" style={{ color: "#a0a3a7", ...ss, ...pp }}>
                    PAGCOR Licensed • PHP Only • 18+ Responsible Gaming
                  </span>
                </div>
              </div>
            </div>

          </div>
          <Footer />
        </div>
      </div>

      <DepositWithdrawModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        theme={modalTheme}
        balance={5000}
      />
    </div>
  );
}