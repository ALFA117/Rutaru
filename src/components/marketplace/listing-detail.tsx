import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Listing } from "@/lib/data/listings";
import type { Database } from "@/types/database.types";
import { addToCartAction } from "@/lib/cart/actions";
import { track } from "@/lib/tracking/track";

type Disponibilidad = Database["public"]["Tables"]["disponibilidad"]["Row"];
type Resena = Database["public"]["Tables"]["resenas"]["Row"];

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});

type Zona = { nombre: string; precio: number };

export async function ListingDetail({
  listing,
  disponibilidad,
  resenas,
}: {
  listing: Listing;
  disponibilidad: Disponibilidad[];
  resenas: Resena[];
}) {
  await track({
    tipoEvento: "page_view",
    entidad: listing.slug,
    metadata: { tipo: listing.tipo },
  });

  const zonas = (listing.itinerario as Array<{ zonas?: Zona[] }> | null)?.[0]
    ?.zonas;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      {listing.imagenes && listing.imagenes.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-2 overflow-hidden rounded-lg sm:grid-cols-3">
          <div className="relative aspect-[4/3] sm:col-span-2">
            <Image
              src={listing.imagenes[0]}
              alt={listing.titulo}
              fill
              sizes="(min-width: 640px) 66vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {listing.imagenes.slice(1, 3).map((src, i) => (
              <div key={src} className="relative aspect-[4/3]">
                <Image
                  src={src}
                  alt={`${listing.titulo} ${i + 2}`}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {listing.duracion && (
            <Badge className="w-fit">{listing.duracion}</Badge>
          )}
          <h1 className="font-heading text-3xl md:text-4xl">
            {listing.titulo}
          </h1>
          {listing.ubicacion && (
            <p className="text-muted-foreground">{listing.ubicacion}</p>
          )}
          {listing.descripcion && (
            <p className="max-w-2xl leading-relaxed text-foreground/90">
              {listing.descripcion}
            </p>
          )}

          {zonas && zonas.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 font-heading text-lg">Zonas y precios</h2>
              <ul className="flex flex-col gap-2">
                {zonas.map((z) => (
                  <li
                    key={z.nombre}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>{z.nombre}</span>
                    <span className="tabular-nums font-medium">
                      {currency.format(z.precio)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h2 className="mb-2 font-heading text-lg">Reseñas</h2>
            {resenas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay reseñas para esta experiencia.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {resenas.map((r) => (
                  <li key={r.id} className="rounded-md border border-border p-3 text-sm">
                    <span className="font-medium">{"★".repeat(r.rating)}</span>
                    {r.comentario && <p className="mt-1">{r.comentario}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between font-heading text-2xl">
              <span className="tabular-nums">
                {currency.format(listing.precio_b2c)}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                MXN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {disponibilidad.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">Próximas fechas</p>
                <div className="flex flex-wrap gap-2">
                  {disponibilidad.slice(0, 6).map((d) => (
                    <Badge key={d.id} variant="outline">
                      {fecha.format(new Date(`${d.fecha}T00:00:00`))}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Consulta disponibilidad directamente.
              </p>
            )}
            <form action={addToCartAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <Button size="lg" type="submit" className="w-full">
                Agregar al carrito
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
