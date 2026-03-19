import { useState, useMemo, useCallback, useEffect } from "react";
import { useOmsAuth, isPlatformUser, type AdminUser, type AccountStatus, generatePassword } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
type AdminRole = AdminUser["role"];

const ROLE_LABELS: Record<AdminRole, string> = {
  platform_admin: "Platform Admin",
  platform_ops: "Platform Ops",
  merchant_admin: "Merchant Admin",
  merchant_ops: "Merchant Ops",
  merchant_support: "Merchant Support",
  merchant_finance: "Merchant Finance",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  platform_admin: "bg-purple-50 text-[#8b5cf6]",
  platform_ops: "bg-indigo-50 text-indigo-600",
  merchant_admin: "bg-[#fff4ed] text-[#ff5222]",
  merchant_ops: "bg-blue-50 text-blue-600",
  merchant_support: "bg-emerald-50 text-emerald-600",
  merchant_finance: "bg-amber-50 text-amber-600",
};

const STATUS_BADGE: Record<AccountStatus, { cls: string; label: string }> = {
  active: { cls: "bg-emerald-50 text-emerald-600", label: "Active" },
  disabled: { cls: "bg-red-50 text-red-500", label: "Disabled" },
  first_login: { cls: "bg-amber-50 text-amber-600", label: "First Login" },
  password_expired: { cls: "bg-orange-50 text-orange-600", label: "Password Expired" },
};

/* ==================== MOCK ACTIVITY LOGS ==================== */
interface ActivityEntry {
  adminId: string;
  ts: string;
  action: string;
  ip: string;
  ua: string;
}

const MOCK_ACTIVITY: ActivityEntry[] = [
  { adminId: "A001", ts: "2026-03-14 08:45:12 PHT", action: "Login (password)", ip: "203.177.84.22", ua: "Chrome 124 / macOS" },
  { adminId: "A001", ts: "2026-03-13 09:02:33 PHT", action: "Login (password)", ip: "203.177.84.22", ua: "Chrome 124 / macOS" },
  { adminId: "A001", ts: "2026-03-12 08:18:55 PHT", action: "Login (password)", ip: "203.177.84.22", ua: "Chrome 124 / macOS" },
  { adminId: "A001", ts: "2026-03-11 07:55:10 PHT", action: "Login (verification code)", ip: "180.190.211.5", ua: "Safari 18 / iOS" },
  { adminId: "A001", ts: "2026-03-10 08:30:44 PHT", action: "Login (password)", ip: "203.177.84.22", ua: "Chrome 124 / macOS" },
  { adminId: "A001", ts: "2026-03-10 08:31:02 PHT", action: "Changed password", ip: "203.177.84.22", ua: "Chrome 124 / macOS" },
  { adminId: "A002", ts: "2026-03-14 07:20:05 PHT", action: "Login (password)", ip: "49.149.88.110", ua: "Firefox 128 / Windows" },
  { adminId: "A002", ts: "2026-03-13 07:15:22 PHT", action: "Login (password)", ip: "49.149.88.110", ua: "Firefox 128 / Windows" },
  { adminId: "A002", ts: "2026-03-12 07:40:19 PHT", action: "Login (password)", ip: "49.149.88.110", ua: "Firefox 128 / Windows" },
  { adminId: "A002", ts: "2026-03-11 06:58:01 PHT", action: "Login (password)", ip: "49.149.88.110", ua: "Firefox 128 / Windows" },
  { adminId: "MA001", ts: "2026-03-14 09:10:22 PHT", action: "Login (password)", ip: "112.198.77.33", ua: "Chrome 124 / Windows" },
  { adminId: "MA001", ts: "2026-03-13 08:45:11 PHT", action: "Login (password)", ip: "112.198.77.33", ua: "Chrome 124 / Windows" },
  { adminId: "MA001", ts: "2026-03-12 09:00:45 PHT", action: "Login (password)", ip: "112.198.77.33", ua: "Chrome 124 / Windows" },
  { adminId: "MA001", ts: "2026-03-11 08:22:18 PHT", action: "Login (verification code)", ip: "175.176.44.98", ua: "Chrome 124 / Android" },
  { adminId: "MA001", ts: "2026-03-10 09:15:33 PHT", action: "Login (password)", ip: "112.198.77.33", ua: "Chrome 124 / Windows" },
  { adminId: "MA003", ts: "2026-02-28 14:00:19 PHT", action: "Login (password)", ip: "112.198.77.33", ua: "Chrome 123 / Windows" },
  { adminId: "MA003", ts: "2026-02-28 14:05:44 PHT", action: "Account disabled by admin", ip: "\u2014", ua: "\u2014" },
  { adminId: "MA004", ts: "2026-03-13 16:30:08 PHT", action: "Login (password)", ip: "120.28.192.44", ua: "Edge 123 / Windows" },
  { adminId: "MA004", ts: "2026-03-12 15:55:30 PHT", action: "Login (password)", ip: "120.28.192.44", ua: "Edge 123 / Windows" },
  { adminId: "MA005", ts: "2026-03-14 06:55:12 PHT", action: "Login (password)", ip: "202.90.135.21", ua: "Chrome 124 / macOS" },
  { adminId: "MA005", ts: "2026-03-13 07:10:28 PHT", action: "Login (password)", ip: "202.90.135.21", ua: "Chrome 124 / macOS" },
  { adminId: "MA006", ts: "2026-03-13 22:10:55 PHT", action: "Login (password)", ip: "202.90.135.21", ua: "Chrome 124 / macOS" },
  { adminId: "MA006", ts: "2026-03-12 21:45:10 PHT", action: "Login (password)", ip: "202.90.135.21", ua: "Chrome 124 / macOS" },
  { adminId: "MA007", ts: "2026-03-12 11:40:33 PHT", action: "Login (password)", ip: "119.93.148.77", ua: "Chrome 124 / Windows" },
  { adminId: "MA007", ts: "2026-03-11 10:20:15 PHT", action: "Login (password)", ip: "119.93.148.77", ua: "Chrome 124 / Windows" },
  { adminId: "MA009", ts: "2026-03-14 03:15:44 PHT", action: "Login (password)", ip: "49.145.22.88", ua: "Chrome 124 / Windows" },
  { adminId: "MA009", ts: "2026-03-13 02:50:11 PHT", action: "Login (password)", ip: "49.145.22.88", ua: "Chrome 124 / Windows" },
  { adminId: "MA010", ts: "2026-03-10 17:00:22 PHT", action: "Login (password)", ip: "202.90.135.21", ua: "Chrome 123 / macOS" },
  { adminId: "MA010", ts: "2026-03-10 17:01:05 PHT", action: "Password expired notification", ip: "\u2014", ua: "\u2014" },
];

