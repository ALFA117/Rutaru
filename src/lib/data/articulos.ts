import { createClient } from "@/lib/supabase/server";

export async function getArticulos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select("*")
    .order("publicado_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getArticulosDestacados(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select("*")
    .order("publicado_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getArticuloBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getArticulosPorListing(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select("*")
    .eq("listing_id", listingId)
    .order("publicado_at", { ascending: false });
  if (error) throw error;
  return data;
}
