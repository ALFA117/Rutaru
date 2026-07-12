import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { getOperadorBySlug, type ListingTipo } from "@/lib/data/listings";
import { ListingCard } from "@/components/marketplace/listing-card";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extracto } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getOperadorBySlug(slug);
  if (!result) return {};
  return {
    title: result.operador.nombre ?? "Operador Rutaru",
    description: extracto(result.operador.descripcion),
  };
}

export default async function OperadorPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getOperadorBySlug(slug);
  if (!result) notFound();

  const { operador, listings } = result;
  const nombre = operador.nombre ?? "Operador Rutaru";
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Avatar size="lg">
          {operador.logo && <AvatarImage src={operador.logo} alt={nombre} />}
          <AvatarFallback>{iniciales}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit capitalize">
            {operador.tipo}
          </Badge>
          <h1 className="font-heading text-3xl">{nombre}</h1>
          {operador.descripcion && (
            <p className="text-muted-foreground">{operador.descripcion}</p>
          )}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Store className="h-10 w-10" />
          <p>Este operador aún no tiene inventario publicado.</p>
        </div>
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
