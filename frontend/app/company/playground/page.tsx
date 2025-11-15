import { SDKPlayground } from "@/components/company/SDKPlayground";
import { Card } from "@/components/ui/card";
import { Code, Zap, Shield, CheckCircle } from "lucide-react";

export default function SDKPlaygroundPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">SDK Playground</h1>
        <p className="text-gray-600 text-lg">
          Try the Oblivion SDK with live examples and see real API responses
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Code className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <h3 className="font-semibold mb-1">Simple API</h3>
          <p className="text-sm text-gray-600">
            Just 3-5 lines of code to get started
          </p>
        </Card>

        <Card className="p-4 text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <h3 className="font-semibold mb-1">Fast Integration</h3>
          <p className="text-sm text-gray-600">Set up in under 10 minutes</p>
        </Card>

        <Card className="p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <h3 className="font-semibold mb-1">Automatic Compliance</h3>
          <p className="text-sm text-gray-600">
            GDPR compliance out of the box
          </p>
        </Card>

        <Card className="p-4 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <h3 className="font-semibold mb-1">Cryptographic Proofs</h3>
          <p className="text-sm text-gray-600">
            Zero-knowledge deletion proofs
          </p>
        </Card>
      </div>

      {/* SDK Playground */}
      <SDKPlayground />

      {/* Integration Examples */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Integration Examples</h3>

        <div className="space-y-6">
          {/* Express.js Example */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Express.js</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import express from 'express';
import { OblivionSDK } from '@oblivion/sdk';

const app = express();
const oblivion = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY,
  serviceName: 'MyApp'
});

// Register data when users sign up
app.post('/api/users', async (req, res) => {
  const { userDID, userData } = req.body;
  
  // Save to your database
  const user = await db.users.create(userData);
  
  // Register with Oblivion for GDPR compliance
  await oblivion.registerUserData(userDID, userData, 'profile');
  
  res.json({ success: true, user });
});

// Handle deletion requests
app.delete('/api/users/:userDID', async (req, res) => {
  const { userDID } = req.params;
  
  // Delete from your database
  await db.users.delete({ userDID });
  
  // Handle GDPR deletion with cryptographic proof
  const result = await oblivion.handleDeletion(userDID);
  
  res.json({
    success: true,
    deletedRecords: result.deletedCount,
    blockchainProofs: result.blockchainProofs
  });
});`}</code>
            </pre>
          </div>

          {/* Next.js Example */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Next.js API Routes</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// app/api/gdpr/register/route.ts
import { OblivionSDK } from '@oblivion/sdk';
import { NextResponse } from 'next/server';

const sdk = new OblivionSDK({
  apiKey: process.env.OBLIVION_API_KEY!,
  serviceName: 'MyNextApp'
});

export async function POST(request: Request) {
  const { userDID, data, dataType } = await request.json();
  
  try {
    const result = await sdk.registerUserData(userDID, data, dataType);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}`}</code>
            </pre>
          </div>

          {/* Database Hooks Example */}
          <div>
            <h4 className="font-semibold text-lg mb-2">
              Database Hooks (Automatic)
            </h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// Sequelize hook example
User.addHook('afterCreate', async (user) => {
  await oblivion.registerUserData(
    user.did,
    user.toJSON(),
    'profile'
  );
});

// Mongoose middleware example
userSchema.post('save', async function() {
  if (this.isNew) {
    await oblivion.registerUserData(
      this.did,
      this.toObject(),
      'profile'
    );
  }
});`}</code>
            </pre>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-4">
            Generate your API key and start integrating in minutes
          </p>
          <a
            href="/company/setup"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Integration
          </a>
        </div>
      </Card>
    </div>
  );
}
