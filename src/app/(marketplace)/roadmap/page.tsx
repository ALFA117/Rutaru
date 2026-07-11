import { Badge } from "@/components/ui/badge";

const ETAPAS = [
  {
    numero: 1,
    nombre: "Esqueleto (hackathon MVP)",
    estado: "completa" as const,
    descripcion:
      "Setup Next.js + Supabase, autenticación de 5 roles, esquema de base de datos completo, seeds de inventario real, marketplace navegable, checkout sandbox y tracking básico.",
  },
  {
    numero: 2,
    nombre: "Inteligencia",
    estado: "completa" as const,
    descripcion:
      "Dashboards por rol, motor de insights con IA (Gemini), chatbot concierge, recomendador y módulo de afiliados completo.",
  },
  {
    numero: 3,
    nombre: "B2B + Data Marketplace",
    estado: "completa" as const,
    descripcion:
      "Portal de agencias con tarifa neta y allotments, constructor de paquetes cross-categoría, Data Marketplace con paquetes de datos agregados/anonimizados y resumen ejecutivo con IA.",
  },
  {
    numero: 4,
    nombre: "Blockchain (Plan B)",
    estado: "completa" as const,
    descripcion:
      "3 contratos desplegados en Ethereum Sepolia real: RutaruTicket (NFT-ticket con QR verificable en /verificar), RutaruBooking (escrow con liberación/reembolso) y RutaruAffiliate (comisión automática). Conexión de wallet (RainbowKit), checkout con 'Pagar con cripto (testnet)', consentimiento de datos anclado on-chain. Todo detrás del feature flag NEXT_PUBLIC_BLOCKCHAIN_ENABLED — apagado por defecto, la Etapa 1-3 funciona idéntica sin blockchain.",
  },
  {
    numero: 5,
    nombre: "Producción",
    estado: "pendiente" as const,
    descripcion:
      "Pasarela de pago real, KYC de operadores, multi-idioma/multi-moneda, mainnet y apps móviles.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 font-heading text-3xl">Roadmap</h1>
      <p className="mb-10 text-muted-foreground">
        Rutaru evoluciona por etapas. Este es el estado público del desarrollo.
      </p>

      <ol className="flex flex-col gap-8">
        {ETAPAS.map((etapa) => (
          <li key={etapa.numero} className="flex gap-4">
            <span className="font-heading text-2xl text-muted-foreground">
              {String(etapa.numero).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl">{etapa.nombre}</h2>
                <Badge
                  variant={etapa.estado === "completa" ? "default" : "outline"}
                >
                  {etapa.estado === "completa" ? "Completa" : "Pendiente"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {etapa.descripcion}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
