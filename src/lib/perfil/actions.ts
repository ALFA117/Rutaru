"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
