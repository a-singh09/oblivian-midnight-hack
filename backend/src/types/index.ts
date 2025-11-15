// Type definitions for Oblivion Protocol backend

export interface UserData {
  userDID: string;
  data: Record<string, any>;
  dataType: string;
  serviceProvider: string;
}

export interface DeletionCertificate {
  userDID: string;
  commitmentHash: string;
  timestamp: number;
  signature: string;
}

export interface DataLocation {
  commitmentHash: string;
  userDID: string;
  dataType: string;
  serviceProvider: string;
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date;
  deletionProofHash?: string;
}

export interface EncryptedDataRecord {
  commitmentHash: Buffer;
  userDID: string;
  encryptedPayload: Buffer;
  encryptionIV: Buffer;
  dataType?: string;
  serviceProvider?: string;
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date;
  deletionProofHash?: Buffer;
}

export interface StorageConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?:
    | boolean
    | {
        rejectUnauthorized: boolean;
        ca?: string;
      };
}
