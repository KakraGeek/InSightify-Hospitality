#!/usr/bin/env tsx

/**
 * Seed script to create a system user for automated operations
 * Run with: npm run tsx scripts/seed-system-user.ts
 */

import { getDb } from '../lib/db'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'

async function seedSystemUser() {
  try {
    console.log('🌱 Seeding system user...')
    
    const db = getDb()
    
    // Check if system user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, '00000000-0000-0000-0000-000000000000'))
    
    if (existingUser.length > 0) {
      console.log('✅ System user already exists')
      return
    }
    
    // Create system user
    const [systemUser] = await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'system@insightify.com',
      name: 'System User',
      passwordHash: null, // System user doesn't need password
    }).returning()
    
    console.log('✅ System user created successfully:', systemUser)
    
  } catch (error) {
    console.error('❌ Failed to seed system user:', error)
  }
}

// Run the seed function
seedSystemUser()
