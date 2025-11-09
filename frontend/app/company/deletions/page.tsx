"use client";

import { useEffect, useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CompanyAuthGate } from "@/components/company/CompanyAuthGate";
import { DeletionRequestCard } from "@/components/company/DeletionRequestCard";

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed";
type WebhookFilter = "all" | "pending" | "delivered" | "failed";

export default function DeletionRequestsPage() {
  const { deletionRequests, loading, error, refreshDeletionRequests, apiKey } =
    useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [webhookFilter, setWebhookFilter] = useState<WebhookFilter>("all");
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (apiKey) {
      refreshDeletionRequests();
    }
  }, [apiKey]);

  if (!apiKey) {
    return <CompanyAuthGate />;
  }

  // Filter requests
  const filteredRequests = deletionRequests.filter((request) => {
    // Search filter
    if (
      searchQuery &&
      !request.userDID.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    // Webhook filter
    if (webhookFilter !== "all" && request.webhookStatus !== webhookFilter) {
      return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: deletionRequests.length,
    pending: deletionRequests.filter((r) => r.status === "pending").length,
    processing: deletionRequests.filter((r) => r.status === "processing")
      .length,
    completed: deletionRequests.filter((r) => r.status === "completed").length,
    failed: deletionRequests.filter((r) => r.status === "failed").length,
    webhookFailed: deletionRequests.filter((r) => r.webhookStatus === "failed")
      .length,
  };

  const toggleSelectRequest = (id: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const selectAll = () => {
    if (selectedRequests.size === filteredRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(filteredRequests.map((r) => r.id)));
    }
  };

  const handleBulkConfirm = async () => {
    // Bulk confirmation logic would go here
    console.log("Bulk confirming:", Array.from(selectedRequests));
    setSelectedRequests(new Set());
  };

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Deletion Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and monitor user data deletion requests
              </p>
            </div>
            <button
              onClick={refreshDeletionRequests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-foreground">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-destructive">
                {stats.pending}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-primary">
                {stats.processing}
              </div>
              <div className="text-xs text-muted-foreground">Processing</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-accent">
                {stats.completed}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-destructive">
                {stats.failed}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="text-xl font-bold text-destructive">
                {stats.webhookFailed}
              </div>
              <div className="text-xs text-muted-foreground">
                Webhook Failed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by User DID..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Webhook Filter */}
            <div>
              <select
                value={webhookFilter}
                onChange={(e) =>
                  setWebhookFilter(e.target.value as WebhookFilter)
                }
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Webhooks</option>
                <option value="pending">Webhook Pending</option>
                <option value="delivered">Webhook Delivered</option>
                <option value="failed">Webhook Failed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Actions */}
      {selectedRequests.size > 0 && (
        <section className="border-b border-border bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {selectedRequests.size} request
                {selectedRequests.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRequests(new Set())}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear selection
                </button>
                <button
                  onClick={handleBulkConfirm}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirm Selected
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle
              className="text-destructive flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Error loading requests
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && deletionRequests.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw
                className="animate-spin text-primary mx-auto mb-4"
                size={32}
              />
              <p className="text-muted-foreground">
                Loading deletion requests...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle
                className="text-muted-foreground mx-auto mb-4"
                size={48}
              />
              <p className="text-muted-foreground">
                {searchQuery ||
                statusFilter !== "all" ||
                webhookFilter !== "all"
                  ? "No requests match your filters"
                  : "No deletion requests yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                <input
                  type="checkbox"
                  checked={
                    selectedRequests.size === filteredRequests.length &&
                    filteredRequests.length > 0
                  }
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm font-medium text-foreground">
                  Select All
                </span>
              </div>

              {/* Request Cards */}
              {filteredRequests.map((request) => (
                <DeletionRequestCard
                  key={request.id}
                  request={request}
                  selected={selectedRequests.has(request.id)}
                  onToggleSelect={() => toggleSelectRequest(request.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
