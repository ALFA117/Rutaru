import Link from "next/link";
import { ListingCard } from "@/components/marketplace/listing-card";
import { HeroCarousel, type HeroSlide } from "@/components/marketplace/hero-carousel";
import { BuscadorReservas } from "@/components/marketplace/buscador-reservas";
import { CATEGORIAS } from "@/lib/data/categorias";
import { getFeaturedListings, getCiudadesDisponibles } from "@/lib/data/listings";
import { DETAIL_HREF } from "@/lib/data/detail-href";

export default async function Home() {
  const [destacados, ciudades] = await Promise.all([
    getFeaturedListings(8),
    getCiudadesDisponibles(),
  ]);

  const slides: HeroSlide[] = destacados
    .filter((l) => l.imagenes?.[0])
    .slice(0, 6)
    .map((l) => ({
      id: l.id,
      titulo: l.titulo,
      imagen: l.imagenes[0],
      precio: l.precio_b2c,
      duracion: l.duracion,
      tipo: l.tipo,
      href: DETAIL_HREF[l.tipo]?.(l.slug) ?? "/",
    }));

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative">
        <HeroCarousel slides={slides} />
        <div className="px-4">
          <BuscadorReservas ciudades={ciudades} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16">
        <h2 className="mb-8 font-heading text-2xl">Categorías</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
            >
              <span className="font-heading text-base leading-tight">
                {c.titulo}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.descripcion}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <h2 className="mb-8 font-heading text-2xl">Destacados</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                href={DETAIL_HREF[listing.tipo]?.(listing.slug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
