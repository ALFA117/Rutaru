import "server-only";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type TipoEvento =
  | "page_view"
  | "search"
  | "click"
  | "add_to_cart"
  | "purchase"
  | "code_applied";

const SESSION_COOKIE = "rutaru_sid";

export async function track(event: {
  tipoEvento: TipoEvento;
  entidad?: string;
  metadata?: Record<string, Json | undefined>;
}) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return; // proxy.ts no ha corrido aun para esta request (poco comun)

    const headerList = await headers();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("events_tracking").insert({
      user_id: user?.id ?? null,
      session_id: sessionId,
      tipo_evento: event.tipoEvento,
      entidad: event.entidad ?? null,
      metadata: event.metadata ?? {},
      dispositivo: headerList.get("user-agent") ?? null,
    });
  } catch {
    // El tracking nunca debe romper el flujo principal del usuario.
  }
}
