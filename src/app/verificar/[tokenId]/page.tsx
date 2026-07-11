import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { leerTicketOnChain } from "@/lib/blockchain/provider";
import { etherscanTokenUrl, etherscanTxUrl } from "@/lib/blockchain/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}) {
  const { tokenId } = await params;
  const supabase = await createClient();

  const { data: nftTicket } = await supabase
    .from("nft_tickets")
    .select("*, orden_items(listings(titulo, tipo))")
    .eq("token_id", Number(tokenId))
    .maybeSingle();

  if (!nftTicket) notFound();

  let onChain;
  try {
    onChain = await leerTicketOnChain(tokenId);
  } catch {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verifyUrl = `${siteUrl}/verificar/${tokenId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 });

  let metadataName = "Rutaru ticket";
  try {
    const json = Buffer.from(onChain.tokenURI.split(",")[1] ?? "", "base64").toString("utf-8");
    const metadata = JSON.parse(json);
    if (metadata.name) metadataName = metadata.name;
  } catch {
    // metadata no parseable — se muestra el nombre por defecto
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16">
      <Badge className="bg-accent text-accent-foreground">NFT-ticket verificado</Badge>
      <h1 className="text-center font-heading text-3xl">{metadataName}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="QR de verificación"
        className="rounded-lg border border-border"
        width={240}
        height={240}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token ID</span>
            <span className="tabular-nums">{tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dueño actual</span>
            <code className="text-xs">{onChain.owner}</code>
          </div>
          {nftTicket.orden_items?.listings?.titulo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserva</span>
              <span>{nftTicket.orden_items.listings.titulo}</span>
            </div>
          )}
          <a
            href={etherscanTokenUrl(onChain.contractAddress, tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 underline"
          >
            Ver contrato en Etherscan ↗
          </a>
          {nftTicket.tx_hash && (
            <a
              href={etherscanTxUrl(nftTicket.tx_hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Ver transacción de acuñación ↗
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
