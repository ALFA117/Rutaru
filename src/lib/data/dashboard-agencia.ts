import { createClient } from "@/lib/supabase/server";

export async function getAgenciaDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: agencia } = await supabase
    .from("agencias")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!agencia) return null;

  const { data: paquetes } = await supabase
    .from("paquetes")
    .select("id, titulo, precio_total, markup_pct")
    .eq("agencia_id", agencia.id);

  const paqueteIds = (paquetes ?? []).map((p) => p.id);

  if (paqueteIds.length === 0) {
    return { agencia, paquetes: [], ventas: [], ordenes: [], totales: emptyTotales() };
  }

  const { data: ventas } = await supabase
    .from("orden_items")
    .select(
      "cantidad, precio, paquete_id, orden_id, ordenes!inner(estado, created_at)"
    )
    .in("paquete_id", paqueteIds)
    .eq("ordenes.estado", "pagada");

  const totalVentas = (ventas ?? []).reduce(
    (acc, v) => acc + v.cantidad * v.precio,
    0
  );
  const totalOrdenes = new Set((ventas ?? []).map((v) => v.orden_id)).size;

  const ventasPorDia = new Map<string, number>();
  for (const v of ventas ?? []) {
    const fecha = (
      v.ordenes as unknown as { created_at: string }
    ).created_at.slice(0, 10);
    ventasPorDia.set(fecha, (ventasPorDia.get(fecha) ?? 0) + v.cantidad * v.precio);
  }
  const serieVentas = [...ventasPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));

  const ventasPorPaquete = new Map<string, number>();
  for (const v of ventas ?? []) {
    if (!v.paquete_id) continue;
    ventasPorPaquete.set(
      v.paquete_id,
      (ventasPorPaquete.get(v.paquete_id) ?? 0) + v.cantidad * v.precio
    );
  }
  const topPaquetes = [...ventasPorPaquete.entries()]
    .map(([paqueteId, monto]) => ({
      titulo: paquetes?.find((p) => p.id === paqueteId)?.titulo ?? "Paquete",
      monto,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

  return {
    agencia,
    paquetes: paquetes ?? [],
    ventas: serieVentas,
    topPaquetes,
    totales: {
      totalVentas,
      totalOrdenes,
      ticketPromedio: totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0,
    },
  };
}

function emptyTotales() {
  return { totalVentas: 0, totalOrdenes: 0, ticketPromedio: 0 };
}
