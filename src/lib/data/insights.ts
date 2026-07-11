import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminDashboardData } from "@/lib/data/dashboard-admin";
import { getAIProvider } from "@/lib/ai/provider";

export async function getLatestInsights(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

function buildPrompt(datos: Awaited<ReturnType<typeof getAdminDashboardData>>) {
  return `Eres el motor de inteligencia de datos de Rutaru, un marketplace turístico mexicano.
Analiza estos datos reales agregados de la plataforma (moneda MXN) y genera insights accionables.

Ventas por categoría: ${JSON.stringify(datos.categorias)}
Ventas por destino: ${JSON.stringify(datos.destinos)}
Funnel de conversión: ${JSON.stringify(datos.funnel)}
Top afiliados por comisión: ${JSON.stringify(datos.topAfiliados)}
Totales: ventas ${datos.totales.totalVentas} MXN, ${datos.totales.totalEventos} eventos de tracking, ${datos.totales.totalComisiones} MXN en comisiones.

Responde SOLO con un JSON con esta forma exacta, en español, basado estrictamente en los datos de arriba (no inventes destinos o categorías que no aparezcan):
{
  "segmentos": [{"nombre": string, "pct": number}],
  "destinos_en_tendencia": [string],
  "prediccion_demanda": string
}`;
}

export async function generateAndSaveInsight() {
  const datos = await getAdminDashboardData();
  const provider = getAIProvider();
  const prompt = buildPrompt(datos);

  const raw = await provider.generateInsight(prompt);
  let parsed: {
    segmentos?: { nombre: string; pct: number }[];
    destinos_en_tendencia?: string[];
    prediccion_demanda?: string;
    _mock?: boolean;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      segmentos: [],
      destinos_en_tendencia: [],
      prediccion_demanda: raw.slice(0, 500),
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_insights")
    .insert({
      tipo: "resumen_general",
      titulo: "Insight de demanda y segmentos",
      resumen: parsed.prediccion_demanda ?? "",
      data: parsed,
      generado_por: parsed._mock ? "mock" : "gemini",
      periodo: new Date().toISOString().slice(0, 10),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
