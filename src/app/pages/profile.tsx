import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { useAuth } from "../components/auth-context";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmojiIcon } from "../components/two-tone-icons";
import { DepositWithdrawModal, type ModalTheme } from "../components/deposit-withdraw-modal";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";
import { ProfileSkeleton } from "../components/page-skeleton";
import { MfaManagerPanel } from "../components/mfa-manager";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";

/* ==================== MOCK PROFILE DATA ==================== */
interface ProfileData {
  phone: string;
  email: string;
  birthday: string;
  gender: string;
  address: string;
  memberSince: string;
  kycStatus: "unverified" | "pending" | "verified";
  kycLevel: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  twoFaEnabled: boolean;
  emailNotifications: boolean;
  language: string;
  currency: string;
  totalBets: number;
  winRate: number;
  totalWon: number;
  totalLost: number;
  favoriteCategory: string;
  streak: number;
}

const MOCK_PROFILE: ProfileData = {
  phone: "+63 917 •••• 1234",
  email: "juan••••@gmail.com",
  birthday: "March 15, 1995",
  gender: "Lalaki",
  address: "Makati City, Metro Manila",
  memberSince: "January 2026",
  kycStatus: "unverified",
  kycLevel: 0,
  referralCode: "JUAN2026",
  referralCount: 12,
  referralEarnings: 1200,
  twoFaEnabled: true,
  emailNotifications: true,
  language: "Filipino",
  currency: "PHP (₱)",
  totalBets: 347,
  winRate: 58.2,
  totalWon: 89420,
  totalLost: 31200,
  favoriteCategory: "Basketball",
  streak: 5,
};

/* ==================== SECTION CARD ==================== */
function SectionCard({ title, emoji, children, action }: {
  title: string; emoji: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#f0f1f3] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f5f6f7]">
        <div className="flex items-center gap-2">
          <EmojiIcon emoji={emoji} size={18} />
          <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{title}</span>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ==================== INFO ROW ==================== */
function InfoRow({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f9fafb] last:border-0">
      <span className="text-[12px] text-[#84888c]" style={{ ...ss, ...pp }}>{label}</span>
      <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss, ...pp }}>{value}</span>
    </div>
  );
}

/* ==================== TOGGLE ROW ==================== */
function ToggleRow({ label, description, enabled, onToggle }: {
  label: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f9fafb] last:border-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss, ...pp }}>{label}</span>
        <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>{description}</span>
      </div>
      <button
        onClick={onToggle}
        className="relative w-10 h-[22px] rounded-full cursor-pointer transition-colors"
        style={{ background: enabled ? "#ff5222" : "#dfe0e2" }}
      >
        <div
          className="absolute top-[2px] size-[18px] rounded-full bg-white shadow-sm transition-all"
          style={{ left: enabled ? "20px" : "2px" }}
        />
      </button>
    </div>
  );
}

