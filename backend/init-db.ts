import { getAppConfig } from "./src/config";
import { DatabaseConnection } from "./src/database/connection";

async function initializeDatabase() {
  console.log("Initializing Oblivion Protocol database...");

  const config = getAppConfig();
  const db = DatabaseConnection.getInstance(config.storage);

  try {
    // Test connection
    console.log("Testing database connection...");
    const connected = await db.testConnection();

    if (!connected) {
      throw new Error("Failed to connect to database");
    }

    console.log("✓ Database connection successful");

    // Initialize schema
    console.log("Creating database schema...");
    await db.initializeSchema();
    console.log("✓ Database schema initialized");

    console.log("\n✓ Database initialization complete!");
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Database initialization failed!");
    console.error("Error:", error);
    await db.close();
    process.exit(1);
  }
}

initializeDatabase();
