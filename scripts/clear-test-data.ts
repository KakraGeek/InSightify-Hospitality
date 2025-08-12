import { getDb } from '../lib/db'
import { reports, reportItems } from '../db/schema/reports'
import { eq, like, or } from 'drizzle-orm'

async function clearTestData() {
  console.log('🧹 Clearing Test Data...')
  
  try {
    const db = getDb()
    
    // Find reports that contain test data
    console.log('\n🔍 Finding test reports...')
    const testReports = await db
      .select()
      .from(reports)
      .where(or(
        like(reports.title, '%test%'),
        like(reports.title, '%comprehensive%'),
        like(reports.title, '%Data Report%')
      ))
    
    console.log(`Found ${testReports.length} test reports to delete`)
    
    if (testReports.length > 0) {
      // Delete report items first (due to foreign key constraints)
      for (const report of testReports) {
        console.log(`🗑️ Deleting report items for report: ${report.title}`)
        await db.delete(reportItems).where(eq(reportItems.reportId, report.id))
      }
      
      // Delete the reports
      for (const report of testReports) {
        console.log(`🗑️ Deleting report: ${report.title}`)
        await db.delete(reports).where(eq(reports.id, report.id))
      }
      
      console.log('✅ Test data cleared successfully')
    } else {
      console.log('ℹ️ No test reports found to delete')
    }
    
    // Check what's left
    console.log('\n📊 Checking remaining data...')
    const remainingReports = await db.select().from(reports)
    const remainingItems = await db.select().from(reportItems)
    
    console.log(`Remaining reports: ${remainingReports.length}`)
    console.log(`Remaining report items: ${remainingItems.length}`)
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error)
  }
}

clearTestData().catch(console.error)
