import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type RiskLevel = "critical" | "high" | "medium" | "low";

interface MarketExposure {
  id: string;
  market: string;
  category: string;
  totalVolume: number;
  maxPayout: number;
  netExposure: number;
  riskLevel: RiskLevel;
  sideA: { label: string; volume: number; pct: number };
  sideB: { label: string; volume: number; pct: number };
  bettorCount: number;
  largestBet: number;
}

interface RiskAlert {
  id: string;
  type: "exposure" | "pattern" | "limit" | "aml" | "velocity";
  severity: RiskLevel;
  message: string;
  market?: string;
  user?: string;
  amount?: number;
  time: string;
  status: "active" | "investigating" | "resolved" | "dismissed";
}

const EXPOSURE_DATA: MarketExposure[] = [
  { id: "MKT001", market: "PBA Finals — Ginebra vs SMB", category: "Basketball", totalVolume: 8500000, maxPayout: 12200000, netExposure: 3700000, riskLevel: "critical", sideA: { label: "Ginebra", volume: 6200000, pct: 72.9 }, sideB: { label: "SMB", volume: 2300000, pct: 27.1 }, bettorCount: 3420, largestBet: 500000 },
  { id: "MKT002", market: "Pacquiao vs Crawford — Winner", category: "Boxing", totalVolume: 5200000, maxPayout: 7800000, netExposure: 2600000, riskLevel: "high", sideA: { label: "Pacquiao", volume: 3800000, pct: 73.1 }, sideB: { label: "Crawford", volume: 1400000, pct: 26.9 }, bettorCount: 2100, largestBet: 250000 },
  { id: "MKT003", market: "Color Game Round #8901", category: "Color Game", totalVolume: 1800000, maxPayout: 5400000, netExposure: 3600000, riskLevel: "critical", sideA: { label: "Red/Blue", volume: 1200000, pct: 66.7 }, sideB: { label: "Others", volume: 600000, pct: 33.3 }, bettorCount: 890, largestBet: 50000 },
  { id: "MKT004", market: "NBA Finals — Celtics vs Lakers", category: "Basketball", totalVolume: 3200000, maxPayout: 4600000, netExposure: 1400000, riskLevel: "medium", sideA: { label: "Celtics", volume: 1800000, pct: 56.3 }, sideB: { label: "Lakers", volume: 1400000, pct: 43.7 }, bettorCount: 1560, largestBet: 100000 },
  { id: "MKT005", market: "T1 vs GenG — MSI Grand Final", category: "Esports", totalVolume: 980000, maxPayout: 1400000, netExposure: 420000, riskLevel: "low", sideA: { label: "T1", volume: 520000, pct: 53.1 }, sideB: { label: "GenG", volume: 460000, pct: 46.9 }, bettorCount: 670, largestBet: 25000 },
  { id: "MKT006", market: "PCSO 6/58 Mega Lotto Draw", category: "Lottery", totalVolume: 2100000, maxPayout: 8400000, netExposure: 6300000, riskLevel: "critical", sideA: { label: "Hot Numbers", volume: 1400000, pct: 66.7 }, sideB: { label: "Cold Numbers", volume: 700000, pct: 33.3 }, bettorCount: 4200, largestBet: 10000 },
  { id: "MKT007", market: "Miss Universe PH Winner 2026", category: "Showbiz", totalVolume: 640000, maxPayout: 900000, netExposure: 260000, riskLevel: "low", sideA: { label: "Top 3 Faves", volume: 380000, pct: 59.4 }, sideB: { label: "Others", volume: 260000, pct: 40.6 }, bettorCount: 340, largestBet: 15000 },
  { id: "MKT008", market: "Typhoon Signal #5 before April?", category: "Weather", totalVolume: 420000, maxPayout: 840000, netExposure: 420000, riskLevel: "medium", sideA: { label: "Yes", volume: 280000, pct: 66.7 }, sideB: { label: "No", volume: 140000, pct: 33.3 }, bettorCount: 210, largestBet: 20000 },
];

