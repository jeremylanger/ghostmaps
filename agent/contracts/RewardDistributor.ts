/**
 * RewardDistributor — Distributes GHOST tokens for verified reviews.
 *
 * Reads Guardian ReviewVerification attestations from EAS.
 * If verdict is "legitimate" and confidence >= threshold, releases tokens.
 *
 * This is a server-side distributor (not a smart contract) because:
 * 1. Reading EAS attestation data on-chain requires complex ABI decoding
 * 2. The Guardian wallet holds the GHOST supply and transfers directly
 * 3. Simpler, faster, and cheaper than a separate contract on testnet
 *
 * The flow is fully on-chain verifiable:
 * - Review attestation (EAS) → Guardian verification attestation (EAS) → token transfer (ERC-20)
 * - Anyone can trace the chain: review UID → refUID in verification → transfer event
 */

import { ethers } from "ethers";
import { EAS_GRAPHQL, VERIFICATION_SCHEMA_UID } from "../schema.js";
import { GHOST_TOKEN_ABI, getGhostTokenContract } from "./GhostToken.js";

const CONFIDENCE_THRESHOLD = 60; // Minimum confidence for reward
const REWARD_AMOUNT = ethers.parseEther("10"); // 10 GHOST per verified review

interface VerificationRecord {
  reviewUID: string;
  verdict: string;
  confidence: number;
  reviewerAddress: string;
}

/** Track which reviews have been rewarded (in-memory for hackathon) */
const rewardedReviews = new Set<string>();

/**
 * Check if a review has a legitimate verification and hasn't been rewarded yet.
 * Returns the reviewer address if eligible, null otherwise.
 */
export async function checkRewardEligibility(
  reviewUID: string,
  reviewerAddress: string,
  guardianAddress: string,
): Promise<{ eligible: boolean; reason: string }> {
  if (rewardedReviews.has(reviewUID)) {
    return { eligible: false, reason: "Already rewarded" };
  }

  // Query EAS for verification attestation
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

  // Parse the verification data
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

/**
 * Distribute GHOST tokens to a reviewer for a verified review.
 */
export async function distributeReward(
  wallet: ethers.Wallet,
  tokenAddress: string,
  reviewUID: string,
  reviewerAddress: string,
): Promise<{ txHash: string; amount: string } | null> {
  if (rewardedReviews.has(reviewUID)) {
    console.log(
      `Reward already distributed for review ${reviewUID.slice(0, 10)}...`,
    );
    return null;
  }

  const token = getGhostTokenContract(tokenAddress, wallet);

  // Check balance
  const balance = await token.balanceOf(wallet.address);
  if (balance < REWARD_AMOUNT) {
    console.error(
      `Insufficient GHOST balance: ${ethers.formatEther(balance)} < ${ethers.formatEther(REWARD_AMOUNT)}`,
    );
    return null;
  }

  // Transfer tokens
  const tx = await token.transfer(reviewerAddress, REWARD_AMOUNT);
  await tx.wait();

  rewardedReviews.add(reviewUID);

  const amountStr = ethers.formatEther(REWARD_AMOUNT);
  console.log(
    `Rewarded ${amountStr} GHOST to ${reviewerAddress.slice(0, 10)}... for review ${reviewUID.slice(0, 10)}... TX: ${tx.hash}`,
  );

  return { txHash: tx.hash, amount: amountStr };
}

/**
 * Process all verified reviews and distribute pending rewards.
 */
export async function processRewards(
  wallet: ethers.Wallet,
  tokenAddress: string,
  guardianAddress: string,
  reviews: { uid: string; attester: string }[],
): Promise<{ distributed: number; skipped: number }> {
  let distributed = 0;
  let skipped = 0;

  for (const review of reviews) {
    const { eligible, reason } = await checkRewardEligibility(
      review.uid,
      review.attester,
      guardianAddress,
    );

    if (eligible) {
      const result = await distributeReward(
        wallet,
        tokenAddress,
        review.uid,
        review.attester,
      );
      if (result) {
        distributed++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  return { distributed, skipped };
}

export { CONFIDENCE_THRESHOLD, REWARD_AMOUNT };
