/**
 * Guardian Agent Tools — EAS query and publish functions.
 *
 * These are the tools the LLM agent can call during its investigation loop.
 */

import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Interface, JsonRpcProvider, type Wallet } from "ethers";
import {
  EAS_CONTRACT,
  EAS_GRAPHQL,
  type OnChainReview,
  REVIEW_SCHEMA_UID,
  VERIFICATION_SCHEMA,
  VERIFICATION_SCHEMA_UID,
  type Verdict,
} from "./schema.js";

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------
// EAS GraphQL helpers
// ---------------------------------------------------------------------------

interface RawAttestation {
  id: string;
  attester: string;
  time: number;
  refUID: string;
  decodedDataJson: string;
}

interface DecodedField {
  name: string;
  value: { value: string | { type: string; hex: string } };
}

function parseDecodedData(decodedDataJson: string): Record<string, string> {
  const fields: DecodedField[] = JSON.parse(decodedDataJson);
  const result: Record<string, string> = {};
  for (const f of fields) {
    const val = f.value.value;
    if (val && typeof val === "object" && "hex" in val) {
      const hex = val.hex;
      const negative = hex.startsWith("-");
      const num = Number.parseInt(negative ? hex.slice(1) : hex, 16);
      result[f.name] = String(negative ? -num : num);
    } else {
      result[f.name] = val as string;
    }
  }
  return result;
}

