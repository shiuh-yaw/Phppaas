/**
 * OMS Audit Log — Lightweight client-side audit trail
 * =====================================================
 * Records admin actions to localStorage for the Audit Trail page.
 * In production, these would POST to an API; here we persist locally.
 */

export type AuditAction =
  | "login"
  | "logout"
  | "page_view"
  | "search"
  | "notification_read"
  | "notification_mark_all_read"
  | "txn_approve"
  | "txn_reject"
  | "bet_void"
  | "wallet_credit"
  | "wallet_debit"
  | "wallet_freeze"
  | "wallet_unfreeze"
  | "creator_approve"
  | "creator_reject"
  | "creator_suspend"
  | "creator_reinstate"
  | "creator_edit"
  | "config_save"
  | "export_data"
  | "user_role_change"
  | "password_change"
  | "admin_create"
  | "admin_edit"
  | "admin_disable"
  | "admin_enable"
  | "admin_reset_pw"
  | "admin_export_csv"
  | "kyb_submit"
  | "kyb_review_start"
  | "kyb_approve"
  | "kyb_reject"
  | "kyb_request_info"
  | "kyb_credential_sent"
  | "merchant_suspend"
  | "merchant_activate"
  | "merchant_edit"
  | "risk_investigate"
  | "risk_resolve"
  | "risk_dismiss"
  | "risk_hedge";

export interface AuditEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminRole: string;
  action: AuditAction;
  target?: string;
  detail?: string;
  merchantId?: string;
  ip?: string;
}

const AUDIT_STORAGE_KEY = "oms_audit_log";
const MAX_ENTRIES = 200;

let counter = 0;

function generateId(): string {
  counter++;
  return `AUD${Date.now()}-${counter}`;
}

function getEntries(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveEntries(entries: AuditEntry[]) {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {}
}

/**
 * Log an audit event. Call this from page components after significant actions.
 */
export function logAudit(params: {
  adminEmail: string;
  adminRole: string;
  action: AuditAction;
  target?: string;
  detail?: string;
  merchantId?: string;
}) {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    adminEmail: params.adminEmail,
    adminRole: params.adminRole,
    action: params.action,
    target: params.target,
    detail: params.detail,
    merchantId: params.merchantId,
    ip: "127.0.0.1", // Mock
  };

  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  return entry;
}

/**
 * Retrieve audit log entries, optionally filtered.
 */
export function getAuditLog(filters?: {
  action?: AuditAction;
  adminEmail?: string;
  merchantId?: string;
  limit?: number;
}): AuditEntry[] {
  let entries = getEntries();

  if (filters?.action) entries = entries.filter(e => e.action === filters.action);
  if (filters?.adminEmail) entries = entries.filter(e => e.adminEmail === filters.adminEmail);
  if (filters?.merchantId) entries = entries.filter(e => e.merchantId === filters.merchantId);
  if (filters?.limit) entries = entries.slice(0, filters.limit);

  return entries;
}

/**
 * Clear the audit log (for testing).
 */
export function clearAuditLog() {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}

/**
 * Get human-readable label for an audit action.
 */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: "Logged In",
  logout: "Logged Out",
  page_view: "Viewed Page",
  search: "Searched",
  notification_read: "Read Notification",
  notification_mark_all_read: "Marked All Notifications Read",
  txn_approve: "Approved Transaction",
  txn_reject: "Rejected Transaction",
  bet_void: "Voided Bet",
  wallet_credit: "Credited Wallet",
  wallet_debit: "Debited Wallet",
  wallet_freeze: "Froze Wallet",
  wallet_unfreeze: "Unfroze Wallet",
  creator_approve: "Approved Creator",
  creator_reject: "Rejected Creator",
  creator_suspend: "Suspended Creator",
  creator_reinstate: "Reinstated Creator",
  creator_edit: "Edited Creator Settings",
  config_save: "Saved Tenant Config",
  export_data: "Exported Data",
  user_role_change: "Changed User Role",
  password_change: "Changed Password",
  admin_create: "Created Admin",
  admin_edit: "Edited Admin",
  admin_disable: "Disabled Admin",
  admin_enable: "Enabled Admin",
  admin_reset_pw: "Reset Admin Password",
  admin_export_csv: "Exported Admin CSV",
  kyb_submit: "Submitted KYB Application",
  kyb_review_start: "Started KYB Review",
  kyb_approve: "Approved KYB Application",
  kyb_reject: "Rejected KYB Application",
  kyb_request_info: "Requested KYB Info",
  kyb_credential_sent: "Sent Login Credentials",
  merchant_suspend: "Suspended Merchant",
  merchant_activate: "Activated Merchant",
  merchant_edit: "Edited Merchant",
  risk_investigate: "Investigated Risk",
  risk_resolve: "Resolved Risk",
  risk_dismiss: "Dismissed Risk",
  risk_hedge: "Hedged Risk",
};

/**
 * Severity color for audit action categories.
 */
export function getAuditSeverity(action: AuditAction): "info" | "warning" | "critical" {
  const critical: AuditAction[] = ["wallet_freeze", "wallet_unfreeze", "bet_void", "creator_suspend", "txn_reject", "kyb_reject", "merchant_suspend", "risk_dismiss"];
  const warning: AuditAction[] = ["txn_approve", "wallet_credit", "wallet_debit", "creator_approve", "creator_reject", "creator_edit", "config_save", "user_role_change", "export_data", "kyb_approve", "kyb_request_info", "kyb_credential_sent", "merchant_activate", "merchant_edit", "risk_investigate", "risk_resolve", "risk_hedge"];
  if (critical.includes(action)) return "critical";
  if (warning.includes(action)) return "warning";
  return "info";
}