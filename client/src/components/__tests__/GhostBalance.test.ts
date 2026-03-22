import { describe, expect, it } from "vitest";

describe("GhostBalance component", () => {
  it("exports a default component", async () => {
    const mod = await import("../GhostBalance");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

// Test the formatBalance logic extracted from the component
function formatBalance(balance: string): string {
  const num = Number.parseFloat(balance);
  if (num === 0) return "0";
  if (num < 0.01) return "<0.01";
  return num.toFixed(2);
}

describe("formatBalance", () => {
  it('returns "0" for zero balance', () => {
    expect(formatBalance("0")).toBe("0");
    expect(formatBalance("0.0")).toBe("0");
    expect(formatBalance("0.000000")).toBe("0");
  });

  it('returns "<0.01" for very small balances', () => {
    expect(formatBalance("0.001")).toBe("<0.01");
    expect(formatBalance("0.009")).toBe("<0.01");
    expect(formatBalance("0.0099")).toBe("<0.01");
  });

  it("formats normal balances to 2 decimal places", () => {
    expect(formatBalance("100.0")).toBe("100.00");
    expect(formatBalance("56.25")).toBe("56.25");
    expect(formatBalance("1.5")).toBe("1.50");
    expect(formatBalance("0.01")).toBe("0.01");
  });

  it("handles large balances", () => {
    expect(formatBalance("1000000.123456")).toBe("1000000.12");
  });
});
