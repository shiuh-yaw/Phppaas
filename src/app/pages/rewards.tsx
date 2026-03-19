import { useState } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-ixlhu29lkb";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  GiftIcon as TTGiftIcon, MoneyIcon as TTMoneyIcon, BasketballIcon, DiceIcon,
  BoxingIcon, StarIcon as TTStarIcon, EsportsIcon, CrownIcon,
  HandshakeIcon, FireIcon as TTFireIcon, LightningIcon as TTLightningIcon,
  EmojiIcon, EconomyIcon as TTEconomyIcon,
} from "../components/two-tone-icons";
import type { ComponentType } from "react";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ====================== TASK DATA ====================== */
type TaskStatus = "claimed" | "claim" | "go" | "locked";

interface RewardTask {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  upTo?: boolean;
  status: TaskStatus;
  category: string;
  tier: number;
  emoji: string;
  Icon?: ComponentType<{ size?: number; className?: string }>;
  route?: string;
}

const NEWCOMER_TASKS: RewardTask[] = [
  {
    id: "signup",
    title: "Sign Up Bonus",
    description: "Mag-register at makakuha ng ₱300 bonus agad!",
    amount: 300,
    currency: "PHP",
    status: "claimed",
    category: "Welcome",
    tier: 0,
    emoji: "🎁",
    Icon: TTGiftIcon,
  },
  {
    id: "deposit",
    title: "Unang Deposit Bonus",
    description: "Mag-deposit ng kahit magkano gamit GCash, Maya, o bank transfer para makakuha ng bonus hanggang ₱500.",
    amount: 500,
    currency: "PHP",
    upTo: true,
    status: "go",
    category: "Deposit",
    tier: 0,
    emoji: "💰",
    Icon: TTMoneyIcon,
    route: "/deposit",
  },
  {
    id: "pba-bet",
    title: "Unang Taya sa PBA",
    description: "Tumaya sa kahit anong PBA market — Philippine Cup, Commissioner's Cup, o Governors' Cup.",
    amount: 200,
    currency: "PHP",
    upTo: true,
    status: "go",
    category: "Basketball",
    tier: 1,
    emoji: "🏀",
    Icon: BasketballIcon,
    route: "/markets",
  },
  {
    id: "color-bet",
    title: "Unang Taya sa Color Game",
    description: "Taya sa paborito mong kulay — Pula, Asul, Berde, Dilaw, Puti, o Pink!",
    amount: 200,
    currency: "PHP",
    upTo: true,
    status: "go",
    category: "Color Game",
    tier: 1,
    emoji: "🎲",
    Icon: DiceIcon,
    route: "/markets",
  },
  {
    id: "boxing-bet",
    title: "Unang Taya sa Boxing",
    description: "Pumili ng fighter sa live na boxing match. Sino panalo — Donaire o Inoue?",
    amount: 200,
    currency: "PHP",
    upTo: true,
    status: "go",
    category: "Boxing",
    tier: 2,
    emoji: "🥊",
    Icon: BoxingIcon,
    route: "/markets",
  },
  {
    id: "creator-trade",
    title: "Creator Markets Bonus",
    description: "Tumaya sa kahit anong Creator Market para makakuha ng bonus.",
    amount: 150,
    currency: "PHP",
    upTo: true,
    status: "locked",
    category: "Creator",
    tier: 2,
    emoji: "💡",
    Icon: TTStarIcon,
    route: "/creator",
  },
];

