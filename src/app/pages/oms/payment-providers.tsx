import { useState } from "react";
import { useOmsAuth, isPlatformUser } from "../../components/oms/oms-auth";
import { OmsModal, OmsBtn, OmsButtonRow, showOmsToast } from "../../components/oms/oms-modal";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
export type ProviderStatus = "active" | "degraded" | "testing" | "disabled" | "maintenance";
export type ProviderType = "fiat" | "crypto" | "hybrid";
export type RoutingPriority = "primary" | "fallback" | "disabled";

export interface ProviderMethodLink {
  methodId: string;
  methodName: string;
  methodShortName: string;
  routing: RoutingPriority;
  feeOverridePercent?: number;
  feeOverrideFixed?: number;
  enabled: boolean;
}

export interface PaymentProvider {
  id: string;
  name: string;
  shortName: string;
  type: ProviderType;
  logo: string;
  logoColor: { bg: string; text: string };
  status: ProviderStatus;
  country: string;
  website: string;
  description: string;
  /** API integration details */
  apiEndpoint: string;
  apiVersion: string;
  environment: "production" | "sandbox";
  webhookUrl: string;
  apiKeyMasked: string;
  secretKeyMasked: string;
  /** Supported payment methods */
  supportedMethods: ProviderMethodLink[];
  /** Health metrics */
  uptime30d: number;
  avgLatencyMs: number;
  successRate7d: number;
  totalTxn30d: number;
  totalVolume30d: string;
  lastPing: string;
  lastIncident: string;
  /** Fees & settlement */
  platformFeePercent: number;
  settlementSchedule: string;
  settlementCurrency: string;
  /** Merchant assignments */
  assignedMerchants: string[];
  /** Compliance */
  bspLicense: string;
  pagcorApproved: boolean;
  amlCompliant: boolean;
  notes: string;
}

