import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Configuration options for the Oblivion SDK
 */
export interface SDKConfig {
  /** API key for authentication with Oblivion backend */
  apiKey: string;
  /** Name of the service/company using the SDK */
  serviceName: string;
  /** Base URL for the Oblivion API (defaults to localhost:3000) */
  apiUrl?: string;
  /** Maximum number of retry attempts for failed requests */
  maxRetries?: number;
  /** Timeout in milliseconds for API requests */
  timeout?: number;
}

/**
 * User data to be registered with the Oblivion Protocol
 */
export interface UserData {
  /** User's decentralized identifier */
  userDID: string;
  /** The actual user data to be stored */
  data: Record<string, any>;
  /** Type/category of the data (e.g., 'profile', 'transactions') */
  dataType: string;
}

/**
 * Response from registering user data
 */
export interface RegisterDataResponse {
  /** SHA-256 hash of the encrypted data commitment */
  commitmentHash: string;
  /** Blockchain transaction hash */
  blockchainTx: string;
  /** Success status */
  success: boolean;
}

/**
 * Response from handling deletion
 */
export interface DeletionResponse {
  /** Number of data records deleted */
  deletedCount: number;
  /** Array of blockchain proof transaction hashes */
  blockchainProofs: string[];
  /** Success status */
  success: boolean;
}

/**
 * Response from getting user data
 */
export interface GetUserDataResponse {
  /** Array of user data records */
  data: Array<{
    commitmentHash: string;
    dataType: string;
    createdAt: string;
    deleted: boolean;
    deletionProofHash?: string;
  }>;
  /** Success status */
  success: boolean;
}

/**
 * Error response from the API
 */
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Oblivion SDK for GDPR compliance
 *
 * This SDK provides a simple interface for companies to integrate with the Oblivion Protocol,
 * enabling automatic GDPR compliance with minimal code changes.
 *
 * @example
 * ```typescript
 * const sdk = new OblivionSDK({
 *   apiKey: 'your-api-key',
 *   serviceName: 'MyCompany'
 * });
 *
 * // Register user data
 * const result = await sdk.registerUserData(
 *   'did:midnight:user_123',
 *   { name: 'John Doe', email: 'john@example.com' },
 *   'profile'
 * );
 *
 * // Handle deletion request
 * const deletion = await sdk.handleDeletion('did:midnight:user_123');
 * ```
 */
export class OblivionSDK {
  private client: AxiosInstance;
  private config: Required<SDKConfig>;

  /**
   * Initialize the Oblivion SDK
   *
   * @param config - Configuration options for the SDK
   */
  constructor(config: SDKConfig) {
    this.config = {
      apiUrl: "http://localhost:3000",
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Service-Name": this.config.serviceName,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => this.handleError(error),
    );
  }

  /**
   * Register user data with the Oblivion Protocol
   *
   * This method automatically encrypts the user data, stores it off-chain,
   * and registers a commitment hash on the Midnight blockchain.
   *
   * @param userDID - User's decentralized identifier
   * @param data - User data to be registered
   * @param dataType - Type/category of the data
   * @returns Promise resolving to registration response
   *
   * @example
   * ```typescript
   * const result = await sdk.registerUserData(
   *   'did:midnight:user_123',
   *   { name: 'John Doe', email: 'john@example.com' },
   *   'profile'
   * );
   * console.log('Commitment hash:', result.commitmentHash);
   * ```
   */
  async registerUserData(
    userDID: string,
    data: Record<string, any>,
    dataType: string,
  ): Promise<RegisterDataResponse> {
    const payload: UserData = {
      userDID,
      data,
      dataType,
    };

    return this.retryRequest(async () => {
      const response = await this.client.post("/api/register-data", payload);
      return response.data;
    });
  }

  /**
   * Handle complete deletion flow for a user
   *
   * This method initiates the deletion of all user data from off-chain storage,
   * generates zero-knowledge deletion proofs, and records them on the blockchain.
   *
   * @param userDID - User's decentralized identifier
   * @returns Promise resolving to deletion response
   *
   * @example
   * ```typescript
   * const result = await sdk.handleDeletion('did:midnight:user_123');
   * console.log(`Deleted ${result.deletedCount} records`);
   * console.log('Blockchain proofs:', result.blockchainProofs);
   * ```
   */
  async handleDeletion(userDID: string): Promise<DeletionResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.delete(
        `/api/user/${encodeURIComponent(userDID)}/delete-all`,
      );
      return response.data;
    });
  }

  /**
   * Get user data for Right to Access compliance
   *
   * This method retrieves all data records for a user, supporting GDPR Article 15
   * (Right of Access) requirements.
   *
   * @param userDID - User's decentralized identifier
   * @returns Promise resolving to user data response
   *
   * @example
   * ```typescript
   * const result = await sdk.getUserData('did:midnight:user_123');
   * console.log('User has', result.data.length, 'data records');
   * ```
   */
  async getUserData(userDID: string): Promise<GetUserDataResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.get(
        `/api/user/${encodeURIComponent(userDID)}/footprint`,
      );
      return response.data;
    });
  }

  /**
   * Check if the Oblivion API is healthy
   *
   * @returns Promise resolving to health status
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get("/api/health");
    return response.data;
  }

  /**
   * Retry mechanism for network requests
   *
   * @private
   * @param operation - The operation to retry
   * @returns Promise resolving to the operation result
   */
  private async retryRequest<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (
          error instanceof AxiosError &&
          error.response?.status &&
          error.response.status < 500
        ) {
          throw error;
        }

        if (attempt === this.config.maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt - 1) * 1000;
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Handle API errors with proper error formatting
   *
   * @private
   * @param error - Axios error object
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      const apiError: APIError = {
        error: responseData?.error || "API Error",
        message: responseData?.message || error.message,
        statusCode: error.response.status,
      };
      throw new Error(
        `Oblivion API Error (${apiError.statusCode}): ${apiError.message}`,
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "Oblivion API Error: No response received. Please check your network connection.",
      );
    } else {
      // Something else happened
      throw new Error(`Oblivion SDK Error: ${error.message}`);
    }
  }

  /**
   * Sleep utility for retry delays
   *
   * @private
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Default export
export default OblivionSDK;
