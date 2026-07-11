import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type ListingTipo = Database["public"]["Enums"]["listing_tipo"];

export type ListingFilters = {
  destino?: string;
  orden?: "precio_asc" | "precio_desc";
};

export async function getListingsByTipo(
  tipo: ListingTipo,
  filters: ListingFilters = {}
) {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("tipo", tipo)
    .eq("activo", true);

  if (filters.destino) {
    query = query.ilike("ubicacion", `%${filters.destino}%`);
  }

  if (filters.orden === "precio_asc") {
    query = query.order("precio_b2c", { ascending: true });
  } else if (filters.orden === "precio_desc") {
    query = query.order("precio_b2c", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getListingBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, operadores(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFeaturedListings(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getDisponibilidad(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("listing_id", listingId)
    .gte("fecha", new Date().toISOString().slice(0, 10))
    .order("fecha", { ascending: true })
    .limit(12);
  if (error) throw error;
  return data;
}

export async function getResenas(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resenas")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOperadorBySlug(slug: string) {
  const supabase = await createClient();
  const { data: operador, error } = await supabase
    .from("operadores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!operador) return null;

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("operador_id", operador.id)
    .eq("activo", true);
  if (listingsError) throw listingsError;

  return { operador, listings };
}

export async function getPaquetes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*, agencias(razon_social)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
