import { requireRole } from "@/lib/auth/guards";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";

export default async function OperadorPage() {
  const { profile } = await requireRole("operador");
  return <DashboardPlaceholder role="operador" profile={profile} />;
}
