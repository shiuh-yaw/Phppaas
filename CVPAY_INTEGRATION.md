# CVPay Fiat Payment Gateway Integration

## Overview

This document describes the CVPay fiat payment gateway integration for the ForeGate/Lucky Taya platform. The integration enables Philippine-localized deposit and withdrawal flows using e-wallets (GCash, Maya, GrabPay, etc.), bank transfers, OTC channels, and cards.

## Architecture

### Integration Points

1. **User Portal** (`/wallet`)
   - Deposit flow with payment method selection
   - Withdrawal requests with account verification
   - Transaction history and status tracking
   - Real-time balance updates

2. **OMS Admin** (`/oms/fiat-transactions`)
   - Transaction monitoring dashboard
   - Manual approval workflows for pending transactions
   - Reconciliation and reporting
   - Bulk export capabilities

3. **OMS Merchant** (`/oms/fiat-gateway-config`)
   - Multi-tenant gateway configuration
   - Payment method enable/disable
   - Fee and limit management
   - Auto-approval rules
   - Webhook endpoint configuration

### Core Components

```
/src/app/services/
├── cvpay-types.ts          # TypeScript types and interfaces
├── cvpay-client.ts         # API client with signature generation
└── cvpay-service.ts        # Business logic layer

/src/app/pages/
├── wallet.tsx              # User portal wallet page
└── oms/
    ├── fiat-transactions.tsx      # Admin transaction management
    └── fiat-gateway-config.tsx    # Merchant configuration
```

## API Integration

### Authentication

CVPay uses HMAC-SHA256 signature authentication:

1. Sort request parameters alphabetically
2. Create signature string: `key1=value1&key2=value2&key=API_SECRET`
3. Generate HMAC-SHA256 hash
4. Include signature in request as `sign` parameter

### Endpoints

#### 1. Create Deposit
```typescript
POST /api/v1/deposit/create
{
  merchantId: string,
  merchantOrderNo: string,
  amount: string,
  currency: "PHP",
  paymentMethod: "GCASH" | "PAYMAYA" | "BDO" | ...,
  notifyUrl: string,      // Webhook callback
  returnUrl: string,      // User redirect after payment
  userId: string,
  timestamp: number,
  nonce: string,
  sign: string
}

Response:
{
  code: "0000",
  message: "Success",
  data: {
    cvpayOrderNo: string,
    paymentUrl: string,    // Redirect user here
    qrCodeUrl?: string,    // QR code for scanning
    expireTime: number,
    status: "PENDING"
  }
}
```

#### 2. Create Withdrawal
```typescript
POST /api/v1/withdrawal/create
{
  merchantId: string,
  merchantOrderNo: string,
  amount: string,
  currency: "PHP",
  paymentMethod: string,
  accountNumber: string,   // Recipient account
  accountName: string,     // Account holder name
  bankCode?: string,       // For bank transfers
  notifyUrl: string,
  userId: string,
  timestamp: number,
  nonce: string,
  sign: string
}

Response:
{
  code: "0000",
  message: "Success",
  data: {
    cvpayOrderNo: string,
    status: "PROCESSING",
    fee: string,
    actualAmount: string,
    estimatedTime: number
  }
}
```

#### 3. Query Transaction
```typescript
POST /api/v1/transaction/query
{
  merchantId: string,
  merchantOrderNo?: string,
  cvpayOrderNo?: string,
  timestamp: number,
  nonce: string,
  sign: string
}

Response:
{
  code: "0000",
  data: {
    status: "SUCCESS" | "PENDING" | "FAILED" | ...,
    amount: string,
    actualAmount: string,
    completedAt?: number,
    failureReason?: string
  }
}
```

#### 4. Get Merchant Balance
```typescript
POST /api/v1/merchant/balance

Response:
{
  code: "0000",
  data: {
    availableBalance: string,
    frozenBalance: string,
    totalBalance: string,
    currency: "PHP"
  }
}
```

### Webhook Notifications

CVPay sends transaction status updates to your `notifyUrl`:

```typescript
POST {notifyUrl}
{
  merchantId: string,
  cvpayOrderNo: string,
  merchantOrderNo: string,
  amount: string,
  currency: "PHP",
  paymentMethod: string,
  status: "SUCCESS" | "FAILED" | ...,
  actualAmount?: string,
  fee?: string,
  completedAt?: number,
  failureReason?: string,
  timestamp: number,
  sign: string  // Verify this!
}

Response (required):
"SUCCESS"  // Return this string to acknowledge
```

**Important**: Always verify the webhook signature before processing!

## Payment Methods

### E-Wallets
- **GCash** - Most popular, instant processing, free
- **Maya (PayMaya)** - Instant, free
- **GrabPay** - Instant, free
- **ShopeePay** - Instant, free
- **Coins.ph** - Instant, free

### Banks
- **BDO** - 1-3 min, ₱15 fee
- **BPI** - 1-3 min, ₱15 fee
- **UnionBank** - 1-3 min, ₱15 fee
- **Metrobank** - 1-5 min, ₱15 fee
- **Landbank** - 1-5 min, ₱15 fee
- **RCBC** - 1-5 min, ₱15 fee
- **PNB** - 1-5 min, ₱15 fee
- **Security Bank** - 1-5 min, ₱15 fee

