import { createClient } from "@/lib/supabase/server";

export async function getCatalogoB2B() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, titulo, tipo, slug, ubicacion, pais, estado, ciudad, duracion, precio_b2c, precio_neto_b2b, imagenes, que_incluye, cupo, activo"
    )
    .order("tipo", { ascending: true })
    .order("titulo", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((l) => {
    const neto = l.precio_neto_b2b ?? l.precio_b2c;
    const margen = l.precio_b2c - neto;
    const margenPct = neto > 0 ? Math.round((margen / neto) * 100) : 0;
    return { ...l, precio_neto_b2b: neto, margen, margenPct };
  });
}
