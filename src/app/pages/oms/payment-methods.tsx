import { useState, useEffect } from "react";
import { useOmsAuth, isPlatformUser, type Merchant } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, showOmsToast } from "../../components/oms/oms-modal";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
export type PaymentMethodCategory = "e_wallet" | "bank_transfer" | "otc" | "crypto" | "stablecoin" | "card";
export type PaymentMethodStatus = "live" | "testing" | "maintenance" | "disabled";

export interface PaymentMethodConfig {
  id: string;
  name: string;
  shortName: string;
  category: PaymentMethodCategory;
  provider: string;
  apiVersion: string;
  icon: string;
  status: PaymentMethodStatus;
  enabledGlobally: boolean;
  /** per-merchant overrides: merchantId -> enabled  */
  merchantOverrides: Record<string, boolean>;
  depositEnabled: boolean;
  withdrawEnabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  depositFeePercent: number;
  depositFeeFixed: number;
  withdrawFeePercent: number;
  withdrawFeeFixed: number;
  settlementTime: string;
  dailyLimit: number;
  monthlyVolume: string;
  txnCount: number;
  successRate: number;
  lastHealthCheck: string;
  notes: string;
  /** Stablecoin / crypto specific fields */
  chain?: string;
  network?: string;
  contractAddress?: string;
  confirmationsRequired?: number;
  currencySymbol?: string;
}

