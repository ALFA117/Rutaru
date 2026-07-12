"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";
import { getWagmiConfig } from "@/lib/blockchain/wagmi-config";

const queryClient = new QueryClient();

export function BlockchainProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        loginMethods: ["wallet", "email", "google"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        defaultChain: sepolia,
        supportedChains: [sepolia],
        appearance: { walletChainType: "ethereum-only" },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={getWagmiConfig()}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
