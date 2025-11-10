"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Shield,
  CheckCircle,
  Calendar,
  Filter,
} from "lucide-react";

interface AuditReportData {
  companyName: string;
  reportPeriod: { start: Date; end: Date };
  totalCommitments: number;
  verifiedDeletions: number;
  blockchainProofs: Array<{
    commitmentHash: string;
    deletionProofHash: string;
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
  }>;
  complianceScore: number;
}

export function BlockchainAuditReport() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [generating, setGenerating] = useState(false);

  const generateAuditReport = async (format: "json" | "pdf" | "csv") => {
    setGenerating(true);
    try {
      const response = await fetch("/api/company/generate-audit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-report-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to generate audit report:", error);
    } finally {
      setGenerating(false);
    }
  };

  const queryDeletionProofs = async () => {
    try {
      const response = await fetch("/api/company/deletion-proofs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
        }),
      });

      if (response.ok) {
        const proofs = await response.json();
        console.log("Deletion proofs:", proofs);
        // Handle the proofs data
      }
    } catch (error) {
      console.error("Failed to query deletion proofs:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain-Based Audit Reports</CardTitle>
        <CardDescription>
          Generate compliance reports with cryptographic proof from the
          blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Report Period:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: new Date(e.target.value) })
              }
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: new Date(e.target.value) })
              }
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Report Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Commitments</span>
            </div>
            <div className="text-2xl font-bold">1,234</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Verified Deletions</span>
            </div>
            <div className="text-2xl font-bold text-accent">89</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Compliance Score</span>
            </div>
            <div className="text-2xl font-bold text-green-600">98%</div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Export Audit Report</div>
          <div className="flex gap-3">
            <Button
              onClick={() => generateAuditReport("json")}
              disabled={generating}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              onClick={() => generateAuditReport("pdf")}
              disabled={generating}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => generateAuditReport("csv")}
              disabled={generating}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Query Deletion Proofs */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={queryDeletionProofs}
            variant="default"
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Query Deletion Proofs from Blockchain
          </Button>
        </div>

        {/* Compliance Information */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium mb-1">GDPR Article 17 Compliance</div>
              <div className="text-muted-foreground">
                All deletion requests are verified with cryptographic proofs on
                the Midnight blockchain. Reports include immutable proof hashes
                that can be independently verified by regulators.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
