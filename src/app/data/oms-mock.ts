/**
 * OMS Centralized Mock Data Layer
 * ================================
 * Shared data generators and mock datasets used across OMS pages.
 * When switching to real APIs, replace each export with an API call.
 *
 * Convention:
 *   - Types prefixed with Oms* for clarity
 *   - Mock arrays prefixed with MOCK_*
 *   - Generator helpers prefixed with generate*
 */

/* ==================== SHARED USER BASE ==================== */
export interface OmsUser {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: "user" | "creator";
  channel: "FG" | "organic" | "agent";
  source: string;
  agentName: string;
  registeredAt: string;
  lastLogin: string;
  recentIp: string;
  recentGeo: string;
  status: "active" | "suspended" | "frozen" | "restricted";
}

export const MOCK_USERS: OmsUser[] = [
  { id: "U001", name: "Maria Santos", email: "maria.s@gmail.com", nickname: "MariaBets", userType: "user", channel: "FG", source: "Direct", agentName: "-", registeredAt: "2025-11-10", lastLogin: "2026-03-14 08:50 PHT", recentIp: "203.177.44.12", recentGeo: "Manila, PH", status: "active" },
  { id: "U002", name: "JM Reyes", email: "jm.reyes@yahoo.com", nickname: "JMPlays", userType: "user", channel: "organic", source: "Google", agentName: "-", registeredAt: "2025-12-02", lastLogin: "2026-03-14 08:45 PHT", recentIp: "120.28.195.33", recentGeo: "Cebu, PH", status: "active" },
  { id: "U003", name: "Ken Villanueva", email: "ken.v@outlook.com", nickname: "KenV", userType: "user", channel: "agent", source: "Agent Link", agentName: "Tony (AG001)", registeredAt: "2026-01-05", lastLogin: "2026-03-14 07:55 PHT", recentIp: "49.147.28.66", recentGeo: "Davao, PH", status: "active" },
  { id: "U004", name: "Ana Dela Cruz", email: "ana.dc@outlook.com", nickname: "AnaDC", userType: "user", channel: "FG", source: "Direct", agentName: "-", registeredAt: "2025-10-18", lastLogin: "2026-03-11 12:00 PHT", recentIp: "175.176.82.21", recentGeo: "Quezon City, PH", status: "frozen" },
  { id: "U005", name: "Rosa Lim", email: "rosa.lim@gmail.com", nickname: "RosaLucky", userType: "user", channel: "organic", source: "Facebook", agentName: "-", registeredAt: "2025-09-22", lastLogin: "2026-03-14 08:30 PHT", recentIp: "112.200.179.44", recentGeo: "Makati, PH", status: "active" },
  { id: "U006", name: "Mark Tan", email: "mark.t@yahoo.com", nickname: "HighRollerMark", userType: "user", channel: "agent", source: "Agent Link", agentName: "Rico (AG003)", registeredAt: "2025-08-15", lastLogin: "2026-03-14 08:40 PHT", recentIp: "49.145.105.88", recentGeo: "Taguig, PH", status: "active" },
  { id: "U007", name: "Patricia Go", email: "trish.go@gmail.com", nickname: "PatGo", userType: "user", channel: "FG", source: "Direct", agentName: "-", registeredAt: "2026-02-01", lastLogin: "2026-03-14 08:20 PHT", recentIp: "180.190.32.55", recentGeo: "Pasig, PH", status: "active" },
  { id: "U008", name: "Bong Ramos", email: "bong.r@hotmail.com", nickname: "BongBets", userType: "user", channel: "agent", source: "Agent Link", agentName: "Tony (AG001)", registeredAt: "2025-07-01", lastLogin: "2026-02-28 14:00 PHT", recentIp: "210.213.180.22", recentGeo: "Caloocan, PH", status: "restricted" },
  { id: "U009", name: "Cherry Aquino", email: "cherry.a@gmail.com", nickname: "CherryPicks", userType: "user", channel: "organic", source: "TikTok", agentName: "-", registeredAt: "2026-01-20", lastLogin: "2026-03-14 08:10 PHT", recentIp: "119.93.148.77", recentGeo: "Iloilo, PH", status: "active" },
  { id: "U010", name: "Dennis Cruz", email: "dennis.c@gmail.com", nickname: "DennisC", userType: "user", channel: "FG", source: "Direct", agentName: "-", registeredAt: "2026-02-14", lastLogin: "2026-03-14 08:00 PHT", recentIp: "122.54.88.11", recentGeo: "Manila, PH", status: "active" },
  { id: "U011", name: "Miguel Torres", email: "miguel.t@gmail.com", nickname: "MiguelPicks", userType: "user", channel: "organic", source: "Telegram", agentName: "-", registeredAt: "2026-03-01", lastLogin: "2026-03-14 07:00 PHT", recentIp: "175.176.10.88", recentGeo: "Quezon City, PH", status: "active" },
  { id: "U012", name: "Janine Cruz", email: "janine.c@gmail.com", nickname: "JanineCasts", userType: "creator", channel: "organic", source: "Twitch", agentName: "-", registeredAt: "2025-11-01", lastLogin: "2026-03-14 09:00 PHT", recentIp: "203.177.55.22", recentGeo: "Manila, PH", status: "active" },
];

/** Look up a user by ID */
export function getUserById(id: string): OmsUser | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

/** Get user display name by ID (with fallback) */
export function getUserName(id: string): string {
  return getUserById(id)?.name ?? id;
}

/* ==================== FINANCIAL SUMMARIES ==================== */
export interface OmsUserFinancials {
  userId: string;
  balance: number;
  holdBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWinnings: number;
  totalLosses: number;
  pnl: number;
  activeBets: number;
  totalVolume: number;
  settledPnl: number;
}

