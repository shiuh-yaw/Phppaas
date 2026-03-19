import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ==================== TYPES ==================== */
export type TenantRole = "merchant_admin" | "merchant_ops" | "merchant_finance" | "merchant_support" | "agent";

export interface FieldVisibility {
  key: string;
  label: string;
  description: string;
  category: "identity" | "activity" | "financial" | "system";
  roles: Record<TenantRole, boolean>;
}

export interface PermissionRule {
  key: string;
  label: string;
  description: string;
  category: "user_mgmt" | "asset_mgmt" | "trading" | "role_mgmt" | "system";
  severity: "normal" | "elevated" | "critical";
  roles: Record<TenantRole, boolean>;
}

export interface AccountPolicy {
  key: string;
  label: string;
  description: string;
  fgOnly: boolean;
  merchantOverride: boolean;
}

export interface ChannelConfig {
  key: string;
  label: string;
  enabled: boolean;
  requiresApproval: boolean;
  autoAssignAgent: boolean;
}

export interface TenantConfig {
  schemaVersion: number;
  merchantId: string;
  fieldVisibility: FieldVisibility[];
  permissions: PermissionRule[];
  accountPolicies: AccountPolicy[];
  channels: ChannelConfig[];
  maxUsersPerTenant: number;
  maxCreatorsPerTenant: number;
  userExportEnabled: boolean;
  piiMaskingEnabled: boolean;
  auditLogRetentionDays: number;
  webhookUrl: string;
  webhookSecret: string;
  apiRateLimit: number;
}

/* ==================== ALL ROLES ==================== */
export const ALL_TENANT_ROLES: TenantRole[] = ["merchant_admin", "merchant_ops", "merchant_finance", "merchant_support", "agent"];

export const ROLE_LABELS: Record<TenantRole, { label: string; color: string; bg: string }> = {
  merchant_admin: { label: "Merchant Admin", color: "text-blue-600", bg: "bg-blue-50" },
  merchant_ops: { label: "Merchant Ops", color: "text-cyan-600", bg: "bg-cyan-50" },
  merchant_finance: { label: "Finance", color: "text-emerald-600", bg: "bg-emerald-50" },
  merchant_support: { label: "Support", color: "text-purple-600", bg: "bg-purple-50" },
  agent: { label: "Agent", color: "text-amber-600", bg: "bg-amber-50" },
};

