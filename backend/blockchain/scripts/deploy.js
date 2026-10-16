const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[Deploy] Deploying BloodLinkRegistry...");
  
  const BloodLinkRegistry = await hre.ethers.getContractFactory("BloodLinkRegistry");
  const registry = await BloodLinkRegistry.deploy();
  await registry.waitForDeployment();
  
  const address = await registry.getAddress();
  console.log(`[Deploy] BloodLinkRegistry deployed to: ${address}`);
  
  // Salva endereço em deployed.json para o backend consumir
  const deployedPath = path.join(__dirname, "deployed.json");
  fs.writeFileSync(deployedPath, JSON.stringify({ address, network: hre.network.name }, null, 2));
  console.log(`[Deploy] Address saved to ${deployedPath}`);
  
  // Copia ABI para o backend
  const artifactPath = path.join(__dirname, "artifacts", "contracts", "BloodLinkRegistry.sol", "BloodLinkRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const abiPath = path.join(__dirname, "..", "src", "blockchain-abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`[Deploy] ABI saved to ${abiPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
