import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ==================== TYPES ==================== */
export type AccountStatus = "active" | "disabled" | "first_login" | "password_expired";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "platform_admin" | "platform_ops" | "merchant_admin" | "merchant_ops" | "merchant_support" | "merchant_finance";
  avatar: string;
  lastLogin: string;
  merchantId?: string;
  tenantName?: string; // 租户名称, displayed in the header
  status: AccountStatus;
  needsPasswordChange: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  primaryDomain: string;
  status: "active" | "onboarding" | "suspended" | "deactivated";
  plan: "starter" | "growth" | "enterprise" | "custom";
  country: string;
  currency: string;
  createdAt: string;
  ggr: number;
  users: number;
  markets: number;
}

/* ==================== PASSWORD RULES ==================== */
// 8+ chars, at least 2 of: uppercase, lowercase, digit, special
export function validatePassword(pw: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("Must be at least 8 characters");
  let categories = 0;
  if (/[A-Z]/.test(pw)) categories++;
  if (/[a-z]/.test(pw)) categories++;
  if (/[0-9]/.test(pw)) categories++;
  if (/[^A-Za-z0-9]/.test(pw)) categories++;
  if (categories < 2) errors.push("Must include at least 2 of: uppercase, lowercase, digit, special character");
  return { valid: errors.length === 0, errors };
}

// Generate a random 8-char password meeting the rules
export function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pw = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;
  while (pw.length < 10) pw.push(pick(all));
  // Shuffle
  for (let i = pw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pw[i], pw[j]] = [pw[j], pw[i]];
  }
  return pw.join("");
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

/* ==================== MOCK MERCHANTS ==================== */
export const MOCK_MERCHANTS: Merchant[] = [
  { id: "MCH001", name: "PredictEx", slug: "predictex", logo: "PX", primaryDomain: "predictex.ph", status: "active", plan: "enterprise", country: "Philippines", currency: "PHP", createdAt: "2025-06-01", ggr: 78400000, users: 485230, markets: 42 },
  { id: "MCH002", name: "BetManila", slug: "bet-manila", logo: "BM", primaryDomain: "betmanila.com", status: "active", plan: "growth", country: "Philippines", currency: "PHP", createdAt: "2025-09-15", ggr: 32100000, users: 128400, markets: 18 },
  { id: "MCH003", name: "Sugal PH", slug: "sugal-ph", logo: "SP", primaryDomain: "sugal.ph", status: "active", plan: "enterprise", country: "Philippines", currency: "PHP", createdAt: "2025-03-20", ggr: 56800000, users: 312000, markets: 35 },
  { id: "MCH004", name: "PinoyBets", slug: "pinoy-bets", logo: "PB", primaryDomain: "pinoybets.com", status: "onboarding", plan: "starter", country: "Philippines", currency: "PHP", createdAt: "2026-03-01", ggr: 0, users: 0, markets: 0 },
  { id: "MCH005", name: "WagerPH", slug: "wager-ph", logo: "WP", primaryDomain: "wagerph.com", status: "suspended", plan: "growth", country: "Philippines", currency: "PHP", createdAt: "2025-11-10", ggr: 12400000, users: 45000, markets: 8 },
  { id: "MCH006", name: "Tongits Live", slug: "tongits-live", logo: "TL", primaryDomain: "tongitslive.ph", status: "active", plan: "growth", country: "Philippines", currency: "PHP", createdAt: "2025-08-22", ggr: 18900000, users: 89200, markets: 12 },
  { id: "MCH007", name: "ColorBet Arena", slug: "colorbet-arena", logo: "CA", primaryDomain: "colorbet.ph", status: "active", plan: "starter", country: "Philippines", currency: "PHP", createdAt: "2026-01-15", ggr: 4200000, users: 22100, markets: 5 },
  { id: "MCH008", name: "MegaPusta", slug: "mega-pusta", logo: "MP", primaryDomain: "megapusta.com", status: "deactivated", plan: "starter", country: "Philippines", currency: "PHP", createdAt: "2025-07-01", ggr: 800000, users: 3200, markets: 0 },
];

/* ==================== ADMIN ACCOUNTS ==================== */
interface StoredAccount {
  password: string;
  user: AdminUser;
}

