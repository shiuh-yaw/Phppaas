import { useState } from "react";
import { OmsModal, OmsField, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { MOCK_KYC_APPLICATIONS, MOCK_KYC_ANALYTICS, type OmsKycApplication, type KycStatus, type KycLevel } from "../../data/oms-mock";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== BADGES ==================== */
function StatusBadge({ status }: { status: KycStatus }) {
  const map: Record<KycStatus, string> = {
    not_started: "bg-gray-500/15 text-gray-400",
    pending: "bg-amber-500/15 text-amber-400",
    in_review: "bg-blue-500/15 text-blue-400",
    verified: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
    expired: "bg-orange-500/15 text-orange-400",
  };
  const labels: Record<KycStatus, string> = {
    not_started: "NOT STARTED", pending: "PENDING", in_review: "IN REVIEW",
    verified: "VERIFIED", rejected: "REJECTED", expired: "EXPIRED",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{labels[status]}</span>;
}

function LevelBadge({ level }: { level: KycLevel }) {
  const map: Record<KycLevel, string> = {
    basic: "bg-gray-500/15 text-gray-400",
    enhanced: "bg-blue-500/15 text-blue-400",
    full: "bg-purple-500/15 text-purple-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[level]}`} style={{ fontWeight: 600 }}>{level.toUpperCase()}</span>;
}

function DocStatusDot({ status }: { status: string }) {
  const c = status === "accepted" ? "bg-emerald-400" : status === "rejected" ? "bg-red-400" : "bg-amber-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
}

/* ==================== SCORE BAR ==================== */
function ScoreBar({ score }: { score?: number }) {
  if (score == null) return <span className="text-[11px] text-gray-500">N/A</span>;
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] text-gray-400" style={ss04}>{score}</span>
    </div>
  );
}

/* ==================== STAT CARD ==================== */
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={pp}>{label}</div>
      <div className={`text-xl mt-0.5 ${color}`} style={{ ...pp, fontWeight: 600, ...ss04 }}>{value}</div>
    </div>
  );
}

