import { describe, expect, it } from "vitest";
import {
  bearing,
  closestSegmentOnRoute,
  formatDistanceLive,
  haversine,
  trimRouteAhead,
} from "./geo-utils";

describe("haversine", () => {
  it("returns 0 for identical points", () => {
    expect(haversine(34.0522, -118.2437, 34.0522, -118.2437)).toBe(0);
  });

  it("calculates LA to Santa Monica (~24km)", () => {
    // LA downtown to Santa Monica pier
    const dist = haversine(34.0522, -118.2437, 34.0095, -118.4978);
    expect(dist).toBeGreaterThan(23000);
    expect(dist).toBeLessThan(25000);
  });

  it("calculates a short distance (~100m)", () => {
    // Two points ~100m apart
    const dist = haversine(34.0522, -118.2437, 34.0531, -118.2437);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(110);
  });
});

describe("bearing", () => {
  it("returns ~0 for due north", () => {
    const b = bearing(34.0, -118.0, 35.0, -118.0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(2);
  });

  it("returns ~90 for due east", () => {
    const b = bearing(34.0, -118.0, 34.0, -117.0);
    expect(b).toBeGreaterThan(88);
    expect(b).toBeLessThan(92);
  });

  it("returns ~180 for due south", () => {
    const b = bearing(35.0, -118.0, 34.0, -118.0);
    expect(b).toBeGreaterThan(178);
    expect(b).toBeLessThan(182);
  });

  it("returns ~270 for due west", () => {
    const b = bearing(34.0, -117.0, 34.0, -118.0);
    expect(b).toBeGreaterThan(268);
    expect(b).toBeLessThan(272);
  });
});

describe("closestSegmentOnRoute", () => {
  // Simple route: 3 points in a line going east
  const route: [number, number][] = [
    [-118.3, 34.0], // [lng, lat]
    [-118.2, 34.0],
    [-118.1, 34.0],
  ];

  it("returns distance ~0 for a point on the route", () => {
    const result = closestSegmentOnRoute(34.0, -118.2, route);
    expect(result.distance).toBeLessThan(1); // < 1 meter
  });

  it("returns correct index for closest segment", () => {
    // Point near the second segment
    const result = closestSegmentOnRoute(34.0, -118.15, route);
    expect(result.index).toBe(1); // second segment
  });

  it("returns distance for a point off-route", () => {
    // Point ~1km north of route midpoint
    const result = closestSegmentOnRoute(34.009, -118.2, route);
    expect(result.distance).toBeGreaterThan(900);
    expect(result.distance).toBeLessThan(1100);
  });

  it("handles point past the end of route", () => {
    const result = closestSegmentOnRoute(34.0, -118.05, route);
    expect(result.index).toBe(1); // last segment
    expect(result.distance).toBeGreaterThan(4000); // ~5km past end
  });
});

describe("trimRouteAhead", () => {
  const route: [number, number][] = [
    [-118.4, 34.0],
    [-118.3, 34.0],
    [-118.2, 34.0],
    [-118.1, 34.0],
    [-118.0, 34.0],
  ];

  it("returns remaining route from segment index forward", () => {
    const trimmed = trimRouteAhead(route, 2, -118.2, 34.0);
    // Should start near user position and include points 3, 4
    expect(trimmed.length).toBeGreaterThanOrEqual(3);
    expect(trimmed[trimmed.length - 1]).toEqual([-118.0, 34.0]);
  });

  it("returns full route when at start", () => {
    const trimmed = trimRouteAhead(route, 0, -118.4, 34.0);
    expect(trimmed.length).toBe(route.length);
  });

  it("returns just the last point when at end", () => {
    const trimmed = trimRouteAhead(route, 3, -118.0, 34.0);
    expect(trimmed.length).toBeGreaterThanOrEqual(1);
  });
});

describe("formatDistanceLive", () => {
  it("formats long distances in miles", () => {
    expect(formatDistanceLive(5000)).toBe("3.1 mi");
  });

  it("formats medium distances in miles", () => {
    expect(formatDistanceLive(1609)).toBe("1.0 mi");
  });

  it("switches to feet under 0.1 miles (~160m)", () => {
    const result = formatDistanceLive(100);
    expect(result).toMatch(/ft$/);
  });

  it("formats 30m as feet", () => {
    expect(formatDistanceLive(30)).toBe("98 ft");
  });

  it("formats 50m correctly", () => {
    const result = formatDistanceLive(50);
    expect(result).toMatch(/\d+ ft$/);
  });
});
