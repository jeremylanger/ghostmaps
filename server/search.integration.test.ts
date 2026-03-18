import dotenv from "dotenv";
import path from "path";
import { describe, expect, it } from "vitest";
import { searchOverture } from "./search";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const API_KEY = process.env.OVERTURE_API_KEY;
const TIMEOUT = 15000;

describe("Overture API integration", () => {
  it(
    "returns coffee shops near LA",
    async () => {
      const results = await searchOverture(
        "coffee",
        "34.0522",
        "-118.2437",
        API_KEY,
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(20);

      const first = results[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("latitude");
      expect(first).toHaveProperty("longitude");
      expect(first.name).toBeTruthy();
      expect(first.category).toBe("coffee_shop");
    },
    TIMEOUT,
  );

  it(
    "returns restaurants near NYC",
    async () => {
      const results = await searchOverture(
        "restaurants",
        "40.7128",
        "-74.006",
        API_KEY,
      );

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.name);
      expect(names.every((n) => n !== "Unknown")).toBe(true);
    },
    TIMEOUT,
  );

  it(
    "returns pizza places with addresses",
    async () => {
      const results = await searchOverture(
        "pizza",
        "34.0522",
        "-118.2437",
        API_KEY,
      );

      expect(results.length).toBeGreaterThan(0);

      const withAddress = results.filter((r) => r.address);
      expect(withAddress.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "returns results with valid coordinates near search location",
    async () => {
      const lat = 34.0522;
      const lng = -118.2437;
      const results = await searchOverture(
        "bar",
        String(lat),
        String(lng),
        API_KEY,
      );

      expect(results.length).toBeGreaterThan(0);

      for (const place of results) {
        const dLat = Math.abs(place.latitude - lat);
        const dLng = Math.abs(place.longitude - lng);
        expect(dLat).toBeLessThan(0.1);
        expect(dLng).toBeLessThan(0.1);
      }
    },
    TIMEOUT,
  );

  it(
    "uses default LA coords when none provided",
    async () => {
      const results = await searchOverture(
        "gym",
        undefined,
        undefined,
        API_KEY,
      );

      expect(results.length).toBeGreaterThan(0);

      for (const place of results) {
        expect(place.latitude).toBeGreaterThan(33);
        expect(place.latitude).toBeLessThan(35);
        expect(place.longitude).toBeGreaterThan(-119);
        expect(place.longitude).toBeLessThan(-117);
      }
    },
    TIMEOUT,
  );

  it(
    "handles unknown category gracefully",
    async () => {
      const results = await searchOverture(
        "xyzzy123",
        "34.0522",
        "-118.2437",
        API_KEY,
      );
      expect(Array.isArray(results)).toBe(true);
    },
    TIMEOUT,
  );
});
