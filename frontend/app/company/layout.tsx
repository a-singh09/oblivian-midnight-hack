import { CompanyPortalLayout } from "@/components/layouts/CompanyPortalLayout";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyPortalLayout>{children}</CompanyPortalLayout>;
}
