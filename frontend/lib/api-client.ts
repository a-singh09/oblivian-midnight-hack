/**
 * API Client for Oblivion Protocol Backend
 * Handles all communication with the Express REST API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface UserData {
  userDID: string;
  data: Record<string, any>;
  dataType: string;
  serviceProvider: string;
}

export interface DataLocation {
  commitmentHash: string;
  userDID: string;
  dataType: string; // Backend sends singular dataType
  serviceProvider: string;
  createdAt: string | Date; // Backend sends Date string
  deleted: boolean;
  deletedAt?: string | Date;
  deletionProofHash?: string;

  // Computed fields for frontend compatibility
  dataCategories?: string[]; // Frontend expects array
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

export interface CompanyStats {
  totalUsers: number;
  activeRecords: number;
  deletedRecords: number;
  pendingDeletions?: number;
  avgDeletionTime?: number;
  complianceScore?: number;
}

export interface WebhookConfig {
  webhookId?: string;
  companyId: string;
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
}

interface FootprintResponse {
  userDID: string;
  dataLocations: DataLocation[];
  blockchainCommitments?: any[];
  totalRecords?: number;
  activeRecords?: number;
  deletedRecords?: number;
  timestamp?: string;
}

export interface CommitDeletionResponse {
  success: boolean;
  certificate?: any;
  proofHash?: string | null;
  transactionHash?: string | null;
  timestamp?: string;
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
    const res = await this.request<FootprintResponse>(
      `/api/user/${userDID}/footprint`,
    );

    // Backend returns an object with `dataLocations` property
    if (res && Array.isArray(res.dataLocations)) {
      // Normalize the data for frontend compatibility
      return res.dataLocations.map((loc) => ({
        ...loc,
        // Ensure dataCategories is an array for frontend components
        dataCategories:
          loc.dataCategories || (loc.dataType ? [loc.dataType] : []),
        // Ensure createdAt is normalized
        createdAt:
          typeof loc.createdAt === "string" || loc.createdAt instanceof Date
            ? loc.createdAt
            : new Date().toISOString(),
      }));
    }

    // Fallback to empty array to avoid runtime errors
    return [];
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
   * Delete a single commitment for a user
   */
  async deleteCommitment(
    userDID: string,
    commitmentHash: string,
  ): Promise<CommitDeletionResponse> {
    return this.request<CommitDeletionResponse>(
      `/api/user/${encodeURIComponent(userDID)}/delete/${encodeURIComponent(
        commitmentHash,
      )}`,
      { method: "POST" },
    );
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

  /**
   * Get company statistics (derived from health check for now)
   */
  async getCompanyStats(companyId?: string): Promise<CompanyStats> {
    try {
      // Try the dedicated company stats endpoint first
      const stats = await this.request<CompanyStats>("/api/company/stats");
      return stats;
    } catch (error) {
      console.error("Failed to fetch company stats:", error);
      // Return empty stats on error
      return {
        totalUsers: 0,
        activeRecords: 0,
        deletedRecords: 0,
      };
    }
  }

  /**
   * Get demo user data for hackathon demo
   */
  async getDemoUserData(): Promise<DataLocation[]> {
    try {
      const demoUserDID = "did:midnight:demo_user_123";
      return await this.getUserFootprint(demoUserDID);
    } catch (error) {
      console.error("Failed to fetch demo user data:", error);
      return [];
    }
  }

  /**
   * Get deletion requests for company dashboard
   */
  async getCompanyDeletionRequests(companyId?: string): Promise<any[]> {
    try {
      const response = await this.request<{ requests: any[] }>(
        "/api/company/deletion-requests",
      );
      return response.requests || [];
    } catch (error) {
      console.error("Failed to fetch deletion requests:", error);
      return [];
    }
  }

  /**
   * Register a webhook for company notifications
   */
  async registerWebhook(config: WebhookConfig): Promise<{ webhookId: string }> {
    return this.request("/api/webhooks", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  /**
   * Get webhooks for a company
   */
  async getCompanyWebhooks(companyId: string): Promise<WebhookConfig[]> {
    const response = await this.request<{ webhooks: any[] }>(
      `/api/webhooks/${companyId}`,
    );
    return response.webhooks || [];
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<WebhookConfig>,
  ): Promise<void> {
    await this.request(`/api/webhooks/${webhookId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request(`/api/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new APIClient();
