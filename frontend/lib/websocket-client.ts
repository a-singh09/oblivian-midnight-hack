/**
 * WebSocket Client for Real-time Updates
 * Connects to backend WebSocket server for live data status changes
 */

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000";

export type DataStatusUpdate = {
  type: "data_status_change";
  userDID: string;
  commitmentHash: string;
  status: "active" | "deleted";
  timestamp: number;
};

export type DeletionProgress = {
  type: "deletion_progress";
  userDID: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
};

export type BlockchainConfirmation = {
  type: "blockchain_confirmation";
  userDID: string;
  transactionHash: string;
  blockNumber: number;
  proofHash: string;
};

export type WebSocketMessage =
  | DataStatusUpdate
  | DeletionProgress
  | BlockchainConfirmation;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> =
    new Map();

  connect(userDID: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // Subscribe to user updates
        this.send({
          type: "subscribe",
          userDID,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(message.type, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect(userDID);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.attemptReconnect(userDID);
    }
  }

  private attemptReconnect(userDID: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
      );

      setTimeout(() => {
        this.connect(userDID);
      }, delay);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  on(eventType: string, callback: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (message: WebSocketMessage) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyListeners(eventType: string, message: WebSocketMessage): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => callback(message));
    }
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsClient = new WebSocketClient();