/* ==================== DEFAULT CONFIG FACTORY ==================== */
export function createDefaultConfig(merchantId: string): TenantConfig {
  return {
    schemaVersion: 1,
    merchantId,
    fieldVisibility: [
      { key: "wallet_address", label: "Wallet Address", description: "KMS-generated wallet address", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "uid", label: "UID", description: "Unique user identifier", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "nickname", label: "Nickname", description: "User display name", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "email", label: "Email", description: "User email address (PII)", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "user_type", label: "User Type", description: "Creator or User role", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "channel", label: "Channel", description: "Registration channel", category: "identity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "recent_ip", label: "Recent IP", description: "Last known IP address", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "recent_geo", label: "Geo-location", description: "Last known geographic location", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "last_login", label: "Last Login Time", description: "Most recent login timestamp", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: true } },
      { key: "source", label: "Source", description: "User acquisition source", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: true } },
      { key: "agent_name", label: "Agent Name", description: "Referring agent", category: "activity", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: true } },
      { key: "total_asset", label: "Total Asset", description: "User total asset balance", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "total_volume", label: "Total Volume", description: "Cumulative trading volume", category: "financial", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "settled_pnl", label: "Settled PNL", description: "Profit and loss", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "withdraw_history", label: "Withdrawal History", description: "On-chain records", category: "financial", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "social_channel", label: "Social Channel", description: "Creator social media", category: "system", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "contact_details", label: "Contact Details", description: "Phone, Telegram, WhatsApp", category: "system", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
    ],
    permissions: [
      { key: "view_user_list", label: "View User List", description: "Access the user management table", category: "user_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "search_users", label: "Search Users", description: "Use search and filter functions", category: "user_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: true, agent: true } },
      { key: "export_users", label: "Export User Data", description: "Download user data as CSV/Excel", category: "user_mgmt", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "view_assets", label: "View Asset Info", description: "Open the Asset Information modal", category: "asset_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "modify_suspend_trading", label: "Suspend Trading", description: "Toggle suspend trading", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_suspend_deposit", label: "Suspend Deposit", description: "Toggle suspend deposit", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_suspend_withdraw", label: "Suspend Withdraw", description: "Toggle suspend withdraw", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_withdraw_limits", label: "Modify Withdraw Limits", description: "Change withdraw limits", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_whitelist", label: "Modify Whitelist", description: "Toggle whitelist status", category: "asset_mgmt", severity: "critical", roles: { merchant_admin: false, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "view_trading", label: "View Trading Info", description: "Open Trading Information modal", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "view_trade_history", label: "View Trade History", description: "See individual trade records", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: true, merchant_support: false, agent: false } },
      { key: "view_user_settings", label: "View User Settings", description: "See user preferences tab", category: "trading", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: true, agent: false } },
      { key: "view_role", label: "View Role Info", description: "Open Role Management modal", category: "role_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_role", label: "Change User Role", description: "Switch user/creator", category: "role_mgmt", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "modify_contact", label: "Edit Contact Details", description: "Update social/phone/telegram", category: "role_mgmt", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "view_audit_log", label: "View Audit Log", description: "See action history", category: "system", severity: "normal", roles: { merchant_admin: true, merchant_ops: true, merchant_finance: false, merchant_support: false, agent: false } },
      { key: "access_api", label: "API Access", description: "Use tenant API endpoints", category: "system", severity: "elevated", roles: { merchant_admin: true, merchant_ops: false, merchant_finance: false, merchant_support: false, agent: false } },
    ],
    accountPolicies: [
      { key: "suspend_trading", label: "Suspend Trading", description: "Freeze trading", fgOnly: true, merchantOverride: false },
      { key: "suspend_deposit", label: "Suspend Deposit", description: "Block deposits", fgOnly: true, merchantOverride: false },
      { key: "suspend_withdraw", label: "Suspend Withdraw", description: "Block withdrawals", fgOnly: true, merchantOverride: false },
      { key: "withdraw_limits", label: "Withdraw Limits", description: "Modify limits", fgOnly: true, merchantOverride: false },
      { key: "withdraw_fee", label: "Withdraw Fee", description: "Adjust fee %", fgOnly: true, merchantOverride: false },
      { key: "whitelist_toggle", label: "Whitelist Management", description: "Toggle whitelist", fgOnly: true, merchantOverride: false },
      { key: "role_assignment", label: "Role Assignment", description: "Change user type", fgOnly: false, merchantOverride: true },
      { key: "contact_edit", label: "Contact Editing", description: "Edit contact details", fgOnly: false, merchantOverride: true },
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

/* ==================== ADMIN ROLE → TENANT ROLE MAPPING ==================== */
// Platform admins (platform_admin / platform_ops) have full access; they bypass tenant config.
// Merchant-scoped roles map directly.
export function mapAdminToTenantRole(adminRole: string): TenantRole | "platform" {
  if (adminRole === "platform_admin" || adminRole === "platform_ops") return "platform";
  const map: Record<string, TenantRole> = {
    merchant_admin: "merchant_admin",
    merchant_ops: "merchant_ops",
    merchant_finance: "merchant_finance",
    merchant_support: "merchant_support",
  };
  return map[adminRole] || "agent";
}

/* ==================== SCHEMA VERSIONING & MIGRATIONS ==================== */
/**
 * Bump this whenever the TenantConfig shape changes.
 * Each bump MUST have a corresponding entry in MIGRATIONS.
 *
 * Version history:
 *   0 — pre-versioning (no schemaVersion field); original field set
 *   1 — added schemaVersion; canonical field/perm/policy keys stabilised
 *
 * To add a new migration:
 *   1. Bump CURRENT_SCHEMA_VERSION
 *   2. Add a migration entry { from: <old>, to: <new>, migrate: (old, defaults) => new }
 *   3. The migrate function receives the old config (typed as `any`) and the
 *      fresh defaults for the target version so you can merge new fields in.
 */
export const CURRENT_SCHEMA_VERSION = 1;

interface Migration {
  from: number;
  to: number;
  migrate: (old: any, defaults: TenantConfig) => TenantConfig;
}

/**
 * Helper: merge an array-of-keyed-objects from defaults into an existing array,
 * preserving user-customised entries by key and appending any new keys from defaults.
 */
function mergeKeyedArray<T extends { key: string }>(existing: T[], defaults: T[]): T[] {
  const existingKeys = new Set(existing.map(e => e.key));
  const merged = existing.map(e => {
    const def = defaults.find(d => d.key === e.key);
    // Patch metadata (label, description, category, severity) from defaults
    // but preserve user-toggled role booleans / flags
    if (def) return { ...def, ...e, label: def.label, description: def.description };
    return e;
  });
  // Append any keys in defaults that don't exist in existing
  for (const d of defaults) {
    if (!existingKeys.has(d.key)) merged.push(d);
  }
  return merged;
}

const MIGRATIONS: Migration[] = [
  {
    from: 0,
    to: 1,
    migrate: (old: any, defaults: TenantConfig): TenantConfig => {
      // v0 → v1: Stamp schemaVersion, merge any missing fields/perms/policies
      // that were added in v1, and back-fill new scalar fields.
      return {
        ...defaults,
        merchantId: old.merchantId ?? defaults.merchantId,
        schemaVersion: 1,
        fieldVisibility: mergeKeyedArray(
          Array.isArray(old.fieldVisibility) ? old.fieldVisibility : [],
          defaults.fieldVisibility
        ),
        permissions: mergeKeyedArray(
          Array.isArray(old.permissions) ? old.permissions : [],
          defaults.permissions
        ),
        accountPolicies: mergeKeyedArray(
          Array.isArray(old.accountPolicies) ? old.accountPolicies : [],
          defaults.accountPolicies
        ),
        channels: mergeKeyedArray(
          Array.isArray(old.channels) ? old.channels : [],
          defaults.channels
        ),
        maxUsersPerTenant:     old.maxUsersPerTenant     ?? defaults.maxUsersPerTenant,
        maxCreatorsPerTenant:  old.maxCreatorsPerTenant  ?? defaults.maxCreatorsPerTenant,
        userExportEnabled:     old.userExportEnabled     ?? defaults.userExportEnabled,
        piiMaskingEnabled:     old.piiMaskingEnabled     ?? defaults.piiMaskingEnabled,
        auditLogRetentionDays: old.auditLogRetentionDays ?? defaults.auditLogRetentionDays,
        webhookUrl:            old.webhookUrl            ?? defaults.webhookUrl,
        webhookSecret:         old.webhookSecret         ?? defaults.webhookSecret,
        apiRateLimit:          old.apiRateLimit          ?? defaults.apiRateLimit,
      };
    },
  },
  // Future migrations go here:
  // { from: 1, to: 2, migrate: (old, defaults) => { ... } },
];

/**
 * Run the migration pipeline on a raw parsed config.
 * Returns [migratedConfig, didMigrate].
 */
function runMigrations(raw: any, merchantId: string): [TenantConfig, boolean] {
  let version: number = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0;
  let config = raw;
  let didMigrate = false;
  const defaults = createDefaultConfig(merchantId);

  let iterations = 0;
  const maxIterations = MIGRATIONS.length + 1;

  while (version < CURRENT_SCHEMA_VERSION && iterations < maxIterations) {
    const migration = MIGRATIONS.find(m => m.from === version);
    if (!migration) {
      console.warn(`[OMS] No migration path from schema v${version} → v${CURRENT_SCHEMA_VERSION}. Resetting to defaults.`);
      return [defaults, true];
    }
    try {
      config = migration.migrate(config, defaults);
      version = migration.to;
      didMigrate = true;
    } catch (err) {
      console.error(`[OMS] Migration v${migration.from}→v${migration.to} failed:`, err);
      return [defaults, true];
    }
    iterations++;
  }

  // If persisted version is AHEAD of current code (downgrade scenario), reset
  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(`[OMS] Persisted schema v${version} is newer than code v${CURRENT_SCHEMA_VERSION}. Resetting to defaults.`);
    return [defaults, true];
  }

  return [config as TenantConfig, didMigrate];
}

/** Exported for PaaS Config "Schema Info" panel */
export function getSchemaInfo() {
  return {
    currentVersion: CURRENT_SCHEMA_VERSION,
    migrationCount: MIGRATIONS.length,
    migrationChain: MIGRATIONS.map(m => `v${m.from} → v${m.to}`),
  };
}

/* ==================== LOCALSTORAGE HELPERS ==================== */
const STORAGE_PREFIX = "oms_tenant_cfg_";

function persistConfig(c: TenantConfig): void {
  try {
    // Always stamp current version before writing
    const stamped = { ...c, schemaVersion: CURRENT_SCHEMA_VERSION };
    localStorage.setItem(STORAGE_PREFIX + stamped.merchantId, JSON.stringify(stamped));
    const idx: string[] = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "_index") || "[]");
    if (!idx.includes(stamped.merchantId)) {
      idx.push(stamped.merchantId);
      localStorage.setItem(STORAGE_PREFIX + "_index", JSON.stringify(idx));
    }
  } catch { /* quota exceeded or private browsing — fail silently */ }
}

