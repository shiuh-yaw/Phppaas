import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmojiIcon, MoneyIcon, PeopleIcon, TrophyIcon, TargetIcon } from "../components/two-tone-icons";
import { usePageTheme, toModalTheme } from "../components/theme-utils";

const ss = { fontFeatureSettings: "'ss04'" };
const pp = { fontFamily: "'Poppins', sans-serif" };

const keyframes = `
@keyframes fade-up { 0%{opacity:0;transform:translateY(15px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes slide-in { 0%{opacity:0;transform:translateX(-10px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes card-hover { 0%{box-shadow:0 2px 8px rgba(0,0,0,0.06)} 100%{box-shadow:0 8px 30px rgba(0,0,0,0.12)} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes count-up { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
`;

/* ====== TYPES ====== */
export interface CategoryConfig {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  heroImage: string;
  accentColor: string;
  accentLight: string;
  markets: MarketItem[];
  stats: { totalBets: string; activeBettors: string; biggestPot: string; liveNow: number };
  subcategories: string[];
}

interface MarketItem {
  id: string;
  title: string;
  subtitle: string;
  status: "live" | "upcoming" | "closing";
  volume: string;
  bettors: number;
  endDate: string;
  options: { label: string; odds: number; color: string }[];
  hot?: boolean;
  featured?: boolean;
}

/* ====== DEPOSIT MODAL THEME ====== */
const depositTheme: ModalTheme = {
  bg: "#ffffff", cardBg: "#f9fafb", border: "#f0f1f3", text: "#070808",
  textSecondary: "#84888c", accent: "#ff5222", accentHover: "#e84a1e",
  inputBg: "#f7f8f9", inputBorder: "#e5e7eb", success: "#00bf85",
  tabActiveBg: "#ff5222", tabActiveText: "#ffffff",
  tabInactiveBg: "#f7f8f9", tabInactiveText: "#84888c",
};

/* ====== STATUS BADGE ====== */
function StatusBadge({ status }: { status: "live" | "upcoming" | "closing" }) {
  const config = {
    live: { bg: "#fef2f2", text: "#dc2626", label: "LIVE", emoji: "🔴", dot: true },
    upcoming: { bg: "#eff6ff", text: "#2563eb", label: "Upcoming", emoji: "📅", dot: false },
    closing: { bg: "#fff7ed", text: "#ea580c", label: "Closing Soon", emoji: "⏳", dot: false },
  };
  const c = config[status];
  return (
    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text, fontWeight: 700, ...ss }}>
      {c.dot && <span className="size-1.5 rounded-full bg-current" style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }} />}
      <EmojiIcon emoji={c.emoji} size={10} /> {c.label}
    </span>
  );
}

/* ====== MARKET CARD ====== */
function MarketCard({ market, accentColor, accentLight, index, theme }: { market: MarketItem; accentColor: string; accentLight: string; index: number; theme: import("../components/theme-utils").PageTheme }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: theme.card, border: `1px solid ${theme.cardBorder}`,
        animation: `fade-up 0.4s ease-out ${index * 0.06}s both`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onClick={() => navigate(`/market/${market.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top bar */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={market.status} />
          {market.hot && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{ background: accentColor, fontWeight: 700, ...ss }}>
              <EmojiIcon emoji="🔥" size={10} /> HOT
            </span>
          )}
          {market.featured && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: accentLight, color: accentColor, fontWeight: 700, ...ss }}>
              <EmojiIcon emoji="⭐" size={10} /> FEATURED
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>{market.endDate}</span>
      </div>

      {/* Title */}
      <div className="px-4 pb-2">
        <h3 className="text-[14px] mb-0.5" style={{ fontWeight: 600, ...ss, ...pp, color: theme.text }}>{market.title}</h3>
        <p className="text-[11px]" style={{ ...ss, color: theme.textSec }}>{market.subtitle}</p>
      </div>

      {/* Options */}
      <div className="px-4 pb-3 flex flex-col gap-1.5">
        {market.options.map((opt, i) => (
          <div
            key={i}
            className="flex items-center justify-between h-9 px-3 rounded-lg border transition-colors"
            style={{ borderColor: hovered ? `${opt.color}30` : theme.cardBorder, background: hovered ? `${opt.color}05` : theme.inputBg }}
          >
            <span className="text-[12px]" style={{ fontWeight: 500, ...ss, color: theme.text }}>{opt.label}</span>
            <span className="text-[12px]" style={{ fontWeight: 700, color: opt.color, ...ss }}>{(opt.odds * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${theme.cardBorder}`, background: theme.inputBg }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.textSec, ...ss }}>
            <EmojiIcon emoji="💰" size={12} /> <span style={{ fontWeight: 600, color: theme.text }}>{market.volume}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: theme.textSec, ...ss }}>
            <EmojiIcon emoji="👥" size={12} /> {market.bettors.toLocaleString()}
          </span>
        </div>
        <button
          className="text-[10px] px-2.5 py-1 rounded-md text-white transition-all hover:brightness-110"
          style={{ background: accentColor, fontWeight: 600, ...ss }}
          onClick={(e) => { e.stopPropagation(); navigate(`/market/${market.id}`); }}
        >
          Tumaya →
        </button>
      </div>
    </div>
  );
}

