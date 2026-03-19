import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useRBAC } from "../../components/oms/oms-rbac";

const inter = { fontFamily: "'Inter', sans-serif" };

type Tab = "overview" | "urls" | "webhooks" | "api-keys" | "users" | "settings" | "compliance";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "disabled" | "failing";
  lastTriggered: string;
  successRate: number;
  signingSecret: string;
}

interface ApiKey {
  id: string;
  name: string;
  type: "live" | "test";
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

interface MerchantUser {
  id: string;
  name: string;
  email: string;
  role: "merchant_admin" | "merchant_ops" | "merchant_support" | "merchant_finance";
  status: "active" | "invited" | "disabled";
  lastLogin: string;
  twoFa: boolean;
}

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  { id: "WH001", url: "https://api.luckytaya.ph/webhooks/bets", events: ["bet.placed", "bet.settled", "bet.voided"], status: "active", lastTriggered: "2 min ago", successRate: 99.8, signingSecret: "whsec_a1b2c3d4e5f6..." },
  { id: "WH002", url: "https://api.luckytaya.ph/webhooks/payments", events: ["deposit.confirmed", "withdrawal.processed", "withdrawal.failed"], status: "active", lastTriggered: "5 min ago", successRate: 99.5, signingSecret: "whsec_g7h8i9j0k1l2..." },
  { id: "WH003", url: "https://api.luckytaya.ph/webhooks/users", events: ["user.registered", "user.kyc_verified", "user.suspended"], status: "active", lastTriggered: "15 min ago", successRate: 100.0, signingSecret: "whsec_m3n4o5p6q7r8..." },
  { id: "WH004", url: "https://staging.luckytaya.ph/webhooks/test", events: ["*"], status: "disabled", lastTriggered: "3 days ago", successRate: 85.2, signingSecret: "whsec_s9t0u1v2w3x4..." },
];

const MOCK_API_KEYS: ApiKey[] = [
  { id: "AK001", name: "Production API Key", type: "live", prefix: "fg_live_a1b2c3d4", createdAt: "2025-06-01", lastUsed: "Just now", status: "active" },
  { id: "AK002", name: "Mobile App Key", type: "live", prefix: "fg_live_e5f6g7h8", createdAt: "2025-08-15", lastUsed: "2 min ago", status: "active" },
  { id: "AK003", name: "Staging Test Key", type: "test", prefix: "fg_test_i9j0k1l2", createdAt: "2025-06-01", lastUsed: "1 hr ago", status: "active" },
  { id: "AK004", name: "Old Integration Key", type: "live", prefix: "fg_live_m3n4o5p6", createdAt: "2025-03-01", lastUsed: "2 months ago", status: "revoked" },
];

const MOCK_MERCHANT_USERS: MerchantUser[] = [
  { id: "MU001", name: "Maria Santos", email: "maria.s@luckytaya.ph", role: "merchant_admin", status: "active", lastLogin: "10 min ago", twoFa: true },
  { id: "MU002", name: "JM Reyes", email: "jm.r@luckytaya.ph", role: "merchant_ops", status: "active", lastLogin: "1 hr ago", twoFa: true },
  { id: "MU003", name: "Rosa Lim", email: "rosa.l@luckytaya.ph", role: "merchant_finance", status: "active", lastLogin: "3 hr ago", twoFa: false },
  { id: "MU004", name: "Ken Villanueva", email: "ken.v@luckytaya.ph", role: "merchant_support", status: "active", lastLogin: "30 min ago", twoFa: true },
  { id: "MU005", name: "New Hire", email: "newhire@luckytaya.ph", role: "merchant_ops", status: "invited", lastLogin: "Never", twoFa: false },
];

const ALL_EVENTS = ["bet.placed", "bet.settled", "bet.voided", "deposit.confirmed", "withdrawal.processed", "withdrawal.failed", "user.registered", "user.kyc_verified", "user.suspended", "market.created", "market.resolved", "market.voided"];

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-400", disabled: "bg-gray-400", failing: "bg-red-400", invited: "bg-amber-400", revoked: "bg-red-400" };
  return <div className={`w-2 h-2 rounded-full ${map[status] || "bg-gray-400"}`} />;
}

function copyToClipboard(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showOmsToast("Copied to clipboard");
}

