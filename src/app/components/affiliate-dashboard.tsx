import { useState } from "react";
import { EmojiIcon } from "./two-tone-icons";
import { usePageTheme } from "./theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const MOCK_REFERRALS = [
  { name: "Maria Santos", handle: "@maria_santos", date: "Mar 12, 2026", deposited: 5000, commission: 1500, status: "active" as const },
  { name: "Carlos Reyes", handle: "@carlos_r", date: "Mar 10, 2026", deposited: 3000, commission: 900, status: "active" as const },
  { name: "Ana Cruz", handle: "@anacruz", date: "Mar 8, 2026", deposited: 10000, commission: 3000, status: "active" as const },
  { name: "Miguel Torres", handle: "@miguelt", date: "Mar 5, 2026", deposited: 1000, commission: 300, status: "active" as const },
  { name: "Sofia Garcia", handle: "@sofiagarcia", date: "Mar 3, 2026", deposited: 2500, commission: 750, status: "pending" as const },
  { name: "Diego Ramos", handle: "@diego_r", date: "Feb 28, 2026", deposited: 0, commission: 0, status: "signed_up" as const },
];

const MOCK_PAYOUTS = [
  { id: "P001", date: "Mar 12, 2026", amount: 3000, method: "GCash", status: "completed", ref: "FG-AFF-X8K2" },
  { id: "P002", date: "Mar 5, 2026", amount: 1500, method: "GCash", status: "completed", ref: "FG-AFF-M4P1" },
  { id: "P003", date: "Feb 28, 2026", amount: 2400, method: "Maya", status: "completed", ref: "FG-AFF-Q7R3" },
  { id: "P004", date: "Feb 20, 2026", amount: 900, method: "GCash", status: "completed", ref: "FG-AFF-L2N5" },
];

interface AffiliateDashboardProps {
  referralLink: string;
  copied: boolean;
  onCopyLink: () => void;
  onBack: () => void;
}

