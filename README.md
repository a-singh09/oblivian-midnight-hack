
# Oblivion Protocol

*GDPR Compliance System with Cryptographic Deletion Proofs on the Midnight Blockchain*

## Overview

Oblivion Protocol solves one of the hardest GDPR challenges today: proving that personal data was actually deleted.

For users, exercising their Right to Be Forgotten currently requires contacting dozens of services manually and waiting weeks with no visibility or guarantees. For companies, providing deletion proof is a tedious, error-prone process that risks multimillion‑euro fines.

Oblivion Protocol uses the Midnight blockchain and ZK-SNARKs to create a universal, auditable, cryptographically verifiable GDPR deletion system.

* *Users* get a universal privacy identifier, real-time visibility of where their data lives, and one-click deletion across all services.
* *Companies* get a drop‑in compliance system that automatically tracks user data and generates tamper-proof deletion proofs.

## Architecture


Frontend (Next.js)  →  Backend API (Express + PostgreSQL)  →  Midnight Blockchain
                                        ↘                ↙
                                      Proof Server (ZK)


### Components

* *Smart Contracts*: Midnight Compact contracts storing commitments and verifying deletion proofs.
* *Backend API*: Handles encrypted storage, commitment registration, proof generation.
* *Company SDK*: 3–5 line integration via JavaScript, database extension, or API proxy.
* *User Dashboard*: Real-time footprint visualization and one-click deletion.

## Key Features

### For Companies

* 🚀 *3-line integration* with the Oblivion SDK
* 🔒 *Automatic GDPR compliance* (Articles 15 & 17)
* 🧾 *Immutable deletion proofs* stored on-chain
* 🎛 *SDK Playground* for instant testing

### For Users

* 👁 *Data footprint viewer*: see every service holding your data
* 🗑 *One-click erasure*: delete data everywhere instantly
* 🔐 *Cryptographic deletion receipts* for auditability

## Quick Start

### Prerequisites

* Node.js 18+
* Docker & Docker Compose
* Midnight Compact CLI (npm install -g @midnight-ntwrk/compact-cli)
* Midnight Proof Server

### Development Setup

1. *Clone repository:*


git clone <repository-url>
cd oblivion-protocol
npm run install:all


2. *Start Proof Server:*


make proof-server-start


3. *Start Services:*


docker-compose up -d postgres
npm run dev:backend
npm run dev:dashboard


4. *Deploy Smart Contracts (optional):*


cd contracts
npm run compile
npm run deploy


## Project Structure


oblivion-protocol/
├── contracts/          # Midnight smart contracts
├── backend/            # API + data management
├── sdk/                # Company integration SDK
├── dashboard/          # User interface
├── docker-compose.yml  # Dev environment
└── package.json        # Workspace config


## Frontend Demo

Start demo with:


cd frontend
npm install
npm run dev


Visit:

* SDK Playground → [http://localhost:3000/company/playground](http://localhost:3000/company/playground)
* Integration Wizard → [http://localhost:3000/company/setup](http://localhost:3000/company/setup)
* User Dashboard → [http://localhost:3000/user/dashboard](http://localhost:3000/user/dashboard)

## Technology Stack

* *Frontend*: Next.js 14, React 19, TypeScript, Tailwind CSS
* *Backend*: Node.js, Express, PostgreSQL
* *Blockchain*: Midnight (Testnet), Compact Contracts
* *Zero Knowledge*: ZK‑SNARK proof server
* *SDK*: TypeScript

## Known Issues

* Requires Lace wallet for blockchain interactions
* Backend must be running for full functionality
* Indexer queries may require network availability

## Roadmap

* Smart contract finalization
* Encryption subsystem improvements
* Zero-knowledge deletion proofs refinement
* Production security audit

## License

MIT License

## Acknowledgments

* Midnight Network team
* Lace Wallet
* shadcn/ui & Radix UI
* Built with ❤ for the Midnight Hackathon
