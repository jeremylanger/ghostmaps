import { describe, expect, it } from "vitest";
import {
  computeSchemaUID,
  VERIFICATION_SCHEMA,
  VERIFICATION_SCHEMA_UID,
  type Verdict,
} from "./schema.js";

describe("ReviewVerification Schema", () => {
  it("computes a deterministic schema UID", () => {
    const uid = computeSchemaUID(VERIFICATION_SCHEMA);
    expect(uid).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("VERIFICATION_SCHEMA_UID matches computed UID", () => {
    const computed = computeSchemaUID(VERIFICATION_SCHEMA);
    expect(VERIFICATION_SCHEMA_UID).toBe(computed);
  });

  it("different schemas produce different UIDs", () => {
    const uid1 = computeSchemaUID(VERIFICATION_SCHEMA);
    const uid2 = computeSchemaUID("string foo, uint8 bar");
    expect(uid1).not.toBe(uid2);
  });

  it("schema contains required fields", () => {
    expect(VERIFICATION_SCHEMA).toContain("string verdict");
    expect(VERIFICATION_SCHEMA).toContain("uint8 confidence");
    expect(VERIFICATION_SCHEMA).toContain("string reasoningSummary");
  });

  it("Verdict type accepts valid values", () => {
    const validVerdicts: Verdict[] = [
      "legitimate",
      "suspicious",
      "sybil",
      "spam",
    ];
    for (const v of validVerdicts) {
      expect(typeof v).toBe("string");
    }
  });
});
