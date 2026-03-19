import { useState, useEffect, useRef } from "react";
import { EmojiIcon } from "./two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
export interface ModalTheme {
  bg: string; card: string; cardBorder: string;
  text: string; textSec: string; textMut: string; textFaint: string;
  inputBg: string; inputBorder: string;
  greenBg: string; greenText: string; orangeBg: string; orangeText: string;
  isDark: boolean;
}

type ModalMode = "deposit" | "withdraw";
type Step = "method" | "amount" | "confirm" | "processing" | "success";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  category: "e-wallet" | "bank" | "otc";
  min: number;
  max: number;
  fee: string;
  processingTime: string;
  popular?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  // E-Wallets
  { id: "gcash", name: "GCash", icon: "G", color: "#0070E0", textColor: "#fff", category: "e-wallet", min: 100, max: 100000, fee: "Libre", processingTime: "Instant", popular: true },
  { id: "maya", name: "Maya", icon: "M", color: "#16A34A", textColor: "#fff", category: "e-wallet", min: 100, max: 100000, fee: "Libre", processingTime: "Instant", popular: true },
  { id: "grabpay", name: "GrabPay", icon: "GP", color: "#00B14F", textColor: "#fff", category: "e-wallet", min: 100, max: 50000, fee: "Libre", processingTime: "Instant" },
  { id: "shopeepay", name: "ShopeePay", icon: "SP", color: "#EE4D2D", textColor: "#fff", category: "e-wallet", min: 100, max: 50000, fee: "Libre", processingTime: "Instant" },
  // Banks
  { id: "bdo", name: "BDO", icon: "BDO", color: "#003087", textColor: "#fff", category: "bank", min: 500, max: 500000, fee: "₱15", processingTime: "1-3 min" },
  { id: "bpi", name: "BPI", icon: "BPI", color: "#A01F1F", textColor: "#fff", category: "bank", min: 500, max: 500000, fee: "₱15", processingTime: "1-3 min" },
  { id: "unionbank", name: "UnionBank", icon: "UB", color: "#F47920", textColor: "#fff", category: "bank", min: 500, max: 500000, fee: "₱15", processingTime: "1-3 min" },
  { id: "metrobank", name: "Metrobank", icon: "MB", color: "#003366", textColor: "#fff", category: "bank", min: 500, max: 500000, fee: "₱15", processingTime: "1-5 min" },
  { id: "landbank", name: "Landbank", icon: "LB", color: "#006633", textColor: "#fff", category: "bank", min: 500, max: 500000, fee: "₱15", processingTime: "1-5 min" },
  // OTC (Over-the-Counter)
  { id: "7eleven", name: "7-Eleven", icon: "7E", color: "#00703C", textColor: "#fff", category: "otc", min: 200, max: 10000, fee: "₱10", processingTime: "5-15 min" },
  { id: "cebuana", name: "Cebuana Lhuillier", icon: "CL", color: "#FFD100", textColor: "#333", category: "otc", min: 200, max: 50000, fee: "₱25", processingTime: "5-15 min" },
  { id: "mlhuillier", name: "M Lhuillier", icon: "ML", color: "#FF0000", textColor: "#fff", category: "otc", min: 200, max: 50000, fee: "₱25", processingTime: "5-15 min" },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

