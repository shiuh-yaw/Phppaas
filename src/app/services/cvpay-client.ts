/**
 * CVPay Fiat API Client
 * Handles all API communication with CVPay gateway
 */

import type {
  CVPayDepositRequest,
  CVPayDepositResponse,
  CVPayWithdrawalRequest,
  CVPayWithdrawalResponse,
  CVPayQueryRequest,
  CVPayQueryResponse,
  CVPayBalanceRequest,
  CVPayBalanceResponse,
  CVPayMerchantInfoRequest,
  CVPayMerchantInfoResponse,
  CVPayBaseResponse,
  FiatGatewayConfig,
} from "./cvpay-types";

/* ==================== CRYPTO UTILITIES ==================== */

/**
 * Generate HMAC-SHA256 signature for API requests
 * In production, this should use Web Crypto API
 */
async function generateSignature(
  params: Record<string, any>,
  apiSecret: string
): Promise<string> {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .map(key => `${key}=${params[key]}`)
    .join("&");
  
  const stringToSign = paramString + "&key=" + apiSecret;
  
  // In a real implementation, use Web Crypto API:
  // const encoder = new TextEncoder();
  // const data = encoder.encode(stringToSign);
  // const keyData = encoder.encode(apiSecret);
  // const cryptoKey = await crypto.subtle.importKey(
  //   "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  // );
  // const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  // return Array.from(new Uint8Array(signature))
  //   .map(b => b.toString(16).padStart(2, "0"))
  //   .join("");
  
  // Mock signature for demo
  return `mock_signature_${Date.now()}`;
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  payload: Record<string, any>,
  signature: string,
  apiSecret: string
): Promise<boolean> {
  const calculatedSignature = await generateSignature(payload, apiSecret);
  return calculatedSignature === signature;
}

/**
 * Generate unique nonce for request
 */
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/* ==================== API CLIENT ==================== */

export class CVPayClient {
  private config: FiatGatewayConfig;

  constructor(config: FiatGatewayConfig) {
    this.config = config;
  }

  /**
   * Build base request parameters
   */
  private async buildBaseParams(): Promise<{
    merchantId: string;
    timestamp: number;
    nonce: string;
  }> {
    return {
      merchantId: this.config.merchantId,
      timestamp: Date.now(),
      nonce: generateNonce(),
    };
  }

  /**
   * Make API request
   */
  private async request<T extends CVPayBaseResponse>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T> {
    // Add signature
    const signature = await generateSignature(params, this.config.apiSecret);
    const requestData = { ...params, sign: signature };

    // Add API key to headers
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": this.config.apiKey,
      "X-Merchant-Id": this.config.merchantId,
    };

    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`CVPay API Error: ${response.status} ${response.statusText}`);
    }

    const data: T = await response.json();

    // Verify response signature
    const { sign, ...responseParams } = data;
    const expectedSignature = await generateSignature(responseParams, this.config.apiSecret);
    
    // In production, strictly verify:
    // if (sign !== expectedSignature) {
    //   throw new Error("Invalid response signature");
    // }

    if (data.code !== "0000") {
      throw new CVPayError(data.code, data.message);
    }

    return data;
  }

  /**
   * Create deposit transaction
   */
  async createDeposit(
    params: Omit<CVPayDepositRequest, keyof typeof CVPayClient.prototype.buildBaseParams | "sign">
  ): Promise<CVPayDepositResponse> {
    const baseParams = await this.buildBaseParams();
    const fullParams = { ...baseParams, ...params };
    
    return this.request<CVPayDepositResponse>("/api/v1/deposit/create", fullParams);
  }

  /**
   * Create withdrawal transaction
   */
  async createWithdrawal(
    params: Omit<CVPayWithdrawalRequest, keyof typeof CVPayClient.prototype.buildBaseParams | "sign">
  ): Promise<CVPayWithdrawalResponse> {
    const baseParams = await this.buildBaseParams();
    const fullParams = { ...baseParams, ...params };
    
    return this.request<CVPayWithdrawalResponse>("/api/v1/withdrawal/create", fullParams);
  }

  /**
   * Query transaction status
   */
  async queryTransaction(
    params: Omit<CVPayQueryRequest, keyof typeof CVPayClient.prototype.buildBaseParams | "sign">
  ): Promise<CVPayQueryResponse> {
    const baseParams = await this.buildBaseParams();
    const fullParams = { ...baseParams, ...params };
    
    return this.request<CVPayQueryResponse>("/api/v1/transaction/query", fullParams);
  }

  /**
   * Get merchant balance
   */
  async getBalance(): Promise<CVPayBalanceResponse> {
    const baseParams = await this.buildBaseParams();
    
    return this.request<CVPayBalanceResponse>("/api/v1/merchant/balance", baseParams);
  }

  /**
   * Get merchant info
   */
  async getMerchantInfo(): Promise<CVPayMerchantInfoResponse> {
    const baseParams = await this.buildBaseParams();
    
    return this.request<CVPayMerchantInfoResponse>("/api/v1/merchant/info", baseParams);
  }
}

/* ==================== ERROR HANDLING ==================== */

