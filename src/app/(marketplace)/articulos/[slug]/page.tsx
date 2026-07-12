import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArticuloBySlug } from "@/lib/data/articulos";
import { createClient } from "@/lib/supabase/server";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articulo = await getArticuloBySlug(slug);
  if (!articulo) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/articulos" className="hover:text-foreground">
          Artículos
        </Link>
        <span>/</span>
        <span className="text-foreground">{articulo.titulo}</span>
      </nav>

      {articulo.categoria && (
        <Badge className="mb-3 w-fit bg-accent text-accent-foreground">
          {articulo.categoria}
        </Badge>
      )}
      <h1 className="mb-2 font-heading text-3xl md:text-4xl">{articulo.titulo}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {articulo.autor && <>{articulo.autor} — </>}
        {fecha.format(new Date(articulo.publicado_at))}
      </p>

      {articulo.imagen && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={articulo.imagen}
            alt={articulo.titulo}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex flex-col gap-4 text-base leading-relaxed text-foreground/90">
        {articulo.contenido.split("\n\n").map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>

      {articulo.listing_id && (
        <ArticuloListingLink listingId={articulo.listing_id} />
      )}
    </div>
  );
}

async function ArticuloListingLink({ listingId }: { listingId: string }) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings_publico")
    .select("titulo, tipo, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return null;
  const href = DETAIL_HREF[listing.tipo]?.(listing.slug);
  if (!href) return null;

  return (
    <Card className="mt-10">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">Relacionado con</p>
          <p className="font-heading text-lg">{listing.titulo}</p>
        </div>
        <Link href={href} className="text-sm font-medium underline">
          Ver detalle →
        </Link>
      </CardContent>
    </Card>
  );
}
