import type { Config } from 'drizzle-kit'
import { config as loadEnv } from 'dotenv'

// Load local env for CLI usage (drizzle-kit)
loadEnv({ path: '.env.local' })

export default {
  schema: './db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config
