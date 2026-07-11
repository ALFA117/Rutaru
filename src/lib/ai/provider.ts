import "server-only";
import { GoogleGenAI } from "@google/genai";

export type ChatMessage = { role: "user" | "model"; content: string };

export interface AIProvider {
  /** Devuelve un string JSON (el caller hace JSON.parse). */
  generateInsight(prompt: string): Promise<string>;
  /** Devuelve texto libre para el chatbot. */
  chat(messages: ChatMessage[], systemContext: string): Promise<string>;
}

const MODEL = "gemini-flash-latest";

class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateInsight(prompt: string): Promise<string> {
    const res = await this.ai.models.generateContent({
      model: MODEL,
      config: { responseMimeType: "application/json" },
      contents: prompt,
    });
    if (!res.text) throw new Error("Respuesta vacía de Gemini");
    return res.text;
  }

  async chat(messages: ChatMessage[], systemContext: string): Promise<string> {
    const res = await this.ai.models.generateContent({
      model: MODEL,
      config: { systemInstruction: systemContext },
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });
    if (!res.text) throw new Error("Respuesta vacía de Gemini");
    return res.text;
  }
}

/**
 * Proveedor mock — nunca falla, para que el demo no se caiga si la API
 * de Gemini no responde (sin red, key invalida, rate limit, etc).
 */
class MockProvider implements AIProvider {
  async generateInsight(): Promise<string> {
    return JSON.stringify({
      segmentos: [
        { nombre: "Exploradores de fin de semana", pct: 42 },
        { nombre: "Viajeros de presupuesto medio", pct: 35 },
        { nombre: "Buscadores de experiencias premium", pct: 23 },
      ],
      destinos_en_tendencia: ["Oaxaca", "Puebla", "Hidalgo"],
      prediccion_demanda:
        "Demanda estable con picos los fines de semana; Oaxaca muestra la mayor tracción reciente.",
      _mock: true,
    });
  }

  async chat(messages: ChatMessage[], _systemContext: string): Promise<string> {
    void _systemContext;
    const ultimo = messages[messages.length - 1]?.content ?? "";
    return `(modo demo, sin conexión a IA) Recibí tu mensaje: "${ultimo}". Te recomiendo revisar nuestras rutas de 1 día en CDMX o Puebla — son las más populares ahora mismo.`;
  }
}

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const mode = process.env.AI_MODE ?? "live";
  const apiKey = process.env.GEMINI_API_KEY;
  const mock = new MockProvider();

  if (mode === "mock" || !apiKey) {
    cached = mock;
    return cached;
  }

  const gemini = new GeminiProvider(apiKey);
  cached = {
    async generateInsight(prompt) {
      try {
        return await gemini.generateInsight(prompt);
      } catch {
        return await mock.generateInsight();
      }
    },
    async chat(messages, systemContext) {
      try {
        return await gemini.chat(messages, systemContext);
      } catch {
        return await mock.chat(messages, systemContext);
      }
    },
  };
  return cached;
}
