import { createClient } from "@/lib/supabase/server";

export async function getListingParaCompra(listingId: string) {
  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, titulo, tipo, precio_neto_b2b, precio_b2c")
    .eq("id", listingId)
    .single();
  if (error) throw error;

  const { data: disponibilidad } = await supabase
    .from("disponibilidad")
    .select("id, fecha, cupo_disponible")
    .eq("listing_id", listingId)
    .gt("cupo_disponible", 0)
    .gte("fecha", new Date().toISOString().slice(0, 10))
    .order("fecha", { ascending: true })
    .limit(12);

  return { listing, disponibilidad: disponibilidad ?? [] };
}

export async function getOrdenB2B(ordenId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ordenes")
    .select("*, orden_items(*, listings(titulo)), pagos(*)")
    .eq("id", ordenId)
    .eq("tipo", "b2b")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrdenesB2BDeAgencia(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ordenes")
    .select("*, orden_items(*, listings(titulo))")
    .eq("user_id", userId)
    .eq("tipo", "b2b")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
