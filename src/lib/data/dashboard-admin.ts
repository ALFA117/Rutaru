import { createClient } from "@/lib/supabase/server";

const FUNNEL_ORDEN: { tipo: string; etiqueta: string }[] = [
  { tipo: "page_view", etiqueta: "Vieron un listing" },
  { tipo: "search", etiqueta: "Buscaron" },
  { tipo: "add_to_cart", etiqueta: "Agregaron al carrito" },
  { tipo: "purchase", etiqueta: "Compraron" },
];

const TIPO_LABEL: Record<string, string> = {
  ruta: "Rutas",
  hospedaje: "Hospedaje",
  traslado: "Traslados",
  evento: "Eventos",
  experiencia: "Experiencias",
  paquete: "Paquetes",
};

const DIA_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type RangoFechas = 7 | 30 | 90 | "todo";

function fechaDesde(rango: RangoFechas): string | null {
  if (rango === "todo") return null;
  const d = new Date();
  d.setDate(d.getDate() - rango);
  return d.toISOString();
}

export async function getAdminDashboardData(rango: RangoFechas = 30) {
  const supabase = await createClient();
  const desde = fechaDesde(rango);

  // Sin .limit() explicito, PostgREST tope por defecto en 1000 filas --
  // events_tracking ya lo supera facil en el rango de 30/90 dias.
  let eventosQuery = supabase
    .from("events_tracking")
    .select("tipo_evento, created_at")
    .limit(20000);
  if (desde) eventosQuery = eventosQuery.gte("created_at", desde);

  let ordenItemsQuery = supabase
    .from("orden_items")
    .select(
      "cantidad, precio, listing_id, paquete_id, listings(titulo, tipo, ubicacion), ordenes!inner(estado, created_at)"
    )
    .eq("ordenes.estado", "pagada");
  if (desde) ordenItemsQuery = ordenItemsQuery.gte("ordenes.created_at", desde);

  const [{ data: eventos }, { data: ordenItems }, { data: comisiones }] =
    await Promise.all([
      eventosQuery,
      ordenItemsQuery,
      supabase.from("comisiones_afiliado").select("monto, afiliado_id"),
    ]);

  const funnelCounts = new Map<string, number>();
  for (const e of eventos ?? []) {
    funnelCounts.set(e.tipo_evento, (funnelCounts.get(e.tipo_evento) ?? 0) + 1);
  }
  const funnel = FUNNEL_ORDEN.map((f) => ({
    etapa: f.etiqueta,
    cantidad: funnelCounts.get(f.tipo) ?? 0,
  }));

  // Heatmap de actividad: dia de la semana x hora, a partir de events_tracking
  const heatmap: { dia: string; hora: number; cantidad: number }[] = [];
  const heatmapCounts = new Map<string, number>();
  for (const e of eventos ?? []) {
    const d = new Date(e.created_at);
    const key = `${d.getDay()}-${d.getHours()}`;
    heatmapCounts.set(key, (heatmapCounts.get(key) ?? 0) + 1);
  }
  for (let dia = 0; dia < 7; dia++) {
    for (let hora = 0; hora < 24; hora++) {
      heatmap.push({
        dia: DIA_LABEL[dia],
        hora,
        cantidad: heatmapCounts.get(`${dia}-${hora}`) ?? 0,
      });
    }
  }

  const ventasPorCategoria = new Map<string, number>();
  const ventasPorDestino = new Map<string, number>();
  const ventasPorListing = new Map<string, { titulo: string; monto: number }>();
  const ventasPorDia = new Map<string, number>();
  let totalVentas = 0;

  for (const item of ordenItems ?? []) {
    const monto = item.cantidad * item.precio;
    totalVentas += monto;
    const tipo = item.paquete_id ? "paquete" : (item.listings?.tipo ?? "otro");
    ventasPorCategoria.set(tipo, (ventasPorCategoria.get(tipo) ?? 0) + monto);

    const destino = item.listings?.ubicacion;
    if (destino) {
      ventasPorDestino.set(destino, (ventasPorDestino.get(destino) ?? 0) + monto);
    }

    if (item.listing_id && item.listings?.titulo) {
      const actual = ventasPorListing.get(item.listing_id);
      ventasPorListing.set(item.listing_id, {
        titulo: item.listings.titulo,
        monto: (actual?.monto ?? 0) + monto,
      });
    }

    const fecha = (item.ordenes as unknown as { created_at: string }).created_at.slice(
      0,
      10
    );
    ventasPorDia.set(fecha, (ventasPorDia.get(fecha) ?? 0) + monto);
  }

  // Siempre se muestran todas las categorias del catalogo (barra en $0 si no
  // hubo ventas en el rango), para que nunca parezca que faltan por un
  // filtro silencioso. Si aparece un tipo fuera del catalogo (dato inconsistente),
  // se agrega igual en vez de descartarlo.
  const tiposAMostrar = new Set([...Object.keys(TIPO_LABEL), ...ventasPorCategoria.keys()]);
  const categorias = [...tiposAMostrar]
    .map((tipo) => ({
      titulo: TIPO_LABEL[tipo] ?? tipo,
      monto: ventasPorCategoria.get(tipo) ?? 0,
    }))
    .sort((a, b) => b.monto - a.monto);

  const destinos = [...ventasPorDestino.entries()]
    .map(([titulo, monto]) => ({ titulo, monto }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

  const topListings = [...ventasPorListing.values()]
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

  const serieVentas = [...ventasPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));

  const comisionesPorAfiliado = new Map<string, number>();
  for (const c of comisiones ?? []) {
    comisionesPorAfiliado.set(
      c.afiliado_id,
      (comisionesPorAfiliado.get(c.afiliado_id) ?? 0) + c.monto
    );
  }

  const afiliadoIds = [...comisionesPorAfiliado.keys()];
  let topAfiliados: { titulo: string; monto: number }[] = [];
  if (afiliadoIds.length > 0) {
    const { data: afiliados } = await supabase
      .from("afiliados")
      .select("id, codigo_5, user_id")
      .in("id", afiliadoIds);

    const userIds = (afiliados ?? []).map((a) => a.user_id);
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("id", userIds);

    topAfiliados = [...comisionesPorAfiliado.entries()]
      .map(([afiliadoId, monto]) => {
        const afiliado = afiliados?.find((a) => a.id === afiliadoId);
        const perfil = perfiles?.find((p) => p.id === afiliado?.user_id);
        return {
          titulo: perfil?.nombre ?? afiliado?.codigo_5 ?? "Afiliado",
          monto,
        };
      })
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);
  }

  return {
    funnel,
    categorias,
    destinos,
    topAfiliados,
    topListings,
    heatmap,
    serieVentas,
    totales: {
      totalVentas,
      totalEventos: eventos?.length ?? 0,
      totalComisiones: (comisiones ?? []).reduce((a, c) => a + c.monto, 0),
    },
  };
}
