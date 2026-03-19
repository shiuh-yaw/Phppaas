import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-nlqz6xnxi5";
import { useAuth } from "../components/auth-context";
import imgFrame2087325367 from "figma:asset/aa22ee141c47adc40b93dee89db917612452e751.png";
import imgImageRemovebgPreview2 from "figma:asset/fb86db7f372adc95f0fa8dc7e325d0f9df0f0aae.png";
import imgImage83 from "figma:asset/dee6f729e475d64d963a4837560306f0452751ae.png";
import imgImage29 from "figma:asset/25dbcb8ad8ded9235624ea97ee8e5cbb11aaaca7.png";
import imgImage28 from "figma:asset/a559a779c1a92ac0e37facf8108ceebd1b453f82.png";
import imgImage26 from "figma:asset/0ddc9c7edd7206a36d599985612e3900ae176445.png";
import imgImage27 from "figma:asset/d4c843aed426073dacb7759d859c3402750eec89.png";
import imgImage25 from "figma:asset/44dfb0552c824795764dfbb799c442fc9a7e36c9.png";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  BasketballIcon, DiceIcon, BoxingIcon, EsportsIcon, BingoIcon,
  LotteryIcon, ShowbizIcon, WeatherIcon, EconomyIcon,
  ChartIcon as TTChartIcon, MoneyIcon as TTMoneyIcon, LightningIcon as TTLightningIcon,
  GiftIcon as TTGiftIcon, TrophyIcon as TTTrophyIcon, StarIcon as TTStarIcon,
  EmojiIcon,
} from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== KEYFRAMES ==================== */
const keyframes = `
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes float-slow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
@keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(255,82,34,0.15)} 50%{box-shadow:0 0 40px rgba(255,82,34,0.3)} }
@keyframes shine { 0%{left:-100%} 100%{left:200%} }
@keyframes jackpot-count { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
@keyframes slide-up { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes slide-right { 0%{opacity:0;transform:translateX(-20px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes coin-spin { 0%{transform:rotateY(0)} 100%{transform:rotateY(360deg)} }
@keyframes dice-roll { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(8deg)} 75%{transform:rotate(-8deg)} }
@keyframes ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes border-glow { 0%,100%{border-color:rgba(255,82,34,0.15)} 50%{border-color:rgba(255,82,34,0.4)} }
@keyframes winner-pop { 0%{opacity:0;transform:scale(0.8) translateY(10px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes rainbow-bg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes sparkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes bounce-in { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.05)} 70%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
`;

/* ==================== IMAGES ==================== */
const IMG = {
  basketball: "https://images.unsplash.com/photo-1640862101983-9f7ef7fd7cc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  carnival: "https://images.unsplash.com/photo-1596687909057-dfac2b25b891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing: "https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  esports: "https://images.unsplash.com/photo-1772587003187-65b32c91df91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  bingo: "https://images.unsplash.com/photo-1651359729278-7fadd8d93152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  lottery: "https://images.unsplash.com/photo-1725378048950-1f0080427781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  showbiz: "https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  weather: "https://images.unsplash.com/photo-1642989739927-f099ad27701a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  economy: "https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  casino: "https://images.unsplash.com/photo-1645690364326-1f80098eca66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  fireworks: "https://images.unsplash.com/photo-1703967971360-6e126f1c2a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  cards: "https://images.unsplash.com/photo-1601162937667-08f083516d57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  trophy: "https://images.unsplash.com/photo-1764408721535-2dcb912db83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
};

/* ==================== HEADER ==================== */
function HomeHeader() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md w-full h-14 md:h-16 sticky top-0 z-50 border-b border-[#f0f1f3]" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
        <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 cursor-pointer">
              <div className="w-[93px] h-6 relative">
                <div className="absolute bg-[#ff5222] h-6 left-0 top-0 w-[93px]" style={{ maskImage: `url('${imgFrame2087325367}')`, maskSize: '93px 24px', maskRepeat: 'no-repeat' }} />
              </div>
            </button>
            <nav className="hidden md:flex items-center gap-5" style={pp}>
              <button onClick={() => navigate("/markets")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss }}>Markets</button>
              <button onClick={() => navigate("/fast-bet")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors flex items-center gap-1" style={{ fontWeight: 500, ...ss }}>Fast Bet <span className="text-[9px] bg-[#ff5222] text-white px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>HOT</span></button>
              <button onClick={() => navigate("/category/color-game")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss }}>Color Game</button>
              <button onClick={() => navigate("/portfolio")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss }}>Portfolio</button>
              <button onClick={() => navigate("/rewards")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss }}>Rewards</button>
              <button onClick={() => navigate("/leaderboard")} className="text-[13px] text-[#070808]/70 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss }}>Leaderboard</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#b0b3b8] border border-[#e5e7eb] rounded px-2 py-0.5 hidden lg:block" style={{ fontWeight: 500, ...pp }}>PAGCOR Licensed</span>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#84888c]" style={{ fontWeight: 500, ...ss }}>₱{user?.balance?.toLocaleString() ?? "0"}</span>
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
                          { label: "Portfolio Ko", Icon: TTChartIcon, route: "/portfolio" },
                          { label: "Mga Rewards", Icon: TTGiftIcon, route: "/rewards" },
                          { label: "Leaderboard", Icon: TTTrophyIcon, route: "/leaderboard" },
                          { label: "Creator Center", Icon: TTStarIcon, route: "/creator" },
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
                          <span className="text-[12px] text-[#dc2626]" style={{ fontWeight: 500, ...ss }}>Mag-logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/login")} className="text-[13px] text-[#070808] h-9 px-4 cursor-pointer hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Mag-login</button>
                <button onClick={() => navigate("/signup")} className="bg-[#ff5222] text-white text-[13px] h-9 px-5 rounded-lg cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>Mag-signup</button>
              </div>
            )}
            <div className="size-5 cursor-pointer">
              <svg className="size-full" fill="none" viewBox="0 0 24 24"><path d={svgPaths.p206aed00} fill="#070808" /></svg>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

