"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Check } from "lucide-react"
import Link from "next/link"

export default function Demo() {
  const [step, setStep] = useState(0)
  const [demoId, setDemoId] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (step === 4) {
      setShowConfetti(true)
      const timeout = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [step])

  const generateDemoId = () => {
    const id = "did:midnight:" + Math.random().toString(36).substring(2, 15)
    setDemoId(id)
    setStep(1)
  }

  const steps = [
    {
      title: "Generate Demo Identity",
      description: "Create a temporary DID to explore the dashboard",
      action: "Generate Demo Identity",
      onClick: generateDemoId,
    },
    {
      title: "View Your Data Locations",
      description: "See 8 fictional companies holding your data in real-time",
      action: "See Data Locations",
      onClick: () => setStep(2),
    },
    {
      title: "Explore Access History",
      description: "Check who accessed your data and when",
      action: "View History",
      onClick: () => setStep(3),
    },
    {
      title: "Experience One-Click Deletion",
      description: "Delete data from multiple services simultaneously with blockchain proof",
      action: "Test Deletion",
      onClick: () => setStep(4),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 text-center leading-tight">
            Try Oblivion Protocol
          </h1>

          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Interactive demo with fictional data. Explore how GDPR compliance can actually work.
          </p>

          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex justify-between mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all ${
                    step >= i
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {step > i ? <Check size={20} /> : i + 1}
                </div>
              ))}
            </div>

            {/* Progress Line */}
            <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Content */}
          <div className="p-8 rounded-lg bg-secondary/30 border border-border mb-8">
            {step === 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{steps[0].title}</h2>
                <p className="text-muted-foreground mb-6">{steps[0].description}</p>
                <button
                  onClick={generateDemoId}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  {steps[0].action}
                </button>
              </>
            ) : step === 1 ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your Demo Setup</h2>
                <div className="mb-6 p-4 rounded bg-background/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Demo Identity</div>
                  <div className="font-mono text-primary break-all">{demoId}</div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Your demo identity has been created. You now have access to a fictional dashboard with 8 companies
                  holding your data.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Next: View Data Locations
                </button>
              </>
            ) : step === 2 ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{steps[1].title}</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[
                    { name: "EuroBank 🏦", data: "KYC documents, transactions" },
                    { name: "HealthChain 🏥", data: "Medical records" },
                    { name: "ShopNow 🛒", data: "Orders, address" },
                    { name: "MusicStream 🎵", data: "Listening history" },
                    { name: "LinkedCareer 💼", data: "Profile, resume" },
                    { name: "OnlineLearn 📚", data: "Course progress" },
                    { name: "FoodDelivery 🍔", data: "Orders, locations" },
                    { name: "NewsReader 📰", data: "Reading history" },
                  ].map((company, i) => (
                    <div key={i} className="p-3 rounded bg-background/50 border border-border">
                      <div className="font-semibold text-foreground">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.data}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Next: Access History
                </button>
              </>
            ) : step === 3 ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{steps[2].title}</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { company: "EuroBank", action: "Accessed KYC documents", time: "2 hours ago" },
                    { company: "MusicStream", action: "Logged in", time: "1 hour ago" },
                    { company: "FoodDelivery", action: "Retrieved order history", time: "2 hours ago" },
                    { company: "LinkedCareer", action: "Updated profile", time: "3 hours ago" },
                  ].map((access, i) => (
                    <div key={i} className="p-3 rounded bg-background/50 border border-border flex justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{access.company}</div>
                        <div className="text-sm text-muted-foreground">{access.action}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{access.time}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Next: Test Deletion
                </button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="text-accent" size={32} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Demo Complete!</h2>
                  <p className="text-muted-foreground mb-6">
                    You've experienced the complete Oblivion Protocol flow. Your data deletion was processed with
                    cryptographic proof recorded on the blockchain.
                  </p>

                  {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="fixed w-2 h-2 bg-accent rounded-full animate-bounce"
                          style={{
                            left: Math.random() * 100 + "%",
                            top: Math.random() * 100 + "%",
                            animationDelay: Math.random() * 0.5 + "s",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/demo"
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors inline-block"
                    >
                      Run Demo Again
                    </Link>
                    <Link
                      href="/"
                      className="px-8 py-3 border border-border text-foreground rounded-full font-semibold hover:bg-secondary transition-colors inline-block"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          {step > 0 && step < 4 && (
            <div className="text-center text-sm text-muted-foreground">
              Step {step} of {steps.length}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