export default function OmsMerchantDetail() {
  const { id } = useParams<{ id: string }>();
  const merchant = useOmsAuth().merchants.find(m => m.id === id) || useOmsAuth().merchants[0];
  const [tab, setTab] = useState<Tab>("overview");

  // Webhook state
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS);
  const [merchantUsers, setMerchantUsers] = useState(MOCK_MERCHANT_USERS);

  // Modal state
  const [modalType, setModalType] = useState<"add-webhook" | "edit-webhook" | "delete-webhook" | "add-key" | "revoke-key" | "invite-user" | "edit-user" | "disable-user" | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [selectedUser, setSelectedUser] = useState<MerchantUser | null>(null);

  // Webhook form
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);

  // API Key form
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState("live");

  // User invite form
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState("merchant_ops");

  // URL config state
  const [urls, setUrls] = useState({
    production: merchant.primaryDomain,
    staging: `staging.${merchant.primaryDomain}`,
    callbackUrl: `https://api.${merchant.primaryDomain}/callbacks`,
    redirectUrl: `https://${merchant.primaryDomain}/auth/callback`,
    logoutUrl: `https://${merchant.primaryDomain}/logout`,
    termsUrl: `https://${merchant.primaryDomain}/terms`,
    privacyUrl: `https://${merchant.primaryDomain}/privacy`,
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "urls", label: "URLs & Domains" },
    { key: "webhooks", label: `Webhooks (${webhooks.length})` },
    { key: "api-keys", label: `API Keys (${apiKeys.filter(k => k.status === "active").length})` },
    { key: "users", label: `Users (${merchantUsers.length})` },
    { key: "settings", label: "Settings" },
    { key: "compliance", label: "Compliance" },
  ];

  return (
    <div className="space-y-4" style={inter}>
      {/* Merchant header */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-xl bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[20px] flex-shrink-0" style={{ fontWeight: 800 }}>
          {merchant.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h2 className="text-white text-[18px]" style={{ fontWeight: 700 }}>{merchant.name}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${merchant.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`} style={{ fontWeight: 600 }}>{merchant.status.toUpperCase()}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400`} style={{ fontWeight: 600 }}>{merchant.plan.toUpperCase()}</span>
          </div>
          <p className="text-[#6b7280] text-[12px]">{merchant.id} · {merchant.primaryDomain} · {merchant.currency}</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "GGR", value: `₱${(merchant.ggr / 1000000).toFixed(1)}M` },
            { label: "Users", value: `${(merchant.users / 1000).toFixed(0)}K` },
            { label: "Markets", value: String(merchant.markets) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[#6b7280] text-[9px]" style={{ fontWeight: 500 }}>{s.label}</p>
              <p className="text-white text-[14px]" style={{ fontWeight: 700 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`text-[11px] px-3 py-1.5 rounded-md cursor-pointer transition-colors whitespace-nowrap ${tab === t.key ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white"}`} style={{ fontWeight: 600 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ==================== OVERVIEW TAB ==================== */}
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Merchant Info</h3>
            {[
              { label: "Name", value: merchant.name },
              { label: "Slug", value: merchant.slug },
              { label: "Primary Domain", value: merchant.primaryDomain },
              { label: "Country", value: merchant.country },
              { label: "Currency", value: merchant.currency },
              { label: "Plan", value: merchant.plan.toUpperCase() },
              { label: "Created", value: merchant.createdAt },
            ].map(d => (
              <div key={d.label} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#6b7280] text-[12px]">{d.label}</span>
                <span className="text-white text-[12px]" style={{ fontWeight: 500 }}>{d.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
              <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Integration Status</h3>
              <div className="space-y-2">
                {[
                  { label: "API Integration", status: "connected", detail: "2 live keys active" },
                  { label: "Webhook Delivery", status: "healthy", detail: "99.7% success rate" },
                  { label: "Payment Gateway", status: "connected", detail: "GCash, Maya, BankTransfer" },
                  { label: "KYC Provider", status: "connected", detail: "ForeGate KYC API" },
                  { label: "SSL Certificate", status: "valid", detail: "Expires 2027-01-15" },
                ].map(i => (
                  <div key={i.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[#9ca3af] text-[12px]">{i.label}</span>
                    </div>
                    <span className="text-[#6b7280] text-[11px]">{i.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
              <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Quick Stats (Today)</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Revenue", value: "₱2.62M", color: "text-[#ff5222]" },
                  { label: "Active Users", value: "8,432", color: "text-emerald-400" },
                  { label: "Bets Placed", value: "24,180", color: "text-white" },
                  { label: "API Calls", value: "1.2M", color: "text-blue-400" },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                    <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
                    <p className={`text-[16px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== URLS TAB ==================== */}
      {tab === "urls" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-4">
          <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Domain & URL Configuration</h3>
          <p className="text-[#6b7280] text-[11px]">Configure the domains and callback URLs for this merchant's integration.</p>
          {Object.entries(urls).map(([key, val]) => (
            <div key={key}>
              <label className="block text-[#9ca3af] text-[11px] mb-1.5" style={{ fontWeight: 500 }}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
              </label>
              <div className="flex gap-2">
                <input
                  value={val}
                  onChange={e => setUrls(prev => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 h-9 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] font-mono outline-none focus:border-[#ff5222] transition-colors"
                />
                <button onClick={() => copyToClipboard(val)} className="h-9 px-3 bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] text-[11px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Copy</button>
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-[#1f2937]">
            <OmsBtn variant="primary" onClick={() => showOmsToast("URL configuration saved")}>Save URL Config</OmsBtn>
          </div>
        </div>
      )}

      {/* ==================== WEBHOOKS TAB ==================== */}
      {tab === "webhooks" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[#6b7280] text-[12px]">Webhook endpoints receive real-time event notifications via HTTP POST.</p>
            <button onClick={() => { setWhUrl(""); setWhEvents([]); setModalType("add-webhook"); }} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ Add Endpoint</button>
          </div>
          {webhooks.map(wh => (
            <div key={wh.id} className={`bg-[#111827] border rounded-xl p-4 ${wh.status === "failing" ? "border-red-500/20" : "border-[#1f2937]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={wh.status} />
                    <span className="text-white text-[12px] font-mono truncate" style={{ fontWeight: 500 }}>{wh.url}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-1.5">
                    {wh.events.map(e => <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1f2937] text-[#9ca3af] font-mono">{e}</span>)}
                  </div>
                  <div className="flex gap-3 text-[10px] text-[#4b5563]">
                    <span>Last triggered: {wh.lastTriggered}</span>
                    <span>Success: <span className={wh.successRate >= 99 ? "text-emerald-400" : "text-amber-400"}>{wh.successRate}%</span></span>
                    <span>Secret: <span className="font-mono text-[#6b7280]">{wh.signingSecret}</span></span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => { setSelectedWebhook(wh); setWhUrl(wh.url); setWhEvents(wh.events); setModalType("edit-webhook"); }} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit</button>
                  <button onClick={() => { setSelectedWebhook(wh); setModalType("delete-webhook"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== API KEYS TAB ==================== */}
      {tab === "api-keys" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[#6b7280] text-[12px]">API keys authenticate requests to the ForeGate API. Keep secrets safe.</p>
            <button onClick={() => { setKeyName(""); setKeyType("live"); setModalType("add-key"); }} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ Generate Key</button>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Key Prefix</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Last Used</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id} className={`border-b border-[#1f2937]/50 ${k.status === "revoked" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-white" style={{ fontWeight: 500 }}>{k.name}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${k.type === "live" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`} style={{ fontWeight: 600 }}>{k.type.toUpperCase()}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#9ca3af] font-mono text-[11px]">{k.prefix}...</span>
                        <button onClick={() => copyToClipboard(k.prefix + "xxxx_full_key_here")} className="text-[#6b7280] hover:text-white cursor-pointer">
                          <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1" /><path d="M8 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v4a1 1 0 001 1h1" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#6b7280]">{k.createdAt}</td>
                    <td className="px-3 py-3 text-[#6b7280]">{k.lastUsed}</td>
                    <td className="px-3 py-3"><StatusDot status={k.status} /></td>
                    <td className="px-3 py-3">
                      {k.status === "active" && (
                        <button onClick={() => { setSelectedKey(k); setModalType("revoke-key"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Revoke</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== USERS TAB ==================== */}
      {tab === "users" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[#6b7280] text-[12px]">Manage admin users for this merchant's OMS access.</p>
            <button onClick={() => { setInvName(""); setInvEmail(""); setInvRole("merchant_ops"); setModalType("invite-user"); }} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>+ Invite User</button>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                  <th className="px-4 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">2FA</th>
                  <th className="px-3 py-3">Last Login</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchantUsers.map(u => (
                  <tr key={u.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{u.name}</p>
                      <p className="text-[#6b7280] text-[10px]">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === "merchant_admin" ? "bg-blue-500/15 text-blue-400" : u.role === "merchant_finance" ? "bg-emerald-500/15 text-emerald-400" : u.role === "merchant_support" ? "bg-purple-500/15 text-purple-400" : "bg-gray-500/15 text-gray-400"}`} style={{ fontWeight: 600 }}>
                        {u.role.replace("merchant_", "").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3"><StatusDot status={u.status} /></td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] ${u.twoFa ? "text-emerald-400" : "text-amber-400"}`}>{u.twoFa ? "Enabled" : "Disabled"}</span>
                    </td>
                    <td className="px-3 py-3 text-[#6b7280]">{u.lastLogin}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setSelectedUser(u); setInvName(u.name); setInvEmail(u.email); setInvRole(u.role); setModalType("edit-user"); }} className="text-[10px] text-[#ff5222] px-2 py-1 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Edit</button>
                        {u.status === "active" && (
                          <button onClick={() => { setSelectedUser(u); setModalType("disable-user"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Disable</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== SETTINGS TAB ==================== */}
      {tab === "settings" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Betting Limits</h3>
            {[
              { label: "Min Bet", value: "₱50" },
              { label: "Max Single Bet", value: "₱100,000" },
              { label: "Max Daily Bet Volume", value: "₱1,000,000" },
              { label: "Max Withdrawal (Single)", value: "₱150,000" },
              { label: "Max Withdrawal (Daily)", value: "₱500,000" },
              { label: "Max Deposit (Single)", value: "₱500,000" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#6b7280] text-[12px]">{s.label}</span>
                <span className="text-white text-[12px]" style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
            <OmsBtn variant="primary" onClick={() => showOmsToast("Limits updated")}>Edit Limits</OmsBtn>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Payment Methods</h3>
            {[
              { method: "GCash", enabled: true },
              { method: "Maya / PayMaya", enabled: true },
              { method: "Bank Transfer (InstaPay)", enabled: true },
              { method: "Bank Transfer (PESONet)", enabled: true },
              { method: "GrabPay", enabled: false },
              { method: "Coins.ph", enabled: false },
            ].map(p => (
              <div key={p.method} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#9ca3af] text-[12px]">{p.method}</span>
                <span className={`text-[10px] ${p.enabled ? "text-emerald-400" : "text-[#4b5563]"}`} style={{ fontWeight: 600 }}>{p.enabled ? "ENABLED" : "DISABLED"}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Enabled Categories</h3>
            {["Basketball", "Color Game", "Boxing", "Esports", "Bingo", "Lottery", "Showbiz", "Weather", "Economy"].map(c => (
              <div key={c} className="flex items-center justify-between py-1">
                <span className="text-[#9ca3af] text-[12px]">{c}</span>
                <div className="w-8 h-4 rounded-full bg-[#ff5222] cursor-pointer"><div className="w-3.5 h-3.5 bg-white rounded-full ml-[17px]" /></div>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>Branding</h3>
            {[
              { label: "Brand Color", value: "#ff5222" },
              { label: "Logo URL", value: "https://cdn.luckytaya.ph/logo.png" },
              { label: "Favicon URL", value: "https://cdn.luckytaya.ph/favicon.ico" },
              { label: "Tagline", value: "Mag-predict at manalo!" },
            ].map(b => (
              <div key={b.label} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#6b7280] text-[12px]">{b.label}</span>
                <span className="text-white text-[11px] font-mono truncate max-w-[200px]">{b.value}</span>
              </div>
            ))}
            <OmsBtn variant="primary" onClick={() => showOmsToast("Branding updated")}>Edit Branding</OmsBtn>
          </div>
        </div>
      )}

      {/* ==================== COMPLIANCE TAB ==================== */}
      {tab === "compliance" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>PAGCOR License</h3>
            {[
              { label: "License Number", value: "PAGCOR-OGC-2025-0042" },
              { label: "Licensee", value: "ForeGate Gaming Corp." },
              { label: "License Type", value: "Online Gaming (OGC)" },
              { label: "Issued Date", value: "2025-06-01" },
              { label: "Expiry Date", value: "2027-06-01" },
              { label: "Status", value: "VALID", highlight: true },
            ].map(l => (
              <div key={l.label} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#6b7280] text-[12px]">{l.label}</span>
                <span className={`text-[12px] ${l.highlight ? "text-emerald-400" : "text-white"}`} style={{ fontWeight: l.highlight ? 700 : 500 }}>{l.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>AML Configuration</h3>
            {[
              { label: "AML Threshold", value: "₱50,000 (auto-flag)" },
              { label: "Structuring Detection", value: "Enabled" },
              { label: "Velocity Check", value: "45 bets / 10 min" },
              { label: "Multi-Account Detection", value: "IP + Device fingerprint" },
              { label: "STR Filing", value: "Auto-generate" },
              { label: "CTR Filing Threshold", value: "₱500,000" },
            ].map(a => (
              <div key={a.label} className="flex items-center justify-between py-1.5 border-b border-[#1f2937]/50 last:border-0">
                <span className="text-[#6b7280] text-[12px]">{a.label}</span>
                <span className="text-white text-[12px]" style={{ fontWeight: 500 }}>{a.value}</span>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-4">
            <h3 className="text-white text-[14px] mb-3" style={{ fontWeight: 600 }}>Data Residency & Privacy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Data Region", value: "Asia-Pacific (PH)" },
                { label: "Encryption", value: "AES-256-GCM" },
                { label: "Data Retention", value: "5 years (PAGCOR req.)" },
                { label: "GDPR/DPA Status", value: "DPA Compliant" },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[12px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Add/Edit Webhook */}
      <OmsModal open={modalType === "add-webhook" || modalType === "edit-webhook"} onClose={() => setModalType(null)} title={modalType === "add-webhook" ? "Add Webhook Endpoint" : "Edit Webhook"}>
        <div className="space-y-3">
          <OmsField label="Endpoint URL" required>
            <OmsInput value={whUrl} onChange={setWhUrl} placeholder="https://api.example.com/webhooks" />
          </OmsField>
          <OmsField label="Events" required>
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
              {ALL_EVENTS.map(e => (
                <label key={e} className="flex items-center gap-2 text-[11px] text-[#9ca3af] cursor-pointer hover:text-white py-1 px-2 rounded hover:bg-[#1f2937]">
                  <input type="checkbox" checked={whEvents.includes(e)} onChange={() => setWhEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])} className="accent-[#ff5222]" />
                  <span className="font-mono">{e}</span>
                </label>
              ))}
            </div>
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!whUrl || whEvents.length === 0) { showOmsToast("Fill URL and select events", "error"); return; }
              if (modalType === "add-webhook") {
                setWebhooks(prev => [...prev, { id: `WH${String(prev.length + 1).padStart(3, "0")}`, url: whUrl, events: whEvents, status: "active", lastTriggered: "Never", successRate: 100, signingSecret: `whsec_${Math.random().toString(36).slice(2, 14)}` }]);
                showOmsToast("Webhook endpoint added");
              } else {
                setWebhooks(prev => prev.map(w => w.id === selectedWebhook!.id ? { ...w, url: whUrl, events: whEvents } : w));
                showOmsToast("Webhook updated");
              }
              setModalType(null);
            }}>{modalType === "add-webhook" ? "Add Endpoint" : "Save"}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Delete Webhook */}
      <OmsModal open={modalType === "delete-webhook" && !!selectedWebhook} onClose={() => setModalType(null)} title="Delete Webhook">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message="Delete this webhook endpoint? Events will no longer be delivered." details={[{ label: "URL", value: selectedWebhook?.url || "" }]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setWebhooks(prev => prev.filter(w => w.id !== selectedWebhook!.id)); setModalType(null); showOmsToast("Webhook deleted"); }}>Delete</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Generate API Key */}
      <OmsModal open={modalType === "add-key"} onClose={() => setModalType(null)} title="Generate API Key">
        <div className="space-y-3">
          <OmsField label="Key Name" required>
            <OmsInput value={keyName} onChange={setKeyName} placeholder="e.g. Mobile App Key" />
          </OmsField>
          <OmsField label="Key Type" required>
            <OmsSelect value={keyType} onChange={setKeyType} options={[
              { value: "live", label: "Live (Production)" },
              { value: "test", label: "Test (Sandbox)" },
            ]} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!keyName) { showOmsToast("Key name required", "error"); return; }
              const prefix = `fg_${keyType}_${Math.random().toString(36).slice(2, 10)}`;
              setApiKeys(prev => [...prev, { id: `AK${String(prev.length + 1).padStart(3, "0")}`, name: keyName, type: keyType as any, prefix, createdAt: "2026-03-13", lastUsed: "Never", status: "active" }]);
              setModalType(null);
              showOmsToast(`API key generated: ${prefix}...`);
            }}>Generate Key</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Revoke API Key */}
      <OmsModal open={modalType === "revoke-key" && !!selectedKey} onClose={() => setModalType(null)} title="Revoke API Key">
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Revoke "${selectedKey?.name}"? Any integrations using this key will stop working immediately.`} details={[
          { label: "Key", value: selectedKey?.prefix + "..." || "" },
          { label: "Type", value: selectedKey?.type.toUpperCase() || "" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setApiKeys(prev => prev.map(k => k.id === selectedKey!.id ? { ...k, status: "revoked" as const } : k)); setModalType(null); showOmsToast(`${selectedKey!.name} revoked`); }}>Revoke Key</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Invite User */}
      <OmsModal open={modalType === "invite-user"} onClose={() => setModalType(null)} title="Invite Merchant User">
        <div className="space-y-3">
          <OmsField label="Full Name" required>
            <OmsInput value={invName} onChange={setInvName} placeholder="e.g. Juan Dela Cruz" />
          </OmsField>
          <OmsField label="Email" required>
            <OmsInput value={invEmail} onChange={setInvEmail} placeholder="e.g. juan@merchant.ph" type="email" />
          </OmsField>
          <OmsField label="Role" required>
            <OmsSelect value={invRole} onChange={setInvRole} options={[
              { value: "merchant_admin", label: "Merchant Admin (full access)" },
              { value: "merchant_ops", label: "Merchant Ops (operations)" },
              { value: "merchant_finance", label: "Merchant Finance (payments only)" },
              { value: "merchant_support", label: "Merchant Support (tickets only)" },
            ]} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!invName || !invEmail) { showOmsToast("Fill all fields", "error"); return; }
              setMerchantUsers(prev => [...prev, { id: `MU${String(prev.length + 1).padStart(3, "0")}`, name: invName, email: invEmail, role: invRole as any, status: "invited", lastLogin: "Never", twoFa: false }]);
              setModalType(null);
              showOmsToast(`Invitation sent to ${invEmail}`);
            }}>Send Invite</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Edit User */}
      <OmsModal open={modalType === "edit-user" && !!selectedUser} onClose={() => setModalType(null)} title="Edit Merchant User" subtitle={selectedUser?.email}>
        <div className="space-y-3">
          <OmsField label="Role" required>
            <OmsSelect value={invRole} onChange={setInvRole} options={[
              { value: "merchant_admin", label: "Merchant Admin" },
              { value: "merchant_ops", label: "Merchant Ops" },
              { value: "merchant_finance", label: "Merchant Finance" },
              { value: "merchant_support", label: "Merchant Support" },
            ]} />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              setMerchantUsers(prev => prev.map(u => u.id === selectedUser!.id ? { ...u, role: invRole as any } : u));
              setModalType(null);
              showOmsToast(`${selectedUser!.name}'s role updated`);
            }}>Save</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Disable User */}
      <OmsModal open={modalType === "disable-user" && !!selectedUser} onClose={() => setModalType(null)} title="Disable User">
        <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={`Disable ${selectedUser?.name}? They will lose OMS access for this merchant.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setMerchantUsers(prev => prev.map(u => u.id === selectedUser!.id ? { ...u, status: "disabled" as const } : u)); setModalType(null); showOmsToast(`${selectedUser!.name} disabled`); }}>Disable</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}