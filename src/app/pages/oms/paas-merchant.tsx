import { useState } from "react";
import { useOmsAuth, isPlatformUser } from "../../components/oms/oms-auth";
import { useTenantConfig, loadConfig, ALL_TENANT_ROLES, ROLE_LABELS, type TenantRole, type TenantConfig } from "../../components/oms/oms-tenant-config";
import { useI18n } from "../../components/oms/oms-i18n";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== SUB COMPONENTS ==================== */
function StatusDot({ active }: { active: boolean }) {
  return (
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-emerald-400" : "bg-[#374151]"}`} />
  );
}

function SectionCard({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-4 border-b border-[#f0f1f3] flex items-center gap-2.5">
        <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5f6f8] text-[#84888c]" style={{ fontWeight: 600, ...ss04 }}>{badge}</span>
        )}
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

/* ==================== MAIN ==================== */
export default function PaasMerchant() {
  const { admin, activeMerchant } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState<TenantRole>("merchant_admin");
  const [tab, setTab] = useState<"overview" | "fields" | "permissions" | "policies" | "channels">("overview");

  const config: TenantConfig = loadConfig(activeMerchant?.id || "GLOBAL");

  const currentRole = (admin?.role || "merchant_ops") as TenantRole;
  const isValidTenantRole = ALL_TENANT_ROLES.includes(currentRole as any);

  // Count permissions/fields for current user's role
  const myFields = config.fieldVisibility.filter(f => f.roles[isValidTenantRole ? currentRole : "merchant_ops"]);
  const myPerms = config.permissions.filter(p => p.roles[isValidTenantRole ? currentRole : "merchant_ops"]);
  const overridablePolicies = config.accountPolicies.filter(p => p.merchantOverride);
  const enabledChannels = config.channels.filter(c => c.enabled);

  return (
    <div className="space-y-4" style={pp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222]" />
            <span className="text-[9px] tracking-[0.1em] text-[#ff5222]" style={{ fontWeight: 700, ...ss04 }}>MERCHANT VIEW</span>
          </div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>{t("paas.merchant_title")}</h2>
          <p className="text-[#b0b3b8] text-[12px] mt-0.5" style={ss04}>{t("paas.merchant_subtitle")}</p>
        </div>
        {activeMerchant && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
            <span className="text-[16px]">{activeMerchant.logo}</span>
            <div>
              <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{activeMerchant.name}</p>
              <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{activeMerchant.id}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("paas.field_access"), value: `${myFields.length}/${config.fieldVisibility.length}`, color: "text-blue-500" },
          { label: t("paas.your_permissions"), value: `${myPerms.length}/${config.permissions.length}`, color: "text-emerald-600" },
          { label: t("paas.account_policies"), value: `${overridablePolicies.length} overridable`, color: "text-amber-600" },
          { label: t("paas.channel_settings"), value: `${enabledChannels.length} active`, color: "text-purple-500" },
          { label: t("paas.api_limits"), value: `${config.apiRateLimit}/min`, color: "text-[#ff5222]" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className={`text-[18px] ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e5e7eb] rounded-xl p-1 w-fit overflow-x-auto">
        {([
          { key: "overview", label: "Overview" },
          { key: "fields", label: t("paas.field_access") },
          { key: "permissions", label: t("paas.your_permissions") },
          { key: "policies", label: t("paas.account_policies") },
          { key: "channels", label: t("paas.channel_settings") },
        ] as const).map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`text-[12px] px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${tab === tb.key ? "bg-[#ff5222] text-white" : "text-[#84888c] hover:bg-[#f5f6f8] hover:text-[#070808]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Role selector */}
      {(tab === "fields" || tab === "permissions") && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>View as role:</span>
          {ALL_TENANT_ROLES.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`h-7 px-3 rounded-lg text-[11px] cursor-pointer transition-colors ${selectedRole === r ? "bg-[#ff5222] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
              style={{ fontWeight: 600, ...ss04 }}
            >
              {ROLE_LABELS[r].label}
            </button>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Your Role Access Summary" subtitle={`Current role: ${ROLE_LABELS[isValidTenantRole ? currentRole : "merchant_ops"].label}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Visible Fields</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>User table columns you can see</p>
                </div>
                <span className="text-blue-500 text-[18px]" style={{ fontWeight: 700, ...ss04 }}>{myFields.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Active Permissions</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Actions you're allowed to perform</p>
                </div>
                <span className="text-emerald-600 text-[18px]" style={{ fontWeight: 700, ...ss04 }}>{myPerms.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Export Access</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>CSV/Excel data export capability</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${config.userExportEnabled ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontWeight: 600, ...ss04 }}>
                  {config.userExportEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tenant Limits" subtitle="Resource quotas for this merchant tenant">
            <div className="space-y-2">
              {[
                { label: "Max Users", value: config.maxUsersPerTenant.toLocaleString() },
                { label: "Max Creators", value: config.maxCreatorsPerTenant.toLocaleString() },
                { label: "API Rate Limit", value: `${config.apiRateLimit} req/min` },
                { label: "Audit Log Retention", value: `${config.auditLogRetentionDays} days` },
                { label: "PII Masking", value: config.piiMaskingEnabled ? "Enabled" : "Disabled" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#f0f1f3] last:border-0">
                  <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{item.label}</span>
                  <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Fields Tab */}
      {tab === "fields" && (
        <SectionCard title="Field Visibility Matrix" badge={`${config.fieldVisibility.filter(f => f.roles[selectedRole]).length} visible for ${ROLE_LABELS[selectedRole].label}`}>
          <div className="space-y-1">
            {config.fieldVisibility.map(field => {
              const visible = field.roles[selectedRole];
              return (
                <div key={field.key} className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${visible ? "bg-emerald-50/50" : "bg-[#f9fafb]"}`}>
                  <div className="flex items-center gap-3">
                    <StatusDot active={visible} />
                    <div>
                      <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{field.label}</p>
                      <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{field.description} · <span className={`${visible ? "text-emerald-600" : "text-[#b0b3b8]"}`}>{field.category}</span></p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${visible ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f1f3] text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>
                    {visible ? "VISIBLE" : "HIDDEN"}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Permissions Tab */}
      {tab === "permissions" && (
        <SectionCard title="Permission Rules" badge={`${config.permissions.filter(p => p.roles[selectedRole]).length} granted for ${ROLE_LABELS[selectedRole].label}`}>
          <div className="space-y-1">
            {config.permissions.map(perm => {
              const granted = perm.roles[selectedRole];
              return (
                <div key={perm.key} className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${granted ? "bg-emerald-50/50" : "bg-[#f9fafb]"}`}>
                  <div className="flex items-center gap-3">
                    <StatusDot active={granted} />
                    <div>
                      <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{perm.label}</p>
                      <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{perm.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      perm.severity === "critical" ? "bg-red-50 text-red-500" :
                      perm.severity === "elevated" ? "bg-amber-50 text-amber-600" :
                      "bg-[#f5f6f8] text-[#84888c]"
                    }`} style={{ fontWeight: 600, ...ss04 }}>
                      {perm.severity === "critical" ? "FG ONLY" : perm.severity === "elevated" ? "ELEVATED" : "STANDARD"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${granted ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f1f3] text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>
                      {granted ? "GRANTED" : "DENIED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Policies Tab */}
      {tab === "policies" && (
        <SectionCard title="Account Policies" subtitle="Controls which account-level actions can be performed and by whom">
          <div className="space-y-2">
            {config.accountPolicies.map(policy => (
              <div key={policy.key} className="flex items-center justify-between p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                <div>
                  <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{policy.label}</p>
                  <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{policy.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {policy.fgOnly && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500" style={{ fontWeight: 600, ...ss04 }}>FG ONLY</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${policy.merchantOverride ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f1f3] text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>
                    {policy.merchantOverride ? "OVERRIDABLE" : "LOCKED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              Account policies marked "FG ONLY" can only be modified by PrediEx Platform Admins. Contact your account manager for changes.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Channels Tab */}
      {tab === "channels" && (
        <SectionCard title="Channel Configuration" subtitle="User acquisition channels available for this tenant">
          <div className="space-y-3">
            {config.channels.map(ch => (
              <div key={ch.key} className={`p-4 border rounded-xl ${ch.enabled ? "bg-white border-[#e5e7eb]" : "bg-[#f9fafb] border-[#f0f1f3] opacity-60"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusDot active={ch.enabled} />
                    <p className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{ch.label}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${ch.enabled ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f1f3] text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>
                      {ch.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] text-[#84888c]" style={ss04}>
                  <span>Requires Approval: <span className={ch.requiresApproval ? "text-amber-600" : "text-[#b0b3b8]"}>{ch.requiresApproval ? "Yes" : "No"}</span></span>
                  <span>Auto-Assign Agent: <span className={ch.autoAssignAgent ? "text-blue-500" : "text-[#b0b3b8]"}>{ch.autoAssignAgent ? "Yes" : "No"}</span></span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Platform admin notice */}
      {!isPlat && (
        <div className="p-4 bg-[#f5f6f8] border border-[#e5e7eb] rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="size-4 text-blue-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M10 7v3m0 3h.01" strokeLinecap="round" /></svg>
            </div>
            <div>
              <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Read-Only View</p>
              <p className="text-[#84888c] text-[11px] mt-0.5" style={ss04}>
                This page shows the configuration set by the PrediEx Platform Admin. To request changes to your tenant's permissions, field visibility, or account policies, please contact your account manager or submit a support ticket.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}