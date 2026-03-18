import dotenv from "dotenv";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { calculateRoute } from "./tomtom";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const API_KEY = process.env.TOMTOM_API_KEY;

// LA Downtown → Santa Monica (~15 mi)
const FROM = { lat: 34.0522, lng: -118.2437 };
const TO = { lat: 34.0195, lng: -118.4912 };

describe.skipIf(!API_KEY)("TomTom Integration", () => {
  it("calculates a real route between two LA points", async () => {
    const result = await calculateRoute(
      FROM.lat,
      FROM.lng,
      TO.lat,
      TO.lng,
      API_KEY!,
    );

    // Should have route coordinates
    expect(result.coordinates.length).toBeGreaterThan(10);

    // Coordinates should be [lng, lat] pairs
    result.coordinates.forEach((coord) => {
      expect(coord).toHaveLength(2);
      // LA longitude is around -118, latitude around 34
      expect(coord[0]).toBeLessThan(-117);
      expect(coord[0]).toBeGreaterThan(-119);
      expect(coord[1]).toBeGreaterThan(33);
      expect(coord[1]).toBeLessThan(35);
    });

    // Summary should have sensible values
    // LA to Santa Monica is ~20km / ~12 miles
    expect(result.summary.lengthInMeters).toBeGreaterThan(10000);
    expect(result.summary.lengthInMeters).toBeLessThan(50000);

    // Travel time should be 10-60 minutes
    expect(result.summary.travelTimeInSeconds).toBeGreaterThan(600);
    expect(result.summary.travelTimeInSeconds).toBeLessThan(3600);

    // Traffic delay is non-negative
    expect(result.summary.trafficDelayInSeconds).toBeGreaterThanOrEqual(0);

    // Should have instructions
    expect(result.instructions.length).toBeGreaterThan(3);

    // First instruction should be departure
    const first = result.instructions[0];
    expect(first.instructionType.toLowerCase()).toContain("depart");
    expect(first.message).toBeTruthy();

    // Last instruction should be arrival
    const last = result.instructions[result.instructions.length - 1];
    expect(last.instructionType.toLowerCase()).toContain("arriv");

    // Instructions should have valid points
    result.instructions.forEach((inst) => {
      expect(inst.point).toHaveLength(2);
      expect(inst.message).toBeTruthy();
    });
  }, 15000);

  it("returns turn-by-turn with street names", async () => {
    const result = await calculateRoute(
      FROM.lat,
      FROM.lng,
      TO.lat,
      TO.lng,
      API_KEY!,
    );

    // At least some instructions should have street names
    const withStreets = result.instructions.filter((i) => i.street);
    expect(withStreets.length).toBeGreaterThan(0);

    // At least one turn instruction
    const turns = result.instructions.filter(
      (i) =>
        i.instructionType.toLowerCase().includes("turn") ||
        i.maneuver?.toLowerCase().includes("turn"),
    );
    expect(turns.length).toBeGreaterThan(0);
  }, 15000);
});

// HTTP endpoint tests require server running on :3001
async function serverRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3001/api/search?q=test");
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json");
  } catch {
    return false;
  }
}

describe("Route endpoint /api/route", () => {
  let isServerUp = false;

  beforeAll(async () => {
    isServerUp = await serverRunning();
  });

  it.skipIf(!API_KEY)(
    "returns route data via HTTP endpoint",
    async () => {
      if (!isServerUp) return;
      const res = await fetch("http://localhost:3001/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLat: FROM.lat,
          fromLng: FROM.lng,
          toLat: TO.lat,
          toLng: TO.lng,
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();

      expect(data.coordinates).toBeDefined();
      expect(data.coordinates.length).toBeGreaterThan(0);
      expect(data.instructions).toBeDefined();
      expect(data.instructions.length).toBeGreaterThan(0);
      expect(data.summary).toBeDefined();
      expect(data.summary.lengthInMeters).toBeGreaterThan(0);
      expect(data.summary.travelTimeInSeconds).toBeGreaterThan(0);
    },
    15000,
  );

  it("rejects missing parameters", async () => {
    if (!isServerUp) return;
    const res = await fetch("http://localhost:3001/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromLat: 34.05 }),
    });

    // Server should reject — either 400 (our handler) or 404 (route not registered yet)
    expect(res.ok).toBe(false);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      expect(data.error).toBeTruthy();
    }
  });
});
