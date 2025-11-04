"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

export default function HowItWorks() {
  const [openAccordion, setOpenAccordion] = useState(0)

  const technologies = [
    {
      title: "Why Only Midnight?",
      content:
        "Only Midnight blockchain has programmable privacy via zero-knowledge proofs. Compare to Ethereum (all data public), Solana (no ZK), Midnight (private + ZK).",
    },
    {
      title: "Zero-Knowledge Proofs",
      content:
        "Prove 'I deleted data matching hash X' without revealing what data was deleted. This allows users to verify deletion happened without exposing the deleted information.",
    },
    {
      title: "Cryptographic Commitments",
      content:
        "Store only hashes on blockchain, actual data stays encrypted off-chain. This ensures deletion is cryptographically verified while keeping data confidential.",
    },
    {
      title: "Off-Chain Encrypted Storage",
      content:
        "Real data stored securely and is deletable. Blockchain only has commitments. This optimizes for both privacy and the ability to truly delete data.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
            How Oblivion Protocol Works
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The only blockchain that can prove deletion without revealing data
          </p>

          <div className="p-8 rounded-lg bg-secondary/30 border border-border">
            <div className="text-sm text-muted-foreground mb-4">Interactive Architecture</div>
            <div className="font-mono text-primary">User → Company → SDK → Midnight Blockchain → ZK Proofs</div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Key Technologies</h2>

          <div className="space-y-4">
            {technologies.map((tech, i) => (
              <button
                key={i}
                onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                className="w-full p-6 rounded-lg bg-secondary/30 border border-border hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{tech.title}</h3>
                  <ChevronDown
                    size={20}
                    className={`text-primary transition-transform ${openAccordion === i ? "rotate-180" : ""}`}
                  />
                </div>
                {openAccordion === i && <p className="text-muted-foreground mt-4">{tech.content}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">The Deletion Process</h2>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "User Initiates Deletion",
                desc: "User clicks 'Delete All Data' in their dashboard, creating a deletion request.",
              },
              {
                step: "2",
                title: "SDK Processes Request",
                desc: "Company SDK receives deletion request and removes data from databases.",
              },
              {
                step: "3",
                title: "Generate ZK Proof",
                desc: "Cryptographic proof is generated proving deletion occurred without revealing what was deleted.",
              },
              {
                step: "4",
                title: "Record on Blockchain",
                desc: "Proof is recorded immutably on Midnight blockchain, creating permanent audit trail.",
              },
              {
                step: "5",
                title: "Confirm to User",
                desc: "User receives cryptographic proof that deletion was completed and verified.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
