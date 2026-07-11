"use client";

import { crearDataPackageAction } from "@/lib/data-marketplace/actions";
import { METRICAS_DISPONIBLES } from "@/lib/data/data-packages-metricas-tipos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function DataPackageBuilder() {
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={crearDataPackageAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Métricas incluidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {METRICAS_DISPONIBLES.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
            >
              <Checkbox
                checked={seleccionadas.has(m.id)}
                onCheckedChange={() => toggle(m.id)}
              />
              {seleccionadas.has(m.id) && (
                <input type="hidden" name="metricas" value={m.id} />
              )}
              {m.label}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" name="descripcion" placeholder="Se puede generar con IA después" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="precio">Precio (MXN/mes)</Label>
            <Input id="precio" name="precio" type="number" min={0} defaultValue={15000} required />
          </div>
          <Button type="submit" size="lg" disabled={seleccionadas.size === 0}>
            Publicar paquete de datos
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
