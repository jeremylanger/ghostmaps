/**
 * Deploy the ReviewVerification EAS schema on Base Sepolia.
 *
 * Usage: npx tsx agent/deploy-schema.ts
 * Requires: GUARDIAN_PRIVATE_KEY in .env
 */

import "dotenv/config";
import { Interface, JsonRpcProvider, Wallet } from "ethers";
import {
  BASE_SEPOLIA_RPC,
  SCHEMA_REGISTRY,
  VERIFICATION_SCHEMA,
  VERIFICATION_SCHEMA_UID,
} from "./schema.js";

const SCHEMA_REGISTRY_ABI = [
  "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
];

async function main() {
  const pk = process.env.GUARDIAN_PRIVATE_KEY;
  if (!pk) {
    console.error("Set GUARDIAN_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
  const wallet = new Wallet(pk, provider);
  console.log(`Deploying schema from: ${wallet.address}`);
  console.log(`Schema: ${VERIFICATION_SCHEMA}`);
  console.log(`Expected UID: ${VERIFICATION_SCHEMA_UID}`);

  const iface = new Interface(SCHEMA_REGISTRY_ABI);
  const data = iface.encodeFunctionData("register", [
    VERIFICATION_SCHEMA,
    "0x0000000000000000000000000000000000000000", // no resolver
    false, // not revocable
  ]);

  const tx = await wallet.sendTransaction({
    to: SCHEMA_REGISTRY,
    data,
  });

  console.log(`TX sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Confirmed in block ${receipt?.blockNumber}`);
  console.log(`Schema UID: ${VERIFICATION_SCHEMA_UID}`);
  console.log(
    `View: https://base-sepolia.easscan.org/schema/view/${VERIFICATION_SCHEMA_UID}`,
  );
}

main().catch((err) => {
  console.error("Schema deployment failed:", err);
  process.exit(1);
});
