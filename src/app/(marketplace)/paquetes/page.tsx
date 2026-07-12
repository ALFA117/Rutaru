import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { getPaquetes } from "@/lib/data/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/lib/cart/actions";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Paquetes de Agencia",
  description: "Todo incluido, armado por agencias.",
};

export default async function PaquetesPage() {
  const paquetes = await getPaquetes();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-heading text-3xl">Paquetes de Agencia</h1>

      {paquetes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <PackageSearch className="h-10 w-10" />
          <p>Aún no hay paquetes publicados.</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/rutas">Explorar rutas</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {p.agencias?.razon_social}
                </Badge>
                <CardTitle className="font-heading text-xl">
                  <Link href={`/paquete/${p.slug}`} className="hover:underline">
                    {p.titulo}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatCurrency(p.precio_total)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(p.componentes) ? p.componentes.length : 0}{" "}
                  componentes incluidos
                </p>
                <form action={addToCartAction} className="mt-4">
                  <input type="hidden" name="paqueteId" value={p.id} />
                  <Button type="submit" className="w-full">
                    Agregar al carrito
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