/* ==================== MOCK DATA ==================== */
const MOCK_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "PM001", name: "GCash", shortName: "GCash", category: "e_wallet", provider: "Globe Fintech / Mynt", apiVersion: "v2.1",
    icon: "G", status: "live", enabledGlobally: true,
    merchantOverrides: { MCH005: false },
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 100, maxDeposit: 500000, minWithdraw: 200, maxWithdraw: 100000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.5, withdrawFeeFixed: 15,
    settlementTime: "Instant", dailyLimit: 500000,
    monthlyVolume: "PHP 42.3M", txnCount: 18400, successRate: 99.2, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "",
  },
  {
    id: "PM002", name: "Maya (PayMaya)", shortName: "Maya", category: "e_wallet", provider: "Voyager Innovations / Maya", apiVersion: "v3.0",
    icon: "M", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 100, maxDeposit: 500000, minWithdraw: 200, maxWithdraw: 100000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.5, withdrawFeeFixed: 15,
    settlementTime: "Instant", dailyLimit: 500000,
    monthlyVolume: "PHP 16.4M", txnCount: 7100, successRate: 98.8, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "",
  },
  {
    id: "PM003", name: "Bank Transfer (InstaPay)", shortName: "InstaPay", category: "bank_transfer", provider: "PDAX / InstaPay", apiVersion: "v1.4",
    icon: "B", status: "live", enabledGlobally: true,
    merchantOverrides: { MCH004: false, MCH007: false },
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 1000000, minWithdraw: 500, maxWithdraw: 200000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 25,
    settlementTime: "< 30 min", dailyLimit: 1000000,
    monthlyVolume: "PHP 5.5M", txnCount: 1200, successRate: 97.5, lastHealthCheck: "2026-03-16 07:01 PHT", notes: "BDO, BPI, Metrobank, UnionBank supported",
  },
  {
    id: "PM004", name: "Bank Transfer (PESONet)", shortName: "PESONet", category: "bank_transfer", provider: "PCHC / PESONet", apiVersion: "v1.2",
    icon: "P", status: "live", enabledGlobally: true,
    merchantOverrides: { MCH004: false, MCH007: false },
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 1000, maxDeposit: 5000000, minWithdraw: 1000, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 50,
    settlementTime: "T+1 (next day)", dailyLimit: 5000000,
    monthlyVolume: "PHP 3.2M", txnCount: 420, successRate: 99.8, lastHealthCheck: "2026-03-16 07:02 PHT", notes: "Higher limits, longer settlement",
  },
  {
    id: "PM005", name: "7-Eleven CLiQQ", shortName: "7-Eleven", category: "otc", provider: "Philippine Seven Corp / CLiQQ", apiVersion: "v2.0",
    icon: "7", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 100, maxDeposit: 20000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 0, depositFeeFixed: 10, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "5-15 min", dailyLimit: 20000,
    monthlyVolume: "PHP 2.7M", txnCount: 2800, successRate: 96.5, lastHealthCheck: "2026-03-16 06:55 PHT", notes: "Deposit only — OTC kiosk",
  },
  {
    id: "PM006", name: "Cebuana Lhuillier", shortName: "Cebuana", category: "otc", provider: "Cebuana Lhuillier", apiVersion: "v1.8",
    icon: "C", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 200, maxDeposit: 50000, minWithdraw: 500, maxWithdraw: 50000,
    depositFeePercent: 0, depositFeeFixed: 20, withdrawFeePercent: 0, withdrawFeeFixed: 30,
    settlementTime: "15-30 min", dailyLimit: 50000,
    monthlyVolume: "PHP 1.4M", txnCount: 890, successRate: 98.1, lastHealthCheck: "2026-03-16 06:58 PHT", notes: "OTC via Cebuana branches nationwide",
  },
  {
    id: "PM007", name: "GrabPay", shortName: "GrabPay", category: "e_wallet", provider: "Grab Financial Group", apiVersion: "v1.0",
    icon: "GP", status: "testing", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 100, maxDeposit: 100000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 1.5, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "Instant", dailyLimit: 100000,
    monthlyVolume: "PHP 0", txnCount: 0, successRate: 0, lastHealthCheck: "2026-03-15 14:00 PHT", notes: "Sandbox testing — target launch Q2 2026",
  },
  {
    id: "PM008", name: "ShopeePay", shortName: "ShopeePay", category: "e_wallet", provider: "SeaMoney / ShopeePay", apiVersion: "v1.0",
    icon: "SP", status: "testing", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 50, maxDeposit: 50000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 1.0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "Instant", dailyLimit: 50000,
    monthlyVolume: "PHP 0", txnCount: 0, successRate: 0, lastHealthCheck: "2026-03-14 10:00 PHT", notes: "In integration — pending SeaMoney approval",
  },
  // CVPay Payment Methods
  {
    id: "PM_CV_GCASH", name: "GCash (CVPay)", shortName: "GCash", category: "e_wallet", provider: "CVPay", apiVersion: "v1.0",
    icon: "G", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 100, maxDeposit: 500000, minWithdraw: 200, maxWithdraw: 100000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.45, withdrawFeeFixed: 12,
    settlementTime: "Real-time", dailyLimit: 500000,
    monthlyVolume: "PHP 18.2M", txnCount: 8900, successRate: 99.4, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay aggregator — alternative to PayMongo",
  },
  {
    id: "PM_CV_MAYA", name: "Maya (CVPay)", shortName: "Maya", category: "e_wallet", provider: "CVPay", apiVersion: "v1.0",
    icon: "M", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 100, maxDeposit: 500000, minWithdraw: 200, maxWithdraw: 100000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.45, withdrawFeeFixed: 12,
    settlementTime: "Real-time", dailyLimit: 500000,
    monthlyVolume: "PHP 6.6M", txnCount: 3200, successRate: 99.0, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay aggregator",
  },
  {
    id: "PM_CV_GRABPAY", name: "GrabPay (CVPay)", shortName: "GrabPay", category: "e_wallet", provider: "CVPay", apiVersion: "v1.0",
    icon: "GP", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 100, maxDeposit: 100000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 1.2, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "Real-time", dailyLimit: 100000,
    monthlyVolume: "PHP 1.8M", txnCount: 890, successRate: 98.6, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay — production ready",
  },
  {
    id: "PM_CV_SHOPEEPAY", name: "ShopeePay (CVPay)", shortName: "ShopeePay", category: "e_wallet", provider: "CVPay", apiVersion: "v1.0",
    icon: "SP", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 50, maxDeposit: 50000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 0.9, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "Real-time", dailyLimit: 50000,
    monthlyVolume: "PHP 980K", txnCount: 520, successRate: 98.8, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay — production ready",
  },
  {
    id: "PM_CV_BDO", name: "BDO Online Banking (CVPay)", shortName: "BDO", category: "bank_transfer", provider: "CVPay", apiVersion: "v1.0",
    icon: "B", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 2000000, minWithdraw: 500, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 30,
    settlementTime: "Real-time", dailyLimit: 2000000,
    monthlyVolume: "PHP 3.2M", txnCount: 420, successRate: 98.2, lastHealthCheck: "2026-03-16 07:01 PHT", notes: "CVPay — BDO direct integration",
  },
  {
    id: "PM_CV_BPI", name: "BPI Online Banking (CVPay)", shortName: "BPI", category: "bank_transfer", provider: "CVPay", apiVersion: "v1.0",
    icon: "B", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 2000000, minWithdraw: 500, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 30,
    settlementTime: "Real-time", dailyLimit: 2000000,
    monthlyVolume: "PHP 2.8M", txnCount: 380, successRate: 98.5, lastHealthCheck: "2026-03-16 07:01 PHT", notes: "CVPay — BPI direct integration",
  },
  {
    id: "PM_CV_UNIONBANK", name: "UnionBank Online (CVPay)", shortName: "UnionBank", category: "bank_transfer", provider: "CVPay", apiVersion: "v1.0",
    icon: "U", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 2000000, minWithdraw: 500, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 30,
    settlementTime: "Real-time", dailyLimit: 2000000,
    monthlyVolume: "PHP 1.9M", txnCount: 290, successRate: 99.0, lastHealthCheck: "2026-03-16 07:01 PHT", notes: "CVPay — UnionBank direct integration",
  },
  {
    id: "PM_CV_7ELEVEN", name: "7-Eleven (CVPay)", shortName: "7-Eleven", category: "otc", provider: "CVPay", apiVersion: "v1.0",
    icon: "7", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 100, maxDeposit: 20000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 0, depositFeeFixed: 8, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "5-15 min", dailyLimit: 20000,
    monthlyVolume: "PHP 820K", txnCount: 980, successRate: 97.2, lastHealthCheck: "2026-03-16 06:58 PHT", notes: "CVPay — OTC deposit via CLiQQ kiosks",
  },
  {
    id: "PM_CV_CEBUANA", name: "Cebuana Lhuillier (CVPay)", shortName: "Cebuana", category: "otc", provider: "CVPay", apiVersion: "v1.0",
    icon: "C", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 200, maxDeposit: 50000, minWithdraw: 500, maxWithdraw: 50000,
    depositFeePercent: 0, depositFeeFixed: 18, withdrawFeePercent: 0, withdrawFeeFixed: 28,
    settlementTime: "15-30 min", dailyLimit: 50000,
    monthlyVolume: "PHP 620K", txnCount: 340, successRate: 98.4, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay — OTC via Cebuana branches",
  },
  {
    id: "PM_CV_MLHUILLIER", name: "M Lhuillier (CVPay)", shortName: "MLhuillier", category: "otc", provider: "CVPay", apiVersion: "v1.0",
    icon: "ML", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 200, maxDeposit: 50000, minWithdraw: 500, maxWithdraw: 50000,
    depositFeePercent: 0, depositFeeFixed: 18, withdrawFeePercent: 0, withdrawFeeFixed: 28,
    settlementTime: "15-30 min", dailyLimit: 50000,
    monthlyVolume: "PHP 480K", txnCount: 260, successRate: 98.6, lastHealthCheck: "2026-03-16 07:00 PHT", notes: "CVPay — OTC via M Lhuillier branches",
  },
  // CVPay Stablecoin Methods
  {
    id: "PM_CV_USDT_TRC20", name: "USDT TRC-20 (CVPay)", shortName: "USDT", category: "stablecoin", provider: "CVPay", apiVersion: "v1.0",
    icon: "₮", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 1000000, minWithdraw: 1000, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.08, withdrawFeeFixed: 0,
    settlementTime: "1-5 min (on-chain)", dailyLimit: 1000000,
    monthlyVolume: "₮ 1.2M", txnCount: 4200, successRate: 99.7, lastHealthCheck: "2026-03-16 07:00 PHT",
    notes: "CVPay stablecoin gateway — TRC-20 for low fees",
    chain: "Tron (TRC-20)", network: "Mainnet", contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", confirmationsRequired: 20, currencySymbol: "USDT",
  },
  {
    id: "PM_CV_USDT_ERC20", name: "USDT ERC-20 (CVPay)", shortName: "USDT-ETH", category: "stablecoin", provider: "CVPay", apiVersion: "v1.0",
    icon: "₮E", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 2000, maxDeposit: 5000000, minWithdraw: 5000, maxWithdraw: 2000000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.12, withdrawFeeFixed: 0,
    settlementTime: "3-10 min (on-chain)", dailyLimit: 5000000,
    monthlyVolume: "₮ 480K", txnCount: 820, successRate: 99.8, lastHealthCheck: "2026-03-16 07:00 PHT",
    notes: "CVPay — Ethereum network, higher gas fees",
    chain: "Ethereum (ERC-20)", network: "Mainnet", contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", confirmationsRequired: 12, currencySymbol: "USDT",
  },
  {
    id: "PM_CV_USDC_POLYGON", name: "USDC Polygon (CVPay)", shortName: "USDC-POL", category: "stablecoin", provider: "CVPay", apiVersion: "v1.0",
    icon: "◎P", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 200, maxDeposit: 1000000, minWithdraw: 500, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.05, withdrawFeeFixed: 0,
    settlementTime: "< 1 min (Polygon)", dailyLimit: 1000000,
    monthlyVolume: "₮ 680K", txnCount: 1580, successRate: 99.6, lastHealthCheck: "2026-03-16 07:01 PHT",
    notes: "CVPay — Polygon PoS, ultra-low fees",
    chain: "Polygon (PoS)", network: "Mainnet", contractAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", confirmationsRequired: 128, currencySymbol: "USDC",
  },
  {
    id: "PM_CV_USDC_SOLANA", name: "USDC Solana (CVPay)", shortName: "USDC-SOL", category: "stablecoin", provider: "CVPay", apiVersion: "v1.0",
    icon: "◎S", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 2000000, minWithdraw: 1000, maxWithdraw: 1000000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.06, withdrawFeeFixed: 0,
    settlementTime: "< 1 min (Solana)", dailyLimit: 2000000,
    monthlyVolume: "₮ 920K", txnCount: 2100, successRate: 99.8, lastHealthCheck: "2026-03-16 07:01 PHT",
    notes: "CVPay — Solana network, fast & low cost",
    chain: "Solana", network: "Mainnet", contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", confirmationsRequired: 1, currencySymbol: "USDC",
  },
  {
    id: "PM_CV_DAI", name: "DAI (CVPay)", shortName: "DAI", category: "stablecoin", provider: "CVPay", apiVersion: "v1.0",
    icon: "◈", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 1000, maxDeposit: 2000000, minWithdraw: 2000, maxWithdraw: 1000000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.1, withdrawFeeFixed: 0,
    settlementTime: "3-10 min (ERC-20)", dailyLimit: 2000000,
    monthlyVolume: "₮ 340K", txnCount: 620, successRate: 99.4, lastHealthCheck: "2026-03-16 07:01 PHT",
    notes: "CVPay — MakerDAO stablecoin, Ethereum network",
    chain: "Ethereum (ERC-20)", network: "Mainnet", contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", confirmationsRequired: 12, currencySymbol: "DAI",
  },
  {
    id: "PM009", name: "USDT (Tether)", shortName: "USDT", category: "stablecoin", provider: "PredictEx Crypto Gateway", apiVersion: "v1.2",
    icon: "₮", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 1000000, minWithdraw: 1000, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.1, withdrawFeeFixed: 0,
    settlementTime: "1-5 min (TRC-20)", dailyLimit: 1000000,
    monthlyVolume: "₮ 890K", txnCount: 3200, successRate: 99.6, lastHealthCheck: "2026-03-16 07:00 PHT",
    notes: "Primary stablecoin — TRC-20 for low fees, ERC-20 fallback",
    chain: "Tron (TRC-20)", network: "Mainnet", contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", confirmationsRequired: 20, currencySymbol: "USDT",
  },
  {
    id: "PM011", name: "USDT (ERC-20)", shortName: "USDT-ETH", category: "stablecoin", provider: "PredictEx Crypto Gateway", apiVersion: "v1.2",
    icon: "₮E", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 2000, maxDeposit: 5000000, minWithdraw: 5000, maxWithdraw: 2000000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.15, withdrawFeeFixed: 0,
    settlementTime: "3-10 min (on-chain)", dailyLimit: 5000000,
    monthlyVolume: "₮ 340K", txnCount: 580, successRate: 99.8, lastHealthCheck: "2026-03-16 07:00 PHT",
    notes: "Higher gas fees — recommended for large transactions only",
    chain: "Ethereum (ERC-20)", network: "Mainnet", contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", confirmationsRequired: 12, currencySymbol: "USDT",
  },
  {
    id: "PM012", name: "USDC (Circle)", shortName: "USDC", category: "stablecoin", provider: "PredictEx Crypto Gateway / Circle", apiVersion: "v1.1",
    icon: "◎", status: "live", enabledGlobally: true,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 500, maxDeposit: 2000000, minWithdraw: 1000, maxWithdraw: 1000000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.1, withdrawFeeFixed: 0,
    settlementTime: "1-3 min (Solana) / 5-10 min (ERC-20)", dailyLimit: 2000000,
    monthlyVolume: "₮ 520K", txnCount: 1800, successRate: 99.7, lastHealthCheck: "2026-03-16 07:01 PHT",
    notes: "Multi-chain: Solana (primary, low fee), Ethereum, Polygon. Circle-backed 1:1 USD reserves",
    chain: "Solana / Ethereum / Polygon", network: "Mainnet", contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", confirmationsRequired: 1, currencySymbol: "USDC",
  },
  {
    id: "PM013", name: "USDC (Polygon)", shortName: "USDC-POL", category: "stablecoin", provider: "PredictEx Crypto Gateway / Circle", apiVersion: "v1.1",
    icon: "◎P", status: "testing", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: true,
    minDeposit: 200, maxDeposit: 1000000, minWithdraw: 500, maxWithdraw: 500000,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0.05, withdrawFeeFixed: 0,
    settlementTime: "< 1 min (Polygon)", dailyLimit: 1000000,
    monthlyVolume: "₮ 0", txnCount: 0, successRate: 0, lastHealthCheck: "2026-03-15 12:00 PHT",
    notes: "Polygon PoS bridge — ultra-low fees, pending production testing",
    chain: "Polygon (PoS)", network: "Mainnet", contractAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", confirmationsRequired: 128, currencySymbol: "USDC",
  },
  {
    id: "PM014", name: "DAI (MakerDAO)", shortName: "DAI", category: "stablecoin", provider: "PredictEx Crypto Gateway", apiVersion: "v1.0",
    icon: "◆", status: "testing", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: true, withdrawEnabled: false,
    minDeposit: 1000, maxDeposit: 500000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "5-10 min (ERC-20)", dailyLimit: 500000,
    monthlyVolume: "₮ 0", txnCount: 0, successRate: 0, lastHealthCheck: "2026-03-14 15:00 PHT",
    notes: "Decentralized stablecoin — ERC-20 only. Deposit-only initially, withdraw phase 2",
    chain: "Ethereum (ERC-20)", network: "Mainnet", contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", confirmationsRequired: 12, currencySymbol: "DAI",
  },
  {
    id: "PM015", name: "PYUSD (PayPal USD)", shortName: "PYUSD", category: "stablecoin", provider: "PredictEx Crypto Gateway / Paxos", apiVersion: "v0.9",
    icon: "PY", status: "disabled", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: false, withdrawEnabled: false,
    minDeposit: 500, maxDeposit: 200000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 0, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "3-10 min (ERC-20)", dailyLimit: 200000,
    monthlyVolume: "₮ 0", txnCount: 0, successRate: 0, lastHealthCheck: "-",
    notes: "PayPal-backed stablecoin — planned for H2 2026, pending Paxos integration",
    chain: "Ethereum (ERC-20) / Solana", network: "Mainnet", contractAddress: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8", confirmationsRequired: 12, currencySymbol: "PYUSD",
  },
  {
    id: "PM010", name: "Visa / Mastercard", shortName: "Card", category: "card", provider: "Adyen / Card Networks", apiVersion: "v2.5",
    icon: "V", status: "disabled", enabledGlobally: false,
    merchantOverrides: {},
    depositEnabled: false, withdrawEnabled: false,
    minDeposit: 500, maxDeposit: 200000, minWithdraw: 0, maxWithdraw: 0,
    depositFeePercent: 2.5, depositFeeFixed: 0, withdrawFeePercent: 0, withdrawFeeFixed: 0,
    settlementTime: "Instant", dailyLimit: 200000,
    monthlyVolume: "PHP 0", txnCount: 0, successRate: 0, lastHealthCheck: "-", notes: "Planned for Enterprise merchants — Adyen integration pending",
  },
];

