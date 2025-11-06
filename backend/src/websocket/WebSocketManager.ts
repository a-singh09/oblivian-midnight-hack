/**
 * WebSocket Manager for Oblivion Protocol
 * Handles real-time updates for data status changes and deletion operations
 * Requirements: 7.1, 7.2, 7.4
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

export interface WebSocketMessage {
  type:
    | "subscription"
    | "data_status"
    | "deletion_progress"
    | "blockchain_confirmation"
    | "error";
  userDID?: string;
  data?: any;
  timestamp: number;
}

export interface UserSubscription {
  userDID: string;
  websocket: WebSocket;
  subscriptionId: string;
  subscribedAt: number;
}

export interface DeletionProgress {
  userDID: string;
  totalRecords: number;
  processedRecords: number;
  currentStep: string;
  status: "in_progress" | "completed" | "failed";
  error?: string;
}

export interface BlockchainConfirmation {
  userDID: string;
  commitmentHash: string;
  transactionHash: string;
  confirmationType: "registration" | "deletion";
  blockHeight?: number;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private subscriptions: Map<string, UserSubscription> = new Map();
  private userSubscriptions: Map<string, Set<string>> = new Map(); // userDID -> Set of subscriptionIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      clientTracking: true,
    });

    this.setupWebSocketServer();
  }

  /**
   * Setup WebSocket server with connection handling
   */
  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket, request) => {
      const clientIP = request.socket.remoteAddress;
      console.log(`WebSocket client connected from ${clientIP}`);

      // Generate unique subscription ID
      const subscriptionId = this.generateSubscriptionId();

      // Setup message handling
      ws.on("message", (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleClientMessage(ws, subscriptionId, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      // Handle connection close
      ws.on("close", (code: number, reason: Buffer) => {
        console.log(
          `WebSocket client disconnected: ${code} ${reason.toString()}`,
        );
        this.removeSubscription(subscriptionId);
      });

      // Handle connection errors
      ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
        this.removeSubscription(subscriptionId);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: "subscription",
        data: {
          subscriptionId,
          message: "Connected to Oblivion Protocol WebSocket",
        },
        timestamp: Date.now(),
      });
    });

    console.log("WebSocket server initialized on /ws");
  }

  /**
   * Handle incoming client messages
   */
  private handleClientMessage(
    ws: WebSocket,
    subscriptionId: string,
    message: WebSocketMessage,
  ): void {
    switch (message.type) {
      case "subscription":
        this.handleSubscription(ws, subscriptionId, message);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle user subscription requests
   */
  private handleSubscription(
    ws: WebSocket,
    subscriptionId: string,
    message: WebSocketMessage,
  ): void {
    const { userDID } = message;

    if (!userDID) {
      this.sendError(ws, "userDID is required for subscription");
      return;
    }

    // Validate userDID format
    if (!userDID.startsWith("did:midnight:")) {
      this.sendError(
        ws,
        "Invalid userDID format. Must start with 'did:midnight:'",
      );
      return;
    }

    // Create subscription
    const subscription: UserSubscription = {
      userDID,
      websocket: ws,
      subscriptionId,
      subscribedAt: Date.now(),
    };

    // Store subscription
    this.subscriptions.set(subscriptionId, subscription);

    // Add to user subscriptions map
    if (!this.userSubscriptions.has(userDID)) {
      this.userSubscriptions.set(userDID, new Set());
    }
    this.userSubscriptions.get(userDID)!.add(subscriptionId);

    console.log(`User ${userDID} subscribed with ID ${subscriptionId}`);

    // Send confirmation
    this.sendMessage(ws, {
      type: "subscription",
      userDID,
      data: {
        status: "subscribed",
        message: `Subscribed to updates for ${userDID}`,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast data status change to subscribed users
   * Requirements: 7.1, 7.2
   */
  public broadcastDataStatus(
    userDID: string,
    status: "registered" | "deleted" | "updated",
    data: {
      commitmentHash: string;
      dataType: string;
      serviceProvider: string;
      transactionHash?: string;
    },
  ): void {
    const message: WebSocketMessage = {
      type: "data_status",
      userDID,
      data: {
        status,
        ...data,
      },
      timestamp: Date.now(),
    };

    this.broadcastToUser(userDID, message);
    console.log(`Broadcasted data status '${status}' to user ${userDID}`);
  }

  /**
   * Broadcast deletion progress updates
   * Requirements: 7.1, 7.4
   */
  public broadcastDeletionProgress(progress: DeletionProgress): void {
    const message: WebSocketMessage = {
      type: "deletion_progress",
      userDID: progress.userDID,
      data: progress,
      timestamp: Date.now(),
    };

    this.broadcastToUser(progress.userDID, message);
    console.log(
      `Broadcasted deletion progress to user ${progress.userDID}: ${progress.currentStep}`,
    );
  }

  /**
   * Broadcast blockchain transaction confirmations
   * Requirements: 7.4
   */
  public broadcastBlockchainConfirmation(
    confirmation: BlockchainConfirmation,
  ): void {
    const message: WebSocketMessage = {
      type: "blockchain_confirmation",
      userDID: confirmation.userDID,
      data: confirmation,
      timestamp: Date.now(),
    };

    this.broadcastToUser(confirmation.userDID, message);
    console.log(
      `Broadcasted blockchain confirmation to user ${confirmation.userDID}: ${confirmation.transactionHash}`,
    );
  }

  /**
   * Broadcast message to all subscriptions for a specific user
   */
  private broadcastToUser(userDID: string, message: WebSocketMessage): void {
    const userSubscriptionIds = this.userSubscriptions.get(userDID);

    if (!userSubscriptionIds || userSubscriptionIds.size === 0) {
      console.log(`No active subscriptions for user ${userDID}`);
      return;
    }

    let sentCount = 0;
    let failedCount = 0;

    userSubscriptionIds.forEach((subscriptionId) => {
      const subscription = this.subscriptions.get(subscriptionId);

      if (
        subscription &&
        subscription.websocket.readyState === WebSocket.OPEN
      ) {
        try {
          this.sendMessage(subscription.websocket, message);
          sentCount++;
        } catch (error) {
          console.error(
            `Failed to send message to subscription ${subscriptionId}:`,
            error,
          );
          failedCount++;
          // Remove failed subscription
          this.removeSubscription(subscriptionId);
        }
      } else {
        // Remove inactive subscription
        this.removeSubscription(subscriptionId);
        failedCount++;
      }
    });

    console.log(
      `Message sent to ${sentCount} subscriptions for user ${userDID} (${failedCount} failed)`,
    );
  }

  /**
   * Send message to specific WebSocket connection
   */
  private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message to WebSocket connection
   */
  private sendError(ws: WebSocket, errorMessage: string): void {
    this.sendMessage(ws, {
      type: "error",
      data: { error: errorMessage },
      timestamp: Date.now(),
    });
  }

  /**
   * Remove subscription and cleanup
   */
  private removeSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription) {
      const { userDID } = subscription;

      // Remove from subscriptions map
      this.subscriptions.delete(subscriptionId);

      // Remove from user subscriptions map
      const userSubs = this.userSubscriptions.get(userDID);
      if (userSubs) {
        userSubs.delete(subscriptionId);

        // Clean up empty user subscription sets
        if (userSubs.size === 0) {
          this.userSubscriptions.delete(userDID);
        }
      }

      console.log(`Removed subscription ${subscriptionId} for user ${userDID}`);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active subscription statistics
   */
  public getStats(): {
    totalSubscriptions: number;
    uniqueUsers: number;
    subscriptionsByUser: Record<string, number>;
  } {
    const subscriptionsByUser: Record<string, number> = {};

    this.userSubscriptions.forEach((subscriptionIds, userDID) => {
      subscriptionsByUser[userDID] = subscriptionIds.size;
    });

    return {
      totalSubscriptions: this.subscriptions.size,
      uniqueUsers: this.userSubscriptions.size,
      subscriptionsByUser,
    };
  }

  /**
   * Close all WebSocket connections and cleanup
   */
  public close(): void {
    console.log("Closing WebSocket server...");

    // Close all client connections
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Server shutting down");
      }
    });

    // Close WebSocket server
    this.wss.close(() => {
      console.log("WebSocket server closed");
    });

    // Clear subscriptions
    this.subscriptions.clear();
    this.userSubscriptions.clear();
  }
}
