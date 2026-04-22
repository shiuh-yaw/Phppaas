import { useOmsAuth } from "../../components/oms/oms-auth";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC } from "../../components/oms/oms-rbac";

const inter = { fontFamily: "'Inter', sans-serif" };

const PLATFORM_REVENUE = [
  { day: "Mon", revenue: 4200000, merchants: 6 },
  { day: "Tue", revenue: 4800000, merchants: 6 },
  { day: "Wed", revenue: 4500000, merchants: 6 },
  { day: "Thu", revenue: 5200000, merchants: 7 },
  { day: "Fri", revenue: 6100000, merchants: 7 },
  { day: "Sat", revenue: 8500000, merchants: 7 },
  { day: "Sun", revenue: 7800000, merchants: 7 },
];

const MERCHANT_PIE = [
  { name: "Lucky Taya", value: 38, color: "#ff5222" },
  { name: "Sugal PH", value: 28, color: "#ef4444" },
  { name: "BetManila", value: 16, color: "#f97316" },
  { name: "Tongits Live", value: 9, color: "#8b5cf6" },
  { name: "ColorBet Arena", value: 5, color: "#6366f1" },
  { name: "Others", value: 4, color: "#6b7280" },
];

export default function PlatformOverview() {
  const navigate = useNavigate();
  const { merchants, setActiveMerchant } = useOmsAuth();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
  const { t } = useI18n();
  const { hasPermission } = useTenantConfig();

  const merchantVolume = merchants.filter(m => m.status === "active").map(m => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + "..." : m.name,
    ggr: m.ggr / 1000000,
    users: m.users / 1000,
  })).sort((a, b) => b.ggr - a.ggr);

  const totalGGR = merchants.reduce((s, m) => s + m.ggr, 0);
  const totalUsers = merchants.reduce((s, m) => s + m.users, 0);
  const totalMarkets = merchants.reduce((s, m) => s + m.markets, 0);
  const activeMerchants = merchants.filter(m => m.status === "active").length;

  return (
    <div className="space-y-5" style={inter}>
      {/* Platform headline */}
      <div className="bg-gradient-to-r from-[#ff5222]/5 to-transparent border border-[#ff5222]/10 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#ff5222] rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div>
          <h2 className="text-white text-[18px]" style={{ fontWeight: 700 }}>PrediEx Platform Overview</h2>
          <p className="text-[#9ca3af] text-[12px]">Multi-tenant SaaS — {merchants.length} merchants, {activeMerchants} active</p>
        </div>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Platform GGR (MTD)", value: `₱${(totalGGR / 1000000).toFixed(0)}M`, change: "+18.2%", positive: true, accent: true },
          { label: "Total Platform Users", value: `${(totalUsers / 1000).toFixed(0)}K`, change: "+2,340 this week", positive: true },
          { label: "Active Merchants", value: `${activeMerchants}`, change: `of ${merchants.length} total`, positive: true },
          { label: "Total Markets", value: String(totalMarkets), change: "across all merchants", positive: true },
          { label: "Platform Uptime", value: "99.98%", change: "30-day average", positive: true },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.accent ? "bg-[#ff5222]/5 border-[#ff5222]/20" : "bg-[#111827] border-[#1f2937]"}`}>
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.accent ? "text-[#ff5222]" : "text-white"}`} style={{ fontWeight: 700 }}>{s.value}</p>
            <p className={`text-[10px] mt-0.5 ${s.positive ? "text-emerald-400" : "text-red-400"}`}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Platform Revenue</h3>
              <p className="text-[#6b7280] text-[11px]">Aggregate GGR across all merchants</p>
            </div>
            <div className="flex gap-1 bg-[#0a0e1a] rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`text-[10px] px-2.5 py-1 rounded-md cursor-pointer transition-colors ${period === p ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>{p.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <defs>
              <linearGradient id="platRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5222" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff5222" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PLATFORM_REVENUE}>
              <XAxis key="xaxis" dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(1)}M`} />
              <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000000).toFixed(2)}M`, "Revenue"]} />
              <Area key="area" type="monotone" dataKey="revenue" stroke="#ff5222" strokeWidth={2} fill="url(#platRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Revenue by Merchant</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={MERCHANT_PIE} innerRadius={35} outerRadius={60} dataKey="value" stroke="none" id="plat-pie">
                {MERCHANT_PIE.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {MERCHANT_PIE.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[#9ca3af] text-[10px] flex-1 truncate">{d.name}</span>
                <span className="text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merchant GGR comparison */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
        <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Merchant GGR Comparison (MTD)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={merchantVolume} id="plat-merch-bar">
            <XAxis key="xaxis" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v}M`} />
            <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${v.toFixed(1)}M`]} />
            <Bar key="bar" dataKey="ggr" fill="#ff5222" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Merchant quick list */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>All Merchants</h3>
          <button onClick={() => navigate("/oms/merchants")} className="text-[#ff5222] text-[12px] cursor-pointer hover:underline" style={{ fontWeight: 500 }}>Manage All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                <th className="py-2">Merchant</th>
                <th className="py-2">Status</th>
                <th className="py-2">Plan</th>
                <th className="py-2">GGR (MTD)</th>
                <th className="py-2">Users</th>
                <th className="py-2">Markets</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[9px] flex-shrink-0" style={{ fontWeight: 700 }}>{m.logo}</div>
                      <div>
                        <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{m.name}</p>
                        <p className="text-[#4b5563] text-[10px]">{m.primaryDomain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-emerald-500/15 text-emerald-400" : m.status === "onboarding" ? "bg-amber-500/15 text-amber-400" : m.status === "suspended" ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400"}`} style={{ fontWeight: 600 }}>{m.status.toUpperCase()}</span>
                  </td>
                  <td className="py-2.5 text-[#9ca3af]">{m.plan}</td>
                  <td className="py-2.5 text-white" style={{ fontWeight: 600 }}>₱{m.ggr > 0 ? (m.ggr / 1000000).toFixed(1) + "M" : "—"}</td>
                  <td className="py-2.5 text-[#9ca3af]">{m.users > 0 ? (m.users / 1000).toFixed(0) + "K" : "—"}</td>
                  <td className="py-2.5 text-[#9ca3af]">{m.markets || "—"}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => navigate(`/oms/merchants/${m.id}`)} className="text-[10px] text-[#9ca3af] px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Details</button>
                      {m.status === "active" && (
                        <button onClick={() => { setActiveMerchant(m); navigate("/oms/dashboard"); }} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Switch</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "API Response (avg)", value: "42ms", sub: "p99: 180ms" },
          { label: "Webhook Delivery", value: "99.7%", sub: "last 24h" },
          { label: "Database Load", value: "34%", sub: "Primary cluster" },
          { label: "Active Connections", value: "12.4K", sub: "WebSocket + HTTP" },
        ].map(m => (
          <div key={m.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px] mb-0.5" style={{ fontWeight: 500 }}>{m.label}</p>
            <p className="text-white text-[18px]" style={{ fontWeight: 700 }}>{m.value}</p>
            <p className="text-[#4b5563] text-[10px] mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}