### OTC (Over-the-Counter)
- **7-Eleven** - 5-15 min, ₱10 fee
- **Cebuana Lhuillier** - 5-15 min, ₱25 fee
- **M Lhuillier** - 5-15 min, ₱25 fee
- **Palawan Pawnshop** - 5-15 min, ₱25 fee
- **Western Union** - 10-30 min, ₱50 fee

### Online Banking
- **InstaPay** - Real-time, ₱5 fee (up to ₱50k)
- **PESONet** - 1 business day, ₱10 fee (up to ₱1M)

### Cards
- **Visa** - Instant, 2.5% fee
- **Mastercard** - Instant, 2.5% fee

## Transaction Flow

### Deposit Flow

1. **User initiates deposit**
   ```typescript
   const fiatService = new FiatService(config);
   const transaction = await fiatService.createDeposit({
     userId: "user_123",
     amount: 5000,
     currency: "PHP",
     paymentMethod: "GCASH",
     userEmail: "user@example.com",
     userPhone: "09171234567"
   });
   ```

2. **Redirect user to payment URL**
   ```typescript
   window.location.href = transaction.paymentUrl;
   // User completes payment in GCash app/portal
   ```

3. **CVPay sends webhook notification**
   ```typescript
   // Your webhook handler
   export async function handleWebhook(req, res) {
     const notification = req.body;
     
     // Verify signature
     const isValid = await verifyWebhookSignature(
       notification,
       notification.sign,
       apiSecret
     );
     
     if (!isValid) {
       return res.status(400).send("Invalid signature");
     }
     
     // Update transaction in database
     await updateTransaction(notification.merchantOrderNo, {
       status: notification.status,
       completedAt: notification.completedAt
     });
     
     // Credit user balance if successful
     if (notification.status === "SUCCESS") {
       await creditUserBalance(notification.userId, notification.actualAmount);
     }
     
     res.send("SUCCESS");
   }
   ```

4. **User redirected back to site**
   ```typescript
   // User lands on returnUrl
   // Poll transaction status or use webhook to update UI
   ```

### Withdrawal Flow

1. **User initiates withdrawal**
   ```typescript
   const transaction = await fiatService.createWithdrawal({
     userId: "user_123",
     amount: 2000,
     currency: "PHP",
     paymentMethod: "PAYMAYA",
     accountNumber: "09171234567",
     accountName: "Juan Dela Cruz"
   });
   ```

2. **Admin approves (if manual approval required)**
   ```typescript
   // In OMS admin panel
   if (!config.autoApproveWithdrawals || 
       amount > config.autoApprovalThreshold) {
     // Show in pending queue
     // Admin clicks approve/reject
   }
   ```

3. **CVPay processes withdrawal**
   - Status changes from PENDING → PROCESSING → SUCCESS
   - Webhooks sent at each status change

4. **Funds disbursed to user account**
   - Money arrives in user's e-wallet/bank account
   - Final webhook with SUCCESS status

## Configuration

### Environment Variables

```env
# CVPay Configuration
CVPAY_MERCHANT_ID=MERCHANT_PROD_001
CVPAY_API_KEY=pk_live_...
CVPAY_API_SECRET=sk_live_...
CVPAY_API_URL=https://api.cvpay.org
CVPAY_WEBHOOK_URL=https://api.yoursite.com/webhooks/cvpay
CVPAY_RETURN_URL=https://yoursite.com/wallet
```

### Gateway Configuration (per tenant)

```typescript
const config: FiatGatewayConfig = {
  merchantId: "MERCHANT_001",
  apiKey: "pk_...",
  apiSecret: "sk_...",
  environment: "PRODUCTION", // or "SANDBOX"
  enabled: true,
  
  // Limits
  depositMin: 100,
  depositMax: 100000,
  withdrawalMin: 100,
  withdrawalMax: 100000,
  dailyDepositLimit: 500000,
  dailyWithdrawalLimit: 500000,
  
  // Fees
  depositFeeType: "PERCENTAGE",
  depositFeeValue: 0,        // No deposit fee
  withdrawalFeeType: "PERCENTAGE",
  withdrawalFeeValue: 1,     // 1% withdrawal fee
  
  // Automation
  autoApproveDeposits: true,
  autoApproveWithdrawals: false,
  autoApprovalThreshold: 10000,  // Auto-approve withdrawals < ₱10k
  
  // Payment methods (enable/disable)
  supportedMethods: [
    "GCASH",
    "PAYMAYA",
    "GRABPAY",
    "BDO",
    "BPI",
    "7ELEVEN"
  ]
};
```

## Error Handling

### Error Codes

| Code | Description | User Action |
|------|-------------|-------------|
| 0000 | Success | - |
| 1001 | Invalid signature | Retry |
| 1002 | Invalid merchant | Contact support |
| 1003 | Invalid params | Check input |
| 1004 | Duplicate order | Check transaction history |
| 1005 | Insufficient balance | Top up wallet |
| 1006 | Method unavailable | Choose another method |
| 1007 | Amount exceeds limit | Enter smaller amount |
| 1008 | Merchant suspended | Contact support |
| 1009 | Transaction not found | - |
| 1010 | Transaction expired | Create new transaction |
| 9999 | System error | Try again later |

