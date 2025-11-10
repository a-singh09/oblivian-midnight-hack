/**
 * Hook for interacting with Midnight smart contracts
 */

import { useWallet } from "@/contexts/WalletContext";
import { MidnightContractService } from "@/lib/midnight-contract-service";
import { useMemo } from "react";

export function useMidnightContract() {
  const { wallet, isConnected } = useWallet();

  const contractService = useMemo(() => {
    if (!wallet || !isConnected) {
      return null;
    }
    return new MidnightContractService(wallet);
  }, [wallet, isConnected]);

  return {
    contractService,
    isReady: !!contractService,
  };
}