/* ==================== MOCK PROVIDERS ==================== */
const MOCK_PROVIDERS: PaymentProvider[] = [
  {
    id: "PRV001",
    name: "PayMongo",
    shortName: "PayMongo",
    type: "fiat",
    logo: "PM",
    logoColor: { bg: "bg-green-500", text: "text-white" },
    status: "active",
    country: "Philippines",
    website: "https://paymongo.com",
    description: "PH-native payment gateway. Supports GCash, Maya, cards, and bank transfers with real-time settlement.",
    apiEndpoint: "https://api.paymongo.com/v1",
    apiVersion: "v1.0",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/paymongo",
    apiKeyMasked: "pk_live_****************************3xQm",
    secretKeyMasked: "sk_live_****************************8nPr",
    supportedMethods: [
      { methodId: "PM001", methodName: "GCash", methodShortName: "GCash", routing: "primary", enabled: true },
      { methodId: "PM002", methodName: "Maya (PayMaya)", methodShortName: "Maya", routing: "primary", enabled: true },
      { methodId: "PM010", methodName: "Visa / Mastercard", methodShortName: "Card", routing: "fallback", enabled: false },
    ],
    uptime30d: 99.95,
    avgLatencyMs: 180,
    successRate7d: 99.3,
    totalTxn30d: 42800,
    totalVolume30d: "PHP 58.7M",
    lastPing: "2026-03-16 07:00 PHT",
    lastIncident: "2026-02-28 — GCash timeout spike (resolved in 12 min)",
    platformFeePercent: 0.5,
    settlementSchedule: "T+1 (next business day)",
    settlementCurrency: "PHP",
    assignedMerchants: ["MCH001", "MCH002", "MCH003", "MCH004", "MCH005", "MCH006"],
    bspLicense: "BSP EMI-2020-014",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Primary fiat provider. Volume-based fee tiers available at >₱50M/month.",
  },
  {
    id: "PRV_CVPAY",
    name: "CVPay",
    shortName: "CVPay",
    type: "hybrid",
    logo: "CV",
    logoColor: { bg: "bg-orange-500", text: "text-white" },
    status: "active",
    country: "Philippines",
    website: "https://mch.cvpay.org",
    description: "Philippine hybrid payment gateway with 12 fiat methods and 5 stablecoin options. Supports GCash, Maya, banks, OTC, and crypto on-ramps.",
    apiEndpoint: "https://mch.cvpay.org",
    apiVersion: "v1.0",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/cvpay",
    apiKeyMasked: "cv_live_****************************Xm2p",
    secretKeyMasked: "cv_secret_****************************Yw9k",
    supportedMethods: [
      { methodId: "PM_CV_GCASH", methodName: "GCash (CVPay)", methodShortName: "GCash", routing: "primary", enabled: true },
      { methodId: "PM_CV_MAYA", methodName: "Maya (CVPay)", methodShortName: "Maya", routing: "primary", enabled: true },
      { methodId: "PM_CV_GRABPAY", methodName: "GrabPay", methodShortName: "GrabPay", routing: "primary", enabled: true },
      { methodId: "PM_CV_SHOPEEPAY", methodName: "ShopeePay", methodShortName: "ShopeePay", routing: "primary", enabled: true },
      { methodId: "PM_CV_INSTAPAY", methodName: "InstaPay (CVPay)", methodShortName: "InstaPay", routing: "primary", enabled: true },
      { methodId: "PM_CV_PESONET", methodName: "PESONet (CVPay)", methodShortName: "PESONet", routing: "primary", enabled: true },
      { methodId: "PM_CV_BDO", methodName: "BDO Online Banking", methodShortName: "BDO", routing: "primary", enabled: true },
      { methodId: "PM_CV_BPI", methodName: "BPI Online Banking", methodShortName: "BPI", routing: "primary", enabled: true },
      { methodId: "PM_CV_UNIONBANK", methodName: "UnionBank Online", methodShortName: "UnionBank", routing: "primary", enabled: true },
      { methodId: "PM_CV_7ELEVEN", methodName: "7-Eleven (CVPay)", methodShortName: "7-Eleven", routing: "primary", enabled: true },
      { methodId: "PM_CV_CEBUANA", methodName: "Cebuana Lhuillier (CVPay)", methodShortName: "Cebuana", routing: "primary", enabled: true },
      { methodId: "PM_CV_MLHUILLIER", methodName: "M Lhuillier", methodShortName: "MLhuillier", routing: "primary", enabled: true },
      { methodId: "PM_CV_USDT_TRC20", methodName: "USDT TRC-20 (CVPay)", methodShortName: "USDT", routing: "primary", enabled: true },
      { methodId: "PM_CV_USDT_ERC20", methodName: "USDT ERC-20 (CVPay)", methodShortName: "USDT-ETH", routing: "fallback", enabled: true },
      { methodId: "PM_CV_USDC_POLYGON", methodName: "USDC Polygon (CVPay)", methodShortName: "USDC-POL", routing: "primary", enabled: true },
      { methodId: "PM_CV_USDC_SOLANA", methodName: "USDC Solana (CVPay)", methodShortName: "USDC-SOL", routing: "primary", enabled: true },
      { methodId: "PM_CV_DAI", methodName: "DAI (CVPay)", methodShortName: "DAI", routing: "primary", enabled: true },
    ],
    uptime30d: 99.94,
    avgLatencyMs: 195,
    successRate7d: 99.1,
    totalTxn30d: 24200,
    totalVolume30d: "PHP 28.4M + ₮ 3.6M",
    lastPing: "2026-03-16 07:00 PHT",
    lastIncident: "2026-03-08 — GrabPay maintenance window (30 min)",
    platformFeePercent: 0.55,
    settlementSchedule: "Real-time (e-wallets), T+1 (banks/OTC), 1-10 min (stablecoins)",
    settlementCurrency: "PHP / USDT / USDC / DAI",
    assignedMerchants: ["MCH001", "MCH002", "MCH003", "MCH004", "MCH006"],
    bspLicense: "BSP EMI-2023-041 | BSP VASP-2024-008",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Comprehensive hybrid aggregator: 12 fiat + 5 stablecoin methods. Best for merchants needing full coverage of PH payment options plus crypto on-ramps.",
  },
  {
    id: "PRV002",
    name: "Xendit Philippines",
    shortName: "Xendit",
    type: "fiat",
    logo: "XN",
    logoColor: { bg: "bg-blue-600", text: "text-white" },
    status: "active",
    country: "Philippines / SEA",
    website: "https://xendit.co",
    description: "SEA-wide payment platform. Redundant GCash/Maya processing + InstaPay/PESONet bank transfers.",
    apiEndpoint: "https://api.xendit.co/v2",
    apiVersion: "v2.0",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/xendit",
    apiKeyMasked: "xnd_production_****************************kL9w",
    secretKeyMasked: "xnd_secret_****************************pQ3r",
    supportedMethods: [
      { methodId: "PM001", methodName: "GCash", methodShortName: "GCash", routing: "fallback", enabled: true },
      { methodId: "PM002", methodName: "Maya (PayMaya)", methodShortName: "Maya", routing: "fallback", enabled: true },
      { methodId: "PM003", methodName: "Bank Transfer (InstaPay)", methodShortName: "InstaPay", routing: "primary", enabled: true },
      { methodId: "PM004", methodName: "Bank Transfer (PESONet)", methodShortName: "PESONet", routing: "primary", enabled: true },
    ],
    uptime30d: 99.91,
    avgLatencyMs: 210,
    successRate7d: 98.9,
    totalTxn30d: 9200,
    totalVolume30d: "PHP 8.7M",
    lastPing: "2026-03-16 07:01 PHT",
    lastIncident: "2026-03-02 — PESONet delayed settlement (bank-side, 4 hrs)",
    platformFeePercent: 0.6,
    settlementSchedule: "T+1 (GCash/Maya), T+2 (PESONet)",
    settlementCurrency: "PHP",
    assignedMerchants: ["MCH001", "MCH002", "MCH003", "MCH006", "MCH007"],
    bspLicense: "BSP OPS-2021-088",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Serves as failover for GCash/Maya when PayMongo is degraded. Lower success rate due to bank-side delays.",
  },
  {
    id: "PRV003",
    name: "DragonPay",
    shortName: "DragonPay",
    type: "fiat",
    logo: "DP",
    logoColor: { bg: "bg-red-500", text: "text-white" },
    status: "active",
    country: "Philippines",
    website: "https://dragonpay.ph",
    description: "PH OTC & bank aggregator. Covers 7-Eleven CLiQQ, Cebuana Lhuillier, and 40+ bank/OTC channels.",
    apiEndpoint: "https://gw.dragonpay.ph/api/collect/v1",
    apiVersion: "v1.4",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/dragonpay",
    apiKeyMasked: "dp_merchant_****************************7mTx",
    secretKeyMasked: "dp_secret_****************************2kLn",
    supportedMethods: [
      { methodId: "PM005", methodName: "7-Eleven CLiQQ", methodShortName: "7-Eleven", routing: "primary", enabled: true },
      { methodId: "PM006", methodName: "Cebuana Lhuillier", methodShortName: "Cebuana", routing: "primary", enabled: true },
      { methodId: "PM003", methodName: "Bank Transfer (InstaPay)", methodShortName: "InstaPay", routing: "fallback", enabled: true },
      { methodId: "PM004", methodName: "Bank Transfer (PESONet)", methodShortName: "PESONet", routing: "fallback", enabled: true },
    ],
    uptime30d: 99.82,
    avgLatencyMs: 350,
    successRate7d: 97.1,
    totalTxn30d: 4100,
    totalVolume30d: "PHP 4.1M",
    lastPing: "2026-03-16 06:58 PHT",
    lastIncident: "2026-03-10 — CLiQQ kiosk sync delay (resolved in 45 min)",
    platformFeePercent: 0.8,
    settlementSchedule: "T+1 (OTC), T+2 (Bank)",
    settlementCurrency: "PHP",
    assignedMerchants: ["MCH001", "MCH002", "MCH005", "MCH008"],
    bspLicense: "BSP REM-2019-022",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Only provider for OTC channels. Higher latency due to kiosk integrations.",
  },
  {
    id: "PRV004",
    name: "Coins.ph",
    shortName: "Coins.ph",
    type: "hybrid",
    logo: "CO",
    logoColor: { bg: "bg-yellow-500", text: "text-white" },
    status: "active",
    country: "Philippines",
    website: "https://coins.ph",
    description: "PH crypto exchange & wallet. Provides USDT/USDC on-ramp/off-ramp with PHP conversion via their liquidity pools.",
    apiEndpoint: "https://api.coins.ph/v3",
    apiVersion: "v3.1",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/coinsph",
    apiKeyMasked: "coins_api_****************************nR4t",
    secretKeyMasked: "coins_sec_****************************jW8q",
    supportedMethods: [
      { methodId: "PM009", methodName: "USDT (Tether)", methodShortName: "USDT", routing: "primary", enabled: true },
      { methodId: "PM011", methodName: "USDT (ERC-20)", methodShortName: "USDT-ETH", routing: "fallback", enabled: true },
      { methodId: "PM012", methodName: "USDC (Circle)", methodShortName: "USDC", routing: "fallback", enabled: true },
      { methodId: "PM001", methodName: "GCash", methodShortName: "GCash", routing: "disabled", enabled: false, feeOverridePercent: 1.0 },
    ],
    uptime30d: 99.88,
    avgLatencyMs: 420,
    successRate7d: 99.6,
    totalTxn30d: 3800,
    totalVolume30d: "PHP 12.4M (equiv)",
    lastPing: "2026-03-16 07:00 PHT",
    lastIncident: "2026-02-15 — Tron network congestion (deposits delayed 20 min)",
    platformFeePercent: 0.1,
    settlementSchedule: "Real-time (on-chain), T+1 (PHP conversion)",
    settlementCurrency: "USDT / PHP",
    assignedMerchants: ["MCH001", "MCH002", "MCH003"],
    bspLicense: "BSP VASP-2022-003",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Hybrid: on-ramps stablecoins and can also process GCash. Primary USDT (TRC-20) provider.",
  },
  {
    id: "PRV005",
    name: "PDAX",
    shortName: "PDAX",
    type: "crypto",
    logo: "PX",
    logoColor: { bg: "bg-teal-600", text: "text-white" },
    status: "active",
    country: "Philippines",
    website: "https://pdax.ph",
    description: "Philippine Digital Asset Exchange. BSP-licensed VASP for institutional crypto settlement and PHP conversion.",
    apiEndpoint: "https://api.pdax.ph/v2",
    apiVersion: "v2.0",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/pdax",
    apiKeyMasked: "pdax_key_****************************mN6p",
    secretKeyMasked: "pdax_sec_****************************xT2k",
    supportedMethods: [
      { methodId: "PM009", methodName: "USDT (Tether)", methodShortName: "USDT", routing: "fallback", enabled: true },
      { methodId: "PM011", methodName: "USDT (ERC-20)", methodShortName: "USDT-ETH", routing: "primary", enabled: true },
      { methodId: "PM012", methodName: "USDC (Circle)", methodShortName: "USDC", routing: "primary", enabled: true },
      { methodId: "PM014", methodName: "DAI (MakerDAO)", methodShortName: "DAI", routing: "primary", enabled: true },
    ],
    uptime30d: 99.97,
    avgLatencyMs: 150,
    successRate7d: 99.8,
    totalTxn30d: 2400,
    totalVolume30d: "PHP 9.1M (equiv)",
    lastPing: "2026-03-16 07:01 PHT",
    lastIncident: "2026-01-20 — Scheduled maintenance (2 hrs, planned)",
    platformFeePercent: 0.15,
    settlementSchedule: "Real-time (crypto), T+0 same-day (PHP)",
    settlementCurrency: "USDT / USDC / PHP",
    assignedMerchants: ["MCH001", "MCH002", "MCH003", "MCH006"],
    bspLicense: "BSP VASP-2021-001",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Best latency and uptime for crypto. Primary ERC-20 and USDC provider. Auto-converts to PHP via their OTC desk.",
  },
  {
    id: "PRV006",
    name: "Circle",
    shortName: "Circle",
    type: "crypto",
    logo: "CI",
    logoColor: { bg: "bg-blue-500", text: "text-white" },
    status: "active",
    country: "USA / Global",
    website: "https://circle.com",
    description: "USDC issuer. Direct API for USDC mint/burn on Solana, Ethereum, and Polygon with 1:1 USD reserves.",
    apiEndpoint: "https://api.circle.com/v2",
    apiVersion: "v2.1",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/circle",
    apiKeyMasked: "circle_api_****************************wJ5m",
    secretKeyMasked: "circle_sec_****************************rK9n",
    supportedMethods: [
      { methodId: "PM012", methodName: "USDC (Circle)", methodShortName: "USDC", routing: "primary", feeOverridePercent: 0, enabled: true },
      { methodId: "PM013", methodName: "USDC (Polygon)", methodShortName: "USDC-POL", routing: "primary", enabled: true },
    ],
    uptime30d: 99.99,
    avgLatencyMs: 95,
    successRate7d: 99.95,
    totalTxn30d: 1800,
    totalVolume30d: "USD 520K",
    lastPing: "2026-03-16 07:00 PHT",
    lastIncident: "No incidents in last 90 days",
    platformFeePercent: 0,
    settlementSchedule: "Real-time (on-chain)",
    settlementCurrency: "USDC",
    assignedMerchants: ["MCH001", "MCH002"],
    bspLicense: "N/A (US-regulated, FinCEN MSB)",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Zero platform fee — Circle earns on USDC float. Best uptime of all providers. Direct mint/burn reduces counterparty risk.",
  },
  {
    id: "PRV007",
    name: "Fireblocks",
    shortName: "Fireblocks",
    type: "crypto",
    logo: "FB",
    logoColor: { bg: "bg-orange-500", text: "text-white" },
    status: "active",
    country: "Israel / Global",
    website: "https://fireblocks.com",
    description: "Enterprise crypto custody with MPC (multi-party computation). Secures all hot/warm/cold wallet operations across chains.",
    apiEndpoint: "https://api.fireblocks.io/v1",
    apiVersion: "v1.6",
    environment: "production",
    webhookUrl: "https://api.prediex.ph/webhooks/fireblocks",
    apiKeyMasked: "fb_api_****************************tH3v",
    secretKeyMasked: "fb_cosigner_****************************zQ7w",
    supportedMethods: [
      { methodId: "PM009", methodName: "USDT (Tether)", methodShortName: "USDT", routing: "primary", enabled: true },
      { methodId: "PM011", methodName: "USDT (ERC-20)", methodShortName: "USDT-ETH", routing: "primary", enabled: true },
      { methodId: "PM012", methodName: "USDC (Circle)", methodShortName: "USDC", routing: "primary", enabled: true },
      { methodId: "PM013", methodName: "USDC (Polygon)", methodShortName: "USDC-POL", routing: "primary", enabled: true },
      { methodId: "PM014", methodName: "DAI (MakerDAO)", methodShortName: "DAI", routing: "primary", enabled: true },
      { methodId: "PM015", methodName: "PYUSD (PayPal USD)", methodShortName: "PYUSD", routing: "primary", enabled: false },
    ],
    uptime30d: 99.99,
    avgLatencyMs: 60,
    successRate7d: 100,
    totalTxn30d: 8200,
    totalVolume30d: "USD 2.1M",
    lastPing: "2026-03-16 07:00 PHT",
    lastIncident: "No incidents in last 180 days",
    platformFeePercent: 0.05,
    settlementSchedule: "Real-time (custody layer)",
    settlementCurrency: "Multi-asset",
    assignedMerchants: ["MCH001", "MCH002", "MCH003", "MCH004", "MCH005", "MCH006", "MCH007", "MCH008"],
    bspLicense: "N/A (Infrastructure — not a PSP)",
    pagcorApproved: true,
    amlCompliant: true,
    notes: "Custody-only provider — does NOT process payments directly. All stablecoin methods use Fireblocks for wallet security. MPC eliminates single points of failure.",
  },
  {
    id: "PRV008",
    name: "GrabPay Direct",
    shortName: "GrabPay",
    type: "fiat",
    logo: "GP",
    logoColor: { bg: "bg-green-600", text: "text-white" },
    status: "testing",
    country: "Philippines / SEA",
    website: "https://grab.com/ph",
    description: "Direct GrabPay integration via Grab Financial Group. Eliminates third-party gateway fees for GrabPay transactions.",
    apiEndpoint: "https://partner-gw.grab.com/grabpay/partner/v2",
    apiVersion: "v2.0",
    environment: "sandbox",
    webhookUrl: "https://api-staging.prediex.ph/webhooks/grabpay",
    apiKeyMasked: "grab_partner_****************************bN4r",
    secretKeyMasked: "grab_secret_****************************hY6t",
    supportedMethods: [
      { methodId: "PM007", methodName: "GrabPay", methodShortName: "GrabPay", routing: "primary", enabled: true },
    ],
    uptime30d: 0,
    avgLatencyMs: 0,
    successRate7d: 0,
    totalTxn30d: 0,
    totalVolume30d: "PHP 0",
    lastPing: "2026-03-15 14:00 PHT",
    lastIncident: "N/A — not yet in production",
    platformFeePercent: 1.5,
    settlementSchedule: "T+2 (estimated)",
    settlementCurrency: "PHP",
    assignedMerchants: [],
    bspLicense: "BSP EMI-2019-007 (via Grab)",
    pagcorApproved: false,
    amlCompliant: true,
    notes: "Sandbox testing. Target launch Q2 2026. PAGCOR approval pending.",
  },
  {
    id: "PRV009",
    name: "SeaMoney (ShopeePay)",
    shortName: "SeaMoney",
    type: "fiat",
    logo: "SM",
    logoColor: { bg: "bg-orange-600", text: "text-white" },
    status: "testing",
    country: "Philippines / SEA",
    website: "https://seamoney.com",
    description: "ShopeePay payment processing via SeaMoney. Direct integration bypasses third-party aggregators.",
    apiEndpoint: "https://api.seamoney.com/v1",
    apiVersion: "v1.0",
    environment: "sandbox",
    webhookUrl: "https://api-staging.prediex.ph/webhooks/seamoney",
    apiKeyMasked: "sea_partner_****************************gK2m",
    secretKeyMasked: "sea_secret_****************************fP8n",
    supportedMethods: [
      { methodId: "PM008", methodName: "ShopeePay", methodShortName: "ShopeePay", routing: "primary", enabled: true },
    ],
    uptime30d: 0,
    avgLatencyMs: 0,
    successRate7d: 0,
    totalTxn30d: 0,
    totalVolume30d: "PHP 0",
    lastPing: "2026-03-14 10:00 PHT",
    lastIncident: "N/A — not yet in production",
    platformFeePercent: 1.0,
    settlementSchedule: "T+2 (estimated)",
    settlementCurrency: "PHP",
    assignedMerchants: [],
    bspLicense: "BSP EMI-2020-031 (via SeaMoney)",
    pagcorApproved: false,
    amlCompliant: true,
    notes: "In integration. Pending SeaMoney partner approval and PAGCOR clearance.",
  },
  {
    id: "PRV010",
    name: "Adyen",
    shortName: "Adyen",
    type: "fiat",
    logo: "AY",
    logoColor: { bg: "bg-violet-500", text: "text-white" },
    status: "disabled",
    country: "Netherlands / Global",
    website: "https://adyen.com",
    description: "Global card processor for Visa/Mastercard. Enterprise-grade with 3DS2, tokenization, and network tokens.",
    apiEndpoint: "https://checkout-live.adyen.com/v70",
    apiVersion: "v70",
    environment: "sandbox",
    webhookUrl: "https://api.prediex.ph/webhooks/adyen",
    apiKeyMasked: "AQE****************************+Xjv",
    secretKeyMasked: "adyen_hmac_****************************wR3q",
    supportedMethods: [
      { methodId: "PM010", methodName: "Visa / Mastercard", methodShortName: "Card", routing: "primary", enabled: false },
    ],
    uptime30d: 0,
    avgLatencyMs: 0,
    successRate7d: 0,
    totalTxn30d: 0,
    totalVolume30d: "PHP 0",
    lastPing: "-",
    lastIncident: "N/A — not yet integrated",
    platformFeePercent: 2.5,
    settlementSchedule: "T+3 (international)",
    settlementCurrency: "PHP / USD",
    assignedMerchants: [],
    bspLicense: "N/A (EU-regulated, DNB)",
    pagcorApproved: false,
    amlCompliant: true,
    notes: "Planned for Enterprise merchants only. Integration pending — target H2 2026.",
  },
];

