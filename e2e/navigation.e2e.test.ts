import { expect, test } from "@playwright/test";

test.describe("Navigation E2E", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 });

    await page.goto("https://localhost:5174");
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Set userLocation in Zustand store (geolocation may not fire in headless)
    await page.evaluate(() => {
      const store = (window as any).__ghostmaps_store;
      if (store) {
        store.setState({ userLocation: { lat: 34.0522, lng: -118.2437 } });
      }
    });
  });

  test("place panel has Get Directions button", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("tacos");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();
    await expect(page.locator(".place-panel")).toBeVisible({ timeout: 15000 });

    const directionsBtn = page.locator(".action-primary");
    await expect(directionsBtn).toBeVisible({ timeout: 15000 });
  });

  test("clicking Get Directions shows navigation preview panel", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();
    await expect(page.locator(".place-panel")).toBeVisible({ timeout: 15000 });

    const directionsBtn = page.locator(".action-primary");
    await expect(directionsBtn).toBeVisible({ timeout: 15000 });
    await directionsBtn.click();

    // Navigation preview panel should appear
    const navPanel = page.locator(".nav-preview");
    await expect(navPanel).toBeVisible({ timeout: 15000 });

    // Should show next turn card
    const nextTurn = page.locator(".nav-next-turn");
    await expect(nextTurn).toBeVisible();
  });

  test("navigation preview has Start Navigation button", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("bar");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();

    const navPanel = page.locator(".nav-preview");
    await expect(navPanel).toBeVisible({ timeout: 15000 });

    const startBtn = page.locator(".nav-start-btn");
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText("Start Navigation");
  });

  test("Start Navigation shows top and bottom overlays", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("tacos");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();

    const navPanel = page.locator(".nav-preview");
    await expect(navPanel).toBeVisible({ timeout: 15000 });

    // Click Start Navigation
    await page.locator(".nav-start-btn").click();

    // Preview panel should be gone, overlays should appear
    await expect(navPanel).not.toBeVisible();

    const topOverlay = page.locator(".nav-top-overlay");
    await expect(topOverlay).toBeVisible();

    const bottomOverlay = page.locator(".nav-bottom-overlay");
    await expect(bottomOverlay).toBeVisible();
  });

  test("bottom bar shows ETA, duration, distance, and End button", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();
    await expect(page.locator(".nav-preview")).toBeVisible({ timeout: 15000 });
    await page.locator(".nav-start-btn").click();

    // Bottom bar elements
    const eta = page.locator(".nav-bottom-eta");
    await expect(eta).toBeVisible();
    const etaText = await eta.textContent();
    expect(etaText).toMatch(/\d/); // Contains a number (clock time)

    const duration = page.locator(".nav-bottom-duration");
    await expect(duration).toBeVisible();

    const distance = page.locator(".nav-bottom-distance");
    await expect(distance).toBeVisible();

    const endBtn = page.locator(".nav-end-btn");
    await expect(endBtn).toBeVisible();
    await expect(endBtn).toHaveText("End");
  });

  test("End button clears route and returns to place panel", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();
    await expect(page.locator(".nav-preview")).toBeVisible({ timeout: 15000 });
    await page.locator(".nav-start-btn").click();

    // Click End
    await page.locator(".nav-end-btn").click();

    // Overlays should be gone
    await expect(page.locator(".nav-top-overlay")).not.toBeVisible();
    await expect(page.locator(".nav-bottom-overlay")).not.toBeVisible();

    // Place panel should reappear
    await expect(page.locator(".place-panel")).toBeVisible();
  });

  test("next turn card shows maneuver icon and instruction", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("pizza");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();

    const navPanel = page.locator(".nav-preview");
    await expect(navPanel).toBeVisible({ timeout: 15000 });

    // Next turn card elements
    const icon = page.locator(".nav-next-turn-icon");
    await expect(icon).toBeVisible();

    const text = page.locator(".nav-next-turn-text");
    await expect(text).not.toBeEmpty();
  });

  test("steps list is expandable", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("restaurant");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await page.locator(".action-primary").click();
    await expect(page.locator(".nav-preview")).toBeVisible({ timeout: 15000 });

    // Steps should be collapsed by default
    const stepList = page.locator(".nav-step-list");
    await expect(stepList).not.toBeVisible();

    // Click toggle to expand
    const toggle = page.locator(".nav-steps-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();

    // Steps should now be visible
    await expect(stepList).toBeVisible();
    const instructions = page.locator(".nav-instruction");
    const count = await instructions.count();
    expect(count).toBeGreaterThan(2);

    // Click toggle to collapse
    await toggle.click();
    await expect(stepList).not.toBeVisible();
  });
});
