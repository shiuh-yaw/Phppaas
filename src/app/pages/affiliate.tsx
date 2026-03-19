import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { DepositWithdrawModal } from "../components/deposit-withdraw-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AffiliateDashboard } from "../components/affiliate-dashboard";
import {
  LinkIcon as TTLinkIcon, HandshakeIcon, MoneyIcon, ChartIcon,
  CameraIcon, BarChartIcon, PeopleIcon, MegaphoneIcon,
  ImageIcon as TTImageIcon, PackageIcon, TargetIcon,
  RocketIcon, UserCheckIcon, CheckCircleIcon, EmojiIcon,
} from "../components/two-tone-icons";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const LIGHT_THEME = {
  bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
  text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
  inputBg: "#fafafa", inputBorder: "#f5f6f7",
  greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
  isDark: false,
};

const HERO_BG = "https://images.unsplash.com/photo-1608521704450-893e5ac294fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

/* ==================== APPLICATION FLOW ==================== */
type AppStep = "landing" | "apply" | "verify" | "welcome" | "dashboard";

/* ==================== LANDING SECTIONS ==================== */
const STATS = [
  { value: "₱2M+", label: "Na-bayad sa Affiliates" },
  { value: "5,000+", label: "Aktibong Affiliates" },
  { value: "Hanggang 50%", label: "Commission Rate" },
];

const WHY_JOIN = [
  {
    icon: TTLinkIcon,
    title: "I-share ang Lucky Taya",
    desc: "I-share ang Lucky Taya sa mga kaibigan mo at kumita ng hanggang 50% commission sa bawat referral. Libong affiliates na ang kumikita ng passive income!",
  },
  {
    icon: HandshakeIcon,
    title: "Maging Affiliate Partner",
    desc: "Mag-promote ng Lucky Taya sa audience mo at kumita ng commission sa bawat sign-up at deposit nila. Simulan agad ngayon!",
  },
  {
    icon: MoneyIcon,
    title: "Kumita ng Passive Income",
    desc: "I-share ang Lucky Taya sa mga kaibigan, pamilya, at followers. Kumita kahit tulog ka — automatic ang commission payout via GCash o Maya!",
  },
  {
    icon: ChartIcon,
    title: "Real-time na Commission Tracking",
    desc: "I-track ang referrals, earnings, at commission mo in real-time. Transparent ang system — walang hidden fees o tinatago sa iyo.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Mag-apply",
    desc: "I-share ang info mo at mag-sign up. Libong affiliates na ang kumikita sa Lucky Taya — prediction market platform ng mga Pilipino.",
  },
  {
    num: "02",
    title: "I-activate ang Account",
    desc: "Gamitin ang Lucky Taya, i-share ang referral link mo, at simulan na mag-earn ng commission. Ang bawat referral ay may unique tracking link.",
  },
  {
    num: "03",
    title: "Kumita ng Commission",
    desc: "Kumita sa bawat referral at deposit. I-withdraw ang earnings mo via GCash, Maya, o Bank Transfer. Walang minimum payout!",
  },
];

const TIERS = [
  {
    name: "Standard Affiliate",
    color: "#ff5222",
    features: ["30% commission", "30-day na cookie", "Basic dashboard access"],
  },
  {
    name: "Premium Affiliate",
    color: "#ff5222",
    features: ["40% commission", "60-day na cookie", "Priority support", "Marketing materials"],
  },
  {
    name: "Elite Affiliate",
    color: "#ff5222",
    features: ["50% commission", "90-day na cookie", "Dedicated manager", "Custom banners", "Early access features"],
  },
];

const WHO_CAN_JOIN = [
  { icon: CameraIcon, title: "Content Creators\n& Influencers" },
  { icon: BarChartIcon, title: "Sports & Betting\nBloggers" },
  { icon: PeopleIcon, title: "Community Leaders\n& KOLs" },
  { icon: MegaphoneIcon, title: "Kahit sinong\nmay Audience" },
];

const RESOURCES = [
  { icon: TTImageIcon, title: "Banners" },
  { icon: TTLinkIcon, title: "Links" },
  { icon: PackageIcon, title: "Widgets" },
  { icon: ChartIcon, title: "Analytics" },
];

