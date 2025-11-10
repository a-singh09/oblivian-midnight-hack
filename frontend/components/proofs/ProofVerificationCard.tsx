"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { blockchainDataService } from "@/lib/blockchain-data-service";

interface ProofVerificationCardProps {
  commitmentHash: string;
  deletionProofHash?: string;
  transactionHash?: string;
  blockNumber?: number;
  timestamp?: number;
}

export function ProofVerificationCard({
  commitmentHash,
  deletionProofHash,
  transactionHash,
  blockNumber,
  timestamp,
}: ProofVerificationCardProps) {
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "failed"
  >("pending");
  const [copied, setCopied] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (deletionProofHash && transactionHash) {
      verifyProof();
    }
  }, [deletionProofHash, transactionHash]);

  const verifyProof = async () => {
    setIsVerifying(true);
    try {
      // Query contract state to verify deletion on-chain
      const response = await fetch("/api/verify-deletion-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commitmentHash,
          deletionProofHash,
        }),
      });

      if (response.ok) {
        const { verified } = await response.json();
        setVerificationStatus(verified ? "verified" : "failed");
      } else {
        setVerificationStatus("failed");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationStatus("failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadProofCertificate = (format: "json" | "pdf") => {
    const certificate = {
      commitmentHash,
      deletionProofHash,
      transactionHash,
      blockNumber,
      timestamp: timestamp || Date.now(),
      verificationStatus,
      explorerUrl: transactionHash
        ? blockchainDataService.getExplorerUrl(transactionHash)
        : null,
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(certificate, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proof-certificate-${commitmentHash.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const explorerUrl = transactionHash
    ? blockchainDataService.getExplorerUrl(transactionHash)
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Blockchain Proof Verification</CardTitle>
          </div>
          {verificationStatus === "verified" && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          {verificationStatus === "failed" && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
          {verificationStatus === "pending" && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        <CardDescription>
          Cryptographic proof of data deletion on Midnight blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Proof Chain Visualization */}
        <div className="flex items-center justify-between py-4 border-y">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Registration</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${deletionProofHash ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}
            >
              <CheckCircle
                className={`h-4 w-4 ${deletionProofHash ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <span className="text-sm font-medium">Deletion</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${verificationStatus === "verified" ? "bg-green-600/20" : "bg-muted"} flex items-center justify-center`}
            >
              <CheckCircle
                className={`h-4 w-4 ${verificationStatus === "verified" ? "text-green-600" : "text-muted-foreground"}`}
              />
            </div>
            <span className="text-sm font-medium">Verification</span>
          </div>
        </div>

        {/* Commitment Hash */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Commitment Hash
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">
              {commitmentHash}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(commitmentHash, "commitment")}
            >
              {copied === "commitment" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View on Midnight Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Deletion Proof Hash */}
        {deletionProofHash && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Deletion Proof Hash
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">
                {deletionProofHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(deletionProofHash, "proof")}
              >
                {copied === "proof" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        {transactionHash && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Transaction Hash
              </label>
              <code className="block px-2 py-1 bg-muted rounded text-xs font-mono truncate">
                {transactionHash.slice(0, 16)}...
              </code>
            </div>
            {blockNumber && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Block Number
                </label>
                <code className="block px-2 py-1 bg-muted rounded text-xs font-mono">
                  {blockNumber}
                </code>
              </div>
            )}
          </div>
        )}

        {/* ZK-SNARK Proof Metadata */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Zero-Knowledge Proof</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This proof cryptographically verifies data deletion without
            revealing the original data content. The proof is generated using
            ZK-SNARKs on the Midnight blockchain.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadProofCertificate("json")}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyProof}
            disabled={isVerifying || !deletionProofHash}
            className="flex-1"
          >
            {isVerifying ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify on Chain
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