const RISK_ALERTS: RiskAlert[] = [
  { id: "RA001", type: "exposure", severity: "critical", message: "PBA Finals net exposure exceeds ₱3.5M threshold — 72.9% one-sided", market: "PBA Finals", time: "3 min ago", status: "active" },
  { id: "RA002", type: "aml", severity: "critical", message: "Mark Tan deposited ₱500K across 3 GCash accounts in 2 hours", user: "Mark Tan (U006)", amount: 500000, time: "12 min ago", status: "investigating" },
  { id: "RA003", type: "pattern", severity: "high", message: "12 accounts from same IP placing identical bets on Color Game", market: "Color Game #8901", time: "25 min ago", status: "active" },
  { id: "RA004", type: "velocity", severity: "high", message: "Rosa Lim placed 45 bets in 10 minutes — velocity trigger", user: "Rosa Lim (U005)", time: "38 min ago", status: "investigating" },
  { id: "RA005", type: "limit", severity: "medium", message: "Daily aggregate exposure approaching ₱25M PAGCOR limit (₱22.8M current)", time: "1 hr ago", status: "active" },
  { id: "RA006", type: "aml", severity: "high", message: "Structuring detected: 8 deposits of ₱49,900 from Bong Ramos (just under ₱50K threshold)", user: "Bong Ramos (U008)", amount: 399200, time: "2 hr ago", status: "active" },
  { id: "RA007", type: "exposure", severity: "medium", message: "Lottery market 3x payout ratio — house exposure at ₱6.3M", market: "PCSO 6/58", time: "3 hr ago", status: "investigating" },
  { id: "RA008", type: "pattern", severity: "low", message: "Unusual win streak: Cherry Aquino won 14 consecutive Color Game rounds", user: "Cherry Aquino (U009)", time: "5 hr ago", status: "resolved" },
];

const HOURLY_EXPOSURE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  exposure: Math.floor(Math.random() * 5000000 + (i >= 10 && i <= 22 ? 8000000 : 2000000)),
  threshold: 25000000,
}));

const CATEGORY_RISK = [
  { name: "Basketball", exposure: 11700000, pct: 38 },
  { name: "Color Game", exposure: 5400000, pct: 18 },
  { name: "Lottery", exposure: 6300000, pct: 21 },
  { name: "Boxing", exposure: 2600000, pct: 8 },
  { name: "Esports", exposure: 1820000, pct: 6 },
  { name: "Others", exposure: 2780000, pct: 9 },
];

