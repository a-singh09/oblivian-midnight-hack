"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { Check, Loader2, Shield, Building2, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function CompanyRegistration() {
  const [formData, setFormData] = useState({
    userDID: "did:midnight:demo_user_123",
    serviceProvider: "",
    dataType: "",
    data: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const dataTypeOptions = [
    "personal_info",
    "financial_data",
    "health_records",
    "location_data",
    "communication_data",
    "behavioral_data",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setTxHash("");

    try {
      // Parse the data as JSON if it looks like JSON, otherwise send as string
      let parsedData;
      try {
        parsedData = JSON.parse(formData.data);
      } catch {
        parsedData = { value: formData.data };
      }

      const result = await apiClient.registerUserData({
        userDID: formData.userDID,
        data: parsedData,
        dataType: formData.dataType,
        serviceProvider: formData.serviceProvider,
      });

      setTxHash(result.blockchainTx);
      setSuccess(true);

      // Save DID to localStorage so dashboard can use it
      if (typeof window !== "undefined") {
        localStorage.setItem("userDID", formData.userDID);
        localStorage.setItem("lastCommitmentHash", result.commitmentHash);
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          userDID: "did:midnight:demo_user_123",
          serviceProvider: "",
          dataType: "",
          data: "",
        });
        setSuccess(false);
        setTxHash("");
      }, 8000); // Increased to 8 seconds so user can read the message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register data");
      console.error("Error registering data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building2 size={32} className="text-primary" />
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground">
                Company Data Registration
              </h1>
            </div>
            <StatusIndicator />
          </div>

          <p className="text-xl text-muted-foreground mb-12">
            Register user data with cryptographic commitments on the Midnight
            blockchain. This enables users to track and delete their data with
            ZK proofs.
          </p>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: <Shield size={20} />,
                title: "Privacy First",
                desc: "Data encrypted, only commitments on-chain",
              },
              {
                icon: <CheckCircle size={20} />,
                title: "GDPR Compliant",
                desc: "Automatic deletion proof generation",
              },
              {
                icon: <Building2 size={20} />,
                title: "Easy Integration",
                desc: "Simple REST API for your systems",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-2 mb-2 text-primary">
                  {item.icon}
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Registration Form */}
          <div className="p-8 rounded-lg bg-secondary/20 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Register User Data
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User DID */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  User DID <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.userDID}
                  onChange={(e) =>
                    setFormData({ ...formData, userDID: e.target.value })
                  }
                  placeholder="did:midnight:..."
                  required
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground focus:border-primary focus:outline-none cursor-not-allowed opacity-75"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Demo user DID
                </p>
              </div>

              {/* Service Provider */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Provider <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.serviceProvider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceProvider: e.target.value,
                    })
                  }
                  placeholder="Your Company Name"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Data Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.dataType}
                  onChange={(e) =>
                    setFormData({ ...formData, dataType: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select data type...</option>
                  {dataTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  placeholder='{"email": "user@example.com", "name": "John Doe"}'
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  JSON object or plain text. Data will be encrypted before
                  storage.
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-2 text-accent mb-3">
                    <Check size={20} />
                    <span className="font-semibold">
                      Data registered successfully!
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded bg-background/50 border border-border">
                      <div className="font-medium text-foreground mb-1">
                        Your DID (Save this!):
                      </div>
                      <code className="text-xs text-primary break-all font-mono">
                        {formData.userDID}
                      </code>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 This DID has been saved. Go to{" "}
                        <a
                          href="/dashboard"
                          className="text-primary hover:underline font-medium"
                        >
                          Dashboard
                        </a>{" "}
                        to see your data!
                      </p>
                    </div>

                    {txHash && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Transaction Hash:</span>
                        <code className="ml-2 text-xs break-all">{txHash}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Register Data
                  </>
                )}
              </button>
            </form>
          </div>

          {/* API Documentation */}
          <div className="mt-12 p-8 rounded-lg bg-secondary/20 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              API Integration
            </h2>
            <p className="text-muted-foreground mb-6">
              Integrate Oblivion Protocol into your systems with our REST API:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="text-sm font-semibold text-foreground mb-2">
                  POST /api/register-data
                </div>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`{
  "userDID": "did:midnight:...",
  "data": { "email": "user@example.com" },
  "dataType": "personal_info",
  "serviceProvider": "YourCompany"
}`}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="text-sm font-semibold text-foreground mb-2">
                  GET /api/user/:did/footprint
                </div>
                <p className="text-xs text-muted-foreground">
                  Returns all data locations for a user DID
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="text-sm font-semibold text-foreground mb-2">
                  POST /api/user/:did/delete-all
                </div>
                <p className="text-xs text-muted-foreground">
                  Deletes all user data and generates ZK proofs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
