#!/usr/bin/env tsx

import { config as loadEnv } from 'dotenv'
import { getDb } from '../lib/db'

// Load environment variables from .env.local
loadEnv({ path: '.env.local' })

async function checkTableStructures() {
  try {
    console.log('🔍 Checking database table structures...')
    
    const db = getDb()
    
    // List of tables that should exist according to Drizzle schema
    const expectedTables = [
      'accounts', 'roles', 'sessions', 'user_roles', 'users',
      'hospitality_data', 'ingestion_sessions', 'kpi_values', 
      'kpi_definitions', 'report_items', 'report_shares', 'reports'
    ]
    
    // List of extra tables that don't belong
    const extraTables = [
      '_prisma_migrations', 'Alert', 'IngestRun', 'KPIResult', 'Property', 'Report'
    ]
    
    console.log('\n📋 Expected Tables (Drizzle Schema):')
    for (const table of expectedTables) {
      try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM "${table}" LIMIT 1`)
        console.log(`✅ ${table} - exists and accessible`)
      } catch (error: any) {
        console.log(`❌ ${table} - error: ${error.message}`)
      }
    }
    
    console.log('\n🚨 Extra Tables (Potential Conflicts):')
    for (const table of extraTables) {
      try {
        // Try to get table structure
        const result = await db.execute(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position
        `)
        
        if (result.rows && result.rows.length > 0) {
          console.log(`⚠️  ${table} - exists with ${result.rows.length} columns`)
          console.log(`   Columns: ${result.rows.map((row: any) => row.column_name).join(', ')}`)
        } else {
          console.log(`❌ ${table} - not found`)
        }
      } catch (error: any) {
        console.log(`❌ ${table} - error: ${error.message}`)
      }
    }
    
    console.log('\n🔍 Checking for table name conflicts...')
    
    // Check if there are case-sensitive conflicts (e.g., Report vs reports)
    const allTables = [...expectedTables, ...extraTables]
    const lowerCaseTables = allTables.map(t => t.toLowerCase())
    const duplicates = lowerCaseTables.filter((item, index) => lowerCaseTables.indexOf(item) !== index)
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Potential case conflicts found: ${duplicates.join(', ')}`)
    } else {
      console.log('✅ No case conflicts detected')
    }
    
  } catch (error) {
    console.error('❌ Error checking table structures:', error)
    process.exit(1)
  }
}

// Run the check
checkTableStructures()
  .then(() => {
    console.log('\n✅ Table structure check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Table structure check failed:', error)
    process.exit(1)
  })
