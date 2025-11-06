import { Pool, PoolConfig } from "pg";
import { StorageConfig } from "../types";

/**
 * PostgreSQL connection management for Oblivion Protocol
 */
export class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor(config: StorageConfig) {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

    this.pool = new Pool(poolConfig);

    // Handle pool errors
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  /**
   * Get singleton instance of database connection
   */
  public static getInstance(config?: StorageConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      if (!config) {
        throw new Error(
          "Database configuration required for first initialization",
        );
      }
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get the connection pool
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }

  /**
   * Initialize database schema (run migrations)
   */
  public async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Create encrypted_data table
      await client.query(`
        CREATE TABLE IF NOT EXISTS encrypted_data (
          commitment_hash BYTEA PRIMARY KEY,
          user_did VARCHAR(255) NOT NULL,
          encrypted_payload BYTEA NOT NULL,
          encryption_iv BYTEA NOT NULL,
          data_type VARCHAR(100),
          service_provider VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          deleted BOOLEAN DEFAULT FALSE,
          deleted_at TIMESTAMP,
          deletion_proof_hash BYTEA
        )
      `);

      // Create performance indexes
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_user_did ON encrypted_data(user_did)",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_service_provider ON encrypted_data(service_provider)",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_created_at ON encrypted_data(created_at)",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_deleted ON encrypted_data(deleted)",
      );

      await client.query("COMMIT");
      console.log("Database schema initialized successfully");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to initialize database schema:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
