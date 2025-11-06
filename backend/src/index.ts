/**
 * Oblivion Protocol Backend
 * Main entry point for the backend storage and encryption system
 */

export { StorageManager } from "./storage/StorageManager";
export { MidnightClient } from "./midnight/MidnightClient";
export { DatabaseConnection } from "./database/connection";
export { getAppConfig, validateConfig } from "./config";
export * from "./types";
export * from "./utils/crypto";

// Re-export for convenience
export type {
  UserData,
  DeletionCertificate,
  DataLocation,
  EncryptedDataRecord,
  StorageConfig,
} from "./types";

export type {
  MidnightConfig,
  CommitmentParams,
  DeletionProofParams,
  BlockchainCommitment,
} from "./midnight/MidnightClient";
