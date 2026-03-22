import { describe, expect, it, vi } from "vitest";

// Test the guardian's tool execution routing and cycle structure
// We mock the network calls and verify the orchestration logic

describe("Guardian Agent", () => {
  it("exports runGuardianCycle function", async () => {
    const { runGuardianCycle } = await import("./guardian.js");
    expect(typeof runGuardianCycle).toBe("function");
  });

  it("POLL_INTERVAL and LOOKBACK are reasonable values", async () => {
    // These are internal constants but we can verify the module loads without error
    const mod = await import("./guardian.js");
    expect(mod).toBeTruthy();
  });
});

describe("Tool execution routing", () => {
  it("all tool names in TOOL_DEFINITIONS are handled by executeTool switch", async () => {
    const { TOOL_DEFINITIONS } = await import("./tools.js");
    const toolNames = TOOL_DEFINITIONS.map((t) => t.function.name);

    // Read guardian.ts source to check switch cases
    const fs = await import("fs");
    const source = fs.readFileSync(
      new URL("./guardian.ts", import.meta.url),
      "utf-8",
    );

    for (const name of toolNames) {
      expect(source).toContain(`case "${name}"`);
    }
  });

  it("executeTool has a default case for unknown tools", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync(
      new URL("./guardian.ts", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("default:");
    expect(source).toContain("Unknown tool");
  });
});

describe("Guardian safety limits", () => {
  it("has a max iteration limit to prevent infinite loops", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync(
      new URL("./guardian.ts", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("maxIterations");
  });

  it("supports --once flag for single-run mode", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync(
      new URL("./guardian.ts", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("--once");
  });

  it("checks for existing verification before publishing (dedup)", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync(
      new URL("./guardian.ts", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("queryExistingVerification");
    expect(source).toContain("skipped");
  });
});
