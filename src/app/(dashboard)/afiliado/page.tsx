import { requireRole } from "@/lib/auth/guards";
import { getAfiliadoDashboardData } from "@/lib/data/dashboard-afiliado";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { regenerarCodigoAction, solicitarPagoAction } from "@/lib/afiliado/actions";

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

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Badge variant="secondary">
          5% — <code className="ml-1">/a/{afiliado.codigo_5}</code>
        </Badge>
        <form action={regenerarCodigoAction}>
          <input type="hidden" name="tipo" value="5" />
          <Button variant="ghost" size="sm" type="submit">
            Regenerar
          </Button>
        </form>
        <Badge variant="secondary">
          10% — <code className="ml-1">/a/{afiliado.codigo_10}</code>
        </Badge>
        <form action={regenerarCodigoAction}>
          <input type="hidden" name="tipo" value="10" />
          <Button variant="ghost" size="sm" type="submit">
            Regenerar
          </Button>
        </form>
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

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Comisiones por día</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={serieComisiones} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Pago de comisiones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Pendiente por cobrar:{" "}
              <span className="font-medium text-foreground">
                {currency.format(totales.comisionesPendientes)}
              </span>
            </p>
            {afiliado.pago_solicitado_at ? (
              <p className="text-sm text-muted-foreground">
                Solicitud enviada el{" "}
                {new Intl.DateTimeFormat("es-MX", {
                  day: "numeric",
                  month: "short",
                }).format(new Date(afiliado.pago_solicitado_at))}
                .
              </p>
            ) : (
              <form action={solicitarPagoAction}>
                <Button
                  type="submit"
                  disabled={totales.comisionesPendientes <= 0}
                  className="w-full"
                >
                  Solicitar pago
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
