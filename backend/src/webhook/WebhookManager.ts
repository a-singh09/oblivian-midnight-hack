/**
 * Webhook Manager for Oblivion Protocol
 * Handles webhook delivery system for company notifications
 * Requirements: 8.1, 8.2, 8.3, 8.5
 */

import axios, { AxiosError } from "axios";

export interface WebhookEndpoint {
  id: string;
  companyId: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: Date;
  lastDeliveryAt?: Date;
  failureCount: number;
}

export type WebhookEventType =
  | "data_registered"
  | "data_deleted"
  | "deletion_completed";

export interface WebhookPayload {
  event: WebhookEventType;
  userDID: string;
  timestamp: number;
  data: {
    commitmentHash?: string;
    dataType?: string;
    serviceProvider?: string;
    transactionHash?: string;
    deletionDetails?: {
      totalRecords: number;
      deletedRecords: number;
      deletionProofs: Array<{
        commitmentHash: string;
        proofHash: string;
        transactionHash: string;
      }>;
    };
  };
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime: number;
  attempt: number;
}

export interface WebhookDeliveryAttempt {
  webhookId: string;
  payload: WebhookPayload;
  attempt: number;
  scheduledAt: Date;
  deliveredAt?: Date;
  result?: WebhookDeliveryResult;
}

