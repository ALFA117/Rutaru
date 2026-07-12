"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

const TIPOS = [
  { value: "paquete", label: "Paquetes turísticos" },
  { value: "ruta", label: "Rutas" },
  { value: "hospedaje", label: "Hospedaje" },
  { value: "traslado", label: "Traslados" },
];

export function BuscadorReservas({ ciudades }: { ciudades: string[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState("paquete");
  const [origen, setOrigen] = useState<string>("");
  const [destino, setDestino] = useState<string>("");
  const [entrada, setEntrada] = useState<Date | undefined>();
  const [salida, setSalida] = useState<Date | undefined>();
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [habitaciones, setHabitaciones] = useState(1);

  function buscar() {
    const params = new URLSearchParams();
    params.set("tipo", tipo);
    if (origen) params.set("origen", origen);
    if (destino) params.set("destino", destino);
    if (entrada) params.set("entrada", format(entrada, "yyyy-MM-dd"));
    if (salida) params.set("salida", format(salida, "yyyy-MM-dd"));
    params.set("adultos", String(adultos));
    params.set("ninos", String(ninos));
    params.set("habitaciones", String(habitaciones));
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <Card className="mx-auto -mt-10 w-[calc(100%-2rem)] max-w-5xl shadow-lg sm:-mt-14">
      <CardContent className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-6">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <Label>Paquetes turísticos</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Origen</Label>
          <Select value={origen} onValueChange={setOrigen}>
            <SelectTrigger>
              <SelectValue placeholder="Ciudad de origen" />
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

        <div className="flex flex-col gap-1.5">
          <Label>Destino</Label>
          <Select value={destino} onValueChange={setDestino}>
            <SelectTrigger>
              <SelectValue placeholder="Ciudad destino" />
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

        <div className="flex flex-col gap-1.5">
          <Label>Entrada</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start font-normal">
                <CalendarIcon className="h-4 w-4" />
                {entrada ? format(entrada, "d MMM", { locale: es }) : "Elegir fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={entrada}
                onSelect={setEntrada}
                disabled={{ before: new Date() }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Salida</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start font-normal">
                <CalendarIcon className="h-4 w-4" />
                {salida ? format(salida, "d MMM", { locale: es }) : "Elegir fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={salida}
                onSelect={setSalida}
                disabled={{ before: entrada ?? new Date() }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <Label>Pasajeros y habitaciones</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start font-normal">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {adultos} adulto{adultos !== 1 ? "s" : ""}
                  {ninos > 0 ? `, ${ninos} niño${ninos !== 1 ? "s" : ""}` : ""}
                  {" · "}
                  {habitaciones} habitación{habitaciones !== 1 ? "es" : ""}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-64 flex-col gap-3">
              <ContadorFila label="Adultos" value={adultos} min={1} onChange={setAdultos} />
              <ContadorFila label="Niños" value={ninos} min={0} onChange={setNinos} />
              <ContadorFila
                label="Habitaciones"
                value={habitaciones}
                min={1}
                onChange={setHabitaciones}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end lg:col-span-4">
          <Button size="lg" className="w-full" onClick={buscar}>
            Buscar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContadorFila({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-7 w-7"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Restar ${label.toLowerCase()}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-5 shrink-0 text-center text-sm tabular-nums">{value}</span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => onChange(value + 1)}
          aria-label={`Agregar ${label.toLowerCase()}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
