import { requireRole } from "@/lib/auth/guards";
import { getOperadorDashboardData } from "@/lib/data/dashboard-operador";
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

export default async function OperadorPage() {
  const { user } = await requireRole("operador");
  const data = await getOperadorDashboardData(user.id);

  if (!data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
        <h1 className="font-heading text-2xl">Sin perfil de operador</h1>
        <p className="text-muted-foreground">
          Tu cuenta tiene rol operador pero no tiene una fila en la tabla
          `operadores` todavía.
        </p>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  }

  const { totales, ventas, topListings, listings } = data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl">Dashboard de operador</h1>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Ventas totales" value={currency.format(totales.totalVentas)} />
        <StatTile label="Reservas" value={String(totales.totalReservas)} />
        <StatTile
          label="Ticket promedio"
          value={currency.format(totales.ticketPromedio)}
        />
        <StatTile label="Ocupación" value={`${totales.ocupacionPct}%`} hint="próximos 90 días" />
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
            <CardTitle className="font-heading text-lg">Top listings</CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart
              data={topListings ?? []}
              dataKey="reservas"
              valueLabel="Reservas"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Tu inventario ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {listings.map((l) => (
              <li key={l.id} className="flex justify-between py-2 text-sm">
                <span>{l.titulo}</span>
                <span className="tabular-nums text-muted-foreground">
                  {currency.format(l.precio_b2c)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
