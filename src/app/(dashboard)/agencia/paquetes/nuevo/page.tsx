import { requireRole } from "@/lib/auth/guards";
import { getCatalogoB2B } from "@/lib/data/catalogo-b2b";
import { PaqueteBuilder } from "@/components/b2b/paquete-builder";

export default async function NuevoPaquetePage() {
  await requireRole("agencia");
  const catalogo = await getCatalogoB2B();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl">Constructor de paquetes</h1>
      <p className="mb-8 text-muted-foreground">
        Combina componentes reales del catálogo, define tu markup y publica
        el paquete al marketplace.
      </p>
      <PaqueteBuilder catalogo={catalogo} />
    </div>
  );
}
