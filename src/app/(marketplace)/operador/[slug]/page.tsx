import { notFound } from "next/navigation";
import { getOperadorBySlug, type ListingTipo } from "@/lib/data/listings";
import { ListingCard } from "@/components/marketplace/listing-card";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { Badge } from "@/components/ui/badge";

export default async function OperadorPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getOperadorBySlug(slug);
  if (!result) notFound();

  const { operador, listings } = result;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit capitalize">
          {operador.tipo}
        </Badge>
        <h1 className="font-heading text-3xl">{operador.descripcion}</h1>
      </div>

      {listings.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Este operador aún no tiene inventario publicado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={DETAIL_HREF[listing.tipo as ListingTipo]?.(listing.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
