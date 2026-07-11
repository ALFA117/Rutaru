import { TopBarChart } from "@/components/dashboard/top-bar-chart";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { ConversionFunnelChart } from "@/components/dashboard/funnel-chart";

type Preview = {
  ventas_por_destino?: { titulo: string; monto: number }[];
  demografia?: {
    porCiudad: { titulo: string; cantidad: number }[];
    porPais: { titulo: string; cantidad: number }[];
  };
  tendencias_temporada?: { fecha: string; monto: number }[];
  funnel_conversion?: { etapa: string; cantidad: number }[];
};

export function DataPackagePreview({ preview }: { preview: Preview }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {preview.ventas_por_destino && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Ventas por destino</h3>
          <TopBarChart
            data={preview.ventas_por_destino}
            dataKey="monto"
            valueLabel="Ventas"
          />
        </div>
      )}
      {preview.demografia && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Compradores por ciudad</h3>
          <TopBarChart
            data={preview.demografia.porCiudad}
            dataKey="cantidad"
            valueLabel="Compradores"
          />
        </div>
      )}
      {preview.tendencias_temporada && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Tendencias por temporada</h3>
          <SalesAreaChart data={preview.tendencias_temporada} />
        </div>
      )}
      {preview.funnel_conversion && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Funnel de conversión</h3>
          <ConversionFunnelChart data={preview.funnel_conversion} />
        </div>
      )}
    </div>
  );
}
