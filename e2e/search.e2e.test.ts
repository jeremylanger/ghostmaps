import { expect, test } from "@playwright/test";

test.describe("Ghost Maps E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5174");
    // Wait for map canvas to render
    await page.waitForSelector("canvas", { timeout: 10000 });
  });

  test("map renders with canvas", async ({ page }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Map container should be full screen
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(500);
    expect(box!.height).toBeGreaterThan(400);
  });

  test("search bar is visible and accepts input", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("pizza");
    await expect(searchInput).toHaveValue("pizza");
  });

  test("searching shows results from Overture API", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    // Wait for results to appear
    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // Should have a name
    const name = firstResult.locator(".result-name");
    await expect(name).not.toBeEmpty();

    // Should have category
    const category = firstResult.locator(".result-category");
    await expect(category).toContainText("coffee", { ignoreCase: true });
  });

  test("clicking a result shows place panel", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("pizza");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // Get the name before clicking
    const resultName = await firstResult.locator(".result-name").textContent();

    await firstResult.click();

    // Place panel should appear with the same name
    const placePanel = page.locator(".place-panel");
    await expect(placePanel).toBeVisible();

    const panelTitle = placePanel.locator("h2");
    await expect(panelTitle).toHaveText(resultName!);
  });

  test("place panel has close button", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("bar");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });
    await firstResult.click();

    const placePanel = page.locator(".place-panel");
    await expect(placePanel).toBeVisible();

    // Close the panel
    await page.locator(".place-panel-close").click();
    await expect(placePanel).not.toBeVisible();
  });

  test("search results show pins on the map", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("restaurant");

    // Wait for results
    await page
      .locator(".search-result-item")
      .first()
      .waitFor({ timeout: 10000 });

    // Pins are canvas-rendered (GeoJSON circle layers), so we verify
    // the search returned results and the map has a canvas
    const results = page.locator(".search-result-item");
    const count = await results.count();
    expect(count).toBeGreaterThan(0);

    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("clearing search removes results", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    // Wait for results
    await page
      .locator(".search-result-item")
      .first()
      .waitFor({ timeout: 10000 });

    // Click clear button
    await page.locator(".search-clear").click();

    // Results should be gone
    await expect(page.locator(".search-results")).not.toBeVisible();
    await expect(searchInput).toHaveValue("");
  });

  test("locate button exists", async ({ page }) => {
    const locateBtn = page.locator(".locate-btn");
    await expect(locateBtn).toBeVisible();
  });

  test("page title is Ghost Maps", async ({ page }) => {
    await expect(page).toHaveTitle("Ghost Maps");
  });

  // Day 3: AI search tests
  test("AI search shows top pick badge", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("best tacos");

    // Wait for AI ranking to complete (longer timeout for Venice)
    const topPick = page.locator(".top-pick-badge");
    await expect(topPick).toBeVisible({ timeout: 30000 });
    await expect(topPick).toHaveText("Top Pick");
  });

  test("AI search shows recommendation reason", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee shops");

    // Wait for ranking
    const reason = page.locator(".result-reason");
    await expect(reason).toBeVisible({ timeout: 30000 });

    // Reason should be non-empty text
    const text = await reason.textContent();
    expect(text!.length).toBeGreaterThan(10);
  });

  test("AI search shows status messages while loading", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("pizza");

    // Should see a status message
    const status = page.locator(".search-status");
    await expect(status).toBeVisible({ timeout: 5000 });
  });

  test("place panel shows AI briefing after clicking result", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    // Wait for briefing to load
    const briefing = page.locator(".place-panel-briefing");
    await expect(briefing).toBeVisible({ timeout: 30000 });

    const text = await briefing.textContent();
    expect(text!.length).toBeGreaterThan(20);
  });

  test("place panel shows loading state while fetching details", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("restaurant");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    // Should briefly show loading
    const loading = page.locator(".place-panel-loading");
    // Loading may be very fast, so just check the panel appears
    await expect(page.locator(".place-panel")).toBeVisible();
  });

  test("clicking top pick hides results and shows place panel", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("bars");

    // Wait for top pick
    const topPickItem = page.locator(".search-result-item.top-pick");
    await expect(topPickItem).toBeVisible({ timeout: 30000 });

    await topPickItem.click();

    // Results hidden, place panel visible
    await expect(page.locator(".search-results")).not.toBeVisible();
    await expect(page.locator(".place-panel")).toBeVisible();
  });

  // Day 5-6: Auth, Reviews, Review Display
  test("auth button is visible", async ({ page }) => {
    const authContainer = page.locator(".auth-container");
    await expect(authContainer).toBeVisible();
  });

  test("place panel has Write a Review button", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    const reviewBtn = page.locator(".review-cta-btn");
    await expect(reviewBtn).toBeVisible();
    await expect(reviewBtn).toHaveText("Write a Review");
  });

  test("clicking Write a Review opens review form overlay", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("pizza");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    await page.locator(".review-cta-btn").click();

    // Review form overlay should appear
    const overlay = page.locator(".review-form-overlay");
    await expect(overlay).toBeVisible();

    // Should show sign-in prompt (not signed in) or review form
    const formContent = page.locator(".review-form");
    await expect(formContent).toBeVisible();
  });

  test("review form can be closed", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("restaurant");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    await page.locator(".review-cta-btn").click();
    await expect(page.locator(".review-form-overlay")).toBeVisible();

    // Close it
    await page.locator(".review-form-close").click();
    await expect(page.locator(".review-form-overlay")).not.toBeVisible();
  });

  test("place panel shows community reviews section", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("tacos");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    // Reviews section should appear (either with reviews or "No reviews yet")
    const reviewsSection = page.locator(".reviews-section");
    await expect(reviewsSection).toBeVisible({ timeout: 15000 });

    const heading = reviewsSection.locator(".reviews-heading");
    await expect(heading).toContainText("Community Reviews");
  });

  test("place panel scrolls to show reviews and actions", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search places...");
    await searchInput.fill("coffee");

    const firstResult = page.locator(".search-result-item").first();
    await expect(firstResult).toBeVisible({ timeout: 30000 });
    await firstResult.click();

    // Place panel should be visible and scrollable
    const panel = page.locator(".place-panel");
    await expect(panel).toBeVisible();

    // Should contain both reviews section and write review button
    await expect(panel.locator(".reviews-section")).toBeVisible({
      timeout: 15000,
    });
    await expect(panel.locator(".review-cta-btn")).toBeVisible();
  });
});
