/**
 * Hook for monitoring blockchain transactions
 */

import { useState, useEffect, useCallback } from "react";
import {
  Transaction,
  TransactionStatus,
} from "@/components/blockchain/TransactionMonitor";

export function useTransactionMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...tx,
      id: `${tx.txHash}-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx.id;
  }, []);

  const updateTransaction = useCallback(
    (txHash: string, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.txHash === txHash ? { ...tx, ...updates } : tx)),
      );
    },
    [],
  );

  const removeTransaction = useCallback((txHash: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.txHash !== txHash));
  }, []);

  const pollTransactionStatus = useCallback(
    async (txHash: string) => {
      try {
        const response = await fetch("/api/check-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txHash }),
        });

        if (response.ok) {
          const { status, confirmations, blockNumber } = await response.json();

          updateTransaction(txHash, {
            status: status as TransactionStatus,
            confirmations,
          });

          return status;
        }
      } catch (error) {
        console.error("Failed to poll transaction status:", error);
      }
      return null;
    },
    [updateTransaction],
  );

  const monitorTransaction = useCallback(
    async (
      txHash: string,
      type: "commitment" | "deletion",
      requiredConfirmations: number = 6,
    ) => {
      // Add transaction to monitor
      const txId = addTransaction({
        txHash,
        type,
        status: "pending",
        confirmations: 0,
        requiredConfirmations,
        timestamp: Date.now(),
        estimatedTime: 60000, // 1 minute estimate
      });

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        const status = await pollTransactionStatus(txHash);

        if (status === "confirmed" || status === "failed") {
          clearInterval(pollInterval);
        }
      }, 5000); // Poll every 5 seconds

      return txId;
    },
    [addTransaction, pollTransactionStatus],
  );

  const retryTransaction = useCallback(
    async (txHash: string) => {
      updateTransaction(txHash, {
        status: "pending",
        error: undefined,
      });

      // Resubmit transaction
      try {
        const response = await fetch("/api/retry-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txHash }),
        });

        if (response.ok) {
          const { newTxHash } = await response.json();
          // Monitor the new transaction
          const tx = transactions.find((t) => t.txHash === txHash);
          if (tx) {
            removeTransaction(txHash);
            monitorTransaction(newTxHash, tx.type, tx.requiredConfirmations);
          }
        }
      } catch (error) {
        console.error("Failed to retry transaction:", error);
        updateTransaction(txHash, {
          status: "failed",
          error: "Retry failed",
        });
      }
    },
    [transactions, updateTransaction, removeTransaction, monitorTransaction],
  );

  const fetchPendingTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/transactions/pending");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch pending transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTransactions();
  }, [fetchPendingTransactions]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    removeTransaction,
    monitorTransaction,
    retryTransaction,
    pollTransactionStatus,
    refresh: fetchPendingTransactions,
  };
}