export default function OmsKycManagement() {
  const { t } = useI18n();
  const { user } = useOmsAuth();
  const { config } = useTenantConfig();
  const { can } = useRBAC();

  const [apps, setApps] = useState(MOCK_KYC_APPLICATIONS);
  const [tab, setTab] = useState<"applications" | "analytics">("applications");
  const [statusFilter, setStatusFilter] = useState<KycStatus | "all">("all");
  const [levelFilter, setLevelFilter] = useState<KycLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalType, setModalType] = useState<"review" | "approve" | "reject" | "detail" | null>(null);
  const [selected, setSelected] = useState<OmsKycApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Mask PII by default
  const [revealedPII, setRevealedPII] = useState<Set<string>>(new Set());

  const togglePII = (id: string) => {
    const next = new Set(revealedPII);
    if (next.has(id)) { next.delete(id); } else {
      next.add(id);
      logAudit("kyc_pii_reveal", { applicationId: id }, user?.name);
    }
    setRevealedPII(next);
  };

  const maskStr = (s: string, id: string) => {
    if (revealedPII.has(id)) return s;
    if (s.length <= 4) return "****";
    return s.slice(0, 2) + "***" + s.slice(-2);
  };

  // Filter
  const filtered = apps.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (levelFilter !== "all" && a.level !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.userName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.userId.toLowerCase().includes(q);
    }
    return true;
  });

  const paged = paginate(filtered, page, pageSize);

  const openReview = (a: OmsKycApplication) => { setSelected(a); setModalType("review"); };
  const openDetail = (a: OmsKycApplication) => { setSelected(a); setModalType("detail"); };

  const handleApprove = () => {
    if (!selected) return;
    setApps(prev => prev.map(a => a.id === selected.id ? { ...a, status: "verified" as KycStatus, reviewedAt: new Date().toISOString().slice(0, 10), reviewedBy: user?.name || "Admin", notes: reviewNotes ? [...a.notes, reviewNotes] : a.notes } : a));
    logAudit("kyc_approve", { applicationId: selected.id, userId: selected.userId }, user?.name);
    showOmsToast(`KYC ${selected.id} approved`, "success");
    setModalType(null); setSelected(null); setReviewNotes("");
  };

  const handleReject = () => {
    if (!selected || !rejectReason.trim()) return;
    setApps(prev => prev.map(a => a.id === selected.id ? { ...a, status: "rejected" as KycStatus, rejectionReason: rejectReason, reviewedAt: new Date().toISOString().slice(0, 10), reviewedBy: user?.name || "Admin", notes: [...a.notes, rejectReason] } : a));
    logAudit("kyc_reject", { applicationId: selected.id, userId: selected.userId, reason: rejectReason }, user?.name);
    showOmsToast(`KYC ${selected.id} rejected`, "error");
    setModalType(null); setSelected(null); setRejectReason("");
  };

  const handleStartReview = (a: OmsKycApplication) => {
    if (a.status !== "pending") return;
    setApps(prev => prev.map(x => x.id === a.id ? { ...x, status: "in_review" as KycStatus, reviewedBy: user?.name || "Admin" } : x));
    logAudit("kyc_start_review", { applicationId: a.id }, user?.name);
    showOmsToast(`Started review of ${a.id}`, "info");
  };

  const exportCSV = () => {
    const rows = filtered.map(a => ({
      ID: a.id, User: a.userName, Email: a.email, Level: a.level, Status: a.status,
      Submitted: a.submittedAt, Reviewed: a.reviewedAt || "", ReviewedBy: a.reviewedBy || "",
      Score: a.verificationScore ?? "", Documents: a.documents.length,
    }));
    downloadCSV(rows, "kyc-applications");
    logAudit("kyc_export", { count: rows.length }, user?.name);
  };

  const analytics = MOCK_KYC_ANALYTICS;

  const tabs = [
    { key: "applications" as const, label: "Applications" },
    { key: "analytics" as const, label: "Analytics" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg text-white" style={{ ...pp, fontWeight: 600 }}>KYC Management</h1>
          <p className="text-[11px] text-gray-500 mt-0.5" style={pp}>Identity verification review &amp; management</p>
        </div>
        <div className="flex items-center gap-2">
          <RBACGuard permission="kyc:export">
            <button onClick={exportCSV} className="px-3 py-1.5 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:bg-white/[0.08] transition" style={pp}>Export CSV</button>
          </RBACGuard>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <StatCard label="Total" value={apps.length} color="text-white" />
        <StatCard label="Verified" value={apps.filter(a => a.status === "verified").length} color="text-emerald-400" />
        <StatCard label="Pending" value={apps.filter(a => a.status === "pending").length} color="text-amber-400" />
        <StatCard label="In Review" value={apps.filter(a => a.status === "in_review").length} color="text-blue-400" />
        <StatCard label="Rejected" value={apps.filter(a => a.status === "rejected").length} color="text-red-400" />
        <StatCard label="Expired" value={apps.filter(a => a.status === "expired").length} color="text-orange-400" />
        <StatCard label="Not Started" value={apps.filter(a => a.status === "not_started").length} color="text-gray-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[11px] transition-colors ${tab === t.key ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"}`}
            style={{ ...pp, fontWeight: tab === t.key ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>

      {tab === "applications" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, ID..."
              className="px-3 py-1.5 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-300 placeholder-gray-600 w-56 focus:outline-none focus:border-blue-500/50" style={pp} />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-1.5 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-300 focus:outline-none" style={pp}>
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-1.5 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-300 focus:outline-none" style={pp}>
              <option value="all">All Levels</option>
              <option value="basic">Basic</option>
              <option value="enhanced">Enhanced</option>
              <option value="full">Full</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-[11px]" style={pp}>
              <thead>
                <tr className="bg-white/[0.02] text-gray-500 text-left">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Docs</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Reviewed By</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(a => (
                  <tr key={a.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2 text-gray-400" style={ss04}>{a.id}</td>
                    <td className="px-3 py-2">
                      <div className="text-white">{a.userName}</div>
                      <div className="text-gray-500 text-[10px]">{a.userId} &middot; {maskStr(a.email, a.id)}</div>
                    </td>
                    <td className="px-3 py-2"><LevelBadge level={a.level} /></td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-2"><ScoreBar score={a.verificationScore} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {a.documents.map(d => <DocStatusDot key={d.id} status={d.status} />)}
                        {a.documents.length === 0 && <span className="text-gray-600">-</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-400">{a.submittedAt || "-"}</td>
                    <td className="px-3 py-2 text-gray-400">{a.reviewedBy || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(a)} className="px-2 py-0.5 rounded bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] text-[10px] transition">View</button>
                        {(a.status === "pending" || a.status === "in_review") && (
                          <RBACGuard permission="kyc:review">
                            <button onClick={() => openReview(a)} className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-[10px] transition">Review</button>
                          </RBACGuard>
                        )}
                        {a.status === "pending" && (
                          <RBACGuard permission="kyc:review">
                            <button onClick={() => handleStartReview(a)} className="px-2 py-0.5 rounded bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] text-[10px] transition">Start</button>
                          </RBACGuard>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-600">No applications match filters</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <OmsPagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
        </>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Approval Rate" value={`${analytics.approvalRate}%`} color="text-emerald-400" />
            <StatCard label="Rejection Rate" value={`${analytics.rejectionRate}%`} color="text-red-400" />
            <StatCard label="Avg Review Time" value={`${analytics.avgReviewTimeDays} days`} color="text-blue-400" />
            <StatCard label="Total Applications" value={analytics.totalApplications} color="text-white" />
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <h3 className="text-[12px] text-white mb-3" style={{ ...pp, fontWeight: 600 }}>Top Rejection Reasons</h3>
            <div className="space-y-2">
              {analytics.topRejectionReasons.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-300" style={pp}>{r.reason}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-red-500/60" style={{ width: `${(r.count / 4) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-4 text-right" style={ss04}>{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <h3 className="text-[12px] text-white mb-3" style={{ ...pp, fontWeight: 600 }}>Status Distribution</h3>
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {[
                { status: "verified", count: analytics.verified, color: "bg-emerald-500" },
                { status: "pending", count: analytics.pending, color: "bg-amber-500" },
                { status: "in_review", count: analytics.inReview, color: "bg-blue-500" },
                { status: "rejected", count: analytics.rejected, color: "bg-red-500" },
                { status: "expired", count: analytics.expired, color: "bg-orange-500" },
                { status: "not_started", count: analytics.notStarted, color: "bg-gray-500" },
              ].map(s => (
                <div key={s.status} className={`${s.color} transition-all`} style={{ width: `${(s.count / analytics.totalApplications) * 100}%` }}
                  title={`${s.status}: ${s.count}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { label: "Verified", count: analytics.verified, color: "bg-emerald-500" },
                { label: "Pending", count: analytics.pending, color: "bg-amber-500" },
                { label: "In Review", count: analytics.inReview, color: "bg-blue-500" },
                { label: "Rejected", count: analytics.rejected, color: "bg-red-500" },
                { label: "Expired", count: analytics.expired, color: "bg-orange-500" },
                { label: "Not Started", count: analytics.notStarted, color: "bg-gray-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[10px] text-gray-400" style={pp}>{s.label}: {s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      <OmsModal open={modalType === "detail" && !!selected} onClose={() => { setModalType(null); setSelected(null); }} title={`KYC Application — ${selected?.id}`}>
        {selected && (
          <div className="space-y-4 text-[11px]" style={pp}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <LevelBadge level={selected.level} />
                <ScoreBar score={selected.verificationScore} />
              </div>
              <button onClick={() => togglePII(selected.id)}
                className="px-2 py-0.5 rounded bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] text-[10px] transition">
                {revealedPII.has(selected.id) ? "Hide PII" : "Reveal PII"}
              </button>
            </div>

            {/* Personal Info */}
            <div className="bg-white/[0.03] rounded-lg p-3 space-y-1.5">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Personal Information</div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Full Name:</span> <span className="text-white">{maskStr(selected.personalInfo.fullName, selected.id)}</span></div>
                <div><span className="text-gray-500">DOB:</span> <span className="text-white">{maskStr(selected.personalInfo.dateOfBirth, selected.id)}</span></div>
                <div><span className="text-gray-500">Nationality:</span> <span className="text-white">{selected.personalInfo.nationality}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="text-white">{maskStr(selected.personalInfo.phoneNumber, selected.id)}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white">{maskStr(selected.personalInfo.address, selected.id)}</span></div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Documents ({selected.documents.length})</div>
              {selected.documents.length === 0 ? (
                <div className="text-gray-600 text-center py-2">No documents submitted</div>
              ) : (
                <div className="space-y-1.5">
                  {selected.documents.map(d => (
                    <div key={d.id} className="flex items-center justify-between bg-white/[0.02] rounded px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <DocStatusDot status={d.status} />
                        <div>
                          <div className="text-white">{d.type.replace(/_/g, " ")}</div>
                          <div className="text-gray-500 text-[10px]">{d.fileName} &middot; {d.fileSize}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] ${d.status === "accepted" ? "text-emerald-400" : d.status === "rejected" ? "text-red-400" : "text-amber-400"}`}>
                          {d.status.toUpperCase()}
                        </div>
                        {d.rejectionReason && <div className="text-[10px] text-red-400/70">{d.rejectionReason}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Info */}
            {(selected.reviewedAt || selected.reviewedBy) && (
              <div className="bg-white/[0.03] rounded-lg p-3 space-y-1">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Review</div>
                {selected.reviewedBy && <div><span className="text-gray-500">Reviewed by:</span> <span className="text-white">{selected.reviewedBy}</span></div>}
                {selected.reviewedAt && <div><span className="text-gray-500">Reviewed at:</span> <span className="text-white">{selected.reviewedAt}</span></div>}
                {selected.expiresAt && <div><span className="text-gray-500">Expires:</span> <span className="text-white">{selected.expiresAt}</span></div>}
                {selected.rejectionReason && <div><span className="text-gray-500">Rejection:</span> <span className="text-red-400">{selected.rejectionReason}</span></div>}
              </div>
            )}

            {/* Notes */}
            {selected.notes.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Notes</div>
                {selected.notes.map((n, i) => (
                  <div key={i} className="text-gray-300 text-[11px] py-0.5 border-b border-white/[0.04] last:border-0">&bull; {n}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </OmsModal>

      {/* ==================== REVIEW MODAL ==================== */}
      <OmsModal open={modalType === "review" && !!selected} onClose={() => { setModalType(null); setSelected(null); setReviewNotes(""); setRejectReason(""); }}
        title={`Review KYC — ${selected?.id}`}>
        {selected && (
          <div className="space-y-4 text-[11px]" style={pp}>
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <LevelBadge level={selected.level} />
              <span className="text-gray-400">{selected.userName} ({selected.userId})</span>
            </div>

            {/* Documents to review */}
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Documents</div>
              <div className="space-y-1.5">
                {selected.documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-white/[0.02] rounded px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <DocStatusDot status={d.status} />
                      <div>
                        <div className="text-white">{d.type.replace(/_/g, " ")}</div>
                        <div className="text-gray-500 text-[10px]">{d.fileName} &middot; {d.fileSize}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] ${d.status === "accepted" ? "text-emerald-400" : d.status === "rejected" ? "text-red-400" : "text-amber-400"}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <OmsField label="Review Notes (optional)">
              <OmsTextarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add review notes..." />
            </OmsField>

            <OmsButtonRow>
              <OmsBtn color="green" onClick={() => { setModalType("approve"); }}>Approve</OmsBtn>
              <OmsBtn color="red" onClick={() => { setModalType("reject"); }}>Reject</OmsBtn>
              <OmsBtn color="gray" onClick={() => { setModalType(null); setSelected(null); }}>Cancel</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* ==================== APPROVE CONFIRM ==================== */}
      <OmsModal open={modalType === "approve" && !!selected} onClose={() => setModalType("review")} title="Confirm KYC Approval">
        <OmsConfirmContent
          message={`Approve KYC application ${selected?.id} for ${selected?.userName}? This will set their verification status to "verified".`}
          onConfirm={handleApprove}
          onCancel={() => setModalType("review")}
          confirmLabel="Approve"
          confirmColor="green"
        />
      </OmsModal>

      {/* ==================== REJECT ==================== */}
      <OmsModal open={modalType === "reject" && !!selected} onClose={() => setModalType("review")} title="Reject KYC Application">
        {selected && (
          <div className="space-y-3 text-[11px]" style={pp}>
            <p className="text-gray-400">Rejecting KYC for <span className="text-white">{selected.userName}</span> ({selected.id})</p>
            <OmsField label="Rejection Reason (required)">
              <OmsTextarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this application is being rejected..." />
            </OmsField>
            <OmsButtonRow>
              <OmsBtn color="red" onClick={handleReject} disabled={!rejectReason.trim()}>Reject Application</OmsBtn>
              <OmsBtn color="gray" onClick={() => setModalType("review")}>Back</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>
    </div>
  );
}
