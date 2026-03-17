import { test, expect } from '@playwright/test'

test.describe('Navigation E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock geolocation to LA Downtown
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 })

    await page.goto('http://localhost:5174')
    await page.waitForSelector('canvas', { timeout: 10000 })

    // Trigger location so store has userLocation
    await page.locator('.locate-btn').click()
    await page.waitForTimeout(1000)
  })

  test('place panel has Get Directions button', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('tacos')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    const directionsBtn = page.locator('.directions-btn')
    await expect(directionsBtn).toBeVisible()
    await expect(directionsBtn).toHaveText('Get Directions')
  })

  test('clicking Get Directions shows navigation panel with route', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('coffee')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    // Click Get Directions
    const directionsBtn = page.locator('.directions-btn')
    await expect(directionsBtn).toBeVisible()
    await directionsBtn.click()

    // Button should show loading state
    // Then navigation panel should appear
    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    // Should show ETA
    const eta = page.locator('.nav-eta-time')
    await expect(eta).toBeVisible()
    const etaText = await eta.textContent()
    expect(etaText).toMatch(/min|hr/)

    // Should show distance
    const distance = page.locator('.nav-eta-distance')
    await expect(distance).toBeVisible()
    const distText = await distance.textContent()
    expect(distText).toMatch(/mi|ft/)
  })

  test('navigation panel shows turn-by-turn instructions', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('pizza')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    // Should have multiple instructions
    const instructions = page.locator('.nav-instruction')
    const count = await instructions.count()
    expect(count).toBeGreaterThan(2)

    // First instruction should have text
    const firstInstText = instructions.first().locator('.nav-instruction-text')
    await expect(firstInstText).not.toBeEmpty()

    // Instructions should have maneuver icons
    const firstIcon = instructions.first().locator('.nav-instruction-icon')
    await expect(firstIcon).toBeVisible()
  })

  test('navigation panel shows destination name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('restaurant')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })

    // Get the place name
    const placeName = await firstResult.locator('.result-name').textContent()
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    // Should show destination name
    const destination = page.locator('.nav-destination')
    await expect(destination).toHaveText(placeName!)
  })

  test('navigation panel has Start Navigation button', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('bar')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    const startBtn = page.locator('.nav-start-btn')
    await expect(startBtn).toBeVisible()
    await expect(startBtn).toHaveText('Start Navigation')
  })

  test('closing navigation panel returns to place panel', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('coffee')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    // Close navigation
    await page.locator('.nav-close').click()

    // Navigation panel should be gone
    await expect(navPanel).not.toBeVisible()

    // Place panel should reappear
    const placePanel = page.locator('.place-panel')
    await expect(placePanel).toBeVisible()
  })

  test('Start Navigation changes button to End Navigation', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('tacos')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    // Click Start Navigation
    await page.locator('.nav-start-btn').click()

    // Should now show End Navigation
    const stopBtn = page.locator('.nav-stop-btn')
    await expect(stopBtn).toBeVisible()
    await expect(stopBtn).toHaveText('End Navigation')
  })

  test('End Navigation clears route and returns to place panel', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search places...')
    await searchInput.fill('coffee')

    const firstResult = page.locator('.search-result-item').first()
    await expect(firstResult).toBeVisible({ timeout: 15000 })
    await firstResult.click()

    await page.locator('.directions-btn').click()

    const navPanel = page.locator('.navigation-panel')
    await expect(navPanel).toBeVisible({ timeout: 15000 })

    await page.locator('.nav-start-btn').click()
    await page.locator('.nav-stop-btn').click()

    // Navigation panel gone
    await expect(navPanel).not.toBeVisible()

    // Place panel back
    await expect(page.locator('.place-panel')).toBeVisible()
  })
})