/* ==================== STAT CARD ==================== */
function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl">
      <EmojiIcon emoji={emoji} size={20} />
      <span className="text-[10px] text-[#84888c] mt-1" style={{ ...ss, ...pp }}>{label}</span>
      <span className="text-[18px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{value}</span>
      {sub && <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>{sub}</span>}
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, darkMode, toggleDarkMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "security" | "preferences">("overview");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "Juan Cruz");
  const [copiedRef, setCopiedRef] = useState(false);

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };
  const openWithdraw = () => { setModalMode("withdraw"); setModalOpen(true); };

  const modalTheme: ModalTheme = {
    bg: "#ffffff", card: "#ffffff", cardBorder: "#f5f6f7",
    text: "#070808", textSec: "#84888c", textMut: "#a0a3a7", textFaint: "#dfe0e2",
    inputBg: "#fafafa", inputBorder: "#f5f6f7",
    greenBg: "#e6fff3", greenText: "#00bf85", orangeBg: "#fff4ed", orangeText: "#ff5222",
    isDark: false,
  };

  const displayUser = user ?? {
    name: "Juan Cruz",
    handle: "@JuanBet123",
    avatar: DEFAULT_AVATAR,
    balance: 5000,
    portfolio: 118233,
  };

  const copyReferral = () => {
    navigator.clipboard?.writeText(profile.referralCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", emoji: "📋" },
    { key: "security" as const, label: "Security", emoji: "🔒" },
    { key: "preferences" as const, label: "Preferences", emoji: "⚙️" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto bg-white">
          <AuthGate pageName="Profile">
          {!isLoggedIn ? (
            <ProfileSkeleton />
          ) : (
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

            {/* ===== PROFILE HEADER ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="size-20 sm:size-24 rounded-2xl overflow-hidden border-3 border-[#ff5222]/20 shadow-lg">
                  <ImageWithFallback src={displayUser.avatar} alt={displayUser.name} className="size-full object-cover" />
                </div>
                {profile.kycStatus === "verified" && (
                  <div className="absolute -bottom-1 -right-1 size-7 bg-emerald-500 rounded-lg flex items-center justify-center ring-2 ring-white">
                    <svg className="size-4 text-white" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5"><path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="text-[22px] text-[#070808] bg-[#fafafa] border border-[#f0f1f3] rounded-lg px-2 py-0.5 outline-none focus:border-[#ff5222]/40"
                        style={{ fontWeight: 700, ...ss }}
                        autoFocus
                      />
                      <button onClick={() => setEditingName(false)} className="text-[10px] bg-[#ff5222] text-white px-2.5 py-1 rounded-lg cursor-pointer" style={{ fontWeight: 600 }}>Save</button>
                      <button onClick={() => { setEditName(displayUser.name); setEditingName(false); }} className="text-[10px] text-[#84888c] px-2 py-1 cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-[22px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>{editName}</h1>
                      <button onClick={() => setEditingName(true)} className="size-6 rounded-md hover:bg-[#f5f6f7] flex items-center justify-center cursor-pointer transition-colors">
                        <svg className="size-3.5 text-[#84888c]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[13px] text-[#84888c]" style={{ ...ss }}>{displayUser.handle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    profile.kycStatus === "verified" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : profile.kycStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                  }`} style={{ fontWeight: 600, ...ss }}>
                    {profile.kycStatus === "verified" ? "KYC Verified" : profile.kycStatus === "pending" ? "KYC Pending" : "Unverified"}
                  </span>
                  <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss }}>Member since {profile.memberSince}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:self-start">
                <button onClick={openDeposit} className="bg-[#070808] hover:bg-[#222] text-white h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors text-[12px]" style={{ fontWeight: 500, ...ss }}>
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                  Deposit
                </button>
                <button onClick={openWithdraw} className="bg-[#f5f6f7] hover:bg-[#edeef0] h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors text-[12px]" style={{ fontWeight: 500, ...ss }}>
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none"><path d="M8 14V2M2 8h12" stroke="#070808" strokeWidth="2" strokeLinecap="round" /></svg>
                  Withdraw
                </button>
              </div>
            </div>

            {/* ===== QUICK STATS ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard emoji="💰" label="Balanse" value={`₱${displayUser.balance.toLocaleString("en-PH")}`} />
              <StatCard emoji="📊" label="Portfolio Value" value={`₱${displayUser.portfolio.toLocaleString("en-PH")}`} />
              <StatCard emoji="🏆" label="Total Won" value={`₱${profile.totalWon.toLocaleString("en-PH")}`} sub={`${profile.winRate}% win rate`} />
              <StatCard emoji="🔥" label="Win Streak" value={`${profile.streak} sunod-sunod`} sub={`${profile.totalBets} total bets`} />
            </div>

            {/* ===== KYC VERIFICATION BANNER ===== */}
            {profile.kycStatus !== "verified" && (
              <button
                onClick={() => navigate("/kyc")}
                className="w-full cursor-pointer group"
                style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }}
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-shadow hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9e7 50%, #fefce8 100%)", border: "1.5px solid #fde68a" }}
                >
                  {/* Shield icon */}
                  <div className="size-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fef3c7" }}>
                    <svg className="size-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 6v5c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="#f59e0b" fillOpacity="0.2" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M9 12l2 2 4-4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#92400e]" style={{ fontWeight: 700, ...ss, ...pp }}>
                      Complete KYC Verification
                    </p>
                    <p className="text-[12px] text-[#b45309] mt-0.5" style={{ ...ss, ...pp }}>
                      Unlock unlimited withdrawals &amp; higher bet limits
                    </p>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 transition-transform group-hover:translate-x-0.5">
                    <svg className="size-5 text-[#d97706]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 4l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              </button>
            )}

            {/* ===== TABS ===== */}
            <div className="flex items-center gap-5 h-10">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative text-[14px] cursor-pointer transition-colors"
                  style={{
                    color: activeTab === tab.key ? "#070808" : "#84888c",
                    fontWeight: 500,
                    ...ss,
                    ...pp,
                  }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-5">
                {/* Personal Info */}
                <SectionCard
                  title="Personal na Impormasyon"
                  emoji="👤"
                  action={
                    <button className="text-[11px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>
                      I-edit
                    </button>
                  }
                >
                  <InfoRow label="Pangalan" value={editName} />
                  <InfoRow label="Phone" value={profile.phone} masked />
                  <InfoRow label="Email" value={profile.email} masked />
                  <InfoRow label="Birthday" value={profile.birthday} />
                  <InfoRow label="Kasarian" value={profile.gender} />
                  <InfoRow label="Address" value={profile.address} />
                </SectionCard>

                {/* KYC Status */}
                <SectionCard title="KYC Verification" emoji="🛡️">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${
                        profile.kycStatus === "verified" ? "bg-emerald-100" : profile.kycStatus === "pending" ? "bg-amber-100" : "bg-[#f5f6f7]"
                      }`}>
                        {profile.kycStatus === "verified" ? (
                          <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : profile.kycStatus === "pending" ? (
                          <svg className="size-5 text-amber-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M10 6v4l2 2" strokeLinecap="round" /></svg>
                        ) : (
                          <svg className="size-5 text-[#84888c]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>
                          {profile.kycStatus === "verified" ? "Fully Verified — Level 3" : profile.kycStatus === "pending" ? "Under Review" : "Not Verified"}
                        </p>
                        <p className="text-[11px] text-[#84888c]" style={ss}>
                          {profile.kycStatus === "verified" ? "Unlimited withdrawals & maximum bet limits" : "Complete verification to unlock full features"}
                        </p>
                      </div>
                    </div>
                    {profile.kycStatus !== "verified" && (
                      <button
                        onClick={() => navigate("/kyc")}
                        className="h-8 px-4 rounded-lg text-[11px] bg-[#ff5222] text-white hover:bg-[#e8491f] cursor-pointer transition-colors"
                        style={{ fontWeight: 600, ...ss }}
                      >
                        {profile.kycStatus === "pending" ? "View Status" : "Verify Now"}
                      </button>
                    )}
                  </div>

                  {/* KYC Level Progress */}
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3].map(level => (
                      <div key={level} className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#84888c]" style={{ ...ss }}>Level {level}</span>
                          {level <= profile.kycLevel && (
                            <svg className="size-3 text-emerald-500" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <div className="h-1.5 rounded-full bg-[#f0f1f3]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: level <= profile.kycLevel ? "100%" : "0%",
                              background: level <= profile.kycLevel ? "#00bf85" : "#dfe0e2",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Referral */}
                <SectionCard title="Referral Program" emoji="🤝">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] text-[#84888c] mb-2" style={{ ...ss }}>Ang referral code mo:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-10 bg-[#fafafa] border border-[#f0f1f3] rounded-lg flex items-center px-3">
                          <span className="text-[14px] text-[#070808] tracking-wider" style={{ fontWeight: 600, ...ss }}>{profile.referralCode}</span>
                        </div>
                        <button
                          onClick={copyReferral}
                          className="h-10 px-4 rounded-lg text-[11px] cursor-pointer transition-all"
                          style={{
                            background: copiedRef ? "#e6fff3" : "#f5f6f7",
                            color: copiedRef ? "#00bf85" : "#070808",
                            fontWeight: 600, ...ss,
                          }}
                        >
                          {copiedRef ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl text-center min-w-[90px]">
                        <p className="text-[18px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{profile.referralCount}</p>
                        <p className="text-[10px] text-[#84888c]" style={ss}>Na-invite</p>
                      </div>
                      <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl text-center min-w-[90px]">
                        <p className="text-[18px] text-[#00bf85]" style={{ fontWeight: 600, ...ss }}>₱{profile.referralEarnings.toLocaleString()}</p>
                        <p className="text-[10px] text-[#84888c]" style={ss}>Kita</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Betting Stats */}
                <SectionCard title="Betting Statistics" emoji="📈">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl">
                      <p className="text-[10px] text-[#84888c]" style={ss}>Total Bets</p>
                      <p className="text-[18px] text-[#070808] mt-1" style={{ fontWeight: 600, ...ss }}>{profile.totalBets}</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl">
                      <p className="text-[10px] text-[#84888c]" style={ss}>Win Rate</p>
                      <p className="text-[18px] text-[#00bf85] mt-1" style={{ fontWeight: 600, ...ss }}>{profile.winRate}%</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl">
                      <p className="text-[10px] text-[#84888c]" style={ss}>Total Won</p>
                      <p className="text-[18px] text-[#00bf85] mt-1" style={{ fontWeight: 600, ...ss }}>₱{profile.totalWon.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] border border-[#f0f1f3] rounded-xl">
                      <p className="text-[10px] text-[#84888c]" style={ss}>Total Lost</p>
                      <p className="text-[18px] text-[#ff5222] mt-1" style={{ fontWeight: 600, ...ss }}>₱{profile.totalLost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <EmojiIcon emoji="🏀" size={18} />
                    <span className="text-[11px] text-amber-700" style={{ fontWeight: 500, ...ss }}>Favorite category: <strong>{profile.favoriteCategory}</strong></span>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ===== SECURITY TAB ===== */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-5">
                <MfaManagerPanel userEmail={user?.email} />

                <SectionCard title="Password" emoji="🔑">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>Password</p>
                      <p className="text-[10px] text-[#a0a3a7]" style={ss}>Huling binago: 2 months ago</p>
                    </div>
                    <button className="h-8 px-4 rounded-lg text-[11px] bg-[#f5f6f7] text-[#070808] hover:bg-[#edeef0] cursor-pointer transition-colors" style={{ fontWeight: 500, ...ss }}>
                      Palitan
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Active Sessions" emoji="💻">
                  <div className="space-y-3">
                    {[
                      { device: "Chrome — Makati City", time: "Ngayon (aktibo)", current: true },
                      { device: "iPhone 15 — Quezon City", time: "2 hours ago", current: false },
                      { device: "Safari — Cebu City", time: "3 days ago", current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#f9fafb] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg flex items-center justify-center ${session.current ? "bg-emerald-100" : "bg-[#f5f6f7]"}`}>
                            <svg className={`size-4 ${session.current ? "text-emerald-600" : "text-[#84888c]"}`} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="8" rx="1.5" /><path d="M5 14h6" strokeLinecap="round" /></svg>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>{session.device}</p>
                            <p className="text-[10px] text-[#a0a3a7]" style={ss}>{session.time}</p>
                          </div>
                        </div>
                        {session.current ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700" style={{ fontWeight: 600 }}>Current</span>
                        ) : (
                          <button className="text-[10px] text-red-500 cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>Logout</button>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Danger Zone" emoji="⚠️">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div>
                      <p className="text-[12px] text-red-600" style={{ fontWeight: 600, ...ss }}>I-delete ang Account</p>
                      <p className="text-[10px] text-red-400" style={ss}>Permanenteng matatanggal ang lahat ng data mo</p>
                    </div>
                    <button className="h-8 px-4 rounded-lg text-[11px] bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer transition-colors" style={{ fontWeight: 600, ...ss }}>
                      Delete
                    </button>
                  </div>
                </SectionCard>

                {/* Deposit/Withdrawal Limits */}
                <SectionCard title="Mga Limitasyon sa Deposito/Withdrawal" emoji="💸">
                  <div className="space-y-3">
                    {[
                      { label: "Daily Deposit Limit", current: "₱50,000", max: "₱500,000 (KYC Level 3)" },
                      { label: "Daily Withdrawal Limit", current: "₱10,000", max: "₱500,000 (KYC Level 3)" },
                      { label: "Single Transaction Max", current: "₱10,000", max: "₱500,000 (KYC Verified)" },
                      { label: "Monthly Deposit Cap", current: "Walang limit", max: "I-set ang custom limit" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#f9fafb] last:border-0">
                        <div>
                          <p className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>{item.label}</p>
                          <p className="text-[10px] text-[#a0a3a7]" style={ss}>{item.max}</p>
                        </div>
                        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{item.current}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[11px] text-amber-700" style={{ fontWeight: 500, ...ss }}>
                      Para mapalaki ang limits, kumpletuhin ang KYC verification. Maaari ka ring magtakda ng mas mababang custom limit para sa responsible gaming.
                    </p>
                  </div>
                </SectionCard>

                {/* Self-Exclusion */}
                <SectionCard title="Self-Exclusion" emoji="🚫">
                  <p className="text-[12px] text-[#84888c] mb-3 leading-[1.6]" style={ss}>
                    Kung kailangan mo ng break mula sa pagtaya, maaari kang mag-request ng self-exclusion. Sa panahon ng exclusion, hindi ka makakapag-login, magtaya, o mag-deposit.
                  </p>
                  <button onClick={() => navigate("/responsible-gaming")}
                    className="h-9 px-4 rounded-lg text-[11px] bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors"
                    style={{ fontWeight: 600, ...ss }}>
                    I-request ang Self-Exclusion
                  </button>
                </SectionCard>
              </div>
            )}

            {/* ===== PREFERENCES TAB ===== */}
            {activeTab === "preferences" && (
              <div className="flex flex-col gap-5">
                <SectionCard title="Appearance" emoji="🎨">
                  <ToggleRow
                    label="Dark Mode"
                    description="Gumamit ng madilim na tema para sa mas komportableng pagtingin"
                    enabled={darkMode}
                    onToggle={toggleDarkMode}
                  />
                </SectionCard>

                <SectionCard title="Notification Preferences" emoji="🔔">
                  <ToggleRow
                    label="Email Notifications"
                    description="Makatanggap ng updates sa email"
                    enabled={profile.emailNotifications}
                    onToggle={() => setProfile(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                  />
                </SectionCard>

                <SectionCard title="Regional Settings" emoji="🌏">
                  <InfoRow label="Wika" value={profile.language} />
                  <InfoRow label="Currency" value={profile.currency} />
                  <InfoRow label="Timezone" value="Asia/Manila (UTC+8)" />
                </SectionCard>

                <SectionCard title="Betting Preferences" emoji="🎯">
                  <InfoRow label="Default Bet Amount" value="₱100" />
                  <InfoRow label="Odds Format" value="Decimal" />
                  <InfoRow label="Auto-confirm Bets" value="Hindi" />
                  <InfoRow label="Sound Effects" value="Naka-on" />
                </SectionCard>
              </div>
            )}

          </div>
          )}
          <Footer />
          </AuthGate>
        </div>
      </div>

      <DepositWithdrawModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        theme={modalTheme}
      />
    </div>
  );
}