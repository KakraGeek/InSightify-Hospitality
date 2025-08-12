import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDb } from '../../lib/db'
import { users } from '../../db/schema/users'
import { roles } from '../../db/schema/roles'
import { userRoles } from '../../db/schema/user_roles'
import { eq, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const db = getDb()
        const rows = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)
        const user = rows[0]
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign-in, fetch roles once and attach to token
      if (user && (trigger === 'signIn' || !('roles' in token))) {
        try {
          const db = getDb()
          const links = await db
            .select({ roleId: userRoles.roleId })
            .from(userRoles)
            .where(eq(userRoles.userId, user.id as string))
          const roleIds = links.map((l) => l.roleId)
          let names: string[] = []
          if (roleIds.length > 0) {
            const rs = await db
              .select({ name: roles.name })
              .from(roles)
              .where(inArray(roles.id, roleIds))
            names = rs.map((r) => r.name)
          }
          (token as { roles?: string[] }).roles = names
        } catch {
          (token as { roles?: string[] }).roles = []
        }
      }
      // Copy basic fields on sign-in
      if (user) {
        token.name = user.name
        token.email = user.email
        token.sub = user.id as string
      }
      return token
    },
    async session({ session, token }) {
      (session.user as { roles?: string[] }).roles = (token as { roles?: string[] }).roles ?? []
      return session
    },
  },
}

export default authOptions
