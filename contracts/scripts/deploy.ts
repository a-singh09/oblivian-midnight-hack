import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { nativeToken, Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { type Wallet } from "@midnight-ntwrk/wallet-api";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

// Testnet connection endpoints
const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300",
};

/**
 * Wait for wallet to be funded with tokens
 */
const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`,
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
      Rx.tap((balance) =>
        console.log(`Wallet funded with balance: ${balance}`),
      ),
    ),
  );

/**
 * Create witness providers for contracts
 * Witness functions provide private data that never goes on-chain
 */
function createWitnessProviders(contractName: string): any {
  if (contractName === "DataCommitment") {
    return {
      // Service key witness - returns a 32-byte key for authorization
      getServiceKey: () => {
        // In production, this would be securely stored and retrieved
        // For deployment, we use a deterministic key
        const key = Buffer.alloc(32);
        key.write("oblivion-service-key-v1", 0);
        return new Uint8Array(key);
      },

      // Deletion certificate witness - returns proof of deletion
      getDeletionCertificate: (hash: Uint8Array) => {
        // In production, this would verify actual deletion
        // For deployment, we return a placeholder
        const cert = Buffer.alloc(32);
        cert.write("deletion-cert", 0);
        return new Uint8Array(cert);
      },
    };
  } else if (contractName === "ZKDeletionVerifier") {
    return {
      // Deletion certificate witness
      getDeletionCertificate: (hash: Uint8Array) => {
        const cert = Buffer.alloc(32);
        cert.write("deletion-cert", 0);
        return new Uint8Array(cert);
      },

      // Verifier key witness
      getVerifierKey: () => {
        const key = Buffer.alloc(32);
        key.write("oblivion-verifier-key-v1", 0);
        return new Uint8Array(key);
      },

      // Private data witness - returns private data for proof generation
      getPrivateData: (hash: Uint8Array) => {
        // In production, this would retrieve actual private data
        // For deployment, we return a placeholder
        const data = Buffer.alloc(32);
        data.write("private-data", 0);
        return new Uint8Array(data);
      },
    };
  }

  return {};
}

/**
 * Deploy a single contract to Midnight testnet
 */
async function deployContractToTestnet(
  contractName: string,
  contractPath: string,
  wallet: Wallet,
  walletProvider: any,
): Promise<{ contractAddress: string; txHash: string }> {
  console.log(`\n=== Deploying ${contractName} ===`);

  // Load compiled contract module
  const contractModulePath = path.join(
    contractPath,
    "managed",
    contractName,
    "contract",
    "index.cjs",
  );

  if (!fs.existsSync(contractModulePath)) {
    throw new Error(
      `Contract not found at ${contractModulePath}. Run: npm run build`,
    );
  }

  console.log(`Loading contract from ${contractModulePath}...`);
  const ContractModule = await import(contractModulePath);

  // Create witness providers for the contract
  const witnesses = createWitnessProviders(contractName);
  const contractInstance = new ContractModule.Contract(witnesses);

  // Configure providers
  const zkConfigPath = path.join(contractPath, "managed", contractName);
  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `${contractName}-state`,
    }),
    publicDataProvider: indexerPublicDataProvider(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
    ),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
    walletProvider: walletProvider,
    midnightProvider: walletProvider,
  };

  // Deploy contract
  console.log(
    `Deploying ${contractName} to testnet (this may take 30-60 seconds)...`,
  );
  const deployed = await deployContract(providers, {
    contract: contractInstance,
    privateStateId: `${contractName}State`,
    initialPrivateState: {},
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  const txHash = deployed.deployTxData.public.txHash || "N/A";

  console.log(`✓ ${contractName} deployed successfully!`);
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Transaction Hash: ${txHash}`);

  return { contractAddress, txHash };
}

