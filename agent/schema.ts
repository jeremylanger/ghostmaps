/**
 * ReviewVerification EAS Schema for the Guardian agent.
 *
 * Schema: string verdict, uint8 confidence, string reasoningSummary
 * - verdict: "legitimate" | "suspicious" | "sybil" | "spam"
 * - confidence: 0-100
 * - reasoningSummary: brief explanation of the verdict
 *
 * Published using EAS refUID to reference the original review attestation.
 */

import { concat, getBytes, keccak256, toUtf8Bytes } from "ethers";

// EAS on Base Sepolia (same predeploy addresses as mainnet)
export const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
export const SCHEMA_REGISTRY = "0x4200000000000000000000000000000000000020";
export const EAS_GRAPHQL = "https://base-sepolia.easscan.org/graphql";
export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

// Review schema (existing — the reviews we're verifying)
export const REVIEW_SCHEMA_UID =
  "0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f";

// Verification schema definition
export const VERIFICATION_SCHEMA =
  "string verdict, uint8 confidence, string reasoningSummary";

// Compute schema UID — keccak256(abi.encodePacked(schema, resolver, revocable))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function computeSchemaUID(schema: string): string {
  const schemaBytes = toUtf8Bytes(schema);
  const resolverBytes = getBytes(ZERO_ADDRESS);
  const revocableBytes = new Uint8Array([0]);
  return keccak256(concat([schemaBytes, resolverBytes, revocableBytes]));
}

export const VERIFICATION_SCHEMA_UID = computeSchemaUID(VERIFICATION_SCHEMA);

export type Verdict = "legitimate" | "suspicious" | "sybil" | "spam";

export interface VerificationData {
  verdict: Verdict;
  confidence: number; // 0-100
  reasoningSummary: string;
}

export interface OnChainReview {
  uid: string;
  attester: string;
  time: number;
  rating: number;
  text: string;
  placeId: string;
  placeName: string;
  photoHash: string;
  lat: number;
  lng: number;
  qualityScore: number;
}
