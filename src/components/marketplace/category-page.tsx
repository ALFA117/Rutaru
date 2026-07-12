import { Suspense } from "react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { FiltersBar } from "@/components/marketplace/filters-bar";
import { getListingsByTipo, type ListingTipo } from "@/lib/data/listings";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { track } from "@/lib/tracking/track";

export async function CategoryPage({
  tipo,
  titulo,
  hrefFor,
  searchParams,
}: {
  tipo: ListingTipo;
  titulo: string;
  // Opcional: por defecto resuelve via DETAIL_HREF (fuente unica de la
  // verdad). Sin esto, las paginas que no lo pasaban (experiencias,
  // traslados) renderizaban tarjetas sin ningun href -- ListingCard
  // vuelve un <article> pelon, sin <Link>, click no hace nada.
  hrefFor?: (slug: string) => string;
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  const params = await searchParams;
  const listings = await getListingsByTipo(tipo, {
    destino: params.destino,
    orden: params.orden as "precio_asc" | "precio_desc" | undefined,
  });

  if (params.destino) {
    await track({
      tipoEvento: "search",
      entidad: tipo,
      metadata: { destino: params.destino, orden: params.orden },
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-6">
        <h1 className="font-heading text-3xl">{titulo}</h1>
        <Suspense fallback={null}>
          <FiltersBar />
        </Suspense>
      </div>

      {listings.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No encontramos resultados con esos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={(hrefFor ?? DETAIL_HREF[tipo])?.(listing.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
