import { pgTable, uuid, unique } from 'drizzle-orm/pg-core'

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id').notNull(),
    roleId: uuid('role_id').notNull(),
  },
  (t) => ({
    uq: unique('user_roles_user_role_uq').on(t.userId, t.roleId),
  })
)
