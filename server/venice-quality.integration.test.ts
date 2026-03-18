import { describe, expect, it } from "vitest";

// Unit tests for review quality scoring logic
// The actual Venice API call is tested in integration tests

describe("Review Quality Scoring — Input Validation", () => {
  it("should reject reviews with no rating", async () => {
    const res = await fetch("http://localhost:3001/api/reviews/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Great place!" }),
    });
    expect(res.status).toBe(400);
  });

  it("should reject reviews with no text", async () => {
    const res = await fetch("http://localhost:3001/api/reviews/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 5 }),
    });
    expect(res.status).toBe(400);
  });

  it("should accept valid review for scoring", async () => {
    const res = await fetch("http://localhost:3001/api/reviews/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 4,
        text: "The fish tacos were amazing, best I have had in downtown LA. The salsa verde was fresh and the portions were generous. Service was quick too.",
        hasPhoto: true,
        structuredResponses: {
          whatOrdered: "Fish tacos and a horchata",
          oneThingToKnow: "Get there before 2pm, they close early on weekdays",
        },
      }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("score");
    expect(data).toHaveProperty("label");
    expect(data).toHaveProperty("flags");
    expect(data).toHaveProperty("reason");
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);
    expect(["generic", "decent", "detailed", "exceptional"]).toContain(
      data.label,
    );
    expect(Array.isArray(data.flags)).toBe(true);
    // A detailed review with specific items should score at least decent
    expect(data.score).toBeGreaterThan(20);
  });

  it("should flag sentiment mismatch (positive text, 1 star)", async () => {
    const res = await fetch("http://localhost:3001/api/reviews/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 1,
        text: "Absolutely incredible! Best meal of my life, the food was perfect, the service was outstanding, and the ambiance was magical.",
        hasPhoto: false,
      }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.flags).toContain("sentiment_mismatch");
  });

  it("should score generic reviews low", async () => {
    const res = await fetch("http://localhost:3001/api/reviews/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        text: "Great place!",
        hasPhoto: false,
      }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.score).toBeLessThanOrEqual(30);
    expect(data.label).toBe("generic");
  });
});
