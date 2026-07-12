"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "model"; content: string };

const SALUDO: Message = {
  role: "model",
  content:
    "Hola, soy Ruta. Cuéntame tu presupuesto, fechas o qué tipo de escapada buscas y te recomiendo rutas, hospedaje, traslados o eventos reales de la plataforma.",
};

function MessageBubble({ message }: { message: Message }) {
  const lineas = message.content.split("\n").filter(Boolean);

  return (
    <div
      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
        message.role === "user"
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {lineas.map((linea, i) =>
        /^\/[a-zA-Z0-9/_-]+$/.test(linea.trim()) ? (
          <Link
            key={i}
            href={linea.trim()}
            className="block underline underline-offset-2 hover:opacity-80"
          >
            Ver detalle →
          </Link>
        ) : (
          <p key={i}>{linea}</p>
        )
      )}
    </div>
  );
}

export function RutaChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([SALUDO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || loading) return;

    const nuevos: Message[] = [...messages, { role: "user", content: texto }];
    setMessages(nuevos);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nuevos }),
      });
      const data = await res.json();
      setMessages([
        ...nuevos,
        { role: "model", content: data.reply ?? "No pude responder, intenta de nuevo." },
      ]);
    } catch {
      setMessages([
        ...nuevos,
        { role: "model", content: "Tuve un problema para responder. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-heading text-base">Ruta — asistente</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                Pensando…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej. tengo $4000 para un fin de semana…"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <Button
        size="icon"
        className="h-11 w-11 rounded-full shadow-lg sm:h-14 sm:w-14"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat con Ruta" : "Abrir chat con Ruta"}
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
