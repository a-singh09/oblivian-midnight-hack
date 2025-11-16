/**
 * Oblivion Protocol Backend
 * Main entry point for the backend API server
 */

import { OblivionServer } from "./server.js";

// Export server class and other components
export { OblivionServer } from "./server.js";
export { StorageManager } from "./storage/StorageManager.js";
export { MidnightClient } from "./midnight/MidnightClient.js";
export { DatabaseConnection } from "./database/connection.js";
export { getAppConfig, validateConfig } from "./config/index.js";
export * from "./types/index.js";
export * from "./utils/crypto.js";

// Re-export for convenience
export type {
  UserData,
  DeletionCertificate,
  DataLocation,
  EncryptedDataRecord,
  StorageConfig,
} from "./types/index.js";

export type {
  MidnightConfig,
  CommitmentParams,
  DeletionProofParams,
  BlockchainCommitment,
} from "./midnight/MidnightClient.js";

// Main function to start the server
async function main() {
  try {
    const server = new OblivionServer();
    await server.initialize();
    await server.start();
  } catch (error) {
    console.error("Failed to start Oblivion Protocol server:", error);
    process.exit(1);
  }
}

// Start server (ES modules don't have require.main)
main();
