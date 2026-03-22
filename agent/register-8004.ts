/**
 * Register the Review Guardian agent via ERC-8004 on Base Sepolia.
 *
 * ERC-8004 Identity Registry gives the Guardian a verifiable on-chain identity:
 * - agentId (ERC-721 NFT)
 * - agentURI with metadata about capabilities and services
 *
 * Registry address: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 * (same address on 20+ chains including Base)
 *
 * Usage: npx tsx agent/register-8004.ts
 * Requires: GUARDIAN_PRIVATE_KEY in .env
 */

import "dotenv/config";
import { Interface, JsonRpcProvider, Wallet } from "ethers";
import { BASE_SEPOLIA_RPC, VERIFICATION_SCHEMA_UID } from "./schema.js";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

const REGISTRY_ABI = [
  "function register(string agentURI, string ref) external returns (uint256)",
];

function buildAgentURI(guardianAddress: string): string {
  const registration = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "Ghost Maps Review Guardian",
    description:
      "Autonomous agent that monitors on-chain review attestations on Base, " +
      "investigates patterns and fraud, and publishes transparent verification " +
      "verdicts as EAS attestations. Protects the integrity of Ghost Maps reviews " +
      "through private reasoning and public, immutable verdicts.",
    services: [
      {
        name: "ReviewVerification",
        endpoint: `https://base-sepolia.easscan.org/schema/view/${VERIFICATION_SCHEMA_UID}`,
        version: "1.0.0",
      },
    ],
    active: true,
    metadata: {
      app: "Ghost Maps",
      appUrl: "https://ghostmaps.app",
      repo: "https://github.com/jeremylanger/ghostmaps",
      chain: "base-sepolia",
      wallet: guardianAddress,
      verificationSchema: VERIFICATION_SCHEMA_UID,
      model: "claude-sonnet-4-5-20250514",
    },
  };

  // For hackathon: use data URI instead of IPFS
  // In production, upload to IPFS and use ipfs:// URI
  const json = JSON.stringify(registration);
  return `data:application/json;base64,${Buffer.from(json).toString("base64")}`;
}

async function main() {
  const pk = process.env.GUARDIAN_PRIVATE_KEY;
  if (!pk) {
    console.error("Set GUARDIAN_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
  const wallet = new Wallet(pk, provider);

  console.log(`Registering Guardian agent via ERC-8004`);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Registry: ${IDENTITY_REGISTRY}`);

  const agentURI = buildAgentURI(wallet.address);
  console.log(`Agent URI length: ${agentURI.length} chars`);

  const iface = new Interface(REGISTRY_ABI);
  const data = iface.encodeFunctionData("register", [agentURI, ""]);

  const tx = await wallet.sendTransaction({
    to: IDENTITY_REGISTRY,
    data,
  });

  console.log(`TX sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Confirmed in block ${receipt?.blockNumber}`);
  console.log(
    `\nGuardian is now registered on the ERC-8004 Identity Registry.`,
  );
  console.log(`View: https://sepolia.basescan.org/tx/${tx.hash}`);
}

main().catch((err) => {
  console.error("ERC-8004 registration failed:", err);
  process.exit(1);
});
