import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAgenciaDashboardData } from "@/lib/data/dashboard-agencia";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

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

  const { totales, ventas, topPaquetes, paquetes } = data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl">Dashboard de agencia</h1>
        <div className="flex gap-2">
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
        <StatTile label="Ventas de paquetes" value={currency.format(totales.totalVentas)} />
        <StatTile label="Órdenes B2C" value={String(totales.totalOrdenes)} hint="paquetes vendidos a clientes" />
        <StatTile label="Ticket promedio" value={currency.format(totales.ticketPromedio)} />
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
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Tus paquetes ({paquetes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {paquetes.map((p) => (
              <li key={p.id} className="flex justify-between py-2 text-sm">
                <span>{p.titulo}</span>
                <span className="tabular-nums text-muted-foreground">
                  {currency.format(p.precio_total)} · markup {p.markup_pct}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
