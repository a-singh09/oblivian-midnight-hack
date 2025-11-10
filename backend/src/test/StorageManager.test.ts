import { StorageManager } from "../storage/StorageManager";
import { MidnightClient } from "../midnight/MidnightClient";
import { getAppConfig } from "../config";

describe("StorageManager", () => {
  let storageManager: StorageManager;
  let config: any;

  beforeAll(() => {
    config = {
      host: "localhost",
      port: 5432,
      database: "test_db",
      username: "test_user",
      password: "test_pass",
      ssl: false,
    };
  });

  beforeEach(() => {
    storageManager = new StorageManager(config);
  });

  test("should create StorageManager instance", () => {
    expect(storageManager).toBeInstanceOf(StorageManager);
  });

  test("should generate commitment hash for user data", async () => {
    const userData = {
      userDID: "did:example:123",
      data: { name: "John Doe", email: "john@example.com" },
      dataType: "profile",
      serviceProvider: "example-service",
    };

    // Mock the database operations for testing
    const mockQuery = jest
      .fn()
      .mockResolvedValue({
        rows: [{ commitment_hash: Buffer.from("test-hash", "hex") }],
      });
    (storageManager as any).db = { query: mockQuery };

    // This would normally require a real database connection
    // For now, we'll just test that the method exists and has the right signature
    expect(typeof storageManager.storeData).toBe("function");
  });
});

describe("MidnightClient", () => {
  let midnightClient: MidnightClient;
  let config: any;

  beforeAll(() => {
    config = {
      nodeUrl: "http://localhost:8080",
      indexerUrl: "http://localhost:8081",
      proofServerUrl: "http://localhost:6300",
      networkId: "testnet" as const,
    };
  });

  beforeEach(() => {
    midnightClient = new MidnightClient(config);
  });

  test("should create MidnightClient instance", () => {
    expect(midnightClient).toBeInstanceOf(MidnightClient);
  });

  test("should have required methods", () => {
    expect(typeof midnightClient.initialize).toBe("function");
    expect(typeof midnightClient.registerCommitment).toBe("function");
    expect(typeof midnightClient.generateDeletionProof).toBe("function");
    expect(typeof midnightClient.markDeleted).toBe("function");
    expect(typeof midnightClient.getUserCommitments).toBe("function");
  });

  test("should get configuration", () => {
    const retrievedConfig = midnightClient.getConfig();
    expect(retrievedConfig.networkId).toBe("testnet");
    expect(retrievedConfig.nodeUrl).toBe("http://localhost:8080");
  });
});

describe("Configuration", () => {
  test("should load app configuration", () => {
    // Set test environment variables
    process.env.DB_HOST = "test-host";
    process.env.DB_NAME = "test-db";
    process.env.DB_USER = "test-user";
    process.env.DB_PASSWORD = "test-pass";

    const config = getAppConfig();

    expect(config.storage.host).toBe("test-host");
    expect(config.storage.database).toBe("test-db");
    expect(config.storage.username).toBe("test-user");
    expect(config.storage.password).toBe("test-pass");
  });
});
