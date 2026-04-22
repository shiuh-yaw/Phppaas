import { useState, createContext, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import svgPaths from "../../imports/svg-nxg1ngagkw";
import imgUnsplash4Yv84VgQkRm from "figma:asset/8b39eb823efcb26429cdca7453d4b008e7eedd6e.png";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { EmojiIcon } from "../components/two-tone-icons";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { useAuth } from "../components/auth-context";
import {
  getOBMarket,
  OBPriceChart,
  OrderbookTradingPanel,
  MobileOrderSheet,
} from "../components/orderbook-market";
// MarketDepthChart now inlined as InlineMarketDepth to avoid module resolution issues

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== THEME ==================== */
interface T {
  bg: string; bgAlt: string; card: string; cardBorder: string;
  text: string; textSec: string; textMut: string; textFaint: string;
  sectionBorder: string; inputBg: string; inputBorder: string;
  hoverBg: string; iconFill: string; chartGrid: string;
}
const dark: T = {
  bg: "#0a0b0d", bgAlt: "#0d0e11", card: "#111216", cardBorder: "rgba(255,255,255,0.06)",
  text: "#ffffff", textSec: "rgba(255,255,255,0.5)", textMut: "rgba(255,255,255,0.25)", textFaint: "rgba(255,255,255,0.15)",
  sectionBorder: "rgba(255,255,255,0.05)", inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.1)",
  hoverBg: "rgba(255,255,255,0.04)", iconFill: "rgba(255,255,255,0.5)", chartGrid: "#1a1b1f",
};
const light: T = {
  bg: "#ffffff", bgAlt: "#f7f8fa", card: "#ffffff", cardBorder: "#f5f6f7",
  text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
  sectionBorder: "#f5f6f7", inputBg: "#fafafa", inputBorder: "#f5f6f7",
  hoverBg: "rgba(0,0,0,0.03)", iconFill: "#84888c", chartGrid: "#f5f6f7",
};
const ThemeCtx = createContext<{ t: T; isDark: boolean; toggle: () => void }>({ t: light, isDark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

/* ==================== MARKET DATA ==================== */
interface MarketData {
  id: string; title: string; category: string; tier: number; image: string;
  volume: string; endDate: string; creator: string; creatorFire: number;
  outcomes: { name: string; chance: number; color: string; payout: string; image?: string }[];
  chartData: { month: string; [key: string]: number | string }[];
  rules: string; step: number;
  picks?: { outcome: string; bet: string; payout: string; poolShare: string }[];
  comments: { user: string; time: string; text: string; likes: number; liked: boolean }[];
}

const MARKETS: Record<string, MarketData> = {
  "pba-finals": {
    id: "pba-finals", title: "PBA Philippine Cup Finals 2026 — Sino ang Champion?", category: "🏀 Basketball", tier: 1,
    image: "https://images.unsplash.com/photo-1759694415651-06e2fe97295a?w=80&h=80&fit=crop",
    volume: "₱987,781,783", endDate: "Jul 15, 2026", creator: "Coach_Miko", creatorFire: 42,
    outcomes: [
      { name: "Ginebra", chance: 45, color: "#FF5222", payout: "2.2x" },
      { name: "San Miguel", chance: 32, color: "#086DE0", payout: "3.1x" },
      { name: "TNT", chance: 15, color: "#00BF85", payout: "6.7x" },
      { name: "Meralco", chance: 8, color: "#8b5cf6", payout: "12.5x" },
    ],
    chartData: Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      Ginebra: Math.max(20, 45 + Math.floor(Math.random() * 30 - 15)),
      "San Miguel": Math.max(15, 32 + Math.floor(Math.random() * 20 - 10)),
      TNT: Math.max(5, 15 + Math.floor(Math.random() * 10 - 5)),
    })),
    rules: 'Ang market na ito ay mare-resolve bilang "Oo" kung manalo ang napiling team sa PBA Philippine Cup Finals 2026. Ang official result mula sa PBA ang gagamitin. Kung ma-cancel ang season, lahat ng taya ay ire-refund.',
    step: 1,
    picks: [{ outcome: "Ginebra", bet: "₱5,000.00", payout: "₱11,000", poolShare: "0.3" }],
    comments: [
      { user: "JuanBasket", time: "2h ago", text: "Ginebra dominant sa Philippine Cup. 45% chance feels right — pero watch out for SMB kung healthy si June Mar.", likes: 24, liked: true },
      { user: "PBAInsider", time: "5h ago", text: "TNT sleeper pick! Kung bumalik sa form si Pogoy, magiging problema sila for everyone.", likes: 18, liked: false },
      { user: "BetMasterPH", time: "8h ago", text: "Meralco underdog pero solid ang import nila. 12.5x payout is tempting.", likes: 7, liked: false },
      { user: "CoachTips", time: "12h ago", text: "San Miguel always dangerous. Never count them out lalo na pag conference time.", likes: 31, liked: false },
    ],
  },
  "color-game": {
    id: "color-game", title: "Color Game Round #8832 — Anong kulay ang lalabas?", category: "🎲 Color Game", tier: 1,
    image: "https://images.unsplash.com/photo-1666140738158-08c7d6f88531?w=80&h=80&fit=crop",
    volume: "₱48,200", endDate: "0:42", creator: "PeryaMaster", creatorFire: 56,
    outcomes: [
      { name: "Pula", chance: 17, color: "#ef4444", payout: "x6" },
      { name: "Asul", chance: 17, color: "#3b82f6", payout: "x6" },
      { name: "Berde", chance: 17, color: "#22c55e", payout: "x6" },
      { name: "Dilaw", chance: 17, color: "#eab308", payout: "x6" },
      { name: "Puti", chance: 16, color: "#9ca3af", payout: "x6" },
      { name: "Pink", chance: 16, color: "#ec4899", payout: "x6" },
    ],
    chartData: Array.from({ length: 10 }, (_, i) => ({
      month: `R${8822 + i}`,
      Pula: Math.floor(Math.random() * 3),
      Asul: Math.floor(Math.random() * 3),
      Berde: Math.floor(Math.random() * 3),
    })),
    rules: 'Color Game: 3 dice ang i-ro-roll, bawat isa may 6 na kulay. Bet ka sa kulay — kung lumabas ang kulay mo sa 1 die = x1, 2 dice = x2, 3 dice = x3. Payout multiplied by your bet. Settle within 30 seconds.',
    step: 1,
    comments: [
      { user: "PeryaFan", time: "30s ago", text: "3 rounds na walang Pula! Due na ito! 🔴🔴🔴", likes: 5, liked: false },
      { user: "DiceKing", time: "1m ago", text: "Berde streak kanina — 4 out of 5 rounds. Berde pa rin ako!", likes: 3, liked: true },
    ],
  },
  "boxing-donaire": {
    id: "boxing-donaire", title: "Boxing: Donaire vs Inoue III — WBC Welterweight", category: "🥊 Boxing", tier: 2,
    image: "https://images.unsplash.com/photo-1741829186112-ac622fc93481?w=80&h=80&fit=crop",
    volume: "₱540,000", endDate: "Mar 28, 2026", creator: "BoxingPH", creatorFire: 120,
    outcomes: [
      { name: "Donaire (KO/TKO)", chance: 15, color: "#ef4444", payout: "6.7x" },
      { name: "Donaire (Decision)", chance: 20, color: "#f97316", payout: "5.0x" },
      { name: "Inoue (KO/TKO)", chance: 40, color: "#3b82f6", payout: "2.5x" },
      { name: "Inoue (Decision)", chance: 20, color: "#8b5cf6", payout: "5.0x" },
      { name: "Draw", chance: 5, color: "#a3a3a3", payout: "20.0x" },
    ],
    chartData: Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      Donaire: Math.max(10, 35 + Math.floor(Math.random() * 20 - 10)),
      Inoue: Math.max(30, 60 + Math.floor(Math.random() * 15 - 8)),
    })),
    rules: 'Ang market na ito ay mare-resolve based sa official result ng WBC. Kung ma-cancel ang fight, lahat ng taya ay ire-refund. Method of victory markets ay separate settlements.',
    step: 1,
    comments: [
      { user: "PacquiaoFan", time: "4h ago", text: "Donaire may puso pa! Kaya pa niya ito, lalo na sa decision. Pinoy pride! 🇵🇭", likes: 45, liked: true },
      { user: "BoxingAnalyst", time: "6h ago", text: "Realistic tayo — Inoue is P4P #1. Pero Donaire always has a puncher's chance.", likes: 32, liked: false },
    ],
  },
  "mlbb-m6": {
    id: "mlbb-m6", title: "MLBB M6: Mananalo ba ang Blacklist International?", category: "🎮 Esports", tier: 2,
    image: "https://images.unsplash.com/photo-1761395013890-49090392ff0f?w=80&h=80&fit=crop",
    volume: "₱320,000", endDate: "Apr 20, 2026", creator: "EsportsPH", creatorFire: 67,
    outcomes: [
      { name: "Blacklist Intl.", chance: 35, color: "#FF5222", payout: "2.9x" },
      { name: "ONIC PH", chance: 25, color: "#3b82f6", payout: "4.0x" },
      { name: "ECHO", chance: 22, color: "#22c55e", payout: "4.5x" },
      { name: "Iba pa", chance: 18, color: "#8b5cf6", payout: "5.6x" },
    ],
    chartData: Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      Blacklist: Math.max(15, 35 + Math.floor(Math.random() * 20 - 10)),
      ONIC: Math.max(10, 25 + Math.floor(Math.random() * 15 - 8)),
    })),
    rules: 'Market resolves based sa official M6 World Championship results. Kung ma-disqualify ang team, bets on that team ay void at ire-refund.',
    step: 1,
    comments: [
      { user: "MLBBPro", time: "3h ago", text: "Blacklist meta na naman! OhMyV33nus at Wise combo is unstoppable. 🏆", likes: 56, liked: true },
    ],
  },
};

