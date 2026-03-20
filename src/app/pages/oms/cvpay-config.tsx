/**
 * CVPay Merchant Configuration — OMS
 * Merchant-facing page to configure CVPay gateway credentials,
 * payment methods, limits, fees, webhooks, and stablecoin settings.
 */

import { useState } from "react";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { OmsModal, OmsBtn, OmsButtonRow, OmsField, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import {
  Eye, EyeOff, TestTube, Save, RefreshCw, Shield, Wallet,
  CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink,
  Zap, Globe, Lock, Server, ArrowUpDown, Settings2, Coins
} from "lucide-react";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
type Environment = "SANDBOX" | "PRODUCTION";
type FeeType = "PERCENTAGE" | "FIXED";

interface CVPayMerchantConfig {
  merchantId: string;
  merchantName: string;
  apiKey: string;
  apiSecret: string;
  environment: Environment;
  apiBaseUrl: string;
  enabled: boolean;
  // Fiat settings
  fiatEnabled: boolean;
  fiatMethods: { id: string; name: string; icon: string; channel: string; enabled: boolean; minAmount: number; maxAmount: number; feePercent: number }[];
  // Stablecoin settings
  stablecoinEnabled: boolean;
  stablecoinMethods: { id: string; name: string; network: string; icon: string; enabled: boolean; walletAddress: string; minAmount: number; maxAmount: number; feePercent: number; confirmations: number }[];
  // Limits
  dailyDepositLimit: number;
  dailyWithdrawalLimit: number;
  monthlyDepositLimit: number;
  monthlyWithdrawalLimit: number;
  // Fees
  depositFeeType: FeeType;
  depositFeeValue: number;
  withdrawalFeeType: FeeType;
  withdrawalFeeValue: number;
  // URLs
  webhookUrl: string;
  returnUrl: string;
  cancelUrl: string;
  ipWhitelist: string[];
  // Automation
  autoApproveDeposits: boolean;
  autoApproveWithdrawals: boolean;
  autoApprovalThreshold: number;
  // Status
  connectionStatus: "connected" | "error" | "untested";
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ==================== INITIAL STATE ==================== */
const DEFAULT_CONFIG: CVPayMerchantConfig = {
  merchantId: "",
  merchantName: "",
  apiKey: "",
  apiSecret: "",
  environment: "SANDBOX",
  apiBaseUrl: "https://api-sandbox.cvpay.org",
  enabled: false,
  fiatEnabled: true,
  fiatMethods: [
    { id: "GCASH", name: "GCash", icon: "G", channel: "E-Wallet", enabled: true, minAmount: 50, maxAmount: 100000, feePercent: 0 },
    { id: "PAYMAYA", name: "Maya (PayMaya)", icon: "M", channel: "E-Wallet", enabled: true, minAmount: 50, maxAmount: 100000, feePercent: 0 },
    { id: "GRABPAY", name: "GrabPay", icon: "GP", channel: "E-Wallet", enabled: false, minAmount: 50, maxAmount: 50000, feePercent: 0 },
    { id: "SHOPEEPAY", name: "ShopeePay", icon: "SP", channel: "E-Wallet", enabled: false, minAmount: 50, maxAmount: 50000, feePercent: 0 },
    { id: "BDO", name: "BDO Online Banking", icon: "B", channel: "Bank", enabled: true, minAmount: 100, maxAmount: 500000, feePercent: 0 },
    { id: "BPI", name: "BPI Online Banking", icon: "BP", channel: "Bank", enabled: true, minAmount: 100, maxAmount: 500000, feePercent: 0 },
    { id: "UNIONBANK", name: "UnionBank Online", icon: "UB", channel: "Bank", enabled: false, minAmount: 100, maxAmount: 500000, feePercent: 0 },
    { id: "INSTAPAY", name: "InstaPay", icon: "IP", channel: "Online Banking", enabled: true, minAmount: 50, maxAmount: 50000, feePercent: 0 },
    { id: "PESONET", name: "PESONet", icon: "PN", channel: "Online Banking", enabled: false, minAmount: 100, maxAmount: 2000000, feePercent: 0 },
    { id: "7ELEVEN", name: "7-Eleven", icon: "7E", channel: "OTC", enabled: true, minAmount: 100, maxAmount: 10000, feePercent: 0 },
    { id: "CEBUANA", name: "Cebuana Lhuillier", icon: "CL", channel: "OTC", enabled: false, minAmount: 100, maxAmount: 50000, feePercent: 0 },
    { id: "MLHUILLIER", name: "M Lhuillier", icon: "ML", channel: "OTC", enabled: false, minAmount: 100, maxAmount: 50000, feePercent: 0 },
  ],
  stablecoinEnabled: true,
  stablecoinMethods: [
    { id: "USDT_TRC20", name: "USDT TRC-20", network: "Tron", icon: "₮", enabled: true, walletAddress: "", minAmount: 5, maxAmount: 100000, feePercent: 0.5, confirmations: 20 },
    { id: "USDT_ERC20", name: "USDT ERC-20", network: "Ethereum", icon: "₮", enabled: false, walletAddress: "", minAmount: 20, maxAmount: 100000, feePercent: 1.0, confirmations: 12 },
    { id: "USDC_POLYGON", name: "USDC Polygon", network: "Polygon", icon: "◎", enabled: true, walletAddress: "", minAmount: 5, maxAmount: 100000, feePercent: 0.3, confirmations: 30 },
    { id: "USDC_SOLANA", name: "USDC Solana", network: "Solana", icon: "◎", enabled: true, walletAddress: "", minAmount: 5, maxAmount: 100000, feePercent: 0.2, confirmations: 32 },
    { id: "DAI_ERC20", name: "DAI", network: "Ethereum", icon: "◈", enabled: false, walletAddress: "", minAmount: 20, maxAmount: 50000, feePercent: 1.0, confirmations: 12 },
  ],
  dailyDepositLimit: 500000,
  dailyWithdrawalLimit: 500000,
  monthlyDepositLimit: 10000000,
  monthlyWithdrawalLimit: 5000000,
  depositFeeType: "PERCENTAGE",
  depositFeeValue: 0,
  withdrawalFeeType: "PERCENTAGE",
  withdrawalFeeValue: 1.0,
  webhookUrl: "",
  returnUrl: "",
  cancelUrl: "",
  ipWhitelist: [],
  autoApproveDeposits: true,
  autoApproveWithdrawals: false,
  autoApprovalThreshold: 10000,
  connectionStatus: "untested",
  lastTestedAt: null,
  createdAt: "2026-03-01T08:00:00Z",
  updatedAt: "2026-03-20T04:30:00Z",
};

/* ==================== SUB-COMPONENTS ==================== */
function SectionCard({ title, subtitle, badge, icon, children, actions }: {
  title: string; subtitle?: string; badge?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[#6b7280]">{icon}</span>}
          <h3 className="text-white text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
          {badge}
        </div>
        {actions}
      </div>
      {subtitle && (
        <div className="px-5 py-2.5 bg-[#0d1117] border-b border-[#1f2937]">
          <p className="text-[#6b7280] text-[11px]" style={ss04}>{subtitle}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder, disabled, suffix, secret, helpText, mono }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
  disabled?: boolean; suffix?: string; secret?: boolean; helpText?: string; mono?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[#9ca3af] text-[11px] block" style={{ fontWeight: 500, ...ss04 }}>{label}</label>
      <div className="relative">
        <input
          type={secret && !show ? "password" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-9 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] outline-none focus:border-[#ff5222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mono ? "font-mono" : ""} ${suffix || secret ? "pr-10" : ""}`}
          style={ss04}
        />
        {secret && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white cursor-pointer">
            {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        )}
        {suffix && !secret && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-[#4b5563] text-[10px]" style={ss04}>{helpText}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-white text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{label}</p>
        {description && <p className="text-[#6b7280] text-[10px] mt-0.5" style={ss04}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${checked ? "bg-[#ff5222]" : "bg-[#374151]"}`}
      >
        <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: "connected" | "error" | "untested" }) {
  const map = {
    connected: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "CONNECTED" },
    error: { bg: "bg-red-500/15", text: "text-red-400", label: "ERROR" },
    untested: { bg: "bg-amber-500/15", text: "text-amber-400", label: "UNTESTED" },
  };
  const s = map[status];
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.bg} ${s.text}`} style={{ fontWeight: 600, ...ss04 }}>{s.label}</span>;
}

function EnvBadge({ env }: { env: Environment }) {
  return env === "PRODUCTION"
    ? <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400" style={{ fontWeight: 700, ...ss04 }}>PRODUCTION</span>
    : <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400" style={{ fontWeight: 700, ...ss04 }}>SANDBOX</span>;
}

/* ==================== MAIN ==================== */
export default function CVPayConfigPage() {
  const { admin, activeMerchant } = useOmsAuth();
  const { t } = useI18n();
  const role = admin?.role || "merchant_ops";

  const [config, setConfig] = useState<CVPayMerchantConfig>({
    ...DEFAULT_CONFIG,
    merchantId: "MCH_LKTAYA_001",
    merchantName: activeMerchant?.name || "Lucky Taya",
    apiKey: "cv_test_pk_1a2b3c4d5e6f7g8h9i0j",
    apiSecret: "cv_test_sk_z9y8x7w6v5u4t3s2r1q0p",
    webhookUrl: `https://api.${(activeMerchant?.name || "lucktaya").toLowerCase().replace(/\s/g, "")}.com/webhooks/cvpay`,
    returnUrl: `https://${(activeMerchant?.name || "lucktaya").toLowerCase().replace(/\s/g, "")}.com/wallet?status=success`,
    cancelUrl: `https://${(activeMerchant?.name || "lucktaya").toLowerCase().replace(/\s/g, "")}.com/wallet?status=cancelled`,
    ipWhitelist: ["103.21.244.0/22", "2400:cb00::/32"],
    connectionStatus: "connected",
    lastTestedAt: "2026-03-20T03:45:00Z",
  });

  const [tab, setTab] = useState<"credentials" | "fiat" | "stablecoin" | "limits" | "webhooks" | "automation">("credentials");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [confirmSaveModal, setConfirmSaveModal] = useState(false);

  const update = <K extends keyof CVPayMerchantConfig>(key: K, value: CVPayMerchantConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateFiatMethod = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      fiatMethods: prev.fiatMethods.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
    setDirty(true);
  };

  const updateStablecoinMethod = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      stablecoinMethods: prev.stablecoinMethods.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
    setDirty(true);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 2000));
    const success = config.apiKey.length > 5 && config.apiSecret.length > 5 && config.merchantId.length > 3;
    update("connectionStatus", success ? "connected" : "error");
    update("lastTestedAt", new Date().toISOString());
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "cvpay_test_connection", target: config.merchantId, detail: success ? "Connection successful" : "Connection failed" });
    showOmsToast(success ? "CVPay connection test successful!" : "CVPay connection test failed — check credentials", success ? "success" : "error");
    setTesting(false);
    setDirty(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setConfirmSaveModal(false);
    await new Promise(r => setTimeout(r, 1500));
    update("updatedAt", new Date().toISOString());
    logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "cvpay_config_update", target: config.merchantId, detail: `Environment: ${config.environment}, Methods: ${config.fiatMethods.filter(m => m.enabled).length} fiat + ${config.stablecoinMethods.filter(m => m.enabled).length} stablecoin` });
    showOmsToast("CVPay configuration saved successfully!");
    setSaving(false);
    setDirty(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showOmsToast("Copied to clipboard");
  };

  const enabledFiat = config.fiatMethods.filter(m => m.enabled).length;
  const enabledStablecoin = config.stablecoinMethods.filter(m => m.enabled).length;

  const tabs = [
    { key: "credentials" as const, label: "Credentials", icon: <Lock className="size-3.5" /> },
    { key: "fiat" as const, label: `Fiat Methods (${enabledFiat})`, icon: <Wallet className="size-3.5" /> },
    { key: "stablecoin" as const, label: `Stablecoins (${enabledStablecoin})`, icon: <Coins className="size-3.5" /> },
    { key: "limits" as const, label: "Limits & Fees", icon: <ArrowUpDown className="size-3.5" /> },
    { key: "webhooks" as const, label: "Webhooks & URLs", icon: <Globe className="size-3.5" /> },
    { key: "automation" as const, label: "Automation", icon: <Zap className="size-3.5" /> },
  ];

  return (
    <div className="space-y-4" style={pp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>CV</div>
            <div>
              <h2 className="text-white text-[18px]" style={{ fontWeight: 700, ...ss04 }}>CVPay Configuration</h2>
              <p className="text-[#6b7280] text-[11px]" style={ss04}>Manage your CVPay payment gateway integration</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={config.connectionStatus} />
          <EnvBadge env={config.environment} />
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="h-8 px-3 bg-[#1f2937] border border-[#374151] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#374151] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            style={{ fontWeight: 600, ...ss04 }}
          >
            <TestTube className={`size-3.5 ${testing ? "animate-pulse" : ""}`} />
            {testing ? "Testing..." : "Test"}
          </button>
          <button
            onClick={() => dirty ? setConfirmSaveModal(true) : null}
            disabled={!dirty || saving}
            className={`h-8 px-4 text-white text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-40 ${dirty ? "bg-[#ff5222] hover:bg-[#e04a1d]" : "bg-[#374151]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Merchant ID", value: config.merchantId || "Not set", color: "text-white" },
          { label: "Environment", value: config.environment, color: config.environment === "PRODUCTION" ? "text-red-400" : "text-amber-400" },
          { label: "Fiat Methods", value: `${enabledFiat}/${config.fiatMethods.length}`, color: "text-emerald-400" },
          { label: "Stablecoins", value: `${enabledStablecoin}/${config.stablecoinMethods.length}`, color: "text-blue-400" },
          { label: "Last Tested", value: config.lastTestedAt ? new Date(config.lastTestedAt).toLocaleDateString() : "Never", color: "text-[#6b7280]" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className={`text-[16px] ${s.color} truncate`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0a0e1a] border border-[#1f2937] rounded-xl p-1 overflow-x-auto">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`text-[11px] px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${tab === tb.key ? "bg-[#ff5222] text-white" : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            {tb.icon}
            {tb.label}
          </button>
        ))}
      </div>

      {/* ==================== CREDENTIALS TAB ==================== */}
      {tab === "credentials" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <SectionCard title="API Credentials" icon={<Lock className="size-4" />} subtitle="Your CVPay merchant API keys for authentication. Keep these secure.">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldInput label="Merchant ID" value={config.merchantId} onChange={v => update("merchantId", v)} placeholder="MCH_..." mono />
                  <FieldInput label="Merchant Name" value={config.merchantName} onChange={v => update("merchantName", v)} placeholder="Your merchant name" />
                </div>
                <FieldInput label="API Key (Public)" value={config.apiKey} onChange={v => update("apiKey", v)} placeholder="cv_live_pk_..." mono helpText="Used for client-side integrations. Safe to expose in frontend." />
                <FieldInput label="API Secret (Private)" value={config.apiSecret} onChange={v => update("apiSecret", v)} placeholder="cv_live_sk_..." mono secret helpText="Used for server-side signature generation. NEVER expose this key." />
              </div>
            </SectionCard>

            <SectionCard title="Environment" icon={<Server className="size-4" />} subtitle="Switch between sandbox testing and live production mode.">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    { env: "SANDBOX" as Environment, label: "Sandbox", desc: "Test transactions with mock data", url: "https://api-sandbox.cvpay.org", color: "border-amber-500/30 bg-amber-500/5" },
                    { env: "PRODUCTION" as Environment, label: "Production", desc: "Live transactions with real funds", url: "https://mch.cvpay.org", color: "border-red-500/30 bg-red-500/5" },
                  ]).map(opt => (
                    <button
                      key={opt.env}
                      onClick={() => { update("environment", opt.env); update("apiBaseUrl", opt.url); }}
                      className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${config.environment === opt.env ? opt.color : "border-[#1f2937] bg-[#0a0e1a] hover:border-[#374151]"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full border-2 ${config.environment === opt.env ? "border-[#ff5222] bg-[#ff5222]" : "border-[#4b5563]"}`} />
                        <span className="text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{opt.label}</span>
                      </div>
                      <p className="text-[#6b7280] text-[10px] ml-5" style={ss04}>{opt.desc}</p>
                      <p className="text-[#4b5563] text-[10px] ml-5 mt-1 font-mono" style={ss04}>{opt.url}</p>
                    </button>
                  ))}
                </div>
                <FieldInput label="API Base URL" value={config.apiBaseUrl} onChange={v => update("apiBaseUrl", v)} placeholder="https://..." mono />
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SectionCard title="Connection Status" icon={<Zap className="size-4" />}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#0a0e1a] rounded-xl">
                  {config.connectionStatus === "connected" ? <CheckCircle className="size-5 text-emerald-400" /> : config.connectionStatus === "error" ? <XCircle className="size-5 text-red-400" /> : <AlertTriangle className="size-5 text-amber-400" />}
                  <div>
                    <p className="text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>
                      {config.connectionStatus === "connected" ? "Active & Connected" : config.connectionStatus === "error" ? "Connection Failed" : "Not Tested"}
                    </p>
                    {config.lastTestedAt && (
                      <p className="text-[#6b7280] text-[10px]" style={ss04}>Last tested: {new Date(config.lastTestedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <Toggle checked={config.enabled} onChange={v => update("enabled", v)} label="Gateway Enabled" description="Accept payments through CVPay" />
              </div>
            </SectionCard>

            <SectionCard title="Quick Info" icon={<Shield className="size-4" />}>
              <div className="space-y-2 text-[11px]" style={ss04}>
                {[
                  { label: "Provider", value: "CVPay (Hybrid)" },
                  { label: "Type", value: "Fiat + Stablecoin" },
                  { label: "Country", value: "Philippines" },
                  { label: "Settlement", value: "PHP / USDT" },
                  { label: "Last Updated", value: new Date(config.updatedAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-[#1f2937] last:border-0">
                    <span className="text-[#6b7280]" style={{ fontWeight: 500 }}>{item.label}</span>
                    <span className="text-white" style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Documentation" icon={<ExternalLink className="size-4" />}>
              <div className="space-y-2">
                {[
                  { label: "API Reference", url: "https://docs.cvpay.org/api" },
                  { label: "Webhook Guide", url: "https://docs.cvpay.org/webhooks" },
                  { label: "Stablecoin Guide", url: "https://docs.cvpay.org/stablecoins" },
                  { label: "Merchant Portal", url: "https://mch.cvpay.org" },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-[#0a0e1a] rounded-lg hover:bg-[#1f2937] transition-colors cursor-pointer">
                    <span className="text-[#9ca3af] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{link.label}</span>
                    <ExternalLink className="size-3 text-[#4b5563]" />
                  </a>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ==================== FIAT METHODS TAB ==================== */}
      {tab === "fiat" && (
        <SectionCard
          title="Fiat Payment Methods"
          icon={<Wallet className="size-4" />}
          subtitle="Enable or disable individual fiat payment channels. Per-method fee overrides are applied on top of global fees."
          badge={<span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400" style={{ fontWeight: 600, ...ss04 }}>{enabledFiat} ACTIVE</span>}
          actions={
            <Toggle checked={config.fiatEnabled} onChange={v => update("fiatEnabled", v)} label="Fiat" />
          }
        >
          {!config.fiatEnabled ? (
            <div className="py-8 text-center">
              <Wallet className="size-8 text-[#374151] mx-auto mb-2" />
              <p className="text-[#6b7280] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Fiat payments are disabled</p>
              <p className="text-[#4b5563] text-[10px] mt-1" style={ss04}>Enable fiat to configure individual methods</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Group by channel */}
              {["E-Wallet", "Bank", "Online Banking", "OTC"].map(channel => {
                const methods = config.fiatMethods.filter(m => m.channel === channel);
                if (methods.length === 0) return null;
                return (
                  <div key={channel}>
                    <p className="text-[#6b7280] text-[10px] mb-2 mt-3 first:mt-0" style={{ fontWeight: 600, ...ss04 }}>{channel.toUpperCase()}</p>
                    {methods.map(m => (
                      <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl mb-1.5 transition-colors ${m.enabled ? "bg-[#0d1117] border border-[#1f2937]" : "bg-[#0a0e1a]/50 border border-[#1f2937]/50 opacity-60"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] ${m.enabled ? "bg-orange-500/20 text-orange-400" : "bg-[#1f2937] text-[#4b5563]"}`} style={{ fontWeight: 700, ...ss04 }}>{m.icon}</div>
                          <div>
                            <p className="text-white text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{m.name}</p>
                            <p className="text-[#6b7280] text-[10px]" style={ss04}>₱{m.minAmount.toLocaleString()} – ₱{m.maxAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#6b7280] text-[10px]" style={ss04}>Fee:</span>
                            <input
                              type="number"
                              step="0.1"
                              value={m.feePercent}
                              onChange={e => updateFiatMethod(m.id, "feePercent", Number(e.target.value))}
                              className="w-14 h-6 px-1.5 bg-[#0a0e1a] border border-[#1f2937] rounded text-white text-[10px] text-center outline-none focus:border-[#ff5222]"
                              style={ss04}
                            />
                            <span className="text-[#4b5563] text-[10px]" style={ss04}>%</span>
                          </div>
                          <button
                            onClick={() => updateFiatMethod(m.id, "enabled", !m.enabled)}
                            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${m.enabled ? "bg-[#ff5222]" : "bg-[#374151]"}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${m.enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* ==================== STABLECOIN TAB ==================== */}
      {tab === "stablecoin" && (
        <SectionCard
          title="Stablecoin Payment Methods"
          icon={<Coins className="size-4" />}
          subtitle="Configure cryptocurrency stablecoin acceptance. Wallet addresses are auto-generated by CVPay per transaction."
          badge={<span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400" style={{ fontWeight: 600, ...ss04 }}>{enabledStablecoin} ACTIVE</span>}
          actions={
            <Toggle checked={config.stablecoinEnabled} onChange={v => update("stablecoinEnabled", v)} label="Stablecoin" />
          }
        >
          {!config.stablecoinEnabled ? (
            <div className="py-8 text-center">
              <Coins className="size-8 text-[#374151] mx-auto mb-2" />
              <p className="text-[#6b7280] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>Stablecoin payments are disabled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {config.stablecoinMethods.map(m => (
                <div key={m.id} className={`p-4 rounded-xl transition-colors ${m.enabled ? "bg-[#0d1117] border border-[#1f2937]" : "bg-[#0a0e1a]/50 border border-[#1f2937]/50 opacity-60"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[14px] ${m.enabled ? "bg-blue-500/20 text-blue-400" : "bg-[#1f2937] text-[#4b5563]"}`} style={{ fontWeight: 700 }}>{m.icon}</div>
                      <div>
                        <p className="text-white text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1f2937] text-[#9ca3af]" style={{ fontWeight: 600, ...ss04 }}>{m.network}</span>
                          <span className="text-[#6b7280] text-[10px]" style={ss04}>{m.confirmations} confirmations</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => updateStablecoinMethod(m.id, "enabled", !m.enabled)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${m.enabled ? "bg-[#ff5222]" : "bg-[#374151]"}`}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${m.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {m.enabled && (
                    <div className="grid gap-3 md:grid-cols-4 mt-3 pt-3 border-t border-[#1f2937]">
                      <div className="space-y-1">
                        <label className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Min Amount (USD)</label>
                        <input type="number" value={m.minAmount} onChange={e => updateStablecoinMethod(m.id, "minAmount", Number(e.target.value))}
                          className="w-full h-7 px-2 bg-[#0a0e1a] border border-[#1f2937] rounded text-white text-[11px] outline-none focus:border-[#ff5222]" style={ss04} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Max Amount (USD)</label>
                        <input type="number" value={m.maxAmount} onChange={e => updateStablecoinMethod(m.id, "maxAmount", Number(e.target.value))}
                          className="w-full h-7 px-2 bg-[#0a0e1a] border border-[#1f2937] rounded text-white text-[11px] outline-none focus:border-[#ff5222]" style={ss04} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Fee (%)</label>
                        <input type="number" step="0.1" value={m.feePercent} onChange={e => updateStablecoinMethod(m.id, "feePercent", Number(e.target.value))}
                          className="w-full h-7 px-2 bg-[#0a0e1a] border border-[#1f2937] rounded text-white text-[11px] outline-none focus:border-[#ff5222]" style={ss04} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Confirmations</label>
                        <input type="number" value={m.confirmations} onChange={e => updateStablecoinMethod(m.id, "confirmations", Number(e.target.value))}
                          className="w-full h-7 px-2 bg-[#0a0e1a] border border-[#1f2937] rounded text-white text-[11px] outline-none focus:border-[#ff5222]" style={ss04} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-4">
                <p className="text-blue-400 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  Wallet addresses are dynamically generated by CVPay per transaction. Settlement is in your configured currency (PHP or USDT). Network fees are borne by the sender.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* ==================== LIMITS & FEES TAB ==================== */}
      {tab === "limits" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Transaction Limits" icon={<ArrowUpDown className="size-4" />} subtitle="Set global deposit and withdrawal limits for this gateway.">
            <div className="space-y-4">
              <p className="text-[#9ca3af] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>DAILY LIMITS</p>
              <div className="grid gap-3 md:grid-cols-2">
                <FieldInput label="Daily Deposit Limit (₱)" value={config.dailyDepositLimit} onChange={v => update("dailyDepositLimit", Number(v))} type="number" />
                <FieldInput label="Daily Withdrawal Limit (₱)" value={config.dailyWithdrawalLimit} onChange={v => update("dailyWithdrawalLimit", Number(v))} type="number" />
              </div>
              <p className="text-[#9ca3af] text-[10px] mt-2" style={{ fontWeight: 600, ...ss04 }}>MONTHLY LIMITS</p>
              <div className="grid gap-3 md:grid-cols-2">
                <FieldInput label="Monthly Deposit Limit (₱)" value={config.monthlyDepositLimit} onChange={v => update("monthlyDepositLimit", Number(v))} type="number" />
                <FieldInput label="Monthly Withdrawal Limit (₱)" value={config.monthlyWithdrawalLimit} onChange={v => update("monthlyWithdrawalLimit", Number(v))} type="number" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Fee Configuration" icon={<Settings2 className="size-4" />} subtitle="Global fee settings applied to all transactions.">
            <div className="space-y-4">
              <p className="text-[#9ca3af] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>DEPOSIT FEES</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[#9ca3af] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Fee Type</label>
                  <div className="flex gap-2">
                    {(["PERCENTAGE", "FIXED"] as FeeType[]).map(ft => (
                      <button key={ft} onClick={() => update("depositFeeType", ft)}
                        className={`flex-1 h-8 rounded-lg text-[11px] cursor-pointer transition-colors ${config.depositFeeType === ft ? "bg-[#ff5222] text-white" : "bg-[#0a0e1a] border border-[#1f2937] text-[#6b7280] hover:text-white"}`}
                        style={{ fontWeight: 600, ...ss04 }}>{ft === "PERCENTAGE" ? "Percent (%)" : "Fixed (₱)"}</button>
                    ))}
                  </div>
                </div>
                <FieldInput label={config.depositFeeType === "PERCENTAGE" ? "Deposit Fee (%)" : "Deposit Fee (₱)"} value={config.depositFeeValue} onChange={v => update("depositFeeValue", Number(v))} type="number" />
              </div>

              <p className="text-[#9ca3af] text-[10px] mt-2" style={{ fontWeight: 600, ...ss04 }}>WITHDRAWAL FEES</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[#9ca3af] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Fee Type</label>
                  <div className="flex gap-2">
                    {(["PERCENTAGE", "FIXED"] as FeeType[]).map(ft => (
                      <button key={ft} onClick={() => update("withdrawalFeeType", ft)}
                        className={`flex-1 h-8 rounded-lg text-[11px] cursor-pointer transition-colors ${config.withdrawalFeeType === ft ? "bg-[#ff5222] text-white" : "bg-[#0a0e1a] border border-[#1f2937] text-[#6b7280] hover:text-white"}`}
                        style={{ fontWeight: 600, ...ss04 }}>{ft === "PERCENTAGE" ? "Percent (%)" : "Fixed (₱)"}</button>
                    ))}
                  </div>
                </div>
                <FieldInput label={config.withdrawalFeeType === "PERCENTAGE" ? "Withdrawal Fee (%)" : "Withdrawal Fee (₱)"} value={config.withdrawalFeeValue} onChange={v => update("withdrawalFeeValue", Number(v))} type="number" />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ==================== WEBHOOKS TAB ==================== */}
      {tab === "webhooks" && (
        <div className="space-y-4">
          <SectionCard title="Webhook & Redirect URLs" icon={<Globe className="size-4" />} subtitle="CVPay sends real-time transaction updates to your webhook URL. Users are redirected to your return URL after payment.">
            <div className="space-y-4">
              <FieldInput label="Webhook Notification URL" value={config.webhookUrl} onChange={v => update("webhookUrl", v)} placeholder="https://api.yoursite.com/webhooks/cvpay" mono helpText="CVPay will POST transaction status updates (HMAC-SHA256 signed) to this endpoint." />
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput label="Success Return URL" value={config.returnUrl} onChange={v => update("returnUrl", v)} placeholder="https://yoursite.com/wallet?status=success" mono helpText="Redirect after successful payment." />
                <FieldInput label="Cancel Return URL" value={config.cancelUrl} onChange={v => update("cancelUrl", v)} placeholder="https://yoursite.com/wallet?status=cancelled" mono helpText="Redirect when user cancels." />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="IP Whitelist" icon={<Shield className="size-4" />} subtitle="Only accept webhook calls from these IP ranges. Leave empty to accept from any CVPay IP.">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={newIp}
                  onChange={e => setNewIp(e.target.value)}
                  placeholder="e.g. 103.21.244.0/22"
                  className="flex-1 h-8 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] font-mono outline-none focus:border-[#ff5222]"
                  style={ss04}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newIp.trim()) {
                      update("ipWhitelist", [...config.ipWhitelist, newIp.trim()]);
                      setNewIp("");
                    }
                  }}
                />
                <button
                  onClick={() => { if (newIp.trim()) { update("ipWhitelist", [...config.ipWhitelist, newIp.trim()]); setNewIp(""); } }}
                  className="h-8 px-3 bg-[#1f2937] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#374151] transition-colors"
                  style={{ fontWeight: 600, ...ss04 }}
                >Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.ipWhitelist.map((ip, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0a0e1a] border border-[#1f2937] rounded-lg">
                    <span className="text-white text-[11px] font-mono" style={ss04}>{ip}</span>
                    <button onClick={() => update("ipWhitelist", config.ipWhitelist.filter((_, idx) => idx !== i))} className="text-[#6b7280] hover:text-red-400 cursor-pointer">
                      <XCircle className="size-3" />
                    </button>
                  </div>
                ))}
                {config.ipWhitelist.length === 0 && (
                  <p className="text-[#4b5563] text-[10px]" style={ss04}>No IP restrictions — accepting from all CVPay IPs</p>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ==================== AUTOMATION TAB ==================== */}
      {tab === "automation" && (
        <SectionCard title="Automation Settings" icon={<Zap className="size-4" />} subtitle="Configure auto-approval rules for deposits and withdrawals.">
          <div className="space-y-4">
            <div className="p-4 bg-[#0d1117] border border-[#1f2937] rounded-xl">
              <Toggle checked={config.autoApproveDeposits} onChange={v => update("autoApproveDeposits", v)} label="Auto-approve Deposits" description="Automatically mark deposits as completed when CVPay confirms payment." />
            </div>
            <div className="p-4 bg-[#0d1117] border border-[#1f2937] rounded-xl space-y-3">
              <Toggle checked={config.autoApproveWithdrawals} onChange={v => update("autoApproveWithdrawals", v)} label="Auto-approve Withdrawals" description="Automatically process withdrawals below the threshold." />
              {config.autoApproveWithdrawals && (
                <div className="pl-5 border-l-2 border-[#ff5222]/30">
                  <FieldInput
                    label="Auto-approval Threshold (₱)"
                    value={config.autoApprovalThreshold}
                    onChange={v => update("autoApprovalThreshold", Number(v))}
                    type="number"
                    helpText="Withdrawals above this amount require manual review."
                  />
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                Auto-approval is subject to platform-level risk checks. Transactions flagged by the risk engine will always require manual review regardless of these settings.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ==================== SAVE CONFIRM MODAL ==================== */}
      <OmsModal open={confirmSaveModal} onClose={() => setConfirmSaveModal(false)} title="Save CVPay Configuration">
        <OmsConfirmContent
          icon="success"
          iconColor="#ff5222"
          iconBg="#ff5222"
          message="Save all changes to your CVPay configuration? This will take effect immediately."
          details={[
            { label: "Merchant ID", value: config.merchantId },
            { label: "Environment", value: config.environment },
            { label: "Fiat Methods", value: `${enabledFiat} enabled` },
            { label: "Stablecoins", value: `${enabledStablecoin} enabled` },
            { label: "Auto-approve Deposits", value: config.autoApproveDeposits ? "Yes" : "No" },
            { label: "Auto-approve Withdrawals", value: config.autoApproveWithdrawals ? `Yes (≤₱${config.autoApprovalThreshold.toLocaleString()})` : "No" },
          ]}
        />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setConfirmSaveModal(false)}>Cancel</OmsBtn>
          <OmsBtn variant="primary" onClick={handleSave} fullWidth>{saving ? "Saving..." : "Confirm & Save"}</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}
