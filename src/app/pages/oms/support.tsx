import { useState, useEffect } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type Priority = "critical" | "high" | "medium" | "low";
type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";

interface Ticket {
  id: string;
  subject: string;
  category: "withdrawal" | "deposit" | "account" | "bet_dispute" | "kyc" | "technical" | "promo" | "other";
  priority: Priority;
  status: TicketStatus;
  user: string;
  userId: string;
  email: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { sender: string; role: "user" | "agent"; message: string; time: string }[];
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-001", subject: "GCash withdrawal pending for 3 days", category: "withdrawal", priority: "critical", status: "open",
    user: "Maria Santos", userId: "U001", email: "maria.s@gmail.com", assignedTo: null, createdAt: "2026-03-13 08:30", updatedAt: "2026-03-13 08:30",
    messages: [
      { sender: "Maria Santos", role: "user", message: "I requested a withdrawal of ₱12,500 via GCash 3 days ago and it's still pending. My GCash number is 0917-xxx-xxxx. Please process ASAP.", time: "08:30" },
    ],
  },
  {
    id: "TKT-002", subject: "Bet not settled — PBA Game 4 already finished", category: "bet_dispute", priority: "high", status: "in_progress",
    user: "JM Reyes", userId: "U002", email: "jm.reyes@yahoo.com", assignedTo: "Jenny Lim", createdAt: "2026-03-12 22:00", updatedAt: "2026-03-13 07:45",
    messages: [
      { sender: "JM Reyes", role: "user", message: "PBA Game 4 ended hours ago but my ₱5,000 bet on Ginebra hasn't been settled. Bet ID: BET-7723. Please check.", time: "22:00" },
      { sender: "Jenny Lim", role: "agent", message: "Hi JM, checking with our markets team now. The game result is being verified. Will update you within the hour.", time: "07:45" },
    ],
  },
  {
    id: "TKT-003", subject: "KYC rejected but I submitted valid ID", category: "kyc", priority: "medium", status: "waiting",
    user: "Ken Villanueva", userId: "U003", email: "ken.v@gmail.com", assignedTo: "Jenny Lim", createdAt: "2026-03-11 14:20", updatedAt: "2026-03-12 09:00",
    messages: [
      { sender: "Ken Villanueva", role: "user", message: "My KYC was rejected but I submitted a valid Philippine passport. Can you tell me what was wrong?", time: "14:20" },
      { sender: "Jenny Lim", role: "agent", message: "Ken, the photo was blurry. Please resubmit with a clear photo. Make sure all 4 corners of the ID are visible.", time: "16:00" },
      { sender: "Ken Villanueva", role: "user", message: "I resubmitted. Please check again.", time: "09:00" },
    ],
  },
  {
    id: "TKT-004", subject: "WELCOME50 promo code not working", category: "promo", priority: "low", status: "open",
    user: "Cherry Aquino", userId: "U009", email: "cherry.a@gmail.com", assignedTo: null, createdAt: "2026-03-13 06:15", updatedAt: "2026-03-13 06:15",
    messages: [
      { sender: "Cherry Aquino", role: "user", message: "I tried to use the WELCOME50 code but it says 'Code already used'. I've never used it before. My deposit was ₱2,000.", time: "06:15" },
    ],
  },
  {
    id: "TKT-005", subject: "Deposited via Maya but balance not updated", category: "deposit", priority: "high", status: "in_progress",
    user: "Dennis Cruz", userId: "U010", email: "dennis.c@gmail.com", assignedTo: "Miguel Torres", createdAt: "2026-03-12 18:00", updatedAt: "2026-03-13 08:00",
    messages: [
      { sender: "Dennis Cruz", role: "user", message: "I deposited ₱5,000 via Maya at 6pm but my balance didn't update. Reference number: MAYA-2026031218xxxx.", time: "18:00" },
      { sender: "Miguel Torres", role: "agent", message: "Dennis, we're checking with Maya. Your deposit is being traced. Will update within 24 hours.", time: "08:00" },
    ],
  },
  {
    id: "TKT-006", subject: "App keeps crashing on market detail page", category: "technical", priority: "medium", status: "open",
    user: "Rosa Lim", userId: "U005", email: "rosa.lim@gmail.com", assignedTo: null, createdAt: "2026-03-13 07:00", updatedAt: "2026-03-13 07:00",
    messages: [
      { sender: "Rosa Lim", role: "user", message: "When I click on the PBA Finals market, the page freezes and I have to reload. Using Chrome on Android. Started happening today.", time: "07:00" },
    ],
  },
  {
    id: "TKT-007", subject: "Account locked after multiple login attempts", category: "account", priority: "high", status: "resolved",
    user: "Patricia Go", userId: "U007", email: "pat.go@gmail.com", assignedTo: "Jenny Lim", createdAt: "2026-03-12 10:00", updatedAt: "2026-03-12 11:30",
    messages: [
      { sender: "Patricia Go", role: "user", message: "I forgot my password and now my account is locked. Please help me get back in.", time: "10:00" },
      { sender: "Jenny Lim", role: "agent", message: "Hi Patricia, I've unlocked your account and sent a password reset link to your email. Let us know if you need further help.", time: "11:30" },
    ],
  },
];

