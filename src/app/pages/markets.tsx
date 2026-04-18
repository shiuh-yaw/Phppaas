import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Filters } from "../components/filters";
import { Banner } from "../components/banner";
import { ActivityFeed } from "../components/activity-feed";
import {
  YesNoCard,
  FastBetCard,
  BuyCard,
  MultiOptionCard,
  ColorGameCard,
  MatchupCard,
  BingoCard,
} from "../components/market-card";
import { Rankings } from "../components/rankings";
import { Footer } from "../components/footer";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmojiIcon } from "../components/two-tone-icons";

const ss04 = { fontFeatureSettings: "'ss04'" };
const pp = { fontFamily: "'Poppins', sans-serif" };

/* ============ KEYFRAME STYLES ============ */
const keyframes = `
@keyframes pulse-glow { 0%,100%{box-shadow:0 0 15px rgba(255,82,34,0.12),0 0 40px rgba(255,82,34,0.04)} 50%{box-shadow:0 0 25px rgba(255,82,34,0.2),0 0 60px rgba(255,82,34,0.08)} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes dice-bounce { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-6px) rotate(8deg)} 50%{transform:translateY(0) rotate(-5deg)} 75%{transform:translateY(-3px) rotate(3deg)} }
@keyframes float-up { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes count-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
@keyframes live-ring { 0%{box-shadow:0 0 0 0 rgba(255,82,34,0.6)} 70%{box-shadow:0 0 0 8px rgba(255,82,34,0)} 100%{box-shadow:0 0 0 0 rgba(255,82,34,0)} }
@keyframes marquee-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes jackpot-flash { 0%,100%{color:#d97706} 50%{color:#b45309;text-shadow:0 0 12px rgba(217,119,6,0.2)} }
@keyframes punch-shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-3px) rotate(-1deg)} 30%{transform:translateX(3px) rotate(1deg)} 50%{transform:translateX(-2px)} 70%{transform:translateX(2px)} }
@keyframes glove-swing { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
@keyframes bingo-pop { 0%{transform:scale(0.8);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
@keyframes neon-flicker { 0%,100%{opacity:1} 50%{opacity:0.7} }
@keyframes lotto-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
@keyframes trophy-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes storm-sway { 0%,100%{transform:translateX(0) rotate(0deg)} 50%{transform:translateX(4px) rotate(2deg)} }
`;

