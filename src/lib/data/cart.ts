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

  const { data, error } = await supabase
    .from("carrito_items")
    .select("*, listings(*)")
    .eq("carrito_id", carritoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addToCart(userId: string, listingId: string) {
  const supabase = await createClient();
  const carritoId = await getOrCreateCarritoId(supabase, userId);

  const { data: existing } = await supabase
    .from("carrito_items")
    .select("id, cantidad")
    .eq("carrito_id", carritoId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("carrito_items")
      .update({ cantidad: existing.cantidad + 1 })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("carrito_items")
    .insert({ carrito_id: carritoId, listing_id: listingId, cantidad: 1 });
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
