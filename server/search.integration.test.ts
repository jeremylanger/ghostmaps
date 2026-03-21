import dotenv from "dotenv";
import path from "path";
import { describe, expect, it } from "vitest";
import { searchByName } from "./google-places";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TIMEOUT = 15000;

describe("Google Places search integration", () => {
  it(
    "returns coffee shops near LA",
    async () => {
      if (!API_KEY) return;
      const results = await searchByName(
        "coffee shops",
        API_KEY,
        34.0522,
        -118.2437,
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);

      const first = results[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("latitude");
      expect(first).toHaveProperty("longitude");
      expect(first.name).toBeTruthy();
    },
    TIMEOUT,
  );

  it(
    "returns restaurants near NYC",
    async () => {
      if (!API_KEY) return;
      const results = await searchByName(
        "restaurants",
        API_KEY,
        40.7128,
        -74.006,
      );

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.name);
      expect(names.every((n) => n !== "Unknown")).toBe(true);
    },
    TIMEOUT,
  );

  it(
    "finds a specific place by name",
    async () => {
      if (!API_KEY) return;
      const results = await searchByName(
        "Empire State Building",
        API_KEY,
        40.7128,
        -74.006,
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toMatch(/Empire State/i);
    },
    TIMEOUT,
  );

  it(
    "returns results with valid coordinates",
    async () => {
      if (!API_KEY) return;
      const results = await searchByName("pizza", API_KEY, 34.0522, -118.2437);

      expect(results.length).toBeGreaterThan(0);

      for (const place of results) {
        expect(place.latitude).toBeGreaterThan(-90);
        expect(place.latitude).toBeLessThan(90);
        expect(place.longitude).toBeGreaterThan(-180);
        expect(place.longitude).toBeLessThan(180);
      }
    },
    TIMEOUT,
  );

  it(
    "handles unknown query gracefully",
    async () => {
      if (!API_KEY) return;
      const results = await searchByName(
        "xyzzy123nonsense",
        API_KEY,
        34.0522,
        -118.2437,
      );
      expect(Array.isArray(results)).toBe(true);
    },
    TIMEOUT,
  );
});
