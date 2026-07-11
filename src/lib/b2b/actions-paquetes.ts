"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/b2b/paquetes";

export async function crearPaqueteAction(formData: FormData) {
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
  if (!agencia) return;

  const titulo = String(formData.get("titulo") ?? "").trim();
  const markupPct = Number(formData.get("markupPct") ?? 0);
  const listingIds = formData.getAll("listingIds").map(String);
  if (!titulo || listingIds.length === 0) return;

  const { data: listings } = await supabase
    .from("listings")
    .select("id, titulo, tipo, precio_neto_b2b, precio_b2c")
    .in("id", listingIds);
  if (!listings || listings.length === 0) return;

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
    })
    .select("slug")
    .single();

  if (error || !paquete) return;

  redirect(`/paquete/${paquete.slug}`);
}
