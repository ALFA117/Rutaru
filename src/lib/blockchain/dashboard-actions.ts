"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { completarServicio, cancelarReservaOnChain } from "@/lib/blockchain/provider";

async function verificarPropiedadOrden(ordenId: string, userId: string) {
  const supabase = await createClient();

  const { data: operador } = await supabase
    .from("operadores")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!operador) throw new Error("No autorizado");

  const { data: item } = await supabase
    .from("orden_items")
    .select("id, listings!inner(operador_id)")
    .eq("orden_id", ordenId)
    .eq("listings.operador_id", operador.id)
    .maybeSingle();
  if (!item) throw new Error("No autorizado para esta orden");

  const { data: orden } = await supabase
    .from("ordenes")
    .select("id, estado, reserva_id_blockchain")
    .eq("id", ordenId)
    .single();
  if (!orden?.reserva_id_blockchain) throw new Error("La orden no tiene reserva on-chain");

  return orden;
}

export async function completarServicioAction(formData: FormData) {
  const ordenId = String(formData.get("ordenId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const orden = await verificarPropiedadOrden(ordenId, user.id);
  await completarServicio(orden.reserva_id_blockchain!);

  await supabase.from("ordenes").update({ estado: "completada" }).eq("id", ordenId);
  revalidatePath("/operador");
}

export async function cancelarReservaAction(formData: FormData) {
  const ordenId = String(formData.get("ordenId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const orden = await verificarPropiedadOrden(ordenId, user.id);
  await cancelarReservaOnChain(orden.reserva_id_blockchain!);

  await supabase.from("ordenes").update({ estado: "cancelada" }).eq("id", ordenId);
  revalidatePath("/operador");
}

export async function actualizarWalletOperadorAction(formData: FormData) {
  const walletAddress = String(formData.get("walletAddress") ?? "").trim();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("operadores")
    .update({ wallet_address: walletAddress || null })
    .eq("user_id", user.id);
  revalidatePath("/operador");
}

export async function actualizarWalletAfiliadoAction(formData: FormData) {
  const walletAddress = String(formData.get("walletAddress") ?? "").trim();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("afiliados")
    .update({ wallet_address: walletAddress || null })
    .eq("user_id", user.id);
  revalidatePath("/afiliado");
}
