"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildDataPackagePreview, type MetricaId } from "@/lib/data/data-packages-metrics";
import type { Json } from "@/types/database.types";

export async function crearDataPackageAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return;

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);
  const metricas = formData.getAll("metricas") as MetricaId[];

  if (!titulo || metricas.length === 0) return;

  const preview = await buildDataPackagePreview(metricas);

  const { error } = await supabase.from("data_packages").insert({
    titulo,
    descripcion,
    precio,
    preview: preview as Json,
    estado: "publicado",
  });

  if (error) return;

  redirect("/admin/datos");
}
