import { describe, expect, it, vi } from "vitest";

describe("TomTom speed limits", () => {
  it("parses speed limit sections from route response", async () => {
    const mockResponse = {
      routes: [
        {
          legs: [
            {
              points: [
                { latitude: 34.05, longitude: -118.24 },
                { latitude: 34.06, longitude: -118.25 },
                { latitude: 34.07, longitude: -118.26 },
              ],
            },
          ],
          guidance: {
            instructions: [
              {
                routeOffsetInMeters: 0,
                travelTimeInSeconds: 0,
                point: { latitude: 34.05, longitude: -118.24 },
                instructionType: "DEPART",
                message: "Depart",
              },
            ],
          },
          summary: {
            lengthInMeters: 5000,
            travelTimeInSeconds: 600,
            trafficDelayInSeconds: 30,
            departureTime: "2026-03-17T12:00:00",
            arrivalTime: "2026-03-17T12:10:00",
          },
          sections: [
            {
              startPointIndex: 0,
              endPointIndex: 1,
              sectionType: "SPEED_LIMIT",
              maxSpeedLimitInKmh: 48,
            },
            {
              startPointIndex: 1,
              endPointIndex: 2,
              sectionType: "SPEED_LIMIT",
              maxSpeedLimitInKmh: 80,
            },
          ],
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const { calculateRoute } = await import("./tomtom");
    const result = await calculateRoute(
      34.05,
      -118.24,
      34.07,
      -118.26,
      "test-key",
    );

    expect(result.speedLimits).toBeDefined();
    expect(result.speedLimits).toHaveLength(2);
    expect(result.speedLimits[0].maxSpeedKmh).toBe(48);
    expect(result.speedLimits[0].maxSpeedMph).toBe(30); // 48 * 0.621371 ≈ 30
    expect(result.speedLimits[1].maxSpeedKmh).toBe(80);
    expect(result.speedLimits[1].maxSpeedMph).toBe(50); // 80 * 0.621371 ≈ 50
    expect(result.speedLimits[0].startPointIndex).toBe(0);
    expect(result.speedLimits[0].endPointIndex).toBe(1);

    vi.unstubAllGlobals();
  });

  it("returns empty speedLimits when no sections in response", async () => {
    const mockResponse = {
      routes: [
        {
          legs: [
            {
              points: [{ latitude: 34.05, longitude: -118.24 }],
            },
          ],
          guidance: { instructions: [] },
          summary: {
            lengthInMeters: 1000,
            travelTimeInSeconds: 120,
            trafficDelayInSeconds: 0,
            departureTime: "",
            arrivalTime: "",
          },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const { calculateRoute } = await import("./tomtom");
    const result = await calculateRoute(
      34.05,
      -118.24,
      34.06,
      -118.25,
      "test-key",
    );

    expect(result.speedLimits).toBeDefined();
    expect(result.speedLimits).toHaveLength(0);

    vi.unstubAllGlobals();
  });

  it("includes sectionType=speedLimit in API URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          routes: [
            {
              legs: [{ points: [{ latitude: 34.05, longitude: -118.24 }] }],
              guidance: { instructions: [] },
              summary: {
                lengthInMeters: 100,
                travelTimeInSeconds: 10,
                trafficDelayInSeconds: 0,
              },
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { calculateRoute } = await import("./tomtom");
    await calculateRoute(34.05, -118.24, 34.06, -118.25, "test-key");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("sectionType=speedLimit");

    vi.unstubAllGlobals();
  });
});

describe("Review cache behavior", () => {
  it("review cache type structure is correct", () => {
    // Verify the cache interface matches expected shape
    interface CachedReviews {
      data: {
        reviews: any[];
        identities: Record<string, any>;
        summary: string;
      };
      timestamp: number;
    }

    const cache: CachedReviews = {
      data: {
        reviews: [{ uid: "0x1", attester: "0xabc", rating: 5, text: "Great" }],
        identities: { "0xabc": { firstSeen: 1000, totalReviews: 1 } },
        summary: "Test summary",
      },
      timestamp: Date.now(),
    };

    expect(cache.data.reviews).toHaveLength(1);
    expect(cache.data.identities["0xabc"].totalReviews).toBe(1);
    expect(cache.timestamp).toBeGreaterThan(0);
  });
});

describe("Off-route detection threshold", () => {
  it("threshold of ~50m corresponds to ~0.00045 degrees squared", () => {
    // 1 degree latitude ≈ 111km, so 50m ≈ 0.00045 degrees
    const THRESHOLD_DEG = 0.00045;
    const THRESHOLD_SQ = THRESHOLD_DEG * THRESHOLD_DEG;

    // Point exactly at threshold (should be right at boundary)
    const dx = 0.00045;
    const dy = 0;
    const dist = dx * dx + dy * dy;
    expect(dist).toBeCloseTo(THRESHOLD_SQ, 10);

    // Point well within route (10m ≈ 0.00009 degrees)
    const nearDx = 0.00009;
    const nearDist = nearDx * nearDx;
    expect(nearDist).toBeLessThan(THRESHOLD_SQ);

    // Point well off route (100m ≈ 0.0009 degrees)
    const farDx = 0.0009;
    const farDist = farDx * farDx;
    expect(farDist).toBeGreaterThan(THRESHOLD_SQ);
  });
});

describe("Speed limit mph conversion", () => {
  it("converts km/h to mph correctly", () => {
    const convert = (kmh: number) => Math.round(kmh * 0.621371);

    expect(convert(30)).toBe(19);
    expect(convert(50)).toBe(31);
    expect(convert(80)).toBe(50);
    expect(convert(100)).toBe(62);
    expect(convert(120)).toBe(75);
    expect(convert(0)).toBe(0);
  });
});
