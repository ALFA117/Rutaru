import { NextResponse } from "next/server";
import { track, type TipoEvento } from "@/lib/tracking/track";

const TIPOS_VALIDOS: TipoEvento[] = [
  "page_view",
  "search",
  "click",
  "add_to_cart",
  "purchase",
  "code_applied",
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const tipoEvento = body.tipoEvento as TipoEvento;

  if (!TIPOS_VALIDOS.includes(tipoEvento)) {
    return NextResponse.json({ error: "tipoEvento inválido" }, { status: 400 });
  }

  await track({
    tipoEvento,
    entidad: body.entidad,
    metadata: body.metadata,
  });

  return NextResponse.json({ ok: true });
}
