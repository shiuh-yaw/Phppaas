/**
 * OMS RBAC Guard Utilities
 * ========================
 * Role-Based Access Control helpers for OMS pages.
 * Wraps action buttons/sections to hide them from unauthorized roles.
 */
import type { ReactNode } from "react";
import { useOmsAuth } from "./oms-auth";
import { useTenantConfig } from "./oms-tenant-config";

type AdminRole = "platform_admin" | "platform_ops" | "merchant_admin" | "merchant_ops" | "merchant_support" | "merchant_finance";

/**
 * Role hierarchy for permission checks.
 * Higher index = more permissions.
 */
const ROLE_LEVEL: Record<AdminRole, number> = {
  platform_admin: 6,
  platform_ops: 5,
  merchant_admin: 4,
  merchant_ops: 3,
  merchant_finance: 2,
  merchant_support: 1,
};

/**
 * Action-level permission map.
 * Maps action names to the minimum role level required.
 */
const ACTION_PERMISSIONS: Record<string, number> = {
  // Full admin actions
  create_admin: 6,
  disable_admin: 6,
  delete_merchant: 6,
  paas_config: 5,
  manage_billing: 5,
  manage_kyb: 5,
  manage_payment_providers: 5,
  manage_payment_methods: 5,

  // Merchant admin actions
  create_market: 4,
  resolve_market: 4,
  void_bet: 4,
  manage_odds: 4,
  manage_fast_bet: 4,
  create_promo: 4,
  manage_rewards: 4,
  manage_leaderboard: 4,
  manage_content: 4,
  manage_notifications: 4,
  manage_creators: 4,
  manage_affiliates: 4,
  manage_settings: 4,
  export_data: 3,

  // Ops / finance actions
  approve_txn: 3,
  reject_txn: 3,
  credit_wallet: 3,
  debit_wallet: 3,
  freeze_wallet: 3,
  risk_investigate: 3,

  // Support actions
  assign_ticket: 1,
  reply_ticket: 1,
  resolve_ticket: 1,
  view_users: 1,
  view_reports: 1,
};

/**
 * Check if a given role has permission for an action.
 */
export function hasActionPermission(role: string, action: string): boolean {
  const level = ROLE_LEVEL[role as AdminRole] ?? 0;
  const required = ACTION_PERMISSIONS[action] ?? 6; // default: require highest permission
  return level >= required;
}

/**
 * useRBAC hook — returns helper to check if current admin can perform actions.
 */
export function useRBAC() {
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_support";

  return {
    /** Check action permission by role hierarchy */
    can: (action: string) => hasActionPermission(role, action),
    /** Check tenant-config-level permission */
    hasTenantPerm: (perm: string) => hasPermission(perm, role),
    /** Current role */
    role,
    /** Whether this is a platform-level user */
    isPlatform: role === "platform_admin" || role === "platform_ops",
    /** Whether this is at least merchant_admin */
    isAdmin: ROLE_LEVEL[role as AdminRole] >= 4,
    /** Whether this is at least ops level */
    isOps: ROLE_LEVEL[role as AdminRole] >= 3,
  };
}

/**
 * RBACGuard component — renders children only if the current user has the specified permission.
 */
export function RBACGuard({ action, children, fallback }: { action: string; children: ReactNode; fallback?: ReactNode }) {
  const { can } = useRBAC();
  if (!can(action)) return fallback ? <>{fallback}</> : null;
  return <>{children}</>;
}
