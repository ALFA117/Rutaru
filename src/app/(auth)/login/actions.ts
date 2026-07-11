"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/auth/roles";
import { DEMO_PASSWORD } from "@/lib/auth/demo-users";

async function loginAndRedirect(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  redirect(profile ? ROLE_HOME[profile.role] : "/cliente");
}

export async function login(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  return loginAndRedirect(email, password);
}

export async function loginDemo(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  await loginAndRedirect(email, DEMO_PASSWORD);
}
