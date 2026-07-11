import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getOrdenB2B } from "@/lib/data/b2b-orders";
import { confirmarOrdenB2BAction, pagarOrdenB2BAction } from "@/lib/b2b/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Cotizado",
  confirmada: "Confirmado",
  pagada: "Pagado",
  cancelada: "Cancelado",
  completada: "Completado",
};

export default async function OrdenB2BPage({
  params,
}: {
  params: Promise<{ ordenId: string }>;
}) {
  await requireRole("agencia");
  const { ordenId } = await params;
  const orden = await getOrdenB2B(ordenId);
  if (!orden) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-heading text-3xl">Orden B2B</h1>
        <Badge>{ESTADO_LABEL[orden.estado] ?? orden.estado}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orden.orden_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.listings?.titulo} × {item.cantidad}{" "}
                {item.fecha_servicio && `— ${item.fecha_servicio}`}
              </span>
              <span className="tabular-nums">
                {currency.format(item.cantidad * item.precio)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">{currency.format(orden.subtotal)}</span>
          </div>
          {orden.descuento > 0 && (
            <div className="flex justify-between text-sm text-accent">
              <span>Descuento por volumen</span>
              <span className="tabular-nums">-{currency.format(orden.descuento)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading text-lg">
            <span>Total</span>
            <span className="tabular-nums">{currency.format(orden.total)}</span>
          </div>

          {orden.pagos?.[0] && (
            <p className="text-xs text-muted-foreground">
              Pago vía Pioneer Pay — referencia {orden.pagos[0].referencia}
            </p>
          )}

          <div className="mt-4 flex gap-3">
            {orden.estado === "pendiente" && (
              <form action={confirmarOrdenB2BAction}>
                <input type="hidden" name="ordenId" value={orden.id} />
                <Button type="submit">Confirmar cotización</Button>
              </form>
            )}
            {orden.estado === "confirmada" && (
              <form action={pagarOrdenB2BAction}>
                <input type="hidden" name="ordenId" value={orden.id} />
                <Button type="submit">Pagar con Pioneer Pay</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
