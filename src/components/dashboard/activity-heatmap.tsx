"use client";

type Celda = { dia: string; hora: number; cantidad: number };

const ORDEN_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HORAS_ETIQUETA = [0, 3, 6, 9, 12, 15, 18, 21];

export function ActivityHeatmap({ data }: { data: Celda[] }) {
  const max = Math.max(1, ...data.map((d) => d.cantidad));
  const porDia = new Map<string, Map<number, number>>();
  for (const d of data) {
    if (!porDia.has(d.dia)) porDia.set(d.dia, new Map());
    porDia.get(d.dia)!.set(d.hora, d.cantidad);
  }

  const total = data.reduce((acc, d) => acc + d.cantidad, 0);
  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Aún no hay actividad suficiente.
      </div>
    );
  }

  function intensidad(cantidad: number) {
    if (cantidad === 0) return 0;
    return 0.15 + (cantidad / max) * 0.85;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="mb-1 grid grid-cols-[3rem_repeat(24,1fr)] gap-[2px] text-[10px] text-muted-foreground">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center">
              {HORAS_ETIQUETA.includes(h) ? h : ""}
            </span>
          ))}
        </div>
        {ORDEN_DIAS.map((dia) => (
          <div
            key={dia}
            className="grid grid-cols-[3rem_repeat(24,1fr)] items-center gap-[2px]"
          >
            <span className="text-xs text-muted-foreground">{dia}</span>
            {Array.from({ length: 24 }, (_, hora) => {
              const cantidad = porDia.get(dia)?.get(hora) ?? 0;
              return (
                <div
                  key={hora}
                  title={`${dia} ${hora}:00 — ${cantidad} evento${cantidad === 1 ? "" : "s"}`}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor:
                      cantidad === 0
                        ? "var(--muted)"
                        : `color-mix(in oklab, var(--chart-1) ${Math.round(
                            intensidad(cantidad) * 100
                          )}%, var(--card))`,
                  }}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Menos</span>
          {[0.15, 0.4, 0.65, 1].map((op) => (
            <div
              key={op}
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor: `color-mix(in oklab, var(--chart-1) ${Math.round(
                  op * 100
                )}%, var(--card))`,
              }}
            />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
