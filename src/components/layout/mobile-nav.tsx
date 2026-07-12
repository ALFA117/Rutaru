"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Categoria } from "@/lib/data/categorias";

export function MobileNav({ categorias }: { categorias: Categoria[] }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {categorias.map((c) => (
          <DropdownMenuItem key={c.href} asChild>
            <Link href={c.href} className="min-h-11 items-center">
              {c.titulo}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/articulos" className="min-h-11 items-center">
            Artículos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
