import { describe, expect, it } from "vitest";
import { verdictBadgeConfig } from "../VerificationBadge";

describe("verdictBadgeConfig", () => {
  it('returns green "Verified" config for legitimate verdict', () => {
    const config = verdictBadgeConfig("legitimate");
    expect(config).not.toBeNull();
    expect(config!.label).toBe("Verified");
    expect(config!.text).toContain("emerald");
  });

  it('returns red "Flagged" config for sybil verdict', () => {
    const config = verdictBadgeConfig("sybil");
    expect(config).not.toBeNull();
    expect(config!.label).toBe("Flagged");
    expect(config!.text).toContain("coral");
  });

  it('returns red "Flagged" config for spam verdict', () => {
    const config = verdictBadgeConfig("spam");
    expect(config).not.toBeNull();
    expect(config!.label).toBe("Flagged");
    expect(config!.text).toContain("coral");
  });

  it('returns amber "Suspicious" config for suspicious verdict', () => {
    const config = verdictBadgeConfig("suspicious");
    expect(config).not.toBeNull();
    expect(config!.label).toBe("Suspicious");
    expect(config!.text).toContain("amber");
  });

  it("returns null for unknown verdict", () => {
    expect(verdictBadgeConfig("unknown")).toBeNull();
  });

  it("returns null for empty string verdict", () => {
    expect(verdictBadgeConfig("")).toBeNull();
  });
});
