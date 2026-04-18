import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { useOmsAuth, isPlatformUser, getRoleLabel, getRoleBadgeColor, validatePassword, type LoginResult, type AdminUser } from "./oms-auth";
import { OmsToastContainer, showOmsToast } from "./oms-modal";
import { TenantConfigProvider, useTenantConfig, loadConfig } from "./oms-tenant-config";
import { CommandPalette } from "./oms-command-palette";
import { NotificationCenter } from "./oms-notification-center";
import { OmsBreadcrumb } from "./oms-breadcrumb";
import { I18nProvider, useI18n, tNavLabel, tSectionTitle, LOCALE_META, type OmsLocale } from "./oms-i18n";
import {
  OmsDashboardIcon, OmsUsersIcon, OmsMarketsIcon, OmsBetsIcon,
  OmsFinanceIcon, OmsRewardsIcon, OmsAffiliatesIcon, OmsReportsIcon,
  OmsSettingsIcon, OmsContentIcon, OmsLogoutIcon, OmsSearchIcon, OmsChevronIcon,
  OmsRiskIcon, OmsWalletIcon, OmsAuditIcon, OmsFastBetIcon, OmsCreatorIcon,
  OmsLeaderboardIcon, OmsPromoIcon, OmsSupportIcon, OmsNotifMgmtIcon, OmsOddsIcon,
  OmsMerchantIcon, OmsTenantIcon, OmsGlobeIcon, OmsPaasConfigIcon, OmsKybIcon,
  OmsPaymentMethodsIcon,
  OmsPaymentProvidersIcon,
} from "./oms-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== MODE COLORS ==================== */
const MODE_COLORS = {
  platform: { accent: "#8b5cf6", bg: "rgba(139,92,246,0.05)", border: "rgba(139,92,246,0.15)", text: "#8b5cf6" },
  merchant: { accent: "#ff5222", bg: "rgba(255,82,34,0.05)", border: "rgba(255,82,34,0.15)", text: "#ff5222" },
};

/* ==================== ROLE BADGE COLORS (light theme) ==================== */
const LIGHT_ROLE_BADGE: Record<string, string> = {
  platform_admin: "bg-red-50 text-red-500",
  super_admin: "bg-red-50 text-red-500",
  platform_ops: "bg-orange-50 text-orange-500",
  merchant_admin: "bg-blue-50 text-blue-500",
  admin: "bg-blue-50 text-blue-500",
  merchant_ops: "bg-cyan-50 text-cyan-600",
  moderator: "bg-cyan-50 text-cyan-600",
  merchant_finance: "bg-emerald-50 text-emerald-600",
  finance: "bg-emerald-50 text-emerald-600",
  merchant_support: "bg-purple-50 text-purple-500",
  support: "bg-purple-50 text-purple-500",
};
function lightRoleBadge(role: string) { return LIGHT_ROLE_BADGE[role] || "bg-gray-100 text-gray-500"; }

/* ==================== NAV CONFIG ==================== */
interface NavItem {
  label: string;
  icon: React.ComponentType<{ color?: string }>;
  path: string;
  badge?: string;
  platformOnly?: boolean;
}

