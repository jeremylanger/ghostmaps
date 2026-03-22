import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  accountAgeLabel,
  isGpsVerified,
  parseReviewText,
  timeAgo,
} from "../review-utils";
import { QUALITY_STYLES, qualityLabel } from "../theme";

/* ---------- parseReviewText ---------- */

describe("parseReviewText", () => {
  it("extracts body, ordered, and tip", () => {
    const result = parseReviewText(
      "Great food | Ordered: tacos | Tip: ask for extra salsa",
    );
    expect(result).toEqual({
      body: "Great food",
      ordered: "tacos",
      tip: "ask for extra salsa",
    });
  });

  it("extracts body and ordered when no tip", () => {
    const result = parseReviewText("Great food | Ordered: tacos");
    expect(result).toEqual({
      body: "Great food",
      ordered: "tacos",
      tip: undefined,
    });
  });

  it("extracts body and tip when no ordered", () => {
    const result = parseReviewText("Great food | Tip: sit outside");
    expect(result).toEqual({
      body: "Great food",
      ordered: undefined,
      tip: "sit outside",
    });
  });

  it("returns only body when no structured fields", () => {
    const result = parseReviewText("Great food");
    expect(result).toEqual({
      body: "Great food",
      ordered: undefined,
      tip: undefined,
    });
  });

  it("uses first part as body even with extra pipe segments", () => {
    const result = parseReviewText("Great | food | Ordered: tacos");
    expect(result.body).toBe("Great");
    expect(result.ordered).toBe("tacos");
  });

  it("handles empty string", () => {
    const result = parseReviewText("");
    expect(result).toEqual({
      body: "",
      ordered: undefined,
      tip: undefined,
    });
  });
});

/* ---------- qualityLabel ---------- */

describe("qualityLabel", () => {
  it("returns Exceptional for 81+", () => {
    expect(qualityLabel(81)).toBe("Exceptional");
    expect(qualityLabel(100)).toBe("Exceptional");
    expect(qualityLabel(95)).toBe("Exceptional");
  });

  it("returns Detailed for 51-80", () => {
    expect(qualityLabel(51)).toBe("Detailed");
    expect(qualityLabel(80)).toBe("Detailed");
    expect(qualityLabel(65)).toBe("Detailed");
  });

  it("returns Decent for 21-50", () => {
    expect(qualityLabel(21)).toBe("Decent");
    expect(qualityLabel(50)).toBe("Decent");
    expect(qualityLabel(35)).toBe("Decent");
  });

  it("returns Generic for 0-20", () => {
    expect(qualityLabel(0)).toBe("Generic");
    expect(qualityLabel(20)).toBe("Generic");
    expect(qualityLabel(10)).toBe("Generic");
  });
});

/* ---------- QUALITY_STYLES ---------- */

describe("QUALITY_STYLES", () => {
  it("has an entry for every quality label", () => {
    for (const label of ["Generic", "Decent", "Detailed", "Exceptional"]) {
      expect(QUALITY_STYLES[label]).toBeDefined();
      expect(typeof QUALITY_STYLES[label]).toBe("string");
    }
  });
});

/* ---------- isGpsVerified ---------- */

describe("isGpsVerified", () => {
  it("returns true when both lat and lng are non-zero", () => {
    expect(isGpsVerified(40.3, -105.0)).toBe(true);
  });

  it("returns false when both are zero", () => {
    expect(isGpsVerified(0, 0)).toBe(false);
  });

  it("returns false when lng is zero", () => {
    expect(isGpsVerified(40.3, 0)).toBe(false);
  });

  it("returns false when lat is zero", () => {
    expect(isGpsVerified(0, -105.0)).toBe(false);
  });
});

/* ---------- timeAgo ---------- */

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix Date.now to a known value (1 000 000 seconds epoch)
    vi.setSystemTime(new Date(1_000_000_000 * 1000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for < 60 seconds', () => {
    expect(timeAgo(1_000_000_000 - 30)).toBe("just now");
    expect(timeAgo(1_000_000_000)).toBe("just now");
  });

  it("returns minutes ago", () => {
    expect(timeAgo(1_000_000_000 - 5 * 60)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    expect(timeAgo(1_000_000_000 - 3 * 3600)).toBe("3h ago");
  });

  it("returns days ago", () => {
    expect(timeAgo(1_000_000_000 - 2 * 86400)).toBe("2d ago");
  });

  it("returns months ago", () => {
    expect(timeAgo(1_000_000_000 - 45 * 86400)).toBe("1mo ago");
  });
});

/* ---------- accountAgeLabel ---------- */

describe("accountAgeLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1_000_000_000 * 1000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "New" for firstSeen=0', () => {
    expect(accountAgeLabel(0)).toBe("New");
  });

  it('returns "New today" for same-day firstSeen', () => {
    // firstSeen 1 hour ago (< 1 day)
    expect(accountAgeLabel(1_000_000_000 - 3600)).toBe("New today");
  });

  it("returns days old for < 7 days", () => {
    expect(accountAgeLabel(1_000_000_000 - 3 * 86400)).toBe("3d old");
  });

  it("returns weeks old for < 30 days", () => {
    expect(accountAgeLabel(1_000_000_000 - 14 * 86400)).toBe("2w old");
  });

  it("returns months old for >= 30 days", () => {
    expect(accountAgeLabel(1_000_000_000 - 60 * 86400)).toBe("2mo old");
  });
});
