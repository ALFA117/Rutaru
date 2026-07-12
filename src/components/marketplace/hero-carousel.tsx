"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const TIPO_LABEL: Record<string, string> = {
  ruta: "Ruta",
  hospedaje: "Hospedaje",
  traslado: "Traslado",
  evento: "Evento",
  experiencia: "Experiencia",
};

export type HeroSlide = {
  id: string;
  titulo: string;
  imagen: string;
  precio: number;
  duracion: string | null;
  tipo: string;
  href: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  if (slides.length === 0) return null;

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
      <CarouselContent>
        {slides.map((s) => (
          <CarouselItem key={s.id}>
            <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
              <Image
                src={s.imagen}
                alt={s.titulo}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="w-fit bg-accent text-accent-foreground">
                    {TIPO_LABEL[s.tipo] ?? s.tipo}
                  </Badge>
                  {s.duracion && (
                    <Badge variant="outline" className="border-white/40 text-white">
                      {s.duracion}
                    </Badge>
                  )}
                </div>
                <h2 className="max-w-xl font-heading text-2xl text-white sm:text-4xl">
                  {s.titulo}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-heading text-xl text-white tabular-nums">
                    {currency.format(s.precio)}
                  </span>
                  <Button asChild size="sm">
                    <Link href={s.href}>Ver detalle</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:hidden">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Ir a la diapositiva ${i + 1}`}
            className="h-1.5 w-1.5 rounded-full bg-white/60"
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </Carousel>
  );
}
