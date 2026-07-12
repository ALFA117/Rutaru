"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservarPaqueteAction } from "@/lib/cart/actions";
import { formatCurrency } from "@/lib/format";

export function PaqueteReservaWidget({
  paqueteId,
  precioTotal,
}: {
  paqueteId: string;
  precioTotal: number;
}) {
  const [pasajeros, setPasajeros] = useState(1);
  const total = precioTotal * pasajeros;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Pasajeros</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={pasajeros <= 1}
            onClick={() => setPasajeros((p) => Math.max(1, p - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-4 text-center text-sm tabular-nums">{pasajeros}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setPasajeros((p) => p + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium">Total</span>
        <span className="font-heading text-xl tabular-nums">{formatCurrency(total)}</span>
      </div>

      <form action={reservarPaqueteAction}>
        <input type="hidden" name="paqueteId" value={paqueteId} />
        <input type="hidden" name="pasajeros" value={pasajeros} />
        <Button size="lg" type="submit" className="w-full">
          Reservar
        </Button>
      </form>
    </div>
  );
}
