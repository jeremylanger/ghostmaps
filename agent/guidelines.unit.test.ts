import { describe, expect, it } from "vitest";
import { GUARDIAN_MODEL, GUARDIAN_SYSTEM_PROMPT } from "./guidelines.js";

describe("Guardian Guidelines", () => {
  it("system prompt defines the agent mandate", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("Review Guardian");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("Ghost Maps");
  });

  it("system prompt lists all available tools", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("queryNewReviews");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("queryWalletHistory");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("queryPlaceReviews");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("publishVerification");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("publishSybilAlert");
  });

  it("system prompt defines all verdict types", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("legitimate");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("suspicious");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("sybil");
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("spam");
  });

  it("system prompt includes privacy principle", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain(
      "Never correlate with real identity",
    );
  });

  it("system prompt includes caution principle", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("Err toward caution");
  });

  it("system prompt includes transparency principle", () => {
    expect(GUARDIAN_SYSTEM_PROMPT).toContain("Transparency over authority");
  });

  it("guardian model is set", () => {
    expect(GUARDIAN_MODEL).toBeTruthy();
    expect(typeof GUARDIAN_MODEL).toBe("string");
  });
});
