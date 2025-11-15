-- Oblivion Protocol Database Schema
-- Run this to set up the database tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_did VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_commitments table
CREATE TABLE IF NOT EXISTS data_commitments (
  id SERIAL PRIMARY KEY,
  user_did VARCHAR(255) NOT NULL,
  commitment_hash VARCHAR(66) UNIQUE NOT NULL,
  service_provider VARCHAR(255) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  encrypted_data TEXT NOT NULL,
  blockchain_tx VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deletion_proof_hash VARCHAR(66),
  FOREIGN KEY (user_did) REFERENCES users(user_did) ON DELETE CASCADE
);

-- Create deletion_requests table
CREATE TABLE IF NOT EXISTS deletion_requests (
  id SERIAL PRIMARY KEY,
  user_did VARCHAR(255) NOT NULL,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  proof_hash VARCHAR(66),
  blockchain_tx VARCHAR(66),
  FOREIGN KEY (user_did) REFERENCES users(user_did) ON DELETE CASCADE
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_commitments_user_did ON data_commitments(user_did);
CREATE INDEX IF NOT EXISTS idx_data_commitments_commitment_hash ON data_commitments(commitment_hash);
CREATE INDEX IF NOT EXISTS idx_data_commitments_deleted ON data_commitments(deleted);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_did ON deletion_requests(user_did);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- Insert a demo API key for testing
INSERT INTO api_keys (api_key, service_name, is_active)
VALUES ('demo-api-key', 'Demo Company', TRUE)
ON CONFLICT (api_key) DO NOTHING;

-- Create a demo user for testing
INSERT INTO users (user_did)
VALUES ('did:midnight:demo_user')
ON CONFLICT (user_did) DO NOTHING;

-- Insert some demo data commitments
INSERT INTO data_commitments (
  user_did,
  commitment_hash,
  service_provider,
  data_type,
  encrypted_data,
  blockchain_tx
)
VALUES 
  (
    'did:midnight:demo_user',
    '0x' || md5(random()::text || clock_timestamp()::text),
    'Demo Company',
    'profile',
    '{"encrypted": "demo_data_1"}',
    '0x' || md5(random()::text)
  ),
  (
    'did:midnight:demo_user',
    '0x' || md5(random()::text || clock_timestamp()::text),
    'Demo Company',
    'transactions',
    '{"encrypted": "demo_data_2"}',
    '0x' || md5(random()::text)
  )
ON CONFLICT (commitment_hash) DO NOTHING;

-- Verify the setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as commitment_count FROM data_commitments;
SELECT COUNT(*) as api_key_count FROM api_keys;
