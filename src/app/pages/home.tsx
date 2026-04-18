import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-nlqz6xnxi5";
import { useAuth } from "../components/auth-context";
import imgFrame2087325367 from "figma:asset/aa22ee141c47adc40b93dee89db917612452e751.png";
import imgImageRemovebgPreview2 from "figma:asset/fb86db7f372adc95f0fa8dc7e325d0f9df0f0aae.png";
import imgImage83 from "figma:asset/dee6f729e475d64d963a4837560306f0452751ae.png";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import {
  BasketballIcon, DiceIcon, BoxingIcon, EsportsIcon, BingoIcon,
  LotteryIcon, ShowbizIcon, WeatherIcon, EconomyIcon,
  ChartIcon as TTChartIcon, MoneyIcon as TTMoneyIcon, LightningIcon as TTLightningIcon,
  GiftIcon as TTGiftIcon, TrophyIcon as TTTrophyIcon, StarIcon as TTStarIcon,
  EmojiIcon,
} from "../components/two-tone-icons";
import { useT } from "../i18n/useT";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== KEYFRAMES ==================== */
const keyframes = `
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes float-slow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
@keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(255,82,34,0.1)} 50%{box-shadow:0 0 40px rgba(255,82,34,0.25)} }
@keyframes shine { 0%{left:-100%} 100%{left:200%} }
@keyframes jackpot-count { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
@keyframes slide-up { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes slide-right { 0%{opacity:0;transform:translateX(-16px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes coin-spin { 0%{transform:rotateY(0)} 100%{transform:rotateY(360deg)} }
@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes bounce-in { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.05)} 70%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
@keyframes winner-pop { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes gradient-x { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes count-up { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
`;

/* ==================== IMAGES ==================== */
const IMG = {
  basketball: "https://images.unsplash.com/photo-1640862101983-9f7ef7fd7cc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing: "https://images.unsplash.com/photo-1564097147829-44f8c74a8549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  esports: "https://images.unsplash.com/photo-1767455471543-055dbc6c6700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  dice: "https://images.unsplash.com/photo-1587840856843-02422d531bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  lottery: "https://images.unsplash.com/photo-1518688248740-7c31f1a945c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  showbiz: "https://images.unsplash.com/photo-1594999791384-9870ed78f6b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  trophy: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  heroBg: "https://images.unsplash.com/photo-1767161642116-a3cb82c1a4ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600",
  ctaBg: "https://images.unsplash.com/photo-1649024511959-c713f1e764f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600",
};

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";

/* ==================== SECTION LABEL ==================== */
function SectionLabel({ emoji, text }: { emoji: string; text: string }) {
  return (
    <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/8 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5" style={{ fontWeight: 700, ...pp }}>
      <EmojiIcon emoji={emoji} size={13} /> {text}
    </span>
  );
}

