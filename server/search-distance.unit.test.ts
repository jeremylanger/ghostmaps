import { describe, expect, it } from "vitest";
import { addDistanceToResults, parseCoordinates } from "./search";

describe("addDistanceToResults", () => {
  it("adds distanceMeters to each place", () => {
    const places = [
      {
        id: "1",
        name: "Place A",
        category: "restaurant",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 0.9,
        longitude: -118.2437,
        latitude: 34.0522,
      },
      {
        id: "2",
        name: "Place B",
        category: "restaurant",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 0.9,
        longitude: -118.4978,
        latitude: 34.0095,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);
    expect(result[0].distanceMeters).toBe(0);
    expect(result[1].distanceMeters).toBeGreaterThan(23000);
    expect(result[1].distanceMeters).toBeLessThan(25000);
  });

  it("sorts results by distance (closest first)", () => {
    const places = [
      {
        id: "far",
        name: "Far Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 0.9,
        longitude: -117.0,
        latitude: 34.0,
      },
      {
        id: "near",
        name: "Near Place",
        category: "",
        address: "",
        phone: "",
        website: "",
        brand: "",
        confidence: 0.9,
        longitude: -118.244,
        latitude: 34.053,
      },
    ];

    const result = addDistanceToResults(places, 34.0522, -118.2437);
    expect(result[0].id).toBe("near");
    expect(result[1].id).toBe("far");
  });
});

describe("parseCoordinates", () => {
  it("parses valid coordinates", () => {
    expect(parseCoordinates("34.0522, -118.2437")).toEqual({
      lat: 34.0522,
      lng: -118.2437,
    });
  });

  it("parses coordinates without space", () => {
    expect(parseCoordinates("34.0522,-118.2437")).toEqual({
      lat: 34.0522,
      lng: -118.2437,
    });
  });

  it("returns null for non-coordinate strings", () => {
    expect(parseCoordinates("best tacos")).toBeNull();
  });

  it("returns null for out-of-range values", () => {
    expect(parseCoordinates("200, -118")).toBeNull();
  });

  it("returns null for single number", () => {
    expect(parseCoordinates("34.0522")).toBeNull();
  });
});
