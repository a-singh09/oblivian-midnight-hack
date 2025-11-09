"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Trash2,
  FileCheck,
  Settings,
  Home,
} from "lucide-react";
import { CompanyProvider } from "@/contexts/CompanyContext";

interface CompanyPortalLayoutProps {
  children: ReactNode;
}

export function CompanyPortalLayout({ children }: CompanyPortalLayoutProps) {
  return (
    <CompanyProvider>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <nav className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <Building2 className="text-primary" size={24} />
                  <span className="font-semibold text-lg">Company Portal</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/company/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link
                    href="/company/deletions"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Deletion Requests
                  </Link>
                  <Link
                    href="/company/compliance"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <FileCheck size={16} />
                    Compliance
                  </Link>
                  <Link
                    href="/company/settings"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
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
    </CompanyProvider>
  );
}