export function loadConfig(merchantId: string): TenantConfig {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + merchantId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.merchantId && Array.isArray(parsed.fieldVisibility) && Array.isArray(parsed.permissions)) {
        const [migrated, didMigrate] = runMigrations(parsed, merchantId);
        // If we migrated, re-persist the upgraded config immediately
        if (didMigrate) {
          persistConfig(migrated);
          console.info(`[OMS] Config for "${merchantId}" migrated to schema v${CURRENT_SCHEMA_VERSION} and re-persisted.`);
        }
        return migrated;
      }
    }
  } catch (err) {
    console.error(`[OMS] Failed to load config for "${merchantId}":`, err);
  }
  return createDefaultConfig(merchantId);
}

export function listSavedMerchantIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "_index") || "[]");
  } catch { return []; }
}

export function clearPersistedConfig(merchantId: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + merchantId);
    const idx: string[] = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "_index") || "[]");
    localStorage.setItem(STORAGE_PREFIX + "_index", JSON.stringify(idx.filter(id => id !== merchantId)));
  } catch { /* fail silently */ }
}

/* ==================== CONTEXT ==================== */
interface TenantConfigContextType {
  config: TenantConfig;
  setConfig: (c: TenantConfig) => void;
  updateConfig: (fn: (prev: TenantConfig) => TenantConfig) => void;
  loadForMerchant: (merchantId: string) => void;
  // Query helpers — these take the admin role (from oms-auth) and resolve access
  canSeeField: (fieldKey: string, adminRole: string) => boolean;
  hasPermission: (permKey: string, adminRole: string) => boolean;
  canModifyControl: (policyKey: string, adminRole: string) => boolean;
  getVisibleFieldKeys: (adminRole: string) => string[];
  getPermittedActions: (adminRole: string) => string[];
}

