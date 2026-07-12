import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

let cached: ReturnType<typeof createConfig> | null = null;

/// Config de wagmi (bindings de Privy) construida de forma perezosa: solo
/// se llama cuando el flag NEXT_PUBLIC_BLOCKCHAIN_ENABLED esta encendido y
/// el provider realmente se monta, para que Plan A nunca cargue Privy.
export function getWagmiConfig() {
  if (!cached) {
    cached = createConfig({
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(),
      },
    });
  }
  return cached;
}
