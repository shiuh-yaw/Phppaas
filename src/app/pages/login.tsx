import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../components/auth-context";
import { useT } from "../i18n/useT";
import { EmojiIcon } from "../components/two-tone-icons";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CountryPhoneSelector, DEFAULT_COUNTRY, type Country } from "../components/country-phone-selector";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const keyframes = `
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes success-pop { 0%{transform:scale(0)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
@keyframes check-draw { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
@keyframes fade-in { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes dropdown-in { 0%{opacity:0;transform:translateY(-6px)} 100%{opacity:1;transform:translateY(0)} }
`;

const BG_IMG = "https://images.unsplash.com/photo-1581513118044-696c147c1a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGlsaXBwaW5lJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbiUyMHZpYnJhbnR8ZW58MXx8fHwxNzczNTg0MzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const t = useT();
  const [step, setStep] = useState<"form" | "otp" | "success" | "forgot" | "reset-code" | "new-password" | "reset-done">("form");
  const [shakeError, setShakeError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Country selectors
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [forgotCountry, setForgotCountry] = useState<Country>(DEFAULT_COUNTRY);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [forgotPhone, setForgotPhone] = useState("");
  const [resetCode, setResetCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const triggerShake = () => { setShakeError(true); setTimeout(() => setShakeError(false), 500); };

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <span className="text-[11px] text-[#dc2626] mt-0.5 flex items-center gap-1" style={{ fontWeight: 500, ...ss }}>
        <EmojiIcon emoji="⚠️" size={12} /> {errors[field]}
      </span>
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = t("login.error.phoneRequired");
    else if (phone.length < 5) errs.phone = `Enter a valid phone number for ${country.name}`;
    setErrors(errs);
    if (Object.keys(errs).length > 0) { triggerShake(); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setStep("otp");
  };

  const handleSocialLogin = (_provider: string) => {
    const mockUser = {
      name: "Juan Cruz",
      handle: "@JuanBet123",
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
    };
    login(mockUser);
    setStep("success");
    const dest = mockUser.mfaConfigured === false ? "/mfa-setup" : "/";
    setTimeout(() => navigate(dest), 1500);
  };

  const handleOtp = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`login-otp-${idx + 1}`)?.focus();
    const full = next.join("");
    if (full.length === 6 && next.every(d => d !== "")) setTimeout(() => verifyOtp(next), 300);
  };

  const verifyOtp = (digits?: string[]) => {
    const code = (digits || otp).join("");
    if (code.length < 6) { triggerShake(); setErrors({ otp: "Enter the 6-digit code" }); return; }
    // Mock: simulate returning user — check stored user's mfaConfigured status
    // In a real app, the server would return the user's MFA status
    const storedRaw = localStorage.getItem("fg_auth_user_v1");
    const storedUser = storedRaw ? JSON.parse(storedRaw) : null;
    const mockUser = {
      name: "Juan Cruz",
      handle: "@JuanBet123",
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
      mfaConfigured: storedUser?.mfaConfigured ?? false,
    };
    login(mockUser);
    setStep("success");
    const dest = mockUser.mfaConfigured ? "/" : "/mfa-setup";
    setTimeout(() => navigate(dest), 1500);
  };

  return (
    <div className="min-h-screen flex" style={pp}>
      <style>{keyframes}</style>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: "linear-gradient(135deg, #1a0a04 0%, #2d1106 40%, #ff5222 200%)" }}>
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback src={BG_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a04] via-[#1a0a04]/70 to-transparent" />

        <div className="relative z-10">
          <button onClick={() => navigate("/")} className="cursor-pointer">
            <div className="text-white leading-none" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>PrediEx</div>
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-white text-[28px] leading-[1.2]" style={{ fontWeight: 700, ...ss }}>
            Predict Everything.
          </h1>
          <p className="text-white/60 text-[14px] leading-[1.6] max-w-[360px]" style={ss}>
            Join the global prediction market platform. Bet on sports, showbiz, economy, and more — from anywhere in the world.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {[
              { emoji: "🏀", label: "Sports" },
              { emoji: "🎬", label: "Showbiz" },
              { emoji: "📈", label: "Economy" },
              { emoji: "🎰", label: "Color Game" },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <EmojiIcon emoji={c.emoji} size={14} />
                <span className="text-[11px] text-white/70" style={{ fontWeight: 500, ...ss }}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Global presence badge */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
              <span className="text-[13px]">🌏</span>
              <span className="text-[11px] text-white/60" style={{ fontWeight: 500, ...ss }}>65+ Countries Supported</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="size-5 rounded-full bg-[#00bf85]/20 flex items-center justify-center">
              <div className="size-2.5 rounded-full bg-[#00bf85]" />
            </div>
            <span className="text-[12px] text-white/50" style={ss}>PAGCOR Licensed &bull; Secure Platform</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-[420px]" style={{ animation: "fade-in 0.4s ease-out" }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <button onClick={() => navigate("/")} className="cursor-pointer">
              <div className="text-[#ff5222] leading-none" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>PrediEx</div>
            </button>
          </div>

          <div style={{ animation: shakeError ? "shake 0.4s ease-in-out" : "none" }}>
            {step === "form" && (
              <>
                <div className="mb-6">
                  <h2 className="text-[24px] text-[#070808] mb-1.5" style={{ fontWeight: 700, ...ss }}>
                    Welcome back!
                  </h2>
                  <p className="text-[13px] text-[#84888c] leading-[1.5]" style={ss}>
                    Enter your phone number to receive an OTP code.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Phone with country selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>{t("login.phone")}</label>
                    <CountryPhoneSelector
                      selectedCountry={country}
                      onCountryChange={c => { setCountry(c); setErrors(prev => { const n = { ...prev }; delete n.phone; return n; }); }}
                      phone={phone}
                      onPhoneChange={setPhone}
                      error={errors.phone}
                      onErrorClear={() => setErrors(prev => { const n = { ...prev }; delete n.phone; return n; })}
                    />
                    <FieldError field="phone" />
                  </div>
                </div>

                {/* OTP info */}
                <div className="mt-3 flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
                  <EmojiIcon emoji="🔒" size={14} />
                  <span className="text-[11px] text-[#166534] leading-relaxed" style={{ fontWeight: 500, ...ss }}>
                    We'll send a one-time passcode (OTP) via SMS to verify your identity. No password needed.
                  </span>
                </div>

                {/* Demo quick-fill */}
                <div className="mt-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <EmojiIcon emoji="💡" size={14} />
                    <span className="text-[11px] text-[#1e40af]" style={{ fontWeight: 600, ...ss }}>Demo Mode — Quick Fill</span>
                  </div>
                  <button
                    onClick={() => { setPhone("9171234567"); setErrors({}); }}
                    className="text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="⚡" size={12} /> Click to auto-fill demo phone number
                  </button>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  Send OTP Code
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#f0f1f3]" />
                  <span className="text-[11px] text-[#b0b3b8]" style={ss}>{t("login.or")}</span>
                  <div className="flex-1 h-px bg-[#f0f1f3]" />
                </div>

                {/* Social */}
                <div className="flex items-center gap-2">
                  {[
                    { label: "GCash", color: "#0070E0", emoji: "📱" },
                    { label: "Google", color: "#4285f4", emoji: "🔵" },
                    { label: "Facebook", color: "#1877f2", emoji: "🔷" },
                  ].map((s) => (
                    <button key={s.label} onClick={() => handleSocialLogin(s.label)}
                      className="flex-1 h-11 rounded-xl border border-[#f0f1f3] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#fafafa] transition-colors active:scale-[0.97]">
                      <EmojiIcon emoji={s.emoji} size={14} />
                      <span className="text-[12px]" style={{ fontWeight: 500, color: s.color, ...ss }}>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Switch to signup */}
                <p className="text-center text-[13px] text-[#84888c] mt-6" style={ss}>
                  {t("login.noAccount")}{" "}
                  <Link to="/signup" className="text-[#ff5222] hover:underline cursor-pointer" style={{ fontWeight: 600 }}>
                    {t("login.signupLink")}
                  </Link>
                </p>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="text-center mb-6">
                  <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-4">
                    <EmojiIcon emoji="📱" size={32} />
                  </div>
                  <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>
                    Enter OTP Code
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    6-digit code sent to {country.dial} {phone}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 mb-3">
                  {otp.map((digit, i) => (
                    <input key={i} id={`login-otp-${i}`} value={digit}
                      onChange={e => handleOtp(e.target.value, i)}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`login-otp-${i - 1}`)?.focus();
                        if (e.key === "Enter") verifyOtp();
                      }}
                      maxLength={1}
                      className={`size-13 rounded-xl border-2 ${errors.otp ? "border-[#dc2626]/50" : "border-[#f0f1f3]"} bg-[#fafafa] text-center text-[22px] text-[#070808] outline-none focus:border-[#ff5222] focus:bg-white transition-all`}
                      style={{ fontWeight: 700, ...ss }}
                      autoFocus={i === 0}
                      inputMode="numeric"
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-[11px] text-[#dc2626] text-center mb-2" style={ss}><EmojiIcon emoji="⚠️" size={12} /> {errors.otp}</p>}

                <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 mb-5">
                  <button onClick={() => {
                    const demoOtp = ["1", "2", "3", "4", "5", "6"];
                    setOtp(demoOtp);
                    setErrors({});
                    setTimeout(() => verifyOtp(demoOtp), 500);
                  }}
                    className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="💡" size={12} /> Demo: Click to auto-fill OTP (123456)
                  </button>
                </div>

                <button onClick={() => verifyOtp()}
                  className="w-full h-12 rounded-xl text-white text-[14px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  Verify & Sign In
                </button>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="text-[12px] text-[#84888c]" style={ss}>Didn't receive the code?</span>
                  <button className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss }}>Resend</button>
                </div>
                <button onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); setErrors({}); }}
                  className="w-full text-center text-[12px] text-[#84888c] mt-4 cursor-pointer hover:text-[#070808]" style={ss}>
                  ← Back
                </button>
              </>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center py-8">
                <div className="size-20 rounded-full bg-[#e6fff3] flex items-center justify-center mb-4" style={{ animation: "success-pop 0.5s ease-out" }}>
                  <svg className="size-10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "check-draw 0.6s ease-out 0.3s both" }} />
                  </svg>
                </div>
                <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>Welcome back!</h2>
                <p className="text-[13px] text-[#84888c] mb-3" style={ss}>{t("login.success.redirecting")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#00bf85] bg-[#e6fff3] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>✓ Verified</span>
                  <span className="text-[12px] text-[#ff5222] bg-[#fff4ed] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>
                    <span className="inline-flex items-center gap-1">₱5,000 Balance! <EmojiIcon emoji="🎁" size={12} /></span>
                  </span>
                </div>
                <p className="text-[11px] text-[#84888c] mt-4" style={ss}>Redirecting...</p>
              </div>
            )}

            {/* ===== FORGOT PASSWORD FLOW ===== */}
            {step === "forgot" && (
              <>
                <div className="mb-6">
                  <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-4">
                    <EmojiIcon emoji="🔑" size={32} />
                  </div>
                  <h2 className="text-[22px] text-[#070808] text-center mb-1" style={{ fontWeight: 700, ...ss }}>
                    {t("login.forgot.title")}
                  </h2>
                  <p className="text-[13px] text-[#84888c] text-center" style={ss}>
                    {t("login.forgot.desc")}
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>{t("login.phone")}</label>
                    <CountryPhoneSelector
                      selectedCountry={forgotCountry}
                      onCountryChange={c => { setForgotCountry(c); setErrors({}); }}
                      phone={forgotPhone}
                      onPhoneChange={setForgotPhone}
                      error={errors.forgotPhone}
                      onErrorClear={() => setErrors(prev => { const n = { ...prev }; delete n.forgotPhone; return n; })}
                    />
                    <FieldError field="forgotPhone" />
                  </div>
                </div>
                <div className="mt-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5">
                  <button onClick={() => { setForgotPhone("9171234567"); setErrors({}); }}
                    className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="💡" size={12} /> Demo: Auto-fill phone number
                  </button>
                </div>
                <button onClick={() => {
                  if (!forgotPhone.trim() || forgotPhone.length < 5) {
                    setErrors({ forgotPhone: "Enter a valid phone number" }); triggerShake(); return;
                  }
                  setStep("reset-code"); setErrors({});
                }}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  {t("login.forgot.submit")}
                </button>
                <button onClick={() => { setStep("form"); setErrors({}); }}
                  className="w-full text-center text-[12px] text-[#84888c] mt-4 cursor-pointer hover:text-[#070808]" style={ss}>
                  ← {t("login.forgot.back")}
                </button>
              </>
            )}

            {step === "reset-code" && (
              <>
                <div className="text-center mb-6">
                  <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-4">
                    <EmojiIcon emoji="📱" size={32} />
                  </div>
                  <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>
                    {t("login.reset.title")}
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    {t("login.reset.sent")} {forgotCountry.dial} {forgotPhone}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 mb-3">
                  {resetCode.map((digit, i) => (
                    <input key={i} id={`reset-otp-${i}`} value={digit}
                      onChange={e => {
                        const next = [...resetCode]; next[i] = e.target.value.slice(-1); setResetCode(next);
                        if (e.target.value && i < 5) document.getElementById(`reset-otp-${i + 1}`)?.focus();
                        if (next.every(d => d !== "") && next.join("").length === 6) setTimeout(() => { setStep("new-password"); setErrors({}); }, 300);
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`reset-otp-${i - 1}`)?.focus();
                      }}
                      maxLength={1}
                      className={`size-13 rounded-xl border-2 ${errors.resetCode ? "border-[#dc2626]/50" : "border-[#f0f1f3]"} bg-[#fafafa] text-center text-[22px] text-[#070808] outline-none focus:border-[#ff5222] focus:bg-white transition-all`}
                      style={{ fontWeight: 700, ...ss }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {errors.resetCode && <p className="text-[11px] text-[#dc2626] text-center mb-2" style={ss}><EmojiIcon emoji="⚠️" size={12} /> {errors.resetCode}</p>}
                <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 mb-5">
                  <button onClick={() => {
                    const demoCode = ["1", "2", "3", "4", "5", "6"];
                    setResetCode(demoCode); setErrors({});
                    setTimeout(() => { setStep("new-password"); setErrors({}); }, 500);
                  }}
                    className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="💡" size={12} /> Demo: Auto-fill reset code (123456)
                  </button>
                </div>
                <button onClick={() => { setStep("forgot"); setErrors({}); }}
                  className="w-full text-center text-[12px] text-[#84888c] mt-4 cursor-pointer hover:text-[#070808]" style={ss}>
                  ← Back
                </button>
              </>
            )}

            {step === "new-password" && (
              <>
                <div className="text-center mb-6">
                  <div className="size-16 rounded-2xl bg-[#e6fff3] flex items-center justify-center mx-auto mb-4">
                    <EmojiIcon emoji="🔐" size={32} />
                  </div>
                  <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>
                    {t("login.newPassword.title")}
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    Set a new password for your account.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>{t("login.newPassword.new")}</label>
                    <input type="password" value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setErrors({}); }}
                      placeholder="Minimum 6 characters"
                      className={`h-11 px-3.5 rounded-xl border ${errors.newPassword ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                      style={ss}
                    />
                    <FieldError field="newPassword" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>{t("login.newPassword.confirm")}</label>
                    <input type="password" value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setErrors({}); }}
                      placeholder="Repeat your password"
                      className={`h-11 px-3.5 rounded-xl border ${errors.confirmPassword ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                      style={ss}
                    />
                    <FieldError field="confirmPassword" />
                  </div>
                </div>
                <button onClick={() => {
                  const errs: Record<string, string> = {};
                  if (!newPassword || newPassword.length < 6) errs.newPassword = "Minimum 6 characters";
                  if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
                  else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
                  if (Object.keys(errs).length > 0) { setErrors(errs); triggerShake(); return; }
                  setStep("reset-done");
                }}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  {t("login.newPassword.submit")}
                </button>
              </>
            )}

            {step === "reset-done" && (
              <div className="flex flex-col items-center py-8">
                <div className="size-20 rounded-full bg-[#e6fff3] flex items-center justify-center mb-4" style={{ animation: "success-pop 0.5s ease-out" }}>
                  <svg className="size-10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "check-draw 0.6s ease-out 0.3s both" }} />
                  </svg>
                </div>
                <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>{t("login.resetDone.title")}</h2>
                <p className="text-[13px] text-[#84888c] mb-5" style={ss}>{t("login.resetDone.desc")}</p>
                <button onClick={() => { setStep("form"); setNewPassword(""); setConfirmPassword(""); setResetCode(["", "", "", "", "", ""]); setErrors({}); }}
                  className="h-11 px-6 rounded-xl text-white text-[13px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss }}>
                  Sign In Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}