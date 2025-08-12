import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL in environment')
  }
  const sql = neon(url)
  return drizzle({ client: sql })
}