const FAQ_DATA = [
  {
    q: "Paano ako makakakuha ng bayad?",
    a: "Automatic ang payout sa GCash, Maya, o Bank Transfer. Puwede kang mag-withdraw kahit kailan — walang minimum payout amount. Maa-process sa loob ng 24 oras.",
  },
  {
    q: "May minimum payout ba?",
    a: "Wala! Kahit ₱1 lang ang commission mo, puwede mo nang i-withdraw. Walang holding period o minimum threshold.",
  },
  {
    q: "Matitrack ko ba ang performance ko?",
    a: "Oo! Real-time analytics ang affiliate dashboard. Makikita mo ang clicks, sign-ups, deposits, at commission mo in real-time. May breakdown pa per referral.",
  },
  {
    q: "Anong marketing materials ang available?",
    a: "May ready-made banners, social media posts, referral links, at embed widgets. Lahat ay customizable at may tracking. Available ang PH-localized materials.",
  },
];

const PROMOTION_METHODS = [
  { id: "social", label: "Social Media (FB, IG, TikTok)", icon: "📱" },
  { id: "youtube", label: "YouTube / Vlogging", icon: "🎥" },
  { id: "blog", label: "Blog / Website", icon: "💻" },
  { id: "community", label: "Community / Group Chat", icon: "👥" },
  { id: "word", label: "Word of Mouth / Personal", icon: "🗣️" },
  { id: "other", label: "Iba pa", icon: "✨" },
];

