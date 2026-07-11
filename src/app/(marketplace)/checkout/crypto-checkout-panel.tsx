"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { parseEther, type Abi } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import deployments from "@/lib/blockchain/deployments/sepolia.json";
import { RESERVA_MONTO_ETH } from "@/lib/blockchain/config";

const bookingAbi = deployments.RutaruBooking.abi as Abi;
const bookingAddress = deployments.RutaruBooking.address as `0x${string}`;

export function CryptoCheckoutPanel({
  operadorWallet,
  codigoAfiliado,
}: {
  operadorWallet: string;
  codigoAfiliado: string;
}) {
  const router = useRouter();
  const config = useConfig();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePagarCripto() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const ordenId = crypto.randomUUID();
      const txHash = await writeContractAsync({
        address: bookingAddress,
        abi: bookingAbi,
        functionName: "crearReserva",
        args: [operadorWallet as `0x${string}`, ordenId],
        value: parseEther(RESERVA_MONTO_ETH),
      });

      await waitForTransactionReceipt(config, { hash: txHash });

      const res = await fetch("/api/checkout/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenId,
          txHash,
          walletCliente: address,
          codigoAfiliado,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar la compra");
        setLoading(false);
        return;
      }

      router.push(`/checkout/confirmacion/${data.ordenId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al pagar con cripto");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Pago simbólico en ETH de prueba (Sepolia). El NFT-ticket se acuña a tu
        wallet y el pago queda en garantía (escrow) hasta que el operador
        confirme el servicio.
      </p>

      {!isConnected ? (
        <ConnectButton />
      ) : (
        <>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="button" size="lg" disabled={loading} onClick={handlePagarCripto}>
            {loading ? "Procesando en Sepolia…" : "Pagar con cripto (testnet)"}
          </Button>
        </>
      )}
    </div>
  );
}