/* ====== STAT CARD ====== */
function StatCard({ label, value, icon, delay, theme }: { label: string; value: string; icon: React.ReactNode; delay: number; theme: import("../components/theme-utils").PageTheme }) {
  return (
    <div className="rounded-xl px-4 py-3.5 flex items-center gap-3" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, animation: `count-up 0.4s ease-out ${delay}s both` }}>
      <span className="shrink-0">{icon}</span>
      <div>
        <div className="text-[18px]" style={{ fontWeight: 700, ...ss, ...pp, color: theme.text }}>{value}</div>
        <div className="text-[11px]" style={{ ...ss, color: theme.textSec }}>{label}</div>
      </div>
    </div>
  );
}

/* ====== MAIN CATEGORY PAGE ====== */
export default function CategoryPage({ config }: { config: CategoryConfig }) {
  const navigate = useNavigate();
  const [showDeposit, setShowDeposit] = useState(false);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "closing">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = usePageTheme();

  const filtered = config.markets.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ ...pp, background: theme.bg }}>
      <style>{keyframes}</style>
      <Sidebar onDeposit={() => setShowDeposit(true)} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onDeposit={() => setShowDeposit(true)} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-4 md:py-5">

            {/* ===== HERO BANNER ===== */}
            <div className="relative rounded-2xl overflow-hidden mb-5 md:mb-6" style={{ minHeight: 160 }}>
              <ImageWithFallback
                src={config.heroImage}
                alt={config.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, ${config.accentColor}20 100%)` }} />
              <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-6" style={{ minHeight: 160 }}>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate("/markets")} className="flex items-center gap-1 text-white/70 hover:text-white text-[12px] cursor-pointer transition-colors" style={{ fontWeight: 500, ...ss }}>
                    ← Mga Market
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-white/90 text-[12px]" style={{ fontWeight: 600, ...ss }}>{config.name}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <EmojiIcon emoji={config.emoji} size={40} />
                    <div>
                      <h1 className="text-white text-[28px]" style={{ fontWeight: 700, ...ss }}>{config.name}</h1>
                      <p className="text-white/70 text-[13px]" style={ss}>{config.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full" style={{ fontWeight: 600, ...ss }}>
                      <span className="size-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                      {config.stats.liveNow} Live Markets
                    </span>
                    <span className="bg-white/10 backdrop-blur-sm text-white/80 text-[11px] px-2.5 py-1 rounded-full" style={ss}>
                      {config.stats.activeBettors} active bettors
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5 md:mb-6">
              <StatCard label="Total Bets" value={config.stats.totalBets} icon={<MoneyIcon size={28} />} delay={0.1} theme={theme} />
              <StatCard label="Active Bettors" value={config.stats.activeBettors} icon={<PeopleIcon size={28} />} delay={0.15} theme={theme} />
              <StatCard label="Biggest Pot" value={config.stats.biggestPot} icon={<TrophyIcon size={28} />} delay={0.2} theme={theme} />
              <StatCard label="Live Markets" value={`${config.stats.liveNow}`} icon={<TargetIcon size={28} />} delay={0.25} theme={theme} />
            </div>

            {/* ===== SUBCATEGORY PILLS ===== */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {config.subcategories.map((sub, i) => (
                <button
                  key={sub}
                  className="shrink-0 h-8 px-3.5 rounded-full border text-[12px] cursor-pointer transition-all hover:border-[#ff5222]/30 hover:bg-[#ff5222]/5"
                  style={{ borderColor: i === 0 ? config.accentColor + "40" : theme.cardBorder, background: i === 0 ? config.accentLight : theme.card, color: i === 0 ? config.accentColor : theme.textSec, fontWeight: i === 0 ? 600 : 400, animation: `slide-in 0.3s ease-out ${i * 0.05}s both`, ...ss }}
                  onClick={() => {}}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* ===== FILTERS + SEARCH ===== */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-1.5 rounded-lg p-1 overflow-x-auto" style={{ background: theme.inputBg }}>
                {(["all", "live", "upcoming", "closing"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="flex items-center gap-1 h-8 px-3 rounded-md text-[12px] cursor-pointer transition-all"
                    style={{ background: filter === f ? theme.card : 'transparent', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', color: filter === f ? theme.text : theme.textSec, fontWeight: filter === f ? 600 : 400, ...ss }}
                  >
                    {f !== "all" && <EmojiIcon emoji={f === "live" ? "🔴" : f === "upcoming" ? "📅" : "⏳"} size={10} />}
                    {f === "all" ? "Lahat" : f === "live" ? "Live" : f === "upcoming" ? "Upcoming" : "Closing"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-full sm:w-[240px]" style={{ border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                <span style={{ color: theme.textMut }}><EmojiIcon emoji="🔍" size={14} /></span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Maghanap sa ${config.name}...`}
                  className="flex-1 text-[12px] bg-transparent outline-none"
                  style={{ ...ss, color: theme.text }}
                />
              </div>
            </div>

            {/* ===== MARKET GRID ===== */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                {filtered.map((market, i) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    accentColor={config.accentColor}
                    accentLight={config.accentLight}
                    index={i}
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl mb-8" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                <span className="mb-3"><EmojiIcon emoji={config.emoji} size={48} /></span>
                <h3 className="text-[16px] mb-1" style={{ fontWeight: 600, ...ss, color: theme.text }}>Walang makitang market</h3>
                <p className="text-[12px]" style={{ ...ss, color: theme.textSec }}>
                  {searchQuery ? `Walang resulta para sa "${searchQuery}"` : "Wala pang available na market sa filter na 'to."}
                </p>
                <button
                  onClick={() => { setFilter("all"); setSearchQuery(""); }}
                  className="mt-3 text-[12px] text-[#ff5222] cursor-pointer hover:underline"
                  style={{ fontWeight: 600, ...ss }}
                >
                  I-clear ang filters
                </button>
              </div>
            )}

            {/* ===== DESCRIPTION SECTION ===== */}
            <div className="rounded-xl p-5 mb-8" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <h3 className="text-[14px] mb-2 flex items-center gap-2" style={{ fontWeight: 600, ...ss, color: theme.text }}>
                <EmojiIcon emoji={config.emoji} size={22} /> Tungkol sa {config.name}
              </h3>
              <p className="text-[12px] leading-[1.7]" style={{ ...ss, color: theme.textSec }}>{config.description}</p>
            </div>

            {/* ===== QUICK NAV TO OTHER CATEGORIES ===== */}
            <div className="mb-8">
              <h3 className="text-[14px] mb-3" style={{ fontWeight: 600, ...ss, color: theme.text }}>Iba pang Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Basketball", emoji: "🏀", route: "/category/basketball" },
                  { label: "Color Game", emoji: "🎲", route: "/category/color-game" },
                  { label: "Boxing", emoji: "🥊", route: "/category/boxing" },
                  { label: "Esports", emoji: "🎮", route: "/category/esports" },
                  { label: "Bingo", emoji: "💯", route: "/category/bingo" },
                  { label: "Lottery", emoji: "🎰", route: "/category/lottery" },
                  { label: "Showbiz", emoji: "⭐", route: "/category/showbiz" },
                  { label: "Weather", emoji: "🌪", route: "/category/weather" },
                  { label: "Economy", emoji: "📈", route: "/category/economy" },
                ].filter((c) => c.route !== `/category/${config.slug}`).map((cat) => (
                  <button
                    key={cat.route}
                    onClick={() => navigate(cat.route)}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full transition-all cursor-pointer hover:border-[#ff5222]/30 hover:bg-[#ff5222]/5"
                    style={{ border: `1px solid ${theme.cardBorder}`, background: theme.card }}
                  >
                    <EmojiIcon emoji={cat.emoji} size={18} />
                    <span className="text-[12px]" style={{ fontWeight: 500, ...ss, color: theme.text }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>

      <DepositWithdrawModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        theme={toModalTheme(theme)}
      />
    </div>
  );
}