/* ==================== HELPERS ==================== */
function StatusBadge({ status }: { status: ProviderStatus }) {
  const map: Record<ProviderStatus, string> = {
    active: "bg-emerald-50 text-emerald-600",
    degraded: "bg-amber-50 text-amber-600",
    testing: "bg-blue-50 text-blue-600",
    maintenance: "bg-orange-50 text-orange-500",
    disabled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600, ...ss04 }}>
      {status.toUpperCase()}
    </span>
  );
}

function TypeBadge({ type }: { type: ProviderType }) {
  const map: Record<ProviderType, { cls: string; label: string }> = {
    fiat: { cls: "bg-blue-50 text-blue-600", label: "Fiat" },
    crypto: { cls: "bg-teal-50 text-teal-600", label: "Crypto" },
    hybrid: { cls: "bg-purple-50 text-purple-600", label: "Hybrid" },
  };
  const m = map[type];
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${m.cls}`} style={{ fontWeight: 600, ...ss04 }}>
      {m.label}
    </span>
  );
}

function RoutingBadge({ routing }: { routing: RoutingPriority }) {
  const map: Record<RoutingPriority, { cls: string; label: string }> = {
    primary: { cls: "bg-emerald-50 text-emerald-600", label: "PRIMARY" },
    fallback: { cls: "bg-amber-50 text-amber-600", label: "FALLBACK" },
    disabled: { cls: "bg-gray-100 text-gray-400", label: "DISABLED" },
  };
  const m = map[routing];
  return (
    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${m.cls}`} style={{ fontWeight: 600, ...ss04 }}>
      {m.label}
    </span>
  );
}

function InfoPair({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f0f1f3] last:border-0">
      <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{label}</span>
      <span className={`text-[12px] ${accent ? "text-emerald-600" : "text-[#070808]"} ${mono ? "font-mono text-[10px]" : ""}`} style={{ fontWeight: 600, ...ss04 }}>{value}</span>
    </div>
  );
}

function HealthDot({ value, threshold }: { value: number; threshold: [number, number] }) {
  const cls = value >= threshold[0] ? "bg-emerald-400" : value >= threshold[1] ? "bg-amber-400" : "bg-red-400";
  return <div className={`w-1.5 h-1.5 rounded-full ${cls} flex-shrink-0`} />;
}

