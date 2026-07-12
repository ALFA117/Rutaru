import { createClient } from "@/lib/supabase/server";

export async function getOrdenConDetalle(ordenId: string) {
  const supabase = await createClient();

  // Ver nota en lib/data/cart.ts: `listings` (tabla base) no tiene SELECT
  // publico, se resuelve el titulo contra `listings_publico` aparte.
  const { data: orden, error } = await supabase
    .from("ordenes")
    .select("*, orden_items(*, nft_tickets(*)), pagos(*)")
    .eq("id", ordenId)
    .maybeSingle();
  if (error) throw error;
  if (!orden) return null;

  const listingIds = [
    ...new Set(orden.orden_items?.map((i) => i.listing_id).filter(Boolean) ?? []),
  ] as string[];

  const listingsById = new Map<string, { titulo: string }>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingsError } = await supabase
      .from("listings_publico")
      .select("id, titulo")
      .in("id", listingIds);
    if (listingsError) throw listingsError;
    for (const l of listings) listingsById.set(l.id, l);
  }

  return {
    ...orden,
    orden_items: orden.orden_items?.map((item) => ({
      ...item,
      listings: item.listing_id ? (listingsById.get(item.listing_id) ?? null) : null,
    })),
  };
}
