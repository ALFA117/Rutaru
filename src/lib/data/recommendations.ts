import { createClient } from "@/lib/supabase/server";
import { getFeaturedListings, type ListingTipo } from "@/lib/data/listings";

export async function getParaTiListings(userId: string, limit = 6) {
  const supabase = await createClient();

  const { data: vistos } = await supabase
    .from("events_tracking")
    .select("entidad, created_at")
    .eq("user_id", userId)
    .eq("tipo_evento", "page_view")
    .not("entidad", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  const slugsVistos = [...new Set((vistos ?? []).map((v) => v.entidad!))];

  if (slugsVistos.length === 0) {
    return { listings: await getFeaturedListings(limit), personalizado: false };
  }

  const { data: listingsVistos } = await supabase
    .from("listings")
    .select("id, tipo, ubicacion")
    .in("slug", slugsVistos);

  const { data: compras } = await supabase
    .from("orden_items")
    .select("listing_id, ordenes!inner(user_id)")
    .eq("ordenes.user_id", userId);
  const idsComprados = new Set(
    (compras ?? []).map((c) => c.listing_id).filter(Boolean)
  );

  const tipoCounts = new Map<ListingTipo, number>();
  for (const l of listingsVistos ?? []) {
    tipoCounts.set(l.tipo, (tipoCounts.get(l.tipo) ?? 0) + 1);
  }
  const tipoPreferido = [...tipoCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  if (!tipoPreferido) {
    return { listings: await getFeaturedListings(limit), personalizado: false };
  }

  const { data: recomendados } = await supabase
    .from("listings")
    .select("*")
    .eq("tipo", tipoPreferido)
    .eq("activo", true)
    .not(
      "id",
      "in",
      `(${[...idsComprados, ...(listingsVistos ?? []).map((l) => l.id)].join(",") || "00000000-0000-0000-0000-000000000000"})`
    )
    .limit(limit);

  if (!recomendados || recomendados.length === 0) {
    return { listings: await getFeaturedListings(limit), personalizado: false };
  }

  return { listings: recomendados, personalizado: true };
}
