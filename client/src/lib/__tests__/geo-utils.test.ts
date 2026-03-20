import { describe, expect, it } from "vitest";
import { trimRouteAhead } from "../geo-utils";

describe("trimRouteAhead", () => {
  // Simple north-bound route: 5 points, each ~1.1km apart
  const coords: [number, number][] = [
    [-118.0, 34.0],
    [-118.0, 34.01],
    [-118.0, 34.02],
    [-118.0, 34.03],
    [-118.0, 34.04],
  ];

  it("starts from projected position on current segment, not segment boundary", () => {
    // User is halfway between coord 1 and coord 2
    const result = trimRouteAhead(coords, 1, -118.0, 34.015);
    // First point should be projected position (~midpoint), not coord[2]
    expect(result[0][1]).toBeCloseTo(34.015, 3);
    expect(result[0][0]).toBeCloseTo(-118.0, 3);
    // Remaining points should be coords 2, 3, 4
    expect(result.length).toBe(4); // projected + coords[2..4]
    expect(result[1]).toEqual([-118.0, 34.02]);
  });

  it("projects to segment start when user is behind the segment", () => {
    // User is at the start of segment 0
    const result = trimRouteAhead(coords, 0, -118.0, 34.0);
    expect(result[0][1]).toBeCloseTo(34.0, 3);
    expect(result.length).toBe(5); // projected + coords[1..4]
  });

  it("projects to segment end when user is past the segment", () => {
    // User is past the end of segment 1 (coord[1] to coord[2])
    const result = trimRouteAhead(coords, 1, -118.0, 34.025);
    // Projection clamps to t=1, so projected point = coord[2]
    expect(result[0][1]).toBeCloseTo(34.02, 3);
    expect(result.length).toBe(4);
  });

  it("returns last coordinate when segment index is at end", () => {
    const result = trimRouteAhead(coords, 4, -118.0, 34.045);
    expect(result).toEqual([[-118.0, 34.04]]);
  });

  it("handles user offset laterally from route", () => {
    // User is east of the route, halfway up segment 1
    const result = trimRouteAhead(coords, 1, -117.999, 34.015);
    // Projected point should be on the route line (lng = -118.0), not at user's lng
    expect(result[0][0]).toBeCloseTo(-118.0, 3);
    expect(result[0][1]).toBeCloseTo(34.015, 3);
  });

  it("clears trail smoothly on a long straight segment", () => {
    // User at 25% of segment 0
    const result25 = trimRouteAhead(coords, 0, -118.0, 34.0025);
    // User at 75% of segment 0
    const result75 = trimRouteAhead(coords, 0, -118.0, 34.0075);
    // 75% result should start further north than 25% result
    expect(result75[0][1]).toBeGreaterThan(result25[0][1]);
    // Both should have same number of remaining coords
    expect(result25.length).toBe(result75.length);
  });
});
