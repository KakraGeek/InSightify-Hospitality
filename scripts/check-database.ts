#!/usr/bin/env tsx

/**
 * Check database contents to debug data storage issues
 * Run with: npx tsx scripts/check-database.ts
 */

import { getDb } from '../lib/db'
import { reports, reportItems } from '../db/schema/reports'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n')
    
    const db = getDb()
    
    // Check users
    console.log('👥 Users:')
    const usersList = await db.select().from(users)
    console.log(`Found ${usersList.length} users:`, usersList.map(u => ({ id: u.id, email: u.email, name: u.name })))
    
    // Check reports
    console.log('\n📊 Reports:')
    const reportsList = await db.select().from(reports)
    console.log(`Found ${reportsList.length} reports:`, reportsList.map(r => ({ 
      id: r.id, 
      title: r.title, 
      department: r.department, 
      createdBy: r.createdBy,
      createdAt: r.createdAt 
    })))
    
    // Check report items
    console.log('\n📋 Report Items:')
    const itemsList = await db.select().from(reportItems)
    console.log(`Found ${itemsList.length} report items:`, itemsList.map(i => ({ 
      id: i.id, 
      reportId: i.reportId, 
      kpiName: i.kpiName, 
      value: i.value,
      unit: i.unit,
      date: i.date 
    })))
    
    // Check specific system user
    console.log('\n🔧 System User Check:')
    const systemUser = await db.select().from(users).where(eq(users.id, '00000000-0000-0000-0000-000000000000'))
    console.log('System user exists:', systemUser.length > 0)
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  }
}

// Run the check
checkDatabase()
