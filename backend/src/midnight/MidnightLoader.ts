/**
 * Dynamic loader for Midnight.js SDK
 * Handles ES module compatibility issues
 */

export async function loadMidnightSDK() {
  try {
    const [
      { WalletBuilder },
      { getZswapNetworkId, getLedgerNetworkId },
      { createBalancedTx },
      { Transaction: ZswapTransaction },
      { Transaction, nativeToken },
      { httpClientProofProvider },
      { indexerPublicDataProvider },
      { NodeZkConfigProvider },
      { levelPrivateStateProvider },
      { NetworkId, setNetworkId },
      Rx,
    ] = await Promise.all([
      import("@midnight-ntwrk/wallet"),
      import("@midnight-ntwrk/midnight-js-network-id"),
      import("@midnight-ntwrk/midnight-js-types"),
      import("@midnight-ntwrk/zswap"),
      import("@midnight-ntwrk/ledger"),
      import("@midnight-ntwrk/midnight-js-http-client-proof-provider"),
      import("@midnight-ntwrk/midnight-js-indexer-public-data-provider"),
      import("@midnight-ntwrk/midnight-js-node-zk-config-provider"),
      import("@midnight-ntwrk/midnight-js-level-private-state-provider"),
      import("@midnight-ntwrk/midnight-js-network-id"),
      import("rxjs"),
    ]);

    return {
      WalletBuilder,
      getZswapNetworkId,
      getLedgerNetworkId,
      createBalancedTx,
      ZswapTransaction,
      Transaction,
      nativeToken,
      httpClientProofProvider,
      indexerPublicDataProvider,
      NodeZkConfigProvider,
      levelPrivateStateProvider,
      NetworkId,
      setNetworkId,
      Rx,
    };
  } catch (error) {
    console.error("Failed to load Midnight.js SDK:", error);
    throw error;
  }
}

export type MidnightSDK = Awaited<ReturnType<typeof loadMidnightSDK>>;