export const MOCK_USER_FINANCIALS: OmsUserFinancials[] = [
  { userId: "U001", balance: 45200, holdBalance: 12000, totalDeposits: 180000, totalWithdrawals: 92000, totalWinnings: 68000, totalLosses: 110800, pnl: -42800, activeBets: 5, totalVolume: 452000, settledPnl: -42800 },
  { userId: "U002", balance: 12800, holdBalance: 3000, totalDeposits: 65000, totalWithdrawals: 28000, totalWinnings: 22000, totalLosses: 46200, pnl: -24200, activeBets: 2, totalVolume: 185000, settledPnl: -24200 },
  { userId: "U003", balance: 8200, holdBalance: 500, totalDeposits: 15000, totalWithdrawals: 4000, totalWinnings: 3200, totalLosses: 6000, pnl: -2800, activeBets: 1, totalVolume: 38000, settledPnl: -2800 },
  { userId: "U004", balance: 0, holdBalance: 0, totalDeposits: 320000, totalWithdrawals: 250000, totalWinnings: 180000, totalLosses: 250000, pnl: -70000, activeBets: 0, totalVolume: 780000, settledPnl: -70000 },
  { userId: "U005", balance: 78500, holdBalance: 45000, totalDeposits: 250000, totalWithdrawals: 120000, totalWinnings: 185000, totalLosses: 236500, pnl: -51500, activeBets: 8, totalVolume: 1250000, settledPnl: -51500 },
  { userId: "U006", balance: 120000, holdBalance: 80000, totalDeposits: 500000, totalWithdrawals: 280000, totalWinnings: 320000, totalLosses: 420000, pnl: -100000, activeBets: 12, totalVolume: 3200000, settledPnl: -100000 },
  { userId: "U007", balance: 3400, holdBalance: 500, totalDeposits: 12000, totalWithdrawals: 5000, totalWinnings: 1400, totalLosses: 5000, pnl: -3600, activeBets: 1, totalVolume: 28000, settledPnl: -3600 },
  { userId: "U008", balance: 0, holdBalance: 0, totalDeposits: 780000, totalWithdrawals: 680000, totalWinnings: 520000, totalLosses: 620000, pnl: -100000, activeBets: 0, totalVolume: 2800000, settledPnl: -100000 },
  { userId: "U009", balance: 34600, holdBalance: 8000, totalDeposits: 95000, totalWithdrawals: 42000, totalWinnings: 56000, totalLosses: 74400, pnl: -18400, activeBets: 3, totalVolume: 320000, settledPnl: -18400 },
  { userId: "U010", balance: 8900, holdBalance: 2000, totalDeposits: 42000, totalWithdrawals: 18000, totalWinnings: 15000, totalLosses: 30100, pnl: -15100, activeBets: 1, totalVolume: 95000, settledPnl: -15100 },
];

export function getUserFinancials(userId: string): OmsUserFinancials | undefined {
  return MOCK_USER_FINANCIALS.find(f => f.userId === userId);
}

/* ==================== MARKETS ==================== */
export type MarketStatus = "open" | "locked" | "settled" | "voided" | "pending";
export type MarketCategory = "basketball" | "boxing" | "esports" | "color_game" | "lottery" | "weather" | "economy" | "showbiz";

export interface OmsMarket {
  id: string;
  title: string;
  category: MarketCategory;
  status: MarketStatus;
  totalVolume: number;
  betCount: number;
  creatorId: string | null;
  createdAt: string;
  closesAt: string;
}

export const MOCK_MARKETS: OmsMarket[] = [
  { id: "MKT001", title: "PBA Finals: Ginebra vs San Miguel", category: "basketball", status: "open", totalVolume: 2450000, betCount: 1842, creatorId: null, createdAt: "2026-03-10", closesAt: "2026-03-15 19:00 PHT" },
  { id: "MKT002", title: "Color Game Round #8832", category: "color_game", status: "open", totalVolume: 180000, betCount: 620, creatorId: null, createdAt: "2026-03-14", closesAt: "2026-03-14 09:05 PHT" },
  { id: "MKT003", title: "Boxing: Donaire vs Martinez", category: "boxing", status: "open", totalVolume: 1200000, betCount: 956, creatorId: null, createdAt: "2026-03-08", closesAt: "2026-03-20 21:00 PHT" },
  { id: "MKT004", title: "MLBB M6 - ECHO vs ONIC", category: "esports", status: "open", totalVolume: 890000, betCount: 2100, creatorId: "CR003", createdAt: "2026-03-12", closesAt: "2026-03-16 14:00 PHT" },
  { id: "MKT005", title: "Will it rain in Manila tomorrow?", category: "weather", status: "settled", totalVolume: 45000, betCount: 312, creatorId: null, createdAt: "2026-03-12", closesAt: "2026-03-13 18:00 PHT" },
  { id: "MKT006", title: "BSP Rate Decision - March 2026", category: "economy", status: "settled", totalVolume: 380000, betCount: 445, creatorId: null, createdAt: "2026-03-01", closesAt: "2026-03-06 14:00 PHT" },
  { id: "MKT007", title: "PCSO 6/58 MegaLotto - March 15", category: "lottery", status: "open", totalVolume: 520000, betCount: 1200, creatorId: null, createdAt: "2026-03-13", closesAt: "2026-03-15 20:00 PHT" },
  { id: "MKT008", title: "Miss Universe PH 2026 Winner", category: "showbiz", status: "open", totalVolume: 680000, betCount: 1580, creatorId: "CR001", createdAt: "2026-02-15", closesAt: "2026-04-10 22:00 PHT" },
];

export function getMarketById(id: string): OmsMarket | undefined {
  return MOCK_MARKETS.find(m => m.id === id);
}

/* ==================== TRANSACTIONS ==================== */
export type TxnType = "deposit" | "withdrawal";
export type TxnStatus = "completed" | "processing" | "pending" | "failed" | "review";
export type PaymentMethod = "GCash" | "Maya" | "Bank Transfer" | "7-Eleven" | "Cebuana";

export interface OmsTransaction {
  id: string;
  userId: string;
  user: string;
  type: TxnType;
  method: PaymentMethod;
  amount: number;
  fee: number;
  status: TxnStatus;
  reference: string;
  createdAt: string;
  needsReview: boolean;
}

export const MOCK_TRANSACTIONS: OmsTransaction[] = [
  { id: "TXN001", userId: "U004", user: "Ana Dela Cruz", type: "deposit", method: "Maya", amount: 20000, fee: 0, status: "completed", reference: "MAYA-2026031345678", createdAt: "2026-03-13 08:50 PHT", needsReview: false },
  { id: "TXN002", userId: "U002", user: "JM Reyes", type: "withdrawal", method: "GCash", amount: 12500, fee: 25, status: "processing", reference: "GC-2026031334567", createdAt: "2026-03-13 08:45 PHT", needsReview: false },
  { id: "TXN003", userId: "U006", user: "Mark Tan", type: "withdrawal", method: "GCash", amount: 45000, fee: 50, status: "review", reference: "GC-2026031323456", createdAt: "2026-03-13 08:40 PHT", needsReview: true },
  { id: "TXN004", userId: "U001", user: "Maria Santos", type: "deposit", method: "GCash", amount: 5000, fee: 0, status: "completed", reference: "GC-2026031312345", createdAt: "2026-03-13 08:35 PHT", needsReview: false },
  { id: "TXN005", userId: "U005", user: "Rosa Lim", type: "withdrawal", method: "Bank Transfer", amount: 78000, fee: 100, status: "review", reference: "BK-2026031301234", createdAt: "2026-03-13 08:30 PHT", needsReview: true },
  { id: "TXN006", userId: "U003", user: "Ken Villanueva", type: "deposit", method: "7-Eleven", amount: 2000, fee: 0, status: "completed", reference: "711-2026031390123", createdAt: "2026-03-13 08:20 PHT", needsReview: false },
  { id: "TXN007", userId: "U009", user: "Cherry Aquino", type: "withdrawal", method: "GCash", amount: 15000, fee: 25, status: "pending", reference: "GC-2026031389012", createdAt: "2026-03-13 08:10 PHT", needsReview: false },
  { id: "TXN008", userId: "U010", user: "Dennis Cruz", type: "deposit", method: "Maya", amount: 10000, fee: 0, status: "completed", reference: "MAYA-2026031378901", createdAt: "2026-03-13 08:00 PHT", needsReview: false },
  { id: "TXN009", userId: "U007", user: "Patricia Go", type: "deposit", method: "GCash", amount: 3000, fee: 0, status: "failed", reference: "GC-2026031367890", createdAt: "2026-03-13 07:50 PHT", needsReview: false },
  { id: "TXN010", userId: "U006", user: "Mark Tan", type: "withdrawal", method: "Maya", amount: 55000, fee: 50, status: "review", reference: "MAYA-2026031356789", createdAt: "2026-03-13 07:40 PHT", needsReview: true },
  { id: "TXN011", userId: "U008", user: "Bong Ramos", type: "withdrawal", method: "GCash", amount: 120000, fee: 100, status: "review", reference: "GC-2026031345678", createdAt: "2026-03-13 07:30 PHT", needsReview: true },
  { id: "TXN012", userId: "U001", user: "Maria Santos", type: "withdrawal", method: "GCash", amount: 8000, fee: 25, status: "completed", reference: "GC-2026031334567", createdAt: "2026-03-13 07:15 PHT", needsReview: false },
];

