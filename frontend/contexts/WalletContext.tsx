"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  wallet: Window["midnight"] | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });
  const [wallet, setWallet] = useState<Window["midnight"] | null>(null);

  useEffect(() => {
    // Check if Midnight wallet is available
    if (typeof window !== "undefined" && window.midnight) {
      // Lace wallet exposes the API through mnLace property
      const midnightApi = (window.midnight as any).mnLace || window.midnight;
      setWallet(midnightApi);
      console.log("Midnight API loaded:", midnightApi);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!wallet) {
      setState((prev) => ({
        ...prev,
        error:
          "Lace wallet not detected. Please install the Lace wallet extension from lace.io",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Call enable() which prompts the Lace wallet to connect
      // This returns the API object with wallet state
      const api = await wallet.enable();

      if (!api) {
        throw new Error("User rejected wallet connection");
      }

      // The API object contains the wallet state
      // Get the wallet address from the state
      const walletState = api.state;
      let address: string | null = null;

      if (walletState) {
        // Try to get address from balances
        if (walletState.balances && walletState.balances.length > 0) {
          address = walletState.balances[0].address;
        }
        // Or directly from address property
        else if (walletState.address) {
          address = walletState.address;
        }
      }

      // If we still don't have an address, try calling state as a function
      if (!address && typeof api.state === "function") {
        const state = await api.state();
        address = state?.balances?.[0]?.address || state?.address || null;
      }

      if (address) {
        setState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
        });
      } else {
        throw new Error(
          "Failed to retrieve wallet address from connected wallet",
        );
      }
    } catch (error) {
      let errorMessage = "Failed to connect wallet";

      if (error instanceof Error) {
        if (
          error.message.includes("rejected") ||
          error.message.includes("denied") ||
          error.message.includes("User rejected")
        ) {
          errorMessage =
            "You rejected the wallet connection. Please try again and approve the connection.";
        } else {
          errorMessage = error.message;
        }
      }

      console.error("Wallet connection error:", error);

      setState({
        isConnected: false,
        address: null,
        isConnecting: false,
        error: errorMessage,
      });
    }
  }, [wallet]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        wallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