/* ==================== HELPER COMPONENTS ==================== */

function StatusBadge({ status }: { status: PaymentMethodStatus }) {
  const map: Record<PaymentMethodStatus, string> = {
    live: "bg-emerald-50 text-emerald-600",
    testing: "bg-amber-50 text-amber-600",
    maintenance: "bg-orange-50 text-orange-500",
    disabled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600, ...ss04 }}>
      {status.toUpperCase()}
    </span>
  );
}

function CategoryBadge({ category }: { category: PaymentMethodCategory }) {
  const map: Record<PaymentMethodCategory, { cls: string; label: string }> = {
    e_wallet: { cls: "bg-blue-50 text-blue-600", label: "E-Wallet" },
    bank_transfer: { cls: "bg-cyan-50 text-cyan-600", label: "Bank Transfer" },
    otc: { cls: "bg-purple-50 text-purple-600", label: "OTC" },
    crypto: { cls: "bg-yellow-50 text-yellow-700", label: "Crypto" },
    stablecoin: { cls: "bg-teal-50 text-teal-600", label: "Stablecoin" },
    card: { cls: "bg-pink-50 text-pink-600", label: "Card" },
  };
  const m = map[category];
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${m.cls}`} style={{ fontWeight: 600, ...ss04 }}>
      {m.label}
    </span>
  );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-9 h-[20px] rounded-full cursor-pointer transition-colors flex-shrink-0 ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${value ? "bg-[#ff5222]" : "bg-[#d1d5db]"}`}
    >
      <div className="w-3.5 h-3.5 bg-white rounded-full transition-all" style={{ marginLeft: value ? 18 : 2, marginTop: 3 }} />
    </button>
  );
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

