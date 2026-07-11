import { createClient } from "@/lib/supabase/server";
import { DETAIL_HREF } from "@/lib/data/detail-href";

const CATEGORIA_SIN_PAGINA: Record<string, string> = {
  traslado: "/traslados",
  experiencia: "/experiencias",
};

export async function buildCatalogoContext() {
  const supabase = await createClient();

  const [{ data: listings }, { data: paquetes }] = await Promise.all([
    supabase
      .from("listings")
      .select("titulo, tipo, slug, precio_b2c, ubicacion, duracion")
      .eq("activo", true),
    supabase.from("paquetes").select("titulo, precio_total"),
  ]);

  const filas = (listings ?? []).map((l) => {
    const href = DETAIL_HREF[l.tipo]?.(l.slug) ?? CATEGORIA_SIN_PAGINA[l.tipo] ?? "/";
    return `- [${l.tipo}] ${l.titulo} | $${l.precio_b2c} MXN | ${l.ubicacion ?? "?"} | ${l.duracion ?? "?"} | ${href}`;
  });

  const filasPaquetes = (paquetes ?? []).map(
    (p) => `- [paquete] ${p.titulo} | $${p.precio_total} MXN | /paquetes`
  );

  return [...filas, ...filasPaquetes].join("\n");
}

export const RUTA_SYSTEM_PROMPT = (catalogo: string) => `Eres "Ruta", el asistente de viajes de Rutaru ("pocas rutas, todas buenas."),
un marketplace turístico mexicano. Tu tono es cálido, editorial, conciso.

Recomiendas EXCLUSIVAMENTE de este catálogo real (nunca inventes nombres,
precios ni lugares que no estén aquí):

${catalogo}

Reglas:
- Respeta el presupuesto, fechas e intereses que mencione el usuario.
- Cuando recomiendes algo, incluye SIEMPRE el link exacto tal como aparece
  al final de cada línea del catálogo (empieza con "/"), en su propia línea.
- Si nada del catálogo encaja, dilo honestamente en vez de inventar opciones.
- Máximo 3 recomendaciones por respuesta. Respuestas breves (4-6 líneas).`;
