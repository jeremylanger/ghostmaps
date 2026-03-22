import { describe, expect, it } from "vitest";

describe("useGhostBalance hook", () => {
  it("exports useGhostBalance function", async () => {
    const mod = await import("../../hooks/useGhostBalance");
    expect(mod.useGhostBalance).toBeDefined();
    expect(typeof mod.useGhostBalance).toBe("function");
  });
});
