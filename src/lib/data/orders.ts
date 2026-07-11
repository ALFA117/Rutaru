import { createClient } from "@/lib/supabase/server";

export async function getOrdenConDetalle(ordenId: string) {
  const supabase = await createClient();

  const { data: orden, error } = await supabase
    .from("ordenes")
    .select("*, orden_items(*, listings(titulo)), pagos(*)")
    .eq("id", ordenId)
    .maybeSingle();
  if (error) throw error;
  return orden;
}
