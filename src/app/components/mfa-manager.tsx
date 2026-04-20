/**
 * MFA Manager — Multi-Factor Authentication settings & setup flows
 * ================================================================
 * Supports 3 methods: Phone OTP, Authenticator App (TOTP), Email OTP
 * Used in Profile > Security tab for managing MFA methods
 * Also exports MfaVerifyGate for login-time MFA challenge
 */
import { useState, useEffect, useRef } from "react";
import { EmojiIcon } from "./two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
export type MfaMethod = "phone" | "authenticator" | "email";

export interface MfaMethodStatus {
  phone: { enabled: boolean; value: string; verified: boolean };
  authenticator: { enabled: boolean; verified: boolean };
  email: { enabled: boolean; value: string; verified: boolean };
}

const DEFAULT_MFA: MfaMethodStatus = {
  phone: { enabled: true, value: "+63 917 •••• 1234", verified: true },
  authenticator: { enabled: false, verified: false },
  email: { enabled: false, value: "juan••••@gmail.com", verified: false },
};

/* ==================== MOCK TOTP SECRET ==================== */
const MOCK_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
const MOCK_TOTP_ISSUER = "PredictEx";
const MOCK_TOTP_ACCOUNT = "juan@gmail.com";

/* ==================== ANIMATIONS ==================== */
const mfaKeyframes = `
@keyframes mfa-fade-in { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes mfa-scale-in { 0%{opacity:0;transform:scale(0.95)} 100%{opacity:1;transform:scale(1)} }
@keyframes mfa-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes mfa-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes mfa-success { 0%{transform:scale(0)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes mfa-check-draw { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
@keyframes mfa-countdown { 0%{width:100%} 100%{width:0%} }
`;

/* ==================== QR CODE SVG (mock) ==================== */
function MockQRCode({ size = 160 }: { size?: number }) {
  // Generate a deterministic-looking QR code pattern
  const grid = 21;
  const cellSize = size / grid;
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,1,0,0,1,0,1,1,0,1,1,0,1,0,1],
    [0,1,0,1,1,0,0,1,1,0,0,1,0,1,1,0,1,1,0,1,0],
    [1,1,0,0,1,0,1,0,1,1,1,0,1,0,0,1,0,0,1,1,0],
    [0,1,1,0,0,1,0,0,0,1,0,1,1,0,1,0,1,0,1,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,0,0,1,1,0,0,1,0,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,1,0,1,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,0,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,0,1,0,0,1,1,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1,0,1,1,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,0,1,1,0,1,0,0,1,1],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${y}-${x}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="#070808" />
          ) : null
        )
      )}
    </svg>
  );
}

/* ==================== OTP INPUT ==================== */
function OtpInput({ length = 6, value, onChange, error, autoFocus }: {
  length?: number;
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (val: string, idx: number) => {
    const next = [...value];
    next[idx] = val.slice(-1);
    onChange(next);
    if (val && idx < length - 1) refs.current[idx + 1]?.focus();
  };
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            value={value[i] || ""}
            onChange={e => handleChange(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            maxLength={1}
            autoFocus={autoFocus && i === 0}
            className={`size-12 rounded-xl border-2 ${error ? "border-[#dc2626]/50" : "border-[#f0f1f3]"} bg-[#fafafa] text-center text-[20px] text-[#070808] outline-none focus:border-[#ff5222] focus:bg-white transition-all`}
            style={{ fontWeight: 700, ...ss }}
            inputMode="numeric"
          />
        ))}
      </div>
      {error && (
        <span className="text-[11px] text-[#dc2626] flex items-center gap-1" style={{ fontWeight: 500, ...ss }}>
          <EmojiIcon emoji="⚠️" size={12} /> {error}
        </span>
      )}
    </div>
  );
}

/* ==================== MODAL OVERLAY ==================== */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ animation: "mfa-scale-in 0.25s ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ==================== COUNTDOWN TIMER ==================== */
function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[12px] text-[#84888c]" style={{ ...ss, ...pp }}>
        Code expires in <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>{mins}:{secs.toString().padStart(2, "0")}</span>
      </span>
      <div className="w-full h-1 rounded-full bg-[#f0f1f3] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#ff5222]"
          style={{ width: `${(remaining / seconds) * 100}%`, transition: "width 1s linear" }}
        />
      </div>
    </div>
  );
}

