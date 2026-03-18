import { test, expect } from '@playwright/test'

test.describe('Day 8 — Navigation UX + Privacy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('privacy button is visible on the map', async ({ page }) => {
    const btn = page.locator('.privacy-btn')
    await expect(btn).toBeVisible()
    await expect(btn).toHaveText('Privacy')
  })

  test('clicking privacy button opens privacy page', async ({ page }) => {
    await page.click('.privacy-btn')
    const overlay = page.locator('.privacy-overlay')
    await expect(overlay).toBeVisible()

    const title = page.locator('.privacy-header h1')
    await expect(title).toContainText('Watching You')
  })

  test('privacy page shows all comparison categories', async ({ page }) => {
    await page.click('.privacy-btn')

    const categories = [
      'Location Tracking',
      'Search History',
      'Navigation Routes',
      'Business Interactions',
      'Review Identity',
      'Cross-App Profiling',
      'Law Enforcement',
      'Opt-Out Reality',
    ]

    for (const cat of categories) {
      await expect(page.locator(`.privacy-card-header:has-text("${cat}")`)).toBeVisible()
    }
  })

  test('privacy page shows fines section', async ({ page }) => {
    await page.click('.privacy-btn')
    await expect(page.locator('.privacy-fines h2')).toContainText('$7.3B+')
    await expect(page.locator('.fine-item')).toHaveCount(4)
  })

  test('privacy page shows transparency section', async ({ page }) => {
    await page.click('.privacy-btn')
    await expect(page.locator('.privacy-transparency h3')).toHaveText('Our Transparency')
  })

  test('privacy page can be closed with X button', async ({ page }) => {
    await page.click('.privacy-btn')
    await expect(page.locator('.privacy-overlay')).toBeVisible()

    await page.click('.privacy-close')
    await expect(page.locator('.privacy-overlay')).not.toBeVisible()
  })

  test('privacy page can be closed with Back to Map button', async ({ page }) => {
    await page.click('.privacy-btn')
    await expect(page.locator('.privacy-overlay')).toBeVisible()

    await page.click('.privacy-back-btn')
    await expect(page.locator('.privacy-overlay')).not.toBeVisible()
  })

  test('privacy page can be closed by clicking overlay background', async ({ page }) => {
    await page.click('.privacy-btn')
    await expect(page.locator('.privacy-overlay')).toBeVisible()

    // Click the overlay background (not the content)
    await page.locator('.privacy-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('.privacy-overlay')).not.toBeVisible()
  })

  test('navigation panel shows next-turn card and steps toggle', async ({ page }) => {
    // Mock a route response
    await page.route('**/api/route', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coordinates: [[-118.24, 34.05], [-118.25, 34.06], [-118.26, 34.07]],
          instructions: [
            { distance: 0, travelTime: 0, point: [-118.24, 34.05], instructionType: 'DEPART', street: 'Main St', message: 'Head north on Main St', maneuver: 'straight', turnAngle: 0 },
            { distance: 500, travelTime: 60, point: [-118.25, 34.06], instructionType: 'TURN', street: 'Broadway', message: 'Turn left onto Broadway', maneuver: 'left', turnAngle: 270 },
            { distance: 1200, travelTime: 180, point: [-118.26, 34.07], instructionType: 'ARRIVE', street: '', message: 'Arrive at destination', maneuver: '', turnAngle: 0 },
          ],
          summary: { lengthInMeters: 1200, travelTimeInSeconds: 180, trafficDelayInSeconds: 0, departureTime: '', arrivalTime: '' },
          speedLimits: [
            { startPointIndex: 0, endPointIndex: 1, maxSpeedKmh: 48, maxSpeedMph: 30 },
          ],
        }),
      })
    })

    // Mock search to get a place with coordinates
    await page.route('**/api/ai-search/stream*', async (route) => {
      const body = [
        'event: results\ndata: [{"id":"test1","name":"Test Place","category":"restaurant","address":"123 Test St","phone":"","website":"","brand":"","confidence":0.9,"longitude":-118.26,"latitude":34.07}]\n\n',
        'event: ranking\ndata: {"topPick":"test1","topPickReason":"Great","alternatives":[],"summary":"Test"}\n\n',
        'event: done\ndata: {}\n\n',
      ].join('')

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body,
      })
    })

    // Mock place details
    await page.route('**/api/places/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test1', name: 'Test Place', category: 'restaurant',
          address: '123 Test St', phone: '', website: '', brand: '',
          confidence: 0.9, longitude: -118.26, latitude: 34.07,
          briefing: 'Test briefing',
        }),
      })
    })

    // Mock reviews
    await page.route('**/api/reviews/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: [], identities: {}, summary: '' }),
      })
    })

    // Mock geolocation
    await page.context().grantPermissions(['geolocation'])
    await page.context().setGeolocation({ latitude: 34.05, longitude: -118.24 })

    // Search and select a place
    await page.fill('.search-bar input', 'test')
    await page.keyboard.press('Enter')
    await page.waitForSelector('.search-result-item', { timeout: 5000 })
    await page.click('.search-result-item')

    // Wait for place panel and click directions
    await page.waitForSelector('.directions-btn', { timeout: 5000 })

    // Set user location in store via evaluate
    await page.evaluate(() => {
      const store = (window as any).__zustand_store
      if (store) store.getState().setUserLocation({ lat: 34.05, lng: -118.24 })
    })

    await page.click('.directions-btn')

    // Navigation panel should appear with the new layout
    await page.waitForSelector('.navigation-panel', { timeout: 5000 })

    // Check next-turn card exists
    await expect(page.locator('.nav-next-turn')).toBeVisible()
    await expect(page.locator('.nav-next-turn-icon')).toBeVisible()

    // Check steps toggle exists
    await expect(page.locator('.nav-steps-toggle')).toBeVisible()
    await expect(page.locator('.nav-steps-toggle')).toContainText('Steps')

    // Full instruction list should be hidden by default
    await expect(page.locator('.nav-instructions')).not.toBeVisible()

    // Click Steps to expand
    await page.click('.nav-steps-toggle')
    await expect(page.locator('.nav-instructions')).toBeVisible()
    await expect(page.locator('.nav-instruction')).toHaveCount(3)

    // Click again to collapse
    await page.click('.nav-steps-toggle')
    await expect(page.locator('.nav-instructions')).not.toBeVisible()
  })

  test('review loading shows skeleton cards', async ({ page }) => {
    // Mock a slow review response
    await page.route('**/api/reviews/*', async (route) => {
      await new Promise((r) => setTimeout(r, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: [], identities: {}, summary: '' }),
      })
    })

    await page.route('**/api/ai-search/stream*', async (route) => {
      const body = [
        'event: results\ndata: [{"id":"test1","name":"Test Place","category":"restaurant","address":"123 Test","phone":"","website":"","brand":"","confidence":0.9,"longitude":-118.26,"latitude":34.07}]\n\n',
        'event: ranking\ndata: {"topPick":"test1","topPickReason":"Great","alternatives":[],"summary":"Test"}\n\n',
        'event: done\ndata: {}\n\n',
      ].join('')
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body })
    })

    await page.route('**/api/places/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test1', name: 'Test Place', category: 'restaurant',
          address: '123 Test', phone: '', website: '', brand: '',
          confidence: 0.9, longitude: -118.26, latitude: 34.07,
          briefing: 'A nice place',
        }),
      })
    })

    await page.fill('.search-bar input', 'test')
    await page.keyboard.press('Enter')
    await page.waitForSelector('.search-result-item', { timeout: 5000 })
    await page.click('.search-result-item')

    // Skeleton should show while reviews load
    await expect(page.locator('.reviews-skeleton')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.review-skeleton-card')).toHaveCount(3)
  })
})
