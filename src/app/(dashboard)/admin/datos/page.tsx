import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getDataPackages } from "@/lib/data/data-packages";
import { DataPackagePreview } from "@/components/data-marketplace/data-package-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function AdminDataPackagesPage() {
  await requireRole("admin");
  const paquetes = await getDataPackages();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl">Data Marketplace</h1>
          <p className="text-muted-foreground">
            Paquetes de datos agregados y anonimizados a la venta.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/datos/nuevo">Nuevo paquete de datos</Link>
        </Button>
      </div>

      {paquetes.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Aún no hay paquetes de datos.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {paquetes.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-xl">{p.titulo}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.estado === "vendido" ? "default" : "outline"}>
                      {p.estado}
                    </Badge>
                    <span className="tabular-nums font-medium">
                      {currency.format(p.precio)}/mes
                    </span>
                  </div>
                </div>
                {p.descripcion && (
                  <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <DataPackagePreview preview={p.preview as never} />
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/api/data-packages/${p.id}/download?format=csv`}>
                      Descargar CSV
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/api/data-packages/${p.id}/download?format=json`}>
                      Descargar JSON
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
