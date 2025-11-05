// Test setup for backend
// This file runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.PROOF_SERVER_URL = "http://localhost:6300";
process.env.ENCRYPTION_KEY = "test_encryption_key_32_bytes_long";

// Global test timeout
jest.setTimeout(30000);
