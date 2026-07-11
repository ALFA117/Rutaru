import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/listing-card";
import { CATEGORIAS } from "@/lib/data/categorias";
import { getFeaturedListings } from "@/lib/data/listings";
import { DETAIL_HREF } from "@/lib/data/detail-href";

export default async function Home() {
  const destacados = await getFeaturedListings(6);

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border/60 bg-background px-4 py-24 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6">
          <h1 className="font-heading text-5xl leading-[1.05] tracking-tight md:text-7xl">
            pocas rutas,
            <br />
            todas buenas.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Rutas de autor, hospedaje, traslados y eventos — la plataforma que
            conecta operadores turísticos con agencias y viajeros.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/rutas">Explorar rutas</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/paquetes">Ver paquetes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
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
