import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  // afiliados no tiene lectura publica por RLS (solo el propio afiliado/admin);
  // la validacion del codigo es server-only, por eso usa el cliente admin aqui.
  const admin = createAdminClient();

  const { data: afiliado } = await admin
    .from("afiliados")
    .select("id, codigo_5, codigo_10")
    .or(`codigo_5.eq.${codigo},codigo_10.eq.${codigo}`)
    .maybeSingle();

  const response = NextResponse.redirect(new URL("/", request.url));

  if (afiliado) {
    response.cookies.set("rutaru_afiliado", codigo, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}
