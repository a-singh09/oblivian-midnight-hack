# Oblivion Protocol - Design Document

## Overview

The Oblivion Protocol is a GDPR compliance system built on Midnight blockchain that enables cryptographic proof of data deletion without revealing sensitive information. The system uses Midnight's unique privacy-preserving capabilities including ZK-SNARKs, Compact smart contracts, and witness functions to create an immutable audit trail for "Right to Be Forgotten" requests.

### Key Innovation

- **Zero-Knowledge Deletion Proofs**: Prove data was deleted without revealing what the data was
- **Automatic Compliance**: Companies get GDPR compliance with minimal integration effort
- **Immutable Audit Trail**: Blockchain-based proof that satisfies regulatory requirements
- **Privacy-First Architecture**: Uses Midnight's witness functions to keep sensitive data off-chain

## Architecture

### System Components

```mermaid
graph TB
    subgraph "User Layer"
        A[User Dashboard React App] --> B[User DID: did:midnight:user_xyz]
    end

    subgraph "Company Integration"
        C[Company Database] --> D[@oblivion/sdk npm package]
        E[Company API] --> D
        D --> F[Database Triggers/Hooks]
    end

    subgraph "Oblivion Backend"
        G[Express REST API :3000]
        H[StorageManager - PostgreSQL]
        I[MidnightClient Wrapper]
        G --> H
        G --> I
    end

    subgraph "Midnight Blockchain"
        J[DataCommitment.compact Contract]
        K[ZKDeletionVerifier.compact Contract]
        L[Local Proof Server :6300]
        M[Midnight Testnet]
        J --> M
        K --> M
        L --> J
        L --> K
    end

    A --> G
    D --> G
    I --> L
    H -.-> H
```

### Data Flow Architecture

**Registration Flow:**

1. Company stores user data → SDK encrypts locally
2. Encrypted data → PostgreSQL (off-chain)
3. Commitment hash → Midnight blockchain (on-chain)
4. User dashboard updates via WebSocket

**Deletion Flow:**

1. User requests deletion → Backend deletes from PostgreSQL
2. Generate deletion certificate → Local proof server creates ZK-SNARK
3. ZK proof → Midnight blockchain (immutable record)
4. User receives cryptographic proof of deletion

## Components and Interfaces

### 1. Midnight Smart Contracts

#### DataCommitment.compact

**Purpose**: Store cryptographic commitments (hashes) of user data on-chain

```compact
pragma language_version >= 0.16 && <= 0.17;
import CompactStandardLibrary;

// Public ledger state (stored on blockchain)
export ledger commitments: Map<Bytes<32>, CommitmentRecord>;
export ledger totalRecords: Counter;

struct CommitmentRecord {
  userDID: Opaque<"string">;
  serviceProvider: Bytes<32>;
  dataCategories: Vector<3, Opaque<"string">>;
  createdAt: Uint<64>;
  deleted: Boolean;
  deletionProofHash: Bytes<32>;
}

// Witness functions (private data, never stored on-chain)
witness getServiceKey(): Bytes<32>;
witness getDeletionCertificate(hash: Bytes<32>): Bytes<32>;

// Public circuits (can be called by external parties)
export circuit registerCommitment(
  commitmentHash: Bytes<32>,
  userDID: Opaque<"string">,
  dataCategories: Vector<3, Opaque<"string">>
): [] {
  // Implementation details in tasks phase
}

export circuit markAsDeleted(commitmentHash: Bytes<32>): [] {
  // Implementation details in tasks phase
}
```

#### ZKDeletionVerifier.compact

**Purpose**: Generate zero-knowledge proofs of data deletion

```compact
pragma language_version >= 0.16 && <= 0.17;
import CompactStandardLibrary;

export ledger verifiedDeletions: Map<Bytes<32>, VerificationRecord>;

struct VerificationRecord {
  commitmentHash: Bytes<32>;
  verifiedAt: Uint<64>;
  verifierKey: Bytes<32>;
  proofValid: Boolean;
}

witness getDeletionCertificate(hash: Bytes<32>): Bytes<32>;
witness getVerifierKey(): Bytes<32>;

export circuit verifyDeletion(
  commitmentHash: Bytes<32>,
  claimedDeletionDate: Uint<64>
): [] {
  // ZK proof generation logic
}
```

### 2. Backend API (Node.js + TypeScript)

#### StorageManager

**Purpose**: Handle encrypted off-chain data storage and deletion

**Key Methods:**

- `storeData(userData: UserData): Promise<string>` - Encrypt and store data, return commitment hash
- `deleteData(userDID: string): Promise<DeletionCertificate[]>` - Physical deletion with certificates
- `getFootprint(userDID: string): Promise<DataLocation[]>` - Get user's data locations

**Encryption Strategy:**

- AES-256-CBC encryption with random IVs
- Commitment hash = SHA-256(encrypted_data)
- Deletion certificates include timestamp and cryptographic signature

#### MidnightClient

**Purpose**: Interface with Midnight blockchain and proof server

**Key Methods:**

- `registerCommitment(params)` - Submit commitment to blockchain
- `generateDeletionProof(params)` - Create ZK proof via local proof server
- `markDeleted(params)` - Record deletion proof on blockchain

**Connection Requirements:**

