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

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoggedIn } = useAuth();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [shakeError, setShakeError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (!name.trim()) errs.name = "Kailangan ng pangalan";
    if (!phone.trim()) errs.phone = "Kailangan ng phone number";
    else if (phone.length < 10) errs.phone = "Dapat 10 digits (9XX XXX XXXX)";
    if (!password.trim()) errs.password = "Kailangan ng password";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    if (!agreeTerms) errs.terms = "Kailangan pumayag sa Terms";
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
      name: name.trim() || `${provider} User`,
      handle: `@${(name.trim() || provider).replace(/\s+/g, "").toLowerCase()}`,
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
    };
    signup(mockUser);
    setStep("success");
    setTimeout(() => navigate("/"), 1500);
  };

  const handleOtp = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`signup-otp-${idx + 1}`)?.focus();
    const full = next.join("");
    if (full.length === 6 && next.every(d => d !== "")) setTimeout(() => verifyOtp(next), 300);
  };

  const verifyOtp = (digits?: string[]) => {
    const code = (digits || otp).join("");
    if (code.length < 6) { triggerShake(); setErrors({ otp: "Kailangan ng 6-digit code" }); return; }
    const mockUser = {
      name,
      handle: `@${name.replace(/\s+/g, "").toLowerCase()}`,
      avatar: "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
      balance: 5000,
      portfolio: 1234.56,
    };
    signup(mockUser);
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
            Sumali Na!
          </h1>
          <p className="text-white/60 text-[14px] leading-[1.6] max-w-[360px]" style={ss}>
            Libre ang sign-up. Makakuha ng ₱300 welcome bonus at simulan ang prediction market journey mo.
          </p>

          {/* Benefits */}
          <div className="flex flex-col gap-3 mt-2">
            {[
              { emoji: "🎁", text: "₱300 Welcome Bonus" },
              { emoji: "🏆", text: "Leaderboard at Rewards" },
              { emoji: "📊", text: "Real-time Market Predictions" },
              { emoji: "🔒", text: "Secure at PAGCOR Licensed" },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <EmojiIcon emoji={b.emoji} size={16} />
                </div>
                <span className="text-[12px] text-white/60" style={{ fontWeight: 500, ...ss }}>{b.text}</span>
              </div>
            ))}
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
                    Gumawa ng Account
                  </h2>
                  <p className="text-[13px] text-[#84888c] leading-[1.5]" style={ss}>
                    Sumali na sa Lucky Taya! Libre ang sign up.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Pangalan</label>
                    <input value={name}
                      onChange={e => { setName(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }}
                      placeholder="Juan Dela Cruz"
                      className={`h-11 px-3.5 rounded-xl border ${errors.name ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
                      style={ss}
                    />
                    <FieldError field="name" />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#555]" style={{ fontWeight: 500, ...ss }}>Phone Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 px-3 rounded-xl border border-[#f0f1f3] bg-[#f7f8f9] flex items-center gap-1.5 shrink-0">
                        <EmojiIcon emoji="🇵🇭" size={16} />
                        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>+63</span>
                      </div>
                      <input value={phone}
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
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                        placeholder="Minimum 6 characters"
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
                  </div>

                  {/* Terms */}
                  <label className={`flex items-start gap-2.5 cursor-pointer ${errors.terms ? "animate-pulse" : ""}`}>
                    <input type="checkbox" checked={agreeTerms}
                      onChange={e => { setAgreeTerms(e.target.checked); setErrors(prev => { const n = { ...prev }; delete n.terms; return n; }); }}
                      className="mt-0.5 accent-[#ff5222]"
                    />
                    <span className={`text-[12px] leading-[1.6] ${errors.terms ? "text-[#dc2626]" : "text-[#84888c]"}`} style={ss}>
                      Sumasang-ayon ako sa <span className="text-[#ff5222] cursor-pointer hover:underline">Terms of Service</span> at <span className="text-[#ff5222] cursor-pointer hover:underline">Privacy Policy</span>. PAGCOR Licensed.
                    </span>
                  </label>
                </div>

                {/* Demo quick-fill */}
                <div className="mt-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <EmojiIcon emoji="💡" size={14} />
                    <span className="text-[11px] text-[#1e40af]" style={{ fontWeight: 600, ...ss }}>Demo Mode — Quick Fill</span>
                  </div>
                  <button onClick={() => { setName("Juan Dela Cruz"); setPhone("9171234567"); setPassword("password123"); setAgreeTerms(true); setErrors({}); }}
                    className="text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center gap-1"
                    style={{ fontWeight: 500, ...ss }}>
                    <EmojiIcon emoji="⚡" size={12} /> I-click para auto-fill ang demo credentials
                  </button>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit}
                  className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                  Gumawa ng Account
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#f0f1f3]" />
                  <span className="text-[11px] text-[#b0b3b8]" style={ss}>o mag-signup gamit ang</span>
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

                {/* Switch to login */}
                <p className="text-center text-[13px] text-[#84888c] mt-6" style={ss}>
                  May account ka na?{" "}
                  <Link to="/login" className="text-[#ff5222] hover:underline cursor-pointer" style={{ fontWeight: 600 }}>
                    Mag-login
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
                    <input key={i} id={`signup-otp-${i}`} value={digit}
                      onChange={e => handleOtp(e.target.value, i)}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`signup-otp-${i - 1}`)?.focus();
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
                <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>Maligayang pagdating!</h2>
                <p className="text-[13px] text-[#84888c] mb-3" style={ss}>Naka-register ka na sa Lucky Taya!</p>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#00bf85] bg-[#e6fff3] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>✓ Verified</span>
                  <span className="text-[12px] text-[#ff5222] bg-[#fff4ed] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>
                    <span className="inline-flex items-center gap-1">₱5,000 Balance! <EmojiIcon emoji="🎁" size={12} /></span>
                  </span>
                </div>
                <p className="text-[11px] text-[#84888c] mt-4" style={ss}>Redirecting...</p>
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