const DEFAULT_ID = "pba-finals";
function getMarket(id: string | undefined): MarketData {
  return MARKETS[id || DEFAULT_ID] || MARKETS[DEFAULT_ID];
}

/* ==================== WALLET CARD ==================== */
function WalletCard({ onDeposit }: { onDeposit: () => void }) {
  const { t, isDark } = useTheme();
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}` }}>
      <div className="p-4" style={{ background: isDark ? "rgba(255,82,34,0.08)" : "linear-gradient(135deg, #fff8f5 0%, #fff4ed 100%)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: isDark ? "rgba(255,82,34,0.2)" : "#ff5222" }}>
              <svg className="size-3.5" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={isDark ? "#ff5222" : "#fff"} strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span className="text-[12px]" style={{ color: t.textSec, fontWeight: 500, ...ss, ...pp }}>My Wallet</span>
          </div>
          <svg className="size-4 cursor-pointer" viewBox="0 0 16 16" fill="none"><path d="M2 8c0-1.5 2.7-5 6-5s6 3.5 6 5-2.7 5-6 5-6-3.5-6-5z" stroke={t.iconFill} strokeWidth="1.5" /><circle cx="8" cy="8" r="2" stroke={t.iconFill} strokeWidth="1.5" /></svg>
        </div>
        <div className="text-[28px] mb-1" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>₱8,200<span className="text-[16px]" style={{ color: t.textMut }}>.00</span></div>
        <div className="flex items-center gap-1.5">
          <svg className="size-3" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 7H2L6 2Z" fill="#00bf85" /></svg>
          <span className="text-[11px]" style={{ color: "#00bf85", fontWeight: 600, ...ss }}>+₱1,240 (17.8%)</span>
          <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>this week</span>
        </div>
      </div>
      <div className="p-3 flex gap-2" style={{ background: t.card }}>
        <button onClick={onDeposit} className="flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-colors" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
          Deposit
        </button>
        <button onClick={onDeposit} className="flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, border: `1px solid ${t.cardBorder}`, ...ss, ...pp }}>
          Withdraw
        </button>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button onClick={toggle} className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} title={isDark ? "Light Mode" : "Dark Mode"}>
      {isDark ? (
        <svg className="size-[16px]" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      ) : (
        <svg className="size-[16px]" viewBox="0 0 24 24" fill="none" stroke="#070808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  );
}

/* --- Trading Panel (Desktop Right Sidebar) --- */
function TradingPanel({ market, onDeposit }: { market: MarketData; onDeposit: () => void }) {
  const { t, isDark } = useTheme();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<"Buy" | "Sell">("Buy");
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [amount, setAmount] = useState("");
  const sel = market.outcomes[selectedOutcome] || market.outcomes[0];
  if (!sel) return null;
  const numAmount = parseFloat(amount) || 0;
  const multiplier = parseFloat(sel.payout.replace("x", "")) || 1;
  const payout = (numAmount * multiplier).toFixed(2);

  return (
    <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-4 p-4 border-l overflow-y-auto" style={{ background: t.card, borderColor: t.cardBorder }}>
      {/* Bet Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Place Bet</span>
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
              color: action === a ? (a === "Buy" ? "#00BF85" : "#ef4444") : t.textMut,
              fontWeight: 600, ...ss, ...pp,
            }}>
              {a}
            </button>
          ))}
        </div>

        {/* Outcome selection */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Outcome</span>
            <svg className="size-3" fill="none" viewBox="0 0 12 12"><path d={svgPaths.p1609ec30} fill={t.iconFill} /></svg>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {market.outcomes.map((o, i) => (
              <button key={i} onClick={() => setSelectedOutcome(i)} className="h-8 px-2.5 rounded-md text-[12px] cursor-pointer transition-all" style={{
                fontWeight: 500, ...ss, ...pp,
                background: selectedOutcome === i ? o.color : (isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7"),
                color: selectedOutcome === i ? "#fff" : t.textSec,
                border: selectedOutcome === i ? `2px solid ${o.color}` : `1px solid ${t.cardBorder}`,
              }}>
                {o.name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <span className="text-[12px] block mb-2" style={{ color: t.textSec, ...ss, ...pp }}>Amount</span>
          <div className="flex items-center h-11 rounded-lg border px-3 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
            <span className="text-[18px]" style={{ color: t.text, fontWeight: 600, ...pp }}>₱</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="flex-1 bg-transparent outline-none text-[18px] w-full" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }} />
          </div>
          <div className="flex gap-1.5 mt-2">
            {["20%", "50%", "75%", "MAX"].map((pct) => (
              <button key={pct} onClick={() => {
                const perc = pct === "MAX" ? 1 : parseInt(pct) / 100;
                setAmount((8200 * perc).toFixed(0));
              }} className="flex-1 h-7 rounded text-[11px] cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, ...ss, ...pp }}>
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Payout & Odds */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Est. Payout</span>
            <span className="text-[22px]" style={{ color: "#00BF85", fontWeight: 700, ...pp }}>₱{numAmount > 0 ? Number(payout).toLocaleString() : "0.00"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Current Odds</span>
            <span className="text-[14px]" style={{ color: "#00BF85", fontWeight: 600, ...pp }}>{sel.payout}</span>
          </div>
        </div>

        {/* CTA */}
        {isLoggedIn ? (
          <button className="text-white h-12 rounded-lg text-[15px] cursor-pointer transition-colors" style={{ background: action === "Buy" ? "#00BF85" : "#ef4444", fontWeight: 600, ...ss, ...pp }}>
            {action} {sel.name}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate("/login")} className="bg-[#ff5222] text-white h-12 rounded-lg text-[15px] cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>
              Mag-sign In para Tumaya
            </button>
            <button onClick={() => navigate("/signup")} className="h-10 rounded-lg text-[13px] cursor-pointer hover:bg-[#f7f8f9] transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid ${t.cardBorder}`, color: t.text, fontWeight: 500, ...ss, ...pp }}>
              Gumawa ng Account
            </button>
          </div>
        )}
        {isLoggedIn && (
          <p className="text-[10px] text-center" style={{ color: t.textMut, ...ss, ...pp }}>
            Sa pag-trade, sumasang-ayon ka sa <span className="underline cursor-pointer" style={{ color: t.textSec }}>Terms of Use</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* --- Mobile Bet Sheet --- */
function MobileBetSheet({ market, onDeposit }: { market: MarketData; onDeposit: () => void }) {
  const { t, isDark } = useTheme();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [amount, setAmount] = useState("");
  const sel = market.outcomes[selectedOutcome] || market.outcomes[0];
  if (!sel) return null;
  const numAmount = parseFloat(amount) || 0;
  const multiplier = parseFloat(sel.payout.replace("x", "")) || 1;
  const payout = (numAmount * multiplier).toFixed(2);

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] truncate" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{sel.name}</span>
              <span className="text-[12px] px-1.5 py-0.5 rounded" style={{ background: `${sel.color}15`, color: sel.color, fontWeight: 600, ...ss }}>{sel.payout}</span>
            </div>
            <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Bal: ₱8,200</span>
          </div>
          {isLoggedIn ? (
            <button onClick={() => setIsOpen(true)} className="h-11 px-6 rounded-xl text-[14px] cursor-pointer" style={{ background: "#00BF85", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
              Tumaya
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="h-11 px-6 rounded-xl text-[14px] cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
              Sign In to Bet
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative rounded-t-2xl max-h-[85vh] overflow-y-auto" style={{ background: t.card }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: t.textFaint }} />
            </div>

            <div className="px-5 pb-6 flex flex-col gap-4">
              {/* Wallet summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EmojiIcon emoji="💰" size={18} />
                  <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Balance: ₱8,200.00</span>
                </div>
                <button onClick={() => { setIsOpen(false); onDeposit(); }} className="text-[12px] px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss }}>
                  + Deposit
                </button>
              </div>

              <div className="h-px" style={{ background: t.cardBorder }} />

              {/* Outcome selection */}
              <div>
                <span className="text-[12px] block mb-2" style={{ color: t.textSec, ...ss, ...pp }}>Pumili ng Outcome</span>
                <div className="flex flex-wrap gap-1.5">
                  {market.outcomes.map((o, i) => (
                    <button key={i} onClick={() => setSelectedOutcome(i)} className="h-9 px-3 rounded-lg text-[13px] cursor-pointer transition-all" style={{
                      fontWeight: 500, ...ss, ...pp,
                      background: selectedOutcome === i ? o.color : (isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7"),
                      color: selectedOutcome === i ? "#fff" : t.textSec,
                      border: selectedOutcome === i ? `2px solid ${o.color}` : `1px solid ${t.cardBorder}`,
                    }}>
                      {o.name} <span style={{ opacity: 0.7 }}>{o.chance}%</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <span className="text-[12px] block mb-2" style={{ color: t.textSec, ...ss, ...pp }}>Halaga ng Taya</span>
                <div className="flex items-center h-12 rounded-xl border px-4 gap-1" style={{ background: t.inputBg, borderColor: t.inputBorder }}>
                  <span className="text-[20px]" style={{ color: t.text, fontWeight: 600, ...pp }}>₱</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="flex-1 bg-transparent outline-none text-[20px] w-full" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }} />
                </div>
                <div className="flex gap-2 mt-2">
                  {["₱100", "₱500", "₱1K", "₱5K", "MAX"].map((label) => (
                    <button key={label} onClick={() => {
                      const vals: Record<string, number> = { "₱100": 100, "₱500": 500, "₱1K": 1000, "₱5K": 5000, MAX: 8200 };
                      setAmount(String(vals[label] || 0));
                    }} className="flex-1 h-8 rounded-lg text-[12px] cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, ...ss, ...pp }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout summary */}
              <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: isDark ? "rgba(0,191,133,0.08)" : "#e6fff3" }}>
                <div>
                  <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>Est. Payout</span>
                  <span className="text-[24px]" style={{ color: "#00BF85", fontWeight: 700, ...ss, ...pp }}>₱{numAmount > 0 ? Number(payout).toLocaleString() : "0.00"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>Odds</span>
                  <span className="text-[18px]" style={{ color: "#00BF85", fontWeight: 600, ...ss, ...pp }}>{sel.payout}</span>
                </div>
              </div>

              {/* CTA */}
              <button className="h-13 rounded-xl text-[16px] cursor-pointer transition-colors" style={{ background: "#00BF85", color: "#fff", fontWeight: 600, height: 52, ...ss, ...pp }}>
                I-Finalize ang Taya
              </button>
              <p className="text-[10px] text-center" style={{ color: t.textMut, ...ss, ...pp }}>
                Sa pag-trade, sumasang-ayon ka sa <span className="underline cursor-pointer" style={{ color: t.textSec }}>Terms of Use</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* --- Main Content --- */
function MainContent({ market }: { market: MarketData }) {
  const { t, isDark } = useTheme();
  const [timeTab, setTimeTab] = useState("All");
  const [commentTab, setCommentTab] = useState("Comments");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [picksOpen, setPicksOpen] = useState(true);
  const timeTabs = ["1H", "6H", "1D", "1W", "1M", "All"];
  const commentTabs = ["Comments", "Top Holders", "Activity", "Related"];

  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 min-w-0 pb-24 lg:pb-6" style={{ background: t.bg }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/markets")} className="flex items-center gap-1.5 text-[12px] cursor-pointer hover:opacity-80 transition-opacity" style={{ color: t.textSec, ...ss, ...pp }}>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Mga Market
        </button>
        <span style={{ color: t.textMut }}>›</span>
        <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Parimutuel</span>
        <span style={{ color: t.textMut }}>›</span>
        <span className="text-[11px] truncate max-w-[200px]" style={{ color: t.text, ...ss }}>{market.title.slice(0, 40)}...</span>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-[#ff5222] text-white text-[9px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, ...ss }}>🎯 PARIMUTUEL</span>
        <span className="text-[9px] px-2.5 py-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f5f6f7", color: t.textSec, fontWeight: 600, ...ss }}>
          {market.category}
        </span>
        <span className="flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 700, ...ss }}>
          <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }} /> LIVE
        </span>
        <span className="text-[10px] ml-auto hidden sm:flex items-center gap-1" style={{ color: t.textMut, ...ss }}>
          Creator: <span style={{ color: t.text, fontWeight: 600 }}>{market.creator}</span>
          <svg className="size-3" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p3e687800} fill="#FF5222" /></svg>{market.creatorFire}
        </span>
      </div>

      {/* Title + Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <ImageWithFallback src={market.image} alt="" className="size-12 sm:size-[60px] rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[18px] sm:text-[22px] leading-[1.3]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>{market.title}</h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p27f24a00} fill={t.iconFill} /></svg>
                <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{market.volume}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p33c0c00} fill={t.iconFill} /></svg>
                <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{market.endDate}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Matatapos sa</span>
          <div className="flex gap-1">
            {(market.endDate === "LIVE" ? ["LIVE"] : ["2D", "10H", "8M", "45S"]).map((u) => (
              <span key={u} className="text-[12px] sm:text-[14px] px-2 py-1 rounded" style={{ background: u === "LIVE" ? "#ff5222" : (isDark ? "rgba(255,255,255,0.06)" : "#fafafa"), color: u === "LIVE" ? "#fff" : t.text, fontWeight: 500, ...ss, ...pp }}>{u}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="rounded-xl sm:rounded-2xl border p-3 sm:p-5 flex flex-col gap-3 sm:gap-4" style={{ background: t.card, borderColor: t.cardBorder }}>
        {/* Header: Legend + Actions (fav/share top-right) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {market.outcomes.slice(0, 3).map((o) => (
              <div key={o.name} className="flex items-center gap-1">
                <div className="size-2 rounded-full" style={{ background: o.color }} />
                <span className="text-[11px] sm:text-[12px]" style={{ color: t.text, ...ss, ...pp }}>{o.name} {o.chance}%</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }} title="Favorite">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }} title="Share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] sm:h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={market.chartData}>
              <CartesianGrid key="grid" stroke={t.chartGrid} strokeDasharray="0" vertical={false} />
              <XAxis key="xaxis" dataKey="month" tick={{ fill: t.textMut, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fill: t.textMut, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip key="tooltip" contentStyle={{ background: isDark ? "#1a1b1f" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
              {market.outcomes.slice(0, 3).map((o) => (
                <Line key={`line-${o.name}`} type="monotone" dataKey={o.name} stroke={o.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time tabs (bottom right) */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1">
            {timeTabs.map((tab) => (
              <button key={tab} onClick={() => setTimeTab(tab)} className="h-7 px-2.5 rounded text-[11px] sm:text-[12px] cursor-pointer transition-colors" style={{
                background: timeTab === tab ? (isDark ? "rgba(255,255,255,0.08)" : "#f2f3f4") : "transparent",
                color: timeTab === tab ? t.text : t.textMut,
                fontWeight: timeTab === tab ? 600 : 400,
                ...ss, ...pp
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome Ranking */}
        <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 border-t" style={{ borderColor: t.cardBorder }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Outcome ranking</span>
            <div className="flex items-center gap-8 sm:gap-16">
              <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>% Chance</span>
              <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Payout</span>
            </div>
          </div>
          {market.outcomes.map((o) => (
            <div key={o.name} className="flex items-center gap-2 sm:gap-3">
              <div className="size-10 sm:size-12 rounded-md flex items-center justify-center shrink-0" style={{ background: `${o.color}15` }}>
                <EmojiIcon emoji={market.category.split(" ")[0]} size={18} />
              </div>
              <span className="text-[13px] sm:text-[14px] flex-1 min-w-0 truncate" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{o.name}</span>
              <span className="text-[18px] sm:text-[24px] w-16 sm:w-20 text-right" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{o.chance}%</span>
              <button className="h-8 sm:h-9 w-16 sm:w-20 rounded-md text-[13px] sm:text-[14px] cursor-pointer transition-colors shrink-0" style={{
                background: `${o.color}15`, color: o.color, fontWeight: 500, ...ss, ...pp,
              }}>
                {o.payout}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Market Process */}
      <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-6 flex flex-col gap-4 sm:gap-6" style={{ background: t.card, borderColor: t.cardBorder }}>
        <span className="text-[16px] sm:text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Market Process</span>
        <div className="flex items-start sm:items-center justify-between relative overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Market Open", "Market Closed", "Hinihintay Result", "Settled"].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-[80px] sm:w-[127px] shrink-0 z-10">
              <div className="size-8 sm:size-9 rounded-full flex items-center justify-center text-[14px] sm:text-[16px]" style={{
                background: i < market.step + 1 ? "#ff5222" : (isDark ? "rgba(255,255,255,0.06)" : "#f2f3f4"),
                color: i < market.step + 1 ? "#fff" : t.textMut,
                fontWeight: 600, ...pp,
              }}>
                {i + 1}
              </div>
              <span className="text-[11px] sm:text-[14px] text-center leading-tight" style={{ color: t.text, ...ss, ...pp }}>{label}</span>
            </div>
          ))}
          <div className="absolute top-[16px] sm:top-[18px] left-[50px] sm:left-[90px] right-[50px] sm:right-[90px] flex gap-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-0 border-t-2 border-dashed" style={{ borderColor: i < market.step ? "#ff5222" : t.textFaint }} />
            ))}
          </div>
        </div>
      </div>

      {/* My Picks */}
      {market.picks && (
        <div className="rounded-xl sm:rounded-2xl border overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
          <button onClick={() => setPicksOpen(!picksOpen)} className="flex items-center justify-between w-full p-4 sm:p-6 cursor-pointer">
            <span className="text-[16px] sm:text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Mga Taya Ko / My Slips</span>
            <svg className={`size-4 transition-transform ${picksOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 7"><path d={svgPaths.p12bd8c80} fill={isDark ? "rgba(255,255,255,0.5)" : "#070808"} /></svg>
          </button>
          {picksOpen && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col gap-3">
              {/* Desktop header */}
              <div className="hidden sm:flex items-center justify-between text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>
                <span className="flex-1">Outcome</span>
                <span className="flex-1">Taya Ko</span>
                <span className="flex-1">Est. Payout</span>
                <span className="flex-1">% Pool</span>
                <span className="w-[60px] text-right">Share</span>
              </div>
              {market.picks.map((p, i) => (
                <div key={i}>
                  {/* Desktop row */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-[14px] px-3 py-1 rounded-md" style={{ background: "#fff4ed", color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>{p.outcome}</span>
                    </div>
                    <span className="flex-1 text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{p.bet}</span>
                    <span className="flex-1 text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{p.payout}</span>
                    <span className="flex-1 text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{p.poolShare}</span>
                    <div className="w-[60px] flex justify-end">
                      <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 18 15"><path d={svgPaths.p16c8be90} fill={isDark ? "#fff" : "#070808"} /></svg>
                    </div>
                  </div>
                  {/* Mobile card */}
                  <div className="sm:hidden rounded-lg p-3" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] px-2.5 py-0.5 rounded-md" style={{ background: "#fff4ed", color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>{p.outcome}</span>
                      <svg className="size-4 cursor-pointer" fill="none" viewBox="0 0 18 15"><path d={svgPaths.p16c8be90} fill={isDark ? "#fff" : "#070808"} /></svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>Taya</span>
                        <span className="text-[13px]" style={{ color: t.text, fontWeight: 500, ...ss }}>{p.bet}</span>
                      </div>
                      <div>
                        <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>Payout</span>
                        <span className="text-[13px]" style={{ color: "#00bf85", fontWeight: 600, ...ss }}>{p.payout}</span>
                      </div>
                      <div>
                        <span className="text-[10px] block" style={{ color: t.textMut, ...ss }}>Pool</span>
                        <span className="text-[13px]" style={{ color: t.text, fontWeight: 500, ...ss }}>{p.poolShare}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-6 flex flex-col gap-3 sm:gap-4" style={{ background: t.card, borderColor: t.cardBorder }}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setRulesOpen(!rulesOpen)}>
          <span className="text-[16px] sm:text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Resolution Rules</span>
          <svg className={`size-4 transition-transform ${rulesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 7"><path d={svgPaths.p12bd8c80} fill={isDark ? "rgba(255,255,255,0.5)" : "#070808"} /></svg>
        </div>
        {rulesOpen && (
          <p className="text-[13px] sm:text-[14px] leading-[1.6]" style={{ color: t.textSec, ...ss, ...pp }}>{market.rules}</p>
        )}
      </div>

      {/* Comments */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-5 h-10 border-b overflow-x-auto" style={{ borderColor: t.cardBorder, scrollbarWidth: "none" }}>
          {commentTabs.map((tab) => (
            <button key={tab} onClick={() => setCommentTab(tab)} className="relative h-full text-[13px] sm:text-[14px] cursor-pointer transition-colors whitespace-nowrap shrink-0" style={{ color: commentTab === tab ? t.text : t.textSec, fontWeight: 500, ...ss, ...pp }}>
              {tab === "Comments" ? `Comments (${market.comments.length})` : tab}
              {commentTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-sm bg-[#090a0d]" style={{ background: isDark ? "#fff" : "#090a0d" }} />}
            </button>
          ))}
        </div>

        {/* Comments tab content */}
        {commentTab === "Comments" && (<>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 h-11 sm:h-12 rounded-lg flex items-center px-3 sm:px-4" style={{ background: t.inputBg }}>
              <span className="flex-1 text-[13px] sm:text-[14px]" style={{ color: t.textMut, ...ss, ...pp }}>Mag-komento...</span>
              <span className="text-[13px] sm:text-[14px] cursor-pointer" style={{ color: "#ff5222", ...ss, ...pp }}>Post</span>
            </div>
            <div className="hidden sm:flex flex-1 h-12 rounded-lg items-center justify-center gap-2 px-4" style={{ background: isDark ? "rgba(0,191,133,0.1)" : "#e6fff3" }}>
              <svg className="size-5" fill="none" viewBox="0 0 24 24"><path d={svgPaths.p9a17a00} fill={isDark ? "#fff" : "#000"} /></svg>
              <span className="text-[13px]" style={{ color: t.text, ...ss, ...pp }}>Mag-ingat sa external links — baka phishing attacks</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md w-fit" style={{ background: t.inputBg }}>
            <span className="text-[13px] sm:text-[14px]" style={{ color: t.textSec, ...ss, ...pp }}>Pinakabago</span>
            <svg className="size-3.5" fill="none" viewBox="0 0 10 6"><path d={svgPaths.p27f99a80} fill={isDark ? "#fff" : "#070808"} /></svg>
          </div>
          {market.comments.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="size-7 sm:size-8 rounded-full overflow-hidden shrink-0">
                <img src={imgUnsplash4Yv84VgQkRm} alt="" className="size-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] sm:text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{c.user}</span>
                  <span className="text-[12px] sm:text-[14px]" style={{ color: t.textMut, ...ss, ...pp }}>{c.time}</span>
                </div>
                <p className="text-[13px] sm:text-[14px] leading-[1.5]" style={{ color: t.text, ...ss, ...pp }}>{c.text}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="size-4 sm:size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.pebbdf00} fill={c.liked ? "#FF5222" : t.iconFill} /></svg>
                  <span className="text-[12px] sm:text-[14px]" style={{ color: c.liked ? "#FF5222" : t.textMut, ...ss, ...pp }}>{c.likes}</span>
                </div>
              </div>
              <svg className="size-4 sm:size-5 cursor-pointer shrink-0 mt-1" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p1ed70700} fill={t.iconFill} /></svg>
            </div>
          ))}
        </>)}

        {/* Top Holders tab content */}
        {commentTab === "Top Holders" && (
          <div className="rounded-xl sm:rounded-2xl border overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="hidden sm:flex items-center px-4 py-2.5 border-b" style={{ borderColor: t.cardBorder }}>
              <span className="w-8 text-[10px]" style={{ color: t.textMut, ...ss }}>#</span>
              <span className="flex-1 text-[10px]" style={{ color: t.textMut, ...ss }}>Trader</span>
              <span className="w-28 text-[10px]" style={{ color: t.textMut, ...ss }}>Outcome</span>
              <span className="w-24 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Stake</span>
              <span className="w-24 text-right text-[10px]" style={{ color: t.textMut, ...ss }}>Payout</span>
            </div>
            {[
              { rank: 1, name: "Coach_Miko", outcomeIdx: 0, stake: 125000, payout: 275000 },
              { rank: 2, name: "JuanBasket", outcomeIdx: 0, stake: 80500, payout: 177100 },
              { rank: 3, name: "PBAInsider", outcomeIdx: 1, stake: 62000, payout: 192200 },
              { rank: 4, name: "BetMasterPH", outcomeIdx: 2, stake: 45300, payout: 303510 },
              { rank: 5, name: "CoachTips", outcomeIdx: 1, stake: 38750, payout: 120125 },
              { rank: 6, name: "HoopsFanPH", outcomeIdx: 0, stake: 32100, payout: 70620 },
              { rank: 7, name: "RingMasterMNL", outcomeIdx: 3, stake: 21000, payout: 262500 },
              { rank: 8, name: "ManilaBallers", outcomeIdx: 2, stake: 18200, payout: 121940 },
            ].map(h => {
              const o = market.outcomes[h.outcomeIdx] || market.outcomes[0];
              return (
                <div key={h.rank} className="flex items-center px-4 h-12 border-b last:border-b-0 hover:bg-black/[0.02] transition-colors" style={{ borderColor: t.cardBorder }}>
                  <span className="w-8 text-[12px]" style={{ color: h.rank <= 3 ? "#ff5222" : t.textMut, fontWeight: h.rank <= 3 ? 700 : 400, ...ss }}>{h.rank}</span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: t.textSec, fontSize: 11, fontWeight: 600, ...pp }}>{h.name[0]}</div>
                    <span className="text-[12px] sm:text-[13px] truncate" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{h.name}</span>
                  </div>
                  <span className="hidden sm:block w-28">
                    <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: `${o.color}15`, color: o.color, fontWeight: 600, ...ss }}>{o.name}</span>
                  </span>
                  <span className="hidden sm:block w-24 text-right text-[12px]" style={{ color: t.textSec, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{h.stake.toLocaleString()}</span>
                  <span className="w-24 text-right text-[12px]" style={{ color: "#00bf85", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{h.payout.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity tab content */}
        {commentTab === "Activity" && (
          <div className="rounded-xl sm:rounded-2xl border overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
            {[
              { time: "2m ago", user: "Coach_Miko", action: "Placed", outcomeIdx: 0, amount: "₱5,000" },
              { time: "7m ago", user: "JuanBasket", action: "Increased", outcomeIdx: 0, amount: "₱2,500" },
              { time: "14m ago", user: "PBAInsider", action: "Placed", outcomeIdx: 1, amount: "₱3,200" },
              { time: "22m ago", user: "BetMasterPH", action: "Placed", outcomeIdx: 2, amount: "₱1,800" },
              { time: "35m ago", user: "CoachTips", action: "Cashed Out", outcomeIdx: 1, amount: "₱6,400" },
              { time: "48m ago", user: "HoopsFanPH", action: "Placed", outcomeIdx: 0, amount: "₱900" },
              { time: "1h ago", user: "RingMasterMNL", action: "Placed", outcomeIdx: 3, amount: "₱4,500" },
              { time: "1.5h ago", user: "ManilaBallers", action: "Placed", outcomeIdx: 2, amount: "₱2,100" },
            ].map((a, i) => {
              const o = market.outcomes[a.outcomeIdx] || market.outcomes[0];
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: t.cardBorder }}>
                  <div className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: t.textSec, fontSize: 12, fontWeight: 600, ...pp }}>{a.user[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] truncate" style={{ color: t.text, ...pp }}>
                      <span style={{ fontWeight: 600 }}>{a.user}</span>
                      <span style={{ color: t.textSec }}> {a.action.toLowerCase()} </span>
                      <span style={{ fontWeight: 600 }}>{a.amount}</span>
                      <span style={{ color: t.textSec }}> on </span>
                      <span style={{ color: o.color, fontWeight: 600 }}>{o.name}</span>
                    </div>
                    <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>{a.time}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded shrink-0" style={{ background: a.action === "Cashed Out" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", color: a.action === "Cashed Out" ? "#ef4444" : "#22c55e", fontWeight: 700, ...ss }}>
                    {a.action === "Cashed Out" ? "OUT" : "IN"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Related tab content */}
        {commentTab === "Related" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "PBA MVP 2026 — Sino ang kukuha?", cat: "🏀 Basketball", vol: "₱412,000", chance: 38, trend: "+2.4%" },
              { title: "Gilas Pilipinas Asia Cup Finish", cat: "🏀 Basketball", vol: "₱221,500", chance: 62, trend: "-1.1%" },
              { title: "PBA Rookie of the Year 2026", cat: "🏀 Basketball", vol: "₱180,900", chance: 24, trend: "+5.8%" },
              { title: "Philippine Cup Finals MVP", cat: "🏀 Basketball", vol: "₱96,300", chance: 45, trend: "+0.3%" },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors hover:bg-black/[0.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] sm:text-[14px] leading-[1.4]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{r.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded shrink-0" style={{ background: isDark ? "rgba(255,82,34,0.15)" : "#fff4ed", color: "#ff5222", fontWeight: 600, ...ss }}>{r.cat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>Chance</span>
                    <span className="text-[18px]" style={{ color: t.text, fontWeight: 700, fontVariantNumeric: "tabular-nums", ...pp }}>{r.chance}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>Volume</span>
                    <span className="text-[12px]" style={{ color: t.textSec, fontWeight: 500, ...ss }}>{r.vol}</span>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded" style={{ background: r.trend.startsWith("+") ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: r.trend.startsWith("+") ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>{r.trend}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="hidden sm:flex flex-col items-center gap-1 pt-8 pb-4">
        <span className="text-[11px]" style={{ color: t.textFaint, ...ss, ...pp }}>PrediEx Inc. &copy; 2026</span>
        <div className="flex gap-2 text-[11px]" style={{ color: t.textFaint, ...ss, ...pp }}>
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span>&middot;</span>
          <span className="cursor-pointer hover:underline">Terms of Service</span>
          <span>&middot;</span>
          <span>v1.2.0</span>
        </div>
      </div>
    </div>
  );
}

/* InlineMarketDepth removed — now fully inlined in OrderbookMarketPage */

/* ==================== ORDERBOOK MARKET PAGE ==================== */
function OrderbookMarketPage({ id, isDark, t, openDeposit }: { id: string; isDark: boolean; t: T; openDeposit: () => void }) {
  const navigate = useNavigate();
  const obMarket = getOBMarket(id);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [commentTab, setCommentTab] = useState("Recent Trades");
  const commentTabs = ["Recent Trades", "Comments", "Top Holders", "Activity", "Related"];

  if (!obMarket) return null;

  const obT = {
    bg: t.bg, bgAlt: t.bgAlt, card: t.card, cardBorder: t.cardBorder,
    text: t.text, textSec: t.textSec, textMut: t.textMut, textFaint: t.textFaint,
    inputBg: t.inputBg, inputBorder: t.inputBorder, chartGrid: t.chartGrid,
  };

  const tAsks = obMarket.asks.slice(0, 7).reverse();
  const tBids = obMarket.bids.slice(0, 7);

  const [sellPos, setSellPos] = useState<{ side: "YES" | "NO"; shares: number; avgPrice: number } | null>(null);
  const [sellDone, setSellDone] = useState(false);
  const sellPrice = sellPos ? (sellPos.side === "YES" ? obMarket.yesPrice : obMarket.noPrice) : 0;
  const sellProceeds = sellPos ? (sellPos.shares * sellPrice / 100) : 0;
  const sellPnl = sellPos ? ((sellPrice - sellPos.avgPrice) * sellPos.shares / 100) : 0;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 96px", background: t.bg, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "100%" }}>
        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/markets")} className="flex items-center gap-1.5 text-[12px] cursor-pointer hover:opacity-80 transition-opacity" style={{ color: t.textSec, ...ss, ...pp }}>
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Mga Market
          </button>
          <span style={{ color: t.textMut }}>›</span>
          <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Orderbook</span>
          <span style={{ color: t.textMut }}>›</span>
          <span className="text-[11px] truncate max-w-[200px]" style={{ color: t.text, ...ss }}>{obMarket.title.slice(0, 40)}...</span>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#ff5222] text-white text-[9px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, ...ss }}>📊 ORDERBOOK</span>
          <span className="text-[9px] px-2.5 py-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f5f6f7", color: t.textSec, fontWeight: 600, ...ss }}>
            {obMarket.categoryEmoji} {obMarket.category}
          </span>
          <span className="flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 700, ...ss }}>
            <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }} /> LIVE TRADING
          </span>
          <span className="text-[10px] ml-auto hidden sm:flex items-center gap-1" style={{ color: t.textMut, ...ss }}>
            Creator: <span style={{ color: t.text, fontWeight: 600 }}>{obMarket.creator}</span> 🔥{obMarket.creatorFire}
          </span>
        </div>

        {/* Title + Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-12 sm:size-[60px] rounded-lg flex items-center justify-center shrink-0 text-[28px]" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }}>
              {obMarket.categoryEmoji}
            </div>
            <div className="min-w-0">
              <h1 className="text-[18px] sm:text-[22px] leading-[1.3]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>
                {obMarket.title}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke={t.iconFill} strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 3v4l2 2"/></svg>
                  <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{obMarket.volume24h}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke={t.iconFill} strokeWidth="1.5"><rect x="2" y="3" width="10" height="9" rx="1"/><path d="M5 1v4M9 1v4M2 6h10"/></svg>
                  <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{obMarket.endDate}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <span className="text-[11px] sm:text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Resolves in</span>
            <div className="flex gap-1">
              {["2D", "10H", "8M", "45S"].map(u => (
                <span key={u} className="text-[12px] sm:text-[14px] px-2 py-1 rounded" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fafafa", color: t.text, fontWeight: 500, ...ss, ...pp }}>{u}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <OBPriceChart market={obMarket} isDark={isDark} t={obT} />

        {/* ========== ORDER BOOK ========== */}
        <div style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
            <span style={{ fontSize: 13, color: t.text, fontWeight: 600, ...pp }}>Order Book</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(239,68,68,0.5)" }} /><span style={{ fontSize: 11, color: t.textMut }}>Asks</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(34,197,94,0.5)" }} /><span style={{ fontSize: 11, color: t.textMut }}>Bids</span></div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "6px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
            <span style={{ flex: 1, fontSize: 10, color: t.textMut }}>Price (¢)</span>
            <span style={{ width: 96, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Shares</span>
            <span className="hidden sm:inline" style={{ width: 96, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Total (¢)</span>
          </div>
          <div>
            {tAsks.map(ask => (
              <div key={`ta${ask.price}`} style={{ position: "relative" as const, display: "flex", alignItems: "center", padding: "0 16px", height: 36 }}>
                <div style={{ position: "absolute" as const, top: 0, bottom: 0, right: 0, width: `${ask.depth}%`, background: "rgba(239,68,68,0.08)" }} />
                <span style={{ flex: 1, fontSize: 13, color: "#ef4444", fontWeight: 600, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1, ...pp }}>{ask.price}¢</span>
                <span style={{ width: 96, textAlign: "right" as const, fontSize: 12, color: t.textSec, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1 }}>{ask.shares.toLocaleString()}</span>
                <span className="hidden sm:inline" style={{ width: 96, textAlign: "right" as const, fontSize: 11, color: t.textMut, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1 }}>{(ask.price * ask.shares / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ padding: "8px 16px", borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}`, background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div><span style={{ display: "block", fontSize: 10, color: t.textMut }}>YES Price</span><span className="text-[16px] sm:text-[18px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...pp }}>{obMarket.yesPrice}¢</span></div>
              <div style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, background: isDark ? "rgba(255,255,255,0.04)" : "#f5f6f7", color: t.textMut }}>Spread: {obMarket.spread}¢</div>
              <div><span style={{ display: "block", fontSize: 10, color: t.textMut }}>NO Price</span><span className="text-[16px] sm:text-[18px]" style={{ color: "#ef4444", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...pp }}>{obMarket.noPrice}¢</span></div>
            </div>
            <div style={{ textAlign: "right" as const }}><span style={{ display: "block", fontSize: 10, color: t.textMut }}>24h Change</span><span style={{ fontSize: 14, color: obMarket.priceChange24h >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, ...pp }}>{obMarket.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(obMarket.priceChange24h)}%</span></div>
          </div>
          <div>
            {tBids.map(bid => (
              <div key={`tb${bid.price}`} style={{ position: "relative" as const, display: "flex", alignItems: "center", padding: "0 16px", height: 36 }}>
                <div style={{ position: "absolute" as const, top: 0, bottom: 0, left: 0, width: `${bid.depth}%`, background: "rgba(34,197,94,0.08)" }} />
                <span style={{ flex: 1, fontSize: 13, color: "#22c55e", fontWeight: 600, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1, ...pp }}>{bid.price}¢</span>
                <span style={{ width: 96, textAlign: "right" as const, fontSize: 12, color: t.textSec, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1 }}>{bid.shares.toLocaleString()}</span>
                <span className="hidden sm:inline" style={{ width: 96, textAlign: "right" as const, fontSize: 11, color: t.textMut, fontVariantNumeric: "tabular-nums", position: "relative" as const, zIndex: 1 }}>{(bid.price * bid.shares / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Positions */}
        {obMarket.myPositions && obMarket.myPositions.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 flex flex-col gap-3" style={{ background: t.card, borderColor: t.cardBorder }}>
            <span className="text-[15px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>My Positions</span>
            {obMarket.myPositions.map((pos, i) => {
              const currentPrice = pos.side === "YES" ? obMarket.yesPrice : obMarket.noPrice;
              return (
                <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[12px] px-2.5 py-1 rounded-lg shrink-0" style={{ background: pos.side === "YES" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: pos.side === "YES" ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>
                      {pos.side}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] block" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{pos.shares.toLocaleString()} shares</span>
                      <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Avg {pos.avgPrice}¢ · Now {currentPrice}¢</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[14px] block" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>₱{pos.currentValue.toLocaleString()}</span>
                      <span className="text-[12px]" style={{ color: pos.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, ...ss }}>
                        {pos.pnl >= 0 ? "+" : ""}₱{pos.pnl.toLocaleString()} P&L
                      </span>
                    </div>
                    <button onClick={() => setSellPos({ side: pos.side, shares: pos.shares, avgPrice: pos.avgPrice })} className="h-9 px-4 rounded-lg text-[12px] cursor-pointer transition-opacity hover:opacity-90" style={{ background: "#ef4444", color: "#fff", fontWeight: 700, ...ss, ...pp }} title={`Sell ${pos.shares.toLocaleString()} shares at ${currentPrice}¢`}>
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Market Process */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-6 flex flex-col gap-4 sm:gap-6" style={{ background: t.card, borderColor: t.cardBorder }}>
          <span className="text-[16px] sm:text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Market Process</span>
          <div className="flex items-start sm:items-center justify-between relative overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {["Market Open", "Live Trading", "Awaiting Result", "Settled"].map((label, i) => {
              const step = 1;
              return (
                <div key={i} className="flex flex-col items-center gap-2 w-[80px] sm:w-[127px] shrink-0 z-10">
                  <div className="size-8 sm:size-9 rounded-full flex items-center justify-center text-[14px] sm:text-[16px]" style={{
                    background: i < step + 1 ? "#ff5222" : (isDark ? "rgba(255,255,255,0.06)" : "#f2f3f4"),
                    color: i < step + 1 ? "#fff" : t.textMut,
                    fontWeight: 600, ...pp,
                  }}>
                    {i + 1}
                  </div>
                  <span className="text-[11px] sm:text-[14px] text-center leading-tight" style={{ color: t.text, ...ss, ...pp }}>{label}</span>
                </div>
              );
            })}
            <div className="absolute top-[16px] sm:top-[18px] left-[50px] sm:left-[90px] right-[50px] sm:right-[90px] flex gap-0">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex-1 h-0 border-t-2 border-dashed" style={{ borderColor: i < 1 ? "#ff5222" : t.textFaint }} />
              ))}
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-6 flex flex-col gap-3 sm:gap-4" style={{ background: t.card, borderColor: t.cardBorder }}>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setRulesOpen(!rulesOpen)}>
            <span className="text-[16px] sm:text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Resolution Rules</span>
            <svg className={`size-4 transition-transform ${rulesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 7"><path d={svgPaths.p12bd8c80} fill={isDark ? "rgba(255,255,255,0.5)" : "#070808"} /></svg>
          </div>
          {rulesOpen && (
            <p className="text-[13px] sm:text-[14px] leading-[1.6]" style={{ color: t.textSec, ...ss, ...pp }}>{obMarket.rules}</p>
          )}
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-5 h-10 border-b overflow-x-auto" style={{ borderColor: t.cardBorder, scrollbarWidth: "none" }}>
            {commentTabs.map(tab => (
              <button key={tab} onClick={() => setCommentTab(tab)} className="relative h-full text-[13px] sm:text-[14px] cursor-pointer transition-colors whitespace-nowrap shrink-0" style={{ color: commentTab === tab ? t.text : t.textSec, fontWeight: 500, ...ss, ...pp }}>
                {tab === "Comments" ? `Comments (${obMarket.comments.length})` : tab === "Recent Trades" ? `Recent Trades (${obMarket.recentTrades.length})` : tab}
                {commentTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-sm" style={{ background: isDark ? "#fff" : "#090a0d" }} />}
              </button>
            ))}
          </div>

          {/* Recent Trades tab content */}
          {commentTab === "Recent Trades" && (
            <div style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card }}>
              <div style={{ display: "flex", alignItems: "center", padding: "6px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
                <span style={{ flex: 1, fontSize: 10, color: t.textMut }}>Time</span>
                <span style={{ width: 64, textAlign: "center" as const, fontSize: 10, color: t.textMut }}>Side</span>
                <span style={{ width: 64, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Price</span>
                <span style={{ width: 80, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Shares</span>
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" as const }}>
                {obMarket.recentTrades.map(trade => (
                  <div key={`tr${trade.id}`} style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 36, borderBottom: `1px solid ${t.cardBorder}` }}>
                    <span style={{ flex: 1, fontSize: 11, color: t.textMut, fontVariantNumeric: "tabular-nums" }}>{trade.time}</span>
                    <span style={{ width: 64, textAlign: "center" as const }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: trade.side === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: trade.side === "BUY" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{trade.side}</span></span>
                    <span style={{ width: 64, textAlign: "right" as const, fontSize: 12, color: trade.side === "BUY" ? "#22c55e" : "#ef4444", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{trade.price}¢</span>
                    <span style={{ width: 80, textAlign: "right" as const, fontSize: 12, color: t.textSec, fontVariantNumeric: "tabular-nums" }}>{trade.shares.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments tab content */}
          {commentTab === "Comments" && (<>
            <div className="flex-1 h-11 rounded-lg flex items-center px-4" style={{ background: t.inputBg }}>
              <span className="flex-1 text-[13px]" style={{ color: t.textMut, ...ss, ...pp }}>Share your analysis...</span>
              <span className="text-[13px] cursor-pointer" style={{ color: "#ff5222", ...ss, ...pp }}>Post</span>
            </div>
            {obMarket.comments.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="size-8 rounded-full overflow-hidden shrink-0">
                  <img src={imgUnsplash4Yv84VgQkRm} alt="" className="size-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{c.user}</span>
                    <span className="text-[12px]" style={{ color: t.textMut, ...ss, ...pp }}>{c.time}</span>
                  </div>
                  <p className="text-[13px] leading-[1.5]" style={{ color: t.text, ...ss, ...pp }}>{c.text}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg className="size-4 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.pebbdf00} fill={c.liked ? "#FF5222" : t.iconFill} /></svg>
                    <span className="text-[12px]" style={{ color: c.liked ? "#FF5222" : t.textMut, ...ss, ...pp }}>{c.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </>)}

          {/* Top Holders tab content */}
          {commentTab === "Top Holders" && (
            <div style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card, overflow: "hidden" }}>
              <div className="hidden sm:flex" style={{ alignItems: "center", padding: "6px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
                <span style={{ width: 32, fontSize: 10, color: t.textMut }}>#</span>
                <span style={{ flex: 1, fontSize: 10, color: t.textMut }}>Trader</span>
                <span style={{ width: 60, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Side</span>
                <span style={{ width: 80, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Shares</span>
                <span style={{ width: 80, textAlign: "right" as const, fontSize: 10, color: t.textMut }}>Value</span>
              </div>
              {[
                { rank: 1, name: "CryptoWhale_PH", side: "YES" as const, shares: 45200, value: 28024 },
                { rank: 2, name: "TradingDeskMNL", side: "YES" as const, shares: 32100, value: 19902 },
                { rank: 3, name: "GlobalMacro99", side: "NO" as const, shares: 28500, value: 10830 },
                { rank: 4, name: "PH_BlockchainPro", side: "YES" as const, shares: 22000, value: 13640 },
                { rank: 5, name: "BTCMaxiManila", side: "YES" as const, shares: 18700, value: 11594 },
                { rank: 6, name: "BearishBoss", side: "NO" as const, shares: 15300, value: 5814 },
                { rank: 7, name: "DeFiDave_PH", side: "YES" as const, shares: 12500, value: 7750 },
                { rank: 8, name: "SatoshiFan09", side: "NO" as const, shares: 9800, value: 3724 },
              ].map(h => (
                <div key={h.rank} style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 40, borderBottom: `1px solid ${t.cardBorder}` }}>
                  <span style={{ width: 32, fontSize: 12, color: h.rank <= 3 ? "#ff5222" : t.textMut, fontWeight: h.rank <= 3 ? 700 : 400 }}>{h.rank}</span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: t.textSec, fontWeight: 600, flexShrink: 0 }}>{h.name[0]}</div>
                    <span style={{ fontSize: 12, color: t.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, ...pp }}>{h.name}</span>
                  </div>
                  <span style={{ width: 60, textAlign: "right" as const }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: h.side === "YES" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: h.side === "YES" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{h.side}</span></span>
                  <span className="hidden sm:inline" style={{ width: 80, textAlign: "right" as const, fontSize: 12, color: t.textSec, fontVariantNumeric: "tabular-nums" }}>{h.shares.toLocaleString()}</span>
                  <span className="hidden sm:inline" style={{ width: 80, textAlign: "right" as const, fontSize: 12, color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>₱{h.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Activity tab content */}
          {commentTab === "Activity" && (
            <div style={{ borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card, overflow: "hidden" }}>
              {[
                { time: "2m ago", user: "CryptoWhale_PH", action: "Bought", side: "YES" as const, amount: "500 shares", price: "62¢" },
                { time: "5m ago", user: "BearishBoss", action: "Sold", side: "NO" as const, amount: "1,200 shares", price: "38¢" },
                { time: "12m ago", user: "TradingDeskMNL", action: "Bought", side: "YES" as const, amount: "2,000 shares", price: "61¢" },
                { time: "18m ago", user: "GlobalMacro99", action: "Placed Limit", side: "NO" as const, amount: "3,500 shares", price: "35¢" },
                { time: "25m ago", user: "BTCMaxiManila", action: "Bought", side: "YES" as const, amount: "800 shares", price: "63¢" },
                { time: "32m ago", user: "SatoshiFan09", action: "Sold", side: "YES" as const, amount: "450 shares", price: "60¢" },
                { time: "41m ago", user: "DeFiDave_PH", action: "Bought", side: "YES" as const, amount: "1,100 shares", price: "59¢" },
                { time: "55m ago", user: "PH_BlockchainPro", action: "Placed Limit", side: "YES" as const, amount: "5,000 shares", price: "58¢" },
                { time: "1h ago", user: "BearishBoss", action: "Bought", side: "NO" as const, amount: "2,800 shares", price: "37¢" },
                { time: "1.5h ago", user: "CryptoWhale_PH", action: "Sold", side: "NO" as const, amount: "600 shares", price: "39¢" },
              ].map((a, i) => (
                <div key={`act${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: t.textSec, fontWeight: 600, flexShrink: 0 }}>{a.user[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: t.text, ...pp }}>
                      <span style={{ fontWeight: 600 }}>{a.user}</span>{" "}
                      <span style={{ color: t.textSec }}>{a.action}</span>{" "}
                      <span style={{ fontWeight: 600, color: a.side === "YES" ? "#22c55e" : "#ef4444" }}>{a.side}</span>
                      <span className="hidden sm:inline" style={{ color: t.textSec }}> · {a.amount} @ {a.price}</span>
                    </div>
                    <div className="sm:hidden" style={{ fontSize: 11, color: t.textMut, marginTop: 2 }}>{a.amount} @ {a.price}</div>
                  </div>
                  <span style={{ fontSize: 11, color: t.textMut, flexShrink: 0, whiteSpace: "nowrap" as const }}>{a.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Related tab content */}
          {commentTab === "Related" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "BTC above $120K by end of Q2 2026?", cat: "💰 Crypto", vol: "₱1.2M", yes: 58, trend: "+3.2%" },
                { title: "ETH to flip BTC market cap in 2026?", cat: "💰 Crypto", vol: "₱680K", yes: 12, trend: "-0.8%" },
                { title: "SEC approves Solana spot ETF this year?", cat: "💰 Crypto", vol: "₱435K", yes: 41, trend: "+6.5%" },
                { title: "Fed rate cut before June 2026?", cat: "📈 Macro", vol: "₱890K", yes: 73, trend: "+1.1%" },
              ].map((r, i) => (
                <div key={`rel${i}`} className="rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors hover:bg-black/[0.02]" style={{ background: t.card, borderColor: t.cardBorder }}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] sm:text-[14px] leading-[1.4]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{r.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded shrink-0" style={{ background: isDark ? "rgba(255,82,34,0.15)" : "#fff4ed", color: "#ff5222", fontWeight: 600, ...ss }}>{r.cat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>YES</span>
                        <span className="text-[16px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...pp }}>{r.yes}¢</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px]" style={{ color: t.textMut, ...ss }}>NO</span>
                        <span className="text-[16px]" style={{ color: "#ef4444", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...pp }}>{100 - r.yes}¢</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>{r.vol}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: r.trend.startsWith("+") ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: r.trend.startsWith("+") ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>{r.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="hidden sm:flex flex-col items-center gap-1 pt-8 pb-4">
          <span className="text-[11px]" style={{ color: t.textFaint, ...ss, ...pp }}>PrediEx Inc. © 2026</span>
        </div>
        </div>{/* close inner flex-col gap wrapper */}
      </div>

      {/* Right sidebar: Orderbook Trading Panel */}
      <OrderbookTradingPanel market={obMarket} isDark={isDark} t={obT} onDeposit={openDeposit} />

      {/* Sell Confirmation Modal */}
      {sellPos && !sellDone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSellPos(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: "0 24px 48px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </div>
                <div>
                  <span className="text-[15px] block" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Sell Position</span>
                  <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Market Order · Sell {sellPos.side}</span>
                </div>
              </div>
              <button onClick={() => setSellPos(null)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMut} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="h-px mx-6" style={{ background: t.cardBorder }} />
            <div className="px-6 py-3">
              <p className="text-[12px] leading-[1.5]" style={{ color: t.textSec, ...ss, ...pp }}>{obMarket.title}</p>
            </div>
            <div className="mx-6 rounded-xl p-4 flex flex-col gap-3" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Side</span>
                <span className="text-[12px] px-2.5 py-0.5 rounded-md" style={{ background: sellPos.side === "YES" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: sellPos.side === "YES" ? "#22c55e" : "#ef4444", fontWeight: 700, ...ss }}>{sellPos.side}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Shares to Sell</span>
                <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{sellPos.shares.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Avg Entry</span>
                <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{sellPos.avgPrice}¢</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Market Sell Price</span>
                <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>{sellPrice}¢</span>
              </div>
              <div className="h-px" style={{ background: t.cardBorder }} />
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss }}>Proceeds</span>
                <span className="text-[16px]" style={{ color: t.text, fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{sellProceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Realized P&L</span>
                <span className="text-[12px]" style={{ color: sellPnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, fontVariantNumeric: "tabular-nums", ...ss }}>
                  {sellPnl >= 0 ? "+" : ""}₱{sellPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="px-6 pt-4 pb-6 flex gap-3">
              <button onClick={() => setSellPos(null)} className="flex-1 h-12 rounded-xl text-[13px] cursor-pointer" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 600, border: `1px solid ${t.cardBorder}`, ...ss, ...pp }}>
                Cancel
              </button>
              <button onClick={() => setSellDone(true)} className="flex-1 h-12 rounded-xl text-[13px] cursor-pointer transition-opacity hover:opacity-90" style={{ background: "#ef4444", color: "#fff", fontWeight: 700, ...ss, ...pp }}>
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Success Modal */}
      {sellPos && sellDone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: "0 24px 48px rgba(0,0,0,0.25)" }}>
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.12)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span className="text-[18px] mb-1" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Sold!</span>
              <span className="text-[12px]" style={{ color: t.textMut, ...ss }}>Your position has been closed</span>
            </div>
            <div className="mx-6 mb-4 rounded-xl p-4 flex flex-col gap-2.5" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Shares sold</span>
                <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, ...ss }}>{sellPos.shares.toLocaleString()} {sellPos.side}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: t.textMut, ...ss }}>Fill price</span>
                <span className="text-[12px]" style={{ color: t.text, fontWeight: 600, ...ss }}>{sellPrice}¢</span>
              </div>
              <div className="h-px" style={{ background: t.cardBorder }} />
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: t.text, fontWeight: 600, ...ss }}>Proceeds</span>
                <span className="text-[18px]" style={{ color: "#22c55e", fontWeight: 700, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>₱{sellProceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => { setSellPos(null); setSellDone(false); }} className="w-full h-12 rounded-xl text-[14px] cursor-pointer" style={{ background: "#22c55e", color: "#fff", fontWeight: 700, ...ss, ...pp }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== PAGE ==================== */
export default function MarketDetailPage() {
  const { id } = useParams();
  const { darkMode: isDark, toggleDarkMode } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openDeposit = () => setModalOpen(true);

  const t = isDark ? dark : light;

  // Check if this is an orderbook market
  const isOrderbook = !!getOBMarket(id);
  const market = getMarket(id);

  const modalTheme: ModalTheme = {
    bg: t.bg, card: t.card, cardBorder: t.cardBorder,
    text: t.text, textSec: t.textSec, textMut: t.textMut, textFaint: t.textFaint,
    inputBg: t.inputBg, inputBorder: t.inputBorder,
    greenBg: isDark ? "rgba(0,191,133,0.15)" : "#e6fff3", greenText: "#00BF85",
    orangeBg: isDark ? "rgba(255,82,34,0.15)" : "#fff4ed", orangeText: "#ff5222",
    isDark,
  };

  return (
    <ThemeCtx.Provider value={{ t, isDark, toggle: toggleDarkMode }}>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: t.bg, ...pp }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />
          {isOrderbook ? (
            <OrderbookMarketPage id={id || ""} isDark={isDark} t={t} openDeposit={openDeposit} />
          ) : (
            <div className="flex flex-1 overflow-hidden">
              <MainContent market={market} />
              <TradingPanel market={market} onDeposit={openDeposit} />
            </div>
          )}
        </div>
      </div>
      {isOrderbook ? (
        <MobileOrderSheet market={getOBMarket(id)!} isDark={isDark} t={{
          bg: t.bg, bgAlt: t.bgAlt, card: t.card, cardBorder: t.cardBorder,
          text: t.text, textSec: t.textSec, textMut: t.textMut, textFaint: t.textFaint,
          inputBg: t.inputBg, inputBorder: t.inputBorder,
        }} onDeposit={openDeposit} />
      ) : (
        <MobileBetSheet market={market} onDeposit={openDeposit} />
      )}
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={8200} />
    </ThemeCtx.Provider>
  );
}
