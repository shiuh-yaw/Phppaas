import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "../../components/oms/oms-i18n";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { logAudit } from "../../components/oms/oms-audit-log";
import { showOmsToast } from "../../components/oms/oms-modal";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

const GGR_MONTHLY = [
  { month: "Oct", ggr: 52000000 },
  { month: "Nov", ggr: 58000000 },
  { month: "Dec", ggr: 72000000 },
  { month: "Jan", ggr: 64000000 },
  { month: "Feb", ggr: 68000000 },
  { month: "Mar", ggr: 78400000 },
];

const USER_GROWTH = [
  { month: "Oct", users: 320000, active: 180000 },
  { month: "Nov", users: 360000, active: 210000 },
  { month: "Dec", users: 410000, active: 240000 },
  { month: "Jan", users: 435000, active: 255000 },
  { month: "Feb", users: 462000, active: 270000 },
  { month: "Mar", users: 485230, active: 285000 },
];

const CATEGORY_REVENUE = [
  { name: "Basketball", revenue: 28500000, bets: 89000, avgBet: 320 },
  { name: "Color Game", revenue: 18200000, bets: 124000, avgBet: 147 },
  { name: "Boxing", revenue: 12400000, bets: 34000, avgBet: 365 },
  { name: "Esports", revenue: 9800000, bets: 67000, avgBet: 146 },
  { name: "Lottery", revenue: 5600000, bets: 45000, avgBet: 124 },
  { name: "Showbiz", revenue: 3200000, bets: 23000, avgBet: 139 },
  { name: "Weather", revenue: 1800000, bets: 12000, avgBet: 150 },
  { name: "Economy", revenue: 2100000, bets: 8000, avgBet: 263 },
  { name: "Bingo", revenue: 1200000, bets: 18000, avgBet: 67 },
];

const PAGCOR_METRICS = [
  { label: "Gross Gaming Revenue (GGR)", value: "₱78.4M", period: "MTD March 2026" },
  { label: "PAGCOR License Fee", value: "₱3.92M", period: "5% of GGR" },
  { label: "Regulatory Reserve", value: "₱7.84M", period: "10% of GGR" },
  { label: "Player Protection Fund", value: "₱784K", period: "1% of GGR" },
  { label: "Tax Obligation", value: "₱15.68M", period: "20% Gaming Tax" },
  { label: "Net Revenue (After Compliance)", value: "₱50.2M", period: "64% of GGR" },
];

