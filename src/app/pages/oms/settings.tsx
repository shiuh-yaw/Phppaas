import { useState, useEffect } from "react";
import { useOmsAuth, isPlatformUser } from "../../components/oms/oms-auth";
import { showOmsToast } from "../../components/oms/oms-modal";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { loadPaymentMethods, type PaymentMethodConfig } from "./payment-methods";
import { useRBAC } from "../../components/oms/oms-rbac";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

function ToggleSwitch({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#f0f1f3] last:border-0">
      <div>
        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500 }}>{label}</p>
        <p className="text-[#84888c] text-[11px] mt-0.5">{description}</p>
      </div>
      <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full cursor-pointer transition-colors flex-shrink-0 ${value ? "bg-[#ff5222]" : "bg-[#d1d5db]"}`}>
        <div className="w-4 h-4 bg-white rounded-full transition-transform" style={{ marginLeft: value ? 22 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
      </button>
    </div>
  );
}

function SettingInput({ label, value, onChange, type = "text", placeholder, suffix }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string }) {
  return (
    <div className="py-3 border-b border-[#f0f1f3] last:border-0">
      <label className="text-[#84888c] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 h-8 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors"
          placeholder={placeholder}
        />
        {suffix && <span className="text-[#84888c] text-[11px] flex-shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 border-b border-[#f0f1f3]">
        <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f0f1f3] last:border-0">
      <span className="text-[#84888c] text-[12px]">{label}</span>
      <span className={`text-[12px] ${accent ? "text-emerald-600" : "text-[#070808]"}`} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function OmsSettings() {
  const [tab, setTab] = useState<"general" | "payments" | "limits" | "security" | "admin" | "platform">("general");
  const { admin, activeMerchant } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const role = admin?.role || "";

  const doAudit = (detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: role, action: "config_save", target: `settings/${tab}`, detail });
  };

  // General
  const [platformName, setPlatformName] = useState("Lucky Taya");
  const [platformUrl, setPlatformUrl] = useState("https://luckytaya.ph");
  const [supportEmail, setSupportEmail] = useState("support@luckytaya.ph");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [kycRequired, setKycRequired] = useState(true);

  // Payments — load platform-level payment method config
  const [platformMethods, setPlatformMethods] = useState<PaymentMethodConfig[]>([]);
  useEffect(() => { setPlatformMethods(loadPaymentMethods()); }, []);
  const merchantId = activeMerchant?.id || "";
  const isMethodAvailable = (pm: PaymentMethodConfig) => {
    if (!pm.enabledGlobally) return false;
    if (pm.merchantOverrides[merchantId] === false) return false;
    return true;
  };
  // Legacy toggle state for merchant-level on/off (within platform-allowed methods)
  const [merchantPaymentToggles, setMerchantPaymentToggles] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    platformMethods.forEach(pm => { initial[pm.id] = isMethodAvailable(pm); });
    setMerchantPaymentToggles(initial);
  }, [platformMethods, merchantId]);
  const toggleMerchantPayment = (pmId: string) => {
    setMerchantPaymentToggles(prev => ({ ...prev, [pmId]: !prev[pmId] }));
  };
  const [minDeposit, setMinDeposit] = useState("100");
  const [maxDeposit, setMaxDeposit] = useState("500000");
  const [minWithdraw, setMinWithdraw] = useState("200");
  const [maxWithdraw, setMaxWithdraw] = useState("100000");
  const [withdrawFee, setWithdrawFee] = useState("25");
  const [autoApproveLimit, setAutoApproveLimit] = useState("50000");

  // Limits
  const [maxBetAmount, setMaxBetAmount] = useState("100000");
  const [minBetAmount, setMinBetAmount] = useState("50");
  const [dailyBetLimit, setDailyBetLimit] = useState("500000");
  const [fastBetMax, setFastBetMax] = useState("10000");
  const [maxOpenBets, setMaxOpenBets] = useState("50");
  const [cooloffPeriod, setCooloffPeriod] = useState("24");

  // Security
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [amlThreshold, setAmlThreshold] = useState("50000");
  const [suspiciousBetFlag, setSuspiciousBetFlag] = useState("25000");

  const ADMIN_USERS = [
    { id: "A001", name: "Carlos Reyes", email: "admin@foregate.ph", role: "Super Admin", lastLogin: "2026-03-13 08:45 PHT", status: "active" },
    { id: "A002", name: "Ana Dela Cruz", email: "mod@foregate.ph", role: "Moderator", lastLogin: "2026-03-13 07:20 PHT", status: "active" },
    { id: "A003", name: "Miguel Torres", email: "finance@foregate.ph", role: "Finance", lastLogin: "2026-03-12 18:00 PHT", status: "active" },
    { id: "A004", name: "Jenny Lim", email: "support@foregate.ph", role: "Support", lastLogin: "2026-03-13 06:30 PHT", status: "active" },
    { id: "A005", name: "Rico Santos", email: "admin2@foregate.ph", role: "Admin", lastLogin: "2026-03-11 15:00 PHT", status: "inactive" },
  ];

  const tabs = isPlat && !activeMerchant
    ? (["platform", "general", "payments", "limits", "security", "admin"] as const)
    : (["general", "payments", "limits", "security", "admin"] as const);

  return (
    <div className="space-y-4" style={pp}>
      {/* Context indicator */}
      {activeMerchant && (
        <div className="flex items-center gap-2 text-[11px] text-[#84888c]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222]" />
          <span>Settings for <span className="text-[#070808]" style={{ fontWeight: 600 }}>{activeMerchant.name}</span> — changes apply only to this merchant</span>
        </div>
      )}
      {!activeMerchant && isPlat && (
        <div className="flex items-center gap-2 text-[11px] text-[#84888c]">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>Platform-wide defaults — changes affect all merchants unless overridden</span>
        </div>
      )}

      {/* Tabs — underline style */}
      <div className="flex items-center gap-5 border-b border-[#f0f1f3] overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className="relative text-[12px] pb-2.5 cursor-pointer transition-colors whitespace-nowrap"
            style={{ fontWeight: tab === t ? 600 : 400, color: tab === t ? "#070808" : "#84888c", ...ss04 }}
          >
            {t === "platform" ? "Platform Config" : t === "general" ? "General" : t === "payments" ? "Payments" : t === "limits" ? "Betting Limits" : t === "security" ? "Security" : "Admin Users"}
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Platform-level config */}
      {tab === "platform" && isPlat && !activeMerchant && (
        <div className="max-w-[700px] space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="size-4 text-purple-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="8" /><path d="M2 10h16" /><path d="M10 2c2.5 2.5 4 5.2 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5.2-4-8s1.5-5.5 4-8z" /></svg>
              <h3 className="text-purple-700 text-[14px]" style={{ fontWeight: 600 }}>Platform-Level Configuration</h3>
            </div>
            <p className="text-[#84888c] text-[11px] mb-1">These settings apply across the entire ForeGate SaaS platform and affect all merchants.</p>
          </div>

          <SectionCard title="Default Merchant Limits">
            <p className="text-[#84888c] text-[10px] mb-2">Defaults applied to newly onboarded merchants. Can be overridden per-merchant.</p>
            <InfoRow label="Default Max Bet" value="₱100,000" />
            <InfoRow label="Default Min Bet" value="₱50" />
            <InfoRow label="Default Daily Bet Limit" value="₱500,000" />
            <InfoRow label="Default Max Withdrawal" value="₱150,000" />
            <InfoRow label="Default KYC Required" value="Yes" />
            <InfoRow label="Default AML Threshold" value="₱50,000" />
            <button onClick={() => { showOmsToast("Default limits updated"); doAudit("Updated platform default limits"); }} className="mt-3 h-8 px-4 bg-purple-500 hover:bg-purple-600 text-white text-[11px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>Update Defaults</button>
          </SectionCard>

          <SectionCard title="Rate Limiting (Global)">
            <InfoRow label="API Rate Limit (Starter)" value="100 req/min" />
            <InfoRow label="API Rate Limit (Growth)" value="500 req/min" />
            <InfoRow label="API Rate Limit (Enterprise)" value="2,000 req/min" />
            <InfoRow label="Webhook Retry Attempts" value="5" />
            <InfoRow label="Webhook Retry Backoff" value="Exponential (1s, 2s, 4s, 8s, 16s)" />
            <InfoRow label="Max Concurrent Connections" value="10,000 per merchant" />
          </SectionCard>

          <SectionCard title="KYC Provider Config">
            <InfoRow label="Primary Provider" value="ForeGate KYC API" />
            <InfoRow label="Fallback Provider" value="Jumio" />
            <InfoRow label="Auto-Approve Threshold" value="Score > 85" />
            <InfoRow label="Document Types" value="National ID, Passport, Driver's License" />
            <InfoRow label="Liveness Check" value="Enabled" accent />
          </SectionCard>

          <SectionCard title="Payment Gateway Config (Global)">
            <InfoRow label="GCash API" value="Connected — v2.1" accent />
            <InfoRow label="Maya API" value="Connected — v3.0" accent />
            <InfoRow label="InstaPay Gateway" value="Connected" accent />
            <InfoRow label="PESONet Gateway" value="Connected" accent />
            <InfoRow label="Settlement Frequency" value="T+1 (next business day)" />
            <InfoRow label="Auto-Reconciliation" value="Enabled" accent />
          </SectionCard>

          <SectionCard title="Stablecoin Gateway Config (Global)">
            <InfoRow label="USDT (TRC-20)" value="Connected — v1.2" accent />
            <InfoRow label="USDT (ERC-20)" value="Connected — v1.2" accent />
            <InfoRow label="USDC (Solana)" value="Connected — v1.1" accent />
            <InfoRow label="USDC (Polygon)" value="Testing" />
            <InfoRow label="DAI (ERC-20)" value="Testing" />
            <InfoRow label="PYUSD" value="Planned — H2 2026" />
            <InfoRow label="Crypto Settlement" value="Auto-convert to PHP via PDAX" />
            <InfoRow label="Stablecoin Custody" value="ForeGate Crypto Gateway (MPC)" />
          </SectionCard>
        </div>
      )}

      {tab === "general" && (
        <div className="max-w-[700px] space-y-4">
          <SectionCard title="Platform Settings">
            <SettingInput label="Platform Name" value={platformName} onChange={setPlatformName} />
            <SettingInput label="Platform URL" value={platformUrl} onChange={setPlatformUrl} />
            <SettingInput label="Support Email" value={supportEmail} onChange={setSupportEmail} />
          </SectionCard>
          <SectionCard title="Platform Controls">
            <ToggleSwitch value={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance Mode" description="Disable all user-facing features for maintenance" />
            <ToggleSwitch value={registrationOpen} onChange={setRegistrationOpen} label="Registration Open" description="Allow new user registrations" />
            <ToggleSwitch value={kycRequired} onChange={setKycRequired} label="KYC Required for Betting" description="Require KYC verification before placing bets" />
          </SectionCard>
          <SectionCard title="PAGCOR License">
            <InfoRow label="License Number" value="OGC-2025-0847" />
            <InfoRow label="License Type" value="Online Gaming Operator" />
            <InfoRow label="Issued Date" value="January 15, 2025" />
            <InfoRow label="Expiry Date" value="December 31, 2027" />
            <InfoRow label="Status" value="Active & Valid" accent />
          </SectionCard>
        </div>
      )}

      {tab === "payments" && (
        <div className="max-w-[700px] space-y-4">
          {/* Platform availability banner */}
          <div className="flex items-center gap-2.5 p-3 bg-purple-50/60 border border-purple-200/50 rounded-xl">
            <svg className="size-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="8" /><path d="M10 7v3m0 3v.01" strokeLinecap="round" /></svg>
            <p className="text-[#84888c] text-[11px]" style={ss04}>
              Payment methods are managed at the <span className="text-purple-600" style={{ fontWeight: 600 }}>Platform level</span> by ForeGate PaaS Admins. Methods marked <span className="text-red-500" style={{ fontWeight: 600 }}>DISABLED BY PLATFORM</span> cannot be activated here.
            </p>
          </div>

          <SectionCard title="Payment Methods">
            {platformMethods.length === 0 && (
              <p className="text-[#84888c] text-[11px] py-2" style={ss04}>Loading payment methods...</p>
            )}
            {platformMethods.map(pm => {
              const available = isMethodAvailable(pm);
              const enabled = merchantPaymentToggles[pm.id] ?? false;
              const statusMap: Record<string, { cls: string; label: string }> = {
                live: { cls: "bg-emerald-50 text-emerald-600", label: "LIVE" },
                testing: { cls: "bg-amber-50 text-amber-600", label: "TESTING" },
                maintenance: { cls: "bg-orange-50 text-orange-500", label: "MAINTENANCE" },
                disabled: { cls: "bg-gray-100 text-gray-500", label: "DISABLED" },
              };
              const st = statusMap[pm.status] || statusMap.disabled;
              const catMap: Record<string, { cls: string; label: string }> = {
                e_wallet: { cls: "bg-blue-50 text-blue-600", label: "E-Wallet" },
                bank_transfer: { cls: "bg-cyan-50 text-cyan-600", label: "Bank" },
                otc: { cls: "bg-purple-50 text-purple-600", label: "OTC" },
                crypto: { cls: "bg-yellow-50 text-yellow-700", label: "Crypto" },
                stablecoin: { cls: "bg-teal-50 text-teal-600", label: "Stablecoin" },
                card: { cls: "bg-pink-50 text-pink-600", label: "Card" },
              };
              const cat = catMap[pm.category] || catMap.crypto;
              return (
                <div key={pm.id} className={`flex items-start justify-between py-3 border-b border-[#f0f1f3] last:border-0 ${!available ? "opacity-50" : ""}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500 }}>{pm.name}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${cat.cls}`} style={{ fontWeight: 600, ...ss04 }}>{cat.label}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${st.cls}`} style={{ fontWeight: 600, ...ss04 }}>{st.label}</span>
                      {!available && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500" style={{ fontWeight: 600, ...ss04 }}>DISABLED BY PLATFORM</span>
                      )}
                    </div>
                    <p className="text-[#84888c] text-[11px] mt-0.5">
                      {pm.provider} · {pm.depositEnabled ? "Deposit" : ""}{pm.depositEnabled && pm.withdrawEnabled ? " & " : ""}{pm.withdrawEnabled ? "Withdraw" : ""}{!pm.depositEnabled && !pm.withdrawEnabled ? "No operations" : ""}
                      {available && pm.depositEnabled && <span className="text-[#b0b3b8]"> · Min ₱{pm.minDeposit.toLocaleString()}, Max ₱{pm.maxDeposit.toLocaleString()}</span>}
                      {pm.chain && <span className="text-[#b0b3b8]"> · {pm.chain}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => available && toggleMerchantPayment(pm.id)}
                    disabled={!available}
                    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${!available ? "cursor-not-allowed" : "cursor-pointer"} ${enabled && available ? "bg-[#ff5222]" : "bg-[#d1d5db]"}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" style={{ marginLeft: enabled && available ? 22 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
                  </button>
                </div>
              );
            })}
          </SectionCard>
          <SectionCard title="Deposit Limits">
            <SettingInput label="Minimum Deposit" value={minDeposit} onChange={setMinDeposit} type="number" suffix="PHP" />
            <SettingInput label="Maximum Deposit" value={maxDeposit} onChange={setMaxDeposit} type="number" suffix="PHP" />
          </SectionCard>
          <SectionCard title="Withdrawal Settings">
            <SettingInput label="Minimum Withdrawal" value={minWithdraw} onChange={setMinWithdraw} type="number" suffix="PHP" />
            <SettingInput label="Maximum Withdrawal" value={maxWithdraw} onChange={setMaxWithdraw} type="number" suffix="PHP" />
            <SettingInput label="Withdrawal Fee" value={withdrawFee} onChange={setWithdrawFee} type="number" suffix="PHP" />
            <SettingInput label="Auto-Approve Limit" value={autoApproveLimit} onChange={setAutoApproveLimit} type="number" suffix="PHP" />
          </SectionCard>
        </div>
      )}

      {tab === "limits" && (
        <div className="max-w-[700px] space-y-4">
          <SectionCard title="Betting Limits">
            <SettingInput label="Minimum Bet Amount" value={minBetAmount} onChange={setMinBetAmount} type="number" suffix="PHP" />
            <SettingInput label="Maximum Bet Amount" value={maxBetAmount} onChange={setMaxBetAmount} type="number" suffix="PHP" />
            <SettingInput label="Daily Bet Limit (Per User)" value={dailyBetLimit} onChange={setDailyBetLimit} type="number" suffix="PHP" />
            <SettingInput label="Fast Bet Maximum" value={fastBetMax} onChange={setFastBetMax} type="number" suffix="PHP" />
            <SettingInput label="Max Open Bets (Per User)" value={maxOpenBets} onChange={setMaxOpenBets} type="number" />
          </SectionCard>
          <SectionCard title="Responsible Gaming">
            <SettingInput label="Cool-off Period" value={cooloffPeriod} onChange={setCooloffPeriod} type="number" suffix="hours" />
            <div className="py-3">
              <p className="text-[#84888c] text-[11px] leading-[1.6]">
                Self-exclusion, deposit limits, and session time reminders are enforced platform-wide per PAGCOR responsible gaming requirements. Users can request self-exclusion for 6 months, 1 year, or permanent.
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-[700px] space-y-4">
          <SectionCard title="Authentication">
            <ToggleSwitch value={twoFactorRequired} onChange={setTwoFactorRequired} label="2FA Required (Admin)" description="Require two-factor authentication for all OMS admin accounts" />
            <SettingInput label="Session Timeout" value={sessionTimeout} onChange={setSessionTimeout} type="number" suffix="minutes" />
            <SettingInput label="Max Login Attempts" value={maxLoginAttempts} onChange={setMaxLoginAttempts} type="number" suffix="attempts" />
            <ToggleSwitch value={ipWhitelist} onChange={setIpWhitelist} label="IP Whitelist" description="Restrict OMS access to whitelisted IP addresses only" />
          </SectionCard>
          <SectionCard title="Anti-Money Laundering (AML)">
            <SettingInput label="AML Flag Threshold" value={amlThreshold} onChange={setAmlThreshold} type="number" suffix="PHP" />
            <SettingInput label="Suspicious Bet Flag" value={suspiciousBetFlag} onChange={setSuspiciousBetFlag} type="number" suffix="PHP" />
            <div className="py-3">
              <p className="text-[#84888c] text-[11px] leading-[1.6]">
                Transactions above the AML threshold are automatically flagged for manual review. Bets above the suspicious bet flag amount trigger additional verification. All flagged items appear in the Finance and Bets management pages.
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "admin" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="p-4 border-b border-[#f0f1f3] flex items-center justify-between">
              <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>Admin Users ({ADMIN_USERS.length})</h3>
              <button className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f]" style={{ fontWeight: 600 }}>+ Add Admin</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    {["ID", "Name", "Email", "Role", "Last Login", "Status", "Actions"].map(h => (
                      <th key={h} className="text-[#84888c] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_USERS.map(a => (
                    <tr key={a.id} className="border-b border-[#f5f6f7] hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-2.5 text-[#84888c] text-[11px]">{a.id}</td>
                      <td className="px-4 py-2.5 text-[#070808] text-[12px]" style={{ fontWeight: 500 }}>{a.name}</td>
                      <td className="px-4 py-2.5 text-[#84888c] text-[11px]">{a.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.role === "Super Admin" ? "bg-red-50 text-red-500" : a.role === "Admin" ? "bg-orange-50 text-orange-500" : a.role === "Moderator" ? "bg-blue-50 text-blue-500" : a.role === "Finance" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-500"}`} style={{ fontWeight: 600 }}>
                          {a.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#84888c] text-[11px]">{a.lastLogin}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 600 }}>
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button className="h-6 px-2 bg-[#f5f6f8] text-[#84888c] text-[10px] rounded cursor-pointer hover:bg-[#e5e7eb]" style={{ fontWeight: 600 }}>Edit</button>
                          {a.role !== "Super Admin" && (
                            <button className="h-6 px-2 bg-red-50 text-red-500 text-[10px] rounded cursor-pointer hover:bg-red-100" style={{ fontWeight: 600 }}>Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <SectionCard title="Audit Log (Recent)">
            <div className="space-y-2">
              {[
                { admin: "Carlos Reyes", action: "Approved KYC for user U009 (Cherry Aquino)", time: "2026-03-13 08:30 PHT" },
                { admin: "Ana Dela Cruz", action: "Voided bet BET008 (Suspicious activity — Bong Ramos)", time: "2026-03-13 08:15 PHT" },
                { admin: "Carlos Reyes", action: "Changed withdrawal auto-approve limit to ₱50,000", time: "2026-03-13 07:45 PHT" },
                { admin: "Miguel Torres", action: "Approved withdrawal TXN012 for Maria Santos (₱8,000)", time: "2026-03-13 07:30 PHT" },
                { admin: "Ana Dela Cruz", action: "Resolved market MKT007 (Weather: Will it rain?)", time: "2026-03-13 07:00 PHT" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-[#f0f1f3] last:border-0">
                  <div className="w-6 h-6 rounded-full bg-[#f5f6f8] flex items-center justify-center text-[#ff5222] text-[9px] flex-shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                    {log.admin.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#070808] text-[11px]"><span style={{ fontWeight: 600 }}>{log.admin}</span> — {log.action}</p>
                    <p className="text-[#b0b3b8] text-[10px] mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Save button */}
      {(tab === "general" || tab === "payments" || tab === "limits" || tab === "security") && (
        <div className="flex gap-3 max-w-[700px]">
          <button
            onClick={() => { showOmsToast("Settings saved successfully"); doAudit(`Saved ${tab} settings`); }}
            className="h-9 px-6 bg-[#ff5222] text-white text-[12px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Save Changes
          </button>
          <button className="h-9 px-6 bg-[#f5f6f8] text-[#84888c] text-[12px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors" style={{ fontWeight: 600 }}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}