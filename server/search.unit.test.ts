import { describe, expect, it } from "vitest";
import { addDistanceToResults, parseCoordinates } from "./search";

describe("addDistanceToResults", () => {
  it("adds distance and preserves original order", () => {
    const places = [
      {
        id: "far",
        name: "Far Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: -118.5,
        latitude: 34.2,
      },
      {
        id: "near",
        name: "Near Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: -118.244,
        latitude: 34.053,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);

    expect(result[0].id).toBe("far");
    expect(result[1].id).toBe("near");
    expect(result[0].distanceMeters).toBeGreaterThan(0);
    expect(result[1].distanceMeters).toBeGreaterThan(0);
    expect(result[0].distanceMeters).toBeGreaterThan(result[1].distanceMeters);
  });

  it("returns distance in meters", () => {
    const places = [
      {
        id: "a",
        name: "A",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: -118.2437,
        latitude: 34.0522,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);
    expect(result[0].distanceMeters).toBe(0);
  });

  it("returns empty array for empty input", () => {
    const result = addDistanceToResults([], 34.0522, -118.2437);
    expect(result).toEqual([]);
  });

  it("computes roughly correct distance for known coordinates", () => {
    // LA to Santa Monica is ~24 km
    const places = [
      {
        id: "sm",
        name: "Santa Monica",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: -118.4912,
        latitude: 34.0195,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);
    // Haversine distance should be roughly 23-25 km
    expect(result[0].distanceMeters).toBeGreaterThan(22000);
    expect(result[0].distanceMeters).toBeLessThan(26000);
  });

  it("handles NaN latitude/longitude in places without crashing", () => {
    const places = [
      {
        id: "bad",
        name: "Bad Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: undefined as unknown as number,
        latitude: undefined as unknown as number,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("bad");
    // distanceMeters will be NaN but should not throw
    expect(typeof result[0].distanceMeters).toBe("number");
  });

  it("handles NaN userLat/userLng without crashing", () => {
    const places = [
      {
        id: "ok",
        name: "OK Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 1,
        longitude: -118.2437,
        latitude: 34.0522,
      },
    ];

    const result = addDistanceToResults(
      places,
      undefined as unknown as number,
      undefined as unknown as number,
    );
    expect(result).toHaveLength(1);
    expect(typeof result[0].distanceMeters).toBe("number");
  });
});

describe("parseCoordinates", () => {
  it("parses valid lat,lng pair", () => {
    expect(parseCoordinates("34.0522, -118.2437")).toEqual({
      lat: 34.0522,
      lng: -118.2437,
    });
  });

  it("parses without spaces", () => {
    expect(parseCoordinates("40.7128,-74.006")).toEqual({
      lat: 40.7128,
      lng: -74.006,
    });
  });

  it("rejects invalid latitude (> 90)", () => {
    expect(parseCoordinates("91.0, -118.0")).toBeNull();
  });

  it("rejects invalid longitude (> 180)", () => {
    expect(parseCoordinates("34.0, 181.0")).toBeNull();
  });

  it("rejects non-coordinate strings", () => {
    expect(parseCoordinates("best pizza near me")).toBeNull();
  });

  it("rejects single number", () => {
    expect(parseCoordinates("34.0522")).toBeNull();
  });

  it("parses negative coordinates", () => {
    expect(parseCoordinates("-33.8688, 151.2093")).toEqual({
      lat: -33.8688,
      lng: 151.2093,
    });
  });

  it("parses integer coordinates", () => {
    expect(parseCoordinates("34, -118")).toEqual({
      lat: 34,
      lng: -118,
    });
  });

  it("returns null for empty string", () => {
    expect(parseCoordinates("")).toBeNull();
  });

  it("accepts boundary lat 90, lng 180", () => {
    expect(parseCoordinates("90, 180")).toEqual({ lat: 90, lng: 180 });
  });

  it("accepts boundary lat -90, lng -180", () => {
    expect(parseCoordinates("-90, -180")).toEqual({ lat: -90, lng: -180 });
  });

  it("rejects latitude just above 90", () => {
    expect(parseCoordinates("91, 180")).toBeNull();
  });

  it("rejects latitude just below -90", () => {
    expect(parseCoordinates("-91, 0")).toBeNull();
  });

  it("rejects longitude just above 180", () => {
    expect(parseCoordinates("0, 181")).toBeNull();
  });

  it("rejects longitude just below -180", () => {
    expect(parseCoordinates("0, -181")).toBeNull();
  });
});
