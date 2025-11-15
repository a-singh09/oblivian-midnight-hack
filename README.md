# Oblivion Protocol

GDPR compliance system with cryptographic deletion proofs on Midnight blockchain.

## Overview

The Oblivion Protocol enables users to exercise their "Right to Be Forgotten" with one click while providing companies with automatic GDPR compliance through cryptographic deletion proofs. Built on Midnight blockchain using ZK-SNARKs and Compact smart contracts.

## Architecture

- **Smart Contracts**: Midnight Compact contracts for commitment storage and ZK proof verification
- **Backend API**: Node.js/Express server with PostgreSQL for encrypted data storage
- **Company SDK**: Simple npm package for 3-5 line integration
- **User Dashboard**: React/Next.js frontend for data footprint management

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Midnight Compact CLI (`npm install -g @midnight-ntwrk/compact-cli`)
- Midnight proof server (runs via Docker)

### Development Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd oblivion-protocol
   npm run install:all
   ```

2. **Start Midnight proof server:**

   ```bash
   # Start proof server (required for contract deployment and ZK proofs)
   make proof-server-start

   # Or manually with Docker
   docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

   # Test connection
   make proof-server-test
   ```

3. **Start development environment:**

   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres

   # Start backend API (in separate terminal)
   npm run dev:backend

   # Start dashboard frontend (in separate terminal)
   npm run dev:dashboard
   ```

4. **Configure environment:**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

5. **Deploy smart contracts (optional for local development):**

   ```bash
   cd contracts
   npm run compile    # Compile Compact contracts
   npm run deploy     # Deploy to Midnight testnet
   ```

   See [Proof Server Setup Guide](docs/PROOF_SERVER_SETUP.md) for detailed instructions.

### Project Structure

```
oblivion-protocol/
├── contracts/          # Midnight smart contracts (.compact files)
├── backend/            # API server and storage management
├── sdk/                # Company integration SDK
├── dashboard/          # User dashboard frontend
├── docker-compose.yml  # Development environment
└── package.json        # Workspace configuration
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific component tests
npm run test:backend
npm run test:sdk
npm run test:dashboard
```

### Building

```bash
# Build all components
npm run build:all

# Build specific components
npm run build:contracts
npm run build:backend
npm run build:sdk
npm run build:dashboard
```

### Docker Environment

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

## Services

- **PostgreSQL**: `localhost:5432` (encrypted data storage)
- **Proof Server**: `localhost:6300` (ZK-SNARK generation)
- **Backend API**: `localhost:3000` (REST API and WebSocket)
- **Dashboard**: `localhost:3001` (User interface)

## Next Steps

1. Implement Midnight smart contracts (Task 2)
2. Build backend storage and encryption system (Task 3)
3. Develop REST API server (Task 4)
4. Create company SDK package (Task 5)
5. Build user dashboard frontend (Task 6)

## Documentation

- [Requirements](.kiro/specs/oblivion-protocol/requirements.md)
- [Design Document](.kiro/specs/oblivion-protocol/design.md)
- [Implementation Tasks](.kiro/specs/oblivion-protocol/tasks.md)

## License

MIT

## 🚀 Quick Start

### Try the Demo (No Setup Required)

```bash
cd frontend
npm install
npm run dev
```

Visit:

- **SDK Playground**: http://localhost:3000/company/playground
- **Integration Setup**: http://localhost:3000/company/setup
- **User Dashboard**: http://localhost:3000/user/dashboard

### Full Documentation

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get running in 5 minutes
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Hackathon Plan](HACKATHON_IMPLEMENTATION_PLAN.md)** - Architecture overview

## 🎯 What's New

### ✅ SDK Playground

Interactive demonstration of the Oblivion SDK with live code examples. Companies can try the SDK, see real API responses, and copy integration code.

**Location**: `/company/playground`

### ✅ Integration Wizard

Step-by-step company onboarding with API key generation, SDK installation, and integration testing.

**Location**: `/company/setup`

