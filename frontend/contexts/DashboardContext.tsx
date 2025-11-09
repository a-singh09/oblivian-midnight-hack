"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient, DataLocation, DeletionResult } from "@/lib/api-client";
import { wsClient, WebSocketMessage } from "@/lib/websocket-client";

interface DashboardContextType {
  userDID: string | null;
  setUserDID: (did: string) => void;
  dataLocations: DataLocation[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  deleteAllData: () => Promise<DeletionResult>;
  deletionProgress: number;
  isDeleting: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [userDID, setUserDID] = useState<string | null>(null);
  const [dataLocations, setDataLocations] = useState<DataLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionProgress, setDeletionProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user data footprint
  const refreshData = async () => {
    if (!userDID) return;

    setLoading(true);
    setError(null);

    try {
      const locations = await apiClient.getUserFootprint(userDID);
      setDataLocations(locations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Failed to fetch user footprint:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete all user data
  const deleteAllData = async (): Promise<DeletionResult> => {
    if (!userDID) {
      throw new Error("No user DID set");
    }

    setIsDeleting(true);
    setDeletionProgress(0);
    setError(null);

    try {
      const result = await apiClient.deleteAllUserData(userDID);
      setDeletionProgress(100);
      await refreshData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete data");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Set up WebSocket connection when userDID changes
  useEffect(() => {
    if (userDID) {
      wsClient.connect(userDID);

      // Listen for data status changes
      const handleStatusChange = (message: WebSocketMessage) => {
        if (message.type === "data_status_change") {
          setDataLocations((prev) =>
            prev.map((loc) =>
              loc.commitmentHash === message.commitmentHash
                ? { ...loc, deleted: message.status === "deleted" }
                : loc,
            ),
          );
        }
      };

      // Listen for deletion progress
      const handleProgress = (message: WebSocketMessage) => {
        if (message.type === "deletion_progress") {
          setDeletionProgress(message.progress);
        }
      };

      // Listen for blockchain confirmations
      const handleConfirmation = (message: WebSocketMessage) => {
        if (message.type === "blockchain_confirmation") {
          setDataLocations((prev) =>
            prev.map((loc) =>
              loc.commitmentHash === message.proofHash
                ? { ...loc, deletionProofHash: message.transactionHash }
                : loc,
            ),
          );
        }
      };

      wsClient.on("data_status_change", handleStatusChange);
      wsClient.on("deletion_progress", handleProgress);
      wsClient.on("blockchain_confirmation", handleConfirmation);

      // Fetch initial data
      refreshData();

      return () => {
        wsClient.off("data_status_change", handleStatusChange);
        wsClient.off("deletion_progress", handleProgress);
        wsClient.off("blockchain_confirmation", handleConfirmation);
        wsClient.disconnect();
      };
    }
  }, [userDID]);

  return (
    <DashboardContext.Provider
      value={{
        userDID,
        setUserDID,
        dataLocations,
        loading,
        error,
        refreshData,
        deleteAllData,
        deletionProgress,
        isDeleting,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
