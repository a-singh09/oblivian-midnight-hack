"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { blockchainDataService } from "@/lib/blockchain-data-service";

export type TransactionStatus =
  | "pending"
  | "confirming"
  | "confirmed"
  | "failed";

export interface Transaction {
  id: string;
  txHash: string;
  type: "commitment" | "deletion";
  status: TransactionStatus;
  confirmations: number;
  requiredConfirmations: number;
  timestamp: number;
  estimatedTime?: number;
  error?: string;
}

interface TransactionMonitorProps {
  transactions?: Transaction[];
  onRetry?: (txHash: string) => void;
}

export function TransactionMonitor({
  transactions: propTransactions,
  onRetry,
}: TransactionMonitorProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    propTransactions || [],
  );
  const [filter, setFilter] = useState<"all" | TransactionStatus>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshTransactions();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const refreshTransactions = async () => {
    try {
      const response = await fetch("/api/transactions/pending");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to refresh transactions:", error);
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "confirming":
        return (
          <Badge variant="secondary" className="bg-blue-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            Confirming
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case "confirming":
        return <TrendingUp className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      return "Just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  const formatEstimatedTime = (ms?: number) => {
    if (!ms) return "Unknown";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const filteredTransactions = transactions.filter(
    (tx) => filter === "all" || tx.status === filter,
  );

  const stats = {
    total: transactions.length,
    pending: transactions.filter((tx) => tx.status === "pending").length,
    confirming: transactions.filter((tx) => tx.status === "confirming").length,
    confirmed: transactions.filter((tx) => tx.status === "confirmed").length,
    failed: transactions.filter((tx) => tx.status === "failed").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Monitor</CardTitle>
            <CardDescription>
              Real-time blockchain transaction status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`p-2 rounded-lg text-center transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs">All</div>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`p-2 rounded-lg text-center transition-colors ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <div className="text-lg font-bold">{stats.pending}</div>
            <div className="text-xs">Pending</div>
          </button>
          <button
            onClick={() => setFilter("confirming")}
            className={`p-2 rounded-lg text-center transition-colors ${
              filter === "confirming"
                ? "bg-blue-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <div className="text-lg font-bold">{stats.confirming}</div>
            <div className="text-xs">Confirming</div>
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`p-2 rounded-lg text-center transition-colors ${
              filter === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <div className="text-lg font-bold">{stats.confirmed}</div>
            <div className="text-xs">Confirmed</div>
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`p-2 rounded-lg text-center transition-colors ${
              filter === "failed"
                ? "bg-red-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <div className="text-lg font-bold">{stats.failed}</div>
            <div className="text-xs">Failed</div>
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No {filter !== "all" ? filter : ""} transactions</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="font-medium text-sm">
                        {tx.type === "commitment"
                          ? "Data Commitment"
                          : "Deletion Proof"}
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {tx.txHash.slice(0, 16)}...{tx.txHash.slice(-8)}
                      </code>
                    </div>
                  </div>
                  {getStatusBadge(tx.status)}
                </div>

                {/* Progress Bar for Confirming */}
                {tx.status === "confirming" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Confirmations</span>
                      <span>
                        {tx.confirmations}/{tx.requiredConfirmations}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${(tx.confirmations / tx.requiredConfirmations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    {tx.estimatedTime && tx.status !== "confirmed" && (
                      <span className="text-muted-foreground">
                        ETA: {formatEstimatedTime(tx.estimatedTime)}
                      </span>
                    )}
                    {tx.status === "failed" && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetry(tx.txHash)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    <a
                      href={blockchainDataService.getExplorerUrl(tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {tx.error && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                    {tx.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
