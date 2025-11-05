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
- Midnight CLI tools

### Development Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd oblivion-protocol
   npm run install:all
   ```

2. **Start development environment:**

   ```bash
   # Start PostgreSQL and Midnight proof server
   npm run docker:up

   # Start backend API (in separate terminal)
   npm run dev:backend

   # Start dashboard frontend (in separate terminal)
   npm run dev:dashboard
   ```

3. **Configure environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

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
