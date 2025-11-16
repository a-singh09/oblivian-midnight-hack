/**
 * Wallet Provider Service for Backend
 * Manages server-side wallet for signing transactions
 */

import { loadMidnightSDK, type MidnightSDK } from "./MidnightLoader.js";
import type { Wallet } from "@midnight-ntwrk/wallet-api";

export interface WalletProviderConfig {
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  nodeUrl: string;
  walletSeed: string;
}

export class WalletProviderService {
  private wallet: any = null;
  private walletProvider: any = null;
  private initialized: boolean = false;
  private sdk: MidnightSDK | null = null;

  constructor(private config: WalletProviderConfig) {}

  async initialize(): Promise<void> {
    try {
      console.log("Initializing wallet provider...");
      console.log(`  Indexer: ${this.config.indexerUrl}`);
      console.log(`  Proof Server: ${this.config.proofServerUrl}`);

      if (!this.config.walletSeed) {
        throw new Error(
          "MIDNIGHT_WALLET_SEED not configured in environment variables",
        );
      }

      // Load Midnight.js SDK dynamically
      console.log("Loading Midnight.js SDK...");
      this.sdk = await loadMidnightSDK();
      console.log("✓ Midnight.js SDK loaded");

      // Build wallet from seed
      this.wallet = await this.sdk.WalletBuilder.build(
        this.config.indexerUrl,
        this.config.indexerWsUrl,
        this.config.proofServerUrl,
        this.config.nodeUrl,
        this.config.walletSeed,
        this.sdk.getZswapNetworkId(),
        "info",
      );

      // Start wallet
      this.wallet.start();

      // Wait for wallet to sync (with timeout)
      console.log("Waiting for wallet to sync...");
      const state: any = await this.sdk.Rx.firstValueFrom(
        this.wallet.state().pipe(
          this.sdk.Rx.timeout(30000), // 30 second timeout
          this.sdk.Rx.tap((s: any) => {
            if (s.syncProgress) {
              console.log(
                `  Sync progress: synced=${s.syncProgress.synced}, lag=${s.syncProgress.lag.sourceGap}`,
              );
            }
          }),
          this.sdk.Rx.filter((s: any) => s.syncProgress?.synced === true),
        ),
      );

      const balance = state.balances[this.sdk.nativeToken()] || 0n;

      console.log("✓ Wallet initialized successfully");
      console.log(`  Address: ${state.address}`);
      console.log(`  Balance: ${balance} tDUST`);

      if (balance === 0n) {
        console.warn("⚠️  Wallet has zero balance!");
        console.warn(
          "   Transactions will fail. Fund wallet at: https://midnight.network/test-faucet",
        );
        console.warn(`   Address: ${state.address}`);
      }

      // Create wallet provider interface for Midnight.js SDK
      this.walletProvider = {
        coinPublicKey: state.coinPublicKey,
        encryptionPublicKey: state.encryptionPublicKey,
        balanceTx: (tx: any, newCoins: any) => {
          if (!this.wallet || !this.sdk) {
            throw new Error("Wallet not initialized");
          }
          return this.wallet
            .balanceTransaction(
              this.sdk.ZswapTransaction.deserialize(
                tx.serialize(this.sdk.getLedgerNetworkId()),
                this.sdk.getZswapNetworkId(),
              ),
              newCoins,
            )
            .then((tx: any) => this.wallet!.proveTransaction(tx))
            .then((zswapTx: any) =>
              this.sdk!.Transaction.deserialize(
                zswapTx.serialize(this.sdk!.getZswapNetworkId()),
                this.sdk!.getLedgerNetworkId(),
              ),
            )
            .then(this.sdk.createBalancedTx);
        },
        submitTx: (tx: any) => {
          if (!this.wallet) {
            throw new Error("Wallet not initialized");
          }
          return this.wallet.submitTransaction(tx);
        },
      };

      this.initialized = true;
      console.log("✓ Wallet provider ready for contract interactions");
    } catch (error) {
      console.error("Failed to initialize wallet provider:", error);
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          console.error("  Wallet sync timed out. Check network connectivity.");
        } else if (error.message.includes("MIDNIGHT_WALLET_SEED")) {
          console.error("  Set MIDNIGHT_WALLET_SEED in backend/.env");
        }
      }
      throw error;
    }
  }

  getProvider() {
    if (!this.initialized || !this.walletProvider) {
      throw new Error("Wallet provider not initialized");
    }
    return this.walletProvider;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getBalance(): Promise<bigint> {
    if (!this.wallet || !this.sdk) {
      return 0n;
    }
    const state: any = await this.sdk.Rx.firstValueFrom(this.wallet.state());
    return state.balances[this.sdk.nativeToken()] || 0n;
  }

  async getAddress(): Promise<string> {
    if (!this.wallet || !this.sdk) {
      throw new Error("Wallet not initialized");
    }
    const state: any = await this.sdk.Rx.firstValueFrom(this.wallet.state());
    return state.address;
  }

  async close() {
    if (this.wallet) {
      console.log("Closing wallet provider...");
      await this.wallet.close();
      this.wallet = null;
      this.walletProvider = null;
      this.initialized = false;
      console.log("✓ Wallet provider closed");
    }
  }
}
