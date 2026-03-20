const EAS_GRAPHQL = "https://base-sepolia.easscan.org/graphql";
const REVIEW_SCHEMA_UID =
  "0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f";

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

interface DecodedField {
  name: string;
  value: { value: string };
}

function parseDecodedData(decodedDataJson: string): Record<string, string> {
  const fields: DecodedField[] = JSON.parse(decodedDataJson);
  const result: Record<string, string> = {};
  for (const f of fields) {
    result[f.name] = f.value.value;
  }
  return result;
}

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/** Fetch all reviews for a given placeId from EAS on Base Sepolia */
export async function fetchReviewsForPlace(
  placeId: string,
): Promise<OnChainReview[]> {
  const res = await fetch(EAS_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($schemaId: String!) {
        attestations(
          where: { schemaId: { equals: $schemaId } }
          orderBy: [{ time: desc }]
          take: 50
        ) {
          id
          attester
          time
          decodedDataJson
        }
      }`,
      variables: { schemaId: REVIEW_SCHEMA_UID },
    }),
  });

  if (!res.ok) {
    throw new Error(`EAS GraphQL error: ${res.status}`);
  }

  const data = await res.json();
  const attestations = data.data?.attestations || [];

  const reviews: OnChainReview[] = [];
  for (const a of attestations) {
    try {
      const fields = parseDecodedData(a.decodedDataJson);
      if (fields.placeId !== placeId) continue;

      reviews.push({
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
      });
    } catch (err) {
      console.error("EAS: skipping malformed attestation:", err);
    }
  }

  return reviews;
}

/** Fetch the first attestation timestamp for an address (account age proxy) */
export async function fetchAccountAge(
  attester: string,
): Promise<{ firstSeen: number; totalReviews: number }> {
  const res = await fetch(EAS_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($schemaId: String!, $attester: String!) {
        attestations(
          where: {
            schemaId: { equals: $schemaId }
            attester: { equals: $attester }
          }
          orderBy: [{ time: asc }]
          take: 1
        ) {
          time
        }
        aggregateAttestation(
          where: {
            schemaId: { equals: $schemaId }
            attester: { equals: $attester }
          }
        ) {
          _count { id }
        }
      }`,
      variables: { schemaId: REVIEW_SCHEMA_UID, attester },
    }),
  });

  if (!res.ok) {
    throw new Error(`EAS GraphQL error: ${res.status}`);
  }

  const data = await res.json();
  const first = data.data?.attestations?.[0];
  const count = data.data?.aggregateAttestation?._count?.id || 0;

  return {
    firstSeen: first?.time || 0,
    totalReviews: count,
  };
}
