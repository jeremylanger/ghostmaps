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
});
