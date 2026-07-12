// Prueba E2E real en Sepolia del flujo "Pagar con cripto": firma la MISMA
// llamada a crearReserva() que haria una wallet conectada via Privy/MetaMask
// (aqui firmada por script con una wallet de prueba fondeada, en vez de un
// click real en la extension, que no se puede automatizar sin exponer una
// llave), y despues pega exactamente contra /api/checkout/crypto -- la misma
// ruta que llama crypto-checkout-panel.tsx.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { JsonRpcProvider, Wallet, Contract, parseEther, formatEther } from "ethers";
import { createClient } from "@supabase/supabase-js";
import { getCookiesFor } from "./login.mjs";
import deployments from "../../src/lib/blockchain/deployments/sepolia.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const FALLBACK_WALLET = "0x2E64066Fb794e1241b0F27b4DD02dC8fC0A3C04f";
const RESERVA_MONTO_ETH = "0.0002";

const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const deployer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function etherscanTx(hash) {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
function etherscanAddress(addr) {
  return `https://sepolia.etherscan.io/address/${addr}`;
}
function etherscanNft(contractAddr, tokenId) {
  return `https://sepolia.etherscan.io/nft/${contractAddr}/${tokenId}`;
}

async function main() {
  console.log("== Paso 0: estado inicial ==");
  const deployerBalance = await provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address, "balance:", formatEther(deployerBalance), "ETH");

  // 1. Wallet de prueba "cliente", generada y fondeada para esta corrida.
  const clienteWallet = Wallet.createRandom().connect(provider);
  console.log("\n== Paso 1: fondear wallet de prueba (cliente) ==");
  console.log("Cliente wallet:", clienteWallet.address);
  const fundTx = await deployer.sendTransaction({
    to: clienteWallet.address,
    value: parseEther("0.005"),
  });
  const fundReceipt = await fundTx.wait();
  console.log("Fondeo tx:", etherscanTx(fundReceipt.hash));
  const clienteBalance = await provider.getBalance(clienteWallet.address);
  console.log("Cliente balance tras fondeo:", formatEther(clienteBalance), "ETH");

  // 2. Preparar carrito real del cliente demo (mismo listing que usaria un
  // usuario real navegando /ruta/reino-de-las-nubes -> agregar al carrito).
  console.log("\n== Paso 2: preparar carrito de cliente@rutaru.demo ==");
  const { data: clienteProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", "cliente@rutaru.demo")
    .single();
  const { data: carrito } = await admin
    .from("carritos")
    .select("id")
    .eq("user_id", clienteProfile.id)
    .single();
  await admin.from("carrito_items").delete().eq("carrito_id", carrito.id);
  const { data: listing } = await admin
    .from("listings")
    .select("id, titulo")
    .eq("slug", "reino-de-las-nubes")
    .single();
  await admin.from("carrito_items").insert({
    carrito_id: carrito.id,
    listing_id: listing.id,
    cantidad: 1,
  });
  console.log("Carrito preparado con:", listing.titulo);

  // 3. La wallet de prueba firma crearReserva() en RutaruBooking -- la
  // transaccion real que Privy/MetaMask le pediria firmar al usuario.
  console.log("\n== Paso 3: crearReserva() real en Sepolia ==");
  const ordenId = crypto.randomUUID();
  const booking = new Contract(
    deployments.RutaruBooking.address,
    deployments.RutaruBooking.abi,
    clienteWallet
  );
  const tx = await booking.crearReserva(FALLBACK_WALLET, ordenId, {
    value: parseEther(RESERVA_MONTO_ETH),
  });
  console.log("Tx enviada:", etherscanTx(tx.hash));
  const receipt = await tx.wait();
  console.log("Confirmada en bloque", receipt.blockNumber, "status:", receipt.status);

  const evento = receipt.logs
    .map((log) => {
      try {
        return booking.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "ReservaCreada");
  if (!evento) throw new Error("No se encontro ReservaCreada en la tx");
  console.log("Evento ReservaCreada:", {
    id: evento.args.id.toString(),
    comprador: evento.args.comprador,
    operador: evento.args.operador,
    monto: formatEther(evento.args.monto) + " ETH",
    folio: evento.args.folio,
  });
  if (evento.args.folio !== ordenId) throw new Error("folio on-chain no coincide con ordenId");

  // 4. Llamar exactamente la misma ruta que golpea crypto-checkout-panel.tsx
  // tras el waitForTransactionReceipt del lado del cliente.
  console.log("\n== Paso 4: POST /api/checkout/crypto (misma ruta que la UI) ==");
  const cookies = await getCookiesFor("cliente@rutaru.demo");
  const cookieHeader = cookies.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");

  const res = await fetch(`${BASE_URL}/api/checkout/crypto`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      ordenId,
      txHash: tx.hash,
      walletCliente: clienteWallet.address,
      codigoAfiliado: "",
    }),
  });
  const body = await res.json();
  console.log("Respuesta API:", res.status, body);
  if (!res.ok) throw new Error(`API fallo: ${JSON.stringify(body)}`);

  // 5. Verificar estado real en la base de datos.
  console.log("\n== Paso 5: verificar orden + NFT en la base de datos ==");
  const { data: orden } = await admin
    .from("ordenes")
    .select("*")
    .eq("id", ordenId)
    .single();
  console.log("Orden:", {
    estado: orden.estado,
    metodo_pago: orden.metodo_pago,
    tx_hash_blockchain: orden.tx_hash_blockchain,
    reserva_id_blockchain: orden.reserva_id_blockchain,
  });

  const { data: ordenItems } = await admin
    .from("orden_items")
    .select("id")
    .eq("orden_id", ordenId);
  const { data: nftTickets } = await admin
    .from("nft_tickets")
    .select("*")
    .in("orden_item_id", (ordenItems ?? []).map((i) => i.id));
  console.log("NFT tickets:", nftTickets);

  // 6. Verificar el NFT directo contra el contrato (lectura publica, sin
  // llave), igual que /verificar/[tokenId].
  console.log("\n== Paso 6: verificar NFT directo contra el contrato ==");
  const ticketContract = new Contract(
    deployments.RutaruTicket.address,
    deployments.RutaruTicket.abi,
    provider
  );
  for (const nft of nftTickets ?? []) {
    const owner = await ticketContract.ownerOf(nft.token_id);
    const tokenURI = await ticketContract.tokenURI(nft.token_id);
    const metadata = JSON.parse(
      Buffer.from(tokenURI.split(",")[1], "base64").toString("utf-8")
    );
    console.log(`Token #${nft.token_id}:`, {
      owner,
      ownerCoincideConCliente: owner.toLowerCase() === clienteWallet.address.toLowerCase(),
      metadata,
      etherscanNft: etherscanNft(nft.contract_address, nft.token_id),
      etherscanMintTx: etherscanTx(nft.tx_hash),
    });
  }

  console.log("\n== EVIDENCIA (Etherscan) ==");
  console.log("Contrato RutaruBooking (verificado, #code):", etherscanAddress(deployments.RutaruBooking.address) + "#code");
  console.log("Contrato RutaruTicket (verificado, #code):", etherscanAddress(deployments.RutaruTicket.address) + "#code");
  console.log("Tx crearReserva:", etherscanTx(tx.hash));
  console.log("Tx fondeo wallet de prueba:", etherscanTx(fundReceipt.hash));
  for (const nft of nftTickets ?? []) {
    console.log(`Tx mint NFT #${nft.token_id}:`, etherscanTx(nft.tx_hash));
  }
  console.log("\nordenId (folio):", ordenId);
  console.log("Cliente wallet de prueba:", clienteWallet.address);
}

main().catch((e) => {
  console.error("\nFALLO:", e.message);
  process.exit(1);
});
