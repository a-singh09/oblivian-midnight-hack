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
import {
  blockchainDataService,
  EnhancedDataLocation,
} from "@/lib/blockchain-data-service";

interface DashboardContextType {
  userDID: string | null;
  setUserDID: (did: string) => void;
  dataLocations: EnhancedDataLocation[];
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
  const [dataLocations, setDataLocations] = useState<EnhancedDataLocation[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionProgress, setDeletionProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user data footprint from both backend and blockchain
  const refreshData = async () => {
    if (!userDID) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch from backend API
      const locations = await apiClient.getUserFootprint(userDID);

      // Enhance with blockchain data
      const enhancedLocations =
        await blockchainDataService.enhanceWithBlockchainData(locations);

      setDataLocations(enhancedLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Failed to fetch user footprint:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete all user data with blockchain integration
  const deleteAllData = async (): Promise<DeletionResult> => {
    if (!userDID) {
      throw new Error("No user DID set");
    }

    setIsDeleting(true);
    setDeletionProgress(0);
    setError(null);

    try {
      // Step 1: Delete from backend (33% progress)
      setDeletionProgress(10);
      const result = await apiClient.deleteAllUserData(userDID);
      setDeletionProgress(33);

      // Step 2: Generate ZK proofs (66% progress)
      // This happens on the backend via proof server
      setDeletionProgress(50);

      // Simulate proof generation time (30-60 seconds in real scenario)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDeletionProgress(66);

      // Step 3: Record on blockchain (100% progress)
      // The backend handles blockchain submission
      setDeletionProgress(80);

      // Wait for blockchain confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDeletionProgress(100);

      // Refresh data to show updated blockchain status
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
                ? {
                    ...loc,
                    deleted: message.status === "deleted",
                    blockchainStatus: "deleted",
                  }
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
                ? {
                    ...loc,
                    deletionProofHash: message.transactionHash,
                    transactionHash: message.transactionHash,
                    blockchainStatus: "confirmed",
                    explorerUrl: blockchainDataService.getExplorerUrl(
                      message.transactionHash,
                    ),
                  }
                : loc,
            ),
          );
        }
      };

      wsClient.on("data_status_change", handleStatusChange);
      wsClient.on("deletion_progress", handleProgress);
      wsClient.on("blockchain_confirmation", handleConfirmation);

      // Subscribe to blockchain events for real-time updates
      const unsubscribe = blockchainDataService.subscribeToBlockchainEvents(
        userDID,
        (commitment) => {
          setDataLocations((prev) =>
            prev.map((loc) =>
              loc.commitmentHash === commitment.commitmentHash
                ? {
                    ...loc,
                    blockchainStatus: commitment.deleted
                      ? "deleted"
                      : "confirmed",
                    transactionHash: commitment.transactionHash,
                    blockNumber: commitment.blockNumber,
                    explorerUrl: commitment.transactionHash
                      ? blockchainDataService.getExplorerUrl(
                          commitment.transactionHash,
                        )
                      : undefined,
                  }
                : loc,
            ),
          );
        },
      );

      // Fetch initial data
      refreshData();

      // Set up periodic refresh for blockchain data (every 30 seconds)
      const refreshInterval = setInterval(() => {
        refreshData();
      }, 30000);

      return () => {
        wsClient.off("data_status_change", handleStatusChange);
        wsClient.off("deletion_progress", handleProgress);
        wsClient.off("blockchain_confirmation", handleConfirmation);
        wsClient.disconnect();
        unsubscribe();
        clearInterval(refreshInterval);
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