/* ============ TIER 1 - FEATURED HERO ============ */
function FeaturedHeroCard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer bg-white"
      style={{ minHeight: 220, animation: "pulse-glow 3s ease-in-out infinite", border: "1px solid #f0f1f3" }}
      onClick={() => navigate("/market/pba-finals")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1601588462898-cb949cee5702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: hovered ? "scale(1.03)" : "scale(1)", transition: "transform 0.6s ease" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 40%, rgba(255,82,34,0.06) 100%)" }} />

      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 gap-3">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="flex items-center gap-1.5 bg-[#ff5222] text-white text-[10px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, animation: "live-ring 1.5s ease-out infinite", ...ss04 }}>
            <span className="size-1.5 bg-white rounded-full animate-pulse" /> LIVE NOW
          </span>
          <span className="bg-[#070808]/6 backdrop-blur-sm text-[#070808] text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 600, ...ss04 }}><EmojiIcon emoji="🏀" size={12} /> PBA Philippine Cup</span>
          <span className="bg-[#ff5222]/10 text-[#ff5222] text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...ss04 }}><EmojiIcon emoji="🔥" size={12} /> TRENDING #1</span>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-[#84888c] text-[11px]" style={ss04}>Q3 · 4:23</span>
            <span className="bg-[#070808]/5 text-[#84888c] text-[10px] px-2 py-1 rounded" style={ss04}>1,240 bettors</span>
          </div>
        </div>

        {/* Middle - VS Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center gap-1" style={{ animation: "float-up 0.5s ease-out" }}>
            <div className="size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#dc2626] flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
              <EmojiIcon emoji="🏀" size={22} />
            </div>
            <span className="text-[#070808] text-[15px] sm:text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Ginebra</span>
            <span className="text-[#dc2626] text-[24px] sm:text-[32px]" style={{ fontWeight: 800, ...ss04, ...pp, animation: "count-pulse 2s ease-in-out infinite" }}>78</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="size-10 sm:size-12 rounded-full bg-gradient-to-br from-[#ff5222] to-[#ff8c00] flex items-center justify-center shadow-xl" style={{ boxShadow: "0 0 30px rgba(255,82,34,0.4)" }}>
              <span className="text-white text-[12px] sm:text-[14px]" style={{ fontWeight: 800, ...pp }}>VS</span>
            </div>
            <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>GAME 7</span>
          </div>
          <div className="flex flex-col items-center gap-1" style={{ animation: "float-up 0.5s ease-out 0.1s both" }}>
            <div className="size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}>
              <EmojiIcon emoji="🏀" size={22} />
            </div>
            <span className="text-[#070808] text-[15px] sm:text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>San Miguel</span>
            <span className="text-[#1d4ed8] text-[24px] sm:text-[32px]" style={{ fontWeight: 800, ...ss04, ...pp, animation: "count-pulse 2s ease-in-out infinite 0.5s" }}>72</span>
          </div>
        </div>

        {/* Bottom - Odds + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="bg-gradient-to-r from-[#f97316] to-[#dc2626] hover:from-[#ea580c] hover:to-[#b91c1c] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(249,115,22,0.4)" }}>
              <span className="text-[13px] sm:text-[14px]">Ginebra</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>x1.65</span>
            </button>
            <button className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] hover:from-[#2563eb] hover:to-[#1e40af] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(59,130,246,0.4)" }}>
              <span className="text-[13px] sm:text-[14px]">San Miguel</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>x2.35</span>
            </button>
          </div>
          <div className="flex items-center sm:items-end sm:flex-col gap-1.5 justify-between">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Total Pool</span>
            <span className="text-[#070808] text-[18px] sm:text-[22px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱320,000</span>
            <span className="text-[#ff5222] text-[10px] hidden sm:inline" style={{ fontWeight: 600, ...ss04 }}>+₱18,500 sa huling 5 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ HOT TICKER ============ */
function HotTicker() {
  const items = [
    { emoji: "💰", text: "JuanBet123 nanalo ng ₱45,200 sa PBA!", hot: true },
    { emoji: "🎲", text: "Color Game Round #8832 — 128 players!", hot: false },
    { emoji: "🏀", text: "NBA: Lakers vs Celtics — ₱890k pool!", hot: true },
    { emoji: "🥊", text: "Donaire vs Inoue — ₱540k pool!", hot: false },
    { emoji: "🎰", text: "Jackpot Round: ₱500K prize pool bukas!", hot: true },
    { emoji: "🏆", text: "Top bettor ngayon: @MariaGCash +₱128K", hot: false },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#f0f1f3]" style={{ background: "linear-gradient(90deg, #fff8f5 0%, #ffffff 50%, #f5f8ff 100%)" }}>
      <div className="flex items-center h-10 whitespace-nowrap" style={{ animation: "marquee-scroll 30s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-[12px]" style={{ color: item.hot ? "#d97706" : "#84888c", fontWeight: item.hot ? 600 : 400, ...ss04, ...pp }}>
            <EmojiIcon emoji={item.emoji} size={14} /> {item.text}
            <span className="text-[#f0f1f3] mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ COLOR GAME PREMIUM CARD ============ */
const DICE_COLORS = [
  { name: "Pula", color: "#dc2626", glow: "rgba(220,38,38,0.25)" },
  { name: "Asul", color: "#2563eb", glow: "rgba(37,99,235,0.25)" },
  { name: "Berde", color: "#16a34a", glow: "rgba(22,163,74,0.25)" },
  { name: "Dilaw", color: "#ca8a04", glow: "rgba(202,138,4,0.25)" },
  { name: "Puti", color: "#9ca3af", glow: "rgba(156,163,175,0.25)" },
  { name: "Pink", color: "#ec4899", glow: "rgba(236,72,153,0.25)" },
];

function ColorGamePremiumCard() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white"
      style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(139,92,246,0.06)" }}
      onClick={() => navigate("/fast-bet")}
    >
      {/* Animated BG particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: 6 + i * 3, height: 6 + i * 3,
            background: DICE_COLORS[i].color, opacity: 0.07,
            left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`,
            animation: `dice-bounce ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="🎲" size={20} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Color Game</span>
            <span className="bg-[#8b5cf6]/10 text-[#7c3aed] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>LIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Round #8832</span>
            <span className="bg-[#ff5222]/10 text-[#ff5222] text-[11px] px-2 py-0.5 rounded-full animate-pulse" style={{ fontWeight: 700, ...ss04 }}>0:42</span>
          </div>
        </div>

        {/* Dice Colors */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-3">
          {DICE_COLORS.map((c, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all"
              onClick={e => { e.stopPropagation(); setSelectedColor(selectedColor === i ? null : i); }}
              style={{ transform: selectedColor === i ? "scale(1.15)" : "scale(1)" }}
            >
              <div
                className="size-8 sm:size-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: c.color,
                  boxShadow: selectedColor === i ? `0 0 14px ${c.glow}, 0 4px 10px ${c.glow}` : "0 2px 6px rgba(0,0,0,0.08)",
                  border: selectedColor === i ? "2.5px solid #070808" : "2.5px solid transparent",
                }}
              >
                <span className="text-[10px]" style={{ fontWeight: 700, color: "#fff", ...ss04 }}>x6</span>
              </div>
              <span className="text-[9px]" style={{ color: selectedColor === i ? c.color : "#b0b3b8", fontWeight: 600, ...ss04 }}>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Last Results */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Huling resulta:</span>
          {["Pula", "Asul", "Berde"].map((r, i) => {
            const c = DICE_COLORS.find(d => d.name === r)!;
            return <span key={i} className="size-4 rounded" style={{ background: c.color }} />;
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Prize Pool</span>
            <span className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱48,200</span>
          </div>
          <button
            className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white h-9 px-5 rounded-xl text-[13px] transition-all cursor-pointer"
            style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 12px rgba(139,92,246,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            Maglaro Na! 🎲
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ JACKPOT PROMO CARD ============ */
function JackpotPromoCard() {
  const navigate = useNavigate();
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white"
      style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(217,119,6,0.06)" }}
      onClick={() => navigate("/fast-bet")}
    >
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="⚡" size={20} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Fast Bet</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", color: "#fff", fontWeight: 700, ...ss04 }}>HOT</span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Every 5 min</span>
        </div>

        {/* Jackpot */}
        <div className="flex flex-col items-center gap-1 my-2">
          <span className="text-[#d97706] text-[10px]" style={{ fontWeight: 600, ...ss04, letterSpacing: "0.1em" }}>JACKPOT PRIZE</span>
          <span className="text-[28px] sm:text-[36px]" style={{ fontWeight: 800, animation: "jackpot-flash 2s ease-in-out infinite", ...ss04, ...pp }}>₱500,000</span>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Susunod na draw: 4:23 PM</span>
        </div>

        {/* Mini games row */}
        <div className="flex items-center gap-2">
          {[
            { emoji: "🏀", label: "PBA", pool: "₱320K" },
            { emoji: "🎲", label: "Color", pool: "₱48K" },
            { emoji: "🥊", label: "Boxing", pool: "₱540K" },
          ].map((g, i) => (
            <div key={i} className="flex-1 bg-[#fef9f0] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5 hover:bg-[#fef3e0] transition-colors border border-[#fef3e0]">
              <EmojiIcon emoji={g.emoji} size={18} />
              <span className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>{g.label}</span>
              <span className="text-[#d97706] text-[10px]" style={{ fontWeight: 700, ...ss04 }}>{g.pool}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
          <button
            className="w-full h-10 rounded-xl text-[13px] transition-all cursor-pointer mt-2"
            style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#fff", fontWeight: 700, ...ss04, ...pp, boxShadow: "0 4px 12px rgba(245,158,11,0.2)" }}
          >
            Tumaya Na — Up o Down? ⚡
          </button>
      </div>
    </div>
  );
}

/* ============ NBA LIVE CARD ============ */
function NBALiveCard() {
  const navigate = useNavigate();
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white"
      style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(59,130,246,0.06)" }}
      onClick={() => navigate("/market/nba-finals")}
    >
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="🏀" size={16} />
            <span className="text-[#070808] text-[13px]" style={{ fontWeight: 700, ...ss04, ...pp }}>NBA 2025-26</span>
            <span className="flex items-center gap-1 bg-[#ff5222]/10 text-[#ff5222] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>
              <span className="size-1.5 bg-[#ff5222] rounded-full animate-pulse" /> LIVE
            </span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Q4 · 2:11</span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-5 my-2">
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#7c3aed] flex items-center justify-center">
              <EmojiIcon emoji="🏀" size={22} />
            </div>
            <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04, ...pp }}>Lakers</span>
            <span className="text-[#d97706] text-[26px]" style={{ fontWeight: 800, ...ss04, ...pp }}>98</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#dfe0e2] text-[12px]" style={{ fontWeight: 700, ...pp }}>VS</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#166534] flex items-center justify-center">
              <EmojiIcon emoji="🏀" size={22} />
            </div>
            <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04, ...pp }}>Celtics</span>
            <span className="text-[#16a34a] text-[26px]" style={{ fontWeight: 800, ...ss04, ...pp }}>101</span>
          </div>
        </div>

        {/* Odds */}
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-[#fefce8] border border-[#fde68a] hover:border-[#fbbf24] text-[#070808] h-9 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-all cursor-pointer" style={{ fontWeight: 600, ...ss04, ...pp }}>
            Lakers <span className="text-[#d97706]" style={{ fontWeight: 700 }}>x2.15</span>
          </button>
          <button className="flex-1 bg-[#f0fdf4] border border-[#bbf7d0] hover:border-[#4ade80] text-[#070808] h-9 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-all cursor-pointer" style={{ fontWeight: 600, ...ss04, ...pp }}>
            Celtics <span className="text-[#16a34a]" style={{ fontWeight: 700 }}>x1.75</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#b0b3b8] text-[10px]" style={ss04}>₱890k Vol · 3,420 bettors</span>
          <span className="text-[#3b82f6] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Celtics -4.5</span>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 1 — ORDERBOOK MARKET HERO ============ */
function OrderbookHeroCard() {
  const navigate = useNavigate();

  const asks = [
    { price: 65, shares: 15600, depth: 71 },
    { price: 64, shares: 8900,  depth: 40 },
    { price: 63, shares: 22100, depth: 100 },
  ];
  const bids = [
    { price: 61, shares: 18700, depth: 85 },
    { price: 60, shares: 11200, depth: 51 },
    { price: 59, shares: 9800,  depth: 44 },
  ];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", minHeight: 200 }}
      onClick={() => navigate("/market/btc-200k")}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,82,34,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,82,34,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(34,197,94,0.07) 0%,transparent 70%)" }} />

      <div className="relative z-10 flex flex-col lg:flex-row gap-5 p-4 sm:p-6">
        {/* Left: Market Info */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#ff5222] text-white text-[9px] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5" style={{ fontWeight: 700, ...ss04 }}>📊 ORDERBOOK · TIER 1</span>
            <span className="bg-white/10 text-white/70 text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>🆕 NEW MODULE</span>
            <span className="flex items-center gap-1 bg-[#22c55e]/20 text-[#22c55e] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>
              <span className="size-1.5 bg-[#22c55e] rounded-full animate-pulse" /> LIVE TRADING
            </span>
            <span className="text-white/30 text-[10px] ml-auto hidden sm:block" style={ss04}>Closes Dec 31, 2026</span>
          </div>
          <h3 className="text-white text-[17px] sm:text-[21px] leading-[1.3]" style={{ fontWeight: 700, ...ss04, ...pp }}>
            Bitcoin aabot ba sa $200,000 by Dec 31, 2026?
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]" style={ss04}>YES PRICE</span>
              <span className="text-[#22c55e] text-[28px] leading-none" style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", ...ss04, ...pp }}>62¢</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]" style={ss04}>NO PRICE</span>
              <span className="text-[#ef4444] text-[28px] leading-none" style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", ...ss04, ...pp }}>38¢</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]" style={ss04}>24h VOL</span>
              <span className="text-white text-[18px] leading-none" style={{ fontWeight: 700, ...ss04, ...pp }}>$4.2M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#22c55e] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>▲ +3.2%</span>
              <span className="text-white/30 text-[9px]" style={ss04}>24h change</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button className="flex-1 sm:flex-initial h-10 px-5 rounded-xl text-[13px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 600, boxShadow: "0 4px 16px rgba(22,163,74,0.35)", ...ss04, ...pp }}
              onClick={e => { e.stopPropagation(); navigate("/market/btc-200k"); }}>
              Buy YES · 62¢
            </button>
            <button className="flex-1 sm:flex-initial h-10 px-5 rounded-xl text-[13px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg,#dc2626,#991b1b)", color: "#fff", fontWeight: 600, boxShadow: "0 4px 16px rgba(220,38,38,0.35)", ...ss04, ...pp }}
              onClick={e => { e.stopPropagation(); navigate("/market/btc-200k"); }}>
              Buy NO · 38¢
            </button>
            <div className="hidden sm:flex flex-col items-end ml-1">
              <span className="text-white/30 text-[9px]" style={ss04}>Open Interest</span>
              <span className="text-white text-[14px]" style={{ fontWeight: 600, ...ss04, ...pp }}>$12.8M</span>
            </div>
          </div>
          <p className="text-white/30 text-[11px] leading-[1.5] hidden sm:block" style={ss04}>
            Trade YES/NO shares at real-time market prices. Each share pays ₱1 if the event resolves in your favor. Spread: 2¢ · 28,450 open orders.
          </p>
        </div>

        {/* Right: Mini Orderbook Preview */}
        <div className="hidden lg:flex flex-col w-[220px] shrink-0 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center px-3 py-2 border-b border-white/5">
            <span className="flex-1 text-[9px] text-white/30" style={ss04}>Price</span>
            <span className="text-[9px] text-white/30 text-right" style={ss04}>Shares</span>
          </div>
          {[...asks].reverse().map((a, i) => (
            <div key={i} className="relative flex items-center px-3 h-8">
              <div className="absolute inset-y-0 right-0" style={{ width: `${a.depth}%`, background: "rgba(239,68,68,0.10)" }} />
              <span className="flex-1 text-[12px] text-[#ef4444] relative z-10" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss04 }}>{a.price}¢</span>
              <span className="text-[11px] text-white/40 text-right relative z-10" style={{ fontVariantNumeric: "tabular-nums", ...ss04 }}>{a.shares.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center justify-center px-3 py-1.5 border-y border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-[9px] text-white/30" style={ss04}>Spread 2¢ · 62¢ Last</span>
          </div>
          {bids.map((b, i) => (
            <div key={i} className="relative flex items-center px-3 h-8">
              <div className="absolute inset-y-0 left-0" style={{ width: `${b.depth}%`, background: "rgba(34,197,94,0.10)" }} />
              <span className="flex-1 text-[12px] text-[#22c55e] relative z-10" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss04 }}>{b.price}¢</span>
              <span className="text-[11px] text-white/40 text-right relative z-10" style={{ fontVariantNumeric: "tabular-nums", ...ss04 }}>{b.shares.toLocaleString()}</span>
            </div>
          ))}
          <div className="px-3 py-2 mt-auto border-t border-white/5">
            <span className="text-[9px] text-white/20 block text-center" style={ss04}>Open full trading view →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ HOT MARKETS CHIPS ============ */
function HotMarketsStrip() {
  const navigate = useNavigate();
  const chips = [
    { emoji: "₿",  label: "BTC $200K? [OB]", pool: "$4.2M", hot: true, slug: "btc-200k" },
    { emoji: "🏀", label: "Gilas FIBA 2027 [OB]", pool: "₱2.8M", hot: true, slug: "ph-gilas-fiba" },
    { emoji: "🏆", label: "PBA Champion 2026", pool: "₱430K", hot: true, slug: "pba-finals" },
    { emoji: "🏀", label: "PBA MVP 2026", pool: "₱280K", hot: false, slug: "pba-mvp" },
    { emoji: "🥊", label: "Donaire vs Inoue III", pool: "₱540K", hot: true, slug: "boxing-donaire" },
    { emoji: "🎮", label: "MLBB M6 Champion", pool: "₱320K", hot: true, slug: "mlbb-m6" },
    { emoji: "📊", label: "USD/PHP ₱60?", pool: "₱210K", hot: false, slug: "phpusd-59" },
    { emoji: "🎰", label: "6/45 Lotto Tonight", pool: "₱55K", hot: false, slug: "lotto-645" },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <span className="text-[11px] text-[#84888c] shrink-0 inline-flex items-center gap-1" style={{ fontWeight: 600, ...ss04, ...pp }}><EmojiIcon emoji="🔥" size={12} /> Hot:</span>
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={() => navigate(`/market/${c.slug}`)}
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border transition-all cursor-pointer hover:border-[#ff5222]/30 hover:bg-[#ff5222]/5"
          style={{ background: c.hot ? "rgba(255,82,34,0.05)" : "#fff", borderColor: c.hot ? "rgba(255,82,34,0.15)" : "#f5f6f7" }}
        >
          <EmojiIcon emoji={c.emoji} size={14} />
          <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04, ...pp }}>{c.label}</span>
          <span className="text-[10px] text-[#ff5222]" style={{ fontWeight: 700, ...ss04 }}>{c.pool}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ TIER 2 — BOXING HERO CARD ============ */
function BoxingHeroCard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer bg-white"
      style={{ minHeight: 220, animation: "pulse-glow 3s ease-in-out infinite", border: "1px solid #e0e8f0", boxShadow: "0 0 15px rgba(8,109,224,0.08)" }}
      onClick={() => navigate("/market/boxing-donaire")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ImageWithFallback src="https://images.unsplash.com/photo-1575654402720-0af3480d1fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ transform: hovered ? "scale(1.03)" : "scale(1)", transition: "transform 0.6s ease" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.8) 40%, rgba(8,109,224,0.06) 100%)" }} />
      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="flex items-center gap-1.5 bg-[#086de0] text-white text-[10px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, ...ss04 }}><EmojiIcon emoji="🥊" size={12} /> WBC WELTERWEIGHT</span>
          <span className="bg-[#086de0]/10 text-[#086de0] text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...ss04 }}><EmojiIcon emoji="🔥" size={12} /> MAIN EVENT</span>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-[#84888c] text-[11px]" style={ss04}>Mar 28, 2026</span>
            <span className="bg-[#070808]/5 text-[#84888c] text-[10px] px-2 py-1 rounded" style={ss04}>2,100 bettors</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          <div className="flex flex-col items-center gap-1" style={{ animation: "float-up 0.5s ease-out" }}>
            <div className="size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 20px rgba(220,38,38,0.35)" }}>
              <EmojiIcon emoji="🥊" size={22} />
            </div>
            <span className="text-[#070808] text-[15px] sm:text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Donaire</span>
            <span className="text-[#dc2626] text-[14px]" style={{ fontWeight: 700, ...ss04 }}>x3.50</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="size-10 sm:size-12 rounded-full bg-gradient-to-br from-[#086de0] to-[#1d4ed8] flex items-center justify-center shadow-xl" style={{ boxShadow: "0 0 30px rgba(8,109,224,0.3)", animation: "punch-shake 3s ease-in-out infinite" }}>
              <span className="text-white text-[12px] sm:text-[14px]" style={{ fontWeight: 800, ...pp }}>VS</span>
            </div>
            <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>12 ROUNDS</span>
          </div>
          <div className="flex flex-col items-center gap-1" style={{ animation: "float-up 0.5s ease-out 0.1s both" }}>
            <div className="size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-[#086de0] to-[#1e40af] flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 20px rgba(8,109,224,0.35)" }}>
              <EmojiIcon emoji="🥊" size={22} />
            </div>
            <span className="text-[#070808] text-[15px] sm:text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Inoue</span>
            <span className="text-[#086de0] text-[14px]" style={{ fontWeight: 700, ...ss04 }}>x1.35</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <button className="bg-gradient-to-r from-[#dc2626] to-[#991b1b] hover:from-[#b91c1c] hover:to-[#7f1d1d] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center shrink-0" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(220,38,38,0.35)" }}>
              <span className="text-[13px] sm:text-[14px]">Donaire</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>x3.50</span>
            </button>
            <button className="bg-[#f0f5ff] border border-[#c4d6f0] text-[#84888c] h-9 sm:h-11 px-3 sm:px-4 rounded-xl text-[11px] sm:text-[12px] transition-all cursor-pointer shrink-0" style={{ fontWeight: 600, ...ss04, ...pp }}>
              Draw <span className="text-[#b0b3b8]">x15</span>
            </button>
            <button className="bg-gradient-to-r from-[#086de0] to-[#1e40af] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center shrink-0" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(8,109,224,0.35)" }}>
              <span className="text-[13px] sm:text-[14px]">Inoue</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>x1.35</span>
            </button>
          </div>
          <div className="flex items-center sm:items-end sm:flex-col gap-1.5 justify-between">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Total Pool</span>
            <span className="text-[#070808] text-[22px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱540,000</span>
            <span className="text-[#086de0] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>+₱32,000 kahapon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 2 — ESPORTS PREMIUM CARD ============ */
function EsportsPremiumCard() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white" style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(99,102,241,0.06)" }} onClick={() => navigate("/market/mlbb-m6")}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 8 + i * 4, height: 8 + i * 4, background: ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#06b6d4"][i], opacity: 0.06, left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 28}%`, animation: `dice-bounce ${2 + i * 0.4}s ease-in-out infinite ${i * 0.15}s` }} />
        ))}
      </div>
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="🎮" size={18} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>MLBB M6</span>
            <span className="bg-[#6366f1]/10 text-[#6366f1] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04, animation: "neon-flicker 2s ease-in-out infinite" }}>WORLD CHAMPIONSHIP</span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>14D 8h</span>
        </div>
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
          {[
            { team: "Blacklist Intl.", odds: "x1.60", color: "#6366f1", emoji: "⚔️" },
            { team: "ONIC PH", odds: "x2.40", color: "#ec4899", emoji: "🛡️" },
            { team: "Echo", odds: "x4.20", color: "#06b6d4", emoji: "🗡️" },
          ].map((t, i) => (
            <button key={i} className="flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:scale-105" onClick={e => e.stopPropagation()}>
              <div className="size-10 sm:size-12 rounded-xl flex items-center justify-center" style={{ background: t.color, boxShadow: `0 4px 14px ${t.color}40` }}>
                <EmojiIcon emoji={t.emoji} size={24} />
              </div>
              <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04, ...pp }}>{t.team}</span>
              <span className="text-[11px]" style={{ fontWeight: 700, color: t.color, ...ss04 }}>{t.odds}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Prize Pool</span>
            <span className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱320,000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#070808]/5 text-[#84888c] text-[10px] px-2 py-1 rounded" style={ss04}>1,890 bettors</span>
              <button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white h-9 px-5 rounded-xl text-[13px] transition-all cursor-pointer inline-flex items-center gap-1.5" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }} onClick={e => e.stopPropagation()}>Tumaya <EmojiIcon emoji="🎮" size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 2 — BINGO PREMIUM CARD ============ */
function BingoPremiumCard() {
  const navigate = useNavigate();
  const bingoNums = [7, 22, 38, 51, 63];
  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white" style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(234,88,12,0.06)" }} onClick={() => navigate("/fast-bet")}>
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="🎱" size={18} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Super Bingo</span>
            <span className="bg-[#ea580c]/10 text-[#ea580c] text-[9px] px-2 py-0.5 rounded-full animate-pulse" style={{ fontWeight: 700, ...ss04 }}>LIVE DRAW</span>
          </div>
          <span className="bg-[#ff5222]/10 text-[#ff5222] text-[11px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>0:15</span>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
          {bingoNums.map((n, i) => (
            <div key={i} className="size-9 sm:size-12 rounded-full flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${["#dc2626", "#2563eb", "#16a34a", "#d97706", "#8b5cf6"][i]}, ${["#991b1b", "#1d4ed8", "#166534", "#b45309", "#6d28d9"][i]})`, animation: `bingo-pop 0.4s ease-out ${i * 0.1}s both`, boxShadow: `0 4px 12px ${["rgba(220,38,38,0.3)", "rgba(37,99,235,0.3)", "rgba(22,163,74,0.3)", "rgba(217,119,6,0.3)", "rgba(139,92,246,0.3)"][i]}` }}>
              <span className="text-white text-[13px] sm:text-[16px]" style={{ fontWeight: 800, ...ss04 }}>{n}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Jackpot Range:</span>
          {[{ range: "1-15", mult: "x5.2", hot: true }, { range: "46-60", mult: "x6.3", hot: true }].map((r, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: r.hot ? "rgba(255,82,34,0.08)" : "#f7f8f9", color: r.hot ? "#ff5222" : "#84888c", fontWeight: 600, ...ss04 }}>{r.range} {r.mult}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Prize Pool</span>
            <span className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱28,100</span>
          </div>
          <button className="bg-gradient-to-r from-[#ea580c] to-[#dc2626] text-white h-9 px-5 rounded-xl text-[13px] transition-all cursor-pointer inline-flex items-center gap-1.5" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 12px rgba(234,88,12,0.2)" }} onClick={e => e.stopPropagation()}>Sumali Na! <EmojiIcon emoji="🎱" size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 2 — HOT TICKER ============ */
function Tier2HotTicker() {
  const items = [
    { emoji: "🥊", text: "BetKing99 nanalo ng ₱85,000 sa Donaire fight!", hot: true },
    { emoji: "🎮", text: "MLBB M6 pool umabot na sa ₱320K!", hot: false },
    { emoji: "🎱", text: "Bingo #444 jackpot — @SuperLucy +₱15,200!", hot: true },
    { emoji: "⚡", text: "Pacquiao comeback odds: 35% Oo!", hot: false },
    { emoji: "🏆", text: "Dota 2 SEA finals — T1 leading odds!", hot: true },
    { emoji: "💰", text: "Top earner ngayon: @BoxingFan_PH +₱92K", hot: false },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#dfe5f0]" style={{ background: "linear-gradient(90deg, #f0f5ff 0%, #ffffff 50%, #fef0f0 100%)" }}>
      <div className="flex items-center h-10 whitespace-nowrap" style={{ animation: "marquee-scroll 28s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-[12px]" style={{ color: item.hot ? "#086de0" : "#84888c", fontWeight: item.hot ? 600 : 400, ...ss04, ...pp }}>
            <EmojiIcon emoji={item.emoji} size={14} /> {item.text}
            <span className="text-[#f0f1f3] mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ TIER 2 — HOT MARKETS STRIP ============ */
function Tier2HotMarketsStrip() {
  const navigate = useNavigate();
  const chips = [
    { emoji: "🥊", label: "Donaire vs Inoue III", pool: "₱540K", hot: true, slug: "boxing-donaire" },
    { emoji: "🥊", label: "Pacquiao Comeback?", pool: "₱890K", hot: true, slug: "pacquiao-comeback" },
    { emoji: "🎮", label: "MLBB M6 Champion", pool: "₱320K", hot: true, slug: "mlbb-m6" },
    { emoji: "🎮", label: "Dota 2 SEA", pool: "₱145K", hot: false, slug: "dota2-sea" },
    { emoji: "🎱", label: "Super Bingo Jackpot", pool: "₱28K", hot: false, slug: "bingo-445" },
    { emoji: "🎮", label: "MLBB M6 MVP", pool: "₱98K", hot: false, slug: "mlbb-mvp" },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <span className="text-[11px] text-[#84888c] shrink-0 inline-flex items-center gap-1" style={{ fontWeight: 600, ...ss04, ...pp }}><EmojiIcon emoji="⚡" size={12} /> Hot:</span>
      {chips.map((c, i) => (
        <button key={i} onClick={() => navigate(`/market/${c.slug}`)} className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border transition-all cursor-pointer hover:border-[#086de0]/30 hover:bg-[#086de0]/5" style={{ background: c.hot ? "rgba(8,109,224,0.05)" : "#fff", borderColor: c.hot ? "rgba(8,109,224,0.15)" : "#f5f6f7" }}>
          <EmojiIcon emoji={c.emoji} size={14} />
          <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04, ...pp }}>{c.label}</span>
          <span className="text-[10px] text-[#086de0]" style={{ fontWeight: 700, ...ss04 }}>{c.pool}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ TIER 3 — LOTTERY JACKPOT HERO CARD ============ */
function LotteryHeroCard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const lottoNums = [8, 17, 23, 31, 42, 45];
  return (
    <div className="relative w-full rounded-2xl overflow-hidden cursor-pointer bg-white" style={{ minHeight: 220, border: "1px solid #ede5f5", boxShadow: "0 0 15px rgba(139,92,246,0.08)" }} onClick={() => navigate("/market/lotto-645")} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <ImageWithFallback src="https://images.unsplash.com/photo-1724866976329-71fbbc171db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ transform: hovered ? "scale(1.03)" : "scale(1)", transition: "transform 0.6s ease" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.82) 40%, rgba(139,92,246,0.06) 100%)" }} />
      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="bg-[#8b5cf6] text-white text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...ss04 }}><EmojiIcon emoji="🎰" size={12} /> PCSO LOTTO 6/45</span>
          <span className="bg-[#d97706]/10 text-[#d97706] text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...ss04, animation: "jackpot-flash 2s ease-in-out infinite" }}><EmojiIcon emoji="💰" size={12} /> MEGA JACKPOT</span>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-[#84888c] text-[11px]" style={ss04}>Draw: 9:00 PM</span>
            <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] text-[10px] px-2 py-1 rounded animate-pulse" style={{ fontWeight: 700, ...ss04 }}>6h 30m</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {lottoNums.map((n, i) => (
              <div key={i} className="size-9 sm:size-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", boxShadow: "0 4px 14px rgba(217,119,6,0.3)", animation: `bingo-pop 0.4s ease-out ${i * 0.08}s both` }}>
                <span className="text-white text-[13px] sm:text-[16px]" style={{ fontWeight: 800, ...ss04 }}>{n}</span>
              </div>
            ))}
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Ma-hit ba ang jackpot ngayong gabi?</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(22,163,74,0.35)" }}>
              <span className="text-[13px] sm:text-[14px]">Oo, Ma-hit!</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>12%</span>
            </button>
            <button className="bg-gradient-to-r from-[#dc2626] to-[#991b1b] hover:from-[#b91c1c] hover:to-[#7f1d1d] text-white h-9 sm:h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center" style={{ fontWeight: 600, ...ss04, ...pp, boxShadow: "0 4px 15px rgba(220,38,38,0.35)" }}>
              <span className="text-[13px] sm:text-[14px]">Hindi</span>
              <span className="text-[11px] sm:text-[12px] bg-white/20 px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>88%</span>
            </button>
          </div>
          <div className="flex items-center sm:items-end sm:flex-col gap-1.5 justify-between">
            <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Jackpot Prize</span>
            <span className="text-[22px] sm:text-[28px]" style={{ fontWeight: 800, animation: "jackpot-flash 2s ease-in-out infinite", ...ss04, ...pp }}>₱49.5M</span>
            <span className="text-[#8b5cf6] text-[10px] hidden sm:inline" style={{ fontWeight: 600, ...ss04 }}>890 bettors · ₱55k pool</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 3 — SHOWBIZ PREMIUM CARD ============ */
function ShowbizPremiumCard() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white" style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(236,72,153,0.06)" }} onClick={() => navigate("/market/bb-pilipinas")}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute" style={{ width: 6, height: 6, borderRadius: "50%", background: ["#ec4899", "#f472b6", "#f9a8d4", "#fbbf24"][i], opacity: 0.08, left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 35}%`, animation: `trophy-bounce ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }} />
        ))}
      </div>
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="👑" size={18} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Showbiz</span>
            <span className="bg-[#ec4899]/10 text-[#ec4899] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>TRENDING</span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>45D</span>
        </div>
        <div className="my-2">
          <p className="text-[#070808] text-[13px] leading-[1.45] mb-3" style={{ fontWeight: 600, ...ss04 }}>Sino ang next Binibining Pilipinas Universe 2026?</p>
          <div className="flex flex-col gap-2">
            {[
              { name: "Chelsea Manalo", odds: "x2.10", pct: "35%", color: "#ec4899" },
              { name: "Michelle Dee", odds: "x3.20", pct: "22%", color: "#f472b6" },
              { name: "Iba pa", odds: "x4.80", pct: "15%", color: "#f9a8d4" },
            ].map((c, i) => (
              <button key={i} className="flex items-center justify-between h-9 px-3 rounded-lg border transition-all cursor-pointer hover:border-[#ec4899]/30" style={{ background: "rgba(236,72,153,0.03)", borderColor: "#f5f6f7" }} onClick={e => e.stopPropagation()}>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#84888c] text-[10px]" style={ss04}>{c.pct}</span>
                  <span className="text-[11px]" style={{ fontWeight: 700, color: c.color, ...ss04 }}>{c.odds}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱210,000</span>
          <span className="text-[#b0b3b8] text-[10px]" style={ss04}>₱210k Vol</span>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 3 — WEATHER PREMIUM CARD ============ */
function WeatherPremiumCard() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white" style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(6,182,212,0.06)" }} onClick={() => navigate("/market/typhoon-march")}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 10 + i * 5, height: 10 + i * 5, background: ["#06b6d4", "#0891b2", "#0e7490"][i], opacity: 0.06, left: `${15 + i * 25}%`, top: `${20 + i * 20}%`, animation: `storm-sway ${2.5 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }} />
        ))}
      </div>
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="🌪️" size={18} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Weather</span>
            <span className="bg-[#06b6d4]/10 text-[#0891b2] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>SEASONAL</span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>90D</span>
        </div>
        <div className="my-2">
          <p className="text-[#070808] text-[13px] leading-[1.45] mb-3" style={{ fontWeight: 600, ...ss04 }}>Magkakaroon ba ng Signal No. 5 typhoon sa Luzon this 2026?</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-[#f0fdfa] rounded-xl p-3 flex flex-col items-center gap-1 border border-[#ccfbf1] hover:border-[#5eead4] transition-all">
              <span className="text-[22px]">☀️</span>
              <span className="text-[#0d9488] text-[11px]" style={{ fontWeight: 700, ...ss04 }}>Hindi — 78%</span>
            </div>
            <div className="flex-1 bg-[#fef2f2] rounded-xl p-3 flex flex-col items-center gap-1 border border-[#fecaca] hover:border-[#f87171] transition-all">
              <EmojiIcon emoji="🌪️" size={22} />
              <span className="text-[#dc2626] text-[11px]" style={{ fontWeight: 700, ...ss04 }}>Oo — 22%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱75,000</span>
          <span className="text-[#b0b3b8] text-[10px]" style={ss04}>320 bettors</span>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 3 — ECONOMY PREMIUM CARD ============ */
function EconomyPremiumCard() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer relative bg-white" style={{ border: "1px solid #f0f1f3", boxShadow: "0 2px 20px rgba(16,185,129,0.06)" }} onClick={() => navigate("/fast-bet")}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute" style={{ width: 2, height: 12 + i * 6, borderRadius: 2, background: "#10b981", opacity: 0.06, left: `${15 + i * 20}%`, bottom: `${15 + (i % 2) * 10}%`, animation: `float-up 1.5s ease-out ${i * 0.2}s both` }} />
        ))}
      </div>
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiIcon emoji="📈" size={18} />
            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04, ...pp }}>Economy</span>
            <span className="flex items-center gap-1 bg-[#ff5222]/10 text-[#ff5222] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}><EmojiIcon emoji="⚡" size={10} /> Fast Bets</span>
          </div>
          <span className="text-[#b0b3b8] text-[11px]" style={ss04}>120D</span>
        </div>
        <div className="my-2">
          <p className="text-[#070808] text-[13px] leading-[1.45] mb-3" style={{ fontWeight: 600, ...ss04 }}>USD/PHP exchange rate sa Dec 2026?</p>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "₱60+", pct: "5%", bar: 5 },
              { label: "₱58-60", pct: "28%", bar: 28 },
              { label: "₱55-58", pct: "42%", bar: 42 },
              { label: "₱52-55", pct: "25%", bar: 25 },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 text-[10px] text-[#84888c]" style={ss04}>{r.label}</span>
                <div className="flex-1 h-5 bg-[#f7f8f9] rounded overflow-hidden">
                  <div className="h-full rounded flex items-center px-2" style={{ width: `${r.bar}%`, background: "linear-gradient(90deg, #10b981, #059669)", transition: "width 1s ease" }}>
                    {r.bar > 15 && <span className="text-white text-[9px]" style={{ fontWeight: 700, ...ss04 }}>{r.pct}</span>}
                  </div>
                </div>
                {r.bar <= 15 && <span className="text-[#84888c] text-[9px]" style={ss04}>{r.pct}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04, ...pp }}>₱210,000</span>
          <span className="text-[#ff5222] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Tumaya sa Fast Bets →</span>
        </div>
      </div>
    </div>
  );
}

/* ============ TIER 3 — HOT TICKER ============ */
function Tier3HotTicker() {
  const items = [
    { emoji: "🎰", text: "LottoKing_PH nanalo ng ₱12,500 sa 6/45!", hot: true },
    { emoji: "👑", text: "Bb. Pilipinas odds: Chelsea Manalo leading!", hot: false },
    { emoji: "🌪️", text: "Typhoon season prediction: 320 bettors!", hot: true },
    { emoji: "📈", text: "USD/PHP ₱58-60 range pinaka-mainit!", hot: false },
    { emoji: "🎤", text: "SB19 Concert bet — ₱65K pool!", hot: true },
    { emoji: "💰", text: "Economy bettor @TraderJuan +₱45K", hot: false },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#ede5f5]" style={{ background: "linear-gradient(90deg, #f8f5ff 0%, #ffffff 50%, #fef9f0 100%)" }}>
      <div className="flex items-center h-10 whitespace-nowrap" style={{ animation: "marquee-scroll 32s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-[12px]" style={{ color: item.hot ? "#8b5cf6" : "#84888c", fontWeight: item.hot ? 600 : 400, ...ss04, ...pp }}>
            <EmojiIcon emoji={item.emoji} size={14} /> {item.text}
            <span className="text-[#f0f1f3] mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ TIER 3 — HOT MARKETS STRIP ============ */
function Tier3HotMarketsStrip() {
  const navigate = useNavigate();
  const chips = [
    { emoji: "🎰", label: "6/45 Lotto Tonight", pool: "₱55K", hot: true, slug: "lotto-645" },
    { emoji: "👑", label: "Bb. Pilipinas 2026", pool: "₱210K", hot: true, slug: "bb-pilipinas" },
    { emoji: "🌪️", label: "Signal No.5 Typhoon", pool: "₱75K", hot: false, slug: "typhoon-march" },
    { emoji: "📈", label: "USD/PHP Dec 2026", pool: "₱210K", hot: true, slug: "phpusd-59" },
    { emoji: "🎤", label: "Biggest PH Concert", pool: "₱65K", hot: false, slug: "ph-concert" },
    { emoji: "📊", label: "PH GDP 7%?", pool: "₱95K", hot: false, slug: "ph-gdp" },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <span className="text-[11px] text-[#84888c] shrink-0 inline-flex items-center gap-1" style={{ fontWeight: 600, ...ss04, ...pp }}><EmojiIcon emoji="🎯" size={12} /> Hot:</span>
      {chips.map((c, i) => (
        <button key={i} onClick={() => navigate(`/market/${c.slug}`)} className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border transition-all cursor-pointer hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5" style={{ background: c.hot ? "rgba(139,92,246,0.05)" : "#fff", borderColor: c.hot ? "rgba(139,92,246,0.15)" : "#f5f6f7" }}>
          <EmojiIcon emoji={c.emoji} size={14} />
          <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04, ...pp }}>{c.label}</span>
          <span className="text-[10px] text-[#8b5cf6]" style={{ fontWeight: 700, ...ss04 }}>{c.pool}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ SECTION TITLE ============ */
function SectionTitle({ title, subtitle, badge, emoji }: { title: string; subtitle?: string; badge?: string; emoji?: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2">
      {emoji && <EmojiIcon emoji={emoji} size={18} />}
      <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...pp, ...ss04 }}>
        {title}
      </span>
      {badge && (
        <span className="text-[8px] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 700, backgroundColor: badge === "TIER 1" ? "#ff5222" : badge === "TIER 2" ? "#086de0" : "#8b5cf6" }}>
          {badge}
        </span>
      )}
      {subtitle && (
        <span className="text-[12px] text-[#b0b3b8]" style={{ ...pp, ...ss04 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

/* ============ MARKET GRID ============ */
function MarketGrid() {
  return (
    <div className="flex flex-col w-full" style={pp}>
      {/* Inject keyframes */}
      <style>{keyframes}</style>

      {/* TIER 1 — Pinakapopular */}
      <SectionTitle title="Tier 1 — Pinakapopular" badge="TIER 1" subtitle="Mga pinaka-hot na laro ngayon!" emoji="🔥" />

      {/* Hot Ticker */}
      <HotTicker />

      {/* Featured Hero */}
      <div className="mt-3">
        <FeaturedHeroCard />
      </div>

      {/* Orderbook Market — New Module */}
      <div className="mt-3">
        <OrderbookHeroCard />
      </div>

      {/* 3-Card Row: Color Game + NBA Live + Fast Bet Jackpot */}
      <div className="flex flex-col md:flex-row gap-3 mt-3 md:h-[320px]">
        <ColorGamePremiumCard />
        <NBALiveCard />
        <JackpotPromoCard />
      </div>

      {/* Hot Markets Strip */}
      <div className="mt-3 mb-2">
        <HotMarketsStrip />
      </div>

      {/* Remaining Tier 1 Cards */}
      <div className="flex flex-col md:flex-row gap-3 md:h-[260px] w-full mb-3">
        <MultiOptionCard author="Juan Cruz" question="Sino ang PBA Philippine Cup Champion 2026?" endTime="30D" volume="₱430k Vol" image="https://images.unsplash.com/photo-1659367527460-92759bf33263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" options={["Ginebra 0.28", "SMB 0.24", "TNT 0.18", "Meralco 0.15", "NLEX 0.08", "Iba pa 0.07"]} avatarIdx={0} tier={1} category="Basketball" />
        <MultiOptionCard author="Maria Santos" question="Sino ang PBA MVP 2026?" endTime="45D" volume="₱280k Vol" image="https://images.unsplash.com/photo-1659367527460-92759bf33263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" options={["Brownlee 0.31", "CJ Perez 0.26", "Bolick 0.19", "Parks 0.14", "Lee 0.06", "Iba pa 0.04"]} avatarIdx={1} tier={1} category="Basketball" />
        <YesNoCard author="Carlo Reyes" question="NBA Finals 2026: Mananalo ba ang Lakers?" chance={38} endTime="60D" volume="₱1.5M Vol" image="https://images.unsplash.com/photo-1626902672889-eccde7b626e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" avatarIdx={2} tier={1} category="Basketball" bettors={5200} />
      </div>

      {/* ====== TIER 2 — Patok na Patok ====== */}
      <SectionTitle title="Tier 2 — Patok na Patok" badge="TIER 2" subtitle="High value, strong cultural fit" emoji="🥊" />

      {/* Tier 2 Hot Ticker */}
      <Tier2HotTicker />

      {/* Boxing Hero Card */}
      <div className="mt-3">
        <BoxingHeroCard />
      </div>

      {/* 3-Card Row: Esports + Bingo + Pacquiao */}
      <div className="flex flex-col md:flex-row gap-3 mt-3 md:h-[320px]">
        <EsportsPremiumCard />
        <BingoPremiumCard />
        <YesNoCard author="Marco Tan" question="Pacquiao comeback exhibition fight sa 2026? Babalik ba ang Pambansang Kamao?" chance={35} endTime="90D" volume="₱890k Vol" image="https://images.unsplash.com/photo-1542720046-1e772598ea39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" avatarIdx={4} tier={2} category="Boxing" bettors={4300} />
      </div>

      {/* Tier 2 Hot Markets Strip */}
      <div className="mt-3 mb-2">
        <Tier2HotMarketsStrip />
      </div>

      {/* Remaining Tier 2 Cards */}
      <div className="flex flex-col md:flex-row gap-3 md:h-[260px] w-full mb-3">
        <BuyCard author="Paolo Gomez" question="Sino mananalo sa Dota 2 SEA Invitational?" endTime="7D" volume="₱145k Vol" image="https://images.unsplash.com/photo-1772587003187-65b32c91df91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" options={[{ label: "T1" }, { label: "Tundra" }, { label: "Team Spirit" }]} avatarIdx={0} tier={2} category="Esports" />
        <MultiOptionCard author="Rina Dela Cruz" question="MLBB M6 MVP Award — sino kukunin?" endTime="14D" volume="₱98k Vol" image="https://images.unsplash.com/photo-1761322667465-272f507c3673?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" options={["OhMyV33nus 0.22", "Hadji 0.20", "KarlTzy 0.18", "Emann 0.15", "Wise 0.12", "Iba pa 0.13"]} avatarIdx={3} tier={2} category="Esports" />
        <BingoCard roundId="Bingo #445" nextDraw="0:15" ranges={[{ range: "1-15", multiplier: "x5.2", hot: true }, { range: "16-30", multiplier: "x4.8", hot: false }, { range: "31-45", multiplier: "x4.1", hot: false }, { range: "46-60", multiplier: "x6.3", hot: true }, { range: "61-75", multiplier: "x3.9", hot: false }]} totalPool="₱28,100" players={86} />
      </div>

      {/* ====== TIER 3 — Growth Markets ====== */}
      <SectionTitle title="Tier 3 — Growth Markets" badge="TIER 3" subtitle="Unique prediction opportunities" emoji="📈" />

      {/* Tier 3 Hot Ticker */}
      <Tier3HotTicker />

      {/* Lottery Jackpot Hero Card */}
      <div className="mt-3">
        <LotteryHeroCard />
      </div>

      {/* 3-Card Row: Showbiz + Weather + Economy */}
      <div className="flex flex-col md:flex-row gap-3 mt-3 md:h-[320px]">
        <ShowbizPremiumCard />
        <WeatherPremiumCard />
        <EconomyPremiumCard />
      </div>

      {/* Tier 3 Hot Markets Strip */}
      <div className="mt-3 mb-2">
        <Tier3HotMarketsStrip />
      </div>

      {/* Remaining Tier 3 Cards */}
      <div className="flex flex-col md:flex-row gap-3 md:h-[260px] w-full mb-3">
        <YesNoCard author="Angela Lim" question="BSP magra-raise ba ng interest rate sa Q2 2026 meeting?" chance={45} endTime="30D" volume="₱180k Vol" image="https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" avatarIdx={5} tier={3} category="Economy" bettors={650} />
        <BuyCard author="Rina Dela Cruz" question="Biggest concert sa PH this 2026?" endTime="60D" volume="₱65k Vol" image="https://images.unsplash.com/photo-1763178466088-09e3678eb56b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" options={[{ label: "Taylor Swift" }, { label: "BTS / K-Pop" }, { label: "SB19" }]} avatarIdx={3} tier={3} category="Showbiz" />
        <YesNoCard author="Paolo Gomez" question="PH GDP growth aabot ba sa 7% this 2026?" chance={28} endTime="120D" volume="₱95k Vol" image="https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" avatarIdx={0} tier={3} category="Economy" bettors={410} />
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:h-[260px] w-full mb-3">
        <FastBetCard author="Juan Cruz" question="Ilan ang typhoon na lalanding sa PH this 2026?" endTime="180D" volume="₱45k Vol" image="https://images.unsplash.com/photo-1726312497465-8b5c6d0bc7b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" outcomes={[{ label: "25+", pct: "15%" }, { label: "20-24", pct: "38%" }, { label: "15-19", pct: "32%" }]} avatarIdx={0} tier={3} category="Weather" />
        <YesNoCard author="Joy Villanueva" question="Miss Universe 2026 — mananalo ba ang Pilipinas?" chance={18} endTime="90D" volume="₱120k Vol" image="https://images.unsplash.com/photo-1765546813202-4beae747f145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" avatarIdx={1} tier={3} category="Showbiz" bettors={750} />
        <FastBetCard author="Marco Tan" question="USD/PHP exchange rate sa Dec 2026?" endTime="120D" volume="₱210k Vol" image="https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" outcomes={[{ label: "₱60+", pct: "5%" }, { label: "₱58-60", pct: "28%" }, { label: "₱55-58", pct: "42%" }]} avatarIdx={4} tier={3} category="Economy" />
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openDeposit = () => setModalOpen(true);

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  return (
    <div className="bg-[#f7f8fa] flex flex-col min-h-screen w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-stretch flex-1">
        <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 md:px-6 py-4 flex-1">
            <div className="flex-1 min-w-0 flex flex-col">
              <Filters />
              <Banner />
              <ActivityFeed />
              <MarketGrid />
            </div>
            <Rankings />
          </div>
        </div>
      </div>
      <Footer />
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={5000} />
    </div>
  );
}