export class CVPayError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "CVPayError";
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(language: "en" | "tl" = "en"): string {
    const messages: Record<string, { en: string; tl: string }> = {
      "1001": {
        en: "Invalid request signature. Please try again.",
        tl: "May mali sa kahilingan. Subukan muli.",
      },
      "1002": {
        en: "Invalid merchant account.",
        tl: "Hindi wastong merchant account.",
      },
      "1003": {
        en: "Invalid request parameters. Please check your input.",
        tl: "May mali sa iyong input. Suriin at subukan muli.",
      },
      "1004": {
        en: "Duplicate transaction. Please check your transaction history.",
        tl: "Duplicate na transaksyon. Tingnan ang iyong history.",
      },
      "1005": {
        en: "Insufficient balance.",
        tl: "Kulang ang balanse.",
      },
      "1006": {
        en: "Payment method temporarily unavailable. Please try another method.",
        tl: "Pansamantalang hindi available ang paraan ng bayad. Pumili ng iba.",
      },
      "1007": {
        en: "Amount exceeds limit. Please enter a smaller amount.",
        tl: "Sobra sa limit ang halaga. Maglagay ng mas maliit.",
      },
      "1008": {
        en: "Service temporarily suspended. Please contact support.",
        tl: "Pansamantalang suspendido ang serbisyo. Kontakin ang support.",
      },
      "1009": {
        en: "Transaction not found.",
        tl: "Hindi mahanap ang transaksyon.",
      },
      "1010": {
        en: "Transaction expired. Please create a new transaction.",
        tl: "Nag-expire na ang transaksyon. Gumawa ng bago.",
      },
      "9999": {
        en: "System error. Please try again later.",
        tl: "May error sa system. Subukan mamaya.",
      },
    };

    return messages[this.code]?.[language] || this.message;
  }
}

/* ==================== MOCK CLIENT (for development) ==================== */

export class MockCVPayClient extends CVPayClient {
  async createDeposit(params: any): Promise<CVPayDepositResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      code: "0000",
      message: "Success",
      timestamp: Date.now(),
      sign: "mock_signature",
      data: {
        cvpayOrderNo: `CVP${Date.now()}`,
        merchantOrderNo: params.merchantOrderNo,
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.paymentMethod,
        status: "PENDING",
        paymentUrl: `https://payment.cvpay.org/pay/${params.merchantOrderNo}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=CVPAY_${params.merchantOrderNo}`,
        expireTime: Date.now() + 30 * 60 * 1000, // 30 minutes
        createdAt: Date.now(),
      },
    };
  }

  async createWithdrawal(params: any): Promise<CVPayWithdrawalResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const amount = parseFloat(params.amount);
    const fee = amount * 0.01; // 1% fee
    
    return {
      code: "0000",
      message: "Success",
      timestamp: Date.now(),
      sign: "mock_signature",
      data: {
        cvpayOrderNo: `CVW${Date.now()}`,
        merchantOrderNo: params.merchantOrderNo,
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.paymentMethod,
        status: "PROCESSING",
        accountNumber: params.accountNumber,
        accountName: params.accountName,
        fee: fee.toFixed(2),
        actualAmount: (amount - fee).toFixed(2),
        estimatedTime: 180, // 3 minutes
        createdAt: Date.now(),
      },
    };
  }

  async queryTransaction(params: any): Promise<CVPayQueryResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      code: "0000",
      message: "Success",
      timestamp: Date.now(),
      sign: "mock_signature",
      data: {
        cvpayOrderNo: params.cvpayOrderNo || `CVP${Date.now()}`,
        merchantOrderNo: params.merchantOrderNo || `ORD${Date.now()}`,
        amount: "1000.00",
        currency: "PHP",
        paymentMethod: "GCASH",
        status: "SUCCESS",
        actualAmount: "1000.00",
        fee: "0.00",
        createdAt: Date.now() - 5 * 60 * 1000,
        completedAt: Date.now(),
      },
    };
  }

  async getBalance(): Promise<CVPayBalanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      code: "0000",
      message: "Success",
      timestamp: Date.now(),
      sign: "mock_signature",
      data: {
        merchantId: this.config.merchantId,
        availableBalance: "125000.50",
        frozenBalance: "5000.00",
        totalBalance: "130000.50",
        currency: "PHP",
        updatedAt: Date.now(),
      },
    };
  }

  async getMerchantInfo(): Promise<CVPayMerchantInfoResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      code: "0000",
      message: "Success",
      timestamp: Date.now(),
      sign: "mock_signature",
      data: {
        merchantId: this.config.merchantId,
        merchantName: "ForeGate / Lucky Taya",
        status: "ACTIVE",
        supportedMethods: ["GCASH", "PAYMAYA", "BDO", "BPI", "7ELEVEN"],
        supportedCurrencies: ["PHP"],
        depositLimits: {
          min: "100.00",
          max: "100000.00",
          dailyLimit: "500000.00",
        },
        withdrawalLimits: {
          min: "100.00",
          max: "100000.00",
          dailyLimit: "500000.00",
        },
        feeConfig: {
          depositFee: "0%",
          withdrawalFee: "1%",
        },
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
      },
    };
  }

  private config: FiatGatewayConfig;
  
  constructor(config: FiatGatewayConfig) {
    super(config);
    this.config = config;
  }
}

/* ==================== CLIENT FACTORY ==================== */

/**
 * Create CVPay client instance
 */
export function createCVPayClient(config: FiatGatewayConfig): CVPayClient {
  // Use mock client in development/sandbox
  if (config.environment === "SANDBOX" || process.env.NODE_ENV === "development") {
    return new MockCVPayClient(config);
  }
  
  return new CVPayClient(config);
}
