import { useState, useEffect, useRef, type ReactNode } from "react";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface OmsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function OmsModal({ open, onClose, title, subtitle, children, width = "max-w-[520px]" }: OmsModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={pp}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div ref={ref} className={`relative bg-white border border-[#e5e7eb] rounded-2xl w-full ${width} max-h-[90vh] overflow-y-auto`} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)" }}>
        <div className="flex items-start justify-between p-5 pb-3 border-b border-[#f0f1f3] sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h3 className="text-[#070808] text-[15px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
            {subtitle && <p className="text-[#b0b3b8] text-[11px] mt-0.5" style={ss04}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-[#b0b3b8] hover:text-[#070808] cursor-pointer text-[20px] leading-none p-1 -mt-0.5 transition-colors">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ==================== FORM PRIMITIVES ==================== */
export function OmsField({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="mb-3">
      <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function OmsInput({ value, onChange, placeholder, type = "text", disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder-[#b0b3b8]"
      placeholder={placeholder}
      style={{ ...pp, ...ss04 }}
    />
  );
}

export function OmsTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors resize-none placeholder-[#b0b3b8]"
      placeholder={placeholder}
      style={{ ...pp, ...ss04 }}
    />
  );
}

export function OmsSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors cursor-pointer"
      style={{ ...pp, ...ss04 }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function OmsButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 mt-4 pt-3 border-t border-[#f0f1f3]">{children}</div>;
}

export function OmsBtn({ children, variant = "primary", onClick, disabled, fullWidth }: { children: ReactNode; variant?: "primary" | "secondary" | "danger" | "success" | "ghost"; onClick?: () => void; disabled?: boolean; fullWidth?: boolean }) {
  const cls: Record<string, string> = {
    primary: "bg-[#ff5222] hover:bg-[#e8491f] text-white",
    secondary: "bg-[#f0f1f3] hover:bg-[#e5e7eb] text-[#84888c]",
    danger: "bg-red-50 hover:bg-red-100 text-red-500",
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-600",
    ghost: "bg-transparent hover:bg-[#f5f6f7] text-[#b0b3b8]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-9 px-4 text-[12px] rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${cls[variant]} ${fullWidth ? "flex-1" : ""}`}
      style={{ fontWeight: 600, ...pp, ...ss04 }}
    >
      {children}
    </button>
  );
}

/* ==================== CONFIRMATION CONTENT ==================== */
export function OmsConfirmContent({ icon, iconColor = "#ff5222", iconBg = "#ff5222", message, details }: { icon: "warning" | "success" | "danger" | "info"; iconColor?: string; iconBg?: string; message: string; details?: { label: string; value: string }[] }) {
  const icons = {
    warning: <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth="2"><path d="M12 2L2 20h20L12 2zM12 9v4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="16" r="0.5" fill={iconColor} stroke="none" /></svg>,
    success: <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>,
    danger: <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>,
    info: <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>,
  };
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${iconBg}12` }}>
          {icons[icon]}
        </div>
        <p className="text-[#555] text-[13px] leading-[1.6]" style={ss04}>{message}</p>
      </div>
      {details && details.length > 0 && (
        <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg p-3 space-y-1.5">
          {details.map(d => (
            <div key={d.label} className="flex justify-between">
              <span className="text-[#b0b3b8] text-[11px]" style={ss04}>{d.label}</span>
              <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== TOAST SYSTEM ==================== */
let toastIdCounter = 0;
type ToastItem = { id: number; message: string; type: "success" | "error" | "info" };
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toastList: ToastItem[] = [];

function notifyToastListeners() { toastListeners.forEach(l => l([...toastList])); }

export function showOmsToast(message: string, type: "success" | "error" | "info" = "success") {
  const id = ++toastIdCounter;
  toastList = [...toastList, { id, message, type }];
  notifyToastListeners();
  setTimeout(() => { toastList = toastList.filter(t => t.id !== id); notifyToastListeners(); }, 3200);
}

export function OmsToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    toastListeners.push(setItems);
    return () => { toastListeners = toastListeners.filter(l => l !== setItems); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2" style={pp}>
      {items.map(t => {
        const colors = {
          success: "bg-emerald-50 border-emerald-200 text-emerald-600",
          error: "bg-red-50 border-red-200 text-red-500",
          info: "bg-blue-50 border-blue-200 text-blue-600",
        };
        const iconsSvg = {
          success: <svg className="size-4 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M6 8l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
          error: <svg className="size-4 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M10 6l-4 4M6 6l4 4" strokeLinecap="round" /></svg>,
          info: <svg className="size-4 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M8 7v3" strokeLinecap="round" /><circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" /></svg>,
        };
        return (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${colors[t.type]}`} style={{ animation: "omsToastIn 0.25s ease-out", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {iconsSvg[t.type]}
            <span className="text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{t.message}</span>
          </div>
        );
      })}
      <style>{`@keyframes omsToastIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}
