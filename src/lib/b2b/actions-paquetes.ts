"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/b2b/paquetes";

export type CrearPaqueteState = { error: string } | null;

export async function crearPaqueteAction(
  _prevState: CrearPaqueteState,
  formData: FormData
): Promise<CrearPaqueteState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agencia } = await supabase
    .from("agencias")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!agencia) return { error: "Tu cuenta no tiene un perfil de agencia asociado." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const markupPct = Number(formData.get("markupPct") ?? 0);
  const fechaInicio = String(formData.get("fechaInicio") ?? "") || null;
  const fechaFin = String(formData.get("fechaFin") ?? "") || null;
  const pais = String(formData.get("pais") ?? "") || null;
  const estado = String(formData.get("estado") ?? "") || null;
  const ciudad = String(formData.get("ciudad") ?? "") || null;

  let listingIds: string[] = [];
  try {
    listingIds = JSON.parse(String(formData.get("listingIds") ?? "[]"));
  } catch {
    return { error: "No se pudo leer la selección de componentes." };
  }

  if (!titulo) return { error: "Ponle un título al paquete." };
  if (listingIds.length === 0) {
    return { error: "Selecciona al menos un componente para el paquete." };
  }

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, titulo, tipo, precio_neto_b2b, precio_b2c")
    .in("id", listingIds);
  if (listingsError || !listings || listings.length === 0) {
    return { error: "No se pudieron cargar los componentes seleccionados." };
  }

  const costoNeto = listings.reduce(
    (acc, l) => acc + (l.precio_neto_b2b ?? l.precio_b2c),
    0
  );
  const precioTotal = Math.round(costoNeto * (1 + markupPct / 100));

  const componentes = listings.map((l) => ({
    listing_id: l.id,
    titulo: l.titulo,
    tipo: l.tipo,
  }));

  let slug = slugify(titulo);
  const { data: existente } = await supabase
    .from("paquetes")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existente) slug = `${slug}-${Date.now().toString(36)}`;

  const { data: paquete, error } = await supabase
    .from("paquetes")
    .insert({
      agencia_id: agencia.id,
      titulo,
      slug,
      componentes,
      precio_total: precioTotal,
      markup_pct: markupPct,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      pais,
      estado,
      ciudad,
    })
    .select("slug")
    .single();

  if (error || !paquete) {
    return { error: error?.message ?? "No se pudo publicar el paquete." };
  }

  redirect(`/paquete/${paquete.slug}`);
}
