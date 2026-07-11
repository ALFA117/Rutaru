import { requireRole } from "@/lib/auth/guards";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";

export default async function AgenciaPage() {
  const { profile } = await requireRole("agencia");
  return <DashboardPlaceholder role="agencia" profile={profile} />;
}
