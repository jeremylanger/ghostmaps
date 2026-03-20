import type { RouteInstruction } from "../types";

const NOISE_MANEUVERS = new Set([
  "KEEP_LEFT",
  "KEEP_RIGHT",
  "BEAR_LEFT",
  "BEAR_RIGHT",
]);

function isGenuineDecision(instruction: RouteInstruction): boolean {
  if (Math.abs(instruction.turnAngle) > 30) return true;

  const msgLower = instruction.message.toLowerCase();
  if (
    msgLower.includes("exit") ||
    msgLower.includes("ramp") ||
    msgLower.includes("fork")
  )
    return true;

  const typeLower = instruction.instructionType.toUpperCase();
  if (typeLower.includes("MOTORWAY") || typeLower.includes("EXIT")) return true;

  return false;
}

function isNoiseManeuver(instruction: RouteInstruction): boolean {
  if (instruction.instructionType === "KEEP") return true;
  if (NOISE_MANEUVERS.has(instruction.maneuver)) return true;
  return false;
}

function isTerminal(instruction: RouteInstruction): boolean {
  const type = instruction.instructionType.toUpperCase();
  return type === "DEPART" || type === "ARRIVE";
}

function sameRoad(a: RouteInstruction, b: RouteInstruction): boolean {
  if (!a.street && !b.street) return true;
  if (!a.street || !b.street) return false;
  return a.street === b.street;
}

function buildContinueInstruction(
  group: RouteInstruction[],
  nextReal: RouteInstruction | undefined,
): RouteInstruction {
  const first = group[0];
  const street = first.street || group.find((g) => g.street)?.street || "";
  const message = street ? `Continue on ${street}` : "Continue";

  return {
    distance: first.distance,
    travelTime: nextReal ? nextReal.travelTime - first.travelTime : 0,
    point: first.point,
    instructionType: "LOCATION_WAYPOINT",
    street,
    message,
    maneuver: "STRAIGHT",
    turnAngle: 0,
  };
}

export function consolidateInstructions(
  instructions: RouteInstruction[],
): RouteInstruction[] {
  if (instructions.length <= 1) return [...instructions];

  const result: RouteInstruction[] = [];
  let noiseGroup: RouteInstruction[] = [];

  function flushNoise(nextReal: RouteInstruction | undefined) {
    if (noiseGroup.length === 0) return;
    result.push(buildContinueInstruction(noiseGroup, nextReal));
    noiseGroup = [];
  }

  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];

    if (isTerminal(inst)) {
      flushNoise(inst);
      result.push(inst);
      continue;
    }

    if (isNoiseManeuver(inst) && !isGenuineDecision(inst)) {
      if (
        noiseGroup.length === 0 ||
        sameRoad(noiseGroup[noiseGroup.length - 1], inst)
      ) {
        noiseGroup.push(inst);
      } else {
        const nextReal = findNextReal(instructions, i);
        flushNoise(nextReal);
        noiseGroup.push(inst);
      }
      continue;
    }

    flushNoise(inst);
    result.push(inst);
  }

  flushNoise(undefined);
  return result;
}

function findNextReal(
  instructions: RouteInstruction[],
  fromIndex: number,
): RouteInstruction | undefined {
  for (let j = fromIndex; j < instructions.length; j++) {
    const inst = instructions[j];
    if (isTerminal(inst)) return inst;
    if (!isNoiseManeuver(inst) || isGenuineDecision(inst)) return inst;
  }
  return undefined;
}
