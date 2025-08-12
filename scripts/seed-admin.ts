import 'dotenv/config'
import { getDb } from '../lib/db'
import { users } from '../db/schema/users'
import { roles } from '../db/schema/roles'
import { userRoles } from '../db/schema/user_roles'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function main() {
  const db = getDb()

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const adminName = process.env.SEED_ADMIN_NAME || 'Demo Admin'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'

  // Create all roles
  const roleNames = ['admin', 'analyst', 'viewer']
  const createdRoles: Record<string, string> = {}
  
  for (const roleName of roleNames) {
    const existingRole = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1)
    if (existingRole[0]) {
      createdRoles[roleName] = existingRole[0].id
      console.log(`Role '${roleName}' already exists`)
    } else {
      const newRole = await db.insert(roles).values({ name: roleName }).returning({ id: roles.id })
      createdRoles[roleName] = newRole[0].id
      console.log(`Created role '${roleName}'`)
    }
  }

  // Ensure admin user
  const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  const userId = existingUser[0]?.id ?? (await db
    .insert(users)
    .values({ email: adminEmail, name: adminName, passwordHash })
    .returning({ id: users.id }))[0].id

  // Link admin role to user
  await db
    .insert(userRoles)
    .values({ userId, roleId: createdRoles.admin })
    .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] })

  console.log('Seed complete:', { 
    adminEmail, 
    roles: Object.keys(createdRoles),
    adminRoleId: createdRoles.admin 
  })
  
  console.log('\nDefault credentials:')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log('\nYou can now log in with admin privileges!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
