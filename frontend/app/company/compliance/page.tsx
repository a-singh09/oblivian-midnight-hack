"use client";

import { useState } from "react";
import { CompanyAuthGate } from "@/components/company/CompanyAuthGate";
import { useCompany } from "@/contexts/CompanyContext";
import {
  FileCheck,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
} from "lucide-react";
import { ComplianceMetricsChart } from "@/components/company/ComplianceMetricsChart";
import { BlockchainAuditReport } from "@/components/company/BlockchainAuditReport";

export default function CompliancePage() {
  const { apiKey } = useCompany();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  if (!apiKey) {
    return <CompanyAuthGate />;
  }

  // Mock compliance data
  const metrics = {
    avgResponseTime: 8.5, // hours
    completionRate: 98.5, // percentage
    avgProofGenerationTime: 12.3, // seconds
    failedDeletions: 3,
    totalRequests: 156,
    within30Days: 156, // GDPR requirement
  };

  const gdprChecklist = [
    {
      requirement: "Article 17(1) - Right to erasure",
      status: "compliant",
      details: "All deletion requests processed within 30 days",
    },
    {
      requirement: "Article 17(2) - Notification obligation",
      status: "compliant",
      details: "Third parties notified of erasure requests",
    },
    {
      requirement: "Article 17(3) - Exceptions documented",
      status: "compliant",
      details: "Legal basis for retention properly documented",
    },
    {
      requirement: "Article 30 - Records of processing",
      status: "compliant",
      details: "Complete audit trail maintained",
    },
    {
      requirement: "Article 32 - Security of processing",
      status: "compliant",
      details: "Cryptographic proofs for all deletions",
    },
    {
      requirement: "Article 33 - Breach notification",
      status: "compliant",
      details: "No breaches detected",
    },
  ];

  const generateComplianceReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      metrics: {
        totalRequests: metrics.totalRequests,
        completedRequests: Math.floor(
          metrics.totalRequests * (metrics.completionRate / 100),
        ),
        avgResponseTime: `${metrics.avgResponseTime} hours`,
        completionRate: `${metrics.completionRate}%`,
        avgProofGenerationTime: `${metrics.avgProofGenerationTime} seconds`,
        failedDeletions: metrics.failedDeletions,
        gdprCompliance: "100%",
      },
      gdprChecklist: gdprChecklist.map((item) => ({
        requirement: item.requirement,
        status: item.status,
        details: item.details,
      })),
      blockchainProofs: metrics.totalRequests,
      complianceScore: 98.5,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${dateRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCertificate = () => {
    const certificate = `
GDPR COMPLIANCE CERTIFICATE
============================

Company: Demo Company
Period: Last ${dateRange}
Generated: ${new Date().toLocaleString()}

COMPLIANCE METRICS
------------------
Total Deletion Requests: ${metrics.totalRequests}
Completion Rate: ${metrics.completionRate}%
Average Response Time: ${metrics.avgResponseTime} hours
Requests Completed Within 30 Days: ${metrics.within30Days} (100%)

GDPR ARTICLE 17 COMPLIANCE
---------------------------
✓ All deletion requests processed within legal timeframe
✓ Cryptographic proof generated for all deletions
✓ Blockchain verification available for all records
✓ Third parties notified of erasure requests
✓ Complete audit trail maintained

BLOCKCHAIN VERIFICATION
------------------------
Total Proofs Generated: ${metrics.totalRequests}
Proof Generation Time: ${metrics.avgProofGenerationTime}s average
Failed Deletions: ${metrics.failedDeletions}

This certificate confirms compliance with GDPR Article 17
(Right to Erasure) requirements for the specified period.

Verification: https://verify.oblivion.network/company/demo
    `.trim();

    const blob = new Blob([certificate], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gdpr-compliance-certificate-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                GDPR Compliance Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor compliance metrics and generate regulatory reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateCertificate}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
              >
                <FileCheck size={16} />
                <span className="hidden sm:inline">Certificate</span>
              </button>
              <button
                onClick={generateComplianceReport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Period:</span>
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "7d"
                  ? "7 Days"
                  : range === "30d"
                    ? "30 Days"
                    : range === "90d"
                      ? "90 Days"
                      : "1 Year"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            GDPR Compliance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Response Time */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <Clock className="text-primary" size={24} />
                <span className="text-xs font-medium text-accent bg-accent/20 px-2 py-1 rounded">
                  {metrics.avgResponseTime < 720 ? "✓ Compliant" : "⚠ Review"}
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {metrics.avgResponseTime}h
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Avg Response Time
              </div>
              <div className="text-xs text-muted-foreground">
                Must be &lt;30 days (720h)
              </div>
            </div>

            {/* Completion Rate */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="text-accent" size={24} />
                <TrendingUp className="text-accent" size={16} />
              </div>
              <div className="text-3xl font-bold text-accent mb-1">
                {metrics.completionRate}%
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Completion Rate
              </div>
              <div className="text-xs text-muted-foreground">
                With blockchain proof
              </div>
            </div>

            {/* Proof Generation Time */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <Shield className="text-primary" size={24} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {metrics.avgProofGenerationTime}s
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Avg Proof Time
              </div>
              <div className="text-xs text-muted-foreground">
                ZK proof generation
              </div>
            </div>

            {/* Failed Deletions */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle
                  className={
                    metrics.failedDeletions > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                  size={24}
                />
              </div>
              <div
                className={`text-3xl font-bold mb-1 ${metrics.failedDeletions > 0 ? "text-destructive" : "text-foreground"}`}
              >
                {metrics.failedDeletions}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Failed Deletions
              </div>
              <div className="text-xs text-muted-foreground">
                Requires resolution
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Audit Report */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BlockchainAuditReport />
        </div>
      </section>

      {/* Charts */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Compliance Trends
          </h2>
          <ComplianceMetricsChart dateRange={dateRange} />
        </div>
      </section>

      {/* GDPR Checklist */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            GDPR Article 17 Checklist
          </h2>
          <div className="space-y-3">
            {gdprChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-secondary/30 border border-border flex items-start gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  {item.status === "compliant" ? (
                    <CheckCircle className="text-accent" size={20} />
                  ) : (
                    <AlertTriangle className="text-destructive" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {item.requirement}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        item.status === "compliant"
                          ? "text-accent bg-accent/20"
                          : "text-destructive bg-destructive/20"
                      }`}
                    >
                      {item.status === "compliant"
                        ? "Compliant"
                        : "Action Required"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Summary */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Compliance Status: Excellent
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your organization is fully compliant with GDPR Article 17
                  requirements. All deletion requests are being processed within
                  the legal timeframe with cryptographic proof recorded on the
                  blockchain.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-accent" size={16} />
                    <span className="text-foreground">
                      {metrics.within30Days} requests within 30 days
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-accent" size={16} />
                    <span className="text-foreground">
                      {metrics.totalRequests} blockchain proofs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-accent" size={16} />
                    <span className="text-foreground">Zero violations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
