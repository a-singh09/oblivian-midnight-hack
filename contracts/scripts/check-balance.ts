import { WalletBuilder } from "@midnight-ntwrk/wallet";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { WebSocket } from "ws";
import * as readline from "readline/promises";
import * as Rx from "rxjs";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300",
};

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║        Midnight Wallet Balance Checker                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const walletSeed = await rl.question("Enter your 64-character hex seed: ");

    if (!/^[0-9a-fA-F]{64}$/.test(walletSeed)) {
      throw new Error(
        "Invalid seed format. Must be 64 hexadecimal characters.",
      );
    }

    console.log("\nBuilding wallet...");
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info",
    );

    wallet.start();

    console.log("Waiting for wallet to sync...\n");

    // Wait for sync and get state
    const state = await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.tap((s) => {
          if (s.syncProgress) {
            console.log(
              `Sync: synced=${s.syncProgress.synced}, lag=${s.syncProgress.lag.sourceGap}`,
            );
          }
        }),
        Rx.filter((s) => s.syncProgress?.synced === true),
        Rx.take(1),
      ),
    );

    console.log("\n✓ Wallet synced!");
    console.log(`\nWallet Address: ${state.address}`);
    console.log(`\nBalances:`);

    const balance = state.balances[nativeToken()] || 0n;
    console.log(`  Native Token (tDUST): ${balance}`);

    if (balance === 0n) {
      console.log("\n⚠️  Balance is 0");
      console.log("\nPossible reasons:");
      console.log("  1. Funds sent to different address format");
      console.log("  2. Transaction not yet confirmed");
      console.log("  3. Wrong network (testnet vs mainnet)");
      console.log("\nTo get test tokens:");
      console.log(`  Visit: https://midnight.network/test-faucet`);
      console.log(`  Use address: ${state.address}`);
    } else {
      console.log(`\n✓ Wallet has sufficient balance for deployment`);
    }

    console.log("\nAll balances:");
    for (const [token, amount] of Object.entries(state.balances)) {
      console.log(`  ${token}: ${amount}`);
    }

    await wallet.close();
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