/* ==================== PHONE OTP SETUP MODAL ==================== */
function PhoneSetupModal({ onClose, onComplete, currentPhone }: {
  onClose: () => void;
  onComplete: () => void;
  currentPhone: string;
}) {
  const [step, setStep] = useState<"confirm" | "verify" | "done">("confirm");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [expired, setExpired] = useState(false);

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit code"); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setStep("done");
    setTimeout(onComplete, 1500);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6" style={{ animation: shake ? "mfa-shake 0.4s ease-in-out" : "none" }}>
        {step === "confirm" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center">
              <EmojiIcon emoji="📱" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Enable Phone OTP</h3>
            <p className="text-[13px] text-[#84888c] text-center leading-relaxed" style={{ ...ss, ...pp }}>
              We'll send a verification code to your registered phone number to confirm this security method.
            </p>
            <div className="w-full bg-[#f7f8f9] border border-[#f0f1f3] rounded-xl p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white border border-[#f0f1f3] flex items-center justify-center">
                <EmojiIcon emoji="📞" size={20} />
              </div>
              <div>
                <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 600, ...ss, ...pp }}>{currentPhone}</span>
                <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>Registered phone number</span>
              </div>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Cancel</button>
              <button onClick={() => setStep("verify")} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Send Code</button>
            </div>
          </div>
        )}
        {step === "verify" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center">
              <EmojiIcon emoji="🔢" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Enter Verification Code</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>
              6-digit code sent to {currentPhone}
            </p>
            <OtpInput value={otp} onChange={setOtp} error={error} autoFocus />
            {!expired && <CountdownTimer seconds={120} onExpire={() => setExpired(true)} />}
            {expired && (
              <button onClick={() => { setExpired(false); setOtp(["", "", "", "", "", ""]); setError(""); }} className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss, ...pp }}>
                Resend Code
              </button>
            )}
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 w-full">
              <button onClick={() => { setOtp(["1", "2", "3", "4", "5", "6"]); setError(""); setTimeout(() => { setStep("done"); setTimeout(onComplete, 1500); }, 400); }}
                className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                style={{ fontWeight: 500, ...ss, ...pp }}>
                <EmojiIcon emoji="💡" size={12} /> Demo: Auto-verify (123456)
              </button>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Cancel</button>
              <button onClick={handleVerify} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Verify</button>
            </div>
          </div>
        )}
        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-full bg-[#e6fff3] flex items-center justify-center" style={{ animation: "mfa-success 0.5s ease-out" }}>
              <svg className="size-8" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "mfa-check-draw 0.6s ease-out 0.3s both" }} />
              </svg>
            </div>
            <h3 className="text-[18px] text-[#070808]" style={{ fontWeight: 700, ...ss, ...pp }}>Phone OTP Enabled!</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>You'll receive SMS codes when logging in.</p>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/* ==================== AUTHENTICATOR SETUP MODAL ==================== */
