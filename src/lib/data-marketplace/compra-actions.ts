"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { track } from "@/lib/tracking/track";

export async function comprarDataPackageAction(formData: FormData) {
  const dataPackageId = String(formData.get("dataPackageId") ?? "");
  const empresa = String(formData.get("empresa") ?? "").trim();
  if (!dataPackageId || !empresa) return;

  // Accion acotada: la compra simulada de un paquete de datos por una
  // empresa (sin cuenta propia en Rutaru) no encaja en ningun rol de
  // usuario existente, asi que se resuelve server-only con el cliente
  // admin en vez de abrir una politica de UPDATE publica sobre la tabla.
  const admin = createAdminClient();
  const { error } = await admin
    .from("data_packages")
    .update({ comprador_empresa: empresa, estado: "vendido" })
    .eq("id", dataPackageId)
    .eq("estado", "publicado");

  if (error) return;

  await track({
    tipoEvento: "purchase",
    entidad: dataPackageId,
    metadata: { tipo: "data_package", empresa },
  });

  revalidatePath("/datos");
}
