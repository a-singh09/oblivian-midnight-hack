/**
 * Oblivion Protocol Backend
 * Main entry point for the backend API server
 */

import { OblivionServer } from "./server";

// Export server class and other components
export { OblivionServer } from "./server";
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

// Start server if this file is run directly
if (require.main === module) {
  main();
}
