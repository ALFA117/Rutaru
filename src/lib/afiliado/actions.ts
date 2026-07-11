"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function generarCodigo(prefijo: string) {
  const sufijo = Math.floor(1000 + Math.random() * 9000);
  return `${prefijo}${sufijo}`;
}

export async function regenerarCodigoAction(formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "");
  if (tipo !== "5" && tipo !== "10") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: afiliado } = await supabase
    .from("afiliados")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!afiliado) return;

  const prefijo = String(user.email ?? "RUTA").slice(0, 5).toUpperCase();

  for (let intento = 0; intento < 5; intento++) {
    const nuevoCodigo = generarCodigo(prefijo);
    const { error } = await supabase
      .from("afiliados")
      .update(
        tipo === "5" ? { codigo_5: nuevoCodigo } : { codigo_10: nuevoCodigo }
      )
      .eq("id", afiliado.id);
    if (!error) break;
  }

  revalidatePath("/afiliado");
}

export async function solicitarPagoAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("afiliados")
    .update({ pago_solicitado_at: new Date().toISOString() })
    .eq("user_id", user.id);

  revalidatePath("/afiliado");
}
