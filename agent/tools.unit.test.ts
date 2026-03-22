import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VERIFICATION_SCHEMA } from "./schema.js";
import { TOOL_DEFINITIONS } from "./tools.js";

describe("Tool Definitions", () => {
  it("defines all 5 tools", () => {
    expect(TOOL_DEFINITIONS).toHaveLength(5);
  });

  it("all tools have OpenAI function calling format with name, description, and parameters", () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.type).toBe("function");
      expect(tool.function.name).toBeTruthy();
      expect(tool.function.description).toBeTruthy();
      expect(tool.function.parameters).toBeTruthy();
      expect(tool.function.parameters.type).toBe("object");
      expect(tool.function.parameters.required).toBeTruthy();
    }
  });

  it("tool names match expected set", () => {
    const names = TOOL_DEFINITIONS.map((t) => t.function.name);
    expect(names).toContain("queryNewReviews");
    expect(names).toContain("queryWalletHistory");
    expect(names).toContain("queryPlaceReviews");
    expect(names).toContain("publishVerification");
    expect(names).toContain("publishSybilAlert");
  });

  it("publishVerification requires all fields", () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === "publishVerification",
    );
    expect(tool?.function.parameters.required).toEqual([
      "reviewUID",
      "verdict",
      "confidence",
      "reasoningSummary",
    ]);
  });

  it("publishSybilAlert takes an array of UIDs", () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === "publishSybilAlert",
    );
    const props = tool?.function.parameters.properties as Record<
      string,
      { type: string }
    >;
    expect(props.reviewUIDs.type).toBe("array");
  });

  it("verdict enum includes all valid values", () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === "publishVerification",
    );
    const props = tool?.function.parameters.properties as Record<
      string,
      { enum?: string[] }
    >;
    expect(props.verdict.enum).toEqual([
      "legitimate",
      "suspicious",
      "sybil",
      "spam",
    ]);
  });
});

describe("Verification Data Encoding", () => {
  it("encodes verification data with SchemaEncoder", () => {
    const encoder = new SchemaEncoder(VERIFICATION_SCHEMA);
    const encoded = encoder.encodeData([
      { name: "verdict", value: "legitimate", type: "string" },
      { name: "confidence", value: 85, type: "uint8" },
      {
        name: "reasoningSummary",
        value: "Detailed review with specific menu items and visit context.",
        type: "string",
      },
    ]);
    expect(encoded).toMatch(/^0x/);
    expect(encoded.length).toBeGreaterThan(10);
  });

  it("encodes all verdict types", () => {
    const encoder = new SchemaEncoder(VERIFICATION_SCHEMA);
    for (const verdict of ["legitimate", "suspicious", "sybil", "spam"]) {
      const encoded = encoder.encodeData([
        { name: "verdict", value: verdict, type: "string" },
        { name: "confidence", value: 50, type: "uint8" },
        { name: "reasoningSummary", value: "test", type: "string" },
      ]);
      expect(encoded).toMatch(/^0x/);
    }
  });

  it("handles confidence boundary values", () => {
    const encoder = new SchemaEncoder(VERIFICATION_SCHEMA);
    for (const confidence of [0, 1, 50, 99, 100]) {
      const encoded = encoder.encodeData([
        { name: "verdict", value: "legitimate", type: "string" },
        { name: "confidence", value: confidence, type: "uint8" },
        { name: "reasoningSummary", value: "test", type: "string" },
      ]);
      expect(encoded).toMatch(/^0x/);
    }
  });

  it("handles empty reasoning summary", () => {
    const encoder = new SchemaEncoder(VERIFICATION_SCHEMA);
    const encoded = encoder.encodeData([
      { name: "verdict", value: "legitimate", type: "string" },
      { name: "confidence", value: 90, type: "uint8" },
      { name: "reasoningSummary", value: "", type: "string" },
    ]);
    expect(encoded).toMatch(/^0x/);
  });
});