/* ==================== MOCK DATA — all OMS admin accounts ==================== */
const INITIAL_ADMINS: AdminUser[] = [
  { id: "A001", name: "Carlos Reyes", email: "admin@foregate.ph", role: "platform_admin", avatar: "", lastLogin: "2026-03-14 08:45 PHT", tenantName: "ForeGate Platform", status: "active", needsPasswordChange: false },
  { id: "A002", name: "Ana Dela Cruz", email: "ops@foregate.ph", role: "platform_ops", avatar: "", lastLogin: "2026-03-14 07:20 PHT", tenantName: "ForeGate Platform", status: "active", needsPasswordChange: false },
  { id: "MA001", name: "Maria Santos", email: "admin@luckytaya.ph", role: "merchant_admin", avatar: "", lastLogin: "2026-03-14 09:10 PHT", merchantId: "MCH001", tenantName: "Lucky Taya", status: "active", needsPasswordChange: false },
  { id: "MA002", name: "Rico Santos", email: "newadmin@betmanila.com", role: "merchant_admin", avatar: "", lastLogin: "\u2014", merchantId: "MCH002", tenantName: "BetManila", status: "first_login", needsPasswordChange: true },
  { id: "MA003", name: "Jenny Lim", email: "disabled@luckytaya.ph", role: "merchant_ops", avatar: "", lastLogin: "2026-02-28 14:00 PHT", merchantId: "MCH001", tenantName: "Lucky Taya", status: "disabled", needsPasswordChange: false },
  { id: "MA004", name: "Rafael Cruz", email: "finance@luckytaya.ph", role: "merchant_finance", avatar: "", lastLogin: "2026-03-13 16:30 PHT", merchantId: "MCH001", tenantName: "Lucky Taya", status: "active", needsPasswordChange: false },
  { id: "MA005", name: "Sophia Villanueva", email: "support@sugalph.com", role: "merchant_support", avatar: "", lastLogin: "2026-03-14 06:55 PHT", merchantId: "MCH003", tenantName: "Sugal PH", status: "active", needsPasswordChange: false },
  { id: "MA006", name: "Marco Tan", email: "admin@sugalph.com", role: "merchant_admin", avatar: "", lastLogin: "2026-03-13 22:10 PHT", merchantId: "MCH003", tenantName: "Sugal PH", status: "active", needsPasswordChange: false },
  { id: "MA007", name: "Dina Aquino", email: "ops@tongitslive.ph", role: "merchant_ops", avatar: "", lastLogin: "2026-03-12 11:40 PHT", merchantId: "MCH006", tenantName: "Tongits Live", status: "active", needsPasswordChange: false },
  { id: "MA008", name: "Kevin Bautista", email: "admin@colorbet.ph", role: "merchant_admin", avatar: "", lastLogin: "\u2014", merchantId: "MCH007", tenantName: "ColorBet Arena", status: "first_login", needsPasswordChange: true },
  { id: "MA009", name: "Lorna Ramos", email: "finance@betmanila.com", role: "merchant_finance", avatar: "", lastLogin: "2026-03-14 03:15 PHT", merchantId: "MCH002", tenantName: "BetManila", status: "active", needsPasswordChange: false },
  { id: "MA010", name: "Eduardo Garcia", email: "ops@sugalph.com", role: "merchant_ops", avatar: "", lastLogin: "2026-03-10 17:00 PHT", merchantId: "MCH003", tenantName: "Sugal PH", status: "password_expired", needsPasswordChange: true },
];

