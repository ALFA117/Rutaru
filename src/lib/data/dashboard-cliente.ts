import { createClient } from "@/lib/supabase/server";

export async function getMisViajes(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ordenes")
    .select(
      "*, orden_items(*, listings(titulo, tipo, imagenes), paquetes(titulo), nft_tickets(*))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