const INITIAL_ACCOUNTS: Record<string, StoredAccount> = {
  "admin@predictex.ph": {
    password: "admin123",
    user: {
      id: "A001", name: "Carlos Reyes", email: "admin@predictex.ph",
      role: "platform_admin", avatar: "", lastLogin: "2026-03-13 08:45 PHT",
      tenantName: "PredictEx Platform", status: "active", needsPasswordChange: false,
    },
  },
  "ops@predictex.ph": {
    password: "ops123",
    user: {
      id: "A002", name: "Ana Dela Cruz", email: "ops@predictex.ph",
      role: "platform_ops", avatar: "", lastLogin: "2026-03-13 07:20 PHT",
      tenantName: "PredictEx Platform", status: "active", needsPasswordChange: false,
    },
  },
  "admin@predictex.ph": {
    password: "lt123",
    user: {
      id: "MA001", name: "Maria Santos", email: "admin@predictex.ph",
      role: "merchant_admin", avatar: "", lastLogin: "2026-03-13 09:10 PHT",
      merchantId: "MCH001", tenantName: "PredictEx", status: "active", needsPasswordChange: false,
    },
  },
  // First-time login demo account (auto-generated password sent via email)
  "newadmin@betmanila.com": {
    password: "Bm$4xK9q2w", // auto-generated
    user: {
      id: "MA002", name: "Rico Santos", email: "newadmin@betmanila.com",
      role: "merchant_admin", avatar: "", lastLogin: "—",
      merchantId: "MCH002", tenantName: "BetManila", status: "first_login", needsPasswordChange: true,
    },
  },
  // Disabled account demo
  "disabled@predictex.ph": {
    password: "disabled123",
    user: {
      id: "MA003", name: "Jenny Lim", email: "disabled@predictex.ph",
      role: "merchant_ops", avatar: "", lastLogin: "2026-02-28 14:00 PHT",
      merchantId: "MCH001", tenantName: "PredictEx", status: "disabled", needsPasswordChange: false,
    },
  },
};

/* ==================== AUTH RESULT TYPES ==================== */
export type LoginResult =
  | { ok: true; user: AdminUser; requires2FA?: boolean }
  | { ok: false; reason: "invalid_credentials" | "account_disabled" | "account_not_found"; user?: AdminUser };

/* ==================== CONTEXT ==================== */
interface OmsAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  pending2FA: AdminUser | null; // user who passed password but needs 2FA
  demoTwoFACode: string;
  login: (email: string, password: string) => LoginResult;
  verify2FA: (code: string) => { ok: boolean; error?: string };
  cancel2FA: () => void;
  loginWithCode: (email: string, code: string) => LoginResult;
  requestVerificationCode: (email: string) => { sent: boolean; code?: string; error?: string };
  changePassword: (oldPw: string, newPw: string) => { ok: boolean; error?: string };
  resetPassword: (email: string, code: string, newPw: string) => { ok: boolean; error?: string };
  completeFirstLogin: (newPw: string) => { ok: boolean; error?: string };
  logout: () => void;
  merchants: Merchant[];
  activeMerchant: Merchant | null;
  setActiveMerchant: (m: Merchant | null) => void;
  addMerchant: (m: Merchant) => void;
  updateMerchant: (id: string, updates: Partial<Merchant>) => void;
  createAdminAccount: (params: { email: string; password: string; name: string; role: AdminUser["role"]; merchantId: string; tenantName: string }) => AdminUser;
}

const OmsAuthContext = createContext<OmsAuthContextType>({
  admin: null,
  isAuthenticated: false,
  pending2FA: null,
  demoTwoFACode: "",
  login: () => ({ ok: false, reason: "invalid_credentials" }),
  verify2FA: () => ({ ok: false }),
  cancel2FA: () => {},
  loginWithCode: () => ({ ok: false, reason: "invalid_credentials" }),
  requestVerificationCode: () => ({ sent: false }),
  changePassword: () => ({ ok: false }),
  resetPassword: () => ({ ok: false }),
  completeFirstLogin: () => ({ ok: false }),
  logout: () => {},
  merchants: [],
  activeMerchant: null,
  setActiveMerchant: () => {},
  addMerchant: () => {},
  updateMerchant: () => {},
  createAdminAccount: () => ({} as AdminUser),
});