export class WebhookManager {
  private webhooks: Map<string, WebhookEndpoint> = new Map();
  private deliveryQueue: WebhookDeliveryAttempt[] = [];
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    this.startDeliveryProcessor();
  }

  /**
   * Register a new webhook endpoint for a company
   * Requirements: 8.1
   */
  public registerWebhook(
    companyId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string,
  ): string {
    const webhookId = this.generateWebhookId();

    const webhook: WebhookEndpoint = {
      id: webhookId,
      companyId,
      url,
      secret,
      events,
      active: true,
      createdAt: new Date(),
      failureCount: 0,
    };

    this.webhooks.set(webhookId, webhook);

    console.log(
      `Registered webhook ${webhookId} for company ${companyId} at ${url}`,
    );
    return webhookId;
  }

  /**
   * Update webhook endpoint configuration
   */
  public updateWebhook(
    webhookId: string,
    updates: Partial<
      Pick<WebhookEndpoint, "url" | "events" | "secret" | "active">
    >,
  ): boolean {
    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      console.error(`Webhook ${webhookId} not found`);
      return false;
    }

    Object.assign(webhook, updates);
    this.webhooks.set(webhookId, webhook);

    console.log(`Updated webhook ${webhookId}`);
    return true;
  }

  /**
   * Remove webhook endpoint
   */
  public removeWebhook(webhookId: string): boolean {
    const removed = this.webhooks.delete(webhookId);

    if (removed) {
      console.log(`Removed webhook ${webhookId}`);
    } else {
      console.error(`Webhook ${webhookId} not found`);
    }

    return removed;
  }

  /**
   * Get webhook endpoints for a company
   */
  public getCompanyWebhooks(companyId: string): WebhookEndpoint[] {
    return Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.companyId === companyId,
    );
  }

  /**
   * Send webhook notification for data registration
   * Requirements: 8.1, 8.2
   */
  public async notifyDataRegistered(
    userDID: string,
    commitmentHash: string,
    dataType: string,
    serviceProvider: string,
    transactionHash: string,
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: "data_registered",
      userDID,
      timestamp: Date.now(),
      data: {
        commitmentHash,
        dataType,
        serviceProvider,
        transactionHash,
      },
    };

    await this.sendWebhookNotifications(payload, serviceProvider);
  }

  /**
   * Send webhook notification for data deletion
   * Requirements: 8.1, 8.2, 8.5
   */
  public async notifyDataDeleted(
    userDID: string,
    commitmentHash: string,
    dataType: string,
    serviceProvider: string,
    transactionHash: string,
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: "data_deleted",
      userDID,
      timestamp: Date.now(),
      data: {
        commitmentHash,
        dataType,
        serviceProvider,
        transactionHash,
      },
    };

    await this.sendWebhookNotifications(payload, serviceProvider);
  }

  /**
   * Send webhook notification for deletion completion
   * Requirements: 8.1, 8.2, 8.5
   */
  public async notifyDeletionCompleted(
    userDID: string,
    serviceProvider: string,
    deletionDetails: {
      totalRecords: number;
      deletedRecords: number;
      deletionProofs: Array<{
        commitmentHash: string;
        proofHash: string;
        transactionHash: string;
      }>;
    },
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: "deletion_completed",
      userDID,
      timestamp: Date.now(),
      data: {
        serviceProvider,
        deletionDetails,
      },
    };

    await this.sendWebhookNotifications(payload, serviceProvider);
  }

  /**
   * Send webhook notifications to relevant endpoints
   */
  private async sendWebhookNotifications(
    payload: WebhookPayload,
    serviceProvider: string,
  ): Promise<void> {
    // Find webhooks for the service provider that are subscribed to this event
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      (webhook) =>
        webhook.active &&
        webhook.companyId === serviceProvider &&
        webhook.events.includes(payload.event),
    );

    if (relevantWebhooks.length === 0) {
      console.log(
        `No active webhooks found for service provider ${serviceProvider} and event ${payload.event}`,
      );
      return;
    }

    console.log(
      `Queuing webhook notifications for ${relevantWebhooks.length} endpoints`,
    );

    // Queue delivery attempts for each webhook
    for (const webhook of relevantWebhooks) {
      const deliveryAttempt: WebhookDeliveryAttempt = {
        webhookId: webhook.id,
        payload,
        attempt: 1,
        scheduledAt: new Date(),
      };

      this.deliveryQueue.push(deliveryAttempt);
    }
  }

  /**
   * Start the webhook delivery processor
   */
  private startDeliveryProcessor(): void {
    this.processingInterval = setInterval(() => {
      if (!this.isProcessing && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 1000); // Process every second

    console.log("Webhook delivery processor started");
  }

  /**
   * Process the webhook delivery queue
   * Requirements: 8.2, 8.3
   */
  private async processDeliveryQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process up to 10 deliveries at once
      const batch = this.deliveryQueue.splice(0, 10);

      const deliveryPromises = batch.map((attempt) =>
        this.deliverWebhook(attempt),
      );
      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      console.error("Error processing webhook delivery queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Deliver a single webhook with retry logic
   * Requirements: 8.2, 8.3
   */
  private async deliverWebhook(attempt: WebhookDeliveryAttempt): Promise<void> {
    const webhook = this.webhooks.get(attempt.webhookId);

    if (!webhook || !webhook.active) {
      console.log(
        `Webhook ${attempt.webhookId} is inactive or not found, skipping delivery`,
      );
      return;
    }

    const startTime = Date.now();

    try {
      console.log(
        `Delivering webhook ${webhook.id} (attempt ${attempt.attempt}) to ${webhook.url}`,
      );

      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "Oblivion-Protocol-Webhook/1.0",
        "X-Oblivion-Event": attempt.payload.event,
        "X-Oblivion-Delivery": `${attempt.webhookId}-${Date.now()}`,
        "X-Oblivion-Timestamp": attempt.payload.timestamp.toString(),
      };

      // Add signature if secret is provided
      if (webhook.secret) {
        const signature = this.generateSignature(
          attempt.payload,
          webhook.secret,
        );
        headers["X-Oblivion-Signature"] = signature;
      }

      // Make HTTP request with 30-second timeout
      const response = await axios.post(webhook.url, attempt.payload, {
        headers,
        timeout: 30000, // 30 seconds as per requirements
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const responseTime = Date.now() - startTime;

      // Success
      const result: WebhookDeliveryResult = {
        success: true,
        statusCode: response.status,
        responseTime,
        attempt: attempt.attempt,
      };

      attempt.deliveredAt = new Date();
      attempt.result = result;

      // Update webhook stats
      webhook.lastDeliveryAt = new Date();
      webhook.failureCount = 0; // Reset failure count on success

      console.log(
        `Webhook ${webhook.id} delivered successfully in ${responseTime}ms (status: ${response.status})`,
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let statusCode: number | undefined;
      let errorMessage: string;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        statusCode = axiosError.response?.status;
        errorMessage = axiosError.message;

        if (axiosError.code === "ECONNABORTED") {
          errorMessage = "Request timeout (30 seconds)";
        }
      } else {
        errorMessage = error instanceof Error ? error.message : "Unknown error";
      }

      const result: WebhookDeliveryResult = {
        success: false,
        statusCode,
        error: errorMessage,
        responseTime,
        attempt: attempt.attempt,
      };

      attempt.deliveredAt = new Date();
      attempt.result = result;

      // Update webhook failure count
      webhook.failureCount++;

      console.error(
        `Webhook ${webhook.id} delivery failed (attempt ${attempt.attempt}): ${errorMessage}`,
      );

      // Retry logic - up to 3 attempts as per requirements
      if (attempt.attempt < 3) {
        const retryDelay = this.calculateRetryDelay(attempt.attempt);

        setTimeout(() => {
          const retryAttempt: WebhookDeliveryAttempt = {
            ...attempt,
            attempt: attempt.attempt + 1,
            scheduledAt: new Date(),
            deliveredAt: undefined,
            result: undefined,
          };

          this.deliveryQueue.push(retryAttempt);
          console.log(
            `Scheduled retry for webhook ${webhook.id} in ${retryDelay}ms (attempt ${retryAttempt.attempt})`,
          );
        }, retryDelay);
      } else {
        console.error(
          `Webhook ${webhook.id} failed after 3 attempts, giving up`,
        );

        // Disable webhook after too many failures
        if (webhook.failureCount >= 10) {
          webhook.active = false;
          console.warn(
            `Webhook ${webhook.id} disabled due to excessive failures`,
          );
        }
      }
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, attempt - 1) * 1000;
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const crypto = require("crypto");
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    return `sha256=${signature}`;
  }

  /**
   * Generate unique webhook ID
   */
  private generateWebhookId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get webhook delivery statistics
   */
  public getStats(): {
    totalWebhooks: number;
    activeWebhooks: number;
    queuedDeliveries: number;
    webhooksByCompany: Record<string, number>;
  } {
    const webhooksByCompany: Record<string, number> = {};
    let activeCount = 0;

    this.webhooks.forEach((webhook) => {
      if (webhook.active) {
        activeCount++;
      }

      webhooksByCompany[webhook.companyId] =
        (webhooksByCompany[webhook.companyId] || 0) + 1;
    });

    return {
      totalWebhooks: this.webhooks.size,
      activeWebhooks: activeCount,
      queuedDeliveries: this.deliveryQueue.length,
      webhooksByCompany,
    };
  }

  /**
   * Get webhook endpoint by ID
   */
  public getWebhook(webhookId: string): WebhookEndpoint | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * List all webhook endpoints
   */
  public listWebhooks(): WebhookEndpoint[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Stop the webhook delivery processor and cleanup
   */
  public close(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    // Clear delivery queue
    this.deliveryQueue = [];

    console.log("Webhook delivery processor stopped");
  }
}
