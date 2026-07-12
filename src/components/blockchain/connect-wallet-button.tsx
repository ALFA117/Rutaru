"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

function acortar(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  if (!ready) return null;

  if (!authenticated) {
    return (
      <Button size="sm" variant="outline" onClick={() => login()}>
        Conectar wallet
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => logout()}>
      {wallet ? acortar(wallet.address) : "Cuenta conectada"}
    </Button>
  );
}