export default function OmsReports() {
  const [reportType, setReportType] = useState<"revenue" | "users" | "categories" | "compliance">("revenue");

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const rbac = useRBAC();

  const handleExportCSV = () => {
    if (!rbac.can("export_data")) { showOmsToast("Permission denied", "error"); return; }
    if (reportType === "revenue") {
      downloadCSV("ggr_report", [
        { key: "month", label: "Month" },
        { key: "ggr", label: "GGR (PHP)", format: (v: number) => v.toLocaleString() },
      ], GGR_MONTHLY);
    } else if (reportType === "users") {
      downloadCSV("user_growth_report", [
        { key: "month", label: "Month" },
        { key: "users", label: "Total Users", format: (v: number) => v.toLocaleString() },
        { key: "active", label: "Active Users", format: (v: number) => v.toLocaleString() },
      ], USER_GROWTH);
    } else if (reportType === "categories") {
      downloadCSV("category_revenue_report", [
        { key: "name", label: "Category" },
        { key: "revenue", label: "Revenue (PHP)", format: (v: number) => v.toLocaleString() },
        { key: "bets", label: "Total Bets", format: (v: number) => v.toLocaleString() },
        { key: "avgBet", label: "Avg Bet (PHP)", format: (v: number) => v.toLocaleString() },
      ], CATEGORY_REVENUE);
    } else {
      downloadCSV("pagcor_compliance", [
        { key: "label", label: "Metric" },
        { key: "value", label: "Value" },
        { key: "period", label: "Period/Note" },
      ], PAGCOR_METRICS);
    }
    if (admin) logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "export_data", target: `${reportType}_report`, detail: `Exported ${reportType} report as CSV` });
    showOmsToast("Report exported successfully", "success");
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Report type tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit overflow-x-auto">
        {(["revenue", "users", "categories", "compliance"] as const).map(t => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors whitespace-nowrap ${reportType === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`}
            style={{ fontWeight: 600 }}
          >
            {t === "revenue" ? "Revenue" : t === "users" ? "User Growth" : t === "categories" ? "By Category" : "PAGCOR Compliance"}
          </button>
        ))}
      </div>

      {reportType === "revenue" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "GGR (MTD)", value: "₱78.4M", change: "+18.2%", positive: true },
              { label: "Total Bets Volume", value: "₱412M", change: "+22.1%", positive: true },
              { label: "House Edge", value: "4.8%", change: "+0.3%", positive: true },
              { label: "Payout Ratio", value: "95.2%", change: "-0.3%", positive: true },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
                <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
                <p className="text-white text-[20px]" style={{ fontWeight: 700 }}>{s.value}</p>
                <span className={`text-[10px] ${s.positive ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 600 }}>{s.change} vs last month</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>Monthly GGR Trend (6 Months)</h3>
            <svg width={0} height={0} style={{ position: "absolute" }}>
              <defs>
                <linearGradient id="ggrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5222" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff5222" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={GGR_MONTHLY}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000000).toFixed(1)}M`, "GGR"]} />
                <Area type="monotone" dataKey="ggr" stroke="#ff5222" strokeWidth={2} fill="url(#ggrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {reportType === "users" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Registered", value: "485,230", change: "+5,230 this month" },
              { label: "Monthly Active Users", value: "285,000", change: "58.7% MAU rate" },
              { label: "Daily Active Users", value: "42,000", change: "8.7% DAU rate" },
              { label: "Avg Session Duration", value: "18 min", change: "+2 min vs last month" },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
                <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
                <p className="text-white text-[20px]" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-[#4b5563] text-[10px] mt-0.5">{s.change}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>User Growth (6 Months)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={USER_GROWTH}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [v.toLocaleString()]} />
                <Line type="monotone" dataKey="users" stroke="#ff5222" strokeWidth={2} dot={{ r: 4, fill: "#ff5222" }} name="Total Users" />
                <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {reportType === "categories" && (
        <>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORY_REVENUE} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000000).toFixed(1)}M`]} />
                <Bar dataKey="revenue" fill="#ff5222" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Category", "Revenue", "Total Bets", "Avg Bet Size", "Share"].map(h => (
                    <th key={h} className="text-[#6b7280] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORY_REVENUE.map(c => {
                  const totalRev = CATEGORY_REVENUE.reduce((s, r) => s + r.revenue, 0);
                  const share = ((c.revenue / totalRev) * 100).toFixed(1);
                  return (
                    <tr key={c.name} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                      <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 500 }}>{c.name}</td>
                      <td className="px-4 py-2.5 text-[#ff5222] text-[12px]" style={{ fontWeight: 600 }}>₱{(c.revenue / 1000000).toFixed(1)}M</td>
                      <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]">{c.bets.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600 }}>₱{c.avgBet}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#ff5222]" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {reportType === "compliance" && (
        <>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5222]/10 rounded-xl flex items-center justify-center">
                <svg className="size-5 text-[#ff5222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>PAGCOR Compliance Report</h3>
                <p className="text-[#6b7280] text-[11px]">March 2026 — MTD as of March 13</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PAGCOR_METRICS.map(m => (
                <div key={m.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-xl p-3">
                  <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>{m.label}</p>
                  <p className="text-white text-[20px]" style={{ fontWeight: 700 }}>{m.value}</p>
                  <p className="text-[#4b5563] text-[10px] mt-0.5">{m.period}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Compliance Checklist</h3>
            <div className="space-y-2">
              {[
                { item: "PAGCOR License Active & Valid", status: "pass", detail: "License #OGC-2025-0847 valid until Dec 2027" },
                { item: "KYC Compliance Rate", status: "pass", detail: "64.3% verified — above 60% minimum threshold" },
                { item: "Anti-Money Laundering (AML) Checks", status: "pass", detail: "All ₱50K+ transactions flagged and reviewed" },
                { item: "Responsible Gaming Controls", status: "pass", detail: "Self-exclusion, deposit limits, and cool-off periods active" },
                { item: "Data Privacy Act Compliance", status: "pass", detail: "NPC Registration active, DPO appointed" },
                { item: "Monthly GGR Report Filed", status: "warning", detail: "Due March 31 — not yet filed for March" },
                { item: "Player Protection Fund Deposit", status: "pass", detail: "₱784K deposited for March" },
              ].map((c, i) => (
                <div key={i} className={`p-3 rounded-lg border ${c.status === "pass" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                  <div className="flex items-start gap-2.5">
                    {c.status === "pass" ? (
                      <svg className="size-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M6 8l1.5 1.5 3-3" /></svg>
                    ) : (
                      <svg className="size-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M8 5.5v3" /><circle cx="8" cy="10.5" r="0.5" fill="currentColor" stroke="none" /></svg>
                    )}
                    <div>
                      <p className={`text-[12px] ${c.status === "pass" ? "text-emerald-400" : "text-amber-400"}`} style={{ fontWeight: 600 }}>{c.item}</p>
                      <p className="text-[#6b7280] text-[11px] mt-0.5">{c.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="h-9 px-5 bg-[#ff5222] text-white text-[12px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors" style={{ fontWeight: 600 }}>
              Generate PAGCOR Report
            </button>
            <button onClick={handleExportCSV} className="h-9 px-5 bg-[#1f2937] text-[#9ca3af] text-[12px] rounded-lg cursor-pointer hover:bg-[#374151] transition-colors" style={{ fontWeight: 600 }}>
              {t("common.export_csv", "Export CSV")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}