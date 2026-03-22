import { describe, expect, it } from "vitest";
import {
  BASESCAN_URL,
  buildAttestCalldata,
  buildRegisterSchemaCalldata,
  computeSchemaUID,
  EAS_CONTRACT,
  EAS_NETWORK,
  EASSCAN_URL,
  encodeReviewData,
  REVIEW_SCHEMA,
  REVIEW_SCHEMA_UID,
  SCHEMA_REGISTRY,
} from "../eas";

describe("EAS constants", () => {
  it("EASSCAN_URL is a non-empty string", () => {
    expect(typeof EASSCAN_URL).toBe("string");
    expect(EASSCAN_URL.length).toBeGreaterThan(0);
  });

  it("REVIEW_SCHEMA_UID matches expected format (0x + 64 hex chars)", () => {
    expect(REVIEW_SCHEMA_UID).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("EAS_CONTRACT is a valid Ethereum address", () => {
    expect(EAS_CONTRACT).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("SCHEMA_REGISTRY is a valid Ethereum address", () => {
    expect(SCHEMA_REGISTRY).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("EAS_NETWORK is base-sepolia", () => {
    expect(EAS_NETWORK).toBe("base-sepolia");
  });

  it("BASESCAN_URL points to sepolia", () => {
    expect(BASESCAN_URL).toContain("sepolia");
  });

  it("REVIEW_SCHEMA is a non-empty string", () => {
    expect(typeof REVIEW_SCHEMA).toBe("string");
    expect(REVIEW_SCHEMA.length).toBeGreaterThan(0);
  });
});

describe("computeSchemaUID", () => {
  it("returns a 0x-prefixed 64 hex char string", () => {
    const uid = computeSchemaUID(REVIEW_SCHEMA);
    expect(uid).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("matches the registered REVIEW_SCHEMA_UID", () => {
    const computed = computeSchemaUID(REVIEW_SCHEMA);
    expect(computed).toBe(REVIEW_SCHEMA_UID);
  });

  it("produces different UIDs for different schemas", () => {
    const uid1 = computeSchemaUID("uint8 rating");
    const uid2 = computeSchemaUID("string text");
    expect(uid1).not.toBe(uid2);
  });
});

describe("encodeReviewData", () => {
  it("returns a hex string", () => {
    const encoded = encodeReviewData({
      rating: 5,
      text: "Great place",
      placeId: "ChIJ123",
      placeName: "Test Cafe",
      photoHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      lat: 34052200,
      lng: -118243700,
      qualityScore: 85,
    });
    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });

  it("uses zero bytes32 when photoHash is empty", () => {
    const encoded = encodeReviewData({
      rating: 3,
      text: "OK",
      placeId: "id",
      placeName: "name",
      photoHash: "",
      lat: 0,
      lng: 0,
      qualityScore: 50,
    });
    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
  });
});

describe("buildAttestCalldata", () => {
  it("returns a hex-encoded calldata string", () => {
    const encoded = encodeReviewData({
      rating: 4,
      text: "Nice",
      placeId: "ChIJ456",
      placeName: "Test Bar",
      photoHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      lat: 40712800,
      lng: -74006000,
      qualityScore: 70,
    });
    const calldata = buildAttestCalldata(REVIEW_SCHEMA_UID, encoded);
    expect(calldata).toMatch(/^0x[0-9a-f]+$/i);
    // attest function selector is the first 4 bytes (10 hex chars with 0x)
    expect(calldata.length).toBeGreaterThan(10);
  });
});

describe("buildRegisterSchemaCalldata", () => {
  it("returns a hex-encoded calldata string", () => {
    const calldata = buildRegisterSchemaCalldata(REVIEW_SCHEMA);
    expect(calldata).toMatch(/^0x[0-9a-f]+$/i);
    expect(calldata.length).toBeGreaterThan(10);
  });
});
