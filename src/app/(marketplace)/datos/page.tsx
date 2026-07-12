import { DatabaseZap } from "lucide-react";
import { getDataPackagesPublicadas } from "@/lib/data/data-packages";
import { DataPackagePreview } from "@/components/data-marketplace/data-package-preview";
import { comprarDataPackageAction } from "@/lib/data-marketplace/compra-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

export default async function DataMarketplacePage() {
  const paquetes = await getDataPackagesPublicadas();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="mb-2 font-heading text-3xl">Data Marketplace</h1>
      <p className="mb-2 max-w-2xl text-muted-foreground">
        Datasets de comportamiento de viaje en México, 100% agregados y
        anonimizados — nunca nombres, correos ni identificadores individuales.
      </p>
      <p className="mb-10 text-xs text-muted-foreground">
        Los datos se generan a partir de actividad real de la plataforma con
        consentimiento agregado de los usuarios.{" "}
        <a href="/registro" className="underline">
          Más sobre nuestra política de datos
        </a>
        .
      </p>

      {paquetes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <DatabaseZap className="h-10 w-10" />
          <p>Aún no hay paquetes de datos publicados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {paquetes.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="font-heading text-xl">{p.titulo}</CardTitle>
                  <div className="flex items-center gap-2">
                    {p.estado === "vendido" && (
                      <Badge>Vendido a {p.comprador_empresa}</Badge>
                    )}
                    <span className="tabular-nums font-medium">
                      {formatCurrency(p.precio)}/mes
                    </span>
                  </div>
                </div>
                {p.descripcion && (
                  <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <DataPackagePreview preview={p.preview as never} />

                {p.estado === "publicado" && (
                  <form
                    action={comprarDataPackageAction}
                    className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="dataPackageId" value={p.id} />
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Nombre de tu empresa
                      </label>
                      <Input name="empresa" placeholder="Ej. Viajes Acme S.A." required />
                    </div>
                    <Button type="submit">Comprar paquete</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
