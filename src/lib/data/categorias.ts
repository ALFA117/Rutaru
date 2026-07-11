import type { ListingTipo } from "@/lib/data/listings";

export type Categoria = {
  tipo: ListingTipo | "paquete";
  slug: string;
  href: string;
  titulo: string;
  descripcion: string;
};

export const CATEGORIAS: Categoria[] = [
  {
    tipo: "ruta",
    slug: "rutas",
    href: "/rutas",
    titulo: "Rutas y Tours",
    descripcion: "Rutas de autor, 1 día o varios.",
  },
  {
    tipo: "hospedaje",
    slug: "hospedaje",
    href: "/hospedaje",
    titulo: "Hospedaje",
    descripcion: "Estancias estilo Airbnb en todo México.",
  },
  {
    tipo: "traslado",
    slug: "traslados",
    href: "/traslados",
    titulo: "Traslados y Movilidad",
    descripcion: "AIFA, AICM, privados y compartidos.",
  },
  {
    tipo: "evento",
    slug: "eventos",
    href: "/eventos",
    titulo: "Eventos y Boletaje",
    descripcion: "Festivales, ferias y conciertos.",
  },
  {
    tipo: "paquete",
    slug: "paquetes",
    href: "/paquetes",
    titulo: "Paquetes de Agencia",
    descripcion: "Todo incluido, armado por agencias.",
  },
  {
    tipo: "experiencia",
    slug: "experiencias",
    href: "/experiencias",
    titulo: "Experiencias",
    descripcion: "Vivencias únicas fuera de lo común.",
  },
];