function AuthenticatorSetupModal({ onClose, onComplete }: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"intro" | "scan" | "verify" | "backup" | "done">("intro");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const backupCodes = ["A3X7-K9M2", "B5Y1-N4P8", "C8Z6-Q2R3", "D1W4-S7T9", "E6V5-U8F0", "G2H3-J6L1"];

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit code from your authenticator app"); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setStep("backup");
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6" style={{ animation: shake ? "mfa-shake 0.4s ease-in-out" : "none" }}>
        {step === "intro" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#f0f5ff] flex items-center justify-center">
              <EmojiIcon emoji="🔐" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Set Up Authenticator App</h3>
            <p className="text-[13px] text-[#84888c] text-center leading-relaxed" style={{ ...ss, ...pp }}>
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to generate time-based verification codes.
            </p>
            <div className="w-full flex flex-col gap-2">
              {[
                { emoji: "1️⃣", text: "Download an authenticator app" },
                { emoji: "2️⃣", text: "Scan the QR code we provide" },
                { emoji: "3️⃣", text: "Enter the generated code to verify" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#f7f8f9] rounded-xl">
                  <EmojiIcon emoji={s.emoji} size={18} />
                  <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss, ...pp }}>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Cancel</button>
              <button onClick={() => setStep("scan")} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Continue</button>
            </div>
          </div>
        )}

        {step === "scan" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Scan QR Code</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>
              Open your authenticator app and scan this QR code
            </p>
            <div className="p-4 bg-white border-2 border-[#f0f1f3] rounded-2xl">
              <MockQRCode size={180} />
            </div>
            <div className="w-full">
              <span className="text-[10px] text-[#a0a3a7] block mb-1.5 text-center" style={{ ...ss, ...pp }}>
                Can't scan? Enter this key manually:
              </span>
              <div className="flex items-center gap-2 bg-[#f7f8f9] border border-[#f0f1f3] rounded-xl px-4 py-3">
                <code className="flex-1 text-[13px] text-[#070808] text-center tracking-widest" style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  {MOCK_TOTP_SECRET}
                </code>
                <button
                  onClick={() => { setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                  style={{ background: copiedSecret ? "#e6fff3" : "#fff4ed", color: copiedSecret ? "#00bf85" : "#ff5222", fontWeight: 600, ...ss }}
                >
                  {copiedSecret ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="mt-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-3 py-2">
                <span className="text-[10px] text-[#92400e] flex items-center gap-1" style={{ ...ss, ...pp }}>
                  <EmojiIcon emoji="⚠️" size={11} /> Save this key somewhere safe. You'll need it if you lose your device.
                </span>
              </div>
            </div>
            <div className="flex gap-3 w-full mt-1">
              <button onClick={() => setStep("intro")} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Back</button>
              <button onClick={() => setStep("verify")} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Next</button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#f0f5ff] flex items-center justify-center">
              <EmojiIcon emoji="🔢" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Verify Authenticator</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>
              Enter the 6-digit code from your authenticator app
            </p>
            <OtpInput value={otp} onChange={setOtp} error={error} autoFocus />
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 w-full">
              <button onClick={() => { setOtp(["7", "2", "9", "4", "1", "6"]); setError(""); setTimeout(() => setStep("backup"), 400); }}
                className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                style={{ fontWeight: 500, ...ss, ...pp }}>
                <EmojiIcon emoji="💡" size={12} /> Demo: Auto-verify (729416)
              </button>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStep("scan")} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Back</button>
              <button onClick={handleVerify} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Verify</button>
            </div>
          </div>
        )}

        {step === "backup" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#fffbeb] flex items-center justify-center">
              <EmojiIcon emoji="🔑" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Save Backup Codes</h3>
            <p className="text-[13px] text-[#84888c] text-center leading-relaxed" style={{ ...ss, ...pp }}>
              Save these backup codes in a safe place. Each code can only be used once if you lose access to your authenticator.
            </p>
            <div className="w-full bg-[#f7f8f9] border border-[#f0f1f3] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-[#f0f1f3] rounded-lg px-3 py-2">
                    <span className="text-[10px] text-[#a0a3a7] w-4" style={{ fontWeight: 600 }}>{i + 1}.</span>
                    <code className="text-[12px] text-[#070808] tracking-wider" style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{code}</code>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setCopiedBackup(true); setTimeout(() => setCopiedBackup(false), 2000); }}
                className="w-full mt-3 h-9 rounded-lg text-[12px] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                style={{ background: copiedBackup ? "#e6fff3" : "#fff4ed", color: copiedBackup ? "#00bf85" : "#ff5222", fontWeight: 600, ...ss, ...pp }}
              >
                {copiedBackup ? (<><EmojiIcon emoji="✅" size={13} /> Copied to Clipboard</>) : (<><EmojiIcon emoji="📋" size={13} /> Copy All Codes</>)}
              </button>
            </div>
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2.5 w-full">
              <span className="text-[10px] text-[#dc2626] flex items-start gap-1.5" style={{ fontWeight: 500, ...ss, ...pp }}>
                <EmojiIcon emoji="🚨" size={12} />
                <span>These codes won't be shown again. If you lose both your authenticator device and these codes, you may lose access to your account.</span>
              </span>
            </div>
            <button onClick={() => { setStep("done"); setTimeout(onComplete, 1500); }} className="w-full h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>
              I've Saved My Codes
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-full bg-[#e6fff3] flex items-center justify-center" style={{ animation: "mfa-success 0.5s ease-out" }}>
              <svg className="size-8" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "mfa-check-draw 0.6s ease-out 0.3s both" }} />
              </svg>
            </div>
            <h3 className="text-[18px] text-[#070808]" style={{ fontWeight: 700, ...ss, ...pp }}>Authenticator Enabled!</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>Your account is now protected with TOTP codes.</p>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/* ==================== EMAIL SETUP MODAL ==================== */
function EmailSetupModal({ onClose, onComplete, currentEmail }: {
  onClose: () => void;
  onComplete: () => void;
  currentEmail: string;
}) {
  const [step, setStep] = useState<"confirm" | "verify" | "done">("confirm");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [expired, setExpired] = useState(false);

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit code"); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setStep("done");
    setTimeout(onComplete, 1500);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6" style={{ animation: shake ? "mfa-shake 0.4s ease-in-out" : "none" }}>
        {step === "confirm" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#f0fdf4] flex items-center justify-center">
              <EmojiIcon emoji="📧" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Enable Email Verification</h3>
            <p className="text-[13px] text-[#84888c] text-center leading-relaxed" style={{ ...ss, ...pp }}>
              We'll send a verification code to your email address each time you log in.
            </p>
            <div className="w-full bg-[#f7f8f9] border border-[#f0f1f3] rounded-xl p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white border border-[#f0f1f3] flex items-center justify-center">
                <EmojiIcon emoji="✉️" size={20} />
              </div>
              <div>
                <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 600, ...ss, ...pp }}>{currentEmail}</span>
                <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>Registered email address</span>
              </div>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Cancel</button>
              <button onClick={() => setStep("verify")} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Send Code</button>
            </div>
          </div>
        )}
        {step === "verify" && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-2xl bg-[#f0fdf4] flex items-center justify-center">
              <EmojiIcon emoji="🔢" size={32} />
            </div>
            <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Enter Email Code</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>
              6-digit code sent to {currentEmail}
            </p>
            <OtpInput value={otp} onChange={setOtp} error={error} autoFocus />
            {!expired && <CountdownTimer seconds={300} onExpire={() => setExpired(true)} />}
            {expired && (
              <button onClick={() => { setExpired(false); setOtp(["", "", "", "", "", ""]); setError(""); }} className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss, ...pp }}>
                Resend Code
              </button>
            )}
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 w-full">
              <button onClick={() => { setOtp(["8", "5", "2", "7", "3", "1"]); setError(""); setTimeout(() => { setStep("done"); setTimeout(onComplete, 1500); }, 400); }}
                className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
                style={{ fontWeight: 500, ...ss, ...pp }}>
                <EmojiIcon emoji="💡" size={12} /> Demo: Auto-verify (852731)
              </button>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Cancel</button>
              <button onClick={handleVerify} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "linear-gradient(135deg, #ff5222 0%, #ff7a4f 100%)", ...ss, ...pp }}>Verify</button>
            </div>
          </div>
        )}
        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
            <div className="size-16 rounded-full bg-[#e6fff3] flex items-center justify-center" style={{ animation: "mfa-success 0.5s ease-out" }}>
              <svg className="size-8" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "mfa-check-draw 0.6s ease-out 0.3s both" }} />
              </svg>
            </div>
            <h3 className="text-[18px] text-[#070808]" style={{ fontWeight: 700, ...ss, ...pp }}>Email MFA Enabled!</h3>
            <p className="text-[13px] text-[#84888c] text-center" style={{ ...ss, ...pp }}>You'll receive email codes when logging in.</p>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/* ==================== DISABLE CONFIRM MODAL ==================== */