### Usage Example

```typescript
try {
  const transaction = await fiatService.createDeposit(params);
  // Success
} catch (error) {
  if (error instanceof CVPayError) {
    // Show localized error message
    toast.error(error.getUserMessage("tl"));
    
    // Log for debugging
    console.error("CVPay Error:", error.code, error.message);
  } else {
    // Network or other error
    toast.error("Network error. Please try again.");
  }
}
```

## Security Best Practices

1. **Always verify webhook signatures**
   ```typescript
   const isValid = await verifyWebhookSignature(
     payload, 
     signature, 
     apiSecret
   );
   if (!isValid) throw new Error("Invalid signature");
   ```

2. **Store API secrets securely**
   - Never commit secrets to version control
   - Use environment variables or secret management services
   - Rotate secrets periodically

3. **Validate transaction amounts**
   ```typescript
   // Check against limits
   if (amount < config.depositMin || amount > config.depositMax) {
     throw new Error("Amount out of range");
   }
   ```

4. **Prevent duplicate transactions**
   ```typescript
   // Use unique merchant order numbers
   const merchantOrderNo = `DEP_${Date.now()}_${randomString()}`;
   
   // Check if transaction already exists
   const existing = await db.findTransaction(merchantOrderNo);
   if (existing) throw new Error("Duplicate transaction");
   ```

5. **Implement idempotency for webhooks**
   ```typescript
   // Process each webhook only once
   const processed = await db.isWebhookProcessed(cvpayOrderNo);
   if (processed) return "SUCCESS";
   
   await processWebhook(notification);
   await db.markWebhookProcessed(cvpayOrderNo);
   ```

## Testing

### Sandbox Environment

Use these credentials for testing:
```
Merchant ID: MERCHANT_TEST_001
API Key: pk_test_1234567890
API Secret: sk_test_0987654321abcdef
API URL: https://api-sandbox.cvpay.org
```

### Mock Client

The integration includes a mock client for development:

```typescript
import { MockCVPayClient } from "./services/cvpay-client";

const client = new MockCVPayClient(config);
// Returns simulated responses without actual API calls
```

### Test Payment Methods

In sandbox mode, use these test credentials:

**GCash Test Account:**
- Mobile: 09171234567
- OTP: 123456

**Bank Transfer Test:**
- Account: 1234567890
- Name: Juan Dela Cruz

## Monitoring & Analytics

### Key Metrics to Track

1. **Transaction Success Rate**
   - Total transactions / Successful transactions
   - Track by payment method

2. **Average Processing Time**
   - Time from creation to completion
   - Compare across payment methods

3. **Failed Transaction Reasons**
   - Group by error code
   - Identify patterns

4. **Gateway Balance**
   - Monitor available balance
   - Alert on low balance

5. **Daily/Monthly Volume**
   - Total deposit amount
   - Total withdrawal amount
   - Number of transactions

### Sample Queries

```typescript
// Success rate by payment method
SELECT 
  paymentMethod,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM fiat_transactions
WHERE createdAt >= NOW() - INTERVAL '30 days'
GROUP BY paymentMethod
ORDER BY total DESC;

// Average processing time
SELECT 
  paymentMethod,
  AVG(completedAt - createdAt) / 1000 / 60 as avg_minutes
FROM fiat_transactions
WHERE status = 'SUCCESS' AND completedAt IS NOT NULL
GROUP BY paymentMethod;
```

## Troubleshooting

### Common Issues

**1. Invalid Signature Error**
- Check API secret is correct
- Ensure parameters are sorted alphabetically
- Verify timestamp is within acceptable range (±5 minutes)

**2. Transaction Not Found**
- Check merchantOrderNo is correct
- Verify transaction was created successfully
- Check in sandbox vs production environment

**3. Webhook Not Received**
- Verify notifyUrl is publicly accessible (not localhost)
- Check firewall/security rules
- Ensure HTTPS is used
- Test with tools like webhook.site

**4. Payment URL Expired**
- Default expiry is 30 minutes
- User must complete payment within this window
- Create new transaction if expired

## Support

For CVPay API support:
- Email: support@cvpay.org
- Documentation: https://mch.cvpay.org/api-docs/fiat-api.html
- Merchant Portal: https://merchant.cvpay.org

For integration issues:
- Check logs in `/oms/audit`
- Review transaction details in `/oms/fiat-transactions`
- Test connection in `/oms/fiat-gateway-config`

## Roadmap

Planned enhancements:

- [ ] Real-time transaction status via WebSocket
- [ ] Bulk withdrawal processing
- [ ] Automated reconciliation reports
- [ ] Advanced fraud detection
- [ ] Multi-currency support (USD, CNY)
- [ ] Scheduled payouts
- [ ] Transaction dispute management
- [ ] Enhanced analytics dashboard
