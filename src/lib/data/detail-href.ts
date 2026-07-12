import type { ListingTipo } from "@/lib/data/listings";

// Los 5 tipos de listing tienen pagina de detalle propia:
// /ruta, /hotel, /traslado, /evento, /experiencia (todas delegan en
// ListingDetail salvo evento, que ademas usa zonas).
export const DETAIL_HREF: Partial<Record<ListingTipo, (slug: string) => string>> = {
  ruta: (slug) => `/ruta/${slug}`,
  hospedaje: (slug) => `/hotel/${slug}`,
  traslado: (slug) => `/traslado/${slug}`,
  evento: (slug) => `/evento/${slug}`,
  experiencia: (slug) => `/experiencia/${slug}`,
};
