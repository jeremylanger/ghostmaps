import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("ERC-8004 Registration", () => {
  const source = readFileSync(
    new URL("./register-8004.ts", import.meta.url),
    "utf-8",
  );

  it("uses the correct ERC-8004 Identity Registry address", () => {
    expect(source).toContain("0x8004A169FB4a3325136EB29fA0ceB6D2e539a432");
  });

  it("builds a valid ERC-8004 registration object", () => {
    expect(source).toContain("eip-8004#registration-v1");
    expect(source).toContain("Ghost Maps Review Guardian");
  });

  it("includes required registration fields", () => {
    expect(source).toContain("name:");
    expect(source).toContain("description:");
    expect(source).toContain("services:");
    expect(source).toContain("active:");
  });

  it("includes Ghost Maps metadata", () => {
    expect(source).toContain("ghostmaps.app");
    expect(source).toContain("jeremylanger/ghostmaps");
  });

  it("references the verification schema UID", () => {
    expect(source).toContain("VERIFICATION_SCHEMA_UID");
  });

  it("uses data URI for agentURI (hackathon, no IPFS needed)", () => {
    expect(source).toContain("data:application/json;base64");
  });
});
