import { requireRole } from "@/lib/auth/guards";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";

export default async function AdminPage() {
  const { profile } = await requireRole("admin");
  return <DashboardPlaceholder role="admin" profile={profile} />;
}