/* ==================== CSV EXPORT HELPER ==================== */
function downloadCsv(rows: AdminUser[], filename: string) {
  const headers = ["ID", "Name", "Email", "Role", "Tenant", "Merchant ID", "Status", "Last Login", "Needs PW Change"];
  const csv = [
    headers.join(","),
    ...rows.map(a => [
      a.id, `"${a.name}"`, a.email, ROLE_LABELS[a.role],
      `"${a.tenantName || "Platform"}"`, a.merchantId || "\u2014",
      STATUS_BADGE[a.status].label, `"${a.lastLogin}"`,
      a.needsPasswordChange ? "Yes" : "No",
    ].join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

/* ==================== COMPONENT ==================== */
export default function OmsAdminUsers() {
  const { admin, merchants } = useOmsAuth();
  const { t } = useI18n();
  const { hasPermission, canSeeField } = useTenantConfig();
  const role = admin?.role || "";
  const isPlat = isPlatformUser(role);

  /* ---------- Tenant config gating ---------- */
  const canViewEmail = canSeeField("email", role);           // PII gating on email column
  const canViewLastLogin = canSeeField("last_login", role);  // activity visibility
  const canExport = hasPermission("export_users", role);     // CSV export
  const canEditRole = hasPermission("modify_role", role);    // Edit role assignment
  const canDisable = hasPermission("modify_suspend_trading", role) || isPlat; // Disable/enable (critical = plat only unless overridden)
  const canResetPw = isPlat;                                 // Force PW reset = platform only
  const canCreate = hasPermission("modify_role", role) || isPlat; // Create new account
  const canViewAudit = hasPermission("view_audit_log", role);

  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [merchantFilter, setMerchantFilter] = useState<string>("all");

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDisableOpen, setBulkDisableOpen] = useState(false);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUser | null>(null);
  const [viewTab, setViewTab] = useState<"details" | "activity">("details");
  const [disableTarget, setDisableTarget] = useState<AdminUser | null>(null);
  const [resetPwTarget, setResetPwTarget] = useState<AdminUser | null>(null);

  // Create form
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cRole, setCRole] = useState<AdminRole>("merchant_ops");
  const [cMerchant, setCMerchant] = useState("MCH001");
  const [cGenPw, setCGenPw] = useState("");

  // Edit form
  const [eRole, setERole] = useState<AdminRole>("merchant_ops");
  const [eMerchant, setEMerchant] = useState("");
  const [eName, setEName] = useState("");

  const openCreate = () => {
    setCName(""); setCEmail(""); setCRole("merchant_ops"); setCMerchant("MCH001"); setCGenPw(generatePassword());
    setCreateOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEName(u.name); setERole(u.role); setEMerchant(u.merchantId || "");
    setEditTarget(u);
  };

  const openView = (u: AdminUser) => {
    setViewTarget(u);
    setViewTab("details");
  };

  /* ---------- Bulk selection ---------- */
  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => a.id)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.size]);

  /* ---------- Filtered data ---------- */
  const filtered = useMemo(() => {
    let list = admins;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || (a.tenantName || "").toLowerCase().includes(q));
    }
    if (roleFilter !== "all") list = list.filter(a => a.role === roleFilter);
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    if (merchantFilter !== "all") {
      if (merchantFilter === "platform") list = list.filter(a => !a.merchantId);
      else list = list.filter(a => a.merchantId === merchantFilter);
    }
    return list;
  }, [admins, search, roleFilter, statusFilter, merchantFilter]);

  // Fix toggleSelectAll dependency
  const handleToggleSelectAll = useCallback(() => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => a.id)));
    }
  }, [selected.size, filtered]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter(a => a.status === "active").length;
    const disabled = admins.filter(a => a.status === "disabled").length;
    const firstLogin = admins.filter(a => a.status === "first_login").length;
    const platformCount = admins.filter(a => !a.merchantId).length;
    const merchantCount = admins.filter(a => !!a.merchantId).length;
    return { total, active, disabled, firstLogin, platformCount, merchantCount };
  }, [admins]);

  /* ---------- Selected admins info ---------- */
  const selectedAdmins = useMemo(() => admins.filter(a => selected.has(a.id)), [admins, selected]);
  const selectedActiveCount = useMemo(() => selectedAdmins.filter(a => a.status !== "disabled").length, [selectedAdmins]);
  const selectedDisabledCount = useMemo(() => selectedAdmins.filter(a => a.status === "disabled").length, [selectedAdmins]);

  /* ---------- Activity log for view target ---------- */
  const viewActivity = useMemo(() => {
    if (!viewTarget) return [];
    return MOCK_ACTIVITY.filter(e => e.adminId === viewTarget.id);
  }, [viewTarget]);

  /* ---------- Handlers ---------- */
  const handleCreate = () => {
    if (!cName.trim() || !cEmail.trim()) { showOmsToast("Name and email are required", "error"); return; }
    if (admins.some(a => a.email.toLowerCase() === cEmail.toLowerCase())) { showOmsToast("Email already exists", "error"); return; }
    const isPlatRole = cRole === "platform_admin" || cRole === "platform_ops";
    const merchant = isPlatRole ? undefined : merchants.find(m => m.id === cMerchant);
    const newAdmin: AdminUser = {
      id: `A${String(admins.length + 100).padStart(3, "0")}`,
      name: cName.trim(),
      email: cEmail.trim().toLowerCase(),
      role: cRole,
      avatar: "",
      lastLogin: "\u2014",
      merchantId: isPlatRole ? undefined : cMerchant,
      tenantName: isPlatRole ? "ForeGate Platform" : merchant?.name,
      status: "first_login",
      needsPasswordChange: true,
    };
    setAdmins(prev => [newAdmin, ...prev]);
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "admin_create", target: newAdmin.email, detail: `Created ${ROLE_LABELS[cRole]} account for ${cName} (${isPlatRole ? "Platform" : merchant?.name})` });
    setCreateOpen(false);
    showOmsToast(`Account created for ${cName} \u2014 auto-generated password: ${cGenPw}`);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    const isPlatRole = eRole === "platform_admin" || eRole === "platform_ops";
    const merchant = isPlatRole ? undefined : merchants.find(m => m.id === eMerchant);
    setAdmins(prev => prev.map(a => a.id === editTarget.id ? {
      ...a,
      name: eName.trim() || a.name,
      role: eRole,
      merchantId: isPlatRole ? undefined : (eMerchant || a.merchantId),
      tenantName: isPlatRole ? "ForeGate Platform" : (merchant?.name || a.tenantName),
    } : a));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "admin_edit", target: editTarget.email, detail: `Updated role to ${ROLE_LABELS[eRole]}${isPlatRole ? "" : ` for ${merchant?.name || eMerchant}`}` });
    setEditTarget(null);
    showOmsToast(`${editTarget.name} updated successfully`);
  };

  const handleToggleStatus = () => {
    if (!disableTarget) return;
    const newStatus: AccountStatus = disableTarget.status === "disabled" ? "active" : "disabled";
    setAdmins(prev => prev.map(a => a.id === disableTarget.id ? { ...a, status: newStatus } : a));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: newStatus === "disabled" ? "admin_disable" : "admin_enable", target: disableTarget.email, detail: `${newStatus === "disabled" ? "Disabled" : "Re-enabled"} account for ${disableTarget.name}` });
    setDisableTarget(null);
    showOmsToast(`${disableTarget.name} ${newStatus === "disabled" ? "disabled" : "re-enabled"}`);
  };

  const handleResetPw = () => {
    if (!resetPwTarget) return;
    const newPw = generatePassword();
    setAdmins(prev => prev.map(a => a.id === resetPwTarget.id ? { ...a, needsPasswordChange: true } : a));
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "admin_reset_pw", target: resetPwTarget.email, detail: `Force password reset for ${resetPwTarget.name}` });
    setResetPwTarget(null);
    showOmsToast(`Password reset for ${resetPwTarget.name} \u2014 new password: ${newPw}`);
  };

  /* ---------- Bulk disable ---------- */
  const handleBulkDisable = () => {
    const targets = selectedAdmins.filter(a => a.status !== "disabled");
    setAdmins(prev => prev.map(a => selected.has(a.id) && a.status !== "disabled" ? { ...a, status: "disabled" as AccountStatus } : a));
    targets.forEach(a => {
      logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "admin_disable", target: a.email, detail: `Bulk disabled account for ${a.name}` });
    });
    setBulkDisableOpen(false);
    setSelected(new Set());
    showOmsToast(`${targets.length} account${targets.length > 1 ? "s" : ""} disabled`);
  };

  /* ---------- Bulk export ---------- */
  const handleBulkExport = () => {
    const rows = selectedAdmins.length > 0 ? selectedAdmins : filtered;
    downloadCsv(rows, `oms-admin-users-${new Date().toISOString().slice(0, 10)}.csv`);
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "admin_export_csv", target: `${rows.length} rows`, detail: `Exported ${rows.length} admin user records as CSV` });
    showOmsToast(`Exported ${rows.length} records to CSV`);
  };

  /* ---------- Unique merchants for filter ---------- */
  const merchantOptions = useMemo(() => {
    const ids = new Set(admins.filter(a => a.merchantId).map(a => a.merchantId!));
    return Array.from(ids).map(id => {
      const m = merchants.find(m => m.id === id);
      return { value: id, label: m?.name || id };
    });
  }, [admins]);

  /* ---------- Dynamic columns based on tenant config ---------- */
  const columns = useMemo(() => {
    const cols: { key: string; label: string }[] = [
      { key: "select", label: "" },
      { key: "admin", label: "Admin" },
    ];
    if (canViewEmail) cols.push({ key: "email", label: "Email" });
    cols.push({ key: "role", label: "Role" });
    cols.push({ key: "tenant", label: "Tenant" });
    cols.push({ key: "status", label: "Status" });
    if (canViewLastLogin) cols.push({ key: "last_login", label: "Last Login" });
    cols.push({ key: "actions", label: t("common.actions", "Actions") });
    return cols;
  }, [canViewEmail, canViewLastLogin, t]);

  if (!isPlat) {
    return (
      <div className="text-center py-20">
        <p className="text-[#b0b3b8] text-[13px]" style={{ ...pp, ...ss04 }}>Platform admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: t("oms_admins.total", "Total Admins"), value: stats.total, color: "#070808" },
          { label: t("common.active", "Active"), value: stats.active, color: "#059669" },
          { label: t("oms_admins.disabled", "Disabled"), value: stats.disabled, color: "#ef4444" },
          { label: t("oms_admins.first_login", "First Login"), value: stats.firstLogin, color: "#d97706" },
          { label: t("oms_admins.platform_users", "Platform Users"), value: stats.platformCount, color: "#8b5cf6" },
          { label: t("oms_admins.merchant_users", "Merchant Users"), value: stats.merchantCount, color: "#ff5222" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className="text-white text-[22px] mt-0.5" style={{ fontWeight: 700, color: s.color, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 h-8 flex-1 sm:max-w-[280px]">
            <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="4.5" /><path d="M11 11l3 3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("oms_admins.search_placeholder", "Search by name, email, ID...")} className="bg-transparent text-[#9ca3af] text-[11px] outline-none flex-1 placeholder-[#4b5563]" style={ss04} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer" style={ss04}>
            <option value="all">{t("common.all", "All")} Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer" style={ss04}>
            <option value="all">{t("common.all", "All")} Status</option>
            <option value="active">{t("common.active", "Active")}</option>
            <option value="disabled">Disabled</option>
            <option value="first_login">First Login</option>
            <option value="password_expired">Password Expired</option>
          </select>
          <select value={merchantFilter} onChange={e => setMerchantFilter(e.target.value)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer" style={ss04}>
            <option value="all">{t("common.all", "All")} Tenants</option>
            <option value="platform">Platform (ForeGate)</option>
            {merchantOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div className="flex-1" />
          {canExport && (
            <button onClick={handleBulkExport} className="h-8 px-3 bg-[#0a0e1a] border border-[#1f2937] hover:bg-[#1f2937] text-[#9ca3af] rounded-lg text-[11px] cursor-pointer transition-colors flex items-center gap-1.5" style={{ fontWeight: 600, ...ss04 }}>
              <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v6M3 5l3 3 3-3M2 10h8" /></svg>
              {t("common.export_csv", "Export CSV")}{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          )}
          {canCreate && (
            <button onClick={openCreate} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white rounded-lg text-[11px] cursor-pointer transition-colors flex items-center gap-1.5" style={{ fontWeight: 600, ...ss04 }}>
              <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 2v8M2 6h8" /></svg>
              {t("oms_admins.create", "Create Account")}
            </button>
          )}
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg">
            <span className="text-[#9ca3af] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              {selected.size} selected
            </span>
            <div className="w-px h-4 bg-[#1f2937]" />
            {canDisable && selectedActiveCount > 0 && (
              <button onClick={() => setBulkDisableOpen(true)} className="h-6 px-2.5 rounded bg-red-500/10 text-red-400 text-[10px] cursor-pointer hover:bg-red-500/20 transition-colors flex items-center gap-1" style={{ fontWeight: 600, ...ss04 }}>
                <svg className="size-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="5" r="3.5" /><path d="M3.5 5h3" /></svg>
                Disable {selectedActiveCount} Active
              </button>
            )}
            {canExport && (
              <button onClick={handleBulkExport} className="h-6 px-2.5 rounded bg-blue-500/10 text-blue-400 text-[10px] cursor-pointer hover:bg-blue-500/20 transition-colors flex items-center gap-1" style={{ fontWeight: 600, ...ss04 }}>
                <svg className="size-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 1v5M2.5 4L5 6.5 7.5 4M1.5 8.5h7" /></svg>
                Export Selected
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="h-6 px-2.5 rounded bg-[#1f2937] text-[#6b7280] text-[10px] cursor-pointer hover:bg-[#374151] transition-colors" style={{ fontWeight: 600, ...ss04 }}>
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={ss04}>
            <thead>
              <tr className="border-b border-[#1f2937]">
                {columns.map(col => (
                  <th key={col.key} className="text-[#6b7280] text-[10px] py-2 px-3 whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {col.key === "select" ? (
                      <input
                        type="checkbox"
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={handleToggleSelectAll}
                        className="accent-[#ff5222] cursor-pointer rounded"
                      />
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={columns.length} className="text-center py-10 text-[#b0b3b8] text-[12px]">{t("common.no_data", "No data available")}</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a.id} className={`border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors ${selected.has(a.id) ? "bg-[#ff5222]/5" : ""}`}>
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="accent-[#ff5222] cursor-pointer rounded"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#f0f1f3] flex items-center justify-center text-[10px] flex-shrink-0" style={{ fontWeight: 700, color: "#ff5222", ...ss04 }}>
                        {a.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-white text-[12px]" style={{ fontWeight: 600 }}>{a.name}</p>
                        <p className="text-[#6b7280] text-[10px]">{a.id}</p>
                      </div>
                    </div>
                  </td>
                  {canViewEmail && (
                    <td className="py-2.5 px-3 text-[#9ca3af] text-[11px]">{a.email}</td>
                  )}
                  <td className="py-2.5 px-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${ROLE_COLORS[a.role]}`} style={{ fontWeight: 600 }}>{ROLE_LABELS[a.role]}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#9ca3af] text-[11px]">{a.tenantName || "\u2014"}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${STATUS_BADGE[a.status].cls}`} style={{ fontWeight: 600 }}>{STATUS_BADGE[a.status].label}</span>
                  </td>
                  {canViewLastLogin && (
                    <td className="py-2.5 px-3 text-[#6b7280] text-[11px] whitespace-nowrap">{a.lastLogin}</td>
                  )}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(a)} className="h-6 px-2 rounded bg-blue-50 text-blue-600 text-[9px] cursor-pointer hover:bg-blue-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>{t("common.view", "View")}</button>
                      {canEditRole && (
                        <button onClick={() => openEdit(a)} className="h-6 px-2 rounded bg-[#f0f1f3] text-[#84888c] text-[9px] cursor-pointer hover:bg-[#e5e7eb] transition-colors" style={{ fontWeight: 600, ...ss04 }}>{t("common.edit", "Edit")}</button>
                      )}
                      {canDisable && (
                        <button
                          onClick={() => setDisableTarget(a)}
                          className={`h-6 px-2 rounded text-[9px] cursor-pointer transition-colors ${a.status === "disabled" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                          style={{ fontWeight: 600, ...ss04 }}
                        >
                          {a.status === "disabled" ? t("oms_admins.enable", "Enable") : t("oms_admins.disable", "Disable")}
                        </button>
                      )}
                      {canResetPw && (
                        <button onClick={() => setResetPwTarget(a)} className="h-6 px-2 rounded bg-amber-50 text-amber-600 text-[9px] cursor-pointer hover:bg-amber-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>
                          {t("oms_admins.reset_pw", "Reset PW")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1f2937]">
          <p className="text-[#6b7280] text-[10px]" style={ss04}>{t("common.showing", "Showing")} {filtered.length} {t("common.of", "of")} {admins.length}</p>
          {selected.size > 0 && <p className="text-[#ff5222] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>{selected.size} selected</p>}
        </div>
      </div>

      {/* ==================== CREATE MODAL ==================== */}
      <OmsModal open={createOpen} onClose={() => setCreateOpen(false)} title={t("oms_admins.create", "Create Account")} subtitle="Add a new OMS admin user">
        <OmsField label="Full Name" required>
          <OmsInput value={cName} onChange={setCName} placeholder="e.g. Maria Santos" />
        </OmsField>
        <OmsField label="Email Address" required>
          <OmsInput value={cEmail} onChange={setCEmail} placeholder="e.g. maria@luckytaya.ph" type="email" />
        </OmsField>
        <OmsField label="Role" required>
          <OmsSelect value={cRole} onChange={v => setCRole(v as AdminRole)} options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </OmsField>
        {cRole !== "platform_admin" && cRole !== "platform_ops" && (
          <OmsField label="Assign to Merchant" required>
            <OmsSelect value={cMerchant} onChange={setCMerchant} options={merchants.filter(m => m.status !== "deactivated").map(m => ({ value: m.id, label: `${m.name} (${m.id})` }))} />
          </OmsField>
        )}
        <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg p-3 mb-3">
          <p className="text-[#84888c] text-[10px] mb-1" style={{ fontWeight: 500, ...ss04 }}>Auto-generated Password</p>
          <div className="flex items-center gap-2">
            <code className="text-[#070808] text-[13px] bg-white border border-[#e5e7eb] rounded px-2 py-1 flex-1 select-all" style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{cGenPw}</code>
            <button onClick={() => setCGenPw(generatePassword())} className="h-7 px-2 rounded bg-[#f0f1f3] text-[#84888c] text-[10px] cursor-pointer hover:bg-[#e5e7eb] transition-colors" style={{ fontWeight: 600, ...ss04 }}>
              Regenerate
            </button>
          </div>
          <p className="text-[#b0b3b8] text-[9px] mt-1.5" style={ss04}>This password will be sent via email. User must change it on first login.</p>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setCreateOpen(false)} fullWidth>{t("common.cancel", "Cancel")}</OmsBtn>
          <OmsBtn variant="primary" onClick={handleCreate} fullWidth disabled={!cName.trim() || !cEmail.trim()}>Create Account</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ==================== EDIT MODAL ==================== */}
      <OmsModal open={!!editTarget} onClose={() => setEditTarget(null)} title={t("common.edit", "Edit") + " Account"} subtitle={editTarget?.email || ""}>
        {editTarget && (
          <>
            <OmsField label="Full Name">
              <OmsInput value={eName} onChange={setEName} placeholder={editTarget.name} />
            </OmsField>
            <OmsField label="Role">
              <OmsSelect value={eRole} onChange={v => setERole(v as AdminRole)} options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            </OmsField>
            {eRole !== "platform_admin" && eRole !== "platform_ops" && (
              <OmsField label="Assign to Merchant">
                <OmsSelect value={eMerchant || editTarget.merchantId || "MCH001"} onChange={setEMerchant} options={merchants.filter(m => m.status !== "deactivated").map(m => ({ value: m.id, label: `${m.name} (${m.id})` }))} />
              </OmsField>
            )}
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setEditTarget(null)} fullWidth>{t("common.cancel", "Cancel")}</OmsBtn>
              <OmsBtn variant="primary" onClick={handleEdit} fullWidth>{t("common.save", "Save")} Changes</OmsBtn>
            </OmsButtonRow>
          </>
        )}
      </OmsModal>

      {/* ==================== VIEW DETAIL MODAL (with Activity tab) ==================== */}
      <OmsModal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Admin Details" subtitle={viewTarget?.id || ""} width="max-w-[600px]">
        {viewTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#f0f1f3] flex items-center justify-center text-[14px] flex-shrink-0" style={{ fontWeight: 700, color: "#ff5222", ...ss04 }}>
                {viewTarget.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-[#070808] text-[15px]" style={{ fontWeight: 600, ...ss04 }}>{viewTarget.name}</p>
                <p className="text-[#b0b3b8] text-[11px]" style={ss04}>{viewTarget.email}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#e5e7eb]">
              {(["details", ...(canViewAudit ? ["activity"] : [])] as ("details" | "activity")[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`px-3 py-2 text-[11px] cursor-pointer transition-colors border-b-2 -mb-px ${viewTab === tab ? "border-[#ff5222] text-[#ff5222]" : "border-transparent text-[#b0b3b8] hover:text-[#84888c]"}`}
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  {tab === "details" ? t("common.details", "Details") : "Activity Log"}
                </button>
              ))}
            </div>

            {/* Details tab */}
            {viewTab === "details" && (
              <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg p-3 space-y-2">
                {[
                  { label: "ID", value: viewTarget.id, show: true },
                  { label: "Email", value: viewTarget.email, show: canViewEmail },
                  { label: "Role", value: ROLE_LABELS[viewTarget.role], show: true },
                  { label: "Tenant", value: viewTarget.tenantName || "ForeGate Platform", show: true },
                  { label: "Merchant ID", value: viewTarget.merchantId || "\u2014", show: true },
                  { label: "Status", value: STATUS_BADGE[viewTarget.status].label, show: true },
                  { label: "Last Login", value: viewTarget.lastLogin, show: canViewLastLogin },
                  { label: "Needs PW Change", value: viewTarget.needsPasswordChange ? "Yes" : "No", show: true },
                ].filter(d => d.show).map(d => (
                  <div key={d.label} className="flex justify-between">
                    <span className="text-[#b0b3b8] text-[11px]" style={ss04}>{d.label}</span>
                    <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Log tab */}
            {viewTab === "activity" && canViewAudit && (
              <div className="space-y-1">
                {viewActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#b0b3b8] text-[11px]" style={ss04}>No activity recorded</p>
                  </div>
                ) : (
                  <div className="max-h-[340px] overflow-y-auto space-y-0 border border-[#e5e7eb] rounded-lg">
                    <table className="w-full text-left" style={ss04}>
                      <thead className="sticky top-0 bg-[#f5f6f8]">
                        <tr>
                          <th className="text-[#b0b3b8] text-[9px] px-3 py-2" style={{ fontWeight: 600 }}>Timestamp</th>
                          <th className="text-[#b0b3b8] text-[9px] px-3 py-2" style={{ fontWeight: 600 }}>Action</th>
                          <th className="text-[#b0b3b8] text-[9px] px-3 py-2" style={{ fontWeight: 600 }}>IP</th>
                          <th className="text-[#b0b3b8] text-[9px] px-3 py-2" style={{ fontWeight: 600 }}>Browser / OS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewActivity.map((entry, i) => (
                          <tr key={i} className="border-t border-[#f0f1f3] hover:bg-[#f9f9fa]">
                            <td className="px-3 py-2 text-[#84888c] text-[10px] whitespace-nowrap">{entry.ts}</td>
                            <td className="px-3 py-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                entry.action.includes("Login") ? "bg-blue-50 text-blue-600" :
                                entry.action.includes("disabled") ? "bg-red-50 text-red-500" :
                                entry.action.includes("password") || entry.action.includes("Password") ? "bg-amber-50 text-amber-600" :
                                "bg-[#f0f1f3] text-[#84888c]"
                              }`} style={{ fontWeight: 600 }}>{entry.action}</span>
                            </td>
                            <td className="px-3 py-2 text-[#84888c] text-[10px] font-mono">{entry.ip}</td>
                            <td className="px-3 py-2 text-[#b0b3b8] text-[10px]">{entry.ua}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-[#b0b3b8] text-[9px] text-right mt-1" style={ss04}>Showing last {viewActivity.length} entries</p>
              </div>
            )}

            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setViewTarget(null)} fullWidth>{t("common.close", "Close")}</OmsBtn>
              {canEditRole && <OmsBtn variant="primary" onClick={() => { openEdit(viewTarget); setViewTarget(null); }} fullWidth>{t("common.edit", "Edit")}</OmsBtn>}
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* ==================== DISABLE / ENABLE CONFIRM ==================== */}
      <OmsModal
        open={!!disableTarget}
        onClose={() => setDisableTarget(null)}
        title={disableTarget?.status === "disabled" ? "Re-enable Account" : "Disable Account"}
        subtitle={disableTarget?.email || ""}
      >
        {disableTarget && (
          <>
            <OmsConfirmContent
              icon={disableTarget.status === "disabled" ? "success" : "danger"}
              iconColor={disableTarget.status === "disabled" ? "#059669" : "#ef4444"}
              iconBg={disableTarget.status === "disabled" ? "#059669" : "#ef4444"}
              message={
                disableTarget.status === "disabled"
                  ? `Re-enable login access for ${disableTarget.name}? They will be able to log in again.`
                  : `Disable login access for ${disableTarget.name}? They will be locked out immediately.`
              }
              details={[
                { label: "Admin", value: disableTarget.name },
                { label: "Role", value: ROLE_LABELS[disableTarget.role] },
                { label: "Tenant", value: disableTarget.tenantName || "Platform" },
              ]}
            />
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setDisableTarget(null)} fullWidth>{t("common.cancel", "Cancel")}</OmsBtn>
              <OmsBtn
                variant={disableTarget.status === "disabled" ? "success" : "danger"}
                onClick={handleToggleStatus}
                fullWidth
              >
                {disableTarget.status === "disabled" ? "Re-enable" : "Disable"} Account
              </OmsBtn>
            </OmsButtonRow>
          </>
        )}
      </OmsModal>

      {/* ==================== BULK DISABLE CONFIRM ==================== */}
      <OmsModal open={bulkDisableOpen} onClose={() => setBulkDisableOpen(false)} title="Bulk Disable Accounts" subtitle={`${selectedActiveCount} active accounts`}>
        <OmsConfirmContent
          icon="danger"
          iconColor="#ef4444"
          iconBg="#ef4444"
          message={`Disable ${selectedActiveCount} active account${selectedActiveCount > 1 ? "s" : ""}? They will be locked out immediately. ${selectedDisabledCount > 0 ? `(${selectedDisabledCount} already disabled \u2014 skipped)` : ""}`}
          details={selectedAdmins.filter(a => a.status !== "disabled").slice(0, 5).map(a => ({ label: a.name, value: ROLE_LABELS[a.role] }))}
        />
        {selectedActiveCount > 5 && (
          <p className="text-[#b0b3b8] text-[10px] mt-2" style={ss04}>...and {selectedActiveCount - 5} more</p>
        )}
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setBulkDisableOpen(false)} fullWidth>{t("common.cancel", "Cancel")}</OmsBtn>
          <OmsBtn variant="danger" onClick={handleBulkDisable} fullWidth>Disable {selectedActiveCount} Account{selectedActiveCount > 1 ? "s" : ""}</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* ==================== RESET PASSWORD CONFIRM ==================== */}
      <OmsModal open={!!resetPwTarget} onClose={() => setResetPwTarget(null)} title="Force Password Reset" subtitle={resetPwTarget?.email || ""}>
        {resetPwTarget && (
          <>
            <OmsConfirmContent
              icon="warning"
              iconColor="#d97706"
              iconBg="#d97706"
              message={`Generate a new password for ${resetPwTarget.name}? They will be required to change it on next login.`}
              details={[
                { label: "Admin", value: resetPwTarget.name },
                { label: "Role", value: ROLE_LABELS[resetPwTarget.role] },
                { label: "Current Status", value: STATUS_BADGE[resetPwTarget.status].label },
              ]}
            />
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setResetPwTarget(null)} fullWidth>{t("common.cancel", "Cancel")}</OmsBtn>
              <OmsBtn variant="primary" onClick={handleResetPw} fullWidth>Reset Password</OmsBtn>
            </OmsButtonRow>
          </>
        )}
      </OmsModal>
    </div>
  );
}
