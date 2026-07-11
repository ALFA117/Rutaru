"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcularDescuentoVolumenPct } from "@/lib/b2b/allotments";
import { chargeSandbox } from "@/lib/pioneer-pay/sandbox";
import { track } from "@/lib/tracking/track";

export async function comprarAllotmentAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const cantidad = Number(formData.get("cantidad") ?? 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!listingId || !fecha || cantidad <= 0) return;

  const { data: listing } = await supabase
    .from("listings")
    .select("precio_neto_b2b")
    .eq("id", listingId)
    .single();
  if (!listing) return;

  const { data: disponibilidad } = await supabase
    .from("disponibilidad")
    .select("id, cupo_disponible")
    .eq("listing_id", listingId)
    .eq("fecha", fecha)
    .single();
  if (!disponibilidad || disponibilidad.cupo_disponible < cantidad) return;

  const neto = listing.precio_neto_b2b ?? 0;
  const descuentoPct = calcularDescuentoVolumenPct(cantidad);
  const precioUnitario = Math.round(neto * (1 - descuentoPct / 100));
  const subtotal = neto * cantidad;
  const total = precioUnitario * cantidad;
  const descuento = subtotal - total;

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .insert({
      user_id: user.id,
      tipo: "b2b",
      subtotal,
      descuento,
      total,
      estado: "pendiente",
    })
    .select("id")
    .single();
  if (ordenError || !orden) return;

  await supabase.from("orden_items").insert({
    orden_id: orden.id,
    listing_id: listingId,
    cantidad,
    precio: precioUnitario,
    fecha_servicio: fecha,
  });

  await supabase
    .from("disponibilidad")
    .update({ cupo_disponible: disponibilidad.cupo_disponible - cantidad })
    .eq("id", disponibilidad.id);

  await track({
    tipoEvento: "purchase",
    entidad: orden.id,
    metadata: { tipo: "b2b", cantidad, descuentoPct },
  });

  redirect(`/agencia/ordenes/${orden.id}`);
}

export async function confirmarOrdenB2BAction(formData: FormData) {
  const ordenId = String(formData.get("ordenId") ?? "");
  const supabase = await createClient();
  await supabase
    .from("ordenes")
    .update({ estado: "confirmada" })
    .eq("id", ordenId)
    .eq("estado", "pendiente");
  revalidatePath(`/agencia/ordenes/${ordenId}`);
}

export async function pagarOrdenB2BAction(formData: FormData) {
  const ordenId = String(formData.get("ordenId") ?? "");
  const supabase = await createClient();

  const { data: orden } = await supabase
    .from("ordenes")
    .select("id, total, estado")
    .eq("id", ordenId)
    .single();
  if (!orden || orden.estado !== "confirmada") return;

  const cargo = await chargeSandbox("tarjeta", orden.total);

  await supabase
    .from("ordenes")
    .update({ estado: "pagada" })
    .eq("id", ordenId);

  await supabase.from("pagos").insert({
    orden_id: ordenId,
    pasarela: "pioneer_sandbox",
    referencia: cargo.referencia,
    estado: "aprobado",
  });

  revalidatePath(`/agencia/ordenes/${ordenId}`);
}