### ✅ Contract Client

Direct blockchain integration layer for Midnight smart contracts. Handles commitment registration, deletion proofs, and transaction monitoring.

**File**: `frontend/lib/contract-client.ts`

### ✅ Transaction Monitor

Real-time blockchain transaction status with auto-refresh, confirmation tracking, and block explorer links.

**Component**: `TransactionMonitor`

## 🎨 Demo Flow

### For Companies (3 minutes)

1. Visit `/company/setup`
2. Generate API key
3. Try SDK playground
4. Copy integration code

### For Users (2 minutes)

1. Visit `/user/dashboard`
2. View data footprint
3. Request deletion
4. Verify proof on blockchain

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js + React
│   (This Repo)   │  - SDK Playground
└────────┬────────┘  - Integration Wizard
         │           - User Dashboard
         │
         ▼
┌─────────────────┐
│   Backend API   │  Express + PostgreSQL
│   (Port 3000)   │  - Data Management
└────────┬────────┘  - Proof Generation
         │
         ▼
┌─────────────────┐
│   Midnight      │  Blockchain Layer
│   Blockchain    │  - Smart Contracts
└─────────────────┘  - ZK Proofs
```

## 📦 Project Structure

```
oblivion-protocol/
├── frontend/           # Next.js application
│   ├── app/
│   │   ├── company/   # Company portal
│   │   │   ├── setup/         # Integration wizard
│   │   │   └── playground/    # SDK playground
│   │   └── user/      # User portal
│   ├── components/
│   │   ├── company/   # Company components
│   │   │   ├── SDKPlayground.tsx
│   │   │   └── IntegrationWizard.tsx
│   │   └── blockchain/ # Blockchain components
│   └── lib/
│       └── contract-client.ts  # Blockchain integration
├── backend/           # Express API
│   └── src/
│       └── midnight/  # Midnight client
├── contracts/         # Smart contracts
│   ├── src/
│   │   └── DataCommitment.compact
│   └── deployment.json
└── sdk/              # Company SDK
    └── src/
        └── index.ts
```

## 🎯 Key Features

### For Companies

✅ **3-Line Integration**

```typescript
const sdk = new OblivionSDK({ apiKey, serviceName });
await sdk.registerUserData(userDID, data, dataType);
await sdk.handleDeletion(userDID);
```

✅ **Automatic GDPR Compliance**

- Right to be Forgotten (Article 17)
- Right to Access (Article 15)
- Audit trail requirements
- Deletion proof generation

✅ **SDK Playground**

- Live code examples
- Real API responses
- Copy-paste ready code
- Integration testing

### For Users

✅ **Data Footprint Visualization**

- See all registered data
- View service providers
- Check blockchain commitments

✅ **One-Click Deletion**

- Delete all data
- Generate ZK proofs
- Verify on blockchain

✅ **Proof Verification**

- Download certificates
- Verify on block explorer
- Immutable audit trail

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Express, PostgreSQL, TypeScript
- **Blockchain**: Midnight Network (Testnet)
- **Smart Contracts**: Compact Language
- **SDK**: TypeScript, Axios
- **UI Components**: shadcn/ui, Radix UI

## 📊 Demo Metrics

- **Integration Time**: < 10 minutes
- **Code Required**: 3-5 lines
- **Proof Generation**: < 30 seconds
- **Blockchain Confirmation**: < 1 minute

## 🎬 Demo Script

See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) for a complete 10-minute demo script.

## 🐛 Known Issues

- Wallet connection requires Lace extension
- Backend must be running for real blockchain interactions
- Indexer queries require network connectivity

See [INTEGRATION_GAPS.md](INTEGRATION_GAPS.md) for details.

## 🤝 Contributing

This is a hackathon project. For production use, additional security audits and testing are required.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Midnight Network for blockchain infrastructure
- Lace Wallet for user authentication
- shadcn/ui for beautiful components

---

**Built with ❤️ for the Midnight Hackathon**
