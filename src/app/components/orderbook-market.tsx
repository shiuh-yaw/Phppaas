import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { EmojiIcon } from "./two-tone-icons";
import { useNavigate } from "react-router";
import { useAuth } from "./auth-context";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
export interface OBLevel {
  price: number;   // cents (0–100)
  shares: number;
  depth: number;   // percentage bar width (0-100)
  mine?: boolean;
}

export interface OBTrade {
  id: number;
  time: string;
  side: "BUY" | "SELL";
  price: number;
  shares: number;
}

export interface OBPricePoint {
  label: string;
  yes: number;
}

export interface OBMarket {
  id: string;
  title: string;
  category: string;
  categoryEmoji: string;
  yesPrice: number;
  noPrice: number;
  spread: number;
  priceChange24h: number;
  volume24h: string;
  openInterest: string;
  endDate: string;
  creator: string;
  creatorFire: number;
  rules: string;
  asks: OBLevel[];
  bids: OBLevel[];
  recentTrades: OBTrade[];
  priceHistory: OBPricePoint[];
  myPositions?: { side: "YES" | "NO"; avgPrice: number; shares: number; currentValue: number; pnl: number }[];
  comments: { user: string; time: string; text: string; likes: number; liked: boolean }[];
}

/* ==================== DATA ==================== */
export const OB_MARKETS: Record<string, OBMarket> = {
  "btc-200k": {
    id: "btc-200k",
    title: "Bitcoin aabot ba sa $200,000 by Dec 31, 2026?",
    category: "Crypto / Global",
    categoryEmoji: "₿",
    yesPrice: 62,
    noPrice: 38,
    spread: 2,
    priceChange24h: 3.2,
    volume24h: "$4.2M",
    openInterest: "$12.8M",
    endDate: "Dec 31, 2026",
    creator: "CryptoOracle",
    creatorFire: 89,
    rules: "This market resolves YES if Bitcoin (BTC/USD) closes at or above $200,000 on any major exchange on or before December 31, 2026 at 23:59 UTC. Resolution source: CoinGecko daily closing price. If the market cannot be resolved due to exchange failure, all positions will be refunded at cost basis.",
    asks: [
      { price: 70, shares: 4200, depth: 19 },
      { price: 68, shares: 7800, depth: 35 },
      { price: 67, shares: 11200, depth: 51 },
      { price: 66, shares: 9400, depth: 43 },
      { price: 65, shares: 15600, depth: 71 },
      { price: 64, shares: 8900, depth: 40 },
      { price: 63, shares: 22100, depth: 100 },
    ],
    bids: [
      { price: 61, shares: 18700, depth: 85 },
      { price: 60, shares: 11200, depth: 51 },
      { price: 59, shares: 9800, depth: 44 },
      { price: 58, shares: 14300, depth: 65 },
      { price: 57, shares: 7600, depth: 34 },
      { price: 55, shares: 5100, depth: 23 },
      { price: 53, shares: 3200, depth: 14 },
    ],
    recentTrades: [
      { id: 1,  time: "12:43:02", side: "BUY",  price: 62, shares: 1500 },
      { id: 2,  time: "12:42:58", side: "SELL", price: 61, shares: 800 },
      { id: 3,  time: "12:42:51", side: "BUY",  price: 63, shares: 2200 },
      { id: 4,  time: "12:42:44", side: "BUY",  price: 62, shares: 500 },
      { id: 5,  time: "12:42:38", side: "SELL", price: 61, shares: 3400 },
      { id: 6,  time: "12:42:29", side: "BUY",  price: 62, shares: 1100 },
      { id: 7,  time: "12:42:21", side: "SELL", price: 60, shares: 650 },
      { id: 8,  time: "12:42:14", side: "BUY",  price: 63, shares: 4800 },
      { id: 9,  time: "12:42:07", side: "SELL", price: 61, shares: 920 },
      { id: 10, time: "12:41:59", side: "BUY",  price: 62, shares: 700 },
      { id: 11, time: "12:41:52", side: "BUY",  price: 61, shares: 2100 },
      { id: 12, time: "12:41:44", side: "SELL", price: 60, shares: 1300 },
      { id: 13, time: "12:41:38", side: "BUY",  price: 62, shares: 6000 },
      { id: 14, time: "12:41:30", side: "SELL", price: 59, shares: 450 },
      { id: 15, time: "12:41:22", side: "BUY",  price: 63, shares: 1800 },
    ],
    priceHistory: [
      { label: "Jan", yes: 38 }, { label: "Feb", yes: 41 }, { label: "Mar", yes: 44 },
      { label: "Apr", yes: 40 }, { label: "May", yes: 52 }, { label: "Jun", yes: 48 },
      { label: "Jul", yes: 55 }, { label: "Aug", yes: 58 }, { label: "Sep", yes: 53 },
      { label: "Oct", yes: 60 }, { label: "Nov", yes: 59 }, { label: "Dec", yes: 62 },
    ],
    myPositions: [
      { side: "YES", avgPrice: 55, shares: 2000, currentValue: 1240, pnl: 140 },
      { side: "NO", avgPrice: 38, shares: 800, currentValue: 304, pnl: -52 },
    ],
    comments: [
      { user: "CryptoWhale_PH",   time: "1h ago",  text: "Bitcoin halving effect delayed but building. $200K by Q4 is very achievable if institutional flow continues. Long YES at 55¢ average.", likes: 45, liked: true },
      { user: "TradingDeskMNL",   time: "3h ago",  text: "Current YES at 62¢ implies 62% probability. BTC needs to roughly 2x from current levels. Seems optimistic but not impossible with ETF inflows.", likes: 28, liked: false },
      { user: "PH_BlockchainPro", time: "5h ago",  text: "The orderbook depth here is impressive — $12.8M OI. This is the type of liquidity that attracts serious traders, not just gamblers.", likes: 19, liked: false },
      { user: "GlobalMacro99",    time: "8h ago",  text: "Fed pivot + weak dollar + Bitcoin supply shock = classic bull setup. I'm buying YES dips below 60¢.", likes: 33, liked: false },
    ],
  },

  "ph-gilas-fiba": {
    id: "ph-gilas-fiba",
    title: "Gilas Pilipinas — Top 2 sa FIBA 2027 World Cup Asian Qualifiers Group C?",
    category: "Basketball / FIBA",
    categoryEmoji: "🏀",
    yesPrice: 74,
    noPrice: 26,
    spread: 3,
    priceChange24h: -1.8,
    volume24h: "₱2.8M",
    openInterest: "₱6.1M",
    endDate: "Jun 2027",
    creator: "GilasNation",
    creatorFire: 67,
    rules: "Market resolves YES if Gilas Pilipinas finishes in the Top 2 of their assigned FIBA 2027 World Cup Asian Qualifiers group, guaranteeing direct World Cup qualification. Resolution based on official FIBA standings at the conclusion of qualifying rounds. Cancelled games void the market.",
    asks: [
      { price: 82, shares: 3100, depth: 22 },
      { price: 80, shares: 5600, depth: 40 },
      { price: 79, shares: 8900, depth: 63 },
      { price: 78, shares: 7200, depth: 51 },
      { price: 77, shares: 14100, depth: 100 },
    ],
    bids: [
      { price: 74, shares: 12400, depth: 88 },
      { price: 73, shares: 8700, depth: 62 },
      { price: 72, shares: 6100, depth: 43 },
      { price: 70, shares: 9800, depth: 70 },
      { price: 68, shares: 5400, depth: 38 },
    ],
    recentTrades: [
      { id: 1,  time: "11:32:14", side: "BUY",  price: 74, shares: 2000 },
      { id: 2,  time: "11:32:08", side: "BUY",  price: 75, shares: 1400 },
      { id: 3,  time: "11:31:55", side: "SELL", price: 73, shares: 600 },
      { id: 4,  time: "11:31:48", side: "BUY",  price: 74, shares: 3200 },
      { id: 5,  time: "11:31:39", side: "SELL", price: 72, shares: 800 },
      { id: 6,  time: "11:31:30", side: "BUY",  price: 75, shares: 1100 },
      { id: 7,  time: "11:31:21", side: "SELL", price: 74, shares: 500 },
      { id: 8,  time: "11:31:12", side: "BUY",  price: 74, shares: 4500 },
      { id: 9,  time: "11:31:03", side: "SELL", price: 73, shares: 1200 },
      { id: 10, time: "11:30:54", side: "BUY",  price: 75, shares: 2800 },
    ],
    priceHistory: [
      { label: "Aug", yes: 60 }, { label: "Sep", yes: 64 }, { label: "Oct", yes: 68 },
      { label: "Nov", yes: 65 }, { label: "Dec", yes: 71 }, { label: "Jan", yes: 74 },
      { label: "Feb", yes: 72 }, { label: "Mar", yes: 75 }, { label: "Apr", yes: 74 },
    ],
    comments: [
      { user: "GilasSupporter",   time: "2h ago",  text: "With Kai Sotto healthy and Clarkson possibly playing, YES at 74¢ is still a great entry. Gilas dominates this group!", likes: 67, liked: true },
      { user: "FIBAAnalyst_SEA",  time: "4h ago",  text: "Group C has Lebanon and Korea as main threats. Gilas home court advantage in Manila is huge. 74% probability sounds about right.", likes: 31, liked: false },
      { user: "BasketballPH_Pro", time: "7h ago",  text: "Been building a YES position since 60¢. 74¢ current price is still fair value — if Jordan Clarkson commits, this goes to 85+.", likes: 22, liked: false },
    ],
  },
};

