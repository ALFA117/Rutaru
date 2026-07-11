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

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [{ data: eventos }, { data: ordenItems }, { data: comisiones }] =
    await Promise.all([
      supabase.from("events_tracking").select("tipo_evento"),
      supabase
        .from("orden_items")
        .select(
          "cantidad, precio, listing_id, paquete_id, listings(tipo, ubicacion), ordenes!inner(estado)"
        )
        .eq("ordenes.estado", "pagada"),
      supabase
        .from("comisiones_afiliado")
        .select("monto, afiliado_id"),
    ]);

  const funnelCounts = new Map<string, number>();
  for (const e of eventos ?? []) {
    funnelCounts.set(e.tipo_evento, (funnelCounts.get(e.tipo_evento) ?? 0) + 1);
  }
  const funnel = FUNNEL_ORDEN.map((f) => ({
    etapa: f.etiqueta,
    cantidad: funnelCounts.get(f.tipo) ?? 0,
  }));

  const ventasPorCategoria = new Map<string, number>();
  const ventasPorDestino = new Map<string, number>();
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
  }

  const categorias = [...ventasPorCategoria.entries()]
    .map(([tipo, monto]) => ({ titulo: TIPO_LABEL[tipo] ?? tipo, monto }))
    .sort((a, b) => b.monto - a.monto);

  const destinos = [...ventasPorDestino.entries()]
    .map(([titulo, monto]) => ({ titulo, monto }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

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
    totales: {
      totalVentas,
      totalEventos: eventos?.length ?? 0,
      totalComisiones: (comisiones ?? []).reduce((a, c) => a + c.monto, 0),
    },
  };
}
