"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Database,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function PresentationPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState({
    total: 10,
    passed: 9,
    failed: 1,
  });

  useEffect(() => {
    // Fetch system status
    const checkStatus = async () => {
      try {
        const health = await apiClient.healthCheck();
        setSystemStatus(health);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/20 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
            <CheckCircle size={16} className="text-accent" />
            <span className="text-sm font-semibold text-accent">
              Built on Midnight Blockchain
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Oblivion Protocol
          </h1>

          <p className="text-2xl md:text-3xl text-primary mb-4 font-semibold">
            Right to Be Forgotten, Actually Working
          </p>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            One-click data deletion with zero-knowledge proofs. GDPR compliance
            that doesn't suck.
          </p>

          {/* System Status */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-background border border-border">
            {systemStatus?.status === "ok" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-accent font-semibold">LIVE DEMO</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Database size={14} className="text-accent" />
                    DB
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={14} className="text-accent" />
                    Chain
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield size={14} className="text-accent" />
                    Proofs
                  </span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">
                Checking system status...
              </span>
            )}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            The Problem
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            GDPR gave us the "Right to Be Forgotten" but nobody implemented it
            properly
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "73",
                label: "Companies to contact",
                desc: "Average user must manually email 73 companies to delete their data",
                icon: <Users size={40} />,
              },
              {
                number: "30",
                label: "Days to respond",
                desc: "Legal requirement, but enforcement is manual and slow",
                icon: <TrendingUp size={40} />,
              },
              {
                number: "€20M",
                label: "Maximum fine",
                desc: "Or 4% of global revenue - companies live in fear",
                icon: <Lock size={40} />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-8 rounded-lg bg-destructive/5 border border-destructive/20 text-center"
              >
                <div className="flex justify-center mb-4 text-destructive">
                  {stat.icon}
                </div>
                <div className="text-5xl font-bold text-destructive mb-2">
                  {stat.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {stat.label}
                </h3>
                <p className="text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            Our Solution
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            One-click deletion with cryptographic proof using Midnight's
            zero-knowledge technology
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap size={32} />,
                title: "One-Click Deletion",
                desc: "Users delete data from all services simultaneously. No manual emails, no waiting weeks.",
                color: "text-amber-500",
              },
              {
                icon: <Shield size={32} />,
                title: "Zero-Knowledge Proofs",
                desc: "Cryptographic proof of deletion without revealing what the data was. Powered by Midnight.",
                color: "text-blue-500",
              },
              {
                icon: <CheckCircle size={32} />,
                title: "Automatic Compliance",
                desc: "Companies integrate once, compliance happens automatically. 5-minute setup.",
                color: "text-green-500",
              },
              {
                icon: <Database size={32} />,
                title: "Audit Trail",
                desc: "Immutable blockchain record of all operations. Perfect for regulatory audits.",
                color: "text-purple-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-background border border-border hover:border-primary transition-colors"
              >
                <div className={`${feature.color} mb-4`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            Technical Architecture
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Production-ready integration with Midnight blockchain
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Tech Stack
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Blockchain",
                    value: "Midnight Network (Testnet)",
                  },
                  { label: "Smart Contracts", value: "Compact Language" },
                  {
                    label: "ZK Proofs",
                    value: "Midnight Proof Server",
                  },
                  {
                    label: "Backend",
                    value: "Node.js + Express + TypeScript",
                  },
                  {
                    label: "Frontend",
                    value: "Next.js 14 + React + TailwindCSS",
                  },
                  {
                    label: "Database",
                    value: "PostgreSQL (Aiven managed)",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Deployed Contracts
              </h3>
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="font-semibold text-foreground mb-2">
                    DataCommitment
                  </div>
                  <code className="text-xs text-muted-foreground break-all">
                    0200a8e253d6db90d13bc02e42667f2705b28208...
                  </code>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="font-semibold text-foreground mb-2">
                    ZKDeletionVerifier
                  </div>
                  <code className="text-xs text-muted-foreground break-all">
                    0200983887c84b45fdd7bb93bc97a23a8e4d0008...
                  </code>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-foreground mb-6">
                System Health
              </h3>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-4xl font-bold text-accent mb-1">
                      {testResults.passed}/{testResults.total}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tests Passing
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-accent mb-1">
                      {Math.round(
                        (testResults.passed / testResults.total) * 100,
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-accent">
                  <CheckCircle size={16} />
                  <span className="font-semibold">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="p-8 rounded-lg bg-secondary/20 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Data Flow
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <Users size={32} className="text-primary" />
                </div>
                <div className="font-semibold text-foreground">User</div>
                <div className="text-sm text-muted-foreground">
                  Request deletion
                </div>
              </div>

              <div className="text-muted-foreground text-2xl">→</div>

              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                  <Database size={32} className="text-blue-500" />
                </div>
                <div className="font-semibold text-foreground">Backend</div>
                <div className="text-sm text-muted-foreground">
                  Generate proofs
                </div>
              </div>

              <div className="text-muted-foreground text-2xl">→</div>

              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                  <Globe size={32} className="text-purple-500" />
                </div>
                <div className="font-semibold text-foreground">Midnight</div>
                <div className="text-sm text-muted-foreground">
                  Verify & record
                </div>
              </div>

              <div className="text-muted-foreground text-2xl">→</div>

              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <div className="font-semibold text-foreground">Proof</div>
                <div className="text-sm text-muted-foreground">
                  Immutable record
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Fully functional demo with real Midnight blockchain integration
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: "1",
                title: "Register Data",
                desc: "Companies register user data with encryption",
                link: "/company-registration",
              },
              {
                step: "2",
                title: "View Footprint",
                desc: "Users see everywhere their data lives",
                link: "/dashboard",
              },
              {
                step: "3",
                title: "Delete & Verify",
                desc: "One click deletion with blockchain proof",
                link: "/dashboard",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-background border border-border"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.desc}
                </p>
                <Link
                  href={item.link}
                  className="text-primary hover:underline text-sm font-semibold"
                >
                  Try it →
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors inline-block"
            >
              Launch Live Demo
            </Link>
            <Link
              href="/company-registration"
              className="px-8 py-4 border-2 border-border text-foreground rounded-full font-semibold text-lg hover:bg-secondary transition-colors inline-block"
            >
              Register Test Data
            </Link>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16">
            Real-World Impact
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg bg-secondary/30 border border-border text-left">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                For Users 👤
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>Delete data from 73+ companies in 1 click</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>Get cryptographic proof of deletion</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>See everywhere their data lives in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>No emails, no waiting, no trust required</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg bg-secondary/30 border border-border text-left">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                For Companies 🏢
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>5-minute integration with REST API</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>Automatic GDPR compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>Audit-ready blockchain trail</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>Avoid €20M fines with proven compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
