"use client";

import { IntegrationWizard } from "@/components/company/IntegrationWizard";

export default function CompanySetupPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Get Started with Oblivion</h1>
        <p className="text-gray-600 text-lg">
          Set up your integration in minutes and achieve automatic GDPR
          compliance
        </p>
      </div>

      <IntegrationWizard />
    </div>
  );
}
