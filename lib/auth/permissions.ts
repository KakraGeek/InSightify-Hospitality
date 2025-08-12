import { getServerSession } from 'next-auth'
import authOptions from './options'

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions)
  const roles: string[] = ((session as { user?: { roles?: string[] } })?.user?.roles as string[]) || []
  if (!roles.includes(role)) throw new Error('Forbidden')
  return session
}

export async function withRole<T>(role: string, fn: (session: Awaited<ReturnType<typeof getServerSession>>) => Promise<T>) {
  const session = await requireRole(role)
  return fn(session)
}
