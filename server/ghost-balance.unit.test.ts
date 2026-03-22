import { describe, expect, it } from "vitest";

// Test the address validation regex and caching logic used by /api/ghost-balance/:address
// These are extracted from server/index.ts for unit-testability

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

describe("GHOST balance - address validation", () => {
  it("accepts valid checksummed Ethereum address", () => {
    expect(
      ADDRESS_REGEX.test("0x2efeEd3097978664731ffe6EC0FaFa5CFD58b08D"),
    ).toBe(true);
  });

  it("accepts valid lowercase Ethereum address", () => {
    expect(
      ADDRESS_REGEX.test("0x2efeed3097978664731ffe6ec0fafa5cfd58b08d"),
    ).toBe(true);
  });

  it("accepts valid uppercase Ethereum address", () => {
    expect(
      ADDRESS_REGEX.test("0x2EFEED3097978664731FFE6EC0FAFA5CFD58B08D"),
    ).toBe(true);
  });

  it("rejects address without 0x prefix", () => {
    expect(ADDRESS_REGEX.test("2efeEd3097978664731ffe6EC0FaFa5CFD58b08D")).toBe(
      false,
    );
  });

  it("rejects address that is too short", () => {
    expect(ADDRESS_REGEX.test("0x2efeEd3097978664731ffe6EC0FaFa5CFD58b0")).toBe(
      false,
    );
  });

  it("rejects address that is too long", () => {
    expect(
      ADDRESS_REGEX.test("0x2efeEd3097978664731ffe6EC0FaFa5CFD58b08D00"),
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(ADDRESS_REGEX.test("")).toBe(false);
  });

  it("rejects random string", () => {
    expect(ADDRESS_REGEX.test("not-an-address")).toBe(false);
  });

  it("rejects address with non-hex characters", () => {
    expect(
      ADDRESS_REGEX.test("0xZZZZZd3097978664731ffe6EC0FaFa5CFD58b08D"),
    ).toBe(false);
  });
});

describe("GHOST balance - cache logic", () => {
  const BALANCE_CACHE_TTL = 30_000;

  it("cache entry within TTL is fresh", () => {
    const now = Date.now();
    const cachedTimestamp = now - 10_000; // 10s ago
    const isFresh = now - cachedTimestamp < BALANCE_CACHE_TTL;
    expect(isFresh).toBe(true);
  });

  it("cache entry at exactly TTL boundary is stale", () => {
    const now = Date.now();
    const cachedTimestamp = now - BALANCE_CACHE_TTL; // exactly 30s ago
    const isFresh = now - cachedTimestamp < BALANCE_CACHE_TTL;
    expect(isFresh).toBe(false);
  });

  it("cache entry beyond TTL is stale", () => {
    const now = Date.now();
    const cachedTimestamp = now - 60_000; // 60s ago
    const isFresh = now - cachedTimestamp < BALANCE_CACHE_TTL;
    expect(isFresh).toBe(false);
  });

  it("cache key is lowercased for case-insensitive lookups", () => {
    const cache = new Map<string, { balance: string }>();
    const address = "0x2efeEd3097978664731ffe6EC0FaFa5CFD58b08D";
    cache.set(address.toLowerCase(), { balance: "100.0" });

    // Same address different case should find the cached value
    const lookup = "0x2EFEED3097978664731FFE6EC0FAFA5CFD58B08D";
    expect(cache.get(lookup.toLowerCase())).toEqual({ balance: "100.0" });
  });
});
