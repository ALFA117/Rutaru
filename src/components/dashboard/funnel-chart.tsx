"use client";

import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ConversionFunnelChart({
  data,
}: {
  data: { etapa: string; cantidad: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.cantidad));
  const withOpacity = data.map((d, i) => ({
    ...d,
    fill: "var(--chart-1)",
    fillOpacity: 1 - i * 0.18,
  }));

  if (max <= 1 && data.every((d) => d.cantidad === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Aún no hay eventos suficientes.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <FunnelChart>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Funnel dataKey="cantidad" data={withOpacity} isAnimationActive>
          <LabelList
            position="right"
            dataKey="etapa"
            fill="var(--foreground)"
            stroke="none"
            fontSize={12}
          />
          <LabelList
            position="center"
            dataKey="cantidad"
            fill="var(--primary-foreground)"
            stroke="none"
            fontSize={13}
            fontWeight={600}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
