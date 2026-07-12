import Image from "next/image";
import Link from "next/link";
import {
  Bus,
  Car,
  UserCheck,
  Ticket,
  Coffee,
  Droplet,
  Shield,
  Wifi,
  UtensilsCrossed,
  BedDouble,
  Clock,
  Backpack,
  Plane,
  Camera,
  Lock,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ReservaWidget } from "@/components/marketplace/reserva-widget";
import type { Listing } from "@/lib/data/listings";
import { getListingsRelacionados } from "@/lib/data/listings";
import { getArticulosPorListing } from "@/lib/data/articulos";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import type { Database } from "@/types/database.types";
import { addToCartAction } from "@/lib/cart/actions";
import { track } from "@/lib/tracking/track";

type Disponibilidad = Database["public"]["Tables"]["disponibilidad"]["Row"];
type Resena = Database["public"]["Tables"]["resenas"]["Row"];

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});

type Zona = { nombre: string; precio: number };
type Paso = { hora: string; titulo: string; descripcion: string };
type Itinerario = { pasos?: Paso[]; zonas?: Zona[] };

const TIPO_BADGE: Record<string, string> = {
  ruta: "Ruta Abierta",
  hospedaje: "Hospedaje",
  traslado: "Traslado",
  evento: "Evento",
  experiencia: "Experiencia",
};

const CATEGORIA_BREADCRUMB: Record<string, { titulo: string; href: string }> = {
  ruta: { titulo: "Rutas y Tours", href: "/rutas" },
  hospedaje: { titulo: "Hospedaje", href: "/hospedaje" },
  traslado: { titulo: "Traslados y Movilidad", href: "/traslados" },
  evento: { titulo: "Eventos y Boletaje", href: "/eventos" },
  experiencia: { titulo: "Experiencias", href: "/experiencias" },
};

function iconoIncluye(item: string) {
  const s = item.toLowerCase();
  if (s.includes("transporte")) return Bus;
  if (s.includes("chofer") || s.includes("vehículo")) return Car;
  if (s.includes("guía") || s.includes("instructor")) return UserCheck;
  if (s.includes("entrada") || s.includes("acceso") || s.includes("boleto")) return Ticket;
  if (s.includes("snack") || s.includes("food")) return Coffee;
  if (s.includes("agua")) return Droplet;
  if (s.includes("seguro")) return Shield;
  if (s.includes("wifi")) return Wifi;
  if (s.includes("cocina")) return UtensilsCrossed;
  if (s.includes("ropa de cama") || s.includes("toallas")) return BedDouble;
  if (s.includes("check-in") || s.includes("atención")) return Clock;
  if (s.includes("equipaje")) return Backpack;
  if (s.includes("monitoreo de vuelo")) return Plane;
  if (s.includes("fotograf")) return Camera;
  if (s.includes("casillero") || s.includes("seguridad")) return Lock;
  return CheckCircle2;
}

function whatsappHref(titulo: string) {
  const texto = `Hola, tengo una pregunta sobre: ${titulo}`;
  return `https://wa.me/525575653059?text=${encodeURIComponent(texto)}`;
}

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

  const itinerario = (listing.itinerario ?? null) as Itinerario | null;
  const pasos = itinerario?.pasos;
  const zonas = itinerario?.zonas;
  const relacionados = await getListingsRelacionados(listing, 4);
  const articulos = await getArticulosPorListing(listing.id);
  const categoria = CATEGORIA_BREADCRUMB[listing.tipo];
  const proximaSalida = disponibilidad[0]?.fecha;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Inicio
        </Link>
        {categoria && (
          <>
            <span>/</span>
            <Link href={categoria.href} className="hover:text-foreground">
              {categoria.titulo}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{listing.titulo}</span>
      </nav>

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="w-fit">{TIPO_BADGE[listing.tipo] ?? listing.tipo}</Badge>
            {listing.duracion && <Badge variant="outline">{listing.duracion}</Badge>}
            {listing.dificultad && <Badge variant="outline">{listing.dificultad}</Badge>}
            {proximaSalida && (
              <Badge variant="outline">
                Próxima salida: {fecha.format(new Date(`${proximaSalida}T00:00:00`))}
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl">{listing.titulo}</h1>
          {listing.ubicacion && (
            <p className="text-muted-foreground">{listing.ubicacion}</p>
          )}
          {listing.descripcion && (
            <p className="max-w-2xl leading-relaxed text-foreground/90">
              {listing.descripcion}
            </p>
          )}

          {pasos && pasos.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 font-heading text-lg">El itinerario</h2>
              <ol className="flex flex-col gap-4 border-l-2 border-border pl-4">
                {pasos.map((p, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                    <p className="text-sm font-medium tabular-nums text-accent">{p.hora}</p>
                    <p className="font-heading text-base">{p.titulo}</p>
                    <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                  </li>
                ))}
              </ol>
            </div>
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
                      {formatCurrency(z.precio)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listing.que_incluye && listing.que_incluye.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 font-heading text-lg">¿Qué incluye?</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {listing.que_incluye.map((item) => {
                  const Icono = iconoIncluye(item);
                  return (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Icono className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {listing.cancelaciones && (
            <div className="mt-4">
              <h2 className="mb-2 font-heading text-lg">Cancelaciones</h2>
              <p className="text-sm text-muted-foreground">{listing.cancelaciones}</p>
            </div>
          )}

          <div className="mt-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={whatsappHref(listing.titulo)}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Preguntar por WhatsApp
              </a>
            </Button>
          </div>

          {articulos.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 font-heading text-lg">Artículos</h2>
              <ul className="flex flex-col gap-3">
                {articulos.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/articulos/${a.slug}`}
                      className="block rounded-md border border-border p-3 text-sm hover:border-accent"
                    >
                      <span className="font-heading text-base">{a.titulo}</span>
                      {a.extracto && (
                        <p className="mt-1 text-muted-foreground">{a.extracto}</p>
                      )}
                    </Link>
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
                {formatCurrency(listing.precio_b2c)}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                MXN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {listing.tipo === "evento" ? (
              <>
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
              </>
            ) : (
              <ReservaWidget
                listingId={listing.id}
                tipo={listing.tipo}
                precioB2c={listing.precio_b2c}
                disponibilidad={disponibilidad}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {relacionados.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-heading text-2xl">También te puede gustar</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((r) => (
              <ListingCard
                key={r.id}
                listing={r}
                href={DETAIL_HREF[r.tipo]?.(r.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
