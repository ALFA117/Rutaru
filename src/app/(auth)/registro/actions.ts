"use server";

import { createClient } from "@/lib/supabase/server";

export async function registro(_prevState: unknown, formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "cliente", nombre },
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return {
    error: null,
    success: true,
  };
}