function SectionCard({ title, subtitle, badge, children, actions }: { title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
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

/* ==================== AVAILABLE METHODS (for method mapping) ==================== */
const AVAILABLE_METHODS: { id: string; name: string; shortName: string; category: string }[] = [
  { id: "PM001", name: "GCash", shortName: "GCash", category: "e_wallet" },
  { id: "PM002", name: "Maya (PayMaya)", shortName: "Maya", category: "e_wallet" },
  { id: "PM003", name: "Bank Transfer (InstaPay)", shortName: "InstaPay", category: "bank_transfer" },
  { id: "PM004", name: "Bank Transfer (PESONet)", shortName: "PESONet", category: "bank_transfer" },
  { id: "PM005", name: "7-Eleven CLiQQ", shortName: "7-Eleven", category: "otc" },
  { id: "PM006", name: "Cebuana Lhuillier", shortName: "Cebuana", category: "otc" },
  { id: "PM007", name: "GrabPay", shortName: "GrabPay", category: "e_wallet" },
  { id: "PM008", name: "ShopeePay", shortName: "ShopeePay", category: "e_wallet" },
  { id: "PM009", name: "USDT (Tether — TRC-20)", shortName: "USDT", category: "stablecoin" },
  { id: "PM010", name: "Visa / Mastercard", shortName: "Card", category: "card" },
  { id: "PM011", name: "USDT (ERC-20)", shortName: "USDT-ETH", category: "stablecoin" },
  { id: "PM012", name: "USDC (Circle — Solana)", shortName: "USDC", category: "stablecoin" },
  { id: "PM013", name: "USDC (Polygon)", shortName: "USDC-POL", category: "stablecoin" },
  { id: "PM014", name: "DAI (MakerDAO)", shortName: "DAI", category: "stablecoin" },
  { id: "PM015", name: "PYUSD (PayPal USD)", shortName: "PYUSD", category: "stablecoin" },
  { id: "PM016", name: "BPI Online", shortName: "BPI", category: "bank_transfer" },
];

const LOGO_COLOR_OPTIONS: { bg: string; text: string; label: string }[] = [
  { bg: "bg-green-500", text: "text-white", label: "Green" },
  { bg: "bg-blue-600", text: "text-white", label: "Blue" },
  { bg: "bg-red-500", text: "text-white", label: "Red" },
  { bg: "bg-yellow-500", text: "text-white", label: "Yellow" },
  { bg: "bg-teal-600", text: "text-white", label: "Teal" },
  { bg: "bg-violet-500", text: "text-white", label: "Violet" },
  { bg: "bg-orange-500", text: "text-white", label: "Orange" },
  { bg: "bg-pink-500", text: "text-white", label: "Pink" },
  { bg: "bg-indigo-500", text: "text-white", label: "Indigo" },
  { bg: "bg-cyan-500", text: "text-white", label: "Cyan" },
];

type WizardStep = 1 | 2 | 3 | 4 | 5;
const WIZARD_STEPS: { step: WizardStep; label: string; desc: string }[] = [
  { step: 1, label: "Basic Info", desc: "Provider identity" },
  { step: 2, label: "API Config", desc: "Integration setup" },
  { step: 3, label: "Methods", desc: "Payment mapping" },
  { step: 4, label: "Compliance", desc: "Licensing & fees" },
  { step: 5, label: "Review", desc: "Confirm & submit" },
];

interface WizardFormData {
  name: string;
  shortName: string;
  type: ProviderType;
  country: string;
  website: string;
  description: string;
  logo: string;
  logoColorIdx: number;
  apiEndpoint: string;
  apiVersion: string;
  environment: "production" | "sandbox";
  webhookUrl: string;
  apiKey: string;
  secretKey: string;
  methods: { methodId: string; routing: RoutingPriority; enabled: boolean }[];
  bspLicense: string;
  pagcorApproved: boolean;
  amlCompliant: boolean;
  platformFeePercent: string;
  settlementSchedule: string;
  settlementCurrency: string;
  notes: string;
}

const EMPTY_FORM: WizardFormData = {
  name: "", shortName: "", type: "fiat", country: "Philippines", website: "", description: "", logo: "", logoColorIdx: 0,
  apiEndpoint: "", apiVersion: "v1.0", environment: "sandbox", webhookUrl: "", apiKey: "", secretKey: "",
  methods: [],
  bspLicense: "", pagcorApproved: false, amlCompliant: false, platformFeePercent: "", settlementSchedule: "T+1", settlementCurrency: "PHP", notes: "",
};

function WizardInput({ label, value, onChange, placeholder, required, mono, type = "text", disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; mono?: boolean; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[#84888c] text-[11px] mb-1 block" style={{ fontWeight: 500, ...ss04 }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-9 px-3 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] outline-none placeholder:text-[#b0b3b8] focus:border-[#8b5cf6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mono ? "font-mono text-[11px]" : ""}`}
        style={{ ...pp, ...ss04 }}
      />
    </div>
  );
}

function WizardTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="text-[#84888c] text-[11px] mb-1 block" style={{ fontWeight: 500, ...ss04 }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] outline-none placeholder:text-[#b0b3b8] focus:border-[#8b5cf6] transition-colors resize-none"
        style={{ ...pp, ...ss04 }}
      />
    </div>
  );
}

function WizardSelect({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="text-[#84888c] text-[11px] mb-1 block" style={{ fontWeight: 500, ...ss04 }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 pr-8 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] outline-none cursor-pointer focus:border-[#8b5cf6] transition-colors"
        style={{ ...pp, ...ss04 }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function WizardCheckbox({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer py-1.5 group">
      <div
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${checked ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#d0d1d3] group-hover:border-[#8b5cf6]"}`}
      >
        {checked && (
          <svg className="size-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6l2.5 2.5 4.5-5" /></svg>
        )}
      </div>
      <div>
        <span className="text-[#070808] text-[12px] block" style={{ fontWeight: 500, ...ss04 }}>{label}</span>
        {description && <span className="text-[#84888c] text-[10px]" style={ss04}>{description}</span>}
      </div>
    </label>
  );
}

/* ==================== MAIN COMPONENT ==================== */
export default function PaymentProvidersMgmt() {
  const { admin, merchants } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const { t } = useI18n();
  const role = admin?.role || "";

  const [providers, setProviders] = useState<PaymentProvider[]>(MOCK_PROVIDERS);
  const [tab, setTab] = useState<"providers" | "routing" | "health" | "matrix">("providers");
  const [typeFilter, setTypeFilter] = useState<"all" | ProviderType>("all");
  const [detailTarget, setDetailTarget] = useState<PaymentProvider | null>(null);
  const [routingTarget, setRoutingTarget] = useState<PaymentProvider | null>(null);

  /* --- Add Provider Wizard state --- */
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [wizardForm, setWizardForm] = useState<WizardFormData>({ ...EMPTY_FORM });
  const [wizardErrors, setWizardErrors] = useState<string[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<"idle" | "success" | "failed">("idle");

  const updateForm = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setWizardForm(prev => ({ ...prev, [key]: value }));
  };

  const openWizard = () => {
    setWizardForm({ ...EMPTY_FORM });
    setWizardStep(1);
    setWizardErrors([]);
    setConnectionResult("idle");
    setWizardOpen(true);
  };

  const validateStep = (step: WizardStep): string[] => {
    const errs: string[] = [];
    if (step === 1) {
      if (!wizardForm.name.trim()) errs.push("Provider name is required");
      if (!wizardForm.shortName.trim()) errs.push("Short name is required");
      if (!wizardForm.logo.trim()) errs.push("Logo initials are required (1-3 chars)");
      if (wizardForm.logo.length > 3) errs.push("Logo initials must be 1-3 characters");
      if (!wizardForm.website.trim()) errs.push("Website URL is required");
      if (providers.some(p => p.name.toLowerCase() === wizardForm.name.trim().toLowerCase())) errs.push("A provider with this name already exists");
    }
    if (step === 2) {
      if (!wizardForm.apiEndpoint.trim()) errs.push("API endpoint is required");
      if (!wizardForm.apiKey.trim()) errs.push("API key is required");
      if (!wizardForm.secretKey.trim()) errs.push("Secret key is required");
    }
    if (step === 3) {
      if (wizardForm.methods.filter(m => m.enabled).length === 0) errs.push("At least one payment method must be enabled");
    }
    if (step === 4) {
      if (!wizardForm.platformFeePercent.trim()) errs.push("Platform fee is required");
      if (isNaN(Number(wizardForm.platformFeePercent))) errs.push("Platform fee must be a valid number");
    }
    return errs;
  };

  const goNext = () => {
    const errs = validateStep(wizardStep);
    setWizardErrors(errs);
    if (errs.length > 0) return;
    if (wizardStep < 5) setWizardStep((wizardStep + 1) as WizardStep);
  };

  const goBack = () => {
    if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep);
  };

  const testConnection = () => {
    setTestingConnection(true);
    setConnectionResult("idle");
    // Simulate API connection test
    setTimeout(() => {
      setTestingConnection(false);
      const success = Math.random() > 0.15; // 85% success rate
      setConnectionResult(success ? "success" : "failed");
      if (success) {
        showOmsToast("Connection successful — API responded with 200 OK", "success");
      } else {
        showOmsToast("Connection failed — check endpoint and credentials", "error");
      }
    }, 1800);
  };

  const toggleMethod = (methodId: string) => {
    setWizardForm(prev => {
      const existing = prev.methods.find(m => m.methodId === methodId);
      if (existing) {
        return { ...prev, methods: prev.methods.map(m => m.methodId === methodId ? { ...m, enabled: !m.enabled } : m) };
      } else {
        return { ...prev, methods: [...prev.methods, { methodId, routing: "fallback" as RoutingPriority, enabled: true }] };
      }
    });
  };

  const setMethodRouting = (methodId: string, routing: RoutingPriority) => {
    setWizardForm(prev => ({
      ...prev,
      methods: prev.methods.map(m => m.methodId === methodId ? { ...m, routing } : m),
    }));
  };

  const submitProvider = () => {
    const errs = validateStep(4);
    if (errs.length > 0) { setWizardErrors(errs); return; }

    const col = LOGO_COLOR_OPTIONS[wizardForm.logoColorIdx];
    const maskKey = (k: string) => k.length > 8 ? k.slice(0, 4) + "****************************" + k.slice(-4) : "****";

    const newProvider: PaymentProvider = {
      id: `PRV${String(providers.length + 1).padStart(3, "0")}`,
      name: wizardForm.name.trim(),
      shortName: wizardForm.shortName.trim(),
      type: wizardForm.type,
      logo: wizardForm.logo.trim().toUpperCase(),
      logoColor: { bg: col.bg, text: col.text },
      status: "testing",
      country: wizardForm.country.trim() || "Philippines",
      website: wizardForm.website.trim(),
      description: wizardForm.description.trim() || `${wizardForm.name.trim()} payment provider integration.`,
      apiEndpoint: wizardForm.apiEndpoint.trim(),
      apiVersion: wizardForm.apiVersion.trim(),
      environment: wizardForm.environment,
      webhookUrl: wizardForm.webhookUrl.trim() || `https://api-staging.prediex.ph/webhooks/${wizardForm.shortName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      apiKeyMasked: maskKey(wizardForm.apiKey),
      secretKeyMasked: maskKey(wizardForm.secretKey),
      supportedMethods: wizardForm.methods.filter(m => m.enabled).map(m => {
        const meta = AVAILABLE_METHODS.find(am => am.id === m.methodId)!;
        return { methodId: m.methodId, methodName: meta.name, methodShortName: meta.shortName, routing: m.routing, enabled: true };
      }),
      uptime30d: 0,
      avgLatencyMs: 0,
      successRate7d: 0,
      totalTxn30d: 0,
      totalVolume30d: `${wizardForm.settlementCurrency} 0`,
      lastPing: "N/A — not yet monitored",
      lastIncident: "N/A — newly onboarded",
      platformFeePercent: Number(wizardForm.platformFeePercent),
      settlementSchedule: wizardForm.settlementSchedule,
      settlementCurrency: wizardForm.settlementCurrency,
      assignedMerchants: [],
      bspLicense: wizardForm.bspLicense.trim() || "Pending",
      pagcorApproved: wizardForm.pagcorApproved,
      amlCompliant: wizardForm.amlCompliant,
      notes: wizardForm.notes.trim(),
    };

    setProviders(prev => [...prev, newProvider]);
    setWizardOpen(false);
    showOmsToast(`${newProvider.name} added successfully in TESTING mode`, "success");
    doAudit("provider_create", newProvider.id, `Created new provider: ${newProvider.name} (${newProvider.type}, ${newProvider.supportedMethods.length} methods, env: ${newProvider.environment})`);
  };

  const doAudit = (action: string, target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: role, action, target, detail });
  };

  const filtered = typeFilter === "all" ? providers : providers.filter(p => p.type === typeFilter);
  const activeProviders = providers.filter(p => p.status === "active");
  const fiatProviders = providers.filter(p => p.type === "fiat");
  const cryptoProviders = providers.filter(p => p.type === "crypto" || p.type === "hybrid");

  // Build method→provider routing matrix
  const methodProviderMap: Record<string, { methodName: string; methodShort: string; providers: { provider: PaymentProvider; link: ProviderMethodLink }[] }> = {};
  providers.forEach(prov => {
    prov.supportedMethods.forEach(link => {
      if (!methodProviderMap[link.methodId]) {
        methodProviderMap[link.methodId] = { methodName: link.methodName, methodShort: link.methodShortName, providers: [] };
      }
      methodProviderMap[link.methodId].providers.push({ provider: prov, link });
    });
  });

  /* --- Access guard --- */
  if (!isPlat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={pp}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="size-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v.01M12 12V8m0 12a9 9 0 110-18 9 9 0 010 18z" strokeLinecap="round" /></svg>
          </div>
          <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 600, ...ss04 }}>Access Restricted</h3>
          <p className="text-[#b0b3b8] text-[12px]" style={ss04}>Payment Providers Management is only available to PrediEx Platform Admins & Ops.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={pp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-[9px] tracking-[0.1em] text-[#8b5cf6]" style={{ fontWeight: 700, ...ss04 }}>PLATFORM ADMIN</span>
          </div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>Payment Providers Management</h2>
          <p className="text-[#b0b3b8] text-[12px] mt-0.5" style={ss04}>
            Configure provider integrations, manage API credentials, set routing rules & failover policies
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { showOmsToast("Provider health check triggered for all active providers", "success"); doAudit("health_check", "payment-providers", "Triggered manual health check for all providers"); }}
            className="h-9 px-5 bg-[#f5f6f8] text-[#070808] text-[12px] rounded-xl cursor-pointer hover:bg-[#e5e7eb] transition-colors"
            style={{ fontWeight: 600, ...ss04 }}
          >
            Run Health Check
          </button>
          <button
            onClick={openWizard}
            className="h-9 px-5 bg-[#8b5cf6] text-white text-[12px] rounded-xl cursor-pointer hover:bg-[#7c3aed] transition-colors flex items-center gap-1.5"
            style={{ fontWeight: 600, ...ss04 }}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            Add Provider
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Providers", value: providers.length.toString(), color: "text-[#070808]" },
          { label: "Active", value: activeProviders.length.toString(), color: "text-emerald-600" },
          { label: "Fiat Providers", value: fiatProviders.length.toString(), color: "text-blue-600" },
          { label: "Crypto / Hybrid", value: cryptoProviders.length.toString(), color: "text-teal-600" },
          { label: "Avg Uptime", value: activeProviders.length > 0 ? `${(activeProviders.reduce((a, p) => a + p.uptime30d, 0) / activeProviders.length).toFixed(2)}%` : "-", color: "text-emerald-600" },
          { label: "Avg Success Rate", value: activeProviders.filter(p => p.successRate7d > 0).length > 0 ? `${(activeProviders.filter(p => p.successRate7d > 0).reduce((a, p) => a + p.successRate7d, 0) / activeProviders.filter(p => p.successRate7d > 0).length).toFixed(1)}%` : "-", color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-xl p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className={`text-[22px] mt-0.5 ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e5e7eb] rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: "providers" as const, label: "Providers", icon: "S" },
          { key: "routing" as const, label: "Routing Matrix", icon: "R" },
          { key: "health" as const, label: "Health Monitor", icon: "H" },
          { key: "matrix" as const, label: "Method Coverage", icon: "M" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${tab === t.key ? "bg-[#8b5cf6] text-white" : "text-[#84888c] hover:bg-[#f5f6f8] hover:text-[#070808]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== TAB: PROVIDERS ========== */}
      {tab === "providers" && (
        <div className="space-y-4">
          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#84888c] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>TYPE:</span>
            {([
              { key: "all" as const, label: "All" },
              { key: "fiat" as const, label: "Fiat" },
              { key: "crypto" as const, label: "Crypto" },
              { key: "hybrid" as const, label: "Hybrid" },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${typeFilter === f.key ? "bg-[#070808] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:text-[#070808]"}`}
                style={{ fontWeight: 500, ...ss04 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map(p => {
              const enabledMethods = p.supportedMethods.filter(m => m.enabled);
              const primaryMethods = p.supportedMethods.filter(m => m.routing === "primary");
              return (
                <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden transition-colors ${p.status === "active" ? "border-[#e5e7eb]" : p.status === "testing" ? "border-blue-200" : "border-[#e5e7eb] opacity-60"}`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${p.logoColor.bg} rounded-xl flex items-center justify-center ${p.logoColor.text} text-[12px] flex-shrink-0`} style={{ fontWeight: 700, ...ss04 }}>
                          {p.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{p.name}</span>
                            <StatusBadge status={p.status} />
                            <TypeBadge type={p.type} />
                          </div>
                          <p className="text-[#84888c] text-[10px] mt-0.5" style={ss04}>{p.country} · API {p.apiVersion} · <span className={p.environment === "production" ? "text-emerald-600" : "text-blue-600"} style={{ fontWeight: 600 }}>{p.environment.toUpperCase()}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#84888c] text-[11px] mb-3 leading-relaxed" style={ss04}>{p.description}</p>

                    {/* Supported Methods */}
                    <div className="mb-3">
                      <p className="text-[#84888c] text-[9px] mb-1.5" style={{ fontWeight: 600, ...ss04 }}>SUPPORTED METHODS ({enabledMethods.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.supportedMethods.map(m => (
                          <div key={m.methodId} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${m.enabled ? "bg-[#f5f6f8]" : "bg-gray-50 opacity-50"}`}>
                            <span className="text-[10px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{m.methodShortName}</span>
                            <RoutingBadge routing={m.routing} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Health & Volume (for active providers) */}
                    {p.status === "active" && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-[#f9fafb] rounded-lg p-2">
                          <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Uptime 30d</p>
                          <div className="flex items-center gap-1.5">
                            <HealthDot value={p.uptime30d} threshold={[99.9, 99.0]} />
                            <p className={`text-[12px] ${p.uptime30d >= 99.9 ? "text-emerald-600" : p.uptime30d >= 99 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>{p.uptime30d}%</p>
                          </div>
                        </div>
                        <div className="bg-[#f9fafb] rounded-lg p-2">
                          <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Avg Latency</p>
                          <p className={`text-[12px] ${p.avgLatencyMs <= 200 ? "text-emerald-600" : p.avgLatencyMs <= 400 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>{p.avgLatencyMs}ms</p>
                        </div>
                        <div className="bg-[#f9fafb] rounded-lg p-2">
                          <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Success 7d</p>
                          <div className="flex items-center gap-1.5">
                            <HealthDot value={p.successRate7d} threshold={[99.0, 97.0]} />
                            <p className={`text-[12px] ${p.successRate7d >= 99 ? "text-emerald-600" : p.successRate7d >= 97 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>{p.successRate7d}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Volume & merchants */}
                    <div className="flex items-center gap-3 text-[10px] text-[#84888c] mb-3" style={ss04}>
                      <span>Vol: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{p.totalVolume30d}</span></span>
                      <span>·</span>
                      <span>Txns: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{p.totalTxn30d.toLocaleString()}</span></span>
                      <span>·</span>
                      <span>Merchants: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{p.assignedMerchants.length}</span></span>
                      <span>·</span>
                      <span>Fee: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{p.platformFeePercent}%</span></span>
                    </div>

                    {/* Compliance badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {p.pagcorApproved && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>PAGCOR APPROVED</span>
                      )}
                      {!p.pagcorApproved && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>PAGCOR PENDING</span>
                      )}
                      {p.amlCompliant && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>AML COMPLIANT</span>
                      )}
                      {p.bspLicense && p.bspLicense !== "N/A (Infrastructure — not a PSP)" && p.bspLicense.startsWith("BSP") && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600" style={{ fontWeight: 600, ...ss04 }}>BSP LICENSED</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setDetailTarget(p)}
                        className="h-7 px-3 bg-[#f5f6f8] text-[#070808] text-[10px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                        style={{ fontWeight: 600, ...ss04 }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setRoutingTarget(p)}
                        className="h-7 px-3 bg-[#f5f6f8] text-[#070808] text-[10px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                        style={{ fontWeight: 600, ...ss04 }}
                      >
                        Routing Config
                      </button>
                      {p.status === "testing" && (
                        <button
                          onClick={() => { showOmsToast(`${p.name} promoted to ACTIVE`, "success"); doAudit("provider_activate", p.id, `Activated provider ${p.name}`); }}
                          className="h-7 px-3 bg-emerald-50 text-emerald-600 text-[10px] rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
                          style={{ fontWeight: 600, ...ss04 }}
                        >
                          Activate
                        </button>
                      )}
                      {p.status === "active" && (
                        <button
                          onClick={() => { showOmsToast(`${p.name} set to MAINTENANCE`, "error"); doAudit("provider_maintenance", p.id, `Set ${p.name} to maintenance mode`); }}
                          className="h-7 px-3 bg-orange-50 text-orange-500 text-[10px] rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                          style={{ fontWeight: 600, ...ss04 }}
                        >
                          Maintenance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== TAB: ROUTING MATRIX ========== */}
      {tab === "routing" && (
        <div className="space-y-4">
          <SectionCard
            title="Payment Method Routing Rules"
            subtitle="Shows which provider handles each payment method as Primary vs Fallback. Routing is automatic — if Primary fails, Fallback takes over."
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    <th className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>Payment Method</th>
                    <th className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>Primary Provider</th>
                    <th className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>Fallback Provider(s)</th>
                    <th className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>Total Providers</th>
                    <th className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>Redundancy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(methodProviderMap).sort((a, b) => a[1].methodName.localeCompare(b[1].methodName)).map(([methodId, data]) => {
                    const primaries = data.providers.filter(p => p.link.routing === "primary" && p.link.enabled);
                    const fallbacks = data.providers.filter(p => p.link.routing === "fallback" && p.link.enabled);
                    const total = data.providers.filter(p => p.link.enabled).length;
                    const hasRedundancy = total >= 2;
                    return (
                      <tr key={methodId} className="border-b border-[#f5f6f7] hover:bg-[#fafafa] transition-colors">
                        <td className="px-3 py-3">
                          <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{data.methodShort}</span>
                          <span className="text-[#84888c] text-[10px] block" style={ss04}>{data.methodName}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {primaries.length > 0 ? primaries.map(p => (
                              <div key={p.provider.id} className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 ${p.provider.logoColor.bg} rounded flex items-center justify-center ${p.provider.logoColor.text} text-[7px] flex-shrink-0`} style={{ fontWeight: 700 }}>{p.provider.logo}</div>
                                <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{p.provider.shortName}</span>
                              </div>
                            )) : (
                              <span className="text-[10px] text-red-400" style={{ fontWeight: 500 }}>No primary set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {fallbacks.length > 0 ? fallbacks.map(p => (
                              <div key={p.provider.id} className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 ${p.provider.logoColor.bg} rounded flex items-center justify-center ${p.provider.logoColor.text} text-[7px] flex-shrink-0`} style={{ fontWeight: 700 }}>{p.provider.logo}</div>
                                <span className="text-[11px] text-[#84888c]" style={{ fontWeight: 500, ...ss04 }}>{p.provider.shortName}</span>
                              </div>
                            )) : (
                              <span className="text-[10px] text-amber-500" style={{ fontWeight: 500 }}>No fallback</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 700, ...ss04 }}>{total}</span>
                        </td>
                        <td className="px-3 py-3">
                          {hasRedundancy ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>REDUNDANT</span>
                          ) : total > 0 ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>SINGLE</span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-500" style={{ fontWeight: 600, ...ss04 }}>NO PROVIDER</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Failover policy */}
          <SectionCard title="Failover Policy" subtitle="Automatic failover configuration applied across all payment methods.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-0">
                <InfoPair label="Failover Trigger" value="3 consecutive failures in 5 min" />
                <InfoPair label="Health Check Interval" value="Every 30 seconds" />
                <InfoPair label="Recovery Grace Period" value="5 minutes after last failure" />
                <InfoPair label="Max Retry Attempts" value="2 (before failover)" />
                <InfoPair label="Circuit Breaker" value="Open after 5 failures / min" accent />
              </div>
              <div className="space-y-0">
                <InfoPair label="Failover Notification" value="Slack + Email + OMS Alert" />
                <InfoPair label="Auto-Recovery" value="Enabled (checks every 60s)" />
                <InfoPair label="Manual Override" value="Available via OMS" />
                <InfoPair label="Sticky Sessions" value="Per-user (5 min TTL)" />
                <InfoPair label="Load Balancing" value="Weighted round-robin (primary 80/20)" />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========== TAB: HEALTH MONITOR ========== */}
      {tab === "health" && (
        <div className="space-y-4">
          {/* Health overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProviders.map(p => (
              <div key={p.id} className="bg-white border border-[#e5e7eb] rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${p.logoColor.bg} rounded-xl flex items-center justify-center ${p.logoColor.text} text-[11px] flex-shrink-0`} style={{ fontWeight: 700, ...ss04 }}>
                    {p.logo}
                  </div>
                  <div>
                    <span className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{p.shortName}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={p.status} />
                      <TypeBadge type={p.type} />
                    </div>
                  </div>
                </div>

                {/* Health bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Uptime (30d)</span>
                      <span className={`text-[11px] ${p.uptime30d >= 99.9 ? "text-emerald-600" : "text-amber-600"}`} style={{ fontWeight: 700, ...ss04 }}>{p.uptime30d}%</span>
                    </div>
                    <div className="h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.uptime30d >= 99.9 ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${Math.min(p.uptime30d, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Success Rate (7d)</span>
                      <span className={`text-[11px] ${p.successRate7d >= 99 ? "text-emerald-600" : p.successRate7d >= 97 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>{p.successRate7d}%</span>
                    </div>
                    <div className="h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.successRate7d >= 99 ? "bg-emerald-400" : p.successRate7d >= 97 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(p.successRate7d, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Avg Latency</span>
                      <span className={`text-[11px] ${p.avgLatencyMs <= 200 ? "text-emerald-600" : p.avgLatencyMs <= 400 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>{p.avgLatencyMs}ms</span>
                    </div>
                    <div className="h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.avgLatencyMs <= 200 ? "bg-emerald-400" : p.avgLatencyMs <= 400 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.max(100 - (p.avgLatencyMs / 5), 10)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#f0f1f3]">
                  <div className="flex items-center justify-between text-[10px] text-[#84888c]" style={ss04}>
                    <span>Volume: <span className="text-[#070808]" style={{ fontWeight: 600 }}>{p.totalVolume30d}</span></span>
                    <span>{p.totalTxn30d.toLocaleString()} txns</span>
                  </div>
                  <p className="text-[9px] text-[#b0b3b8] mt-1" style={ss04}>Last ping: {p.lastPing}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent incidents */}
          <SectionCard title="Recent Incidents" subtitle="Last known incidents across all providers">
            <div className="space-y-2">
              {providers.filter(p => p.lastIncident && !p.lastIncident.startsWith("N/A") && !p.lastIncident.startsWith("No incidents")).map(p => (
                <div key={p.id} className="flex items-start gap-3 py-2.5 border-b border-[#f0f1f3] last:border-0">
                  <div className={`w-7 h-7 ${p.logoColor.bg} rounded-lg flex items-center justify-center ${p.logoColor.text} text-[9px] flex-shrink-0 mt-0.5`} style={{ fontWeight: 700 }}>
                    {p.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{p.shortName}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-[#84888c] text-[11px]" style={ss04}>{p.lastIncident}</p>
                  </div>
                </div>
              ))}
              {providers.filter(p => p.lastIncident && (p.lastIncident.startsWith("No incidents"))).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[#f0f1f3] last:border-0">
                  <div className={`w-7 h-7 ${p.logoColor.bg} rounded-lg flex items-center justify-center ${p.logoColor.text} text-[9px] flex-shrink-0`} style={{ fontWeight: 700 }}>
                    {p.logo}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{p.shortName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>CLEAN</span>
                    <span className="text-[#84888c] text-[10px]" style={ss04}>{p.lastIncident}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========== TAB: METHOD COVERAGE MATRIX ========== */}
      {tab === "matrix" && (
        <div className="space-y-4">
          <SectionCard
            title="Provider × Method Coverage Matrix"
            subtitle="Complete view of which providers support which payment methods, with routing designation."
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    <th className="text-[#84888c] text-[10px] px-2 py-2.5 text-left sticky left-0 bg-white z-10" style={{ fontWeight: 600, ...ss04, minWidth: 120 }}>Provider</th>
                    {Object.entries(methodProviderMap).sort((a, b) => a[1].methodShort.localeCompare(b[1].methodShort)).map(([id, data]) => (
                      <th key={id} className="text-[#84888c] text-[9px] px-2 py-2.5 text-center" style={{ fontWeight: 600, ...ss04, minWidth: 70 }}>
                        <span className="block">{data.methodShort}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map(prov => {
                    const methodMap: Record<string, ProviderMethodLink> = {};
                    prov.supportedMethods.forEach(m => { methodMap[m.methodId] = m; });
                    return (
                      <tr key={prov.id} className="border-b border-[#f5f6f7] hover:bg-[#fafafa] transition-colors">
                        <td className="px-2 py-2.5 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 ${prov.logoColor.bg} rounded flex items-center justify-center ${prov.logoColor.text} text-[8px] flex-shrink-0`} style={{ fontWeight: 700 }}>
                              {prov.logo}
                            </div>
                            <div>
                              <span className="text-[11px] text-[#070808] block" style={{ fontWeight: 600, ...ss04 }}>{prov.shortName}</span>
                              <StatusBadge status={prov.status} />
                            </div>
                          </div>
                        </td>
                        {Object.keys(methodProviderMap).sort((a, b) => methodProviderMap[a].methodShort.localeCompare(methodProviderMap[b].methodShort)).map(methodId => {
                          const link = methodMap[methodId];
                          if (!link) {
                            return (
                              <td key={methodId} className="px-2 py-2.5 text-center">
                                <span className="text-[#e5e7eb] text-[11px]">—</span>
                              </td>
                            );
                          }
                          return (
                            <td key={methodId} className="px-2 py-2.5 text-center">
                              {link.enabled ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${link.routing === "primary" ? "bg-emerald-100" : "bg-amber-100"}`}>
                                    <span className={`text-[8px] ${link.routing === "primary" ? "text-emerald-600" : "text-amber-600"}`} style={{ fontWeight: 700 }}>
                                      {link.routing === "primary" ? "P" : "F"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center mx-auto">
                                  <span className="text-[8px] text-gray-300" style={{ fontWeight: 700 }}>X</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f0f1f3]">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center"><span className="text-[7px] text-emerald-600" style={{ fontWeight: 700 }}>P</span></div>
                <span className="text-[10px] text-[#84888c]" style={ss04}>Primary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-amber-100 flex items-center justify-center"><span className="text-[7px] text-amber-600" style={{ fontWeight: 700 }}>F</span></div>
                <span className="text-[10px] text-[#84888c]" style={ss04}>Fallback</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-50 flex items-center justify-center"><span className="text-[7px] text-gray-300" style={{ fontWeight: 700 }}>X</span></div>
                <span className="text-[10px] text-[#84888c]" style={ss04}>Supported but disabled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#e5e7eb]">—</span>
                <span className="text-[10px] text-[#84888c]" style={ss04}>Not supported</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      <OmsModal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={detailTarget?.name || ""} subtitle="Provider Integration Details" width="max-w-[660px]">
        {detailTarget && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${detailTarget.logoColor.bg} rounded-xl flex items-center justify-center ${detailTarget.logoColor.text} text-[16px]`} style={{ fontWeight: 700 }}>{detailTarget.logo}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04 }}>{detailTarget.name}</span>
                  <StatusBadge status={detailTarget.status} />
                  <TypeBadge type={detailTarget.type} />
                </div>
                <p className="text-[#84888c] text-[11px]" style={ss04}>{detailTarget.country} · {detailTarget.website}</p>
              </div>
            </div>

            <p className="text-[#84888c] text-[11px] leading-relaxed" style={ss04}>{detailTarget.description}</p>

            {/* API Configuration */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>API Configuration</h4>
              <div className="p-3 bg-[#f9fafb] rounded-xl space-y-0">
                <InfoPair label="Endpoint" value={detailTarget.apiEndpoint} mono />
                <InfoPair label="API Version" value={detailTarget.apiVersion} />
                <InfoPair label="Environment" value={detailTarget.environment.toUpperCase()} accent={detailTarget.environment === "production"} />
                <InfoPair label="Webhook URL" value={detailTarget.webhookUrl} mono />
                <InfoPair label="API Key" value={detailTarget.apiKeyMasked} mono />
                <InfoPair label="Secret Key" value={detailTarget.secretKeyMasked} mono />
              </div>
            </div>

            {/* Supported Methods */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Supported Methods ({detailTarget.supportedMethods.length})</h4>
              <div className="space-y-1.5">
                {detailTarget.supportedMethods.map(m => (
                  <div key={m.methodId} className="flex items-center justify-between py-2 px-3 bg-[#f9fafb] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{m.methodName}</span>
                      <RoutingBadge routing={m.routing} />
                    </div>
                    <span className={`text-[10px] ${m.enabled ? "text-emerald-600" : "text-gray-400"}`} style={{ fontWeight: 600 }}>
                      {m.enabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health & Performance */}
            {detailTarget.status === "active" && (
              <div>
                <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Health & Performance</h4>
                <InfoPair label="Uptime (30d)" value={`${detailTarget.uptime30d}%`} accent={detailTarget.uptime30d >= 99.9} />
                <InfoPair label="Avg Latency" value={`${detailTarget.avgLatencyMs}ms`} accent={detailTarget.avgLatencyMs <= 200} />
                <InfoPair label="Success Rate (7d)" value={`${detailTarget.successRate7d}%`} accent={detailTarget.successRate7d >= 99} />
                <InfoPair label="Txn Count (30d)" value={detailTarget.totalTxn30d.toLocaleString()} />
                <InfoPair label="Volume (30d)" value={detailTarget.totalVolume30d} />
                <InfoPair label="Last Ping" value={detailTarget.lastPing} />
              </div>
            )}

            {/* Fees & Settlement */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Fees & Settlement</h4>
              <InfoPair label="Platform Fee" value={`${detailTarget.platformFeePercent}%`} accent={detailTarget.platformFeePercent === 0} />
              <InfoPair label="Settlement Schedule" value={detailTarget.settlementSchedule} />
              <InfoPair label="Settlement Currency" value={detailTarget.settlementCurrency} />
            </div>

            {/* Compliance */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Compliance & Licensing</h4>
              <InfoPair label="BSP License" value={detailTarget.bspLicense} />
              <InfoPair label="PAGCOR Approved" value={detailTarget.pagcorApproved ? "Yes" : "Pending"} accent={detailTarget.pagcorApproved} />
              <InfoPair label="AML Compliant" value={detailTarget.amlCompliant ? "Yes" : "No"} accent={detailTarget.amlCompliant} />
            </div>

            {/* Merchant Assignments */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Assigned Merchants ({detailTarget.assignedMerchants.length})</h4>
              {detailTarget.assignedMerchants.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {detailTarget.assignedMerchants.map(mId => {
                    const merchant = merchants.find(m => m.id === mId);
                    return (
                      <span key={mId} className="text-[10px] px-2 py-1 rounded-lg bg-[#f5f6f8] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>
                        {merchant ? `${merchant.logo} ${merchant.name}` : mId}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[#84888c] text-[11px]" style={ss04}>No merchants assigned yet</p>
              )}
            </div>

            {/* Last Incident */}
            <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
              <p className="text-[#84888c] text-[10px] mb-0.5" style={{ fontWeight: 600, ...ss04 }}>Last Incident</p>
              <p className="text-amber-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{detailTarget.lastIncident}</p>
            </div>

            {/* Notes */}
            {detailTarget.notes && (
              <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                <p className="text-blue-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  <span style={{ fontWeight: 700 }}>Note:</span> {detailTarget.notes}
                </p>
              </div>
            )}

            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setDetailTarget(null)}>Close</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* ========== ROUTING CONFIG MODAL ========== */}
      <OmsModal open={!!routingTarget} onClose={() => setRoutingTarget(null)} title={`Routing Config — ${routingTarget?.name || ""}`} subtitle="Configure routing priority for each payment method" width="max-w-[560px]">
        {routingTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-xl">
              <div className={`w-10 h-10 ${routingTarget.logoColor.bg} rounded-xl flex items-center justify-center ${routingTarget.logoColor.text} text-[13px] flex-shrink-0`} style={{ fontWeight: 700 }}>{routingTarget.logo}</div>
              <div>
                <span className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{routingTarget.name}</span>
                <p className="text-[#84888c] text-[10px]" style={ss04}>{routingTarget.supportedMethods.length} supported methods · {routingTarget.environment}</p>
              </div>
            </div>

            {routingTarget.supportedMethods.map(m => {
              // Find other providers for same method
              const others = methodProviderMap[m.methodId]?.providers.filter(p => p.provider.id !== routingTarget.id && p.link.enabled) || [];
              return (
                <div key={m.methodId} className="p-3 bg-[#f9fafb] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{m.methodName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RoutingBadge routing={m.routing} />
                        <span className={`text-[9px] ${m.enabled ? "text-emerald-500" : "text-gray-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                          {m.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </div>
                    </div>
                    <select
                      value={m.routing}
                      onChange={() => { showOmsToast(`Routing updated for ${m.methodShortName}`, "success"); doAudit("routing_update", routingTarget.id, `Changed ${m.methodShortName} routing to ${m.routing} on ${routingTarget.name}`); }}
                      className="h-7 px-2 pr-6 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[11px] outline-none cursor-pointer focus:border-[#8b5cf6] transition-colors"
                      style={{ ...pp, ...ss04 }}
                    >
                      <option value="primary">Primary</option>
                      <option value="fallback">Fallback</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  {others.length > 0 && (
                    <div className="text-[9px] text-[#84888c]" style={ss04}>
                      Also available via: {others.map(o => `${o.provider.shortName} (${o.link.routing})`).join(", ")}
                    </div>
                  )}
                </div>
              );
            })}

            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setRoutingTarget(null)}>Done</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* ========== ADD PROVIDER WIZARD MODAL ========== */}
      <OmsModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Add New Payment Provider"
        subtitle={`Step ${wizardStep} of 5 — ${WIZARD_STEPS[wizardStep - 1].label}`}
        width="max-w-[720px]"
      >
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {WIZARD_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1 flex-1">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] transition-colors ${
                      wizardStep === s.step ? "bg-[#8b5cf6] text-white" :
                      wizardStep > s.step ? "bg-emerald-100 text-emerald-600" :
                      "bg-[#f5f6f8] text-[#b0b3b8]"
                    }`}
                    style={{ fontWeight: 700, ...ss04 }}
                  >
                    {wizardStep > s.step ? (
                      <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8l3.5 3.5L13 5" /></svg>
                    ) : s.step}
                  </div>
                  <div className="text-center">
                    <p className={`text-[9px] ${wizardStep >= s.step ? "text-[#070808]" : "text-[#b0b3b8]"}`} style={{ fontWeight: 600, ...ss04 }}>{s.label}</p>
                    <p className="text-[8px] text-[#b0b3b8] hidden sm:block" style={ss04}>{s.desc}</p>
                  </div>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 rounded-full mt-[-18px] ${wizardStep > s.step ? "bg-emerald-300" : "bg-[#e5e7eb]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Validation errors */}
          {wizardErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200/50 rounded-xl">
              <p className="text-red-600 text-[10px] mb-1" style={{ fontWeight: 600, ...ss04 }}>Please fix the following:</p>
              {wizardErrors.map((e, i) => (
                <p key={i} className="text-red-500 text-[11px] flex items-center gap-1.5" style={{ fontWeight: 500, ...ss04 }}>
                  <span className="text-red-400">•</span> {e}
                </p>
              ))}
            </div>
          )}

          {/* ===== STEP 1: Basic Info ===== */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                <p className="text-blue-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  Enter the provider's identity. The provider will be created in <span style={{ fontWeight: 700 }}>TESTING</span> mode — you can activate it after sandbox validation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <WizardInput label="Provider Name" value={wizardForm.name} onChange={v => updateForm("name", v)} placeholder="e.g. Payreto Philippines" required />
                <WizardInput label="Short Name" value={wizardForm.shortName} onChange={v => updateForm("shortName", v)} placeholder="e.g. Payreto" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <WizardSelect label="Provider Type" value={wizardForm.type} onChange={v => updateForm("type", v as ProviderType)} required options={[
                  { value: "fiat", label: "Fiat — E-wallets, banks, cards, OTC" },
                  { value: "crypto", label: "Crypto — Stablecoins, digital assets" },
                  { value: "hybrid", label: "Hybrid — Both fiat and crypto" },
                ]} />
                <WizardInput label="Country / Region" value={wizardForm.country} onChange={v => updateForm("country", v)} placeholder="Philippines" />
              </div>

              <WizardInput label="Website" value={wizardForm.website} onChange={v => updateForm("website", v)} placeholder="https://example.com" required />

              <WizardTextarea label="Description" value={wizardForm.description} onChange={v => updateForm("description", v)} placeholder="Brief description of the provider, its capabilities, and unique value proposition..." />

              {/* Logo setup */}
              <div>
                <label className="text-[#84888c] text-[11px] mb-2 block" style={{ fontWeight: 500, ...ss04 }}>Logo Initials & Color <span className="text-red-400">*</span></label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={wizardForm.logo}
                    onChange={e => updateForm("logo", e.target.value.slice(0, 3).toUpperCase())}
                    placeholder="PM"
                    maxLength={3}
                    className="w-16 h-9 px-3 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] text-center outline-none placeholder:text-[#b0b3b8] focus:border-[#8b5cf6] transition-colors"
                    style={{ fontWeight: 700, ...pp, ...ss04 }}
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {LOGO_COLOR_OPTIONS.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => updateForm("logoColorIdx", i)}
                        className={`w-7 h-7 rounded-lg ${c.bg} cursor-pointer transition-all ${wizardForm.logoColorIdx === i ? "ring-2 ring-offset-1 ring-[#8b5cf6] scale-110" : "opacity-60 hover:opacity-100"}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                  {wizardForm.logo && (
                    <div className={`w-10 h-10 ${LOGO_COLOR_OPTIONS[wizardForm.logoColorIdx].bg} rounded-xl flex items-center justify-center ${LOGO_COLOR_OPTIONS[wizardForm.logoColorIdx].text} text-[12px] flex-shrink-0`} style={{ fontWeight: 700, ...ss04 }}>
                      {wizardForm.logo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2: API Configuration ===== */}
          {wizardStep === 2 && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                <p className="text-amber-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  <span style={{ fontWeight: 700 }}>Security note:</span> API credentials are encrypted at rest and masked after submission. Only platform admins with <span className="font-mono text-[10px]">platform_superadmin</span> role can reveal full keys.
                </p>
              </div>

              <WizardInput label="API Endpoint" value={wizardForm.apiEndpoint} onChange={v => updateForm("apiEndpoint", v)} placeholder="https://api.provider.com/v1" required mono />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <WizardInput label="API Version" value={wizardForm.apiVersion} onChange={v => updateForm("apiVersion", v)} placeholder="v1.0" />
                <WizardSelect label="Environment" value={wizardForm.environment} onChange={v => updateForm("environment", v as "production" | "sandbox")} options={[
                  { value: "sandbox", label: "Sandbox (Testing)" },
                  { value: "production", label: "Production (Live)" },
                ]} />
              </div>

              <WizardInput label="API Key" value={wizardForm.apiKey} onChange={v => updateForm("apiKey", v)} placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxx" required mono />
              <WizardInput label="Secret Key" value={wizardForm.secretKey} onChange={v => updateForm("secretKey", v)} placeholder="sk_live_xxxxxxxxxxxxxxxxxxxxx" required mono type="password" />

              <WizardInput
                label="Webhook URL"
                value={wizardForm.webhookUrl || `https://api-staging.prediex.ph/webhooks/${wizardForm.shortName.toLowerCase().replace(/[^a-z0-9]/g, "") || "provider"}`}
                onChange={v => updateForm("webhookUrl", v)}
                placeholder="Auto-generated"
                mono
              />

              {/* Connection test */}
              <div className="p-3 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Test Connection</p>
                    <p className="text-[#84888c] text-[10px]" style={ss04}>
                      Sends a health-check ping to verify API credentials and endpoint availability
                    </p>
                  </div>
                  <button
                    onClick={testConnection}
                    disabled={testingConnection || !wizardForm.apiEndpoint || !wizardForm.apiKey}
                    className={`h-8 px-4 text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                      connectionResult === "success" ? "bg-emerald-50 text-emerald-600" :
                      connectionResult === "failed" ? "bg-red-50 text-red-500" :
                      "bg-white border border-[#e5e7eb] text-[#070808] hover:bg-[#f5f6f8]"
                    }`}
                    style={{ fontWeight: 600, ...ss04 }}
                  >
                    {testingConnection ? (
                      <>
                        <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" /></svg>
                        Testing...
                      </>
                    ) : connectionResult === "success" ? (
                      <>
                        <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8l3.5 3.5L13 5" /></svg>
                        Connected
                      </>
                    ) : connectionResult === "failed" ? (
                      <>
                        <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                        Retry
                      </>
                    ) : "Test Now"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Method Mapping ===== */}
          {wizardStep === 3 && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                <p className="text-blue-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  Select which payment methods this provider will handle. Set each to <span style={{ fontWeight: 700 }}>Primary</span> (preferred) or <span style={{ fontWeight: 700 }}>Fallback</span> (used when primary fails).
                </p>
              </div>

              {/* Category groups */}
              {(["e_wallet", "bank_transfer", "otc", "card", "stablecoin"] as const).map(cat => {
                const methods = AVAILABLE_METHODS.filter(m => m.category === cat);
                const catLabels: Record<string, string> = { e_wallet: "E-Wallets", bank_transfer: "Bank Transfers", otc: "Over-the-Counter", card: "Cards", stablecoin: "Stablecoins" };
                const catColors: Record<string, string> = { e_wallet: "text-blue-600", bank_transfer: "text-emerald-600", otc: "text-orange-600", card: "text-violet-600", stablecoin: "text-teal-600" };
                return (
                  <div key={cat}>
                    <p className={`text-[10px] mb-2 ${catColors[cat]}`} style={{ fontWeight: 700, ...ss04 }}>{catLabels[cat]}</p>
                    <div className="space-y-1.5">
                      {methods.map(m => {
                        const formEntry = wizardForm.methods.find(fm => fm.methodId === m.id);
                        const isEnabled = formEntry?.enabled ?? false;
                        const routing = formEntry?.routing ?? "fallback";
                        return (
                          <div key={m.id} className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${isEnabled ? "bg-[#f0f0ff] border border-[#d4d0ff]" : "bg-[#f9fafb] border border-transparent"}`}>
                            <div className="flex items-center gap-2.5">
                              <div
                                onClick={() => toggleMethod(m.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors ${isEnabled ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#d0d1d3] hover:border-[#8b5cf6]"}`}
                              >
                                {isEnabled && (
                                  <svg className="size-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6l2.5 2.5 4.5-5" /></svg>
                                )}
                              </div>
                              <div>
                                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{m.shortName}</span>
                                <span className="text-[#84888c] text-[10px] ml-1.5" style={ss04}>{m.name}</span>
                              </div>
                            </div>
                            {isEnabled && (
                              <select
                                value={routing}
                                onChange={e => setMethodRouting(m.id, e.target.value as RoutingPriority)}
                                className="h-7 px-2 pr-6 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[11px] outline-none cursor-pointer focus:border-[#8b5cf6] transition-colors"
                                style={{ ...pp, ...ss04 }}
                              >
                                <option value="primary">Primary</option>
                                <option value="fallback">Fallback</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#f0f1f3]">
                <span className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>
                  Selected: <span className="text-[#070808]" style={{ fontWeight: 700 }}>{wizardForm.methods.filter(m => m.enabled).length}</span> methods
                </span>
                <span className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>
                  Primary: <span className="text-emerald-600" style={{ fontWeight: 700 }}>{wizardForm.methods.filter(m => m.enabled && m.routing === "primary").length}</span>
                </span>
                <span className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>
                  Fallback: <span className="text-amber-600" style={{ fontWeight: 700 }}>{wizardForm.methods.filter(m => m.enabled && m.routing === "fallback").length}</span>
                </span>
              </div>
            </div>
          )}

          {/* ===== STEP 4: Compliance & Fees ===== */}
          {wizardStep === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <WizardInput label="Platform Fee (%)" value={wizardForm.platformFeePercent} onChange={v => updateForm("platformFeePercent", v)} placeholder="e.g. 0.5" required type="number" />
                <WizardInput label="Settlement Schedule" value={wizardForm.settlementSchedule} onChange={v => updateForm("settlementSchedule", v)} placeholder="e.g. T+1, Real-time" />
              </div>

              <WizardSelect label="Settlement Currency" value={wizardForm.settlementCurrency} onChange={v => updateForm("settlementCurrency", v)} options={[
                { value: "PHP", label: "PHP — Philippine Peso" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "USDT", label: "USDT — Tether" },
                { value: "USDC", label: "USDC — Circle USD" },
                { value: "Multi-asset", label: "Multi-asset" },
              ]} />

              <WizardInput label="BSP License Number" value={wizardForm.bspLicense} onChange={v => updateForm("bspLicense", v)} placeholder="e.g. BSP EMI-2020-014 (leave blank if N/A)" />

              <div className="p-3 bg-[#f9fafb] rounded-xl space-y-1">
                <p className="text-[#84888c] text-[10px] mb-1" style={{ fontWeight: 600, ...ss04 }}>COMPLIANCE FLAGS</p>
                <WizardCheckbox label="PAGCOR Approved" checked={wizardForm.pagcorApproved} onChange={v => updateForm("pagcorApproved", v)} description="Provider has been cleared by PAGCOR for gambling/betting operations" />
                <WizardCheckbox label="AML Compliant" checked={wizardForm.amlCompliant} onChange={v => updateForm("amlCompliant", v)} description="Provider meets BSP Anti-Money Laundering requirements (AMLA)" />
              </div>

              <WizardTextarea label="Internal Notes" value={wizardForm.notes} onChange={v => updateForm("notes", v)} placeholder="Any notes, special conditions, or caveats about this provider..." />
            </div>
          )}

          {/* ===== STEP 5: Review ===== */}
          {wizardStep === 5 && (() => {
            const col = LOGO_COLOR_OPTIONS[wizardForm.logoColorIdx];
            const enabledMethods = wizardForm.methods.filter(m => m.enabled);
            return (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-xl">
                  <p className="text-emerald-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                    Review all details before submitting. The provider will be created in <span style={{ fontWeight: 700 }}>TESTING</span> mode and can be activated after successful sandbox validation.
                  </p>
                </div>

                {/* Provider identity */}
                <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-xl">
                  <div className={`w-12 h-12 ${col.bg} rounded-xl flex items-center justify-center ${col.text} text-[14px] flex-shrink-0`} style={{ fontWeight: 700, ...ss04 }}>
                    {wizardForm.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#070808] text-[15px]" style={{ fontWeight: 700, ...ss04 }}>{wizardForm.name || "Unnamed"}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600" style={{ fontWeight: 600, ...ss04 }}>TESTING</span>
                      <TypeBadge type={wizardForm.type} />
                    </div>
                    <p className="text-[#84888c] text-[10px]" style={ss04}>{wizardForm.country} · {wizardForm.website}</p>
                  </div>
                </div>

                {wizardForm.description && (
                  <p className="text-[#84888c] text-[11px] leading-relaxed" style={ss04}>{wizardForm.description}</p>
                )}

                {/* API summary */}
                <div>
                  <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>API Configuration</h4>
                  <div className="p-3 bg-[#f9fafb] rounded-xl space-y-0">
                    <InfoPair label="Endpoint" value={wizardForm.apiEndpoint} mono />
                    <InfoPair label="Version" value={wizardForm.apiVersion} />
                    <InfoPair label="Environment" value={wizardForm.environment.toUpperCase()} accent={wizardForm.environment === "production"} />
                    <InfoPair label="API Key" value={wizardForm.apiKey.length > 8 ? wizardForm.apiKey.slice(0, 4) + "****" + wizardForm.apiKey.slice(-4) : "****"} mono />
                    <InfoPair label="Connection Test" value={connectionResult === "success" ? "Passed" : connectionResult === "failed" ? "Failed" : "Not tested"} accent={connectionResult === "success"} />
                  </div>
                </div>

                {/* Methods summary */}
                <div>
                  <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Payment Methods ({enabledMethods.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {enabledMethods.map(m => {
                      const meta = AVAILABLE_METHODS.find(am => am.id === m.methodId);
                      return (
                        <div key={m.methodId} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f6f8]">
                          <span className="text-[10px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{meta?.shortName}</span>
                          <RoutingBadge routing={m.routing} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compliance summary */}
                <div>
                  <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Compliance & Fees</h4>
                  <div className="p-3 bg-[#f9fafb] rounded-xl space-y-0">
                    <InfoPair label="Platform Fee" value={`${wizardForm.platformFeePercent}%`} />
                    <InfoPair label="Settlement" value={`${wizardForm.settlementSchedule} · ${wizardForm.settlementCurrency}`} />
                    <InfoPair label="BSP License" value={wizardForm.bspLicense || "Not provided"} />
                    <InfoPair label="PAGCOR" value={wizardForm.pagcorApproved ? "Approved" : "Not approved"} accent={wizardForm.pagcorApproved} />
                    <InfoPair label="AML" value={wizardForm.amlCompliant ? "Compliant" : "Not compliant"} accent={wizardForm.amlCompliant} />
                  </div>
                </div>

                {wizardForm.notes && (
                  <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                    <p className="text-blue-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                      <span style={{ fontWeight: 700 }}>Notes:</span> {wizardForm.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f1f3]">
            <div>
              {wizardStep > 1 && (
                <button
                  onClick={goBack}
                  className="h-9 px-4 text-[12px] text-[#84888c] bg-[#f5f6f8] rounded-xl cursor-pointer hover:bg-[#e5e7eb] hover:text-[#070808] transition-colors flex items-center gap-1.5"
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2L3 6l4 4" /></svg>
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWizardOpen(false)}
                className="h-9 px-4 text-[12px] text-[#84888c] bg-white border border-[#e5e7eb] rounded-xl cursor-pointer hover:bg-[#f5f6f8] transition-colors"
                style={{ fontWeight: 500, ...ss04 }}
              >
                Cancel
              </button>
              {wizardStep < 5 ? (
                <button
                  onClick={goNext}
                  className="h-9 px-5 text-[12px] text-white bg-[#8b5cf6] rounded-xl cursor-pointer hover:bg-[#7c3aed] transition-colors flex items-center gap-1.5"
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  Next
                  <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 2l4 4-4 4" /></svg>
                </button>
              ) : (
                <button
                  onClick={submitProvider}
                  className="h-9 px-5 text-[12px] text-white bg-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  style={{ fontWeight: 600, ...ss04 }}
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8l3.5 3.5L13 5" /></svg>
                  Create Provider
                </button>
              )}
            </div>
          </div>
        </div>
      </OmsModal>
    </div>
  );
}
