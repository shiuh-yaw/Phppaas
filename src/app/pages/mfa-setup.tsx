/**
 * Mandatory MFA Setup Page
 * Shown after signup (new users) or login (users who haven't configured MFA).
 * Users must set up at least one MFA method (Authenticator App or Email OTP)
 * before they can access the platform. Phone OTP is already their primary login.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/auth-context";
import { EmojiIcon } from "../components/two-tone-icons";
import { MfaManagerPanel } from "../components/mfa-manager";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const keyframes = `
@keyframes fade-in { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(255,82,34,0.2)} 50%{box-shadow:0 0 20px 4px rgba(255,82,34,0.15)} }
`;

const BG_IMG = "https://images.unsplash.com/photo-1581513118044-696c147c1a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGlsaXBwaW5lJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbiUyMHZpYnJhbnR8ZW58MXx8fHwxNzczNTg0MzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export default function MfaSetupPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setMfaConfigured, logout } = useAuth();
  const [mfaCompleted, setMfaCompleted] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const isNewUser = !user?.mfaConfigured && user?.mfaConfigured === false;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true });
  }, [isLoggedIn, navigate]);

  // If MFA is already configured, redirect to home
  useEffect(() => {
    if (user?.mfaConfigured) navigate("/", { replace: true });
  }, [user?.mfaConfigured, navigate]);

  const handleMfaComplete = () => {
    setMfaCompleted(true);
    setMfaConfigured();
    setTimeout(() => navigate("/"), 2000);
  };

  if (!isLoggedIn || !user) return null;

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
            Secure Your Account
          </h1>
          <p className="text-white/60 text-[14px] leading-[1.6] max-w-[360px]" style={ss}>
            Multi-Factor Authentication (MFA) adds an extra layer of security to protect your funds and personal data.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {[
              { emoji: "🛡️", text: "Protect against unauthorized access" },
              { emoji: "💰", text: "Secure your wallet & transactions" },
              { emoji: "🔐", text: "Industry-standard TOTP protection" },
              { emoji: "📱", text: "Quick verification every login" },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <EmojiIcon emoji={b.emoji} size={16} />
                </div>
                <span className="text-[12px] text-white/60" style={{ fontWeight: 500, ...ss }}>{b.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <EmojiIcon emoji="⚖️" size={14} />
              <span className="text-[11px] text-white/80" style={{ fontWeight: 600, ...ss }}>PAGCOR Compliance</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed" style={ss}>
              MFA is required by PAGCOR regulatory guidelines for all licensed prediction market platforms operating in the Philippines.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — MFA setup */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[480px]" style={{ animation: "fade-in 0.4s ease-out" }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <button onClick={() => navigate("/")} className="cursor-pointer">
              <div className="text-[#ff5222] leading-none" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>PrediEx</div>
            </button>
          </div>

          {!mfaCompleted && !showPanel && (
            <div style={{ animation: "fade-in 0.4s ease-out" }}>
              {/* Mandatory notice */}
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-[#fee2e2] flex items-center justify-center shrink-0 mt-0.5">
                    <EmojiIcon emoji="🚨" size={20} />
                  </div>
                  <div>
                    <h3 className="text-[13px] text-[#dc2626] mb-1" style={{ fontWeight: 700, ...ss }}>Required Security Step</h3>
                    <p className="text-[11px] text-[#b91c1c] leading-relaxed" style={ss}>
                      MFA is mandatory for all PredictEx accounts. You must configure at least one additional verification method (Authenticator App or Email) before accessing the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* What you'll set up */}
              <div className="bg-[#f7f8f9] border border-[#f0f1f3] rounded-2xl p-4 mb-5">
                <h3 className="text-[13px] text-[#070808] mb-3" style={{ fontWeight: 600, ...ss }}>Choose a verification method:</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#f0f1f3]">
                    <div className="size-10 rounded-xl bg-[#fff4ed] flex items-center justify-center shrink-0">
                      <EmojiIcon emoji="📱" size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>Phone OTP (SMS)</span>
                      <span className="text-[10px] text-[#a0a3a7]" style={ss}>Already active — this is your primary login</span>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full bg-[#e6fff3] text-[#00bf85]" style={{ fontWeight: 700, ...ss }}>ACTIVE</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-[#6366f1]/20" style={{ animation: "pulse-glow 3s ease-in-out infinite" }}>
                    <div className="size-10 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
                      <EmojiIcon emoji="🔐" size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>Authenticator App</span>
                      <span className="text-[10px] text-[#6366f1]" style={{ fontWeight: 500, ...ss }}>Recommended — Most secure option</span>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full bg-[#fffbeb] text-[#d97706]" style={{ fontWeight: 700, ...ss }}>SET UP</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#f0f1f3]">
                    <div className="size-10 rounded-xl bg-[#e6fff3] flex items-center justify-center shrink-0">
                      <EmojiIcon emoji="📧" size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>Email Verification</span>
                      <span className="text-[10px] text-[#a0a3a7]" style={ss}>Alternative verification via email</span>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full bg-[#fffbeb] text-[#d97706]" style={{ fontWeight: 700, ...ss }}>SET UP</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowPanel(true)}
                className="w-full h-12 rounded-xl text-white text-[14px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                Configure MFA Now
              </button>

              {/* Logout option */}
              <div className="mt-5 text-center">
                <button
                  onClick={logout}
                  className="text-[12px] text-[#b0b3b8] cursor-pointer hover:text-[#84888c] transition-colors"
                  style={ss}
                >
                  Sign out instead
                </button>
              </div>
            </div>
          )}

          {!mfaCompleted && showPanel && (
            <div style={{ animation: "fade-in 0.4s ease-out" }}>
              <div className="mb-5">
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-[12px] text-[#84888c] cursor-pointer hover:text-[#070808] flex items-center gap-1 mb-4"
                  style={ss}
                >
                  ← Back
                </button>
                <h2 className="text-[20px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>
                  Configure Your MFA Methods
                </h2>
                <p className="text-[13px] text-[#84888c]" style={ss}>
                  Enable at least one additional method (Authenticator or Email), then click "Complete Setup" below.
                </p>
              </div>

              <MfaManagerPanel userEmail="juan@gmail.com" phoneAuthPrimary={true} />

              <button
                onClick={handleMfaComplete}
                className="w-full h-12 rounded-xl text-white text-[14px] mt-5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", boxShadow: "0 4px 15px rgba(255,82,34,0.3)", ...ss }}>
                Complete MFA Setup & Continue
              </button>
            </div>
          )}

          {mfaCompleted && (
            <div className="flex flex-col items-center py-8" style={{ animation: "fade-in 0.4s ease-out" }}>
              <div className="size-20 rounded-full bg-[#e6fff3] flex items-center justify-center mb-4">
                <svg className="size-10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss }}>Account Secured!</h2>
              <p className="text-[13px] text-[#84888c] mb-3" style={ss}>MFA has been configured. Redirecting to platform...</p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#00bf85] bg-[#e6fff3] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>
                  <span className="flex items-center gap-1"><EmojiIcon emoji="🛡️" size={12} /> MFA Active</span>
                </span>
                <span className="text-[12px] text-[#6366f1] bg-[#eef2ff] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>
                  <span className="flex items-center gap-1"><EmojiIcon emoji="🔐" size={12} /> Protected</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
