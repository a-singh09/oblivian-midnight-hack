# Implementation Plan

## Overview

This implementation plan converts the Oblivion Protocol design into a series of incremental coding tasks. Each task builds on previous work and focuses on creating working code that can be tested and validated. The plan prioritizes core functionality first, with optional testing tasks marked with "\*".

## Task List

- [x] 1. Set up project structure and development environment

  - Create directory structure for contracts, backend, SDK, and frontend components
  - Set up Docker environment with PostgreSQL and Midnight proof server
  - Configure TypeScript build systems and development tooling
  - Initialize package.json files with required dependencies
  - _Requirements: 5.5, 6.2_

- [x] 2. Implement Midnight smart contracts

  - Check docs folder for updated docs for any references
  - [x] 2.1 Create DataCommitment.compact contract

    - Check docs folder for updated docs for any references
    - Write Compact contract with proper pragma and imports
    - Implement ledger state for commitments map and counter
    - Define CommitmentRecord struct with all required fields
    - Create witness functions for service key and deletion certificate
    - Implement registerCommitment circuit with validation logic
    - Implement markAsDeleted circuit with authorization checks
    - _Requirements: 3.3, 4.1, 5.2_

  - [x] 2.2 Create ZKDeletionVerifier.compact contract

    - Check docs folder for updated docs for any references
    - Write Compact contract for deletion proof verification
    - Implement ledger state for verified deletions
    - Define VerificationRecord struct for proof metadata
    - Create witness functions for deletion certificates and verifier keys
    - Implement verifyDeletion circuit with ZK proof logic
    - Add timestamp validation and proof hash generation
    - _Requirements: 4.1, 4.3, 6.1, 6.4_

  - [ ]\* 2.3 Write unit tests for smart contracts
    - Create test cases for commitment registration edge cases
    - Test deletion marking with invalid authorization
    - Verify ZK proof generation and validation logic
    - _Requirements: 4.1, 6.1_

- [x] 3. Build backend storage and encryption system

  - [x] 3.1 Implement StorageManager class

    - Check docs folder for updated docs for any references
    - Create PostgreSQL connection and schema initialization
    - Implement AES-256-CBC encryption with random IVs
    - Write storeData method with commitment hash generation
    - Implement deleteData method with deletion certificates
    - Create getFootprint method for user data locations
    - Add database indexing for performance optimization
    - _Requirements: 2.2, 5.1, 5.2_

  - [x] 3.2 Create MidnightClient wrapper

    - Check docs folder for updated docs for any references
    - Set up connection to Midnight testnet and proof server
    - Implement wallet management with seed phrase loading
    - Create registerCommitment method for blockchain transactions
    - Implement generateDeletionProof method using proof server
    - Add markDeleted method for recording proofs on-chain
    - Create getUserCommitments method for dashboard queries
    - _Requirements: 3.3, 4.2, 6.2, 6.3_

  - [ ]\* 3.3 Write integration tests for storage system
    - Test encryption/decryption roundtrip operations
    - Verify commitment hash consistency and uniqueness
    - Test deletion certificate generation and validation
    - _Requirements: 2.2, 4.1_

- [x] 4. Develop REST API server

  - [x] 4.1 Create Express server with core endpoints

    - Check docs folder for updated docs for any references
    - Set up Express application with CORS and JSON middleware
    - Initialize StorageManager and MidnightClient connections
    - Implement /api/register-data endpoint for SDK integration
    - Create /api/user/:did/footprint endpoint for dashboard
    - Add /api/user/:did/delete-all endpoint for deletion requests
    - Include health check endpoint for monitoring
    - _Requirements: 1.1, 2.1, 3.1, 8.1_

  - [x] 4.2 Add real-time WebSocket support

    - Check docs folder for updated docs for any references
    - Implement WebSocket server for real-time updates
    - Create user subscription management for data status changes
    - Add progress tracking for deletion operations
    - Broadcast blockchain transaction confirmations
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 4.3 Implement webhook system for companies (tests were failing)

    - Check docs folder for updated docs for any references
    - Create webhook endpoint registration for companies
    - Add webhook delivery system with retry logic (3 attempts)
    - Implement 30-second timeout handling
    - Create webhook payload formatting with User_DID and deletion details
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [ ]\* 4.4 Add API authentication and rate limiting
    - Implement API key validation for SDK requests
    - Add rate limiting to prevent abuse
    - Create request logging and monitoring
    - _Requirements: 3.2_

