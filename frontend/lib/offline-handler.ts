/**
 * Offline Handler
 * Manages offline mode with cached blockchain data
 */

import { EnhancedDataLocation } from "./blockchain-data-service";

const CACHE_KEY_PREFIX = "oblivion_cache_";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class OfflineHandler {
  private static isOnline =
    typeof navigator !== "undefined" ? navigator.onLine : true;

  /**
   * Initialize offline detection
   */
  static initialize() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      console.log("Connection restored");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("Connection lost - switching to offline mode");
    });
  }

  /**
   * Check if online
   */
  static checkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Cache data in localStorage
   */
  static cacheData<T>(
    key: string,
    data: T,
    expiryMs: number = CACHE_EXPIRY_MS,
  ): void {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryMs,
      };

      localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cached));
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  }

  /**
   * Get cached data from localStorage
   */
  static getCachedData<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);

      // Check if expired
      if (Date.now() > cached.expiresAt) {
        this.clearCache(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error("Failed to get cached data:", error);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  static clearCache(key: string): void {
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear all caches:", error);
    }
  }

  /**
   * Fetch with offline fallback
   */
  static async fetchWithFallback<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: {
      useCache?: boolean;
      cacheExpiry?: number;
    } = {},
  ): Promise<{ data: T; fromCache: boolean }> {
    const { useCache = true, cacheExpiry = CACHE_EXPIRY_MS } = options;

    // If offline, return cached data
    if (!this.isOnline && useCache) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        return { data: cached, fromCache: true };
      }
      throw new Error("No cached data available in offline mode");
    }

    try {
      // Try to fetch fresh data
      const data = await fetchFn();

      // Cache the result
      if (useCache) {
        this.cacheData(cacheKey, data, cacheExpiry);
      }

      return { data, fromCache: false };
    } catch (error) {
      // If fetch fails and we have cache, use it
      if (useCache) {
        const cached = this.getCachedData<T>(cacheKey);
        if (cached) {
          console.warn("Using cached data due to fetch error");
          return { data: cached, fromCache: true };
        }
      }

      throw error;
    }
  }

  /**
   * Cache blockchain data locations
   */
  static cacheDataLocations(
    userDID: string,
    locations: EnhancedDataLocation[],
  ): void {
    this.cacheData(`data_locations_${userDID}`, locations);
  }

  /**
   * Get cached blockchain data locations
   */
  static getCachedDataLocations(
    userDID: string,
  ): EnhancedDataLocation[] | null {
    return this.getCachedData<EnhancedDataLocation[]>(
      `data_locations_${userDID}`,
    );
  }

  /**
   * Queue operation for when online
   */
  static queueOperation(operation: {
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }): void {
    try {
      const queue = this.getOperationQueue();
      queue.push(operation);
      localStorage.setItem(
        `${CACHE_KEY_PREFIX}operation_queue`,
        JSON.stringify(queue),
      );
    } catch (error) {
      console.error("Failed to queue operation:", error);
    }
  }

  /**
   * Get queued operations
   */
  static getOperationQueue(): Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }> {
    try {
      const item = localStorage.getItem(`${CACHE_KEY_PREFIX}operation_queue`);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Failed to get operation queue:", error);
      return [];
    }
  }

  /**
   * Process queued operations
   */
  static async processQueue(
    handler: (operation: any) => Promise<void>,
  ): Promise<void> {
    const queue = this.getOperationQueue();

    for (const operation of queue) {
      try {
        await handler(operation);
        // Remove from queue after successful processing
        this.removeFromQueue(operation.id);
      } catch (error) {
        console.error("Failed to process queued operation:", operation, error);
      }
    }
  }

  /**
   * Remove operation from queue
   */
  static removeFromQueue(operationId: string): void {
    try {
      const queue = this.getOperationQueue();
      const filtered = queue.filter((op) => op.id !== operationId);
      localStorage.setItem(
        `${CACHE_KEY_PREFIX}operation_queue`,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Failed to remove from queue:", error);
    }
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  OfflineHandler.initialize();
}
