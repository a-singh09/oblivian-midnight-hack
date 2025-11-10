"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Home, Shield, FileText, LogOut } from "lucide-react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { WalletConnectButton } from "@/components/blockchain/WalletConnectButton";

interface UserPortalLayoutProps {
  children: ReactNode;
}

export function UserPortalLayout({ children }: UserPortalLayoutProps) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <nav className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <Shield className="text-primary" size={24} />
                  <span className="font-semibold text-lg">
                    Oblivion Protocol
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/user/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/user/history"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Access History
                  </Link>
                  <Link
                    href="/user/proofs"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Deletion Proofs
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <WalletConnectButton />
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Home size={16} />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </DashboardProvider>
  );
}