- [x] 5. Build company SDK package

  - [x] 5.1 Create OblivionSDK class

    - Check docs folder for updated docs for any references
    - Initialize SDK with API key and service name configuration
    - Implement registerUserData method with automatic encryption
    - Create handleDeletion method for complete deletion flow
    - Add getUserData method for Right to Access compliance
    - Include error handling and retry logic for network failures
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 5.2 Package SDK for npm distribution

    - Check docs folder for updated docs for any references
    - Configure TypeScript compilation and type definitions
    - Create comprehensive README with integration examples
    - Set up package.json with proper dependencies and metadata
    - Add JSDoc documentation for all public methods
    - _Requirements: 3.1, 3.5_

  - [ ]\* 5.3 Create SDK integration examples
    - Write example integration for Express.js applications
    - Create database trigger examples for automatic registration
    - Add webhook handler examples for deletion requests
    - _Requirements: 3.1, 8.4_

- [x] 6. Enhance user and company dashboard frontends

  - [x] 6.1 Check React application structure

    - Check docs folder for updated docs for any references
    - Set up React TypeScript project with TailwindCSS and shadcn/ui
    - Configure routing with separate user and company portals
    - Set up state management (React Context or Zustand)
    - Create base layout and navigation components for both portals
    - Set up API client for backend communication
    - Configure authentication flow for company portal
    - _Requirements: 1.1, 7.2_

  - [x] 6.2 Implement User Dashboard component

    - Check docs folder for updated docs for any references
    - Analyze main dashboard showing user's data footprint
    - Display list of companies with data categories and timestamps
    - Show deletion status for each data record
    - Add loading states and error handling
    - Implement data visualization (charts showing data distribution)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.3 Build user deletion functionality

    - Check docs folder for updated docs for any references
    - Create delete-all button with confirmation dialog
    - Implement real-time progress tracking during deletion
    - Display blockchain proof links upon completion
    - Add individual service deletion options
    - Show deletion certificate download functionality
    - _Requirements: 2.1, 2.5, 7.3_

  - [x] 6.4 Implement Company Dashboard portal

    - Check docs folder for updated docs for any references
    - Create company authentication system with API key management
    - Build main company dashboard showing:
      - Total users registered in their system
      - Active data records vs deleted records statistics
      - Recent deletion requests timeline
      - Pending webhook confirmations
    - Display company's integration status and SDK configuration
    - Add data retention metrics and compliance score
    - _Requirements: 3.1, 4.4, 8.1_

  - [x] 6.5 Build deletion request management interface

    - Check docs folder for updated docs for any references
    - Create deletion requests table with filtering and search
    - Display request details: User_DID, timestamp, data categories, status
    - Show webhook delivery status and retry attempts
    - Implement manual deletion confirmation for failed webhooks
    - Add bulk operations for processing multiple requests
    - Display real-time status updates via WebSocket
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 6.6 Implement audit proof generation and verification

    - Check docs folder for updated docs for any references
    - Create "Generate Audit Report" functionality for regulators
    - Build proof verification interface showing:
      - Commitment hash on blockchain (Midnight explorer link)
      - Deletion proof hash with ZK-SNARK verification
      - Timestamp of deletion with block number
      - Cryptographic signature validation
    - Implement proof export in multiple formats (PDF, JSON, CSV)
    - Add third-party verification tool (public URL for auditors)
    - Create proof chain visualization showing data lifecycle
    - Display Compact contract state queries for verification
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.7 Build compliance reporting dashboard

    - Check docs folder for updated docs for any references
    - Create GDPR compliance metrics dashboard:
      - Deletion request response time (must be <30 days)
      - Percentage of requests completed with blockchain proof
      - Average time to generate deletion proofs
      - Failed deletion attempts and resolution status
    - Implement automated compliance reports generation
    - Add date range filtering for audit periods
    - Create exportable compliance certificates with blockchain proofs
    - Display regulatory requirement checklist (GDPR Article 17)
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 6.8 Add blockchain proof explorer integration

    - Check docs folder for updated docs for any references
    - Integrate Midnight blockchain explorer links
    - Create proof verification widget showing:
      - Transaction hash and block confirmation
      - ZK proof validation status
      - Witness data confirmation (without revealing content)
      - Smart contract state at time of deletion
    - Implement QR code generation for mobile verification
    - Add "Verify on Blockchain" button for each deletion proof
    - _Requirements: 4.2, 4.4, 6.5_

  - [ ]\* 6.9 Add real-time updates for both portals

    - Check docs folder for updated docs for any references
    - Implement WebSocket connection for live data updates
    - Create notification system for status changes
    - Add progress indicators for blockchain operations
    - Display transaction confirmations in real-time
    - Show live deletion request processing for companies
    - _Requirements: 1.5, 7.1, 7.2, 7.4, 7.5_

  - [ ]\* 6.10 Create responsive design and accessibility features

    - Implement mobile-responsive layouts for both portals
    - Add ARIA labels and keyboard navigation
    - Create dark/light theme support
    - Ensure WCAG 2.1 AA compliance
    - _Requirements: 1.1_

  - [x] 6.11 Integrate frontend with Midnight blockchain and backend

    - [x] 6.11.1 Install and configure Midnight SDK packages

      - Install @midnight-ntwrk/dapp-connector-api for wallet integration
      - Install @midnight-ntwrk/midnight-js-types for type definitions
      - Install @midnight-ntwrk/midnight-js-contracts for contract interactions
      - Install @midnight-ntwrk/midnight-js-network-id for network configuration
      - Configure TypeScript to recognize Midnight types and window.midnight global
      - _Requirements: 3.3, 6.2_

    - [x] 6.11.2 Create Midnight wallet connection component

      - Build WalletConnectButton component using DApp Connector API
      - Implement wallet.enable() for Lace wallet authorization
      - Add wallet state management (connected/disconnected, address)
      - Create wallet context provider for app-wide access
      - Handle wallet connection errors and user rejection
      - Display connected wallet address in UI
      - Add disconnect functionality
      - _Requirements: 1.1, 3.3_

    - [x] 6.11.3 Build Midnight contract interaction service

      - Create MidnightContractService class for frontend
      - Load deployed contract addresses from deployment.json
      - Import compiled contract artifacts (index.cjs from contracts/managed/)
      - Implement contract.circuits.registerCommitment() wrapper
      - Implement contract.circuits.markAsDeleted() wrapper
      - Add proof generation integration with proof server
      - Handle transaction signing with connected wallet
      - Add transaction status polling and confirmation
      - _Requirements: 3.3, 4.1, 6.2_

    - [x] 6.11.4 Integrate user dashboard with blockchain data

      - Update getUserFootprint to fetch from both backend and blockchain
      - Query Midnight indexer for user's commitments using GraphQL
      - Display blockchain transaction hashes for each data record
      - Add "View on Explorer" links to Midnight blockchain explorer
      - Show commitment status (pending, confirmed, deleted) from chain
      - Implement real-time blockchain event listening for updates
      - Cache blockchain data with periodic refresh
      - _Requirements: 1.1, 1.2, 1.3, 4.2_

    - [x] 6.11.5 Build end-to-end deletion flow with ZK proofs

      - Connect delete-all button to MidnightContractService
      - Generate deletion certificates for each data record
      - Call backend to initiate deletion and get certificates
      - Generate ZK deletion proofs using proof server via backend
      - Submit markAsDeleted transactions to blockchain
      - Display proof generation progress (can take 30-60 seconds)
      - Show transaction confirmation with block number
      - Store deletion proof hashes for audit trail
      - _Requirements: 2.1, 4.1, 4.3, 6.1_

    - [x] 6.11.6 Implement blockchain proof verification UI

      - Create ProofVerificationCard component
      - Display commitment hash with blockchain explorer link
      - Show deletion proof hash with verification status
      - Query contract state to verify deletion on-chain
      - Implement client-side proof verification (optional)
      - Add "Download Proof Certificate" functionality (JSON/PDF)
      - Show ZK-SNARK proof metadata (without revealing private data)
      - Display proof chain: registration → deletion → verification
      - _Requirements: 4.2, 4.3, 4.4_

    - [x] 6.11.7 Add company portal blockchain integration

      - Display company's registered commitments from blockchain
      - Show total on-chain vs off-chain data records
      - Implement blockchain-based audit report generation
      - Query deletion proofs for compliance verification
      - Add contract state monitoring dashboard
      - Display gas/transaction costs for blockchain operations
      - Show proof server health and performance metrics
      - _Requirements: 4.4, 8.1_

    - [x] 6.11.8 Create blockchain transaction monitoring

      - Build TransactionMonitor component for pending transactions
      - Display transaction status: pending, confirming, confirmed, failed
      - Show block confirmations counter (e.g., 3/6 confirmations)
      - Add transaction retry logic for failed submissions
      - Implement transaction history view with filters
      - Show estimated time for proof generation and confirmation
      - Add notifications for transaction state changes
      - _Requirements: 7.1, 7.2, 7.4_

    - [x] 6.11.9 Implement error handling and fallbacks

      - Handle wallet connection failures gracefully
      - Add fallback for when Lace wallet is not installed
      - Implement retry logic for failed blockchain transactions
      - Handle proof server timeouts (60s+ for complex proofs)
      - Add user-friendly error messages for blockchain errors
      - Implement offline mode with cached blockchain data
      - Add loading states for all blockchain operations
      - _Requirements: 3.3, 6.3_

    - [ ]\* 6.11.10 Add blockchain integration tests

      - Test wallet connection flow with mock wallet
      - Test contract interaction with testnet
      - Verify proof generation and submission
      - Test transaction confirmation polling
      - Validate error handling for network failures
      - Test concurrent transaction handling
      - _Requirements: 4.1, 6.1_

