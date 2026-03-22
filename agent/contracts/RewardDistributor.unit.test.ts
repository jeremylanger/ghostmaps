import { ethers } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIDENCE_THRESHOLD, calculateReward } from "./RewardDistributor.js";

describe("calculateReward (quadratic curve)", () => {
  it("quality 100 → 100 GHOST", () => {
    expect(calculateReward(100)).toBe(ethers.parseEther("100"));
  });

  it("quality 75 → 56.25 GHOST", () => {
    expect(calculateReward(75)).toBe(ethers.parseEther("56.25"));
  });

  it("quality 50 → 25 GHOST", () => {
    expect(calculateReward(50)).toBe(ethers.parseEther("25"));
  });

  it("quality 25 → 6.25 GHOST", () => {
    expect(calculateReward(25)).toBe(ethers.parseEther("6.25"));
  });

  it("quality 10 → 1 GHOST", () => {
    expect(calculateReward(10)).toBe(ethers.parseEther("1"));
  });

  it("quality 0 → 0 GHOST", () => {
    expect(calculateReward(0)).toBe(ethers.parseEther("0"));
  });

  it("clamps above 100", () => {
    expect(calculateReward(150)).toBe(ethers.parseEther("100"));
  });

  it("clamps below 0", () => {
    expect(calculateReward(-10)).toBe(ethers.parseEther("0"));
  });
});

describe("RewardDistributor Constants", () => {
  it("confidence threshold is 60", () => {
    expect(CONFIDENCE_THRESHOLD).toBe(60);
  });
});

describe("checkRewardEligibility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ineligible when EAS returns no attestation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attestations: [] } }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility("0xreview123", "0xguardian");
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("No verification");
  });

  it("returns ineligible when verdict is not legitimate", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attestations: [
            {
              id: "0xverification",
              decodedDataJson: JSON.stringify([
                { name: "verdict", value: { value: "sybil" } },
                { name: "confidence", value: { value: "85" } },
                { name: "reasoningSummary", value: { value: "Sybil" } },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility("0xreview456", "0xguardian");
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("sybil");
  });

  it("returns ineligible when confidence is below threshold", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attestations: [
            {
              id: "0xverification",
              decodedDataJson: JSON.stringify([
                { name: "verdict", value: { value: "legitimate" } },
                { name: "confidence", value: { value: "30" } },
                { name: "reasoningSummary", value: { value: "Low" } },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility("0xreview789", "0xguardian");
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("below threshold");
  });

  it("returns eligible for legitimate verdict with high confidence", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attestations: [
            {
              id: "0xverification",
              decodedDataJson: JSON.stringify([
                { name: "verdict", value: { value: "legitimate" } },
                { name: "confidence", value: { value: "85" } },
                { name: "reasoningSummary", value: { value: "Genuine" } },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility("0xreviewOK", "0xguardian");
    expect(result.eligible).toBe(true);
  });

  it("returns ineligible when EAS GraphQL fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility("0xreviewFail", "0xguardian");
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Failed to query");
  });
});
