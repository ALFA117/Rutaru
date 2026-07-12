import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { getPaqueteBySlug } from "@/lib/data/listings";
import type { ListingTipo } from "@/lib/data/listings";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/tracking/track";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaqueteReservaWidget } from "@/components/marketplace/paquete-reserva-widget";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Mismo orden que el constructor (Bloque 5): Hospedaje, Experiencias/Rutas,
// Traslados, Eventos.
const ORDEN_TIPO: Record<string, number> = {
  hospedaje: 0,
  experiencia: 1,
  ruta: 1,
  traslado: 2,
  evento: 3,
};

type Componente = { listing_id: string; titulo: string; tipo: ListingTipo };
type Paso = { hora: string; titulo: string; descripcion: string };

function whatsappHref(titulo: string) {
  const texto = `Hola, tengo una pregunta sobre el paquete: ${titulo}`;
  return `https://wa.me/525575653059?text=${encodeURIComponent(texto)}`;
}

export default async function PaqueteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paquete = await getPaqueteBySlug(slug);
  if (!paquete) notFound();

  await track({ tipoEvento: "page_view", entidad: slug, metadata: { tipo: "paquete" } });

  const componentes = ((paquete.componentes as Componente[] | null) ?? [])
    .slice()
    .sort((a, b) => (ORDEN_TIPO[a.tipo] ?? 9) - (ORDEN_TIPO[b.tipo] ?? 9));

  const supabase = await createClient();
  const listingIds = componentes.map((c) => c.listing_id);
  const { data: listingsDetalle } = listingIds.length
    ? await supabase
        .from("listings_publico")
        .select("id, titulo, tipo, imagenes, que_incluye, itinerario, ubicacion")
        .in("id", listingIds)
    : { data: [] };

  const detalleById = new Map((listingsDetalle ?? []).map((l) => [l.id, l]));

  const galeria = [
    ...new Set(
      componentes.flatMap((c) => detalleById.get(c.listing_id)?.imagenes?.slice(0, 1) ?? [])
    ),
  ];

  const queIncluye = [
    ...new Set(componentes.flatMap((c) => detalleById.get(c.listing_id)?.que_incluye ?? [])),
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/paquetes" className="hover:text-foreground">
          Paquetes de Agencia
        </Link>
        <span>/</span>
        <span className="text-foreground">{paquete.titulo}</span>
      </nav>

      {galeria.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-2 overflow-hidden rounded-lg sm:grid-cols-3">
          <div className="relative aspect-[4/3] sm:col-span-2">
            <Image
              src={galeria[0]}
              alt={paquete.titulo}
              fill
              sizes="(min-width: 640px) 66vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {galeria.slice(1, 3).map((src, i) => (
              <div key={src} className="relative aspect-[4/3]">
                <Image
                  src={src}
                  alt={`${paquete.titulo} ${i + 2}`}
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="w-fit">Paquete</Badge>
            <Badge variant="secondary">{paquete.agencias?.razon_social}</Badge>
            {paquete.fecha_inicio && paquete.fecha_fin && (
              <Badge variant="outline">
                {fecha.format(new Date(`${paquete.fecha_inicio}T00:00:00`))} —{" "}
                {fecha.format(new Date(`${paquete.fecha_fin}T00:00:00`))}
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl">{paquete.titulo}</h1>
          {(paquete.ciudad || paquete.estado || paquete.pais) && (
            <p className="text-muted-foreground">
              {[paquete.ciudad, paquete.estado, paquete.pais].filter(Boolean).join(", ")}
            </p>
          )}
          <p className="text-muted-foreground">
            Paquete armado con {componentes.length} componente
            {componentes.length !== 1 ? "s" : ""}.
          </p>

          <div className="mt-4">
            <h2 className="mb-3 font-heading text-lg">El itinerario</h2>
            <ol className="flex flex-col gap-5 border-l-2 border-border pl-4">
              {componentes.map((c, i) => {
                const detalle = detalleById.get(c.listing_id);
                const pasos = (detalle?.itinerario as { pasos?: Paso[] } | null)?.pasos;
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-base">{c.titulo}</p>
                      <Badge variant="outline" className="capitalize">
                        {c.tipo}
                      </Badge>
                    </div>
                    {pasos && pasos.length > 0 ? (
                      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                        {pasos.slice(0, 3).map((p, j) => (
                          <li key={j}>
                            {p.hora} — {p.titulo}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      detalle?.ubicacion && (
                        <p className="text-sm text-muted-foreground">{detalle.ubicacion}</p>
                      )
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {queIncluye.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 font-heading text-lg">¿Qué incluye?</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {queIncluye.map((item) => (
                  <li key={item} className="text-sm">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={whatsappHref(paquete.titulo)}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Preguntar por WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {currency.format(paquete.precio_total)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <PaqueteReservaWidget paqueteId={paquete.id} precioTotal={paquete.precio_total} />
            <Button asChild size="sm" variant="ghost">
              <Link href="/paquetes">Ver otros paquetes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
