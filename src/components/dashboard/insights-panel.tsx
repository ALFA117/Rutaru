"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database.types";

type Insight = Database["public"]["Tables"]["ai_insights"]["Row"];

type InsightData = {
  segmentos?: { nombre: string; pct: number }[];
  destinos_en_tendencia?: string[];
  prediccion_demanda?: string;
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function generar() {
    setError(null);
    const res = await fetch("/api/insights/generate", { method: "POST" });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "No se pudo generar el insight");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Generados por Gemini a partir de los datos reales de la plataforma.
        </p>
        <Button size="sm" onClick={generar} disabled={pending}>
          {pending ? "Generando…" : "Generar insight"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {insights.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aún no hay insights generados.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {insights.map((insight) => {
            const data = insight.data as InsightData;
            return (
              <li key={insight.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-heading text-base">{insight.titulo}</span>
                  <Badge variant={insight.generado_por === "mock" ? "outline" : "secondary"}>
                    {insight.generado_por}
                  </Badge>
                </div>
                {insight.resumen && (
                  <p className="mb-3 text-sm text-foreground/90">{insight.resumen}</p>
                )}
                {data.segmentos && data.segmentos.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {data.segmentos.map((s) => (
                      <Badge key={s.nombre} variant="outline">
                        {s.nombre} · {s.pct}%
                      </Badge>
                    ))}
                  </div>
                )}
                {data.destinos_en_tendencia && data.destinos_en_tendencia.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tendencia: {data.destinos_en_tendencia.join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
