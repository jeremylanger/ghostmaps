import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateRoute } from "./tomtom";

// Mock TomTom API response matching real API format
const MOCK_TOMTOM_RESPONSE = {
  routes: [
    {
      summary: {
        lengthInMeters: 5432,
        travelTimeInSeconds: 720,
        trafficDelayInSeconds: 45,
        departureTime: "2026-03-19T10:00:00-07:00",
        arrivalTime: "2026-03-19T10:12:00-07:00",
      },
      legs: [
        {
          points: [
            { latitude: 34.0522, longitude: -118.2437 },
            { latitude: 34.0525, longitude: -118.244 },
            { latitude: 34.053, longitude: -118.245 },
            { latitude: 34.054, longitude: -118.246 },
          ],
        },
      ],
      guidance: {
        instructions: [
          {
            routeOffsetInMeters: 0,
            travelTimeInSeconds: 0,
            point: { latitude: 34.0522, longitude: -118.2437 },
            instructionType: "DEPART",
            street: "Main St",
            message: "Head north on Main St",
            maneuver: "DEPART",
            turnAngleInDecimalDegrees: 0,
          },
          {
            routeOffsetInMeters: 200,
            travelTimeInSeconds: 30,
            point: { latitude: 34.053, longitude: -118.245 },
            instructionType: "TURN",
            street: "5th Ave",
            message: "Turn right onto 5th Ave",
            maneuver: "TURN_RIGHT",
            turnAngleInDecimalDegrees: 90,
          },
          {
            routeOffsetInMeters: 5432,
            travelTimeInSeconds: 720,
            point: { latitude: 34.054, longitude: -118.246 },
            instructionType: "ARRIVE",
            street: "",
            message: "Arrive at destination",
            maneuver: "ARRIVE",
            turnAngleInDecimalDegrees: 0,
          },
        ],
      },
    },
  ],
};

describe("calculateRoute", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses TomTom response into RouteResponse format", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TOMTOM_RESPONSE,
    } as Response);

    const result = await calculateRoute(
      34.0522,
      -118.2437,
      34.054,
      -118.246,
      "test-key",
    );

    // Check coordinates are [lng, lat] format
    expect(result.coordinates).toHaveLength(4);
    expect(result.coordinates[0]).toEqual([-118.2437, 34.0522]);
    expect(result.coordinates[3]).toEqual([-118.246, 34.054]);

    // Check summary
    expect(result.summary.lengthInMeters).toBe(5432);
    expect(result.summary.travelTimeInSeconds).toBe(720);
    expect(result.summary.trafficDelayInSeconds).toBe(45);

    // Check instructions
    expect(result.instructions).toHaveLength(3);
    expect(result.instructions[0].instructionType).toBe("DEPART");
    expect(result.instructions[0].message).toBe("Head north on Main St");
    expect(result.instructions[0].street).toBe("Main St");
    expect(result.instructions[1].instructionType).toBe("TURN");
    expect(result.instructions[1].maneuver).toBe("TURN_RIGHT");
    expect(result.instructions[2].instructionType).toBe("ARRIVE");
  });

  it("constructs correct TomTom API URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TOMTOM_RESPONSE,
    } as Response);

    await calculateRoute(34.05, -118.24, 34.06, -118.25, "my-api-key");

    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("34.05,-118.24:34.06,-118.25");
    expect(calledUrl).toContain("key=my-api-key");
    expect(calledUrl).toContain("traffic=true");
    expect(calledUrl).toContain("instructionsType=text");
    expect(calledUrl).toContain("travelMode=car");
  });

  it("throws on API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    } as Response);

    await expect(
      calculateRoute(34.05, -118.24, 34.06, -118.25, "bad-key"),
    ).rejects.toThrow("TomTom API error 403");
  });

  it("throws when no routes returned", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ routes: [] }),
    } as Response);

    await expect(
      calculateRoute(34.05, -118.24, 34.06, -118.25, "key"),
    ).rejects.toThrow("No route found");
  });

  it("handles missing optional fields gracefully", async () => {
    const minimalResponse = {
      routes: [
        {
          summary: {
            lengthInMeters: 1000,
            travelTimeInSeconds: 120,
          },
          legs: [
            {
              points: [
                { latitude: 34.05, longitude: -118.24 },
                { latitude: 34.06, longitude: -118.25 },
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
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => minimalResponse,
    } as Response);

    const result = await calculateRoute(34.05, -118.24, 34.06, -118.25, "key");
    expect(result.summary.trafficDelayInSeconds).toBe(0);
    expect(result.summary.departureTime).toBe("");
    expect(result.instructions[0].street).toBe("");
    expect(result.instructions[0].maneuver).toBe("");
    expect(result.instructions[0].turnAngle).toBe(0);
  });

  it("instruction points are in [lng, lat] format", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TOMTOM_RESPONSE,
    } as Response);

    const result = await calculateRoute(34.05, -118.24, 34.06, -118.25, "key");
    // point[0] should be longitude, point[1] should be latitude
    expect(result.instructions[0].point[0]).toBe(-118.2437); // lng
    expect(result.instructions[0].point[1]).toBe(34.0522); // lat
  });
});
