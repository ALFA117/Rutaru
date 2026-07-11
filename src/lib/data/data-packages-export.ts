type Preview = {
  ventas_por_destino?: { titulo: string; monto: number }[];
  demografia?: {
    porCiudad: { titulo: string; cantidad: number }[];
    porPais: { titulo: string; cantidad: number }[];
  };
  tendencias_temporada?: { fecha: string; monto: number }[];
  funnel_conversion?: { etapa: string; cantidad: number }[];
};

export type FilaDataset = {
  metrica: string;
  categoria: string;
  valor: number;
};

/**
 * Aplana el preview (ya agregado y anonimizado desde su origen — solo
 * conteos/montos, nunca nombres/emails/ids) a filas planas para CSV/JSON.
 */
export function aplanarDataset(preview: Preview): FilaDataset[] {
  const filas: FilaDataset[] = [];

  for (const v of preview.ventas_por_destino ?? []) {
    filas.push({ metrica: "ventas_por_destino", categoria: v.titulo, valor: v.monto });
  }
  for (const c of preview.demografia?.porCiudad ?? []) {
    filas.push({
      metrica: "demografia_por_ciudad",
      categoria: c.titulo,
      valor: c.cantidad,
    });
  }
  for (const p of preview.demografia?.porPais ?? []) {
    filas.push({ metrica: "demografia_por_pais", categoria: p.titulo, valor: p.cantidad });
  }
  for (const t of preview.tendencias_temporada ?? []) {
    filas.push({ metrica: "tendencias_temporada", categoria: t.fecha, valor: t.monto });
  }
  for (const f of preview.funnel_conversion ?? []) {
    filas.push({ metrica: "funnel_conversion", categoria: f.etapa, valor: f.cantidad });
  }

  return filas;
}

export function filasToCsv(filas: FilaDataset[]) {
  const header = "metrica,categoria,valor";
  const rows = filas.map(
    (f) => `${f.metrica},"${f.categoria.replace(/"/g, '""')}",${f.valor}`
  );
  return [header, ...rows].join("\n");
}
