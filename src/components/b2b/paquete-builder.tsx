"use client";

import { useActionState, useMemo, useState } from "react";
import { format } from "date-fns";
import { crearPaqueteAction, type CrearPaqueteState } from "@/lib/b2b/actions-paquetes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

type ListingOpcion = {
  id: string;
  titulo: string;
  tipo: string;
  precio_neto_b2b: number;
  pais: string | null;
  estado: string | null;
  ciudad: string | null;
};

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

// Orden fijo de secciones del constructor (pedido explicito): Hospedaje
// primero, luego Experiencias/Rutas juntas, luego Traslados, luego Eventos.
const SECCIONES: { titulo: string; tipos: string[] }[] = [
  { titulo: "Hospedaje", tipos: ["hospedaje"] },
  { titulo: "Experiencias y Rutas", tipos: ["experiencia", "ruta"] },
  { titulo: "Traslados", tipos: ["traslado"] },
  { titulo: "Eventos", tipos: ["evento"] },
];

export function PaqueteBuilder({ catalogo }: { catalogo: ListingOpcion[] }) {
  const [state, formAction] = useActionState<CrearPaqueteState, FormData>(
    crearPaqueteAction,
    null
  );

  const [pais, setPais] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);

  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [markupPct, setMarkupPct] = useState(15);
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const paises = useMemo(
    () => [...new Set(catalogo.map((l) => l.pais).filter(Boolean))] as string[],
    [catalogo]
  );
  const estados = useMemo(
    () =>
      [
        ...new Set(
          catalogo.filter((l) => l.pais === pais).map((l) => l.estado).filter(Boolean)
        ),
      ] as string[],
    [catalogo, pais]
  );
  const ciudades = useMemo(
    () =>
      [
        ...new Set(
          catalogo
            .filter((l) => l.pais === pais && l.estado === estado)
            .map((l) => l.ciudad)
            .filter(Boolean)
        ),
      ] as string[],
    [catalogo, pais, estado]
  );

  const catalogoFiltrado = useMemo(() => {
    return catalogo.filter((l) => {
      if (pais && l.pais !== pais) return false;
      if (estado && l.estado !== estado) return false;
      if (ciudad && l.ciudad !== ciudad) return false;
      if (busqueda && !l.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (precioMax && l.precio_neto_b2b > Number(precioMax)) return false;
      return true;
    });
  }, [catalogo, pais, estado, ciudad, busqueda, precioMax]);

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

  if (!ubicacionConfirmada) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="font-heading text-lg">¿A dónde es el viaje?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Elige la ubicación del paquete para filtrar el catálogo disponible.
          </p>
          <div className="flex flex-col gap-2">
            <Label>País</Label>
            <Select
              value={pais}
              onValueChange={(v) => {
                setPais(v);
                setEstado("");
                setCiudad("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                {paises.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Estado</Label>
            <Select
              value={estado}
              onValueChange={(v) => {
                setEstado(v);
                setCiudad("");
              }}
              disabled={!pais}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Ciudad</Label>
            <Select value={ciudad} onValueChange={setCiudad} disabled={!estado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ciudad" />
              </SelectTrigger>
              <SelectContent>
                {ciudades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="lg"
            disabled={!pais || !estado || !ciudad}
            onClick={() => setUbicacionConfirmada(true)}
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <input type="hidden" name="listingIds" value={JSON.stringify([...seleccionados])} />
      <input type="hidden" name="pais" value={pais} />
      <input type="hidden" name="estado" value={estado} />
      <input type="hidden" name="ciudad" value={ciudad} />
      <input
        type="hidden"
        name="fechaInicio"
        value={fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : ""}
      />
      <input
        type="hidden"
        name="fechaFin"
        value={fechaFin ? format(fechaFin, "yyyy-MM-dd") : ""}
      />

      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {ciudad}, {estado} — filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="number"
              placeholder="Precio máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="max-w-40"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUbicacionConfirmada(false)}
            >
              Cambiar ubicación
            </Button>
          </CardContent>
        </Card>

        {SECCIONES.map((seccion) => {
          const listings = catalogoFiltrado.filter((l) => seccion.tipos.includes(l.tipo));
          if (listings.length === 0) return null;
          return (
            <Card key={seccion.titulo}>
              <CardHeader>
                <CardTitle className="font-heading text-lg">{seccion.titulo}</CardTitle>
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
                      {l.titulo}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {currency.format(l.precio_neto_b2b)}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>
          );
        })}
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

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label>Fecha inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start font-normal">
                    <CalendarIcon className="h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "d MMM") : "Elegir"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={setFechaInicio}
                    disabled={{ before: new Date() }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Fecha fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start font-normal">
                    <CalendarIcon className="h-4 w-4" />
                    {fechaFin ? format(fechaFin, "d MMM") : "Elegir"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={setFechaFin}
                    disabled={{ before: fechaInicio ?? new Date() }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={seleccionados.size === 0}>
            Publicar paquete
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
