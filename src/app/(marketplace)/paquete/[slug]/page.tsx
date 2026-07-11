import { notFound } from "next/navigation";
import { getPaqueteBySlug } from "@/lib/data/listings";
import type { ListingTipo } from "@/lib/data/listings";
import { addToCartAction } from "@/lib/cart/actions";
import { track } from "@/lib/tracking/track";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type Componente = { listing_id: string; titulo: string; tipo: ListingTipo };

export default async function PaqueteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paquete = await getPaqueteBySlug(slug);
  if (!paquete) notFound();

  await track({ tipoEvento: "page_view", entidad: slug, metadata: { tipo: "paquete" } });

  const componentes = (paquete.componentes as Componente[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <Badge variant="secondary" className="mb-3 w-fit">
        {paquete.agencias?.razon_social}
      </Badge>
      <h1 className="mb-2 font-heading text-3xl md:text-4xl">{paquete.titulo}</h1>
      <p className="mb-8 text-muted-foreground">
        Paquete armado con {componentes.length} componentes.
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="font-heading text-lg">Incluye</h2>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {componentes.map((c, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{c.titulo}</span>
                <Badge variant="outline" className="capitalize">
                  {c.tipo}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {currency.format(paquete.precio_total)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={addToCartAction}>
              <input type="hidden" name="paqueteId" value={paquete.id} />
              <Button size="lg" type="submit" className="w-full">
                Agregar al carrito
              </Button>
            </form>
            <Button asChild size="sm" variant="ghost">
              <Link href="/paquetes">Ver otros paquetes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
