#!/usr/bin/env tsx

import { config as loadEnv } from 'dotenv'
import { getDb } from '../lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from 'drizzle-orm'

// Load environment variables from .env.local
loadEnv({ path: '.env.local' })

async function applyMigration() {
  try {
    console.log('🔍 Applying database migration...')
    
    const db = getDb()
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'drizzle', '0001_tiresome_bill_hollister.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('📖 Migration SQL loaded, length:', migrationSQL.length)
    
    // Split the SQL by statement breakpoints and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0)
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`)
        console.log(`   ${statement.substring(0, 100)}...`)
        
        try {
          await db.execute(statement)
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          const causeMessage = error instanceof Error && error.cause && typeof error.cause === 'object' && 'message' in error.cause 
            ? String(error.cause.message) 
            : ''
          
          // Check if it's a "table already exists" error
          if (errorMessage.includes('already exists') || causeMessage.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (table already exists)`)
          } else {
            console.log(`❌ Statement ${i + 1} failed:`, errorMessage)
            throw error
          }
        }
      }
    }
    
    console.log('🎉 Migration applied successfully!')
    
    // Test the connection by querying one of the new tables
    console.log('🧪 Testing new tables...')
    await db.select({ count: sql`count(*)` }).from(sql`kpi_definitions`)
    console.log('✅ kpi_definitions table is accessible')
    
    await db.select({ count: sql`count(*)` }).from(sql`reports`)
    console.log('✅ reports table is accessible')
    
    await db.select({ count: sql`count(*)` }).from(sql`report_items`)
    console.log('✅ report_items table is accessible')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
