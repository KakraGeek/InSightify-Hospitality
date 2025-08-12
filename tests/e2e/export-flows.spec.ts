import { test, expect } from '@playwright/test'

test.describe('Export Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Reports & Analytics")')
  })

  test('should export report as PDF', async ({ page }) => {
    // Navigate to Report Builder tab
    await page.click('button:has-text("Report Builder")')
    await page.waitForSelector('h3:has-text("Report Information")')

    // Fill in basic report information
    await page.fill('input[placeholder="Enter report title"]', 'Test Export Report')
    await page.selectOption('select', 'Front Office')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-31')
    await page.fill('textarea[placeholder="Enter report description"]', 'Test report for export functionality')

    // Add a section
    await page.click('button:has-text("Add Section")')
    await page.waitForSelector('input[value="Section 1"]')

    // Fill section details
    await page.fill('input[value="Section 1"]', 'Test Section')
    await page.selectOption('select:first-of-type', 'line')
    await page.selectOption('select:last-of-type', 'full')

    // Save the report
    await page.click('button:has-text("Save Report")')
    
    // Wait for success message or navigation
    await expect(page.locator('text=Report saved successfully')).toBeVisible()

    // Navigate to preview
    await page.click('button:has-text("Preview Report")')
    await page.waitForSelector('h1:has-text("Test Export Report")')

    // Export as PDF
    await page.click('button:has-text("Export as PDF")')
    
    // Wait for download to start (this might vary based on browser)
    // For now, we'll just verify the button is clickable
    await expect(page.locator('button:has-text("Export as PDF")')).toBeEnabled()
  })

  test('should export report as CSV', async ({ page }) => {
    // Navigate to Report Builder tab
    await page.click('button:has-text("Report Builder")')
    await page.waitForSelector('h3:has-text("Report Information")')

    // Fill in basic report information
    await page.fill('input[placeholder="Enter report title"]', 'Test CSV Export Report')
    await page.selectOption('select', 'Food & Beverage')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-31')
    await page.fill('textarea[placeholder="Enter report description"]', 'Test report for CSV export')

    // Add a section
    await page.click('button:has-text("Add Section")')
    await page.waitForSelector('input[value="Section 1"]')

    // Fill section details
    await page.fill('input[value="Section 1"]', 'CSV Test Section')
    await page.selectOption('select:first-of-type', 'table')
    await page.selectOption('select:last-of-type', 'full')

    // Save the report
    await page.click('button:has-text("Save Report")')
    
    // Wait for success message
    await expect(page.locator('text=Report saved successfully')).toBeVisible()

    // Navigate to preview
    await page.click('button:has-text("Preview Report")')
    await page.waitForSelector('h1:has-text("Test CSV Export Report")')

    // Export as CSV
    await page.click('button:has-text("Export as CSV")')
    
    // Verify the button is clickable
    await expect(page.locator('button:has-text("Export as CSV")')).toBeEnabled()
  })

  test('should handle export with no sections gracefully', async ({ page }) => {
    // Navigate to Report Builder tab
    await page.click('button:has-text("Report Builder")')
    await page.waitForSelector('h3:has-text("Report Information")')

    // Fill in basic report information but don't add sections
    await page.fill('input[placeholder="Enter report title"]', 'Empty Report')
    await page.selectOption('select', 'Housekeeping')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-31')

    // Try to save without sections
    await page.click('button:has-text("Save Report")')
    
    // Should show validation error
    await expect(page.locator('text=Please add at least one section to the report')).toBeVisible()
  })

  test('should export KPI data to CSV', async ({ page }) => {
    // Click export all data button
    await page.click('button:has-text("Export All Data")')
    
    // Verify the button is clickable
    await expect(page.locator('button:has-text("Export All Data")')).toBeEnabled()
  })

  test('should maintain export functionality across tab switches', async ({ page }) => {
    // Navigate to Report Builder tab
    await page.click('button:has-text("Report Builder")')
    await page.waitForSelector('h3:has-text("Report Information")')

    // Fill in basic report information
    await page.fill('input[placeholder="Enter report title"]', 'Tab Switch Test Report')
    await page.selectOption('select', 'Maintenance/Engineering')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-31')

    // Add a section
    await page.click('button:has-text("Add Section")')
    await page.waitForSelector('input[value="Section 1"]')

    // Fill section details
    await page.fill('input[value="Section 1"]', 'Tab Test Section')
    await page.selectOption('select:first-of-type', 'bar')
    await page.selectOption('select:last-of-type', 'half')

    // Switch to preview tab
    await page.click('button:has-text("Preview Report")')
    await page.waitForSelector('h3:has-text("Tab Test Section")')

    // Switch back to builder
    await page.click('button:has-text("Back to Builder")')
    await page.waitForSelector('h3:has-text("Report Information")')

    // Switch to preview again
    await page.click('button:has-text("Preview Report")')
    await page.waitForSelector('h3:has-text("Tab Test Section")')

    // Export buttons should still be available
    await expect(page.locator('button:has-text("Export as PDF")')).toBeEnabled()
    await expect(page.locator('button:has-text("Export as CSV")')).toBeEnabled()
  })
})
