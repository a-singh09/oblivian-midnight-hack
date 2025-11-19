"use client";

import { useEffect, useState } from "react";
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
  Package,
} from "lucide-react";
import { CompanyAuthGate } from "@/components/company/CompanyAuthGate";
import { BlockchainMetrics } from "@/components/company/BlockchainMetrics";
import { apiClient } from "@/lib/api-client";
import type { DataLocation } from "@/lib/api-client";

export default function CompanyDashboardPage() {
  const { stats, loading, error, refreshStats, apiKey } = useCompany();
  const [demoUserData, setDemoUserData] = useState<DataLocation[]>([]);
  const [loadingDemoData, setLoadingDemoData] = useState(false);
  const [deletingRecords, setDeletingRecords] = useState<Set<string>>(
    new Set(),
  );
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (apiKey) {
      refreshStats();
      loadDemoUserData();
    }
  }, [apiKey]);

  const loadDemoUserData = async () => {
    setLoadingDemoData(true);
    try {
      const data = await apiClient.getDemoUserData();
      setDemoUserData(data);
    } catch (err) {
      console.error("Failed to load demo user data:", err);
    } finally {
      setLoadingDemoData(false);
    }
  };

  const handleDeleteRecord = async (record: DataLocation) => {
    // Clear previous messages
    setDeleteSuccess(null);
    setDeleteError(null);

    // Add to deleting set
    setDeletingRecords((prev) => new Set(prev).add(record.commitmentHash));

    try {
      const demoUserDID = "did:midnight:demo_user_123";
      await apiClient.deleteCommitment(demoUserDID, record.commitmentHash);

      setDeleteSuccess(
        `Successfully deleted ${record.dataType} from ${record.serviceProvider}`,
      );

      // Refresh the data after successful deletion
      setTimeout(() => {
        loadDemoUserData();
        refreshStats();
        setDeleteSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to delete record:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete record",
      );
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      // Remove from deleting set
      setDeletingRecords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(record.commitmentHash);
        return newSet;
      });
    }
  };

  const handleDeleteAllRecords = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all active records for this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    // Clear previous messages
    setDeleteSuccess(null);
    setDeleteError(null);

    try {
      const demoUserDID = "did:midnight:demo_user_123";
      const result = await apiClient.deleteAllUserData(demoUserDID);

      setDeleteSuccess(
        `Successfully deleted ${result.deletedCount} records with ${result.blockchainProofs.length} blockchain proofs`,
      );

      // Refresh the data after successful deletion
      setTimeout(() => {
        loadDemoUserData();
        refreshStats();
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to delete all records:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete all records",
      );
      setTimeout(() => setDeleteError(null), 5000);
    }
  };

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
              className="text-destructive shrink-0 mt-0.5"
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

      {/* Blockchain Metrics */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BlockchainMetrics />
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

      {/* Demo User Data - Hackathon Demo */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Users' Data
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Live deletion data for{" "}
                <span className="font-mono text-primary">users</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAllRecords}
                disabled={
                  loadingDemoData ||
                  demoUserData.filter((d) => !d.deleted).length === 0
                }
                className="flex items-center gap-2 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-destructive"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Delete All Active</span>
              </button>
              <button
                onClick={loadDemoUserData}
                disabled={loadingDemoData}
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors disabled:opacity-50 text-primary"
              >
                <RefreshCw
                  size={16}
                  className={loadingDemoData ? "animate-spin" : ""}
                />
                <span className="text-sm font-medium">Refresh Data</span>
              </button>
            </div>
          </div>

          {loadingDemoData && demoUserData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw
                  className="animate-spin text-primary mx-auto mb-4"
                  size={32}
                />
                <p className="text-muted-foreground">
                  Loading demo user data...
                </p>
              </div>
            </div>
          ) : demoUserData.length === 0 ? (
            <div className="p-8 rounded-lg bg-secondary/30 border border-border text-center">
              <Package
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
              />
              <p className="text-muted-foreground">
                No data found for demo user. Try creating some data first!
              </p>
            </div>
          ) : (
            <>
              {/* Success/Error Messages */}
              {deleteSuccess && (
                <div className="mb-4 p-4 rounded-lg bg-accent/10 border border-accent/30 flex items-start gap-3">
                  <CheckCircle
                    className="text-accent shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Success!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {deleteSuccess}
                    </p>
                  </div>
                </div>
              )}

              {deleteError && (
                <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                  <AlertCircle
                    className="text-destructive shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Error</p>
                    <p className="text-sm text-muted-foreground">
                      {deleteError}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {demoUserData.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Records
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {demoUserData.filter((d) => !d.deleted).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Records
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="text-2xl font-bold text-destructive mb-1">
                    {demoUserData.filter((d) => d.deleted).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Deleted Records
                  </div>
                </div>
              </div>

              {/* Data Records Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Service Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Commitment Hash
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-secondary/20 divide-y divide-border">
                      {demoUserData.map((record, idx) => (
                        <tr
                          key={record.commitmentHash}
                          className="hover:bg-secondary/40 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Database size={16} className="text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                {record.serviceProvider}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-foreground">
                              {record.dataType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded font-mono">
                              {record.commitmentHash.substring(0, 16)}...
                            </code>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground">
                              {new Date(record.createdAt).toLocaleDateString()}{" "}
                              {new Date(record.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {record.deleted ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/20 px-3 py-1 rounded-full">
                                <Trash2 size={12} />
                                DELETED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full">
                                <CheckCircle size={12} />
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            {!record.deleted ? (
                              <button
                                onClick={() => handleDeleteRecord(record)}
                                disabled={deletingRecords.has(
                                  record.commitmentHash,
                                )}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title="Delete this data record"
                              >
                                {deletingRecords.has(record.commitmentHash) ? (
                                  <>
                                    <RefreshCw
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={14} />
                                    Delete
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Already deleted
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
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
