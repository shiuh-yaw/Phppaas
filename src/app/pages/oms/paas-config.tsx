import { useState, useEffect, type ReactNode } from "react";
import { useOmsAuth, isPlatformUser, type Merchant } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig, createDefaultConfig, loadConfig, clearPersistedConfig, listSavedMerchantIds, getSchemaInfo, CURRENT_SCHEMA_VERSION, ALL_TENANT_ROLES, ROLE_LABELS as SHARED_ROLE_LABELS, type TenantRole, type TenantConfig, type FieldVisibility, type PermissionRule, type AccountPolicy, type ChannelConfig } from "../../components/oms/oms-tenant-config";
import { useI18n } from "../../components/oms/oms-i18n";
import { logAudit } from "../../components/oms/oms-audit-log";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES (from shared context) ==================== */

// Types FieldVisibility, PermissionRule, AccountPolicy, ChannelConfig, TenantConfig
// are imported from oms-tenant-config.tsx

const ROLE_LABELS = SHARED_ROLE_LABELS;
const ALL_ROLES = ALL_TENANT_ROLES;

/* Factory is imported from oms-tenant-config. Local wrapper unused: */
/* _old_factory_start_
      // Identity
      { key: "wallet_address", label: "Wallet Address", description: "KMS-generated wallet address", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "uid", label: "UID", description: "Unique user identifier", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "nickname", label: "Nickname", description: "User display name", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "email", label: "Email", description: "User email address (PII)", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "user_type", label: "User Type", description: "Creator or User role", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "channel", label: "Channel", description: "Registration channel (FG / Organic / Agent)", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      // Activity
      { key: "recent_ip", label: "Recent IP", description: "Last known IP address", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "recent_geo", label: "Geo-location", description: "Last known geographic location", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "last_login", label: "Last Login Time", description: "Most recent login timestamp", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: true } },
      { key: "source", label: "Source", description: "User acquisition source", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: true } },
      { key: "agent_name", label: "Agent Name", description: "Referring agent from Dub", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: true } },
      // Financial
      { key: "total_asset", label: "Total Asset", description: "User total asset balance", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "total_volume", label: "Total Volume", description: "Cumulative trading volume", category: "financial", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "settled_pnl", label: "Settled PNL", description: "Profit and loss calculation", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "withdraw_history", label: "Withdrawal History", description: "On-chain transaction records", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      // System
      { key: "social_channel", label: "Social Channel", description: "Creator social media info", category: "system", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "contact_details", label: "Contact Details", description: "Phone, Telegram, WhatsApp", category: "system", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
    ],
    permissions: [
      // User Management
      { key: "view_user_list", label: "View User List", description: "Access the user management table", category: "user_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "search_users", label: "Search Users", description: "Use search and filter functions", category: "user_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "export_users", label: "Export User Data", description: "Download user data as CSV/Excel", category: "user_mgmt", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      // Asset Management
      { key: "view_assets", label: "View Asset Info", description: "Open the Asset Information modal", category: "asset_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "modify_suspend_trading", label: "Suspend Trading", description: "Toggle suspend trading for a user", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_suspend_deposit", label: "Suspend Deposit", description: "Toggle suspend deposit for a user", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_suspend_withdraw", label: "Suspend Withdraw", description: "Toggle suspend withdraw for a user", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_withdraw_limits", label: "Modify Withdraw Limits", description: "Change daily/single withdraw limits", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_whitelist", label: "Modify Whitelist", description: "Toggle user whitelist status", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      // Trading
      { key: "view_trading", label: "View Trading Info", description: "Open the Trading Information modal", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "view_trade_history", label: "View Trade History", description: "See individual trade records", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "view_user_settings", label: "View User Settings", description: "See user preferences tab", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      // Role Management
      { key: "view_role", label: "View Role Info", description: "Open the Role Management modal", category: "role_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_role", label: "Change User Role", description: "Switch between user and creator", category: "role_mgmt", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_contact", label: "Edit Contact Details", description: "Update social/phone/telegram/whatsapp", category: "role_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      // System
      { key: "view_audit_log", label: "View Audit Log", description: "See action history for users", category: "system", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "access_api", label: "API Access", description: "Use tenant API endpoints", category: "system", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
    ],
    accountPolicies: [
      { key: "suspend_trading", label: "Suspend Trading", description: "Ability to freeze a user's trading", fgOnly: true, merchantOverride: false },
      { key: "suspend_deposit", label: "Suspend Deposit", description: "Ability to block deposits", fgOnly: true, merchantOverride: false },
      { key: "suspend_withdraw", label: "Suspend Withdraw", description: "Ability to block withdrawals", fgOnly: true, merchantOverride: false },
      { key: "withdraw_limits", label: "Withdraw Limits", description: "Modify daily/single limits", fgOnly: true, merchantOverride: false },
      { key: "withdraw_fee", label: "Withdraw Fee", description: "Adjust withdrawal fee percentage", fgOnly: true, merchantOverride: false },
      { key: "whitelist_toggle", label: "Whitelist Management", description: "Add/remove users from whitelist", fgOnly: true, merchantOverride: false },
      { key: "role_assignment", label: "Role Assignment", description: "Change user type (user/creator)", fgOnly: false, merchantOverride: true },
      { key: "contact_edit", label: "Contact Editing", description: "Edit user social/contact details", fgOnly: false, merchantOverride: true },
    ],
    channels: [
      { key: "FG", label: "ForeGate Direct", enabled: true, requiresApproval: false, autoAssignAgent: false },
      { key: "organic", label: "Organic", enabled: true, requiresApproval: false, autoAssignAgent: false },
      { key: "agent", label: "Agent Referral", enabled: true, requiresApproval: true, autoAssignAgent: true },
    ],
    maxUsersPerTenant: 1000000,
    maxCreatorsPerTenant: 500,
    userExportEnabled: true,
    piiMaskingEnabled: true,
    auditLogRetentionDays: 365,
    webhookUrl: "",
    webhookSecret: "",
    apiRateLimit: 500,
  };
}
_old_factory_end_ */