const WEEKLY_TASKS: RewardTask[] = [
  {
    id: "weekly-pba",
    title: "PBA Weekly Challenge",
    description: "Tumaya ng 5 beses sa PBA markets ngayong linggo. Kasama ang match winner, point spread, o MVP predictions.",
    amount: 100,
    currency: "PHP",
    status: "go",
    category: "Basketball",
    tier: 1,
    emoji: "🏀",
    Icon: BasketballIcon,
    route: "/markets",
  },
  {
    id: "weekly-nba",
    title: "NBA Huddle Bonus",
    description: "Mag-trade sa 3 NBA games ngayong linggo — match winner, over/under, o quarter winner.",
    amount: 100,
    currency: "PHP",
    status: "go",
    category: "Basketball",
    tier: 1,
    emoji: "🏀",
    Icon: BasketballIcon,
    route: "/markets",
  },
  {
    id: "weekly-colorgame",
    title: "Color Game Streak",
    description: "Manalo ng 3 sunod-sunod na Color Game round sa isang araw. Piliin ang tamang kulay!",
    amount: 150,
    currency: "PHP",
    status: "go",
    category: "Color Game",
    tier: 1,
    emoji: "🎲",
    Icon: DiceIcon,
    route: "/markets",
  },
  {
    id: "weekly-boxing",
    title: "Boxing Prediction Master",
    description: "Hulaan ang method of victory (KO, TKO, Decision) sa kahit anong boxing match.",
    amount: 200,
    currency: "PHP",
    upTo: true,
    status: "locked",
    category: "Boxing",
    tier: 2,
    emoji: "🥊",
    Icon: BoxingIcon,
    route: "/markets",
  },
  {
    id: "weekly-esports",
    title: "MLBB / Valorant Weekly",
    description: "Tumaya sa 3 esports matches — Mobile Legends, Valorant, o Dota 2.",
    amount: 100,
    currency: "PHP",
    status: "locked",
    category: "Esports",
    tier: 2,
    emoji: "🎮",
    Icon: EsportsIcon,
    route: "/markets",
  },
  {
    id: "weekly-volume",
    title: "Volume King ng Linggo",
    description: "Umabot ng ₱10,000 total volume sa kahit anong market ngayong linggo.",
    amount: 250,
    currency: "PHP",
    status: "go",
    category: "All",
    tier: 0,
    emoji: "👑",
    Icon: CrownIcon,
  },
  {
    id: "weekly-referral",
    title: "Mag-imbita ng Kaibigan",
    description: "I-share ang ForeGate sa kaibigan mo. Kapag nag-sign up sila, parehong may bonus!",
    amount: 100,
    currency: "PHP",
    status: "go",
    category: "Referral",
    tier: 0,
    emoji: "🤝",
    Icon: HandshakeIcon,
  },
];

const FAQ_ITEMS = [
  {
    q: "Ano ang ForeGate / Lucky Taya?",
    a: "Ang ForeGate ay isang prediction market platform na ginawa para sa mga Pilipino. Mula sa PBA, Color Game, boxing, esports, hanggang sa weather at economy — lahat pwede tayaan dito nang ligal at transparent, lisensyado ng PAGCOR.",
  },
  {
    q: "Ano ang Prediction Market?",
    a: "Ang prediction market ay isang platform kung saan pwede kang bumili o magbenta ng shares base sa tingin mong mangyayari sa isang event. Halimbawa, kung tingin mo mananalo ang Ginebra sa PBA Finals, bibili ka ng 'Oo' shares. Kapag tama ka, kikita ka!",
  },
  {
    q: "Paano mag-deposit?",
    a: "Super easy lang! Pwede kang mag-deposit gamit ang GCash, Maya (PayMaya), bank transfer (BDO, BPI, Metrobank, UnionBank, LandBank), o over-the-counter sa 7-Eleven, Cebuana, at Palawan. Lahat ng transaction ay sa Philippine Peso (₱).",
  },
  {
    q: "Anong markets ang pwede tayaan?",
    a: "Tier 1 — Pinakapopular: Basketball (PBA + NBA) at Color Game. Tier 2 — Patok na Patok: Boxing, Esports (MLBB, Valorant, Dota 2), at Bingo. Tier 3 — Growth Markets: Lottery (PCSO-style), Entertainment, Weather/Typhoon, at Economic predictions.",
  },
  {
    q: "Paano ko makukuha ang rewards?",
    a: "I-complete lang ang task na nakasulat, tapos i-click ang 'Kunin' button para ma-claim ang bonus. Ang newcomer tasks ay kailangan ma-complete within 7 araw ng registration. Ang weekly tasks ay nire-reset tuwing Lunes.",
  },
  {
    q: "Ano ang Creator?",
    a: "Ang Creator ay isang user na pwedeng gumawa ng sariling prediction market. Halimbawa, pwede kang gumawa ng market na 'Sino ang MVP ng PBA Philippine Cup 2026?' Kikita ka sa trading fees ng market na ginawa mo!",
  },
];

