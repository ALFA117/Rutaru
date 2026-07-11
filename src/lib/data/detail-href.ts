import type { ListingTipo } from "@/lib/data/listings";

// Solo ruta/hospedaje/evento tienen pagina de detalle propia (seccion 2 del
// spec: /ruta/[slug], /hotel/[slug], /evento/[slug]). Traslados y
// experiencias se muestran solo como tarjeta en su categoria.
export const DETAIL_HREF: Partial<Record<ListingTipo, (slug: string) => string>> = {
  ruta: (slug) => `/ruta/${slug}`,
  hospedaje: (slug) => `/hotel/${slug}`,
  evento: (slug) => `/evento/${slug}`,
};
