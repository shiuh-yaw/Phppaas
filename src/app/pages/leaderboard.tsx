import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmojiIcon } from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ====================== TYPES ====================== */
interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  profit: number;
  totalBets: number;
  winRate: number;
  streak: number;
  favGame: string;
  favEmoji: string;
  tier: "diamond" | "gold" | "silver" | "bronze" | "iron";
  badges: string[];
}

/* ====================== DATA ====================== */
const AVATARS = [
  "https://images.unsplash.com/photo-1717985498770-e650db9e37c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1731338493464-db479f155a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1745240261519-0b988d54d098?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1718006915613-bcb972cabdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1603954698693-b0bcbceb5ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758270705555-015de348a48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1617089115097-4a5f00f10bf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
];

const LEADERBOARD_ALL: LeaderboardEntry[] = [
  { rank: 1, name: "Juan Cruz", handle: "@JuanBet123", avatar: AVATARS[0], profit: 4232800, totalBets: 1842, winRate: 72, streak: 14, favGame: "PBA", favEmoji: "🏀", tier: "diamond", badges: ["🏆", "🔥", "💎"] },
  { rank: 2, name: "Maria Santos", handle: "@MariaGCash", avatar: AVATARS[1], profit: 3891500, totalBets: 1650, winRate: 69, streak: 11, favGame: "Color Game", favEmoji: "🎲", tier: "diamond", badges: ["🏆", "🎯"] },
  { rank: 3, name: "Carlo Reyes", handle: "@CarloKing", avatar: AVATARS[2], profit: 2128000, totalBets: 980, winRate: 67, streak: 8, favGame: "Color Game", favEmoji: "🎲", tier: "gold", badges: ["⚡", "🎯"] },
  { rank: 4, name: "Rina Dela Cruz", handle: "@RinaPunch", avatar: AVATARS[3], profit: 1890200, totalBets: 1230, winRate: 64, streak: 6, favGame: "Boxing", favEmoji: "🥊", tier: "gold", badges: ["🥊"] },
  { rank: 5, name: "Marco Tan", handle: "@MarcoESports", avatar: AVATARS[4], profit: 1445600, totalBets: 890, winRate: 66, streak: 9, favGame: "Esports", favEmoji: "🎮", tier: "gold", badges: ["🎮", "⚡"] },
  { rank: 6, name: "Angela Lim", handle: "@AngelaBingo", avatar: AVATARS[5], profit: 1102300, totalBets: 745, winRate: 61, streak: 5, favGame: "Bingo", favEmoji: "🎱", tier: "silver", badges: ["🎱"] },
  { rank: 7, name: "Paolo Gomez", handle: "@PaoloBoxing", avatar: AVATARS[6], profit: 892100, totalBets: 620, winRate: 63, streak: 7, favGame: "Boxing", favEmoji: "🥊", tier: "silver", badges: ["🥊", "🔥"] },
  { rank: 8, name: "Joy Villanueva", handle: "@JoyLotto", avatar: AVATARS[7], profit: 754800, totalBets: 510, winRate: 58, streak: 4, favGame: "Lottery", favEmoji: "🎰", tier: "silver", badges: ["🎰"] },
  { rank: 9, name: "Ben Torres", handle: "@BenWeather", avatar: AVATARS[8], profit: 623400, totalBets: 480, winRate: 56, streak: 3, favGame: "Weather", favEmoji: "🌪️", tier: "bronze", badges: ["🌪️"] },
  { rank: 10, name: "Cathy Rivera", handle: "@CathyPBA", avatar: AVATARS[9], profit: 510200, totalBets: 395, winRate: 60, streak: 5, favGame: "Basketball", favEmoji: "🏀", tier: "bronze", badges: ["🏀"] },
  { rank: 11, name: "Mark Aquino", handle: "@MarkBoxer", avatar: AVATARS[0], profit: 445900, totalBets: 340, winRate: 55, streak: 3, favGame: "Boxing", favEmoji: "🥊", tier: "bronze", badges: ["🥊"] },
  { rank: 12, name: "Lisa Garcia", handle: "@LisaMLBB", avatar: AVATARS[1], profit: 389100, totalBets: 290, winRate: 54, streak: 2, favGame: "Esports", favEmoji: "🎮", tier: "bronze", badges: ["🎮"] },
  { rank: 13, name: "Dennis Ramos", handle: "@DennisEcon", avatar: AVATARS[2], profit: 312000, totalBets: 265, winRate: 52, streak: 2, favGame: "Economy", favEmoji: "📈", tier: "iron", badges: ["📈"] },
  { rank: 14, name: "Grace Tan", handle: "@GraceShowbiz", avatar: AVATARS[3], profit: 278500, totalBets: 230, winRate: 51, streak: 1, favGame: "Showbiz", favEmoji: "👑", tier: "iron", badges: ["👑"] },
  { rank: 15, name: "Rico Santos", handle: "@RicoFastBet", avatar: AVATARS[4], profit: 245000, totalBets: 410, winRate: 49, streak: 4, favGame: "Color Game", favEmoji: "🎲", tier: "iron", badges: ["⚡"] },
  { rank: 16, name: "Mika Lopez", handle: "@MikaPBA", avatar: AVATARS[5], profit: 198700, totalBets: 185, winRate: 53, streak: 2, favGame: "Basketball", favEmoji: "🏀", tier: "iron", badges: [] },
  { rank: 17, name: "Jake Cruz", handle: "@JakeBingo", avatar: AVATARS[6], profit: 175200, totalBets: 160, winRate: 50, streak: 1, favGame: "Bingo", favEmoji: "🎱", tier: "iron", badges: [] },
  { rank: 18, name: "Anna Reyes", handle: "@AnnaBet", avatar: AVATARS[7], profit: 148900, totalBets: 140, winRate: 48, streak: 1, favGame: "Boxing", favEmoji: "🥊", tier: "iron", badges: [] },
  { rank: 19, name: "Leo Villanueva", handle: "@LeoTyphoon", avatar: AVATARS[8], profit: 125300, totalBets: 120, winRate: 47, streak: 0, favGame: "Weather", favEmoji: "🌪️", tier: "iron", badges: [] },
  { rank: 20, name: "Sophia Garcia", handle: "@SophiaLotto", avatar: AVATARS[9], profit: 98400, totalBets: 95, winRate: 46, streak: 0, favGame: "Lottery", favEmoji: "🎰", tier: "iron", badges: [] },
];

