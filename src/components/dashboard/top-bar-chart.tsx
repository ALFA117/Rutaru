"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const numberFormatter = new Intl.NumberFormat("es-MX");

// `format` es un string (serializable a traves del limite RSC) en vez de una
// funcion -- pasar una funcion como prop desde un Server Component a este
// Client Component revienta la serializacion de React ("Functions cannot be
// passed directly to Client Components").
export function TopBarChart({
  data,
  dataKey,
  nameKey = "titulo",
  valueLabel,
  format = "number",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey?: string;
  valueLabel: string;
  format?: "currency" | "number";
}) {
  const formatValue = format === "currency" ? formatCurrency : (v: number) => numberFormatter.format(v);
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sin datos suficientes todavía.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={formatValue}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={110}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatValue(Number(value)), valueLabel]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey={dataKey} name={valueLabel} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
