# Oblivion SDK

**GDPR compliance that installs like Google Analytics**

The Oblivion SDK enables companies to achieve automatic GDPR compliance with minimal code changes. Built on the Midnight blockchain, it provides cryptographic proof of data deletion without revealing sensitive information.

## Features

- ✅ **One-click GDPR compliance** - Automatic "Right to Be Forgotten" handling
- ✅ **Zero-knowledge proofs** - Prove data deletion without exposing data content
- ✅ **Blockchain audit trail** - Immutable deletion proofs on Midnight blockchain
- ✅ **Minimal integration** - Just 3-5 lines of code to get started
- ✅ **Automatic encryption** - Data encrypted before storage
- ✅ **Real-time updates** - WebSocket notifications for status changes
- ✅ **Retry logic** - Built-in error handling and network resilience

## Installation

```bash
npm install @oblivion/sdk
```

## Quick Start

```typescript
import { OblivionSDK } from "@oblivion/sdk";

// Initialize the SDK
const oblivion = new OblivionSDK({
  apiKey: "your-api-key",
  serviceName: "MyCompany",
});

// Register user data (call this when users sign up or update data)
const result = await oblivion.registerUserData(
  "did:midnight:user_123",
  { name: "John Doe", email: "john@example.com" },
  "profile",
);

// Handle deletion requests (call this when users request data deletion)
const deletion = await oblivion.handleDeletion("did:midnight:user_123");
console.log(`Deleted ${deletion.deletedCount} records with blockchain proofs`);
```

## Configuration

### SDK Options

```typescript
interface SDKConfig {
  apiKey: string; // Your Oblivion API key
  serviceName: string; // Your company/service name
  apiUrl?: string; // API URL (defaults to localhost:3000)
  maxRetries?: number; // Max retry attempts (defaults to 3)
  timeout?: number; // Request timeout in ms (defaults to 30000)
}
```

### Environment Setup

1. **Get your API key** from the Oblivion dashboard
2. **Set up the Oblivion backend** (see deployment docs)
3. **Configure your environment**:

```bash
OBLIVION_API_KEY=your-api-key
OBLIVION_API_URL=https://your-oblivion-instance.com
```

## Integration Examples

### Express.js Application

```typescript
import express from "express";
import { OblivionSDK } from "@oblivion/sdk";

const app = express();
const oblivion = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY!,
  serviceName: "MyApp",
});

// Register data when users sign up
app.post("/api/users", async (req, res) => {
  const { userDID, userData } = req.body;

  // Save to your database first
  const user = await db.users.create(userData);

  // Register with Oblivion for GDPR compliance
  await oblivion.registerUserData(userDID, userData, "profile");

  res.json({ success: true, user });
});

// Handle deletion requests
app.delete("/api/users/:userDID", async (req, res) => {
  const { userDID } = req.params;

  // Delete from your database
  await db.users.delete({ userDID });

  // Handle GDPR deletion with cryptographic proof
  const result = await oblivion.handleDeletion(userDID);

  res.json({
    success: true,
    deletedRecords: result.deletedCount,
    blockchainProofs: result.blockchainProofs,
  });
});
```

### Database Triggers (Automatic Registration)

```typescript
// Sequelize hook example
User.addHook("afterCreate", async (user) => {
  await oblivion.registerUserData(user.did, user.toJSON(), "profile");
});

// Mongoose middleware example
userSchema.post("save", async function () {
  if (this.isNew) {
    await oblivion.registerUserData(this.did, this.toObject(), "profile");
  }
});
```

### Webhook Handler for Deletion Requests

```typescript
// Handle webhooks from Oblivion when users request deletion
app.post("/webhooks/oblivion/deletion", async (req, res) => {
  const { userDID, deletionRequest } = req.body;

  try {
    // Delete user data from your systems
    await deleteUserFromAllSystems(userDID);

    // Confirm deletion to Oblivion
    await oblivion.handleDeletion(userDID);

    res.json({ success: true });
  } catch (error) {
    console.error("Deletion failed:", error);
    res.status(500).json({ error: "Deletion failed" });
  }
});
```

### Next.js API Routes

