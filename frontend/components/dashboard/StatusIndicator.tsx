"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface ServiceStatus {
  database: boolean;
  blockchain: boolean;
  proofServer: boolean;
}

export function StatusIndicator() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await apiClient.healthCheck();
        setStatus(health.services);
        setError(false);
      } catch (err) {
        console.error("Health check failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        <span>Checking system status...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle size={14} />
        <span>Backend offline</span>
      </div>
    );
  }

  const services = [
    { name: "Database", status: status.database },
    { name: "Blockchain", status: status.blockchain },
    { name: "Proof Server", status: status.proofServer },
  ];

  const allHealthy = Object.values(status).every((s) => s);

  return (
    <div className="flex items-center gap-4 text-sm">
      {allHealthy ? (
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle size={14} />
          <span className="font-medium">All Systems Operational</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-amber-500">
          <AlertCircle size={14} />
          <span className="font-medium">Partial Service</span>
        </div>
      )}

      <div className="flex gap-3 pl-3 border-l border-border">
        {services.map((service) => (
          <div key={service.name} className="flex items-center gap-1">
            {service.status ? (
              <CheckCircle size={12} className="text-accent" />
            ) : (
              <XCircle size={12} className="text-destructive" />
            )}
            <span className="text-muted-foreground text-xs">
              {service.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