function InfoPair({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f0f1f3] last:border-0">
      <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{label}</span>
      <span className={`text-[12px] ${accent ? "text-emerald-600" : "text-[#070808]"}`} style={{ fontWeight: 600, ...ss04 }}>{value}</span>
    </div>
  );
}

/* ==================== ICON COLORS ==================== */
const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  G: { bg: "bg-blue-500", text: "text-white" },
  M: { bg: "bg-green-500", text: "text-white" },
  B: { bg: "bg-cyan-600", text: "text-white" },
  P: { bg: "bg-indigo-500", text: "text-white" },
  "7": { bg: "bg-emerald-600", text: "text-white" },
  C: { bg: "bg-orange-500", text: "text-white" },
  GP: { bg: "bg-green-600", text: "text-white" },
  SP: { bg: "bg-orange-600", text: "text-white" },
  $: { bg: "bg-teal-500", text: "text-white" },
  V: { bg: "bg-violet-500", text: "text-white" },
  "₮": { bg: "bg-emerald-500", text: "text-white" },
  "₮E": { bg: "bg-indigo-500", text: "text-white" },
  "◎": { bg: "bg-blue-600", text: "text-white" },
  "◎P": { bg: "bg-purple-500", text: "text-white" },
  "◆": { bg: "bg-amber-500", text: "text-white" },
  "PY": { bg: "bg-sky-500", text: "text-white" },
};