/* ==================== BETS ==================== */
export type BetStatus = "active" | "won" | "lost" | "void" | "pending";
export type BetType = "standard" | "fast_bet" | "limit_order";

export interface OmsBet {
  id: string;
  userId: string;
  user: string;
  marketId: string;
  market: string;
  type: BetType;
  selection: string;
  amount: number;
  odds: string;
  potentialPayout: number;
  status: BetStatus;
  placedAt: string;
  suspicious: boolean;
}

export const MOCK_BETS: OmsBet[] = [
  { id: "BET001", userId: "U001", user: "Maria Santos", marketId: "MKT001", market: "PBA Finals: Ginebra vs San Miguel", type: "standard", selection: "Ginebra", amount: 5000, odds: "1.65", potentialPayout: 8250, status: "active", placedAt: "2026-03-13 08:42 PHT", suspicious: false },
  { id: "BET002", userId: "U002", user: "JM Reyes", marketId: "MKT001", market: "PBA Finals: Ginebra vs San Miguel", type: "standard", selection: "San Miguel", amount: 3000, odds: "2.35", potentialPayout: 7050, status: "active", placedAt: "2026-03-13 08:38 PHT", suspicious: false },
  { id: "BET003", userId: "U005", user: "Rosa Lim", marketId: "MKT002", market: "Color Game Round #8832", type: "fast_bet", selection: "Pula", amount: 1000, odds: "x6", potentialPayout: 6000, status: "active", placedAt: "2026-03-13 08:35 PHT", suspicious: false },
  { id: "BET004", userId: "U006", user: "Mark Tan", marketId: "MKT003", market: "Boxing: Donaire vs Martinez", type: "limit_order", selection: "Donaire", amount: 25000, odds: "3.50", potentialPayout: 87500, status: "pending", placedAt: "2026-03-13 08:30 PHT", suspicious: true },
  { id: "BET005", userId: "U010", user: "Dennis Cruz", marketId: "MKT004", market: "MLBB M6 - ECHO vs ONIC", type: "standard", selection: "ECHO", amount: 2000, odds: "1.80", potentialPayout: 3600, status: "active", placedAt: "2026-03-13 08:25 PHT", suspicious: false },
  { id: "BET006", userId: "U003", user: "Ken Villanueva", marketId: "MKT002", market: "Color Game Round #8830", type: "fast_bet", selection: "Berde", amount: 500, odds: "x6", potentialPayout: 3000, status: "won", placedAt: "2026-03-13 07:55 PHT", suspicious: false },
  { id: "BET007", userId: "U004", user: "Ana Dela Cruz", marketId: "MKT007", market: "PCSO 6/58 MegaLotto", type: "standard", selection: "May Winner", amount: 10000, odds: "12.5", potentialPayout: 125000, status: "lost", placedAt: "2026-03-12 20:00 PHT", suspicious: false },
  { id: "BET008", userId: "U008", user: "Bong Ramos", marketId: "MKT002", market: "Color Game Round #8830", type: "fast_bet", selection: "Dilaw", amount: 50000, odds: "x6", potentialPayout: 300000, status: "void", placedAt: "2026-03-13 07:50 PHT", suspicious: true },
  { id: "BET009", userId: "U009", user: "Cherry Aquino", marketId: "MKT005", market: "Will it rain in Manila tomorrow?", type: "standard", selection: "YES", amount: 1500, odds: "1.45", potentialPayout: 2175, status: "won", placedAt: "2026-03-12 18:30 PHT", suspicious: false },
  { id: "BET010", userId: "U007", user: "Patricia Go", marketId: "MKT001", market: "PBA Finals: Ginebra vs San Miguel", type: "standard", selection: "Ginebra", amount: 500, odds: "1.65", potentialPayout: 825, status: "active", placedAt: "2026-03-13 08:20 PHT", suspicious: false },
  { id: "BET011", userId: "U006", user: "Mark Tan", marketId: "MKT002", market: "Color Game Round #8830", type: "fast_bet", selection: "Pula", amount: 45000, odds: "x6", potentialPayout: 270000, status: "active", placedAt: "2026-03-13 08:15 PHT", suspicious: true },
  { id: "BET012", userId: "U001", user: "Maria Santos", marketId: "MKT006", market: "BSP Rate Decision", type: "standard", selection: "Rates hold", amount: 8000, odds: "1.30", potentialPayout: 10400, status: "won", placedAt: "2026-03-06 14:00 PHT", suspicious: false },
];

/* ==================== CREATORS ==================== */
export type CreatorTier = "standard" | "verified" | "premium" | "elite";

export interface OmsCreator {
  id: string;
  name: string;
  email: string;
  tier: CreatorTier;
  status: "active" | "suspended" | "revoked";
  marketsCreated: number;
  marketsLive: number;
  totalVolume: number;
  revShare: number;
  earnings: number;
  rating: number;
  joinDate: string;
  lastActive: string;
}

