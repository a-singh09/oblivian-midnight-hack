import WebSocket from "ws";
import { createServer, Server } from "http";
import { WebSocketManager } from "../websocket/WebSocketManager";

describe("WebSocketManager", () => {
  let server: Server;
  let wsManager: WebSocketManager;
  let port: number;

  beforeAll((done) => {
    server = createServer();
    wsManager = new WebSocketManager(server);

    server.listen(0, () => {
      const address = server.address();
      port = typeof address === "object" && address ? address.port : 0;
      done();
    });
  });

  afterAll((done) => {
    wsManager.close();
    server.close(done);
  });

  describe("WebSocket Connection", () => {
    it("should accept WebSocket connections", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);

      ws.on("open", () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
      });

      ws.on("close", () => {
        done();
      });

      ws.on("error", (error) => {
        done(error);
      });
    });

    it("should send welcome message on connection", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe("subscription");
        expect(message.data.message).toContain(
          "Connected to Oblivion Protocol WebSocket",
        );
        expect(message.data.subscriptionId).toBeDefined();
        ws.close();
        done();
      });

      ws.on("error", (error) => {
        done(error);
      });
    });
  });

  describe("User Subscription", () => {
    it("should handle user subscription", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let messageCount = 0;

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        messageCount++;

        if (messageCount === 1) {
          // Welcome message
          expect(message.type).toBe("subscription");

          // Send subscription request
          ws.send(
            JSON.stringify({
              type: "subscription",
              userDID: "did:midnight:test123",
              timestamp: Date.now(),
            }),
          );
        } else if (messageCount === 2) {
          // Subscription confirmation
          expect(message.type).toBe("subscription");
          expect(message.userDID).toBe("did:midnight:test123");
          expect(message.data.status).toBe("subscribed");
          ws.close();
          done();
        }
      });

      ws.on("error", (error) => {
        done(error);
      });
    });

    it("should reject invalid userDID format", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let messageCount = 0;

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        messageCount++;

        if (messageCount === 1) {
          // Welcome message
          ws.send(
            JSON.stringify({
              type: "subscription",
              userDID: "invalid-did-format",
              timestamp: Date.now(),
            }),
          );
        } else if (messageCount === 2) {
          // Error message
          expect(message.type).toBe("error");
          expect(message.data.error).toContain("Invalid userDID format");
          ws.close();
          done();
        }
      });

      ws.on("error", (error) => {
        done(error);
      });
    });
  });

  describe("Broadcasting", () => {
    it("should broadcast data status to subscribed users", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      const userDID = "did:midnight:broadcast123";
      let messageCount = 0;

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        messageCount++;

        if (messageCount === 1) {
          // Welcome message - subscribe to user
          ws.send(
            JSON.stringify({
              type: "subscription",
              userDID,
              timestamp: Date.now(),
            }),
          );
        } else if (messageCount === 2) {
          // Subscription confirmation - trigger broadcast
          setTimeout(() => {
            wsManager.broadcastDataStatus(userDID, "registered", {
              commitmentHash: "test123",
              dataType: "profile",
              serviceProvider: "test-service",
              transactionHash: "tx123",
            });
          }, 10);
        } else if (messageCount === 3) {
          // Data status broadcast
          expect(message.type).toBe("data_status");
          expect(message.userDID).toBe(userDID);
          expect(message.data.status).toBe("registered");
          expect(message.data.commitmentHash).toBe("test123");
          ws.close();
          done();
        }
      });

      ws.on("error", (error) => {
        done(error);
      });
    });

    it("should broadcast deletion progress", (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      const userDID = "did:midnight:deletion123";
      let messageCount = 0;

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        messageCount++;

        if (messageCount === 1) {
          // Welcome message - subscribe to user
          ws.send(
            JSON.stringify({
              type: "subscription",
              userDID,
              timestamp: Date.now(),
            }),
          );
        } else if (messageCount === 2) {
          // Subscription confirmation - trigger broadcast
          setTimeout(() => {
            wsManager.broadcastDeletionProgress({
              userDID,
              totalRecords: 5,
              processedRecords: 2,
              currentStep: "Processing deletion",
              status: "in_progress",
            });
          }, 10);
        } else if (messageCount === 3) {
          // Deletion progress broadcast
          expect(message.type).toBe("deletion_progress");
          expect(message.userDID).toBe(userDID);
          expect(message.data.totalRecords).toBe(5);
          expect(message.data.processedRecords).toBe(2);
          expect(message.data.status).toBe("in_progress");
          ws.close();
          done();
        }
      });

      ws.on("error", (error) => {
        done(error);
      });
    });
  });

  describe("Statistics", () => {
    it("should provide accurate statistics", () => {
      const stats = wsManager.getStats();
      expect(typeof stats.totalSubscriptions).toBe("number");
      expect(typeof stats.uniqueUsers).toBe("number");
      expect(typeof stats.subscriptionsByUser).toBe("object");
    });
  });
});
