import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== MERCHANT-SPECIFIC MOCK DATA ==================== */
// Each merchant gets different numbers derived from their profile
function getMerchantData(merchantId: string | null, merchants: any[]) {
  const m = merchantId ? merchants.find(x => x.id === merchantId) : null;

  // Seed multiplier based on merchant — gives different but consistent data per merchant
  const seed = m ? parseInt(m.id.replace("MCH", ""), 10) : 0;
  const ggrFactor = m ? m.ggr / 78400000 : 1; // Normalize to Lucky Taya's scale
  const userFactor = m ? m.users / 485230 : 1;

  const baseRevenue = [285000, 310000, 295000, 340000, 380000, 520000, 490000];
  const revenue = baseRevenue.map((v, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    revenue: Math.round(v * ggrFactor * (1 + (seed * 0.03 * ((i % 3) - 1)))),
    bets: Math.round((12400 + i * 1400) * userFactor),
  }));

  const todayRev = Math.round(2620000 * ggrFactor);
  const activeUsers = Math.round(8432 * userFactor);
  const totalBets = Math.round(24180 * userFactor);
  const pendingWith = Math.round(1850000 * ggrFactor * 0.7);
  const ggrMtd = m ? m.ggr : 78400000;
  const registered = m ? m.users : 485230;
  const kycRate = 55 + seed * 3;
  const avgBet = 1500 + seed * 180;

  // Category distribution varies by merchant
  const categories = m ? [
    { name: "Basketball", value: 35 - seed * 2, color: "#ff5222" },
    { name: "Color Game", value: 22 + seed, color: "#ef4444" },
    { name: "Boxing", value: 15 + (seed % 3), color: "#f97316" },
    { name: "Esports", value: 12 + (seed % 4), color: "#8b5cf6" },
    { name: "Lottery", value: 8, color: "#6366f1" },
    { name: "Others", value: 8 - (seed % 3), color: "#6b7280" },
  ] : [
    { name: "Basketball", value: 35, color: "#ff5222" },
    { name: "Color Game", value: 22, color: "#ef4444" },
    { name: "Boxing", value: 15, color: "#f97316" },
    { name: "Esports", value: 12, color: "#8b5cf6" },
    { name: "Lottery", value: 8, color: "#6366f1" },
    { name: "Others", value: 8, color: "#6b7280" },
  ];

  return { revenue, todayRev, activeUsers, totalBets, pendingWith, ggrMtd, registered, kycRate, avgBet, categories };
}

const HOURLY_SEED = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  base: Math.floor(Math.random() * 3000 + (i >= 8 && i <= 22 ? 4000 : 500)),
}));

const RECENT_ACTIVITY = [
  { id: "ACT001", type: "bet", user: "Maria Santos", detail: "Placed bet ₱5,000 on PBA Finals — Ginebra", time: "2 min ago", status: "confirmed" },
  { id: "ACT002", type: "withdrawal", user: "JM Reyes", detail: "GCash withdrawal ₱12,500", time: "5 min ago", status: "processing" },
  { id: "ACT003", type: "deposit", user: "Ana Dela Cruz", detail: "Maya deposit ₱20,000", time: "8 min ago", status: "completed" },
  { id: "ACT004", type: "market", user: "System", detail: "Market resolved: PCSO 6/58 Mega Lotto", time: "12 min ago", status: "resolved" },
  { id: "ACT005", type: "kyc", user: "Ken Villanueva", detail: "KYC verification submitted", time: "15 min ago", status: "pending" },
  { id: "ACT006", type: "bet", user: "Rosa Lim", detail: "Fast Bet ₱1,000 on Color Game Round #8833", time: "18 min ago", status: "confirmed" },
  { id: "ACT007", type: "alert", user: "System", detail: "Suspicious activity detected: IP 203.177.xx.xx multiple accounts", time: "22 min ago", status: "flagged" },
  { id: "ACT008", type: "withdrawal", user: "Mark Tan", detail: "GCash withdrawal ₱45,000 — requires review", time: "25 min ago", status: "review" },
];

const ALERTS = [
  { severity: "critical", message: "3 pending large withdrawals (>₱50K) require approval", time: "5 min ago" },
  { severity: "warning", message: "12 new KYC verifications awaiting review", time: "30 min ago" },
  { severity: "info", message: "Scheduled maintenance window in 18 hours", time: "1 hr ago" },
  { severity: "warning", message: "Color Game Round #8830 has unusual betting pattern", time: "2 hr ago" },
];