export const MOCK_CREATORS: OmsCreator[] = [
  { id: "CR001", name: "Angel Santos", email: "angel.s@gmail.com", tier: "verified", status: "active", marketsCreated: 24, marketsLive: 3, totalVolume: 2800000, revShare: 2.5, earnings: 70000, rating: 4.7, joinDate: "2026-01-15", lastActive: "1 hr ago" },
  { id: "CR002", name: "Benny Gomez", email: "benny.g@gmail.com", tier: "premium", status: "active", marketsCreated: 56, marketsLive: 8, totalVolume: 8500000, revShare: 3.5, earnings: 297500, rating: 4.9, joinDate: "2025-09-20", lastActive: "15 min ago" },
  { id: "CR003", name: "Lisa Tan", email: "lisa.t@gmail.com", tier: "standard", status: "active", marketsCreated: 8, marketsLive: 1, totalVolume: 420000, revShare: 1.5, earnings: 6300, rating: 4.2, joinDate: "2026-02-28", lastActive: "3 hr ago" },
  { id: "CR004", name: "Ramon Cruz", email: "ramon.c@yahoo.com", tier: "elite", status: "active", marketsCreated: 120, marketsLive: 12, totalVolume: 25000000, revShare: 5.0, earnings: 1250000, rating: 4.95, joinDate: "2025-06-01", lastActive: "5 min ago" },
  { id: "CR005", name: "Dina Reyes", email: "dina.r@gmail.com", tier: "standard", status: "suspended", marketsCreated: 15, marketsLive: 0, totalVolume: 680000, revShare: 1.5, earnings: 10200, rating: 3.1, joinDate: "2025-12-10", lastActive: "1 week ago" },
];

/* ==================== CREATOR APPLICATIONS ==================== */
export type CreatorAppStatus = "pending" | "approved" | "rejected";

export interface OmsCreatorApp {
  id: string;
  name: string;
  email: string;
  userId: string;
  appliedDate: string;
  status: CreatorAppStatus;
  reason: string;
  experience: string;
  categories: string[];
  socialLinks: string;
  followers: number;
}

export const MOCK_CREATOR_APPS: OmsCreatorApp[] = [
  { id: "CA001", name: "Miguel Torres", email: "miguel.t@gmail.com", userId: "U011", appliedDate: "2026-03-12", status: "pending", reason: "I run a sports prediction Telegram group with 5K members. Want to create PBA and boxing markets.", experience: "3 years sports analysis", categories: ["Basketball", "Boxing"], socialLinks: "@MiguelPicks on TG", followers: 5200 },
  { id: "CA002", name: "Janine Cruz", email: "janine.c@gmail.com", userId: "U012", appliedDate: "2026-03-11", status: "pending", reason: "Professional esports caster for MPL PH. Deep knowledge of MLBB and Valorant scenes.", experience: "Esports caster, 2 years", categories: ["Esports"], socialLinks: "twitch.tv/JanineCasts", followers: 12000 },
  { id: "CA003", name: "Ricardo Lim", email: "ricky.l@yahoo.com", userId: "U013", appliedDate: "2026-03-10", status: "pending", reason: "Weather enthusiast, I track typhoons and want to create weather prediction markets for Filipino audience.", experience: "PAGASA hobbyist, 5 years", categories: ["Weather"], socialLinks: "fb.com/RickyWeather", followers: 3400 },
  { id: "CA004", name: "Angel Santos", email: "angel.s@gmail.com", userId: "U014", appliedDate: "2026-03-08", status: "approved", reason: "Entertainment blogger covering pageants and showbiz.", experience: "5 years entertainment blogging", categories: ["Showbiz"], socialLinks: "@AngelShowbiz on IG", followers: 28000 },
  { id: "CA005", name: "Paolo Rivera", email: "paolo.r@gmail.com", userId: "U015", appliedDate: "2026-03-05", status: "rejected", reason: "Want to make money creating markets.", experience: "None", categories: ["Economy"], socialLinks: "N/A", followers: 0 },
];

/* ==================== WALLETS ==================== */
export interface OmsWallet {
  id: string;
  name: string;
  email: string;
  balance: number;
  holdBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWinnings: number;
  totalLosses: number;
  pnl: number;
  activeBets: number;
  lastTx: string;
  status: "active" | "frozen" | "restricted";
}

export const MOCK_WALLETS: OmsWallet[] = [
  { id: "U001", name: "Maria Santos", email: "maria.s@gmail.com", balance: 45200, holdBalance: 12000, totalDeposits: 180000, totalWithdrawals: 92000, totalWinnings: 68000, totalLosses: 110800, pnl: -42800, activeBets: 5, lastTx: "2 min ago", status: "active" },
  { id: "U002", name: "JM Reyes", email: "jm.reyes@yahoo.com", balance: 12800, holdBalance: 3000, totalDeposits: 65000, totalWithdrawals: 28000, totalWinnings: 22000, totalLosses: 46200, pnl: -24200, activeBets: 2, lastTx: "15 min ago", status: "active" },
  { id: "U005", name: "Rosa Lim", email: "rosa.lim@gmail.com", balance: 78500, holdBalance: 45000, totalDeposits: 250000, totalWithdrawals: 120000, totalWinnings: 185000, totalLosses: 236500, pnl: -51500, activeBets: 8, lastTx: "32 min ago", status: "active" },
  { id: "U006", name: "Mark Tan", email: "mark.t@yahoo.com", balance: 120000, holdBalance: 80000, totalDeposits: 500000, totalWithdrawals: 280000, totalWinnings: 320000, totalLosses: 420000, pnl: -100000, activeBets: 12, lastTx: "5 min ago", status: "active" },
  { id: "U004", name: "Ana Dela Cruz", email: "ana.dc@outlook.com", balance: 0, holdBalance: 0, totalDeposits: 320000, totalWithdrawals: 250000, totalWinnings: 180000, totalLosses: 250000, pnl: -70000, activeBets: 0, lastTx: "3 days ago", status: "frozen" },
  { id: "U008", name: "Bong Ramos", email: "bong.r@hotmail.com", balance: 0, holdBalance: 0, totalDeposits: 780000, totalWithdrawals: 680000, totalWinnings: 520000, totalLosses: 620000, pnl: -100000, activeBets: 0, lastTx: "2 weeks ago", status: "restricted" },
  { id: "U009", name: "Cherry Aquino", email: "cherry.a@gmail.com", balance: 34600, holdBalance: 8000, totalDeposits: 95000, totalWithdrawals: 42000, totalWinnings: 56000, totalLosses: 74400, pnl: -18400, activeBets: 3, lastTx: "45 min ago", status: "active" },
  { id: "U010", name: "Dennis Cruz", email: "dennis.c@gmail.com", balance: 8900, holdBalance: 2000, totalDeposits: 42000, totalWithdrawals: 18000, totalWinnings: 15000, totalLosses: 30100, pnl: -15100, activeBets: 1, lastTx: "1 hr ago", status: "active" },
];

export type WalletTxType = "credit" | "debit" | "deposit" | "withdrawal" | "bet_win" | "bet_loss" | "promo" | "refund" | "correction";

export interface OmsWalletTx {
  id: string;
  type: WalletTxType;
  amount: number;
  balance: number;
  reason: string;
  admin: string;
  time: string;
}

