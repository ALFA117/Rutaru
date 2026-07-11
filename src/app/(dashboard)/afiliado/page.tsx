import { requireRole } from "@/lib/auth/guards";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";

export default async function AfiliadoPage() {
  const { profile } = await requireRole("afiliado");
  return <DashboardPlaceholder role="afiliado" profile={profile} />;
}