async function gqlQuery(
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(EAS_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`EAS GraphQL error: ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

function parseReviewAttestation(a: RawAttestation): OnChainReview | null {
  try {
    const fields = parseDecodedData(a.decodedDataJson);
    return {
      uid: a.id,
      attester: a.attester,
      time: a.time,
      rating: Number(fields.rating),
      text: fields.text,
      placeId: fields.placeId,
      placeName: fields.placeName,
      photoHash: fields.photoHash === ZERO_BYTES32 ? "" : fields.photoHash,
      lat: Number(fields.lat) !== 0 ? Number(fields.lat) / 1e6 : 0,
      lng: Number(fields.lng) !== 0 ? Number(fields.lng) / 1e6 : 0,
      qualityScore: Number(fields.qualityScore),
    };
  } catch (err) {
    console.error("Skipping malformed attestation:", a.id, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Query tools
// ---------------------------------------------------------------------------

/** Fetch new review attestations since a given timestamp */
export async function queryNewReviews(
  sinceTimestamp: number,
): Promise<OnChainReview[]> {
  const data = (await gqlQuery(
    `query($schemaId: String!, $since: Int!) {
      attestations(
        where: {
          schemaId: { equals: $schemaId }
          time: { gt: $since }
        }
        orderBy: [{ time: desc }]
        take: 100
      ) {
        id attester time refUID decodedDataJson
      }
    }`,
    { schemaId: REVIEW_SCHEMA_UID, since: sinceTimestamp },
  )) as { attestations: RawAttestation[] };

  return (data.attestations || [])
    .map(parseReviewAttestation)
    .filter((r): r is OnChainReview => r !== null);
}

/** Fetch all reviews by a specific wallet address */
export async function queryWalletHistory(
  walletAddress: string,
): Promise<OnChainReview[]> {
  const data = (await gqlQuery(
    `query($schemaId: String!, $attester: String!) {
      attestations(
        where: {
          schemaId: { equals: $schemaId }
          attester: { equals: $attester }
        }
        orderBy: [{ time: desc }]
        take: 50
      ) {
        id attester time refUID decodedDataJson
      }
    }`,
    { schemaId: REVIEW_SCHEMA_UID, attester: walletAddress },
  )) as { attestations: RawAttestation[] };

  return (data.attestations || [])
    .map(parseReviewAttestation)
    .filter((r): r is OnChainReview => r !== null);
}

/** Fetch all reviews for a specific place */
export async function queryPlaceReviews(
  placeId: string,
): Promise<OnChainReview[]> {
  // EAS doesn't support filtering by decoded field values,
  // so we fetch all and filter client-side (same as eas-reader.ts)
  const data = (await gqlQuery(
    `query($schemaId: String!) {
      attestations(
        where: { schemaId: { equals: $schemaId } }
        orderBy: [{ time: desc }]
        take: 100
      ) {
        id attester time refUID decodedDataJson
      }
    }`,
    { schemaId: REVIEW_SCHEMA_UID },
  )) as { attestations: RawAttestation[] };

  return (data.attestations || [])
    .map(parseReviewAttestation)
    .filter((r): r is OnChainReview => r !== null && r.placeId === placeId);
}

/** Check if a verification attestation already exists for a review UID */
export async function queryExistingVerification(
  reviewUID: string,
  guardianAddress: string,
): Promise<boolean> {
  const data = (await gqlQuery(
    `query($schemaId: String!, $attester: String!, $refUID: String!) {
      attestations(
        where: {
          schemaId: { equals: $schemaId }
          attester: { equals: $attester }
          refUID: { equals: $refUID }
        }
        take: 1
      ) {
        id
      }
    }`,
    {
      schemaId: VERIFICATION_SCHEMA_UID,
      attester: guardianAddress,
      refUID: reviewUID,
    },
  )) as { attestations: { id: string }[] };

  return (data.attestations?.length || 0) > 0;
}

// ---------------------------------------------------------------------------
// Publish tools
// ---------------------------------------------------------------------------

const EAS_ABI = [
  "function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)",
];

function encodeVerificationData(
  verdict: Verdict,
  confidence: number,
  reasoningSummary: string,
): string {
  const encoder = new SchemaEncoder(VERIFICATION_SCHEMA);
  return encoder.encodeData([
    { name: "verdict", value: verdict, type: "string" },
    { name: "confidence", value: confidence, type: "uint8" },
    { name: "reasoningSummary", value: reasoningSummary, type: "string" },
  ]);
}

function buildAttestCalldata(
  schemaUID: string,
  encodedData: string,
  refUID: string,
): string {
  const iface = new Interface(EAS_ABI);
  return iface.encodeFunctionData("attest", [
    {
      schema: schemaUID,
      data: {
        recipient: "0x0000000000000000000000000000000000000000",
        expirationTime: BigInt(0),
        revocable: false,
        refUID,
        data: encodedData,
        value: BigInt(0),
      },
    },
  ]);
}

export interface PublishResult {
  txHash: string;
  reviewUID: string;
  verdict: Verdict;
  confidence: number;
}

/** Publish a verification attestation for a single review */
export async function publishVerification(
  wallet: Wallet,
  reviewUID: string,
  verdict: Verdict,
  confidence: number,
  reasoningSummary: string,
): Promise<PublishResult> {
  const encodedData = encodeVerificationData(
    verdict,
    confidence,
    reasoningSummary,
  );
  const calldata = buildAttestCalldata(
    VERIFICATION_SCHEMA_UID,
    encodedData,
    reviewUID,
  );

  const tx = await wallet.sendTransaction({
    to: EAS_CONTRACT,
    data: calldata,
  });
  await tx.wait();

  console.log(
    `Published: ${verdict} (${confidence}%) for review ${reviewUID.slice(0, 10)}... TX: ${tx.hash}`,
  );
  return { txHash: tx.hash, reviewUID, verdict, confidence };
}

/** Publish a sybil alert covering multiple reviews */
export async function publishSybilAlert(
  wallet: Wallet,
  reviewUIDs: string[],
  confidence: number,
  reasoningSummary: string,
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  for (const uid of reviewUIDs) {
    const result = await publishVerification(
      wallet,
      uid,
      "sybil",
      confidence,
      reasoningSummary,
    );
    results.push(result);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Tool definitions for LLM function calling
// ---------------------------------------------------------------------------

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "queryNewReviews",
      description:
        "Fetch new review attestations since a given Unix timestamp. Returns reviews with uid, attester, time, rating, text, placeId, placeName, photoHash, lat, lng, qualityScore.",
      parameters: {
        type: "object" as const,
        properties: {
          sinceTimestamp: {
            type: "number",
            description: "Unix timestamp — fetch reviews after this time",
          },
        },
        required: ["sinceTimestamp"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "queryWalletHistory",
      description:
        "Fetch all reviews by a specific wallet address across all places. Useful for investigating a reviewer's behavior pattern.",
      parameters: {
        type: "object" as const,
        properties: {
          walletAddress: {
            type: "string",
            description: "Ethereum wallet address (0x...)",
          },
        },
        required: ["walletAddress"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "queryPlaceReviews",
      description:
        "Fetch all reviews for a specific place. Useful for checking if a place is being targeted by a sybil attack or seeing organic review patterns.",
      parameters: {
        type: "object" as const,
        properties: {
          placeId: {
            type: "string",
            description: "Google Places ID for the place",
          },
        },
        required: ["placeId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publishVerification",
      description:
        "Publish a verification attestation on-chain for a single review. Use for legitimate, suspicious, or spam verdicts.",
      parameters: {
        type: "object" as const,
        properties: {
          reviewUID: {
            type: "string",
            description:
              "The EAS attestation UID of the review being verified",
          },
          verdict: {
            type: "string",
            enum: ["legitimate", "suspicious", "sybil", "spam"],
            description: "The verification verdict",
          },
          confidence: {
            type: "number",
            description: "Confidence level 0-100",
          },
          reasoningSummary: {
            type: "string",
            description: "Brief explanation of the verdict (1-2 sentences)",
          },
        },
        required: ["reviewUID", "verdict", "confidence", "reasoningSummary"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publishSybilAlert",
      description:
        "Publish sybil alert attestations for multiple coordinated fake reviews. Each review in the list gets a sybil verdict with the same reasoning.",
      parameters: {
        type: "object" as const,
        properties: {
          reviewUIDs: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of review attestation UIDs that are part of the sybil cluster",
          },
          confidence: {
            type: "number",
            description: "Confidence level 0-100",
          },
          reasoningSummary: {
            type: "string",
            description: "Brief explanation of the sybil pattern detected",
          },
        },
        required: ["reviewUIDs", "confidence", "reasoningSummary"],
      },
    },
  },
];