/* ====================== COMPONENT ====================== */
export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<"newcomer" | "weekly">("newcomer");
  const [tasks, setTasks] = useState(NEWCOMER_TASKS);
  const [weeklyTasks] = useState(WEEKLY_TASKS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  const currentTasks = activeTab === "newcomer" ? tasks : weeklyTasks;
  const totalClaimed = tasks.filter(t => t.status === "claimed").reduce((s, t) => s + t.amount, 0);
  const totalPossible = [...NEWCOMER_TASKS, ...WEEKLY_TASKS].reduce((s, t) => s + t.amount, 0);

  const handleClaim = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id && t.status === "claim" ? { ...t, status: "claimed" as TaskStatus } : t));
  };

  const getStatusButton = (task: RewardTask) => {
    switch (task.status) {
      case "claimed":
        return (
          <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg" style={{ background: "#e6fff3" }}>
            <svg className="size-4" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 010 1.4l-6 6a1 1 0 01-1.4 0l-3-3a1 1 0 011.4-1.4L6.6 9.6l5.3-5.3a1 1 0 011.4 0z" fill="#00bf85"/></svg>
            <span className="text-[14px]" style={{ color: "#00bf85", fontWeight: 600, ...ss, ...pp }}>Nakuha na</span>
          </div>
        );
      case "claim":
        return (
          <button onClick={() => handleClaim(task.id)}
            className="bg-[#ff5222] hover:bg-[#e84a1e] text-white px-5 py-2.5 rounded-lg cursor-pointer transition-colors"
            style={{ fontWeight: 600, ...ss, ...pp }}>
            <span className="text-[14px]">Kunin</span>
          </button>
        );
      case "go":
        return (
          <button onClick={() => task.route && navigate(task.route)}
            className="px-5 py-2.5 rounded-lg cursor-pointer transition-colors border"
            style={{ background: "#fff", borderColor: "#e5e7ea", ...ss, ...pp }}>
            <span className="text-[14px]" style={{ color: "#070808", fontWeight: 600 }}>
              {task.category === "Deposit" ? "Mag-deposit" : "Tumaya"}
            </span>
          </button>
        );
      case "locked":
        return (
          <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg" style={{ background: "#f5f6f7" }}>
            <svg className="size-4" viewBox="0 0 16 16" fill="none"><path d="M12 7H4a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1zM6 7V5a2 2 0 114 0v2" stroke="#a0a3a7" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            <span className="text-[14px]" style={{ color: "#a0a3a7", fontWeight: 500, ...ss, ...pp }}>Naka-lock</span>
          </div>
        );
    }
  };

  // Group tasks by section
  const welcomeTasks = currentTasks.filter(t => t.tier === 0 || t.category === "Welcome" || t.category === "Deposit" || t.category === "Referral" || t.category === "All");
  const tier1Tasks = currentTasks.filter(t => t.tier === 1);
  const tier2Tasks = currentTasks.filter(t => t.tier === 2);

  const renderSection = (title: string, emoji: string, sectionTasks: RewardTask[], subtitle?: string) => {
    if (sectionTasks.length === 0) return null;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 py-3">
          <EmojiIcon emoji={emoji} size={24} />
          <div className="flex flex-col">
            <span className="text-[18px]" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>{title}</span>
            {subtitle && <span className="text-[12px]" style={{ color: "#84888c", ...ss, ...pp }}>{subtitle}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {sectionTasks.map(task => (
            <div key={task.id} className="flex items-center gap-6 pl-4 pr-8 py-4 rounded-2xl border transition-colors hover:shadow-sm"
              style={{ background: "#fff", borderColor: "#f0f1f3" }}>
              {/* Amount badge */}
              <div className="flex flex-col items-center justify-center px-5 py-3 rounded-lg shrink-0 w-[120px]"
                style={{ background: task.status === "claimed" ? "#e6fff3" : "rgba(255,82,34,0.06)" }}>
                {task.upTo && (
                  <span className="text-[12px]" style={{ color: task.status === "claimed" ? "#00bf85" : "#ff5222", ...ss, ...pp }}>Hanggang</span>
                )}
                <span className="text-[32px]" style={{ color: task.status === "claimed" ? "#00bf85" : "#ff5222", fontWeight: 600, ...ss, ...pp, lineHeight: 1 }}>
                  {task.amount}
                </span>
                <span className="text-[13px]" style={{ color: task.status === "claimed" ? "#00bf85" : "#ff5222", ...ss, ...pp }}>PHP</span>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  {task.Icon ? <task.Icon size={24} /> : <EmojiIcon emoji={task.emoji} size={24} />}
                  <span className="text-[16px]" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>{task.title}</span>
                  {task.tier > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                      background: task.tier === 1 ? "#fff4ed" : task.tier === 2 ? "#eef4ff" : "#f5f6f7",
                      color: task.tier === 1 ? "#ff5222" : task.tier === 2 ? "#3b82f6" : "#84888c",
                      fontWeight: 600, ...ss, ...pp,
                    }}>
                      Tier {task.tier}
                    </span>
                  )}
                </div>
                <span className="text-[13px]" style={{ color: "#84888c", ...ss, ...pp }}>{task.description}</span>
              </div>

              {/* Action */}
              {getStatusButton(task)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f8fa]" style={pp}>
      <Sidebar onDeposit={openDeposit} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <AuthGate pageName="Rewards">
        <div className="flex-1 overflow-y-auto">
          {/* ========== HERO SECTION ========== */}
          <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0b0d 0%, #1a1b1f 100%)" }}>
            {/* Background glow effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-[600px] h-[400px] rounded-full opacity-15"
                style={{ background: "radial-gradient(ellipse, #ff5222 0%, transparent 70%)" }} />
              <div className="absolute -bottom-10 left-1/4 w-[400px] h-[300px] rounded-full opacity-10"
                style={{ background: "radial-gradient(ellipse, #eb2f96 0%, transparent 70%)" }} />
            </div>

            <div className="max-w-[1200px] mx-auto px-8 py-16 flex items-center justify-between relative z-10">
              <div className="flex flex-col gap-5 max-w-[550px]">
                <div>
                  <h1 className="text-[48px] text-white" style={{ fontWeight: 600, ...ss, ...pp, lineHeight: 1.15 }}>
                    Bagong Member Bonus{" "}
                    <span className="text-[#ff5222]">Hanggang ₱5,000</span>
                  </h1>
                  <p className="text-[15px] mt-3" style={{ color: "rgba(255,255,255,0.55)", ...ss, ...pp, lineHeight: 1.6 }}>
                    I-complete ang mga tasks within 7 araw ng registration para makuha ang rewards. Lahat ng bonus ay sa Philippine Peso (₱) at pwedeng i-withdraw sa GCash o Maya!
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-6 px-6 py-3 rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <div className="flex flex-col">
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)", ...ss, ...pp }}>Nakuha mo na</span>
                      <span className="text-[22px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>₱{totalClaimed.toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer transition-colors hover:opacity-90"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    onClick={() => { /* share */ }}>
                    <svg className="size-4" fill="none" viewBox="0 0 14.0004 11.5021"><path d={svgPaths.p1d05cc80} fill="white" /></svg>
                    <span className="text-[14px] text-white" style={{ fontWeight: 500, ...ss, ...pp }}>I-share</span>
                  </button>
                </div>

                {/* Payment methods badge */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)", ...ss, ...pp }}>Deposit via:</span>
                    <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>GCash</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>&middot;</span>
                    <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>Maya</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>&middot;</span>
                    <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>BDO</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>&middot;</span>
                    <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>BPI</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>&middot;</span>
                    <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>7-Eleven</span>
                  </div>
                </div>
              </div>

              {/* Right side - decorative hero image */}
              <div className="relative w-[380px] h-[280px] shrink-0">
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1763194797397-98cf045773ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                    alt="Rewards"
                    className="size-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,82,34,0.3), rgba(235,47,150,0.2))" }} />
                </div>
                {/* Floating badges */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="text-[18px]">🇵🇭</span>
                  <span className="text-[11px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>PAGCOR Licensed</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-[#ff5222] px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-[20px]">₱</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/70" style={ss}>Philippine Peso</span>
                    <span className="text-[14px] text-white" style={{ fontWeight: 600, ...ss, ...pp }}>Exclusive PHP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== TABS ========== */}
          <div className="max-w-[1200px] mx-auto px-8 pt-10">
            <div className="flex items-center justify-center gap-8">
              {([["newcomer", "Bagong Member Tasks"], ["weekly", "Weekly Tasks"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className="relative pb-2.5 cursor-pointer transition-colors">
                  <span className="text-[14px]" style={{
                    color: activeTab === key ? "#070808" : "#84888c",
                    fontWeight: activeTab === key ? 600 : 400,
                    ...ss, ...pp,
                  }}>
                    {label}
                  </span>
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ========== TASK SECTIONS ========== */}
          <div className="max-w-[1200px] mx-auto px-8 py-8 flex flex-col gap-10">
            {/* Welcome / General */}
            {welcomeTasks.length > 0 && renderSection(
              activeTab === "newcomer" ? "WELCOME GIFT" : "LINGGUHANG HAMON",
              activeTab === "newcomer" ? "🎁" : "🏆",
              welcomeTasks,
              activeTab === "newcomer" ? "Simulan ang iyong ForeGate journey!" : "Mga general na weekly challenge"
            )}

            {/* Tier 1 - Must Have */}
            {tier1Tasks.length > 0 && renderSection(
              "TIER 1 — PINAKAPOPULAR",
              "🔥",
              tier1Tasks,
              "Basketball (PBA + NBA) at Color Game — ang pinakasikat sa Pilipinas!"
            )}

            {/* Tier 2 - Patok na Patok */}
            {tier2Tasks.length > 0 && renderSection(
              "TIER 2 — PATOK NA PATOK",
              "🥊",
              tier2Tasks,
              "Boxing, Esports (MLBB, Valorant, Dota 2), at Bingo"
            )}

            {/* Tier Progress Card */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: "#fff", borderColor: "#f0f1f3" }}>
              <div className="flex items-center justify-between">
                <span className="text-[16px]" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>Tier Progress mo</span>
                <span className="text-[13px]" style={{ color: "#84888c", ...ss, ...pp }}>
                  {tasks.filter(t => t.status === "claimed").length} / {tasks.length} tasks na-complete
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#f0f1f3" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(tasks.filter(t => t.status === "claimed").length / tasks.length) * 100}%`,
                    background: "linear-gradient(90deg, #ff5222, #eb2f96)",
                  }} />
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "Tier 1 — Pinakapopular", Icon: TTFireIcon, color: "#ff5222", bg: "#fff4ed" },
                  { label: "Tier 2 — Patok na Patok", Icon: BoxingIcon, color: "#3b82f6", bg: "#eef4ff" },
                  { label: "Tier 3 — Growth Markets", Icon: TTEconomyIcon, color: "#8b5cf6", bg: "#f3f0ff" },
                ].map(tier => (
                  <div key={tier.label} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: tier.bg }}>
                    <tier.Icon size={18} />
                    <span className="text-[12px]" style={{ color: tier.color, fontWeight: 500, ...ss, ...pp }}>{tier.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== RULES AND TERMS ========== */}
            <div className="py-16 flex flex-col gap-6">
              <h2 className="text-[32px] text-center" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>
                Mga Patakaran at Tuntunin
              </h2>
              <ul className="flex flex-col gap-2 text-[14px]" style={{ color: "#84888c", ...ss, ...pp, lineHeight: 1.6 }}>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Kailangan i-complete ang newcomer tasks within 7 araw ng registration para maging eligible sa reward. Kung hindi, mawa-forfeit na ang bonus.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Ang trading bonus ay kina-calculate base sa PHP markets lamang. Lahat ng halaga ay sa Philippine Peso (₱).</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Kailangan i-claim manually ang bonus sa loob ng monitoring period, o automatic na icre-credit sa account mo pagkatapos ng period.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>May karapatan ang ForeGate na baguhin ang mga terms na ito nang walang paunang abiso.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Ang final interpretation ng event na ito ay pag-aari ng ForeGate. Kung may mga tanong, i-contact ang Customer Support.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>May karapatan ang ForeGate na i-disqualify ang sinumang participant na nahuling gumagawa ng dishonest o abusive na behavior, kasama ang bulk account registrations o illegal na aktibidad.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Ang ForeGate / Lucky Taya ay naka-comply sa PAGCOR regulations. Lahat ng operations ay ligal at transparent.</span>
                </li>
              </ul>
            </div>

            {/* ========== FAQ ========== */}
            <div className="py-10 flex flex-col gap-6">
              <h2 className="text-[32px] text-center" style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}>
                Mga Madalas Itanong (FAQ)
              </h2>
              <div className="flex flex-col">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border-b" style={{ borderColor: "#f0f1f3" }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-4 cursor-pointer text-left">
                      <span className="text-[15px]" style={{ color: "#070808", fontWeight: 500, ...ss, ...pp }}>{item.q}</span>
                      <svg className={`size-4 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                        viewBox="0 0 6 4.68" fill="none">
                        <path d="M6 0V1.5L3 4.68L0 1.5V0H6Z" fill={openFaq === i ? "#ff5222" : "#a0a3a7"} />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="pb-4">
                        <p className="text-[13px]" style={{ color: "#84888c", ...ss, ...pp, lineHeight: 1.7 }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ========== FOOTER ========== */}
            {/* removed inline footer — using shared <Footer /> */}
          </div>
          <Footer />
        </div>
        </AuthGate>
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