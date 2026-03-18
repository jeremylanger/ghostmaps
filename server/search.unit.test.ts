import { describe, expect, it } from "vitest";
import { formatPlace, queryToCategories } from "./search";
import type { OvertureFeature } from "./types";

describe("queryToCategories", () => {
  // Direct matches
  it('maps "pizza" to pizza_restaurant', () => {
    expect(queryToCategories("pizza")).toEqual(["pizza_restaurant"]);
  });

  it('maps "coffee" to coffee_shop', () => {
    expect(queryToCategories("coffee")).toEqual(["coffee_shop"]);
  });

  it('maps "restaurants" (plural) to restaurant', () => {
    expect(queryToCategories("restaurants")).toEqual(["restaurant"]);
  });

  // Case insensitive
  it("handles uppercase input", () => {
    expect(queryToCategories("PIZZA")).toEqual(["pizza_restaurant"]);
  });

  it("handles mixed case", () => {
    expect(queryToCategories("Coffee")).toEqual(["coffee_shop"]);
  });

  // Whitespace
  it("trims whitespace", () => {
    expect(queryToCategories("  pizza  ")).toEqual(["pizza_restaurant"]);
  });

  // Multi-word direct matches
  it('maps "coffee shop" to coffee_shop', () => {
    expect(queryToCategories("coffee shop")).toEqual(["coffee_shop"]);
  });

  it('maps "gas station" to gas_station', () => {
    expect(queryToCategories("gas station")).toEqual(["gas_station"]);
  });

  it('maps "ice cream" to ice_cream_shop', () => {
    expect(queryToCategories("ice cream")).toEqual(["ice_cream_shop"]);
  });

  // Substring matching for natural language queries
  it('extracts category from "best pizza near me"', () => {
    const result = queryToCategories("best pizza near me");
    expect(result).toContain("pizza_restaurant");
  });

  it('extracts category from "indian food downtown"', () => {
    const result = queryToCategories("indian food downtown");
    expect(result).toContain("indian_restaurant");
    expect(result).toContain("restaurant");
  });

  // Limits to 3 categories max
  it("returns at most 3 categories", () => {
    const result = queryToCategories("pizza burger sushi bar");
    expect(result.length).toBeLessThanOrEqual(3);
  });

  // Fallback for unknown terms
  it("uses query as category for unknown terms", () => {
    expect(queryToCategories("trampoline")).toEqual(["trampoline"]);
  });

  it("converts spaces to underscores for unknown multi-word queries", () => {
    expect(queryToCategories("rock climbing")).toEqual(["rock_climbing"]);
  });

  // Synonyms
  it('maps "tacos" to mexican_restaurant', () => {
    expect(queryToCategories("tacos")).toEqual(["mexican_restaurant"]);
  });

  it('maps "bbq" to barbecue_restaurant', () => {
    expect(queryToCategories("bbq")).toEqual(["barbecue_restaurant"]);
  });

  it('maps "movies" to movie_theater', () => {
    expect(queryToCategories("movies")).toEqual(["movie_theater"]);
  });
});

describe("formatPlace", () => {
  it("formats a full Overture API response", () => {
    const input: OvertureFeature = {
      id: "abc-123",
      geometry: { coordinates: [-118.25, 34.05] },
      properties: {
        names: { primary: "Test Coffee" },
        categories: { primary: "coffee_shop" },
        addresses: [{ freeform: "123 Main St" }],
        phones: ["(555) 123-4567"],
        websites: ["https://testcoffee.com"],
        brand: { names: { primary: "Test Brand" } },
        confidence: 0.95,
      },
    };

    const result = formatPlace(input);

    expect(result).toEqual({
      id: "abc-123",
      name: "Test Coffee",
      category: "coffee_shop",
      address: "123 Main St",
      phone: "(555) 123-4567",
      website: "https://testcoffee.com",
      brand: "Test Brand",
      confidence: 0.95,
      longitude: -118.25,
      latitude: 34.05,
    });
  });

  it("handles missing optional fields", () => {
    const input: OvertureFeature = {
      id: "xyz-789",
      geometry: { coordinates: [-74.006, 40.71] },
      properties: {
        names: { primary: "Bare Minimum Place" },
      },
    };

    const result = formatPlace(input);

    expect(result.id).toBe("xyz-789");
    expect(result.name).toBe("Bare Minimum Place");
    expect(result.category).toBe("");
    expect(result.address).toBe("");
    expect(result.phone).toBe("");
    expect(result.website).toBe("");
    expect(result.brand).toBe("");
    expect(result.confidence).toBe(0);
    expect(result.longitude).toBe(-74.006);
    expect(result.latitude).toBe(40.71);
  });

  it("handles structured address when freeform is missing", () => {
    const input: OvertureFeature = {
      id: "1",
      geometry: { coordinates: [0, 0] },
      properties: {
        names: { primary: "Place" },
        addresses: [
          { street: "456 Oak Ave", locality: "Portland", region: "OR" },
        ],
      },
    };

    const result = formatPlace(input);
    expect(result.address).toBe("456 Oak Ave, Portland, OR");
  });

  it("handles empty geometry gracefully", () => {
    const input: OvertureFeature = {
      properties: {
        names: { primary: "No Geo Place" },
      },
    };

    const result = formatPlace(input);
    expect(result.longitude).toBe(0);
    expect(result.latitude).toBe(0);
  });

  it("generates fallback id from coordinates", () => {
    const input: OvertureFeature = {
      geometry: { coordinates: [-118.5, 34.1] },
      properties: {
        names: { primary: "No ID Place" },
      },
    };

    const result = formatPlace(input);
    expect(result.id).toBe("-118.5-34.1");
  });
});
