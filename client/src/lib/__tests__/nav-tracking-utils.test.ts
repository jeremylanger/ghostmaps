import { describe, expect, it } from "vitest";
import type { RouteInstruction } from "../../types";
import {
  isMovingAwayFromRoute,
  shouldAdvanceInstruction,
} from "../nav-tracking-utils";

function makeInstruction(
  lng: number,
  lat: number,
  overrides?: Partial<RouteInstruction>,
): RouteInstruction {
  return {
    distance: 0,
    travelTime: 0,
    point: [lng, lat],
    instructionType: "TURN",
    street: "",
    message: "Turn",
    maneuver: "TURN_RIGHT",
    turnAngle: 90,
    ...overrides,
  };
}

describe("shouldAdvanceInstruction", () => {
  const instructions: RouteInstruction[] = [
    makeInstruction(-118.0, 34.0), // idx 0: start
    makeInstruction(-118.0, 34.01), // idx 1: ~1.1km north
    makeInstruction(-118.0, 34.02), // idx 2: ~2.2km north
  ];

  it("does not advance when user is before the current instruction point", () => {
    // User is south of instruction 0 — hasn't reached it yet
    const result = shouldAdvanceInstruction(0, instructions, 33.999, -118.0);
    expect(result).toBe(0);
  });

  it("advances when user has passed the current instruction point", () => {
    // User is between instruction 0 and 1 (north of 0)
    const result = shouldAdvanceInstruction(0, instructions, 34.005, -118.0);
    expect(result).toBe(1);
  });

  it("does not skip instructions (only advances by 1)", () => {
    // User is past instruction 1, near instruction 2
    // But starting from index 0, should only advance to 1
    const result = shouldAdvanceInstruction(0, instructions, 34.015, -118.0);
    expect(result).toBe(1);
  });

  it("does not advance past the last instruction", () => {
    const result = shouldAdvanceInstruction(2, instructions, 34.03, -118.0);
    expect(result).toBe(2);
  });

  it("does not advance when user is beside the route but not past the point", () => {
    // User is east of instruction 0 but not north of it (perpendicular)
    // Route goes north, so east displacement has zero dot product with route direction
    // Slightly south to ensure negative dot product
    const result = shouldAdvanceInstruction(0, instructions, 33.9999, -117.999);
    expect(result).toBe(0);
  });

  it("advances correctly on a west-heading route", () => {
    const westRoute: RouteInstruction[] = [
      makeInstruction(-118.0, 34.0),
      makeInstruction(-118.01, 34.0), // west
    ];
    // User is west of instruction 0 (past it in route direction)
    const result = shouldAdvanceInstruction(0, westRoute, 34.0, -118.005);
    expect(result).toBe(1);
  });
});

describe("isMovingAwayFromRoute", () => {
  // Route going due north
  const coordinates: [number, number][] = [
    [-118.0, 34.0],
    [-118.0, 34.01],
    [-118.0, 34.02],
  ];

  it("returns true when no previous position", () => {
    const result = isMovingAwayFromRoute(
      { lat: 34.005, lng: -118.0 },
      null,
      coordinates,
      0,
    );
    expect(result).toBe(true);
  });

  it("returns false when user is moving along the route direction", () => {
    // Moving north (same as route)
    const result = isMovingAwayFromRoute(
      { lat: 34.006, lng: -118.0 },
      { lat: 34.005, lng: -118.0 },
      coordinates,
      0,
    );
    expect(result).toBe(false);
  });

  it("returns true when user is moving opposite to route direction", () => {
    // Moving south (opposite of north-heading route)
    const result = isMovingAwayFromRoute(
      { lat: 34.004, lng: -118.0 },
      { lat: 34.005, lng: -118.0 },
      coordinates,
      0,
    );
    expect(result).toBe(true);
  });

  it("returns false when user is moving at slight angle to route (<60°)", () => {
    // Moving north-northeast (~30° from route heading)
    const result = isMovingAwayFromRoute(
      { lat: 34.006, lng: -117.9995 },
      { lat: 34.005, lng: -118.0 },
      coordinates,
      0,
    );
    expect(result).toBe(false);
  });

  it("returns true when user is moving perpendicular to route (>60°)", () => {
    // Moving due east (90° from north-heading route)
    const result = isMovingAwayFromRoute(
      { lat: 34.005, lng: -117.999 },
      { lat: 34.005, lng: -118.0 },
      coordinates,
      0,
    );
    expect(result).toBe(true);
  });

  it("handles last segment index without error", () => {
    const result = isMovingAwayFromRoute(
      { lat: 34.021, lng: -118.0 },
      { lat: 34.02, lng: -118.0 },
      coordinates,
      2, // last index
    );
    // Moving north, route segment at end is essentially a point — should not crash
    expect(typeof result).toBe("boolean");
  });
});
