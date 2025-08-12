import { pgTable, text, timestamp, uuid, decimal, jsonb, date, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { relations } from 'drizzle-orm'

// Reports table - stores high-level report metadata
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  department: text('department').notNull(),
  reportType: text('report_type').notNull(), // 'daily', 'weekly', 'monthly', 'custom'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isPublic: boolean('is_public').default(false),
  status: text('status').default('draft').notNull(), // 'draft', 'published', 'archived'
  metadata: jsonb('metadata'), // Additional report configuration
})

// Report items table - stores individual KPI values within reports
export const reportItems = pgTable('report_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  kpiName: text('kpi_name').notNull(),
  kpiCategory: text('kpi_category').notNull(), // 'occupancy', 'revenue', 'guest', 'operational'
  value: decimal('value', { precision: 10, scale: 2 }),
  textValue: text('text_value'), // For non-numeric KPIs
  unit: text('unit').notNull(), // '%', 'GHS', 'count', etc.
  date: date('date').notNull(),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  source: text('source').notNull(), // 'pdf', 'csv', 'manual', 'calculated'
  sourceFile: text('source_file'),
  confidence: decimal('confidence', { precision: 3, scale: 2 }), // 0.00 to 1.00
  notes: text('notes'),
  metadata: jsonb('metadata'), // Additional KPI-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Report shares table - for sharing reports with specific users
export const reportShares = pgTable('report_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permission: text('permission').notNull(), // 'view', 'edit', 'admin'
  sharedAt: timestamp('shared_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration
})

// KPI definitions table - stores KPI formulas and configuration
export const kpiDefinitions = pgTable('kpi_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  department: text('department').notNull(),
  category: text('category').notNull(),
  formula: text('formula').notNull(), // Mathematical formula or calculation logic
  unit: text('unit').notNull(),
  targetValue: decimal('target_value', { precision: 10, scale: 2 }),
  minValue: decimal('min_value', { precision: 10, scale: 2 }),
  maxValue: decimal('max_value', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'), // Additional configuration
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const reportsRelations = relations(reports, ({ many, one }) => ({
  items: many(reportItems),
  shares: many(reportShares),
  creator: one(users, {
    fields: [reports.createdBy],
    references: [users.id],
  }),
}))

export const reportItemsRelations = relations(reportItems, ({ one }) => ({
  report: one(reports, {
    fields: [reportItems.reportId],
    references: [reports.id],
  }),
}))

export const reportSharesRelations = relations(reportShares, ({ one }) => ({
  report: one(reports, {
    fields: [reportShares.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [reportShares.userId],
    references: [users.id],
  }),
}))

export const kpiDefinitionsRelations = relations(kpiDefinitions, () => ({
  // Can be referenced by report items
}))
