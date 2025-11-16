-- Migration: Allow NULL for encrypted_payload after deletion
-- This allows us to mark records as deleted without violating constraints

ALTER TABLE encrypted_data 
  ALTER COLUMN encrypted_payload DROP NOT NULL;

ALTER TABLE encrypted_data 
  ALTER COLUMN encryption_iv DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN encrypted_data.encrypted_payload IS 'Encrypted user data. NULL after deletion for GDPR compliance.';
COMMENT ON COLUMN encrypted_data.encryption_iv IS 'Encryption IV. NULL after deletion.';
