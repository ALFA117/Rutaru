import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardData, type RangoFechas } from "@/lib/data/dashboard-admin";
import { getLatestInsights } from "@/lib/data/insights";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { ConversionFunnelChart } from "@/components/dashboard/funnel-chart";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { DateRangeSelect } from "@/components/dashboard/date-range-select";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

function parseRango(valor?: string): RangoFechas {
  if (valor === "7" || valor === "90") return Number(valor) as RangoFechas;
  if (valor === "todo") return "todo";
  return 30;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  await requireRole("admin");
  const { rango: rangoParam } = await searchParams;
  const rango = parseRango(rangoParam);

  const [
    { funnel, categorias, destinos, topAfiliados, topListings, heatmap, serieVentas, totales },
    insights,
  ] = await Promise.all([getAdminDashboardData(rango), getLatestInsights()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl">Dashboard global (admin)</h1>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelect />
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/datos">Data Marketplace</Link>
          </Button>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile
          label="Ventas totales"
          value={formatCurrency(totales.totalVentas)}
          trend={serieVentas.slice(-14).map((v) => v.monto)}
        />
        <StatTile label="Eventos registrados" value={String(totales.totalEventos)} />
        <StatTile
          label="Comisiones generadas"
          value={formatCurrency(totales.totalComisiones)}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Funnel de conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionFunnelChart data={funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top 5 listings</CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={topListings} dataKey="monto" valueLabel="Ventas" format="currency" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={topAfiliados} dataKey="monto" valueLabel="Comisión" format="currency" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Ventas por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={categorias} dataKey="monto" valueLabel="Ventas" format="currency" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Ventas por destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={destinos} dataKey="monto" valueLabel="Ventas" format="currency" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Actividad por día y hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap data={heatmap} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Motor de insights (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InsightsPanel insights={insights} />
        </CardContent>
      </Card>
    </div>
  );
}
