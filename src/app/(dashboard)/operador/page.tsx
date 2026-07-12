import { requireRole } from "@/lib/auth/guards";
import { getOperadorDashboardData } from "@/lib/data/dashboard-operador";
import { getReservasBlockchainPendientes } from "@/lib/data/dashboard-operador-blockchain";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BLOCKCHAIN_ENABLED } from "@/config/flags";
import { etherscanTxUrl } from "@/lib/blockchain/config";
import {
  actualizarWalletOperadorAction,
  completarServicioAction,
  cancelarReservaAction,
} from "@/lib/blockchain/dashboard-actions";
import { formatCurrency } from "@/lib/format";

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

  const { operador, totales, ventas, topListings, listings, reservasProximas } = data;
  const reservasBlockchain = BLOCKCHAIN_ENABLED
    ? await getReservasBlockchainPendientes(operador.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-y-2">
        <h1 className="font-heading text-3xl">Dashboard de operador</h1>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Ventas totales"
          value={formatCurrency(totales.totalVentas)}
          trend={ventas.slice(-14).map((v) => v.monto)}
        />
        <StatTile label="Reservas" value={String(totales.totalReservas)} />
        <StatTile
          label="Ticket promedio"
          value={formatCurrency(totales.ticketPromedio)}
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
                  {formatCurrency(l.precio_b2c)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Próximas reservas ({reservasProximas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservasProximas.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No hay reservas con fecha próxima todavía.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {reservasProximas.map((r) => (
                <li key={r.id} className="flex justify-between py-2 text-sm">
                  <span>
                    {r.listings?.titulo} × {r.cantidad}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {r.fecha_servicio &&
                      new Intl.DateTimeFormat("es-MX", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(`${r.fecha_servicio}T00:00:00`))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {BLOCKCHAIN_ENABLED && (
        <>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Reservas blockchain pendientes ({reservasBlockchain.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservasBlockchain.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No hay reservas en escrow esperando confirmación.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {reservasBlockchain.map((r) => (
                    <li key={r.ordenId} className="flex flex-col gap-2 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm">{r.listings.join(", ")}</span>
                        <a
                          href={etherscanTxUrl(r.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline text-muted-foreground"
                        >
                          Ver pago en Etherscan ↗
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={completarServicioAction}>
                          <input type="hidden" name="ordenId" value={r.ordenId} />
                          <Button type="submit" size="sm">
                            Marcar completado
                          </Button>
                        </form>
                        <form action={cancelarReservaAction}>
                          <input type="hidden" name="ordenId" value={r.ordenId} />
                          <Button type="submit" size="sm" variant="outline">
                            Cancelar y reembolsar
                          </Button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8 max-w-md">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Wallet para recibir pagos on-chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={actualizarWalletOperadorAction} className="flex flex-col gap-2">
                <Label htmlFor="walletAddress">Dirección de wallet (Sepolia)</Label>
                <Input
                  id="walletAddress"
                  name="walletAddress"
                  placeholder="0x…"
                  defaultValue={operador.wallet_address ?? ""}
                />
                <Button type="submit" size="sm" variant="outline" className="mt-1 w-fit">
                  Guardar
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
