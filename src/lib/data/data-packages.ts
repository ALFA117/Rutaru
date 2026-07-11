import { createClient } from "@/lib/supabase/server";

export async function getDataPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_packages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDataPackagesPublicadas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_packages")
    .select("*")
    .in("estado", ["publicado", "vendido"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDataPackageById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_packages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