function StatCard({ label, value, change, positive, sub, accent }: { label: string; value: string; change: string; positive: boolean; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? "bg-[#fff4ed] border-[#ff5222]/15" : "bg-white border-[#f0f1f3]"}`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
      <p className="text-[#b0b3b8] text-[11px] mb-1" style={{ fontWeight: 500, ...pp, ...ss04 }}>{label}</p>
      <p className={`text-[22px] ${accent ? "text-[#ff5222]" : "text-[#070808]"}`} style={{ fontWeight: 700, ...pp, ...ss04 }}>{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[11px] ${positive ? "text-emerald-500" : "text-red-500"}`} style={{ fontWeight: 600, ...ss04 }}>
          {positive ? "+" : ""}{change}
        </span>
        {sub && <span className="text-[#b0b3b8] text-[10px]" style={ss04}>{sub}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-500",
    completed: "bg-emerald-50 text-emerald-500",
    resolved: "bg-blue-50 text-blue-500",
    processing: "bg-amber-50 text-amber-500",
    pending: "bg-amber-50 text-amber-500",
    review: "bg-orange-50 text-orange-500",
    flagged: "bg-red-50 text-red-500",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 600, ...pp, ...ss04 }}>
      {status.toUpperCase()}
    </span>
  );
}

function TypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { bet: "#ff5222", withdrawal: "#ef4444", deposit: "#10b981", market: "#3b82f6", kyc: "#8b5cf6", alert: "#ef4444" };
  const c = colors[type] || "#6b7280";
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${c}15` }}>
      {type === "bet" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2" /><circle cx="5.5" cy="5.5" r="1" fill={c} stroke="none" /><circle cx="10.5" cy="10.5" r="1" fill={c} stroke="none" /></svg>}
      {type === "withdrawal" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M5 10l3 3 3-3" /></svg>}
      {type === "deposit" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M8 13V3M5 6l3-3 3 3" /></svg>}
      {type === "market" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M2 13l4-5 3 3 5-6" /></svg>}
      {type === "kyc" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3" /><path d="M3 14v-1a5 5 0 0110 0v1" /></svg>}
      {type === "alert" && <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L2 13h12L8 2zM8 6v3" /><circle cx="8" cy="11" r="0.5" fill={c} stroke="none" /></svg>}
    </div>
  );
}

export default function OmsDashboard() {
  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);
  const { activeMerchant, merchants } = useOmsAuth();
  const { t } = useI18n();

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 500); return () => clearTimeout(timer); }, []);

  const data = useMemo(() => getMerchantData(activeMerchant?.id || null, merchants), [activeMerchant?.id, merchants]);
  const userFactor = activeMerchant ? activeMerchant.users / 485230 : 1;
  const hourly = useMemo(() => HOURLY_SEED.map(h => ({ ...h, users: Math.round(h.base * userFactor) })), [userFactor]);

  return loading ? (
    <div className="space-y-4" style={pp}><OmsTableSkeleton rows={4} cols={4} /></div>
  ) : (
    <div className="space-y-5" style={pp}>
      {/* Top stats — merchant-aware values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={t("dashboard.revenue_today")} value={`₱${(data.todayRev / 1000000).toFixed(2)}M`} change="12.5%" positive sub="vs yesterday" accent />
        <StatCard label={t("dashboard.active_users")} value={data.activeUsers.toLocaleString()} change="8.2%" positive sub="online now" />
        <StatCard label={t("dashboard.total_bets")} value={data.totalBets.toLocaleString()} change="15.3%" positive sub={`₱${(data.totalBets * 1994 / 1000000).toFixed(1)}M volume`} />
        <StatCard label={t("dashboard.pending_withdrawals")} value={`₱${(data.pendingWith / 1000000).toFixed(2)}M`} change={`${Math.round(data.pendingWith / 80000)} requests`} positive={false} sub="needs review" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border border-[#f0f1f3] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>Revenue Overview</h3>
              <p className="text-[#b0b3b8] text-[11px]" style={ss04}>
                {activeMerchant ? `${activeMerchant.name} — Gross Gaming Revenue` : "Aggregated GGR across all merchants"}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#f5f6f8] rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`text-[10px] px-2.5 py-1 rounded-md cursor-pointer transition-colors ${chartPeriod === p ? "bg-[#ff5222] text-white" : "text-[#84888c] hover:text-[#070808]"}`}
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <defs>
              <linearGradient id="omsRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5222" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ff5222" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenue}>
              <XAxis key="xaxis" dataKey="day" tick={{ fontSize: 10, fill: "#b0b3b8" }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 10, fill: "#b0b3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                key="tooltip"
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`₱${v.toLocaleString()}`, "Revenue"]}
              />
              <Area key="area" type="monotone" dataKey="revenue" stroke="#ff5222" strokeWidth={2} fill="url(#omsRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-white border border-[#f0f1f3] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <h3 className="text-[#070808] text-[14px] mb-3" style={{ fontWeight: 600, ...ss04 }}>Betting by Category</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={data.categories} innerRadius={35} outerRadius={60} dataKey="value" stroke="none" id="dash-cat-pie">
                {data.categories.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {data.categories.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[#84888c] text-[10px] truncate" style={ss04}>{d.name}</span>
                <span className="text-[#b0b3b8] text-[10px] ml-auto" style={{ fontWeight: 600, ...ss04 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + Hourly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Alerts */}
        <div className="bg-white border border-[#f0f1f3] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <h3 className="text-[#070808] text-[14px] mb-3" style={{ fontWeight: 600, ...ss04 }}>System Alerts</h3>
          <div className="space-y-2">
            {ALERTS.map((a, i) => {
              const sevColors: Record<string, { bg: string; dot: string; text: string }> = {
                critical: { bg: "bg-red-50 border-red-200", dot: "bg-red-400", text: "text-red-500" },
                warning: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400", text: "text-amber-600" },
                info: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-400", text: "text-blue-600" },
              };
              const c = sevColors[a.severity] || sevColors.info;
              return (
                <div key={i} className={`p-2.5 rounded-xl border ${c.bg}`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                    <div>
                      <p className="text-[#555] text-[11px] leading-[1.5]" style={ss04}>{a.message}</p>
                      <p className="text-[#b0b3b8] text-[9px] mt-0.5" style={ss04}>{a.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly active users */}
        <div className="lg:col-span-2 bg-white border border-[#f0f1f3] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <h3 className="text-[#070808] text-[14px] mb-3" style={{ fontWeight: 600, ...ss04 }}>
            Active Users (24h){activeMerchant ? ` — ${activeMerchant.name}` : ""}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourly} id="dash-hourly-bar">
              <XAxis key="xaxis" dataKey="hour" tick={{ fontSize: 9, fill: "#b0b3b8" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis key="yaxis" tick={{ fontSize: 9, fill: "#b0b3b8" }} axisLine={false} tickLine={false} />
              <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [v.toLocaleString(), "Users"]} />
              <Bar key="bar" dataKey="users" fill="#ff5222" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-[#f0f1f3] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>Recent Activity</h3>
          <span className="text-[#b0b3b8] text-[11px] cursor-pointer hover:text-[#070808] transition-colors" style={ss04}>View All</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#f0f1f3]">
                {["Type", "User", "Detail", "Time", "Status"].map(h => (
                  <th key={h} className="text-[#b0b3b8] text-[10px] pb-2 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map(a => (
                <tr key={a.id} className="border-b border-[#f0f1f3]/50 hover:bg-[#f9f9fa] transition-colors">
                  <td className="py-2.5"><TypeIcon type={a.type} /></td>
                  <td className="py-2.5 text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{a.user}</td>
                  <td className="py-2.5 text-[#84888c] text-[12px] max-w-[300px] truncate" style={ss04}>{a.detail}</td>
                  <td className="py-2.5 text-[#b0b3b8] text-[11px]" style={ss04}>{a.time}</td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Merchant metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: activeMerchant ? `${activeMerchant.name} GGR (MTD)` : "Platform GGR (MTD)", value: `₱${(data.ggrMtd / 1000000).toFixed(1)}M`, sub: "+18.2% vs last month" },
          { label: "Total Registered", value: data.registered > 999999 ? `${(data.registered / 1000000).toFixed(1)}M` : `${(data.registered / 1000).toFixed(0)}K`, sub: "+2,340 this week" },
          { label: "KYC Verified", value: `${data.kycRate}%`, sub: "verification rate" },
          { label: "Avg Bet Size", value: `₱${data.avgBet.toLocaleString()}`, sub: "+₱120 vs last week" },
        ].map(m => (
          <div key={m.label} className="bg-white border border-[#f0f1f3] rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <p className="text-[#b0b3b8] text-[10px] mb-0.5" style={{ fontWeight: 500, ...ss04 }}>{m.label}</p>
            <p className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>{m.value}</p>
            <p className="text-[#b0b3b8] text-[10px] mt-0.5" style={ss04}>{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}