- Midnight testnet: `https://testnet.midnight.network`
- Local proof server: `http://localhost:6300`
- Wallet management with seed phrase

### 3. Company SDK (@oblivion/sdk)

#### OblivionSDK Class

**Purpose**: Simple integration for companies (3-5 lines of code)

```typescript
interface SDKConfig {
  apiKey: string;
  serviceName: string;
  apiUrl?: string;
}

class OblivionSDK {
  async registerUserData(
    userDID: string,
    data: any,
    dataType: string,
  ): Promise<{
    commitmentHash: string;
    blockchainTx: string;
  }>;

  async handleDeletion(userDID: string): Promise<{
    deletedCount: number;
    blockchainProofs: string[];
  }>;
}
```

### 4. User Dashboard (React + TypeScript)

#### Core Components:

- **Dashboard.tsx** - Main user interface showing data footprint
- **DataLocationCard.tsx** - Individual company data display
- **DeletionButton.tsx** - One-click deletion with progress tracking
- **ProofViewer.tsx** - Display blockchain proof links

#### Real-time Features:

- WebSocket connection for live updates
- Progress tracking during deletion process
- Blockchain transaction confirmation display

## Data Models

### User Data Storage (PostgreSQL)

```sql
CREATE TABLE encrypted_data (
  commitment_hash BYTEA PRIMARY KEY,
  user_did VARCHAR(255) NOT NULL,
  encrypted_payload BYTEA NOT NULL,
  encryption_iv BYTEA NOT NULL,
  data_type VARCHAR(100),
  service_provider VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deletion_proof_hash BYTEA
);
```

### Blockchain State (Compact Ledger)

```compact
struct CommitmentRecord {
  userDID: Opaque<"string">;           // User identifier
  serviceProvider: Bytes<32>;          // Company public key
  dataCategories: Vector<3, Opaque<"string">>; // Data types
  createdAt: Uint<64>;                 // Unix timestamp
  deleted: Boolean;                    // Deletion status
  deletionProofHash: Bytes<32>;        // ZK proof hash
}
```

### API Data Transfer Objects

```typescript
interface UserData {
  userDID: string;
  data: Record<string, any>;
  dataType: string;
  serviceProvider: string;
}

interface DeletionCertificate {
  userDID: string;
  commitmentHash: string;
  timestamp: number;
  signature: string;
}
```

## Error Handling

### Blockchain Errors

- **Transaction Failures**: Retry mechanism with exponential backoff
- **Proof Generation Failures**: Fallback to manual verification process
- **Network Connectivity**: Queue operations for retry when connection restored

### Data Integrity

- **Encryption Failures**: Secure key rotation and backup procedures
- **Database Corruption**: Regular backups with point-in-time recovery
- **Commitment Hash Collisions**: SHA-256 collision detection and handling

### User Experience

- **Loading States**: Progress indicators for blockchain operations
- **Error Messages**: User-friendly explanations of technical failures
- **Fallback Options**: Manual deletion request process when automated system fails

## Testing Strategy

### Unit Testing

- **Smart Contract Testing**: Compact contract unit tests with mock witness data
- **Backend API Testing**: Jest tests for all API endpoints and database operations
- **SDK Testing**: Integration tests simulating company usage patterns

### Integration Testing

- **End-to-End Flow**: Complete user journey from data registration to deletion
- **Blockchain Integration**: Testnet deployment and transaction verification
- **Proof Server Testing**: ZK proof generation and verification cycles

### Security Testing

- **Encryption Validation**: Verify data cannot be decrypted without proper keys
- **ZK Proof Integrity**: Ensure proofs cannot be forged or manipulated
- **Access Control**: Test that only authorized parties can trigger deletions

### Performance Testing

- **Proof Generation Time**: Measure ZK-SNARK generation performance
- **Database Scalability**: Test with large datasets and concurrent users
- **Blockchain Throughput**: Measure transaction processing limits

## Security Considerations

### Privacy Protection

- **Witness Data Isolation**: Ensure sensitive data never leaves local proof server
- **Encryption at Rest**: All user data encrypted in PostgreSQL with AES-256
- **Key Management**: Secure storage and rotation of encryption keys

### Blockchain Security

- **Smart Contract Auditing**: Formal verification of Compact contract logic
- **Transaction Signing**: Secure wallet management with hardware security modules
- **Proof Verification**: Public verifiability of deletion proofs without data exposure

### Compliance Requirements

- **GDPR Article 17**: Right to erasure implementation with cryptographic proof
- **Data Minimization**: Only store necessary hashes on blockchain
- **Audit Trail**: Immutable record of all deletion activities

## Deployment Architecture

### Development Environment

- **Local Proof Server**: Docker container on port 6300
- **PostgreSQL**: Local database for development
- **Midnight Testnet**: Public testnet for contract deployment

### Production Environment

- **Kubernetes Cluster**: Scalable backend deployment
- **Managed PostgreSQL**: Cloud database with encryption and backups
- **CDN Distribution**: Global frontend deployment
- **Monitoring**: Comprehensive logging and alerting system

### Infrastructure Requirements

- **Proof Server**: Dedicated compute resources for ZK proof generation
- **Database**: High-availability PostgreSQL with read replicas
- **API Gateway**: Rate limiting and authentication for SDK requests
- **Blockchain Node**: Reliable connection to Midnight network
