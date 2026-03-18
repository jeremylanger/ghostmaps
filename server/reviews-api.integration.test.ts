import { beforeAll, describe, expect, it } from "vitest";

const BASE = "http://localhost:3001";
const KNOWN_PLACE_ID = "cec5013f-9c05-441a-83e5-460a5ac3e9cb"; // Senor Fish — has real attestations

describe("Reviews API Integration", () => {
  describe("GET /api/reviews/:placeId", () => {
    // Fetch once, verify multiple properties (endpoint is slow: EAS + identity + Venice)
    let reviewsData: any;

    beforeAll(async () => {
      const res = await fetch(`${BASE}/api/reviews/${KNOWN_PLACE_ID}`);
      expect(res.ok).toBe(true);
      reviewsData = await res.json();
    }, 30000);

    it("should return reviews with correct shape", () => {
      expect(reviewsData.reviews).toBeDefined();
      expect(Array.isArray(reviewsData.reviews)).toBe(true);
      expect(reviewsData.reviews.length).toBeGreaterThanOrEqual(1);

      const review = reviewsData.reviews[0];
      expect(review.uid).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(review.attester).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.text.length).toBeGreaterThan(0);
      expect(review.placeId).toBe(KNOWN_PLACE_ID);
      expect(review.qualityScore).toBeGreaterThanOrEqual(0);
      expect(review.qualityScore).toBeLessThanOrEqual(100);
      expect(review.time).toBeGreaterThan(0);
    });

    it("should include identity data for attesters", () => {
      expect(reviewsData.identities).toBeDefined();
      expect(typeof reviewsData.identities).toBe("object");

      const attesters = Object.keys(reviewsData.identities);
      expect(attesters.length).toBeGreaterThanOrEqual(1);

      const identity = reviewsData.identities[attesters[0]];
      expect(identity.firstSeen).toBeGreaterThan(0);
      expect(identity.totalReviews).toBeGreaterThanOrEqual(1);
    });

    it("should include Venice AI summary", () => {
      expect(typeof reviewsData.summary).toBe("string");
      expect(reviewsData.summary.length).toBeGreaterThan(10);
    });

    it("should return empty results for a non-existent place", async () => {
      const res = await fetch(`${BASE}/api/reviews/nonexistent-place-xyz`);
      expect(res.ok).toBe(true);

      const data = await res.json();
      expect(data.reviews).toEqual([]);
      expect(data.identities).toEqual({});
      expect(data.summary).toBe("");
    });
  });

  describe("POST /api/compare", () => {
    it("should reject with fewer than 2 place IDs", async () => {
      const res = await fetch(`${BASE}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: ["one"] }),
      });
      expect(res.status).toBe(400);
    });

    it("should reject with more than 5 place IDs", async () => {
      const res = await fetch(`${BASE}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: ["a", "b", "c", "d", "e", "f"] }),
      });
      expect(res.status).toBe(400);
    });

    it("should reject when places are not in cache", async () => {
      const res = await fetch(`${BASE}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: ["fake-1", "fake-2"] }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Not enough places");
    });
  });

  describe("Photo endpoints", () => {
    it("POST /api/photos should store a photo and return hash", async () => {
      const fakeImage = Buffer.from("fake-image-bytes-for-api-test");
      const res = await fetch(`${BASE}/api/photos`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: fakeImage,
      });
      expect(res.ok).toBe(true);

      const data = await res.json();
      expect(data.hash).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it("GET /api/photos/:hash should serve a previously uploaded photo", async () => {
      const content = Buffer.from("serve-test-photo-bytes");
      const uploadRes = await fetch(`${BASE}/api/photos`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: content,
      });
      const { hash } = await uploadRes.json();

      const serveRes = await fetch(`${BASE}/api/photos/${hash}`);
      expect(serveRes.ok).toBe(true);

      const body = await serveRes.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe("serve-test-photo-bytes");
    });

    it("GET /api/photos/:hash should 404 for non-existent hash", async () => {
      const res = await fetch(
        `${BASE}/api/photos/0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`,
      );
      expect(res.status).toBe(404);
    });
  });
});
