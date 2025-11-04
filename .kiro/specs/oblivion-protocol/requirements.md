# Requirements Document

## Introduction

The Oblivion Protocol is a GDPR compliance system that enables users to exercise their "Right to Be Forgotten" with one click while providing companies with automatic GDPR compliance through cryptographic deletion proofs on the Midnight blockchain. The system leverages Midnight's unique privacy-preserving capabilities, including ZK-SNARKs and the Compact smart contract language, to create immutable deletion proofs without revealing sensitive data. The system acts as "GDPR compliance that installs like Google Analytics" - making privacy compliance as simple as adding a tracking script.

## Glossary

- **Oblivion_System**: The complete GDPR compliance platform including blockchain contracts, backend API, SDK, and user dashboard
- **User_DID**: Decentralized identifier in format "did:midnight:user_xyz" that uniquely identifies users across services
- **Company_SDK**: The @oblivion/sdk npm package that companies integrate into their applications
- **Commitment_Hash**: SHA-256 cryptographic hash of encrypted user data stored on blockchain
- **ZK_Deletion_Proof**: Zero-knowledge cryptographic proof that data deletion occurred without revealing the data content
- **Midnight_Blockchain**: Privacy-focused blockchain (Cardano sidechain) using ZK-SNARKs for programmable privacy with Compact smart contracts
- **Compact_Contract**: Smart contract written in Midnight's Compact language with witness functions for private data handling
- **Proof_Server**: Local server running on port 6300 that generates ZK-SNARK proofs without exposing private data
- **Witness_Function**: Private function in Compact contracts that processes sensitive data off-chain during proof generation
- **Data_Footprint**: Complete record of where a user's data is stored across all integrated services
- **Deletion_Certificate**: Cryptographic certificate proving that data was physically deleted from storage

## Requirements

### Requirement 1

**User Story:** As a data subject, I want to see all companies that have my personal data, so that I can understand my complete data footprint across services.

#### Acceptance Criteria

1. WHEN a User_DID is provided, THE Oblivion_System SHALL display all companies currently storing that user's data
2. THE Oblivion_System SHALL show data categories for each company (profile, transactions, etc.)
3. THE Oblivion_System SHALL display creation timestamps for each data record
4. THE Oblivion_System SHALL show deletion status for each data record
5. THE Oblivion_System SHALL update the display in real-time when data status changes

### Requirement 2

**User Story:** As a data subject, I want to delete all my personal data from all services with one click, so that I can exercise my Right to Be Forgotten efficiently.

#### Acceptance Criteria

1. WHEN a user clicks the delete-all button, THE Oblivion_System SHALL initiate deletion across all integrated services
2. THE Oblivion_System SHALL physically remove encrypted data from off-chain storage
3. THE Oblivion_System SHALL generate ZK_Deletion_Proof for each deleted data record
4. THE Oblivion_System SHALL record deletion proofs immutably on Midnight_Blockchain
5. THE Oblivion_System SHALL provide cryptographic proof links to the user upon completion

### Requirement 3

**User Story:** As a company developer, I want to integrate GDPR compliance with minimal code changes, so that I can focus on my core business logic.

#### Acceptance Criteria

1. THE Company_SDK SHALL require no more than 5 lines of integration code
2. THE Company_SDK SHALL handle all blockchain interactions transparently
3. WHEN user data is stored, THE Company_SDK SHALL automatically register Commitment_Hash on blockchain
4. WHEN deletion is requested, THE Company_SDK SHALL automatically handle the complete deletion flow
5. THE Company_SDK SHALL provide simple async/await API without blockchain knowledge requirements

### Requirement 4

**User Story:** As a compliance officer, I want cryptographic proof of data deletion, so that I can demonstrate GDPR compliance to regulators.

#### Acceptance Criteria

1. THE Oblivion_System SHALL generate immutable ZK_Deletion_Proof for each deletion
2. THE Oblivion_System SHALL store proofs on Midnight_Blockchain with public verifiability
3. THE Oblivion_System SHALL ensure proofs cannot reveal the original data content
4. THE Oblivion_System SHALL provide audit trail with timestamps and transaction hashes
5. THE Oblivion_System SHALL allow third-party verification without exposing private data

### Requirement 5

**User Story:** As a system administrator, I want automatic data registration when users sign up, so that the system maintains accurate data footprints without manual intervention.

#### Acceptance Criteria

1. WHEN a company stores user data, THE Company_SDK SHALL automatically encrypt data off-chain
2. THE Company_SDK SHALL generate Commitment_Hash and register it on Midnight_Blockchain
3. THE Oblivion_System SHALL update the user's Data_Footprint in real-time
4. THE Oblivion_System SHALL notify users via dashboard when new data locations are registered
5. THE Company_SDK SHALL handle all cryptographic operations transparently

### Requirement 6

**User Story:** As a privacy engineer, I want zero-knowledge deletion proofs, so that deletion can be verified without exposing sensitive data details.

#### Acceptance Criteria

1. THE Oblivion_System SHALL use Midnight blockchain's ZK-SNARK circuits for proof generation
2. THE Oblivion_System SHALL generate proofs locally using proof server on port 6300
3. THE Oblivion_System SHALL ensure witness data never leaves the local environment
4. THE Oblivion_System SHALL store only proof hashes on the public blockchain
5. THE Oblivion_System SHALL enable proof verification without revealing deletion details

### Requirement 7

**User Story:** As a data subject, I want real-time updates on my data status, so that I can monitor the progress of deletion requests.

#### Acceptance Criteria

1. THE Oblivion_System SHALL provide WebSocket connections for real-time updates
2. WHEN data status changes, THE Oblivion_System SHALL immediately update the user dashboard
3. THE Oblivion_System SHALL show deletion progress with percentage completion
4. THE Oblivion_System SHALL display blockchain transaction confirmations in real-time
5. THE Oblivion_System SHALL notify users when all deletion proofs are recorded

### Requirement 8

**User Story:** As a company, I want webhook notifications for deletion requests, so that I can handle data removal in my existing systems.

#### Acceptance Criteria

1. WHEN a user requests deletion, THE Oblivion_System SHALL send webhook to registered company endpoints
2. THE Oblivion_System SHALL include User_DID and required deletion details in webhook payload
3. THE Oblivion_System SHALL retry webhook delivery up to 3 times on failure
4. THE Oblivion_System SHALL wait for company confirmation before generating deletion proofs
5. THE Oblivion_System SHALL timeout webhook responses after 30 seconds