export function getOBMarket(id: string | undefined): OBMarket | null {
  return OB_MARKETS[id || ""] || null;
}

/* ==================== ORDERBOOK TABLE ==================== */
interface OrderbookTableProps {
  market: OBMarket;
  isDark: boolean;
  t: { bg: string; bgAlt: string; card: string; cardBorder: string; text: string; textSec: string; textMut: string; textFaint: string };
  compact?: boolean;
}

export function OrderbookTable({ market, isDark, t, compact = false }: OrderbookTableProps) {
  const [flashRow, setFlashRow] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * 3);
      setFlashRow(idx);
      setTimeout(() => setFlashRow(null), 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const numRows = compact ? 5 : 7;
  const asks = market.asks.slice(0, numRows).reverse(); // highest ask first
  const bids = market.bids.slice(0, numRows);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}`, background: t.card }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.cardBorder }}>
        <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Order Book</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm" style={{ background: "rgba(239,68,68,0.5)" }} />
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Asks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm" style={{ background: "rgba(34,197,94,0.5)" }} />
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Bids</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 border-b" style={{ borderColor: t.cardBorder }}>
        <span className="flex-1 text-[10px]" style={{ color: t.textMut, ...ss }}>Price (¢)</span>
        <span className="w-24 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Shares</span>
        <span className="w-24 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Total (¢)</span>
      </div>

      {/* Asks */}
      <div>
        {asks.map((ask, i) => (
          <div key={`ask-${ask.price}`} className="relative flex items-center px-4 h-9 transition-all" style={{ background: flashRow === i && i < 3 ? "rgba(239,68,68,0.08)" : "transparent" }}>
            {/* Depth bar */}
            <div className="absolute inset-y-0 right-0" style={{ width: `${ask.depth}%`, background: "rgba(239,68,68,0.08)", transition: "width 0.3s ease" }} />
            <span className="flex-1 text-[13px] relative z-10" style={{ color: "#ef4444", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{ask.price}¢</span>
            <span className="w-24 text-right text-[12px] relative z-10" style={{ color: t.textSec, fontVariantNumeric: "tabular-nums", ...ss }}>{ask.shares.toLocaleString()}</span>
            <span className="w-24 text-right text-[11px] relative z-10" style={{ color: t.textMut, fontVariantNumeric: "tabular-nums", ...ss }}>{(ask.price * ask.shares / 100).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Spread row */}
      <div className="flex items-center justify-between px-4 py-2 border-y" style={{ borderColor: t.cardBorder, background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa" }}>
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>YES Price</span>
            <span className="text-[18px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{market.yesPrice}¢</span>
          </div>
          <div className="text-[10px] px-2 py-1 rounded" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f5f6f7", color: t.textMut, ...ss }}>
            Spread: {market.spread}¢
          </div>
          <div>
            <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>NO Price</span>
            <span className="text-[18px]" style={{ color: "#ef4444", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{market.noPrice}¢</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>24h Change</span>
          <span className="text-[14px]" style={{ color: market.priceChange24h >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, ...ss, ...pp }}>
            {market.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(market.priceChange24h)}%
          </span>
        </div>
      </div>

      {/* Bids */}
      <div>
        {bids.map((bid, i) => (
          <div key={`bid-${bid.price}`} className="relative flex items-center px-4 h-9 transition-all" style={{ background: flashRow === i && i < 2 ? "rgba(34,197,94,0.08)" : "transparent" }}>
            <div className="absolute inset-y-0 left-0" style={{ width: `${bid.depth}%`, background: "rgba(34,197,94,0.08)", transition: "width 0.3s ease" }} />
            <span className="flex-1 text-[13px] relative z-10" style={{ color: "#22c55e", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{bid.price}¢</span>
            <span className="w-24 text-right text-[12px] relative z-10" style={{ color: t.textSec, fontVariantNumeric: "tabular-nums", ...ss }}>{bid.shares.toLocaleString()}</span>
            <span className="w-24 text-right text-[11px] relative z-10" style={{ color: t.textMut, fontVariantNumeric: "tabular-nums", ...ss }}>{(bid.price * bid.shares / 100).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== TIMEFRAME DATA GENERATOR ==================== */
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateTimeframeData(tab: string, currentPrice: number, allData: OBPricePoint[]): OBPricePoint[] {
  if (tab === "All") return allData;

  const configs: Record<string, { count: number; volatility: number; labels: (i: number) => string }> = {
    "1D": { count: 24, volatility: 1.2, labels: (i) => { const h = i; return h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`; } },
    "1W": { count: 7, volatility: 2.5, labels: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] },
    "1M": { count: 30, volatility: 3, labels: (i) => `${i + 1}` },
    "3M": { count: 12, volatility: 4, labels: (i) => `W${i + 1}` },
  };
  const cfg = configs[tab];
  if (!cfg) return allData;

  const rng = seededRandom(tab.length * 1000 + currentPrice * 7);
  const values: number[] = [];
  let p = currentPrice;
  values.push(p);
  for (let i = 1; i < cfg.count; i++) {
    p = Math.max(5, Math.min(95, p + (rng() - 0.52) * cfg.volatility * 2));
    values.unshift(Math.round(p));
  }
  return values.map((v, i) => ({ label: cfg.labels(i), yes: v }));
}

