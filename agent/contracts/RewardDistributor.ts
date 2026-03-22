/**
 * RewardDistributor — Distributes GHOST tokens for verified reviews.
 *
 * Quadratic reward curve: GHOST = (quality²) / 100
 *   quality 100 → 100 GHOST
 *   quality 75  → 56.25 GHOST
 *   quality 50  → 25 GHOST
 *   quality 25  → 6.25 GHOST
 *   quality 10  → 1 GHOST
 *
 * The flow is fully on-chain verifiable:
 * - Review attestation (EAS) → Guardian verification (EAS) → token transfer (ERC-20)
 * - Anyone can trace the chain: review UID → refUID in verification → transfer event
 */

import { ethers } from "ethers";
import { EAS_GRAPHQL, VERIFICATION_SCHEMA_UID } from "../schema.js";
import { getGhostTokenContract } from "./GhostToken.js";

const CONFIDENCE_THRESHOLD = 60;

/** Quadratic reward: GHOST = (quality²) / 100 */
export function calculateReward(qualityScore: number): bigint {
  const clamped = Math.max(0, Math.min(100, qualityScore));
  const ghost = (clamped * clamped) / 100;
  const rounded = Math.round(ghost * 100) / 100;
  return ethers.parseEther(rounded.toString());
}

/** Track which reviews have been rewarded (in-memory for hackathon) */
const rewardedReviews = new Set<string>();

export async function checkRewardEligibility(
  reviewUID: string,
  guardianAddress: string,
): Promise<{ eligible: boolean; reason: string }> {
  if (rewardedReviews.has(reviewUID)) {
    return { eligible: false, reason: "Already rewarded" };
  }

  const res = await fetch(EAS_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($schemaId: String!, $attester: String!, $refUID: String!) {
        attestations(
          where: {
            schemaId: { equals: $schemaId }
            attester: { equals: $attester }
            refUID: { equals: $refUID }
          }
          take: 1
        ) {
          id decodedDataJson
        }
      }`,
      variables: {
        schemaId: VERIFICATION_SCHEMA_UID,
        attester: guardianAddress,
        refUID: reviewUID,
      },
    }),
  });

  if (!res.ok) {
    console.error(`EAS GraphQL error: ${res.status}`);
    return { eligible: false, reason: "Failed to query verification status" };
  }

  const data = await res.json();
  const attestation = data.data?.attestations?.[0];

  if (!attestation) {
    return { eligible: false, reason: "No verification attestation found" };
  }

  try {
    const fields = JSON.parse(attestation.decodedDataJson);
    const verdict = fields.find((f: { name: string }) => f.name === "verdict")
      ?.value?.value;
    const confidence = Number(
      fields.find((f: { name: string }) => f.name === "confidence")?.value
        ?.value,
    );

    if (verdict !== "legitimate") {
      return {
        eligible: false,
        reason: `Verdict is "${verdict}", not "legitimate"`,
      };
    }

    if (confidence < CONFIDENCE_THRESHOLD) {
      return {
        eligible: false,
        reason: `Confidence ${confidence}% below threshold ${CONFIDENCE_THRESHOLD}%`,
      };
    }

    return { eligible: true, reason: "Verified legitimate review" };
  } catch (err) {
    console.error("Failed to parse verification data:", err);
    return { eligible: false, reason: "Malformed verification data" };
  }
}

export async function distributeReward(
  wallet: ethers.Wallet,
  tokenAddress: string,
  reviewUID: string,
  reviewerAddress: string,
  qualityScore: number,
): Promise<{ txHash: string; amount: string; ghost: number } | null> {
  if (rewardedReviews.has(reviewUID)) {
    console.log(
      `Reward already distributed for review ${reviewUID.slice(0, 10)}...`,
    );
    return null;
  }

  const rewardAmount = calculateReward(qualityScore);
  const token = getGhostTokenContract(tokenAddress, wallet);

  const balance = await token.balanceOf(wallet.address);
  if (balance < rewardAmount) {
    console.error(
      `Insufficient GHOST balance: ${ethers.formatEther(balance)} < ${ethers.formatEther(rewardAmount)}`,
    );
    return null;
  }

  const tx = await token.transfer(reviewerAddress, rewardAmount);
  await tx.wait();

  rewardedReviews.add(reviewUID);

  const ghost = (qualityScore * qualityScore) / 100;
  const amountStr = ethers.formatEther(rewardAmount);
  console.log(
    `Rewarded ${amountStr} GHOST (quality ${qualityScore}) to ${reviewerAddress.slice(0, 10)}... TX: ${tx.hash}`,
  );

  return { txHash: tx.hash, amount: amountStr, ghost };
}

export async function processRewards(
  wallet: ethers.Wallet,
  tokenAddress: string,
  guardianAddress: string,
  reviews: { uid: string; attester: string; qualityScore: number }[],
): Promise<{ distributed: number; skipped: number; totalGhost: number }> {
  let distributed = 0;
  let skipped = 0;
  let totalGhost = 0;

  for (const review of reviews) {
    const { eligible } = await checkRewardEligibility(
      review.uid,
      guardianAddress,
    );

    if (eligible) {
      const result = await distributeReward(
        wallet,
        tokenAddress,
        review.uid,
        review.attester,
        review.qualityScore,
      );
      if (result) {
        distributed++;
        totalGhost += result.ghost;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  return { distributed, skipped, totalGhost };
}

export { CONFIDENCE_THRESHOLD };
