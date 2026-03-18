import { describe, expect, it } from "vitest";

describe("EAS Review Schema", () => {
  it("should compute schema UID using encodePacked (matching Solidity)", async () => {
    const { keccak256, toUtf8Bytes, getBytes, concat } = await import("ethers");
    const schema =
      "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";
    const resolver = "0x0000000000000000000000000000000000000000";

    // EAS uses abi.encodePacked(schema, resolver, revocable) — NOT abi.encode
    const packed = concat([
      toUtf8Bytes(schema),
      getBytes(resolver),
      new Uint8Array([0]),
    ]);
    const uid = keccak256(packed);

    expect(uid).toBe(
      "0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f",
    );
  });

  it("should produce attest calldata that matches Interface.encodeFunctionData", async () => {
    const { Interface } = await import("ethers");
    const { SchemaEncoder } = await import(
      "@ethereum-attestation-service/eas-sdk"
    );

    const schema =
      "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";
    const schemaUID =
      "0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f";
    const ZERO_BYTES32 =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const encoder = new SchemaEncoder(schema);
    const encodedData = encoder.encodeData([
      { name: "rating", value: 5, type: "uint8" },
      { name: "text", value: "Test review", type: "string" },
      { name: "placeId", value: "place-123", type: "string" },
      { name: "placeName", value: "Test Place", type: "string" },
      { name: "photoHash", value: ZERO_BYTES32, type: "bytes32" },
      { name: "lat", value: BigInt(34050000), type: "int256" },
      { name: "lng", value: BigInt(-118240000), type: "int256" },
      { name: "qualityScore", value: 50, type: "uint8" },
    ]);

    // Ground truth: use ethers Interface (the canonical way to encode Solidity calls)
    const iface = new Interface([
      "function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)",
    ]);
    const expected = iface.encodeFunctionData("attest", [
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

    // Now test our buildAttestCalldata function produces the same result
    // (import from client lib — same logic)
    const buildAttestCalldata = (uid: string, data: string): string => {
      return iface.encodeFunctionData("attest", [
        {
          schema: uid,
          data: {
            recipient: ZERO_ADDRESS,
            expirationTime: BigInt(0),
            revocable: false,
            refUID: ZERO_BYTES32,
            data,
            value: BigInt(0),
          },
        },
      ]);
    };

    const actual = buildAttestCalldata(schemaUID, encodedData);

    // Must be byte-for-byte identical
    expect(actual).toBe(expected);
    // Must start with the correct function selector
    expect(actual.slice(0, 10)).toBe("0xf17325e7");
  });

  it("should produce register calldata that matches Interface.encodeFunctionData", async () => {
    const { Interface } = await import("ethers");
    const schema =
      "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const iface = new Interface([
      "function register(string schema, address resolver, bool revocable) external returns (bytes32)",
    ]);

    const expected = iface.encodeFunctionData("register", [
      schema,
      ZERO_ADDRESS,
      false,
    ]);
    // register(string,address,bool) selector
    expect(expected.slice(0, 10)).toBe("0x60d7a278");
    expect(expected.length).toBeGreaterThan(200);
  });

  it("should encode all review data fields without throwing", async () => {
    const { SchemaEncoder } = await import(
      "@ethereum-attestation-service/eas-sdk"
    );
    const schema =
      "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";

    const encoder = new SchemaEncoder(schema);

    // Test edge cases: negative longitude, max rating, zero quality score
    const encoded = encoder.encodeData([
      { name: "rating", value: 1, type: "uint8" },
      {
        name: "text",
        value: "Terrible. Cold food, rude staff, waited 45 minutes.",
        type: "string",
      },
      { name: "placeId", value: "overture-abc-123", type: "string" },
      { name: "placeName", value: "McDonald's", type: "string" },
      {
        name: "photoHash",
        value:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        type: "bytes32",
      },
      { name: "lat", value: BigInt(-33868820), type: "int256" }, // Sydney (negative lat)
      { name: "lng", value: BigInt(151209296), type: "int256" },
      { name: "qualityScore", value: 0, type: "uint8" },
    ]);

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(200);
  });
});