const AGENTS = ["Jenny Lim", "Miguel Torres", "Ana Dela Cruz", "Carlos Reyes"];

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = { critical: "bg-red-500/15 text-red-400", high: "bg-orange-500/15 text-orange-400", medium: "bg-amber-500/15 text-amber-400", low: "bg-gray-500/15 text-gray-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[priority]}`} style={{ fontWeight: 600 }}>{priority.toUpperCase()}</span>;
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = { open: "bg-red-500/15 text-red-400", in_progress: "bg-blue-500/15 text-blue-400", waiting: "bg-amber-500/15 text-amber-400", resolved: "bg-emerald-500/15 text-emerald-400", closed: "bg-gray-500/15 text-gray-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.replace("_", " ").toUpperCase()}</span>;
}

function CatBadge({ category }: { category: string }) {
  const map: Record<string, string> = { withdrawal: "text-emerald-400", deposit: "text-blue-400", account: "text-purple-400", bet_dispute: "text-amber-400", kyc: "text-cyan-400", technical: "text-gray-400", promo: "text-pink-400", other: "text-gray-400" };
  return <span className={`text-[10px] ${map[category] || "text-gray-400"}`} style={{ fontWeight: 500 }}>{category.replace("_", " ")}</span>;
}

export default function OmsSupport() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalType, setModalType] = useState<"view" | "reply" | "assign" | "resolve" | "close" | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const rbac = useRBAC();

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 600); return () => clearTimeout(timer); }, []);

  const filtered = tickets.filter(t => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.user.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const progressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("support.open", "Open"), value: String(openCount), color: openCount > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "In Progress", value: String(progressCount), color: "text-blue-400" },
          { label: "Waiting on User", value: String(tickets.filter(t => t.status === "waiting").length), color: "text-amber-400" },
          { label: "Resolved Today", value: String(tickets.filter(t => t.status === "resolved").length), color: "text-emerald-400" },
          { label: "Total Tickets", value: String(tickets.length), color: "text-white" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[280px]">
          <svg className="size-3.5 text-[#6b7280]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder="Search tickets..." />
        </div>
        <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5">
          {(["all", "open", "in_progress", "waiting", "resolved"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-[11px] px-3 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap ${statusFilter === s ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 500 }}>
              {s === "all" ? "All" : s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className={`bg-[#111827] border rounded-xl p-4 cursor-pointer hover:bg-[#111827]/80 transition-colors ${t.priority === "critical" ? "border-red-500/30" : t.status === "open" ? "border-amber-500/20" : "border-[#1f2937]"}`} onClick={() => { setSelectedTicket(t); setModalType("view"); }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[#4b5563] text-[10px] font-mono">{t.id}</span>
                  <PriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                  <CatBadge category={t.category} />
                </div>
                <p className="text-white text-[13px] mb-0.5" style={{ fontWeight: 500 }}>{t.subject}</p>
                <div className="flex items-center gap-3 text-[10px] text-[#6b7280]">
                  <span>{t.user} ({t.userId})</span>
                  <span>{t.createdAt}</span>
                  {t.assignedTo ? <span className="text-blue-400">Assigned: {t.assignedTo}</span> : <span className="text-amber-400">Unassigned</span>}
                  <span>{t.messages.length} messages</span>
                </div>
              </div>
              <svg className="size-4 text-[#4b5563] flex-shrink-0 mt-1" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l4 4-4 4" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <OmsModal open={modalType === "view" && !!selectedTicket} onClose={() => setModalType(null)} title={selectedTicket?.subject || ""} subtitle={`${selectedTicket?.id} · ${selectedTicket?.user}`} width="max-w-[640px]">
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <PriorityBadge priority={selectedTicket.priority} />
              <TicketStatusBadge status={selectedTicket.status} />
              <CatBadge category={selectedTicket.category} />
              {selectedTicket.assignedTo ? (
                <span className="text-blue-400 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full">Assigned: {selectedTicket.assignedTo}</span>
              ) : (
                <span className="text-amber-400 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">Unassigned</span>
              )}
            </div>

            {/* Message thread */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedTicket.messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-[#0a0e1a] border border-[#1f2937]" : "bg-[#ff5222]/5 border border-[#ff5222]/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] ${m.role === "agent" ? "text-[#ff5222]" : "text-white"}`} style={{ fontWeight: 600 }}>{m.sender}</span>
                    <span className="text-[#4b5563] text-[10px]">{m.time}</span>
                  </div>
                  <p className="text-[#d1d5db] text-[12px] leading-[1.6]">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap pt-2 border-t border-[#1f2937]">
              <OmsBtn variant="primary" onClick={() => { setReplyMsg(""); setModalType("reply"); }}>Reply</OmsBtn>
              {!selectedTicket.assignedTo && (
                <OmsBtn variant="secondary" onClick={() => { setAssignTo(""); setModalType("assign"); }}>Assign</OmsBtn>
              )}
              {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                <OmsBtn variant="success" onClick={() => setModalType("resolve")}>Resolve</OmsBtn>
              )}
              {selectedTicket.status === "resolved" && (
                <OmsBtn variant="ghost" onClick={() => setModalType("close")}>Close Ticket</OmsBtn>
              )}
            </div>
          </div>
        )}
      </OmsModal>

      {/* Reply Modal */}
      <OmsModal open={modalType === "reply" && !!selectedTicket} onClose={() => setModalType(null)} title="Reply to Ticket" subtitle={selectedTicket?.id}>
        <div className="space-y-3">
          <OmsField label="Your Reply" required>
            <OmsTextarea value={replyMsg} onChange={setReplyMsg} placeholder="Type your response..." rows={4} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType("view")}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!replyMsg.trim()) { showOmsToast("Reply cannot be empty", "error"); return; }
              setTickets(prev => prev.map(t => t.id === selectedTicket!.id ? {
                ...t, status: "in_progress" as const, updatedAt: "2026-03-13 09:50",
                messages: [...t.messages, { sender: t.assignedTo || "Carlos Reyes", role: "agent" as const, message: replyMsg, time: "09:50" }],
              } : t));
              setModalType(null);
              showOmsToast(`Reply sent on ${selectedTicket!.id}`);
            }}>Send Reply</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Assign Modal */}
      <OmsModal open={modalType === "assign" && !!selectedTicket} onClose={() => setModalType(null)} title="Assign Ticket" subtitle={selectedTicket?.id}>
        <div className="space-y-3">
          <OmsField label="Assign To" required>
            <OmsSelect value={assignTo} onChange={setAssignTo} options={[
              { value: "", label: "Select agent..." },
              ...AGENTS.map(a => ({ value: a, label: a })),
            ]} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType("view")}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!assignTo) { showOmsToast("Select an agent", "error"); return; }
              setTickets(prev => prev.map(t => t.id === selectedTicket!.id ? { ...t, assignedTo: assignTo, status: "in_progress" as const } : t));
              setModalType(null);
              showOmsToast(`${selectedTicket!.id} assigned to ${assignTo}`);
            }}>Assign</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Resolve Modal */}
      <OmsModal open={modalType === "resolve" && !!selectedTicket} onClose={() => setModalType(null)} title="Resolve Ticket">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Mark ticket ${selectedTicket?.id} as resolved? The user will be notified.`} details={[
          { label: "Subject", value: selectedTicket?.subject || "" },
          { label: "User", value: selectedTicket?.user || "" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType("view")}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setTickets(prev => prev.map(t => t.id === selectedTicket!.id ? { ...t, status: "resolved" as const } : t)); setModalType(null); showOmsToast(`${selectedTicket!.id} resolved`); }}>Resolve</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Close Modal */}
      <OmsModal open={modalType === "close" && !!selectedTicket} onClose={() => setModalType(null)} title="Close Ticket">
        <OmsConfirmContent icon="info" iconColor="#6b7280" iconBg="#6b7280" message={`Close ticket ${selectedTicket?.id}? This action is final.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType("view")}>Cancel</OmsBtn>
          <OmsBtn variant="ghost" onClick={() => { setTickets(prev => prev.map(t => t.id === selectedTicket!.id ? { ...t, status: "closed" as const } : t)); setModalType(null); showOmsToast(`${selectedTicket!.id} closed`); }}>Close Ticket</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}