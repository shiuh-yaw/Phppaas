import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

/* ==================== WEBSOCKET EVENT TYPES ==================== */
type WsEventType = "admin_join" | "admin_leave" | "transition" | "dry_run" | "dry_run_commit" | "system" | "alert" | "batch_progress" | "dispute_filed";

interface WsEvent {
  id: string;
  type: WsEventType;
  timestamp: string;
  adminName: string | null;
  adminRole: string | null;
  adminAvatar: string;
  message: string;
  jobId: string | null;
}

interface ConnectedAdmin {
  name: string;
  role: string;
  avatar: string;
  lastSeen: string;
  viewing: string | null;
}

/* ==================== DRY RUN TYPES ==================== */
interface DryRunResult {
  jobId: string;
  targetState: SettlementState;
  winningOutcome: string | null;
  totalBets: number;
  winningBets: number;
  losingBets: number;
  voidedBets: number;
  totalVolume: number;
  payoutBreakdown: { category: string; count: number; amount: number; pct: number }[];
  platformFee: number;
  netPayout: number;
  estimatedDuration: string;
  riskFlags: string[];
  walletImpact: { hotWalletBefore: number; hotWalletAfter: number; coldReserve: number; requiresTopUp: boolean };
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

/* States where dry-run makes sense (payout-affecting transitions) */
const DRY_RUN_ELIGIBLE: Record<SettlementState, SettlementState[]> = {
  open: [], closed: [], resolving: [], failed: [],
  resolved:  ["settling"],
  settling:  [],
  settled:   [],
  voided:    [],
  disputed:  ["resolved"],
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

/* ==================== MOCK CONNECTED ADMINS ==================== */
const MOCK_ADMINS: ConnectedAdmin[] = [
  { name: "Rico Mangubat", role: "platform_admin", avatar: "#ff5222", lastSeen: "now", viewing: "STL-001" },
  { name: "Jasmine Reyes", role: "merchant_admin", avatar: "#6366f1", lastSeen: "2m ago", viewing: "STL-005" },
  { name: "Ben Santos", role: "risk_analyst", avatar: "#059669", lastSeen: "now", viewing: "STL-004" },
  { name: "Lea Villanueva", role: "finance_ops", avatar: "#d97706", lastSeen: "5m ago", viewing: null },
];

/* ==================== MOCK WS EVENT TEMPLATES ==================== */
const WS_EVENT_TEMPLATES: Omit<WsEvent, "id" | "timestamp">[] = [
  { type: "transition", adminName: "Rico Mangubat", adminRole: "platform_admin", adminAvatar: "#ff5222", message: "Transitioned STL-001 from RESOLVING to SETTLING", jobId: "STL-001" },
  { type: "dry_run", adminName: "Jasmine Reyes", adminRole: "merchant_admin", adminAvatar: "#6366f1", message: "Initiated dry-run on STL-002 (RESOLVED \u2192 SETTLING)", jobId: "STL-002" },
  { type: "dry_run_commit", adminName: "Jasmine Reyes", adminRole: "merchant_admin", adminAvatar: "#6366f1", message: "Committed dry-run on STL-002 \u2014 $128,700 payout approved", jobId: "STL-002" },
  { type: "system", adminName: null, adminRole: null, adminAvatar: "#84888c", message: "Batch BATCH-0418-A progress: 67% (1923/2847 bets processed)", jobId: "STL-001" },
  { type: "alert", adminName: null, adminRole: null, adminAvatar: "#dc2626", message: "\u26a0\ufe0f STL-004 failed: DB connection pool exhausted. Retry #3 queued.", jobId: "STL-004" },
  { type: "batch_progress", adminName: null, adminRole: null, adminAvatar: "#84888c", message: "Throughput: 847 bets/s \u00b7 Hot wallet balance: $1.2M \u00b7 Queue depth: 3", jobId: null },
  { type: "dispute_filed", adminName: "Ben Santos", adminRole: "risk_analyst", adminAvatar: "#059669", message: "Escalated STL-005 dispute \u2014 PAGASA bulletin discrepancy flagged for review", jobId: "STL-005" },
  { type: "admin_join", adminName: "Lea Villanueva", adminRole: "finance_ops", adminAvatar: "#d97706", message: "Connected to settlement engine feed", jobId: null },
  { type: "transition", adminName: "Rico Mangubat", adminRole: "platform_admin", adminAvatar: "#ff5222", message: "Voided STL-008 \u2014 full refund of $24,500 to 312 users", jobId: "STL-008" },
  { type: "system", adminName: null, adminRole: null, adminAvatar: "#84888c", message: "Color Game Round #4821 settled in 1.8s (523 bets, $28,400 payout)", jobId: "STL-003" },
  { type: "dry_run", adminName: "Rico Mangubat", adminRole: "platform_admin", adminAvatar: "#ff5222", message: "Dry-run preview on STL-005 (DISPUTED \u2192 RESOLVED) \u2014 risk flags: high-volume, disputed", jobId: "STL-005" },
  { type: "alert", adminName: null, adminRole: null, adminAvatar: "#dc2626", message: "\u26a0\ufe0f Hot wallet utilization at 78% \u2014 cold wallet top-up recommended", jobId: null },
  { type: "admin_leave", adminName: "Ben Santos", adminRole: "risk_analyst", adminAvatar: "#059669", message: "Disconnected from settlement engine feed", jobId: null },
  { type: "transition", adminName: "Jasmine Reyes", adminRole: "merchant_admin", adminAvatar: "#6366f1", message: "Transitioned STL-006 from CLOSED to RESOLVING", jobId: "STL-006" },
  { type: "batch_progress", adminName: null, adminRole: null, adminAvatar: "#84888c", message: "STL-001 checkpoint: 2400/2847 bets \u00b7 ETA 6s \u00b7 $390K disbursed", jobId: "STL-001" },
];

function nowTimestamp() {
  return new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ==================== GENERATE DRY RUN RESULT ==================== */
function generateDryRun(job: SettlementJob, targetState: SettlementState): DryRunResult {
  const winPct = 0.35 + Math.random() * 0.2;
  const losePct = 0.55 + Math.random() * 0.1;
  const voidPct = 1 - winPct - losePct;
  const winBets = Math.round(job.totalBets * winPct);
  const loseBets = Math.round(job.totalBets * losePct);
  const voidBets = job.totalBets - winBets - loseBets;
  const winPayout = Math.round(job.totalVolume * (0.58 + Math.random() * 0.12));
  const voidRefund = Math.round(job.totalVolume * voidPct);
  const fee = Math.round(job.totalVolume * 0.05);
  const net = winPayout + voidRefund;
  const hotBefore = 1_250_000 + Math.round(Math.random() * 200000);
  const hotAfter = hotBefore - net;

  const riskFlags: string[] = [];
  if (job.totalVolume > 200000) riskFlags.push("High volume market (>$200K)");
  if (job.state === "disputed") riskFlags.push("Previously disputed \u2014 requires dual approval");
  if (net > hotBefore * 0.5) riskFlags.push("Payout exceeds 50% of hot wallet");
  if (job.retries > 0) riskFlags.push(`${job.retries} previous retries \u2014 verify idempotency`);
  if (winPct > 0.5) riskFlags.push("Abnormally high win rate (>50%)");

  return {
    jobId: job.id,
    targetState,
    winningOutcome: job.winningOutcome,
    totalBets: job.totalBets,
    winningBets: winBets,
    losingBets: loseBets,
    voidedBets: voidBets,
    totalVolume: job.totalVolume,
    payoutBreakdown: [
      { category: "Winner payouts", count: winBets, amount: winPayout, pct: Math.round((winPayout / net) * 100) },
      { category: "Voided refunds", count: voidBets, amount: voidRefund, pct: Math.round((voidRefund / net) * 100) },
      { category: "Platform fee (5%)", count: job.totalBets, amount: fee, pct: 0 },
    ],
    platformFee: fee,
    netPayout: net,
    estimatedDuration: `${(job.totalBets / 847).toFixed(1)}s`,
    riskFlags,
    walletImpact: { hotWalletBefore: hotBefore, hotWalletAfter: hotAfter, coldReserve: 5_000_000, requiresTopUp: hotAfter < 200_000 },
  };
}

/* ==================== EVENT TYPE STYLING ==================== */
const WS_TYPE_STYLE: Record<WsEventType, { icon: string; color: string; bgDot: string }> = {
  admin_join:     { icon: "\u2192", color: "text-emerald-600", bgDot: "bg-emerald-500" },
  admin_leave:    { icon: "\u2190", color: "text-gray-400", bgDot: "bg-gray-400" },
  transition:     { icon: "\u21bb", color: "text-blue-600", bgDot: "bg-blue-500" },
  dry_run:        { icon: "\u25b6", color: "text-violet-600", bgDot: "bg-violet-500" },
  dry_run_commit: { icon: "\u2713", color: "text-emerald-600", bgDot: "bg-emerald-500" },
  system:         { icon: "\u2699", color: "text-[#84888c]", bgDot: "bg-gray-400" },
  alert:          { icon: "!", color: "text-red-600", bgDot: "bg-red-500" },
  batch_progress: { icon: "\u2261", color: "text-[#84888c]", bgDot: "bg-blue-400" },
  dispute_filed:  { icon: "\u26a0", color: "text-rose-600", bgDot: "bg-rose-500" },
};

/* ==================== WEBSOCKET EVENT STREAM PANEL ==================== */
function WsEventStreamPanel({ events, admins }: { events: WsEvent[]; admins: ConnectedAdmin[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden flex flex-col" style={{ height: 420 }}>
      {/* Header with presence */}
      <div className="px-4 py-3 border-b border-[#f0f1f3] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[#070808] text-[13px]" style={{ fontWeight: 700, ...ss04 }}>Live Event Stream</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontWeight: 600, ...ss04 }}>
            WS Connected
          </span>
        </div>
        <div className="flex items-center gap-1">
          {admins.map((a, i) => (
            <div
              key={a.name}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] border-2 border-white"
              style={{ fontWeight: 700, backgroundColor: a.avatar, marginLeft: i > 0 ? -6 : 0, zIndex: admins.length - i }}
              title={`${a.name} (${a.role})${a.viewing ? ` \u2014 viewing ${a.viewing}` : ""}`}
            >
              {a.name.split(" ").map(n => n[0]).join("")}
            </div>
          ))}
          <span className="text-[9px] text-[#b0b3b8] ml-1" style={{ fontWeight: 500, ...ss04 }}>{admins.length} online</span>
        </div>
      </div>

      {/* Presence bar */}
      <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#f0f1f3] flex gap-3 flex-shrink-0 overflow-x-auto">
        {admins.map(a => (
          <div key={a.name} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.lastSeen === "now" ? "#10b981" : "#d1d5db" }} />
            <span className="text-[9px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{a.name}</span>
            <span className="text-[8px] text-[#b0b3b8]" style={ss04}>{a.role.replace("_", " ")}</span>
            {a.viewing && <span className="text-[8px] px-1 py-0.5 rounded bg-blue-50 text-blue-500" style={{ fontWeight: 500, ...ss04 }}>{a.viewing}</span>}
          </div>
        ))}
      </div>

