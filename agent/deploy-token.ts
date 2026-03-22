/**
 * Deploy the GHOST ERC-20 token to Base Sepolia.
 *
 * Usage:
 *   npx tsx agent/deploy-token.ts
 *
 * Requires GUARDIAN_PRIVATE_KEY in .env (the deployer wallet).
 * The wallet must have Base Sepolia ETH for gas.
 * Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
 */

import "dotenv/config";
import { ethers } from "ethers";
import { deployGhostToken } from "./contracts/GhostToken";

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const BASE_SEPOLIA_CHAIN_ID = 84532;
const EXPLORER = "https://sepolia.basescan.org";

async function main() {
  const privateKey = process.env.GUARDIAN_PRIVATE_KEY;
  if (!privateKey) {
    console.error(
      "Missing GUARDIAN_PRIVATE_KEY in .env — run `npx tsx agent/generate-wallet.ts` first.",
    );
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC, {
    name: "base-sepolia",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const signer = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(signer.address);

  console.log(`Deployer: ${signer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error(
      `Wallet has no ETH. Fund it at ${EXPLORER}/address/${signer.address}`,
    );
    process.exit(1);
  }

  const { address } = await deployGhostToken(signer);

  console.log("\n=== Deployment Complete ===\n");
  console.log(`Contract: ${address}`);
  console.log(`Explorer: ${EXPLORER}/address/${address}`);
  console.log(`\nNext steps:`);
  console.log(`1. Add to .env:`);
  console.log(`   GHOST_TOKEN_ADDRESS=${address}`);
  console.log(`2. Verify on BaseScan (optional):`);
  console.log(`   ${EXPLORER}/address/${address}#code`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
