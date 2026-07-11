import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { JsonRpcProvider, Wallet, formatEther } from "ethers";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const MIN_BALANCE_ETH = 0.01;

if (!process.env.DEPLOYER_PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL) {
  console.error(
    "Faltan DEPLOYER_PRIVATE_KEY y/o SEPOLIA_RPC_URL en .env.local (ver .env.example)."
  );
  process.exit(1);
}

const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
const balanceWei = await provider.getBalance(wallet.address);
const balanceEth = Number(formatEther(balanceWei));

console.log(`Wallet de deploy: ${wallet.address}`);
console.log(`Balance en Sepolia: ${balanceEth} ETH`);

if (balanceEth < MIN_BALANCE_ETH) {
  console.warn(
    `Balance bajo (< ${MIN_BALANCE_ETH} ETH). Usa un faucet de Sepolia antes de desplegar (ver README).`
  );
  process.exit(1);
}

console.log("Balance suficiente para desplegar los contratos.");
