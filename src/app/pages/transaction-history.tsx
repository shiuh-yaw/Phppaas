import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { AuthGate } from "../components/auth-gate";
import { EmojiIcon } from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

type TxType = "deposit" | "withdrawal" | "bet" | "win" | "bonus" | "referral";
type TxStatus = "completed" | "pending" | "failed" | "processing";

interface Transaction {
  id: string; type: TxType; amount: number; status: TxStatus;
  method: string; date: string; description: string;
}

const MOCK_TXS: Transaction[] = [
  { id: "TX001", type: "deposit", amount: 5000, status: "completed", method: "GCash", date: "2026-03-16 14:30", description: "Deposit via GCash" },
  { id: "TX002", type: "bet", amount: -1000, status: "completed", method: "", date: "2026-03-16 15:00", description: "Bet: PBA Finals Game 5 — Ginebra Win" },
  { id: "TX003", type: "win", amount: 2400, status: "completed", method: "", date: "2026-03-16 18:00", description: "Win: PBA Finals Game 5 (2.4x odds)" },
  { id: "TX004", type: "withdrawal", amount: -3000, status: "pending", method: "Maya", date: "2026-03-15 10:00", description: "Withdrawal to Maya" },
  { id: "TX005", type: "bonus", amount: 300, status: "completed", method: "", date: "2026-03-14 09:00", description: "Welcome Bonus claimed" },
  { id: "TX006", type: "deposit", amount: 2000, status: "completed", method: "Dragonpay", date: "2026-03-13 11:30", description: "Deposit via Dragonpay bank transfer" },
  { id: "TX007", type: "bet", amount: -500, status: "completed", method: "", date: "2026-03-13 13:00", description: "Bet: PCSO 6/58 Lotto Draw" },
  { id: "TX008", type: "referral", amount: 100, status: "completed", method: "", date: "2026-03-12 08:00", description: "Referral bonus: @maria_santos signed up" },
  { id: "TX009", type: "bet", amount: -2000, status: "completed", method: "", date: "2026-03-12 14:00", description: "Bet: Pacquiao vs Crawford — Pacquiao Win" },
  { id: "TX010", type: "withdrawal", amount: -5000, status: "completed", method: "GCash", date: "2026-03-11 16:00", description: "Withdrawal to GCash" },
  { id: "TX011", type: "deposit", amount: 10000, status: "completed", method: "PayMongo", date: "2026-03-10 12:00", description: "Deposit via PayMongo" },
  { id: "TX012", type: "withdrawal", amount: -1500, status: "failed", method: "Maya", date: "2026-03-10 09:00", description: "Withdrawal failed — insufficient KYC level" },
];

const TYPE_META: Record<TxType, { label: string; emoji: string; color: string; bg: string }> = {
  deposit: { label: "Deposit", emoji: "💰", color: "#00bf85", bg: "#e6fff3" },
  withdrawal: { label: "Withdraw", emoji: "🏦", color: "#ff5222", bg: "#fff4ed" },
  bet: { label: "Bet", emoji: "🎯", color: "#3b82f6", bg: "#eef4ff" },
  win: { label: "Win", emoji: "🏆", color: "#00bf85", bg: "#e6fff3" },
  bonus: { label: "Bonus", emoji: "🎁", color: "#8b5cf6", bg: "#f3f0ff" },
  referral: { label: "Referral", emoji: "🤝", color: "#d97706", bg: "#fffbeb" },
};

const STATUS_STYLE: Record<TxStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-600",
};

export default function TransactionHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_TXS.filter(tx =>
    (filter === "all" || tx.type === filter) &&
    (!search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-white">
          <AuthGate pageName="Transaction History">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[22px] text-[#070808]" style={{ fontWeight: 700, ...ss }}>Transaction History</h1>
                <p className="text-[13px] text-[#84888c] mt-0.5" style={ss}>{filtered.length} na transaksyon</p>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Maghanap ng transaction..."
                  className="w-full h-10 px-4 pl-10 rounded-xl border border-[#f0f1f3] bg-[#fafafa] text-[13px] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all"
                  style={ss} />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#b0b3b8]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M18 18l-4-4" strokeLinecap="round" /></svg>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {([{ key: "all" as const, label: "Lahat" }, ...Object.entries(TYPE_META).map(([key, v]) => ({ key: key as TxType, label: v.label }))] as { key: "all" | TxType; label: string }[]).map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className="shrink-0 h-8 px-3 rounded-full text-[11px] cursor-pointer transition-all"
                    style={{ background: filter === f.key ? "#070808" : "#f5f6f7", color: filter === f.key ? "#fff" : "#84888c", fontWeight: 500, ...ss }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction list */}
            <div className="border border-[#f0f1f3] rounded-2xl overflow-hidden">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-2">
                  <EmojiIcon emoji="📭" size={32} />
                  <p className="text-[13px] text-[#84888c]" style={ss}>Walang nahanap na transaksyon.</p>
                </div>
              ) : filtered.map(tx => {
                const meta = TYPE_META[tx.type];
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f9fafb] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                      <EmojiIcon emoji={meta.emoji} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#070808] truncate" style={{ fontWeight: 500, ...ss }}>{tx.description}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[tx.status]}`} style={{ fontWeight: 600 }}>{tx.status}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#b0b3b8]" style={ss}>{tx.id}</span>
                        <span className="text-[10px] text-[#b0b3b8]" style={ss}>{tx.date}</span>
                        {tx.method && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f6f7] text-[#84888c]" style={{ fontWeight: 500, ...ss }}>{tx.method}</span>}
                      </div>
                    </div>
                    <span className={`text-[14px] shrink-0 ${tx.amount >= 0 ? "text-[#00bf85]" : "text-[#ff5222]"}`} style={{ fontWeight: 600, ...ss }}>
                      {tx.amount >= 0 ? "+" : ""}₱{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          </AuthGate>
          <Footer />
        </div>
      </div>
    </div>
  );
}
