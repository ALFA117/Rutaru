import "server-only";
import { JsonRpcProvider, Wallet, Contract, parseEther, type LogDescription } from "ethers";
import deployments from "./deployments/sepolia.json";

function getProvider() {
  return new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
}

function getSigner() {
  return new Wallet(process.env.DEPLOYER_PRIVATE_KEY!, getProvider());
}

function getContract(name: keyof typeof deployments) {
  const deployment = deployments[name];
  return new Contract(deployment.address, deployment.abi, getSigner());
}

export async function mintTicket(to: string, folio: string, metadataURI: string) {
  const contract = getContract("RutaruTicket");
  const tx = await contract.mintTicket(to, folio, metadataURI);
  const receipt = await tx.wait();

  const evento = receipt.logs
    .map((log: unknown): LogDescription | null => {
      try {
        return contract.interface.parseLog(log as { topics: string[]; data: string });
      } catch {
        return null;
      }
    })
    .find(
      (parsed: LogDescription | null): parsed is LogDescription =>
        parsed?.name === "TicketMinted"
    );

  const tokenId = (evento?.args?.tokenId as bigint).toString();

  return {
    tokenId,
    txHash: receipt.hash as string,
    contractAddress: deployments.RutaruTicket.address,
  };
}

/// Lee la transaccion de crearReserva (firmada por el cliente en el
/// frontend) y confirma que en efecto llamo a RutaruBooking, devolviendo
/// el reservaId asignado por el contrato para poder liberarlo/cancelarlo
/// despues.
export async function verificarReservaCreada(txHash: string) {
  const provider = getProvider();
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Transacción no confirmada en Sepolia");
  }
  if (receipt.to?.toLowerCase() !== deployments.RutaruBooking.address.toLowerCase()) {
    throw new Error("La transacción no corresponde al contrato RutaruBooking");
  }

  const iface = getContract("RutaruBooking").interface;
  const evento = receipt.logs
    .map((log): LogDescription | null => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(
      (parsed: LogDescription | null): parsed is LogDescription =>
        parsed?.name === "ReservaCreada"
    );

  if (!evento) {
    throw new Error("No se encontró el evento ReservaCreada en la transacción");
  }

  return {
    reservaId: evento.args.id as bigint,
    comprador: evento.args.comprador as string,
    operador: evento.args.operador as string,
    monto: evento.args.monto as bigint,
    folio: evento.args.folio as string,
  };
}

export async function completarServicio(reservaId: number | bigint) {
  const contract = getContract("RutaruBooking");
  const tx = await contract.completarServicio(reservaId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string };
}

export async function cancelarReservaOnChain(reservaId: number | bigint) {
  const contract = getContract("RutaruBooking");
  const tx = await contract.cancelarReserva(reservaId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string };
}

export async function pagarComision(afiliadoWallet: string, folio: string, montoEth: string) {
  const contract = getContract("RutaruAffiliate");
  const tx = await contract.pagarComision(afiliadoWallet, folio, {
    value: parseEther(montoEth),
  });
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string };
}

/// Ancla un hash on-chain con una transaccion de valor cero desde el
/// backend hacia si mismo, usando el hash como calldata.
export async function anclarHash(hash: string) {
  const signer = getSigner();
  const tx = await signer.sendTransaction({ to: signer.address, value: 0, data: hash });
  const receipt = await tx.wait();
  return { txHash: receipt!.hash as string };
}

export function contractAddresses() {
  return {
    ticket: deployments.RutaruTicket.address,
    booking: deployments.RutaruBooking.address,
    affiliate: deployments.RutaruAffiliate.address,
  };
}

/// Lectura publica de un NFT-ticket directo del contrato — no requiere
/// llave privada, cualquiera puede verificar un ticket.
export async function leerTicketOnChain(tokenId: string) {
  const contract = new Contract(
    deployments.RutaruTicket.address,
    deployments.RutaruTicket.abi,
    getProvider()
  );
  const [owner, tokenURI] = await Promise.all([
    contract.ownerOf(tokenId) as Promise<string>,
    contract.tokenURI(tokenId) as Promise<string>,
  ]);
  return { owner, tokenURI, contractAddress: deployments.RutaruTicket.address };
}
