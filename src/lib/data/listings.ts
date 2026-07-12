import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

// Los datos publicos vienen de la vista listings_publico (sin precio_neto_b2b).
export type Listing = Database["public"]["Views"]["listings_publico"]["Row"];
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
    .from("listings_publico")
    .select("*")
    .eq("tipo", tipo);

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

export const getListingBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings_publico")
    .select("*, operadores(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export async function getCiudadesDisponibles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings_publico")
    .select("ciudad")
    .not("ciudad", "is", null);
  if (error) throw error;
  const ciudades = [...new Set((data ?? []).map((d) => d.ciudad as string))];
  return ciudades.sort((a, b) => a.localeCompare(b));
}

export async function getFeaturedListings(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings_publico")
    .select("*")
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

export type BuscarParams = {
  tipo: ListingTipo | "paquete";
  destino?: string;
  entrada?: string;
};

export async function buscarListings(params: BuscarParams) {
  const supabase = await createClient();

  if (params.tipo === "paquete") {
    let query = supabase.from("paquetes").select("*, agencias(razon_social)");
    if (params.destino) query = query.ilike("titulo", `%${params.destino}%`);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return { paquetes: data, listings: null as never };
  }

  let query = supabase.from("listings_publico").select("*").eq("tipo", params.tipo);
  if (params.destino) {
    query = query.or(
      `ciudad.ilike.%${params.destino}%,estado.ilike.%${params.destino}%,ubicacion.ilike.%${params.destino}%`
    );
  }
  const { data: listings, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  if (!params.entrada || !listings || listings.length === 0) {
    return { listings, paquetes: null as never };
  }

  const { data: disponibles } = await supabase
    .from("disponibilidad")
    .select("listing_id")
    .in(
      "listing_id",
      listings.map((l) => l.id)
    )
    .gte("fecha", params.entrada)
    .gt("cupo_disponible", 0);

  const idsConCupo = new Set((disponibles ?? []).map((d) => d.listing_id));
  return { listings: listings.filter((l) => idsConCupo.has(l.id)), paquetes: null as never };
}

export async function getListingsRelacionados(
  listing: Pick<Listing, "id" | "tipo">,
  limit = 4
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings_publico")
    .select("*")
    .eq("tipo", listing.tipo)
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(limit);
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
    .from("listings_publico")
    .select("*")
    .eq("operador_id", operador.id);
  if (listingsError) throw listingsError;

  return { operador, listings };
}

// agencias (tabla base) no tiene SELECT publico por RLS -- el nombre de la
// agencia se resuelve aparte contra agencias_publico (mismo patron que
// listings_publico en lib/data/cart.ts), si no el join embebido vuelve
// null para visitantes anonimos y el Badge se ve vacio.
async function resolverAgencias<T extends { agencia_id: string }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: T[]
) {
  const agenciaIds = [...new Set(rows.map((r) => r.agencia_id))];
  if (agenciaIds.length === 0) return rows.map((r) => ({ ...r, agencias: null }));
  const { data: agencias } = await supabase
    .from("agencias_publico")
    .select("id, razon_social")
    .in("id", agenciaIds);
  const porId = new Map((agencias ?? []).map((a) => [a.id, a]));
  return rows.map((r) => ({ ...r, agencias: porId.get(r.agencia_id) ?? null }));
}

export async function getPaquetes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return resolverAgencias(supabase, data);
}

export const getPaqueteBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [conAgencia] = await resolverAgencias(supabase, [data]);
  return conAgencia;
});
