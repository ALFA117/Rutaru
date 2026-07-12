"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { titulo: string; href: string };

// Duplicamos la lista para que la animacion (translateX -50%) haga loop
// perfecto sin salto visible -- pausa al tocar/hover y respeta
// prefers-reduced-motion (ver globals.css).
export function CategoryMarquee({ items: base }: { items: Item[] }) {
  const pathname = usePathname();
  const items = [...base, ...base];

  return (
    <div className="overflow-hidden border-t border-border/60 bg-background lg:hidden">
      <div className="animate-marquee flex w-max items-center gap-6 py-2.5 hover:[animation-play-state:paused]">
        {items.map((c, i) => {
          const activo = pathname === c.href || pathname.startsWith(`${c.href}/`);
          return (
            <Link
              key={`${c.href}-${i}`}
              href={c.href}
              className={cn(
                "shrink-0 text-sm whitespace-nowrap transition-colors",
                activo ? "font-medium text-foreground" : "text-foreground/70 hover:text-foreground"
              )}
            >
              {c.titulo}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
