import { requireRole } from "@/lib/auth/guards";
import { DataPackageBuilder } from "@/components/data-marketplace/data-package-builder";

export default async function NuevoDataPackagePage() {
  await requireRole("admin");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl">Constructor de paquetes de datos</h1>
      <p className="mb-8 text-muted-foreground">
        El preview se genera con datos reales agregados y anonimizados —
        nunca nombres, emails ni IDs individuales.
      </p>
      <DataPackageBuilder />
    </div>
  );
}
