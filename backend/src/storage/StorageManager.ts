import { Pool } from "pg";
import { DatabaseConnection } from "../database/connection";
import {
  UserData,
  DeletionCertificate,
  DataLocation,
  EncryptedDataRecord,
  StorageConfig,
} from "../types";
import {
  encryptData,
  decryptData,
  generateCommitmentHash,
  generateDeletionSignature,
  generateEncryptionKey,
} from "../utils/crypto";

/**
 * StorageManager handles encrypted off-chain data storage for Oblivion Protocol
 * Implements AES-256-CBC encryption with random IVs and commitment hash generation
 */
export class StorageManager {
  private db: Pool;
  private encryptionKey: Buffer;

  constructor(config: StorageConfig, encryptionKey?: Buffer) {
    const dbConnection = DatabaseConnection.getInstance(config);
    this.db = dbConnection.getPool();
    this.encryptionKey = encryptionKey || generateEncryptionKey();
  }

  /**
   * Initialize the storage system
   */
  public async initialize(): Promise<void> {
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.initializeSchema();

    // Test connection
    const isConnected = await dbConnection.testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to database");
    }

    console.log("StorageManager initialized successfully");
  }

  /**
   * Store user data with encryption and generate commitment hash
   * Requirements: 2.2, 5.1, 5.2
   */
  public async storeData(userData: UserData): Promise<string> {
    try {
      // Serialize user data
      const dataString = JSON.stringify({
        userDID: userData.userDID,
        data: userData.data,
        dataType: userData.dataType,
        serviceProvider: userData.serviceProvider,
        timestamp: Date.now(),
      });

      // Encrypt the data
      const { encrypted, iv } = encryptData(dataString, this.encryptionKey);

      // Generate commitment hash
      const commitmentHash = generateCommitmentHash(encrypted);
      const commitmentHashBuffer = Buffer.from(commitmentHash, "hex");

      // Store in database
      const query = `
        INSERT INTO encrypted_data (
          commitment_hash, user_did, encrypted_payload, encryption_iv, 
          data_type, service_provider, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (commitment_hash) DO NOTHING
        RETURNING commitment_hash
      `;

      const values = [
        commitmentHashBuffer,
        userData.userDID,
        encrypted,
        iv,
        userData.dataType,
        userData.serviceProvider,
      ];

      const result = await this.db.query(query, values);

      if (result.rows.length === 0) {
        // Hash collision or duplicate data
        console.warn(
          `Commitment hash collision or duplicate for user ${userData.userDID}`,
        );
      }

      console.log(
        `Data stored for user ${userData.userDID}, commitment hash: ${commitmentHash}`,
      );
      return commitmentHash;
    } catch (error) {
      console.error("Error storing data:", error);
      throw new Error(
        `Failed to store data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete user data and generate deletion certificates
   * Requirements: 2.2, 5.1, 5.2
   */
  public async deleteData(userDID: string): Promise<DeletionCertificate[]> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      // Get all data records for the user
      const selectQuery = `
        SELECT commitment_hash, user_did, data_type, service_provider, created_at
        FROM encrypted_data 
        WHERE user_did = $1 AND deleted = FALSE
        FOR UPDATE
      `;

      const selectResult = await client.query(selectQuery, [userDID]);

      if (selectResult.rows.length === 0) {
        await client.query("ROLLBACK");
        console.log(`No data found for user ${userDID}`);
        return [];
      }

      const certificates: DeletionCertificate[] = [];
      const timestamp = Date.now();

      // Process each record
      for (const row of selectResult.rows) {
        const commitmentHash = row.commitment_hash.toString("hex");

        // Generate deletion certificate
        const signature = generateDeletionSignature(
          userDID,
          commitmentHash,
          timestamp,
        );

        const certificate: DeletionCertificate = {
          userDID,
          commitmentHash,
          timestamp,
          signature,
        };

        certificates.push(certificate);
      }

      // Mark all records as deleted (physical deletion)
      const deleteQuery = `
        UPDATE encrypted_data 
        SET deleted = TRUE, deleted_at = NOW(), encrypted_payload = NULL, encryption_iv = NULL
        WHERE user_did = $1 AND deleted = FALSE
      `;

      const deleteResult = await client.query(deleteQuery, [userDID]);

      await client.query("COMMIT");

      console.log(
        `Deleted ${deleteResult.rowCount} records for user ${userDID}`,
      );
      return certificates;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting data:", error);
      throw new Error(
        `Failed to delete data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      client.release();
    }
  }

  /**
   * Get user's data footprint (all data locations)
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  public async getFootprint(userDID: string): Promise<DataLocation[]> {
    try {
      const query = `
        SELECT 
          commitment_hash,
          user_did,
          data_type,
          service_provider,
          created_at,
          deleted,
          deleted_at,
          deletion_proof_hash
        FROM encrypted_data 
        WHERE user_did = $1
        ORDER BY created_at DESC
      `;

      const result = await this.db.query(query, [userDID]);

      const dataLocations: DataLocation[] = result.rows.map((row) => ({
        commitmentHash: row.commitment_hash.toString("hex"),
        userDID: row.user_did,
        dataType: row.data_type || "unknown",
        serviceProvider: row.service_provider || "unknown",
        createdAt: row.created_at,
        deleted: row.deleted,
        deletedAt: row.deleted_at || undefined,
        deletionProofHash: row.deletion_proof_hash
          ? row.deletion_proof_hash.toString("hex")
          : undefined,
      }));

      console.log(
        `Retrieved ${dataLocations.length} data locations for user ${userDID}`,
      );
      return dataLocations;
    } catch (error) {
      console.error("Error getting footprint:", error);
      throw new Error(
        `Failed to get footprint: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update deletion proof hash for a commitment
   */
  public async updateDeletionProof(
    commitmentHash: string,
    proofHash: string,
  ): Promise<void> {
    try {
      const query = `
        UPDATE encrypted_data 
        SET deletion_proof_hash = $1
        WHERE commitment_hash = $2
      `;

      const proofHashBuffer = Buffer.from(proofHash, "hex");
      const commitmentHashBuffer = Buffer.from(commitmentHash, "hex");

      const result = await this.db.query(query, [
        proofHashBuffer,
        commitmentHashBuffer,
      ]);

      if (result.rowCount === 0) {
        throw new Error(
          `No record found for commitment hash: ${commitmentHash}`,
        );
      }

      console.log(`Updated deletion proof for commitment: ${commitmentHash}`);
    } catch (error) {
      console.error("Error updating deletion proof:", error);
      throw new Error(
        `Failed to update deletion proof: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get encrypted data record by commitment hash (for internal use)
   */
  public async getEncryptedRecord(
    commitmentHash: string,
  ): Promise<EncryptedDataRecord | null> {
    try {
      const query = `
        SELECT * FROM encrypted_data WHERE commitment_hash = $1
      `;

      const commitmentHashBuffer = Buffer.from(commitmentHash, "hex");
      const result = await this.db.query(query, [commitmentHashBuffer]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        commitmentHash: row.commitment_hash,
        userDID: row.user_did,
        encryptedPayload: row.encrypted_payload,
        encryptionIV: row.encryption_iv,
        dataType: row.data_type,
        serviceProvider: row.service_provider,
        createdAt: row.created_at,
        deleted: row.deleted,
        deletedAt: row.deleted_at,
        deletionProofHash: row.deletion_proof_hash,
      };
    } catch (error) {
      console.error("Error getting encrypted record:", error);
      throw new Error(
        `Failed to get encrypted record: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<{
    totalRecords: number;
    deletedRecords: number;
    activeRecords: number;
  }> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE deleted = TRUE) as deleted_records,
          COUNT(*) FILTER (WHERE deleted = FALSE) as active_records
        FROM encrypted_data
      `;

      const result = await this.db.query(query);
      const row = result.rows[0];

      return {
        totalRecords: parseInt(row.total_records),
        deletedRecords: parseInt(row.deleted_records),
        activeRecords: parseInt(row.active_records),
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      throw new Error(
        `Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Close database connections
   */
  public async close(): Promise<void> {
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.close();
  }
}
