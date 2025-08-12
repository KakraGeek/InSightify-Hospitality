#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment')
      return
    }
    
    // Test the database connection
    const { getDb } = await import('../lib/db')
    const db = getDb()
    
    console.log('✅ Database connection established successfully')
    
    // Test a simple query
    const result = await db.execute('SELECT NOW() as current_time')
    console.log('✅ Database query successful:', result)
    
    // Check if tables exist
    const tablesResult = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('📊 Available tables:')
    if (tablesResult.rows) {
      tablesResult.rows.forEach((row: Record<string, unknown>) => {
        console.log(`  - ${row.table_name as string}`)
      })
    } else {
      console.log('  No tables found or error accessing table list')
    }
    
    // Check if reports and reportItems tables have data
    try {
      const reportsCount = await db.execute('SELECT COUNT(*) as count FROM reports')
      console.log(`📊 Reports table: ${reportsCount.rows?.[0]?.count || 0} records`)
      
      const reportItemsCount = await db.execute('SELECT COUNT(*) as count FROM report_items')
      console.log(`📊 Report items table: ${reportItemsCount.rows?.[0]?.count || 0} records`)
    } catch (error) {
      console.log('⚠️ Could not check table counts (tables might not exist yet):', error)
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
