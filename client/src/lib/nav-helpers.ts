import type { RouteInstruction } from "../types";

export function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
}

export { formatDistanceLive as formatDistance } from "./geo-utils";

export function maneuverIcon(instruction: RouteInstruction): string {
  const type = instruction.instructionType?.toLowerCase() || "";
  const maneuver = instruction.maneuver?.toLowerCase() || "";

  if (type === "depart" || type === "departure") return "\u2191";
  if (type === "arrive" || type === "arrival") return "\u{1F3C1}";
  if (maneuver.includes("left") && maneuver.includes("sharp")) return "\u2B09";
  if (maneuver.includes("right") && maneuver.includes("sharp")) return "\u2B08";
  if (maneuver.includes("left")) return "\u2190";
  if (maneuver.includes("right")) return "\u2192";
  if (maneuver.includes("uturn") || maneuver.includes("u-turn"))
    return "\u21B6";
  if (type === "keep" || maneuver.includes("straight")) return "\u2191";
  if (type.includes("roundabout")) return "\u21BB";
  if (type.includes("motorway") || type.includes("highway")) return "\u{1F6E3}";
  return "\u2191";
}

export function laneArrow(direction: string): string {
  switch (direction) {
    case "STRAIGHT":
      return "\u2191";
    case "SLIGHT_LEFT":
      return "\u2196";
    case "LEFT":
      return "\u2190";
    case "SHARP_LEFT":
      return "\u2B09";
    case "LEFT_U_TURN":
      return "\u21B6";
    case "SLIGHT_RIGHT":
      return "\u2197";
    case "RIGHT":
      return "\u2192";
    case "SHARP_RIGHT":
      return "\u2B08";
    case "RIGHT_U_TURN":
      return "\u21B7";
    default:
      return "\u2191";
  }
}

export function formatClockETA(
  arrivalTime?: string | null,
  remainingSeconds?: number,
): string {
  let date: Date;
  if (arrivalTime) {
    date = new Date(arrivalTime);
  } else if (remainingSeconds != null) {
    date = new Date(Date.now() + remainingSeconds * 1000);
  } else {
    return "--:--";
  }

  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