export function OmsAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [pending2FA, setPending2FA] = useState<AdminUser | null>(null);
  const [twoFACode, setTwoFACode] = useState<string>("");
  const [activeMerchant, setActiveMerchant] = useState<Merchant | null>(null);
  const [accounts, setAccounts] = useState<Record<string, StoredAccount>>(INITIAL_ACCOUNTS);
  const [merchantsList, setMerchantsList] = useState<Merchant[]>(MOCK_MERCHANTS);
  // Store pending verification codes: email -> { code, expiresAt }
  const [pendingCodes, setPendingCodes] = useState<Record<string, { code: string; expiresAt: number }>>({});

  const autoSetMerchant = useCallback((user: AdminUser) => {
    if (user.merchantId) {
      setMerchantsList(prev => {
        const m = prev.find(m => m.id === user.merchantId);
        if (m) setActiveMerchant(m);
        return prev;
      });
    }
  }, []);

  const login = useCallback((email: string, password: string): LoginResult => {
    const account = accounts[email.toLowerCase()];
    if (!account) return { ok: false, reason: "account_not_found" };
    if (account.user.status === "disabled") return { ok: false, reason: "account_disabled", user: account.user };
    if (account.password !== password) return { ok: false, reason: "invalid_credentials" };
    // 2FA required for all admin/platform roles
    const needs2FA = account.user.role === "platform_admin" || account.user.role === "merchant_admin";
    if (needs2FA) {
      const code2FA = generateVerificationCode();
      setTwoFACode(code2FA);
      const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false }).replace(",", "") + " PHT";
      const updatedUser = { ...account.user, lastLogin: now };
      setAccounts(prev => ({ ...prev, [email.toLowerCase()]: { ...prev[email.toLowerCase()], user: updatedUser } }));
      setPending2FA(updatedUser);
      return { ok: true, user: updatedUser, requires2FA: true };
    }
    // No 2FA needed — direct login
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false }).replace(",", "") + " PHT";
    const updatedUser = { ...account.user, lastLogin: now };
    setAccounts(prev => ({ ...prev, [email.toLowerCase()]: { ...prev[email.toLowerCase()], user: updatedUser } }));
    setAdmin(updatedUser);
    autoSetMerchant(updatedUser);
    return { ok: true, user: updatedUser };
  }, [accounts, autoSetMerchant]);

  const verify2FA = useCallback((code: string): { ok: boolean; error?: string; demoCode?: string } => {
    if (!pending2FA) return { ok: false, error: "No pending 2FA session" };
    if (code !== twoFACode) return { ok: false, error: "Invalid verification code", demoCode: twoFACode };
    setAdmin(pending2FA);
    autoSetMerchant(pending2FA);
    setPending2FA(null);
    setTwoFACode("");
    return { ok: true };
  }, [pending2FA, twoFACode, autoSetMerchant]);

  const cancel2FA = useCallback(() => {
    setPending2FA(null);
    setTwoFACode("");
  }, []);

  const requestVerificationCode = useCallback((email: string): { sent: boolean; code?: string; error?: string } => {
    const account = accounts[email.toLowerCase()];
    if (!account) return { sent: false, error: "No account found for this email" };
    if (account.user.status === "disabled") return { sent: false, error: "This account has been disabled" };
    const code = generateVerificationCode();
    setPendingCodes(prev => ({ ...prev, [email.toLowerCase()]: { code, expiresAt: Date.now() + 5 * 60 * 1000 } }));
    // In a real system this would send an email. We return the code for demo purposes.
    return { sent: true, code };
  }, [accounts]);

  const loginWithCode = useCallback((email: string, code: string): LoginResult => {
    const account = accounts[email.toLowerCase()];
    if (!account) return { ok: false, reason: "account_not_found" };
    if (account.user.status === "disabled") return { ok: false, reason: "account_disabled", user: account.user };
    const pending = pendingCodes[email.toLowerCase()];
    if (!pending || pending.code !== code || Date.now() > pending.expiresAt) {
      return { ok: false, reason: "invalid_credentials" };
    }
    // Clear the used code
    setPendingCodes(prev => { const n = { ...prev }; delete n[email.toLowerCase()]; return n; });
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false }).replace(",", "") + " PHT";
    const updatedUser = { ...account.user, lastLogin: now };
    setAccounts(prev => ({ ...prev, [email.toLowerCase()]: { ...prev[email.toLowerCase()], user: updatedUser } }));
    setAdmin(updatedUser);
    autoSetMerchant(updatedUser);
    return { ok: true, user: updatedUser };
  }, [accounts, pendingCodes, autoSetMerchant]);

  const changePassword = useCallback((oldPw: string, newPw: string): { ok: boolean; error?: string } => {
    if (!admin) return { ok: false, error: "Not authenticated" };
    const account = accounts[admin.email.toLowerCase()];
    if (!account) return { ok: false, error: "Account not found" };
    if (account.password !== oldPw) return { ok: false, error: "Current password is incorrect" };
    const validation = validatePassword(newPw);
    if (!validation.valid) return { ok: false, error: validation.errors[0] };
    if (oldPw === newPw) return { ok: false, error: "New password must be different from current" };
    setAccounts(prev => ({
      ...prev,
      [admin.email.toLowerCase()]: { ...prev[admin.email.toLowerCase()], password: newPw, user: { ...prev[admin.email.toLowerCase()].user, needsPasswordChange: false } },
    }));
    return { ok: true };
  }, [admin, accounts]);

  const completeFirstLogin = useCallback((newPw: string): { ok: boolean; error?: string } => {
    if (!admin) return { ok: false, error: "Not authenticated" };
    const validation = validatePassword(newPw);
    if (!validation.valid) return { ok: false, error: validation.errors[0] };
    const account = accounts[admin.email.toLowerCase()];
    if (account && account.password === newPw) return { ok: false, error: "New password must be different from the auto-generated password" };
    setAccounts(prev => ({
      ...prev,
      [admin.email.toLowerCase()]: { ...prev[admin.email.toLowerCase()], password: newPw, user: { ...prev[admin.email.toLowerCase()].user, status: "active", needsPasswordChange: false } },
    }));
    setAdmin(prev => prev ? { ...prev, status: "active", needsPasswordChange: false } : null);
    return { ok: true };
  }, [admin, accounts]);

  const resetPassword = useCallback((email: string, code: string, newPw: string): { ok: boolean; error?: string } => {
    const account = accounts[email.toLowerCase()];
    if (!account) return { ok: false, error: "Account not found" };
    const pending = pendingCodes[email.toLowerCase()];
    if (!pending || pending.code !== code || Date.now() > pending.expiresAt) {
      return { ok: false, error: "Invalid or expired verification code" };
    }
    const validation = validatePassword(newPw);
    if (!validation.valid) return { ok: false, error: validation.errors[0] };
    setPendingCodes(prev => { const n = { ...prev }; delete n[email.toLowerCase()]; return n; });
    setAccounts(prev => ({
      ...prev,
      [email.toLowerCase()]: { ...prev[email.toLowerCase()], password: newPw, user: { ...prev[email.toLowerCase()].user, needsPasswordChange: false } },
    }));
    return { ok: true };
  }, [accounts, pendingCodes]);

  const logout = useCallback(() => {
    setAdmin(null);
    setActiveMerchant(null);
    setPending2FA(null);
    setTwoFACode("");
  }, []);

  const addMerchant = useCallback((m: Merchant) => {
    setMerchantsList(prev => [...prev, m]);
  }, []);

  const updateMerchant = useCallback((id: string, updates: Partial<Merchant>) => {
    setMerchantsList(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const createAdminAccount = useCallback((params: { email: string; password: string; name: string; role: AdminUser["role"]; merchantId: string; tenantName: string }) => {
    const newAdmin: AdminUser = {
      id: `MA${Object.keys(accounts).length + 1}`,
      name: params.name,
      email: params.email,
      role: params.role,
      avatar: "",
      lastLogin: "—",
      merchantId: params.merchantId,
      tenantName: params.tenantName,
      status: "first_login",
      needsPasswordChange: true,
    };
    setAccounts(prev => ({
      ...prev,
      [params.email.toLowerCase()]: {
        password: params.password,
        user: newAdmin,
      },
    }));
    return newAdmin;
  }, [accounts]);

  return (
    <OmsAuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin && admin.status !== "disabled",
      pending2FA,
      demoTwoFACode: twoFACode,
      login,
      verify2FA,
      cancel2FA,
      loginWithCode,
      requestVerificationCode,
      changePassword,
      resetPassword,
      completeFirstLogin,
      logout,
      merchants: merchantsList,
      activeMerchant,
      setActiveMerchant,
      addMerchant,
      updateMerchant,
      createAdminAccount,
    }}>
      {children}
    </OmsAuthContext.Provider>
  );
}

