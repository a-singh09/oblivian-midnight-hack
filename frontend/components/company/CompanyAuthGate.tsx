"use client";

import { useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Building2, Key, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CompanyAuthGate() {
  const { setApiKey, setCompanyName } = useCompany();
  const [inputApiKey, setInputApiKey] = useState("");
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputApiKey.trim()) {
      setError("API key is required");
      return;
    }

    if (!inputCompanyName.trim()) {
      setError("Company name is required");
      return;
    }

    // In production, this would validate against the backend
    setApiKey(inputApiKey);
    setCompanyName(inputCompanyName);
  };

  // Demo mode - quick access
  const useDemoAccount = () => {
    setApiKey("demo_api_key_12345");
    setCompanyName("Demo Company");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Company Portal Access
          </h1>
          <p className="text-muted-foreground">
            Enter your API key to access the company dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={inputCompanyName}
              onChange={(e) => setInputCompanyName(e.target.value)}
              placeholder="Your Company Inc."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-foreground mb-2"
            >
              API Key
            </label>
            <div className="relative">
              <Key
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                id="apiKey"
                type="password"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder="obv_live_••••••••••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Access Dashboard
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={useDemoAccount}
            className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors text-sm"
          >
            Use Demo Account
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Try the dashboard with sample data
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Don't have an API key?
          </p>
          <Link
            href="/company/setup"
            className="text-sm text-primary hover:underline font-medium"
          >
            Get started with integration →
          </Link>
        </div>
      </div>
    </div>
  );
}
