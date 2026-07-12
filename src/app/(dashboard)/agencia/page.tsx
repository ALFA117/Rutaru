import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAgenciaDashboardData } from "@/lib/data/dashboard-agencia";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Cotizado",
  confirmada: "Confirmado",
  pagada: "Pagado",
  cancelada: "Cancelado",
  completada: "Completado",
};

export default async function AgenciaPage() {
  const { user } = await requireRole("agencia");
  const data = await getAgenciaDashboardData(user.id);

  if (!data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
        <h1 className="font-heading text-2xl">Sin perfil de agencia</h1>
        <p className="text-muted-foreground">
          Tu cuenta tiene rol agencia pero no tiene una fila en la tabla
          `agencias` todavía.
        </p>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  }

  const { totales, ventas, topPaquetes, paquetes, margenesPorPaquete, ordenesB2B, allotments } = data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-y-2">
        <h1 className="font-heading text-3xl">Dashboard de agencia</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/agencia/catalogo">Catálogo B2B</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/agencia/paquetes/nuevo">Nuevo paquete</Link>
          </Button>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="Ventas de paquetes" value={formatCurrency(totales.totalVentas)} />
        <StatTile label="Órdenes B2C" value={String(totales.totalOrdenes)} hint="paquetes vendidos a clientes" />
        <StatTile label="Ticket promedio" value={formatCurrency(totales.ticketPromedio)} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Ventas por día</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={ventas} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top paquetes</CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart
              data={topPaquetes ?? []}
              dataKey="monto"
              valueLabel="Ventas"
              format="currency"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Tus paquetes ({paquetes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {paquetes.map((p) => {
              const margen = margenesPorPaquete.find((m) => m.titulo === p.titulo);
              return (
                <li key={p.id} className="flex justify-between py-2 text-sm">
                  <span>{p.titulo}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(p.precio_total)} · markup {p.markup_pct}%
                    {margen && (
                      <span className="ml-2 text-accent">
                        margen {formatCurrency(margen.margen)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Allotments comprados vs. vendidos en el mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allotments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aún no has comprado bloques B2B.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {allotments.map((a) => (
                  <li key={a.listingId} className="flex flex-col gap-1 py-2 text-sm">
                    <span className="font-medium">{a.titulo}</span>
                    <span className="text-muted-foreground">
                      Comprados: {a.comprados} · Vendidos en el mercado (todos los
                      canales): {a.vendidosMercado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Órdenes B2B</CardTitle>
          </CardHeader>
          <CardContent>
            {ordenesB2B.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aún no has comprado bloques al mayoreo.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {ordenesB2B.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ESTADO_LABEL[o.estado] ?? o.estado}</Badge>
                      <Link href={`/agencia/ordenes/${o.id}`} className="hover:underline">
                        {o.orden_items?.[0]?.listings?.titulo ?? "Orden"}
                      </Link>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(o.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
