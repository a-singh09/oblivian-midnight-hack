/**
 * Express.js integration example for Oblivion SDK
 *
 * This example shows how to integrate GDPR compliance
 * into an Express.js REST API using the Oblivion SDK.
 */

import express from "express";
import { OblivionSDK, SDKConfig } from "@oblivion/sdk";

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Oblivion SDK
const sdkConfig: SDKConfig = {
  apiKey: process.env.OBLIVION_API_KEY || "your-api-key-here",
  serviceName: "MyExpressApp",
  apiUrl: process.env.OBLIVION_API_URL || "http://localhost:3000",
};

const oblivion = new OblivionSDK(sdkConfig);

// Mock database (replace with your actual database)
interface User {
  id: string;
  did: string;
  name: string;
  email: string;
  createdAt: Date;
}

const users: User[] = [];

/**
 * Create a new user with automatic GDPR registration
 */
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Generate user DID (in production, use proper DID generation)
    const userDID = `did:midnight:user_${Date.now()}`;

    // Create user in your database
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      did: userDID,
      name,
      email,
      createdAt: new Date(),
    };

    users.push(user);

    // Register with Oblivion for GDPR compliance
    try {
      const registration = await oblivion.registerUserData(
        userDID,
        { name, email },
        "profile",
      );

      console.log("✅ User registered with GDPR compliance");
      console.log("   Commitment Hash:", registration.commitmentHash);
    } catch (gdprError) {
      // Log GDPR registration failure but don't fail user creation
      console.error("⚠️ GDPR registration failed:", gdprError.message);
      // In production, you might want to queue this for retry
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        did: user.did,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("User creation failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
});

/**
 * Get user's data footprint (GDPR Article 15 - Right of Access)
 */
app.get("/api/users/:userDID/gdpr-footprint", async (req, res) => {
  try {
    const { userDID } = req.params;

    // Get data footprint from Oblivion
    const footprint = await oblivion.getUserData(userDID);

    res.json({
      success: true,
      userDID,
      dataRecords: footprint.data,
      totalRecords: footprint.data.length,
    });
  } catch (error) {
    console.error("Failed to get data footprint:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve data footprint",
    });
  }
});

/**
 * Handle user deletion request (GDPR Article 17 - Right to Be Forgotten)
 */
app.delete("/api/users/:userDID", async (req, res) => {
  try {
    const { userDID } = req.params;

    // Find and remove user from your database
    const userIndex = users.findIndex((u) => u.did === userDID);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const user = users[userIndex];
    users.splice(userIndex, 1);

    // Handle GDPR deletion with cryptographic proof
    const deletion = await oblivion.handleDeletion(userDID);

    console.log("✅ User deleted with GDPR compliance");
    console.log("   Records deleted:", deletion.deletedCount);
    console.log("   Blockchain proofs:", deletion.blockchainProofs);

    res.json({
      success: true,
      message: "User deleted successfully with cryptographic proof",
      deletedUser: {
        id: user.id,
        did: user.did,
        name: user.name,
      },
      gdprCompliance: {
        recordsDeleted: deletion.deletedCount,
        blockchainProofs: deletion.blockchainProofs,
        verificationUrl: `https://midnight-explorer.com/proofs/${deletion.blockchainProofs[0]}`,
      },
    });
  } catch (error) {
    console.error("User deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
});

/**
 * Webhook endpoint for handling deletion requests from Oblivion dashboard
 */
app.post("/webhooks/oblivion/deletion", async (req, res) => {
  try {
    const { userDID, deletionRequest } = req.body;

    console.log("🔔 Received deletion webhook for user:", userDID);

    // Find and remove user from your database
    const userIndex = users.findIndex((u) => u.did === userDID);
    if (userIndex !== -1) {
      const user = users[userIndex];
      users.splice(userIndex, 1);
      console.log("✅ User removed from local database:", user.name);
    }

    // Confirm deletion to Oblivion (this will generate the cryptographic proof)
    const deletion = await oblivion.handleDeletion(userDID);

    res.json({
      success: true,
      message: "Deletion processed successfully",
      recordsDeleted: deletion.deletedCount,
      proofs: deletion.blockchainProofs,
    });
  } catch (error) {
    console.error("Webhook deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process deletion webhook",
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/api/health", async (req, res) => {
  try {
    // Check both app and Oblivion API health
    const oblivionHealth = await oblivion.healthCheck();

    res.json({
      success: true,
      app: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        users: users.length,
      },
      oblivion: oblivionHealth,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      app: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
      oblivion: {
        status: "unhealthy",
        error: error.message,
      },
    });
  }
});

/**
 * List all users (for demo purposes)
 */
app.get("/api/users", (req, res) => {
  res.json({
    success: true,
    users: users.map((u) => ({
      id: u.id,
      did: u.did,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    })),
    total: users.length,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST /api/users - Create user with GDPR registration`);
  console.log(`   GET  /api/users - List all users`);
  console.log(
    `   GET  /api/users/:userDID/gdpr-footprint - Get data footprint`,
  );
  console.log(`   DELETE /api/users/:userDID - Delete user with GDPR proof`);
  console.log(`   POST /webhooks/oblivion/deletion - Handle deletion webhooks`);
  console.log(`   GET  /api/health - Health check`);
  console.log(
    `\n💡 Make sure Oblivion backend is running on ${sdkConfig.apiUrl}`,
  );
});

export default app;
