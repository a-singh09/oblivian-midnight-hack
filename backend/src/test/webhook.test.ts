import request from "supertest";
import { WebhookManager } from "../webhook/WebhookManager";

// Mock axios for webhook delivery testing
jest.mock("axios");
const mockedAxios = jest.mocked(require("axios"));

describe("WebhookManager", () => {
  let webhookManager: WebhookManager;

  beforeEach(() => {
    webhookManager = new WebhookManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    webhookManager.close();
  });

  describe("Webhook Registration", () => {
    it("should register a new webhook", () => {
      const webhookId = webhookManager.registerWebhook(
        "company123",
        "https://example.com/webhook",
        ["data_registered", "data_deleted"],
      );

      expect(webhookId).toBeDefined();
      expect(webhookId).toMatch(/^wh_\d+_[a-z0-9]+$/);

      const webhook = webhookManager.getWebhook(webhookId);
      expect(webhook).toBeDefined();
      expect(webhook?.companyId).toBe("company123");
      expect(webhook?.url).toBe("https://example.com/webhook");
      expect(webhook?.events).toEqual(["data_registered", "data_deleted"]);
      expect(webhook?.active).toBe(true);
    });

    it("should register webhook with secret", () => {
      const webhookId = webhookManager.registerWebhook(
        "company123",
        "https://example.com/webhook",
        ["data_registered"],
        "secret123",
      );

      const webhook = webhookManager.getWebhook(webhookId);
      expect(webhook?.secret).toBe("secret123");
    });
  });

  describe("Webhook Management", () => {
    let webhookId: string;

    beforeEach(() => {
      webhookId = webhookManager.registerWebhook(
        "company123",
        "https://example.com/webhook",
        ["data_registered"],
      );
    });

    it("should update webhook configuration", () => {
      const success = webhookManager.updateWebhook(webhookId, {
        url: "https://newurl.com/webhook",
        events: ["data_deleted"],
        active: false,
      });

      expect(success).toBe(true);

      const webhook = webhookManager.getWebhook(webhookId);
      expect(webhook?.url).toBe("https://newurl.com/webhook");
      expect(webhook?.events).toEqual(["data_deleted"]);
      expect(webhook?.active).toBe(false);
    });

    it("should remove webhook", () => {
      const success = webhookManager.removeWebhook(webhookId);
      expect(success).toBe(true);

      const webhook = webhookManager.getWebhook(webhookId);
      expect(webhook).toBeUndefined();
    });

    it("should get company webhooks", () => {
      const webhook2Id = webhookManager.registerWebhook(
        "company123",
        "https://example2.com/webhook",
        ["deletion_completed"],
      );

      const companyWebhooks = webhookManager.getCompanyWebhooks("company123");
      expect(companyWebhooks).toHaveLength(2);
      expect(companyWebhooks.map((w) => w.id)).toContain(webhookId);
      expect(companyWebhooks.map((w) => w.id)).toContain(webhook2Id);
    });
  });

  describe("Webhook Notifications", () => {
    let webhookId: string;

    beforeEach(() => {
      webhookId = webhookManager.registerWebhook(
        "test-service",
        "https://example.com/webhook",
        ["data_registered", "data_deleted", "deletion_completed"],
      );

      // Mock successful axios response
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { received: true },
      });
    });

    it("should notify data registered", async () => {
      await webhookManager.notifyDataRegistered(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx123",
      );

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://example.com/webhook",
        expect.objectContaining({
          event: "data_registered",
          userDID: "did:midnight:user123",
          data: expect.objectContaining({
            commitmentHash: "commit123",
            dataType: "profile",
            serviceProvider: "test-service",
            transactionHash: "tx123",
          }),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Oblivion-Event": "data_registered",
          }),
          timeout: 30000,
        }),
      );
    });

    it("should notify data deleted", async () => {
      await webhookManager.notifyDataDeleted(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx456",
      );

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://example.com/webhook",
        expect.objectContaining({
          event: "data_deleted",
          userDID: "did:midnight:user123",
          data: expect.objectContaining({
            commitmentHash: "commit123",
            transactionHash: "tx456",
          }),
        }),
        expect.any(Object),
      );
    });

    it("should notify deletion completed", async () => {
      const deletionDetails = {
        totalRecords: 3,
        deletedRecords: 3,
        deletionProofs: [
          {
            commitmentHash: "commit1",
            proofHash: "proof1",
            transactionHash: "tx1",
          },
          {
            commitmentHash: "commit2",
            proofHash: "proof2",
            transactionHash: "tx2",
          },
        ],
      };

      await webhookManager.notifyDeletionCompleted(
        "did:midnight:user123",
        "test-service",
        deletionDetails,
      );

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://example.com/webhook",
        expect.objectContaining({
          event: "deletion_completed",
          userDID: "did:midnight:user123",
          data: expect.objectContaining({
            serviceProvider: "test-service",
            deletionDetails,
          }),
        }),
        expect.any(Object),
      );
    });

    it("should not send notifications for inactive webhooks", async () => {
      // Deactivate webhook
      webhookManager.updateWebhook(webhookId, { active: false });

      await webhookManager.notifyDataRegistered(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx123",
      );

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("should not send notifications for unsubscribed events", async () => {
      // Update webhook to only listen for deletion_completed
      webhookManager.updateWebhook(webhookId, {
        events: ["deletion_completed"],
      });

      await webhookManager.notifyDataRegistered(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx123",
      );

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe("Webhook Retry Logic", () => {
    let webhookId: string;

    beforeEach(() => {
      webhookId = webhookManager.registerWebhook(
        "test-service",
        "https://example.com/webhook",
        ["data_registered"],
      );
    });

    it("should retry failed webhook deliveries", async () => {
      // Mock failed response
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
      mockedAxios.post.mockResolvedValueOnce({ status: 200, data: {} });

      await webhookManager.notifyDataRegistered(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx123",
      );

      // Wait for initial delivery and first retry
      await new Promise((resolve) => setTimeout(resolve, 1500));

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("timeout of 30000ms exceeded");
      (timeoutError as any).code = "ECONNABORTED";
      mockedAxios.post.mockRejectedValue(timeoutError);

      await webhookManager.notifyDataRegistered(
        "did:midnight:user123",
        "commit123",
        "profile",
        "test-service",
        "tx123",
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe("Statistics", () => {
    it("should provide accurate statistics", () => {
      webhookManager.registerWebhook("company1", "https://example1.com", [
        "data_registered",
      ]);
      webhookManager.registerWebhook("company1", "https://example2.com", [
        "data_deleted",
      ]);
      webhookManager.registerWebhook("company2", "https://example3.com", [
        "deletion_completed",
      ]);

      const stats = webhookManager.getStats();

      expect(stats.totalWebhooks).toBe(3);
      expect(stats.activeWebhooks).toBe(3);
      expect(stats.webhooksByCompany).toEqual({
        company1: 2,
        company2: 1,
      });
    });

    it("should track inactive webhooks", () => {
      const webhookId = webhookManager.registerWebhook(
        "company1",
        "https://example.com",
        ["data_registered"],
      );
      webhookManager.updateWebhook(webhookId, { active: false });

      const stats = webhookManager.getStats();

      expect(stats.totalWebhooks).toBe(1);
      expect(stats.activeWebhooks).toBe(0);
    });
  });
});
