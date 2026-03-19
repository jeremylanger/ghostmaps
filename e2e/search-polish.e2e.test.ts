import { expect, test } from "@playwright/test";

test.describe("Search Polish E2E", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 });

    await page.goto("https://localhost:5174");
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Set userLocation in Zustand store
    await page.evaluate(() => {
      const store = (window as any).__ghostmaps_store;
      if (store) {
        store.setState({ userLocation: { lat: 34.0522, lng: -118.2437 } });
      }
    });
  });

  test("search results show distance from user", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });

    // Should show distance
    const distance = firstResult.locator(".result-distance");
    await expect(distance).toBeVisible({ timeout: 15000 });
    const distText = await distance.textContent();
    expect(distText).toMatch(/mi|ft/);
  });

  test("search for specific place name returns results", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("Starbucks");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });

    // Verify we got results (name search or category fallback both work)
    const results = page.locator(".search-result-item");
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test("search for coordinates places a result", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("34.0522, -118.2437");
    await searchInput.press("Enter");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });

    const name = await firstResult.locator(".result-name").textContent();
    expect(name).toContain("34.0522");
  });
});
