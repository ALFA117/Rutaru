import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export type ItemConFecha = {
  listing_id: string | null;
  fecha_servicio: string | null;
  cantidad: number;
};

/// Verifica que haya cupo suficiente para cada item con fecha (rutas,
/// hospedaje, traslados, experiencias). Usa el cliente admin porque el
/// cliente autenticado no tiene permiso de UPDATE sobre disponibilidad
/// ajena via RLS.
export async function verificarDisponibilidad(admin: Client, items: ItemConFecha[]) {
  for (const item of items) {
    if (!item.listing_id || !item.fecha_servicio) continue;
    const { data } = await admin
      .from("disponibilidad")
      .select("cupo_disponible")
      .eq("listing_id", item.listing_id)
      .eq("fecha", item.fecha_servicio)
      .maybeSingle();
    if (!data || data.cupo_disponible < item.cantidad) {
      return { ok: false as const, error: "Ya no hay cupo disponible para la fecha elegida." };
    }
  }
  return { ok: true as const };
}

export async function descontarDisponibilidad(admin: Client, items: ItemConFecha[]) {
  for (const item of items) {
    if (!item.listing_id || !item.fecha_servicio) continue;
    const { data } = await admin
      .from("disponibilidad")
      .select("id, cupo_disponible")
      .eq("listing_id", item.listing_id)
      .eq("fecha", item.fecha_servicio)
      .maybeSingle();
    if (data) {
      await admin
        .from("disponibilidad")
        .update({ cupo_disponible: data.cupo_disponible - item.cantidad })
        .eq("id", data.id);
    }
  }
}
