import { describe, expect, it } from "vitest";
import type { RouteInstruction } from "../../types";
import {
  findBestInstruction,
  isMovingAwayFromRoute,
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

describe("findBestInstruction", () => {
  // Instructions ~1.1km apart going north
  const instructions: RouteInstruction[] = [
    makeInstruction(-118.0, 34.0), // idx 0: start
    makeInstruction(-118.0, 34.01), // idx 1: ~1.1km north
    makeInstruction(-118.0, 34.02), // idx 2: ~2.2km north
  ];

  it("does not advance when user is before the current instruction point", () => {
    // User is south of instruction 0 — hasn't reached it yet
    const result = findBestInstruction(0, instructions, 33.999, -118.0, 10);
    expect(result).toBe(0);
  });

  it("advances when user has passed the current instruction point", () => {
    // User is ~50m north of instruction 0 (within 80m radius, past it)
    const result = findBestInstruction(0, instructions, 34.0004, -118.0, 10);
    expect(result).toBe(1);
  });

  it("skips to correct instruction when user is past multiple points", () => {
    // User is ~50m north of instruction 1 — should jump to 2, not just 1
    const result = findBestInstruction(0, instructions, 34.0104, -118.0, 10);
    expect(result).toBe(2);
  });

  it("does not advance past the last instruction", () => {
    const result = findBestInstruction(2, instructions, 34.03, -118.0, 10);
    expect(result).toBe(2);
  });

  it("ignores GPS fix with poor accuracy (>50m)", () => {
    const result = findBestInstruction(0, instructions, 34.0004, -118.0, 100);
    expect(result).toBe(0);
  });

  it("does not advance when user is far from route", () => {
    // User is ~1km east — way too far from any instruction point
    const result = findBestInstruction(0, instructions, 34.005, -117.99, 10);
    expect(result).toBe(0);
  });

  it("never goes backwards", () => {
    // User is between instruction 0 and 1, but currentIndex is already 1
    const result = findBestInstruction(1, instructions, 34.005, -118.0, 10);
    expect(result).toBe(1);
  });

  it("advances correctly on a west-heading route", () => {
    const westRoute: RouteInstruction[] = [
      makeInstruction(-118.0, 34.0),
      makeInstruction(-118.001, 34.0), // ~90m west
    ];
    // User is ~50m west of instruction 0 (within radius, past it)
    const result = findBestInstruction(0, westRoute, 34.0, -118.0005, 10);
    expect(result).toBe(1);
  });

  it("snaps to next instruction when very close to it", () => {
    // User is ~30m from instruction 1 (within ARRIVAL_RADIUS/2 = 40m)
    const result = findBestInstruction(0, instructions, 34.00975, -118.0, 10);
    expect(result).toBe(1);
  });

  it("handles short consecutive steps without skipping", () => {
    // Two instructions very close together (~50m apart)
    const shortSteps: RouteInstruction[] = [
      makeInstruction(-118.0, 34.0),
      makeInstruction(-118.0, 34.00045), // ~50m north
      makeInstruction(-118.001, 34.00045), // ~90m west
    ];
    // User is just past instruction 0 but before instruction 1
    const result = findBestInstruction(0, shortSteps, 34.0002, -118.0, 10);
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
