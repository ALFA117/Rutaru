"use server";

import { revalidatePath } from "next/cache";
import { keccak256, toUtf8Bytes } from "ethers";
import { createClient } from "@/lib/supabase/server";
import { anclarHash } from "@/lib/blockchain/provider";

export async function actualizarConsentimientoAction(formData: FormData) {
  const consiente = formData.get("consiente") === "on";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ consiente_datos_agregados: consiente })
    .eq("id", user.id);

  revalidatePath("/cliente");
}

export async function anclarConsentimientoAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const texto = "Rutaru: consentimiento de datos agregados y anonimizados";
  const hash = keccak256(toUtf8Bytes(`${user.id}|${texto}|${Date.now()}`));
  const { txHash } = await anclarHash(hash);

  await supabase
    .from("profiles")
    .update({ consentimiento_hash: hash, consentimiento_tx_hash: txHash })
    .eq("id", user.id);

  revalidatePath("/cliente");
}
