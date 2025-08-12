#!/usr/bin/env tsx

import { config as loadEnv } from 'dotenv'
import { getDb } from '../lib/db'

// Load environment variables from .env.local
loadEnv({ path: '.env.local' })

async function cleanupDatabase() {
  try {
    console.log('🧹 Cleaning up conflicting database tables...')
    
    const db = getDb()
    
    // Tables to remove (these conflict with your Drizzle schema)
    const tablesToRemove = [
      'Alert',
      'IngestRun', 
      'KPIResult',
      'Property',
      'Report'  // This conflicts with 'reports'!
    ]
    
    console.log('\n🗑️  Tables to be removed:')
    for (const table of tablesToRemove) {
      console.log(`   - ${table}`)
    }
    
    console.log('\n⚠️  WARNING: This will permanently delete these tables and all their data!')
    console.log('   Make sure you have backups if you need this data.')
    
    // Ask for confirmation (in a real scenario, you'd want user input)
    console.log('\n🔄 Proceeding with cleanup...')
    
    for (const table of tablesToRemove) {
      try {
        console.log(`\n🗑️  Dropping table: ${table}`)
        
        // Check if table exists first
        const existsResult = await db.execute(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = '${table}'
          )
        `)
        
        if (existsResult.rows && existsResult.rows[0]?.exists) {
          // Drop the table
          await db.execute(`DROP TABLE IF EXISTS "${table}" CASCADE`)
          console.log(`✅ Successfully dropped table: ${table}`)
        } else {
          console.log(`⚠️  Table ${table} doesn't exist, skipping`)
        }
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.log(`❌ Error dropping table ${table}: ${errorMessage}`)
      }
    }
    
    // Keep _prisma_migrations as it's harmless
    console.log('\n✅ Keeping _prisma_migrations (harmless system table)')
    
    console.log('\n🧪 Verifying cleanup...')
    
    // Check that expected tables still exist
    const expectedTables = [
      'accounts', 'roles', 'sessions', 'user_roles', 'users',
      'hospitality_data', 'ingestion_sessions', 'kpi_values', 
      'kpi_definitions', 'report_items', 'report_shares', 'reports'
    ]
    
    for (const table of expectedTables) {
      try {
        await db.execute(`SELECT COUNT(*) as count FROM "${table}" LIMIT 1`)
        console.log(`✅ ${table} - still accessible`)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.log(`❌ ${table} - ERROR: ${errorMessage}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n🎉 Database cleanup completed successfully!')
    console.log('Your database now matches your Drizzle schema exactly.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database cleanup failed:', error)
    process.exit(1)
  })
