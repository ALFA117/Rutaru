import Link from "next/link";
import { buscarListings, type ListingTipo } from "@/lib/data/listings";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

const TIPO_VALIDO = new Set(["paquete", "ruta", "hospedaje", "traslado"]);

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    origen?: string;
    destino?: string;
    entrada?: string;
    salida?: string;
    adultos?: string;
    ninos?: string;
    habitaciones?: string;
  }>;
}) {
  const sp = await searchParams;
  const tipo = TIPO_VALIDO.has(sp.tipo ?? "") ? (sp.tipo as ListingTipo | "paquete") : "paquete";

  const { listings, paquetes } = await buscarListings({
    tipo,
    destino: sp.destino,
    entrada: sp.entrada,
  });

  const totalResultados = tipo === "paquete" ? (paquetes?.length ?? 0) : (listings?.length ?? 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="mb-2 font-heading text-3xl">Resultados de búsqueda</h1>
      <p className="mb-8 text-muted-foreground">
        {sp.destino ? `Destino: ${sp.destino} — ` : ""}
        {totalResultados} resultado{totalResultados !== 1 ? "s" : ""}
        {sp.entrada && ` con disponibilidad desde ${sp.entrada}`}
      </p>

      {totalResultados === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-muted-foreground">
              No encontramos resultados con esos filtros.
            </p>
            <p className="text-sm text-muted-foreground">
              Intenta con otro destino o quita el filtro de fecha —{" "}
              <Link href="/paquetes" className="underline">
                explora todos los paquetes
              </Link>{" "}
              mientras tanto.
            </p>
          </CardContent>
        </Card>
      )}

      {tipo === "paquete" && paquetes && paquetes.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p) => (
            <Link key={p.id} href={`/paquete/${p.slug}`}>
              <Card className="h-full transition-colors hover:border-accent">
                <CardContent className="flex flex-col gap-2 p-4">
                  <Badge className="w-fit">Paquete</Badge>
                  <h2 className="font-heading text-lg">{p.titulo}</h2>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(p.precio_total)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tipo !== "paquete" && listings && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} href={DETAIL_HREF[l.tipo]?.(l.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
