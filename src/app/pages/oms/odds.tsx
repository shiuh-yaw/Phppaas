import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const inter = { fontFamily: "'Inter', sans-serif" };

interface OddsConfig {
  id: string;
  category: string;
  marginPct: number;
  maxOdds: number;
  minOdds: number;
  autoAdjust: boolean;
  adjustSpeed: "slow" | "medium" | "fast";
  imbalanceThreshold: number;
  lastUpdated: string;
  activeMarkets: number;
  avgMargin: number;
}

interface MarketOdds {
  id: string;
  market: string;
  category: string;
  sideA: { label: string; odds: number; impliedProb: number };
  sideB: { label: string; odds: number; impliedProb: number };
  overround: number;
  margin: number;
  volume: number;
  status: "live" | "locked" | "suspended";
}

const MOCK_CONFIGS: OddsConfig[] = [
  { id: "OC001", category: "Basketball", marginPct: 4.8, maxOdds: 15.0, minOdds: 1.05, autoAdjust: true, adjustSpeed: "medium", imbalanceThreshold: 65, lastUpdated: "2 hr ago", activeMarkets: 12, avgMargin: 4.6 },
  { id: "OC002", category: "Color Game", marginPct: 5.5, maxOdds: 6.0, minOdds: 1.5, autoAdjust: true, adjustSpeed: "fast", imbalanceThreshold: 60, lastUpdated: "5 min ago", activeMarkets: 1, avgMargin: 5.5 },
  { id: "OC003", category: "Boxing", marginPct: 5.0, maxOdds: 20.0, minOdds: 1.1, autoAdjust: true, adjustSpeed: "slow", imbalanceThreshold: 70, lastUpdated: "1 day ago", activeMarkets: 3, avgMargin: 4.9 },
  { id: "OC004", category: "Esports", marginPct: 4.2, maxOdds: 10.0, minOdds: 1.2, autoAdjust: true, adjustSpeed: "medium", imbalanceThreshold: 65, lastUpdated: "30 min ago", activeMarkets: 8, avgMargin: 4.0 },
  { id: "OC005", category: "Lottery", marginPct: 12.0, maxOdds: 10000.0, minOdds: 1.0, autoAdjust: false, adjustSpeed: "slow", imbalanceThreshold: 80, lastUpdated: "3 hr ago", activeMarkets: 5, avgMargin: 12.0 },
  { id: "OC006", category: "Showbiz", marginPct: 6.0, maxOdds: 25.0, minOdds: 1.2, autoAdjust: false, adjustSpeed: "slow", imbalanceThreshold: 70, lastUpdated: "1 day ago", activeMarkets: 4, avgMargin: 5.8 },
  { id: "OC007", category: "Weather", marginPct: 5.5, maxOdds: 8.0, minOdds: 1.3, autoAdjust: false, adjustSpeed: "slow", imbalanceThreshold: 70, lastUpdated: "2 days ago", activeMarkets: 3, avgMargin: 5.2 },
  { id: "OC008", category: "Economy", marginPct: 5.0, maxOdds: 12.0, minOdds: 1.2, autoAdjust: false, adjustSpeed: "slow", imbalanceThreshold: 70, lastUpdated: "1 day ago", activeMarkets: 2, avgMargin: 4.8 },
  { id: "OC009", category: "Bingo", marginPct: 8.0, maxOdds: 10.0, minOdds: 1.5, autoAdjust: true, adjustSpeed: "fast", imbalanceThreshold: 60, lastUpdated: "10 min ago", activeMarkets: 2, avgMargin: 7.5 },
];

const MOCK_MARKET_ODDS: MarketOdds[] = [
  { id: "MO001", market: "PBA Finals — Ginebra vs SMB", category: "Basketball", sideA: { label: "Ginebra", odds: 1.45, impliedProb: 68.9 }, sideB: { label: "SMB", odds: 2.90, impliedProb: 34.5 }, overround: 103.4, margin: 3.4, volume: 8500000, status: "live" },
  { id: "MO002", market: "Pacquiao vs Crawford", category: "Boxing", sideA: { label: "Pacquiao", odds: 1.50, impliedProb: 66.7 }, sideB: { label: "Crawford", odds: 2.70, impliedProb: 37.0 }, overround: 103.7, margin: 3.7, volume: 5200000, status: "live" },
  { id: "MO003", market: "T1 vs GenG — MSI", category: "Esports", sideA: { label: "T1", odds: 1.80, impliedProb: 55.6 }, sideB: { label: "GenG", odds: 2.05, impliedProb: 48.8 }, overround: 104.4, margin: 4.4, volume: 980000, status: "live" },
  { id: "MO004", market: "NBA Finals — Celtics vs Lakers", category: "Basketball", sideA: { label: "Celtics", odds: 1.75, impliedProb: 57.1 }, sideB: { label: "Lakers", odds: 2.15, impliedProb: 46.5 }, overround: 103.6, margin: 3.6, volume: 3200000, status: "live" },
  { id: "MO005", market: "Color Game Round #8901", category: "Color Game", sideA: { label: "Red", odds: 2.00, impliedProb: 50.0 }, sideB: { label: "Others", odds: 2.00, impliedProb: 50.0 }, overround: 105.5, margin: 5.5, volume: 1800000, status: "live" },
  { id: "MO006", market: "PCSO 6/58 Mega Lotto", category: "Lottery", sideA: { label: "Hot Numbers", odds: 1.20, impliedProb: 83.3 }, sideB: { label: "Cold Numbers", odds: 5.00, impliedProb: 20.0 }, overround: 103.3, margin: 12.0, volume: 2100000, status: "locked" },
];