/* ==================== HEADER ==================== */
function HomeHeader({ onDeposit }: { onDeposit?: () => void }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, darkMode, toggleDarkMode } = useAuth();
  const t = useT();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <header className="bg-white/95 dark:bg-[#0f1117]/95 backdrop-blur-md w-full h-14 md:h-16 sticky top-0 z-50 border-b border-[#f0f1f3] dark:border-[#2a2d3a]" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
      <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 cursor-pointer">
            <div className="w-[93px] h-6 relative">
              <div className="absolute bg-[#ff5222] h-6 left-0 top-0 w-[93px]" style={{ maskImage: `url('${imgFrame2087325367}')`, maskSize: '93px 24px', maskRepeat: 'no-repeat' }} />
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-5" style={pp}>
            {[
              { label: t("nav.markets"), route: "/markets" },
              { label: t("nav.fastBet"), route: "/fast-bet", hot: true },
              { label: t("cat.colorGame"), route: "/category/color-game" },
              { label: t("nav.portfolio"), route: "/portfolio" },
              { label: t("nav.rewards"), route: "/rewards" },
              { label: t("nav.leaderboard"), route: "/leaderboard" },
            ].map(item => (
              <button key={item.route} onClick={() => navigate(item.route)} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors flex items-center gap-1" style={{ fontWeight: 500, ...ss }}>
                {item.label}
                {item.hot && <span className="text-[9px] bg-[#ff5222] text-white px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>HOT</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#b0b3b8] border border-[#e5e7eb] rounded px-2 py-0.5 hidden lg:block" style={{ fontWeight: 500, ...pp }}>PAGCOR Licensed</span>
          <button onClick={toggleDarkMode} className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f5f6f7] cursor-pointer transition-colors" title={darkMode ? "Light mode" : "Dark mode"}>
            {darkMode ? (
              <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="4" /><path d="M10 2v1m0 14v1m8-8h-1M3 10H2m13.66-5.66l-.71.71M5.05 14.95l-.71.71m11.32 0l-.71-.71M5.05 5.05l-.71-.71" strokeLinecap="round" /></svg>
            ) : (
              <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#84888c] hidden sm:inline" style={{ fontWeight: 500, ...ss }}>₱{user?.balance?.toLocaleString() ?? "0"}</span>
              <button onClick={onDeposit} className="bg-[#ff5222] hover:bg-[#e8491e] transition-colors text-white h-8 px-3 md:px-4 rounded-[6px] text-[12px] md:text-[14px] leading-[1.5] cursor-pointer" style={{ fontWeight: 500, ...ss }}>
                Deposit
              </button>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="size-8 rounded-full overflow-hidden border-2 border-[#ff5222]/20 cursor-pointer hover:border-[#ff5222]/50 transition-all hover:scale-105">
                  <ImageWithFallback src={user?.avatar ?? DEFAULT_AVATAR} alt={user?.name ?? "User"} className="size-full object-cover" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border-[#f0f1f3] rounded-xl border shadow-lg overflow-hidden z-50" style={{ animation: "slide-up 0.15s ease-out" }}>
                    <div className="px-4 py-3 border-b border-[#f5f6f7]">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-full overflow-hidden ring-2 ring-[#ff5222]/15 shrink-0">
                          <ImageWithFallback src={user?.avatar ?? DEFAULT_AVATAR} alt="" className="size-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] text-[#070808] truncate" style={{ fontWeight: 600, ...ss }}>{user?.name}</span>
                          <span className="text-[10px] text-[#b0b3b8]" style={ss}>{user?.handle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        { label: t("home.dropdown.myPortfolio"), Icon: TTChartIcon, route: "/portfolio" },
                        { label: t("home.dropdown.rewards"), Icon: TTGiftIcon, route: "/rewards" },
                        { label: t("home.dropdown.leaderboard"), Icon: TTTrophyIcon, route: "/leaderboard" },
                        { label: t("home.dropdown.creatorCenter"), Icon: TTStarIcon, route: "/creator" },
                      ].map((item) => (
                        <button key={item.route} onClick={() => { setDropdownOpen(false); navigate(item.route); }} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#fafafa] transition-colors cursor-pointer text-left">
                          <item.Icon size={18} />
                          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-[#f5f6f7]" />
                    <div className="py-1">
                      <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#fef2f2] transition-colors cursor-pointer text-left">
                        <EmojiIcon emoji="🚪" size={16} />
                        <span className="text-[12px] text-[#dc2626]" style={{ fontWeight: 500, ...ss }}>{t("home.dropdown.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/login")} className="text-[13px] text-[#070808] h-9 px-4 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>{t("header.login")}</button>
              <button onClick={() => navigate("/signup")} className="bg-[#ff5222] text-white text-[13px] h-9 px-5 rounded-lg cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>{t("header.signup")}</button>
            </div>
          )}
          <div className="size-5 cursor-pointer">
            <svg className="size-full" fill="none" viewBox="0 0 24 24"><path d={svgPaths.p206aed00} fill="#070808" /></svg>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ==================== HERO ==================== */
function HeroSection() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <section className="relative w-full overflow-hidden bg-[#fafbfc]">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #ff5222, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #ff5222, transparent 70%)" }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-10 md:pb-14">
        <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
          {/* Left content */}
          <div className="flex-1 w-full lg:max-w-[600px]" style={{ animation: "slide-up 0.5s ease-out" }}>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="bg-[#ff5222] text-white text-[11px] px-3 py-1.5 rounded-full" style={{ fontWeight: 700, ...pp }}>
                {t("home.badge.number1")}
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 text-[11px] px-2.5 py-1.5 rounded-full flex items-center gap-1.5" style={{ fontWeight: 600, ...pp }}>
                <span className="size-[6px] bg-emerald-500 rounded-full animate-pulse" />
                12,847 Online
              </span>
            </div>

            <h1 className="text-[#070808] leading-[1.08] mb-5" style={{ fontWeight: 800, fontSize: "clamp(34px, 5vw, 54px)", ...ss, ...pp }}>
              {t("home.hero.title1")}{" "}
              <span className="bg-gradient-to-r from-[#ff5222] to-[#ff8c42] bg-clip-text text-transparent">{t("home.hero.title2")}</span>
            </h1>

            <p className="text-[15px] md:text-[16px] text-[#555] leading-[1.7] mb-7 max-w-[500px]" style={{ ...ss, ...pp }} dangerouslySetInnerHTML={{ __html: t("home.hero.desc") }} />

            {/* CTAs */}
            <div className="flex items-center gap-3 mb-7">
              <button
                onClick={() => navigate("/markets")}
                className="relative overflow-hidden bg-[#ff5222] text-white h-[52px] px-7 rounded-xl cursor-pointer transition-all hover:bg-[#e84a1e] hover:shadow-[0_6px_24px_rgba(255,82,34,0.35)]"
                style={{ fontWeight: 700, fontSize: 15, ...ss, ...pp }}
              >
                <span className="relative z-10 flex items-center gap-2">{t("home.hero.cta")}</span>
                <div className="absolute inset-0 overflow-hidden"><div className="absolute h-full w-[60px] bg-white/15 -skew-x-12" style={{ animation: "shine 3s ease-in-out infinite", top: 0 }} /></div>
              </button>
              <button
                onClick={() => navigate("/fast-bet")}
                className="border border-[#e5e7eb] text-[#070808] h-[52px] px-6 rounded-xl cursor-pointer hover:border-[#ff5222]/40 hover:text-[#ff5222] transition-all"
                style={{ fontWeight: 600, fontSize: 14, ...ss, ...pp }}
              >
                Fast Bet
              </button>
            </div>

            {/* Welcome bonus - cleaner */}
            <div className="bg-white border border-[#f0f1f3] rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="size-10 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shrink-0">
                <EmojiIcon emoji="🎁" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>{t("home.hero.welcomeBonus")} <span className="text-[#ff5222]">₱600 {t("home.hero.free")}</span></span>
                <p className="text-[11px] text-[#84888c]" style={pp}>{t("home.hero.welcomeDesc")}</p>
              </div>
              <button onClick={() => navigate("/signup")} className="bg-[#ff5222] text-white text-[11px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer hover:bg-[#e84a1e] transition-colors hidden sm:block" style={{ fontWeight: 600, ...pp }}>{t("home.hero.claim")}</button>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2 mt-5">
              <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...pp }}>{t("home.hero.depositVia")}</span>
              {["GCash", "Maya", "Bank"].map(m => (
                <span key={m} className="text-[10px] text-[#84888c] border border-[#e5e7eb] px-2.5 py-1 rounded-md" style={{ fontWeight: 600, ...pp }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Right side - Prediction Market Showcase */}
          <div className="flex-1 w-full flex flex-col gap-4 lg:max-w-[460px]" style={{ animation: "slide-up 0.5s ease-out 0.15s both" }}>
            {/* Featured Market Card */}
            <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-[#f0f1f3] dark:border-[#2a2d3a] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
              <div className="relative h-[140px] overflow-hidden">
                <ImageWithFallback src="https://images.unsplash.com/photo-1582676023855-ea55d883f9a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" alt="PBA Finals" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ fontWeight: 700, ...pp }}><span className="size-1.5 bg-white rounded-full animate-pulse" /> LIVE</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full" style={{ fontWeight: 600, ...pp }}>🏀 PBA</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-[15px]" style={{ fontWeight: 700, ...pp }}>PBA Finals 2026: SMB vs TNT</p>
                  <p className="text-white/70 text-[11px] mt-0.5" style={pp}>Sino ang mananalo sa Game 7?</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <button className="flex-1 bg-[#dc2626]/8 border border-[#dc2626]/20 rounded-lg py-2.5 text-center cursor-pointer hover:bg-[#dc2626]/15 transition-colors">
                    <span className="text-[11px] text-[#84888c] dark:text-[#8a8f98]" style={pp}>SMB</span>
                    <p className="text-[16px] text-[#dc2626]" style={{ fontWeight: 700, ...pp }}>₱1.65</p>
                  </button>
                  <button className="flex-1 bg-[#2563eb]/8 border border-[#2563eb]/20 rounded-lg py-2.5 text-center cursor-pointer hover:bg-[#2563eb]/15 transition-colors">
                    <span className="text-[11px] text-[#84888c] dark:text-[#8a8f98]" style={pp}>TNT</span>
                    <p className="text-[16px] text-[#2563eb]" style={{ fontWeight: 700, ...pp }}>₱2.35</p>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#b0b3b8]" style={pp}>
                  <span>₱4.2M volume</span>
                  <span>8,340 traders</span>
                </div>
              </div>
            </div>

            {/* Mini Market Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "2028 PH President", subtitle: "BBM successor?", img: "https://images.unsplash.com/photo-1661107643772-df9d8ae8f79e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", tag: "🗳️ Politics", yes: "34%", no: "66%", volume: "₱12.8M" },
                { title: "PSEi hits 8,000?", subtitle: "Before Dec 2026", img: "https://images.unsplash.com/photo-1627299895077-2c722532a42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", tag: "📈 Economy", yes: "58%", no: "42%", volume: "₱3.1M" },
              ].map((m, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-[#f0f1f3] dark:border-[#2a2d3a] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                  <div className="relative h-[72px] overflow-hidden">
                    <ImageWithFallback src={m.img} alt={m.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600, ...pp }}>{m.tag}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] text-[#070808] dark:text-[#e4e6ea]" style={{ fontWeight: 700, ...pp }}>{m.title}</p>
                    <p className="text-[10px] text-[#84888c] mt-0.5 mb-2" style={pp}>{m.subtitle}</p>
                    <div className="flex gap-1.5 mb-2">
                      <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded py-1 text-center">
                        <span className="text-[10px] text-emerald-600" style={{ fontWeight: 700, ...pp }}>Yes {m.yes}</span>
                      </div>
                      <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded py-1 text-center">
                        <span className="text-[10px] text-red-500" style={{ fontWeight: 700, ...pp }}>No {m.no}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-[#b0b3b8]" style={pp}>{m.volume} vol</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 md:mt-10">
          {[
            { Icon: TTChartIcon, label: t("home.stats.activeMarkets"), value: "2,847" },
            { Icon: TTMoneyIcon, label: t("home.stats.totalWagered"), value: "₱1.2B" },
            { Icon: TTStarIcon, label: t("home.stats.bettors"), value: "485K+" },
            { Icon: TTLightningIcon, label: t("home.stats.avgPayout"), value: "< 5 min" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#f0f1f3] rounded-xl flex items-center gap-3 px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]" style={{ animation: `count-up 0.4s ease-out ${0.3 + i * 0.08}s both` }}>
              <s.Icon size={26} />
              <div>
                <span className="text-[18px] md:text-[20px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>{s.value}</span>
                <p className="text-[10px] md:text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...pp }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== LIVE TICKER ==================== */
function LiveTicker() {
  const items = [
    { label: "PBA: Ginebra 78 - SMB 72", badge: "LIVE", color: "#ff5222" },
    { label: "Maria S. nanalo ng ₱12,500!", badge: "WIN", color: "#00bf85" },
    { label: "Boxing: Donaire vs Martinez — WBC", badge: "SOON", color: "#3b82f6" },
    { label: "MLBB: Blacklist vs ONIC PH", badge: "LIVE", color: "#ff5222" },
    { label: "Color Game Round #8832", badge: "ROLL", color: "#eab308" },
    { label: "BossKen nanalo ng ₱25,000!", badge: "WIN", color: "#00bf85" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="bg-white border-y border-[#f0f1f3] overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#ff5222] z-10">
          <span className="size-[6px] bg-white rounded-full animate-pulse" />
          <span className="text-[11px] text-white" style={{ fontWeight: 700, ...pp }}>LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-8 whitespace-nowrap" style={{ animation: "marquee 35s linear infinite" }}>
            {doubled.map((item, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ fontWeight: 700, backgroundColor: `${item.color}12`, color: item.color, ...pp }}>{item.badge}</span>
                <span className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...pp }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== GAME CATEGORIES ==================== */
function GameCategories() {
  const navigate = useNavigate();
  const t = useT();
  const categories = [
    { Icon: BasketballIcon, name: "Basketball", sub: "PBA, NBA, UAAP", route: "/category/basketball", color: "#ea580c", bg: "bg-orange-50/60", hot: true, bettors: "8.2K", live: 5 },
    { Icon: DiceIcon, name: "Color Game", sub: "Perya classic na digital!", route: "/category/color-game", color: "#dc2626", bg: "bg-red-50/60", hot: true, bettors: "6.1K", live: 8 },
    { Icon: BoxingIcon, name: "Boxing", sub: "Donaire, Pacquiao legacy", route: "/category/boxing", color: "#b91c1c", bg: "bg-red-50/50", hot: true, bettors: "3.9K", live: 2 },
    { Icon: EsportsIcon, name: "Esports", sub: "MLBB, Valorant, Dota 2", route: "/category/esports", color: "#6366f1", bg: "bg-indigo-50/60", hot: false, bettors: "5.7K", live: 6 },
    { Icon: BingoIcon, name: "Bingo", sub: "Classic bingo, digital!", route: "/category/bingo", color: "#0891b2", bg: "bg-cyan-50/60", hot: false, bettors: "2.9K", live: 4 },
    { Icon: LotteryIcon, name: "Lottery", sub: "6/45, 6/49, 6/58", route: "/category/lottery", color: "#7c3aed", bg: "bg-violet-50/60", hot: false, bettors: "4.2K", live: 3 },
    { Icon: ShowbizIcon, name: "Showbiz", sub: "Celebrity predictions", route: "/category/showbiz", color: "#ec4899", bg: "bg-pink-50/60", hot: false, bettors: "3.5K", live: 4 },
    { Icon: WeatherIcon, name: "Weather", sub: "Typhoon, temp forecasts", route: "/category/weather", color: "#0284c7", bg: "bg-sky-50/60", hot: false, bettors: "1.9K", live: 3 },
    { Icon: EconomyIcon, name: "Economy", sub: "PSEi, USD/PHP, inflation", route: "/category/economy", color: "#059669", bg: "bg-emerald-50/60", hot: false, bettors: "2.1K", live: 2 },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <SectionLabel emoji="🎮" text={t("home.categories.label")} />
          <h2 className="text-[26px] md:text-[32px] text-[#070808] mt-3 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.categories.title")}</h2>
          <p className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>{t("home.categories.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <button
              key={cat.route}
              onClick={() => navigate(cat.route)}
              className={`${cat.bg} border border-[#f0f1f3] rounded-2xl p-5 text-left cursor-pointer transition-all hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 group`}
              style={{ animation: `slide-up 0.35s ease-out ${i * 0.04}s both` }}
            >
              <div className="flex items-start justify-between mb-3">
                <cat.Icon size={36} />
                <div className="flex items-center gap-1.5">
                  {cat.hot && <span className="text-[8px] bg-[#ff5222] text-white px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>HOT</span>}
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${cat.color}08`, color: cat.color, fontWeight: 600, ...pp }}>
                    <span className="size-1.5 rounded-full animate-pulse" style={{ background: cat.color }} />{cat.live} Live
                  </span>
                </div>
              </div>
              <h3 className="text-[17px] text-[#070808] mb-0.5 group-hover:text-[#ff5222] transition-colors" style={{ fontWeight: 700, ...ss, ...pp }}>{cat.name}</h3>
              <p className="text-[12px] text-[#84888c] mb-3" style={pp}>{cat.sub}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#b0b3b8]" style={pp}>{cat.bettors} {t("home.categories.bettors")}</span>
                <span className="text-[11px] text-[#ff5222] group-hover:translate-x-0.5 transition-transform" style={{ fontWeight: 600, ...pp }}>{t("home.categories.betNow")}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== TRENDING MARKETS ==================== */
function TrendingMarkets() {
  const navigate = useNavigate();
  const t = useT();
  const markets = [
    { title: "PBA Philippine Cup Finals: Ginebra vs San Miguel", image: IMG.basketball, tag: "Basketball", tagColor: "#ea580c", isLive: true, slug: "pba-finals", odds: [{ label: "Ginebra", value: "1.65", color: "#ea580c" }, { label: "San Miguel", value: "2.35", color: "#2563eb" }], volume: "₱320K", bettors: "1,240" },
    { title: "Color Game Round #8832 — Anong kulay?", image: IMG.dice, tag: "Color Game", tagColor: "#dc2626", isLive: true, slug: "color-classic-1", odds: [{ label: "Pula", value: "x6", color: "#dc2626" }, { label: "Asul", value: "x6", color: "#2563eb" }, { label: "Berde", value: "x6", color: "#16a34a" }], volume: "₱48K", bettors: "128" },
    { title: "Boxing: Donaire vs Martinez — WBC Bantamweight", image: IMG.boxing, tag: "Boxing", tagColor: "#b91c1c", isLive: false, slug: "boxing-donaire", odds: [{ label: "Donaire", value: "3.50", color: "#dc2626" }, { label: "Martinez", value: "1.35", color: "#2563eb" }], volume: "₱1.2M", bettors: "2,340" },
    { title: "MLBB M6: ECHO PH vs ONIC ID", image: IMG.esports, tag: "Esports", tagColor: "#6366f1", isLive: true, slug: "mlbb-m6", odds: [{ label: "ECHO", value: "1.80", color: "#dc2626" }, { label: "ONIC", value: "2.10", color: "#2563eb" }], volume: "₱1.8M", bettors: "4,500" },
    { title: "6/45 MegaLotto — May Jackpot Winner ba?", image: IMG.lottery, tag: "Lottery", tagColor: "#7c3aed", isLive: false, slug: "lotto-645", odds: [{ label: "May Winner", value: "8%", color: "#16a34a" }, { label: "Rollover", value: "92%", color: "#dc2626" }], volume: "₱890K", bettors: "2,340" },
    { title: "Bb. Pilipinas 2026 — Sino ang queen?", image: IMG.showbiz, tag: "Showbiz", tagColor: "#ec4899", isLive: false, slug: "bb-pilipinas", odds: [{ label: "Cebu", value: "0.22", color: "#ec4899" }, { label: "Manila", value: "0.18", color: "#7c3aed" }], volume: "₱560K", bettors: "2,100" },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-[#fafbfc]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <SectionLabel emoji="🔥" text={t("home.trending.label")} />
            <h2 className="text-[26px] md:text-[30px] text-[#070808] mt-3" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.trending.title")}</h2>
          </div>
          <button onClick={() => navigate("/markets")} className="border border-[#e5e7eb] text-[#070808] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:border-[#ff5222]/40 hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>
            {t("home.trending.viewAll")}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {markets.map((m, i) => (
            <div
              key={i}
              onClick={() => m.slug && navigate(`/market/${m.slug}`)}
              className="bg-white border border-[#f0f1f3] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 group"
              style={{ animation: `slide-up 0.35s ease-out ${i * 0.06}s both` }}
            >
              <div className="relative h-[120px] overflow-hidden">
                <ImageWithFallback src={m.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm shadow-sm" style={{ fontWeight: 600, color: m.tagColor, ...pp }}>{m.tag}</span>
                  {m.isLive && (
                    <span className="bg-[#ff5222] text-white text-[9px] px-2 py-0.5 rounded flex items-center gap-1" style={{ fontWeight: 700, ...pp }}>
                      <span className="size-1.5 bg-white rounded-full animate-pulse" />LIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-[#070808] leading-[1.4] mb-3 line-clamp-2" style={{ fontWeight: 600, ...ss, ...pp }}>{m.title}</p>
                <div className="flex gap-1.5 mb-3">
                  {m.odds.map((o, j) => (
                    <button key={j} className="flex-1 h-9 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer hover:opacity-80" style={{ backgroundColor: `${o.color}06`, border: `1px solid ${o.color}12` }}>
                      <span className="text-[11px]" style={{ fontWeight: 600, color: o.color, ...pp }}>{o.label}</span>
                      <span className="text-[9px]" style={{ fontWeight: 500, color: `${o.color}90`, ...pp }}>{o.value}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-[#f5f6f7]">
                  <span className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 500, ...pp }}>{m.volume} vol</span>
                  <span className="text-[10px] text-[#b0b3b8]" style={pp}>{m.bettors} bettors</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== PROMO BANNERS ==================== */
function PromoBanners() {
  const navigate = useNavigate();
  const t = useT();
  return (
    <section className="w-full py-10 md:py-12 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Game */}
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 cursor-pointer group" style={{ minHeight: 200 }} onClick={() => navigate("/category/color-game")}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff5222] via-[#ff6b35] to-[#fbbf24]" />
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-15 transition-opacity"><EmojiIcon emoji="🎲" size={90} /></div>
            <div className="relative z-10">
              <span className="text-white/70 text-[11px] bg-white/15 px-2.5 py-1 rounded-full" style={{ fontWeight: 600, ...pp }}>{t("home.promo.colorGame.tag")}</span>
              <h3 className="text-white text-[26px] md:text-[28px] mt-4 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.promo.colorGame.title")}</h3>
              <p className="text-white/70 text-[13px] mb-5 max-w-[300px] leading-[1.6]" style={pp}>{t("home.promo.colorGame.desc")}</p>
              <button className="bg-white text-[#ff5222] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:bg-white/90 transition-colors" style={{ fontWeight: 700, ...pp }}>
                {t("home.promo.colorGame.cta")}
              </button>
            </div>
          </div>

          {/* Fast Bet */}
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 cursor-pointer group" style={{ minHeight: 200 }} onClick={() => navigate("/fast-bet")}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#475569]" />
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-15 transition-opacity"><EmojiIcon emoji="⚡" size={90} /></div>
            <div className="relative z-10">
              <span className="text-amber-400/70 text-[11px] bg-amber-400/10 px-2.5 py-1 rounded-full" style={{ fontWeight: 600, ...pp }}>{t("home.promo.fastBet.tag")}</span>
              <h3 className="text-white text-[26px] md:text-[28px] mt-4 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.promo.fastBet.title")}</h3>
              <p className="text-white/50 text-[13px] mb-5 max-w-[300px] leading-[1.6]" style={pp}>{t("home.promo.fastBet.desc")}</p>
              <button className="bg-amber-400 text-[#1e293b] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:bg-amber-300 transition-colors" style={{ fontWeight: 700, ...pp }}>
                {t("home.promo.fastBet.cta")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== HOW IT WORKS ==================== */
function HowItWorks() {
  const t = useT();
  const steps = [
    { step: "1", emoji: "📱", title: t("home.howItWorks.step1.title"), desc: t("home.howItWorks.step1.desc"), color: "#ff5222" },
    { step: "2", emoji: "💰", title: t("home.howItWorks.step2.title"), desc: t("home.howItWorks.step2.desc"), color: "#00bf85" },
    { step: "3", emoji: "🏆", title: t("home.howItWorks.step3.title"), desc: t("home.howItWorks.step3.desc"), color: "#eab308" },
  ];

  return (
    <section className="w-full py-14 md:py-20 bg-[#fafbfc]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <SectionLabel emoji="📖" text={t("home.howItWorks.label")} />
          <h2 className="text-[26px] md:text-[32px] text-[#070808] mt-3 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.howItWorks.title")}</h2>
          <p className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>{t("home.howItWorks.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="bg-white border border-[#f0f1f3] rounded-2xl p-8 text-center hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all relative" style={{ animation: `slide-up 0.35s ease-out ${i * 0.08}s both` }}>
              {/* Step connector line (desktop only) */}
              {i < 2 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-[#e5e7eb]" />}
              <div className="mb-5 flex justify-center"><EmojiIcon emoji={s.emoji} size={44} /></div>
              <div className="inline-flex items-center justify-center size-8 rounded-full mb-3" style={{ background: `${s.color}10` }}>
                <span className="text-[14px]" style={{ fontWeight: 800, color: s.color, ...pp }}>{s.step}</span>
              </div>
              <h3 className="text-[17px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss, ...pp }}>{s.title}</h3>
              <p className="text-[13px] text-[#84888c] leading-[1.6]" style={{ ...ss, ...pp }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== TRUST SECTION ==================== */
function TrustSection() {
  const t = useT();
  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 bg-[#fafbfc] rounded-2xl border border-[#f0f1f3] px-5 md:px-8 py-6">
          {[
            { emoji: "🛡️", label: t("home.trust.pagcor"), sub: t("home.trust.pagcorSub") },
            { emoji: "💳", label: t("home.trust.gcash"), sub: t("home.trust.gcashSub") },
            { emoji: "⚡", label: t("home.trust.payout"), sub: t("home.trust.payoutSub") },
            { emoji: "🇵🇭", label: t("home.trust.support"), sub: t("home.trust.supportSub") },
            { emoji: "🔒", label: t("home.trust.security"), sub: t("home.trust.securitySub") },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <EmojiIcon emoji={item.emoji} size={26} />
              <div>
                <p className="text-[12px] md:text-[13px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>{item.label}</p>
                <p className="text-[10px] md:text-[11px] text-[#b0b3b8]" style={pp}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== CREATOR SECTION ==================== */
function CreatorSection() {
  const navigate = useNavigate();
  const t = useT();
  return (
    <section className="w-full py-14 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 md:gap-14 items-center">
        <div className="flex-1 flex flex-col gap-4">
          <SectionLabel emoji="💡" text={t("home.creator.label")} />
          <h2 className="text-[28px] md:text-[36px] text-[#070808] leading-[1.12]" style={{ fontWeight: 800, ...ss, ...pp }}>
            {t("home.creator.title1")}{" "}
            <span className="text-[#ff5222]">{t("home.creator.title2")}</span>
          </h2>
          <p className="text-[14px] text-[#555] leading-[1.7] max-w-[460px]" style={{ ...ss, ...pp }} dangerouslySetInnerHTML={{ __html: t("home.creator.desc") }} />
          <div className="flex gap-3 mt-3">
            <button onClick={() => navigate("/creator")} className="bg-[#ff5222] text-white text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 700, ...ss, ...pp }}>
              {t("home.creator.cta")}
            </button>
            <button onClick={() => navigate("/creator")} className="border border-[#e5e7eb] text-[#070808] text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:border-[#ff5222]/30 transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>
              {t("home.creator.learnMore")}
            </button>
          </div>
        </div>
        <div className="flex-1 h-[200px] md:h-[260px] relative hidden md:flex items-center justify-center">
          <div className="relative">
            <img src={imgImage83} alt="" className="w-[200px] h-[200px] object-cover pointer-events-none" />
            <div className="absolute -bottom-2 -right-6">
              <div className="size-[110px] -scale-y-100 rotate-180">
                <img src={imgImageRemovebgPreview2} alt="" className="size-full object-cover mix-blend-exclusion pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== REWARDS SECTION ==================== */
function RewardsSection() {
  const navigate = useNavigate();
  const t = useT();
  const rewards = [
    { Icon: TTGiftIcon, title: t("home.rewards.signUpBonus"), amount: "₱300", status: t("home.rewards.claimed"), statusColor: "#00bf85", statusBg: "#e6fff3" },
    { Icon: BasketballIcon, title: t("home.rewards.firstPBABet"), amount: "₱200", status: t("home.rewards.betNow"), statusColor: "#ff5222", statusBg: "#fff4ed" },
    { Icon: DiceIcon, title: t("home.rewards.colorStreak"), amount: "₱150", status: t("home.rewards.betNow"), statusColor: "#ff5222", statusBg: "#fff4ed" },
    { Icon: BoxingIcon, title: t("home.rewards.boxingBets"), amount: "₱250", status: t("home.rewards.new"), statusColor: "#3b82f6", statusBg: "#eff6ff" },
  ];

  return (
    <section className="w-full py-14 md:py-20 bg-[#fafbfc]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-14 items-center">
          {/* Reward cards */}
          <div className="flex-1 w-full">
            <div className="flex flex-col gap-3 max-w-[480px]">
              {rewards.map((r, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#f0f1f3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow" style={{ animation: `slide-right 0.35s ease-out ${i * 0.08}s both` }}>
                  <div className="size-10 rounded-lg bg-[#fafbfc] border border-[#f0f1f3] flex items-center justify-center shrink-0">
                    <r.Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#070808] block" style={{ fontWeight: 600, ...ss, ...pp }}>{r.title}</span>
                    <span className="text-[11px] text-[#ff5222]" style={{ fontWeight: 600, ...pp }}>{r.amount}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full shrink-0" style={{ background: r.statusBg, color: r.statusColor, fontWeight: 600, ...pp }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex-1 flex flex-col gap-4">
            <SectionLabel emoji="🎁" text={t("home.rewards.label")} />
            <h2 className="text-[28px] md:text-[36px] text-[#070808] leading-[1.12]" style={{ fontWeight: 800, ...ss, ...pp }}>
              {t("home.rewards.title1")}{" "}
              <span className="text-[#ff5222]">{t("home.rewards.title2")}</span>
            </h2>
            <p className="text-[14px] text-[#555] leading-[1.7] max-w-[460px]" style={{ ...ss, ...pp }} dangerouslySetInnerHTML={{ __html: t("home.rewards.desc") }} />
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => navigate("/rewards")} className="bg-[#ff5222] text-white text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 700, ...ss, ...pp }}>
                {t("home.rewards.cta")}
              </button>
              <span className="text-[11px] text-[#b0b3b8] border border-[#e5e7eb] rounded-lg px-3 py-2 hidden sm:flex items-center gap-1.5" style={{ fontWeight: 500, ...pp }}>
                PHP Only — GCash & Maya
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== TESTIMONIALS ==================== */
function Testimonials() {
  const t = useT();
  const testimonials = [
    { name: "Maria Santos", handle: "@maria_s", text: t("home.testimonial1"), avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱45,000" },
    { name: "JM Reyes", handle: "@jm_reyes21", text: t("home.testimonial2"), avatar: "https://images.unsplash.com/photo-1718006915613-bcb972cabdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱12,500" },
    { name: "Ate Lyn", handle: "@lyn_bettor", text: t("home.testimonial3"), avatar: "https://images.unsplash.com/photo-1603954698693-b0bcbceb5ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱78,000" },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <SectionLabel emoji="💬" text={t("home.testimonials.label")} />
          <h2 className="text-[26px] md:text-[30px] text-[#070808] mt-3" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.testimonials.title")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-white border border-[#f0f1f3] rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow" style={{ animation: `slide-up 0.35s ease-out ${i * 0.08}s both` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full overflow-hidden ring-2 ring-[#ff5222]/8">
                  <ImageWithFallback src={item.avatar} alt="" className="size-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>{item.name}</span>
                  <span className="text-[11px] text-[#b0b3b8]" style={ss}>{item.handle}</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full shrink-0" style={{ fontWeight: 600, ...pp }}>{t("home.testimonials.won")} {item.won}</span>
              </div>
              <p className="text-[13px] text-[#555] leading-[1.6] mb-3" style={{ ...ss, ...pp }}>{item.text}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-[13px]">⭐</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== FAQ ==================== */
function FAQSection() {
  const t = useT();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqLocalized = [
    { q: t("home.faq.q1"), a: t("home.faq.a1") },
    { q: t("home.faq.q2"), a: t("home.faq.a2") },
    { q: t("home.faq.q3"), a: t("home.faq.a3") },
    { q: t("home.faq.q4"), a: t("home.faq.a4") },
    { q: t("home.faq.q5"), a: t("home.faq.a5") },
  ];
  return (
    <section className="w-full py-14 md:py-20 bg-[#fafbfc]">
      <div className="max-w-[760px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <SectionLabel emoji="❓" text="FAQ" />
          <h2 className="text-[26px] md:text-[30px] text-[#070808] mt-3" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.faq.title")}</h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#f0f1f3] overflow-hidden">
          {faqLocalized.map((item, i) => (
            <div key={i} className={i < faqLocalized.length - 1 ? "border-b border-[#f5f6f7]" : ""}>
              <button className="flex items-center justify-between py-4 px-5 w-full cursor-pointer group hover:bg-[#fafbfc] transition-colors" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span className="text-[14px] text-[#333] text-left group-hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>{item.q}</span>
                <div className={`size-5 shrink-0 ml-4 transition-transform flex items-center justify-center rounded-full ${openIdx === i ? "rotate-180 bg-[#ff5222]/8" : "bg-[#f5f6f7]"}`}>
                  <svg className="size-3" fill="none" viewBox="0 0 12 8"><path d="M1 1.5L6 6.5L11 1.5" stroke={openIdx === i ? "#ff5222" : "#b0b3b8"} strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-4">
                  <p className="text-[13px] text-[#84888c] leading-[1.7]" style={{ ...ss, ...pp }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== FINAL CTA ==================== */
function FinalCTA() {
  const navigate = useNavigate();
  const t = useT();
  return (
    <section className="w-full py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff5222] via-[#ff6b35] to-[#ff8c42]" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="max-w-[700px] mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="mb-5" style={{ animation: "bounce-in 0.5s ease-out" }}><EmojiIcon emoji="🎲" size={52} /></div>
        <h2 className="text-white text-[30px] md:text-[40px] mb-4 leading-[1.1]" style={{ fontWeight: 800, ...ss, ...pp }}>{t("home.finalCta.title")}</h2>
        <p className="text-white/75 text-[15px] md:text-[16px] mb-8 max-w-[480px] mx-auto leading-[1.6]" style={{ ...ss, ...pp }}>
          {t("home.finalCta.desc")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => navigate("/signup")} className="bg-white text-[#ff5222] text-[15px] h-12 px-8 rounded-xl cursor-pointer hover:bg-white/95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.12)]" style={{ fontWeight: 700, ...ss, ...pp }}>
            {t("home.finalCta.cta")}
          </button>
          <button onClick={() => navigate("/fast-bet")} className="border-2 border-white/25 text-white text-[15px] h-12 px-8 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>
            {t("nav.fastBet")}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==================== HOME PAGE ==================== */
export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const openDeposit = () => setModalOpen(true);

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  return (
    <div className="bg-white flex flex-col min-h-screen w-full pb-16 md:pb-0" style={pp}>
      <style>{keyframes}</style>
      <HomeHeader onDeposit={openDeposit} />
      <HeroSection />
      <LiveTicker />
      <GameCategories />
      <TrendingMarkets />
      <PromoBanners />
      <HowItWorks />
      <TrustSection />
      <CreatorSection />
      <RewardsSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode="deposit" theme={modalTheme} balance={5000} />
    </div>
  );
}