/* ==================== MAIN COMPONENT ==================== */
export default function PaymentMethodsMgmt() {
  const { admin, activeMerchant, merchants } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;
  const { t } = useI18n();
  const role = admin?.role || "";

  const [methods, setMethods] = useState<PaymentMethodConfig[]>(() => loadPaymentMethods());
  const [tab, setTab] = useState<"overview" | "merchants">("overview");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PaymentMethodCategory>("all");
  const [detailTarget, setDetailTarget] = useState<PaymentMethodConfig | null>(null);
  const [merchantOverrideTarget, setMerchantOverrideTarget] = useState<PaymentMethodConfig | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<string>(activeMerchant?.id || merchants.find(m => m.status === "active")?.id || "");
  const [hasChanges, setHasChanges] = useState(false);

  const doAudit = (action: string, target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: role, action, target, detail });
  };

  const handleSave = () => {
    savePaymentMethods(methods);
    setHasChanges(false);
    showOmsToast("Payment methods configuration saved & persisted", "success");
    doAudit("config_save", "payment-methods", `Saved payment methods config — ${methods.filter(m => m.enabledGlobally).length} globally enabled`);
  };

  const toggleGlobal = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabledGlobally: !m.enabledGlobally } : m));
    setHasChanges(true);
  };

  const toggleMerchantOverride = (methodId: string, merchantId: string) => {
    setMethods(prev => prev.map(m => {
      if (m.id !== methodId) return m;
      const overrides = { ...m.merchantOverrides };
      if (overrides[merchantId] === false) {
        delete overrides[merchantId]; // remove override → inherits global
      } else {
        overrides[merchantId] = false; // explicit disable
      }
      return { ...m, merchantOverrides: overrides };
    }));
    setHasChanges(true);
  };

  const toggleStatus = (id: string, newStatus: PaymentMethodStatus) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    setHasChanges(true);
  };

  const toggleDepositWithdraw = (id: string, field: "depositEnabled" | "withdrawEnabled") => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: !m[field] } : m));
    setHasChanges(true);
  };

  const filtered = categoryFilter === "all" ? methods : methods.filter(m => m.category === categoryFilter);
  const activeMerchants = merchants.filter(m => m.status === "active" || m.status === "onboarding");
  const currentMerchant = merchants.find(m => m.id === selectedMerchant);

  /** For a given merchant, is this method enabled? */
  const isEnabledForMerchant = (method: PaymentMethodConfig, merchantId: string): boolean => {
    if (!method.enabledGlobally) return false;
    if (method.merchantOverrides[merchantId] === false) return false;
    return true;
  };

  /* --- Access guard --- */
  if (!isPlat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={pp}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="size-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v.01M12 12V8m0 12a9 9 0 110-18 9 9 0 010 18z" strokeLinecap="round" /></svg>
          </div>
          <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 600, ...ss04 }}>Access Restricted</h3>
          <p className="text-[#b0b3b8] text-[12px]" style={ss04}>Payment Methods Management is only available to PredictEx Platform Admins & Ops.</p>
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
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>Payment Methods Management</h2>
          <p className="text-[#b0b3b8] text-[12px] mt-0.5" style={ss04}>
            Configure payment gateways, set global availability, and manage per-merchant overrides
            <span className="ml-2 inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600" style={{ fontWeight: 600, ...ss04 }}>
              <svg className="size-2.5" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2"><path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              PERSISTED
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Methods", value: methods.length.toString(), color: "text-[#070808]" },
          { label: "Globally Enabled", value: methods.filter(m => m.enabledGlobally).length.toString(), color: "text-emerald-600" },
          { label: "Fiat Methods", value: methods.filter(m => m.category !== "stablecoin" && m.category !== "crypto").length.toString(), color: "text-blue-600" },
          { label: "Stablecoins", value: methods.filter(m => m.category === "stablecoin").length.toString(), color: "text-teal-600" },
          { label: "Live", value: methods.filter(m => m.status === "live").length.toString(), color: "text-emerald-600" },
          { label: "Testing / Disabled", value: methods.filter(m => m.status === "testing" || m.status === "disabled").length.toString(), color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-xl p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className={`text-[22px] mt-0.5 ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e5e7eb] rounded-xl p-1 w-fit">
        {([
          { key: "overview" as const, label: "Payment Methods", icon: "💳" },
          { key: "merchants" as const, label: "Merchant Assignments", icon: "🏪" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${tab === t.key ? "bg-[#8b5cf6] text-white" : "text-[#84888c] hover:bg-[#f5f6f8] hover:text-[#070808]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            <span className="text-[13px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== TAB: OVERVIEW ========== */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#84888c] text-[10px]" style={{ fontWeight: 600, ...ss04 }}>FILTER:</span>
            {([
              { key: "all" as const, label: "All" },
              { key: "e_wallet" as const, label: "E-Wallets" },
              { key: "bank_transfer" as const, label: "Bank Transfer" },
              { key: "otc" as const, label: "OTC" },
              { key: "crypto" as const, label: "Crypto" },
              { key: "stablecoin" as const, label: "Stablecoin" },
              { key: "card" as const, label: "Card" },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${categoryFilter === f.key ? "bg-[#070808] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:text-[#070808]"}`}
                style={{ fontWeight: 500, ...ss04 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Methods grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map(m => {
              const ic = ICON_COLORS[m.icon] || { bg: "bg-gray-500", text: "text-white" };
              return (
                <div key={m.id} className={`bg-white border rounded-2xl overflow-hidden transition-colors ${m.enabledGlobally ? "border-[#e5e7eb]" : "border-[#e5e7eb] opacity-60"}`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${ic.bg} rounded-xl flex items-center justify-center ${ic.text} text-[13px] flex-shrink-0`} style={{ fontWeight: 700, ...ss04 }}>
                          {m.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{m.name}</span>
                            <StatusBadge status={m.status} />
                            <CategoryBadge category={m.category} />
                          </div>
                          <p className="text-[#84888c] text-[10px] mt-0.5" style={ss04}>{m.provider} · API {m.apiVersion}</p>
                        </div>
                      </div>
                      <Toggle value={m.enabledGlobally} onChange={() => toggleGlobal(m.id)} />
                    </div>

                    {/* Chain / Network info for stablecoins/crypto */}
                    {(m.category === "stablecoin" || m.category === "crypto") && m.chain && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <svg className="size-3 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v14M1 8h14M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600" style={{ fontWeight: 600, ...ss04 }}>
                          {m.chain}
                        </span>
                        {m.confirmationsRequired && (
                          <span className="text-[9px] text-[#84888c]" style={ss04}>
                            {m.confirmationsRequired} confirmations
                          </span>
                        )}
                        {m.currencySymbol && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>
                            {m.currencySymbol}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Deposit / Withdraw capabilities */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.depositEnabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                          {m.depositEnabled ? "DEPOSIT" : "NO DEPOSIT"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.withdrawEnabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                          {m.withdrawEnabled ? "WITHDRAW" : "NO WITHDRAW"}
                        </span>
                      </div>
                    </div>

                    {/* Volume & Health */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#f9fafb] rounded-lg p-2">
                        <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Monthly Vol</p>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>{m.monthlyVolume}</p>
                      </div>
                      <div className="bg-[#f9fafb] rounded-lg p-2">
                        <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Txn Count</p>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>{m.txnCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#f9fafb] rounded-lg p-2">
                        <p className="text-[#84888c] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>Success Rate</p>
                        <p className={`text-[12px] ${m.successRate >= 98 ? "text-emerald-600" : m.successRate >= 95 ? "text-amber-600" : "text-red-500"}`} style={{ fontWeight: 700, ...ss04 }}>
                          {m.successRate > 0 ? `${m.successRate}%` : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Limits summary */}
                    <div className="flex items-center gap-3 text-[10px] text-[#84888c] mb-3" style={ss04}>
                      {m.depositEnabled && <span>Deposit: ₱{m.minDeposit.toLocaleString()} – ₱{m.maxDeposit.toLocaleString()}</span>}
                      {m.depositEnabled && m.withdrawEnabled && <span>·</span>}
                      {m.withdrawEnabled && <span>Withdraw: ₱{m.minWithdraw.toLocaleString()} – ₱{m.maxWithdraw.toLocaleString()}</span>}
                    </div>

                    {/* Merchant overrides count */}
                    {Object.keys(m.merchantOverrides).length > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <svg className="size-3 text-amber-500" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v5l3 3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="6" r="5" /></svg>
                        <span className="text-amber-600 text-[10px]" style={{ fontWeight: 500, ...ss04 }}>
                          {Object.keys(m.merchantOverrides).filter(k => m.merchantOverrides[k] === false).length} merchant(s) have this method disabled
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailTarget(m)}
                        className="h-7 px-3 bg-[#f5f6f8] text-[#070808] text-[10px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                        style={{ fontWeight: 600, ...ss04 }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setMerchantOverrideTarget(m)}
                        className="h-7 px-3 bg-[#f5f6f8] text-[#070808] text-[10px] rounded-lg cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                        style={{ fontWeight: 600, ...ss04 }}
                      >
                        Merchant Overrides
                      </button>
                      {m.status !== "live" && m.enabledGlobally && (
                        <button
                          onClick={() => { toggleStatus(m.id, "live"); showOmsToast(`${m.name} set to LIVE`); }}
                          className="h-7 px-3 bg-emerald-50 text-emerald-600 text-[10px] rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
                          style={{ fontWeight: 600, ...ss04 }}
                        >
                          Go Live
                        </button>
                      )}
                      {m.status === "live" && (
                        <button
                          onClick={() => { toggleStatus(m.id, "maintenance"); showOmsToast(`${m.name} set to MAINTENANCE`, "error"); }}
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

      {/* ========== TAB: MERCHANT ASSIGNMENTS ========== */}
      {tab === "merchants" && (
        <div className="space-y-4">
          {/* Merchant selector */}
          <div className="flex items-center gap-3">
            <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Merchant:</span>
            <select
              value={selectedMerchant}
              onChange={e => setSelectedMerchant(e.target.value)}
              className="h-9 px-3 pr-8 bg-white border border-[#e5e7eb] rounded-xl text-[#070808] text-[12px] outline-none cursor-pointer focus:border-[#8b5cf6] transition-colors"
              style={{ ...pp, ...ss04 }}
            >
              {activeMerchants.map(m => (
                <option key={m.id} value={m.id}>{m.logo} {m.name} ({m.id})</option>
              ))}
            </select>
          </div>

          {/* Merchant banner */}
          {currentMerchant && (
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
                <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                  {methods.filter(m => isEnabledForMerchant(m, currentMerchant.id)).length} of {methods.filter(m => m.enabledGlobally).length} available methods enabled
                </p>
              </div>
            </div>
          )}

          {/* Methods table for selected merchant */}
          <SectionCard
            title={`Payment Methods for ${currentMerchant?.name || "—"}`}
            subtitle="Toggle individual methods on/off for this merchant. Methods disabled globally cannot be enabled per-merchant."
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    {["Method", "Category", "Status", "Deposit", "Withdraw", "Limits", "Enabled", "Actions"].map(h => (
                      <th key={h} className="text-[#84888c] text-[10px] px-3 py-2.5 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {methods.filter(m => m.enabledGlobally).map(m => {
                    const enabled = isEnabledForMerchant(m, selectedMerchant);
                    const hasOverride = m.merchantOverrides[selectedMerchant] !== undefined;
                    const ic = ICON_COLORS[m.icon] || { bg: "bg-gray-500", text: "text-white" };
                    return (
                      <tr key={m.id} className={`border-b border-[#f5f6f7] transition-colors ${enabled ? "hover:bg-[#fafafa]" : "bg-gray-50/50 opacity-60"}`}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 ${ic.bg} rounded-lg flex items-center justify-center ${ic.text} text-[10px] flex-shrink-0`} style={{ fontWeight: 700 }}>
                              {m.icon}
                            </div>
                            <div>
                              <span className="text-[#070808] text-[12px] block" style={{ fontWeight: 600, ...ss04 }}>{m.shortName}</span>
                              <span className="text-[#84888c] text-[9px]" style={ss04}>{m.provider}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3"><CategoryBadge category={m.category} /></td>
                        <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] ${m.depositEnabled ? "text-emerald-600" : "text-gray-400"}`} style={{ fontWeight: 600 }}>
                            {m.depositEnabled ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] ${m.withdrawEnabled ? "text-blue-600" : "text-gray-400"}`} style={{ fontWeight: 600 }}>
                            {m.withdrawEnabled ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[10px] text-[#84888c]" style={ss04}>
                            {m.depositEnabled && `₱${m.minDeposit.toLocaleString()}–₱${m.maxDeposit.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Toggle value={enabled} onChange={() => toggleMerchantOverride(m.id, selectedMerchant)} />
                            {hasOverride && (
                              <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>OVERRIDE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setDetailTarget(m)}
                            className="h-6 px-2 bg-[#f5f6f8] text-[#84888c] text-[10px] rounded cursor-pointer hover:bg-[#e5e7eb]"
                            style={{ fontWeight: 600 }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {methods.filter(m => !m.enabledGlobally).length > 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-[#b0b3b8]" style={ss04}>
                          <svg className="size-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="5" /><path d="M6 4v3m0 2v.01" strokeLinecap="round" /></svg>
                          {methods.filter(m => !m.enabledGlobally).length} method(s) are globally disabled and not available to any merchant
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      <OmsModal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={detailTarget?.name || ""} subtitle="Payment Method Configuration Details" width="max-w-[600px]">
        {detailTarget && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${ICON_COLORS[detailTarget.icon]?.bg || "bg-gray-500"} rounded-xl flex items-center justify-center text-white text-[16px]`} style={{ fontWeight: 700 }}>
                {detailTarget.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04 }}>{detailTarget.name}</span>
                  <StatusBadge status={detailTarget.status} />
                </div>
                <p className="text-[#84888c] text-[11px]" style={ss04}>{detailTarget.provider} · API {detailTarget.apiVersion}</p>
              </div>
            </div>

            {/* Global enabled */}
            <div className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl">
              <div>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Globally Enabled</span>
                <p className="text-[#84888c] text-[10px]" style={ss04}>Available to all merchants unless overridden</p>
              </div>
              <Toggle value={detailTarget.enabledGlobally} onChange={() => { toggleGlobal(detailTarget.id); setDetailTarget({ ...detailTarget, enabledGlobally: !detailTarget.enabledGlobally }); }} />
            </div>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Deposit</span>
                  <Toggle value={detailTarget.depositEnabled} onChange={() => { toggleDepositWithdraw(detailTarget.id, "depositEnabled"); setDetailTarget({ ...detailTarget, depositEnabled: !detailTarget.depositEnabled }); }} />
                </div>
                {detailTarget.depositEnabled && (
                  <div className="mt-2 space-y-1">
                    <InfoPair label="Min" value={`₱${detailTarget.minDeposit.toLocaleString()}`} />
                    <InfoPair label="Max" value={`₱${detailTarget.maxDeposit.toLocaleString()}`} />
                    <InfoPair label="Fee" value={detailTarget.depositFeePercent > 0 ? `${detailTarget.depositFeePercent}%` : detailTarget.depositFeeFixed > 0 ? `₱${detailTarget.depositFeeFixed}` : "Free"} accent={detailTarget.depositFeePercent === 0 && detailTarget.depositFeeFixed === 0} />
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Withdraw</span>
                  <Toggle value={detailTarget.withdrawEnabled} onChange={() => { toggleDepositWithdraw(detailTarget.id, "withdrawEnabled"); setDetailTarget({ ...detailTarget, withdrawEnabled: !detailTarget.withdrawEnabled }); }} />
                </div>
                {detailTarget.withdrawEnabled && (
                  <div className="mt-2 space-y-1">
                    <InfoPair label="Min" value={`₱${detailTarget.minWithdraw.toLocaleString()}`} />
                    <InfoPair label="Max" value={`₱${detailTarget.maxWithdraw.toLocaleString()}`} />
                    <InfoPair label="Fee" value={detailTarget.withdrawFeePercent > 0 ? `${detailTarget.withdrawFeePercent}%` : `₱${detailTarget.withdrawFeeFixed}`} />
                  </div>
                )}
              </div>
            </div>

            {/* Operational info */}
            <div>
              <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Operational Info</h4>
              <InfoPair label="Settlement Time" value={detailTarget.settlementTime} />
              <InfoPair label="Daily Limit" value={`₱${detailTarget.dailyLimit.toLocaleString()}`} />
              <InfoPair label="Monthly Volume" value={detailTarget.monthlyVolume} />
              <InfoPair label="Transaction Count" value={detailTarget.txnCount.toLocaleString()} />
              <InfoPair label="Success Rate" value={detailTarget.successRate > 0 ? `${detailTarget.successRate}%` : "N/A"} accent={detailTarget.successRate >= 98} />
              <InfoPair label="Last Health Check" value={detailTarget.lastHealthCheck} />
            </div>

            {/* Blockchain / Stablecoin info */}
            {(detailTarget.category === "stablecoin" || detailTarget.category === "crypto") && detailTarget.chain && (
              <div>
                <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Blockchain Info</h4>
                <div className="p-3 bg-teal-50/50 border border-teal-200/50 rounded-xl space-y-0">
                  <InfoPair label="Chain / Network" value={detailTarget.chain} />
                  <InfoPair label="Network" value={detailTarget.network || "—"} />
                  {detailTarget.contractAddress && (
                    <div className="flex items-center justify-between py-2 border-b border-teal-100 last:border-0">
                      <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Contract Address</span>
                      <span className="text-[11px] text-[#070808] font-mono max-w-[280px] truncate" style={{ fontWeight: 500 }}>
                        {detailTarget.contractAddress}
                      </span>
                    </div>
                  )}
                  {detailTarget.confirmationsRequired && (
                    <InfoPair label="Confirmations Required" value={detailTarget.confirmationsRequired.toString()} />
                  )}
                  {detailTarget.currencySymbol && (
                    <InfoPair label="Currency Symbol" value={detailTarget.currencySymbol} />
                  )}
                </div>
              </div>
            )}

            {/* Merchant overrides summary */}
            {Object.keys(detailTarget.merchantOverrides).length > 0 && (
              <div>
                <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Merchant Overrides</h4>
                <div className="space-y-1">
                  {Object.entries(detailTarget.merchantOverrides).map(([mId, enabled]) => {
                    const merchant = merchants.find(m => m.id === mId);
                    return (
                      <div key={mId} className="flex items-center justify-between py-1.5 border-b border-[#f0f1f3]">
                        <span className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{merchant?.name || mId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${enabled ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontWeight: 600 }}>
                          {enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {detailTarget.notes && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                <p className="text-amber-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
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

      {/* ========== MERCHANT OVERRIDE MODAL ========== */}
      <OmsModal open={!!merchantOverrideTarget} onClose={() => setMerchantOverrideTarget(null)} title={`Merchant Overrides — ${merchantOverrideTarget?.name || ""}`} subtitle="Enable or disable this payment method per merchant" width="max-w-[560px]">
        {merchantOverrideTarget && (
          <div className="space-y-3">
            {!merchantOverrideTarget.enabledGlobally && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                  This method is globally disabled. Enable it globally first before assigning to merchants.
                </p>
              </div>
            )}
            {merchantOverrideTarget.enabledGlobally && activeMerchants.map(merchant => {
              const enabled = isEnabledForMerchant(merchantOverrideTarget, merchant.id);
              const hasOverride = merchantOverrideTarget.merchantOverrides[merchant.id] !== undefined;
              return (
                <div key={merchant.id} className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[10px] flex-shrink-0" style={{ fontWeight: 700, ...ss04 }}>
                      {merchant.logo}
                    </div>
                    <div>
                      <span className="text-[#070808] text-[12px] block" style={{ fontWeight: 600, ...ss04 }}>{merchant.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#84888c] text-[9px]" style={ss04}>{merchant.id}</span>
                        {hasOverride && <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>OVERRIDE</span>}
                      </div>
                    </div>
                  </div>
                  <Toggle
                    value={enabled}
                    onChange={() => {
                      toggleMerchantOverride(merchantOverrideTarget.id, merchant.id);
                      // Update local modal state
                      const updated = { ...merchantOverrideTarget };
                      const overrides = { ...updated.merchantOverrides };
                      if (overrides[merchant.id] === false) {
                        delete overrides[merchant.id];
                      } else {
                        overrides[merchant.id] = false;
                      }
                      updated.merchantOverrides = overrides;
                      setMerchantOverrideTarget(updated);
                    }}
                  />
                </div>
              );
            })}
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setMerchantOverrideTarget(null)}>Done</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>
    </div>
  );
}

/* ==================== STORAGE ==================== */
const STORAGE_KEY = "oms_payment_methods_v2";
function loadPaymentMethods(): PaymentMethodConfig[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch {}
  return MOCK_PAYMENT_METHODS;
}
function savePaymentMethods(methods: PaymentMethodConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}
export { loadPaymentMethods };