const TenantConfigContext = createContext<TenantConfigContextType>({
  config: createDefaultConfig("GLOBAL"),
  setConfig: () => {},
  updateConfig: () => {},
  loadForMerchant: () => {},
  canSeeField: () => true,
  hasPermission: () => true,
  canModifyControl: () => false,
  getVisibleFieldKeys: () => [],
  getPermittedActions: () => [],
});

export function TenantConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<TenantConfig>(createDefaultConfig("GLOBAL"));

  const setConfig = useCallback((c: TenantConfig) => {
    setConfigState(c);
    persistConfig(c);
  }, []);
  const updateConfig = useCallback((fn: (prev: TenantConfig) => TenantConfig) => {
    setConfigState(prev => {
      const newConfig = fn(prev);
      persistConfig(newConfig);
      return newConfig;
    });
  }, []);

  const canSeeField = useCallback((fieldKey: string, adminRole: string): boolean => {
    const tenantRole = mapAdminToTenantRole(adminRole);
    if (tenantRole === "platform") return true; // Platform admins see everything
    const field = config.fieldVisibility.find(f => f.key === fieldKey);
    if (!field) return false;
    return field.roles[tenantRole] ?? false;
  }, [config]);

  const hasPermission = useCallback((permKey: string, adminRole: string): boolean => {
    const tenantRole = mapAdminToTenantRole(adminRole);
    if (tenantRole === "platform") return true; // Platform admins can do everything
    const perm = config.permissions.find(p => p.key === permKey);
    if (!perm) return false;
    // Critical permissions are FG-only unless config overrides
    if (perm.severity === "critical") return false;
    return perm.roles[tenantRole] ?? false;
  }, [config]);

  const canModifyControl = useCallback((policyKey: string, adminRole: string): boolean => {
    const tenantRole = mapAdminToTenantRole(adminRole);
    if (tenantRole === "platform") return true; // Platform admins can modify all controls
    const policy = config.accountPolicies.find(p => p.key === policyKey);
    if (!policy) return false;
    if (policy.fgOnly && !policy.merchantOverride) return false; // FG-only, not delegated
    if (policy.merchantOverride && tenantRole === "merchant_admin") return true; // Delegated to merchant admin
    return false;
  }, [config]);

  const getVisibleFieldKeys = useCallback((adminRole: string): string[] => {
    const tenantRole = mapAdminToTenantRole(adminRole);
    if (tenantRole === "platform") return config.fieldVisibility.map(f => f.key);
    return config.fieldVisibility.filter(f => f.roles[tenantRole]).map(f => f.key);
  }, [config]);

  const getPermittedActions = useCallback((adminRole: string): string[] => {
    const tenantRole = mapAdminToTenantRole(adminRole);
    if (tenantRole === "platform") return config.permissions.map(p => p.key);
    return config.permissions.filter(p => {
      if (p.severity === "critical") return false;
      return p.roles[tenantRole] ?? false;
    }).map(p => p.key);
  }, [config]);

  const loadForMerchant = useCallback((merchantId: string) => {
    setConfigState(loadConfig(merchantId));
  }, []);

  return (
    <TenantConfigContext.Provider value={{ config, setConfig, updateConfig, loadForMerchant, canSeeField, hasPermission, canModifyControl, getVisibleFieldKeys, getPermittedActions }}>
      {children}
    </TenantConfigContext.Provider>
  );
}

export const useTenantConfig = () => useContext(TenantConfigContext);