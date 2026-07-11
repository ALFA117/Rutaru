"use client";

import { useMemo, useState } from "react";
import { crearPaqueteAction } from "@/lib/b2b/actions-paquetes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ListingOpcion = {
  id: string;
  titulo: string;
  tipo: string;
  precio_neto_b2b: number;
};

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function PaqueteBuilder({ catalogo }: { catalogo: ListingOpcion[] }) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [markupPct, setMarkupPct] = useState(15);

  const costoNeto = useMemo(
    () =>
      catalogo
        .filter((l) => seleccionados.has(l.id))
        .reduce((acc, l) => acc + l.precio_neto_b2b, 0),
    [catalogo, seleccionados]
  );
  const precioTotal = Math.round(costoNeto * (1 + markupPct / 100));

  function toggle(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const porTipo = useMemo(() => {
    const grupos = new Map<string, ListingOpcion[]>();
    for (const l of catalogo) {
      if (!grupos.has(l.tipo)) grupos.set(l.tipo, []);
      grupos.get(l.tipo)!.push(l);
    }
    return [...grupos.entries()];
  }, [catalogo]);

  return (
    <form action={crearPaqueteAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {porTipo.map(([tipo, listings]) => (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle className="font-heading text-lg capitalize">{tipo}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {listings.map((l) => (
                <label
                  key={l.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-secondary"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={seleccionados.has(l.id)}
                      onCheckedChange={() => toggle(l.id)}
                    />
                    {seleccionados.has(l.id) && (
                      <input type="hidden" name="listingIds" value={l.id} />
                    )}
                    {l.titulo}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {currency.format(l.precio_neto_b2b)}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="titulo">Título del paquete</Label>
            <Input id="titulo" name="titulo" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="markupPct">Markup %</Label>
            <Input
              id="markupPct"
              name="markupPct"
              type="number"
              min={0}
              value={markupPct}
              onChange={(e) => setMarkupPct(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Componentes</span>
            <span>{seleccionados.size}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Costo neto</span>
            <span className="tabular-nums">{currency.format(costoNeto)}</span>
          </div>
          <div className="flex justify-between font-heading text-xl">
            <span>Precio público</span>
            <span className="tabular-nums">{currency.format(precioTotal)}</span>
          </div>
          <Button type="submit" size="lg" disabled={seleccionados.size === 0}>
            Publicar paquete
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