interface NavSection {
  title: string;
  merchantTitle?: string;
  items: NavItem[];
  platformOnly?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "PLATFORM",
    platformOnly: true,
    items: [
      { label: "Platform Overview", icon: OmsGlobeIcon, path: "/oms", platformOnly: true },
      { label: "Merchants", icon: OmsMerchantIcon, path: "/oms/merchants", badge: "8", platformOnly: true },
      { label: "Billing & Plans", icon: OmsFinanceIcon, path: "/oms/billing", platformOnly: true },
      { label: "PaaS Config", icon: OmsPaasConfigIcon, path: "/oms/paas-config", platformOnly: true },
      { label: "Payment Methods", icon: OmsPaymentMethodsIcon, path: "/oms/payment-methods", platformOnly: true },
      { label: "Payment Providers", icon: OmsPaymentProvidersIcon, path: "/oms/payment-providers", platformOnly: true },
      { label: "Merchant KYB", icon: OmsKybIcon, path: "/oms/kyb", badge: "2", platformOnly: true },
      { label: "Admin Users", icon: OmsUsersIcon, path: "/oms/admin-users", platformOnly: true },
    ],
  },
  {
    title: "MERCHANT OPS",
    merchantTitle: "{MERCHANT} OPS",
    items: [
      { label: "Dashboard", icon: OmsDashboardIcon, path: "/oms/dashboard" },
      { label: "User Management", icon: OmsUsersIcon, path: "/oms/users", badge: "12" },
      { label: "KYC", icon: OmsKybIcon, path: "/oms/kyc", badge: "3" },
      { label: "Markets", icon: OmsMarketsIcon, path: "/oms/markets", badge: "3" },
      { label: "Bets & Wagers", icon: OmsBetsIcon, path: "/oms/bets" },
      { label: "Finance", icon: OmsFinanceIcon, path: "/oms/finance", badge: "5" },
      { label: "Risk Management", icon: OmsRiskIcon, path: "/oms/risk", badge: "3" },
      { label: "Wallet Admin", icon: OmsWalletIcon, path: "/oms/wallet" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Fast Bet Config", icon: OmsFastBetIcon, path: "/oms/fast-bet" },
      { label: "Odds Engine", icon: OmsOddsIcon, path: "/oms/odds" },
      { label: "Settlement Engine", icon: OmsBetsIcon, path: "/oms/settlement-engine" },
      { label: "Creator Mgmt", icon: OmsCreatorIcon, path: "/oms/creators", badge: "3" },
    ],
  },
  {
    title: "PROGRAMS",
    items: [
      { label: "Rewards", icon: OmsRewardsIcon, path: "/oms/rewards" },
      { label: "Affiliates", icon: OmsAffiliatesIcon, path: "/oms/affiliates" },
      { label: "Leaderboard", icon: OmsLeaderboardIcon, path: "/oms/leaderboard" },
      { label: "Promo Codes", icon: OmsPromoIcon, path: "/oms/promos" },
      { label: "Content & CMS", icon: OmsContentIcon, path: "/oms/content" },
      { label: "Notifications", icon: OmsNotifMgmtIcon, path: "/oms/notif-mgmt" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Reports", icon: OmsReportsIcon, path: "/oms/reports" },
      { label: "Audit Trail", icon: OmsAuditIcon, path: "/oms/audit" },
      { label: "Support Tickets", icon: OmsSupportIcon, path: "/oms/support", badge: "4" },
      { label: "Settings", icon: OmsSettingsIcon, path: "/oms/settings" },
      { label: "Merchant Config", icon: OmsTenantIcon, path: "/oms/paas-merchant" },
    ],
  },
];

/* ==================== AUTH CARD WRAPPER ==================== */
function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-4" style={pp}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#ff5222] rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "0 4px 15px rgba(255,82,34,0.3)" }}>
            <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-[#070808] text-[20px]" style={{ fontWeight: 700, ...ss04 }}>{title}</h1>
          {subtitle && <p className="text-[#b0b3b8] text-[12px] mt-1" style={ss04}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ==================== LOGIN SCREEN ==================== */
export function OmsLogin() {
  const { login, loginWithCode, requestVerificationCode, resetPassword, pending2FA, demoTwoFACode, verify2FA, cancel2FA } = useOmsAuth();
  type AuthScreen = "login" | "email_code" | "forgot" | "forgot_code" | "forgot_newpw" | "disabled" | "2fa";
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [disabledUser, setDisabledUser] = useState<AdminUser | null>(null);
  const [pwErrors, setPwErrors] = useState<string[]>([]);

  const resetFields = () => { setPassword(""); setCode(""); setNewPw(""); setConfirmPw(""); setError(""); setSuccess(""); setDemoCode(""); setPwErrors([]); };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password.trim()) { setError("Please enter your password"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        if (result.reason === "account_disabled") { setDisabledUser(result.user || null); setScreen("disabled"); }
        else if (result.reason === "account_not_found") setError("No account found for this email address.");
        else setError("Incorrect password. Please try again.");
      } else if (result.ok && result.requires2FA) {
        setScreen("2fa"); setCode("");
      }
    }, 500);
  };

  const handleSendCode = () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email first"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = requestVerificationCode(email);
      setLoading(false);
      if (result.sent) { setDemoCode(result.code || ""); setSuccess(`Verification code sent to ${email}`); }
      else setError(result.error || "Failed to send code");
    }, 800);
  };

  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!code.trim()) { setError("Please enter the verification code"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = loginWithCode(email, code);
      setLoading(false);
      if (!result.ok) {
        if (result.reason === "account_disabled") { setDisabledUser(result.user || null); setScreen("disabled"); }
        else setError("Invalid or expired verification code.");
      }
    }, 500);
  };

  const handleForgotSendCode = () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = requestVerificationCode(email);
      setLoading(false);
      if (result.sent) { setDemoCode(result.code || ""); setScreen("forgot_code"); setSuccess(`Verification code sent to ${email}`); }
      else setError(result.error || "Failed to send code");
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setPwErrors([]);
    const validation = validatePassword(newPw);
    if (!validation.valid) { setPwErrors(validation.errors); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = resetPassword(email, code, newPw);
      setLoading(false);
      if (result.ok) { setScreen("login"); resetFields(); setSuccess("Password reset successfully! Please sign in with your new password."); }
      else setError(result.error || "Failed to reset password");
    }, 600);
  };

  /* DISABLED */
  if (screen === "disabled") {
    return (
      <AuthCard title="Account Disabled" subtitle="Your account has been suspended by an administrator">
        <div className="bg-white border border-[#f0f1f3] rounded-2xl p-6 text-center" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="size-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </div>
          <h3 className="text-[#070808] text-[16px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Account Suspended</h3>
          <p className="text-[#84888c] text-[12px] mb-1" style={ss04}>The account <span className="text-[#070808]" style={{ fontWeight: 600 }}>{disabledUser?.email || email}</span> has been disabled.</p>
          {disabledUser?.tenantName && <p className="text-[#b0b3b8] text-[11px] mb-4" style={ss04}>Tenant: {disabledUser.tenantName}</p>}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-left">
            <p className="text-red-500 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>This account has been suspended by the platform administrator. If you believe this is an error, please contact your administrator or the PredictEx support team.</p>
          </div>
          <p className="text-[#b0b3b8] text-[11px] mb-4" style={ss04}>support@predictex.ph · +63 2 8888 GATE</p>
          <button onClick={() => { setScreen("login"); resetFields(); setDisabledUser(null); }} className="w-full h-10 bg-[#f5f6f8] border border-[#e5e7eb] text-[#84888c] text-[13px] rounded-xl cursor-pointer hover:bg-[#e5e7eb] transition-colors" style={{ fontWeight: 600, ...ss04 }}>Back to Sign In</button>
        </div>
      </AuthCard>
    );
  }

  /* 2FA VERIFICATION */
  if (screen === "2fa") {
    const handle2FA = (e: React.FormEvent) => {
      e.preventDefault(); setError("");
      if (!code.trim() || code.length !== 6) { setError("Please enter the 6-digit code"); return; }
      setLoading(true);
      setTimeout(() => {
        const result = verify2FA(code) as any;
        setLoading(false);
        if (!result.ok) {
          setError(result.error || "Invalid code");
          if (result.demoCode) setDemoCode(result.demoCode);
        }
      }, 500);
    };

    return (
      <AuthCard title="Two-Factor Authentication" subtitle={`Verify your identity to continue`}>
        <form onSubmit={handle2FA} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="mb-4 flex items-center gap-3 p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="size-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Security Verification Required</p>
              <p className="text-[#84888c] text-[10px]" style={ss04}>Admin &amp; Platform Admin accounts require 2FA</p>
            </div>
          </div>
          {pending2FA && !demoCode && demoTwoFACode && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[11px]" style={ss04}>
              <span style={{ fontWeight: 600 }}>💡 Demo Hint:</span> Use code <span style={{ fontWeight: 700, fontFamily: "monospace", background: "#fef3c7", padding: "1px 6px", borderRadius: 6 }}>{demoTwoFACode}</span> to verify. In production, this would come from your authenticator app.
            </div>
          )}
          {demoCode && (
            <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-[11px]" style={ss04}>
              Demo 2FA code: <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{demoCode}</span>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Verification Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full h-12 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[20px] text-center outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8] tracking-[0.5em]" placeholder="000000" maxLength={6} style={{ fontFamily: "monospace", fontWeight: 600 }} autoFocus />
          </div>
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={loading || code.length !== 6} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Verifying..." : "Verify & Sign In"}</button>
          <button type="button" onClick={() => { cancel2FA(); setScreen("login"); resetFields(); }} className="w-full mt-3 text-[#84888c] text-[12px] cursor-pointer hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss04 }}>Cancel &amp; go back</button>
        </form>
      </AuthCard>
    );
  }

  /* FORGOT */
  if (screen === "forgot") {
    return (
      <AuthCard title="Reset Password" subtitle="Enter your email to receive a verification code">
        <form onSubmit={e => { e.preventDefault(); handleForgotSendCode(); }} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="your@email.com" style={ss04} />
          </div>
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={loading} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Sending..." : "Send Verification Code"}</button>
          <button type="button" onClick={() => { setScreen("login"); resetFields(); }} className="w-full mt-3 text-[#84888c] text-[12px] cursor-pointer hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss04 }}>Back to Sign In</button>
        </form>
      </AuthCard>
    );
  }

  if (screen === "forgot_code") {
    return (
      <AuthCard title="Verify Code" subtitle={`Enter the 6-digit code sent to ${email}`}>
        <form onSubmit={e => { e.preventDefault(); setScreen("forgot_newpw"); }} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          {success && <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-[12px]" style={ss04}>{success}</div>}
          {demoCode && <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-[11px]" style={ss04}>Demo code: <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{demoCode}</span></div>}
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Verification Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full h-12 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[20px] text-center outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8] tracking-[0.5em]" placeholder="000000" maxLength={6} style={{ fontFamily: "monospace", fontWeight: 600 }} />
          </div>
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={code.length !== 6} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>Verify & Continue</button>
          <button type="button" onClick={handleForgotSendCode} disabled={loading} className="w-full mt-3 text-[#ff5222] text-[12px] cursor-pointer hover:text-[#e8491f] transition-colors disabled:opacity-50" style={{ fontWeight: 500, ...ss04 }}>Resend Code</button>
        </form>
      </AuthCard>
    );
  }

  if (screen === "forgot_newpw") {
    return (
      <AuthCard title="Set New Password" subtitle="Choose a new password for your account">
        <form onSubmit={handleResetPassword} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="mb-3 p-2.5 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
            <p className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Password: 8+ chars, 2+ of uppercase/lowercase/digit/special</p>
          </div>
          <div className="mb-3">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>New Password</label>
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => { setNewPw(e.target.value); setPwErrors([]); }} className="w-full h-10 px-3 pr-10 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="New password" style={ss04} />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b3b8] text-[11px] cursor-pointer" style={ss04}>{showNewPw ? "Hide" : "Show"}</button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Confirm Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-10 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Confirm password" style={ss04} />
          </div>
          {pwErrors.length > 0 && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl">{pwErrors.map((e, i) => <p key={i} className="text-red-500 text-[11px]" style={ss04}>{e}</p>)}</div>}
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={loading} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Resetting..." : "Reset Password"}</button>
        </form>
      </AuthCard>
    );
  }

  /* EMAIL + CODE LOGIN */
  if (screen === "email_code") {
    return (
      <AuthCard title="Sign In with Email Code" subtitle="We'll send a 6-digit verification code to your email">
        <form onSubmit={handleCodeLogin} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Email Address</label>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setSuccess(""); setDemoCode(""); }} className="flex-1 h-10 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="your@email.com" style={ss04} />
              <button type="button" onClick={handleSendCode} disabled={loading || !email.trim()} className="h-10 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex-shrink-0" style={{ fontWeight: 600, ...ss04 }}>{loading ? "..." : "Send"}</button>
            </div>
          </div>
          {success && <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-[12px]" style={ss04}>{success}</div>}
          {demoCode && <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-[11px]" style={ss04}>Demo code: <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{demoCode}</span></div>}
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Verification Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full h-12 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[20px] text-center outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8] tracking-[0.5em]" placeholder="000000" maxLength={6} style={{ fontFamily: "monospace", fontWeight: 600 }} />
          </div>
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={loading || code.length !== 6} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Verifying..." : "Sign In"}</button>
          <button type="button" onClick={() => { setScreen("login"); resetFields(); }} className="w-full mt-3 text-[#84888c] text-[12px] cursor-pointer hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss04 }}>Sign in with password instead</button>
        </form>
      </AuthCard>
    );
  }

  /* PASSWORD LOGIN (default) */
  return (
    <AuthCard title="PredictEx Platform" subtitle="Multi-Tenant Operator Management System">
      {success && <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-[12px]" style={ss04}>{success}</div>}
      <form onSubmit={handlePasswordLogin} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <div className="mb-4">
          <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="admin@predictex.ph" style={ss04} />
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[#84888c] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Password</label>
            <button type="button" onClick={() => { setScreen("forgot"); resetFields(); }} className="text-[#ff5222] text-[11px] cursor-pointer hover:text-[#e8491f] transition-colors" style={{ fontWeight: 500, ...ss04 }}>Forgot password?</button>
          </div>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 pr-10 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Enter password" style={ss04} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b3b8] text-[11px] cursor-pointer" style={ss04}>{showPw ? "Hide" : "Show"}</button>
          </div>
        </div>
        {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
        <button type="submit" disabled={loading} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Signing in..." : "Sign In"}</button>
        <div className="mt-4 pt-3 border-t border-[#f0f1f3]">
          <button type="button" onClick={() => { setScreen("email_code"); resetFields(); }} className="w-full h-9 bg-[#f5f6f8] border border-[#e5e7eb] text-[#84888c] text-[12px] rounded-xl cursor-pointer hover:bg-[#e5e7eb] hover:text-[#070808] transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 500, ...ss04 }}>
            <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 5l6 4 6-4" /></svg>
            Sign in with email verification code
          </button>
        </div>
      </form>
      <div className="mt-4 p-3 bg-white border border-[#f0f1f3] rounded-2xl space-y-1.5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <p className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Demo Accounts:</p>
        <div className="space-y-1">
          {[
            { badge: "PLATFORM", cls: "bg-red-50 text-red-500", txt: "admin@predictex.ph / admin123" },
            { badge: "PLATFORM", cls: "bg-orange-50 text-orange-500", txt: "ops@predictex.ph / ops123" },
            { badge: "MERCHANT", cls: "bg-blue-50 text-blue-500", txt: "admin@predictex.ph / lt123" },
            { badge: "1ST LOGIN", cls: "bg-amber-50 text-amber-600", txt: "newadmin@betmanila.com / Bm$4xK9q2w" },
            { badge: "DISABLED", cls: "bg-red-50 text-red-500", txt: "disabled@predictex.ph / disabled123" },
          ].map(d => (
            <div key={d.txt} className="flex items-center gap-2">
              <span className={`text-[8px] px-1.5 py-0.5 rounded ${d.cls}`} style={{ fontWeight: 600, ...ss04 }}>{d.badge}</span>
              <span className="text-[#84888c] text-[10px]" style={ss04}>{d.txt}</span>
            </div>
          ))}
        </div>
      </div>
    </AuthCard>
  );
}

/* ==================== FIRST LOGIN GATE ==================== */
function FirstLoginGate() {
  const { admin, completeFirstLogin, logout } = useOmsAuth();
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const strength = (() => { if (!newPw) return 0; let s = 0; if (newPw.length >= 8) s++; if (/[A-Z]/.test(newPw)) s++; if (/[a-z]/.test(newPw)) s++; if (/[0-9]/.test(newPw)) s++; if (/[^A-Za-z0-9]/.test(newPw)) s++; return s; })();
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Strong", "Excellent"][strength];
  const strengthColor = ["", "#ef4444", "#ef4444", "#f59e0b", "#22c55e", "#059669"][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setPwErrors([]);
    const v = validatePassword(newPw);
    if (!v.valid) { setPwErrors(v.errors); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = completeFirstLogin(newPw);
      setLoading(false);
      if (!result.ok) setError(result.error || "Failed to update password");
      else showOmsToast("Password updated! Welcome to PredictEx.", "success");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-4" style={pp}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="size-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M12 3a4 4 0 014 4v4H8V7a4 4 0 014-4z" /></svg>
          </div>
          <h1 className="text-[#070808] text-[20px]" style={{ fontWeight: 700, ...ss04 }}>Change Your Password</h1>
          <p className="text-[#b0b3b8] text-[12px] mt-1" style={ss04}>Welcome, <span className="text-[#070808]" style={{ fontWeight: 600 }}>{admin?.name}</span>! Please set a new password to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-[#f0f1f3] rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          {admin?.tenantName && (
            <div className="mb-4 flex items-center gap-2 p-2.5 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[9px]" style={{ fontWeight: 700, ...ss04 }}>{admin.tenantName.slice(0, 2).toUpperCase()}</div>
              <div>
                <p className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{admin.tenantName}</p>
                <p className="text-[#b0b3b8] text-[9px]" style={ss04}>{admin.email} · {getRoleLabel(admin.role)}</p>
              </div>
            </div>
          )}
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-700 text-[10px]" style={{ fontWeight: 500, ...ss04 }}>8+ chars, include 2+ of: uppercase, lowercase, digit, special char</p>
          </div>
          <div className="mb-3">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>New Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={newPw} onChange={e => { setNewPw(e.target.value); setPwErrors([]); }} className="w-full h-10 px-3 pr-10 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Create a strong password" style={ss04} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b3b8] text-[11px] cursor-pointer" style={ss04}>{showPw ? "Hide" : "Show"}</button>
            </div>
            {newPw && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(strength / 5) * 100}%`, background: strengthColor }} /></div>
                <span className="text-[10px]" style={{ color: strengthColor, fontWeight: 600, ...ss04 }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-[#84888c] text-[12px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Confirm Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-10 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#070808] text-[13px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Confirm password" style={ss04} />
            {confirmPw && newPw !== confirmPw && <p className="text-red-500 text-[10px] mt-1" style={ss04}>Passwords do not match</p>}
          </div>
          {pwErrors.length > 0 && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl">{pwErrors.map((e, i) => <p key={i} className="text-red-500 text-[11px]" style={ss04}>{e}</p>)}</div>}
          {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[12px]" style={ss04}>{error}</div>}
          <button type="submit" disabled={loading || !newPw || !confirmPw} className="w-full h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[13px] rounded-xl cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...ss04, boxShadow: "0 4px 12px rgba(255,82,34,0.25)" }}>{loading ? "Updating..." : "Set Password & Continue"}</button>
          <button type="button" onClick={logout} className="w-full mt-3 text-[#b0b3b8] text-[12px] cursor-pointer hover:text-[#070808] transition-colors" style={{ fontWeight: 500, ...ss04 }}>Sign out</button>
        </form>
      </div>
    </div>
  );
}

/* ==================== CHANGE PASSWORD MODAL ==================== */
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { changePassword } = useOmsAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!oldPw) { setError("Enter current password"); return; }
    const v = validatePassword(newPw);
    if (!v.valid) { setError(v.errors[0]); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = changePassword(oldPw, newPw);
      setLoading(false);
      if (result.ok) { showOmsToast("Password changed successfully", "success"); onClose(); setOldPw(""); setNewPw(""); setConfirmPw(""); }
      else setError(result.error || "Failed");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={pp}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-[400px]" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[#f0f1f3]">
          <h3 className="text-[#070808] text-[15px]" style={{ fontWeight: 600, ...ss04 }}>Change Password</h3>
          <button onClick={onClose} className="text-[#b0b3b8] hover:text-[#070808] cursor-pointer text-[20px] leading-none p-1">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Current Password</label>
            <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Enter current password" style={{ ...pp, ...ss04 }} />
          </div>
          <div>
            <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="8+ chars, 2+ char types" style={{ ...pp, ...ss04 }} />
          </div>
          <div>
            <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]" placeholder="Confirm new password" style={{ ...pp, ...ss04 }} />
          </div>
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-500 text-[11px]" style={ss04}>{error}</div>}
          <div className="flex gap-2 pt-2 border-t border-[#f0f1f3]">
            <button type="button" onClick={onClose} className="flex-1 h-9 bg-[#f0f1f3] hover:bg-[#e5e7eb] text-[#84888c] text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600, ...pp, ...ss04 }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-9 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors disabled:opacity-50" style={{ fontWeight: 600, ...pp, ...ss04 }}>{loading ? "..." : "Update Password"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== TENANT CONTEXT SWITCHER ==================== */
function TenantSwitcher({ collapsed }: { collapsed: boolean }) {
  const { admin, merchants, activeMerchant, setActiveMerchant } = useOmsAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isMerchantMode = !!activeMerchant;
  const mode = isMerchantMode ? MODE_COLORS.merchant : MODE_COLORS.platform;

  if (!admin || !isPlatformUser(admin.role)) {
    if (!activeMerchant) return null;
    return (
      <div className={`mx-2 mb-2 p-2 rounded-xl ${collapsed ? "text-center" : ""}`} style={{ background: mode.bg, border: `1px solid ${mode.border}` }}>
        {collapsed ? (
          <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-[10px]" style={{ background: `${mode.accent}10`, color: mode.accent, fontWeight: 700, ...ss04 }} title={activeMerchant.name}>
            {activeMerchant.logo}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0" style={{ background: `${mode.accent}10`, color: mode.accent, fontWeight: 700, ...ss04 }}>{activeMerchant.logo}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[#070808] text-[11px] truncate" style={{ fontWeight: 600, ...ss04 }}>{activeMerchant.name}</p>
              <p className="text-[#b0b3b8] text-[9px] truncate" style={ss04}>{activeMerchant.primaryDomain}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeMerchants = merchants.filter(m => m.status === "active" || m.status === "onboarding");

  return (
    <div className="mx-2 mb-2 relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full p-2 rounded-xl transition-all cursor-pointer ${collapsed ? "text-center" : ""}`}
        style={{ background: mode.bg, border: `1px solid ${mode.border}` }}
      >
        {collapsed ? (
          <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-[10px]" style={{ background: `${mode.accent}10`, color: mode.accent, fontWeight: 700, ...ss04 }} title={activeMerchant ? activeMerchant.name : "All Merchants"}>
            {activeMerchant ? activeMerchant.logo : <OmsGlobeIcon color={mode.accent} />}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0" style={{ background: `${mode.accent}10`, color: mode.accent, fontWeight: 700 }}>
              {activeMerchant ? activeMerchant.logo : <OmsGlobeIcon color={mode.accent} />}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[#070808] text-[11px] truncate" style={{ fontWeight: 600, ...ss04 }}>{activeMerchant ? activeMerchant.name : "All Merchants"}</p>
              <p className="text-[#b0b3b8] text-[9px] truncate" style={ss04}>{activeMerchant ? activeMerchant.primaryDomain : "Platform-wide view"}</p>
            </div>
            <OmsChevronIcon direction={open ? "up" : "down"} color="#b0b3b8" />
          </div>
        )}
      </button>

      {!collapsed && (
        <div className="flex items-center gap-1.5 px-2 mt-1.5 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: mode.accent }} />
          <span className="text-[8px] tracking-[0.1em]" style={{ color: mode.accent, fontWeight: 700, ...ss04 }}>
            {activeMerchant ? "MERCHANT MODE" : "PLATFORM MODE"}
          </span>
        </div>
      )}

      {open && !collapsed && (
        <div className="absolute top-[48px] left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl z-[60] overflow-hidden max-h-[320px] overflow-y-auto" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
          <button
            onClick={() => { setActiveMerchant(null); setOpen(false); navigate("/oms"); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#f9f9fa] cursor-pointer transition-colors text-left ${!activeMerchant ? "bg-purple-50/50" : ""}`}
          >
            <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
              <OmsGlobeIcon color="#8b5cf6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>All Merchants</p>
              <p className="text-[#b0b3b8] text-[9px]" style={ss04}>Platform-wide view</p>
            </div>
            {!activeMerchant && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
          </button>
          <div className="h-px bg-[#f0f1f3]" />
          {activeMerchants.map(m => (
            <button
              key={m.id}
              onClick={() => { setActiveMerchant(m); setOpen(false); navigate("/oms/dashboard"); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#f9f9fa] cursor-pointer transition-colors text-left ${activeMerchant?.id === m.id ? "bg-[#fff4ed]" : ""}`}
            >
              <div className="w-6 h-6 rounded bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[9px] flex-shrink-0" style={{ fontWeight: 700, ...ss04 }}>{m.logo}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{m.name}</p>
                <p className="text-[#b0b3b8] text-[9px]" style={ss04}>{m.primaryDomain}</p>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${m.status === "active" ? "bg-emerald-50 text-emerald-500" : m.status === "onboarding" ? "bg-amber-50 text-amber-500" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                {m.status === "active" ? "LIVE" : m.status.toUpperCase()}
              </span>
              {activeMerchant?.id === m.id && <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== SIDEBAR ==================== */
function OmsSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout, activeMerchant, setActiveMerchant } = useOmsAuth();
  const { t } = useI18n();
  const currentPath = location.pathname;
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const isMerchantMode = !!activeMerchant;
  const mode = isMerchantMode ? MODE_COLORS.merchant : MODE_COLORS.platform;

  const isActive = (path: string) => {
    if (path === "/oms") return currentPath === "/oms";
    if (path === "/oms/dashboard") return currentPath === "/oms/dashboard" || (currentPath === "/oms" && !!activeMerchant);
    return currentPath.startsWith(path);
  };

  const handleLogout = () => { logout(); navigate("/oms"); };

  const getSectionTitle = (section: NavSection) => {
    if (section.merchantTitle && activeMerchant) {
      const shortName = activeMerchant.name.length > 14 ? activeMerchant.name.slice(0, 14).toUpperCase() : activeMerchant.name.toUpperCase();
      return section.merchantTitle.replace("{MERCHANT}", shortName);
    }
    return section.title;
  };

  const visibleSections = NAV_SECTIONS.filter(s => {
    if (s.platformOnly && !isPlat) return false;
    return true;
  });

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[220px]"}`} style={pp}>
      <div className="h-[3px] w-full transition-colors duration-300" style={{ background: mode.accent }} />

      <div className="flex-1 flex flex-col border-r border-[#f0f1f3] overflow-hidden">
        {/* Header */}
        <div className={`h-[53px] flex items-center border-b border-[#f0f1f3] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#ff5222] rounded-lg flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 2px 8px rgba(255,82,34,0.3)" }}>
                <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <span className="text-[#070808] text-[13px] block leading-tight" style={{ fontWeight: 700, ...ss04 }}>PredictEx</span>
                <span className="text-[#b0b3b8] text-[9px] block leading-tight" style={{ fontWeight: 500, ...ss04 }}>SaaS Platform v2.0</span>
              </div>
            </div>
          )}
          <button onClick={onToggle} className="text-[#b0b3b8] hover:text-[#070808] transition-colors cursor-pointer p-1">
            <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {collapsed ? <><path d="M3 4h10" /><path d="M3 8h10" /><path d="M3 12h10" /></> : <><path d="M3 4h10" /><path d="M3 8h6" /><path d="M3 12h10" /></>}
            </svg>
          </button>
        </div>

        <div className="pt-3">
          <TenantSwitcher collapsed={collapsed} />
        </div>

        {isMerchantMode && isPlat && !collapsed && (
          <div className="mx-2 mb-2">
            <button
              onClick={() => { setActiveMerchant(null); navigate("/oms"); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#8b5cf6] hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2L3 6l4 4" /></svg>
              <span className="text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Back to Platform View</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1 px-2">
          {visibleSections.map(section => {
            const items = section.items.filter(i => !i.platformOnly || isPlat);
            if (items.length === 0) return null;
            const isPlatformSection = section.platformOnly;
            const isDimmed = !isPlatformSection && !activeMerchant && isPlat;
            return (
              <div key={section.title} className={`mb-3 ${isDimmed ? "opacity-40" : ""}`} style={{ transition: "opacity 0.2s" }}>
                {!collapsed && (
                  <div className="flex items-center gap-1.5 px-2.5 mb-1.5">
                    {!isPlatformSection && activeMerchant && (
                      <div className="w-1 h-1 rounded-full bg-[#ff5222] flex-shrink-0" />
                    )}
                    {isPlatformSection && (
                      <div className="w-1 h-1 rounded-full bg-[#8b5cf6] flex-shrink-0" />
                    )}
                    <p className="text-[#b0b3b8] text-[9px] tracking-[0.08em]" style={{ fontWeight: 600, ...ss04 }}>
                      {section.merchantTitle && activeMerchant ? getSectionTitle(section) : tSectionTitle(t, section.title)}
                    </p>
                    {isDimmed && (
                      <span className="text-[7px] text-[#b0b3b8] tracking-[0.05em] ml-auto" style={{ fontWeight: 500, ...ss04 }}>SELECT MERCHANT</span>
                    )}
                  </div>
                )}
                {items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-2.5 h-9 rounded-lg mb-0.5 cursor-pointer transition-all ${collapsed ? "justify-center px-0" : "px-2.5"} ${active ? "bg-[#fff4ed]" : "text-[#84888c] hover:bg-[#f9f9fa]"}`}
                      title={collapsed ? tNavLabel(t, item.label) : undefined}
                    >
                      <item.icon color={active ? "#ff5222" : "#84888c"} />
                      {!collapsed && (
                        <>
                          <span className={`text-[12.5px] flex-1 text-left ${active ? "text-[#ff5222]" : ""}`} style={{ fontWeight: active ? 600 : 500, ...ss04 }}>{tNavLabel(t, item.label)}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ff5222] text-white" style={{ fontWeight: 600, ...ss04 }}>{item.badge}</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Admin profile */}
        <div className={`border-t border-[#f0f1f3] p-3 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f0f1f3] flex items-center justify-center text-[11px] flex-shrink-0" style={{ color: "#ff5222", fontWeight: 700, ...ss04 }}>
                {admin?.name.split(" ").map(n => n[0]).join("") || "AD"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#070808] text-[12px] truncate" style={{ fontWeight: 600, ...ss04 }}>{admin?.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${lightRoleBadge(admin?.role || "")}`} style={{ fontWeight: 600, ...ss04 }}>
                  {getRoleLabel(admin?.role || "")}
                </span>
              </div>
              <button onClick={handleLogout} className="text-[#b0b3b8] hover:text-red-400 transition-colors cursor-pointer p-1" title="Logout">
                <OmsLogoutIcon />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-[#b0b3b8] hover:text-red-400 transition-colors cursor-pointer p-1" title="Logout">
              <OmsLogoutIcon />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ==================== HEADER ==================== */
function OmsHeader({ collapsed, onMobileToggle, onOpenCommandPalette }: { collapsed: boolean; onMobileToggle: () => void; onOpenCommandPalette: () => void }) {
  const { admin, activeMerchant, setActiveMerchant, logout } = useOmsAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const isMerchantMode = !!activeMerchant;
  const [accountOpen, setAccountOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen && !langOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountOpen && accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (langOpen && langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountOpen, langOpen]);

  const PAGE_TITLE_MAP: Record<string, string> = {
    "/dashboard": "nav.dashboard",
    "/merchants": "nav.merchants",
    "/users": "nav.users",
    "/markets": "nav.markets",
    "/bets": "nav.bets",
    "/finance": "nav.finance",
    "/risk": "nav.risk",
    "/wallet": "nav.wallet",
    "/fast-bet": "nav.fast_bet",
    "/odds": "nav.odds",
    "/creators": "nav.creators",
    "/rewards": "nav.rewards",
    "/affiliates": "nav.affiliates",
    "/leaderboard": "nav.leaderboard",
    "/promos": "nav.promos",
    "/content": "nav.content",
    "/notif-mgmt": "nav.notifications",
    "/reports": "nav.reports",
    "/audit": "nav.audit",
    "/support": "nav.support",
    "/settings": "nav.settings",
    "/billing": "nav.billing",
    "/paas-config": "nav.paas_config",
    "/paas-merchant": "nav.merchant_config",
    "/payment-methods": "nav.payment_methods",
    "/payment-providers": "nav.payment_providers",
    "/kyb": "nav.kyb",
    "/admin-users": "nav.admin_users",
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/oms" && !activeMerchant) return t("nav.platform_overview");
    if (p === "/oms" && activeMerchant) return t("nav.dashboard");
    for (const [segment, key] of Object.entries(PAGE_TITLE_MAP)) {
      if (p.includes(segment)) return t(key);
    }
    return "OMS";
  };

  const platformPaths = ["/oms/merchants", "/oms/billing", "/oms/paas-config", "/oms/payment-methods", "/oms/payment-providers", "/oms/kyb", "/oms/admin-users"];
  const isOnPlatformPage = location.pathname === "/oms" || platformPaths.some(p => location.pathname.startsWith(p));

  return (
    <header className={`fixed top-0 right-0 h-[56px] bg-white/90 backdrop-blur-md border-b border-[#f0f1f3] flex items-center justify-between px-4 md:px-6 z-40 transition-all duration-300 ${collapsed ? "left-0 md:left-[68px]" : "left-0 md:left-[220px]"}`} style={pp}>
      <div className="flex items-center gap-3">
        <button onClick={onMobileToggle} className="md:hidden text-[#84888c] hover:text-[#070808] cursor-pointer p-1">
          <svg className="size-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
        </button>
        <div className="flex items-center gap-2.5">
          <h2 className="text-[#070808] text-[15px]" style={{ fontWeight: 600, ...ss04 }}>{getPageTitle()}</h2>
          {activeMerchant && !isOnPlatformPage && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-[#fff4ed] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222]" />
              {activeMerchant.name}
            </span>
          )}
          {!activeMerchant && isPlat && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-50 text-[#8b5cf6]" style={{ fontWeight: 600, ...ss04 }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              All Merchants
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isMerchantMode && isPlat && !isOnPlatformPage && (
          <button
            onClick={() => { setActiveMerchant(null); navigate("/oms"); }}
            className="hidden md:flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-purple-50 text-[#8b5cf6] hover:bg-purple-100 cursor-pointer transition-colors"
          >
            <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2L3 6l4 4" /></svg>
            <span className="text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Platform</span>
          </button>
        )}

        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl px-3 h-8 cursor-pointer hover:border-[#d1d5db] transition-colors"
        >
          <OmsSearchIcon color="#b0b3b8" />
          <span className="text-[#b0b3b8] text-[12px] w-[100px] text-left truncate" style={ss04}>{t("common.search")}...</span>
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-white text-[#b0b3b8] border border-[#e5e7eb]" style={{ fontWeight: 500, ...ss04 }}>&#8984;K</kbd>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-600 text-[10px]" style={{ fontWeight: 600, ...ss04 }}>LIVE</span>
        </div>

        {/* Environment indicator (Item 53) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full" title="Environment: Staging — switch to production in PaaS Config">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-amber-600 text-[10px]" style={{ fontWeight: 600, ...ss04 }}>STAGING</span>
        </div>

        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 h-7 px-2 rounded-lg hover:bg-[#f5f6f8] cursor-pointer transition-colors" title={t("header.notifications")}>
            <span className="text-[13px]">{LOCALE_META[locale].flag}</span>
            <span className="hidden sm:inline text-[10px] text-[#84888c]" style={{ fontWeight: 600, ...ss04 }}>{locale === "en" ? "EN" : locale === "zh-TW" ? "繁中" : locale === "fil" ? "FIL" : "VI"}</span>
            <svg className={`size-2.5 text-[#b0b3b8] transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 4.5l3 3 3-3" /></svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-[36px] w-[160px] bg-white border border-[#e5e7eb] rounded-xl z-[60] overflow-hidden py-1" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
              {(Object.keys(LOCALE_META) as OmsLocale[]).map(l => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setLangOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#f9f9fa] cursor-pointer transition-colors text-left ${locale === l ? "bg-[#fff4ed]" : ""}`}
                >
                  <span className="text-[14px]">{LOCALE_META[l].flag}</span>
                  <span className={`text-[12px] ${locale === l ? "text-[#ff5222]" : "text-[#070808]"}`} style={{ fontWeight: locale === l ? 600 : 500, ...ss04 }}>{LOCALE_META[l].nativeName}</span>
                  {locale === l && (
                    <svg className="size-3.5 text-[#ff5222] ml-auto" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8.5l3.5 3.5L13 4" /></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification center */}
        <NotificationCenter />

        {/* Account dropdown */}
        <div className="relative" ref={accountRef}>
          <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 cursor-pointer hover:bg-[#f5f6f8] rounded-lg px-1.5 py-1 -mr-1.5 transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] bg-[#f0f1f3]" style={{ fontWeight: 700, color: "#ff5222", ...ss04 }}>
              {admin?.name.split(" ").map(n => n[0]).join("") || "AD"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[#070808] text-[11px] leading-tight" style={{ fontWeight: 600, ...ss04 }}>{admin?.tenantName || admin?.name}</p>
            </div>
            <svg className={`size-3 text-[#b0b3b8] transition-transform hidden sm:block ${accountOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 4.5l3 3 3-3" /></svg>
          </button>
          {accountOpen && (
            <div className="absolute right-0 top-[42px] w-[240px] bg-white border border-[#e5e7eb] rounded-xl z-[60] overflow-hidden" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
              <div className="p-3 border-b border-[#f0f1f3]">
                <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{admin?.name}</p>
                <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{admin?.email}</p>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1 inline-block ${lightRoleBadge(admin?.role || "")}`} style={{ fontWeight: 600, ...ss04 }}>{getRoleLabel(admin?.role || "")}</span>
                {admin?.tenantName && <p className="text-[#b0b3b8] text-[9px] mt-1" style={ss04}>{admin.tenantName}</p>}
              </div>
              <div className="py-1">
                <button onClick={() => { setAccountOpen(false); setChangePwOpen(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#f9f9fa] cursor-pointer transition-colors text-left">
                  <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" /></svg>
                  <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{t("header.change_password")}</span>
                </button>
                <button onClick={() => { setAccountOpen(false); logout(); navigate("/oms"); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 cursor-pointer transition-colors text-left">
                  <svg className="size-4 text-red-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" /></svg>
                  <span className="text-red-500 text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{t("header.logout")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChangePasswordModal open={changePwOpen} onClose={() => setChangePwOpen(false)} />
    </header>
  );
}

/* ==================== TENANT CONFIG HYDRATOR ==================== */
function TenantConfigHydrator({ merchantId }: { merchantId: string }) {
  const { setConfig } = useTenantConfig();
  useEffect(() => {
    setConfig(loadConfig(merchantId));
  }, [merchantId, setConfig]);
  return null;
}

/* ==================== MAIN LAYOUT ==================== */
export function OmsLayout() {
  const { isAuthenticated, admin, activeMerchant, setActiveMerchant } = useOmsAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // OMS Session timeout (Item 48) — auto-logout after 30 min inactivity
  const { logout } = useOmsAuth();
  useEffect(() => {
    if (!isAuthenticated) return;
    const OMS_TIMEOUT = 30 * 60 * 1000;
    const KEY = "oms_last_activity";
    const refresh = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} };
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, refresh, { passive: true }));
    refresh();
    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem(KEY) || "0", 10);
      if (Date.now() - last > OMS_TIMEOUT) {
        showOmsToast("Session expired — logged out due to inactivity", "info");
        logout();
      }
    }, 60_000);
    return () => { events.forEach(e => window.removeEventListener(e, refresh)); clearInterval(interval); };
  }, [isAuthenticated, logout]);

  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const platformOnlyPaths = ["/oms/merchants", "/oms/billing", "/oms/paas-config", "/oms/payment-methods", "/oms/payment-providers", "/oms/kyb", "/oms/admin-users"];
  const isOnPlatformRoute = location.pathname === "/oms" || platformOnlyPaths.some(p => location.pathname.startsWith(p));

  // Route guard: redirect merchant-scoped admins away from platform-only routes
  useEffect(() => {
    if (isAuthenticated && !isPlat && isOnPlatformRoute) {
      navigate("/oms/dashboard", { replace: true });
    }
  }, [isAuthenticated, isPlat, isOnPlatformRoute, navigate]);

  // Route guard: if platform user navigates to a merchant-scoped page without selecting a merchant,
  // show the "select merchant" warning (handled in the banner below — no hard redirect needed,
  // since the page content still renders with aggregated/empty data)

  if (!isAuthenticated) return <OmsLogin />;

  // First-login gate — force password change before accessing the system
  if (admin?.needsPasswordChange || admin?.status === "first_login") return <FirstLoginGate />;

  const isMerchantMode = !!activeMerchant;
  const mode = isMerchantMode ? MODE_COLORS.merchant : MODE_COLORS.platform;

  const showMerchantBanner = !isOnPlatformRoute && activeMerchant;
  const showNoMerchantWarning = !isOnPlatformRoute && !activeMerchant && isPlat;

  /* OMS Light Theme CSS Override — transforms all dark-themed page content to light theme
     matching the user-facing /markets Poppins design system */
  const omsLightCSS = `
    /* === CARD BACKGROUNDS === */
    .oms-pages [class*="bg-[#111827]"] { background-color: #ffffff !important; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .oms-pages [class*="bg-[#0a0e1a]"]:not(input):not(textarea):not(select) { background-color: #f5f6f8 !important; }
    .oms-pages [class*="bg-[#070b14]"] { background-color: #f5f6f8 !important; }

    /* === BORDERS === */
    .oms-pages [class*="border-[#1f2937]"] { border-color: #e5e7eb !important; }
    .oms-pages [class*="border-[#374151]"] { border-color: #d1d5db !important; }

    /* === BACKGROUNDS (secondary) === */
    .oms-pages [class*="bg-[#1f2937]"]:not(button):not([class*="rounded-full"]) { background-color: #f0f1f3 !important; }
    .oms-pages button[class*="bg-[#1f2937]"] { background-color: #f0f1f3 !important; }

    /* === TEXT COLORS — inside card containers (bg-[#111827] now white) === */
    .oms-pages [class*="bg-[#111827]"] [class*="text-white"]:not(button):not([class*="bg-[#ff5222]"]):not([class*="bg-gradient"]):not([class*="rounded-full"][class*="bg-"]) { color: #070808 !important; }
    .oms-pages [class*="bg-[#111827]"] p[class*="text-white"],
    .oms-pages [class*="bg-[#111827]"] td[class*="text-white"],
    .oms-pages [class*="bg-[#111827]"] h3[class*="text-white"],
    .oms-pages [class*="bg-[#111827]"] h4[class*="text-white"],
    .oms-pages [class*="bg-[#111827]"] span[class*="text-white"]:not([class*="bg-"]) { color: #070808 !important; }

    /* === MUTED TEXT === */
    .oms-pages [class*="text-[#9ca3af]"] { color: #84888c !important; }
    .oms-pages [class*="text-[#6b7280]"] { color: #b0b3b8 !important; }
    .oms-pages [class*="text-[#4b5563]"] { color: #b0b3b8 !important; }
    .oms-pages [class*="text-[#d1d5db]"] { color: #555555 !important; }

    /* === HOVER STATES === */
    .oms-pages [class*="hover:bg-[#1f2937]"]:hover { background-color: #f5f6f7 !important; }
    .oms-pages [class*="hover:bg-[#374151]"]:hover { background-color: #e5e7eb !important; }
    .oms-pages [class*="hover:text-white"]:hover:not(button[class*="bg-[#ff5222]"]) { color: #070808 !important; }

    /* === STATUS BADGES (lighter for light theme) === */
    .oms-pages [class*="bg-emerald-500/15"] { background-color: rgba(236,253,245,1) !important; }
    .oms-pages [class*="text-emerald-400"]:not(svg):not([class*="bg-"]) { color: #059669 !important; }
    .oms-pages [class*="bg-amber-500/15"] { background-color: rgba(255,251,235,1) !important; }
    .oms-pages [class*="text-amber-400"]:not(svg) { color: #d97706 !important; }
    .oms-pages [class*="bg-red-500/15"] { background-color: rgba(254,242,242,1) !important; }
    .oms-pages [class*="text-red-400"]:not(svg) { color: #ef4444 !important; }
    .oms-pages [class*="bg-blue-500/15"] { background-color: rgba(239,246,255,1) !important; }
    .oms-pages [class*="text-blue-400"]:not(svg) { color: #3b82f6 !important; }
    .oms-pages [class*="bg-orange-500/15"] { background-color: rgba(255,247,237,1) !important; }
    .oms-pages [class*="text-orange-400"]:not(svg) { color: #f97316 !important; }
    .oms-pages [class*="bg-purple-500/15"] { background-color: rgba(250,245,255,1) !important; }
    .oms-pages [class*="text-purple-400"]:not(svg) { color: #8b5cf6 !important; }
    .oms-pages [class*="bg-cyan-500/15"] { background-color: rgba(236,254,255,1) !important; }
    .oms-pages [class*="text-cyan-400"]:not(svg) { color: #0891b2 !important; }
    .oms-pages [class*="bg-gray-500/15"] { background-color: rgba(249,250,251,1) !important; }
    .oms-pages [class*="text-gray-400"]:not(svg) { color: #6b7280 !important; }

    /* === TOP-LEVEL TEXT (not inside cards) === */
    .oms-pages > div > [class*="text-white"],
    .oms-pages > [class*="text-white"] { color: #070808 !important; }

    /* === INPUTS (keep light in OMS context) === */
    .oms-pages input[class*="bg-[#0a0e1a]"],
    .oms-pages textarea[class*="bg-[#0a0e1a]"],
    .oms-pages select[class*="bg-[#0a0e1a]"] { background-color: #f5f6f8 !important; color: #070808 !important; border-color: #e5e7eb !important; }
    .oms-pages input[class*="text-white"],
    .oms-pages textarea[class*="text-white"],
    .oms-pages select[class*="text-white"] { color: #070808 !important; }

    /* === CHARTS — tooltip overrides === */
    .oms-pages .recharts-default-tooltip { background: white !important; border-color: #e5e7eb !important; color: #070808 !important; }

    /* === KEEP WHITE TEXT on accent buttons === */
    .oms-pages button[class*="bg-[#ff5222]"] { color: white !important; }
    .oms-pages button[class*="bg-[#ff5222]"] span { color: white !important; }
    .oms-pages [class*="bg-gradient"] { color: white !important; }
    .oms-pages [class*="bg-gradient"] span { color: white !important; }
    .oms-pages [class*="bg-[#ff5222]"][class*="rounded-full"] { color: white !important; }

    /* === ROUND CORNERS upgrade === */
    .oms-pages [class*="rounded-xl"]:not(input):not(button):not(select):not(textarea) { border-radius: 16px !important; }

    /* === FONT — enforce Poppins === */
    .oms-pages { font-family: 'Poppins', sans-serif !important; }
    .oms-pages * { font-feature-settings: 'ss04' !important; }
  `;

  return (
    <I18nProvider>
    <TenantConfigProvider>
    <TenantConfigHydrator merchantId={activeMerchant?.id || "GLOBAL"} />
    <OmsLayoutContent
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      cmdPaletteOpen={cmdPaletteOpen}
      setCmdPaletteOpen={setCmdPaletteOpen}
      omsLightCSS={omsLightCSS}
      activeMerchant={activeMerchant}
      setActiveMerchant={setActiveMerchant}
      isPlat={isPlat}
      showMerchantBanner={showMerchantBanner}
      showNoMerchantWarning={showNoMerchantWarning}
      navigate={navigate}
    />
    </TenantConfigProvider>
    </I18nProvider>
  );
}

/* ==================== INNER CONTENT (can call useI18n since it's inside the provider) ==================== */
function OmsLayoutContent({
  collapsed, setCollapsed, mobileOpen, setMobileOpen,
  cmdPaletteOpen, setCmdPaletteOpen, omsLightCSS,
  activeMerchant, setActiveMerchant, isPlat,
  showMerchantBanner, showNoMerchantWarning, navigate,
}: {
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void;
  cmdPaletteOpen: boolean; setCmdPaletteOpen: (v: boolean) => void;
  omsLightCSS: string;
  activeMerchant: any; setActiveMerchant: (v: any) => void;
  isPlat: boolean;
  showMerchantBanner: any; showNoMerchantWarning: boolean;
  navigate: (path: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f5f6f8]" style={pp}>
      <style>{omsLightCSS}</style>
      <OmsToastContainer />
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="hidden md:block">
        <OmsSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-0 left-0 z-50">
          <OmsSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      <OmsHeader collapsed={collapsed} onMobileToggle={() => setMobileOpen(!mobileOpen)} onOpenCommandPalette={() => setCmdPaletteOpen(true)} />
      <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
      <main className={`pt-[56px] min-h-screen transition-all duration-300 ${collapsed ? "md:ml-[68px]" : "md:ml-[220px]"}`}>
        <div className="oms-pages p-4 md:p-6">
          {showMerchantBanner && (
            <div className="mb-4 rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${MODE_COLORS.merchant.border}`, boxShadow: "0 2px 8px rgba(255,82,34,0.04)" }}>
              <div className="h-[3px]" style={{ background: MODE_COLORS.merchant.accent }} />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] flex-shrink-0" style={{ background: `${MODE_COLORS.merchant.accent}10`, color: MODE_COLORS.merchant.accent, fontWeight: 700, ...ss04 }}>
                  {activeMerchant.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{activeMerchant.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeMerchant.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`} style={{ fontWeight: 600, ...ss04 }}>{activeMerchant.status.toUpperCase()}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-500" style={{ fontWeight: 600, ...ss04 }}>{activeMerchant.plan.toUpperCase()}</span>
                  </div>
                  <p className="text-[#b0b3b8] text-[10px] mt-0.5" style={ss04}>{activeMerchant.primaryDomain} · {activeMerchant.id} · {activeMerchant.currency} · {t("layout.data_scoped", "Data scoped to this merchant")}</p>
                </div>
                {isPlat && (
                  <button
                    onClick={() => { setActiveMerchant(null); navigate("/oms"); }}
                    className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-purple-50 text-[#8b5cf6] hover:bg-purple-100 cursor-pointer transition-colors flex-shrink-0"
                  >
                    <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2L3 6l4 4" /></svg>
                    <span className="text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{t("layout.platform_view", "Platform View")}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {showNoMerchantWarning && (
            <div className="mb-4 rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.04)" }}>
              <div className="h-[3px] bg-[#8b5cf6]" />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <OmsGlobeIcon color="#8b5cf6" />
                </div>
                <div className="flex-1">
                  <p className="text-[#8b5cf6] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{t("layout.aggregated_view", "Viewing aggregated data — All Merchants")}</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{t("layout.select_merchant_hint", "Select a specific merchant in the sidebar to scope data to one tenant.")}</p>
                </div>
                <span className="hidden md:inline-flex text-[9px] px-2 py-1 rounded-full bg-purple-50 text-[#8b5cf6]" style={{ fontWeight: 600, ...ss04 }}>{t("layout.platform_mode", "PLATFORM MODE")}</span>
              </div>
            </div>
          )}

          <OmsBreadcrumb merchantName={activeMerchant?.name} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}