export function AffiliateDashboard({ referralLink, copied, onCopyLink, onBack }: AffiliateDashboardProps) {
  const [dashTab, setDashTab] = useState<"overview" | "referrals" | "payouts">("overview");
  const [payoutMethod, setPayoutMethod] = useState<"gcash" | "maya" | "bank">("gcash");
  const [payoutNumber, setPayoutNumber] = useState("09171234567");
  const [payoutName, setPayoutName] = useState("Juan Dela Cruz");
  const [payoutSaved, setPayoutSaved] = useState(false);

  const totalEarnings = 12450;
  const availableBalance = 3900;
  const totalReferrals = 6;
  const conversionRate = 4.8;
  const pendingCommission = 750;
  const activeReferrals = 4;
  const totalClicks = 1247;

  const handleSavePayout = () => {
    setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2000);
  };

  const theme = usePageTheme();

  return (
    <div className="min-h-full" style={{ ...pp, background: theme.bg }}>
      <div className="max-w-[1000px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[20px] sm:text-[24px]" style={{ fontWeight: 700, color: theme.text, ...ss }}>Affiliate Dashboard</h1>
            <p className="text-[12px]" style={{ color: theme.textSec, ...ss }}>Standard Affiliate — 30% commission</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCopyLink} className="h-9 px-4 rounded-lg bg-[#ff5222] text-white text-[12px] cursor-pointer hover:bg-[#e8491e] transition-colors flex items-center gap-1.5" style={{ fontWeight: 500, ...ss }}>
              <EmojiIcon emoji="🔗" size={13} />
              {copied ? "Na-copy!" : "I-copy ang Link"}
            </button>
            <button onClick={onBack} className="h-9 px-3 rounded-lg text-[12px] cursor-pointer transition-colors" style={{ fontWeight: 500, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: theme.textSec, ...ss }}>
              Bumalik
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Earnings", value: `₱${totalEarnings.toLocaleString()}`, emoji: "💰", bg: "#e6fff3" },
            { label: "Available Balance", value: `₱${availableBalance.toLocaleString()}`, emoji: "💳", bg: "#fff4ed" },
            { label: "Total Referrals", value: String(totalReferrals), emoji: "👥", bg: "#eef4ff" },
            { label: "Conversion Rate", value: `${conversionRate}%`, emoji: "📈", bg: "#f3f0ff" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>{stat.label}</span>
                <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                  <EmojiIcon emoji={stat.emoji} size={14} />
                </div>
              </div>
              <span className="text-[22px] sm:text-[26px]" style={{ fontWeight: 700, color: theme.text, ...ss }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Sub-stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: "Pending Commission", value: `₱${pendingCommission.toLocaleString()}`, emoji: "⏳" },
            { label: "Aktibong Referrals", value: `${activeReferrals}/${totalReferrals}`, emoji: "✅" },
            { label: "Total na Clicks", value: totalClicks.toLocaleString(), emoji: "🔗" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <EmojiIcon emoji={s.emoji} size={20} />
              <div className="flex flex-col">
                <span className="text-[16px] sm:text-[18px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>{s.value}</span>
                <span className="text-[10px]" style={{ color: theme.textSec, ...ss }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Link Card */}
        <div className="rounded-xl p-4 mb-5" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Referral Link Mo</span>
            <span className="text-[10px] text-[#00bf85] bg-[#e6fff3] px-2 py-0.5 rounded-full" style={{ fontWeight: 600, ...ss }}>Active</span>
          </div>
          <div className="h-10 rounded-lg flex items-center px-3 gap-2" style={{ background: theme.inputBg }}>
            <span className="flex-1 text-[12px] truncate" style={{ color: theme.textSec, ...ss }}>{referralLink}</span>
            <button onClick={onCopyLink} className="shrink-0 text-[11px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>
              {copied ? "Na-copy!" : "I-copy"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto no-scrollbar">
          {([
            { key: "overview" as const, label: "Overview", emoji: "📊" },
            { key: "referrals" as const, label: "Mga Referral", emoji: "👥" },
            { key: "payouts" as const, label: "Payouts & Settings", emoji: "💳" },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setDashTab(tab.key)}
              className="shrink-0 h-9 px-4 rounded-lg text-[12px] cursor-pointer transition-all flex items-center gap-1.5"
              style={{
                background: dashTab === tab.key ? (theme.isDark ? "#f0f0f2" : "#070808") : theme.card,
                color: dashTab === tab.key ? (theme.isDark ? "#070808" : "#fff") : theme.textSec,
                border: `1px solid ${dashTab === tab.key ? (theme.isDark ? "#f0f0f2" : "#070808") : theme.cardBorder}`,
                fontWeight: dashTab === tab.key ? 600 : 400, ...ss,
              }}>
              <EmojiIcon emoji={tab.emoji} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {dashTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Mga Kamakailang Referral</span>
                <button onClick={() => setDashTab("referrals")} className="text-[11px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>Tingnan Lahat</button>
              </div>
              {MOCK_REFERRALS.slice(0, 4).map((ref, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 transition-colors" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                  <div className="size-9 rounded-full flex items-center justify-center shrink-0" style={{ background: theme.inputBg }}>
                    <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>{ref.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] truncate" style={{ fontWeight: 500, color: theme.text, ...ss }}>{ref.name}</span>
                      <span className="text-[10px] hidden sm:inline" style={{ color: theme.textSec, ...ss }}>{ref.handle}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>Nag-join {ref.date}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[13px] text-[#00bf85]" style={{ fontWeight: 600, ...ss }}>+₱{ref.commission.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: theme.textSec, ...ss }}>₱{ref.deposited.toLocaleString()} deposit</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Mga Kamakailang Payout</span>
                <button onClick={() => setDashTab("payouts")} className="text-[11px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss }}>Payout Settings</button>
              </div>
              {MOCK_PAYOUTS.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                  <div className="size-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.method === "GCash" ? "#eef4ff" : p.method === "Maya" ? "#e6fff3" : "#f3f0ff" }}>
                    <EmojiIcon emoji={p.method === "GCash" ? "📱" : p.method === "Maya" ? "💳" : "🏦"} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px]" style={{ fontWeight: 500, color: theme.text, ...ss }}>{p.method} Payout</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>{p.date}</span>
                      <span className="text-[10px]" style={{ color: theme.textFaint }}>·</span>
                      <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>{p.ref}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>₱{p.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-[#00bf85]" style={{ fontWeight: 500, ...ss }}>Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Referrals */}
        {dashTab === "referrals" && (
          <div className="rounded-xl overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
              <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Lahat ng Referrals ({MOCK_REFERRALS.length})</span>
            </div>
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-[10px]" style={{ background: theme.inputBg, color: theme.textSec, borderBottom: `1px solid ${theme.inputBorder}`, fontWeight: 600, ...ss }}>
              <span className="col-span-3">User</span>
              <span className="col-span-2">Nag-join</span>
              <span className="col-span-2 text-right">Deposited</span>
              <span className="col-span-2 text-right">Commission</span>
              <span className="col-span-3 text-right">Status</span>
            </div>
            {MOCK_REFERRALS.map((ref, i) => (
              <div key={i} className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2 px-4 py-3 transition-colors" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ background: theme.inputBg }}>
                    <span className="text-[12px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>{ref.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[12px] truncate block" style={{ fontWeight: 500, color: theme.text, ...ss }}>{ref.name}</span>
                    <span className="text-[10px]" style={{ color: theme.textSec, ...ss }}>{ref.handle}</span>
                  </div>
                </div>
                <span className="col-span-2 text-[11px] flex items-center" style={{ color: theme.textSec, ...ss }}>{ref.date}</span>
                <span className="col-span-2 text-[12px] flex items-center sm:justify-end" style={{ fontWeight: 500, color: theme.text, ...ss }}>₱{ref.deposited.toLocaleString()}</span>
                <span className="col-span-2 text-[12px] text-[#00bf85] flex items-center sm:justify-end" style={{ fontWeight: 600, ...ss }}>+₱{ref.commission.toLocaleString()}</span>
                <div className="col-span-3 flex items-center sm:justify-end">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                    background: ref.status === "active" ? "#e6fff3" : ref.status === "pending" ? "#fff4ed" : (theme.isDark ? theme.inputBg : "#f5f6f7"),
                    color: ref.status === "active" ? "#00bf85" : ref.status === "pending" ? "#ff5222" : theme.textSec,
                    fontWeight: 600, ...ss,
                  }}>
                    {ref.status === "active" ? "Aktibo" : ref.status === "pending" ? "Pending" : "Nag-signup lang"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Payouts & Settings */}
        {dashTab === "payouts" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Payout Settings</span>
                <p className="text-[11px] mt-0.5" style={{ color: theme.textSec, ...ss }}>Pumili kung saan mo gustong matanggap ang commission mo.</p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex gap-2">
                  {([
                    { key: "gcash" as const, label: "GCash", color: "#0070E0", icon: "G" },
                    { key: "maya" as const, label: "Maya", color: "#16A34A", icon: "M" },
                    { key: "bank" as const, label: "Bank", color: "#003087", icon: "B" },
                  ]).map(m => (
                    <button key={m.key} onClick={() => setPayoutMethod(m.key)}
                      className="flex-1 h-11 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all text-[12px]"
                      style={{
                        background: payoutMethod === m.key ? "rgba(255,82,34,0.08)" : (theme.isDark ? theme.inputBg : "#f5f6f7"),
                        border: `1.5px solid ${payoutMethod === m.key ? "#ff5222" : "transparent"}`,
                        color: payoutMethod === m.key ? "#ff5222" : theme.textSec,
                        fontWeight: payoutMethod === m.key ? 600 : 400, ...ss,
                      }}>
                      <div className="size-6 rounded flex items-center justify-center" style={{ background: m.color }}>
                        <span className="text-[9px] text-white" style={{ fontWeight: 700 }}>{m.icon}</span>
                      </div>
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>
                      {payoutMethod === "bank" ? "Account Number" : "Mobile Number"}
                    </label>
                    <input value={payoutNumber} onChange={e => setPayoutNumber(e.target.value)}
                      placeholder={payoutMethod === "bank" ? "Account number" : "09XX XXX XXXX"}
                      className="h-11 px-4 rounded-lg text-[13px] outline-none transition-colors"
                      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, ...ss }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Pangalan ng May-ari</label>
                    <input value={payoutName} onChange={e => setPayoutName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="h-11 px-4 rounded-lg text-[13px] outline-none transition-colors"
                      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, ...ss }} />
                  </div>
                </div>

                <button onClick={handleSavePayout} className="h-10 rounded-lg text-[13px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  style={{ background: payoutSaved ? "#00bf85" : (theme.isDark ? "#f0f0f2" : "#070808"), color: payoutSaved ? "#fff" : (theme.isDark ? "#070808" : "#fff"), fontWeight: 500, ...ss }}>
                  {payoutSaved ? (
                    <><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> Na-save!</>
                  ) : "I-save ang Payout Settings"}
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[13px] block" style={{ fontWeight: 600, color: theme.text, ...ss }}>Available para i-Withdraw</span>
                  <span className="text-[11px]" style={{ color: theme.textSec, ...ss }}>Walang minimum payout — anytime!</span>
                </div>
                <span className="text-[24px] text-[#00bf85]" style={{ fontWeight: 700, ...ss }}>₱{availableBalance.toLocaleString()}</span>
              </div>
              <button className="w-full h-11 rounded-lg bg-[#ff5222] text-white text-[14px] cursor-pointer hover:bg-[#e8491e] transition-colors" style={{ fontWeight: 600, ...ss }}>
                I-withdraw ang ₱{availableBalance.toLocaleString()} via {payoutMethod === "gcash" ? "GCash" : payoutMethod === "maya" ? "Maya" : "Bank Transfer"}
              </button>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>Payout History</span>
              </div>
              {MOCK_PAYOUTS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                  <div className="size-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.method === "GCash" ? "#eef4ff" : p.method === "Maya" ? "#e6fff3" : "#f3f0ff" }}>
                    <EmojiIcon emoji={p.method === "GCash" ? "📱" : p.method === "Maya" ? "💳" : "🏦"} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px]" style={{ fontWeight: 500, color: theme.text, ...ss }}>{p.method} Payout</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>{p.date}</span>
                      <span className="text-[10px]" style={{ color: theme.textFaint }}>·</span>
                      <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>{p.ref}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[13px]" style={{ fontWeight: 600, color: theme.text, ...ss }}>₱{p.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-[#00bf85]" style={{ fontWeight: 500, ...ss }}>Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center py-6">
          <span className="text-[10px]" style={{ color: theme.textMut, ...ss }}>PAGCOR Licensed — PredictEx Affiliate Program &copy; 2026</span>
        </div>
      </div>
    </div>
  );
}