export const MOCK_WALLET_TX: OmsWalletTx[] = [
  { id: "TX001", type: "deposit", amount: 20000, balance: 45200, reason: "GCash deposit", admin: "System", time: "2 min ago" },
  { id: "TX002", type: "bet_loss", amount: -5000, balance: 25200, reason: "PBA Finals — Ginebra (Lost)", admin: "System", time: "1 hr ago" },
  { id: "TX003", type: "bet_win", amount: 8500, balance: 30200, reason: "Color Game Round #8899 (Won)", admin: "System", time: "2 hr ago" },
  { id: "TX004", type: "credit", amount: 500, balance: 21700, reason: "Manual credit — customer compensation", admin: "Carlos Reyes", time: "3 hr ago" },
  { id: "TX005", type: "withdrawal", amount: -12500, balance: 21200, reason: "GCash withdrawal", admin: "System", time: "5 hr ago" },
  { id: "TX006", type: "promo", amount: 1000, balance: 33700, reason: "Welcome bonus credited", admin: "System", time: "1 day ago" },
  { id: "TX007", type: "refund", amount: 3000, balance: 32700, reason: "Market voided — Color Game #8850", admin: "Ana Dela Cruz", time: "1 day ago" },
  { id: "TX008", type: "correction", amount: -200, balance: 29700, reason: "Duplicate deposit correction", admin: "Miguel Torres", time: "2 days ago" },
];

/* ==================== NOTIFICATIONS (for notification center) ==================== */
export type NotifType = "alert" | "info" | "warning" | "success" | "system";
export type NotifPriority = "low" | "medium" | "high" | "critical";

export interface OmsNotification {
  id: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  source: string;
}

export const MOCK_NOTIFICATIONS: OmsNotification[] = [
  { id: "N001", type: "alert", priority: "critical", title: "High-value withdrawal flagged", message: "Mark Tan requested withdrawal of PHP 120,000 — exceeds single-txn threshold.", timestamp: "2 min ago", read: false, actionUrl: "/oms/finance", source: "Risk Engine" },
  { id: "N002", type: "warning", priority: "high", title: "Suspicious betting pattern", message: "3 bets from Mark Tan (U006) flagged for unusual volume on Color Game.", timestamp: "8 min ago", read: false, actionUrl: "/oms/bets", source: "Risk Engine" },
  { id: "N003", type: "info", priority: "medium", title: "New creator application", message: "Miguel Torres applied for Creator status — Sports category.", timestamp: "25 min ago", read: false, actionUrl: "/oms/creators", source: "Creator Mgmt" },
  { id: "N004", type: "success", priority: "low", title: "Market settled", message: 'PBA Finals Game 3 settled — Ginebra won. 1,842 bets processed.', timestamp: "1 hr ago", read: true, actionUrl: "/oms/markets", source: "Settlement" },
  { id: "N005", type: "info", priority: "medium", title: "New creator application", message: "Janine Cruz applied — Esports casting background, 12K Twitch followers.", timestamp: "2 hrs ago", read: true, actionUrl: "/oms/creators", source: "Creator Mgmt" },
  { id: "N006", type: "warning", priority: "high", title: "4 withdrawals pending review", message: "Withdrawal review queue has 4 items totaling PHP 298,000.", timestamp: "3 hrs ago", read: true, actionUrl: "/oms/finance", source: "Finance" },
  { id: "N007", type: "system", priority: "low", title: "Daily report generated", message: "March 13 daily report is ready for download.", timestamp: "6 hrs ago", read: true, actionUrl: "/oms/reports", source: "Reports" },
  { id: "N008", type: "alert", priority: "critical", title: "Account frozen", message: "Ana Dela Cruz (U004) account frozen due to identity verification failure.", timestamp: "1 day ago", read: true, actionUrl: "/oms/users", source: "Compliance" },
  { id: "N009", type: "info", priority: "low", title: "New support ticket", message: "Cherry Aquino submitted ticket #TK042 — withdrawal delay inquiry.", timestamp: "1 day ago", read: true, actionUrl: "/oms/support", source: "Support" },
  { id: "N010", type: "success", priority: "low", title: "Schema migration complete", message: "Tenant config migrated from v0 to v1 for Lucky Taya.", timestamp: "2 days ago", read: true, source: "System" },
];

/* ==================== PLATFORM STATS ==================== */
export interface OmsPlatformStats {
  totalUsers: number;
  activeToday: number;
  totalVolume24h: number;
  totalDeposits24h: number;
  totalWithdrawals24h: number;
  openMarkets: number;
  activeBets: number;
  pendingReviews: number;
  openTickets: number;
  creatorApplications: number;
}

export const MOCK_PLATFORM_STATS: OmsPlatformStats = {
  totalUsers: 48752,
  activeToday: 3841,
  totalVolume24h: 12500000,
  totalDeposits24h: 8200000,
  totalWithdrawals24h: 4300000,
  openMarkets: 24,
  activeBets: 8420,
  pendingReviews: 4,
  openTickets: 12,
  creatorApplications: 3,
};

/* ==================== DAILY CHART DATA ==================== */
export const MOCK_DAILY_FLOW = [
  { day: "Mon", deposits: 1200000, withdrawals: 850000 },
  { day: "Tue", deposits: 1350000, withdrawals: 920000 },
  { day: "Wed", deposits: 1100000, withdrawals: 780000 },
  { day: "Thu", deposits: 1450000, withdrawals: 1050000 },
  { day: "Fri", deposits: 1680000, withdrawals: 1200000 },
  { day: "Sat", deposits: 2100000, withdrawals: 1650000 },
  { day: "Sun", deposits: 1950000, withdrawals: 1400000 },
];

export const MOCK_PAYMENT_BREAKDOWN = [
  { method: "GCash", share: 62, volume: "PHP 42.3M", txns: 18400 },
  { method: "Maya", share: 24, volume: "PHP 16.4M", txns: 7100 },
  { method: "Bank Transfer", share: 8, volume: "PHP 5.5M", txns: 1200 },
  { method: "7-Eleven", share: 4, volume: "PHP 2.7M", txns: 2800 },
  { method: "Cebuana", share: 2, volume: "PHP 1.4M", txns: 890 },
];

/* ==================== COMMAND PALETTE ENTRIES ==================== */
export interface CommandEntry {
  id: string;
  label: string;
  category: "page" | "user" | "market" | "action";
  description: string;
  path: string;
  icon?: string;
  keywords: string[];
}

