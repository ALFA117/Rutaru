import Link from "next/link";
import { Luggage } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getMisViajes } from "@/lib/data/dashboard-cliente";
import { getParaTiListings } from "@/lib/data/recommendations";
import { ListingCard } from "@/components/marketplace/listing-card";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  actualizarConsentimientoAction,
  anclarConsentimientoAction,
} from "@/lib/perfil/actions";
import { formatCurrency } from "@/lib/format";
import type { ListingTipo } from "@/lib/data/listings";
import { BLOCKCHAIN_ENABLED } from "@/config/flags";
import { etherscanTokenUrl, etherscanTxUrl } from "@/lib/blockchain/config";

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pagada: "default",
  completada: "default",
  pendiente: "outline",
  confirmada: "secondary",
  cancelada: "outline",
};

export default async function ClientePage() {
  const { user, profile } = await requireRole("cliente");
  const [viajes, { listings: paraTi, personalizado }] = await Promise.all([
    getMisViajes(user.id),
    getParaTiListings(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-y-2">
        <h1 className="font-heading text-3xl">Hola, {profile.nombre ?? "viajero"}</h1>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Mis viajes</CardTitle>
        </CardHeader>
        <CardContent>
          {viajes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <Luggage className="h-10 w-10" />
              <p>Aún no tienes compras.</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/rutas">Explorar rutas</Link>
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {viajes.map((orden) => (
                <li key={orden.id} className="flex flex-col gap-2 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={ESTADO_VARIANT[orden.estado] ?? "outline"}>
                        {orden.estado}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {fecha.format(new Date(orden.created_at))}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(orden.total)}
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground">
                    {orden.orden_items?.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center gap-2">
                        <span>
                          {item.listings?.titulo ?? item.paquetes?.titulo} × {item.cantidad}
                          {item.fecha_servicio &&
                            ` — ${fecha.format(new Date(`${item.fecha_servicio}T00:00:00`))}`}
                        </span>
                        {item.nft_tickets?.[0] && (
                          <a
                            href={etherscanTokenUrl(
                              item.nft_tickets[0].contract_address ?? "",
                              item.nft_tickets[0].token_id ?? 0
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline"
                          >
                            NFT-ticket en Etherscan ↗
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  {orden.tx_hash_blockchain && (
                    <a
                      href={etherscanTxUrl(orden.tx_hash_blockchain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline text-muted-foreground"
                    >
                      Ver pago en Etherscan ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-2xl">Para ti</h2>
        {personalizado && <Badge variant="secondary">Basado en tu historial</Badge>}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paraTi.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            href={DETAIL_HREF[listing.tipo as ListingTipo]?.(listing.slug)}
          />
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Privacidad de tus datos</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={actualizarConsentimientoAction}>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                name="consiente"
                value="on"
                defaultChecked={profile.consiente_datos_agregados}
                className="mt-0.5"
              />
              <span className="text-muted-foreground">
                Permitir que mi actividad se use de forma agregada y anónima
                (nunca mi nombre, correo o identidad) en el Data Marketplace
                de Rutaru.
              </span>
            </label>
            <Button type="submit" size="sm" variant="outline" className="mt-3">
              Guardar preferencia
            </Button>
          </form>

          {BLOCKCHAIN_ENABLED && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-medium">Consentimiento anclado on-chain</p>
              {profile.consentimiento_tx_hash ? (
                <a
                  href={etherscanTxUrl(profile.consentimiento_tx_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm underline"
                >
                  Ver transacción en Etherscan ↗
                </a>
              ) : (
                <form action={anclarConsentimientoAction}>
                  <p className="mb-2 mt-1 text-sm text-muted-foreground">
                    Ancla un hash de tu preferencia de consentimiento en Sepolia,
                    verificable públicamente.
                  </p>
                  <Button type="submit" size="sm" variant="outline">
                    Anclar en blockchain (testnet)
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
