"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";

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
  logout: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [companyName, setCompanyNameState] = useState<string | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedApiKey = localStorage.getItem("oblivion_api_key");
    const storedCompanyName = localStorage.getItem("oblivion_company_name");

    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }
    if (storedCompanyName) {
      setCompanyNameState(storedCompanyName);
    }
  }, []);

  // Wrapper to also save to localStorage
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("oblivion_api_key", key);
    }
  };

  const setCompanyName = (name: string) => {
    setCompanyNameState(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("oblivion_company_name", name);
    }
  };

  // Fetch real stats from backend
  const refreshStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call real API endpoint
      const stats = await apiClient.getCompanyStats(apiKey || undefined);

      setStats({
        totalUsers: stats.totalUsers || 0,
        activeRecords: stats.activeRecords || 0,
        deletedRecords: stats.deletedRecords || 0,
        pendingDeletions: stats.pendingDeletions || 0,
        avgDeletionTime: stats.avgDeletionTime || 0,
        complianceScore: stats.complianceScore || 0,
      });
    } catch (err) {
      console.error("Failed to fetch company stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");

      // Set fallback stats so UI doesn't break
      setStats({
        totalUsers: 0,
        activeRecords: 0,
        deletedRecords: 0,
        pendingDeletions: 0,
        avgDeletionTime: 0,
        complianceScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDeletionRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call real API endpoint
      const requests = await apiClient.getCompanyDeletionRequests(
        apiKey || undefined,
      );

      setDeletionRequests(requests);
    } catch (err) {
      console.error("Failed to fetch deletion requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch deletion requests",
      );
      // Set empty array on error
      setDeletionRequests([]);
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

  const logout = () => {
    setApiKeyState(null);
    setCompanyNameState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("oblivion_api_key");
      localStorage.removeItem("oblivion_company_name");
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
        logout,
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
