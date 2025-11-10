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
import {
  Activity,
  Database,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface BlockchainMetrics {
  totalCommitments: number;
  onChainRecords: number;
  offChainRecords: number;
  verifiedDeletions: number;
  pendingTransactions: number;
  averageGasCost: number;
  proofServerHealth: "healthy" | "degraded" | "down";
  lastBlockchainSync: number;
}

export function BlockchainMetrics() {
  const [metrics, setMetrics] = useState<BlockchainMetrics>({
    totalCommitments: 0,
    onChainRecords: 0,
    offChainRecords: 0,
    verifiedDeletions: 0,
    pendingTransactions: 0,
    averageGasCost: 0,
    proofServerHealth: "healthy",
    lastBlockchainSync: Date.now(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/company/blockchain-metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch blockchain metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = () => {
    switch (metrics.proofServerHealth) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Healthy
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Degraded
          </Badge>
        );
      case "down":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Down
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Commitments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {metrics.totalCommitments}
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>On-Chain Records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                {metrics.onChainRecords}
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.offChainRecords} off-chain
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Deletions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-accent">
                {metrics.verifiedDeletions}
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-yellow-600">
                {metrics.pendingTransactions}
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blockchain Operations</CardTitle>
              <CardDescription>
                Real-time blockchain and proof server status
              </CardDescription>
            </div>
            {getHealthBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proof Server Health */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Proof Server</div>
                <div className="text-sm text-muted-foreground">
                  Status: {metrics.proofServerHealth}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Port 6300</div>
              <div className="text-xs text-muted-foreground">Local</div>
            </div>
          </div>

          {/* Gas Costs */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Average Gas Cost</div>
                <div className="text-sm text-muted-foreground">
                  Per transaction
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {metrics.averageGasCost.toFixed(4)} DUST
              </div>
              <div className="text-xs text-muted-foreground">
                Midnight testnet
              </div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Last Blockchain Sync</div>
                <div className="text-sm text-muted-foreground">
                  Indexer synchronization
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {new Date(metrics.lastBlockchainSync).toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - metrics.lastBlockchainSync) / 1000)}s
                ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract State Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract State</CardTitle>
          <CardDescription>Monitor deployed contract status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <div>
                <div className="font-medium text-sm">
                  DataCommitment Contract
                </div>
                <code className="text-xs text-muted-foreground">
                  0x0200a8e253d6db90...
                </code>
              </div>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <div>
                <div className="font-medium text-sm">
                  ZKDeletionVerifier Contract
                </div>
                <code className="text-xs text-muted-foreground">
                  0x0200983887c84b45...
                </code>
              </div>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
