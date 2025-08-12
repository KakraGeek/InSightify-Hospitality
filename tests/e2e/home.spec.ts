import { test, expect } from '@playwright/test'

test('home loads and shows site title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'InSightify – Hospitality' })).toBeVisible()
})


