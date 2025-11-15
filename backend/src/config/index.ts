import { config } from "dotenv";
import { StorageConfig } from "../types";
import { MidnightConfig, NetworkId } from "../midnight/MidnightClient";

// Load environment variables
config();

/**
 * Configuration management for Oblivion Protocol backend
 */

export interface AppConfig {
  port: number;
  nodeEnv: string;
  storage: StorageConfig;
  midnight: MidnightConfig;
  encryptionKey: string;
}

/**
 * Get storage configuration from environment variables
 */
function getStorageConfig(): StorageConfig {
  // Configure SSL based on environment variables
  let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;

  if (process.env.DB_SSL === "true") {
    if (process.env.DATABASE_CA_CERT) {
      // Aiven and other managed databases require CA certificate
      // Convert base64 certificate to PEM format if needed
      let caCert = process.env.DATABASE_CA_CERT;

      // If the cert doesn't have PEM headers, add them
      if (!caCert.includes("BEGIN CERTIFICATE")) {
        // Split into 64-character lines for proper PEM format
        const certBody = caCert.replace(/\s/g, "");
        const formattedCert =
          certBody.match(/.{1,64}/g)?.join("\n") || certBody;
        caCert = `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----`;
      }

      sslConfig = {
        rejectUnauthorized: false, // Aiven uses self-signed certificates
        ca: caCert,
      };
    } else {
      // Simple SSL without CA certificate
      sslConfig = true;
    }
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "oblivion_protocol",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    ssl: sslConfig,
  };
}

/**
 * Get Midnight configuration from environment variables
 */
function getMidnightConfig(): MidnightConfig {
  const networkId = process.env.MIDNIGHT_NETWORK_ID || "testnet";

  // Map string network ID to NetworkId enum
  let midnightNetworkId: NetworkId;
  switch (networkId.toLowerCase()) {
    case "testnet":
      midnightNetworkId = "testnet" as NetworkId;
      break;
    case "mainnet":
      midnightNetworkId = "mainnet" as NetworkId;
      break;
    case "devnet":
      midnightNetworkId = "devnet" as NetworkId;
      break;
    default:
      midnightNetworkId = "testnet" as NetworkId;
  }

  return {
    nodeUrl:
      process.env.MIDNIGHT_NODE_URL ||
      "https://rpc.testnet-02.midnight.network",
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URL ||
      "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    proofServerUrl:
      process.env.MIDNIGHT_PROOF_SERVER_URL || "http://localhost:6300",
    networkId: midnightNetworkId,
    walletSeed: process.env.MIDNIGHT_WALLET_SEED,
    dataCommitmentContract: process.env.DATA_COMMITMENT_CONTRACT,
    zkDeletionVerifierContract: process.env.ZK_DELETION_VERIFIER_CONTRACT,
  };
}

/**
 * Get complete application configuration
 */
export function getAppConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || "3000"),
    nodeEnv: process.env.NODE_ENV || "development",
    storage: getStorageConfig(),
    midnight: getMidnightConfig(),
    encryptionKey:
      process.env.ENCRYPTION_KEY || "default-key-change-in-production",
  };
}

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // Warn about missing contract addresses
  if (!process.env.DATA_COMMITMENT_CONTRACT) {
    console.warn(
      "WARNING: DATA_COMMITMENT_CONTRACT not set. Contract interactions will fail.",
    );
  }

  if (!process.env.ZK_DELETION_VERIFIER_CONTRACT) {
    console.warn(
      "WARNING: ZK_DELETION_VERIFIER_CONTRACT not set. ZK proof verification will fail.",
    );
  }

  // Warn about default encryption key in production
  if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_KEY) {
    console.warn(
      "WARNING: Using default encryption key in production. Set ENCRYPTION_KEY environment variable.",
    );
  }

  console.log("Configuration validation passed");
  console.log(
    `Midnight Network: ${process.env.MIDNIGHT_NETWORK_ID || "testnet"}`,
  );
  console.log(
    `Data Commitment Contract: ${process.env.DATA_COMMITMENT_CONTRACT || "Not set"}`,
  );
  console.log(
    `ZK Deletion Verifier Contract: ${process.env.ZK_DELETION_VERIFIER_CONTRACT || "Not set"}`,
  );
}
