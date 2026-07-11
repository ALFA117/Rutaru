import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    porCiudad: [...porCiudad.entries()].map(([titulo, cantidad]) => ({ titulo, cantidad })),
    porPais: [...porPais.entries()].map(([titulo, cantidad]) => ({ titulo, cantidad })),
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

const PAQUETES = [
  {
    titulo: "Ventas y funnel de conversión Rutaru",
    descripcion:
      "Ventas agregadas por destino y funnel de conversión completo de la plataforma.",
    precio: 15000,
    metricas: ["ventas_por_destino", "funnel_conversion"],
  },
  {
    titulo: "Demografía de viajeros Rutaru",
    descripcion: "Distribución de compradores por ciudad y país, 100% anonimizada.",
    precio: 9000,
    metricas: ["demografia"],
  },
  {
    titulo: "Estacionalidad de la demanda 2026",
    descripcion: "Tendencias de ventas mes a mes para planeación de temporada.",
    precio: 12000,
    metricas: ["tendencias_temporada"],
  },
];

async function main() {
  const preview = {
    ventas_por_destino: await ventasPorDestino(),
    demografia: await demografia(),
    tendencias_temporada: await tendenciasPorTemporada(),
    funnel_conversion: await funnelConversion(),
  };

  for (const p of PAQUETES) {
    const { data: existente } = await admin
      .from("data_packages")
      .select("id")
      .eq("titulo", p.titulo)
      .maybeSingle();
    if (existente) {
      console.log(`-> ${p.titulo}: ya existe, se omite`);
      continue;
    }

    const packagePreview = Object.fromEntries(
      p.metricas.map((m) => [m, preview[m]])
    );

    const { error } = await admin.from("data_packages").insert({
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: p.precio,
      preview: packagePreview,
      estado: "publicado",
    });

    if (error) {
      console.error(`-> ${p.titulo}: ERROR ${error.message}`);
      continue;
    }
    console.log(`-> ${p.titulo}: creado`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