      {/* Event feed */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {events.map(e => {
          const style = WS_TYPE_STYLE[e.type];
          return (
            <div key={e.id} className="flex items-start gap-2 py-1 group hover:bg-[#f9fafb] rounded-lg px-1 transition-colors">
              <div className={`w-4 h-4 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center ${style.bgDot}`}>
                <span className="text-white text-[8px]">{style.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#b0b3b8]" style={ss04}>{e.timestamp}</span>
                  {e.adminName && (
                    <>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] flex-shrink-0" style={{ fontWeight: 700, backgroundColor: e.adminAvatar }}>
                        {e.adminName.split(" ").map(n => n[0]).join("")}
                      </span>
                      <span className="text-[10px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{e.adminName}</span>
                    </>
                  )}
                  {!e.adminName && <span className="text-[10px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss04 }}>System</span>}
                  {e.jobId && <span className="text-[8px] px-1 py-0.5 rounded bg-[#f5f6f8] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>{e.jobId}</span>}
                </div>
                <p className={`text-[10px] mt-0.5 ${style.color}`} style={{ fontWeight: 500, ...ss04 }}>{e.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <button
          onClick={() => { setAutoScroll(true); if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }}
          className="mx-3 mb-2 px-3 py-1.5 bg-[#ff5222] text-white rounded-lg text-[10px] cursor-pointer hover:bg-[#e04a1f] transition-colors"
          style={{ fontWeight: 600, ...ss04 }}
        >
          &darr; Resume auto-scroll ({events.length} events)
        </button>
      )}
    </div>
  );
}

/* ==================== DRY RUN MODAL ==================== */
function DryRunModal({ result, onCommit, onCancel, isRunning }: { result: DryRunResult; onCommit: () => void; onCancel: () => void; isRunning: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={pp}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-y-auto shadow-2xl" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#f0f1f3] px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg className="size-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <div>
                <h3 className="text-[#070808] text-[15px]" style={{ fontWeight: 700, ...ss04 }}>Dry Run Preview</h3>
                <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                  {result.jobId} &rarr; {STATE_META[result.targetState].label} &middot; No changes committed yet
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-[#f5f6f8] flex items-center justify-center text-[#84888c] hover:bg-[#e5e7eb] cursor-pointer transition-colors">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Outcome + Bet Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Winning Outcome", value: result.winningOutcome || "N/A", accent: true },
              { label: "Winning Bets", value: result.winningBets.toLocaleString(), sub: `${(result.winningBets / result.totalBets * 100).toFixed(1)}%` },
              { label: "Losing Bets", value: result.losingBets.toLocaleString(), sub: `${(result.losingBets / result.totalBets * 100).toFixed(1)}%` },
              { label: "Voided Bets", value: result.voidedBets.toLocaleString(), sub: `${(result.voidedBets / result.totalBets * 100).toFixed(1)}%` },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 ${s.accent ? "bg-[#ff5222]/5 border border-[#ff5222]/20" : "bg-[#f5f6f8]"}`}>
                <p className="text-[#b0b3b8] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
                <p className={`text-[16px] ${s.accent ? "text-[#ff5222]" : "text-[#070808]"}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
                {"sub" in s && s.sub && <p className="text-[9px] text-[#b0b3b8]" style={ss04}>{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Payout Breakdown */}
          <div className="bg-[#f9fafb] rounded-xl p-4">
            <p className="text-[10px] text-[#b0b3b8] mb-2.5" style={{ fontWeight: 600, ...ss04 }}>PAYOUT BREAKDOWN</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  {["Category", "Count", "Amount", "Share"].map(h => (
                    <th key={h} className="text-[9px] text-[#b0b3b8] py-1.5 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.payoutBreakdown.map(r => (
                  <tr key={r.category} className="border-b border-[#f0f1f3] last:border-0">
                    <td className="text-[11px] text-[#070808] py-1.5" style={{ fontWeight: 500, ...ss04 }}>{r.category}</td>
                    <td className="text-[11px] text-[#84888c] py-1.5" style={ss04}>{r.count.toLocaleString()}</td>
                    <td className="text-[11px] text-[#070808] py-1.5" style={{ fontWeight: 600, ...ss04 }}>${r.amount.toLocaleString()}</td>
                    <td className="text-[11px] text-[#84888c] py-1.5" style={ss04}>{r.pct > 0 ? `${r.pct}%` : "--"}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#e5e7eb]">
                  <td className="text-[11px] text-[#070808] py-2" style={{ fontWeight: 700, ...ss04 }}>Net Payout</td>
                  <td className="text-[11px] text-[#84888c] py-2" style={ss04}>{result.totalBets.toLocaleString()}</td>
                  <td className="text-[13px] text-[#ff5222] py-2" style={{ fontWeight: 700, ...ss04 }}>${result.netPayout.toLocaleString()}</td>
                  <td className="text-[10px] text-[#b0b3b8] py-2" style={ss04}>Est: {result.estimatedDuration}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Wallet Impact */}
          <div className="bg-[#f9fafb] rounded-xl p-4">
            <p className="text-[10px] text-[#b0b3b8] mb-2.5" style={{ fontWeight: 600, ...ss04 }}>WALLET IMPACT</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[9px] text-[#b0b3b8]" style={ss04}>Hot Wallet (Before)</p>
                <p className="text-[13px] text-[#070808]" style={{ fontWeight: 700, ...ss04 }}>${result.walletImpact.hotWalletBefore.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#b0b3b8]" style={ss04}>Hot Wallet (After)</p>
                <p className={`text-[13px] ${result.walletImpact.hotWalletAfter < 200_000 ? "text-red-600" : "text-[#070808]"}`} style={{ fontWeight: 700, ...ss04 }}>${result.walletImpact.hotWalletAfter.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#b0b3b8]" style={ss04}>Cold Reserve</p>
                <p className="text-[13px] text-[#070808]" style={{ fontWeight: 700, ...ss04 }}>${result.walletImpact.coldReserve.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#b0b3b8]" style={ss04}>Top-Up Required?</p>
                <p className={`text-[13px] ${result.walletImpact.requiresTopUp ? "text-red-600" : "text-emerald-600"}`} style={{ fontWeight: 700, ...ss04 }}>{result.walletImpact.requiresTopUp ? "YES" : "No"}</p>
              </div>
            </div>
            {/* Visual bar: wallet utilization */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[9px] text-[#b0b3b8] mb-1" style={ss04}>
                <span>Wallet Utilization</span>
                <span>{Math.round(((result.walletImpact.hotWalletBefore - result.walletImpact.hotWalletAfter) / result.walletImpact.hotWalletBefore) * 100)}% of hot wallet</span>
              </div>
              <div className="h-2.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${result.walletImpact.requiresTopUp ? "bg-red-500" : "bg-[#ff5222]"}`}
                  style={{ width: `${Math.min(100, ((result.walletImpact.hotWalletBefore - result.walletImpact.hotWalletAfter) / result.walletImpact.hotWalletBefore) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Flags */}
          {result.riskFlags.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[10px] text-amber-700 mb-2" style={{ fontWeight: 600, ...ss04 }}>RISK FLAGS ({result.riskFlags.length})</p>
              <div className="space-y-1.5">
                {result.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-[11px] text-amber-800" style={{ fontWeight: 500, ...ss04 }}>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#f0f1f3] px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <div className="text-[9px] text-[#b0b3b8]" style={ss04}>
            Platform fee: <span className="text-[#070808]" style={{ fontWeight: 600 }}>${result.platformFee.toLocaleString()}</span> &middot; Estimated: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{result.estimatedDuration}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="h-9 px-5 rounded-xl bg-[#f5f6f8] text-[#84888c] text-[12px] cursor-pointer hover:bg-[#e5e7eb] transition-colors"
              style={{ fontWeight: 600, ...ss04 }}
            >
              Cancel
            </button>
            <button
              onClick={onCommit}
              disabled={isRunning}
              className="h-9 px-5 rounded-xl bg-[#ff5222] text-white text-[12px] cursor-pointer hover:bg-[#e04a1f] transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ fontWeight: 600, ...ss04 }}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Committing...
                </>
              ) : (
                <>Commit Transition &rarr; {STATE_META[result.targetState].label}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
function JobDetail({ job, onTransition, onDryRun }: { job: SettlementJob; onTransition: (jobId: string, to: SettlementState) => void; onDryRun: (jobId: string, to: SettlementState) => void }) {
  const transitions = TRANSITIONS[job.state];
  const dryRunEligible = DRY_RUN_ELIGIBLE[job.state] || [];

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
        <div className="flex gap-4 text-[10px] flex-wrap" style={ss04}>
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
            {transitions.map(t => {
              const isDryRunEligible = dryRunEligible.includes(t);
              return (
                <div key={t} className="flex gap-0.5">
                  {isDryRunEligible && (
                    <button
                      onClick={() => onDryRun(job.id, t)}
                      className="h-8 px-2.5 rounded-l-xl border cursor-pointer transition-all hover:scale-105 bg-violet-50 border-violet-200 text-violet-600"
                      style={{ fontWeight: 600, ...ss04, fontSize: 10 }}
                      title="Dry Run: Preview payout before committing"
                    >
                      <svg className="size-3.5 inline-block" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 8a6 6 0 1112 0A6 6 0 012 8z" />
                        <path d="M6.5 5.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
                      </svg>
                      {" "}DRY RUN
                    </button>
                  )}
                  <button
                    onClick={() => onTransition(job.id, t)}
                    className={`h-8 px-4 ${isDryRunEligible ? "rounded-r-xl" : "rounded-xl"} border cursor-pointer transition-all hover:scale-105 ${STATE_META[t].bg} ${STATE_META[t].color}`}
                    style={{ fontWeight: 600, ...ss04, fontSize: 11 }}
                  >
                    &rarr; {STATE_META[t].label}
                  </button>
                </div>
              );
            })}
          </div>
          {dryRunEligible.length > 0 && (
            <p className="text-[8px] text-violet-400 mt-1.5" style={ss04}>
              <svg className="size-2.5 inline-block mr-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8a6 6 0 1112 0A6 6 0 012 8z" /><path d="M6.5 5.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" /></svg>
              Dry Run previews payout calculations, wallet impact, and risk flags without committing the transition.
            </p>
          )}
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
function BatchQueue({ jobs, selectedId, onSelect, connectedAdmins }: { jobs: SettlementJob[]; selectedId: string | null; onSelect: (id: string) => void; connectedAdmins: ConnectedAdmin[] }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f1f3]">
        <h3 className="text-[#070808] text-[13px]" style={{ fontWeight: 700, ...ss04 }}>Settlement Queue</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 850 }}>
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {["Job ID", "Market", "State", "Bets", "Volume", "Progress", "Batch", "Viewers", "Updated"].map(h => (
                <th key={h} className="text-[#b0b3b8] text-[10px] px-3 py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => {
              const viewers = connectedAdmins.filter(a => a.viewing === j.id);
              return (
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
                  <td className="px-3 py-2.5">
                    {viewers.length > 0 ? (
                      <div className="flex items-center">
                        {viewers.map((v, i) => (
                          <div
                            key={v.name}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] border border-white"
                            style={{ fontWeight: 700, backgroundColor: v.avatar, marginLeft: i > 0 ? -4 : 0, zIndex: viewers.length - i }}
                            title={v.name}
                          >
                            {v.name.split(" ").map(n => n[0]).join("")}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#d1d5db]" style={ss04}>--</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[#b0b3b8] text-[10px]" style={ss04}>{j.updatedAt}</td>
                </tr>
              );
            })}
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

  // Dry run state
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [dryRunCommitting, setDryRunCommitting] = useState(false);

  // WebSocket event stream state
  const [wsEvents, setWsEvents] = useState<WsEvent[]>(() => {
    // Seed with a few initial events
    return WS_EVENT_TEMPLATES.slice(0, 4).map((t, i) => ({
      ...t,
      id: `ws-init-${i}`,
      timestamp: new Date(Date.now() - (4 - i) * 15000).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }));
  });
  const [connectedAdmins] = useState<ConnectedAdmin[]>(MOCK_ADMINS);
  const wsEventCounter = useRef(0);
  const wsTemplateIdx = useRef(4);

  // Simulate incoming WebSocket events
  useEffect(() => {
    const iv = setInterval(() => {
      const template = WS_EVENT_TEMPLATES[wsTemplateIdx.current % WS_EVENT_TEMPLATES.length];
      wsTemplateIdx.current++;
      wsEventCounter.current++;
      setWsEvents(prev => {
        const newEvent: WsEvent = {
          ...template,
          id: `ws-${wsEventCounter.current}`,
          timestamp: nowTimestamp(),
        };
        const next = [...prev, newEvent];
        return next.length > 100 ? next.slice(-80) : next;
      });
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);

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
            updatedAt: nowTimestamp(),
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
        // Emit ws event
        wsEventCounter.current++;
        setWsEvents(prev => [...prev, {
          id: `ws-auto-${wsEventCounter.current}`,
          type: "system",
          timestamp: nowTimestamp(),
          adminName: null, adminRole: null, adminAvatar: "#84888c",
          message: `${j.id} auto-settled: ${j.totalBets} bets, $${j.payoutAmount.toLocaleString()} payout`,
          jobId: j.id,
        }]);
        return { ...j, state: "settled" as SettlementState, completedAt: nowTimestamp() };
      }
      return j;
    }));
  }, [jobs, admin]);

  const emitWsEvent = useCallback((type: WsEventType, message: string, jobId: string | null) => {
    wsEventCounter.current++;
    const adminName = admin?.email?.split("@")[0] || "You";
    setWsEvents(prev => [...prev, {
      id: `ws-user-${wsEventCounter.current}`,
      type,
      timestamp: nowTimestamp(),
      adminName,
      adminRole: admin?.role || "merchant_admin",
      adminAvatar: "#ff5222",
      message,
      jobId,
    }]);
  }, [admin]);

  const handleTransition = useCallback((jobId: string, to: SettlementState) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const now = nowTimestamp();
      const updated = { ...j, state: to, updatedAt: now };
      if (to === "settling") updated.startedAt = now;
      if (to === "voided") { updated.payoutAmount = updated.totalVolume; updated.completedAt = now; }
      if (to === "resolving" || to === "settling") { updated.retries = j.state === "failed" ? j.retries + 1 : j.retries; }
      return updated;
    }));
    showOmsToast(`${jobId} transitioned to ${STATE_META[to].label}`, "info");
    emitWsEvent("transition", `Transitioned ${jobId} to ${STATE_META[to].label}`, jobId);
    if (admin) {
      logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "settlement_transition", target: jobId, detail: `State -> ${to}` });
    }
  }, [admin, emitWsEvent]);

  // Dry run handlers
  const handleDryRun = useCallback((jobId: string, to: SettlementState) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const result = generateDryRun(job, to);
    setDryRunResult(result);
    emitWsEvent("dry_run", `Initiated dry-run on ${jobId} (${STATE_META[job.state].label} \u2192 ${STATE_META[to].label})`, jobId);
    if (admin) {
      logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "settlement_dry_run", target: jobId, detail: `Dry run: ${job.state} -> ${to}, est payout: $${result.netPayout.toLocaleString()}` });
    }
  }, [jobs, admin, emitWsEvent]);

  const handleDryRunCommit = useCallback(() => {
    if (!dryRunResult) return;
    setDryRunCommitting(true);
    setTimeout(() => {
      handleTransition(dryRunResult.jobId, dryRunResult.targetState);
      emitWsEvent("dry_run_commit", `Committed dry-run on ${dryRunResult.jobId} \u2014 $${dryRunResult.netPayout.toLocaleString()} payout approved`, dryRunResult.jobId);
      showOmsToast(`Dry-run committed: ${dryRunResult.jobId} \u2192 ${STATE_META[dryRunResult.targetState].label}`, "success");
      setDryRunResult(null);
      setDryRunCommitting(false);
    }, 1200);
  }, [dryRunResult, handleTransition, emitWsEvent]);

  const filtered = stateFilter === "all" ? jobs : jobs.filter(j => j.state === stateFilter);
  const selectedJob = jobs.find(j => j.id === selectedId) || null;

  // Count by state
  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.state] = (acc[j.state] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4" style={pp}>
      {/* Dry Run Modal */}
      {dryRunResult && (
        <DryRunModal
          result={dryRunResult}
          onCommit={handleDryRunCommit}
          onCancel={() => { setDryRunResult(null); setDryRunCommitting(false); }}
          isRunning={dryRunCommitting}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>Settlement Engine</h2>
          <p className="text-[#b0b3b8] text-[11px]" style={ss04}>Visual state machine &middot; Batch processing &middot; Real-time collaboration</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connected admins presence */}
          <div className="flex items-center gap-1.5">
            {connectedAdmins.slice(0, 4).map((a, i) => (
              <div
                key={a.name}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] border-2 border-white shadow-sm"
                style={{ fontWeight: 700, backgroundColor: a.avatar, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }}
                title={`${a.name} (${a.role})${a.viewing ? ` — viewing ${a.viewing}` : ""}`}
              >
                {a.name.split(" ").map(n => n[0]).join("")}
              </div>
            ))}
            <span className="text-[9px] text-[#b0b3b8]" style={{ fontWeight: 500, ...ss04 }}>{connectedAdmins.length} admins</span>
          </div>
          <div className="w-px h-5 bg-[#e5e7eb]" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>ENGINE ONLINE</span>
          </div>
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
        <BatchQueue jobs={filtered} selectedId={selectedId} onSelect={setSelectedId} connectedAdmins={connectedAdmins} />
        {selectedJob ? (
          <JobDetail job={selectedJob} onTransition={handleTransition} onDryRun={handleDryRun} />
        ) : (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl flex items-center justify-center min-h-[300px]">
            <p className="text-[#b0b3b8] text-[12px]" style={ss04}>Select a job to view details</p>
          </div>
        )}
      </div>

      {/* WebSocket Event Stream */}
      <WsEventStreamPanel events={wsEvents} admins={connectedAdmins} />

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
