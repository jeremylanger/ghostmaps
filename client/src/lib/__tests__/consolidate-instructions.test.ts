import { describe, expect, it } from "vitest";
import type { RouteInstruction } from "../../types";
import { consolidateInstructions } from "../consolidate-instructions";

function makeInstruction(
  overrides: Partial<RouteInstruction>,
): RouteInstruction {
  return {
    distance: 0,
    travelTime: 0,
    point: [0, 0],
    instructionType: "TURN",
    street: "",
    message: "",
    maneuver: "STRAIGHT",
    turnAngle: 0,
    ...overrides,
  };
}

describe("consolidateInstructions", () => {
  it("consolidates 5 keep-left/keep-right on the same street into 1 continue", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "I-95",
        message: "Keep left on I-95",
      }),
      makeInstruction({
        distance: 200,
        instructionType: "KEEP",
        maneuver: "KEEP_RIGHT",
        street: "I-95",
        message: "Keep right on I-95",
      }),
      makeInstruction({
        distance: 300,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "I-95",
        message: "Keep left on I-95",
      }),
      makeInstruction({
        distance: 400,
        instructionType: "KEEP",
        maneuver: "BEAR_LEFT",
        street: "I-95",
        message: "Bear left on I-95",
      }),
      makeInstruction({
        distance: 500,
        instructionType: "KEEP",
        maneuver: "BEAR_RIGHT",
        street: "I-95",
        message: "Bear right on I-95",
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Continue on I-95");
    expect(result[0].distance).toBe(100);
  });

  it("does NOT merge a keep-left followed by a genuine exit", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "I-95",
        message: "Keep left on I-95",
      }),
      makeInstruction({
        distance: 500,
        instructionType: "EXIT",
        maneuver: "TURN_RIGHT",
        street: "Exit 42",
        message: "Take exit 42",
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(2);
    expect(result[0].message).toBe("Continue on I-95");
    expect(result[1].message).toBe("Take exit 42");
    expect(result[1].instructionType).toBe("EXIT");
  });

  it("never merges depart and arrive instructions", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 0,
        instructionType: "DEPART",
        message: "Depart",
      }),
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "Main St",
        message: "Keep left",
      }),
      makeInstruction({
        distance: 1000,
        instructionType: "ARRIVE",
        message: "Arrive",
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(3);
    expect(result[0].instructionType).toBe("DEPART");
    expect(result[1].message).toBe("Continue on Main St");
    expect(result[2].instructionType).toBe("ARRIVE");
  });

  it("preserves a keep-left with turnAngle > 30 (genuine fork)", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "I-95",
        message: "Keep left onto I-95 North",
        turnAngle: 35,
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Keep left onto I-95 North");
    expect(result[0].maneuver).toBe("KEEP_LEFT");
  });

  it("handles mixed sequence: depart → noise → turn → noise → arrive", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 0,
        instructionType: "DEPART",
        message: "Depart",
        maneuver: "DEPART",
      }),
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "Highway 1",
        message: "Keep left",
        travelTime: 10,
      }),
      makeInstruction({
        distance: 200,
        instructionType: "KEEP",
        maneuver: "KEEP_RIGHT",
        street: "Highway 1",
        message: "Keep right",
        travelTime: 20,
      }),
      makeInstruction({
        distance: 500,
        instructionType: "TURN",
        maneuver: "TURN_RIGHT",
        street: "Oak Ave",
        message: "Turn right onto Oak Ave",
        travelTime: 50,
      }),
      makeInstruction({
        distance: 600,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "Oak Ave",
        message: "Keep left",
        travelTime: 60,
      }),
      makeInstruction({
        distance: 1000,
        instructionType: "ARRIVE",
        message: "Arrive",
        travelTime: 100,
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(5);
    expect(result[0].instructionType).toBe("DEPART");
    expect(result[1].message).toBe("Continue on Highway 1");
    expect(result[2].message).toBe("Turn right onto Oak Ave");
    expect(result[3].message).toBe("Continue on Oak Ave");
    expect(result[4].instructionType).toBe("ARRIVE");
  });

  it("passes through instructions with no noise maneuvers unchanged", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 0,
        instructionType: "DEPART",
        message: "Depart",
      }),
      makeInstruction({
        distance: 200,
        instructionType: "TURN",
        maneuver: "TURN_LEFT",
        street: "Main St",
        message: "Turn left onto Main St",
      }),
      makeInstruction({
        distance: 800,
        instructionType: "TURN",
        maneuver: "TURN_RIGHT",
        street: "Oak Ave",
        message: "Turn right onto Oak Ave",
      }),
      makeInstruction({
        distance: 1000,
        instructionType: "ARRIVE",
        message: "Arrive",
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(4);
    expect(result).toEqual(instructions);
  });

  it("preserves instruction with 'exit' in message even if maneuver is KEEP_LEFT", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 100,
        instructionType: "KEEP",
        maneuver: "KEEP_LEFT",
        street: "I-95",
        message: "Keep left to take exit 12",
        turnAngle: 10,
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Keep left to take exit 12");
    expect(result[0].maneuver).toBe("KEEP_LEFT");
  });

  it("returns empty array for empty input", () => {
    expect(consolidateInstructions([])).toEqual([]);
  });

  it("returns single instruction unchanged", () => {
    const instructions = [
      makeInstruction({
        distance: 0,
        instructionType: "DEPART",
        message: "Depart",
      }),
    ];
    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(instructions[0]);
  });

  it("preserves instruction with MOTORWAY in instructionType", () => {
    const instructions: RouteInstruction[] = [
      makeInstruction({
        distance: 100,
        instructionType: "ENTER_MOTORWAY",
        maneuver: "KEEP_RIGHT",
        street: "I-95",
        message: "Enter the motorway",
        turnAngle: 5,
      }),
    ];

    const result = consolidateInstructions(instructions);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Enter the motorway");
  });
});
