import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Focused test for ZK proof generation and proof server connectivity
 */

async function testProofServer() {
  console.log("=== ZK Proof Server Connectivity Test ===\n");

  const proofServerUrl =
    process.env.MIDNIGHT_PROOF_SERVER_URL || "http://localhost:6300";
  console.log(`Proof Server URL: ${proofServerUrl}\n`);

  // Test 1: Health check
  console.log("Test 1: Proof server health check...");
  try {
    const response = await axios.get(`${proofServerUrl}/health`, {
      timeout: 5000,
    });
    console.log(`✓ Proof server is healthy (Status: ${response.status})`);
    if (response.data) {
      console.log(`  Response: ${JSON.stringify(response.data)}`);
    }
    console.log();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`✗ Health check failed: ${error.message}`);
      if (error.code === "ECONNREFUSED") {
        console.log("\n⚠️  Proof server is not running!");
        console.log("To start the proof server:");
        console.log("  1. Refer to docs/PROOF_SERVER_SETUP.md");
        console.log("  2. Ensure you have the Midnight SDK installed");
        console.log("  3. Run the proof server on port 6300\n");
        return;
      }
    }
    console.error(error);
    console.log();
  }

  // Test 2: Generate commitment registration proof
  console.log("Test 2: Generate commitment registration proof...");
  try {
    const sampleWitness = {
      commitmentHash:
        "0x" + Buffer.from("sample_commitment_data").toString("hex"),
      userDID: "did:midnight:test123456789",
      serviceProvider: "TestServiceProvider",
      dataCategories: ["personal_info", "browsing_history"],
      timestamp: Date.now(),
    };

    console.log("Sample witness data:");
    console.log(JSON.stringify(sampleWitness, null, 2));
    console.log("\nGenerating proof (this may take 10-30 seconds)...");

    const startTime = Date.now();
    const response = await axios.post(
      `${proofServerUrl}/generate-proof`,
      {
        circuit: "DataCommitment.registerCommitment",
        witness: sampleWitness,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      },
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Proof generated successfully in ${duration}s`);
    console.log(`  Status: ${response.status}`);

    if (response.data) {
      console.log(`  Response keys: ${Object.keys(response.data).join(", ")}`);
      if (response.data.proof) {
        const proofPreview = JSON.stringify(response.data.proof).substring(
          0,
          100,
        );
        console.log(`  Proof preview: ${proofPreview}...`);
      }
      if (response.data.proofHash) {
        console.log(`  Proof hash: ${response.data.proofHash}`);
      }
    }
    console.log();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`✗ Proof generation failed: ${error.message}`);
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Response: ${JSON.stringify(error.response.data)}`);
      }
      if (error.code === "ECONNABORTED") {
        console.log(
          "\n⚠️  Request timed out - proof generation may take longer",
        );
        console.log(
          "  Consider increasing timeout or checking proof server resources",
        );
      }
    } else {
      console.error(error);
    }
    console.log();
  }

  // Test 3: Generate deletion proof
  console.log("Test 3: Generate deletion proof...");
  try {
    const deletionWitness = {
      userDID: "did:midnight:test123456789",
      commitmentHash:
        "0x" + Buffer.from("sample_commitment_data").toString("hex"),
      deletionCertificate: JSON.stringify({
        deletedAt: new Date().toISOString(),
        deletedBy: "TestServiceProvider",
        verificationMethod: "api_confirmation",
      }),
      timestamp: Date.now(),
    };

    console.log("Deletion witness data:");
    console.log(JSON.stringify(deletionWitness, null, 2));
    console.log("\nGenerating deletion proof (this may take 30-60 seconds)...");

    const startTime = Date.now();
    const response = await axios.post(
      `${proofServerUrl}/generate-proof`,
      {
        circuit: "ZKDeletionVerifier.verifyDeletion",
        witness: deletionWitness,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 90000,
      },
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Deletion proof generated successfully in ${duration}s`);
    console.log(`  Status: ${response.status}`);

    if (response.data) {
      console.log(`  Response keys: ${Object.keys(response.data).join(", ")}`);
      if (response.data.proof) {
        const proofPreview = JSON.stringify(response.data.proof).substring(
          0,
          100,
        );
        console.log(`  Proof preview: ${proofPreview}...`);
      }
      if (response.data.proofHash) {
        console.log(`  Proof hash: ${response.data.proofHash}`);
      }
    }
    console.log();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`✗ Deletion proof generation failed: ${error.message}`);
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Response: ${JSON.stringify(error.response.data)}`);
      }
      if (error.code === "ECONNABORTED") {
        console.log(
          "\n⚠️  Request timed out - deletion proofs typically take longer",
        );
        console.log("  This is normal for complex ZK circuits");
      }
    } else {
      console.error(error);
    }
    console.log();
  }

  // Test 4: Check proof server capabilities
  console.log("Test 4: Query proof server capabilities...");
  try {
    const response = await axios.get(`${proofServerUrl}/circuits`, {
      timeout: 5000,
    });
    console.log(`✓ Retrieved circuit information`);
    console.log(`  Status: ${response.status}`);
    if (response.data) {
      console.log(
        `  Available circuits: ${JSON.stringify(response.data, null, 2)}`,
      );
    }
    console.log();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log("⚠️  /circuits endpoint not available (this is optional)");
      } else {
        console.error(`✗ Failed to query circuits: ${error.message}`);
      }
    }
    console.log();
  }

  console.log("=== Test Complete ===\n");
  console.log("Summary:");
  console.log(
    "  ✓ If health check passed: Proof server is running and accessible",
  );
  console.log(
    "  ✓ If proof generation passed: ZK circuits are working correctly",
  );
  console.log(
    "  ✓ If any tests failed: Check error messages above for details\n",
  );
}

// Run the test
testProofServer()
  .then(() => {
    console.log("Proof server test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed with error:");
    console.error(error);
    process.exit(1);
  });