/* ==================== PRICE CHART ==================== */
interface OBPriceChartProps {
  market: OBMarket;
  isDark: boolean;
  t: { card: string; cardBorder: string; text: string; textSec: string; textMut: string; chartGrid?: string };
}

export function OBPriceChart({ market, isDark, t }: OBPriceChartProps) {
  const [tab, setTab] = useState("All");
  const tabs = ["1D", "1W", "1M", "3M", "All"];

  const chartData = useMemo(() => generateTimeframeData(tab, market.yesPrice, market.priceHistory), [tab, market.yesPrice, market.priceHistory]);

  const periodChange = useMemo(() => {
    if (chartData.length < 2) return { pct: 0 };
    const first = chartData[0].yes;
    const last = chartData[chartData.length - 1].yes;
    return { pct: parseFloat(((last - first) / first * 100).toFixed(1)) };
  }, [chartData]);

  const periodLabel = tab === "All" ? "All time" : tab === "1D" ? "24h" : tab === "1W" ? "7d" : tab === "1M" ? "30d" : "90d";

  const iconFill = isDark ? "rgba(255,255,255,0.5)" : "#84888c";
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[13px]" style={{ color: t.textSec, ...ss, ...pp }}>YES Probability · Last</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[28px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{market.yesPrice}¢</span>
            <span className="text-[12px] px-2 py-1 rounded-lg" style={{ background: periodChange.pct >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: periodChange.pct >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, ...ss }}>
              {periodChange.pct >= 0 ? "▲" : "▼"} {Math.abs(periodChange.pct)}% {periodLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }} title="Favorite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }} title="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>

      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis key="xaxis" dataKey="label" tick={{ fill: t.textMut, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" domain={[0, 100]} tick={{ fill: t.textMut, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}¢`} />
            <Tooltip key="tooltip"
              contentStyle={{ background: isDark ? "#1a1b1f" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}¢`, "YES"]}
            />
            <ReferenceLine key="ref-50" y={50} stroke={t.textMut} strokeDasharray="4 4" strokeOpacity={0.5} />
            <Line key="line-yes" type="monotone" dataKey="yes" stroke={periodChange.pct >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={2.5} dot={false} animationDuration={400} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time tabs (bottom right) */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1">
          {tabs.map(t2 => (
            <button key={t2} onClick={() => setTab(t2)} className="h-7 px-2.5 rounded text-[11px] cursor-pointer transition-colors" style={{ background: tab === t2 ? (isDark ? "rgba(255,255,255,0.1)" : "#f2f3f4") : "transparent", color: tab === t2 ? t.text : t.textMut, fontWeight: tab === t2 ? 600 : 400, ...ss, ...pp }}>
              {t2}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ==================== RECENT TRADES ==================== */
export function RecentTrades({ market, isDark, t }: { market: OBMarket; isDark: boolean; t: { card: string; cardBorder: string; text: string; textSec: string; textMut: string } }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}`, background: t.card }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.cardBorder }}>
        <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Recent Trades</span>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 bg-[#22c55e] rounded-full animate-pulse" />
          <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>Live</span>
        </div>
      </div>
      <div className="flex items-center px-4 py-1.5 border-b" style={{ borderColor: t.cardBorder }}>
        <span className="flex-1 text-[10px]" style={{ color: t.textMut, ...ss }}>Time</span>
        <span className="w-16 text-center text-[10px]" style={{ color: t.textMut, ...ss }}>Side</span>
        <span className="w-16 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Price</span>
        <span className="w-20 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Shares</span>
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {market.recentTrades.map((trade) => (
          <div key={trade.id} className="flex items-center px-4 h-9 border-b last:border-b-0 hover:bg-black/[0.02] transition-colors" style={{ borderColor: t.cardBorder }}>
            <span className="flex-1 text-[11px]" style={{ color: t.textMut, fontVariantNumeric: "tabular-nums", ...ss }}>{trade.time}</span>
            <span className="w-16 text-center">
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: trade.side === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: trade.side === "BUY" ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>
                {trade.side}
              </span>
            </span>
            <span className="w-16 text-right text-[12px]" style={{ color: trade.side === "BUY" ? "#22c55e" : "#ef4444", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{trade.price}¢</span>
            <span className="w-20 text-right text-[12px]" style={{ color: t.textSec, fontVariantNumeric: "tabular-nums", ...ss }}>{trade.shares.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== ORDER CONFIRMATION MODAL ==================== */
interface OrderModalProps {
  side: "YES" | "NO";
  orderType: "Market" | "Limit";
  shares: number;
  price: number;
  totalCost: string;
  potentialPayout?: string;
  potentialProfit?: string;
  marketTitle: string;
  isSubmitting?: boolean;
  isDark: boolean;
  t: { bg: string; bgAlt: string; card: string; cardBorder: string; text: string; textSec: string; textMut: string; textFaint: string; inputBg: string; inputBorder: string };
  onConfirm?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
}

function OrderConfirmationModal({ side, orderType, shares, price, totalCost, potentialPayout, potentialProfit, marketTitle, isSubmitting, isDark, t, onConfirm, onCancel }: OrderModalProps) {
  const sideColor = side === "YES" ? "#22c55e" : "#ef4444";
  const sideBg = side === "YES" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: "0 24px 48px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sideBg }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={sideColor} strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <div>
              <span className="text-[15px] block" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Confirm Order</span>
              <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>{orderType} Order · Buy {side}</span>
            </div>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMut} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="h-px mx-6" style={{ background: t.cardBorder }} />

        {/* Market title */}
        <div className="px-6 py-3">
          <p className="text-[12px] leading-[1.5]" style={{ color: t.textSec, ...ss, ...pp }}>{marketTitle}</p>
        </div>

        {/* Order details */}
        <div className="mx-6 rounded-xl p-4 flex flex-col gap-3" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Side</span>
            <span className="text-[12px] px-2.5 py-0.5 rounded-md" style={{ background: sideBg, color: sideColor, fontWeight: 700, ...ss }}>{side}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Order Type</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, ...ss }}>{orderType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Shares</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{shares.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Price</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{price}¢ per share</span>
          </div>
          <div className="h-px" style={{ background: t.cardBorder }} />
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss }}>Total Cost</span>
            <span className="text-[16px]" style={{ color: t.text, fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{Number(totalCost).toLocaleString()}</span>
          </div>
          {potentialPayout && potentialProfit && (
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>If {side} wins</span>
              <span className="text-[12px]" style={{ color: "#22c55e", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>₱{Number(potentialPayout).toLocaleString()} (+₱{Number(potentialProfit).toLocaleString()})</span>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mx-6 mt-3 rounded-lg p-3 flex items-start gap-2.5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <p className="text-[11px] leading-[1.5]" style={{ color: "#b45309", ...ss }}>
            {orderType === "Market" ? "Market orders execute at the best available price. Actual fill price may differ slightly." : "Limit orders will only execute at your specified price or better."}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pt-4 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 h-12 rounded-xl text-[13px] cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 600, border: `1px solid ${t.cardBorder}`, ...ss, ...pp }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isSubmitting} className="flex-1 h-12 rounded-xl text-[13px] cursor-pointer transition-opacity flex items-center justify-center gap-2" style={{ background: sideColor, color: "#fff", fontWeight: 700, opacity: isSubmitting ? 0.7 : 1, ...ss, ...pp }}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>
                Submitting…
              </>
            ) : (
              <>Confirm Buy {side}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== ORDER COMPLETE MODAL ==================== */
function OrderCompleteModal({ side, orderType, shares, price, totalCost, marketTitle, isDark, t, onDone }: OrderModalProps) {
  const sideColor = side === "YES" ? "#22c55e" : "#ef4444";
  const orderId = `OB-${Date.now().toString(36).toUpperCase()}`;
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: "0 24px 48px rgba(0,0,0,0.25)" }}>
        {/* Success header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.12)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <span className="text-[18px] mb-1" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Order Placed!</span>
          <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Your {orderType.toLowerCase()} order has been submitted</span>
        </div>

        <div className="h-px mx-6" style={{ background: t.cardBorder }} />

        {/* Receipt */}
        <div className="mx-6 my-4 rounded-xl p-4 flex flex-col gap-2.5" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Order ID</span>
            <span className="text-[11px] font-mono" style={{ color: t.textSec, fontWeight: 500 }}>{orderId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Time</span>
            <span className="text-[11px]" style={{ color: t.textSec, fontWeight: 500, ...ss }}>{timeStr}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Market</span>
            <span className="text-[11px] text-right max-w-[200px] truncate" style={{ color: t.textSec, fontWeight: 500, ...ss }}>{marketTitle}</span>
          </div>
          <div className="h-px" style={{ background: t.cardBorder }} />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Side</span>
            <span className="text-[12px] px-2 py-0.5 rounded" style={{ background: side === "YES" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: sideColor, fontWeight: 700, ...ss }}>{side}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Shares</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{shares.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Fill Price</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{price}¢</span>
          </div>
          <div className="h-px" style={{ background: t.cardBorder }} />
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss }}>Total</span>
            <span className="text-[18px]" style={{ color: sideColor, fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{Number(totalCost).toLocaleString()}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mx-6 mb-4 rounded-lg p-3 flex items-center gap-2.5" style={{ background: orderType === "Market" ? "rgba(34,197,94,0.06)" : "rgba(251,191,36,0.06)", border: `1px solid ${orderType === "Market" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)"}` }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: orderType === "Market" ? "#22c55e" : "#f59e0b" }} />
          <span className="text-[11px]" style={{ color: orderType === "Market" ? "#16a34a" : "#b45309", fontWeight: 500, ...ss }}>
            {orderType === "Market" ? "Filled · Your market order was matched instantly" : "Open · Your limit order is now in the order book"}
          </span>
        </div>

        {/* Done button */}
        <div className="px-6 pb-6">
          <button onClick={onDone} className="w-full h-12 rounded-xl text-[14px] cursor-pointer" style={{ background: sideColor, color: "#fff", fontWeight: 700, ...ss, ...pp }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== TRADING PANEL ==================== */
interface OrderbookTradingPanelProps {
  market: OBMarket;
  isDark: boolean;
  t: { bg: string; bgAlt: string; card: string; cardBorder: string; text: string; textSec: string; textMut: string; textFaint: string; inputBg: string; inputBorder: string };
  onDeposit: () => void;
}

export function OrderbookTradingPanel({ market, isDark, t, onDeposit }: OrderbookTradingPanelProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<"Buy" | "Sell">("Buy");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [shares, setShares] = useState("");
  const [limitPrice, setLimitPrice] = useState(String(market.yesPrice));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numShares = parseFloat(shares) || 0;
  const execPrice = orderType === "Market" ? (side === "YES" ? market.yesPrice : market.noPrice) : parseFloat(limitPrice) || 0;
  const totalCost = (numShares * execPrice / 100).toFixed(2);
  const potentialPayout = numShares.toFixed(0);
  const potentialProfit = (numShares - numShares * execPrice / 100).toFixed(2);

  const handlePlaceOrder = () => {
    if (numShares <= 0) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmOpen(false);
      setOrderComplete(true);
    }, 1500);
  };

  const handleDone = () => {
    setOrderComplete(false);
    setShares("");
  };

  return (
    <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-4 p-4 border-l overflow-y-auto" style={{ background: t.card, borderColor: t.cardBorder }}>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Place Order</span>
        <p className="text-[12px] leading-[1.4]" style={{ color: t.textSec, ...ss, ...pp }}>{market.title}</p>
      </div>

      {/* Buy/Sell toggle */}
      <div className="relative flex p-1 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f5f6f7" }}>
        <div
          className="absolute top-1 bottom-1 rounded-md transition-all duration-200 ease-out"
          style={{
            left: action === "Buy" ? 4 : "50%",
            width: "calc(50% - 4px)",
            background: t.card,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        />
        {(["Buy", "Sell"] as const).map(a => (
          <button key={a} onClick={() => setAction(a)} className="relative flex-1 h-9 text-[13px] cursor-pointer z-10" style={{
            color: action === a ? (a === "Buy" ? "#22c55e" : "#ef4444") : t.textMut,
            fontWeight: 600, ...ss, ...pp,
          }}>
            {a}
          </button>
        ))}
      </div>

      {/* YES/NO toggle */}
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: t.cardBorder }}>
        {(["YES", "NO"] as const).map(s => (
          <button key={s} onClick={() => setSide(s)} className="flex-1 h-10 text-[13px] cursor-pointer transition-all" style={{ background: side === s ? (s === "YES" ? "#22c55e" : "#ef4444") : "transparent", color: side === s ? "#fff" : (s === "YES" ? "#22c55e" : "#ef4444"), fontWeight: 700, ...ss, ...pp }}>
            {s} · {s === "YES" ? market.yesPrice : market.noPrice}¢
          </button>
        ))}
      </div>

      {/* Order type */}
      <div className="flex items-center gap-2">
        {(["Market", "Limit"] as const).map(ot => (
          <button key={ot} onClick={() => setOrderType(ot)} className="flex-1 h-8 rounded-lg text-[12px] cursor-pointer transition-all" style={{ background: orderType === ot ? (isDark ? "rgba(255,255,255,0.1)" : "#f2f3f4") : "transparent", color: orderType === ot ? t.text : t.textMut, fontWeight: orderType === ot ? 600 : 400, border: `1px solid ${orderType === ot ? t.cardBorder : "transparent"}`, ...ss, ...pp }}>
            {ot}
          </button>
        ))}
      </div>

      {/* Shares input */}
      <div>
        <span className="text-[12px] block mb-1.5" style={{ color: t.textSec, ...ss, ...pp }}>Number of Shares</span>
        <div className="flex items-center h-11 rounded-lg border px-3 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
          <input
            type="number" value={shares}
            onChange={e => setShares(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent outline-none text-[18px] w-full"
            style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}
          />
          <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>shares</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {["100", "500", "1K", "5K"].map(v => (
            <button key={v} onClick={() => setShares(String(v === "1K" ? 1000 : v === "5K" ? 5000 : Number(v)))} className="flex-1 h-7 rounded text-[11px] cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, ...ss, ...pp }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Limit price (if limit order) */}
      {orderType === "Limit" && (
        <div>
          <span className="text-[12px] block mb-1.5" style={{ color: t.textSec, ...ss, ...pp }}>Limit Price</span>
          <div className="flex items-center h-11 rounded-lg border px-3 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
            <input
              type="number" value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              min={1} max={99}
              className="flex-1 bg-transparent outline-none text-[18px] w-full"
              style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}
            />
            <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>¢</span>
          </div>
        </div>
      )}

      {/* Order summary */}
      {numShares > 0 && (
        <div className="flex flex-col gap-2 rounded-xl p-3" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Avg Price</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{execPrice}¢</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Est. Cost</span>
            <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>₱{Number(totalCost).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>If YES wins · Return</span>
            <span className="text-[12px]" style={{ color: "#22c55e", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>₱{numShares.toLocaleString()} (+₱{Number(potentialProfit).toLocaleString()})</span>
          </div>
        </div>
      )}

      {/* CTA */}
      {isLoggedIn ? (
        <button
          onClick={handlePlaceOrder}
          className="h-12 rounded-lg text-[14px] cursor-pointer transition-colors"
          style={{ background: action === "Buy" ? "#22c55e" : "#ef4444", color: "#fff", fontWeight: 700, ...ss, ...pp, opacity: numShares > 0 ? 1 : 0.5 }}
        >
          {action} {side} · {orderType}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate("/login")} className="h-12 rounded-lg text-[14px] cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
            Sign In to Trade
          </button>
          <button onClick={() => navigate("/signup")} className="h-10 rounded-lg text-[13px] cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid ${t.cardBorder}`, color: t.text, fontWeight: 500, ...ss, ...pp }}>
            Create Account
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <OrderConfirmationModal
          side={side} orderType={orderType} shares={numShares} price={execPrice}
          totalCost={totalCost} potentialPayout={potentialPayout} potentialProfit={potentialProfit}
          marketTitle={market.title} isSubmitting={isSubmitting} isDark={isDark} t={t}
          onConfirm={handleConfirm} onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* Order Complete Modal */}
      {orderComplete && (
        <OrderCompleteModal
          side={side} orderType={orderType} shares={numShares} price={execPrice}
          totalCost={totalCost} marketTitle={market.title} isDark={isDark} t={t}
          onDone={handleDone}
        />
      )}

      {/* My Positions */}
      {isLoggedIn && market.myPositions && market.myPositions.length > 0 && (
        <div>
          <span className="text-[12px] block mb-2" style={{ color: t.textSec, fontWeight: 600, ...ss, ...pp }}>My Positions</span>
          {market.myPositions.map((pos, i) => {
            const currentPrice = pos.side === "YES" ? market.yesPrice : market.noPrice;
            return (
              <div key={i} className="rounded-lg p-3 flex flex-col gap-2" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: pos.side === "YES" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: pos.side === "YES" ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>{pos.side}</span>
                  <span className="text-[12px]" style={{ color: pos.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, ...ss }}>
                    {pos.pnl >= 0 ? "+" : ""}₱{pos.pnl.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]" style={{ color: t.textMut, ...ss }}>
                  <span>Avg {pos.avgPrice}¢ · {pos.shares.toLocaleString()} shares</span>
                  <span>₱{pos.currentValue.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => { setAction("Sell"); setSide(pos.side); setShares(String(pos.shares)); setLimitPrice(String(currentPrice)); }}
                  className="h-8 rounded-md text-[11px] cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "#ef4444", color: "#fff", fontWeight: 700, ...ss, ...pp }}
                >
                  Sell @ {currentPrice}¢
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== MOBILE ORDER SHEET ==================== */
export function MobileOrderSheet({ market, isDark, t, onDeposit }: OrderbookTradingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [shares, setShares] = useState("");
  const [limitPrice, setLimitPrice] = useState(String(market.yesPrice));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const numShares = parseFloat(shares) || 0;
  const execPrice = orderType === "Market" ? (side === "YES" ? market.yesPrice : market.noPrice) : parseFloat(limitPrice) || 0;
  const totalCost = (numShares * execPrice / 100).toFixed(2);
  const potentialPayout = numShares.toFixed(0);
  const potentialProfit = (numShares - numShares * execPrice / 100).toFixed(2);

  const handlePlaceOrder = () => {
    if (numShares <= 0) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmOpen(false);
      setIsOpen(false);
      setOrderComplete(true);
    }, 1500);
  };

  const handleDone = () => {
    setOrderComplete(false);
    setShares("");
  };

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>YES</span>
              <span className="text-[16px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{market.yesPrice}¢</span>
            </div>
            <div className="w-px h-8 mx-1" style={{ background: t.cardBorder }} />
            <div className="flex flex-col">
              <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>NO</span>
              <span className="text-[16px]" style={{ color: "#ef4444", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{market.noPrice}¢</span>
            </div>
          </div>
          {isLoggedIn ? (
            <div className="flex gap-2 flex-1">
              <button onClick={() => { setSide("YES"); setIsOpen(true); }} className="flex-1 h-11 rounded-xl text-[13px] cursor-pointer" style={{ background: "#22c55e", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
                Buy Yes · {market.yesPrice}¢
              </button>
              <button onClick={() => { setSide("NO"); setIsOpen(true); }} className="flex-1 h-11 rounded-xl text-[13px] cursor-pointer" style={{ background: "#ef4444", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
                Buy No · {market.noPrice}¢
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="h-11 px-6 rounded-xl text-[14px] cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative rounded-t-2xl max-h-[90vh] overflow-y-auto" style={{ background: t.card }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: t.textFaint }} />
            </div>
            <div className="px-5 pb-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <EmojiIcon emoji="📊" size={18} />
                <span className="text-[14px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Place Order</span>
                <button onClick={() => { setIsOpen(false); onDeposit(); }} className="text-[12px] px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss }}>+ Deposit</button>
              </div>
              <div className="h-px" style={{ background: t.cardBorder }} />

              {/* YES/NO toggle */}
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: t.cardBorder }}>
                {(["YES", "NO"] as const).map(s => (
                  <button key={s} onClick={() => setSide(s)} className="flex-1 h-11 text-[14px] cursor-pointer transition-all" style={{ background: side === s ? (s === "YES" ? "#22c55e" : "#ef4444") : "transparent", color: side === s ? "#fff" : (s === "YES" ? "#22c55e" : "#ef4444"), fontWeight: 700, ...ss, ...pp }}>
                    Buy {s} · {s === "YES" ? market.yesPrice : market.noPrice}¢
                  </button>
                ))}
              </div>

              {/* Order type */}
              <div className="flex items-center gap-2">
                {(["Market", "Limit"] as const).map(ot => (
                  <button key={ot} onClick={() => setOrderType(ot)} className="flex-1 h-9 rounded-lg text-[13px] cursor-pointer" style={{ background: orderType === ot ? (isDark ? "rgba(255,255,255,0.1)" : "#f2f3f4") : "transparent", color: orderType === ot ? t.text : t.textMut, fontWeight: orderType === ot ? 600 : 400, border: `1px solid ${orderType === ot ? t.cardBorder : "transparent"}`, ...ss, ...pp }}>
                    {ot} Order
                  </button>
                ))}
              </div>

              {/* Shares */}
              <div>
                <span className="text-[12px] block mb-1.5" style={{ color: t.textSec, ...ss, ...pp }}>Shares</span>
                <div className="flex items-center h-12 rounded-xl border px-4 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
                  <input type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="0" className="flex-1 bg-transparent outline-none text-[20px] w-full" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }} />
                  <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>shares</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {["100", "500", "1K", "5K", "MAX"].map(v => (
                    <button key={v} onClick={() => setShares(v === "MAX" ? "10000" : v === "1K" ? "1000" : v === "5K" ? "5000" : v)} className="flex-1 h-8 rounded-lg text-[12px] cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, ...ss, ...pp }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Limit price */}
              {orderType === "Limit" && (
                <div>
                  <span className="text-[12px] block mb-1.5" style={{ color: t.textSec, ...ss, ...pp }}>Limit Price (¢)</span>
                  <div className="flex items-center h-12 rounded-xl border px-4 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
                    <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} min={1} max={99} className="flex-1 bg-transparent outline-none text-[20px] w-full" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }} />
                    <span className="text-[14px]" style={{ color: t.textMut, ...ss }}>¢</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {numShares > 0 && (
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: side === "YES" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)" }}>
                  <div>
                    <span className="text-[11px] block" style={{ color: t.textMut, ...ss }}>Est. Cost</span>
                    <span className="text-[24px]" style={{ color: side === "YES" ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss, ...pp }}>₱{Number(totalCost).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] block" style={{ color: t.textMut, ...ss }}>Shares</span>
                    <span className="text-[20px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{numShares.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button onClick={handlePlaceOrder} className="h-14 rounded-xl text-[16px] cursor-pointer" style={{ background: side === "YES" ? "#22c55e" : "#ef4444", color: "#fff", fontWeight: 700, opacity: numShares > 0 ? 1 : 0.5, ...ss, ...pp }}>
                Place {orderType} Order — Buy {side}
              </button>

              <p className="text-[10px] text-center" style={{ color: t.textMut, ...ss }}>
                By trading, you agree to the <span className="underline cursor-pointer">Terms of Use</span>. Orders may not fill at exact prices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <OrderConfirmationModal
          side={side} orderType={orderType} shares={numShares} price={execPrice}
          totalCost={totalCost} potentialPayout={potentialPayout} potentialProfit={potentialProfit}
          marketTitle={market.title} isSubmitting={isSubmitting} isDark={isDark} t={t}
          onConfirm={handleConfirm} onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* Order Complete Modal */}
      {orderComplete && (
        <OrderCompleteModal
          side={side} orderType={orderType} shares={numShares} price={execPrice}
          totalCost={totalCost} marketTitle={market.title} isDark={isDark} t={t}
          onDone={handleDone}
        />
      )}
    </>
  );
}

/* ==================== MARKET DEPTH CHART (moved to market-depth-chart.tsx) ==================== */
interface MarketDepthChartProps {
  market: OBMarket;
  isDark: boolean;
  t: { card: string; cardBorder: string; text: string; textSec: string; textMut: string };
}

export function MarketDepthChart({ market, isDark, t }: MarketDepthChartProps) {
  const totalBidVol = market.bids.reduce((s, b) => s + b.shares, 0);
  const totalAskVol = market.asks.reduce((s, a) => s + a.shares, 0);
  const maxVol = Math.max(totalBidVol, totalAskVol);
  const bestBid = Math.max(...market.bids.map(b => b.price));
  const bestAsk = Math.min(...market.asks.map(a => a.price));
  const spread = bestAsk - bestBid;
  const yesRatio = (totalBidVol / (totalBidVol + totalAskVol)) * 100;

  // SVG stepped depth curve builder
  const W = 560; const H = 160;
  const PL = 36; const PR = 8; const PT = 16; const PB = 20;
  const cW = W - PL - PR; const cH = H - PT - PB;

  const bidsDesc = [...market.bids].sort((a, b) => b.price - a.price);
  const asksAsc  = [...market.asks].sort((a, b) => a.price - b.price);
  const allPrices = [...bidsDesc.map(b => b.price), ...asksAsc.map(a => a.price)];
  const minP = Math.min(...allPrices) - 1;
  const maxP = Math.max(...allPrices) + 1;
  const pRange = maxP - minP || 1;

  const px = (p: number) => PL + ((p - minP) / pRange) * cW;
  const py = (v: number) => PT + cH - (v / maxVol) * cH;

  // Build bid stepped points (cumulative from lowest to highest price, descending from right)
  const bidPts: string[] = [];
  let cum = 0;
  [...bidsDesc].reverse().forEach(b => {
    bidPts.push(`${px(b.price).toFixed(1)},${py(cum).toFixed(1)}`);
    cum += b.shares;
    bidPts.push(`${px(b.price).toFixed(1)},${py(cum).toFixed(1)}`);
  });
  const bidLine = bidPts.length ? `M ${bidPts.join(" L ")}` : "";
  const bidFill = bidPts.length
    ? `${bidLine} L ${px(bidsDesc[bidsDesc.length - 1].price).toFixed(1)},${(PT + cH).toFixed(1)} L ${px(bidsDesc[0].price + 1).toFixed(1)},${(PT + cH).toFixed(1)} Z`
    : "";

  // Build ask stepped points
  const askPts: string[] = [];
  let cumA = 0;
  asksAsc.forEach(a => {
    askPts.push(`${px(a.price).toFixed(1)},${py(cumA).toFixed(1)}`);
    cumA += a.shares;
    askPts.push(`${px(a.price).toFixed(1)},${py(cumA).toFixed(1)}`);
  });
  const askLine = askPts.length ? `M ${askPts.join(" L ")}` : "";
  const askFill = askPts.length
    ? `${askLine} L ${px(asksAsc[asksAsc.length - 1].price).toFixed(1)},${(PT + cH).toFixed(1)} L ${px(asksAsc[0].price - 1).toFixed(1)},${(PT + cH).toFixed(1)} Z`
    : "";

  const yTicks = [0, Math.round(maxVol * 0.5), maxVol];

  return (
    <div style={{ border: `1px solid ${t.cardBorder}`, background: t.card, borderRadius: 12, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: t.text, fontWeight: 600, ...ss, ...pp }}>Market Depth</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.textMut, ...ss }}>
            Spread {spread}¢
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e" }} />
            <span style={{ fontSize: 11, color: t.textMut, ...ss }}>YES Bids</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} />
            <span style={{ fontSize: 11, color: t.textMut, ...ss }}>NO Asks</span>
          </div>
        </div>
      </div>

      {/* SVG depth chart */}
      <div style={{ padding: "12px 12px 4px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="gBid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="gAsk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines + Y labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={py(v)} x2={W - PR} y2={py(v)} stroke={isDark ? "rgba(255,255,255,0.05)" : "#eff0f1"} strokeWidth="1" />
              <text x={PL - 3} y={py(v) + 3} textAnchor="end" fontSize="8" fill={t.textMut}>
                {v >= 1000 ? `${Math.round(v / 1000)}K` : v === 0 ? "0" : v}
              </text>
            </g>
          ))}

          {/* Baseline */}
          <line x1={PL} y1={PT + cH} x2={W - PR} y2={PT + cH} stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e6e8"} strokeWidth="1" />

          {/* Best bid/ask reference verticals */}
          <line x1={px(bestBid)} y1={PT} x2={px(bestBid)} y2={PT + cH} stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.6" />
          <line x1={px(bestAsk)} y1={PT} x2={px(bestAsk)} y2={PT + cH} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.6" />
          <text x={px(bestBid)} y={PT - 3} textAnchor="middle" fontSize="8" fill="#22c55e">{bestBid}¢</text>
          <text x={px(bestAsk)} y={PT - 3} textAnchor="middle" fontSize="8" fill="#ef4444">{bestAsk}¢</text>

          {/* Fill areas */}
          {bidFill && <path d={bidFill} fill="url(#gBid)" />}
          {askFill && <path d={askFill} fill="url(#gAsk)" />}

          {/* Stroke lines */}
          {bidLine && <path d={bidLine} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />}
          {askLine && <path d={askLine} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />}

          {/* X-axis labels */}
          {allPrices.sort((a, b) => a - b).map((p, i) => (
            <text key={i} x={px(p)} y={PT + cH + 14} textAnchor="middle" fontSize="8" fill={t.textMut}>{p}¢</text>
          ))}
        </svg>
      </div>

      {/* YES vs NO balance bar */}
      <div style={{ padding: "4px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, ...ss }}>YES {yesRatio.toFixed(1)}%</span>
          <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600, ...ss }}>NO {(100 - yesRatio).toFixed(1)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${yesRatio}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
          <div style={{ flex: 1, background: "linear-gradient(90deg,#dc2626,#ef4444)" }} />
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 14px" }}>
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.08em", textTransform: "uppercase", ...ss }}>YES · Bids</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{totalBidVol.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: t.textMut, ...ss }}>{market.bids.length} price levels</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 4, ...ss }}>Best bid: <span style={{ color: "#22c55e", fontWeight: 700 }}>{bestBid}¢</span></div>
          <div style={{ marginTop: 6, height: 4, borderRadius: 99, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.06)" : "#dcfce7" }}>
            <div style={{ height: "100%", width: `${(totalBidVol / maxVol) * 100}%`, background: "#22c55e", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: "0.08em", textTransform: "uppercase", ...ss }}>NO · Asks</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{totalAskVol.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: t.textMut, ...ss }}>{market.asks.length} price levels</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 4, ...ss }}>Best ask: <span style={{ color: "#ef4444", fontWeight: 700 }}>{bestAsk}¢</span></div>
          <div style={{ marginTop: 6, height: 4, borderRadius: 99, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.06)" : "#fee2e2" }}>
            <div style={{ height: "100%", width: `${(totalAskVol / maxVol) * 100}%`, background: "#ef4444", borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Per-level bars */}
      <div style={{ borderTop: `1px solid ${t.cardBorder}`, padding: "10px 16px 14px" }}>
        <div style={{ fontSize: 11, color: t.textMut, fontWeight: 500, marginBottom: 8, ...ss }}>Volume by Price Level</div>
        <div style={{ display: "flex", gap: 12 }}>
          {/* YES bids */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", ...ss }}>YES Bids</div>
            {[...market.bids].sort((a, b) => b.price - a.price).slice(0, 6).map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, width: 28, textAlign: "right", color: "#22c55e", fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{b.price}¢</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "#f0fdf4", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: `${b.depth}%`, background: "rgba(34,197,94,0.5)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, width: 32, textAlign: "right", color: t.textMut, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{(b.shares / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
          <div style={{ width: 1, background: t.cardBorder, flexShrink: 0 }} />
          {/* NO asks */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", ...ss }}>NO Asks</div>
            {[...market.asks].sort((a, b) => a.price - b.price).slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, width: 28, color: "#ef4444", fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{a.price}¢</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "#fff1f2", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${a.depth}%`, background: "rgba(239,68,68,0.5)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, width: 32, textAlign: "right", color: t.textMut, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{(a.shares / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}