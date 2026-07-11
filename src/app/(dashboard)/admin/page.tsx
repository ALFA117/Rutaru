import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardData } from "@/lib/data/dashboard-admin";
import { getLatestInsights } from "@/lib/data/insights";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { ConversionFunnelChart } from "@/components/dashboard/funnel-chart";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function AdminPage() {
  await requireRole("admin");
  const [{ funnel, categorias, destinos, topAfiliados, totales }, insights] =
    await Promise.all([getAdminDashboardData(), getLatestInsights()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl">Dashboard global (admin)</h1>
        <div className="flex gap-2">
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
        <StatTile label="Ventas totales" value={currency.format(totales.totalVentas)} />
        <StatTile label="Eventos registrados" value={String(totales.totalEventos)} />
        <StatTile
          label="Comisiones generadas"
          value={currency.format(totales.totalComisiones)}
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
            <CardTitle className="font-heading text-lg">Top afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={topAfiliados} dataKey="monto" valueLabel="Comisión" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Ventas por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={categorias} dataKey="monto" valueLabel="Ventas" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Ventas por destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopBarChart data={destinos} dataKey="monto" valueLabel="Ventas" />
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
