"use client";

import React from "react";
import { Clock, Shield, TrendingUp } from "lucide-react";

interface BlockchainLoadingStateProps {
  operation: "connecting" | "transaction" | "proof" | "confirmation";
  message?: string;
}

export function BlockchainLoadingState({
  operation,
  message,
}: BlockchainLoadingStateProps) {
  const getOperationDetails = () => {
    switch (operation) {
      case "connecting":
        return {
          icon: <Clock className="h-8 w-8 text-primary animate-pulse" />,
          title: "Connecting to Wallet",
          description:
            message || "Please approve the connection in your Lace wallet...",
        };
      case "transaction":
        return {
          icon: <TrendingUp className="h-8 w-8 text-primary animate-pulse" />,
          title: "Processing Transaction",
          description:
            message || "Submitting transaction to Midnight blockchain...",
        };
      case "proof":
        return {
          icon: <Shield className="h-8 w-8 text-primary animate-pulse" />,
          title: "Generating ZK Proof",
          description:
            message || "This may take 30-60 seconds for complex proofs...",
        };
      case "confirmation":
        return {
          icon: <Clock className="h-8 w-8 text-primary animate-pulse" />,
          title: "Waiting for Confirmation",
          description: message || "Waiting for blockchain confirmation...",
        };
    }
  };

  const details = getOperationDetails();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="mb-4">{details.icon}</div>
      <h3 className="text-lg font-semibold mb-2">{details.title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {details.description}
      </p>
      <div className="mt-6 flex gap-2">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
