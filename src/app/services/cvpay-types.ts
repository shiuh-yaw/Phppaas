/**
 * CVPay Fiat API TypeScript Type Definitions
 * Based on CVPay Merchant API Documentation
 */

/* ==================== COMMON TYPES ==================== */

export type CVPayCurrency = "PHP" | "USD" | "CNY" | "USDT" | "USDC" | "DAI";
export type CVPayLanguage = "en" | "zh-CN" | "tl";

export type CVPayTransactionStatus =
  | "PENDING"      // Transaction created, awaiting payment
  | "PROCESSING"   // Payment received, processing
  | "SUCCESS"      // Completed successfully
  | "FAILED"       // Transaction failed
  | "CANCELLED"    // Cancelled by user or timeout
  | "EXPIRED"      // Payment window expired
  | "REFUNDING"    // Refund in progress
  | "REFUNDED";    // Refund completed

export type CVPayPaymentMethod =
  // E-Wallets
  | "GCASH"
  | "PAYMAYA"
  | "GRABPAY"
  | "SHOPEEPAY"
  | "COINS_PH"
  // Banks
  | "BDO"
  | "BPI"
  | "UNIONBANK"
  | "METROBANK"
  | "LANDBANK"
  | "RCBC"
  | "PNB"
  | "SECURITY_BANK"
  // OTC
  | "7ELEVEN"
  | "CEBUANA"
  | "MLHUILLIER"
  | "PALAWAN"
  | "WESTERN_UNION"
  // Online Banking
  | "INSTAPAY"
  | "PESONET"
  // Cards
  | "VISA"
  | "MASTERCARD"
  // Stablecoins
  | "USDT_TRC20"
  | "USDT_ERC20"
  | "USDC_POLYGON"
  | "USDC_SOLANA"
  | "DAI_ERC20";

export type CVPayChannelType = "EWALLET" | "BANK" | "OTC" | "CARD" | "ONLINE_BANKING" | "STABLECOIN";

/* ==================== REQUEST TYPES ==================== */

export interface CVPayBaseRequest {
  merchantId: string;
  timestamp: number;
  nonce: string;
  sign: string; // HMAC-SHA256 signature
}

export interface CVPayDepositRequest extends CVPayBaseRequest {
  merchantOrderNo: string;    // Unique order ID from merchant
  amount: string;              // Amount in decimal string format
  currency: CVPayCurrency;
  paymentMethod: CVPayPaymentMethod;
  notifyUrl: string;           // Webhook callback URL
  returnUrl: string;           // User redirect URL after payment
  userId: string;              // End user ID
  userName?: string;           // End user name
  userEmail?: string;          // End user email
  userPhone?: string;          // End user phone
  description?: string;        // Transaction description
  expireTime?: number;         // Payment expiry time in seconds (default: 1800)
  language?: CVPayLanguage;
  extraData?: Record<string, any>; // Additional merchant data
}

export interface CVPayWithdrawalRequest extends CVPayBaseRequest {
  merchantOrderNo: string;
  amount: string;
  currency: CVPayCurrency;
  paymentMethod: CVPayPaymentMethod;
  notifyUrl: string;
  userId: string;
  // Withdrawal-specific fields
  accountNumber: string;       // Recipient account number/mobile
  accountName: string;         // Recipient account holder name
  bankCode?: string;           // Bank code (for bank transfers)
  branchCode?: string;         // Bank branch code (if required)
  description?: string;
  extraData?: Record<string, any>;
}

export interface CVPayQueryRequest extends CVPayBaseRequest {
  merchantOrderNo?: string;    // Query by merchant order ID
  cvpayOrderNo?: string;       // Query by CVPay transaction ID
}

export interface CVPayBalanceRequest extends CVPayBaseRequest {}

export interface CVPayMerchantInfoRequest extends CVPayBaseRequest {}

/* ==================== RESPONSE TYPES ==================== */

export interface CVPayBaseResponse {
  code: string;                // Response code: "0000" = success
  message: string;             // Response message
  timestamp: number;
  sign: string;
}

export interface CVPayDepositResponse extends CVPayBaseResponse {
  data: {
    cvpayOrderNo: string;      // CVPay transaction ID
    merchantOrderNo: string;
    amount: string;
    currency: CVPayCurrency;
    paymentMethod: CVPayPaymentMethod;
    status: CVPayTransactionStatus;
    paymentUrl?: string;       // Payment page URL (redirect user here)
    qrCodeUrl?: string;        // QR code for payment (if applicable)
    expireTime: number;        // Payment expiry timestamp
    createdAt: number;
  };
}

export interface CVPayWithdrawalResponse extends CVPayBaseResponse {
  data: {
    cvpayOrderNo: string;
    merchantOrderNo: string;
    amount: string;
    currency: CVPayCurrency;
    paymentMethod: CVPayPaymentMethod;
    status: CVPayTransactionStatus;
    accountNumber: string;
    accountName: string;
    fee: string;               // Withdrawal fee
    actualAmount: string;      // Amount after fee deduction
    estimatedTime: number;     // Estimated completion time in seconds
    createdAt: number;
  };
}