/* ==================== MODAL COMPONENT ==================== */
export function DepositWithdrawModal({
  isOpen,
  onClose,
  mode: initialMode,
  theme,
  balance = 23450,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  theme: ModalTheme;
  balance?: number;
}) {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [methodCategory, setMethodCategory] = useState<"e-wallet" | "bank" | "otc">("e-wallet");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = theme;

  useEffect(() => {
    setMode(initialMode);
    setStep("method");
    setSelectedMethod(null);
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    setProcessingProgress(0);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (step === "processing") {
      setProcessingProgress(0);
      intervalRef.current = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => setStep("success"), 300);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [step]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = selectedMethod
    ? parsedAmount >= selectedMethod.min && parsedAmount <= selectedMethod.max
    : false;
  const isValidWithdraw = mode === "withdraw"
    ? isValidAmount && parsedAmount <= balance && accountNumber.length >= 10
    : isValidAmount;

  const filteredMethods = PAYMENT_METHODS.filter(m => m.category === methodCategory);

  const handleConfirm = () => {
    setStep("processing");
  };

  const handleClose = () => {
    setStep("method");
    setSelectedMethod(null);
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    onClose();
  };

  const overlayBg = t.isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)";
  const modalBg = t.isDark ? "#15161a" : "#ffffff";
  const accentBorder = t.isDark ? "rgba(255,255,255,0.08)" : "#f0f1f3";
  const chipBg = t.isDark ? "rgba(255,255,255,0.06)" : "#f5f6f7";
  const chipActiveBg = t.isDark ? "rgba(255,82,34,0.15)" : "rgba(255,82,34,0.08)";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: overlayBg }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] mx-3 max-h-[90vh] rounded-2xl border flex flex-col overflow-hidden"
        style={{ background: modalBg, borderColor: accentBorder, boxShadow: t.isDark ? "0 24px 80px rgba(0,0,0,0.6)" : "0 24px 80px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: accentBorder }}>
          <div className="flex items-center gap-3">
            {step !== "method" && step !== "success" && (
              <button onClick={() => {
                if (step === "amount") setStep("method");
                else if (step === "confirm") setStep("amount");
              }} className="size-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-black/5" style={{ background: chipBg }}>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[18px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>
                {mode === "deposit" ? "Mag-Deposit" : "Mag-Withdraw"}
              </span>
              <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>
                {step === "method" && "Pumili ng paraan ng bayad"}
                {step === "amount" && `via ${selectedMethod?.name}`}
                {step === "confirm" && "Kumpirmahin ang transaksyon"}
                {step === "processing" && "Pinoproseso..."}
                {step === "success" && "Matagumpay!"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            {step === "method" && (
              <div className="flex h-8 rounded-lg overflow-hidden" style={{ background: chipBg }}>
                {(["deposit", "withdraw"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className="px-3 text-[12px] cursor-pointer transition-colors"
                    style={{
                      background: mode === m ? "#ff5222" : "transparent",
                      color: mode === m ? "#fff" : t.textSec,
                      fontWeight: mode === m ? 600 : 400, ...ss, ...pp,
                    }}>
                    {m === "deposit" ? "Deposit" : "Withdraw"}
                  </button>
                ))}
              </div>
            )}
            <button onClick={handleClose} className="size-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors" style={{ background: chipBg }}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke={t.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Balance Strip */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: accentBorder, background: t.isDark ? "rgba(255,255,255,0.02)" : "#fafbfc" }}>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full flex items-center justify-center" style={{ background: "#ff5222" }}>
              <span className="text-white text-[12px]" style={{ fontWeight: 700 }}>₱</span>
            </div>
            <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Kasalukuyang Balanse</span>
          </div>
          <span className="text-[16px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>
            ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

          {/* ===== STEP: METHOD SELECTION ===== */}
          {step === "method" && (
            <>
              {/* Category tabs */}
              <div className="flex gap-2">
                {([
                  { key: "e-wallet" as const, label: "E-Wallet", icon: "📱" },
                  { key: "bank" as const, label: "Bangko", icon: "🏦" },
                  { key: "otc" as const, label: "Over-the-Counter", icon: "🏪" },
                ]).map(cat => (
                  <button key={cat.key} onClick={() => setMethodCategory(cat.key)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg cursor-pointer transition-all text-[12px]"
                    style={{
                      background: methodCategory === cat.key ? chipActiveBg : chipBg,
                      border: `1px solid ${methodCategory === cat.key ? "#ff5222" : "transparent"}`,
                      color: methodCategory === cat.key ? "#ff5222" : t.textSec,
                      fontWeight: methodCategory === cat.key ? 600 : 400, ...ss, ...pp,
                    }}>
                    <EmojiIcon emoji={cat.icon} size={14} />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Method grid */}
              <div className="flex flex-col gap-2">
                {filteredMethods.map(method => (
                  <button key={method.id}
                    onClick={() => { setSelectedMethod(method); setStep("amount"); }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: chipBg,
                      border: `1px solid ${accentBorder}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff5222"; e.currentTarget.style.background = chipActiveBg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.background = chipBg; }}
                  >
                    {/* Logo */}
                    <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: method.color }}>
                      <span className="text-[11px]" style={{ color: method.textColor, fontWeight: 700, ...pp }}>
                        {method.icon}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{method.name}</span>
                        {method.popular && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: t.greenBg, color: t.greenText, fontWeight: 600, ...pp }}>Sikat</span>
                        )}
                      </div>
                      <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
                        Min ₱{method.min.toLocaleString()} &middot; Max ₱{method.max.toLocaleString()}
                      </span>
                    </div>
                    {/* Fee & time */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[11px]" style={{ color: method.fee === "Libre" ? t.greenText : t.textSec, fontWeight: 500, ...ss, ...pp }}>
                        {method.fee}
                      </span>
                      <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
                        {method.processingTime}
                      </span>
                    </div>
                    {/* Arrow */}
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={t.textMut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <EmojiIcon emoji="🛡️" size={12} />
                  <span className="text-[10px]" style={{ color: t.textMut, ...ss, ...pp }}>PAGCOR Licensed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <EmojiIcon emoji="🔒" size={12} />
                  <span className="text-[10px]" style={{ color: t.textMut, ...ss, ...pp }}>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <EmojiIcon emoji="⚡" size={12} />
                  <span className="text-[10px]" style={{ color: t.textMut, ...ss, ...pp }}>Instant Processing</span>
                </div>
              </div>
            </>
          )}

          {/* ===== STEP: AMOUNT ===== */}
          {step === "amount" && selectedMethod && (
            <>
              {/* Selected method badge */}
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: chipBg }}>
                <div className="size-8 rounded-md flex items-center justify-center" style={{ background: selectedMethod.color }}>
                  <span className="text-[10px]" style={{ color: selectedMethod.textColor, fontWeight: 700, ...pp }}>{selectedMethod.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[13px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>{selectedMethod.name}</span>
                  <span className="text-[11px] ml-2" style={{ color: t.textMut, ...ss, ...pp }}>
                    {selectedMethod.fee === "Libre" ? "Walang bayad" : `Fee: ${selectedMethod.fee}`} &middot; {selectedMethod.processingTime}
                  </span>
                </div>
                <button onClick={() => setStep("method")} className="text-[11px] cursor-pointer" style={{ color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>Palitan</button>
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>
                  Magkano ang gusto mong {mode === "deposit" ? "i-deposit" : "i-withdraw"}?
                </span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[24px]" style={{ color: "#ff5222", fontWeight: 700, ...pp }}>₱</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 pl-12 pr-4 rounded-xl text-[28px] outline-none"
                    style={{
                      background: chipBg,
                      border: `2px solid ${parsedAmount > 0 ? (isValidAmount ? "#ff5222" : t.orangeText) : accentBorder}`,
                      color: t.text, fontWeight: 600, ...ss, ...pp,
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
                    Min ₱{selectedMethod.min.toLocaleString()} — Max ₱{selectedMethod.max.toLocaleString()}
                  </span>
                  {mode === "withdraw" && (
                    <button onClick={() => setAmount(String(Math.min(balance, selectedMethod.max)))}
                      className="text-[11px] cursor-pointer" style={{ color: "#ff5222", fontWeight: 500, ...ss, ...pp }}>
                      Lahat (₱{Math.min(balance, selectedMethod.max).toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.filter(a => a >= selectedMethod.min && a <= selectedMethod.max).map(a => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className="h-10 rounded-lg text-[13px] cursor-pointer transition-all"
                    style={{
                      background: parsedAmount === a ? chipActiveBg : chipBg,
                      border: `1px solid ${parsedAmount === a ? "#ff5222" : "transparent"}`,
                      color: parsedAmount === a ? "#ff5222" : t.text,
                      fontWeight: 500, ...ss, ...pp,
                    }}>
                    ₱{a.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Withdraw: account info */}
              {mode === "withdraw" && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>
                      {selectedMethod.category === "e-wallet" ? "Mobile Number" : selectedMethod.category === "bank" ? "Account Number" : "Pangalan"}
                    </span>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder={selectedMethod.category === "e-wallet" ? "09XX XXX XXXX" : "Account number"}
                      className="h-12 px-4 rounded-lg text-[14px] outline-none"
                      style={{ background: chipBg, border: `1px solid ${accentBorder}`, color: t.text, ...ss, ...pp }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>Pangalan ng may-ari</span>
                    <input
                      type="text"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="h-12 px-4 rounded-lg text-[14px] outline-none"
                      style={{ background: chipBg, border: `1px solid ${accentBorder}`, color: t.text, ...ss, ...pp }}
                    />
                  </div>
                </div>
              )}

              {/* Proceed button */}
              <button
                onClick={() => setStep("confirm")}
                disabled={mode === "deposit" ? !isValidAmount : !isValidWithdraw}
                className="h-12 rounded-xl text-[15px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                style={{
                  background: "#ff5222",
                  color: "#fff",
                  fontWeight: 600, ...ss, ...pp,
                }}>
                Ipagpatuloy
              </button>
            </>
          )}

          {/* ===== STEP: CONFIRM ===== */}
          {step === "confirm" && selectedMethod && (
            <>
              <div className="flex flex-col items-center py-4 gap-2">
                <div className="size-16 rounded-2xl flex items-center justify-center" style={{ background: selectedMethod.color }}>
                  <span className="text-[18px]" style={{ color: selectedMethod.textColor, fontWeight: 700, ...pp }}>{selectedMethod.icon}</span>
                </div>
                <span className="text-[14px]" style={{ color: t.textSec, ...ss, ...pp }}>
                  {mode === "deposit" ? "Ide-deposit" : "Iwi-withdraw"} sa {selectedMethod.name}
                </span>
                <span className="text-[36px]" style={{ color: t.text, fontWeight: 700, ...ss, ...pp }}>
                  ₱{parsedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: `1px solid ${accentBorder}` }}>
                {[
                  { label: "Paraan ng bayad", value: selectedMethod.name },
                  { label: "Halaga", value: `₱${parsedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
                  { label: "Bayarin (Fee)", value: selectedMethod.fee, highlight: selectedMethod.fee === "Libre" },
                  { label: "Processing time", value: selectedMethod.processingTime },
                  ...(mode === "withdraw" ? [
                    { label: "Padadalhan", value: accountNumber },
                    { label: "Pangalan", value: accountName || "—" },
                  ] : []),
                  { label: "Total", value: `₱${parsedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, bold: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3" style={{ background: i % 2 === 0 ? "transparent" : (t.isDark ? "rgba(255,255,255,0.02)" : "#fafbfc"), borderBottom: `1px solid ${accentBorder}` }}>
                    <span className="text-[12px]" style={{ color: t.textSec, ...ss, ...pp }}>{row.label}</span>
                    <span className="text-[13px]" style={{
                      color: (row as any).highlight ? t.greenText : (row as any).bold ? t.text : t.text,
                      fontWeight: (row as any).bold ? 700 : 500, ...ss, ...pp,
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Warning for deposit */}
              {mode === "deposit" && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: t.isDark ? "rgba(255,82,34,0.08)" : "#fff8f5", border: `1px solid ${t.isDark ? "rgba(255,82,34,0.15)" : "rgba(255,82,34,0.1)"}` }}>
                  <span className="shrink-0 mt-0.5"><EmojiIcon emoji="💡" size={16} /></span>
                  <span className="text-[11px]" style={{ color: t.textSec, ...ss, ...pp }}>
                    Pagkatapos mong i-confirm, bubukas ang {selectedMethod.name} {selectedMethod.category === "e-wallet" ? "app" : "portal"} para tapusin ang bayad. Huwag isara ang window na ito habang nag-proproseso.
                  </span>
                </div>
              )}
              {mode === "withdraw" && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: t.isDark ? "rgba(0,191,133,0.08)" : "#f0fdf4", border: `1px solid ${t.isDark ? "rgba(0,191,133,0.15)" : "rgba(0,191,133,0.1)"}` }}>
                  <span className="shrink-0 mt-0.5"><EmojiIcon emoji="💰" size={16} /></span>
                  <span className="text-[11px]" style={{ color: t.textSec, ...ss, ...pp }}>
                    Ang withdrawal ay mapoproseso sa loob ng {selectedMethod.processingTime}. Siguruhing tama ang {selectedMethod.category === "e-wallet" ? "mobile number" : "account number"} mo.
                  </span>
                </div>
              )}

              {/* Confirm button */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("amount")} className="flex-1 h-12 rounded-xl text-[14px] cursor-pointer transition-colors" style={{ background: chipBg, color: t.text, fontWeight: 500, ...ss, ...pp }}>
                  Bumalik
                </button>
                <button onClick={handleConfirm} className="flex-[2] h-12 rounded-xl text-[15px] cursor-pointer transition-colors" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
                  {mode === "deposit" ? "Kumpirmahin ang Deposit" : "Kumpirmahin ang Withdrawal"}
                </button>
              </div>
            </>
          )}

          {/* ===== STEP: PROCESSING ===== */}
          {step === "processing" && selectedMethod && (
            <div className="flex flex-col items-center py-10 gap-6">
              {/* Spinner */}
              <div className="relative size-20">
                <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke={accentBorder} strokeWidth="4" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#ff5222" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - processingProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>{processingProgress}%</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[16px]" style={{ color: t.text, fontWeight: 500, ...ss, ...pp }}>
                  {mode === "deposit" ? "Nagdi-deposit" : "Nagwi-withdraw"}...
                </span>
                <span className="text-[13px]" style={{ color: t.textSec, ...ss, ...pp }}>
                  ₱{parsedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} via {selectedMethod.name}
                </span>
                <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>
                  Huwag isara ang window na ito
                </span>
              </div>
            </div>
          )}

          {/* ===== STEP: SUCCESS ===== */}
          {step === "success" && selectedMethod && (
            <div className="flex flex-col items-center py-6 gap-5">
              {/* Success icon */}
              <div className="size-20 rounded-full flex items-center justify-center" style={{ background: t.greenBg }}>
                <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke={t.greenText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[18px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>
                  {mode === "deposit" ? "Matagumpay na Na-deposit!" : "Matagumpay na Na-withdraw!"}
                </span>
                <span className="text-[30px]" style={{ color: t.greenText, fontWeight: 700, ...ss, ...pp }}>
                  ₱{parsedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[13px]" style={{ color: t.textSec, ...ss, ...pp }}>
                  via {selectedMethod.name} &middot; {new Date().toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* New balance */}
              <div className="w-full rounded-xl p-4 flex items-center justify-between" style={{ background: chipBg, border: `1px solid ${accentBorder}` }}>
                <span className="text-[13px]" style={{ color: t.textSec, ...ss, ...pp }}>Bagong Balanse</span>
                <span className="text-[18px]" style={{ color: t.text, fontWeight: 600, ...ss, ...pp }}>
                  ₱{(mode === "deposit" ? balance + parsedAmount : balance - parsedAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Transaction ref */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[11px]" style={{ color: t.textMut, ...ss, ...pp }}>Ref No:</span>
                <span className="text-[11px]" style={{ color: t.textSec, fontWeight: 500, ...ss, ...pp }}>
                  FG-{Date.now().toString(36).toUpperCase()}
                </span>
              </div>

              {/* Quick actions */}
              <div className="w-full flex flex-col gap-2 pt-2">
                <button onClick={handleClose} className="h-12 rounded-xl text-[15px] cursor-pointer w-full transition-colors" style={{ background: "#ff5222", color: "#fff", fontWeight: 600, ...ss, ...pp }}>
                  Tapos na — Bumalik
                </button>
                {mode === "deposit" && (
                  <button onClick={() => { setStep("amount"); setAmount(""); }}
                    className="h-10 rounded-xl text-[13px] cursor-pointer w-full transition-colors"
                    style={{ background: chipBg, color: t.text, fontWeight: 500, ...ss, ...pp }}>
                    Mag-deposit ulit
                  </button>
                )}
              </div>

              {/* PAGCOR footer */}
              <div className="flex items-center gap-1.5 pt-2">
                <EmojiIcon emoji="🛡️" size={12} />
                <span className="text-[10px]" style={{ color: t.textMut, ...ss, ...pp }}>
                  Secured by PAGCOR &middot; ForeGate Inc. &copy; 2026
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}