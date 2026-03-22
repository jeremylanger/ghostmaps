import { describe, expect, it } from "vitest";
import { SCENARIOS, type ScenarioName } from "./test-harness.js";

describe("Test Harness Scenarios", () => {
  it("defines all expected scenarios", () => {
    const names = Object.keys(SCENARIOS);
    expect(names).toContain("legitimate");
    expect(names).toContain("sybil");
    expect(names).toContain("spam");
    expect(names).toContain("organic");
  });

  it("legitimate reviews have varied ratings", () => {
    const reviews = SCENARIOS.legitimate();
    const ratings = reviews.map((r) => r.rating);
    const unique = new Set(ratings);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("legitimate reviews have detailed content (>50 chars)", () => {
    for (const review of SCENARIOS.legitimate()) {
      expect(review.text.length).toBeGreaterThan(50);
    }
  });

  it("sybil reviews all target the same place", () => {
    const reviews = SCENARIOS.sybil();
    const placeIds = new Set(reviews.map((r) => r.placeId));
    expect(placeIds.size).toBe(1);
  });

  it("sybil reviews all have 5-star ratings", () => {
    for (const review of SCENARIOS.sybil()) {
      expect(review.rating).toBe(5);
    }
  });

  it("sybil reviews have low quality scores", () => {
    for (const review of SCENARIOS.sybil()) {
      expect(review.qualityScore).toBeLessThan(30);
    }
  });

  it("sybil reviews have similar short content", () => {
    const reviews = SCENARIOS.sybil();
    for (const review of reviews) {
      expect(review.text.length).toBeLessThan(100);
    }
  });

  it("spam reviews contain promotional markers", () => {
    const reviews = SCENARIOS.spam();
    const combined = reviews.map((r) => r.text.toLowerCase()).join(" ");
    const hasPromo =
      combined.includes("www.") ||
      combined.includes("http") ||
      combined.includes("call") ||
      combined.includes("% off") ||
      combined.includes("code");
    expect(hasPromo).toBe(true);
  });

  it("spam reviews have very low quality scores", () => {
    for (const review of SCENARIOS.spam()) {
      expect(review.qualityScore).toBeLessThan(15);
    }
  });

  it("organic reviews have varied ratings and high quality", () => {
    const reviews = SCENARIOS.organic();
    const ratings = new Set(reviews.map((r) => r.rating));
    expect(ratings.size).toBeGreaterThan(1);
    for (const review of reviews) {
      expect(review.qualityScore).toBeGreaterThan(50);
    }
  });

  it("organic reviews all target the same place (viral spot)", () => {
    const reviews = SCENARIOS.organic();
    const placeIds = new Set(reviews.map((r) => r.placeId));
    expect(placeIds.size).toBe(1);
  });

  it("organic reviews have unique, detailed content", () => {
    const reviews = SCENARIOS.organic();
    const texts = reviews.map((r) => r.text);
    // All unique
    expect(new Set(texts).size).toBe(texts.length);
    // All detailed
    for (const text of texts) {
      expect(text.length).toBeGreaterThan(80);
    }
  });

  it("all reviews have valid lat/lng", () => {
    for (const name of Object.keys(SCENARIOS) as ScenarioName[]) {
      for (const review of SCENARIOS[name]()) {
        expect(review.lat).toBeGreaterThan(-90);
        expect(review.lat).toBeLessThan(90);
        expect(review.lng).toBeGreaterThan(-180);
        expect(review.lng).toBeLessThan(180);
      }
    }
  });

  it("all reviews have rating 1-5", () => {
    for (const name of Object.keys(SCENARIOS) as ScenarioName[]) {
      for (const review of SCENARIOS[name]()) {
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      }
    }
  });

  it("all reviews have qualityScore 0-100", () => {
    for (const name of Object.keys(SCENARIOS) as ScenarioName[]) {
      for (const review of SCENARIOS[name]()) {
        expect(review.qualityScore).toBeGreaterThanOrEqual(0);
        expect(review.qualityScore).toBeLessThanOrEqual(100);
      }
    }
  });
});
