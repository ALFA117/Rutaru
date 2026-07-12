"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { reservarAction } from "@/lib/cart/actions";
import { formatCurrency } from "@/lib/format";

type DisponibilidadRow = { fecha: string; cupo_disponible: number };

export function ReservaWidget({
  listingId,
  tipo,
  precioB2c,
  disponibilidad,
}: {
  listingId: string;
  tipo: string;
  precioB2c: number;
  disponibilidad: DisponibilidadRow[];
}) {
  const fechasConCupo = useMemo(
    () => new Set(disponibilidad.filter((d) => d.cupo_disponible > 0).map((d) => d.fecha)),
    [disponibilidad]
  );
  const [fecha, setFecha] = useState<Date | undefined>();
  const [cantidad, setCantidad] = useState(1);

  const etiquetaCantidad = tipo === "hospedaje" ? "Habitaciones" : "Pasajeros";
  const total = precioB2c * cantidad;
  const fechaIso = fecha ? format(fecha, "yyyy-MM-dd") : "";

  if (fechasConCupo.size === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin fechas disponibles por el momento. Pregúntanos por WhatsApp.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium">Elige una fecha</p>
        <Calendar
          mode="single"
          selected={fecha}
          onSelect={setFecha}
          disabled={(date) => !fechasConCupo.has(format(date, "yyyy-MM-dd"))}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">{etiquetaCantidad}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={cantidad <= 1}
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            aria-label={`Restar ${etiquetaCantidad.toLowerCase()}`}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-5 shrink-0 text-center text-sm tabular-nums">{cantidad}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setCantidad((c) => c + 1)}
            aria-label={`Agregar ${etiquetaCantidad.toLowerCase()}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium">Total</span>
        <span className="font-heading text-xl tabular-nums">{formatCurrency(total)}</span>
      </div>

      <form action={reservarAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="fecha" value={fechaIso} />
        <input type="hidden" name="cantidad" value={cantidad} />
        <Button size="lg" type="submit" className="w-full" disabled={!fecha}>
          Reservar
        </Button>
      </form>
    </div>
  );
}