export function generateCommandEntries(): CommandEntry[] {
  const pages: CommandEntry[] = [
    { id: "pg-dashboard", label: "Dashboard", category: "page", description: "Merchant overview", path: "/oms/dashboard", keywords: ["dashboard", "home", "overview"] },
    { id: "pg-users", label: "User Management", category: "page", description: "Manage users & accounts", path: "/oms/users", keywords: ["users", "accounts", "management"] },
    { id: "pg-markets", label: "Markets", category: "page", description: "Active & settled markets", path: "/oms/markets", keywords: ["markets", "events", "betting"] },
    { id: "pg-bets", label: "Bets & Wagers", category: "page", description: "Individual bet records", path: "/oms/bets", keywords: ["bets", "wagers", "slips"] },
    { id: "pg-finance", label: "Finance", category: "page", description: "Deposits, withdrawals, review", path: "/oms/finance", keywords: ["finance", "deposits", "withdrawals", "transactions"] },
    { id: "pg-risk", label: "Risk Management", category: "page", description: "Risk alerts & flagged users", path: "/oms/risk", keywords: ["risk", "alerts", "suspicious", "flagged"] },
    { id: "pg-wallet", label: "Wallet Admin", category: "page", description: "User wallet balances", path: "/oms/wallet", keywords: ["wallet", "balance", "credits"] },
    { id: "pg-creators", label: "Creator Management", category: "page", description: "Creator applications & roster", path: "/oms/creators", keywords: ["creators", "applications"] },
    { id: "pg-rewards", label: "Rewards", category: "page", description: "Reward programs", path: "/oms/rewards", keywords: ["rewards", "bonuses", "programs"] },
    { id: "pg-affiliates", label: "Affiliates", category: "page", description: "Affiliate/agent management", path: "/oms/affiliates", keywords: ["affiliates", "agents", "referral"] },
    { id: "pg-reports", label: "Reports", category: "page", description: "Analytics & exports", path: "/oms/reports", keywords: ["reports", "analytics", "csv"] },
    { id: "pg-audit", label: "Audit Trail", category: "page", description: "System action logs", path: "/oms/audit", keywords: ["audit", "logs", "trail", "history"] },
    { id: "pg-support", label: "Support Tickets", category: "page", description: "Customer support queue", path: "/oms/support", keywords: ["support", "tickets", "help"] },
    { id: "pg-settings", label: "Settings", category: "page", description: "OMS configuration", path: "/oms/settings", keywords: ["settings", "config", "preferences"] },
    { id: "pg-paas", label: "PaaS Admin Config", category: "page", description: "Tenant config & permissions", path: "/oms/paas-config", keywords: ["paas", "config", "tenant", "admin"] },
    { id: "pg-payment-methods", label: "Payment Methods", category: "page", description: "Manage payment gateways & merchant assignments", path: "/oms/payment-methods", keywords: ["payment", "methods", "gcash", "maya", "bank", "gateway", "deposit", "withdraw"] },
    { id: "pg-payment-providers", label: "Payment Providers", category: "page", description: "Manage provider integrations, routing & failover", path: "/oms/payment-providers", keywords: ["payment", "providers", "paymongo", "xendit", "dragonpay", "coins", "pdax", "circle", "fireblocks", "routing", "failover"] },
  ];

  const users: CommandEntry[] = MOCK_USERS.slice(0, 10).map(u => ({
    id: `user-${u.id}`,
    label: u.name,
    category: "user" as const,
    description: `${u.id} · ${u.email}`,
    path: "/oms/users",
    keywords: [u.name.toLowerCase(), u.email.toLowerCase(), u.id.toLowerCase(), u.nickname.toLowerCase()],
  }));

  const markets: CommandEntry[] = MOCK_MARKETS.map(m => ({
    id: `mkt-${m.id}`,
    label: m.title,
    category: "market" as const,
    description: `${m.id} · ${m.status.toUpperCase()} · PHP ${(m.totalVolume / 1000000).toFixed(1)}M`,
    path: "/oms/markets",
    keywords: [m.title.toLowerCase(), m.id.toLowerCase(), m.category],
  }));

  const actions: CommandEntry[] = [
    { id: "act-export", label: "Export User Data", category: "action", description: "Download CSV from User Management", path: "/oms/users", keywords: ["export", "csv", "download"] },
    { id: "act-review", label: "Review Withdrawals", category: "action", description: "Open finance review queue", path: "/oms/finance", keywords: ["review", "approve", "withdrawal"] },
    { id: "act-risk-flags", label: "View Risk Flags", category: "action", description: "Check flagged activities", path: "/oms/risk", keywords: ["risk", "flag", "alert", "suspicious"] },
  ];

  return [...pages, ...users, ...markets, ...actions];
}

/* ==================== FORMATTERS ==================== */
export function formatPHP(amount: number): string {
  return `PHP ${amount.toLocaleString()}`;
}

export function formatCompactPHP(amount: number): string {
  if (amount >= 1_000_000) return `PHP ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PHP ${(amount / 1_000).toFixed(1)}K`;
  return `PHP ${amount.toLocaleString()}`;
}

/* ==================== USER RECORDS (rich, for User Management page) ==================== */
export type OmsUserType = "user" | "creator";
export type OmsChannel = "FG" | "organic" | "agent";
export type OmsSource = "" | "agent";

export interface OmsTradeRecord {
  id: string;
  marketName: string;
  side: "Buy" | "Sell";
  outcome: string;
  quantity: number;
  tradeVolume: number;
  currency: "FGUSD" | "USDT" | "USDC";
  tradeTime: string;
}

export interface OmsAssetInfo {
  totalAsset: number;
  available: number;
  positionValue: number;
  lockedBalance: number;
  withdrawFee: number;
  suspendTrading: boolean;
  suspendDeposit: boolean;
  suspendWithdraw: boolean;
  dailyWithdrawLimit: number;
  singleWithdrawMin: number;
  singleWithdrawMax: number;
  totalAnnualWithdrawal: number;
  whitelist: boolean;
  transactions: { hash: string; amount: number; type: string; time: string; chain: string }[];
}

export interface OmsUserRecord {
  id: string;
  uid: string;
  walletAddress: string;
  nickname: string;
  email: string;
  userType: OmsUserType;
  channel: OmsChannel;
  recentIP: string;
  recentGeo: string;
  lastLoginTime: string;
  source: OmsSource;
  agentName: string;
  totalTrades: number;
  totalVolume: number;
  settledPNL: number;
  trades: OmsTradeRecord[];
  asset: OmsAssetInfo;
  socialChannel: string;
  contactPhone: string;
  contactTelegram: string;
  contactWhatsApp: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
}

