import { describe, expect, it } from "vitest";
import { preCheckContent } from "./venice";

// We test the parseQuery and rankResults response parsing logic
// by simulating Venice responses. The actual Venice calls are tested
// in integration tests.

describe("Venice response parsing", () => {
  // Helper to simulate what parseQuery does with Venice content
  function extractJSON(content: string): Record<string, unknown> {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    return JSON.parse(jsonMatch[1]!.trim());
  }

  describe("query parsing response extraction", () => {
    it("extracts JSON from plain response", () => {
      const content =
        '{"categories":["coffee_shop"],"time_filter":null,"attributes":[],"location_hint":null,"radius":null}';
      const parsed = extractJSON(content);
      expect(parsed.categories).toEqual(["coffee_shop"]);
      expect(parsed.time_filter).toBeNull();
    });

    it("extracts JSON from markdown code block", () => {
      const content =
        '```json\n{"categories":["bar","pub"],"time_filter":"late_night","attributes":["outdoor_seating"],"location_hint":null,"radius":null}\n```';
      const parsed = extractJSON(content);
      expect(parsed.categories).toEqual(["bar", "pub"]);
      expect(parsed.time_filter).toBe("late_night");
      expect(parsed.attributes).toEqual(["outdoor_seating"]);
    });

    it("extracts JSON from code block without json tag", () => {
      const content = '```\n{"categories":["restaurant"]}\n```';
      const parsed = extractJSON(content);
      expect(parsed.categories).toEqual(["restaurant"]);
    });

    it("handles multiple categories", () => {
      const content =
        '{"categories":["mexican_restaurant","restaurant"],"time_filter":null,"attributes":[],"location_hint":null,"radius":null}';
      const parsed = extractJSON(content);
      expect(parsed.categories).toHaveLength(2);
      expect(parsed.categories).toContain("mexican_restaurant");
    });

    it("handles location hints", () => {
      const content =
        '{"categories":["bar"],"time_filter":null,"attributes":[],"location_hint":"silverlake","radius":null}';
      const parsed = extractJSON(content);
      expect(parsed.location_hint).toBe("silverlake");
    });

    it("handles radius values", () => {
      const content =
        '{"categories":["coffee_shop"],"time_filter":null,"attributes":[],"location_hint":null,"radius":1000}';
      const parsed = extractJSON(content);
      expect(parsed.radius).toBe(1000);
    });

    it("handles attributes", () => {
      const content =
        '{"categories":["restaurant"],"time_filter":null,"attributes":["wifi","outdoor_seating","vegan_options"],"location_hint":null,"radius":null}';
      const parsed = extractJSON(content);
      expect(parsed.attributes).toEqual([
        "wifi",
        "outdoor_seating",
        "vegan_options",
      ]);
    });
  });

  describe("ranking response extraction", () => {
    it("extracts top pick and alternatives", () => {
      const content =
        '{"top_pick":{"id":"abc-123","reason":"Best tacos in town."},"alternatives":[{"id":"def-456","why_not":"Too far away"},{"id":"ghi-789","why_not":"Closes early"}],"summary":"Found 5 taco spots."}';
      const parsed = extractJSON(content);
      expect((parsed.top_pick as Record<string, string>).id).toBe("abc-123");
      expect((parsed.top_pick as Record<string, string>).reason).toBe(
        "Best tacos in town.",
      );
      expect(parsed.alternatives as Array<Record<string, string>>).toHaveLength(
        2,
      );
      expect(
        (parsed.alternatives as Array<Record<string, string>>)[0].why_not,
      ).toBe("Too far away");
      expect(parsed.summary).toBe("Found 5 taco spots.");
    });

    it("extracts ranking from code block", () => {
      const content =
        '```json\n{"top_pick":{"id":"x","reason":"Great spot"},"alternatives":[],"summary":"One result."}\n```';
      const parsed = extractJSON(content);
      expect((parsed.top_pick as Record<string, string>).id).toBe("x");
      expect(parsed.alternatives).toEqual([]);
    });

    it("handles empty alternatives", () => {
      const content =
        '{"top_pick":{"id":"only-one","reason":"The only option."},"alternatives":[],"summary":"Found 1 place."}';
      const parsed = extractJSON(content);
      expect(parsed.alternatives).toEqual([]);
    });
  });

  describe("quality scoring response extraction", () => {
    const BLOCKING_FLAGS = [
      "sentiment_mismatch",
      "offensive_content",
      "hate_speech",
      "adult_content",
      "doxxing",
      "possible_spam",
      "too_short",
    ];
    const NON_BLOCKING_FLAGS = ["ai_generated"];

    function isBlocked(flags: string[]): boolean {
      return flags.some((f) => BLOCKING_FLAGS.includes(f));
    }

    it("genuine review with no flags is not blocked", () => {
      const flags: string[] = [];
      expect(isBlocked(flags)).toBe(false);
    });

    it("sentiment_mismatch blocks submission", () => {
      expect(isBlocked(["sentiment_mismatch"])).toBe(true);
    });

    it("offensive_content blocks submission", () => {
      expect(isBlocked(["offensive_content"])).toBe(true);
    });

    it("hate_speech blocks submission", () => {
      expect(isBlocked(["hate_speech"])).toBe(true);
    });

    it("adult_content blocks submission", () => {
      expect(isBlocked(["adult_content"])).toBe(true);
    });

    it("doxxing blocks submission", () => {
      expect(isBlocked(["doxxing"])).toBe(true);
    });

    it("possible_spam blocks submission", () => {
      expect(isBlocked(["possible_spam"])).toBe(true);
    });

    it("too_short blocks submission", () => {
      expect(isBlocked(["too_short"])).toBe(true);
    });

    it("ai_generated does NOT block submission", () => {
      expect(isBlocked(["ai_generated"])).toBe(false);
    });

    it("multiple flags with any blocking flag blocks", () => {
      expect(isBlocked(["ai_generated", "offensive_content"])).toBe(true);
    });

    it("score is clamped to 0-100 range", () => {
      const parsed = { score: 150, label: "exceptional", flags: [] };
      const score = Math.min(100, Math.max(0, parsed.score || 0));
      expect(score).toBe(100);
    });

    it("negative score is clamped to 0", () => {
      const parsed = { score: -10, label: "generic", flags: [] };
      const score = Math.min(100, Math.max(0, parsed.score || 0));
      expect(score).toBe(0);
    });

    it("all blocking flags are accounted for", () => {
      expect(BLOCKING_FLAGS).toHaveLength(7);
      for (const flag of BLOCKING_FLAGS) {
        expect(isBlocked([flag])).toBe(true);
      }
    });

    it("all non-blocking flags are accounted for", () => {
      expect(NON_BLOCKING_FLAGS).toHaveLength(1);
      for (const flag of NON_BLOCKING_FLAGS) {
        expect(isBlocked([flag])).toBe(false);
      }
    });
  });

  describe("preCheckContent — server-side content moderation", () => {
    it("flags death threats", () => {
      expect(preCheckContent("I want to kill the owner")).toContain(
        "offensive_content",
      );
    });

    it("flags wishes of harm", () => {
      expect(
        preCheckContent("I hope they die and suffer for what they did"),
      ).toContain("offensive_content");
    });

    it("flags 'deserve to die'", () => {
      expect(
        preCheckContent("They deserve to die for serving cold food"),
      ).toContain("offensive_content");
    });

    it("does NOT flag mild profanity in context", () => {
      expect(
        preCheckContent("The damn burger was incredible, best I ever had"),
      ).not.toContain("offensive_content");
    });

    it("does NOT flag legitimate negative reviews", () => {
      expect(
        preCheckContent(
          "Terrible service, waited an hour for cold food, will never return",
        ),
      ).not.toContain("offensive_content");
    });

    it("flags URLs as spam", () => {
      expect(
        preCheckContent("Check out https://mysite.com for deals on food"),
      ).toContain("possible_spam");
    });

    it("flags www links as spam", () => {
      expect(preCheckContent("Visit www.bestdeals.com for coupons")).toContain(
        "possible_spam",
      );
    });

    it("flags promotional language as spam", () => {
      expect(
        preCheckContent("Visit my website for amazing offers and discounts"),
      ).toContain("possible_spam");
    });

    it("flags ALL CAPS text as spam", () => {
      expect(
        preCheckContent("THIS PLACE IS THE BEST EVER GO THERE NOW"),
      ).toContain("possible_spam");
    });

    it("does NOT flag normal mixed-case text", () => {
      expect(
        preCheckContent(
          "Great tacos, I really enjoyed the fish ones with the verde sauce",
        ),
      ).not.toContain("possible_spam");
    });

    it("returns empty array for clean review", () => {
      expect(
        preCheckContent(
          "Had a wonderful brunch here, the eggs benedict were perfectly poached",
        ),
      ).toEqual([]);
    });

    it("returns unique flags (no duplicates)", () => {
      const flags = preCheckContent(
        "VISIT MY WEBSITE WWW.SPAM.COM FOR DEALS CHECK OUT MY SITE NOW",
      );
      const spamCount = flags.filter((f) => f === "possible_spam").length;
      expect(spamCount).toBe(1);
    });
  });
});
