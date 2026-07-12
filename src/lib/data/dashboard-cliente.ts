import { createClient } from "@/lib/supabase/server";

export async function getMisViajes(userId: string) {
  const supabase = await createClient();

  // orden_items.listing_id apunta a la tabla base `listings`, sin SELECT
  // publico para cliente (ver nota en lib/data/cart.ts) — se resuelve el
  // titulo/tipo/imagenes contra `listings_publico` en un segundo paso.
  const { data: ordenes, error } = await supabase
    .from("ordenes")
    .select("*, orden_items(*, paquetes(titulo), nft_tickets(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const listingIds = [
    ...new Set(
      ordenes.flatMap((o) => o.orden_items?.map((i) => i.listing_id).filter(Boolean) ?? [])
    ),
  ] as string[];

  const listingsById = new Map<string, { titulo: string; tipo: string; imagenes: string[] }>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingsError } = await supabase
      .from("listings_publico")
      .select("id, titulo, tipo, imagenes")
      .in("id", listingIds);
    if (listingsError) throw listingsError;
    for (const l of listings) listingsById.set(l.id, l);
  }

  return ordenes.map((orden) => ({
    ...orden,
    orden_items: orden.orden_items?.map((item) => ({
      ...item,
      listings: item.listing_id ? (listingsById.get(item.listing_id) ?? null) : null,
    })),
  }));
}