/* ==================== SECTION CARD ==================== */
function SectionCard({ title, subtitle, badge, children, actions }: { title: string; subtitle?: string; badge?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-4 border-b border-[#f0f1f3] flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
          {badge}
        </div>
        {actions}
      </div>
      {subtitle && (
        <div className="px-5 py-2.5 bg-[#f9fafb] border-b border-[#f0f1f3]">
          <p className="text-[#84888c] text-[11px]" style={{ fontWeight: 400, ...ss04 }}>{subtitle}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ==================== TOGGLE ==================== */
function Toggle({ value, onChange, disabled, size = "md" }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; size?: "sm" | "md" }) {
  const w = size === "sm" ? "w-7 h-[16px]" : "w-9 h-[20px]";
  const dot = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const ml = size === "sm" ? (value ? 13 : 2) : (value ? 18 : 2);
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`${w} rounded-full cursor-pointer transition-colors flex-shrink-0 ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${value ? "bg-[#ff5222]" : "bg-[#d1d5db]"}`}
    >
      <div className={`${dot} bg-white rounded-full transition-all`} style={{ marginLeft: ml, marginTop: size === "sm" ? 2 : 3 }} />
    </button>
  );
}

/* ==================== SEVERITY BADGE ==================== */
function SeverityBadge({ severity }: { severity: "normal" | "elevated" | "critical" }) {
  const map = {
    normal: "bg-[#f5f6f8] text-[#84888c]",
    elevated: "bg-amber-50 text-amber-600",
    critical: "bg-red-50 text-red-500",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded ${map[severity]}`} style={{ fontWeight: 600, ...ss04 }}>
      {severity === "critical" ? "FG ONLY" : severity === "elevated" ? "ELEVATED" : "STANDARD"}
    </span>
  );
}

/* ==================== CATEGORY BADGE ==================== */
function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    identity: "bg-blue-50 text-blue-500",
    activity: "bg-cyan-50 text-cyan-600",
    financial: "bg-emerald-50 text-emerald-600",
    system: "bg-purple-50 text-purple-500",
    user_mgmt: "bg-blue-50 text-blue-500",
    asset_mgmt: "bg-emerald-50 text-emerald-600",
    trading: "bg-amber-50 text-amber-600",
    role_mgmt: "bg-purple-50 text-purple-500",
  };
  const labels: Record<string, string> = {
    identity: "Identity",
    activity: "Activity",
    financial: "Financial",
    system: "System",
    user_mgmt: "User Mgmt",
    asset_mgmt: "Asset Mgmt",
    trading: "Trading",
    role_mgmt: "Role Mgmt",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded ${map[category] || "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 600, ...ss04 }}>
      {labels[category] || category}
    </span>
  );
}

/* ==================== DIFF SUMMARY MODAL ==================== */
function DiffSummaryModal({ open, onClose, onConfirm, changes }: { open: boolean; onClose: () => void; onConfirm: () => void; changes: string[] }) {
  return (
    <OmsModal open={open} onClose={onClose} title="Confirm Configuration Changes" subtitle="Review changes before applying">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <svg className="size-4 text-amber-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M10 2L2 18h16L10 2zM10 8v4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" /></svg>
          </div>
          <p className="text-[#555] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>
            The following changes will be applied to this tenant's configuration:
          </p>
        </div>
        <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-3 max-h-[300px] overflow-y-auto space-y-1.5">
          {changes.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-[#ff5222] mt-1.5 flex-shrink-0" />
              <p className="text-[#070808] text-[11px]" style={{ fontWeight: 400, ...ss04 }}>{c}</p>
            </div>
          ))}
        </div>
      </div>
      <OmsButtonRow>
        <OmsBtn variant="secondary" onClick={onClose}>Cancel</OmsBtn>
        <OmsBtn variant="primary" onClick={onConfirm} fullWidth>Apply Changes</OmsBtn>
      </OmsButtonRow>
    </OmsModal>
  );
}

/* ==================== MAIN COMPONENT ==================== */
export default function PaasConfig() {
  const { admin, activeMerchant, merchants } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const tenantCtx = useTenantConfig();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(activeMerchant?.id || "GLOBAL");
  const [tab, setTab] = useState<"visibility" | "permissions" | "policies" | "channels" | "limits">("visibility");
  const [config, setConfig] = useState<TenantConfig>(() => loadConfig(activeMerchant?.id || "GLOBAL"));
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffChanges, setDiffChanges] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  // Hydrate shared context from persisted config on mount
  useEffect(() => { tenantCtx.setConfig(loadConfig(activeMerchant?.id || "GLOBAL")); }, []);

  const activeMerchants = merchants.filter(m => m.status === "active" || m.status === "onboarding");

  const handleMerchantChange = (id: string) => {
    setSelectedMerchant(id);
    const loaded = loadConfig(id);
    setConfig(loaded);
    tenantCtx.setConfig(loaded);
    setHasChanges(false);
    setCategoryFilter("all");
  };

  const currentMerchant = merchants.find(m => m.id === selectedMerchant);

  /* --- Field visibility toggle --- */
  const toggleFieldVisibility = (fieldKey: string, role: TenantRole) => {
    setConfig(prev => ({
      ...prev,
      fieldVisibility: prev.fieldVisibility.map(f =>
        f.key === fieldKey ? { ...f, roles: { ...f.roles, [role]: !f.roles[role] } } : f
      ),
    }));
    setHasChanges(true);
  };

  /* --- Permission toggle --- */
  const togglePermission = (permKey: string, role: TenantRole) => {
    const perm = config.permissions.find(p => p.key === permKey);
    if (perm?.severity === "critical") {
      showOmsToast("Critical permissions can only be modified by FG Platform Admin", "error");
      return;
    }
    setConfig(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.key === permKey ? { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } : p
      ),
    }));
    setHasChanges(true);
  };

  /* --- Account policy toggle --- */
  const togglePolicyOverride = (policyKey: string) => {
    setConfig(prev => ({
      ...prev,
      accountPolicies: prev.accountPolicies.map(p =>
        p.key === policyKey ? { ...p, merchantOverride: !p.merchantOverride } : p
      ),
    }));
    setHasChanges(true);
  };

  /* --- Channel toggle --- */
  const toggleChannel = (channelKey: string, field: "enabled" | "requiresApproval" | "autoAssignAgent") => {
    setConfig(prev => ({
      ...prev,
      channels: prev.channels.map(c =>
        c.key === channelKey ? { ...c, [field]: !c[field] } : c
      ),
    }));
    setHasChanges(true);
  };

  /* --- Save --- */
  const handleSave = () => {
    const changes: string[] = [];
    changes.push(`Configuration updated for ${selectedMerchant === "GLOBAL" ? "Global Defaults" : currentMerchant?.name || selectedMerchant}`);
    changes.push(`Field visibility matrix: ${config.fieldVisibility.length} fields configured`);
    changes.push(`Permission rules: ${config.permissions.length} rules configured`);
    changes.push(`Account policies: ${config.accountPolicies.filter(p => p.merchantOverride).length} merchant-overridable`);
    changes.push(`Channels: ${config.channels.filter(c => c.enabled).length} enabled`);
    changes.push(`API rate limit: ${config.apiRateLimit} req/min`);
    setDiffChanges(changes);
    setShowDiff(true);
  };

  const confirmSave = () => {
    setSaving(true);
    setTimeout(() => {
      // Push local config to shared context so Users page picks it up live
      tenantCtx.setConfig({ ...config });
      setSaving(false);
      setShowDiff(false);
      setHasChanges(false);
      showOmsToast(`Configuration saved & persisted for ${selectedMerchant === "GLOBAL" ? "Global Defaults" : currentMerchant?.name}`, "success");
    }, 800);
  };

  /* --- Filtered fields/permissions --- */
  const filteredFields = categoryFilter === "all"
    ? config.fieldVisibility
    : config.fieldVisibility.filter(f => f.category === categoryFilter);

  const filteredPerms = categoryFilter === "all"
    ? config.permissions
    : config.permissions.filter(p => p.category === categoryFilter);

  const fieldCategories = ["all", "identity", "activity", "financial", "system"];
  const permCategories = ["all", "user_mgmt", "asset_mgmt", "trading", "role_mgmt", "system"];

  /* --- Access guard --- */
  if (!isPlat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={pp}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="size-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v.01M12 12V8m0 12a9 9 0 110-18 9 9 0 010 18z" strokeLinecap="round" /></svg>
          </div>
          <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 600, ...ss04 }}>Access Restricted</h3>
          <p className="text-[#b0b3b8] text-[12px]" style={ss04}>PaaS Admin Config is only available to ForeGate Platform Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={pp}>
      {/* Header with tenant selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-[9px] tracking-[0.1em] text-[#8b5cf6]" style={{ fontWeight: 700, ...ss04 }}>PLATFORM ADMIN</span>
          </div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>PaaS Admin Configuration</h2>
          <p className="text-[#b0b3b8] text-[12px] mt-0.5" style={ss04}>Manage tenant-level user field visibility, permission rules, and account policies
            <span className="ml-2 inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>
              <svg className="size-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2"><path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              PERSISTED
            </span>
            <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-500" style={{ fontWeight: 600, ...ss04 }}>SCHEMA v{CURRENT_SCHEMA_VERSION}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Tenant:</span>
            <select
              value={selectedMerchant}
              onChange={e => handleMerchantChange(e.target.value)}
              className="h-9 px-3 pr-8 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] outline-none cursor-pointer focus:border-[#8b5cf6] transition-colors"
              style={{ ...pp, ...ss04 }}
            >
              <option value="GLOBAL">🌐 Global Defaults</option>
              {activeMerchants.map(m => (
                <option key={m.id} value={m.id}>{m.logo} {m.name}</option>
              ))}
            </select>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="h-9 px-5 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-xl cursor-pointer transition-colors"
              style={{ fontWeight: 600, ...ss04, boxShadow: "0 2px 8px rgba(255,82,34,0.25)" }}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Tenant info banner */}
      {selectedMerchant !== "GLOBAL" && currentMerchant && (
        <div className="flex items-center gap-3 p-3 bg-white border border-[#e5e7eb] rounded-2xl" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <div className="w-9 h-9 rounded-xl bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[12px] flex-shrink-0" style={{ fontWeight: 700, ...ss04 }}>
            {currentMerchant.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{currentMerchant.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${currentMerchant.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`} style={{ fontWeight: 600, ...ss04 }}>
                {currentMerchant.status === "active" ? "LIVE" : currentMerchant.status.toUpperCase()}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-500" style={{ fontWeight: 600, ...ss04 }}>
                {currentMerchant.plan.toUpperCase()}
              </span>
            </div>
            <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{currentMerchant.primaryDomain} · {currentMerchant.id} · {currentMerchant.users.toLocaleString()} users · {currentMerchant.markets} markets</p>
          </div>
        </div>
      )}
      {selectedMerchant === "GLOBAL" && (
        <div className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-200/50 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <svg className="size-4 text-[#8b5cf6]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="8" /><path d="M2 10h16" /><path d="M10 2c2.5 2.5 4 5.2 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5.2-4-8s1.5-5.5 4-8z" /></svg>
          </div>
          <div>
            <p className="text-[#8b5cf6] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Editing Global Defaults</p>
            <p className="text-[#84888c] text-[10px]" style={ss04}>Changes here apply to all newly onboarded merchants. Existing merchants retain their individual configs unless synced.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e5e7eb] rounded-xl p-1 w-fit overflow-x-auto">
        {([
          { key: "visibility", label: "Field Visibility", icon: "👁" },
          { key: "permissions", label: "Permission Rules", icon: "🔐" },
          { key: "policies", label: "Account Policies", icon: "⚙" },
          { key: "channels", label: "Channel Config", icon: "📡" },
          { key: "limits", label: "Limits & API", icon: "🔧" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setCategoryFilter("all"); }}
            className={`flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${tab === t.key ? "bg-[#8b5cf6] text-white" : "text-[#84888c] hover:bg-[#f5f6f8] hover:text-[#070808]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            <span className="text-[13px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Field Visibility */}
      {tab === "visibility" && (
        <div className="space-y-4">
          <SectionCard
            title="User Field Visibility Matrix"
            subtitle="Control which user data fields are visible to each tenant role. Disabled fields will be hidden or masked in the User Management table and modals."
            badge={<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500" style={{ fontWeight: 600, ...ss04 }}>{config.fieldVisibility.length} FIELDS</span>}
            actions={
              <div className="flex gap-1 flex-wrap">
                {fieldCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${categoryFilter === cat ? "bg-[#8b5cf6] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
                    style={{ fontWeight: 600, ...ss04 }}
                  >
                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            }
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left w-[220px]" style={{ fontWeight: 600, ...ss04 }}>Field</th>
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left w-[70px]" style={{ fontWeight: 600, ...ss04 }}>Category</th>
                    {ALL_ROLES.map(r => (
                      <th key={r} className="text-center py-2 px-2" style={{ minWidth: 80 }}>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${ROLE_LABELS[r].bg} ${ROLE_LABELS[r].color}`} style={{ fontWeight: 600, ...ss04 }}>
                          {ROLE_LABELS[r].label.toUpperCase()}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFields.map(field => (
                    <tr key={field.key} className="border-b border-[#f0f1f3] last:border-0 hover:bg-[#f9fafb] transition-colors">
                      <td className="py-2.5">
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{field.label}</p>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{field.description}</p>
                      </td>
                      <td className="py-2.5"><CategoryBadge category={field.category} /></td>
                      {ALL_ROLES.map(r => (
                        <td key={r} className="text-center py-2.5 px-2">
                          <Toggle value={field.roles[r]} onChange={() => toggleFieldVisibility(field.key, r)} size="sm" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f1f3] flex items-center justify-between">
              <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                Showing {filteredFields.length} of {config.fieldVisibility.length} fields
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      fieldVisibility: prev.fieldVisibility.map(f => ({
                        ...f, roles: Object.fromEntries(ALL_ROLES.map(r => [r, true])) as Record<TenantRole, boolean>
                      })),
                    }));
                    setHasChanges(true);
                    showOmsToast("All fields enabled for all roles", "info");
                  }}
                  className="text-[10px] px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb] cursor-pointer transition-colors"
                  style={{ fontWeight: 600, ...ss04 }}
                >Enable All</button>
                <button
                  onClick={() => {
                    setConfig(createDefaultConfig(selectedMerchant));
                    setHasChanges(true);
                    showOmsToast("Reset to default visibility", "info");
                  }}
                  className="text-[10px] px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb] cursor-pointer transition-colors"
                  style={{ fontWeight: 600, ...ss04 }}
                >Reset Defaults</button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB: Permission Rules */}
      {tab === "permissions" && (
        <div className="space-y-4">
          <SectionCard
            title="Permission Rules Matrix"
            subtitle="Define which actions each tenant role can perform within User Management. Critical permissions (marked FG ONLY) require ForeGate Platform Admin and cannot be delegated to merchants."
            badge={<span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-500" style={{ fontWeight: 600, ...ss04 }}>{config.permissions.length} RULES</span>}
            actions={
              <div className="flex gap-1 flex-wrap">
                {permCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${categoryFilter === cat ? "bg-[#8b5cf6] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
                    style={{ fontWeight: 600, ...ss04 }}
                  >
                    {cat === "all" ? "All" : cat.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </button>
                ))}
              </div>
            }
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left w-[200px]" style={{ fontWeight: 600, ...ss04 }}>Action</th>
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left w-[70px]" style={{ fontWeight: 600, ...ss04 }}>Level</th>
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left w-[70px]" style={{ fontWeight: 600, ...ss04 }}>Category</th>
                    {ALL_ROLES.map(r => (
                      <th key={r} className="text-center py-2 px-2" style={{ minWidth: 75 }}>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${ROLE_LABELS[r].bg} ${ROLE_LABELS[r].color}`} style={{ fontWeight: 600, ...ss04 }}>
                          {ROLE_LABELS[r].label.split(" ").pop()?.toUpperCase()}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPerms.map(perm => (
                    <tr key={perm.key} className={`border-b border-[#f0f1f3] last:border-0 hover:bg-[#f9fafb] transition-colors ${perm.severity === "critical" ? "bg-red-50/30" : ""}`}>
                      <td className="py-2.5">
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{perm.label}</p>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{perm.description}</p>
                      </td>
                      <td className="py-2.5"><SeverityBadge severity={perm.severity} /></td>
                      <td className="py-2.5"><CategoryBadge category={perm.category} /></td>
                      {ALL_ROLES.map(r => (
                        <td key={r} className="text-center py-2.5 px-2">
                          {perm.severity === "critical" ? (
                            <div className="flex items-center justify-center">
                              <svg className="size-4 text-red-300" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v6M6 4l2-2 2 2M4 8h8v5a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          ) : (
                            <Toggle value={perm.roles[r]} onChange={() => togglePermission(perm.key, r)} size="sm" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-[#f0f1f3] flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <SeverityBadge severity="normal" />
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Standard — freely assignable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SeverityBadge severity="elevated" />
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Elevated — audit logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SeverityBadge severity="critical" />
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>FG only — cannot delegate to tenants</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB: Account Policies */}
      {tab === "policies" && (
        <div className="space-y-4">
          <SectionCard
            title="Account Control Policies"
            subtitle="Define which account-level controls are reserved for FG Platform Admin vs. delegated to merchant operators. These policies determine the edit permissions shown in the Asset Information modal."
          >
            <div className="space-y-0">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 pb-2 border-b border-[#e5e7eb]">
                <div className="col-span-4">
                  <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Control</span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>FG Only</span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Merchant Override</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>Status</span>
                </div>
              </div>

              {config.accountPolicies.map(policy => (
                <div key={policy.key} className="grid grid-cols-12 gap-3 py-3 border-b border-[#f0f1f3] last:border-0 items-center hover:bg-[#f9fafb] transition-colors rounded-lg px-1">
                  <div className="col-span-4">
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{policy.label}</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{policy.description}</p>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${policy.fgOnly ? "bg-red-50" : "bg-[#f5f6f8]"}`}>
                      {policy.fgOnly ? (
                        <svg className="size-3.5 text-red-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" /></svg>
                      ) : (
                        <svg className="size-3.5 text-[#d1d5db]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M11 7V5a3 3 0 00-6 0" /></svg>
                      )}
                      <span className={`text-[10px] ${policy.fgOnly ? "text-red-500" : "text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>
                        {policy.fgOnly ? "Locked" : "Unlocked"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <Toggle
                      value={policy.merchantOverride}
                      onChange={() => togglePolicyOverride(policy.key)}
                      disabled={policy.fgOnly && !policy.merchantOverride}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {policy.fgOnly && !policy.merchantOverride ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500" style={{ fontWeight: 600, ...ss04 }}>FG ONLY</span>
                    ) : policy.merchantOverride ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>DELEGATED</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>OPEN</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info callout */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2.5">
                <svg className="size-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><path d="M8 1.5L1.5 13h13L8 1.5zM8 6v3" strokeLinecap="round" /><circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" /></svg>
                <div>
                  <p className="text-amber-700 text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Important Policy Note</p>
                  <p className="text-amber-600 text-[10px] mt-0.5" style={ss04}>
                    Controls marked "FG ONLY" (suspend trading/deposit/withdraw, withdraw limits, withdraw fee, whitelist) are always reserved for ForeGate Platform Admin.
                    Enabling "Merchant Override" allows Merchant Admins to also manage these controls for their own tenant users. All actions are audit-logged regardless.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* PII Masking */}
          <SectionCard title="Data Protection" subtitle="Configure PII masking and data handling rules for this tenant">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>PII Masking</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Mask email and phone in lower-privilege views (e.g. m***@gmail.com)</p>
                </div>
                <Toggle value={config.piiMaskingEnabled} onChange={v => { setConfig(prev => ({ ...prev, piiMaskingEnabled: v })); setHasChanges(true); }} />
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>User Data Export</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Allow authorized roles to export user data as CSV</p>
                </div>
                <Toggle value={config.userExportEnabled} onChange={v => { setConfig(prev => ({ ...prev, userExportEnabled: v })); setHasChanges(true); }} />
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Audit Log Retention</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Number of days to retain user action audit logs</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.auditLogRetentionDays}
                    onChange={e => { setConfig(prev => ({ ...prev, auditLogRetentionDays: parseInt(e.target.value) || 0 })); setHasChanges(true); }}
                    className="w-20 h-8 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] text-center"
                    style={{ ...pp, ...ss04 }}
                  />
                  <span className="text-[#b0b3b8] text-[11px]" style={ss04}>days</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB: Channel Config */}
      {tab === "channels" && (
        <div className="space-y-4">
          <SectionCard
            title="Channel Configuration"
            subtitle="Manage user acquisition channels for this tenant. Channels determine how users are categorized in the User Management list and which fields are populated."
            badge={<span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>{config.channels.filter(c => c.enabled).length} ACTIVE</span>}
          >
            <div className="space-y-3">
              {config.channels.map(ch => (
                <div key={ch.key} className={`p-4 rounded-xl border transition-colors ${ch.enabled ? "bg-white border-[#e5e7eb]" : "bg-[#f9fafb] border-[#f0f1f3] opacity-60"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] ${ch.key === "FG" ? "bg-[#ff5222]/10 text-[#ff5222]" : ch.key === "organic" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`} style={{ fontWeight: 700, ...ss04 }}>
                        {ch.key === "FG" ? "FG" : ch.key === "organic" ? "ORG" : "AGT"}
                      </div>
                      <div>
                        <p className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{ch.label}</p>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                          {ch.key === "FG" ? "Users signing up directly via ForeGate platform" :
                           ch.key === "organic" ? "Users from organic traffic, SEO, or direct links" :
                           "Users referred by registered agents (tracked via Dub)"}
                        </p>
                      </div>
                    </div>
                    <Toggle value={ch.enabled} onChange={() => toggleChannel(ch.key, "enabled")} />
                  </div>
                  {ch.enabled && (
                    <div className="flex gap-4 ml-[42px] pt-2 border-t border-[#f0f1f3]">
                      <div className="flex items-center gap-2">
                        <Toggle value={ch.requiresApproval} onChange={() => toggleChannel(ch.key, "requiresApproval")} size="sm" />
                        <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Requires Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Toggle value={ch.autoAssignAgent} onChange={() => toggleChannel(ch.key, "autoAssignAgent")} size="sm" />
                        <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Auto-assign Agent</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Agent channel detail */}
            <div className="mt-4">
              <h4 className="text-[#070808] text-[12px] mb-3" style={{ fontWeight: 600, ...ss04 }}>Agent Channel — Dub Integration</h4>
              <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-4 space-y-2">
                {[
                  { label: "Dub API Status", value: "Connected", isStatus: true },
                  { label: "Attribution Window", value: "30 days" },
                  { label: "Agent Payout Model", value: "Revenue Share (CPA + Rev%)" },
                  { label: "Default Commission Rate", value: "5% of GGR" },
                  { label: "Agent Referral Link Format", value: `https://${currentMerchant?.primaryDomain || "*.ph"}/ref/{agent_code}` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5">
                    <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{item.label}</span>
                    {item.isStatus ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>CONNECTED</span>
                    ) : (
                      <span className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Channel-level field mapping */}
          <SectionCard
            title="Channel Field Mapping"
            subtitle="Configure which user list fields are populated by each channel. 'Source' and 'Agent Name' are only populated for Agent channel users."
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>Field</th>
                    <th className="text-center py-2"><span className="text-[10px] px-2 py-0.5 rounded bg-[#ff5222]/10 text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>FG</span></th>
                    <th className="text-center py-2"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>ORGANIC</span></th>
                    <th className="text-center py-2"><span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>AGENT</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { field: "Wallet Address", fg: true, organic: true, agent: true },
                    { field: "UID", fg: true, organic: true, agent: true },
                    { field: "Nickname", fg: true, organic: true, agent: true },
                    { field: "Email", fg: true, organic: true, agent: true },
                    { field: "User Type", fg: true, organic: true, agent: true },
                    { field: "Channel", fg: true, organic: true, agent: true },
                    { field: "Recent IP", fg: true, organic: true, agent: true },
                    { field: "Geo-location", fg: true, organic: true, agent: true },
                    { field: "Last Login", fg: true, organic: true, agent: true },
                    { field: "Source", fg: false, organic: false, agent: true },
                    { field: "Agent Name", fg: false, organic: false, agent: true },
                  ].map(row => (
                    <tr key={row.field} className="border-b border-[#f0f1f3] last:border-0">
                      <td className="py-2 text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{row.field}</td>
                      {[row.fg, row.organic, row.agent].map((v, i) => (
                        <td key={i} className="text-center py-2">
                          {v ? (
                            <svg className="size-4 text-emerald-500 mx-auto" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : (
                            <svg className="size-4 text-[#d1d5db] mx-auto" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h8" strokeLinecap="round" /></svg>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB: Limits & API */}
      {tab === "limits" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Tenant Capacity" subtitle="Maximum limits for this tenant">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Max Users per Tenant</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Total user accounts allowed</p>
                  </div>
                  <input
                    type="number"
                    value={config.maxUsersPerTenant}
                    onChange={e => { setConfig(prev => ({ ...prev, maxUsersPerTenant: parseInt(e.target.value) || 0 })); setHasChanges(true); }}
                    className="w-28 h-8 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] text-right"
                    style={{ ...pp, ...ss04 }}
                  />
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Max Creators per Tenant</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Creator role accounts allowed</p>
                  </div>
                  <input
                    type="number"
                    value={config.maxCreatorsPerTenant}
                    onChange={e => { setConfig(prev => ({ ...prev, maxCreatorsPerTenant: parseInt(e.target.value) || 0 })); setHasChanges(true); }}
                    className="w-28 h-8 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] text-right"
                    style={{ ...pp, ...ss04 }}
                  />
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>API Rate Limit</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Max requests per minute</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.apiRateLimit}
                      onChange={e => { setConfig(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) || 0 })); setHasChanges(true); }}
                      className="w-24 h-8 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] text-right"
                      style={{ ...pp, ...ss04 }}
                    />
                    <span className="text-[#b0b3b8] text-[10px]" style={ss04}>req/min</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Webhook & API" subtitle="Configure tenant webhook for real-time events">
              <div className="space-y-3">
                <div>
                  <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Webhook URL</label>
                  <input
                    value={config.webhookUrl}
                    onChange={e => { setConfig(prev => ({ ...prev, webhookUrl: e.target.value })); setHasChanges(true); }}
                    className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] transition-colors placeholder-[#b0b3b8]"
                    placeholder="https://api.merchant.com/webhooks/fg"
                    style={{ ...pp, ...ss04 }}
                  />
                </div>
                <div>
                  <label className="block text-[#84888c] text-[11px] mb-1.5" style={{ fontWeight: 500, ...ss04 }}>Webhook Secret</label>
                  <input
                    value={config.webhookSecret}
                    onChange={e => { setConfig(prev => ({ ...prev, webhookSecret: e.target.value })); setHasChanges(true); }}
                    className="w-full h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#8b5cf6] transition-colors placeholder-[#b0b3b8]"
                    placeholder="whsec_..."
                    type="password"
                    style={{ ...pp, ...ss04 }}
                  />
                </div>
                <div className="pt-2">
                  <p className="text-[#84888c] text-[11px] mb-2" style={{ fontWeight: 500, ...ss04 }}>Webhook Events</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "user.created", "user.role_changed", "user.suspended",
                      "trade.executed", "trade.settled",
                      "asset.deposit", "asset.withdraw",
                      "config.updated",
                    ].map(evt => (
                      <div key={evt} className="flex items-center gap-2 py-1">
                        <div className="w-3 h-3 rounded border border-[#e5e7eb] bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-sm bg-[#ff5222]" />
                        </div>
                        <span className="text-[#070808] text-[10px] font-mono" style={ss04}>{evt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => showOmsToast("Webhook test sent successfully", "success")}
                  className="mt-2 h-8 px-4 bg-[#f5f6f8] border border-[#e5e7eb] text-[#84888c] text-[11px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  Send Test Webhook
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Plan comparison */}
          <SectionCard title="Plan Limits Reference" subtitle="Current plan capabilities based on merchant subscription tier">
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-[#b0b3b8] text-[10px] py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>Capability</th>
                    {["Starter", "Growth", "Enterprise"].map(p => (
                      <th key={p} className="text-center py-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded ${p === "Starter" ? "bg-gray-100 text-gray-500" : p === "Growth" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`} style={{ fontWeight: 600, ...ss04 }}>
                          {p.toUpperCase()}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: "Max Users", starter: "50,000", growth: "500,000", enterprise: "Unlimited" },
                    { cap: "Max Creators", starter: "50", growth: "200", enterprise: "Unlimited" },
                    { cap: "API Rate Limit", starter: "100/min", growth: "500/min", enterprise: "2,000/min" },
                    { cap: "Custom Fields", starter: "—", growth: "5", enterprise: "Unlimited" },
                    { cap: "Webhook Events", starter: "Basic", growth: "All", enterprise: "All + Custom" },
                    { cap: "PII Masking", starter: "—", growth: "✓", enterprise: "✓" },
                    { cap: "Data Export", starter: "CSV", growth: "CSV + API", enterprise: "CSV + API + S3" },
                    { cap: "Audit Retention", starter: "90 days", growth: "365 days", enterprise: "Unlimited" },
                    { cap: "Agent Channel", starter: "—", growth: "✓", enterprise: "✓" },
                    { cap: "Dub Integration", starter: "—", growth: "Basic", enterprise: "Full" },
                  ].map(row => (
                    <tr key={row.cap} className="border-b border-[#f0f1f3] last:border-0">
                      <td className="py-2 text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{row.cap}</td>
                      {[row.starter, row.growth, row.enterprise].map((v, i) => (
                        <td key={i} className={`text-center py-2 text-[11px] ${v === "—" ? "text-[#d1d5db]" : v === "Unlimited" || v === "✓" ? "text-emerald-600" : "text-[#070808]"}`} style={{ fontWeight: 500, ...ss04 }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Schema versioning info */}
          <SectionCard
            title="Config Schema"
            subtitle="Version control for the tenant configuration data model"
            badge={<span className="text-[9px] px-2 py-0.5 rounded bg-violet-50 text-violet-600" style={{ fontWeight: 700, ...ss04 }}>v{CURRENT_SCHEMA_VERSION}</span>}
          >
            {(() => {
              const info = getSchemaInfo();
              const savedIds = listSavedMerchantIds();
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Current Version", value: `v${info.currentVersion}`, color: "text-violet-600" },
                      { label: "Migrations", value: String(info.migrationCount), color: "text-blue-600" },
                      { label: "Persisted Tenants", value: String(savedIds.length), color: "text-emerald-600" },
                      { label: "Active Config", value: `v${config.schemaVersion ?? 0}`, color: config.schemaVersion === CURRENT_SCHEMA_VERSION ? "text-emerald-600" : "text-amber-600" },
                    ].map(s => (
                      <div key={s.label} className="bg-[#f9fafb] rounded-xl p-3 border border-[#f0f1f3]">
                        <p className="text-[#b0b3b8] text-[9px]" style={{ fontWeight: 600, ...ss04 }}>{s.label}</p>
                        <p className={`text-[16px] ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {info.migrationChain.length > 0 && (
                    <div>
                      <p className="text-[#84888c] text-[10px] mb-1.5" style={{ fontWeight: 600, ...ss04 }}>Migration Chain</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {info.migrationChain.map((step, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#f0f1f3] text-[#84888c] font-mono" style={{ fontWeight: 500 }}>{step}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {config.schemaVersion !== CURRENT_SCHEMA_VERSION && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-600 text-[10px]" style={{ fontWeight: 500, ...ss04 }}>This config is at schema v{config.schemaVersion ?? 0}, behind current v{CURRENT_SCHEMA_VERSION}. It will be auto-migrated on next load.</p>
                    </div>
                  )}
                  {savedIds.length > 0 && (
                    <div>
                      <p className="text-[#84888c] text-[10px] mb-1.5" style={{ fontWeight: 600, ...ss04 }}>Persisted Merchants</p>
                      <div className="flex flex-wrap gap-1">
                        {savedIds.map(id => (
                          <span key={id} className={`text-[10px] px-2 py-0.5 rounded-md border ${id === selectedMerchant ? "bg-violet-50 border-violet-200 text-violet-600" : "bg-[#f5f6f8] border-[#e5e7eb] text-[#84888c]"}`} style={{ fontWeight: 500, ...ss04 }}>
                            {id === "GLOBAL" ? "Global Defaults" : id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-2.5 bg-[#f5f6f8] rounded-lg border border-[#e5e7eb]">
                    <p className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Schema versioning ensures configs saved by older code are automatically migrated when loaded. User-customised role toggles are preserved; only new fields/permissions are appended with defaults.</p>
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        </div>
      )}

      {/* Floating save bar */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-2xl px-5 py-3" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Unsaved changes</span>
          <button
            onClick={() => { clearPersistedConfig(selectedMerchant); const def = createDefaultConfig(selectedMerchant); setConfig(def); tenantCtx.setConfig(def); setHasChanges(false); }}
            className="h-8 px-4 bg-[#f5f6f8] text-[#84888c] text-[12px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
            style={{ fontWeight: 600, ...ss04 }}
          >Discard</button>
          <button
            onClick={handleSave}
            className="h-8 px-5 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors"
            style={{ fontWeight: 600, ...ss04, boxShadow: "0 2px 8px rgba(255,82,34,0.25)" }}
          >Save Changes</button>
        </div>
      )}

      {/* Diff modal */}
      <DiffSummaryModal
        open={showDiff}
        onClose={() => setShowDiff(false)}
        onConfirm={confirmSave}
        changes={diffChanges}
      />
    </div>
  );
}
