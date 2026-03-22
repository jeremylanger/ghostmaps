import { describe, expect, it } from "vitest";

// Integration test: hits real Base Sepolia RPC to fetch GHOST token balance
// GHOST token: 0x98d2ccd1d02F396A4a6FDE996381297c655BB198 on Base Sepolia
// Uses ethers.js directly (same as the server endpoint)

const GHOST_TOKEN = "0x98d2ccd1d02F396A4a6FDE996381297c655BB198";
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const BALANCE_ABI = ["function balanceOf(address) view returns (uint256)"];

// Guardian wallet — known to hold GHOST tokens
const GUARDIAN_ADDRESS = "0x2efeEd3097978664731ffe6EC0FaFa5CFD58b08D";

describe("GHOST balance - Base Sepolia RPC integration", () => {
  it("returns real balance for Guardian wallet", {
    timeout: 15_000,
  }, async () => {
    const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
    const contract = new Contract(GHOST_TOKEN, BALANCE_ABI, provider);

    const raw: bigint = await contract.balanceOf(GUARDIAN_ADDRESS);
    const balance = formatUnits(raw, 18);

    // Guardian should have some tokens (deployed and minted)
    expect(typeof raw).toBe("bigint");
    expect(typeof balance).toBe("string");
    expect(Number.parseFloat(balance)).toBeGreaterThanOrEqual(0);
  });

  it("returns 0 balance for a random address with no tokens", {
    timeout: 15_000,
  }, async () => {
    const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
    const contract = new Contract(GHOST_TOKEN, BALANCE_ABI, provider);

    // Random address unlikely to hold GHOST tokens
    const randomAddress = "0x0000000000000000000000000000000000000001";
    const raw: bigint = await contract.balanceOf(randomAddress);
    const balance = formatUnits(raw, 18);

    expect(raw).toBe(0n);
    expect(balance).toBe("0.0");
  });

  it("RPC endpoint is reachable", { timeout: 15_000 }, async () => {
    const { JsonRpcProvider } = await import("ethers");
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
    const blockNumber = await provider.getBlockNumber();

    expect(blockNumber).toBeGreaterThan(0);
  });
});
