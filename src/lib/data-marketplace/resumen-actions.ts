"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function generarResumenAction(formData: FormData) {
  const dataPackageId = String(formData.get("dataPackageId") ?? "");
  if (!dataPackageId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return;

  const { data: paquete } = await supabase
    .from("data_packages")
    .select("titulo, preview")
    .eq("id", dataPackageId)
    .single();
  if (!paquete) return;

  const prompt = `Eres un analista de datos turísticos escribiendo la descripción
comercial de un paquete de datos que Rutaru vende a empresas (Data Marketplace).

Título del paquete: "${paquete.titulo}"
Datos agregados y anonimizados incluidos: ${JSON.stringify(paquete.preview)}

Escribe un resumen ejecutivo de 2-3 líneas, en español, orientado a un
comprador B2B (qué insight de negocio ofrece este dataset). Responde SOLO
con un JSON: {"resumen": string}`;

  const provider = getAIProvider();
  let resumen = "";
  try {
    const raw = await provider.generateInsight(prompt);
    resumen = JSON.parse(raw).resumen ?? "";
  } catch {
    resumen = "";
  }
  if (!resumen) return;

  await supabase
    .from("data_packages")
    .update({ descripcion: resumen })
    .eq("id", dataPackageId);

  revalidatePath("/admin/datos");
  revalidatePath("/datos");
}