const TIME_FILTERS = ["All Time", "Monthly", "Weekly", "Daily"];
const CATEGORY_FILTERS = [
  { label: "Lahat", emoji: "🏆", key: "all" },
  { label: "Basketball", emoji: "🏀", key: "Basketball" },
  { label: "Color Game", emoji: "🎲", key: "Color Game" },
  { label: "Boxing", emoji: "🥊", key: "Boxing" },
  { label: "Esports", emoji: "🎮", key: "Esports" },
  { label: "Bingo", emoji: "🎱", key: "Bingo" },
  { label: "Lottery", emoji: "🎰", key: "Lottery" },
  { label: "Showbiz", emoji: "👑", key: "Showbiz" },
  { label: "Weather", emoji: "🌪️", key: "Weather" },
  { label: "Economy", emoji: "📈", key: "Economy" },
];

const SORT_OPTIONS = [
  { label: "Profit", key: "profit" },
  { label: "Win Rate", key: "winRate" },
  { label: "Total Bets", key: "totalBets" },
  { label: "Streak", key: "streak" },
];

const TIER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  diamond: { bg: "#eff6ff", text: "#3b82f6", label: "Diamond" },
  gold: { bg: "#fef9ee", text: "#d97706", label: "Gold" },
  silver: { bg: "#f5f5f5", text: "#6b7280", label: "Silver" },
  bronze: { bg: "#fef4ee", text: "#c2410c", label: "Bronze" },
  iron: { bg: "#f8f9fa", text: "#9ca3af", label: "Iron" },
};

const keyframes = `
@keyframes podium-rise-1 { 0% { transform: translateY(40px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes podium-rise-2 { 0% { transform: translateY(30px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes podium-rise-3 { 0% { transform: translateY(20px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes crown-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes glow-gold { 0%,100%{box-shadow:0 0 15px rgba(251,191,36,0.2)} 50%{box-shadow:0 0 25px rgba(251,191,36,0.4)} }
@keyframes shimmer-bg { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes row-enter { 0%{opacity:0;transform:translateX(-8px)} 100%{opacity:1;transform:translateX(0)} }
`;

