import { createClient } from "@/lib/supabase/server";

export async function getAfiliadoDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: afiliado } = await supabase
    .from("afiliados")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!afiliado) return null;

  const [{ data: clicsEventos }, { data: comisiones }] = await Promise.all([
    supabase
      .from("events_tracking")
      .select("id, created_at")
      .eq("tipo_evento", "click")
      .or(`entidad.eq.${afiliado.codigo_5},entidad.eq.${afiliado.codigo_10}`),
    supabase
      .from("comisiones_afiliado")
      .select("monto, estado, created_at")
      .eq("afiliado_id", afiliado.id)
      .order("created_at", { ascending: true }),
  ]);

  const clics = clicsEventos?.length ?? 0;
  const conversiones = comisiones?.length ?? 0;
  const totalComisiones = (comisiones ?? []).reduce((a, c) => a + c.monto, 0);
  const comisionesPendientes = (comisiones ?? [])
    .filter((c) => c.estado === "pendiente")
    .reduce((a, c) => a + c.monto, 0);

  const factorVentas =
    afiliado.comision_pct > 0 ? 100 / afiliado.comision_pct : 0;
  const ventasAtribuidas = Math.round(totalComisiones * factorVentas);

  const comisionesPorDia = new Map<string, number>();
  for (const c of comisiones ?? []) {
    const fecha = c.created_at.slice(0, 10);
    comisionesPorDia.set(fecha, (comisionesPorDia.get(fecha) ?? 0) + c.monto);
  }
  const serieComisiones = [...comisionesPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));

  return {
    afiliado,
    totales: {
      clics,
      conversiones,
      tasaConversion: clics > 0 ? Math.round((conversiones / clics) * 100) : 0,
      ventasAtribuidas,
      totalComisiones,
      comisionesPendientes,
    },
    serieComisiones,
  };
}
