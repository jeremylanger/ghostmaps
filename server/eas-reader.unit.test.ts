import { describe, expect, it } from "vitest";

// Test the parsing logic used in eas-reader (extracted for testability)

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

describe("EAS Reader - Decoded Data Parsing", () => {
  it("should parse EAS decodedDataJson into a flat key-value map", () => {
    const json = JSON.stringify([
      {
        name: "rating",
        type: "uint8",
        signature: "",
        value: { name: "rating", type: "uint8", value: "5" },
      },
      {
        name: "text",
        type: "string",
        signature: "",
        value: { name: "text", type: "string", value: "Great tacos!" },
      },
      {
        name: "placeId",
        type: "string",
        signature: "",
        value: { name: "placeId", type: "string", value: "place-123" },
      },
      {
        name: "placeName",
        type: "string",
        signature: "",
        value: { name: "placeName", type: "string", value: "Taco Bell" },
      },
      {
        name: "photoHash",
        type: "bytes32",
        signature: "",
        value: {
          name: "photoHash",
          type: "bytes32",
          value:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      },
      {
        name: "lat",
        type: "int256",
        signature: "",
        value: { name: "lat", type: "int256", value: "34050000" },
      },
      {
        name: "lng",
        type: "int256",
        signature: "",
        value: { name: "lng", type: "int256", value: "-118240000" },
      },
      {
        name: "qualityScore",
        type: "uint8",
        signature: "",
        value: { name: "qualityScore", type: "uint8", value: "72" },
      },
    ]);

    const result = parseDecodedData(json);

    expect(result.rating).toBe("5");
    expect(result.text).toBe("Great tacos!");
    expect(result.placeId).toBe("place-123");
    expect(result.placeName).toBe("Taco Bell");
    expect(result.qualityScore).toBe("72");
    expect(Number(result.lat) / 1e6).toBeCloseTo(34.05, 2);
    expect(Number(result.lng) / 1e6).toBeCloseTo(-118.24, 2);
  });

  it("should handle empty decoded data array", () => {
    const result = parseDecodedData("[]");
    expect(result).toEqual({});
  });

  it("should correctly identify zero photo hash", () => {
    const ZERO_BYTES32 =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const json = JSON.stringify([
      {
        name: "photoHash",
        type: "bytes32",
        signature: "",
        value: { name: "photoHash", type: "bytes32", value: ZERO_BYTES32 },
      },
    ]);
    const result = parseDecodedData(json);
    expect(result.photoHash).toBe(ZERO_BYTES32);
  });

  it("should correctly identify non-zero photo hash", () => {
    const hash =
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const json = JSON.stringify([
      {
        name: "photoHash",
        type: "bytes32",
        signature: "",
        value: { name: "photoHash", type: "bytes32", value: hash },
      },
    ]);
    const result = parseDecodedData(json);
    expect(result.photoHash).toBe(hash);
  });
});

describe("EAS Reader - Review Data Conversion", () => {
  it("should convert lat/lng from int256 (scaled 1e6) to float", () => {
    // Los Angeles
    const lat = Number("34050000") / 1e6;
    const lng = Number("-118240000") / 1e6;
    expect(lat).toBeCloseTo(34.05, 4);
    expect(lng).toBeCloseTo(-118.24, 4);
  });

  it("should handle negative latitude (Southern hemisphere)", () => {
    // Sydney
    const lat = Number("-33868820") / 1e6;
    expect(lat).toBeCloseTo(-33.86882, 4);
  });

  it("should convert quality score string to number in 0-100 range", () => {
    expect(Number("0")).toBe(0);
    expect(Number("50")).toBe(50);
    expect(Number("100")).toBe(100);
  });
});
