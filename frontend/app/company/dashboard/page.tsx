"use client";

import { useEffect } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import {
  Users,
  Database,
  Trash2,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { CompanyAuthGate } from "@/components/company/CompanyAuthGate";

export default function CompanyDashboardPage() {
  const { stats, loading, error, refreshStats, apiKey } = useCompany();

  useEffect(() => {
    if (apiKey) {
      refreshStats();
    }
  }, [apiKey]);

  if (!apiKey) {
    return <CompanyAuthGate />;
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw
            className="animate-spin text-primary mx-auto mb-4"
            size={32}
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Company Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor your GDPR compliance and data management
              </p>
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle
              className="text-destructive flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Error loading data
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="text-primary" size={24} />
                </div>
                <TrendingUp className="text-accent" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.totalUsers.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Users Registered
              </div>
            </div>

            {/* Active Records */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Database className="text-primary" size={24} />
                </div>
                <CheckCircle className="text-accent" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.activeRecords.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Data Records
              </div>
            </div>

            {/* Deleted Records */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Trash2 className="text-accent" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent mb-1">
                {stats?.deletedRecords.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Successfully Deleted
              </div>
            </div>

            {/* Pending Deletions */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Clock className="text-destructive" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-destructive mb-1">
                {stats?.pendingDeletions || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending Deletion Requests
              </div>
            </div>

            {/* Avg Deletion Time */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="text-primary" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.avgDeletionTime.toFixed(1) || 0}s
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Deletion Time
              </div>
            </div>

            {/* Compliance Score */}
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="text-accent" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent mb-1">
                {stats?.complianceScore.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Compliance Score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Status */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Integration Status
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* SDK Configuration */}
            <div className="p-6 rounded-lg bg-secondary/30 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                SDK Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    SDK Version
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    v1.0.0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    API Key Status
                  </span>
                  <span className="text-sm font-medium text-accent flex items-center gap-1">
                    <CheckCircle size={14} />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Webhook Endpoint
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Configured
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Auto-deletion
                  </span>
                  <span className="text-sm font-medium text-accent flex items-center gap-1">
                    <CheckCircle size={14} />
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Data Retention Metrics */}
            <div className="p-6 rounded-lg bg-secondary/30 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Data Retention Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg Retention Period
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    247 days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deletion Rate (30d)
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    4.2%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Compliance Violations
                  </span>
                  <span className="text-sm font-medium text-accent flex items-center gap-1">
                    <CheckCircle size={14} />0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Audit
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    2 days ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Recent Deletion Requests
          </h2>
          <div className="space-y-3">
            {[
              {
                did: "did:midnight:user_abc123",
                time: "2 hours ago",
                status: "completed",
              },
              {
                did: "did:midnight:user_def456",
                time: "5 hours ago",
                status: "completed",
              },
              {
                did: "did:midnight:user_ghi789",
                time: "1 day ago",
                status: "completed",
              },
              {
                did: "did:midnight:user_jkl012",
                time: "2 days ago",
                status: "completed",
              },
            ].map((request, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-secondary/30 border border-border flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm text-foreground mb-1">
                    {request.did}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.time}
                  </div>
                </div>
                <span className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full">
                  {request.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
