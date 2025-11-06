import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

/**
 * Cryptographic utilities for Oblivion Protocol
 * Implements AES-256-CBC encryption with random IVs and SHA-256 hashing
 */

const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

/**
 * Generate a random initialization vector
 */
export function generateIV(): Buffer {
  return randomBytes(IV_LENGTH);
}

/**
 * Encrypt data using AES-256-CBC with a random IV
 */
export function encryptData(
  data: string,
  key: Buffer,
): { encrypted: Buffer; iv: Buffer } {
  const iv = generateIV();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { encrypted, iv };
}

/**
 * Decrypt data using AES-256-CBC
 */
export function decryptData(
  encryptedData: Buffer,
  key: Buffer,
  iv: Buffer,
): string {
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Generate SHA-256 hash of data (commitment hash)
 */
export function generateCommitmentHash(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate deletion certificate signature
 */
export function generateDeletionSignature(
  userDID: string,
  commitmentHash: string,
  timestamp: number,
): string {
  const data = `${userDID}:${commitmentHash}:${timestamp}`;
  return createHash("sha256").update(data).digest("hex");
}