export const MOCK_USER_RECORDS: OmsUserRecord[] = [
  {
    id: "U001", uid: "1000001", walletAddress: "0x7a3B...F2c9", nickname: "maria_s", email: "maria.s@gmail.com",
    userType: "creator", channel: "FG", recentIP: "120.28.45.112", recentGeo: "Manila, PH",
    lastLoginTime: "2026-03-14 08:45", source: "", agentName: "",
    totalTrades: 234, totalVolume: 180000, settledPNL: 12500,
    trades: [
      { id: "T001", marketName: "PBA Finals - SMB vs Ginebra", side: "Buy", outcome: "SMB Win", quantity: 50, tradeVolume: 2500, currency: "FGUSD", tradeTime: "2026-03-14 08:30" },
      { id: "T002", marketName: "Manny Pacquiao Comeback Fight", side: "Sell", outcome: "Pacquiao KO", quantity: 20, tradeVolume: 1800, currency: "USDT", tradeTime: "2026-03-13 14:22" },
      { id: "T003", marketName: "PHP/USD Exchange Rate > 58", side: "Buy", outcome: "Yes", quantity: 100, tradeVolume: 5000, currency: "FGUSD", tradeTime: "2026-03-13 09:15" },
      { id: "T004", marketName: "UAAP Season MVP", side: "Buy", outcome: "Kevin Quiambao", quantity: 30, tradeVolume: 900, currency: "USDC", tradeTime: "2026-03-12 16:40" },
      { id: "T005", marketName: "Typhoon to Hit Luzon March", side: "Sell", outcome: "Yes", quantity: 75, tradeVolume: 3750, currency: "FGUSD", tradeTime: "2026-03-11 11:05" },
    ],
    asset: { totalAsset: 45200, available: 28500, positionValue: 12200, lockedBalance: 4500, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 100000, singleWithdrawMin: 100, singleWithdrawMax: 50000, totalAnnualWithdrawal: 320000, whitelist: false, transactions: [{ hash: "0xabc123...def456", amount: 5000, type: "Deposit", time: "2026-03-14 07:30", chain: "Polygon" }, { hash: "0x789fed...321abc", amount: 2000, type: "Withdraw", time: "2026-03-13 18:20", chain: "Polygon" }] },
    socialChannel: "Twitter", contactPhone: "+63 917 123 4567", contactTelegram: "@maria_s", contactWhatsApp: "+63 917 123 4567",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: true, emailNotifications: true,
  },
  {
    id: "U002", uid: "1000002", walletAddress: "0x3eD1...A8b2", nickname: "jm_reyes", email: "jm.reyes@yahoo.com",
    userType: "user", channel: "organic", recentIP: "202.57.32.88", recentGeo: "Cebu City, PH",
    lastLoginTime: "2026-03-14 07:20", source: "", agentName: "",
    totalTrades: 89, totalVolume: 65000, settledPNL: -3200,
    trades: [{ id: "T006", marketName: "PBA Finals - SMB vs Ginebra", side: "Buy", outcome: "Ginebra Win", quantity: 40, tradeVolume: 2000, currency: "FGUSD", tradeTime: "2026-03-14 06:50" }, { id: "T007", marketName: "Gilas vs Australia FIBA", side: "Buy", outcome: "Gilas Win", quantity: 60, tradeVolume: 1800, currency: "USDT", tradeTime: "2026-03-13 20:10" }],
    asset: { totalAsset: 12800, available: 8200, positionValue: 3600, lockedBalance: 1000, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 50000, singleWithdrawMin: 100, singleWithdrawMax: 25000, totalAnnualWithdrawal: 85000, whitelist: false, transactions: [{ hash: "0xdef456...abc123", amount: 3000, type: "Deposit", time: "2026-03-12 09:00", chain: "Polygon" }] },
    socialChannel: "", contactPhone: "+63 918 234 5678", contactTelegram: "", contactWhatsApp: "",
    language: "Filipino", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: false, emailNotifications: true,
  },
  {
    id: "U003", uid: "1000003", walletAddress: "0x91cF...5Da7", nickname: "ken_villa", email: "ken.v@gmail.com",
    userType: "user", channel: "agent", recentIP: "175.176.90.44", recentGeo: "Davao, PH",
    lastLoginTime: "2026-03-14 05:10", source: "agent", agentName: "AgentMike_PH",
    totalTrades: 12, totalVolume: 15000, settledPNL: 800,
    trades: [{ id: "T008", marketName: "Color Game Red vs Blue", side: "Buy", outcome: "Red", quantity: 25, tradeVolume: 500, currency: "FGUSD", tradeTime: "2026-03-14 04:55" }],
    asset: { totalAsset: 5400, available: 4100, positionValue: 900, lockedBalance: 400, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 20000, singleWithdrawMin: 50, singleWithdrawMax: 10000, totalAnnualWithdrawal: 12000, whitelist: false, transactions: [] },
    socialChannel: "", contactPhone: "+63 919 345 6789", contactTelegram: "", contactWhatsApp: "",
    language: "Filipino", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: false, emailNotifications: false,
  },
  {
    id: "U004", uid: "1000004", walletAddress: "0xB4a2...9Ee1", nickname: "ana_dc", email: "ana.dc@outlook.com",
    userType: "creator", channel: "FG", recentIP: "49.144.22.90", recentGeo: "Quezon City, PH",
    lastLoginTime: "2026-03-11 22:15", source: "", agentName: "",
    totalTrades: 567, totalVolume: 320000, settledPNL: 45200,
    trades: [{ id: "T009", marketName: "Bongbong Marcos Approval >50%", side: "Sell", outcome: "Yes", quantity: 200, tradeVolume: 10000, currency: "FGUSD", tradeTime: "2026-03-11 21:40" }, { id: "T010", marketName: "Miss Universe Philippines 2026", side: "Buy", outcome: "Michelle Dee", quantity: 80, tradeVolume: 4000, currency: "USDT", tradeTime: "2026-03-10 15:30" }, { id: "T011", marketName: "Bitcoin > $100k March", side: "Buy", outcome: "Yes", quantity: 150, tradeVolume: 7500, currency: "USDC", tradeTime: "2026-03-09 08:45" }],
    asset: { totalAsset: 0, available: 0, positionValue: 0, lockedBalance: 0, withdrawFee: 1.5, suspendTrading: true, suspendDeposit: false, suspendWithdraw: true, dailyWithdrawLimit: 100000, singleWithdrawMin: 100, singleWithdrawMax: 50000, totalAnnualWithdrawal: 280000, whitelist: true, transactions: [] },
    socialChannel: "YouTube", contactPhone: "+63 920 456 7890", contactTelegram: "@ana_dc_creator", contactWhatsApp: "+63 920 456 7890",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: true, emailNotifications: true,
  },
  {
    id: "U005", uid: "1000005", walletAddress: "0xC7f8...3Bb4", nickname: "rosa_lim", email: "rosa.lim@gmail.com",
    userType: "user", channel: "FG", recentIP: "112.198.45.67", recentGeo: "Makati, PH",
    lastLoginTime: "2026-03-14 08:12", source: "", agentName: "",
    totalTrades: 45, totalVolume: 250000, settledPNL: 18900,
    trades: [{ id: "T012", marketName: "PBA Finals - SMB vs Ginebra", side: "Buy", outcome: "SMB Win", quantity: 300, tradeVolume: 15000, currency: "FGUSD", tradeTime: "2026-03-14 08:00" }],
    asset: { totalAsset: 78500, available: 52000, positionValue: 18500, lockedBalance: 8000, withdrawFee: 1.0, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 200000, singleWithdrawMin: 100, singleWithdrawMax: 100000, totalAnnualWithdrawal: 450000, whitelist: true, transactions: [{ hash: "0x111aaa...222bbb", amount: 20000, type: "Deposit", time: "2026-03-14 07:00", chain: "Ethereum" }, { hash: "0x333ccc...444ddd", amount: 10000, type: "Withdraw", time: "2026-03-13 14:00", chain: "Polygon" }, { hash: "0x555eee...666fff", amount: 5000, type: "Deposit", time: "2026-03-12 09:30", chain: "Polygon" }] },
    socialChannel: "", contactPhone: "+63 921 567 8901", contactTelegram: "", contactWhatsApp: "",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: true, emailNotifications: true,
  },
  {
    id: "U006", uid: "1000006", walletAddress: "0xDe9A...7Fc3", nickname: "mark_tan88", email: "mark.t@yahoo.com",
    userType: "creator", channel: "organic", recentIP: "180.190.12.33", recentGeo: "Pasig, PH",
    lastLoginTime: "2026-03-14 08:38", source: "", agentName: "",
    totalTrades: 890, totalVolume: 500000, settledPNL: 67300,
    trades: [{ id: "T013", marketName: "DOTA 2 TI SEA Qualifier", side: "Buy", outcome: "Blacklist Win", quantity: 100, tradeVolume: 5000, currency: "FGUSD", tradeTime: "2026-03-14 08:20" }, { id: "T014", marketName: "NBA MVP 2026", side: "Buy", outcome: "Luka Doncic", quantity: 50, tradeVolume: 2500, currency: "USDT", tradeTime: "2026-03-13 22:15" }],
    asset: { totalAsset: 120000, available: 75000, positionValue: 35000, lockedBalance: 10000, withdrawFee: 0.8, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 500000, singleWithdrawMin: 100, singleWithdrawMax: 200000, totalAnnualWithdrawal: 1200000, whitelist: true, transactions: [{ hash: "0xaaa111...bbb222", amount: 50000, type: "Deposit", time: "2026-03-14 07:45", chain: "Ethereum" }] },
    socialChannel: "Twitch", contactPhone: "+63 922 678 9012", contactTelegram: "@marktan88", contactWhatsApp: "+63 922 678 9012",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: true, emailNotifications: true,
  },
  {
    id: "U007", uid: "1000007", walletAddress: "0xF1b5...2Ac6", nickname: "pat_go", email: "pat.go@gmail.com",
    userType: "user", channel: "agent", recentIP: "210.213.78.90", recentGeo: "Taguig, PH",
    lastLoginTime: "2026-03-14 04:30", source: "agent", agentName: "SuperAgent_MNL",
    totalTrades: 8, totalVolume: 5000, settledPNL: -200,
    trades: [{ id: "T015", marketName: "Color Game Red vs Blue", side: "Buy", outcome: "Blue", quantity: 10, tradeVolume: 200, currency: "FGUSD", tradeTime: "2026-03-14 04:15" }],
    asset: { totalAsset: 2300, available: 1800, positionValue: 300, lockedBalance: 200, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 10000, singleWithdrawMin: 50, singleWithdrawMax: 5000, totalAnnualWithdrawal: 3500, whitelist: false, transactions: [] },
    socialChannel: "", contactPhone: "+63 923 789 0123", contactTelegram: "", contactWhatsApp: "",
    language: "Filipino", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: false, emailNotifications: false,
  },
  {
    id: "U008", uid: "1000008", walletAddress: "0x2Cd3...8Ef0", nickname: "bong_ramos", email: "bong.r@hotmail.com",
    userType: "user", channel: "FG", recentIP: "119.93.55.21", recentGeo: "Pasay, PH",
    lastLoginTime: "2026-03-01 11:05", source: "", agentName: "",
    totalTrades: 1200, totalVolume: 780000, settledPNL: -45600,
    trades: [{ id: "T016", marketName: "Sabong Online Championship", side: "Buy", outcome: "Meron", quantity: 500, tradeVolume: 25000, currency: "FGUSD", tradeTime: "2026-02-28 22:30" }],
    asset: { totalAsset: 0, available: 0, positionValue: 0, lockedBalance: 0, withdrawFee: 1.5, suspendTrading: true, suspendDeposit: true, suspendWithdraw: true, dailyWithdrawLimit: 0, singleWithdrawMin: 0, singleWithdrawMax: 0, totalAnnualWithdrawal: 650000, whitelist: false, transactions: [] },
    socialChannel: "", contactPhone: "+63 924 890 1234", contactTelegram: "", contactWhatsApp: "",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: false, emailNotifications: false,
  },
  {
    id: "U009", uid: "1000009", walletAddress: "0x5Af2...1Dc4", nickname: "cherry_aq", email: "cherry.a@gmail.com",
    userType: "user", channel: "agent", recentIP: "122.54.33.78", recentGeo: "Mandaluyong, PH",
    lastLoginTime: "2026-03-14 07:50", source: "agent", agentName: "AgentMike_PH",
    totalTrades: 156, totalVolume: 95000, settledPNL: 6800,
    trades: [{ id: "T017", marketName: "Will It Rain in Manila Tomorrow", side: "Buy", outcome: "Yes", quantity: 40, tradeVolume: 800, currency: "FGUSD", tradeTime: "2026-03-14 07:30" }, { id: "T018", marketName: "PBA Finals - SMB vs Ginebra", side: "Sell", outcome: "SMB Win", quantity: 20, tradeVolume: 1000, currency: "USDT", tradeTime: "2026-03-13 19:45" }],
    asset: { totalAsset: 34600, available: 22000, positionValue: 8600, lockedBalance: 4000, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 50000, singleWithdrawMin: 100, singleWithdrawMax: 25000, totalAnnualWithdrawal: 78000, whitelist: false, transactions: [{ hash: "0xfed987...654cba", amount: 8000, type: "Deposit", time: "2026-03-13 10:00", chain: "Polygon" }] },
    socialChannel: "", contactPhone: "+63 925 901 2345", contactTelegram: "", contactWhatsApp: "",
    language: "Filipino", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: false, emailNotifications: true,
  },
  {
    id: "U010", uid: "1000010", walletAddress: "0x8Bc1...6Ga5", nickname: "dennis_c", email: "dennis.c@gmail.com",
    userType: "user", channel: "organic", recentIP: "203.177.88.55", recentGeo: "Antipolo, PH",
    lastLoginTime: "2026-03-14 07:00", source: "", agentName: "",
    totalTrades: 67, totalVolume: 42000, settledPNL: 2100,
    trades: [{ id: "T019", marketName: "Lotto 6/58 Jackpot > ₱100M", side: "Buy", outcome: "Yes", quantity: 30, tradeVolume: 600, currency: "FGUSD", tradeTime: "2026-03-14 06:45" }],
    asset: { totalAsset: 8900, available: 6200, positionValue: 1800, lockedBalance: 900, withdrawFee: 1.5, suspendTrading: false, suspendDeposit: false, suspendWithdraw: false, dailyWithdrawLimit: 30000, singleWithdrawMin: 50, singleWithdrawMax: 15000, totalAnnualWithdrawal: 35000, whitelist: false, transactions: [{ hash: "0x123abc...456def", amount: 2000, type: "Deposit", time: "2026-03-13 08:30", chain: "Polygon" }] },
    socialChannel: "", contactPhone: "+63 926 012 3456", contactTelegram: "", contactWhatsApp: "",
    language: "English", timezone: "Asia/Manila (UTC+8)", twoFactorEnabled: true, emailNotifications: true,
  },
];