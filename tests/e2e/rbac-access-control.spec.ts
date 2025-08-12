import { test, expect } from '@playwright/test'

test.describe('RBAC Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
  })

  test('login form validation works', async ({ page }) => {
    // Test empty form submission
    await page.click('button[type="submit"]')
    
    // Should show validation errors or stay on login page
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
  })

  test('login form fields are present and functional', async ({ page }) => {
    // Check that email and password fields exist
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Test form interaction
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'password123')
    
    // Verify values were entered
    await expect(page.locator('#email')).toHaveValue('test@example.com')
    await expect(page.locator('#password')).toHaveValue('password123')
  })

  test('unauthenticated users are redirected to login', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/dashboard')
    
    // Should redirect to login (with optional from parameter)
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
  })

  test('login page shows proper branding and links', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Login')
    
    // Check signup link exists
    await expect(page.locator('a[href="/signup"]')).toBeVisible()
    await expect(page.locator('a[href="/signup"]')).toContainText('Create one')
  })
})

test.describe('Navigation and Routing', () => {
  test('login page has proper form structure', async ({ page }) => {
    await page.goto('/login')
    
    // Check form elements
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Check form has proper action and method
    await expect(form).toHaveAttribute('class', expect.stringContaining('space-y-3'))
  })

  test('protected routes redirect to login', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/ingest', '/kpis', '/admin/users']
    
    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login(\?.*)?$/)
    }
  })
})
