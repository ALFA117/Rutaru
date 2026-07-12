"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export function StatTile({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number[];
}) {
  const trendData = trend?.map((v, i) => ({ i, v }));
  const trendUp = trend && trend.length > 1 && trend[trend.length - 1] >= trend[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {trendData && trendData.length > 1 && (
            <div className="h-10 w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={trendUp ? "var(--chart-good)" : "var(--chart-2)"}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={trendUp ? "var(--chart-good)" : "var(--chart-2)"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={trendUp ? "var(--chart-good)" : "var(--chart-2)"}
                    strokeWidth={1.5}
                    fill={`url(#spark-${label})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
