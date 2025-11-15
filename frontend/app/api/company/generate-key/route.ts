import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { serviceName } = await request.json();

    if (!serviceName || typeof serviceName !== "string") {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 },
      );
    }

    // Generate a secure API key
    const apiKey = `obv_${crypto.randomBytes(32).toString("hex")}`;

    // In a real implementation, this would:
    // 1. Store the API key in the database
    // 2. Associate it with the company/service
    // 3. Hash the key for secure storage
    // 4. Return the plain key only once

    // For demo purposes, we'll just return the generated key
    return NextResponse.json({
      apiKey,
      serviceName,
      createdAt: new Date().toISOString(),
      message:
        "API key generated successfully. Save this key securely - it will not be shown again.",
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 },
    );
  }
}
