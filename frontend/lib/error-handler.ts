/**
 * Error Handler
 * Centralized error handling for blockchain and API operations
 */

export enum ErrorType {
  WALLET_NOT_INSTALLED = "WALLET_NOT_INSTALLED",
  WALLET_CONNECTION_FAILED = "WALLET_CONNECTION_FAILED",
  WALLET_USER_REJECTED = "WALLET_USER_REJECTED",
  BLOCKCHAIN_TRANSACTION_FAILED = "BLOCKCHAIN_TRANSACTION_FAILED",
  PROOF_SERVER_TIMEOUT = "PROOF_SERVER_TIMEOUT",
  PROOF_GENERATION_FAILED = "PROOF_GENERATION_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  originalError?: Error;
}

export class ErrorHandler {
  /**
   * Handle wallet connection errors
   */
  static handleWalletError(error: any): AppError {
    if (!window.midnight) {
      return {
        type: ErrorType.WALLET_NOT_INSTALLED,
        message: "Lace wallet not detected",
        userMessage:
          "Please install the Lace wallet extension to continue. Visit lace.io to download.",
        retryable: false,
      };
    }

    if (
      error.message?.includes("rejected") ||
      error.message?.includes("denied")
    ) {
      return {
        type: ErrorType.WALLET_USER_REJECTED,
        message: "User rejected wallet connection",
        userMessage:
          "You rejected the wallet connection. Please try again and approve the connection.",
        retryable: true,
        originalError: error,
      };
    }

    return {
      type: ErrorType.WALLET_CONNECTION_FAILED,
      message: error.message || "Failed to connect wallet",
      userMessage:
        "Failed to connect to your wallet. Please check your wallet extension and try again.",
      retryable: true,
      originalError: error,
    };
  }

  /**
   * Handle blockchain transaction errors
   */
  static handleTransactionError(error: any): AppError {
    if (error.message?.includes("timeout")) {
      return {
        type: ErrorType.BLOCKCHAIN_TRANSACTION_FAILED,
        message: "Transaction timeout",
        userMessage:
          "The transaction took too long to process. It may still complete. Please check the transaction monitor.",
        retryable: true,
        originalError: error,
      };
    }

    if (error.message?.includes("insufficient")) {
      return {
        type: ErrorType.BLOCKCHAIN_TRANSACTION_FAILED,
        message: "Insufficient funds",
        userMessage:
          "You don't have enough DUST tokens to complete this transaction. Please add funds to your wallet.",
        retryable: false,
        originalError: error,
      };
    }

    return {
      type: ErrorType.BLOCKCHAIN_TRANSACTION_FAILED,
      message: error.message || "Transaction failed",
      userMessage:
        "The blockchain transaction failed. Please try again or contact support if the issue persists.",
      retryable: true,
      originalError: error,
    };
  }

  /**
   * Handle proof server errors
   */
  static handleProofServerError(error: any): AppError {
    if (error.message?.includes("timeout") || error.code === "ETIMEDOUT") {
      return {
        type: ErrorType.PROOF_SERVER_TIMEOUT,
        message: "Proof server timeout",
        userMessage:
          "Proof generation is taking longer than expected (60s+). This is normal for complex proofs. Please wait...",
        retryable: true,
        originalError: error,
      };
    }

    if (error.message?.includes("ECONNREFUSED")) {
      return {
        type: ErrorType.PROOF_GENERATION_FAILED,
        message: "Proof server not available",
        userMessage:
          "The proof server is not available. Please ensure it's running on port 6300.",
        retryable: true,
        originalError: error,
      };
    }

    return {
      type: ErrorType.PROOF_GENERATION_FAILED,
      message: error.message || "Proof generation failed",
      userMessage: "Failed to generate zero-knowledge proof. Please try again.",
      retryable: true,
      originalError: error,
    };
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): AppError {
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: "Network error",
        userMessage:
          "Network connection failed. Please check your internet connection and try again.",
        retryable: true,
        originalError: error,
      };
    }

    return {
      type: ErrorType.API_ERROR,
      message: error.message || "API request failed",
      userMessage: "Failed to communicate with the server. Please try again.",
      retryable: true,
      originalError: error,
    };
  }

  /**
   * Generic error handler
   */
  static handle(error: any, context?: string): AppError {
    console.error(`Error in ${context || "unknown context"}:`, error);

    // Try to categorize the error
    if (error.message?.includes("wallet")) {
      return this.handleWalletError(error);
    }

    if (
      error.message?.includes("transaction") ||
      error.message?.includes("blockchain")
    ) {
      return this.handleTransactionError(error);
    }

    if (error.message?.includes("proof")) {
      return this.handleProofServerError(error);
    }

    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return this.handleNetworkError(error);
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || "Unknown error",
      userMessage:
        "An unexpected error occurred. Please try again or contact support.",
      retryable: true,
      originalError: error,
    };
  }
}

/**
 * Retry logic with exponential backoff
 */
export class RetryHandler {
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
      onRetry?: (attempt: number, error: any) => void;
    } = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
      onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          onRetry?.(attempt, error);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
