import { requireRole } from "@/lib/auth/guards";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";

export default async function ClientePage() {
  const { profile } = await requireRole("cliente");
  return <DashboardPlaceholder role="cliente" profile={profile} />;
}
