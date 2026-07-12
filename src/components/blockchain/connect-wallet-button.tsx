"use client";

import { Wallet } from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

function acortar(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// Icono solo en mobile (el header ya viene justo con logo + login ahi),
// texto completo desde sm hacia arriba.
export function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  if (!ready) return null;

  if (!authenticated) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => login()}
        aria-label="Conectar wallet"
        className="px-2.5 sm:px-3"
      >
        <Wallet className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Conectar wallet</span>
      </Button>
    );
  }

  const etiqueta = wallet ? acortar(wallet.address) : "Cuenta conectada";

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => logout()}
      aria-label={etiqueta}
      className="px-2.5 sm:px-3"
    >
      <Wallet className="h-4 w-4 sm:hidden" />
      <span className="hidden sm:inline">{etiqueta}</span>
    </Button>
  );
}
