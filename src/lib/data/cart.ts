import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function getOrCreateCarritoId(supabase: Client, userId: string) {
  const { data: existing } = await supabase
    .from("carritos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("carritos")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function getCartItems(userId: string) {
  const supabase = await createClient();
  const carritoId = await getOrCreateCarritoId(supabase, userId);

  // carrito_items.listing_id apunta a la tabla base `listings`, pero esa
  // tabla no tiene SELECT publico para cliente/afiliado (Etapa 3 lo retiro
  // para ocultar precio_neto_b2b) — un embed directo `listings(*)` aqui
  // devuelve null por RLS y silenciosamente pone el precio en $0. Se
  // resuelve en dos pasos contra `listings_publico`, que si es publica.
  const { data: items, error } = await supabase
    .from("carrito_items")
    .select("*, paquetes(*)")
    .eq("carrito_id", carritoId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const listingIds = [...new Set(items.map((i) => i.listing_id).filter(Boolean))] as string[];
  const listingsById = new Map<string, unknown>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingsError } = await supabase
      .from("listings_publico")
      .select("*, operadores(wallet_address)")
      .in("id", listingIds);
    if (listingsError) throw listingsError;
    for (const l of listings) listingsById.set(l.id, l);
  }

  return items.map((item) => ({
    ...item,
    listings: item.listing_id ? (listingsById.get(item.listing_id) ?? null) : null,
  })) as unknown as Array<
    (typeof items)[number] & {
      listings:
        | (Database["public"]["Views"]["listings_publico"]["Row"] & {
            operadores: { wallet_address: string | null } | null;
          })
        | null;
    }
  >;
}

export function cartItemPrice(item: {
  listings: { precio_b2c: number } | null;
  paquetes: { precio_total: number } | null;
}) {
  return item.listings?.precio_b2c ?? item.paquetes?.precio_total ?? 0;
}

export function cartItemTitle(item: {
  listings: { titulo: string } | null;
  paquetes: { titulo: string } | null;
}) {
  return item.listings?.titulo ?? item.paquetes?.titulo ?? "";
}

export async function addToCart(
  userId: string,
  item:
    | { listingId: string; fecha?: string; cantidad?: number }
    | { paqueteId: string; cantidad?: number }
) {
  const supabase = await createClient();
  const carritoId = await getOrCreateCarritoId(supabase, userId);
  const column = "listingId" in item ? "listing_id" : "paquete_id";
  const value = "listingId" in item ? item.listingId : item.paqueteId;
  const fecha = "listingId" in item ? (item.fecha ?? null) : null;
  const cantidadExplicita = item.cantidad;
  const cantidadNueva = cantidadExplicita ?? 1;

  // Una reserva con fecha es un item independiente por fecha — no se
  // fusiona con otra reserva del mismo listing en otra fecha.
  let query = supabase
    .from("carrito_items")
    .select("id, cantidad")
    .eq("carrito_id", carritoId)
    .eq(column, value);
  query = fecha ? query.eq("fecha_servicio", fecha) : query.is("fecha_servicio", null);
  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("carrito_items")
      .update({
        cantidad: cantidadExplicita !== undefined ? cantidadNueva : existing.cantidad + 1,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("carrito_items").insert(
    "listingId" in item
      ? {
          carrito_id: carritoId,
          listing_id: item.listingId,
          cantidad: cantidadNueva,
          fecha_servicio: fecha,
        }
      : { carrito_id: carritoId, paquete_id: item.paqueteId, cantidad: cantidadNueva }
  );
  if (error) throw error;
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("carrito_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const supabase = await createClient();
  const carritoId = await getOrCreateCarritoId(supabase, userId);
  const { error } = await supabase
    .from("carrito_items")
    .delete()
    .eq("carrito_id", carritoId);
  if (error) throw error;
}
