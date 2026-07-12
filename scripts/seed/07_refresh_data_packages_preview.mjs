// Refresca el preview (snapshot congelado al crear el paquete) de TODOS los
// data_packages existentes contra los datos reales actuales. Se corre despues
// de sembrar ordenes historicas (06_historical_orders.mjs) para que el Data
// Marketplace no muestre cifras desactualizadas de antes del seed.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Misma logica que src/lib/data/data-packages-metrics.ts (esa version usa
// createClient() con cookies de Next, no invocable desde un script standalone).
async function ventasPorDestino() {
  const { data } = await admin
    .from("orden_items")
    .select("cantidad, precio, listings(ubicacion), ordenes!inner(estado)")
    .eq("ordenes.estado", "pagada");
  const m = new Map();
  for (const item of data ?? []) {
    const d = item.listings?.ubicacion;
    if (!d) continue;
    m.set(d, (m.get(d) ?? 0) + item.cantidad * item.precio);
  }
  return [...m.entries()]
    .map(([titulo, monto]) => ({ titulo, monto }))
    .sort((a, b) => b.monto - a.monto);
}

async function demografia() {
  const { data: ordenes } = await admin
    .from("ordenes")
    .select("user_id")
    .eq("estado", "pagada");
  const userIds = [...new Set((ordenes ?? []).map((o) => o.user_id))];
  const { data: perfiles } = await admin
    .from("profiles")
    .select("ciudad, pais")
    .in("id", userIds);
  const porCiudad = new Map();
  const porPais = new Map();
  for (const p of perfiles ?? []) {
    const c = p.ciudad ?? "Sin especificar";
    const pa = p.pais ?? "Sin especificar";
    porCiudad.set(c, (porCiudad.get(c) ?? 0) + 1);
    porPais.set(pa, (porPais.get(pa) ?? 0) + 1);
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
  const { data } = await admin
    .from("orden_items")
    .select("cantidad, precio, ordenes!inner(estado, created_at)");
  const porMes = new Map();
  for (const item of data ?? []) {
    if (item.ordenes.estado !== "pagada") continue;
    const mes = `${item.ordenes.created_at.slice(0, 7)}-01`;
    porMes.set(mes, (porMes.get(mes) ?? 0) + item.cantidad * item.precio);
  }
  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));
}

async function funnelConversion() {
  const { data } = await admin.from("events_tracking").select("tipo_evento");
  const c = new Map();
  for (const e of data ?? []) c.set(e.tipo_evento, (c.get(e.tipo_evento) ?? 0) + 1);
  return ["page_view", "search", "add_to_cart", "purchase"].map((t) => ({
    etapa: t,
    cantidad: c.get(t) ?? 0,
  }));
}

const BUILDERS = {
  ventas_por_destino: ventasPorDestino,
  demografia,
  tendencias_temporada: tendenciasPorTemporada,
  funnel_conversion: funnelConversion,
};

async function main() {
  const { data: paquetes, error } = await admin
    .from("data_packages")
    .select("id, titulo, preview");
  if (error) throw error;

  const cache = {};
  for (const p of paquetes ?? []) {
    const metricas = Object.keys(p.preview ?? {});
    const nuevoPreview = {};
    for (const m of metricas) {
      if (!(m in BUILDERS)) {
        console.warn(`-> ${p.titulo}: metrica desconocida "${m}", se conserva tal cual`);
        nuevoPreview[m] = p.preview[m];
        continue;
      }
      cache[m] ??= await BUILDERS[m]();
      nuevoPreview[m] = cache[m];
    }

    const { error: updateError } = await admin
      .from("data_packages")
      .update({ preview: nuevoPreview })
      .eq("id", p.id);
    if (updateError) {
      console.error(`-> ${p.titulo}: ERROR ${updateError.message}`);
      continue;
    }
    console.log(`-> ${p.titulo}: preview actualizado (${metricas.join(", ")})`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
