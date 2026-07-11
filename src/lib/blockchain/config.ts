export const SEPOLIA_CHAIN_ID = 11155111;

// Montos simbolicos de ETH de prueba (Sepolia) para el demo de Etapa 4 —
// no hay conversion real de MXN, ver README/CHANGELOG.
export const RESERVA_MONTO_ETH = "0.0002";
export const COMISION_MONTO_ETH = "0.00002";

// Wallet del deployer/backend — receptor de demo cuando un operador no
// configuro su propia wallet_address. Es publica (visible en Etherscan),
// no un secreto.
export const FALLBACK_WALLET = "0x2E64066Fb794e1241b0F27b4DD02dC8fC0A3C04f";

export function etherscanTxUrl(txHash: string) {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function etherscanAddressUrl(address: string) {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function etherscanTokenUrl(contractAddress: string, tokenId: string | number) {
  return `https://sepolia.etherscan.io/nft/${contractAddress}/${tokenId}`;
}
