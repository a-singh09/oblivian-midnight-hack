"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Copy, Check, Trash2, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

interface DataService {
  id: number
  name: string
  emoji: string
  type: string
  status: "active" | "deleted"
  lastAccessed?: string
  deletedAt?: string
  proofLink?: string
}

export default function Dashboard() {
  const [services, setServices] = useState<DataService[]>([
    {
      id: 1,
      name: "EuroBank",
      emoji: "🏦",
      type: "KYC documents, transactions",
      status: "active",
      lastAccessed: "2 hours ago",
    },
    {
      id: 2,
      name: "HealthChain Medical",
      emoji: "🏥",
      type: "Medical records",
      status: "active",
      lastAccessed: "5 days ago",
    },
    {
      id: 3,
      name: "ShopNow",
      emoji: "🛒",
      type: "Orders, address",
      status: "deleted",
      deletedAt: "2025-01-15",
      proofLink: "https://midnight.proof/zk/abc123",
    },
    {
      id: 4,
      name: "MusicStream",
      emoji: "🎵",
      type: "Listening history",
      status: "active",
      lastAccessed: "1 hour ago",
    },
    {
      id: 5,
      name: "LinkedCareer",
      emoji: "💼",
      type: "Profile, resume",
      status: "active",
      lastAccessed: "3 days ago",
    },
    {
      id: 6,
      name: "OnlineLearn",
      emoji: "📚",
      type: "Course progress",
      status: "active",
      lastAccessed: "1 week ago",
    },
    {
      id: 7,
      name: "FoodDelivery",
      emoji: "🍔",
      type: "Orders, locations",
      status: "active",
      lastAccessed: "2 days ago",
    },
    {
      id: 8,
      name: "NewsReader",
      emoji: "📰",
      type: "Reading history",
      status: "deleted",
      deletedAt: "2025-01-10",
      proofLink: "https://midnight.proof/zk/def456",
    },
  ])

  const [filter, setFilter] = useState<"all" | "active" | "deleted">("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState<DataService | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"confirm" | "deleting" | "success">("confirm")
  const [copied, setCopied] = useState(false)

  const filteredServices = services.filter((s) => {
    if (filter === "all") return true
    if (filter === "active") return s.status === "active"
    if (filter === "deleted") return s.status === "deleted"
    return true
  })

  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === "active").length,
    deleted: services.filter((s) => s.status === "deleted").length,
    accessEvents: 47,
  }

  const handleDeleteClick = (service: DataService) => {
    setSelectedService(service)
    setShowDeleteModal(true)
    setDeleteStep("confirm")
  }

  const confirmDelete = async () => {
    if (!selectedService) return

    setDeleteStep("deleting")
    setIsDeleting(true)

    // Simulate deletion steps
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update the service status
    setServices((prev) =>
      prev.map((s) =>
        s.id === selectedService.id
          ? {
              ...s,
              status: "deleted" as const,
              deletedAt: new Date().toISOString().split("T")[0],
              proofLink: "https://midnight.proof/zk/" + Math.random().toString(36).substr(2, 9),
            }
          : s,
      ),
    )

    setDeleteStep("success")
    setIsDeleting(false)
  }

  const copyDID = () => {
    navigator.clipboard.writeText("did:midnight:demo_user_123")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const recentAccess = [
    { company: "EuroBank", action: "Accessed KYC documents", purpose: "Verification", time: "2 hours ago" },
    { company: "MusicStream", action: "Logged in", purpose: "Authentication", time: "1 hour ago" },
    { company: "FoodDelivery", action: "Retrieved order history", purpose: "Customer Service", time: "2 hours ago" },
    { company: "LinkedCareer", action: "Updated profile", purpose: "Profile Update", time: "3 hours ago" },
    { company: "OnlineLearn", action: "Accessed course data", purpose: "Learning", time: "1 day ago" },
    { company: "HealthChain", action: "Denied access request", purpose: "Permission Revoked", time: "2 days ago" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Your Data Dashboard</h1>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">DID: demo_user_123</span>
              <button onClick={copyDID} className="p-1 hover:bg-secondary rounded transition-colors">
                {copied ? (
                  <Check size={16} className="text-accent" />
                ) : (
                  <Copy size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
            ← Back to Home
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Services holding data", value: stats.active },
              { label: "Data access events (30 days)", value: stats.accessEvents },
              { label: "Successful deletions", value: stats.deleted },
              { label: "Compliance status", value: "100%" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Delete All Section */}
        <div className="mb-12 p-6 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-destructive flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete All My Data - Right to Be Forgotten</h3>
              <p className="text-muted-foreground mb-4">
                This will delete your data from all {stats.active} services. You'll receive cryptographic proof. Cannot
                be undone.
              </p>
              <button className="px-6 py-2 bg-destructive text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                Delete All Data Now
              </button>
            </div>
          </div>
        </div>

        {/* Data Locations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Where Your Data Lives</h2>
            <div className="flex gap-2">
              {(["all", "active", "deleted"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all"
                    ? `All (${stats.total})`
                    : `${f === "active" ? "Active" : "Deleted"} (${f === "active" ? stats.active : stats.deleted})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`p-6 rounded-lg border transition-colors ${
                  service.status === "deleted"
                    ? "bg-secondary/30 border-border opacity-60"
                    : "bg-secondary/50 border-border hover:border-primary"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{service.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.type}</p>
                    </div>
                  </div>
                  {service.status === "deleted" ? (
                    <span className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full">
                      DELETED
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>

                {service.status === "active" ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last accessed {service.lastAccessed}</span>
                    <button
                      onClick={() => handleDeleteClick(service)}
                      className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deleted on {service.deletedAt}</p>
                    <a
                      href={service.proofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Shield size={14} />
                      View blockchain proof
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Access Timeline */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Access History</h2>
          <div className="space-y-3">
            {recentAccess.map((access, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-secondary/30 border border-border flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{access.company}</span>
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      {access.purpose}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{access.action}</p>
                </div>
                <span className="text-sm text-muted-foreground flex-shrink-0">{access.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
            {deleteStep === "confirm" && (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Deletion</h3>
                <p className="text-muted-foreground mb-6">
                  You're about to delete your data from {selectedService.name}. This is permanent.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {deleteStep === "deleting" && (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-4">Deleting your data...</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    <span className="text-muted-foreground">Deleting from database</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary/50" />
                    <span className="text-muted-foreground opacity-50">Generating ZK proof</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary/50" />
                    <span className="text-muted-foreground opacity-50">Recording on blockchain</span>
                  </div>
                </div>
              </>
            )}

            {deleteStep === "success" && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="text-accent" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Deletion Complete</h3>
                </div>
                <p className="text-muted-foreground text-center mb-4">
                  Your data has been successfully deleted from {selectedService.name} with cryptographic proof recorded
                  on the blockchain.
                </p>
                <a
                  href="#"
                  className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mb-3"
                >
                  View Blockchain Proof
                </a>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