/* ====================== FORMAT HELPERS ====================== */
function formatPeso(n: number): string {
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${(n / 1000).toFixed(0)}K`;
  return `₱${n.toLocaleString()}`;
}

/* ====================== PODIUM COMPONENT ====================== */
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const navigate = useNavigate();
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const heights = [140, 180, 120];
  const gradients = [
    "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)", // Silver
    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",  // Gold
    "linear-gradient(135deg, #f5c28a 0%, #cd7f32 100%)",  // Bronze
  ];
  const ringColors = ["#d1d5db", "#fbbf24", "#cd7f32"];
  const labels = ["🥈 2nd", "🥇 1st", "🥉 3rd"];
  const animDelays = ["0.15s", "0s", "0.3s"];

  return (
    <div className="flex items-end justify-center gap-4 pt-6 pb-4">
      {podiumOrder.map((e, i) => (
        <div
          key={e.rank}
          className="flex flex-col items-center cursor-pointer group"
          style={{ animation: `podium-rise-${i + 1} 0.6s ease-out ${animDelays[i]} both` }}
          onClick={() => navigate("/portfolio")}
        >
          {/* Crown for #1 */}
          {i === 1 && (
            <span className="mb-1" style={{ animation: "crown-bounce 2s ease-in-out infinite" }}><EmojiIcon emoji="👑" size={24} /></span>
          )}

          {/* Avatar */}
          <div className="relative mb-2">
            <div
              className="size-16 rounded-full overflow-hidden ring-3 transition-transform group-hover:scale-105"
              style={{
                ringColor: ringColors[i],
                boxShadow: i === 1 ? "0 0 20px rgba(251,191,36,0.35)" : `0 4px 12px rgba(0,0,0,0.08)`,
                animation: i === 1 ? "glow-gold 2s ease-in-out infinite" : "none",
                border: `3px solid ${ringColors[i]}`,
              }}
            >
              <ImageWithFallback src={e.avatar} alt={e.name} className="size-full object-cover" />
            </div>
            {/* Rank badge */}
            <div className="absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center text-[10px] text-white" style={{ fontWeight: 800, background: gradients[i], boxShadow: "0 2px 6px rgba(0,0,0,0.15)", ...ss }}>
              {e.rank}
            </div>
          </div>

          {/* Name */}
          <span className="text-[13px] text-[#070808] mb-0.5" style={{ fontWeight: 600, ...ss }}>{e.name}</span>
          <span className="text-[10px] text-[#b0b3b8] mb-2" style={ss}>{e.handle}</span>

          {/* Badges */}
          <div className="flex items-center gap-1 mb-2">
            {e.badges.map((b, bi) => (
              <span key={bi}><EmojiIcon emoji={b} size={14} /></span>
            ))}
          </div>

          {/* Podium block */}
          <div
            className="w-24 rounded-t-xl flex flex-col items-center justify-end pb-3 pt-3 transition-all"
            style={{ height: heights[i], background: gradients[i], boxShadow: i === 1 ? "0 -4px 20px rgba(251,191,36,0.2)" : "0 -2px 8px rgba(0,0,0,0.04)" }}
          >
            <span className="text-[10px] text-white/80 mb-0.5" style={ss}>{labels[i]}</span>
            <span className="text-white text-[16px]" style={{ fontWeight: 800, ...ss }}>{formatPeso(e.profit)}</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-white/80 text-[10px]" style={ss}>{e.winRate}% WR</span>
              <span className="text-white/60 text-[10px]">·</span>
              <span className="text-white/80 text-[10px]" style={ss}>{e.favEmoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ====================== YOUR RANK BANNER ====================== */
function YourRankBanner() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#ff5222]/30 bg-[#fff8f5] px-5 py-3.5 flex items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="size-10 rounded-full overflow-hidden ring-2 ring-[#ff5222]/30 shrink-0">
          <ImageWithFallback src={AVATARS[4]} alt="You" className="size-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>Ikaw</span>
            <span className="text-[10px] bg-[#ff5222] text-white px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss }}>RANK #47</span>
          </div>
          <span className="text-[11px] text-[#84888c]" style={ss}>@YouBettor · Iron Tier</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#b0b3b8]" style={ss}>Profit</span>
          <span className="text-[14px] text-[#00bf85]" style={{ fontWeight: 700, ...ss }}>+₱12,340</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#b0b3b8]" style={ss}>Win Rate</span>
          <span className="text-[14px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>52%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[14px] text-[#ff5222] inline-flex items-center gap-0.5" style={{ fontWeight: 700, ...ss }}><EmojiIcon emoji="🔥" size={14} /> 3</span>
        </div>
        <button className="bg-[#ff5222] hover:bg-[#e8491e] text-white h-9 px-5 rounded-xl text-[12px] transition-all cursor-pointer" style={{ fontWeight: 600, ...ss, ...pp }}>
          Tumaya pa! ⚡
        </button>
      </div>
    </div>
  );
}

/* ====================== STATS CARDS ====================== */
function StatsCards() {
  const stats = [
    { label: "Total Bettors", value: "12,847", change: "+342 ngayong linggo", emoji: "👥", color: "#3b82f6" },
    { label: "Total Volume", value: "₱48.2M", change: "+₱2.1M ngayon", emoji: "💰", color: "#10b981" },
    { label: "Biggest Win Today", value: "₱125,000", change: "Juan Cruz · PBA", emoji: "🏆", color: "#f59e0b" },
    { label: "Pinaka-Active Game", value: "Color Game", change: "3,420 bets today", emoji: "🎲", color: "#8b5cf6" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#f0f1f3] px-4 py-3.5 flex flex-col gap-1 hover:border-[#dfe0e2] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#84888c]" style={{ fontWeight: 500, ...ss }}>{s.label}</span>
            <EmojiIcon emoji={s.emoji} size={18} />
          </div>
          <span className="text-[20px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>{s.value}</span>
          <span className="text-[10px]" style={{ fontWeight: 500, color: s.color, ...ss }}>{s.change}</span>
        </div>
      ))}
    </div>
  );
}

/* ====================== LEADERBOARD TABLE ====================== */
function LeaderboardTable({ entries, sortBy }: { entries: LeaderboardEntry[]; sortBy: string }) {
  const navigate = useNavigate();

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "winRate") return b.winRate - a.winRate;
    if (sortBy === "totalBets") return b.totalBets - a.totalBets;
    if (sortBy === "streak") return b.streak - a.streak;
    return b.profit - a.profit;
  }).map((e, i) => ({ ...e, rank: i + 1 }));

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <EmojiIcon emoji="🏆" size={16} />;
    if (rank === 2) return <EmojiIcon emoji="🏆" size={16} />;
    if (rank === 3) return <EmojiIcon emoji="🏆" size={16} />;
    return <span className="text-[12px] text-[#84888c]" style={{ fontWeight: 600, ...ss }}>{rank}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-[#f0f1f3] overflow-hidden">
      {/* Table header */}
      <div className="grid items-center px-5 py-2.5 border-b border-[#f5f6f7]" style={{ gridTemplateColumns: "40px 1fr 100px 90px 80px 70px 90px 90px" }}>
        <span className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 600, ...ss }}>#</span>
        <span className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 600, ...ss }}>Player</span>
        <span className="text-[10px] text-[#b0b3b8] text-right" style={{ fontWeight: 600, ...ss }}>Profit</span>
        <span className="text-[10px] text-[#b0b3b8] text-right" style={{ fontWeight: 600, ...ss }}>Total Bets</span>
        <span className="text-[10px] text-[#b0b3b8] text-right" style={{ fontWeight: 600, ...ss }}>Win Rate</span>
        <span className="text-[10px] text-[#b0b3b8] text-center" style={{ fontWeight: 600, ...ss }}>Streak</span>
        <span className="text-[10px] text-[#b0b3b8] text-center" style={{ fontWeight: 600, ...ss }}>Fav Game</span>
        <span className="text-[10px] text-[#b0b3b8] text-center" style={{ fontWeight: 600, ...ss }}>Tier</span>
      </div>

      {/* Table rows */}
      {sorted.map((e, i) => {
        const tc = TIER_COLORS[e.tier];
        return (
          <div
            key={e.handle + e.rank}
            className="grid items-center px-5 py-2.5 border-b border-[#fafafa] hover:bg-[#fafbfc] transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: "40px 1fr 100px 90px 80px 70px 90px 90px", animation: `row-enter 0.3s ease-out ${i * 0.03}s both` }}
            onClick={() => navigate("/portfolio")}
          >
            <div className="flex items-center justify-center w-5">{getRankDisplay(e.rank)}</div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full overflow-hidden shrink-0 ring-1 ring-[#f0f1f3] group-hover:ring-[#ff5222]/20 transition-all">
                <ImageWithFallback src={e.avatar} alt={e.name} className="size-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[#070808] truncate" style={{ fontWeight: 500, ...ss }}>{e.name}</span>
                  {e.badges.slice(0, 2).map((b, bi) => (
                    <span key={bi}><EmojiIcon emoji={b} size={12} /></span>
                  ))}
                </div>
                <span className="text-[10px] text-[#b0b3b8]" style={ss}>{e.handle}</span>
              </div>
            </div>

            <span className="text-[12px] text-right" style={{ fontWeight: 600, color: "#00bf85", ...ss }}>
              +{formatPeso(e.profit)}
            </span>

            <span className="text-[12px] text-[#070808] text-right" style={{ fontWeight: 500, ...ss }}>
              {e.totalBets.toLocaleString()}
            </span>

            <div className="flex items-center justify-end gap-1">
              <div className="w-10 h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${e.winRate}%`, background: e.winRate >= 65 ? "#10b981" : e.winRate >= 50 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <span className="text-[11px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{e.winRate}%</span>
            </div>

            <div className="flex items-center justify-center">
              {e.streak > 0 ? (
                <span className="text-[11px] flex items-center gap-0.5" style={{ fontWeight: 600, color: e.streak >= 7 ? "#ff5222" : e.streak >= 3 ? "#f59e0b" : "#84888c", ...ss }}>
                  {e.streak >= 5 && <EmojiIcon emoji="🔥" size={12} />}{e.streak}
                </span>
              ) : (
                <span className="text-[10px] text-[#dfe0e2]" style={ss}>—</span>
              )}
            </div>

            <div className="flex items-center justify-center gap-1">
              <EmojiIcon emoji={e.favEmoji} size={14} />
              <span className="text-[10px] text-[#84888c]" style={{ fontWeight: 500, ...ss }}>{e.favGame}</span>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 600, background: tc.bg, color: tc.text, ...ss }}>
                {tc.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ====================== PRIZE POOL BANNER ====================== */
function PrizePoolBanner() {
  return (
    <div className="rounded-xl overflow-hidden relative" style={{
      background: "linear-gradient(135deg, #ff5222 0%, #ff8c00 50%, #fbbf24 100%)",
      height: 80,
    }}>
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-bg 3s linear infinite",
      }} />
      <div className="relative z-10 h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <EmojiIcon emoji="🏆" size={28} />
          <div className="flex flex-col">
            <span className="text-white/80 text-[11px]" style={{ fontWeight: 500, ...ss }}>Weekly Leaderboard Prize Pool</span>
            <span className="text-white text-[24px]" style={{ fontWeight: 800, ...ss }}>₱250,000</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-white/70 text-[9px]" style={ss}>1st Place</span>
            <span className="text-white text-[14px]" style={{ fontWeight: 700, ...ss }}>₱100K</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/70 text-[9px]" style={ss}>2nd Place</span>
            <span className="text-white text-[14px]" style={{ fontWeight: 700, ...ss }}>₱50K</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/70 text-[9px]" style={ss}>3rd Place</span>
            <span className="text-white text-[14px]" style={{ fontWeight: 700, ...ss }}>₱25K</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/70 text-[9px]" style={ss}>Top 10</span>
            <span className="text-white text-[14px]" style={{ fontWeight: 700, ...ss }}>₱7.5K each</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== MAIN PAGE ====================== */
export default function LeaderboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openDeposit = () => setModalOpen(true);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("profit");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  // Filter by category
  const filtered = categoryFilter === "all"
    ? LEADERBOARD_ALL
    : LEADERBOARD_ALL.filter(e => e.favGame === categoryFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-[#f7f8fa] flex flex-col min-h-screen w-full" style={pp}>
      <style>{keyframes}</style>
      <div className="flex items-stretch flex-1">
        <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="flex-1 px-6 py-5 overflow-auto">
            <div className="max-w-[1100px] mx-auto flex flex-col gap-5">

              {/* Page Title */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[22px] text-[#070808] inline-flex items-center gap-2" style={{ fontWeight: 700, ...ss }}><EmojiIcon emoji="🏆" size={22} /> Leaderboard</span>
                    <span className="text-[10px] bg-[#ff5222] text-white px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss }}>LIVE</span>
                  </div>
                  <span className="text-[12px] text-[#84888c]" style={ss}>Sino ang pinaka-magaling na bettor sa Lucky Taya? Tingnan ang rankings!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#b0b3b8]" style={ss}>Last updated: 2 mins ago</span>
                  <button className="bg-white border border-[#f0f1f3] text-[#070808] h-8 px-3 rounded-lg text-[11px] cursor-pointer hover:bg-[#f7f8f9] transition-colors" style={{ fontWeight: 500, ...ss }}>
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* Prize Pool Banner */}
              <PrizePoolBanner />

              {/* Stats Cards */}
              <StatsCards />

              {/* Your Rank */}
              <YourRankBanner />

              {/* Time Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {TIME_FILTERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTimeFilter(t); setPage(1); }}
                      className="relative pb-2 text-[14px] transition-colors cursor-pointer"
                      style={{ color: timeFilter === t ? "#070808" : "#84888c", fontWeight: timeFilter === t ? 600 : 400, ...ss }}
                    >
                      {t}
                      {timeFilter === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#b0b3b8]" style={ss}>Sort by:</span>
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setSortBy(s.key); setPage(1); }}
                      className={`h-7 px-3 rounded-md text-[11px] transition-all cursor-pointer border ${sortBy === s.key ? "bg-[#ff5222]/5 border-[#ff5222]/20 text-[#ff5222]" : "bg-white border-[#f0f1f3] text-[#84888c] hover:border-[#dfe0e2]"}`}
                      style={{ fontWeight: sortBy === s.key ? 600 : 400, ...ss }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {CATEGORY_FILTERS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => { setCategoryFilter(c.key); setPage(1); }}
                    className={`shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border transition-all cursor-pointer ${categoryFilter === c.key ? "bg-[#ff5222]/5 border-[#ff5222]/20 text-[#ff5222]" : "bg-white border-[#f0f1f3] text-[#070808] hover:border-[#dfe0e2]"}`}
                    style={{ fontWeight: categoryFilter === c.key ? 600 : 400, ...ss }}
                  >
                    <EmojiIcon emoji={c.emoji} size={16} />
                    <span className="text-[12px]">{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Podium (only show on "all" category and page 1) */}
              {categoryFilter === "all" && page === 1 && (
                <Podium entries={filtered} />
              )}

              {/* Leaderboard Table */}
              <LeaderboardTable entries={paginated} sortBy={sortBy} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="h-8 px-3 rounded-lg border border-[#f0f1f3] text-[12px] text-[#84888c] bg-white hover:bg-[#f7f8f9] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontWeight: 500, ...ss }}
                  >
                    ← Nakaraan
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`size-8 rounded-lg text-[12px] transition-all cursor-pointer ${page === p ? "bg-[#ff5222] text-white" : "bg-white border border-[#f0f1f3] text-[#84888c] hover:bg-[#f7f8f9]"}`}
                      style={{ fontWeight: page === p ? 700 : 400, ...ss }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-3 rounded-lg border border-[#f0f1f3] text-[12px] text-[#84888c] bg-white hover:bg-[#f7f8f9] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontWeight: 500, ...ss }}
                  >
                    Susunod →
                  </button>
                </div>
              )}

              {/* Empty state for filtered results */}
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-[#f0f1f3] p-12 flex flex-col items-center gap-3">
                  <EmojiIcon emoji="🏆" size={32} />
                  <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>Wala pang entries!</span>
                  <span className="text-[12px] text-[#84888c]" style={ss}>Walang bettor pa sa category na ito. Maging una ka!</span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={5000} />
    </div>
  );
}