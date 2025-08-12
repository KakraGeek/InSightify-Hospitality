#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function purgeAllTestData() {
  try {
    console.log('🧹 Purging all test data from database...')
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment')
      return
    }
    
    // Test the database connection
    const { getDb } = await import('../lib/db')
    const db = getDb()
    
    console.log('✅ Database connection established successfully')
    
    // Check current data counts
    const reportsCount = await db.execute('SELECT COUNT(*) as count FROM reports')
    const reportItemsCount = await db.execute('SELECT COUNT(*) as count FROM report_items')
    
    console.log(`📊 Current data counts:`)
    console.log(`  - Reports: ${reportsCount.rows?.[0]?.count || 0}`)
    console.log(`  - Report Items: ${reportItemsCount.rows?.[0]?.count || 0}`)
    
    // Delete all report items first (due to foreign key constraints)
    console.log('🗑️ Deleting all report items...')
    const deleteItemsResult = await db.execute('DELETE FROM report_items')
    console.log(`✅ Deleted ${deleteItemsResult.rowCount || 0} report items`)
    
    // Delete all reports
    console.log('🗑️ Deleting all reports...')
    const deleteReportsResult = await db.execute('DELETE FROM reports')
    console.log(`✅ Deleted ${deleteReportsResult.rowCount || 0} reports`)
    
    // Verify deletion
    const finalReportsCount = await db.execute('SELECT COUNT(*) as count FROM reports')
    const finalReportItemsCount = await db.execute('SELECT COUNT(*) as count FROM report_items')
    
    console.log(`📊 Final data counts:`)
    console.log(`  - Reports: ${finalReportsCount.rows?.[0]?.count || 0}`)
    console.log(`  - Report Items: ${finalReportItemsCount.rows?.[0]?.count || 0}`)
    
    console.log('🎉 Database purge completed successfully!')
    
  } catch (error) {
    console.error('❌ Database purge failed:', error)
  }
}

// Run the purge
purgeAllTestData()
  .then(() => {
    console.log('🏁 Purge completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Purge failed:', error)
    process.exit(1)
  })