function DisableConfirmModal({ method, onClose, onConfirm }: {
  method: MfaMethod;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const labels: Record<MfaMethod, string> = { phone: "Phone OTP", authenticator: "Authenticator App", email: "Email Verification" };
  const emojis: Record<MfaMethod, string> = { phone: "📱", authenticator: "🔐", email: "📧" };
  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 flex flex-col items-center gap-4" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
        <div className="size-16 rounded-2xl bg-[#fef2f2] flex items-center justify-center">
          <EmojiIcon emoji="⚠️" size={32} />
        </div>
        <h3 className="text-[18px] text-[#070808] text-center" style={{ fontWeight: 700, ...ss, ...pp }}>Disable {labels[method]}?</h3>
        <p className="text-[13px] text-[#84888c] text-center leading-relaxed" style={{ ...ss, ...pp }}>
          Removing this authentication method will make your account less secure. Are you sure you want to continue?
        </p>
        <div className="w-full bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 flex items-start gap-2.5">
          <EmojiIcon emoji="🚨" size={14} />
          <span className="text-[11px] text-[#dc2626]" style={{ fontWeight: 500, ...ss, ...pp }}>
            We recommend having at least 2 MFA methods enabled for maximum security.
          </span>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[#f0f1f3] text-[13px] text-[#84888c] cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ fontWeight: 500, ...ss, ...pp }}>Keep Enabled</button>
          <button onClick={onConfirm} className="flex-1 h-11 rounded-xl text-white text-[13px] cursor-pointer hover:brightness-110 transition-all" style={{ fontWeight: 600, background: "#dc2626", ...ss, ...pp }}>Disable</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ==================== MFA MANAGER PANEL (for Profile) ==================== */
export function MfaManagerPanel({ userEmail, phoneAuthPrimary = false }: { userEmail?: string; phoneAuthPrimary?: boolean }) {
  const [mfa, setMfa] = useState<MfaMethodStatus>(DEFAULT_MFA);
  const [setupModal, setSetupModal] = useState<MfaMethod | null>(null);
  const [disableModal, setDisableModal] = useState<MfaMethod | null>(null);

  const enabledCount = [mfa.phone.enabled, mfa.authenticator.enabled, ...(userEmail ? [mfa.email.enabled] : [])].filter(Boolean).length;

  const methods: { key: MfaMethod; label: string; description: string; emoji: string; color: string; bgColor: string }[] = [
    { key: "phone", label: "Phone OTP (SMS)", description: "Receive a 6-digit code via SMS to your registered phone number", emoji: "📱", color: "#ff5222", bgColor: "#fff4ed" },
    { key: "authenticator", label: "Authenticator App", description: "Use Google Authenticator, Authy, or similar apps for TOTP codes", emoji: "🔐", color: "#6366f1", bgColor: "#eef2ff" },
    ...(userEmail ? [{ key: "email" as MfaMethod, label: "Email Verification", description: "Receive a 6-digit code via email to your registered address", emoji: "📧", color: "#00bf85", bgColor: "#e6fff3" }] : []),
  ];

  const handleToggle = (method: MfaMethod) => {
    if (method === "phone" && phoneAuthPrimary) return;
    const isEnabled = method === "phone" ? mfa.phone.enabled : method === "authenticator" ? mfa.authenticator.enabled : mfa.email.enabled;
    if (isEnabled) {
      setDisableModal(method);
    } else {
      setSetupModal(method);
    }
  };

  const handleSetupComplete = (method: MfaMethod) => {
    setMfa(prev => ({
      ...prev,
      [method]: { ...prev[method], enabled: true, verified: true },
    }));
    setSetupModal(null);
  };

  const handleDisable = (method: MfaMethod) => {
    setMfa(prev => ({
      ...prev,
      [method]: { ...prev[method], enabled: false, verified: false },
    }));
    setDisableModal(null);
  };

  return (
    <>
      <style>{mfaKeyframes}</style>
      <div className="flex flex-col gap-5">
        {/* MFA Overview Card */}
        <div className="bg-white border border-[#f0f1f3] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f5f6f7]">
            <div className="flex items-center gap-2">
              <EmojiIcon emoji="🛡️" size={18} />
              <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>Multi-Factor Authentication</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`size-2 rounded-full ${enabledCount >= 2 ? "bg-[#00bf85]" : enabledCount === 1 ? "bg-[#f59e0b]" : "bg-[#dc2626]"}`} />
              <span className={`text-[11px] ${enabledCount >= 2 ? "text-[#00bf85]" : enabledCount === 1 ? "text-[#f59e0b]" : "text-[#dc2626]"}`} style={{ fontWeight: 600, ...ss, ...pp }}>
                {enabledCount >= 2 ? "Strong" : enabledCount === 1 ? "Moderate" : "Weak"}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            {/* Security Strength Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#84888c]" style={{ ...ss, ...pp }}>Security Level</span>
                <span className="text-[11px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{enabledCount}/{methods.length} methods active</span>
              </div>
              <div className="flex gap-1.5">
                {methods.map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full transition-all" style={{
                    background: i < enabledCount
                      ? (enabledCount >= 2 ? "#00bf85" : "#f59e0b")
                      : "#f0f1f3",
                  }} />
                ))}
              </div>
            </div>

            {/* MFA Methods */}
            <div className="flex flex-col gap-3">
              {methods.map(m => {
                const status = mfa[m.key];
                const isEnabled = status.enabled;
                return (
                  <div key={m.key} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all" style={{
                    borderColor: isEnabled ? m.color + "30" : "#f0f1f3",
                    background: isEnabled ? m.bgColor + "60" : "#fafafa",
                  }}>
                    <div className="size-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.bgColor }}>
                      <EmojiIcon emoji={m.emoji} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>{m.label}</span>
                        {isEnabled && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#e6fff3] text-[#00bf85]" style={{ fontWeight: 700, ...ss }}>ACTIVE</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#a0a3a7] mt-0.5 leading-relaxed" style={{ ...ss, ...pp }}>{m.description}</p>
                      {m.key === "phone" && mfa.phone.value && (
                        <span className="text-[10px] text-[#84888c] mt-0.5 block" style={{ fontWeight: 500, ...ss }}>{mfa.phone.value}</span>
                      )}
                      {m.key === "phone" && phoneAuthPrimary && (
                        <span className="text-[9px] text-[#f59e0b] mt-0.5 block" style={{ fontWeight: 500, ...ss }}>Phone OTP is your primary login method and cannot be disabled</span>
                      )}
                      {m.key === "email" && mfa.email.value && (
                        <span className="text-[10px] text-[#84888c] mt-0.5 block" style={{ fontWeight: 500, ...ss }}>{mfa.email.value}</span>
                      )}
                    </div>
                    {m.key === "phone" && phoneAuthPrimary ? (
                      <span className="shrink-0 h-8 px-4 rounded-lg text-[11px] flex items-center" style={{ background: "#f0f1f3", color: "#a0a3a7", fontWeight: 600, ...ss, ...pp }}>
                        Primary Login
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggle(m.key)}
                        className="shrink-0 h-8 px-4 rounded-lg text-[11px] cursor-pointer transition-all hover:brightness-95"
                        style={{
                          background: isEnabled ? "#fef2f2" : m.bgColor,
                          color: isEnabled ? "#dc2626" : m.color,
                          fontWeight: 600,
                          ...ss,
                          ...pp,
                        }}
                      >
                        {isEnabled ? "Disable" : "Set Up"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info banner */}
            {enabledCount < 2 && (
              <div className="mt-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 flex items-start gap-2.5">
                <EmojiIcon emoji="💡" size={14} />
                <div>
                  <span className="text-[11px] text-[#92400e] block" style={{ fontWeight: 600, ...ss, ...pp }}>Recommendation</span>
                  <span className="text-[10px] text-[#a16207]" style={{ ...ss, ...pp }}>
                    Enable at least 2 authentication methods for optimal account security. This protects you even if one method is compromised.
                  </span>
                </div>
              </div>
            )}

            {enabledCount >= 2 && (
              <div className="mt-4 bg-[#e6fff3] border border-[#a7f3d0] rounded-xl px-4 py-3 flex items-start gap-2.5">
                <EmojiIcon emoji="✅" size={14} />
                <div>
                  <span className="text-[11px] text-[#065f46] block" style={{ fontWeight: 600, ...ss, ...pp }}>Well Protected</span>
                  <span className="text-[10px] text-[#047857]" style={{ ...ss, ...pp }}>
                    Your account has strong multi-factor protection. During login, you'll choose which method to verify with.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login Preferences Card */}
        <div className="bg-white border border-[#f0f1f3] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f5f6f7]">
            <div className="flex items-center gap-2">
              <EmojiIcon emoji="⚙️" size={18} />
              <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss, ...pp }}>Login Preferences</span>
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between py-2.5 border-b border-[#f9fafb]">
              <div>
                <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 500, ...ss, ...pp }}>Default MFA Method</span>
                <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>Preferred verification method during login</span>
              </div>
              <span className="text-[12px] px-3 py-1 rounded-lg bg-[#fff4ed] text-[#ff5222]" style={{ fontWeight: 600, ...ss, ...pp }}>
                {mfa.phone.enabled ? "Phone SMS" : mfa.authenticator.enabled ? "Authenticator" : mfa.email.enabled ? "Email" : "None"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#f9fafb]">
              <div>
                <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 500, ...ss, ...pp }}>Remember Device</span>
                <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>Skip MFA on trusted devices for 30 days</span>
              </div>
              <button className="relative w-10 h-[22px] rounded-full cursor-pointer transition-colors" style={{ background: "#ff5222" }}>
                <div className="absolute top-[2px] size-[18px] rounded-full bg-white shadow-sm transition-all" style={{ left: "20px" }} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="text-[12px] text-[#070808] block" style={{ fontWeight: 500, ...ss, ...pp }}>High-Value Transaction MFA</span>
                <span className="text-[10px] text-[#a0a3a7]" style={{ ...ss, ...pp }}>Require MFA for withdrawals over ₱5,000</span>
              </div>
              <button className="relative w-10 h-[22px] rounded-full cursor-pointer transition-colors" style={{ background: "#ff5222" }}>
                <div className="absolute top-[2px] size-[18px] rounded-full bg-white shadow-sm transition-all" style={{ left: "20px" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Modals */}
      {setupModal === "phone" && (
        <PhoneSetupModal onClose={() => setSetupModal(null)} onComplete={() => handleSetupComplete("phone")} currentPhone={mfa.phone.value || "+63 917 •••• 1234"} />
      )}
      {setupModal === "authenticator" && (
        <AuthenticatorSetupModal onClose={() => setSetupModal(null)} onComplete={() => handleSetupComplete("authenticator")} />
      )}
      {setupModal === "email" && (
        <EmailSetupModal onClose={() => setSetupModal(null)} onComplete={() => handleSetupComplete("email")} currentEmail={mfa.email.value || "juan••••@gmail.com"} />
      )}
      {disableModal && (
        <DisableConfirmModal method={disableModal} onClose={() => setDisableModal(null)} onConfirm={() => handleDisable(disableModal)} />
      )}
    </>
  );
}

/* ==================== MFA VERIFY GATE (for Login flow) ==================== */
export function MfaVerifyGate({ onVerified, onBack, phone, email, hiddenMethods = [] }: {
  onVerified: () => void;
  onBack: () => void;
  phone?: string;
  email?: string;
  hiddenMethods?: MfaMethod[];
}) {
  const [selectedMethod, setSelectedMethod] = useState<MfaMethod | null>(null);
  const [contactStep, setContactStep] = useState(false);
  const [contactValue, setContactValue] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");
  const [shake, setShake] = useState(false);
  const [expired, setExpired] = useState(false);
  const [verified, setVerified] = useState(false);

  const availableMethods: { key: MfaMethod; label: string; sublabel: string; emoji: string; color: string; bgColor: string }[] = [
    { key: "phone", label: "Phone OTP", sublabel: phone || "+63 917 •••• 1234", emoji: "📱", color: "#ff5222", bgColor: "#fff4ed" },
    { key: "authenticator", label: "Authenticator App", sublabel: "Open your authenticator app", emoji: "🔐", color: "#6366f1", bgColor: "#eef2ff" },
    { key: "email", label: "Email Code", sublabel: email || "juan••••@gmail.com", emoji: "📧", color: "#00bf85", bgColor: "#e6fff3" },
  ].filter(m => !hiddenMethods.includes(m.key));

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit verification code");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setVerified(true);
    setTimeout(onVerified, 1500);
  };

  const demoCode = selectedMethod === "phone" ? "123456" : selectedMethod === "authenticator" ? "729416" : "852731";
  const demoDigits = demoCode.split("");

  if (verified) {
    return (
      <div className="flex flex-col items-center py-8" style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
        <style>{mfaKeyframes}</style>
        <div className="size-20 rounded-full bg-[#e6fff3] flex items-center justify-center mb-4" style={{ animation: "mfa-success 0.5s ease-out" }}>
          <svg className="size-10" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#00bf85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, animation: "mfa-check-draw 0.6s ease-out 0.3s both" }} />
          </svg>
        </div>
        <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss, ...pp }}>Verified!</h2>
        <p className="text-[13px] text-[#84888c] mb-3" style={{ ...ss, ...pp }}>MFA verification successful. Signing you in...</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#00bf85] bg-[#e6fff3] px-3 py-1.5 rounded-full" style={{ fontWeight: 600, ...ss }}>
            <span className="flex items-center gap-1"><EmojiIcon emoji="🛡️" size={12} /> MFA Verified</span>
          </span>
        </div>
      </div>
    );
  }

  if (!selectedMethod) {
    return (
      <div style={{ animation: "mfa-fade-in 0.3s ease-out" }}>
        <style>{mfaKeyframes}</style>
        <div className="text-center mb-6">
          <div className="size-16 rounded-2xl bg-[#f0f5ff] flex items-center justify-center mx-auto mb-4">
            <EmojiIcon emoji="🛡️" size={32} />
          </div>
          <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss, ...pp }}>
            Verify Your Identity
          </h2>
          <p className="text-[13px] text-[#84888c] leading-relaxed" style={{ ...ss, ...pp }}>
            Choose a verification method to complete sign in
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mb-5">
          {availableMethods.map(m => (
            <button
              key={m.key}
              onClick={() => {
                setSelectedMethod(m.key);
                setOtp(["", "", "", "", "", ""]);
                setError("");
                setContactError("");
                setExpired(false);
                setCodeSent(false);
                if (m.key === "phone" || m.key === "email") {
                  setContactStep(true);
                  setContactValue("");
                } else {
                  setContactStep(false);
                }
              }}
              className="flex items-center gap-3.5 p-4 rounded-xl border border-[#f0f1f3] cursor-pointer hover:border-[#ff5222]/30 hover:bg-[#fafafa] transition-all text-left"
              style={{ ...pp }}
            >
              <div className="size-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.bgColor }}>
                <EmojiIcon emoji={m.emoji} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-[#070808] block" style={{ fontWeight: 600, ...ss }}>{m.label}</span>
                <span className="text-[11px] text-[#a0a3a7] block mt-0.5" style={{ ...ss }}>{m.sublabel}</span>
              </div>
              <svg className="size-4 text-[#b0b3b8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>

        <button onClick={onBack}
          className="w-full text-center text-[12px] text-[#84888c] cursor-pointer hover:text-[#070808]" style={{ ...ss, ...pp }}>
          ← Back to Sign In
        </button>
      </div>
    );
  }

  const method = availableMethods.find(m => m.key === selectedMethod)!;

  /* ---- Contact input step (phone / email) ---- */
  if (contactStep && !codeSent) {
    const isPhone = selectedMethod === "phone";
    const handleSendCode = () => {
      const v = contactValue.trim();
      if (isPhone) {
        if (!v || v.replace(/\D/g, "").length < 7) {
          setContactError("Enter a valid phone number");
          setShake(true); setTimeout(() => setShake(false), 500);
          return;
        }
      } else {
        if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          setContactError("Enter a valid email address");
          setShake(true); setTimeout(() => setShake(false), 500);
          return;
        }
      }
      setContactError("");
      setCodeSent(true);
      setContactStep(false);
      setExpired(false);
      setOtp(["", "", "", "", "", ""]);
    };

    return (
      <div style={{ animation: shake ? "mfa-shake 0.4s ease-in-out" : "mfa-fade-in 0.3s ease-out" }}>
        <style>{mfaKeyframes}</style>
        <div className="text-center mb-6">
          <div className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: method.bgColor }}>
            <EmojiIcon emoji={method.emoji} size={32} />
          </div>
          <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss, ...pp }}>
            {isPhone ? "Enter Your Phone Number" : "Enter Your Email"}
          </h2>
          <p className="text-[13px] text-[#84888c] leading-relaxed" style={{ ...ss, ...pp }}>
            {isPhone
              ? "We'll send a 6-digit verification code via SMS"
              : "We'll send a 6-digit verification code to your email"}
          </p>
        </div>

        <div className="mb-5">
          <label className="text-[11px] text-[#84888c] mb-1.5 block" style={{ fontWeight: 500, ...ss, ...pp }}>
            {isPhone ? "Phone Number" : "Email Address"}
          </label>
          <div className={`flex items-center gap-2 h-12 px-4 rounded-xl border-2 transition-colors ${contactError ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa] focus-within:border-[#ff5222] focus-within:bg-white"}`}>
            <EmojiIcon emoji={isPhone ? "📱" : "📧"} size={18} />
            <input
              type={isPhone ? "tel" : "email"}
              value={contactValue}
              onChange={e => { setContactValue(e.target.value); setContactError(""); }}
              placeholder={isPhone ? "+63 917 123 4567" : "you@example.com"}
              autoFocus
              className="flex-1 bg-transparent outline-none text-[14px] text-[#070808] placeholder-[#b0b3b8]"
              style={{ fontWeight: 500, ...ss, ...pp }}
              onKeyDown={e => { if (e.key === "Enter") handleSendCode(); }}
            />
          </div>
          {contactError && (
            <span className="text-[11px] text-[#dc2626] mt-1.5 flex items-center gap-1" style={{ fontWeight: 500, ...ss }}>
              <EmojiIcon emoji="⚠️" size={12} /> {contactError}
            </span>
          )}
        </div>

        {/* Demo helper */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 mb-4">
          <button onClick={() => {
            setContactValue(isPhone ? "+63 917 123 4567" : "juan@gmail.com");
            setContactError("");
          }}
            className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
            style={{ fontWeight: 500, ...ss, ...pp }}>
            <EmojiIcon emoji="💡" size={12} /> Demo: Auto-fill {isPhone ? "phone number" : "email"}
          </button>
        </div>

        <button onClick={handleSendCode}
          className="w-full h-12 rounded-xl text-white text-[14px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] mb-4"
          style={{ fontWeight: 600, background: `linear-gradient(135deg, ${method.color} 0%, ${method.color}cc 100%)`, boxShadow: `0 4px 15px ${method.color}30`, ...ss, ...pp }}>
          Send Code
        </button>

        <div className="flex items-center justify-center gap-3">
          <button onClick={() => { setSelectedMethod(null); setContactStep(false); setContactValue(""); setContactError(""); }}
            className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss, ...pp }}>
            Use Different Method
          </button>
          <span className="text-[#dfe0e2]">|</span>
          <button onClick={onBack}
            className="text-[12px] text-[#84888c] cursor-pointer hover:text-[#070808]" style={{ ...ss, ...pp }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  /* ---- OTP entry step ---- */
  const displayContact = contactValue.trim() || (selectedMethod === "phone" ? (phone || "+63 917 •••• 1234") : (email || "juan••••@gmail.com"));

  return (
    <div style={{ animation: shake ? "mfa-shake 0.4s ease-in-out" : "mfa-fade-in 0.3s ease-out" }}>
      <style>{mfaKeyframes}</style>
      <div className="text-center mb-6">
        <div className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: method.bgColor }}>
          <EmojiIcon emoji={method.emoji} size={32} />
        </div>
        <h2 className="text-[22px] text-[#070808] mb-1" style={{ fontWeight: 700, ...ss, ...pp }}>
          {selectedMethod === "authenticator" ? "Authenticator Code" : `Verify via ${method.label}`}
        </h2>
        <p className="text-[13px] text-[#84888c]" style={{ ...ss, ...pp }}>
          {selectedMethod === "authenticator"
            ? "Enter the 6-digit code from your authenticator app"
            : `Code sent to ${displayContact}`}
        </p>
      </div>

      <div className="mb-4">
        <OtpInput value={otp} onChange={(val) => { setOtp(val); setError(""); const full = val.join(""); if (full.length === 6 && val.every(d => d !== "")) setTimeout(() => handleVerify(), 300); }} error={error} autoFocus />
      </div>

      {selectedMethod !== "authenticator" && !expired && (
        <div className="mb-4">
          <CountdownTimer seconds={selectedMethod === "email" ? 300 : 120} onExpire={() => setExpired(true)} />
        </div>
      )}

      {selectedMethod !== "authenticator" && expired && (
        <div className="text-center mb-4">
          <button onClick={() => { setExpired(false); setOtp(["", "", "", "", "", ""]); setError(""); }} className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss, ...pp }}>
            Resend Code
          </button>
        </div>
      )}

      {/* Demo auto-fill */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 mb-4">
        <button onClick={() => {
          setOtp(demoDigits);
          setError("");
          setTimeout(() => { setVerified(true); setTimeout(onVerified, 1500); }, 400);
        }}
          className="w-full text-[11px] text-[#2563eb] cursor-pointer hover:underline flex items-center justify-center gap-1"
          style={{ fontWeight: 500, ...ss, ...pp }}>
          <EmojiIcon emoji="💡" size={12} /> Demo: Auto-verify ({demoCode})
        </button>
      </div>

      <button onClick={handleVerify}
        className="w-full h-12 rounded-xl text-white text-[14px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ fontWeight: 600, background: `linear-gradient(135deg, ${method.color} 0%, ${method.color}cc 100%)`, boxShadow: `0 4px 15px ${method.color}30`, ...ss, ...pp }}>
        Verify
      </button>

      <div className="flex items-center justify-center gap-3 mt-5">
        <button onClick={() => { setSelectedMethod(null); setOtp(["", "", "", "", "", ""]); setError(""); setContactStep(false); setCodeSent(false); setContactValue(""); }}
          className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss, ...pp }}>
          Use Different Method
        </button>
        <span className="text-[#dfe0e2]">|</span>
        <button onClick={onBack}
          className="text-[12px] text-[#84888c] cursor-pointer hover:text-[#070808]" style={{ ...ss, ...pp }}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
