import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import hre from "hardhat";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const { ethers } = await hre.network.create("sepolia");
  const [deployer] = await ethers.getSigners();

  console.log("Desplegando con la wallet:", deployer.address);

  const ticket = await ethers.deployContract("RutaruTicket", [deployer.address]);
  await ticket.waitForDeployment();
  console.log("RutaruTicket:", await ticket.getAddress());

  const booking = await ethers.deployContract("RutaruBooking", [deployer.address]);
  await booking.waitForDeployment();
  console.log("RutaruBooking:", await booking.getAddress());

  const affiliate = await ethers.deployContract("RutaruAffiliate", [deployer.address]);
  await affiliate.waitForDeployment();
  console.log("RutaruAffiliate:", await affiliate.getAddress());

  const artifacts = {
    RutaruTicket: {
      address: await ticket.getAddress(),
      txHash: ticket.deploymentTransaction()?.hash ?? null,
      abi: JSON.parse(ticket.interface.formatJson()),
    },
    RutaruBooking: {
      address: await booking.getAddress(),
      txHash: booking.deploymentTransaction()?.hash ?? null,
      abi: JSON.parse(booking.interface.formatJson()),
    },
    RutaruAffiliate: {
      address: await affiliate.getAddress(),
      txHash: affiliate.deploymentTransaction()?.hash ?? null,
      abi: JSON.parse(affiliate.interface.formatJson()),
    },
  };

  const outDir = join(__dirname, "..", "..", "src", "lib", "blockchain", "deployments");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "sepolia.json"), JSON.stringify(artifacts, null, 2));

  console.log("\nGuardado en src/lib/blockchain/deployments/sepolia.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