/* ==================== HERO - CASINO INSPIRED ==================== */
function HeroSection() {
  const navigate = useNavigate();
  const [jackpot, setJackpot] = useState(12847350);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 500) + 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Modern neon portrait background */}
      <div className="absolute inset-0">
        <ImageWithFallback src="https://images.unsplash.com/photo-1765816839382-1cc1486398d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600" alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.91) 30%, rgba(255,255,255,0.80) 55%, rgba(255,248,245,0.68) 100%)" }} />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute opacity-[0.06] top-[10%] right-[8%] hidden md:block" style={{ animation: "float 4s ease-in-out infinite" }}><EmojiIcon emoji="🎲" size={50} /></span>
        <span className="absolute opacity-[0.05] top-[55%] right-[12%] hidden lg:block" style={{ animation: "float-slow 5s ease-in-out infinite 0.5s" }}><EmojiIcon emoji="🏀" size={40} /></span>
        <span className="absolute opacity-[0.05] bottom-[10%] right-[5%] hidden md:block" style={{ animation: "float 6s ease-in-out infinite 1s" }}><EmojiIcon emoji="💰" size={45} /></span>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,82,34,0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-14 pb-8 md:pb-10">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left content */}
          <div className="flex-1 w-full lg:max-w-[640px]" style={{ animation: "slide-up 0.6s ease-out" }}>
            {/* Top badges */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="bg-gradient-to-r from-[#ff5222] to-[#ff7b4f] text-white text-[11px] px-3 py-1.5 rounded-full shadow-[0_2px_12px_rgba(255,82,34,0.3)]" style={{ fontWeight: 700, ...pp }}>
                <span className="inline-flex items-center gap-1"><EmojiIcon emoji="🇵🇭" size={12} /> #1 sa Pilipinas</span>
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 text-[11px] px-2.5 py-1.5 rounded-full flex items-center gap-1.5" style={{ fontWeight: 600, ...pp }}>
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                12,847 Online Ngayon
              </span>
              <span className="bg-amber-500/10 text-amber-600 text-[11px] px-2.5 py-1.5 rounded-full" style={{ fontWeight: 600, ...pp }}>
                <span className="inline-flex items-center gap-1"><EmojiIcon emoji="⚡" size={12} /> Instant Payout</span>
              </span>
            </div>

            <h1 className="text-[#070808] leading-[1.1] mb-4 md:mb-5" style={{ fontWeight: 800, fontSize: "clamp(32px, 5vw, 52px)", ...ss, ...pp }}>
              Swerte Mo Na,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#ff5222] via-[#ff6b35] to-[#ff8c42] bg-clip-text text-transparent">Taya Na!</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M0 6C50 0 150 0 200 6" stroke="#ff5222" strokeWidth="3" strokeLinecap="round" opacity="0.3" /></svg>
              </span>
            </h1>

            <p className="text-[16px] text-[#555] leading-[1.7] mb-6 max-w-[520px]" style={{ ...ss, ...pp }}>
              Basketball, Color Game, Boxing, Esports — <span className="text-[#070808]" style={{ fontWeight: 600 }}>2,800+ markets</span> na patok sa Pinoy! Deposit via <span className="text-[#007dfe]" style={{ fontWeight: 600 }}>GCash</span> o <span className="text-[#00b274]" style={{ fontWeight: 600 }}>Maya</span>, tumaya sa <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>₱PHP</span>, at manalo agad.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate("/markets")}
                className="relative overflow-hidden bg-gradient-to-r from-[#ff5222] to-[#ff6b35] text-white h-13 px-8 rounded-xl cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(255,82,34,0.4)] hover:scale-[1.02]"
                style={{ fontWeight: 700, fontSize: 15, ...ss, ...pp }}
              >
                <span className="relative z-10 flex items-center gap-2"><EmojiIcon emoji="🎲" size={16} /> Magsimula Na — LIBRE!</span>
                <div className="absolute inset-0 overflow-hidden"><div className="absolute h-full w-[60px] bg-white/20 -skew-x-12" style={{ animation: "shine 3s ease-in-out infinite", top: 0 }} /></div>
              </button>
              <button
                onClick={() => navigate("/fast-bet")}
                className="border-2 border-[#ff5222]/20 text-[#ff5222] h-13 px-6 rounded-xl cursor-pointer hover:bg-[#ff5222]/5 hover:border-[#ff5222]/40 transition-all"
                style={{ fontWeight: 600, fontSize: 14, ...ss, ...pp }}
              >
                <span className="inline-flex items-center gap-1.5"><EmojiIcon emoji="⚡" size={14} /> Fast Bet</span>
              </button>
            </div>

            {/* Sign up bonus */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl px-4 py-3 flex items-center gap-3 mb-6" style={{ animation: "border-glow 3s ease-in-out infinite" }}>
              <span style={{ animation: "dice-roll 2s ease-in-out infinite" }}><EmojiIcon emoji="🎁" size={28} /></span>
              <div>
                <span className="text-[13px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>Welcome Bonus: <span className="text-[#ff5222]">₱600 FREE</span></span>
                <p className="text-[11px] text-[#84888c]" style={pp}>Mag-sign up ngayon — agad-agad na trial funds! Walang deposit needed.</p>
              </div>
              <button onClick={() => navigate("/markets")} className="bg-[#ff5222] text-white text-[11px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer hover:bg-[#e84a1e] transition-colors" style={{ fontWeight: 600, ...pp }}>Kunin Na</button>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...pp }}>Deposit via:</span>
              <span className="bg-[#007dfe] text-white text-[11px] px-3 py-1 rounded-md shadow-sm" style={{ fontWeight: 700, ...pp }}>GCash</span>
              <span className="bg-[#00b274] text-white text-[11px] px-3 py-1 rounded-md shadow-sm" style={{ fontWeight: 700, ...pp }}>Maya</span>
              <span className="bg-[#1a1a2e] text-white text-[11px] px-3 py-1 rounded-md shadow-sm" style={{ fontWeight: 700, ...pp }}>Bank</span>
              <span className="text-[10px] text-[#b0b3b8] border border-[#e5e7eb] px-2 py-0.5 rounded" style={{ fontWeight: 500, ...pp }}>PayMongo</span>
            </div>
          </div>

          {/* Right side - Jackpot + Game preview */}
          <div className="flex-1 w-full flex flex-col gap-4 lg:max-w-[480px]" style={{ animation: "slide-up 0.6s ease-out 0.2s both" }}>
            {/* Jackpot counter */}
            <div className="bg-white rounded-2xl border border-[#f0f1f3] p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ animation: "coin-spin 3s linear infinite" }}><EmojiIcon emoji="🪙" size={22} /></span>
                <span className="text-[12px] text-[#84888c]" style={{ fontWeight: 600, ...pp }}>TOTAL JACKPOT POOL</span>
                <span className="size-2 bg-[#ff5222] rounded-full animate-pulse ml-auto" />
              </div>
              <div className="text-center py-3" style={{ animation: "jackpot-count 2s ease-in-out infinite" }}>
                <span className="text-[38px] bg-gradient-to-r from-[#ff5222] via-[#ff6b35] to-[#d97706] bg-clip-text text-transparent" style={{ fontWeight: 800, ...pp, letterSpacing: "0.5px" }}>
                  ₱{jackpot.toLocaleString("en-PH")}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#f5f6f7]">
                <span className="text-[11px] text-[#84888c] inline-flex items-center gap-1" style={pp}><EmojiIcon emoji="🏆" size={12} /> 485K+ Pinoy bettors</span>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600, ...pp }}>+₱{(Math.floor(Math.random() * 900) + 100).toLocaleString()} just now</span>
              </div>
            </div>

            {/* Live winners feed */}
            <div className="bg-white rounded-2xl border border-[#f0f1f3] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="size-2 bg-[#ff5222] rounded-full animate-pulse" />
                <span className="text-[11px] text-[#ff5222]" style={{ fontWeight: 700, ...pp }}>LIVE WINNERS</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Maria S.", game: "Color Game", amount: "₱12,500", time: "2s ago", emoji: "🎲" },
                  { name: "JM Reyes", game: "PBA Finals", amount: "₱8,200", time: "15s ago", emoji: "🏀" },
                  { name: "Ate Lyn", game: "Fast Bet", amount: "₱3,450", time: "32s ago", emoji: "⚡" },
                  { name: "BossKen", game: "Boxing", amount: "₱25,000", time: "1m ago", emoji: "🥊" },
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#fafbfc] hover:bg-[#f5f6f7] transition-colors" style={{ animation: `winner-pop 0.4s ease-out ${i * 0.1}s both` }}>
                    <EmojiIcon emoji={w.emoji} size={20} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{w.name}</span>
                      <span className="text-[10px] text-[#b0b3b8] ml-1.5" style={ss}>{w.game}</span>
                    </div>
                    <span className="text-[12px] text-emerald-600" style={{ fontWeight: 700, ...pp }}>+{w.amount}</span>
                    <span className="text-[9px] text-[#d1d5db]" style={pp}>{w.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-6 md:mt-8">
          {[
            { Icon: TTChartIcon, label: "Active Markets", value: "2,847" },
            { Icon: TTMoneyIcon, label: "Total Wagered", value: "₱1.2B" },
            { Icon: TTStarIcon, label: "Pinoy Bettors", value: "485K+" },
            { Icon: TTLightningIcon, label: "Avg Payout", value: "< 5 min" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#f0f1f3] rounded-xl flex items-center gap-3 px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow" style={{ animation: `slide-up 0.4s ease-out ${0.3 + i * 0.1}s both` }}>
              <s.Icon size={28} />
              <div>
                <span className="text-[20px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>{s.value}</span>
                <p className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...pp }}>{s.label}</p>
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
    { label: "Maria S. nanalo ng ₱12,500 sa Color Game!", badge: "WIN", color: "#00bf85" },
    { label: "Boxing: Donaire vs Inoue III — WBC Main Event", badge: "UPCOMING", color: "#3b82f6" },
    { label: "JM Reyes kumita ng ₱8,200 sa PBA bet!", badge: "WIN", color: "#00bf85" },
    { label: "MLBB: Blacklist vs ONIC PH", badge: "LIVE", color: "#ff5222" },
    { label: "Color Game Round #8832 — Rolling!", badge: "ROLLING", color: "#eab308" },
    { label: "BossKen nanalo ng ₱25,000 sa Boxing!", badge: "WIN", color: "#00bf85" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="bg-white border-y border-[#f0f1f3] overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#ff5222] z-10">
          <span className="size-2 bg-white rounded-full animate-pulse" />
          <span className="text-[11px] text-white" style={{ fontWeight: 700, ...pp }}>LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-8 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
            {doubled.map((item, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ fontWeight: 700, backgroundColor: `${item.color}15`, color: item.color, ...pp }}>{item.badge}</span>
                <span className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...pp }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== GAME CATEGORIES - CASINO GRID ==================== */
function GameCategories() {
  const navigate = useNavigate();
  const categories = [
    { Icon: BasketballIcon, name: "Basketball", sub: "PBA, NBA, UAAP", route: "/category/basketball", color: "#ea580c", gradient: "from-orange-50 to-amber-50", border: "border-orange-200/40", hot: true, bettors: "8.2K", live: 5 },
    { Icon: DiceIcon, name: "Color Game", sub: "Perya classic na digital!", route: "/category/color-game", color: "#dc2626", gradient: "from-red-50 to-pink-50", border: "border-red-200/40", hot: true, bettors: "6.1K", live: 8 },
    { Icon: BoxingIcon, name: "Boxing", sub: "Donaire, Pacquiao legacy", route: "/category/boxing", color: "#b91c1c", gradient: "from-red-50 to-orange-50", border: "border-red-200/40", hot: true, bettors: "3.9K", live: 2 },
    { Icon: EsportsIcon, name: "Esports", sub: "MLBB, Valorant, Dota 2", route: "/category/esports", color: "#6366f1", gradient: "from-indigo-50 to-violet-50", border: "border-indigo-200/40", hot: false, bettors: "5.7K", live: 6 },
    { Icon: BingoIcon, name: "Bingo", sub: "Classic bingo, digital!", route: "/category/bingo", color: "#0891b2", gradient: "from-cyan-50 to-sky-50", border: "border-cyan-200/40", hot: false, bettors: "2.9K", live: 4 },
    { Icon: LotteryIcon, name: "Lottery", sub: "6/45, 6/49, 6/58 predictions", route: "/category/lottery", color: "#7c3aed", gradient: "from-violet-50 to-purple-50", border: "border-violet-200/40", hot: false, bettors: "4.2K", live: 3 },
    { Icon: ShowbizIcon, name: "Showbiz", sub: "Celebrity predictions", route: "/category/showbiz", color: "#ec4899", gradient: "from-pink-50 to-fuchsia-50", border: "border-pink-200/40", hot: false, bettors: "3.5K", live: 4 },
    { Icon: WeatherIcon, name: "Weather", sub: "Typhoon, temp forecasts", route: "/category/weather", color: "#0284c7", gradient: "from-sky-50 to-blue-50", border: "border-sky-200/40", hot: false, bettors: "1.9K", live: 3 },
    { Icon: EconomyIcon, name: "Economy", sub: "PSEi, USD/PHP, inflation", route: "/category/economy", color: "#059669", gradient: "from-emerald-50 to-teal-50", border: "border-emerald-200/40", hot: false, bettors: "2.1K", live: 4 },
  ];

  return (
    <section className="w-full py-10 md:py-16 bg-[#f7f8fa]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...pp }}><EmojiIcon emoji="🎮" size={12} /> MGA LARO</span>
          <h2 className="text-[24px] md:text-[32px] text-[#070808] mt-3 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>Pumili ng Paborito Mong Game</h2>
          <p className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>9 na categories — lahat patok sa Pinoy!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <button
              key={cat.route}
              onClick={() => navigate(cat.route)}
              className={`bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl p-5 text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group`}
              style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s both` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span style={{ animation: i < 3 ? "float 3s ease-in-out infinite" : undefined }}><cat.Icon size={40} /></span>
                <div className="flex items-center gap-1.5">
                  {cat.hot && <span className="text-[8px] bg-[#ff5222] text-white px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5" style={{ fontWeight: 700 }}><EmojiIcon emoji="🔥" size={9} /> HOT</span>}
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${cat.color}10`, color: cat.color, fontWeight: 600, ...pp }}>
                    <span className="size-1.5 rounded-full animate-pulse" style={{ background: cat.color }} />{cat.live} Live
                  </span>
                </div>
              </div>
              <h3 className="text-[18px] text-[#070808] mb-0.5 group-hover:text-[#ff5222] transition-colors" style={{ fontWeight: 700, ...ss, ...pp }}>{cat.name}</h3>
              <p className="text-[12px] text-[#84888c] mb-3" style={pp}>{cat.sub}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#b0b3b8] inline-flex items-center gap-1" style={pp}><EmojiIcon emoji="👥" size={12} /> {cat.bettors} bettors</span>
                <span className="text-[11px] text-[#ff5222] group-hover:translate-x-1 transition-transform" style={{ fontWeight: 600, ...pp }}>Tumaya →</span>
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
  const markets = [
    { title: "PBA Philippine Cup Finals: Ginebra vs San Miguel", image: IMG.basketball, tagEmoji: "🏀", tag: "Basketball", tagColor: "#ea580c", isLive: true, slug: "pba-finals", odds: [{ label: "Ginebra", value: "1.65", color: "#ea580c" }, { label: "San Miguel", value: "2.35", color: "#2563eb" }], volume: "₱320K", bettors: "1,240", endTime: "Q3 4:23" },
    { title: "Color Game Round #8832 — Anong kulay ang lalabas?", image: IMG.carnival, tagEmoji: "🎲", tag: "Color Game", tagColor: "#dc2626", isLive: true, slug: "color-classic-1", odds: [{ label: "Pula", value: "x6", color: "#dc2626" }, { label: "Asul", value: "x6", color: "#2563eb" }, { label: "Berde", value: "x6", color: "#16a34a" }], volume: "₱48.2K", bettors: "128", endTime: "0:42" },
    { title: "Boxing: Donaire vs Martinez — WBC Bantamweight", image: IMG.boxing, tagEmoji: "🥊", tag: "Boxing", tagColor: "#b91c1c", isLive: false, slug: "boxing-donaire", odds: [{ label: "Donaire", value: "3.50", color: "#dc2626" }, { label: "Martinez", value: "1.35", color: "#2563eb" }], volume: "₱1.2M", bettors: "2,340", endTime: "Apr 5" },
    { title: "MLBB M6 World Championship — ECHO PH vs ONIC ID", image: IMG.esports, tagEmoji: "🎮", tag: "Esports", tagColor: "#6366f1", isLive: true, slug: "mlbb-m6", odds: [{ label: "ECHO", value: "1.80", color: "#dc2626" }, { label: "ONIC", value: "2.10", color: "#2563eb" }], volume: "₱1.8M", bettors: "4,500", endTime: "LIVE" },
    { title: "6/45 MegaLotto — May Jackpot Winner ba?", image: IMG.lottery, tagEmoji: "🎰", tag: "Lottery", tagColor: "#7c3aed", isLive: false, slug: "lotto-645", odds: [{ label: "May Winner", value: "8%", color: "#16a34a" }, { label: "Rollover", value: "92%", color: "#dc2626" }], volume: "₱890K", bettors: "2,340", endTime: "Mon 9PM" },
    { title: "Bb. Pilipinas 2026 — Sino ang susunod na queen?", image: IMG.showbiz, tagEmoji: "⭐", tag: "Showbiz", tagColor: "#ec4899", isLive: false, slug: "bb-pilipinas", odds: [{ label: "Cebu", value: "0.22", color: "#ec4899" }, { label: "Manila", value: "0.18", color: "#7c3aed" }, { label: "Iba pa", value: "0.60", color: "#84888c" }], volume: "₱560K", bettors: "2,100", endTime: "Jul 2026" },
  ];

  return (
    <section className="w-full py-10 md:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...pp }}><EmojiIcon emoji="🔥" size={12} /> TRENDING NOW</span>
            </div>
            <h2 className="text-[28px] text-[#070808]" style={{ fontWeight: 800, ...ss, ...pp }}>Pinakapatok na Markets</h2>
          </div>
          <button onClick={() => navigate("/markets")} className="border border-[#e5e7eb] text-[#070808] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:border-[#ff5222]/40 hover:text-[#ff5222] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>
            Lahat ng Markets →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {markets.map((m, i) => (
            <div
              key={i}
              onClick={() => m.slug && navigate(`/market/${m.slug}`)}
              className="bg-white border border-[#f0f1f3] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 group shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s both` }}
            >
              <div className="relative h-[130px] overflow-hidden">
                <ImageWithFallback src={m.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm shadow-sm inline-flex items-center gap-1" style={{ fontWeight: 600, color: m.tagColor, ...pp }}><EmojiIcon emoji={m.tagEmoji} size={11} /> {m.tag}</span>
                  {m.isLive && (
                    <span className="bg-[#ff5222] text-white text-[9px] px-2 py-0.5 rounded flex items-center gap-1 shadow-sm" style={{ fontWeight: 700, ...pp }}>
                      <span className="size-1.5 bg-white rounded-full animate-pulse" />LIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3.5">
                <p className="text-[13px] text-[#070808] leading-[1.4] mb-3 line-clamp-2" style={{ fontWeight: 600, ...ss, ...pp }}>{m.title}</p>
                <div className="flex gap-1.5 mb-3">
                  {m.odds.map((o, j) => (
                    <button key={j} className="flex-1 h-8 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer" style={{ backgroundColor: `${o.color}08`, border: `1px solid ${o.color}15` }}>
                      <span className="text-[11px]" style={{ fontWeight: 600, color: o.color, ...pp }}>{o.label}</span>
                      <span className="text-[9px]" style={{ fontWeight: 500, color: `${o.color}80`, ...pp }}>{o.value}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#f5f6f7]">
                  <span className="text-[10px] text-[#b0b3b8] inline-flex items-center gap-0.5" style={{ fontWeight: 500, ...pp }}><EmojiIcon emoji="💰" size={10} /> {m.volume}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#b0b3b8] inline-flex items-center gap-0.5" style={pp}><EmojiIcon emoji="👥" size={10} /> {m.bettors}</span>
                    <span className="text-[10px] text-[#d1d5db]" style={pp}>{m.endTime}</span>
                  </div>
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
  return (
    <section className="w-full py-10 md:py-12 bg-[#f7f8fa]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Promo 1 - Color Game — colorful festival woman */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
            style={{ minHeight: 180 }}
            onClick={() => navigate("/category/color-game")}
          >
            <ImageWithFallback src="https://images.unsplash.com/photo-1735891969923-f2f19070061c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,82,34,0.88) 0%, rgba(255,140,66,0.8) 50%, rgba(251,191,36,0.75) 100%)" }} />
            <div className="absolute top-4 right-4 opacity-20 group-hover:scale-110 transition-transform" style={{ animation: "dice-roll 3s ease-in-out infinite" }}><EmojiIcon emoji="🎲" size={80} /></div>
            <div className="relative z-10">
              <span className="text-white/80 text-[11px] bg-white/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 600, ...pp }}><EmojiIcon emoji="🔥" size={11} /> PATOK NA PATOK</span>
              <h3 className="text-white text-[24px] mt-3 mb-1" style={{ fontWeight: 800, ...ss, ...pp }}>Color Game</h3>
              <p className="text-white/80 text-[13px] mb-4 max-w-[280px]" style={pp}>Perya classic na digital! Pumili ng kulay, mag-roll, at manalo agad. 30-second rounds!</p>
              <button className="bg-white text-[#ff5222] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:bg-white/90 transition-colors" style={{ fontWeight: 700, ...pp }}>
                Maglaro Ngayon →
              </button>
            </div>
          </div>

          {/* Promo 2 - Fast Bet — focused man on phone */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
            style={{ minHeight: 180 }}
            onClick={() => navigate("/fast-bet")}
          >
            <ImageWithFallback src="https://images.unsplash.com/photo-1605420801028-0cb4447eb987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(51,65,85,0.85) 50%, rgba(71,85,105,0.8) 100%)" }} />
            <div className="absolute top-4 right-4 opacity-15 group-hover:scale-110 transition-transform" style={{ animation: "float 3s ease-in-out infinite" }}><EmojiIcon emoji="⚡" size={80} /></div>
            <div className="relative z-10">
              <span className="text-amber-400/80 text-[11px] bg-amber-400/15 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 600, ...pp }}><EmojiIcon emoji="⚡" size={11} /> MABILIS NA LARO</span>
              <h3 className="text-white text-[24px] mt-3 mb-1" style={{ fontWeight: 800, ...ss, ...pp }}>Fast Bet</h3>
              <p className="text-white/60 text-[13px] mb-4 max-w-[280px]" style={pp}>60-second rounds, instant results! Pinaka-mabilis na betting experience sa Pilipinas.</p>
              <button className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#1e293b] text-[13px] h-10 px-5 rounded-lg cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 700, ...pp }}>
                Fast Bet Ngayon →
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
  return (
    <section className="w-full py-12 md:py-20 bg-white border-y border-[#f0f1f3]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ fontWeight: 700, ...pp }}><EmojiIcon emoji="📖" size={12} /> PAANO MAGSIMULA</span>
          <h2 className="text-[24px] md:text-[32px] text-[#070808] mt-3 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>3 Steps Lang, Puwede Ka Nang Tumaya!</h2>
          <p className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>Super dali lang — kahit baguhan ka pa sa betting</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            { step: "1", icon: "📱", title: "Pumili ng Market", desc: "Basketball, Color Game, Boxing — piliin ang gusto mong market mula sa 2,800+ options. May LIVE at upcoming markets!", color: "#ff5222" },
            { step: "2", icon: "💰", title: "Tumaya sa ₱PHP", desc: "Deposit via GCash, Maya, o bank transfer. Minimum ₱20 lang — puwede nang maglaro! Instant deposit, walang fee.", color: "#00bf85" },
            { step: "3", icon: "🏆", title: "Kumita Agad!", desc: "Auto-payout within minutes! Withdraw sa GCash o Maya mo — walang hassle, walang waiting time.", color: "#eab308" },
          ].map((s, i) => (
            <div key={s.step} className="bg-white border border-[#f0f1f3] rounded-2xl p-7 text-center hover:border-[#ff5222]/20 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] shadow-[0_2px_12px_rgba(0,0,0,0.03)]" style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s both` }}>
              <div className="mb-4 flex justify-center" style={{ animation: "float-slow 4s ease-in-out infinite" }}><EmojiIcon emoji={s.icon} size={48} /></div>
              <div className="inline-flex items-center justify-center size-8 rounded-full mb-3" style={{ background: `${s.color}15` }}>
                <span className="text-[14px]" style={{ fontWeight: 800, color: s.color, ...pp }}>{s.step}</span>
              </div>
              <h3 className="text-[18px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss, ...pp }}>{s.title}</h3>
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
  return (
    <section className="w-full py-10 bg-[#f7f8fa]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white rounded-2xl border border-[#f0f1f3] px-4 md:px-8 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {[
            { icon: "🛡️", label: "PAGCOR Licensed", sub: "Fully regulated" },
            { icon: "💳", label: "GCash & Maya", sub: "Instant deposit" },
            { icon: "⚡", label: "< 5 Min Payout", sub: "Fastest sa PH" },
            { icon: "🇵🇭", label: "24/7 Support", sub: "Tagalog & English" },
            { icon: "🔒", label: "Bank-Grade Security", sub: "256-bit encrypted" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <EmojiIcon emoji={item.icon} size={28} />
              <div>
                <p className="text-[13px] text-[#070808]" style={{ fontWeight: 700, ...pp }}>{item.label}</p>
                <p className="text-[11px] text-[#b0b3b8]" style={pp}>{item.sub}</p>
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
  return (
    <section className="w-full py-12 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full w-fit" style={{ fontWeight: 700, ...pp }}>💡 CREATOR PROGRAM</span>
          <h2 className="text-[28px] md:text-[36px] text-[#070808] leading-[1.15]" style={{ fontWeight: 800, ...ss, ...pp }}>
            Maging Market Creator,{" "}
            <span className="text-[#ff5222]">Kumita ng Passive Income!</span>
          </h2>
          <p className="text-[14px] text-[#555] leading-[1.7] max-w-[480px]" style={{ ...ss, ...pp }}>
            Content creator ka ba, community leader, o influencer? Gumawa ng sarili mong prediction markets at kumita ng <span className="text-[#070808]" style={{ fontWeight: 600 }}>revenue share sa bawat trade</span>. Passive income na walang limit!
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate("/creator")} className="bg-[#ff5222] text-white text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:bg-[#e84a1e] transition-colors shadow-[0_2px_12px_rgba(255,82,34,0.3)]" style={{ fontWeight: 700, ...ss, ...pp }}>
              Sumali Ngayon — FREE
            </button>
            <button onClick={() => navigate("/creator")} className="border border-[#e5e7eb] text-[#070808] text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:border-[#ff5222]/30 transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>
              Alamin Pa →
            </button>
          </div>
        </div>
        <div className="flex-1 h-[200px] md:h-[280px] relative hidden md:block">
          <div className="absolute left-1/2 -translate-x-1/4 top-0">
            <img src={imgImage83} alt="" className="w-[228px] h-[228px] object-cover pointer-events-none" />
          </div>
          <div className="absolute left-1/2 translate-x-[20px] top-[108px]">
            <div className="size-[140px] -scale-y-100 rotate-180">
              <img src={imgImageRemovebgPreview2} alt="" className="size-full object-cover mix-blend-exclusion pointer-events-none" />
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
  return (
    <section className="w-full py-12 md:py-20 bg-[#f7f8fa] border-y border-[#f0f1f3]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12 items-center">
        {/* Reward cards preview */}
        <div className="flex-1 w-full relative min-h-[220px] md:h-[280px]">
          <div className="flex flex-col gap-3 absolute inset-0 justify-center">
            {[
              { Icon: TTGiftIcon, title: "Sign Up Bonus", amount: "₱300", status: "Nakuha na", statusColor: "#00bf85", statusBg: "#e6fff3" },
              { Icon: BasketballIcon, title: "Unang Taya sa PBA", amount: "₱200", status: "Tumaya", statusColor: "#ff5222", statusBg: "#fff4ed" },
              { Icon: DiceIcon, title: "Color Game Streak", amount: "₱150", status: "Tumaya", statusColor: "#ff5222", statusBg: "#fff4ed" },
              { Icon: BoxingIcon, title: "5 Boxing Bets", amount: "₱250", status: "Bagong Task", statusColor: "#3b82f6", statusBg: "#eff6ff" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[#f0f1f3] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ animation: `slide-right 0.4s ease-out ${i * 0.1}s both` }}>
                <r.Icon size={32} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-[#070808] block" style={{ fontWeight: 600, ...ss, ...pp }}>{r.title}</span>
                  <span className="text-[11px] text-[#ff5222]" style={{ fontWeight: 600, ...pp }}>{r.amount} PHP</span>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: r.statusBg, color: r.statusColor, fontWeight: 600, ...pp }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-1 flex flex-col gap-5">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full w-fit inline-flex items-center gap-1.5" style={{ fontWeight: 700, ...pp }}><EmojiIcon emoji="🎁" size={14} /> REWARDS PROGRAM</span>
          <h2 className="text-[28px] md:text-[36px] text-[#070808] leading-[1.15]" style={{ fontWeight: 800, ...ss, ...pp }}>
            Kumita ng Bonus{" "}
            <span className="text-[#ff5222]">Hanggang ₱5,000!</span>
          </h2>
          <p className="text-[14px] text-[#555] leading-[1.7] max-w-[480px]" style={{ ...ss, ...pp }}>
            I-complete ang mga simple tasks — tumaya sa PBA, Color Game, Boxing, at Esports — at kumita ng PHP bonus agad! <span className="text-[#070808]" style={{ fontWeight: 600 }}>Lahat ng rewards ay withdrawable sa GCash o Maya!</span>
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => navigate("/rewards")} className="bg-[#ff5222] text-white text-[14px] h-11 px-6 rounded-xl cursor-pointer hover:bg-[#e84a1e] transition-colors shadow-[0_2px_12px_rgba(255,82,34,0.3)]" style={{ fontWeight: 700, ...ss, ...pp }}>
              Tingnan ang Rewards
            </button>
            <span className="text-[11px] text-[#b0b3b8] border border-[#e5e7eb] rounded-lg px-3 py-2 flex items-center gap-1.5" style={{ fontWeight: 500, ...pp }}>
              🇵🇭 PHP Only — GCash & Maya
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== TESTIMONIALS ==================== */
function Testimonials() {
  return (
    <section className="w-full py-10 md:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5" style={{ fontWeight: 700, ...pp }}><EmojiIcon emoji="💬" size={14} /> MGA REVIEWS</span>
          <h2 className="text-[24px] md:text-[28px] text-[#070808] mt-3 mb-2" style={{ fontWeight: 800, ...ss, ...pp }}>Sinasabi ng Mga Bettor</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { name: "Maria Santos", handle: "@maria_s", text: "Grabe ang bilis ng payout! GCash withdraw ko, less than 2 minutes nasa account ko na. Hindi ako makapaniwala! 🎉", avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱45,000" },
            { name: "JM Reyes", handle: "@jm_reyes21", text: "Ang saya ng Color Game dito — parang totoong perya! Nanalo ako ng ₱12,500 sa isang round lang. Legit talaga! 🎲", avatar: "https://images.unsplash.com/photo-1718006915613-bcb972cabdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱12,500" },
            { name: "Ate Lyn", handle: "@lyn_bettor", text: "PBA betting dito ang pinaka-accurate na odds. Plus yung Creator Program nila, kumikita ako ng extra income kahit tulog! 💰", avatar: "https://images.unsplash.com/photo-1603954698693-b0bcbceb5ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", won: "₱78,000" },
          ].map((t, i) => (
            <div key={i} className="bg-white border border-[#f0f1f3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow" style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s both` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full overflow-hidden ring-2 ring-[#ff5222]/10">
                  <ImageWithFallback src={t.avatar} alt="" className="size-full object-cover" />
                </div>
                <div>
                  <span className="text-[13px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>{t.name}</span>
                  <span className="text-[11px] text-[#b0b3b8]" style={ss}>{t.handle}</span>
                </div>
                <span className="ml-auto text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full" style={{ fontWeight: 600, ...pp }}>Won {t.won}</span>
              </div>
              <p className="text-[13px] text-[#555] leading-[1.6]" style={{ ...ss, ...pp }}>{t.text}</p>
              <div className="flex mt-3 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-[14px]">⭐</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== FAQ ==================== */
const faqItems = [
  { q: "Ano ang ForeGate / Lucky Taya?", a: "Ang ForeGate (Lucky Taya) ay ang #1 prediction market platform sa Pilipinas. Tumaya ka sa mga real-world events — basketball, color game, boxing, esports, at marami pa. Lahat ng taya ay sa ₱PHP at deposit/withdraw via GCash o Maya." },
  { q: "Legal ba ito? May lisensya ba?", a: "Oo. Ang ForeGate ay PAGCOR-licensed at fully regulated. Lahat ng markets ay compliant sa Philippine gaming regulations." },
  { q: "Paano mag-deposit at mag-withdraw?", a: "I-click lang ang 'Deposit' button, piliin mo kung GCash, Maya, o bank transfer. Minimum deposit ₱100. Withdrawal is usually instant for GCash/Maya — walang hassle, walang hidden fees." },
  { q: "Ano ang Color Game?", a: "Ang Color Game ay based sa traditional perya dice game — 6 colors, 3 dice, fast-paced betting. Perfect ito para sa live, high-frequency play. Pumili ng kulay, mag-roll, at manalo agad!" },
  { q: "Paano maging Creator?", a: "Bilang Creator, gumawa ka ng sarili mong prediction markets at kumita ng revenue share sa bawat trade. Apply sa Creator Program — open ito sa content creators, community managers, at opinion leaders." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="w-full py-12 md:py-20 bg-white">
      <div className="max-w-[800px] mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] text-[#ff5222] bg-[#ff5222]/10 px-3 py-1.5 rounded-full" style={{ fontWeight: 700, ...pp }}>❓ FAQ</span>
          <h2 className="text-[24px] md:text-[28px] text-[#070808] mt-3" style={{ fontWeight: 800, ...ss, ...pp }}>Mga Karaniwang Tanong</h2>
        </div>
        <div className="flex flex-col">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-[#f0f1f3]">
              <button className="flex items-center justify-between py-4 w-full cursor-pointer group" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span className="text-[15px] text-[#555] text-left group-hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>{item.q}</span>
                <div className={`size-5 shrink-0 ml-4 transition-transform flex items-center justify-center rounded-full ${openIdx === i ? "rotate-180 bg-[#ff5222]/10" : "bg-[#f5f6f7]"}`}>
                  <svg className="size-3" fill="none" viewBox="0 0 12 8"><path d="M1 1.5L6 6.5L11 1.5" stroke={openIdx === i ? "#ff5222" : "#b0b3b8"} strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
              </button>
              {openIdx === i && (
                <p className="text-[13px] text-[#84888c] leading-[1.7] pb-4" style={{ ...ss, ...pp }}>{item.a}</p>
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
  return (
    <section className="w-full py-12 md:py-20 relative overflow-hidden">
      <ImageWithFallback src="https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,82,34,0.9) 0%, rgba(255,107,53,0.88) 40%, rgba(255,140,66,0.85) 100%)" }} />
      <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="flex justify-center mb-4" style={{ animation: "bounce-in 0.6s ease-out" }}><EmojiIcon emoji="🎲" size={56} /></div>
        <h2 className="text-white text-[28px] md:text-[36px] mb-3" style={{ fontWeight: 800, ...ss, ...pp }}>Handa Ka Na Ba Manalo?</h2>
        <p className="text-white/80 text-[16px] mb-8 max-w-[500px] mx-auto" style={{ ...ss, ...pp }}>
          Sumali sa 485,000+ Pinoy bettors na kumikita na sa Lucky Taya. Libre ang sign-up, may ₱600 welcome bonus pa!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => navigate("/markets")} className="bg-white text-[#ff5222] text-[14px] md:text-[15px] h-11 md:h-12 px-6 md:px-8 rounded-xl cursor-pointer hover:bg-white/95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.15)]" style={{ fontWeight: 700, ...ss, ...pp }}>
            <span className="inline-flex items-center gap-1.5"><EmojiIcon emoji="🎲" size={16} /> Simulan Na — LIBRE!</span>
          </button>
          <button onClick={() => navigate("/fast-bet")} className="border-2 border-white/30 text-white text-[15px] h-12 px-8 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" style={{ fontWeight: 600, ...ss, ...pp }}>
            <span className="inline-flex items-center gap-1.5"><EmojiIcon emoji="⚡" size={16} /> Fast Bet</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==================== FOOTER ==================== */
const footerCols = [
  { title: "Markets", links: [
    { label: "Basketball", route: "/category/basketball" },
    { label: "Color Game", route: "/category/color-game" },
    { label: "Boxing", route: "/category/boxing" },
    { label: "Esports", route: "/category/esports" },
    { label: "Bingo", route: "/category/bingo" },
    { label: "Lottery", route: "/category/lottery" },
  ]},
  { title: "Resources", links: [
    { label: "Paano Tumaya", route: "" },
    { label: "GCash Guide", route: "" },
    { label: "Maya Guide", route: "" },
    { label: "API", route: "" },
  ]},
  { title: "Support", links: [
    { label: "Help Center", route: "" },
    { label: "Tutorials", route: "" },
    { label: "24/7 Chat", route: "" },
    { label: "Responsible Gaming", route: "" },
  ]},
  { title: "About", links: [
    { label: "About Us", route: "" },
    { label: "Blog", route: "" },
    { label: "Careers", route: "" },
    { label: "PAGCOR License", route: "" },
    { label: "Privacy Policy", route: "" },
  ]},
];
const socialIcons = [imgImage29, imgImage28, imgImage26, imgImage27, imgImage25];

function HomeFooter() {
  const navigate = useNavigate();
  return (
    <footer className="w-full bg-white border-t border-[#f0f1f3]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="w-full md:flex-1 flex flex-col gap-5 md:gap-6 md:max-w-[300px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <svg className="size-6" fill="none" viewBox="0 0 24 24.0002"><path d={svgPaths.p3f45c600} fill="#FF5222" /></svg>
              <span className="text-[20px] text-[#ff5222] leading-5" style={{ fontWeight: 700, ...pp }}>Lucky Taya</span>
            </div>
            <span className="text-[11px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss, ...pp }}>Powered by ForeGate — #1 Prediction Market sa PH</span>
          </div>
          <div className="flex gap-2.5">
            {socialIcons.map((icon, i) => (
              <div key={i} className="size-6 shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
                <img src={icon} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {["PAGCOR Licensed", "21+ Only", "Responsible Gaming"].map((label) => (
              <span key={label} className="text-[10px] text-[#d1d5db] border border-[#e5e7eb] rounded px-2 py-0.5" style={pp}>{label}</span>
            ))}
          </div>
        </div>
        <div className="w-full md:flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-4">
          {footerCols.map((col) => (
            <div key={col.title} className="flex flex-col">
              <span className="text-[13px] text-[#070808] pb-3" style={{ fontWeight: 600, ...ss, ...pp }}>{col.title}</span>
              {col.links.map((link) => (
                <button key={link.label} onClick={() => link.route && navigate(link.route)} className="text-[13px] text-[#84888c] py-1 cursor-pointer hover:text-[#ff5222] transition-colors bg-transparent border-none p-0 text-left" style={{ ...ss, ...pp }}>{link.label}</button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 pb-6">
        <div className="border-t border-[#f0f1f3] pt-4 flex flex-col gap-1 items-center">
          <span className="text-[11px] text-[#d1d5db] text-center" style={{ ...ss, ...pp }}>ForeGate Inc. &copy; 2026 — PAGCOR Gaming License #PH-2026-XXXX</span>
          <div className="flex gap-2 text-[11px] text-[#d1d5db]" style={{ ...ss, ...pp }}>
            <span className="hover:text-[#84888c] cursor-pointer transition-colors">Privacy Policy</span>
            <span>&middot;</span>
            <span className="hover:text-[#84888c] cursor-pointer transition-colors">Terms of Service</span>
            <span>&middot;</span>
            <span className="hover:text-[#84888c] cursor-pointer transition-colors">Responsible Gaming</span>
            <span>&middot;</span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==================== HOME PAGE ==================== */
export default function HomePage() {
  return (
    <div className="bg-white flex flex-col min-h-screen w-full" style={pp}>
      <style>{keyframes}</style>
      <HomeHeader />
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
      <HomeFooter />
    </div>
  );
}
