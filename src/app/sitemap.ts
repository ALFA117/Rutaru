import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { DETAIL_HREF } from "@/lib/data/detail-href";
import { CATEGORIAS } from "@/lib/data/categorias";
import { getArticulos } from "@/lib/data/articulos";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PAGINAS_ESTATICAS = [
  "",
  "/datos",
  "/roadmap",
  "/guia-de-pruebas",
  "/articulos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: listings }, { data: paquetes }, articulos] = await Promise.all([
    supabase.from("listings_publico").select("slug, tipo, updated_at"),
    supabase.from("paquetes").select("slug, updated_at"),
    getArticulos(),
  ]);

  const entradasEstaticas: MetadataRoute.Sitemap = PAGINAS_ESTATICAS.map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    changeFrequency: "weekly",
    priority: ruta === "" ? 1 : 0.6,
  }));

  const entradasCategorias: MetadataRoute.Sitemap = CATEGORIAS.map((c) => ({
    url: `${SITE_URL}${c.href}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const entradasListings: MetadataRoute.Sitemap = (listings ?? [])
    .map((l) => {
      const hrefFor = DETAIL_HREF[l.tipo];
      if (!hrefFor) return null;
      return {
        url: `${SITE_URL}${hrefFor(l.slug)}`,
        lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((e) => e !== null);

  const entradasPaquetes: MetadataRoute.Sitemap = (paquetes ?? []).map((p) => ({
    url: `${SITE_URL}/paquete/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const entradasArticulos: MetadataRoute.Sitemap = (articulos ?? []).map((a) => ({
    url: `${SITE_URL}/articulos/${a.slug}`,
    lastModified: a.publicado_at ? new Date(a.publicado_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...entradasEstaticas,
    ...entradasCategorias,
    ...entradasListings,
    ...entradasPaquetes,
    ...entradasArticulos,
  ];
}