export interface CVPayQueryResponse extends CVPayBaseResponse {
  data: {
    cvpayOrderNo: string;
    merchantOrderNo: string;
    amount: string;
    currency: CVPayCurrency;
    paymentMethod: CVPayPaymentMethod;
    status: CVPayTransactionStatus;
    actualAmount?: string;     // Actual amount credited/debited
    fee?: string;
    createdAt: number;
    completedAt?: number;      // Completion timestamp
    failureReason?: string;    // Failure reason (if status is FAILED)
    extraData?: Record<string, any>;
  };
}

export interface CVPayBalanceResponse extends CVPayBaseResponse {
  data: {
    merchantId: string;
    availableBalance: string;  // Available balance
    frozenBalance: string;     // Frozen/pending balance
    totalBalance: string;      // Total balance
    currency: CVPayCurrency;
    updatedAt: number;
  };
}

export interface CVPayMerchantInfoResponse extends CVPayBaseResponse {
  data: {
    merchantId: string;
    merchantName: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    supportedMethods: CVPayPaymentMethod[];
    supportedCurrencies: CVPayCurrency[];
    depositLimits: {
      min: string;
      max: string;
      dailyLimit: string;
    };
    withdrawalLimits: {
      min: string;
      max: string;
      dailyLimit: string;
    };
    feeConfig: {
      depositFee: string;      // Percentage or fixed amount
      withdrawalFee: string;
    };
    createdAt: number;
  };
}

/* ==================== WEBHOOK TYPES ==================== */

export interface CVPayWebhookNotification {
  merchantId: string;
  cvpayOrderNo: string;
  merchantOrderNo: string;
  amount: string;
  currency: CVPayCurrency;
  paymentMethod: CVPayPaymentMethod;
  status: CVPayTransactionStatus;
  actualAmount?: string;
  fee?: string;
  completedAt?: number;
  failureReason?: string;
  extraData?: Record<string, any>;
  timestamp: number;
  sign: string;              // HMAC-SHA256 signature for verification
}

/* ==================== ERROR CODES ==================== */

export const CVPayErrorCodes = {
  SUCCESS: "0000",
  INVALID_SIGNATURE: "1001",
  INVALID_MERCHANT: "1002",
  INVALID_PARAMS: "1003",
  DUPLICATE_ORDER: "1004",
  INSUFFICIENT_BALANCE: "1005",
  PAYMENT_METHOD_UNAVAILABLE: "1006",
  AMOUNT_LIMIT_EXCEEDED: "1007",
  MERCHANT_SUSPENDED: "1008",
  ORDER_NOT_FOUND: "1009",
  ORDER_EXPIRED: "1010",
  SYSTEM_ERROR: "9999",
} as const;

/* ==================== LOCAL APPLICATION TYPES ==================== */

export interface FiatTransaction {
  id: string;
  userId: string;
  tenantId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  
  // CVPay fields
  cvpayOrderNo?: string;
  merchantOrderNo: string;
  
  // Amount fields
  amount: number;
  currency: CVPayCurrency;
  fee: number;
  actualAmount: number;       // Amount after fees
  
  // Payment details
  paymentMethod: CVPayPaymentMethod;
  channelType: CVPayChannelType;
  
  // Status tracking
  status: CVPayTransactionStatus;
  statusHistory: Array<{
    status: CVPayTransactionStatus;
    timestamp: number;
    note?: string;
  }>;
  
  // User account details (for withdrawals)
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  
  // URLs
  paymentUrl?: string;
  qrCodeUrl?: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  expireAt?: number;
  
  // Additional info
  description?: string;
  failureReason?: string;
  adminNote?: string;
  approvedBy?: string;
  approvedAt?: number;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  extraData?: Record<string, any>;
}

export interface FiatGatewayConfig {
  id: string;
  tenantId: string;
  provider: "CVPAY";
  
  // Credentials
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  
  // Environment
  environment: "SANDBOX" | "PRODUCTION";
  apiBaseUrl: string;
  
  // Settings
  enabled: boolean;
  supportedMethods: CVPayPaymentMethod[];
  supportedCurrencies: CVPayCurrency[];
  
  // Limits
  depositMin: number;
  depositMax: number;
  withdrawalMin: number;
  withdrawalMax: number;
  dailyDepositLimit: number;
  dailyWithdrawalLimit: number;
  
  // Fees
  depositFeeType: "PERCENTAGE" | "FIXED";
  depositFeeValue: number;
  withdrawalFeeType: "PERCENTAGE" | "FIXED";
  withdrawalFeeValue: number;
  
  // URLs
  notifyUrl: string;         // Webhook callback URL
  returnUrl: string;         // User return URL
  
  // Auto-approval settings
  autoApproveDeposits: boolean;
  autoApproveWithdrawals: boolean;
  autoApprovalThreshold: number; // Max amount for auto-approval
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}

export interface PaymentMethodInfo {
  id: CVPayPaymentMethod;
  name: string;
  nameLocal: string;         // Localized name (Tagalog)
  icon: string;
  color: string;
  textColor: string;
  channelType: CVPayChannelType;
  
  // Limits
  minAmount: number;
  maxAmount: number;
  
  // Fees & timing
  fee: string;
  feeType: "FREE" | "FIXED" | "PERCENTAGE";
  processingTime: string;
  
  // Availability
  available: boolean;
  popular?: boolean;
  
  // Requirements
  requiresAccountNumber: boolean;
  requiresAccountName: boolean;
  requiresBankCode: boolean;
  requiresBranchCode: boolean;
}