const MARGIN_CHART = MOCK_CONFIGS.map(c => ({ name: c.category, margin: c.avgMargin, target: c.marginPct }));

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { live: "bg-emerald-500/15 text-emerald-400", locked: "bg-amber-500/15 text-amber-400", suspended: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsOdds() {
  const [tab, setTab] = useState<"config" | "markets" | "analytics">("config");
  const [configs, setConfigs] = useState(MOCK_CONFIGS);
  const [marketOdds, setMarketOdds] = useState(MOCK_MARKET_ODDS);
  const [modalType, setModalType] = useState<"edit-config" | "edit-odds" | "lock" | "unlock" | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<OddsConfig | null>(null);
  const [selectedMarketOdds, setSelectedMarketOdds] = useState<MarketOdds | null>(null);

  // Edit config form
  const [editMargin, setEditMargin] = useState("");
  const [editMaxOdds, setEditMaxOdds] = useState("");
  const [editMinOdds, setEditMinOdds] = useState("");
  const [editAutoAdjust, setEditAutoAdjust] = useState("true");
  const [editSpeed, setEditSpeed] = useState("medium");
  const [editThreshold, setEditThreshold] = useState("");

  // Edit odds form
  const [editOddsA, setEditOddsA] = useState("");
  const [editOddsB, setEditOddsB] = useState("");

  const openEditConfig = (c: OddsConfig) => {
    setSelectedConfig(c); setEditMargin(String(c.marginPct)); setEditMaxOdds(String(c.maxOdds));
    setEditMinOdds(String(c.minOdds)); setEditAutoAdjust(c.autoAdjust ? "true" : "false");
    setEditSpeed(c.adjustSpeed); setEditThreshold(String(c.imbalanceThreshold)); setModalType("edit-config");
  };

  const openEditOdds = (m: MarketOdds) => {
    setSelectedMarketOdds(m); setEditOddsA(String(m.sideA.odds)); setEditOddsB(String(m.sideB.odds)); setModalType("edit-odds");
  };

  const avgPlatformMargin = configs.reduce((s, c) => s + c.avgMargin, 0) / configs.length;

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";

  const doAudit = (target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "config_save", target, detail });
  };

  return (
    <div className="space-y-4" style={inter}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Platform Avg Margin", value: `${avgPlatformMargin.toFixed(1)}%`, color: "text-[#ff5222]" },
          { label: "Active Markets", value: String(configs.reduce((s, c) => s + c.activeMarkets, 0)), color: "text-emerald-400" },
          { label: "Auto-Adjust Active", value: String(configs.filter(c => c.autoAdjust).length), color: "text-blue-400" },
          { label: "Locked Markets", value: String(marketOdds.filter(m => m.status === "locked").length), color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 w-fit">
        {(["config", "markets", "analytics"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-[12px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${tab === t ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t === "config" ? "Category Config" : t === "markets" ? "Market Odds" : "Margin Analytics"}
          </button>
        ))}
      </div>

      {/* Config Tab */}
      {tab === "config" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-3 py-3">Target Margin</th>
                  <th className="px-3 py-3">Actual Margin</th>
                  <th className="px-3 py-3">Odds Range</th>
                  <th className="px-3 py-3">Auto-Adjust</th>
                  <th className="px-3 py-3">Markets</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map(c => (
                  <tr key={c.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3 text-white" style={{ fontWeight: 500 }}>{c.category}</td>
                    <td className="px-3 py-3 text-[#ff5222]" style={{ fontWeight: 600 }}>{c.marginPct}%</td>
                    <td className={`px-3 py-3 ${Math.abs(c.avgMargin - c.marginPct) > 1 ? "text-amber-400" : "text-emerald-400"}`} style={{ fontWeight: 600 }}>{c.avgMargin}%</td>
                    <td className="px-3 py-3 text-[#9ca3af]">{c.minOdds} — {c.maxOdds}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${c.autoAdjust ? "bg-emerald-400" : "bg-gray-500"}`} />
                        <span className={`text-[10px] ${c.autoAdjust ? "text-emerald-400" : "text-gray-400"}`} style={{ fontWeight: 500 }}>
                          {c.autoAdjust ? `ON (${c.adjustSpeed})` : "OFF"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#9ca3af]">{c.activeMarkets}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => openEditConfig(c)} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Configure</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Markets Tab */}
      {tab === "markets" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-3 py-3">Side A</th>
                  <th className="px-3 py-3">Side B</th>
                  <th className="px-3 py-3">Overround</th>
                  <th className="px-3 py-3">Margin</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketOdds.map(m => (
                  <tr key={m.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-[12px] truncate max-w-[180px]" style={{ fontWeight: 500 }}>{m.market}</p>
                      <p className="text-[#6b7280] text-[10px]">{m.category}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-emerald-400 text-[12px]" style={{ fontWeight: 600 }}>{m.sideA.odds.toFixed(2)}</span>
                      <span className="text-[#4b5563] text-[10px] ml-1">({m.sideA.impliedProb}%)</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-red-400 text-[12px]" style={{ fontWeight: 600 }}>{m.sideB.odds.toFixed(2)}</span>
                      <span className="text-[#4b5563] text-[10px] ml-1">({m.sideB.impliedProb}%)</span>
                    </td>
                    <td className="px-3 py-3 text-white">{m.overround.toFixed(1)}%</td>
                    <td className="px-3 py-3 text-[#ff5222]" style={{ fontWeight: 600 }}>{m.margin.toFixed(1)}%</td>
                    <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEditOdds(m)} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit Odds</button>
                        {m.status === "live" ? (
                          <button onClick={() => { setSelectedMarketOdds(m); setModalType("lock"); }} className="text-[10px] text-amber-400 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Lock</button>
                        ) : m.status === "locked" ? (
                          <button onClick={() => { setSelectedMarketOdds(m); setModalType("unlock"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Unlock</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>Target vs Actual Margin by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MARGIN_CHART} layout="vertical" id="odds-margin-bar">
                <XAxis key="xaxis" type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[0, 14]} tickFormatter={v => `${v}%`} />
                <YAxis key="yaxis" type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip key="tooltip" contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11, color: "#070808", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`${v}%`]} />
                <Bar key="target" dataKey="target" fill="#374151" radius={[0, 4, 4, 0]} name="Target" barSize={12} />
                <Bar key="margin" dataKey="margin" radius={[0, 4, 4, 0]} name="Actual" barSize={12}>
                  {MARGIN_CHART.map((entry, i) => (
                    <Cell key={i} fill={Math.abs(entry.margin - entry.target) > 1 ? "#f59e0b" : "#ff5222"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Pricing Model Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Vigorish Model", desc: "Standard overround pricing applied to all binary markets", status: "Active" },
                { label: "Parimutuel (Color Game)", desc: "Pool-based odds for Color Game — house takes 5.5% from pool", status: "Active" },
                { label: "Fixed Odds (Lottery)", desc: "Pre-set multipliers for lottery number matching tiers", status: "Active" },
                { label: "Dynamic Adjustment", desc: "Auto-adjusts odds based on bet volume imbalance per side", status: `${configs.filter(c => c.autoAdjust).length} categories` },
                { label: "Imbalance Protection", desc: "Triggers when one side exceeds threshold — narrows odds on heavy side", status: "Active" },
              ].map(item => (
                <div key={item.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{item.label}</p>
                    <span className="text-emerald-400 text-[10px]" style={{ fontWeight: 600 }}>{item.status}</span>
                  </div>
                  <p className="text-[#6b7280] text-[11px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal */}
      <OmsModal open={modalType === "edit-config" && !!selectedConfig} onClose={() => setModalType(null)} title="Configure Odds Engine" subtitle={selectedConfig?.category}>
        <div className="space-y-3">
          <OmsField label="Target Margin (%)" required>
            <OmsInput value={editMargin} onChange={setEditMargin} type="number" />
          </OmsField>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Min Odds" required>
              <OmsInput value={editMinOdds} onChange={setEditMinOdds} type="number" />
            </OmsField>
            <OmsField label="Max Odds" required>
              <OmsInput value={editMaxOdds} onChange={setEditMaxOdds} type="number" />
            </OmsField>
          </div>
          <OmsField label="Auto-Adjust" required>
            <OmsSelect value={editAutoAdjust} onChange={setEditAutoAdjust} options={[
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ]} />
          </OmsField>
          {editAutoAdjust === "true" && (
            <>
              <OmsField label="Adjustment Speed" required>
                <OmsSelect value={editSpeed} onChange={setEditSpeed} options={[
                  { value: "slow", label: "Slow (gentle adjustments)" },
                  { value: "medium", label: "Medium (balanced)" },
                  { value: "fast", label: "Fast (aggressive rebalancing)" },
                ]} />
              </OmsField>
              <OmsField label="Imbalance Threshold (%)" required>
                <OmsInput value={editThreshold} onChange={setEditThreshold} type="number" placeholder="e.g. 65" />
              </OmsField>
            </>
          )}
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              setConfigs(prev => prev.map(c => c.id === selectedConfig!.id ? {
                ...c, marginPct: Number(editMargin), maxOdds: Number(editMaxOdds), minOdds: Number(editMinOdds),
                autoAdjust: editAutoAdjust === "true", adjustSpeed: editSpeed as any,
                imbalanceThreshold: Number(editThreshold), lastUpdated: "Just now",
              } : c));
              setModalType(null);
              showOmsToast(`${selectedConfig!.category} odds config updated`);
              doAudit(selectedConfig!.category, `Updated odds config: target margin ${editMargin}%, min odds ${editMinOdds}, max odds ${editMaxOdds}, auto-adjust ${editAutoAdjust}, speed ${editSpeed}, threshold ${editThreshold}`);
            }}>Save Changes</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Edit Odds Modal */}
      <OmsModal open={modalType === "edit-odds" && !!selectedMarketOdds} onClose={() => setModalType(null)} title="Edit Market Odds" subtitle={selectedMarketOdds?.market}>
        {selectedMarketOdds && (
          <div className="space-y-3">
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3 space-y-1 mb-3">
              <div className="flex justify-between"><span className="text-[#6b7280] text-[11px]">Current Overround</span><span className="text-white text-[11px]" style={{ fontWeight: 600 }}>{selectedMarketOdds.overround.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-[#6b7280] text-[11px]">Current Margin</span><span className="text-[#ff5222] text-[11px]" style={{ fontWeight: 600 }}>{selectedMarketOdds.margin.toFixed(1)}%</span></div>
            </div>
            <OmsField label={`${selectedMarketOdds.sideA.label} Odds`} required>
              <OmsInput value={editOddsA} onChange={setEditOddsA} type="number" />
            </OmsField>
            <OmsField label={`${selectedMarketOdds.sideB.label} Odds`} required>
              <OmsInput value={editOddsB} onChange={setEditOddsB} type="number" />
            </OmsField>
            {editOddsA && editOddsB && (
              <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>Preview</p>
                <p className="text-white text-[11px]">New Overround: <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>{((1 / Number(editOddsA) + 1 / Number(editOddsB)) * 100).toFixed(1)}%</span></p>
                <p className="text-white text-[11px]">New Margin: <span className="text-amber-400" style={{ fontWeight: 600 }}>{(((1 / Number(editOddsA) + 1 / Number(editOddsB)) * 100) - 100).toFixed(1)}%</span></p>
              </div>
            )}
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
              <OmsBtn variant="primary" onClick={() => {
                const a = Number(editOddsA); const b = Number(editOddsB);
                const overround = ((1 / a + 1 / b) * 100);
                setMarketOdds(prev => prev.map(m => m.id === selectedMarketOdds.id ? {
                  ...m, sideA: { ...m.sideA, odds: a, impliedProb: Math.round((1 / a) * 1000) / 10 },
                  sideB: { ...m.sideB, odds: b, impliedProb: Math.round((1 / b) * 1000) / 10 },
                  overround, margin: overround - 100,
                } : m));
                setModalType(null);
                showOmsToast(`Odds updated: ${selectedMarketOdds.sideA.label} ${a.toFixed(2)} / ${selectedMarketOdds.sideB.label} ${b.toFixed(2)}`);
              }}>Update Odds</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Lock Modal */}
      <OmsModal open={modalType === "lock" && !!selectedMarketOdds} onClose={() => setModalType(null)} title="Lock Odds">
        <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={`Lock odds for "${selectedMarketOdds?.market}"? Odds will not auto-adjust until unlocked.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setMarketOdds(prev => prev.map(m => m.id === selectedMarketOdds!.id ? { ...m, status: "locked" as const } : m)); setModalType(null); showOmsToast("Odds locked"); }}>Lock Odds</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Unlock Modal */}
      <OmsModal open={modalType === "unlock" && !!selectedMarketOdds} onClose={() => setModalType(null)} title="Unlock Odds">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Unlock odds for "${selectedMarketOdds?.market}"? Auto-adjustment will resume.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setMarketOdds(prev => prev.map(m => m.id === selectedMarketOdds!.id ? { ...m, status: "live" as const } : m)); setModalType(null); showOmsToast("Odds unlocked"); }}>Unlock Odds</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}