import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { txHash: string } },
) {
  try {
    const { txHash } = params;

    if (!txHash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 },
      );
    }

    // In a real implementation, this would:
    // 1. Query the Midnight indexer for transaction status
    // 2. Get confirmation count and block number
    // 3. Return real-time status updates

    // For demo purposes, we'll simulate transaction progression
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const indexerUrl = process.env.NEXT_PUBLIC_INDEXER_URL;

    if (indexerUrl) {
      try {
        // Try to query the real indexer
        const query = `
          query GetTransaction($txHash: String!) {
            transaction(hash: $txHash) {
              hash
              status
              blockNumber
              confirmations
            }
          }
        `;

        const response = await fetch(indexerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { txHash },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const tx = data.data?.transaction;

          if (tx) {
            return NextResponse.json({
              txHash,
              status:
                tx.status === "confirmed"
                  ? "confirmed"
                  : tx.status === "failed"
                    ? "failed"
                    : "pending",
              blockNumber: tx.blockNumber,
              confirmations: tx.confirmations || 0,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        console.error("Error querying indexer:", error);
      }
    }

    // Fallback: Simulate transaction status for demo
    // In a real scenario, transactions would be pending for a while
    // For demo, we'll make them confirm quickly
    const txAge = Date.now() - parseInt(txHash.slice(-8), 16);
    const isOld = txAge > 30000; // 30 seconds

    return NextResponse.json({
      txHash,
      status: isOld ? "confirmed" : "pending",
      blockNumber: isOld
        ? Math.floor(Math.random() * 1000000) + 1000000
        : undefined,
      confirmations: isOld ? 12 : Math.floor(txAge / 5000),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return NextResponse.json(
      { error: "Failed to get transaction status" },
      { status: 500 },
    );
  }
}