/**
 * Main deployment function
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Oblivion Protocol - Contract Deployment Script      ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Get or generate wallet seed
    const choice = await rl.question(
      "Do you have an existing wallet seed? (y/n): ",
    );

    let walletSeed: string;
    if (choice.toLowerCase() === "y" || choice.toLowerCase() === "yes") {
      walletSeed = await rl.question("Enter your 64-character hex seed: ");

      // Validate seed format
      if (!/^[0-9a-fA-F]{64}$/.test(walletSeed)) {
        throw new Error(
          "Invalid seed format. Must be 64 hexadecimal characters.",
        );
      }
    } else {
      // Generate new wallet seed
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");

      console.log("\n⚠️  IMPORTANT: Save this wallet seed securely!");
      console.log(`Wallet Seed: ${walletSeed}\n`);
    }

    // Build wallet from seed
    console.log("Building wallet...");
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
    const state = await Rx.firstValueFrom(wallet.state());

    console.log(`✓ Wallet created`);
    console.log(`  Address: ${state.address}`);

    // Check wallet balance (unshielded)
    let balance = state.balances[nativeToken()] || 0n;

    console.log(`\nWallet Balances:`);
    console.log(`  Unshielded (public): ${balance} tDUST`);

    // Note: Shielded balance is not directly accessible via state.balances
    // It's stored privately and only visible through the wallet

    if (balance === 0n) {
      console.log(`\n⚠️  Unshielded balance is 0`);
      console.log(
        `\n📝 IMPORTANT: Contract deployment requires UNSHIELDED tokens`,
      );
      console.log(`\nIf you have shielded tokens in Lace wallet:`);
      console.log(`  1. Open Lace wallet`);
      console.log(`  2. Go to "Send" or "Unshield" option`);
      console.log(`  3. Unshield at least 1000 tDUST to this address`);
      console.log(`  4. Wait for transaction confirmation`);
      console.log(`\nOr get new unshielded tokens:`);
      console.log(`  Visit: https://midnight.network/test-faucet`);
      console.log(`  Address: ${state.address}`);
      console.log(`\nWaiting for unshielded funds...`);
      balance = await waitForFunds(wallet);
    }

    console.log(`✓ Wallet funded with ${balance} unshielded tDUST\n`);

    // Create wallet provider for transactions
    const walletState = await Rx.firstValueFrom(wallet.state());
    const walletProvider = {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(tx: any, newCoins: any) {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId(),
            ),
            newCoins,
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId(),
            ),
          )
          .then(createBalancedTx);
      },
      submitTx(tx: any) {
        return wallet.submitTransaction(tx);
      },
    };

    const contractsPath = path.join(process.cwd(), ".");

    // Deploy DataCommitment contract
    const dataCommitment = await deployContractToTestnet(
      "DataCommitment",
      contractsPath,
      wallet,
      walletProvider,
    );

    // Deploy ZKDeletionVerifier contract
    const zkDeletionVerifier = await deployContractToTestnet(
      "ZKDeletionVerifier",
      contractsPath,
      wallet,
      walletProvider,
    );

    // Save deployment information
    const deploymentInfo = {
      network: "testnet",
      deployedAt: new Date().toISOString(),
      walletAddress: state.address,
      contracts: {
        DataCommitment: {
          address: dataCommitment.contractAddress,
          txHash: dataCommitment.txHash,
        },
        ZKDeletionVerifier: {
          address: zkDeletionVerifier.contractAddress,
          txHash: zkDeletionVerifier.txHash,
        },
      },
      endpoints: TESTNET_CONFIG,
    };

    const deploymentPath = path.join(process.cwd(), "deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║              Deployment Successful! 🎉                 ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`\nDeployment details saved to: ${deploymentPath}`);
    console.log("\nContract Addresses:");
    console.log(`  DataCommitment:     ${dataCommitment.contractAddress}`);
    console.log(`  ZKDeletionVerifier: ${zkDeletionVerifier.contractAddress}`);
    console.log("\nNext steps:");
    console.log("  1. Update backend/.env with contract addresses");
    console.log("  2. Test contract interaction with the backend");
    console.log("  3. Verify contracts on Midnight explorer\n");

    // Close wallet connection
    await wallet.close();
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run deployment
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
