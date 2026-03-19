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
      { user: "BoxingAnalyst", time: "6h ago", text: "Realistic tayo — Inoue is P4P #1. Pero Donaire always has a puncher\'s chance.", likes: 32, liked: false },
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

/* --- Trading Panel (Right Sidebar) --- */
function TradingPanel({ market, onDeposit }: { market: MarketData; onDeposit: () => void }) {
  const { t, isDark } = useTheme();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [amount, setAmount] = useState("");
  const sel = market.outcomes[selectedOutcome] || market.outcomes[0];
  if (!sel) return null;
  const numAmount = parseFloat(amount) || 0;
  const multiplier = parseFloat(sel.payout.replace("x", "")) || 1;
  const payout = (numAmount * multiplier).toFixed(2);

  return (
    <div className="w-[280px] shrink-0 p-5 flex flex-col gap-5 border-l overflow-y-auto" style={{ background: t.card, borderColor: t.cardBorder }}>
      {/* Related match */}
      <p className="text-[12px] leading-[1.4]" style={{ color: t.textSec, ...ss, ...pp }}>{market.title}</p>

      {/* Outcome selection */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Outcome</span>
          <svg className="size-3" fill="none" viewBox="0 0 12 12"><path d={svgPaths.p1609ec30} fill={t.iconFill} /></svg>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {market.outcomes.map((o, i) => (
            <button key={i} onClick={() => setSelectedOutcome(i)} className="h-9 px-3 rounded-md text-[13px] cursor-pointer transition-all" style={{
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
        <div className="flex justify-end mt-1">
          <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>Balance: ₱8,200.00</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {["20%", "50%", "75%", "MAX"].map((pct) => (
            <button key={pct} onClick={() => {
              const perc = pct === "MAX" ? 1 : parseInt(pct) / 100;
              setAmount((8200 * perc).toFixed(0));
            }} className="flex-1 h-7 rounded text-[12px] cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.text, fontWeight: 500, ...ss, ...pp }}>
              {pct}
            </button>
          ))}
        </div>
      </div>

      {/* Payout & Odds */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Est. Payout</span>
          <span className="text-[24px]" style={{ color: "#00BF85", fontWeight: 700, ...pp }}>₱{numAmount > 0 ? Number(payout).toLocaleString() : "0.00"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Current Odds</span>
          <span className="text-[16px]" style={{ color: "#00BF85", fontWeight: 600, ...pp }}>{sel.payout}</span>
        </div>
      </div>

      {/* CTA */}
      {isLoggedIn ? (
        <button className="bg-[#00BF85] text-white h-12 rounded-lg text-[16px] cursor-pointer hover:bg-[#00a674] transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>
          I-Finalize ang Taya
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate("/login")} className="bg-[#ff5222] text-white h-12 rounded-lg text-[16px] cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>
            Mag-sign In para Tumaya
          </button>
          <button onClick={() => navigate("/signup")} className="h-10 rounded-lg text-[14px] cursor-pointer hover:bg-[#f7f8f9] transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid ${t.cardBorder}`, color: t.text, fontWeight: 500, ...ss, ...pp }}>
            Gumawa ng Account
          </button>
        </div>
      )}
      {isLoggedIn && (
      <p className="text-[11px] text-center" style={{ color: t.textMut, ...ss, ...pp }}>
        Sa pag-trade, sumasang-ayon ka sa <span className="underline cursor-pointer" style={{ color: t.textSec }}>Terms of Use</span>
      </p>
      )}
      {/* Quick GCash/Maya deposit */}
      <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa", border: `1px solid ${t.cardBorder}` }}>
        <span className="text-[11px]" style={{ color: t.textMut, fontWeight: 500, ...pp }}>Quick Deposit</span>
        <div className="flex gap-1.5">
          <button onClick={onDeposit} className="flex-1 h-8 bg-[#0070E0] text-white text-[11px] rounded cursor-pointer" style={{ fontWeight: 700, ...pp }}>GCash</button>
          <button onClick={onDeposit} className="flex-1 h-8 bg-[#16A34A] text-white text-[11px] rounded cursor-pointer" style={{ fontWeight: 700, ...pp }}>Maya</button>
        </div>
      </div>
    </div>
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

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 min-w-0" style={{ background: t.bg }}>
      {/* Market Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ImageWithFallback src={market.image} alt="" className="size-[60px] rounded-lg object-cover" />
          <div>
            <h1 className="text-[22px] leading-[1.3]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{market.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p27f24a00} fill={t.iconFill} /></svg>
                <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{market.volume} Vol.</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p33c0c00} fill={t.iconFill} /></svg>
                <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{market.endDate}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: isDark ? "rgba(255,82,34,0.15)" : "#fff4ed", color: "#ff5222", fontWeight: 600, ...pp }}><EmojiIcon emoji={market.category.split(" ")[0]} size={12} />{market.category.split(" ").slice(1).join(" ")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7", color: t.textSec, fontWeight: 500, ...pp }}>Tier {market.tier}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Matatapos sa</span>
          <div className="flex gap-1">
            {(market.endDate === "LIVE" ? ["LIVE"] : ["2D", "10H", "8M", "45S"]).map((u) => (
              <span key={u} className="text-[14px] px-2 py-1 rounded" style={{ background: u === "LIVE" ? "#ff5222" : (isDark ? "rgba(255,255,255,0.06)" : "#fafafa"), color: u === "LIVE" ? "#fff" : t.text, fontWeight: 500, ...ss, ...pp }}>{u}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full overflow-hidden">
          <img src={imgUnsplash4Yv84VgQkRm} alt="" className="size-full object-cover" />
        </div>
        <span className="text-[16px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{market.creator}</span>
        <div className="flex items-center gap-1">
          <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d={svgPaths.p3e687800} fill="#FF5222" /></svg>
          <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{market.creatorFire}</span>
        </div>
      </div>

      {/* Chart Card */}
      <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ background: t.card, borderColor: t.cardBorder }}>
        {/* Legend + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {market.outcomes.slice(0, 3).map((o) => (
              <div key={o.name} className="flex items-center gap-1">
                <div className="size-2 rounded-full" style={{ background: o.color }} />
                <span className="text-[12px]" style={{ color: t.text, ...ss, ...pp }}>{o.name} {o.chance}%</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.pebbdf00} fill={t.iconFill} /></svg>
            <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p3126e980} fill={t.iconFill} /></svg>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={market.chartData}>
              <CartesianGrid key="grid" stroke={t.chartGrid} strokeDasharray="0" vertical={false} />
              <XAxis key="xaxis" dataKey="month" tick={{ fill: t.textMut, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fill: t.textMut, fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip key="tooltip" contentStyle={{ background: isDark ? "#1a1b1f" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
              {market.outcomes.slice(0, 3).map((o) => (
                <Line key={`line-${o.name}`} type="monotone" dataKey={o.name} stroke={o.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time tabs + filters */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: t.cardBorder }}>
          <div className="flex items-center gap-2">
            {timeTabs.map((tab) => (
              <button key={tab} onClick={() => setTimeTab(tab)} className="h-7 px-2 rounded text-[12px] cursor-pointer transition-colors" style={{
                background: timeTab === tab ? (isDark ? "rgba(255,255,255,0.08)" : "#f2f3f4") : "transparent",
                color: timeTab === tab ? t.text : t.textMut,
                ...ss, ...pp
              }}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p340bcf80} fill={t.iconFill} /></svg>
            <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p3a3d5c80} fill={t.iconFill} /></svg>
          </div>
        </div>

        {/* Outcome Ranking */}
        <div className="flex flex-col gap-4 pt-4 border-t" style={{ borderColor: t.cardBorder }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Outcome ranking</span>
            <div className="flex items-center gap-[120px]">
              <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>% Chance</span>
              <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Payout</span>
            </div>
          </div>
          {market.outcomes.map((o) => (
            <div key={o.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="size-12 rounded-md flex items-center justify-center" style={{ background: `${o.color}15` }}>
                  <EmojiIcon emoji={market.category.split(" ")[0]} size={20} />
                </div>
                <span className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{o.name}</span>
              </div>
              <span className="text-[24px] flex-1" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{o.chance}%</span>
              <button className="h-9 w-20 rounded-md text-[14px] cursor-pointer transition-colors" style={{
                background: `${o.color}15`, color: o.color, fontWeight: 500, ...ss, ...pp,
              }}>
                {o.payout}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Market Process */}
      <div className="rounded-2xl border p-6 flex flex-col gap-6" style={{ background: t.card, borderColor: t.cardBorder }}>
        <span className="text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Market Process</span>
        <div className="flex items-center justify-between relative">
          {["Market Open", "Market Closed", "Hinihintay Result", "Settled"].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-[127px] z-10">
              <div className="size-9 rounded-full flex items-center justify-center text-[16px]" style={{
                background: i < market.step + 1 ? "#ff5222" : (isDark ? "rgba(255,255,255,0.06)" : "#f2f3f4"),
                color: i < market.step + 1 ? "#fff" : t.textMut,
                fontWeight: 600, ...pp,
              }}>
                {i + 1}
              </div>
              <span className="text-[14px] text-center" style={{ color: t.text, ...ss, ...pp }}>{label}</span>
            </div>
          ))}
          {/* Connector lines */}
          <div className="absolute top-[18px] left-[90px] right-[90px] flex gap-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-0 border-t-2 border-dashed" style={{ borderColor: i < market.step ? "#ff5222" : t.textFaint }} />
            ))}
          </div>
        </div>
      </div>

      {/* My Picks */}
      {market.picks && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
          <button onClick={() => setPicksOpen(!picksOpen)} className="flex items-center justify-between w-full p-6 cursor-pointer">
            <span className="text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Mga Taya Ko / My Slips</span>
            <svg className={`size-4 transition-transform ${picksOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 7"><path d={svgPaths.p12bd8c80} fill={isDark ? "rgba(255,255,255,0.5)" : "#070808"} /></svg>
          </button>
          {picksOpen && (
            <div className="px-6 pb-6 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>
                <span className="flex-1">Outcome</span>
                <span className="flex-1">Taya Ko</span>
                <span className="flex-1">Est. Payout</span>
                <span className="flex-1">% Pool</span>
                <span className="w-[60px] text-right">Share</span>
              </div>
              {market.picks.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa" }}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setRulesOpen(!rulesOpen)}>
          <span className="text-[20px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Mga Patakaran / Rules</span>
          <svg className={`size-4 transition-transform ${rulesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 7"><path d={svgPaths.p12bd8c80} fill={isDark ? "rgba(255,255,255,0.5)" : "#070808"} /></svg>
        </div>
        {rulesOpen && (
          <p className="text-[14px] leading-[1.6]" style={{ color: t.textSec, ...ss, ...pp }}>{market.rules}</p>
        )}
      </div>

      {/* Comments */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5 h-10 border-b" style={{ borderColor: t.cardBorder }}>
          {commentTabs.map((tab) => (
            <button key={tab} onClick={() => setCommentTab(tab)} className="relative h-full text-[14px] cursor-pointer transition-colors" style={{ color: commentTab === tab ? t.text : t.textSec, fontWeight: 500, ...ss, ...pp }}>
              {tab === "Comments" ? `Comments (${market.comments.length})` : tab}
              {commentTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-sm bg-[#090a0d]" style={{ background: isDark ? "#fff" : "#090a0d" }} />}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-4">
          <div className="flex-1 h-12 rounded-lg flex items-center px-4" style={{ background: t.inputBg }}>
            <span className="flex-1 text-[14px]" style={{ color: t.textMut, ...ss, ...pp }}>Mag-komento...</span>
            <span className="text-[14px] cursor-pointer" style={{ color: "#ff5222", ...ss, ...pp }}>Post</span>
          </div>
          <div className="flex-1 h-12 rounded-lg flex items-center justify-center gap-2 px-4" style={{ background: isDark ? "rgba(0,191,133,0.1)" : "#e6fff3" }}>
            <svg className="size-6" fill="none" viewBox="0 0 24 24"><path d={svgPaths.p9a17a00} fill={isDark ? "#fff" : "#000"} /></svg>
            <span className="text-[14px]" style={{ color: t.text, ...ss, ...pp }}>Mag-ingat sa external links — baka phishing attacks</span>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md w-fit" style={{ background: t.inputBg }}>
          <span className="text-[14px]" style={{ color: t.textSec, ...ss, ...pp }}>Pinakabago</span>
          <svg className="size-3.5" fill="none" viewBox="0 0 10 6"><path d={svgPaths.p27f99a80} fill={isDark ? "#fff" : "#070808"} /></svg>
        </div>

        {/* Comment list */}
        {market.comments.map((c, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="size-8 rounded-full overflow-hidden shrink-0">
              <img src={imgUnsplash4Yv84VgQkRm} alt="" className="size-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{c.user}</span>
                <span className="text-[14px]" style={{ color: t.textMut, ...ss, ...pp }}>{c.time}</span>
              </div>
              <p className="text-[14px] leading-[1.5]" style={{ color: t.text, ...ss, ...pp }}>{c.text}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <svg className="size-5 cursor-pointer" fill="none" viewBox="0 0 20 20"><path d={svgPaths.pebbdf00} fill={c.liked ? "#FF5222" : t.iconFill} /></svg>
                <span className="text-[14px]" style={{ color: c.liked ? "#FF5222" : t.textMut, ...ss, ...pp }}>{c.likes}</span>
              </div>
            </div>
            <svg className="size-5 cursor-pointer shrink-0 mt-1" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p1ed70700} fill={t.iconFill} /></svg>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-1 pt-8 pb-4">
        <span className="text-[11px]" style={{ color: t.textFaint, ...ss, ...pp }}>ForeGate Inc. &copy; 2026</span>
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

/* ==================== PAGE ==================== */
export default function MarketDetailPage() {
  const { id } = useParams();
  const [isDark, setIsDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openDeposit = () => setModalOpen(true);

  const t = isDark ? dark : light;
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
    <ThemeCtx.Provider value={{ t, isDark, toggle: () => setIsDark(!isDark) }}>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: t.bg, ...pp }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="flex flex-1 overflow-hidden">
            <MainContent market={market} />
            <TradingPanel market={market} onDeposit={openDeposit} />
          </div>
        </div>
      </div>
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={8200} />
    </ThemeCtx.Provider>
  );
}