- [x] 7. Deploy and configure smart contracts

  - [x] 7.1 Create contract deployment scripts

    - Check docs folder for updated docs for any references
    - Write TypeScript deployment script using Midnight SDK
    - Compile Compact contracts to JSON artifacts
    - Deploy contracts to Midnight testnet with proper configuration
    - Save deployment addresses and transaction hashes
    - _Requirements: 4.2, 6.1_

  - [x] 7.2 Set up proof server integration

    - Check docs folder for updated docs for any references
    - Configure Docker container for Midnight proof server
    - Test ZK proof generation with sample data
    - Verify proof server connectivity from backend
    - _Requirements: 6.2, 6.3_

  - [ ]\* 7.3 Create contract verification and monitoring
    - Add contract state monitoring and alerting
    - Create blockchain explorer integration for proof verification
    - Implement contract upgrade procedures
    - _Requirements: 4.2, 4.4_

- [ ] 8. Integration testing and end-to-end validation

  - [ ] 8.1 Test complete user journey

    - Check docs folder for updated docs for any references
    - Create test scenario with multiple companies storing user data
    - Verify data registration appears in user dashboard
    - Test one-click deletion flow with blockchain proof generation
    - Validate proof verification and audit trail
    - _Requirements: 1.1, 2.1, 4.1, 4.4_

  - [ ] 8.2 Validate SDK integration

    - Check docs folder for updated docs for any references
    - Test SDK with sample company application
    - Verify automatic data registration and commitment creation
    - Test webhook delivery and deletion handling
    - Validate error handling and retry mechanisms
    - _Requirements: 3.1, 3.4, 8.1, 8.3_

  - [ ]\* 8.3 Performance and security testing
    - Load test API endpoints with concurrent users
    - Verify encryption strength and key management
    - Test ZK proof generation performance under load
    - Validate blockchain transaction throughput
    - _Requirements: 6.3, 4.3_

- [ ] 9. Documentation and deployment preparation

  - [ ] 9.1 Create comprehensive documentation

    - Check docs folder for updated docs for any references
    - Write API documentation with OpenAPI specification
    - Create developer integration guide for companies
    - Document deployment procedures and configuration
    - Add troubleshooting guide for common issues
    - _Requirements: 3.5, 8.2_

  - [ ] 9.2 Prepare production deployment

    - Check docs folder for updated docs for any references
    - Configure Docker Compose for production environment
    - Set up environment variables and secrets management
    - Create database migration scripts
    - Configure monitoring and logging systems
    - _Requirements: 4.2, 7.4_

  - [ ]\* 9.3 Create demo and presentation materials
    - Build interactive demo with sample data
    - Create presentation slides explaining the technology
    - Record demo video showing complete user journey
    - _Requirements: 1.1, 2.1, 4.1_
