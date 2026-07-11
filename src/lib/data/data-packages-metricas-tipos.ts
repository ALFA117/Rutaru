export const METRICAS_DISPONIBLES = [
  { id: "ventas_por_destino", label: "Ventas por destino" },
  { id: "demografia", label: "Demografía de compradores (ciudad/país)" },
  { id: "tendencias_temporada", label: "Tendencias por temporada" },
  { id: "funnel_conversion", label: "Funnel de conversión" },
] as const;

export type MetricaId = (typeof METRICAS_DISPONIBLES)[number]["id"];
