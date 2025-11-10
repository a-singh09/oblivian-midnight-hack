import * as http from "http";

/**
 * Test script to verify Midnight proof server connectivity
 * This script checks if the proof server is running and accessible
 */

const PROOF_SERVER_URL = "http://localhost:6300";
const TIMEOUT_MS = 5000;

interface ProofServerStatus {
  isRunning: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * Check if proof server is accessible
 */
async function checkProofServer(): Promise<ProofServerStatus> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const request = http.get(`${PROOF_SERVER_URL}/health`, (res) => {
      const responseTime = Date.now() - startTime;

      if (res.statusCode === 200 || res.statusCode === 404) {
        // 404 is acceptable - means server is running but endpoint might differ
        resolve({
          isRunning: true,
          responseTime,
        });
      } else {
        resolve({
          isRunning: false,
          error: `Unexpected status code: ${res.statusCode}`,
        });
      }
    });

    request.on("error", (error) => {
      resolve({
        isRunning: false,
        error: error.message,
      });
    });

    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy();
      resolve({
        isRunning: false,
        error: "Connection timeout",
      });
    });
  });
}

/**
 * Test proof server with sample data
 */
async function testProofGeneration(): Promise<boolean> {
  console.log("\n📝 Testing proof generation capabilities...");

  // Note: Actual proof generation requires compiled contracts and proper setup
  // This is a placeholder for future implementation
  console.log("   ℹ️  Proof generation test requires deployed contracts");
  console.log("   ℹ️  Run 'npm run deploy' to test full proof generation");

  return true;
}

/**
 * Main test function
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     Midnight Proof Server Connectivity Test           ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  console.log(`Testing connection to: ${PROOF_SERVER_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms\n`);

  // Check if proof server is running
  console.log("🔍 Checking proof server status...");
  const status = await checkProofServer();

  if (status.isRunning) {
    console.log(`✅ Proof server is running!`);
    console.log(`   Response time: ${status.responseTime}ms\n`);

    // Test proof generation
    await testProofGeneration();

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║              Proof Server Test Passed! ✓              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log("\nNext steps:");
    console.log("  1. Compile contracts: npm run compile");
    console.log("  2. Deploy contracts: npm run deploy");
    console.log("  3. Test contract interaction with backend\n");

    process.exit(0);
  } else {
    console.log(`❌ Proof server is not accessible`);
    console.log(`   Error: ${status.error}\n`);

    console.log("Troubleshooting steps:");
    console.log("  1. Start proof server with Docker:");
    console.log(
      "     docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'",
    );
    console.log("\n  2. Or use docker-compose:");
    console.log("     docker-compose up proof-server");
    console.log("\n  3. Verify Docker is running:");
    console.log("     docker ps");
    console.log("\n  4. Check if port 6300 is available:");
    console.log("     lsof -i :6300");
    console.log("\n  5. Check Docker logs:");
    console.log("     docker logs oblivion-proof-server\n");

    process.exit(1);
  }
}

// Run test
main().catch((error) => {
  console.error("\n❌ Test failed with error:", error);
  process.exit(1);
});
