# Oblivion Protocol - Smart Contracts

This directory contains the Midnight blockchain smart contracts for the Oblivion Protocol.

## Contracts

- **DataCommitment.compact**: Stores cryptographic commitments (hashes) of user data on-chain
- **ZKDeletionVerifier.compact**: Generates zero-knowledge proofs of data deletion

## Prerequisites

1. **Compact Compiler**: Install the Midnight Compact compiler

   ```bash
   npm install -g @midnight-ntwrk/compact-cli
   ```

2. **Proof Server**: Run the Midnight proof server locally

   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'
   ```

   Keep this running in a separate terminal.

3. **Test Tokens**: Get test tokens from the [Midnight Faucet](https://midnight.network/test-faucet)

## Installation

Install dependencies:

```bash
npm install
```

## Compilation

Compile the Compact contracts to generate artifacts:

```bash
npm run compile
```

This will create the following directories:

- `managed/DataCommitment/` - Compiled artifacts for DataCommitment contract
- `managed/ZKDeletionVerifier/` - Compiled artifacts for ZKDeletionVerifier contract

Each managed directory contains:

- `compiler/` - Compiler metadata
- `contract/` - Contract JavaScript module (index.cjs)
- `keys/` - Cryptographic keys for ZK proofs
- `zkir/` - Zero-knowledge intermediate representation

## Build

Compile TypeScript deployment scripts:

```bash
npm run build
```

## Deployment

Deploy contracts to Midnight Testnet:

```bash
npm run deploy
```

The deployment script will:

1. Prompt for an existing wallet seed or generate a new one
2. Check wallet balance (request funds from faucet if needed)
3. Deploy DataCommitment contract
4. Deploy ZKDeletionVerifier contract
5. Save deployment information to `deployment.json`

### Deployment Output

After successful deployment, you'll find:

**deployment.json**:

```json
{
  "network": "testnet",
  "deployedAt": "2025-01-15T10:30:00.000Z",
  "walletAddress": "0x...",
  "contracts": {
    "DataCommitment": {
      "address": "0x...",
      "txHash": "0x..."
    },
    "ZKDeletionVerifier": {
      "address": "0x...",
      "txHash": "0x..."
    }
  },
  "endpoints": {
    "indexer": "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    "node": "https://rpc.testnet-02.midnight.network",
    "proofServer": "http://127.0.0.1:6300"
  }
}
```

## Configuration

Update the backend environment variables with deployed contract addresses:

```bash
# backend/.env
DATA_COMMITMENT_CONTRACT=<DataCommitment address from deployment.json>
ZK_DELETION_VERIFIER_CONTRACT=<ZKDeletionVerifier address from deployment.json>
```

## Testnet Endpoints

- **Indexer**: https://indexer.testnet-02.midnight.network/api/v1/graphql
- **WebSocket**: wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
- **RPC Node**: https://rpc.testnet-02.midnight.network
- **Proof Server**: http://localhost:6300 (local)
- **Faucet**: https://midnight.network/test-faucet

## Troubleshooting

### Proof Server Connection Error

If you see "Connection refused" on port 6300:

1. Ensure the proof server Docker container is running
2. Check that port 6300 is not in use by another process
3. Verify Docker is running: `docker ps`

### Compilation Errors

If compilation fails:

1. Ensure Compact compiler is installed: `compact --version`
2. Check contract syntax in `src/*.compact` files
3. Review Compact language version in pragma statements

### Deployment Failures

If deployment fails:

1. Verify wallet has sufficient balance (check faucet)
2. Ensure proof server is running and accessible
3. Check network connectivity to Midnight testnet
4. Review wallet seed format (must be 64 hex characters)

### Balance Issues

If wallet balance is 0:

1. Visit https://midnight.network/test-faucet
2. Enter your wallet address (shown during deployment)
3. Request test tokens
4. Wait for transaction confirmation (usually 1-2 minutes)
5. The deployment script will automatically continue once funded

## Contract Verification

After deployment, verify contracts on Midnight Explorer:

1. Visit the Midnight Testnet Explorer
2. Search for contract addresses from `deployment.json`
3. Verify transaction hashes and contract state

## Development Workflow

1. **Modify Contracts**: Edit `.compact` files in `src/`
2. **Compile**: Run `npm run compile`
3. **Test Locally**: Use local proof server for testing
4. **Deploy**: Run `npm run deploy` to deploy to testnet
5. **Verify**: Check deployment.json and test contract interaction

## Security Notes

- **Never commit wallet seeds** to version control
- Store `deployment.json` securely (contains contract addresses)
- Use separate wallets for testnet and mainnet
- Keep proof server local (never expose publicly)

## Resources

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/)
- [Midnight Testnet Faucet](https://midnight.network/test-faucet)
- [Midnight Discord](https://discord.gg/midnight)
