import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

let cached: ReturnType<typeof getDefaultConfig> | null = null;

/// Construye la config de wagmi/RainbowKit de forma perezosa: solo se llama
/// cuando el flag NEXT_PUBLIC_BLOCKCHAIN_ENABLED esta encendido y el
/// provider realmente se monta, para que Plan A (flag apagado) nunca
/// dependa de NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
export function getWagmiConfig() {
  if (!cached) {
    cached = getDefaultConfig({
      appName: "Rutaru",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
      chains: [sepolia],
      ssr: true,
    });
  }
  return cached;
}
