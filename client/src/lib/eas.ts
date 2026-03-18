import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { concat, getBytes, Interface, keccak256, toUtf8Bytes } from "ethers";

// EAS on Base Sepolia (same predeploy addresses as mainnet — switch to 'base' for production)
export const EAS_CONTRACT =
  "0x4200000000000000000000000000000000000021" as const;
export const SCHEMA_REGISTRY =
  "0x4200000000000000000000000000000000000020" as const;

// Network config — change to 'base' for mainnet
export const EAS_NETWORK = "base-sepolia" as const;
export const BASESCAN_URL = "https://sepolia.basescan.org" as const;
export const EASSCAN_URL = "https://base-sepolia.easscan.org" as const;

// Review schema definition
export const REVIEW_SCHEMA =
  "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";

// Schema UID — keccak256(abi.encodePacked(schema, resolver, revocable))
// Registered on Base Sepolia via TX 0x3b5d04fd96f148c5d6f36372b4647565987d132b713ec0fe7053af604bca9a71
export const REVIEW_SCHEMA_UID =
  "0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f";

export interface ReviewData {
  rating: number; // 1-5
  text: string;
  placeId: string;
  placeName: string;
  photoHash: string; // SHA-256 of photo bytes, or 0x0...0 if no photo
  lat: number; // latitude * 1e6 (integer)
  lng: number; // longitude * 1e6 (integer)
  qualityScore: number; // 0-100 from Venice AI
}

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Encode review data for EAS attestation */
export function encodeReviewData(review: ReviewData): string {
  const encoder = new SchemaEncoder(REVIEW_SCHEMA);
  return encoder.encodeData([
    { name: "rating", value: review.rating, type: "uint8" },
    { name: "text", value: review.text, type: "string" },
    { name: "placeId", value: review.placeId, type: "string" },
    { name: "placeName", value: review.placeName, type: "string" },
    {
      name: "photoHash",
      value: review.photoHash || ZERO_BYTES32,
      type: "bytes32",
    },
    { name: "lat", value: BigInt(review.lat), type: "int256" },
    { name: "lng", value: BigInt(review.lng), type: "int256" },
    { name: "qualityScore", value: review.qualityScore, type: "uint8" },
  ]);
}

const EAS_ABI = [
  "function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)",
];

const SCHEMA_REGISTRY_ABI = [
  "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
];

/** Build the EAS attest() calldata for use with CDP sendUserOperation. */
export function buildAttestCalldata(
  schemaUID: string,
  encodedData: string,
): string {
  const iface = new Interface(EAS_ABI);
  return iface.encodeFunctionData("attest", [
    {
      schema: schemaUID,
      data: {
        recipient: ZERO_ADDRESS,
        expirationTime: BigInt(0),
        revocable: false,
        refUID: ZERO_BYTES32,
        data: encodedData,
        value: BigInt(0),
      },
    },
  ]);
}

/** Build the SchemaRegistry register() calldata. */
export function buildRegisterSchemaCalldata(schema: string): string {
  const iface = new Interface(SCHEMA_REGISTRY_ABI);
  return iface.encodeFunctionData("register", [schema, ZERO_ADDRESS, false]);
}

/** Compute the schema UID — keccak256(abi.encodePacked(schema, resolver, revocable)) */
export function computeSchemaUID(schema: string): string {
  const schemaBytes = toUtf8Bytes(schema);
  const resolverBytes = getBytes(ZERO_ADDRESS);
  const revocableBytes = new Uint8Array([0]);
  return keccak256(concat([schemaBytes, resolverBytes, revocableBytes]));
}

/** Hash a photo file for on-chain proof */
export async function hashPhoto(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return (
    "0x" +
    Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
