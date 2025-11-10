import request from "supertest";
import { OblivionServer } from "../server";
import { StorageManager } from "../storage/StorageManager";
import { MidnightClient } from "../midnight/MidnightClient";

// Mock the dependencies
jest.mock("../storage/StorageManager");
jest.mock("../midnight/MidnightClient");

describe("OblivionServer API Endpoints", () => {
  let server: OblivionServer;
  let app: any;
  let mockStorageManager: jest.Mocked<StorageManager>;
  let mockMidnightClient: jest.Mocked<MidnightClient>;

  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = "test";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "test_db";
    process.env.DB_USER = "test_user";
    process.env.DB_PASSWORD = "test_pass";
    process.env.ENCRYPTION_KEY = "test-encryption-key";

    server = new OblivionServer();

    // Mock the initialize method to avoid actual database/blockchain connections
    jest.spyOn(server, "initialize").mockImplementation(async () => {
      // Setup mocked middleware and routes without actual initialization
      (server as any).setupMiddleware();
      (server as any).setupRoutes();
      (server as any).setupErrorHandling();
    });

    await server.initialize();
    app = server.getApp();

    // Get mocked instances
    mockStorageManager = (server as any).storageManager;
    mockMidnightClient = (server as any).midnightClient;
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      // Mock the health check dependencies
      mockStorageManager.getStats = jest.fn().mockResolvedValue({
        totalRecords: 100,
        activeRecords: 80,
        deletedRecords: 20,
      });

      mockMidnightClient.getNetworkStats = jest.fn().mockResolvedValue({
        blockHeight: 12345,
        totalCommitments: 500,
      });

      mockMidnightClient.getConfig = jest.fn().mockReturnValue({
        networkId: "testnet",
      });

      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("healthy");
      expect(response.body.services.database.totalRecords).toBe(100);
      expect(response.body.services.blockchain.blockHeight).toBe(12345);
    });

    it("should return unhealthy status on error", async () => {
      mockStorageManager.getStats = jest
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));

      const response = await request(app).get("/health").expect(503);

      expect(response.body.status).toBe("unhealthy");
      expect(response.body.error).toContain("Database connection failed");
    });
  });

  describe("POST /api/register-data", () => {
    it("should register user data successfully", async () => {
      const userData = {
        userDID: "did:midnight:user123",
        data: { name: "John Doe", email: "john@example.com" },
        dataType: "profile",
        serviceProvider: "test-service",
      };

      const mockCommitmentHash = "abc123def456";
      const mockTransactionHash = "tx_789xyz";

      mockStorageManager.storeData = jest
        .fn()
        .mockResolvedValue(mockCommitmentHash);
      mockMidnightClient.registerCommitment = jest
        .fn()
        .mockResolvedValue(mockTransactionHash);

      const response = await request(app)
        .post("/api/register-data")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.commitmentHash).toBe(mockCommitmentHash);
      expect(response.body.transactionHash).toBe(mockTransactionHash);
      expect(mockStorageManager.storeData).toHaveBeenCalledWith(userData);
    });

    it("should return 400 for missing required fields", async () => {
      const incompleteData = {
        userDID: "did:midnight:user123",
        data: { name: "John Doe" },
        // Missing dataType and serviceProvider
      };

      const response = await request(app)
        .post("/api/register-data")
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBe("Bad Request");
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should return 400 for invalid userDID format", async () => {
      const invalidData = {
        userDID: "invalid-did-format",
        data: { name: "John Doe" },
        dataType: "profile",
        serviceProvider: "test-service",
      };

      const response = await request(app)
        .post("/api/register-data")
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe("Bad Request");
      expect(response.body.message).toContain("Invalid userDID format");
    });
  });

  describe("GET /api/user/:did/footprint", () => {
    it("should return user data footprint", async () => {
      const userDID = "did:midnight:user123";
      const mockDataLocations = [
        {
          commitmentHash: "abc123",
          userDID,
          dataType: "profile",
          serviceProvider: "service1",
          createdAt: new Date(),
          deleted: false,
        },
      ];
      const mockBlockchainCommitments = [
        {
          commitmentHash: "abc123",
          userDID,
          serviceProvider: "service1",
          dataCategories: ["profile"],
          createdAt: Date.now(),
          deleted: false,
        },
      ];

      mockStorageManager.getFootprint = jest
        .fn()
        .mockResolvedValue(mockDataLocations);
      mockMidnightClient.getUserCommitments = jest
        .fn()
        .mockResolvedValue(mockBlockchainCommitments);

      const response = await request(app)
        .get(`/api/user/${userDID}/footprint`)
        .expect(200);

      expect(response.body.userDID).toBe(userDID);
      expect(response.body.dataLocations).toHaveLength(1);
      expect(response.body.dataLocations[0].commitmentHash).toBe("abc123");
      expect(response.body.dataLocations[0].userDID).toBe(userDID);
      expect(response.body.blockchainCommitments).toEqual(
        mockBlockchainCommitments,
      );
      expect(response.body.totalRecords).toBe(1);
      expect(response.body.activeRecords).toBe(1);
      expect(response.body.deletedRecords).toBe(0);
    });

    it("should return 400 for invalid userDID format", async () => {
      const response = await request(app)
        .get("/api/user/invalid-did/footprint")
        .expect(400);

      expect(response.body.error).toBe("Bad Request");
      expect(response.body.message).toContain("Invalid userDID format");
    });
  });

  describe("POST /api/user/:did/delete-all", () => {
    it("should delete all user data successfully", async () => {
      const userDID = "did:midnight:user123";
      const mockCertificates = [
        {
          userDID,
          commitmentHash: "abc123",
          timestamp: Date.now(),
          signature: "signature123",
        },
      ];

      mockStorageManager.deleteData = jest
        .fn()
        .mockResolvedValue(mockCertificates);
      mockMidnightClient.generateDeletionProof = jest
        .fn()
        .mockResolvedValue("proof123");
      mockMidnightClient.markDeleted = jest
        .fn()
        .mockResolvedValue("tx_del_456");
      mockStorageManager.updateDeletionProof = jest
        .fn()
        .mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/user/${userDID}/delete-all`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userDID).toBe(userDID);
      expect(response.body.deletedRecords).toBe(1);
      expect(response.body.deletionProofs).toHaveLength(1);
      expect(response.body.deletionProofs[0].commitmentHash).toBe("abc123");
    });

    it("should return 404 when no data found", async () => {
      const userDID = "did:midnight:user123";
      mockStorageManager.deleteData = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .post(`/api/user/${userDID}/delete-all`)
        .expect(404);

      expect(response.body.error).toBe("Not Found");
      expect(response.body.message).toContain("No data found");
    });

    it("should return 400 for invalid userDID format", async () => {
      const response = await request(app)
        .post("/api/user/invalid-did/delete-all")
        .expect(400);

      expect(response.body.error).toBe("Bad Request");
      expect(response.body.message).toContain("Invalid userDID format");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app)
        .get("/api/unknown-endpoint")
        .expect(404);

      expect(response.body.error).toBe("Not Found");
      expect(response.body.message).toContain(
        "Route GET /api/unknown-endpoint not found",
      );
    });
  });
});
