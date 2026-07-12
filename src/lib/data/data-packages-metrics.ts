import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MetricaId } from "@/lib/data/data-packages-metricas-tipos";

export type { MetricaId } from "@/lib/data/data-packages-metricas-tipos";

async function ventasPorDestino() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orden_items")
    .select("cantidad, precio, listings(ubicacion), ordenes!inner(estado)")
    .eq("ordenes.estado", "pagada");

  const porDestino = new Map<string, number>();
  for (const item of data ?? []) {
    const destino = item.listings?.ubicacion;
    if (!destino) continue;
    porDestino.set(destino, (porDestino.get(destino) ?? 0) + item.cantidad * item.precio);
  }
  return [...porDestino.entries()]
    .map(([titulo, monto]) => ({ titulo, monto }))
    .sort((a, b) => b.monto - a.monto);
}

async function demografiaCompradores() {
  // Requiere leer profiles.ciudad/pais de TODOS los compradores (no solo el
  // propio), agregado como conteo — nunca nombres/emails/ids individuales.
  // Se usa el cliente admin server-only solo para este conteo.
  const admin = createAdminClient();
  const { data: ordenes } = await admin
    .from("ordenes")
    .select("user_id")
    .eq("estado", "pagada");

  const userIds = [...new Set((ordenes ?? []).map((o) => o.user_id))];
  if (userIds.length === 0) return { porCiudad: [], porPais: [] };

  const { data: perfiles } = await admin
    .from("profiles")
    .select("ciudad, pais")
    .in("id", userIds);

  const porCiudad = new Map<string, number>();
  const porPais = new Map<string, number>();
  for (const p of perfiles ?? []) {
    const ciudad = p.ciudad ?? "Sin especificar";
    const pais = p.pais ?? "Sin especificar";
    porCiudad.set(ciudad, (porCiudad.get(ciudad) ?? 0) + 1);
    porPais.set(pais, (porPais.get(pais) ?? 0) + 1);
  }

  return {
    porCiudad: [...porCiudad.entries()]
      .map(([titulo, cantidad]) => ({ titulo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad),
    porPais: [...porPais.entries()]
      .map(([titulo, cantidad]) => ({ titulo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad),
  };
}

async function tendenciasPorTemporada() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orden_items")
    .select("cantidad, precio, ordenes!inner(estado, created_at)");

  const porMes = new Map<string, number>();
  for (const item of data ?? []) {
    const ordenes = item.ordenes as unknown as { estado: string; created_at: string };
    if (ordenes.estado !== "pagada") continue;
    const mes = `${ordenes.created_at.slice(0, 7)}-01`;
    porMes.set(mes, (porMes.get(mes) ?? 0) + item.cantidad * item.precio);
  }
  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));
}

async function funnelConversion() {
  const supabase = await createClient();
  // Sin .limit(), PostgREST tope en 1000 filas por defecto.
  const { data } = await supabase.from("events_tracking").select("tipo_evento").limit(20000);
  const counts = new Map<string, number>();
  for (const e of data ?? []) {
    counts.set(e.tipo_evento, (counts.get(e.tipo_evento) ?? 0) + 1);
  }
  const orden = [
    { tipo: "page_view", etiqueta: "Vieron un listing" },
    { tipo: "search", etiqueta: "Buscaron" },
    { tipo: "add_to_cart", etiqueta: "Agregaron al carrito" },
    { tipo: "purchase", etiqueta: "Compraron" },
  ];
  return orden.map((o) => ({ etapa: o.etiqueta, cantidad: counts.get(o.tipo) ?? 0 }));
}

export async function buildDataPackagePreview(metricas: MetricaId[]) {
  const preview: Record<string, unknown> = {};

  if (metricas.includes("ventas_por_destino")) {
    preview.ventas_por_destino = await ventasPorDestino();
  }
  if (metricas.includes("demografia")) {
    preview.demografia = await demografiaCompradores();
  }
  if (metricas.includes("tendencias_temporada")) {
    preview.tendencias_temporada = await tendenciasPorTemporada();
  }
  if (metricas.includes("funnel_conversion")) {
    preview.funnel_conversion = await funnelConversion();
  }

  return preview;
}