```typescript
// pages/api/gdpr/register.ts
import { OblivionSDK } from "@oblivion/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const oblivion = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY!,
  serviceName: "MyNextApp",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { userDID, data, dataType } = req.body;

    try {
      const result = await oblivion.registerUserData(userDID, data, dataType);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## API Reference

### `registerUserData(userDID, data, dataType)`

Registers user data with the Oblivion Protocol for GDPR compliance.

**Parameters:**

- `userDID` (string): User's decentralized identifier (format: `did:midnight:user_xyz`)
- `data` (object): User data to be registered
- `dataType` (string): Category of data (`'profile'`, `'transactions'`, `'preferences'`, etc.)

**Returns:** `Promise<RegisterDataResponse>`

```typescript
{
  commitmentHash: string; // SHA-256 hash of encrypted data
  blockchainTx: string; // Blockchain transaction hash
  success: boolean;
}
```

### `handleDeletion(userDID)`

Handles complete deletion flow with cryptographic proof generation.

**Parameters:**

- `userDID` (string): User's decentralized identifier

**Returns:** `Promise<DeletionResponse>`

```typescript
{
  deletedCount: number;        // Number of records deleted
  blockchainProofs: string[];  // Array of proof transaction hashes
  success: boolean;
}
```

### `getUserData(userDID)`

Retrieves user data for Right to Access compliance (GDPR Article 15).

**Parameters:**

- `userDID` (string): User's decentralized identifier

**Returns:** `Promise<GetUserDataResponse>`

```typescript
{
  data: Array<{
    commitmentHash: string;
    dataType: string;
    createdAt: string;
    deleted: boolean;
    deletionProofHash?: string;
  }>;
  success: boolean;
}
```

### `healthCheck()`

Checks if the Oblivion API is healthy and accessible.

**Returns:** `Promise<{ status: string; timestamp: string }>`

## Error Handling

The SDK includes comprehensive error handling with automatic retries:

```typescript
try {
  const result = await oblivion.registerUserData(userDID, data, "profile");
} catch (error) {
  if (error.message.includes("401")) {
    // Invalid API key
    console.error("Authentication failed - check your API key");
  } else if (error.message.includes("No response received")) {
    // Network connectivity issue
    console.error("Network error - check Oblivion service status");
  } else {
    // Other errors
    console.error("Oblivion SDK error:", error.message);
  }
}
```

## Best Practices

### 1. Register Data Immediately

```typescript
// ✅ Good: Register data when it's created
const user = await createUser(userData);
await oblivion.registerUserData(user.did, userData, "profile");

// ❌ Bad: Registering data long after creation
```

### 2. Use Descriptive Data Types

```typescript
// ✅ Good: Specific data categories
await oblivion.registerUserData(userDID, profileData, "profile");
await oblivion.registerUserData(userDID, transactionData, "transactions");
await oblivion.registerUserData(userDID, preferencesData, "preferences");

// ❌ Bad: Generic data types
await oblivion.registerUserData(userDID, data, "user_data");
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good: Proper error handling
try {
  await oblivion.registerUserData(userDID, data, "profile");
} catch (error) {
  // Log error but don't fail the main operation
  console.error("GDPR registration failed:", error);
  // Continue with user creation
}
```

### 4. Use Environment Variables

```typescript
// ✅ Good: Environment-based configuration
const oblivion = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY!,
  serviceName: process.env.SERVICE_NAME || "MyApp",
  apiUrl: process.env.OBLIVION_API_URL,
});
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import {
  OblivionSDK,
  SDKConfig,
  RegisterDataResponse,
  DeletionResponse,
  GetUserDataResponse,
} from "@oblivion/sdk";

// Full type safety
const config: SDKConfig = {
  apiKey: "your-key",
  serviceName: "MyApp",
};

const sdk = new OblivionSDK(config);
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: [https://docs.oblivion-protocol.com](https://docs.oblivion-protocol.com)
- **Issues**: [GitHub Issues](https://github.com/oblivion-protocol/sdk/issues)
- **Discord**: [Join our community](https://discord.gg/oblivion-protocol)
- **Email**: support@oblivion-protocol.com

## Roadmap

- [ ] React hooks for frontend integration
- [ ] GraphQL support
- [ ] Batch operations for bulk data handling
- [ ] Advanced webhook configurations
- [ ] Real-time dashboard widgets

---

**Made with ❤️ by the Oblivion Protocol team**
