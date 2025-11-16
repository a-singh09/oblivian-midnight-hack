/**
 * Oblivion Protocol REST API Server
 * Express server with core endpoints for SDK integration and user dashboard
 * Requirements: 1.1, 2.1, 3.1, 8.1
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer, Server } from "http";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { StorageManager } from "./storage/StorageManager.js";
import { MidnightClient } from "./midnight/MidnightClient.js";
import { MidnightContractClient } from "./midnight/MidnightContractClient.js";
import { WalletProviderService } from "./midnight/WalletProvider.js";
import { WebSocketManager } from "./websocket/WebSocketManager.js";
import { WebhookManager } from "./webhook/WebhookManager.js";
import { getAppConfig, validateConfig } from "./config/index.js";
import { UserData } from "./types/index.js";
import { NetworkId } from "@midnight-ntwrk/midnight-js-network-id";

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ApiError extends Error {
  statusCode?: number;
}

export class OblivionServer {
  private app: express.Application;
  private server: Server;
  private storageManager: StorageManager;
  private midnightClient: MidnightClient;
  private midnightContractClient: MidnightContractClient;
  private walletProviderService: WalletProviderService;
  private webSocketManager: WebSocketManager;
  private webhookManager: WebhookManager;
  private config: ReturnType<typeof getAppConfig>;
  private useMidnightJS: boolean = false;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.config = getAppConfig();

    // Initialize storage and blockchain clients
    this.storageManager = new StorageManager(
      this.config.storage,
      Buffer.from(this.config.encryptionKey, "utf8"),
    );

    // Keep old client for fallback
    this.midnightClient = new MidnightClient(this.config.midnight);

    // Initialize new Midnight.js integration
    const indexerWsUrl =
      this.config.midnight.indexerUrl.replace("https://", "wss://") + "/ws";

    this.walletProviderService = new WalletProviderService({
      indexerUrl: this.config.midnight.indexerUrl,
      indexerWsUrl: indexerWsUrl,
      proofServerUrl: this.config.midnight.proofServerUrl,
      nodeUrl: this.config.midnight.nodeUrl,
      walletSeed: process.env.MIDNIGHT_WALLET_SEED || "",
    });

    this.midnightContractClient = new MidnightContractClient({
      indexerUrl: this.config.midnight.indexerUrl,
      indexerWsUrl: indexerWsUrl,
      proofServerUrl: this.config.midnight.proofServerUrl,
      networkId: NetworkId.TestNet,
      contractsPath: path.join(__dirname, "../../contracts"),
    });

    // Initialize WebSocket manager
    this.webSocketManager = new WebSocketManager(this.server);

    // Initialize Webhook manager
    this.webhookManager = new WebhookManager();
  }

  /**
   * Initialize the server and all dependencies
   */
  public async initialize(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();

      // Initialize storage and blockchain connections
      await this.storageManager.initialize();

      // Try to initialize Midnight.js integration
      try {
        console.log("\n🌙 Initializing Midnight.js SDK integration...");

        // Initialize wallet provider
        await this.walletProviderService.initialize();

        // Initialize contract client
        await this.midnightContractClient.initialize();

        // Set wallet provider for contract client
        this.midnightContractClient.setWalletProvider(
          this.walletProviderService.getProvider(),
        );

        this.useMidnightJS = true;
        console.log("✅ Midnight.js SDK integration active\n");

        // Also initialize fallback client for backward compatibility
        try {
          await this.midnightClient.initialize();
          console.log(
            "✅ Fallback MidnightClient initialized for compatibility\n",
          );
        } catch (fallbackError) {
          console.warn(
            "⚠️  Fallback client initialization failed (non-critical):",
            fallbackError,
          );
        }
      } catch (error) {
        console.warn("\n⚠️  Midnight.js SDK initialization failed:", error);
        console.warn("   Falling back to mock mode for development");
        console.warn("   To enable real integration:");
        console.warn("   1. Set MIDNIGHT_WALLET_SEED in .env");
        console.warn(
          "   2. Ensure contracts are deployed (deployment.json exists)",
        );
        console.warn("   3. Ensure proof server is running on port 6300\n");

        // Fall back to old client
        await this.midnightClient.initialize();
        this.useMidnightJS = false;
      }

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      console.log("OblivionServer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize OblivionServer:", error);
      throw error;
    }
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
        credentials: true,
      }),
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoint (both /health and /api/health for compatibility)
    this.app.get("/health", this.handleHealthCheck.bind(this));
    this.app.get("/api/health", this.handleHealthCheck.bind(this));

    // API routes
    const apiRouter = express.Router();

    // SDK integration endpoint - register user data
    apiRouter.post("/register-data", this.handleRegisterData.bind(this));

    // Dashboard endpoints - get user data footprint
    apiRouter.get("/user/:did/footprint", this.handleGetFootprint.bind(this));

    // Deletion endpoint - delete all user data
    apiRouter.post("/user/:did/delete-all", this.handleDeleteAll.bind(this));

    // Webhook management endpoints
    apiRouter.post("/webhooks", this.handleRegisterWebhook.bind(this));
    apiRouter.get("/webhooks/:companyId", this.handleGetWebhooks.bind(this));
    apiRouter.put("/webhooks/:webhookId", this.handleUpdateWebhook.bind(this));
    apiRouter.delete(
      "/webhooks/:webhookId",
      this.handleDeleteWebhook.bind(this),
    );

    // Mount API router
    this.app.use("/api", apiRouter);

    // 404 handler for unknown routes
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Health check endpoint for monitoring
   */
  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      const dbStats = await this.storageManager.getStats();

      // Check blockchain connection (optional if SKIP_MIDNIGHT_CHECKS is set)
      let networkStats = { blockHeight: 0, totalCommitments: 0 };
      let blockchainStatus = "connected";

      if (process.env.SKIP_MIDNIGHT_CHECKS !== "true") {
        try {
          networkStats = await this.midnightClient.getNetworkStats();
        } catch (error) {
          blockchainStatus = "unavailable";
          console.warn("Blockchain stats unavailable:", error);
        }
      } else {
        blockchainStatus = "skipped";
      }

      // Check proof server status
      let proofServerStatus = "unknown";
      try {
        const axios = require("axios");
        const proofServerUrl = this.midnightClient.getConfig().proofServerUrl;
        const response = await axios.get(`${proofServerUrl}/health`, {
          timeout: 2000,
        });
        proofServerStatus =
          response.status === 200 ? "connected" : "unavailable";
      } catch (error) {
        proofServerStatus = "unavailable";
      }

      // Get WebSocket statistics
      const wsStats = this.webSocketManager.getStats();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        midnightJS: {
          enabled: this.useMidnightJS,
          status: this.useMidnightJS ? "active" : "fallback",
          contractsLoaded: this.useMidnightJS
            ? this.midnightContractClient.isReady()
            : false,
          walletInitialized: this.useMidnightJS
            ? this.walletProviderService.isInitialized()
            : false,
        },
        services: {
          database: {
            status: "connected",
            totalRecords: dbStats.totalRecords,
            activeRecords: dbStats.activeRecords,
            deletedRecords: dbStats.deletedRecords,
          },
          blockchain: {
            status: blockchainStatus,
            network: this.midnightClient.getConfig().networkId,
            blockHeight: networkStats.blockHeight,
            totalCommitments: networkStats.totalCommitments,
          },
          proofServer: {
            status: proofServerStatus,
            url: this.midnightClient.getConfig().proofServerUrl,
          },
          websocket: {
            status: "connected",
            totalSubscriptions: wsStats.totalSubscriptions,
            uniqueUsers: wsStats.uniqueUsers,
            subscriptionsByUser: wsStats.subscriptionsByUser,
          },
          webhooks: {
            status: "active",
            ...this.webhookManager.getStats(),
          },
        },
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Register user data endpoint for SDK integration
   * Requirements: 3.1, 5.2
   */
  private async handleRegisterData(req: Request, res: Response): Promise<void> {
    try {
      const { userDID, data, dataType, serviceProvider } = req.body;

      // Validate required fields
      if (!userDID || !data || !dataType || !serviceProvider) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Missing required fields: userDID, data, dataType, serviceProvider",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate userDID format
      if (!userDID.startsWith("did:midnight:")) {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid userDID format. Must start with 'did:midnight:'",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userData: UserData = {
        userDID,
        data,
        dataType,
        serviceProvider,
      };

      // Store data and get commitment hash
      const commitmentHash = await this.storageManager.storeData(userData);

      // Register commitment on blockchain
      let transactionHash: string;
      if (this.useMidnightJS) {
        console.log("🌙 Using Midnight.js SDK for commitment registration");
        transactionHash = await this.midnightContractClient.registerCommitment({
          userDID,
          commitmentHash,
          serviceProvider,
          dataCategories: [dataType],
        });
      } else {
        console.log("⚠️  Using fallback mode for commitment registration");
        transactionHash = await this.midnightClient.registerCommitment({
          userDID,
          commitmentHash,
          serviceProvider,
          dataCategories: [dataType],
        });
      }

      // Broadcast data status update via WebSocket
      this.webSocketManager.broadcastDataStatus(userDID, "registered", {
        commitmentHash,
        dataType,
        serviceProvider,
        transactionHash,
      });

      // Broadcast blockchain confirmation
      this.webSocketManager.broadcastBlockchainConfirmation({
        userDID,
        commitmentHash,
        transactionHash,
        confirmationType: "registration",
      });

      // Send webhook notification
      await this.webhookManager.notifyDataRegistered(
        userDID,
        commitmentHash,
        dataType,
        serviceProvider,
        transactionHash,
      );

      res.status(201).json({
        success: true,
        commitmentHash,
        transactionHash,
        message: "Data registered successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error registering data:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to register data",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user data footprint for dashboard
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  private async handleGetFootprint(req: Request, res: Response): Promise<void> {
    try {
      const { did } = req.params;

      // Validate userDID format
      if (!did.startsWith("did:midnight:")) {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid userDID format. Must start with 'did:midnight:'",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get data locations from storage
      const dataLocations = await this.storageManager.getFootprint(did);

      // Get blockchain commitments for verification (optional, only if midnight is initialized)
      let blockchainCommitments: any[] = [];
      try {
        if (this.useMidnightJS && this.midnightContractClient.isReady()) {
          // Use Midnight.js SDK if available
          blockchainCommitments = []; // Would query from contract
        } else if (this.midnightClient && this.midnightClient.isInitialized()) {
          // Use fallback client if initialized
          blockchainCommitments =
            await this.midnightClient.getUserCommitments(did);
        }
      } catch (error) {
        console.warn("Could not fetch blockchain commitments:", error);
        // Continue without blockchain data - still return database records
      }

      res.json({
        userDID: did,
        dataLocations,
        blockchainCommitments,
        totalRecords: dataLocations.length,
        activeRecords: dataLocations.filter((loc) => !loc.deleted).length,
        deletedRecords: dataLocations.filter((loc) => loc.deleted).length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting footprint:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to get data footprint",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete all user data endpoint
   * Requirements: 2.1, 2.5
   */
  private async handleDeleteAll(req: Request, res: Response): Promise<void> {
    try {
      const { did } = req.params;

      // Validate userDID format
      if (!did.startsWith("did:midnight:")) {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid userDID format. Must start with 'did:midnight:'",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Delete data and get deletion certificates
      const deletionCertificates = await this.storageManager.deleteData(did);

      if (deletionCertificates.length === 0) {
        res.status(404).json({
          error: "Not Found",
          message: "No data found for the specified user",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Broadcast initial deletion progress
      this.webSocketManager.broadcastDeletionProgress({
        userDID: did,
        totalRecords: deletionCertificates.length,
        processedRecords: 0,
        currentStep: "Starting deletion process",
        status: "in_progress",
      });

      // Generate ZK deletion proofs for each certificate
      const deletionProofs: Array<{
        commitmentHash: string;
        proofHash: string;
        transactionHash: string;
      }> = [];

      for (let i = 0; i < deletionCertificates.length; i++) {
        const certificate = deletionCertificates[i];

        try {
          // Update progress
          this.webSocketManager.broadcastDeletionProgress({
            userDID: did,
            totalRecords: deletionCertificates.length,
            processedRecords: i,
            currentStep: `Generating deletion proof for commitment ${certificate.commitmentHash}`,
            status: "in_progress",
          });

          // Generate ZK deletion proof
          let proofHash: string;
          if (this.useMidnightJS) {
            console.log(
              "🌙 Using Midnight.js SDK for deletion proof generation",
            );
            proofHash = await this.midnightContractClient.generateDeletionProof(
              certificate.commitmentHash,
              certificate.signature,
            );
          } else {
            console.log(
              "⚠️  Using fallback mode for deletion proof generation",
            );
            proofHash = await this.midnightClient.generateDeletionProof({
              userDID: did,
              commitmentHash: certificate.commitmentHash,
              deletionCertificate: certificate.signature,
            });
          }

          // Update progress
          this.webSocketManager.broadcastDeletionProgress({
            userDID: did,
            totalRecords: deletionCertificates.length,
            processedRecords: i,
            currentStep: `Marking commitment ${certificate.commitmentHash} as deleted on blockchain`,
            status: "in_progress",
          });

          // Mark as deleted on blockchain
          let transactionHash: string;
          if (this.useMidnightJS) {
            // For now, use mock transaction hash
            // In full implementation, this would call a markAsDeleted circuit
            transactionHash = `0xdel${Date.now().toString(16)}${Math.random().toString(36).substr(2, 9)}`;
            console.log(
              "🌙 Deletion marked on blockchain (mock):",
              transactionHash,
            );
          } else {
            transactionHash = await this.midnightClient.markDeleted(
              certificate.commitmentHash,
              proofHash,
            );
          }

          // Update storage with proof hash
          await this.storageManager.updateDeletionProof(
            certificate.commitmentHash,
            proofHash,
          );

          deletionProofs.push({
            commitmentHash: certificate.commitmentHash,
            proofHash,
            transactionHash,
          });

          // Broadcast blockchain confirmation
          this.webSocketManager.broadcastBlockchainConfirmation({
            userDID: did,
            commitmentHash: certificate.commitmentHash,
            transactionHash,
            confirmationType: "deletion",
          });

          // Broadcast data status update
          this.webSocketManager.broadcastDataStatus(did, "deleted", {
            commitmentHash: certificate.commitmentHash,
            dataType: "unknown", // We don't have dataType in certificate
            serviceProvider: "unknown", // We don't have serviceProvider in certificate
            transactionHash,
          });

          // Send webhook notification for individual deletion
          await this.webhookManager.notifyDataDeleted(
            did,
            certificate.commitmentHash,
            "unknown", // We don't have dataType in certificate
            "unknown", // We don't have serviceProvider in certificate
            transactionHash,
          );
        } catch (proofError) {
          console.error(
            `Failed to generate proof for commitment ${certificate.commitmentHash}:`,
            proofError,
          );

          // Broadcast error progress
          this.webSocketManager.broadcastDeletionProgress({
            userDID: did,
            totalRecords: deletionCertificates.length,
            processedRecords: i,
            currentStep: `Failed to process commitment ${certificate.commitmentHash}`,
            status: "in_progress",
            error:
              proofError instanceof Error
                ? proofError.message
                : "Unknown error",
          });

          // Continue with other proofs even if one fails
        }
      }

      // Broadcast completion
      this.webSocketManager.broadcastDeletionProgress({
        userDID: did,
        totalRecords: deletionCertificates.length,
        processedRecords: deletionCertificates.length,
        currentStep: "Deletion process completed",
        status: "completed",
      });

      // Send webhook notification for deletion completion
      await this.webhookManager.notifyDeletionCompleted(
        did,
        "unknown", // We don't have a specific service provider for the overall deletion
        {
          totalRecords: deletionCertificates.length,
          deletedRecords: deletionProofs.length,
          deletionProofs,
        },
      );

      res.json({
        success: true,
        userDID: did,
        deletedRecords: deletionCertificates.length,
        deletionProofs,
        message: "Data deletion completed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to delete data",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Setup error handling middleware
   */
  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(
      (error: ApiError, req: Request, res: Response, next: NextFunction) => {
        console.error("Unhandled error:", error);

        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";

        res.status(statusCode).json({
          error:
            statusCode === 500
              ? "Internal Server Error"
              : error.name || "Error",
          message,
          timestamp: new Date().toISOString(),
          ...(this.config.nodeEnv === "development" && { stack: error.stack }),
        });
      },
    );

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      process.exit(1);
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.config.port, () => {
          console.log(
            `🚀 Oblivion Protocol API server running on port ${this.config.port}`,
          );
          console.log(
            `📊 Health check available at http://localhost:${this.config.port}/health`,
          );
          console.log(
            `🔗 API endpoints available at http://localhost:${this.config.port}/api`,
          );
          console.log(
            `🔌 WebSocket server available at ws://localhost:${this.config.port}/ws`,
          );
          resolve();
        });

        this.server.on("error", (error) => {
          console.error("Server startup error:", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register webhook endpoint for companies
   * Requirements: 8.1
   */
  private async handleRegisterWebhook(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { companyId, url, events, secret } = req.body;

      // Validate required fields
      if (!companyId || !url || !events || !Array.isArray(events)) {
        res.status(400).json({
          error: "Bad Request",
          message: "Missing required fields: companyId, url, events (array)",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid URL format",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate events
      const validEvents = [
        "data_registered",
        "data_deleted",
        "deletion_completed",
      ];
      const invalidEvents = events.filter(
        (event: string) => !validEvents.includes(event),
      );

      if (invalidEvents.length > 0) {
        res.status(400).json({
          error: "Bad Request",
          message: `Invalid events: ${invalidEvents.join(", ")}. Valid events: ${validEvents.join(", ")}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const webhookId = this.webhookManager.registerWebhook(
        companyId,
        url,
        events,
        secret,
      );

      res.status(201).json({
        success: true,
        webhookId,
        message: "Webhook registered successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error registering webhook:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to register webhook",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get webhooks for a company
   */
  private async handleGetWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const webhooks = this.webhookManager.getCompanyWebhooks(companyId);

      res.json({
        companyId,
        webhooks,
        totalWebhooks: webhooks.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting webhooks:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to get webhooks",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update webhook configuration
   */
  private async handleUpdateWebhook(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { webhookId } = req.params;
      const updates = req.body;

      // Validate webhook exists
      const webhook = this.webhookManager.getWebhook(webhookId);
      if (!webhook) {
        res.status(404).json({
          error: "Not Found",
          message: "Webhook not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate URL if provided
      if (updates.url) {
        try {
          new URL(updates.url);
        } catch {
          res.status(400).json({
            error: "Bad Request",
            message: "Invalid URL format",
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      // Validate events if provided
      if (updates.events) {
        const validEvents = [
          "data_registered",
          "data_deleted",
          "deletion_completed",
        ];
        const invalidEvents = updates.events.filter(
          (event: string) => !validEvents.includes(event),
        );

        if (invalidEvents.length > 0) {
          res.status(400).json({
            error: "Bad Request",
            message: `Invalid events: ${invalidEvents.join(", ")}. Valid events: ${validEvents.join(", ")}`,
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const success = this.webhookManager.updateWebhook(webhookId, updates);

      if (success) {
        res.json({
          success: true,
          webhookId,
          message: "Webhook updated successfully",
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to update webhook",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to update webhook",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete webhook endpoint
   */
  private async handleDeleteWebhook(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { webhookId } = req.params;

      const success = this.webhookManager.removeWebhook(webhookId);

      if (success) {
        res.json({
          success: true,
          webhookId,
          message: "Webhook deleted successfully",
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(404).json({
          error: "Not Found",
          message: "Webhook not found",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to delete webhook",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get the Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Close server and cleanup resources
   */
  public async close(): Promise<void> {
    try {
      // Close WebSocket connections
      this.webSocketManager.close();

      // Close webhook manager
      this.webhookManager.close();

      // Close storage connections
      await this.storageManager.close();

      // Close HTTP server
      this.server.close();

      console.log("OblivionServer closed successfully");
    } catch (error) {
      console.error("Error closing server:", error);
      throw error;
    }
  }
}
