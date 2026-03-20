/**
 * CVPay Webhook Handler
 * Processes transaction status notifications from CVPay
 */

import type { CVPayWebhookNotification, FiatTransaction, CVPayTransactionStatus } from "./cvpay-types";
import { verifyWebhookSignature } from "./cvpay-client";

/* ==================== WEBHOOK HANDLER ==================== */

export interface WebhookHandlerConfig {
  apiSecret: string;
  onTransactionUpdate: (update: TransactionUpdate) => Promise<void>;
  onBalanceUpdate?: (userId: string, amount: number, type: "CREDIT" | "DEBIT") => Promise<void>;
  onNotification?: (userId: string, message: string, type: "SUCCESS" | "ERROR") => Promise<void>;
}

export interface TransactionUpdate {
  merchantOrderNo: string;
  cvpayOrderNo: string;
  status: CVPayTransactionStatus;
  actualAmount?: number;
  fee?: number;
  completedAt?: number;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export class CVPayWebhookHandler {
  private config: WebhookHandlerConfig;
  private processedWebhooks: Set<string>;

  constructor(config: WebhookHandlerConfig) {
    this.config = config;
    this.processedWebhooks = new Set();
  }

  /**
   * Process incoming webhook notification
   */
  async handleWebhook(notification: CVPayWebhookNotification): Promise<WebhookResponse> {
    try {
      // 1. Verify signature
      const isValid = await verifyWebhookSignature(
        notification,
        notification.sign,
        this.config.apiSecret
      );

      if (!isValid) {
        console.error("Invalid webhook signature:", notification);
        return {
          success: false,
          code: "INVALID_SIGNATURE",
          message: "Invalid signature",
        };
      }

      // 2. Check for duplicate (idempotency)
      const webhookId = `${notification.cvpayOrderNo}_${notification.status}_${notification.timestamp}`;
      if (this.processedWebhooks.has(webhookId)) {
        console.log("Duplicate webhook ignored:", webhookId);
        return {
          success: true,
          code: "SUCCESS",
          message: "Duplicate webhook - already processed",
        };
      }

      // 3. Extract transaction update
      const update: TransactionUpdate = {
        merchantOrderNo: notification.merchantOrderNo,
        cvpayOrderNo: notification.cvpayOrderNo,
        status: notification.status,
        actualAmount: notification.actualAmount ? parseFloat(notification.actualAmount) : undefined,
        fee: notification.fee ? parseFloat(notification.fee) : undefined,
        completedAt: notification.completedAt,
        failureReason: notification.failureReason,
        metadata: notification.extraData,
      };

      // 4. Process status update
      await this.config.onTransactionUpdate(update);

      // 5. Handle side effects based on status
      await this.handleStatusSideEffects(notification, update);

      // 6. Mark as processed
      this.processedWebhooks.add(webhookId);

      // Clean up old processed webhooks (keep last 10000)
      if (this.processedWebhooks.size > 10000) {
        const toDelete = Array.from(this.processedWebhooks).slice(0, 1000);
        toDelete.forEach(id => this.processedWebhooks.delete(id));
      }

      console.log("Webhook processed successfully:", webhookId);

      return {
        success: true,
        code: "SUCCESS",
        message: "Webhook processed successfully",
      };
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      return {
        success: false,
        code: "PROCESSING_ERROR",
        message: error.message || "Internal error",
      };
    }
  }

  /**
   * Handle side effects based on transaction status
   */
  private async handleStatusSideEffects(
    notification: CVPayWebhookNotification,
    update: TransactionUpdate
  ): Promise<void> {
    const userId = await this.getUserIdFromTransaction(notification.merchantOrderNo);
    if (!userId) {
      console.error("User ID not found for transaction:", notification.merchantOrderNo);
      return;
    }

    switch (notification.status) {
      case "SUCCESS":
        await this.handleSuccess(userId, notification);
        break;

      case "FAILED":
        await this.handleFailure(userId, notification);
        break;

      case "REFUNDED":
        await this.handleRefund(userId, notification);
        break;

      case "EXPIRED":
        await this.handleExpiry(userId, notification);
        break;

      default:
        // PENDING, PROCESSING, etc. - no action needed
        break;
    }
  }

  /**
   * Handle successful transaction
   */
  private async handleSuccess(userId: string, notification: CVPayWebhookNotification): Promise<void> {
    const amount = parseFloat(notification.actualAmount || notification.amount);
    const isDeposit = notification.merchantOrderNo.startsWith("DEP_");

    if (isDeposit) {
      // Credit user balance
      if (this.config.onBalanceUpdate) {
        await this.config.onBalanceUpdate(userId, amount, "CREDIT");
      }

      // Send success notification
      if (this.config.onNotification) {
        await this.config.onNotification(
          userId,
          `Deposit of ₱${amount.toLocaleString()} successful! Your balance has been updated.`,
          "SUCCESS"
        );
      }
    } else {
      // Debit balance already done when withdrawal was created
      // Just notify user
      if (this.config.onNotification) {
        await this.config.onNotification(
          userId,
          `Withdrawal of ₱${amount.toLocaleString()} completed! Funds sent to your ${notification.paymentMethod} account.`,
          "SUCCESS"
        );
      }
    }
  }

  /**
   * Handle failed transaction
   */
  private async handleFailure(userId: string, notification: CVPayWebhookNotification): Promise<void> {
    const amount = parseFloat(notification.amount);
    const isDeposit = notification.merchantOrderNo.startsWith("DEP_");

    if (!isDeposit) {
      // Refund user balance if withdrawal failed
      if (this.config.onBalanceUpdate) {
        await this.config.onBalanceUpdate(userId, amount, "CREDIT");
      }
    }

    // Send failure notification
    if (this.config.onNotification) {
      const reason = notification.failureReason || "Unknown error";
      await this.config.onNotification(
        userId,
        `Transaction failed: ${reason}. ${!isDeposit ? "Your balance has been refunded." : "Please try again."}`,
        "ERROR"
      );
    }
  }

  /**
   * Handle refunded transaction
   */
  private async handleRefund(userId: string, notification: CVPayWebhookNotification): Promise<void> {
    const amount = parseFloat(notification.actualAmount || notification.amount);

    // Credit user balance
    if (this.config.onBalanceUpdate) {
      await this.config.onBalanceUpdate(userId, amount, "CREDIT");
    }

    // Send refund notification
    if (this.config.onNotification) {
      await this.config.onNotification(
        userId,
        `Transaction refunded. ₱${amount.toLocaleString()} has been credited back to your account.`,
        "SUCCESS"
      );
    }
  }

  /**
   * Handle expired transaction
   */
  private async handleExpiry(userId: string, notification: CVPayWebhookNotification): Promise<void> {
    const isDeposit = notification.merchantOrderNo.startsWith("DEP_");

    if (!isDeposit) {
      // Refund balance if withdrawal expired
      const amount = parseFloat(notification.amount);
      if (this.config.onBalanceUpdate) {
        await this.config.onBalanceUpdate(userId, amount, "CREDIT");
      }
    }

    // Send expiry notification
    if (this.config.onNotification) {
      await this.config.onNotification(
        userId,
        `Transaction expired. ${!isDeposit ? "Your balance has been refunded." : "Please create a new transaction."}`,
        "ERROR"
      );
    }
  }

  /**
   * Get user ID from transaction (mock - implement with database)
   */
  private async getUserIdFromTransaction(merchantOrderNo: string): Promise<string | null> {
    // TODO: Fetch from database
    // const tx = await db.transactions.findOne({ merchantOrderNo });
    // return tx?.userId || null;
    return "user_123"; // Mock
  }
}

/* ==================== RESPONSE TYPES ==================== */

export interface WebhookResponse {
  success: boolean;
  code: string;
  message: string;
}

/* ==================== EXPRESS/NEXT.JS HANDLER EXAMPLE ==================== */

/**
 * Example Express.js webhook endpoint
 */
export function createExpressWebhookHandler(handler: CVPayWebhookHandler) {
  return async (req: any, res: any) => {
    try {
      const notification: CVPayWebhookNotification = req.body;

      // Process webhook
      const result = await handler.handleWebhook(notification);

      if (result.success) {
        // CVPay expects "SUCCESS" string response
        res.send("SUCCESS");
      } else {
        res.status(400).send(result.message);
      }
    } catch (error: any) {
      console.error("Webhook handler error:", error);
      res.status(500).send("Internal error");
    }
  };
}

/**
 * Example Next.js API route
 */
export function createNextJsWebhookHandler(handler: CVPayWebhookHandler) {
  return async (req: any, res: any) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const notification: CVPayWebhookNotification = req.body;

      // Process webhook
      const result = await handler.handleWebhook(notification);

      if (result.success) {
        res.status(200).send("SUCCESS");
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error: any) {
      console.error("Webhook handler error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  };
}

/* ==================== USAGE EXAMPLE ==================== */

/*
// Initialize webhook handler
const webhookHandler = new CVPayWebhookHandler({
  apiSecret: process.env.CVPAY_API_SECRET!,
  
  // Update transaction in database
  onTransactionUpdate: async (update) => {
    await db.transactions.update(
      { merchantOrderNo: update.merchantOrderNo },
      {
        status: update.status,
        cvpayOrderNo: update.cvpayOrderNo,
        actualAmount: update.actualAmount,
        fee: update.fee,
        completedAt: update.completedAt,
        failureReason: update.failureReason,
        updatedAt: Date.now(),
      }
    );
  },
  
  // Update user balance
  onBalanceUpdate: async (userId, amount, type) => {
    if (type === "CREDIT") {
      await db.users.update(
        { id: userId },
        { $inc: { balance: amount } }
      );
    } else {
      await db.users.update(
        { id: userId },
        { $inc: { balance: -amount } }
      );
    }
  },
  
  // Send push notification to user
  onNotification: async (userId, message, type) => {
    await notificationService.send(userId, {
      title: type === "SUCCESS" ? "Transaction Successful" : "Transaction Failed",
      body: message,
      type: "TRANSACTION_UPDATE",
    });
  },
});

// Express.js
app.post("/webhooks/cvpay", createExpressWebhookHandler(webhookHandler));

// Next.js (pages/api/webhooks/cvpay.ts)
export default createNextJsWebhookHandler(webhookHandler);
*/
