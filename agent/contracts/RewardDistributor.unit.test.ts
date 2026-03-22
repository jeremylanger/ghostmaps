import { ethers } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIDENCE_THRESHOLD, REWARD_AMOUNT } from "./RewardDistributor.js";

describe("RewardDistributor Constants", () => {
  it("reward amount is 10 GHOST", () => {
    expect(REWARD_AMOUNT).toBe(ethers.parseEther("10"));
  });

  it("confidence threshold is reasonable (40-80 range)", () => {
    expect(CONFIDENCE_THRESHOLD).toBeGreaterThanOrEqual(40);
    expect(CONFIDENCE_THRESHOLD).toBeLessThanOrEqual(80);
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
    const result = await checkRewardEligibility(
      "0xreview123",
      "0xreviewer",
      "0xguardian",
    );
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
                {
                  name: "reasoningSummary",
                  value: { value: "Sybil pattern detected" },
                },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility(
      "0xreview456",
      "0xreviewer",
      "0xguardian",
    );
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
                {
                  name: "reasoningSummary",
                  value: { value: "Low confidence" },
                },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility(
      "0xreview789",
      "0xreviewer",
      "0xguardian",
    );
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
                {
                  name: "reasoningSummary",
                  value: { value: "Genuine review" },
                },
              ]),
            },
          ],
        },
      }),
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility(
      "0xreviewEligible",
      "0xreviewer",
      "0xguardian",
    );
    expect(result.eligible).toBe(true);
    expect(result.reason).toContain("Verified legitimate");
  });

  it("returns ineligible when EAS GraphQL fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { checkRewardEligibility } = await import("./RewardDistributor.js");
    const result = await checkRewardEligibility(
      "0xreviewFail",
      "0xreviewer",
      "0xguardian",
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Failed to query");
  });
});