export const useOmsAuth = () => useContext(OmsAuthContext);

export function isPlatformUser(role: string) {
  return role === "platform_admin" || role === "platform_ops";
}

const ROLE_LABELS: Record<string, string> = {
  platform_admin: "Platform Admin",
  platform_ops: "Platform Ops",
  merchant_admin: "Merchant Admin",
  merchant_ops: "Merchant Ops",
  merchant_support: "Merchant Support",
  merchant_finance: "Merchant Finance",
  super_admin: "Platform Admin",
  admin: "Admin",
  moderator: "Moderator",
  finance: "Finance",
  support: "Support",
};

export function getRoleLabel(role: string) {
  return ROLE_LABELS[role] || role;
}

export function getRoleBadgeColor(role: string) {
  switch (role) {
    case "platform_admin":
    case "super_admin": return "bg-red-500/20 text-red-400";
    case "platform_ops": return "bg-orange-500/20 text-orange-400";
    case "merchant_admin":
    case "admin": return "bg-blue-500/20 text-blue-400";
    case "merchant_ops":
    case "moderator": return "bg-cyan-500/20 text-cyan-400";
    case "merchant_finance":
    case "finance": return "bg-emerald-500/20 text-emerald-400";
    case "merchant_support":
    case "support": return "bg-purple-500/20 text-purple-400";
    default: return "bg-gray-500/20 text-gray-400";
  }
}