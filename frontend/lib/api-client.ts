/**
 * API Client for Oblivion Protocol Backend
 * Handles all communication with the Express REST API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface UserData {
  userDID: string;
  data: Record<string, any>;
  dataType: string;
  serviceProvider: string;
}

export interface DataLocation {
  commitmentHash: string;
  serviceProvider: string;
  dataCategories: string[];
  createdAt: number;
  deleted: boolean;
  deletionProofHash?: string;
}

export interface DeletionResult {
  deletedCount: number;
  blockchainProofs: string[];
  certificates: DeletionCertificate[];
}

export interface DeletionCertificate {
  userDID: string;
  commitmentHash: string;
  timestamp: number;
  signature: string;
}

export interface HealthStatus {
  status: "ok" | "error";
  timestamp: number;
  services: {
    database: boolean;
    blockchain: boolean;
    proofServer: boolean;
  };
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Get user's data footprint across all services
   */
  async getUserFootprint(userDID: string): Promise<DataLocation[]> {
    return this.request<DataLocation[]>(`/api/user/${userDID}/footprint`);
  }

  /**
   * Delete all user data from all services
   */
  async deleteAllUserData(userDID: string): Promise<DeletionResult> {
    return this.request<DeletionResult>(`/api/user/${userDID}/delete-all`, {
      method: "POST",
    });
  }

  /**
   * Register new user data
   */
  async registerUserData(data: UserData): Promise<{
    commitmentHash: string;
    blockchainTx: string;
  }> {
    return this.request("/api/register-data", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/api/health");
  }
}

export const apiClient = new APIClient();
