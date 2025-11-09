"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlockchainExplorerWidget } from "@/components/blockchain/BlockchainExplorerWidget";

export default function VerifyProofPage() {
  const params = useParams();
  const proofHash = params.proofHash as string;

  // Mock data - would come from API based on proofHash
  const proofData = {
    transactionHash: "0x9876543210fedcba9876543210fedcba98765432",
    proofHash: proofHash || "0xabcdef1234567890abcdef1234567890abcdef12",
    blockNumber: 12345678,
    timestamp: Date.now() - 86400000,
    serviceProvider: "EuroBank",
  };

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/user/proofs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Proofs
          </Link>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Verify Deletion Proof
          </h1>
          <p className="text-sm text-muted-foreground">
            Blockchain verification for {proofData.serviceProvider}
          </p>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <BlockchainExplorerWidget
            transactionHash={proofData.transactionHash}
            proofHash={proofData.proofHash}
            blockNumber={proofData.blockNumber}
            timestamp={proofData.timestamp}
          />

          {/* Additional Info */}
          <div className="mt-8 p-6 rounded-lg bg-secondary/30 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              About This Proof
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                This deletion proof provides cryptographic evidence that your
                data was permanently deleted from{" "}
                <span className="font-semibold text-foreground">
                  {proofData.serviceProvider}
                </span>{" "}
                and recorded on the Midnight blockchain.
              </p>
              <p className="text-muted-foreground">
                The zero-knowledge proof ensures that the deletion was verified
                without revealing the actual data content, maintaining your
                privacy while providing regulatory compliance.
              </p>
              <div className="pt-3 border-t border-border">
                <div className="font-medium text-foreground mb-2">
                  What This Proves:
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Data was physically deleted from storage</li>
                  <li>• Deletion was cryptographically verified</li>
                  <li>• Proof is immutably recorded on blockchain</li>
                  <li>• Timestamp and block number are verifiable</li>
                  <li>• Third parties can independently verify</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
