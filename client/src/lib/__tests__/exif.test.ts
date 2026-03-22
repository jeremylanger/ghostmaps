import { describe, expect, it } from "vitest";
import type { PhotoLocation } from "../exif";
import { isNearLocation } from "../exif";

describe("isNearLocation", () => {
  const losAngeles: PhotoLocation = { latitude: 34.0522, longitude: -118.2437 };
  const nearLA: { latitude: number; longitude: number } = {
    latitude: 34.053,
    longitude: -118.244,
  };
  const sanFrancisco: { latitude: number; longitude: number } = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  it("returns true for a point within default radius (~805m)", () => {
    // nearLA is ~100m from losAngeles
    expect(isNearLocation(losAngeles, nearLA)).toBe(true);
  });

  it("returns false for a distant point", () => {
    // SF is ~560km from LA
    expect(isNearLocation(losAngeles, sanFrancisco)).toBe(false);
  });

  it("returns true for same location", () => {
    expect(
      isNearLocation(losAngeles, {
        latitude: losAngeles.latitude,
        longitude: losAngeles.longitude,
      }),
    ).toBe(true);
  });

  it("respects custom radius", () => {
    // nearLA is ~100m from losAngeles
    // With a 50m radius, it should be false
    expect(isNearLocation(losAngeles, nearLA, 50)).toBe(false);
    // With a 200m radius, it should be true
    expect(isNearLocation(losAngeles, nearLA, 200)).toBe(true);
  });

  it("handles boundary at exactly the radius", () => {
    // Two points exactly 1000m apart (approximately)
    // 1 degree of latitude ~= 111,139m, so 0.009 degrees ~= 1000m
    const origin: PhotoLocation = { latitude: 0, longitude: 0 };
    const pointAbout1km = { latitude: 0.009, longitude: 0 };
    // Should be right at the boundary of 1000m
    expect(isNearLocation(origin, pointAbout1km, 1100)).toBe(true);
    expect(isNearLocation(origin, pointAbout1km, 900)).toBe(false);
  });
});
