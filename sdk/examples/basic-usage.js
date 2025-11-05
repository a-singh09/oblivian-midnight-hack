/**
 * Basic usage example for Oblivion SDK
 *
 * This example shows how to integrate the Oblivion SDK
 * into a simple Node.js application for GDPR compliance.
 */

const { OblivionSDK } = require("@oblivion/sdk");

// Initialize the SDK
const oblivion = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY || "your-api-key-here",
  serviceName: "ExampleApp",
});

async function demonstrateSDK() {
  try {
    console.log("🚀 Oblivion SDK Demo Starting...\n");

    // 1. Health check
    console.log("1. Checking API health...");
    const health = await oblivion.healthCheck();
    console.log("✅ API Status:", health.status);
    console.log("   Timestamp:", health.timestamp);
    console.log("");

    // 2. Register user data
    console.log("2. Registering user data...");
    const userDID = "did:midnight:user_demo_123";
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      preferences: {
        newsletter: true,
        analytics: false,
      },
    };

    const registration = await oblivion.registerUserData(
      userDID,
      userData,
      "profile",
    );

    console.log("✅ Data registered successfully!");
    console.log("   Commitment Hash:", registration.commitmentHash);
    console.log("   Blockchain Tx:", registration.blockchainTx);
    console.log("");

    // 3. Get user data (Right to Access)
    console.log("3. Retrieving user data footprint...");
    const footprint = await oblivion.getUserData(userDID);
    console.log("✅ Found", footprint.data.length, "data records");
    footprint.data.forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     Type: ${record.dataType}`);
      console.log(`     Created: ${record.createdAt}`);
      console.log(`     Deleted: ${record.deleted}`);
    });
    console.log("");

    // 4. Handle deletion (Right to Be Forgotten)
    console.log("4. Handling deletion request...");
    const deletion = await oblivion.handleDeletion(userDID);
    console.log("✅ Deletion completed!");
    console.log("   Records deleted:", deletion.deletedCount);
    console.log("   Blockchain proofs:", deletion.blockchainProofs.length);
    deletion.blockchainProofs.forEach((proof, index) => {
      console.log(`     Proof ${index + 1}: ${proof}`);
    });

    console.log("\n🎉 Demo completed successfully!");
    console.log(
      "The user's data has been cryptographically deleted with blockchain proof.",
    );
  } catch (error) {
    console.error("❌ Demo failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log(
        "\n💡 Tip: Make sure the Oblivion backend is running on localhost:3000",
      );
      console.log(
        "   You can start it with: npm run dev (in the backend directory)",
      );
    } else if (error.message.includes("401")) {
      console.log("\n💡 Tip: Check your API key in the environment variables");
      console.log("   Set OBLIVION_API_KEY=your-actual-api-key");
    }
  }
}

// Run the demo
if (require.main === module) {
  demonstrateSDK();
}

module.exports = { demonstrateSDK };
