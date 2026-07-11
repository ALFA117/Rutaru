import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrdenConDetalle } from "@/lib/data/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ ordenId: string }>;
}) {
  const { ordenId } = await params;
  const orden = await getOrdenConDetalle(ordenId);
  if (!orden) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="mb-8 flex flex-col items-start gap-2">
        <Badge className="bg-accent text-accent-foreground">
          {orden.estado === "pagada" ? "Pago aprobado" : orden.estado}
        </Badge>
        <h1 className="font-heading text-3xl">¡Gracias por tu compra!</h1>
        <p className="text-muted-foreground">
          Folio de tu orden:{" "}
          <code className="rounded bg-secondary px-2 py-1 text-sm">
            {orden.id}
          </code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orden.orden_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.listings?.titulo} × {item.cantidad}
              </span>
              <span className="tabular-nums">{currency.format(item.precio)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">{currency.format(orden.subtotal)}</span>
          </div>
          {orden.descuento > 0 && (
            <div className="flex justify-between text-sm text-accent">
              <span>Descuento ({orden.codigo_afiliado})</span>
              <span className="tabular-nums">
                -{currency.format(orden.descuento)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-heading text-lg">
            <span>Total</span>
            <span className="tabular-nums">{currency.format(orden.total)}</span>
          </div>
          {orden.pagos?.[0] && (
            <p className="text-xs text-muted-foreground">
              Pago vía Pioneer Pay ({orden.pagos[0].pasarela}) — referencia{" "}
              {orden.pagos[0].referencia}
            </p>
          )}
        </CardContent>
      </Card>

      <Button asChild className="mt-6">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