/* ==================== MAIN PAGE ==================== */
export default function AffiliatePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  // Application state
  const [step, setStep] = useState<AppStep>("landing");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [promoMethod, setPromoMethod] = useState("");
  const [promoDropdown, setPromoDropdown] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const canSubmitApp = agreed && fullName.length > 0 && email.length > 0 && promoMethod.length > 0;
  const canVerify = verifyCode.every(d => d.length > 0);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...verifyCode];
    next[index] = value;
    setVerifyCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const copyLink = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = "https://luckytaya.ph/ref/juan123";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch {
      // silent fail
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = "https://luckytaya.ph/ref/juan123";

  /* ==================== RENDER: APPLICATION FORM (Step 1) ==================== */
  const renderApplyForm = () => (
    <div className="flex items-start justify-center py-10 sm:py-16 px-4">
      <div className="bg-white rounded-2xl border border-[#f5f6f7] w-full max-w-[400px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-1">
          <h2 className="text-[22px] sm:text-[24px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>
            Sumali sa Affiliate Program
          </h2>
          <p className="text-[12px] text-[#84888c] mt-1" style={{ ...ss, ...pp }}>
            Simulan kumita ng commission sa pag-share ng Lucky Taya sa audience mo. Mag-sign up gamit ang email mo.
          </p>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-2 flex items-center gap-1">
          <div className="bg-[#070808] h-1.5 w-6 rounded-sm" />
          <div className="bg-[#f2f3f4] h-1.5 w-1.5 rounded-sm" />
          <div className="bg-[#f2f3f4] h-1.5 w-1.5 rounded-sm" />
        </div>

        {/* Form */}
        <div className="px-6 pt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-0.5">
            <label className="text-[14px] text-[#070808]" style={{ ...ss, ...pp }}>Buong Pangalan</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="I-enter ang buong pangalan mo"
              className="h-12 px-4 rounded-lg bg-[#fafafa] text-[14px] outline-none" style={{ color: "#070808", ...ss, ...pp }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[14px] text-[#070808]" style={{ ...ss, ...pp }}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="I-enter ang email address mo"
              type="email"
              className="h-12 px-4 rounded-lg bg-[#fafafa] text-[14px] outline-none" style={{ color: "#070808", ...ss, ...pp }} />
          </div>
          <div className="flex flex-col gap-0.5 relative">
            <label className="text-[14px] text-[#070808]" style={{ ...ss, ...pp }}>Paano mo ipo-promote ang Lucky Taya?</label>
            <button onClick={() => setPromoDropdown(!promoDropdown)}
              className="h-12 px-4 rounded-lg bg-[#fafafa] text-[14px] flex items-center justify-between cursor-pointer text-left"
              style={{ color: promoMethod ? "#070808" : "#84888c", ...ss, ...pp }}>
              <span>{promoMethod ? PROMOTION_METHODS.find(m => m.id === promoMethod)?.label : "Pumili ng paraan"}</span>
              <svg className={`size-4 transition-transform ${promoDropdown ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="#84888c" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {promoDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg border border-[#f0f1f3] shadow-lg py-1 max-h-[200px] overflow-y-auto">
                {PROMOTION_METHODS.map(m => (
                  <button key={m.id} onClick={() => { setPromoMethod(m.id); setPromoDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[14px] text-left cursor-pointer hover:bg-[#fafafa] transition-colors"
                    style={{ color: "#070808", ...ss, ...pp }}>
                    <EmojiIcon emoji={m.icon} size={14} /> {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <div className="size-[18px] rounded border flex items-center justify-center shrink-0 mt-0.5"
              style={{ borderColor: agreed ? "#ff5222" : "#dfe0e2", background: agreed ? "#ff5222" : "transparent" }}
              onClick={() => setAgreed(!agreed)}>
              {agreed && <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span className="text-[13px] text-[#070808]" style={{ ...ss, ...pp }}>
              Sumasang-ayon ako sa <span className="text-[#ff5222] cursor-pointer">Affiliate Program Terms and Conditions</span>
            </span>
          </label>
          <button onClick={() => canSubmitApp && setStep("verify")} disabled={!canSubmitApp}
            className="h-12 bg-[#070808] text-white rounded-lg text-[16px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            Magpatuloy
          </button>
          <p className="text-[14px] text-center" style={{ color: "#070808", ...ss, ...pp }}>
            May account ka na? <span className="text-[#ff5222] cursor-pointer" onClick={() => setStep("welcome")}>Mag-log in</span>
          </p>
        </div>
      </div>
    </div>
  );

  /* ==================== RENDER: VERIFY EMAIL (Step 2) ==================== */
  const renderVerify = () => (
    <div className="flex items-start justify-center py-[80px] px-4">
      <div className="bg-white rounded-[16px] w-full max-w-[392px] flex flex-col items-start relative">
        <div aria-hidden="true" className="absolute inset-0 border border-[#f5f6f7] rounded-[16px] pointer-events-none" />

        {/* Header group */}
        <div className="flex flex-col items-start w-full">
          {/* Title row */}
          <div className="pt-[24px] px-[24px] w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-[24px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>
                I-verify ang Email Mo
              </p>
              <button onClick={() => setStep("apply")} className="size-[20px] flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <svg className="size-[13px]" viewBox="0 0 13.13 13.13" fill="none">
                  <path d="M12.13 1L1 12.13M1 1l11.13 11.13" stroke="#070808" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="px-[24px] w-full">
            <p className="text-[12px] text-[#84888c] leading-[1.5]" style={{ ...ss, ...pp }}>
              Nag-send kami ng 6-digit verification code sa{" "}
              <span className="text-[#070808]" style={{ fontWeight: 500, ...ss }}>{email || "juan@email.com"}</span>.
              {" "}I-enter ito sa ibaba para ma-verify ang email mo.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-[24px] py-[8px] w-full flex items-start gap-[4px]">
          <div className="bg-[#070808] rounded-[2px] size-[6px]" />
          <div className="bg-[#070808] h-[6px] w-[24px] rounded-[2px]" />
          <div className="bg-[#f2f3f4] rounded-[2px] size-[6px]" />
        </div>

        {/* Code inputs */}
        <div className="w-full">
          <div className="flex flex-col items-center w-full">
            <div className="pt-[24px] px-[24px] w-full">
              <div className="bg-white flex flex-col items-start w-full">
                {/* 6-digit input row */}
                <div className="flex gap-[8px] items-start w-full">
                  {verifyCode.map((digit, i) => (
                    <input key={i}
                      ref={el => { codeRefs.current[i] = el; }}
                      value={digit}
                      onChange={e => handleCodeChange(i, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      placeholder="0"
                      className="flex-1 min-w-0 h-[48px] bg-[#fafafa] rounded-[8px] text-center text-[18px] outline-none focus:ring-2 focus:ring-[#ff5222]/20 transition-shadow"
                      style={{ color: "#070808", fontWeight: 600, ...ss, ...pp }}
                    />
                  ))}
                </div>
                {/* Resend code link */}
                <div className="flex items-center justify-end w-full mt-[2px]">
                  <p className="text-[12px] text-[#070808] underline cursor-pointer text-right leading-[1.5]" style={{ ...ss, ...pp }}>
                    Resend code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verify button */}
        <div className="p-[24px] w-full">
          <button onClick={() => setStep("welcome")} disabled={!canVerify}
            className="w-full h-[48px] bg-[#070808] text-white rounded-[8px] text-[16px] text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            I-verify ang Email
          </button>
        </div>
      </div>
    </div>
  );

  /* ==================== RENDER: WELCOME (Step 3) ==================== */
  const renderWelcome = () => (
    <div className="flex items-start justify-center py-10 sm:py-16 px-4">
      <div className="bg-white rounded-2xl border border-[#f5f6f7] w-full max-w-[400px] overflow-hidden">
        {/* Success */}
        <div className="flex flex-col items-center pt-6 px-6 gap-4">
          <div className="size-[68px] rounded-full bg-[#00BF85] flex items-center justify-center">
            <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-[22px] sm:text-[24px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>
              Welcome sa Affiliate Program!
            </h2>
            <p className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>
              Na-verify na ang account mo at part ka na ng Lucky Taya Affiliate Program. Simulan na kumita!
            </p>
          </div>
        </div>

        {/* Referral + Details */}
        <div className="px-6 pt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-0.5">
            <label className="text-[14px] text-[#070808]" style={{ ...ss, ...pp }}>Referral Link Mo</label>
            <div className="h-12 bg-[#fafafa] rounded-lg flex items-center px-4 gap-2">
              <span className="flex-1 text-[14px] text-[#84888c] truncate" style={{ ...ss, ...pp }}>{referralLink}</span>
              <button onClick={copyLink} className="shrink-0 cursor-pointer">
                {copied ? (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="#00BF85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="#84888c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-[#dfe0e2] p-3 flex flex-col gap-3">
            {[
              { label: "Commission Rate Mo", value: "30%", emoji: "✅" },
              { label: "Cookie Duration", value: "30 araw", emoji: "✅" },
              { label: "Status", value: "Active", emoji: "✅" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <EmojiIcon emoji={item.emoji} size={16} />
                <span className="text-[14px] text-[#84888c]" style={{ ...ss, ...pp }}>{item.label}</span>
                <span className="text-[16px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex gap-3">
          <button onClick={() => setStep("dashboard")}
            className="flex-1 h-12 bg-[#070808] text-white rounded-lg text-[15px] cursor-pointer hover:bg-[#1a1a1a] transition-colors"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            Dashboard
          </button>
          <button onClick={copyLink}
            className="flex-1 h-12 bg-[#f5f6f7] text-[#070808] rounded-lg text-[15px] cursor-pointer hover:bg-[#eee] transition-colors"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            I-share ang Link
          </button>
        </div>
      </div>
    </div>
  );

  /* ==================== RENDER: DASHBOARD ==================== */
  const renderDashboard = () => (
    <AffiliateDashboard
      referralLink={referralLink}
      copied={copied}
      onCopyLink={copyLink}
      onBack={() => setStep("landing")}
    />
  );

  /* ==================== RENDER: LANDING ==================== */
  const renderLanding = () => (
    <div className="flex flex-col gap-0">
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden bg-[#fafafa]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex flex-col gap-5 flex-1 z-10">
            <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] text-[#070808] leading-[1.15]" style={{ fontWeight: 700, ...ss, ...pp }}>
              Kumita sa Lucky Taya<br className="hidden sm:block" /> Affiliate Program
            </h1>
            <p className="text-[14px] sm:text-[16px] text-[#84888c] max-w-[480px]" style={{ ...ss, ...pp }}>
              I-share ang Lucky Taya sa audience mo at kumita ng commission sa bawat referral. Libong affiliates na ang kumikita ng passive income mula sa nangungunang prediction market platform ng Pilipinas.
            </p>
            <button onClick={() => setStep("apply")}
              className="bg-[#070808] text-white h-12 px-8 rounded-lg text-[16px] w-fit cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              style={{ fontWeight: 500, ...ss, ...pp }}>
              Mag-apply Ngayon
            </button>
          </div>
          <div className="w-full lg:w-[400px] h-[220px] sm:h-[280px] rounded-2xl overflow-hidden shrink-0">
            <ImageWithFallback src={HERO_BG} alt="Lucky Taya Affiliate" className="size-full object-cover" />
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-[#f5f6f7] p-6 sm:p-8">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-3">
              <span className="text-[28px] sm:text-[36px] text-[#070808]" style={{ fontWeight: 700, ...ss, ...pp }}>{s.value}</span>
              <span className="text-[13px] text-[#84888c]" style={{ ...ss, ...pp }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== WHY JOIN ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Bakit Sumali sa Affiliate Program?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHY_JOIN.map((item, i) => (
            <div key={i} className="rounded-xl border border-[#f5f6f7] p-5 sm:p-6 flex items-start gap-4 hover:border-[#ff5222]/20 hover:shadow-sm transition-all">
              <div className="shrink-0">
                <item.icon size={56} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{item.title}</span>
                <span className="text-[13px] text-[#84888c] leading-[1.5]" style={{ ...ss, ...pp }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOW TO GET STARTED ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Paano Magsimula
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[40px] sm:text-[48px] text-[#070808]" style={{ fontWeight: 700, ...ss, ...pp }}>{s.num}</span>
              <span className="text-[16px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{s.title}</span>
              <span className="text-[13px] text-[#84888c] leading-[1.6]" style={{ ...ss, ...pp }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== COMMISSION STRUCTURE ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Commission Structure
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIERS.map((tier, i) => (
            <div key={i} className="rounded-xl border border-[#f5f6f7] p-6 flex flex-col items-center gap-4 hover:border-[#ff5222]/30 hover:shadow-sm transition-all">
              <div className="h-6 w-24 rounded bg-[#ff5222]" />
              <span className="text-[18px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{tier.name}</span>
              <div className="flex flex-col gap-2 w-full">
                {tier.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#00BF85" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span className="text-[13px] text-[#84888c]" style={{ ...ss, ...pp }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== WHO CAN JOIN ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Sino ang Puwedeng Sumali?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {WHO_CAN_JOIN.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 py-6">
              <item.icon size={48} />
              <span className="text-[14px] text-[#070808] text-center whitespace-pre-line" style={{ fontWeight: 600, ...ss, ...pp }}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MARKETING RESOURCES ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Marketing Resources
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {RESOURCES.map((r, i) => (
            <div key={i} className="flex flex-col items-center gap-3 py-6 rounded-xl border border-[#f5f6f7] hover:border-[#ff5222]/20 transition-all cursor-pointer">
              <r.icon size={40} />
              <span className="text-[15px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{r.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[24px] sm:text-[30px] text-center text-[#070808] mb-8" style={{ fontWeight: 700, ...ss, ...pp }}>
          Mga Madalas Itanong (FAQ)
        </h2>
        <div className="flex flex-col">
          {FAQ_DATA.map((faq, i) => (
            <div key={i} className="border-b border-[#f5f6f7]">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between py-4 cursor-pointer text-left">
                <span className="text-[14px] text-[#070808]" style={{ fontWeight: 500, ...ss, ...pp }}>{faq.q}</span>
                <svg className={`size-4 shrink-0 ml-4 transition-transform ${faqOpen === i ? "rotate-45" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="#84888c" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {faqOpen === i && (
                <div className="pb-4 pr-8">
                  <p className="text-[13px] text-[#84888c] leading-[1.6]" style={{ ...ss, ...pp }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#fafafa] rounded-2xl py-12 px-6 flex flex-col items-center gap-5">
          <h2 className="text-[24px] sm:text-[30px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>
            Handa Ka Na Bang Kumita?
          </h2>
          <button onClick={() => setStep("apply")}
            className="bg-[#070808] text-white h-12 px-10 rounded-lg text-[16px] cursor-pointer hover:bg-[#1a1a1a] transition-colors"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            Mag-apply Ngayon
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      {/* removed — shared <Footer /> is rendered by the page wrapper */}
    </div>
  );

  /* ==================== PAGE RENDER ==================== */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <AuthGate pageName="Affiliate">
        <div className="flex-1 overflow-y-auto bg-white">
          {step === "landing" && renderLanding()}
          {step === "apply" && renderApplyForm()}
          {step === "verify" && renderVerify()}
          {step === "welcome" && renderWelcome()}
          {step === "dashboard" && renderDashboard()}
          <Footer />
        </div>
        </AuthGate>
      </div>

      <DepositWithdrawModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode={modalMode} theme={LIGHT_THEME} balance={23450} />
    </div>
  );
}