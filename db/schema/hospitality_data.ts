import { pgTable, text, timestamp, uuid, integer, decimal, jsonb, date } from 'drizzle-orm/pg-core'
import { users } from './users'

// Table to store parsed hospitality data
export const hospitalityData = pgTable('hospitality_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  department: text('department').notNull(), // Front Office, Housekeeping, etc.
  dataType: text('data_type').notNull(), // 'occupancy', 'revenue', 'guest_count', etc.
  value: decimal('value', { precision: 10, scale: 2 }), // Numeric value
  textValue: text('text_value'), // Text value for non-numeric data
  date: date('date').notNull(), // Date the data represents
  source: text('source').notNull(), // 'pdf', 'csv', 'manual', etc.
  sourceFile: text('source_file'), // Original filename
  metadata: jsonb('metadata'), // Additional parsed data (tables, text, etc.)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Table to store data ingestion sessions
export const ingestionSessions = pgTable('ingestion_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sourceType: text('source_type').notNull(), // 'pdf', 'csv', 'xlsx'
  department: text('department').notNull(),
  filename: text('filename'),
  status: text('status').notNull(), // 'processing', 'completed', 'failed'
  totalRecords: integer('total_records').default(0),
  processedRecords: integer('processed_records').default(0),
  errorCount: integer('error_count').default(0),
  metadata: jsonb('metadata'), // Parsed data summary
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

// Table to store calculated KPI values
export const kpiValues = pgTable('kpi_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  kpiName: text('kpi_name').notNull(), // 'Occupancy Rate', 'ADR', 'RevPAR'
  department: text('department').notNull(),
  value: decimal('value', { precision: 10, scale: 4 }).notNull(),
  date: date('date').notNull(),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly'
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
})
