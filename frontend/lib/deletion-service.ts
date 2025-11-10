/**
 * Deletion Service
 * Handles end-to-end deletion flow with ZK proofs and blockchain integration
 */

import { apiClient, DeletionResult, DeletionCertificate } from "./api-client";
import { MidnightContractService } from "./midnight-contract-service";

export interface DeletionProgress {
  stage:
    | "deleting"
    | "generating_proofs"
    | "submitting_blockchain"
    | "complete";
  progress: number;
  message: string;
}

export class DeletionService {
  private contractService: MidnightContractService | null;

  constructor(contractService: MidnightContractService | null) {
    this.contractService = contractService;
  }

  /**
   * Execute complete deletion flow with blockchain integration
   */
  async deleteAllData(
    userDID: string,
    onProgress?: (progress: DeletionProgress) => void,
  ): Promise<DeletionResult> {
    try {
      // Stage 1: Delete from backend storage
      onProgress?.({
        stage: "deleting",
        progress: 10,
        message: "Deleting data from storage...",
      });

      const result = await apiClient.deleteAllUserData(userDID);

      onProgress?.({
        stage: "deleting",
        progress: 33,
        message: `Deleted ${result.deletedCount} records`,
      });

      // Stage 2: Generate ZK deletion proofs
      onProgress?.({
        stage: "generating_proofs",
        progress: 40,
        message: "Generating zero-knowledge proofs...",
      });

      const proofHashes = await this.generateDeletionProofs(
        result.certificates,
      );

      onProgress?.({
        stage: "generating_proofs",
        progress: 66,
        message: `Generated ${proofHashes.length} ZK proofs`,
      });

      // Stage 3: Submit to blockchain
      if (this.contractService) {
        onProgress?.({
          stage: "submitting_blockchain",
          progress: 70,
          message: "Submitting to Midnight blockchain...",
        });

        await this.submitToBlockchain(result.certificates, proofHashes);

        onProgress?.({
          stage: "submitting_blockchain",
          progress: 90,
          message: "Waiting for blockchain confirmation...",
        });

        // Poll for confirmations
        await this.waitForConfirmations(result.blockchainProofs);
      }

      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "Deletion complete with blockchain proof",
      });

      return result;
    } catch (error) {
      console.error("Deletion flow failed:", error);
      throw error;
    }
  }

  /**
   * Generate ZK deletion proofs for certificates
   */
  private async generateDeletionProofs(
    certificates: DeletionCertificate[],
  ): Promise<string[]> {
    const proofPromises = certificates.map(async (cert) => {
      try {
        // Call backend API to generate proof via proof server
        const response = await fetch("/api/generate-deletion-proof", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commitmentHash: cert.commitmentHash,
            timestamp: cert.timestamp,
            signature: cert.signature,
          }),
        });

        if (!response.ok) {
          throw new Error("Proof generation failed");
        }

        const { proofHash } = await response.json();
        return proofHash;
      } catch (error) {
        console.error(
          "Failed to generate proof for",
          cert.commitmentHash,
          error,
        );
        throw error;
      }
    });

    return Promise.all(proofPromises);
  }

  /**
   * Submit deletion proofs to blockchain
   */
  private async submitToBlockchain(
    certificates: DeletionCertificate[],
    proofHashes: string[],
  ): Promise<void> {
    if (!this.contractService) {
      throw new Error("Contract service not initialized");
    }

    const submissions = certificates.map(async (cert, index) => {
      try {
        const result = await this.contractService!.markAsDeleted({
          commitmentHash: cert.commitmentHash,
        });

        // Poll for transaction confirmation
        await this.contractService!.pollTransactionStatus(result.txHash);

        return result;
      } catch (error) {
        console.error(
          "Failed to submit to blockchain:",
          cert.commitmentHash,
          error,
        );
        throw error;
      }
    });

    await Promise.all(submissions);
  }

  /**
   * Wait for blockchain confirmations
   */
  private async waitForConfirmations(
    transactionHashes: string[],
    maxWaitTime: number = 60000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      // Check if all transactions are confirmed
      const confirmations = await Promise.all(
        transactionHashes.map((hash) => this.checkTransactionConfirmed(hash)),
      );

      if (confirmations.every((confirmed) => confirmed)) {
        return;
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Blockchain confirmation timeout");
  }

  /**
   * Check if a transaction is confirmed
   */
  private async checkTransactionConfirmed(txHash: string): Promise<boolean> {
    try {
      const response = await fetch("/api/check-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash }),
      });

      if (!response.ok) {
        return false;
      }

      const { confirmed } = await response.json();
      return confirmed;
    } catch (error) {
      console.error("Error checking transaction:", error);
      return false;
    }
  }

  /**
   * Store deletion proof hashes for audit trail
   */
  async storeDeletionProofs(
    userDID: string,
    proofs: Array<{
      commitmentHash: string;
      proofHash: string;
      txHash: string;
    }>,
  ): Promise<void> {
    try {
      await fetch("/api/store-deletion-proofs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userDID,
          proofs,
        }),
      });
    } catch (error) {
      console.error("Failed to store deletion proofs:", error);
    }
  }
}
