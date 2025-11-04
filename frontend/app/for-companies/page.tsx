"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CheckCircle, Shield, TrendingUp, AlertCircle } from "lucide-react"

export default function ForCompanies() {
  const [roiMonthly, setRoiMonthly] = useState(50)
  const [costPerRequest, setCostPerRequest] = useState(250)
  const [hourlyRate, setHourlyRate] = useState(150)

  const currentCost = roiMonthly * costPerRequest * (hourlyRate / 60)
  const oblivionCost = 500
  const savings = currentCost - oblivionCost
  const savingsPercent = Math.round((savings / currentCost) * 100)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
            GDPR Compliance That Installs in 5 Minutes
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            One SDK. Zero blockchain knowledge. Automatic deletion proofs. Never fear a €20M fine again.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent" />
              <span>5-minute integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent" />
              <span>€500/month flat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent" />
              <span>Audit-ready proofs</span>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="inline-block bg-background/50 border border-border rounded-lg p-4 mb-8">
            <div className="font-mono text-sm text-primary">npm install @oblivion/sdk</div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-16 text-center">
            Stop Wrestling with GDPR Compliance
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: "Manual processes are expensive",
                desc: "Deletion requests cost €200-500 each and take days to process",
              },
              {
                icon: Shield,
                title: "Regulatory risk",
                desc: "Fear of €20M fines or 4% revenue penalties for non-compliance",
              },
              {
                icon: TrendingUp,
                title: "No audit trail",
                desc: "Impossible audits with no proof of deletion",
              },
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
                <div key={i} className="p-6 rounded-lg bg-secondary/50 border border-border">
                  <IconComponent className="text-primary mb-4" size={28} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">Before vs After</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "WITHOUT Oblivion",
                items: [
                  "30 days response time",
                  "€500 engineering time per request",
                  "No proof of deletion",
                  "Manual GDPR processes",
                  "Risk of fines",
                ],
                color: "destructive",
              },
              {
                title: "WITH Oblivion",
                items: [
                  "15 seconds processing",
                  "€0 engineering time",
                  "Immutable blockchain proof",
                  "Automated compliance",
                  "Zero regulatory risk",
                ],
                color: "accent",
              },
            ].map((section, i) => (
              <div key={i} className="p-8 rounded-lg bg-secondary/30 border border-border">
                <h3
                  className={`text-xl font-semibold mb-6 ${
                    section.color === "destructive" ? "text-destructive" : "text-accent"
                  }`}
                >
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle
                        size={20}
                        className={section.color === "destructive" ? "text-destructive" : "text-accent"}
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Methods */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">Choose Your Integration</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "npm SDK",
                subtitle: "Node.js / TypeScript",
                code: "npm install @oblivion/sdk",
              },
              {
                title: "Database Plugin",
                subtitle: "PostgreSQL / MySQL",
                code: "CREATE EXTENSION oblivion_sdk;",
              },
              {
                title: "API Proxy",
                subtitle: "Transparent middleware",
                code: "proxy: 'https://api.oblivion.io/v1'",
              },
              {
                title: "Shopify & SaaS Apps",
                subtitle: "Marketplace integrations",
                code: "Apps → Oblivion Protocol",
              },
            ].map((method, i) => (
              <div key={i} className="p-6 rounded-lg bg-secondary/50 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-1">{method.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{method.subtitle}</p>
                <div className="bg-background/50 p-3 rounded font-mono text-xs text-primary overflow-x-auto">
                  {method.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">Simple Pricing</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Developer",
                price: "Free",
                desc: "Get started",
                features: ["Up to 100 users", "Testnet only", "Community support"],
              },
              {
                name: "Professional",
                price: "€500",
                period: "/month",
                desc: "Most popular",
                features: ["Unlimited users", "Production ready", "Priority support", "Audit reports"],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For large deployments",
                features: ["Dedicated support", "On-premise option", "Custom SLAs", "Advanced analytics"],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-lg border transition-colors ${
                  plan.highlight ? "bg-primary/10 border-primary" : "bg-secondary/30 border-border hover:border-primary"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>
                <button
                  className={`w-full py-2 rounded-full font-semibold mb-6 transition-colors ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  Get Started
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={16} className="text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">ROI Calculator</h2>

          <div className="p-8 rounded-lg bg-secondary/30 border border-border">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Deletion requests per month</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={roiMonthly}
                  onChange={(e) => setRoiMonthly(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-primary mt-2">{roiMonthly}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Cost per request (€)</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={costPerRequest}
                  onChange={(e) => setCostPerRequest(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-primary mt-2">€{costPerRequest}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Hourly rate (€)</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-primary mt-2">€{hourlyRate}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Current monthly cost</div>
                <div className="text-3xl font-bold text-foreground">€{Math.round(currentCost).toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="text-sm text-muted-foreground mb-1">With Oblivion</div>
                <div className="text-3xl font-bold text-foreground">€500</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/20 border border-accent">
                <div className="text-sm text-accent mb-1">Monthly savings</div>
                <div className="text-3xl font-bold text-accent">{savingsPercent}%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold text-foreground mb-6">Ready to automate GDPR compliance?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get started in 5 minutes with our SDK. No blockchain knowledge required.
          </p>

          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors inline-block">
            Start Free Trial
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
