import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../components/auth-context";
import { EmojiIcon } from "../components/two-tone-icons";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import imgFrame2087325367 from "figma:asset/aa22ee141c47adc40b93dee89db917612452e751.png";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const keyframes = `
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes success-pop { 0%{transform:scale(0)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
@keyframes check-draw { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
@keyframes fade-in { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
`;

const BG_IMG = "https://images.unsplash.com/photo-1581513118044-696c147c1a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGlsaXBwaW5lJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbiUyMHZpYnJhbnR8ZW58MXx8fHwxNzczNTg0MzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [step, setStep] = useState<"form" | "otp" | "success" | "forgot" | "reset-code" | "new-password" | "reset-done">("form");
  const [shakeError, setShakeError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);

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
    return <span className="text-[11px] text-[#dc2626] mt-0.5 flex items-center gap-1" style={{ fontWeight: 500, ...ss }}><EmojiIcon emoji="⚠️" size={12} /> {errors[field]}</span>;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = "Kailangan ng phone number";
    else if (phone.length < 10) errs.phone = "Dapat 10 digits (9XX XXX XXXX)";
    if (!password.trim()) errs.password = "Kailangan ng password";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length > 0) { triggerShake(); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setStep("otp");
  };

  const handleSocialLogin = (provider: string) => {
    const mockUser = {
      name: "Juan Cruz",
      handle: "@JuanBet123",
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
    };
    login(mockUser);
    setStep("success");
    setTimeout(() => navigate("/"), 1500);
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
    if (code.length < 6) { triggerShake(); setErrors({ otp: "Kailangan ng 6-digit code" }); return; }
    const mockUser = {
      name: "Juan Cruz",
      handle: "@JuanBet123",
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
    };
    login(mockUser);
    setStep("success");
    setTimeout(() => navigate("/"), 1500);
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
            <div className="w-[120px] h-[30px] bg-white" style={{ maskImage: `url('${imgFrame2087325367}')`, maskSize: "120px 30px", maskRepeat: "no-repeat", WebkitMaskImage: `url('${imgFrame2087325367}')`, WebkitMaskSize: "120px 30px", WebkitMaskRepeat: "no-repeat" }} />
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-white text-[28px] leading-[1.2]" style={{ fontWeight: 700, ...ss }}>
            Predict Everything.
          </h1>
          <p className="text-white/60 text-[14px] leading-[1.6] max-w-[360px]" style={ss}>
            Sumali sa pinakamalaking prediction market ng Pilipinas. Tumaya sa sports, showbiz, economy, at iba pa.
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
          <div className="flex items-center gap-2 mt-3">
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
              <div className="w-[120px] h-[30px] bg-[#ff5222]" style={{ maskImage: `url('${imgFrame2087325367}')`, maskSize: "120px 30px", maskRepeat: "no-repeat", WebkitMaskImage: `url('${imgFrame2087325367}')`, WebkitMaskSize: "120px 30px", WebkitMaskRepeat: "no-repeat" }} />
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
                    I-enter ang phone number at password mo para makapasok.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Phone Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 px-3 rounded-xl border border-[#f0f1f3] bg-[#f7f8f9] flex items-center gap-1.5 shrink-0">
                        <EmojiIcon emoji="🇵🇭" size={16} />
                        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>+63</span>
                      </div>
                      <input
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(prev => { const n = { ...prev }; delete n.phone; return n; }); }}
                        placeholder="9XX XXX XXXX"
                        className={`flex-1 h-11 px-3.5 rounded-xl border ${errors.phone ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                        style={ss}
                      />
                    </div>
                    <FieldError field="phone" />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                        placeholder="I-enter ang password"
                        className={`w-full h-11 px-3.5 pr-10 rounded-xl border ${errors.password ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                        style={ss}
                        onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b3b8] text-[14px] cursor-pointer hover:text-[#84888c]">
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <FieldError field="password" />
                    <button onClick={() => { setForgotPhone(phone); setStep("forgot"); setErrors({}); }} className="text-[12px] text-[#ff5222] self-end mt-0.5 cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>
                      Nakalimutan ang password?
                    </button>
                  </div>
                </div>

                {/* Demo quick-fill */}
                <div className="mt-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <EmojiIcon emoji="💡" size={14} />
                    <span className="text-[11px] text-[#1e40af]" style={{ fontWeight: 600, ...ss }}>Demo Mode — Quick Fill</span>
                  </div>
                  <button
                    onClick={() => { setPhone("9171234567"); setPassword("password123"); setErrors({}); }}
                    className="text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="⚡" size={12} /> I-click para auto-fill ang demo credentials
                  </button>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  Mag-login
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#f0f1f3]" />
                  <span className="text-[11px] text-[#b0b3b8]" style={ss}>o mag-login gamit ang</span>
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
                  Wala ka pang account?{" "}
                  <Link to="/signup" className="text-[#ff5222] hover:underline cursor-pointer" style={{ fontWeight: 600 }}>
                    Mag-signup
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
                    I-verify ang Number Mo
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    Nag-send kami ng 6-digit code sa +63{phone}
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
                    <EmojiIcon emoji="💡" size={12} /> Demo: I-click para auto-fill OTP (123456)
                  </button>
                </div>

                <button onClick={() => verifyOtp()}
                  className="w-full h-12 rounded-xl text-white text-[14px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  I-verify
                </button>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="text-[12px] text-[#84888c]" style={ss}>Hindi natanggap?</span>
                  <button className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss }}>I-resend Code</button>
                </div>
                <button onClick={() => { setStep("form"); setErrors({}); }}
                  className="w-full text-center text-[12px] text-[#84888c] mt-4 cursor-pointer hover:text-[#070808]" style={ss}>
                  ← Bumalik
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
                <p className="text-[13px] text-[#84888c] mb-3" style={ss}>Na-login ka na successfully.</p>
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
                    I-reset ang Password
                  </h2>
                  <p className="text-[13px] text-[#84888c] text-center" style={ss}>
                    I-enter ang phone number mo para ma-receive ang reset code.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Phone Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 px-3 rounded-xl border border-[#f0f1f3] bg-[#f7f8f9] flex items-center gap-1.5 shrink-0">
                        <EmojiIcon emoji="🇵🇭" size={16} />
                        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>+63</span>
                      </div>
                      <input value={forgotPhone}
                        onChange={e => { setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors({}); }}
                        placeholder="9XX XXX XXXX"
                        className={`flex-1 h-11 px-3.5 rounded-xl border ${errors.forgotPhone ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                        style={ss}
                      />
                    </div>
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
                  if (!forgotPhone.trim() || forgotPhone.length < 10) {
                    setErrors({ forgotPhone: "Kailangan ng valid phone number" }); triggerShake(); return;
                  }
                  setStep("reset-code"); setErrors({});
                }}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  I-send ang Reset Code
                </button>
                <button onClick={() => { setStep("form"); setErrors({}); }}
                  className="w-full text-center text-[12px] text-[#84888c] mt-4 cursor-pointer hover:text-[#070808]" style={ss}>
                  ← Bumalik sa Login
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
                    I-enter ang Reset Code
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    Nag-send kami ng 6-digit code sa +63{forgotPhone}
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
                  ← Bumalik
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
                    Bagong Password
                  </h2>
                  <p className="text-[13px] text-[#84888c]" style={ss}>
                    I-set ang bagong password para sa account mo.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Bagong Password</label>
                    <input type="password" value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setErrors({}); }}
                      placeholder="Minimum 6 characters"
                      className={`h-11 px-3.5 rounded-xl border ${errors.newPassword ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                      style={ss}
                    />
                    <FieldError field="newPassword" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>I-confirm ang Password</label>
                    <input type="password" value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setErrors({}); }}
                      placeholder="Ulitin ang password"
                      className={`h-11 px-3.5 rounded-xl border ${errors.confirmPassword ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                      style={ss}
                    />
                    <FieldError field="confirmPassword" />
                  </div>
                </div>
                <button onClick={() => {
                  const errs: Record<string, string> = {};
                  if (!newPassword || newPassword.length < 6) errs.newPassword = "Minimum 6 characters";
                  if (newPassword !== confirmPassword) errs.confirmPassword = "Hindi magkatugma ang passwords";
                  if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }
                  setStep("reset-done");
                }}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  I-save ang Bagong Password
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
                <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>Na-reset na!</h2>
                <p className="text-[13px] text-[#84888c] mb-4" style={ss}>Ang password mo ay na-update na successfully.</p>
                <button onClick={() => { setStep("form"); setErrors({}); setPassword(""); setNewPassword(""); setConfirmPassword(""); setResetCode(["", "", "", "", "", ""]); }}
                  className="h-10 px-6 rounded-xl text-[13px] bg-[#ff5222] text-white cursor-pointer hover:brightness-110 transition-all"
                  style={{ fontWeight: 600, ...ss }}>
                  Bumalik sa Login
                </button>
              </div>
            )}
          </div>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-[12px] text-[#b0b3b8] hover:text-[#070808] transition-colors" style={ss}>
              ← Bumalik sa Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}