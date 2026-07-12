import Link from "next/link";
import Image from "next/image";
import { getArticulos } from "@/lib/data/articulos";
import { Badge } from "@/components/ui/badge";

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticulosPage() {
  const articulos = await getArticulos();
  const destacados = articulos.slice(0, 4);
  const resto = articulos.slice(4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="mb-2 font-heading text-3xl">Artículos</h1>
      <p className="mb-10 text-muted-foreground">
        Historia, gastronomía y consejos de viaje detrás de cada ruta.
      </p>

      {destacados.length > 0 && (
        <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((a) => (
            <Link
              key={a.id}
              href={`/articulos/${a.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              {a.imagen && (
                <Image
                  src={a.imagen}
                  alt={a.titulo}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                {a.categoria && (
                  <Badge className="w-fit bg-accent text-accent-foreground">
                    {a.categoria}
                  </Badge>
                )}
                <h2 className="font-heading text-lg leading-tight text-white">
                  {a.titulo}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {resto.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {resto.map((a) => (
            <Link key={a.id} href={`/articulos/${a.slug}`} className="group flex flex-col gap-3">
              {a.imagen && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={a.imagen}
                    alt={a.titulo}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                {a.categoria && <Badge variant="outline">{a.categoria}</Badge>}
                <h2 className="font-heading text-lg leading-tight group-hover:underline">
                  {a.titulo}
                </h2>
                {a.extracto && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {a.extracto}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {fecha.format(new Date(a.publicado_at))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
