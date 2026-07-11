"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Buscar por destino…"
        defaultValue={searchParams.get("destino") ?? ""}
        onChange={(e) => setParam("destino", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("orden") ?? "recientes"}
        onValueChange={(value) =>
          setParam("orden", value === "recientes" ? "" : value)
        }
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recientes">Más recientes</SelectItem>
          <SelectItem value="precio_asc">Precio: menor a mayor</SelectItem>
          <SelectItem value="precio_desc">Precio: mayor a menor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
