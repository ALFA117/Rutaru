"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addToCart, removeFromCart } from "@/lib/data/cart";

export async function addToCartAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await addToCart(user.id, listingId);
  revalidatePath("/carrito");
  redirect("/carrito");
}

export async function removeFromCartAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  await removeFromCart(itemId);
  revalidatePath("/carrito");
}
