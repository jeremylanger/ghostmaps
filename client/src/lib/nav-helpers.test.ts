import { describe, expect, it } from "vitest";
import type { RouteInstruction } from "../types";
import {
  formatClockETA,
  formatDistance,
  formatDuration,
  laneArrow,
  maneuverIcon,
} from "./nav-helpers";

describe("formatDuration", () => {
  it("returns < 1 min for seconds under 60", () => {
    expect(formatDuration(30)).toBe("< 1 min");
  });

  it("returns minutes only when under an hour", () => {
    expect(formatDuration(300)).toBe("5 min");
  });

  it("returns hours and minutes", () => {
    expect(formatDuration(3660)).toBe("1 hr 1 min");
  });
});

describe("formatDistance", () => {
  it("formats in feet when under 0.1 miles", () => {
    expect(formatDistance(100)).toMatch(/ft$/);
  });

  it("formats in miles for longer distances", () => {
    expect(formatDistance(1609)).toBe("1.0 mi");
  });
});

describe("maneuverIcon", () => {
  it("returns ↑ for depart", () => {
    const inst = {
      instructionType: "depart",
      maneuver: "",
    } as RouteInstruction;
    expect(maneuverIcon(inst)).toBe("\u2191");
  });

  it("returns 🏁 for arrive", () => {
    const inst = {
      instructionType: "arrive",
      maneuver: "",
    } as RouteInstruction;
    expect(maneuverIcon(inst)).toBe("\u{1F3C1}");
  });

  it("returns ← for left turn", () => {
    const inst = {
      instructionType: "turn",
      maneuver: "turn_left",
    } as RouteInstruction;
    expect(maneuverIcon(inst)).toBe("\u2190");
  });

  it("returns → for right turn", () => {
    const inst = {
      instructionType: "turn",
      maneuver: "turn_right",
    } as RouteInstruction;
    expect(maneuverIcon(inst)).toBe("\u2192");
  });
});

describe("laneArrow", () => {
  it("returns ↑ for STRAIGHT", () => {
    expect(laneArrow("STRAIGHT")).toBe("\u2191");
  });

  it("returns ← for LEFT", () => {
    expect(laneArrow("LEFT")).toBe("\u2190");
  });

  it("returns → for RIGHT", () => {
    expect(laneArrow("RIGHT")).toBe("\u2192");
  });
});

describe("formatClockETA", () => {
  it("formats an ISO arrival time to 12-hour clock", () => {
    const result = formatClockETA("2026-03-19T14:45:00Z");
    // Should contain hours and minutes in some 12h format
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("formats remaining seconds to clock time", () => {
    const result = formatClockETA(null, 600); // 10 minutes from now
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});