function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    critical: "bg-red-500/15 text-red-400",
    high: "bg-orange-500/15 text-orange-400",
    medium: "bg-amber-500/15 text-amber-400",
    low: "bg-emerald-500/15 text-emerald-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[level]}`} style={{ fontWeight: 600 }}>{level.toUpperCase()}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-red-500/15 text-red-400",
    investigating: "bg-amber-500/15 text-amber-400",
    resolved: "bg-emerald-500/15 text-emerald-400",
    dismissed: "bg-gray-500/15 text-gray-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || map.active}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsRisk() {
  const [tab, setTab] = useState<"exposure" | "alerts" | "realtime">("exposure");
  const [alerts, setAlerts] = useState(RISK_ALERTS);
  const [modalType, setModalType] = useState<"detail" | "investigate" | "hedge" | "resolve" | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketExposure | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [hedgeAmount, setHedgeAmount] = useState("");
  const [hedgeSide, setHedgeSide] = useState("sideB");
  const [filterSeverity, setFilterSeverity] = useState<RiskLevel | "all">("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const role = admin?.role || "merchant_ops";
  const rbac = useRBAC();

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 600); return () => clearTimeout(timer); }, []);

  const doAudit = (action: "risk_investigate" | "risk_resolve" | "risk_dismiss" | "risk_hedge", target: string, detail?: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action, target, detail });
  };

  const totalExposure = EXPOSURE_DATA.reduce((s, m) => s + m.netExposure, 0);
  const criticalCount = alerts.filter(a => a.severity === "critical" && a.status === "active").length;
  const activeAlerts = alerts.filter(a => a.status === "active" || a.status === "investigating").length;

  const filteredAlerts = alerts.filter(a => filterSeverity === "all" || a.severity === filterSeverity);

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("risk.exposure", "Total Net Exposure"), value: `₱${(totalExposure / 1000000).toFixed(1)}M`, color: "text-red-400" },
          { label: "PAGCOR Limit", value: "₱25M", color: "text-[#ff5222]" },
          { label: "Utilization", value: `${((totalExposure / 25000000) * 100).toFixed(1)}%`, color: totalExposure > 20000000 ? "text-red-400" : "text-amber-400" },
          { label: "Critical Alerts", value: String(criticalCount), color: criticalCount > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Active Alerts", value: String(activeAlerts), color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit">
        {(["exposure", "alerts", "realtime"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "exposure" ? "Market Exposure" : t === "alerts" ? `Risk Alerts (${activeAlerts})` : "Real-Time Monitor"}
          </button>
        ))}
      </div>

      {/* Exposure Tab */}
      {tab === "exposure" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-3 py-3">Volume</th>
                  <th className="px-3 py-3">Max Payout</th>
                  <th className="px-3 py-3">Net Exposure</th>
                  <th className="px-3 py-3">Balance</th>
                  <th className="px-3 py-3">Risk</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {EXPOSURE_DATA.map(m => (
                  <tr key={m.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-[12px] truncate max-w-[200px]" style={{ fontWeight: 500 }}>{m.market}</p>
                      <p className="text-[#6b7280] text-[10px]">{m.category} · {m.bettorCount.toLocaleString()} bettors</p>
                    </td>
                    <td className="px-3 py-3 text-white">₱{(m.totalVolume / 1000000).toFixed(1)}M</td>
                    <td className="px-3 py-3 text-amber-400">₱{(m.maxPayout / 1000000).toFixed(1)}M</td>
                    <td className="px-3 py-3 text-red-400" style={{ fontWeight: 600 }}>₱{(m.netExposure / 1000000).toFixed(1)}M</td>
                    <td className="px-3 py-3">
                      <div className="w-20">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-emerald-400 text-[9px]">{m.sideA.pct}%</span>
                          <span className="text-[#4b5563] text-[9px]">vs</span>
                          <span className="text-red-400 text-[9px]">{m.sideB.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden flex">
                          <div className="bg-emerald-400 h-full" style={{ width: `${m.sideA.pct}%` }} />
                          <div className="bg-red-400 h-full" style={{ width: `${m.sideB.pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><RiskBadge level={m.riskLevel} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setSelectedMarket(m); setModalType("detail"); }} className="text-[10px] text-[#9ca3af] hover:text-white cursor-pointer px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] transition-colors" style={{ fontWeight: 500 }}>Detail</button>
                        <button onClick={() => { setSelectedMarket(m); setHedgeAmount(""); setHedgeSide("sideB"); setModalType("hedge"); }} className="text-[10px] text-[#ff5222] hover:text-white cursor-pointer px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222] transition-colors" style={{ fontWeight: 500 }}>Hedge</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {tab === "alerts" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(["all", "critical", "high", "medium", "low"] as const).map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)} className={`text-[11px] px-3 py-1 rounded-full cursor-pointer transition-colors ${filterSeverity === s ? "bg-[#ff5222] text-white" : "bg-[#1f2937] text-[#9ca3af] hover:text-white"}`} style={{ fontWeight: 500 }}>
                {s === "all" ? `All (${alerts.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${alerts.filter(a => a.severity === s).length})`}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredAlerts.map(a => (
              <div key={a.id} className={`bg-[#111827] border rounded-xl p-4 ${a.severity === "critical" ? "border-red-500/30" : a.severity === "high" ? "border-orange-500/20" : "border-[#1f2937]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <RiskBadge level={a.severity} />
                      <StatusBadge status={a.status} />
                      <span className="text-[#4b5563] text-[10px]">{a.type.toUpperCase()} · {a.time}</span>
                    </div>
                    <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{a.message}</p>
                    {(a.user || a.market) && (
                      <p className="text-[#6b7280] text-[10px] mt-1">
                        {a.user && <span>User: {a.user}</span>}
                        {a.user && a.market && <span> · </span>}
                        {a.market && <span>Market: {a.market}</span>}
                        {a.amount && <span> · ₱{a.amount.toLocaleString()}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {a.status === "active" && (
                      <button onClick={() => { setSelectedAlert(a); setModalType("investigate"); }} className="text-[10px] text-amber-400 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Investigate</button>
                    )}
                    {(a.status === "active" || a.status === "investigating") && (
                      <button onClick={() => { setSelectedAlert(a); setModalType("resolve"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Resolve</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Real-Time Tab */}
      {tab === "realtime" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>Hourly Exposure vs PAGCOR Limit</h3>
            <svg width={0} height={0} style={{ position: "absolute" }}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={HOURLY_EXPOSURE}>
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000000).toFixed(1)}M`]} />
                <Area type="monotone" dataKey="threshold" stroke="#ff5222" strokeWidth={1} strokeDasharray="4 4" fill="none" name="PAGCOR Limit" />
                <Area type="monotone" dataKey="exposure" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad)" name="Net Exposure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>Exposure by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CATEGORY_RISK} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₱${(v / 1000000).toFixed(1)}M`]} />
                <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                  {CATEGORY_RISK.map((_, i) => (
                    <Cell key={i} fill={i < 2 ? "#ef4444" : i < 4 ? "#f97316" : "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Live feed */}
          <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Platform Risk Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "House Edge (Avg)", value: "4.8%", good: true },
                { label: "Payout Ratio", value: "95.2%", good: true },
                { label: "One-Sided Markets", value: "3", good: false },
                { label: "Flagged Users", value: "5", good: false },
                { label: "Max Single Exposure", value: "₱6.3M", good: false },
                { label: "Markets at Risk", value: "3 / 8", good: false },
                { label: "AML Flags (24h)", value: "2", good: false },
                { label: "Auto-Hedge Active", value: "ON", good: true },
              ].map(s => (
                <div key={s.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
                  <p className={`text-[16px] ${s.good ? "text-emerald-400" : "text-amber-400"}`} style={{ fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selectedMarket} onClose={() => setModalType(null)} title="Market Exposure Detail" subtitle={selectedMarket?.market} width="max-w-[600px]">
        {selectedMarket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Volume", value: `₱${selectedMarket.totalVolume.toLocaleString()}` },
                { label: "Max Payout", value: `₱${selectedMarket.maxPayout.toLocaleString()}` },
                { label: "Net Exposure", value: `₱${selectedMarket.netExposure.toLocaleString()}` },
                { label: "Bettors", value: selectedMarket.bettorCount.toLocaleString() },
                { label: "Largest Bet", value: `₱${selectedMarket.largestBet.toLocaleString()}` },
                { label: "Category", value: selectedMarket.category },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[#6b7280] text-[10px] mb-2" style={{ fontWeight: 500 }}>Side Distribution</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-emerald-400 text-[12px]" style={{ fontWeight: 600 }}>{selectedMarket.sideA.label}: {selectedMarket.sideA.pct}%</span>
                <span className="text-[#4b5563]">vs</span>
                <span className="text-red-400 text-[12px]" style={{ fontWeight: 600 }}>{selectedMarket.sideB.label}: {selectedMarket.sideB.pct}%</span>
              </div>
              <div className="h-3 bg-[#1f2937] rounded-full overflow-hidden flex">
                <div className="bg-emerald-400 h-full rounded-l-full" style={{ width: `${selectedMarket.sideA.pct}%` }} />
                <div className="bg-red-400 h-full rounded-r-full" style={{ width: `${selectedMarket.sideB.pct}%` }} />
              </div>
              {selectedMarket.sideA.pct > 65 && (
                <p className="text-amber-400 text-[11px] mt-2 flex items-center gap-1">
                  <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M6 1L1 10h10L6 1zM6 4v3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="9" r="0.5" fill="currentColor" stroke="none" /></svg>
                  One-sided market — imbalance exceeds 65% threshold
                </p>
              )}
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
              <OmsBtn variant="primary" onClick={() => { setModalType("hedge"); setHedgeAmount(""); setHedgeSide("sideB"); }}>Hedge This Market</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Hedge Modal */}
      <OmsModal open={modalType === "hedge" && !!selectedMarket} onClose={() => setModalType(null)} title="Hedge Market Exposure" subtitle={selectedMarket?.market}>
        {selectedMarket && (
          <div className="space-y-3">
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3 space-y-1">
              <div className="flex justify-between"><span className="text-[#6b7280] text-[11px]">Current Exposure</span><span className="text-red-400 text-[11px]" style={{ fontWeight: 600 }}>₱{selectedMarket.netExposure.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#6b7280] text-[11px]">Dominant Side</span><span className="text-white text-[11px]" style={{ fontWeight: 600 }}>{selectedMarket.sideA.label} ({selectedMarket.sideA.pct}%)</span></div>
            </div>
            <OmsField label="Hedge Side" required>
              <OmsSelect value={hedgeSide} onChange={setHedgeSide} options={[
                { value: "sideB", label: `${selectedMarket.sideB.label} (underdog)` },
                { value: "sideA", label: `${selectedMarket.sideA.label} (favorite)` },
              ]} />
            </OmsField>
            <OmsField label="Hedge Amount (₱)" required>
              <OmsInput value={hedgeAmount} onChange={setHedgeAmount} placeholder="e.g. 500000" type="number" />
            </OmsField>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
              <OmsBtn variant="primary" onClick={() => { setModalType(null); showOmsToast(`Hedge placed: ₱${Number(hedgeAmount).toLocaleString()} on ${hedgeSide === "sideB" ? selectedMarket.sideB.label : selectedMarket.sideA.label}`); doAudit("risk_hedge", selectedMarket.market, `Hedge placed: ₱${Number(hedgeAmount).toLocaleString()} on ${hedgeSide === "sideB" ? selectedMarket.sideB.label : selectedMarket.sideA.label}`); }}>Place Hedge</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Investigate Modal */}
      <OmsModal open={modalType === "investigate" && !!selectedAlert} onClose={() => setModalType(null)} title="Investigate Alert" subtitle={selectedAlert?.id}>
        {selectedAlert && (
          <div>
            <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={selectedAlert.message} details={[
              { label: "Severity", value: selectedAlert.severity.toUpperCase() },
              { label: "Type", value: selectedAlert.type.toUpperCase() },
              { label: "Time", value: selectedAlert.time },
              ...(selectedAlert.user ? [{ label: "User", value: selectedAlert.user }] : []),
              ...(selectedAlert.amount ? [{ label: "Amount", value: `₱${selectedAlert.amount.toLocaleString()}` }] : []),
            ]} />
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
              <OmsBtn variant="primary" onClick={() => { setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "investigating" as const } : a)); setModalType(null); showOmsToast(`Alert ${selectedAlert.id} marked as investigating`); doAudit("risk_investigate", selectedAlert.id); }}>Mark as Investigating</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Resolve Modal */}
      <OmsModal open={modalType === "resolve" && !!selectedAlert} onClose={() => setModalType(null)} title="Resolve Alert" subtitle={selectedAlert?.id}>
        {selectedAlert && (
          <div>
            <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Resolve alert: ${selectedAlert.message}`} details={[
              { label: "Alert ID", value: selectedAlert.id },
              { label: "Current Status", value: selectedAlert.status.toUpperCase() },
            ]} />
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
              <OmsBtn variant="danger" onClick={() => { setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "dismissed" as const } : a)); setModalType(null); showOmsToast(`Alert ${selectedAlert.id} dismissed`); doAudit("risk_dismiss", selectedAlert.id); }}>Dismiss</OmsBtn>
              <OmsBtn variant="success" onClick={() => { setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "resolved" as const } : a)); setModalType(null); showOmsToast(`Alert ${selectedAlert.id} resolved`); doAudit("risk_resolve", selectedAlert.id); }}>Resolve</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>
    </div>
  );
}