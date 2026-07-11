import { requireRole } from "@/lib/auth/guards";
import { getAfiliadoDashboardData } from "@/lib/data/dashboard-afiliado";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function AfiliadoPage() {
  const { user } = await requireRole("afiliado");
  const data = await getAfiliadoDashboardData(user.id);

  if (!data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
        <h1 className="font-heading text-2xl">Sin perfil de afiliado</h1>
        <p className="text-muted-foreground">
          Tu cuenta tiene rol afiliado pero no tiene una fila en la tabla
          `afiliados` todavía.
        </p>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  }

  const { afiliado, totales, serieComisiones } = data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl">Dashboard de afiliado</h1>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Badge variant="secondary">
          5% — <code className="ml-1">/a/{afiliado.codigo_5}</code>
        </Badge>
        <Badge variant="secondary">
          10% — <code className="ml-1">/a/{afiliado.codigo_10}</code>
        </Badge>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clics" value={String(totales.clics)} />
        <StatTile
          label="Conversiones"
          value={String(totales.conversiones)}
          hint={`${totales.tasaConversion}% tasa de conversión`}
        />
        <StatTile
          label="Ventas atribuidas"
          value={currency.format(totales.ventasAtribuidas)}
        />
        <StatTile
          label="Comisiones"
          value={currency.format(totales.totalComisiones)}
          hint={`${currency.format(totales.comisionesPendientes)} pendientes`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Comisiones por día</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesAreaChart data={serieComisiones} />
        </CardContent>
      </Card>
    </div>
  );
}
