"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CompanyStats {
  totalUsers: number;
  activeRecords: number;
  deletedRecords: number;
  pendingDeletions: number;
  avgDeletionTime: number;
  complianceScore: number;
}

interface DeletionRequest {
  id: string;
  userDID: string;
  timestamp: number;
  dataCategories: string[];
  status: "pending" | "processing" | "completed" | "failed";
  webhookStatus: "pending" | "delivered" | "failed";
  retryAttempts: number;
}

interface CompanyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  companyName: string | null;
  setCompanyName: (name: string) => void;
  stats: CompanyStats | null;
  deletionRequests: DeletionRequest[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshDeletionRequests: () => Promise<void>;
  confirmDeletion: (requestId: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for now - will be replaced with real API calls
  const refreshStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStats({
        totalUsers: 1247,
        activeRecords: 3891,
        deletedRecords: 156,
        pendingDeletions: 8,
        avgDeletionTime: 12.5,
        complianceScore: 98.5,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const refreshDeletionRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDeletionRequests([
        {
          id: "1",
          userDID: "did:midnight:user_abc123",
          timestamp: Date.now() - 3600000,
          dataCategories: ["profile", "transactions"],
          status: "pending",
          webhookStatus: "pending",
          retryAttempts: 0,
        },
        {
          id: "2",
          userDID: "did:midnight:user_def456",
          timestamp: Date.now() - 7200000,
          dataCategories: ["profile", "orders"],
          status: "completed",
          webhookStatus: "delivered",
          retryAttempts: 0,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch deletion requests",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletion = async (requestId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDeletionRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "completed" as const,
                webhookStatus: "delivered" as const,
              }
            : req,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm deletion",
      );
      throw err;
    }
  };

  // Load initial data when API key is set
  useEffect(() => {
    if (apiKey) {
      refreshStats();
      refreshDeletionRequests();
    }
  }, [apiKey]);

  return (
    <CompanyContext.Provider
      value={{
        apiKey,
        setApiKey,
        companyName,
        setCompanyName,
        stats,
        deletionRequests,
        loading,
        error,
        refreshStats,
        refreshDeletionRequests,
        confirmDeletion,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
