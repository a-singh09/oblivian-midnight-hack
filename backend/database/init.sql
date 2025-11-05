-- Initialize Oblivion Protocol database schema
-- This script runs automatically when PostgreSQL container starts

-- Create encrypted_data table for off-chain storage
CREATE TABLE IF NOT EXISTS encrypted_data (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_did ON encrypted_data(user_did);
CREATE INDEX IF NOT EXISTS idx_service_provider ON encrypted_data(service_provider);
CREATE INDEX IF NOT EXISTS idx_created_at ON encrypted_data(created_at);
CREATE INDEX IF NOT EXISTS idx_deleted ON encrypted_data(deleted);

-- Create webhook_endpoints table for company integrations
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id SERIAL PRIMARY KEY,
    service_provider VARCHAR(255) NOT NULL,
    webhook_url TEXT NOT NULL,
    api_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Create webhook_deliveries table for tracking
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id SERIAL PRIMARY KEY,
    webhook_endpoint_id INTEGER REFERENCES webhook_endpoints(id),
    user_did VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for webhook tables
CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_user_did ON webhook_deliveries(user_did);