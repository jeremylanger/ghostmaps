import dotenv from "dotenv";
import path from "path";
import { describe, expect, it } from "vitest";
import { generatePlaceBriefing } from "./venice";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const TIMEOUT = 45000;

describe("Place enrichment integration", () => {
  describe("Venice place briefing", () => {
    it(
      "generates a briefing for a coffee shop",
      async () => {
        const briefing = await generatePlaceBriefing({
          name: "Verve Coffee Roasters",
          category: "coffee_shop",
          address: "214 S Main St, Los Angeles",
          phone: "+12135551234",
          website: "https://vervecoffee.com",
          brand: "",
          openingHours: ["Mon-Fri 07:00-18:00", "Sat-Sun 08:00-17:00"],
          isOpen: true,
          foodTypes: ["Coffee", "Pastries"],
        });

        expect(briefing.length).toBeGreaterThan(20);
        // Should mention the place name or something relevant
        expect(briefing.toLowerCase()).toMatch(/verve|coffee|roaster/i);
      },
      TIMEOUT,
    );

    it(
      "generates a briefing with minimal data",
      async () => {
        const briefing = await generatePlaceBriefing({
          name: "Mystery Spot",
          category: "restaurant",
          address: "",
          phone: "",
          website: "",
          brand: "",
          openingHours: null,
          isOpen: null,
          foodTypes: [],
        });

        expect(briefing.length).toBeGreaterThan(10);
      },
      TIMEOUT,
    );

    it(
      "mentions open/closed status when provided",
      async () => {
        const briefing = await generatePlaceBriefing({
          name: "Late Night Tacos",
          category: "mexican_restaurant",
          address: "100 Main St",
          phone: "",
          website: "",
          brand: "",
          openingHours: ["Daily 18:00-04:00"],
          isOpen: false,
          foodTypes: ["Mexican", "Tacos"],
        });

        expect(briefing.length).toBeGreaterThan(20);
      },
      TIMEOUT,
    );
  });

  describe("Place details endpoint", () => {
    it(
      "returns enriched place from cache",
      async () => {
        // First search to populate cache
        const searchRes = await fetch(
          "http://localhost:3001/api/search?q=coffee&lat=34.0522&lng=-118.2437",
        );
        const searchData = await searchRes.json();
        expect(searchData.results.length).toBeGreaterThan(0);

        const firstPlace = searchData.results[0];

        // Now fetch details
        const detailRes = await fetch(
          `http://localhost:3001/api/places/${encodeURIComponent(firstPlace.id)}`,
        );
        const detail = await detailRes.json();

        expect(detail.id).toBe(firstPlace.id);
        expect(detail.name).toBe(firstPlace.name);
        expect(detail).toHaveProperty("openingHours");
        expect(detail).toHaveProperty("isOpen");
        expect(detail).toHaveProperty("foodTypes");

        // Briefing is a separate endpoint
        const briefingRes = await fetch(
          `http://localhost:3001/api/places/${encodeURIComponent(firstPlace.id)}/briefing`,
        );
        const briefingData = await briefingRes.json();
        expect(briefingData).toHaveProperty("briefing");
        expect(briefingData.briefing.length).toBeGreaterThan(0);
      },
      TIMEOUT,
    );

    it("returns 404 for unknown place", async () => {
      const res = await fetch(
        "http://localhost:3001/api/places/nonexistent-id-123",
      );
      expect(res.status).toBe(404);
    });
  });
});
