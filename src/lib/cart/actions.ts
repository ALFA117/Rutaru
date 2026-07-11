"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addToCart, removeFromCart } from "@/lib/data/cart";
import { track } from "@/lib/tracking/track";

export async function addToCartAction(formData: FormData) {
  const listingId = formData.get("listingId");
  const paqueteId = formData.get("paqueteId");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (paqueteId) {
    await addToCart(user.id, { paqueteId: String(paqueteId) });
    await track({ tipoEvento: "add_to_cart", entidad: String(paqueteId) });
  } else {
    await addToCart(user.id, { listingId: String(listingId) });
    await track({ tipoEvento: "add_to_cart", entidad: String(listingId) });
  }

  revalidatePath("/carrito");
  redirect("/carrito");
}

export async function removeFromCartAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  await removeFromCart(itemId);
  revalidatePath("/carrito");
}
