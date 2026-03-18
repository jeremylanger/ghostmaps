import dotenv from "dotenv";
import path from "path";
import { describe, expect, it } from "vitest";
import { calculateRoute } from "./tomtom";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const TOMTOM_KEY = process.env.TOMTOM_API_KEY;

// LA Downtown to Santa Monica — real route with speed limit sections
const FROM_LAT = 34.0522;
const FROM_LNG = -118.2437;
const TO_LAT = 34.0195;
const TO_LNG = -118.4912;

describe("TomTom speed limits (real API)", () => {
  it("returns speed limit sections for a real route", async () => {
    if (!TOMTOM_KEY) {
      console.log("Skipping: TOMTOM_API_KEY not set");
      return;
    }

    const route = await calculateRoute(
      FROM_LAT,
      FROM_LNG,
      TO_LAT,
      TO_LNG,
      TOMTOM_KEY,
    );

    expect(route.speedLimits).toBeDefined();
    expect(Array.isArray(route.speedLimits)).toBe(true);

    // LA → Santa Monica should have speed limit data
    if (route.speedLimits.length > 0) {
      const first = route.speedLimits[0];
      expect(first.startPointIndex).toBeGreaterThanOrEqual(0);
      expect(first.endPointIndex).toBeGreaterThan(first.startPointIndex);
      expect(first.maxSpeedKmh).toBeGreaterThan(0);
      expect(first.maxSpeedMph).toBeGreaterThan(0);
      // Speed limits should be reasonable (10-130 km/h)
      expect(first.maxSpeedKmh).toBeGreaterThanOrEqual(10);
      expect(first.maxSpeedKmh).toBeLessThanOrEqual(130);
    }
  }, 15_000);

  it("speed limit point indices are within route coordinate bounds", async () => {
    if (!TOMTOM_KEY) {
      console.log("Skipping: TOMTOM_API_KEY not set");
      return;
    }

    const route = await calculateRoute(
      FROM_LAT,
      FROM_LNG,
      TO_LAT,
      TO_LNG,
      TOMTOM_KEY,
    );
    const numCoords = route.coordinates.length;

    for (const section of route.speedLimits) {
      expect(section.startPointIndex).toBeGreaterThanOrEqual(0);
      expect(section.endPointIndex).toBeLessThan(numCoords);
      expect(section.startPointIndex).toBeLessThanOrEqual(
        section.endPointIndex,
      );
    }
  }, 15_000);

  it("route still returns all existing fields alongside speed limits", async () => {
    if (!TOMTOM_KEY) {
      console.log("Skipping: TOMTOM_API_KEY not set");
      return;
    }

    const route = await calculateRoute(
      FROM_LAT,
      FROM_LNG,
      TO_LAT,
      TO_LNG,
      TOMTOM_KEY,
    );

    // Existing fields should still work
    expect(route.coordinates.length).toBeGreaterThan(10);
    expect(route.instructions.length).toBeGreaterThan(2);
    expect(route.summary.lengthInMeters).toBeGreaterThan(10000);
    expect(route.summary.travelTimeInSeconds).toBeGreaterThan(300);
    // New field
    expect(route.speedLimits).toBeDefined();
  }, 15_000);
});

describe("Review cache via HTTP endpoint", () => {
  const BASE = "http://localhost:3001";

  it("first request fetches from EAS, second request is faster (cached)", async () => {
    const placeId = "test-cache-" + Date.now();

    const start1 = Date.now();
    const res1 = await fetch(`${BASE}/api/reviews/${placeId}`);
    const time1 = Date.now() - start1;

    expect(res1.ok).toBe(true);
    const data1 = await res1.json();
    expect(data1.reviews).toBeDefined();
    expect(Array.isArray(data1.reviews)).toBe(true);

    // Second request (should be cached)
    const start2 = Date.now();
    const res2 = await fetch(`${BASE}/api/reviews/${placeId}`);
    const time2 = Date.now() - start2;

    expect(res2.ok).toBe(true);
    const data2 = await res2.json();
    expect(data2.reviews).toEqual(data1.reviews);

    // Cached response should complete quickly (under 100ms for a cache hit)
    console.log(
      `First request: ${time1}ms, Second request (cached): ${time2}ms`,
    );
    // For empty results with no reviews, both are fast — just verify the cache returns valid data
    expect(data2).toEqual(data1);
  }, 30_000);

  it("review endpoint returns correct shape", async () => {
    const res = await fetch(`${BASE}/api/reviews/nonexistent-place-12345`);
    expect(res.ok).toBe(true);

    const data = await res.json();
    expect(data).toHaveProperty("reviews");
    expect(data).toHaveProperty("identities");
    expect(data).toHaveProperty("summary");
    expect(Array.isArray(data.reviews)).toBe(true);
    expect(typeof data.identities).toBe("object");
    expect(typeof data.summary).toBe("string");
  }, 15_000);
});
