import { UserPortalLayout } from "@/components/layouts/UserPortalLayout";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserPortalLayout>{children}</UserPortalLayout>;
}
