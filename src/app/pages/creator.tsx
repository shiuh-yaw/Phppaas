import { useState, createContext, useContext, useRef } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-8l13iyv1z4";
import imgUnsplash4Yv84VgQkRm from "figma:asset/8b39eb823efcb26429cdca7453d4b008e7eedd6e.png";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { EmojiIcon } from "../components/two-tone-icons";
import { useAuth } from "../components/auth-context";
import { CreatorLanding } from "../components/creator-landing";
import { Footer } from "../components/footer";
import { toModalTheme } from "../components/theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== THEME ==================== */
interface T {
  bg: string; bgAlt: string; card: string; cardBorder: string;
  text: string; textSec: string; textMut: string; textFaint: string;
  sectionBorder: string; inputBg: string; inputBorder: string;
  hoverBg: string; iconFill: string; rowHover: string;
  greenBg: string; greenText: string; orangeBg: string; orangeText: string;
}
const dark: T = {
  bg: "#0a0b0d", bgAlt: "#0d0e11", card: "#111216", cardBorder: "rgba(255,255,255,0.06)",
  text: "#ffffff", textSec: "rgba(255,255,255,0.5)", textMut: "rgba(255,255,255,0.25)", textFaint: "rgba(255,255,255,0.15)",
  sectionBorder: "rgba(255,255,255,0.05)", inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.1)",
  hoverBg: "rgba(255,255,255,0.04)", iconFill: "rgba(255,255,255,0.5)", rowHover: "rgba(255,255,255,0.03)",
  greenBg: "rgba(0,191,133,0.15)", greenText: "#00BF85", orangeBg: "rgba(255,82,34,0.15)", orangeText: "#ff5222",
};
const light: T = {
  bg: "#ffffff", bgAlt: "#f7f8fa", card: "#ffffff", cardBorder: "#f5f6f7",
  text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
  sectionBorder: "#f5f6f7", inputBg: "#fafafa", inputBorder: "#f5f6f7",
  hoverBg: "rgba(0,0,0,0.03)", iconFill: "#84888c", rowHover: "rgba(0,0,0,0.02)",
  greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
};
const ThemeCtx = createContext<{ t: T; isDark: boolean; toggle: () => void }>({ t: light, isDark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

/* ==================== IMAGES ==================== */
const IMGS: Record<string, string> = {
  basketball: "https://images.unsplash.com/photo-1659367527460-92759bf33263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",

  boxing: "https://images.unsplash.com/photo-1586204723173-94e043453715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  esports: "https://images.unsplash.com/photo-1759701546668-4fe410517caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  bingo: "https://images.unsplash.com/photo-1713610480144-b7fbc9d9069a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  pageant: "https://images.unsplash.com/photo-1683175778464-c66045d6812a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  typhoon: "https://images.unsplash.com/photo-1641648544039-969a5d6d5a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  peso: "https://images.unsplash.com/photo-1608521705033-9953484663b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
  colorgame: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120",
};

/* ==================== MARKET DATA ==================== */
interface CreatorMarket {
  id: string; title: string; category: string; image: string;
  volume: number; traded: string; traders: number; earning: number;
  holders: string; liquidity: number;
  status: "live" | "ended" | "resolved";
}

const CREATOR_MARKETS: CreatorMarket[] = [
  { id: "m1", title: "PBA Philippine Cup Finals 2026 — Sino ang Champion?", category: "Basketball", image: IMGS.basketball, volume: 245000, traded: "₱ PHP", traders: 1283, earning: 12250, holders: "2,847", liquidity: 85400, status: "live" },
  { id: "m2", title: "Boxing: Donaire vs Inoue III — WBC Main Event", category: "Boxing", image: IMGS.boxing, volume: 89000, traded: "₱ PHP", traders: 567, earning: 4450, holders: "1,134", liquidity: 32000, status: "live" },
  { id: "m3", title: "Color Game Round #8832 — Anong kulay?", category: "Color Game", image: IMGS.colorgame, volume: 56000, traded: "₱ PHP", traders: 892, earning: 2800, holders: "1,784", liquidity: 18000, status: "live" },
  { id: "m4", title: "Boxing: Donaire vs Inoue III — Sino panalo?", category: "Boxing", image: IMGS.boxing, volume: 178000, traded: "₱ PHP", traders: 945, earning: 8900, holders: "1,890", liquidity: 62000, status: "live" },
  { id: "m5", title: "MLBB M6: Mananalo ba ang Blacklist Intl?", category: "Esports", image: IMGS.esports, volume: 125000, traded: "₱ PHP", traders: 1567, earning: 6250, holders: "3,134", liquidity: 45000, status: "live" },
  { id: "m6", title: "Super Bingo — Jackpot Hit Before Round 50?", category: "Bingo", image: IMGS.bingo, volume: 34000, traded: "₱ PHP", traders: 234, earning: 1700, holders: "468", liquidity: 12000, status: "live" },
  { id: "m7", title: "NBA Finals 2026 — Celtics vs Lakers", category: "Basketball", image: IMGS.basketball, volume: 320000, traded: "₱ PHP", traders: 2100, earning: 16000, holders: "4,200", liquidity: 112000, status: "live" },
  { id: "m8", title: "Binibining Pilipinas 2026 — Sino mananalo?", category: "Entertainment", image: IMGS.pageant, volume: 67000, traded: "₱ PHP", traders: 456, earning: 3350, holders: "912", liquidity: 24000, status: "live" },
  { id: "m9", title: "PBA Governors' Cup MVP — Sino ang MVP?", category: "Basketball", image: IMGS.basketball, volume: 156000, traded: "₱ PHP", traders: 789, earning: 7800, holders: "1,578", liquidity: 56000, status: "ended" },
  { id: "m10", title: "MLBB M6 MVP Award — Sino ang kukunin?", category: "Esports", image: IMGS.esports, volume: 92000, traded: "₱ PHP", traders: 612, earning: 4600, holders: "1,224", liquidity: 33000, status: "ended" },
  { id: "m11", title: "May typhoon ba sa Luzon this March?", category: "Weather", image: IMGS.typhoon, volume: 28000, traded: "₱ PHP", traders: 189, earning: 1400, holders: "378", liquidity: 10000, status: "ended" },
  { id: "m12", title: "PHP/USD — Aabot ba sa ₱59 ngayong Q2?", category: "Economic", image: IMGS.peso, volume: 215000, traded: "₱ PHP", traders: 1034, earning: 10750, holders: "2,068", liquidity: 76000, status: "ended" },
  { id: "m13", title: "PCSO 6/45 — Matataya ba ang Jackpot?", category: "Lottery", image: IMGS.bingo, volume: 43000, traded: "₱ PHP", traders: 312, earning: 2150, holders: "624", liquidity: 15000, status: "resolved" },
  { id: "m14", title: "Color Game Streak — 5x Berde?", category: "Color Game", image: IMGS.colorgame, volume: 18000, traded: "₱ PHP", traders: 145, earning: 900, holders: "290", liquidity: 6500, status: "resolved" },
  { id: "m15", title: "Ancajas vs Chocolatito — WBC Super Fly", category: "Boxing", image: IMGS.boxing, volume: 134000, traded: "₱ PHP", traders: 678, earning: 6700, holders: "1,356", liquidity: 48000, status: "resolved" },
  { id: "m16", title: "Eat Bulaga Ratings — Above 30%?", category: "Entertainment", image: IMGS.pageant, volume: 12000, traded: "₱ PHP", traders: 89, earning: 600, holders: "178", liquidity: 4300, status: "resolved" },
];

/* ==================== SHARED COMPONENTS ==================== */
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button onClick={toggle} className="size-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
      {isDark ? (
        <svg className="size-[16px]" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      ) : (
        <svg className="size-[16px]" viewBox="0 0 24 24" fill="none" stroke="#070808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      )}
    </button>
  );
}

/* Local Sidebar/Header removed — using shared components */
/* Local Footer removed — using shared Footer component */

/* ====================================================================
   VIEW 1: CREATOR APPLICATION (Maging Creator)
   ==================================================================== */
function CreatorApplication({ onComplete }: { onComplete: () => void }) {
  const { t, isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [socialLink, setSocialLink] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactDropdown, setContactDropdown] = useState(false);
  const [contactValue, setContactValue] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Profile detail fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");

  const contactMethods = [
    { id: "phone", label: "Phone Number", icon: "📱", placeholder: "09XX XXX XXXX" },
    { id: "telegram", label: "Telegram", icon: "✈️", placeholder: "@username" },
    { id: "whatsapp", label: "WhatsApp", icon: "💬", placeholder: "+63 9XX XXX XXXX" },
    { id: "viber", label: "Viber", icon: "📞", placeholder: "09XX XXX XXXX" },
    { id: "messenger", label: "Facebook Messenger", icon: "💙", placeholder: "m.me/username" },
  ];

  const specializations = [
    "Basketball (PBA/NBA)", "Color Game (Perya)", "Boxing",
    "Esports (MLBB/Valorant/Dota 2)", "Bingo", "Lottery/PCSO",
    "Entertainment/Pop Culture", "Weather/Typhoon", "Economic/Political",
  ];

  const canSubmit = agreed && socialLink.length > 0 && contactMethod && contactValue.length > 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="size-20 rounded-full flex items-center justify-center" style={{ background: isDark ? "rgba(0,191,133,0.15)" : "#e6fff3" }}>
          <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="#00BF85" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[24px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Nai-submit na ang Application!</span>
          <span className="text-[14px] text-center max-w-[400px]" style={{ color: t.textSec, ...ss, ...pp }}>
            Salamat sa pag-apply bilang creator. Ire-review namin ang iyong application sa loob ng 24-48 oras. Mag-abang sa notification!
          </span>
        </div>
        <button onClick={onComplete} className="h-12 px-8 rounded-xl text-[15px] cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
          Pumunta sa Creator Center
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Maging Creator</h1>
        <p className="text-[14px]" style={{ color: t.textSec, ...ss, ...pp }}>
          Para ma-onboard ka bilang creator, kailangan naming kunin ang iyong contact details. Gagamitin lang ito para sa onboarding at hindi ibabahagi sa iba.
        </p>
      </div>

      {/* Profile Detail (collapsible) */}
      <div className="rounded-xl border" style={{ borderColor: t.cardBorder }}>
        <button onClick={() => setProfileOpen(!profileOpen)} className="w-full flex items-center justify-between p-4 cursor-pointer">
          <span className="text-[15px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Profile Detail</span>
          <svg className={`size-5 transition-transform ${profileOpen ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke={t.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        {profileOpen && (
          <div className="px-4 pb-4 flex flex-col gap-4 border-t" style={{ borderColor: t.cardBorder }}>
            <div className="flex flex-col gap-1 pt-4">
              <label className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Display Name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Juan Dela Cruz"
                className="h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Bio / Tungkol sa iyo</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Halimbawa: Expert sa PBA at Boxing markets..."
                className="h-20 px-4 py-3 rounded-lg text-[14px] outline-none resize-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Espesyalisasyon</label>
              <div className="flex flex-wrap gap-2">
                {specializations.map(s => (
                  <button key={s} onClick={() => setSpecialization(s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all"
                    style={{
                      background: specialization === s ? (isDark ? "rgba(255,82,34,0.15)" : "rgba(255,82,34,0.08)") : t.inputBg,
                      border: `1px solid ${specialization === s ? "#ff5222" : t.inputBorder}`,
                      color: specialization === s ? "#ff5222" : t.textSec,
                      fontWeight: specialization === s ? 600 : 400, ...ss, ...pp,
                    }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Channel */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Social Channel</label>
        <input value={socialLink} onChange={e => setSocialLink(e.target.value)} placeholder="I-enter ang iyong social media link"
          className="h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
        <span className="text-[12px]" style={{ color: t.textMut, ...ss, ...pp }}>
          I-share ang iyong social media link para ma-feature ka namin at makakonekta.
        </span>
      </div>

      {/* Contact Detail */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Contact Detail</label>
        <div className="relative">
          <button onClick={() => setContactDropdown(!contactDropdown)}
            className="w-full h-12 px-4 rounded-lg flex items-center justify-between text-[14px] cursor-pointer"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: contactMethod ? t.text : t.textMut, ...ss, ...pp }}>
            <span>{contactMethod ? contactMethods.find(m => m.id === contactMethod)?.label : "Pumili ng paraan ng contact"}</span>
            <svg className={`size-4 transition-transform ${contactDropdown ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke={t.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {contactDropdown && (
            <div className="absolute top-13 left-0 right-0 z-50 rounded-lg border py-1 max-h-[200px] overflow-y-auto" style={{ background: isDark ? "#1a1b1f" : "#fff", borderColor: t.cardBorder, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)" }}>
              {contactMethods.map(m => (
                <button key={m.id} onClick={() => { setContactMethod(m.id); setContactDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 cursor-pointer text-[14px] transition-colors"
                  style={{ background: contactMethod === m.id ? t.hoverBg : "transparent", color: t.text, ...ss, ...pp }}>
                  <EmojiIcon emoji={m.icon} size={14} /> {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {contactMethod && (
          <input value={contactValue} onChange={e => setContactValue(e.target.value)}
            placeholder={contactMethods.find(m => m.id === contactMethod)?.placeholder || ""}
            className="h-12 px-4 rounded-lg text-[14px] outline-none mt-1" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
        )}
        <span className="text-[12px]" style={{ color: t.textMut, ...ss, ...pp }}>
          I-share ang iyong preferred na contact method para madali kaming maka-reach out sa iyo.
        </span>
      </div>

      {/* Agreement */}
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="size-5 rounded border flex items-center justify-center" style={{ borderColor: agreed ? "#ff5222" : t.inputBorder, background: agreed ? "#ff5222" : "transparent" }}
          onClick={() => setAgreed(!agreed)}>
          {agreed && <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        <span className="text-[13px]" style={{ color: t.text, ...ss, ...pp }}>
          Sumasang-ayon ako sa <span className="text-[#ff5222] cursor-pointer">privacy policy</span> at <span className="text-[#ff5222] cursor-pointer">terms</span>
        </span>
      </label>

      {/* Submit */}
      <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit}
        className="h-12 rounded-xl text-[15px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed w-fit px-12"
        style={{ background: isDark ? (canSubmit ? "#ff5222" : "rgba(255,255,255,0.06)") : (canSubmit ? "#ff5222" : "#f5f6f7"), color: canSubmit ? "#fff" : t.textMut, fontWeight: 500, ...ss, ...pp }}>
        I-submit
      </button>
    </div>
  );
}

/* ====================================================================
   VIEW 2: CREATOR CENTER (Dashboard)
   ==================================================================== */
function CreatorCenter({ onCreateMarket }: { onCreateMarket: () => void }) {
  const { t, isDark } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"live" | "ended" | "resolved">("live");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Lahat");
  const [typeDropdown, setTypeDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const categories = ["Lahat", "Basketball", "Color Game", "Boxing", "Esports", "Bingo", "Lottery", "Entertainment", "Weather", "Economic"];
  const ICONS: Record<string, string> = { Basketball: "🏀", "Color Game": "🎲", Boxing: "🥊", Esports: "🎮", Bingo: "🎱", Lottery: "🎰", Entertainment: "🎭", Weather: "🌀", Economic: "📊" };

  const filtered = CREATOR_MARKETS.filter(m => {
    if (m.status !== tab) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "Lahat" && m.category !== typeFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalEarning = CREATOR_MARKETS.reduce((s, m) => s + m.earning, 0);
  const totalVolume = CREATOR_MARKETS.reduce((s, m) => s + m.volume, 0);
  const totalMarkets = CREATOR_MARKETS.length;
  const totalTraders = CREATOR_MARKETS.reduce((s, m) => s + m.traders, 0);

  const actionLabel = (status: string) => {
    if (status === "live") return "Detalye";
    if (status === "ended") return "I-resolve";
    return "Kunin";
  };
  const actionColor = "#ff5222";

  function getPaginationItems() {
    const items: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
      if (page < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title + Create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-[22px] sm:text-[28px]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Creator Center</h1>
        <button onClick={onCreateMarket} className="h-10 px-5 rounded-lg text-[14px] cursor-pointer hover:opacity-90 transition-opacity w-fit"
          style={{ background: isDark ? "#fff" : "#070808", color: isDark ? "#070808" : "#fff", fontWeight: 500, ...ss, ...pp }}>
          Gumawa ng Market
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total na Kita", value: `₱${totalEarning.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
          { label: "Total na Volume", value: `₱${totalVolume.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
          { label: "Total na Market", value: String(totalMarkets) },
          { label: "Total na Trader", value: totalTraders.toLocaleString() },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: t.card, borderColor: t.cardBorder }}>
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{stat.label}</span>
            <span className="text-[20px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {(["live", "ended", "resolved"] as const).map(tabKey => (
            <button key={tabKey} onClick={() => { setTab(tabKey); setPage(1); }}
              className="text-[14px] pb-2 cursor-pointer transition-colors relative"
              style={{ color: tab === tabKey ? t.text : t.textSec, fontWeight: tab === tabKey ? 600 : 400, ...ss, ...pp }}>
              {tabKey === "live" ? "Live" : tabKey === "ended" ? "Natapos" : "Na-resolve"}
              {tab === tabKey && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 h-9 px-3 rounded-lg w-[180px]" style={{ background: t.inputBg }}>
            <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 13.5158 13.5164"><path d={svgPaths.p140f2580} fill={t.iconFill} /></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Maghanap..."
              className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: t.text, ...ss, ...pp }} />
          </div>
          <div className="relative">
            <button onClick={() => setTypeDropdown(!typeDropdown)} className="flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer" style={{ background: t.inputBg, ...ss, ...pp }}>
              <span className="text-[13px]" style={{ color: t.textSec }}>{typeFilter}</span>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke={t.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {typeDropdown && (
              <div className="absolute top-10 right-0 z-50 rounded-lg border py-1 min-w-[180px] max-h-[300px] overflow-y-auto" style={{ background: isDark ? "#1a1b1f" : "#fff", borderColor: t.cardBorder, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setTypeFilter(cat); setTypeDropdown(false); setPage(1); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer text-left" style={{ background: typeFilter === cat ? t.hoverBg : "transparent", color: t.text, ...ss, ...pp }}>
                    {cat !== "Lahat" && <EmojiIcon emoji={ICONS[cat] || ""} size={14} />}{cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col overflow-x-auto">
        {/* Header */}
        <div className="flex items-center gap-2 py-3 border-b" style={{ borderColor: t.cardBorder }}>
          <div className="w-[280px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Market ↕</span></div>
          <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Volume ↕</span></div>
          <div className="w-[80px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Traded ↕</span></div>
          <div className="w-[70px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Trader ↕</span></div>
          <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Kita ↕</span></div>
          <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Holders ↕</span></div>
          <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Liquidity ↕</span></div>
          <div className="flex-1 text-right"><span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Aksyon</span></div>
        </div>

        {/* Rows */}
        {pageItems.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <span className="text-[14px]" style={{ color: t.textMut, ...ss, ...pp }}>Walang makitang market.</span>
          </div>
        )}
        {pageItems.map(m => (
          <div key={m.id} className="flex items-center gap-2 py-3.5 border-b cursor-pointer transition-colors"
            style={{ borderColor: t.sectionBorder }}
            onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <div className="w-[280px] shrink-0 flex items-center gap-2">
              <div className="size-10 rounded-lg overflow-hidden shrink-0">
                <ImageWithFallback src={m.image} alt="" className="size-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] truncate" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{m.title}</span>
                <span className="text-[11px] inline-flex items-center gap-0.5" style={{ color: t.textMut, ...ss, ...pp }}><EmojiIcon emoji={ICONS[m.category] || "📌"} size={12} /> {m.category}</span>
              </div>
            </div>
            <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>₱{(m.volume / 1000).toFixed(0)}K</span></div>
            <div className="w-[80px] shrink-0 flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ background: "#ff5222" }} />
              <span className="text-[12px]" style={{ color: t.text, ...ss, ...pp }}>₱ PHP</span>
            </div>
            <div className="w-[70px] shrink-0"><span className="text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{m.traders.toLocaleString()}</span></div>
            <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>₱{m.earning.toLocaleString()}</span></div>
            <div className="w-[90px] shrink-0">
              <span className="text-[12px] cursor-pointer" style={{ color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>Tingnan</span>
            </div>
            <div className="w-[90px] shrink-0"><span className="text-[12px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>₱{m.liquidity.toLocaleString()}</span></div>
            <div className="flex-1 text-right">
              <span className="text-[12px] cursor-pointer" style={{ color: actionColor, fontWeight: 500, ...ss, ...pp }}>{actionLabel(m.status)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="size-8 flex items-center justify-center rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: t.text }}>
            <svg className="size-3.5" fill="none" viewBox="0 0 4.87736 8.62695"><path d={svgPaths.p1d939c00} fill={isDark ? "#fff" : "#070808"} /></svg>
          </button>
          {getPaginationItems().map((item, i) =>
            item === "..." ? <span key={`d${i}`} className="size-8 flex items-center justify-center text-[14px]" style={{ color: t.textSec, ...pp }}>...</span> : (
              <button key={item} onClick={() => setPage(item as number)} className="size-8 flex items-center justify-center rounded text-[14px] cursor-pointer transition-colors"
                style={{ background: page === item ? (isDark ? "rgba(255,255,255,0.08)" : "#f2f3f4") : "transparent", color: page === item ? t.text : t.textSec, fontWeight: page === item ? 600 : 400, ...ss, ...pp }}>{item}</button>
            )
          )}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="size-8 flex items-center justify-center rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: t.text }}>
            <svg className="size-3.5 rotate-180" fill="none" viewBox="0 0 4.87736 8.62695"><path d={svgPaths.p1d939c00} fill={isDark ? "#fff" : "#070808"} /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ====================================================================
   VIEW 3: CREATE MARKET
   ==================================================================== */
function CreateMarket({ onBack }: { onBack: () => void }) {
  const { t, isDark } = useTheme();
  const [marketType, setMarketType] = useState<"pari-mutwal" | "amm" | "poll">("pari-mutwal");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Basketball");
  const [rules, setRules] = useState("");
  const [dataResource, setDataResource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [feePercent, setFeePercent] = useState(5);
  const [agreed, setAgreed] = useState(false);
  const [outcomes, setOutcomes] = useState([{ name: "", price: "" }]);
  const [liquidity, setLiquidity] = useState(1000);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topics = [
    { id: "Basketball", icon: "🏀" }, { id: "Color Game", icon: "🎲" },
    { id: "Boxing", icon: "🥊" }, { id: "Esports", icon: "🎮" }, { id: "Bingo", icon: "🎱" },
    { id: "Lottery", icon: "🎰" }, { id: "Entertainment", icon: "🎭" }, { id: "Weather", icon: "🌀" },
    { id: "Economic", icon: "📊" },
  ];

  const fees = [1, 3, 5, 8, 10];
  const liquidityPresets = [100, 1000, 10000, 100000];

  const titlePlaceholders: Record<string, string> = {
    Basketball: "PBA Philippine Cup Finals 2026 — Sino ang Champion?",

    "Color Game": "Color Game Round #9001 — Anong kulay ang lalabas?",
    Boxing: "Boxing: Pacquiao vs Crawford — Sino mananalo?",
    Esports: "MLBB M7 Grand Finals — PH Team Mananalo ba?",
    Bingo: "Super Bingo — Jackpot Hit Before Round 50?",
    Lottery: "PCSO 6/45 — Matataya ba ang Jackpot ngayong gabi?",
    Entertainment: "Binibining Pilipinas 2026 — Sino ang mananalo?",
    Weather: "May typhoon ba na mag-landfall sa Luzon this April?",
    Economic: "PHP/USD — Aabot ba sa ₱59 ngayong Q2 2026?",
  };

  const outcomePresets: Record<string, string[]> = {
    Basketball: ["Ginebra", "San Miguel", "TNT", "Meralco"],

    "Color Game": ["Pula", "Asul", "Berde", "Dilaw", "Puti", "Pink"],
    Boxing: ["Pacquiao KO", "Crawford KO", "Pacquiao Decision", "Crawford Decision", "Draw"],
    Esports: ["Oo", "Hindi"],
    Bingo: ["Oo", "Hindi"],
    Lottery: ["Oo", "Hindi"],
    Entertainment: ["Candidate A", "Candidate B", "Candidate C"],
    Weather: ["Oo", "Hindi"],
    Economic: ["Oo", "Hindi"],
  };

  const addOutcome = () => setOutcomes([...outcomes, { name: "", price: "" }]);
  const removeOutcome = (i: number) => setOutcomes(outcomes.filter((_, idx) => idx !== i));
  const updateOutcome = (i: number, field: "name" | "price", val: string) => {
    const next = [...outcomes];
    next[i][field] = val;
    setOutcomes(next);
  };
  const applyPresets = () => setOutcomes((outcomePresets[topic] || ["Oo", "Hindi"]).map(n => ({ name: n, price: "" })));

  const canSubmit = agreed && title.length > 0 && outcomes.some(o => o.name.length > 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="size-20 rounded-full flex items-center justify-center" style={{ background: isDark ? "rgba(0,191,133,0.15)" : "#e6fff3" }}>
          <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="#00BF85" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[24px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>Na-create na ang Market!</span>
          <span className="text-[14px] text-center max-w-[400px]" style={{ color: t.textSec, ...ss, ...pp }}>
            "{title}" — nai-submit na at ire-review bago ma-publish. Abangan ang notification kapag live na!
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="h-12 px-8 rounded-xl text-[15px] cursor-pointer" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
            Bumalik sa Creator Center
          </button>
          <button onClick={() => { setSubmitted(false); setTitle(""); setRules(""); setOutcomes([{ name: "", price: "" }]); setAgreed(false); }}
            className="h-12 px-8 rounded-xl text-[15px] cursor-pointer" style={{ background: t.inputBg, color: t.text, fontWeight: 500, ...ss, ...pp }}>
            Gumawa ng Isa Pa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] flex flex-col gap-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="size-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ background: t.inputBg }}>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 className="text-[28px]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>Gumawa ng Market</h1>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Uri (Type)</label>
        <div className="flex gap-2">
          {([
            { key: "pari-mutwal" as const, label: "Pari-mutwal" },
            { key: "amm" as const, label: "AMM (Multi)" },
            { key: "poll" as const, label: "Poll" },
          ]).map(mt => (
            <button key={mt.key} onClick={() => setMarketType(mt.key)}
              className="px-4 py-2 rounded-lg text-[13px] cursor-pointer transition-all"
              style={{
                background: marketType === mt.key ? (isDark ? "#fff" : "#070808") : t.inputBg,
                color: marketType === mt.key ? (isDark ? "#070808" : "#fff") : t.textSec,
                fontWeight: marketType === mt.key ? 600 : 400, ...ss, ...pp,
              }}>{mt.label}</button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] flex items-center gap-1" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>
          Pamagat <span className="text-[11px]" style={{ color: t.textMut }}>*</span>
          <svg className="size-3.5 cursor-pointer" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke={t.textMut} /><path d="M6 5.5V8.5" stroke={t.textMut} strokeLinecap="round" /><circle cx="6" cy="3.75" r="0.5" fill={t.textMut} /></svg>
        </label>
        <input value={title} onChange={e => setTitle(e.target.value.slice(0, 200))} placeholder={titlePlaceholders[topic] || "I-enter ang market title"}
          className="h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
        <span className="text-[11px] text-right" style={{ color: t.textMut, ...ss, ...pp }}>{title.length}/200</span>
      </div>

      {/* Topic */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Kategorya (Topic)</label>
        <div className="flex flex-wrap gap-2">
          {topics.map(tp => (
            <button key={tp.id} onClick={() => { setTopic(tp.id); setOutcomes([{ name: "", price: "" }]); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all"
              style={{
                background: topic === tp.id ? (isDark ? "#fff" : "#070808") : t.inputBg,
                border: `1px solid ${topic === tp.id ? "transparent" : t.inputBorder}`,
                color: topic === tp.id ? (isDark ? "#070808" : "#fff") : t.textSec,
                fontWeight: topic === tp.id ? 600 : 400, ...ss, ...pp,
              }}><EmojiIcon emoji={tp.icon} size={14} />{tp.id}</button>
          ))}
        </div>
      </div>

      {/* Display Image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] flex items-center gap-1" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>
          Display Image <span className="text-[11px]" style={{ color: t.textMut }}>*</span>
        </label>
        <div onClick={() => fileInputRef.current?.click()} className="size-24 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed transition-colors"
          style={{ borderColor: t.inputBorder, background: t.inputBg }}>
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke={t.textMut} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span className="text-[10px]" style={{ color: t.textMut, ...ss, ...pp }}>Recommended<br />300 x 300</span>
          <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" />
        </div>
        <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>Mag-set ng market thumbnail image. PNG, JPG, at JPEG lang ang accepted.</span>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] flex items-center gap-1" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>
          Mga Patakaran (Rules) <span className="text-[11px]" style={{ color: t.textMut }}>*</span>
        </label>
        <textarea value={rules} onChange={e => setRules(e.target.value.slice(0, 2000))} placeholder="Ilagay ang market rules..."
          className="h-24 px-4 py-3 rounded-lg text-[14px] outline-none resize-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
        <div className="flex justify-between">
          <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>Ang market ay ire-resolve batay sa Data Source na ibinigay ng creator. Data Source Link.</span>
          <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>{rules.length}/2000</span>
        </div>
      </div>

      {/* Data Resource */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Data Resource</label>
        <div className="flex gap-2">
          <input value={dataResource} onChange={e => setDataResource(e.target.value)} placeholder="i.e. URL o dokumento"
            className="flex-1 h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
          <button className="h-12 px-4 rounded-lg flex items-center gap-2 cursor-pointer" style={{ background: isDark ? "#fff" : "#070808", color: isDark ? "#070808" : "#fff", fontWeight: 500, ...ss, ...pp }}>
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload
          </button>
        </div>
        <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
          Ang market ay ise-settle batay sa results mula sa data source na ito, na ipapakita sa trading page.
        </span>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Petsa</label>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="flex-1 h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, colorScheme: isDark ? "dark" : "light", ...ss, ...pp }} />
          <span className="text-[14px]" style={{ color: t.textMut }}>→</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="flex-1 h-12 px-4 rounded-lg text-[14px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, colorScheme: isDark ? "dark" : "light", ...ss, ...pp }} />
        </div>
        <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
          Ang market na ito ay ire-resolve bago mag-expire. Puwede ring ma-resolve nang maaga kung may malinaw nang resulta.
        </span>
      </div>

      {/* Trading Currency - PHP only */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Trading Currency</label>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2" style={{ background: isDark ? "#fff" : "#070808", color: isDark ? "#070808" : "#fff", fontWeight: 600, ...ss, ...pp }}>
            <span className="text-[14px]" style={{ color: "#ff5222", fontWeight: 700 }}>₱</span> PHP
          </div>
        </div>
        <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Balanse: <span style={{ fontWeight: 600 }}>₱23,450.00</span></span>
      </div>

      {/* Liquidity (AMM only) */}
      {marketType === "amm" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] flex items-center gap-1" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>
            Liquidity <span className="text-[11px]" style={{ color: t.textMut }}>*</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={() => setLiquidity(Math.max(100, liquidity - 100))} className="size-10 flex items-center justify-center rounded-lg cursor-pointer" style={{ background: t.inputBg }}>
              <span className="text-[18px]" style={{ color: t.text }}>−</span>
            </button>
            <span className="text-[16px] flex-1 text-center" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>₱{liquidity.toLocaleString()} PHP</span>
            <button onClick={() => setLiquidity(liquidity + 100)} className="size-10 flex items-center justify-center rounded-lg cursor-pointer" style={{ background: t.inputBg }}>
              <span className="text-[18px]" style={{ color: t.text }}>+</span>
            </button>
          </div>
          <div className="flex gap-2">
            {liquidityPresets.map(lp => (
              <button key={lp} onClick={() => setLiquidity(lp)}
                className="flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-all"
                style={{
                  background: liquidity === lp ? (isDark ? "#fff" : "#070808") : t.inputBg,
                  border: `1px solid ${liquidity === lp ? "transparent" : t.inputBorder}`,
                  color: liquidity === lp ? (isDark ? "#070808" : "#fff") : t.textSec,
                  fontWeight: liquidity === lp ? 600 : 400, ...ss, ...pp,
                }}>₱{lp.toLocaleString()}</button>
            ))}
          </div>
        </div>
      )}

      {/* Fees (pari-mutwal & poll) */}
      {(marketType === "pari-mutwal" || marketType === "poll") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Fees</label>
          <div className="flex gap-2">
            {fees.map(f => (
              <button key={f} onClick={() => setFeePercent(f)}
                className="flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-all"
                style={{
                  background: feePercent === f ? (isDark ? "#fff" : "#070808") : t.inputBg,
                  border: `1px solid ${feePercent === f ? "transparent" : t.inputBorder}`,
                  color: feePercent === f ? (isDark ? "#070808" : "#fff") : t.textSec,
                  fontWeight: feePercent === f ? 600 : 400, ...ss, ...pp,
                }}>{f}%</button>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Setting */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>Outcome Setting</label>
          <button onClick={applyPresets} className="text-[11px] cursor-pointer" style={{ color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>
            I-apply ang suggested outcomes
          </button>
        </div>

        {outcomes.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={o.name} onChange={e => updateOutcome(i, "name", e.target.value)}
              placeholder={`Outcome ${i + 1}`}
              className="flex-1 h-10 px-4 rounded-lg text-[13px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
            {marketType === "amm" && (
              <input value={o.price} onChange={e => updateOutcome(i, "price", e.target.value)}
                placeholder="Presyo"
                className="w-[100px] h-10 px-3 rounded-lg text-[13px] outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, ...ss, ...pp }} />
            )}
            {outcomes.length > 1 && (
              <button onClick={() => removeOutcome(i)} className="size-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ background: isDark ? "rgba(255,82,34,0.1)" : "#fff4ed" }}>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="#ff5222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        ))}

        <button onClick={addOutcome} className="flex items-center justify-center gap-1 h-10 rounded-lg cursor-pointer border border-dashed" style={{ borderColor: t.inputBorder, color: t.textSec, ...ss, ...pp }}>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span className="text-[12px]">Magdagdag ng Outcome</span>
        </button>
      </div>

      {/* Risk Notice */}
      <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: isDark ? "rgba(255,82,34,0.05)" : "#fffaf8", border: `1px solid ${isDark ? "rgba(255,82,34,0.1)" : "rgba(255,82,34,0.08)"}` }}>
        <span className="text-[12px]" style={{ color: "#ff5222", fontWeight: 600, ...ss, ...pp }}>* Paalala sa Panganib:</span>
        <span className="text-[11px]" style={{ color: t.textSec, ...ss, ...pp }}>
          Bilang creator, hindi ka pwedeng kumita direkta mula sa panalo o talo ng users. Ang kita ay nagmumula lang sa preset creator fee.
          Kung walang participation ang market o hindi maayos ang design, maaaring malugi ka sa pool loss.
          Ang resolution source ay kailangang malinaw at ma-verify. Kung hindi, maaaring i-challenge o alisin ng platform ang market.
        </span>
      </div>

      {/* Agreement */}
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="size-5 rounded border flex items-center justify-center" style={{ borderColor: agreed ? "#ff5222" : t.inputBorder, background: agreed ? "#ff5222" : "transparent" }}
          onClick={() => setAgreed(!agreed)}>
          {agreed && <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        <span className="text-[13px]" style={{ color: t.text, ...ss, ...pp }}>
          Sumasang-ayon ako sa <span className="text-[#ff5222] cursor-pointer">terms and rules</span>
        </span>
      </label>

      {/* Submit */}
      <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit}
        className="h-12 rounded-xl text-[15px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed w-fit px-12"
        style={{ background: isDark ? (canSubmit ? "#ff5222" : "rgba(255,255,255,0.06)") : (canSubmit ? "#ff5222" : "#f5f6f7"), color: canSubmit ? "#fff" : t.textMut, fontWeight: 500, ...ss, ...pp }}>
        I-submit
      </button>
    </div>
  );
}

/* ====================================================================
   MAIN PAGE
   ==================================================================== */
export default function CreatorPage() {
  const { isLoggedIn, darkMode: isDark, toggleDarkMode } = useAuth();
  const t = isDark ? dark : light;
  const [view, setView] = useState<"apply" | "center" | "create">("center");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const modalTheme: ModalTheme = {
    bg: t.bg, card: t.card, cardBorder: t.cardBorder,
    text: t.text, textSec: t.textSec, textMut: t.textMut, textFaint: t.textFaint,
    inputBg: t.inputBg, inputBorder: t.inputBorder,
    greenBg: t.greenBg, greenText: t.greenText, orangeBg: t.orangeBg, orangeText: t.orangeText,
    isDark,
  };

  return (
    <ThemeCtx.Provider value={{ t, isDark, toggle: toggleDarkMode }}>
      <div className="flex h-screen w-full overflow-hidden" style={{ ...pp, background: t.bg }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />

        <div className="flex flex-col flex-1 min-w-0">
          <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

          <div className="flex-1 overflow-y-auto" style={{ background: t.bg }}>
            {!isLoggedIn ? (
              <CreatorLanding />
            ) : (
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Navigation pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {([
                  { key: "apply" as const, label: "Maging Creator", icon: "📝" },
                  { key: "center" as const, label: "Creator Center", icon: "📊" },
                  { key: "create" as const, label: "Gumawa ng Market", icon: "➕" },
                ] as const).map(nav => (
                  <button key={nav.key} onClick={() => setView(nav.key)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] cursor-pointer transition-all"
                    style={{
                      background: view === nav.key ? (isDark ? "rgba(255,82,34,0.12)" : "rgba(255,82,34,0.06)") : t.inputBg,
                      border: `1px solid ${view === nav.key ? "#ff5222" : "transparent"}`,
                      color: view === nav.key ? "#ff5222" : t.textSec,
                      fontWeight: view === nav.key ? 600 : 400, ...ss, ...pp,
                    }}>
                    <EmojiIcon emoji={nav.icon} size={14} />{nav.label}
                  </button>
                ))}

                {/* Theme toggle */}
                <div className="ml-auto shrink-0">
                  <ThemeToggle />
                </div>
              </div>

              {/* Content */}
              {view === "apply" && <CreatorApplication onComplete={() => setView("center")} />}
              {view === "center" && <CreatorCenter onCreateMarket={() => setView("create")} />}
              {view === "create" && <CreateMarket onBack={() => setView("center")} />}

            </div>
            )}
            <Footer />
          </div>
        </div>
      </div>
      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode={modalMode} theme={modalTheme} balance={23450} />
    </ThemeCtx.Provider>
  );
}
