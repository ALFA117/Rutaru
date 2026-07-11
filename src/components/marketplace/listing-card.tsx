import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/data/listings";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function ListingCard({
  listing,
  href,
}: {
  listing: Listing;
  href?: string;
}) {
  const card = (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {listing.imagenes?.[0] && (
          <Image
            src={listing.imagenes[0]}
            alt={listing.titulo}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {listing.duracion && (
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground">
            {listing.duracion}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-lg leading-tight">{listing.titulo}</h3>
        {listing.ubicacion && (
          <p className="text-sm text-muted-foreground">{listing.ubicacion}</p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-3">
          <span className="text-lg font-semibold tabular-nums">
            {currency.format(listing.precio_b2c)}
          </span>
          <span className="text-xs text-muted-foreground">MXN</span>
        </div>
      </div>
    </article>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      {card}
    </Link>
  );
}
