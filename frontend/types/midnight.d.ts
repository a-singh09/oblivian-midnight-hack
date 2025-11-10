/**
 * Type declarations for Midnight blockchain integration
 * Extends the Window interface to include the Midnight DApp Connector API
 */

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable?: () => Promise<boolean>;
        isEnabled?: () => Promise<boolean>;
        state?: () => Promise<{
          balances?: Array<{
            address: string;
            amount: string;
          }>;
        }>;
        getAddress?: () => Promise<string>;
        getAccounts?: () => Promise<string[]>;
        [key: string]: any;
      };
      enable?: () => Promise<boolean>;
      state?: () => Promise<{
        balances?: Array<{
          address: string;
          amount: string;
        }>;
      }>;
      [key: string]: any;
    };
  }
}

export {};
