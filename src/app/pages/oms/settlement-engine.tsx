import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { logAudit } from "../../components/oms/oms-audit-log";
import { showOmsToast } from "../../components/oms/oms-modal";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
type SettlementState =
  | "open"
  | "closed"
  | "resolving"
  | "resolved"
  | "settling"
  | "settled"
  | "voided"
  | "disputed"
  | "failed";

interface SettlementJob {
  id: string;
  marketId: string;
  marketName: string;
  state: SettlementState;
  totalBets: number;
  totalVolume: number;
  processedBets: number;
  payoutAmount: number;
  winningOutcome: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMsg: string | null;
  retries: number;
  batchId: string;
  currency: "FGUSD" | "USDT" | "USDC";
  createdAt: string;
  updatedAt: string;
}

/* ==================== STATE MACHINE CONFIG ==================== */
const STATE_META: Record<SettlementState, { label: string; color: string; bg: string; desc: string }> = {
  open:      { label: "OPEN",      color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",    desc: "Market accepting bets" },
  closed:    { label: "CLOSED",    color: "text-gray-600",    bg: "bg-gray-100 border-gray-300",    desc: "Betting window closed" },
  resolving: { label: "RESOLVING", color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",   desc: "Determining winning outcome" },
  resolved:  { label: "RESOLVED",  color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",  desc: "Outcome confirmed, ready for payout" },
  settling:  { label: "SETTLING",  color: "text-orange-600",  bg: "bg-orange-50 border-orange-200",  desc: "Processing payouts batch" },
  settled:   { label: "SETTLED",   color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", desc: "All payouts completed" },
  voided:    { label: "VOIDED",    color: "text-red-500",     bg: "bg-red-50 border-red-200",       desc: "Market cancelled, refunds issued" },
  disputed:  { label: "DISPUTED",  color: "text-rose-600",    bg: "bg-rose-50 border-rose-200",     desc: "Settlement under review" },
  failed:    { label: "FAILED",    color: "text-red-700",     bg: "bg-red-100 border-red-300",      desc: "Settlement error, requires retry" },
};

const TRANSITIONS: Record<SettlementState, SettlementState[]> = {
  open:      ["closed", "voided"],
  closed:    ["resolving", "voided"],
  resolving: ["resolved", "failed", "voided"],
  resolved:  ["settling", "disputed", "voided"],
  settling:  ["settled", "failed"],
  settled:   [],
  voided:    [],
  disputed:  ["resolved", "voided"],
  failed:    ["resolving", "settling"],
};

/* ==================== MOCK DATA ==================== */
const MOCK_JOBS: SettlementJob[] = [
  { id: "STL-001", marketId: "MKT-2025-001", marketName: "PBA Finals: Ginebra vs SMB - Game 7 Winner", state: "settling", totalBets: 2847, totalVolume: 485000, processedBets: 1923, payoutAmount: 312000, winningOutcome: "Ginebra", startedAt: "2026-04-18 14:30 PHT", completedAt: null, errorMsg: null, retries: 0, batchId: "BATCH-0418-A", currency: "FGUSD", createdAt: "2026-04-18 14:00 PHT", updatedAt: "2026-04-18 14:35 PHT" },
  { id: "STL-002", marketId: "MKT-2025-002", marketName: "Will Marcos sign the Maharlika Fund Amendment by April 30?", state: "resolved", totalBets: 1256, totalVolume: 198000, processedBets: 0, payoutAmount: 0, winningOutcome: "Yes", startedAt: null, completedAt: null, errorMsg: null, retries: 0, batchId: "BATCH-0418-B", currency: "FGUSD", createdAt: "2026-04-18 12:00 PHT", updatedAt: "2026-04-18 13:45 PHT" },
  { id: "STL-003", marketId: "MKT-2025-003", marketName: "Color Game: Round #4821", state: "settled", totalBets: 523, totalVolume: 41200, processedBets: 523, payoutAmount: 28400, winningOutcome: "Blue-Red-Blue", startedAt: "2026-04-18 13:00 PHT", completedAt: "2026-04-18 13:02 PHT", errorMsg: null, retries: 0, batchId: "BATCH-0418-CG", currency: "FGUSD", createdAt: "2026-04-18 12:55 PHT", updatedAt: "2026-04-18 13:02 PHT" },
  { id: "STL-004", marketId: "MKT-2025-004", marketName: "UAAP Season 87: NU vs DLSU Final Score Over/Under 150.5", state: "failed", totalBets: 891, totalVolume: 125000, processedBets: 445, payoutAmount: 0, winningOutcome: "Over", startedAt: "2026-04-18 11:30 PHT", completedAt: null, errorMsg: "Database connection pool exhausted at batch offset 445. Idempotent resume available.", retries: 2, batchId: "BATCH-0418-C", currency: "USDT", createdAt: "2026-04-18 11:00 PHT", updatedAt: "2026-04-18 11:45 PHT" },
  { id: "STL-005", marketId: "MKT-2025-005", marketName: "Typhoon Carina: Will Signal #5 be raised in Metro Manila?", state: "disputed", totalBets: 3100, totalVolume: 520000, processedBets: 0, payoutAmount: 0, winningOutcome: "No", startedAt: null, completedAt: null, errorMsg: "Dispute filed: PAGASA issued conflicting bulletins. 3 users challenged outcome.", retries: 0, batchId: "BATCH-0418-D", currency: "FGUSD", createdAt: "2026-04-17 22:00 PHT", updatedAt: "2026-04-18 09:00 PHT" },
  { id: "STL-006", marketId: "MKT-2025-006", marketName: "PSEi Closing Price > 7000 on April 18?", state: "closed", totalBets: 678, totalVolume: 89000, processedBets: 0, payoutAmount: 0, winningOutcome: null, startedAt: null, completedAt: null, errorMsg: null, retries: 0, batchId: "BATCH-0418-E", currency: "USDC", createdAt: "2026-04-18 09:30 PHT", updatedAt: "2026-04-18 15:30 PHT" },
  { id: "STL-007", marketId: "MKT-2025-007", marketName: "Pacquiao Comeback Fight: Will it happen before July 2026?", state: "open", totalBets: 4200, totalVolume: 890000, processedBets: 0, payoutAmount: 0, winningOutcome: null, startedAt: null, completedAt: null, errorMsg: null, retries: 0, batchId: "", currency: "FGUSD", createdAt: "2026-03-15 10:00 PHT", updatedAt: "2026-04-18 15:00 PHT" },
  { id: "STL-008", marketId: "MKT-2025-008", marketName: "Color Game: Round #4820", state: "voided", totalBets: 312, totalVolume: 24500, processedBets: 312, payoutAmount: 24500, winningOutcome: null, startedAt: "2026-04-18 12:50 PHT", completedAt: "2026-04-18 12:51 PHT", errorMsg: "Voided: Technical error in random seed generation. Full refund.", retries: 0, batchId: "BATCH-0418-V1", currency: "FGUSD", createdAt: "2026-04-18 12:45 PHT", updatedAt: "2026-04-18 12:51 PHT" },
];

/* ==================== STATE MACHINE VISUAL ==================== */
function StateMachineDiagram({ activeState, onStateClick }: { activeState: SettlementState | null; onStateClick: (s: SettlementState) => void }) {
  const states: SettlementState[] = ["open", "closed", "resolving", "resolved", "settling", "settled"];
  const altStates: SettlementState[] = ["voided", "disputed", "failed"];

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
      <h3 className="text-[#070808] text-[13px] mb-4" style={{ fontWeight: 700, ...ss04 }}>Settlement State Machine</h3>

      {/* Main flow */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3">
        {states.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => onStateClick(s)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${STATE_META[s].bg} ${activeState === s ? "ring-2 ring-[#ff5222] ring-offset-1 scale-105" : "hover:scale-105"}`}
            >
              <p className={`text-[10px] ${STATE_META[s].color}`} style={{ fontWeight: 700, ...ss04 }}>{STATE_META[s].label}</p>
              <p className="text-[8px] text-[#84888c] mt-0.5 max-w-[100px]" style={ss04}>{STATE_META[s].desc}</p>
            </button>
            {i < states.length - 1 && (
              <svg className="size-5 text-[#d1d5db] flex-shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 10h10M12 6l4 4-4 4" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Exception states */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f0f1f3]">
        <span className="text-[9px] text-[#b0b3b8]" style={{ fontWeight: 600, ...ss04 }}>EXCEPTION PATHS:</span>
        {altStates.map(s => (
          <button
            key={s}
            onClick={() => onStateClick(s)}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${STATE_META[s].bg} ${activeState === s ? "ring-2 ring-[#ff5222] ring-offset-1" : "hover:scale-105"}`}
          >
            <p className={`text-[9px] ${STATE_META[s].color}`} style={{ fontWeight: 700, ...ss04 }}>{STATE_META[s].label}</p>
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[8px] text-[#b0b3b8]" style={ss04}>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[8px] text-[#b0b3b8]" style={ss04}>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== PROGRESS BAR ==================== */
function ProgressBar({ processed, total }: { processed: number; total: number }) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#f0f1f3] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-[#ff5222]" : "bg-[#d1d5db]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#84888c] w-10 text-right" style={{ fontWeight: 600, ...ss04 }}>{pct}%</span>
    </div>
  );
}

/* ==================== JOB DETAIL PANEL ==================== */
function JobDetail({ job, onTransition }: { job: SettlementJob; onTransition: (jobId: string, to: SettlementState) => void }) {
  const transitions = TRANSITIONS[job.state];

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04 }}>{job.id}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATE_META[job.state].bg} ${STATE_META[job.state].color}`} style={{ fontWeight: 700, ...ss04 }}>
              {STATE_META[job.state].label}
            </span>
            {job.retries > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500" style={{ fontWeight: 600, ...ss04 }}>
                {job.retries} retries
              </span>
            )}
          </div>
          <p className="text-[#84888c] text-[11px]" style={ss04}>{job.marketName}</p>
          <p className="text-[#b0b3b8] text-[10px] mt-0.5" style={ss04}>{job.marketId} &middot; Batch: {job.batchId || "--"}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#f5f6f8] text-[#84888c]" style={{ fontWeight: 600, ...ss04 }}>{job.currency}</span>
      </div>

      {/* Settlement progress */}
      {(job.state === "settling" || job.state === "failed") && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss04 }}>Settlement Progress</span>
            <span className="text-[10px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{job.processedBets.toLocaleString()} / {job.totalBets.toLocaleString()} bets</span>
          </div>
          <ProgressBar processed={job.processedBets} total={job.totalBets} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Bets", value: job.totalBets.toLocaleString() },
          { label: "Volume", value: `$${job.totalVolume.toLocaleString()}` },
          { label: "Payout", value: `$${job.payoutAmount.toLocaleString()}` },
          { label: "Outcome", value: job.winningOutcome || "--" },
        ].map(s => (
          <div key={s.label} className="bg-[#f5f6f8] rounded-xl p-2.5">
            <p className="text-[#b0b3b8] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Error message */}
      {job.errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{job.errorMsg}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-4 space-y-1.5">
        <p className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 600, ...ss04 }}>TIMELINE</p>
        <div className="flex gap-4 text-[10px]" style={ss04}>
          <span className="text-[#b0b3b8]">Created: <span className="text-[#070808]">{job.createdAt}</span></span>
          {job.startedAt && <span className="text-[#b0b3b8]">Started: <span className="text-[#070808]">{job.startedAt}</span></span>}
          {job.completedAt && <span className="text-[#b0b3b8]">Completed: <span className="text-emerald-600">{job.completedAt}</span></span>}
          <span className="text-[#b0b3b8]">Updated: <span className="text-[#070808]">{job.updatedAt}</span></span>
        </div>
      </div>

      {/* Transition buttons */}
      {transitions.length > 0 && (
        <div className="pt-3 border-t border-[#f0f1f3]">
          <p className="text-[9px] text-[#b0b3b8] mb-2" style={{ fontWeight: 600, ...ss04 }}>AVAILABLE TRANSITIONS</p>
          <div className="flex gap-2 flex-wrap">
            {transitions.map(t => (
              <button
                key={t}
                onClick={() => onTransition(job.id, t)}
                className={`h-8 px-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${STATE_META[t].bg} ${STATE_META[t].color}`}
                style={{ fontWeight: 600, ...ss04, fontSize: 11 }}
              >
                &rarr; {STATE_META[t].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== LIVE METRICS ==================== */
function LiveMetrics({ jobs }: { jobs: SettlementJob[] }) {
  const activeSettling = jobs.filter(j => j.state === "settling");
  const totalProcessing = activeSettling.reduce((s, j) => s + j.processedBets, 0);
  const totalBetsInFlight = activeSettling.reduce((s, j) => s + j.totalBets, 0);
  const failedCount = jobs.filter(j => j.state === "failed").length;
  const disputedCount = jobs.filter(j => j.state === "disputed").length;
  const avgSettleTime = 2.3; // mock

  const metrics = [
    { label: "Active Settlements", value: activeSettling.length.toString(), color: "text-[#ff5222]", pulse: activeSettling.length > 0 },
    { label: "Bets Processing", value: `${totalProcessing.toLocaleString()}/${totalBetsInFlight.toLocaleString()}`, color: "text-blue-600", pulse: false },
    { label: "Failed Jobs", value: failedCount.toString(), color: failedCount > 0 ? "text-red-600" : "text-emerald-600", pulse: failedCount > 0 },
    { label: "Disputes", value: disputedCount.toString(), color: disputedCount > 0 ? "text-rose-600" : "text-emerald-600", pulse: disputedCount > 0 },
    { label: "Avg Settle Time", value: `${avgSettleTime}s`, color: "text-[#070808]", pulse: false },
    { label: "Throughput", value: "847/s", color: "text-emerald-600", pulse: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="bg-white border border-[#e5e7eb] rounded-2xl p-3 relative overflow-hidden">
          {m.pulse && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff5222] animate-pulse" />}
          <p className="text-[#b0b3b8] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>{m.label}</p>
          <p className={`text-[18px] ${m.color}`} style={{ fontWeight: 700, ...ss04 }}>{m.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ==================== BATCH QUEUE TABLE ==================== */
function BatchQueue({ jobs, selectedId, onSelect }: { jobs: SettlementJob[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f1f3]">
        <h3 className="text-[#070808] text-[13px]" style={{ fontWeight: 700, ...ss04 }}>Settlement Queue</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 800 }}>
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {["Job ID", "Market", "State", "Bets", "Volume", "Progress", "Batch", "Updated"].map(h => (
                <th key={h} className="text-[#b0b3b8] text-[10px] px-3 py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr
                key={j.id}
                onClick={() => onSelect(j.id)}
                className={`border-b border-[#f0f1f3] last:border-0 cursor-pointer transition-colors ${selectedId === j.id ? "bg-[#fff5f0]" : "hover:bg-[#f9fafb]"}`}
              >
                <td className="px-3 py-2.5 text-[#ff5222] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{j.id}</td>
                <td className="px-3 py-2.5 text-[#070808] text-[11px] max-w-[200px] truncate" style={{ fontWeight: 500, ...ss04 }}>{j.marketName}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATE_META[j.state].bg} ${STATE_META[j.state].color}`} style={{ fontWeight: 700, ...ss04 }}>
                    {STATE_META[j.state].label}
                    {j.state === "settling" && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse align-middle" />}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{j.totalBets.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>${j.totalVolume.toLocaleString()}</td>
                <td className="px-3 py-2.5 w-32">
                  <ProgressBar processed={j.processedBets} total={j.totalBets} />
                </td>
                <td className="px-3 py-2.5 text-[#b0b3b8] text-[10px] font-mono" style={ss04}>{j.batchId || "--"}</td>
                <td className="px-3 py-2.5 text-[#b0b3b8] text-[10px]" style={ss04}>{j.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function SettlementEnginePage() {
  const { admin } = useOmsAuth();
  const [jobs, setJobs] = useState<SettlementJob[]>(MOCK_JOBS);
  const [selectedId, setSelectedId] = useState<string | null>("STL-001");
  const [stateFilter, setStateFilter] = useState<SettlementState | "all">("all");
  const [activeStateDiagram, setActiveStateDiagram] = useState<SettlementState | null>(null);

  // Simulate live progress on settling jobs
  useEffect(() => {
    const iv = setInterval(() => {
      setJobs(prev => prev.map(j => {
        if (j.state === "settling" && j.processedBets < j.totalBets) {
          const inc = Math.min(Math.floor(Math.random() * 50) + 10, j.totalBets - j.processedBets);
          const newProcessed = j.processedBets + inc;
          const payoutRatio = j.payoutAmount / Math.max(1, j.processedBets);
          return {
            ...j,
            processedBets: newProcessed,
            payoutAmount: Math.round(payoutRatio * newProcessed),
            updatedAt: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          };
        }
        return j;
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Auto-transition settling -> settled when complete
  useEffect(() => {
    setJobs(prev => prev.map(j => {
      if (j.state === "settling" && j.processedBets >= j.totalBets) {
        showOmsToast(`${j.id} settlement complete!`, "success");
        if (admin) {
          logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "market_settled", target: j.marketId, detail: `Settled ${j.totalBets} bets, payout $${j.payoutAmount.toLocaleString()}` });
        }
        return { ...j, state: "settled" as SettlementState, completedAt: new Date().toLocaleTimeString("en-PH") };
      }
      return j;
    }));
  }, [jobs, admin]);

  const handleTransition = useCallback((jobId: string, to: SettlementState) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const now = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const updated = { ...j, state: to, updatedAt: now };
      if (to === "settling") updated.startedAt = now;
      if (to === "voided") { updated.payoutAmount = updated.totalVolume; updated.completedAt = now; }
      if (to === "resolving" || to === "settling") { updated.retries = j.state === "failed" ? j.retries + 1 : j.retries; }
      return updated;
    }));
    showOmsToast(`${jobId} transitioned to ${STATE_META[to].label}`, "info");
    if (admin) {
      logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "settlement_transition", target: jobId, detail: `State -> ${to}` });
    }
  }, [admin]);

  const filtered = stateFilter === "all" ? jobs : jobs.filter(j => j.state === stateFilter);
  const selectedJob = jobs.find(j => j.id === selectedId) || null;

  // Count by state
  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.state] = (acc[j.state] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4" style={pp}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>Settlement Engine</h2>
          <p className="text-[#b0b3b8] text-[11px]" style={ss04}>Visual state machine &middot; Batch processing &middot; Real-time monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>ENGINE ONLINE</span>
        </div>
      </div>

      {/* Live metrics */}
      <LiveMetrics jobs={jobs} />

      {/* State machine diagram */}
      <StateMachineDiagram activeState={activeStateDiagram} onStateClick={(s) => {
        setActiveStateDiagram(prev => prev === s ? null : s);
        setStateFilter(prev => {
          if (prev === s) return "all";
          return s;
        });
      }} />

      {/* State filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => { setStateFilter("all"); setActiveStateDiagram(null); }}
          className={`h-7 px-3 rounded-lg text-[10px] cursor-pointer transition-colors ${stateFilter === "all" ? "bg-[#ff5222] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
          style={{ fontWeight: 600, ...ss04 }}
        >
          All ({jobs.length})
        </button>
        {(Object.keys(STATE_META) as SettlementState[]).map(s => (
          <button
            key={s}
            onClick={() => { setStateFilter(s); setActiveStateDiagram(s); }}
            className={`h-7 px-3 rounded-lg text-[10px] cursor-pointer transition-colors ${stateFilter === s ? "bg-[#ff5222] text-white" : `bg-[#f5f6f8] ${STATE_META[s].color} hover:bg-[#e5e7eb]`}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            {STATE_META[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Main content: Queue + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
        <BatchQueue jobs={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        {selectedJob ? (
          <JobDetail job={selectedJob} onTransition={handleTransition} />
        ) : (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl flex items-center justify-center min-h-[300px]">
            <p className="text-[#b0b3b8] text-[12px]" style={ss04}>Select a job to view details</p>
          </div>
        )}
      </div>

      {/* Transition rules reference */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
        <h3 className="text-[#070808] text-[13px] mb-3" style={{ fontWeight: 700, ...ss04 }}>Transition Rules Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(Object.entries(TRANSITIONS) as [SettlementState, SettlementState[]][]).map(([from, tos]) => (
            <div key={from} className="flex items-center gap-2 py-1.5 px-2 bg-[#f9fafb] rounded-lg">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATE_META[from].bg} ${STATE_META[from].color}`} style={{ fontWeight: 700, ...ss04 }}>{STATE_META[from].label}</span>
              <svg className="size-3 text-[#d1d5db]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6h8M8 3l3 3-3 3" /></svg>
              {tos.length > 0 ? tos.map(t => (
                <span key={t} className={`text-[9px] px-1 py-0.5 rounded ${STATE_META[t].bg} ${STATE_META[t].color}`} style={{ fontWeight: 600, ...ss04 }}>{STATE_META[t].label}</span>
              )) : (
                <span className="text-[9px] text-[#d1d5db]" style={ss04}>Terminal</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
