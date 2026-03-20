import { describe, expect, it, vi } from "vitest";
import { geocodeAddress } from "./google-places";

describe("geocodeAddress", () => {
  it("sends location bias when user location is provided", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        places: [
          {
            displayName: { text: "123 Maple Ave" },
            formattedAddress: "123 Maple Ave, Some City, CA",
            location: { latitude: 34.05, longitude: -118.25 },
          },
        ],
      }),
    };
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse as Response);

    await geocodeAddress("123 maple", "fake-key", 34.0, -118.0);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.locationBias).toBeDefined();
    expect(body.locationBias.circle.center.latitude).toBe(34.0);
    expect(body.locationBias.circle.center.longitude).toBe(-118.0);
    expect(body.locationBias.circle.radius).toBe(50000);
    expect(body.maxResultCount).toBe(1);

    fetchSpy.mockRestore();
  });

  it("omits location bias when user location is not provided", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        places: [
          {
            displayName: { text: "123 Main St" },
            formattedAddress: "123 Main St, Los Angeles, CA",
            location: { latitude: 34.05, longitude: -118.25 },
          },
        ],
      }),
    };
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse as Response);

    await geocodeAddress("123 main st", "fake-key");

    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.locationBias).toBeUndefined();

    fetchSpy.mockRestore();
  });

  it("returns null when no results found", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ places: [] }),
    };
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse as Response);

    const result = await geocodeAddress(
      "nonexistent address",
      "fake-key",
      34.0,
      -118.0,
    );
    expect(result).toBeNull();

    vi.restoreAllMocks();
  });

  it("returns null and logs error on API failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse as Response);

    const result = await geocodeAddress("bad query", "fake-key");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
