import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getListingParaCompra } from "@/lib/data/b2b-orders";
import { comprarAllotmentAction } from "@/lib/b2b/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function ComprarAllotmentPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  await requireRole("agencia");
  const { listingId } = await searchParams;
  if (!listingId) notFound();

  const { listing, disponibilidad } = await getListingParaCompra(listingId);
  if (!listing) notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl">Comprar bloque</h1>
      <p className="mb-8 text-muted-foreground">{listing.titulo}</p>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Tarifa neta: {currency.format(listing.precio_neto_b2b ?? 0)} / lugar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {disponibilidad.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay disponibilidad futura para este listing.
            </p>
          ) : (
            <form action={comprarAllotmentAction} className="flex flex-col gap-4">
              <input type="hidden" name="listingId" value={listing.id} />

              <div className="flex flex-col gap-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Select name="fecha" required>
                  <SelectTrigger id="fecha">
                    <SelectValue placeholder="Elige una fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponibilidad.map((d) => (
                      <SelectItem key={d.id} value={d.fecha}>
                        {d.fecha} — {d.cupo_disponible} cupos disponibles
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cantidad">Cantidad de cupos</Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min={1}
                  defaultValue={10}
                  required
                />
              </div>

              <ul className="text-xs text-muted-foreground">
                <li>10+ cupos: 5% de descuento sobre tarifa neta</li>
                <li>20+ cupos: 10% de descuento sobre tarifa neta</li>
              </ul>

              <Button type="submit" size="lg">
                Cotizar y reservar bloque
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
