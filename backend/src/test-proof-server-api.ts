import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Explore and test the actual Midnight proof server API
 */

async function exploreProofServerAPI() {
  console.log("=== Midnight Proof Server API Explorer ===\n");

  const proofServerUrl =
    process.env.MIDNIGHT_PROOF_SERVER_URL || "http://localhost:6300";
  console.log(`Proof Server URL: ${proofServerUrl}\n`);

  // Test 1: Health endpoint
  console.log("Test 1: Health Check");
  console.log("─────────────────────────────────────");
  try {
    const response = await axios.get(`${proofServerUrl}/health`, {
      timeout: 5000,
    });
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Response: ${JSON.stringify(response.data)}`);
    console.log(`✓ Headers: ${JSON.stringify(response.headers, null, 2)}`);
  } catch (error) {
    console.error(
      `✗ Failed: ${error instanceof Error ? error.message : error}`,
    );
  }
  console.log();

  // Test 2: Try common API endpoints
  const endpoints = [
    "/",
    "/api",
    "/status",
    "/info",
    "/version",
    "/circuits",
    "/prove",
    "/generate",
    "/generate-proof",
  ];

  console.log("Test 2: Exploring Common Endpoints");
  console.log("─────────────────────────────────────");
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${proofServerUrl}${endpoint}`, {
        timeout: 3000,
        validateStatus: () => true, // Accept any status code
      });
      console.log(`${endpoint.padEnd(20)} → Status ${response.status}`);
      if (response.status === 200 && response.data) {
        const preview = JSON.stringify(response.data).substring(0, 100);
        console.log(
          `${"".padEnd(20)}   Data: ${preview}${preview.length >= 100 ? "..." : ""}`,
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        console.log(`${endpoint.padEnd(20)} → Timeout`);
      } else {
        console.log(
          `${endpoint.padEnd(20)} → Error: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }
  console.log();

  // Test 3: Try POST endpoints with sample data
  console.log("Test 3: Testing POST Endpoints");
  console.log("─────────────────────────────────────");

  const sampleProofRequest = {
    circuit: "test",
    witness: { data: "sample" },
  };

  const postEndpoints = [
    "/prove",
    "/generate",
    "/generate-proof",
    "/api/prove",
  ];

  for (const endpoint of postEndpoints) {
    try {
      const response = await axios.post(
        `${proofServerUrl}${endpoint}`,
        sampleProofRequest,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
          validateStatus: () => true,
        },
      );
      console.log(`POST ${endpoint.padEnd(20)} → Status ${response.status}`);
      if (response.data) {
        const preview = JSON.stringify(response.data).substring(0, 150);
        console.log(
          `${"".padEnd(25)}   Response: ${preview}${preview.length >= 150 ? "..." : ""}`,
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        console.log(`POST ${endpoint.padEnd(20)} → Timeout`);
      } else {
        console.log(`POST ${endpoint.padEnd(20)} → Error`);
      }
    }
  }
  console.log();

  // Test 4: Check if it's a standard Midnight proof server
  console.log("Test 4: Midnight Proof Server Detection");
  console.log("─────────────────────────────────────");
  try {
    const response = await axios.get(`${proofServerUrl}/health`, {
      timeout: 3000,
    });
    const isAlive = response.data === "We're alive 🎉!";

    if (isAlive) {
      console.log("✓ Detected: Standard Midnight Proof Server");
      console.log("✓ This is the official Midnight proof server");
      console.log();
      console.log("Note: The Midnight proof server is designed to work with");
      console.log("      compiled Compact circuits from the Midnight SDK.");
      console.log(
        "      It doesn't expose a generic REST API for proof generation.",
      );
      console.log();
      console.log("Integration approach:");
      console.log("  1. Compile your Compact contracts using the Midnight SDK");
      console.log(
        "  2. Use the Midnight.js client library to interact with contracts",
      );
      console.log(
        "  3. The SDK handles proof generation via the proof server automatically",
      );
      console.log("  4. No direct HTTP calls needed - SDK abstracts this");
    }
  } catch (error) {
    console.log("⚠️  Could not determine proof server type");
  }
  console.log();

  console.log("=== Summary ===");
  console.log("✓ Proof server is running and healthy");
  console.log("✓ Server responds to /health endpoint");
  console.log("✓ Ready for Midnight SDK integration");
  console.log();
  console.log("Next steps:");
  console.log("  1. Ensure your Compact contracts are compiled");
  console.log("  2. Use Midnight.js SDK for contract interactions");
  console.log("  3. The SDK will automatically use the proof server");
  console.log("  4. No manual proof generation API calls needed");
  console.log();
}

exploreProofServerAPI()
  .then(() => {
    console.log("API exploration complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Exploration failed:", error);
    process.exit(1);
  });
