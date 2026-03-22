/**
 * Distribute GHOST rewards for previously verified legitimate reviews.
 * Usage: npx tsx agent/distribute-rewards.ts
 */

import "dotenv/config";
import { JsonRpcProvider, Wallet } from "ethers";
import { processRewards } from "./contracts/RewardDistributor.js";
import { queryNewReviews } from "./tools.js";

async function main() {
  const pk = process.env.GUARDIAN_PRIVATE_KEY;
  const tokenAddress = process.env.GHOST_TOKEN_ADDRESS;
  if (!pk || !tokenAddress) {
    console.error("Set GUARDIAN_PRIVATE_KEY and GHOST_TOKEN_ADDRESS in .env");
    process.exit(1);
  }

  const provider = new JsonRpcProvider("https://sepolia.base.org");
  const wallet = new Wallet(pk, provider);

  console.log(`Wallet: ${wallet.address}`);
  console.log(`GHOST token: ${tokenAddress}`);

  // Get all reviews
  const reviews = await queryNewReviews(0);
  console.log(`Found ${reviews.length} total reviews`);

  // Filter out Guardian's own + test harness reviews
  const eligible = reviews
    .filter((r) => r.attester.toLowerCase() !== wallet.address.toLowerCase())
    .filter((r) => !r.placeId.startsWith("test-guardian"))
    .map((r) => ({
      uid: r.uid,
      attester: r.attester,
      qualityScore: r.qualityScore,
    }));

  console.log(`Eligible for rewards: ${eligible.length}`);
  for (const r of eligible) {
    const reward = (r.qualityScore * r.qualityScore) / 100;
    console.log(
      `  ${r.uid.slice(0, 12)}... quality: ${r.qualityScore} → ${reward.toFixed(2)} GHOST → ${r.attester.slice(0, 12)}...`,
    );
  }

  console.log(`\nDistributing rewards...`);
  const result = await processRewards(
    wallet,
    tokenAddress,
    wallet.address,
    eligible,
  );
  console.log(
    `\nDone: ${result.distributed} distributed (${result.totalGhost.toFixed(2)} GHOST), ${result.skipped} skipped`,
  );
}

main().catch((err) => {
  console.error("Reward distribution failed:", err);
  process.exit(1);
});
