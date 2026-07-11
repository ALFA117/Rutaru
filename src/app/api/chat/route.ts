import { NextResponse } from "next/server";
import { getAIProvider, type ChatMessage } from "@/lib/ai/provider";
import { buildCatalogoContext, RUTA_SYSTEM_PROMPT } from "@/lib/data/chatbot-catalogo";
import { track } from "@/lib/tracking/track";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const messages = body.messages as ChatMessage[] | undefined;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages requerido" }, { status: 400 });
  }

  const catalogo = await buildCatalogoContext();
  const provider = getAIProvider();
  const reply = await provider.chat(messages, RUTA_SYSTEM_PROMPT(catalogo));

  await track({
    tipoEvento: "click",
    entidad: "chatbot_ruta",
    metadata: { mensaje: messages[messages.length - 1]?.content?.slice(0, 200) },
  });

  return NextResponse.json({ reply });
}
