import { getServerSession } from 'next-auth'
import authOptions from './options'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  return session
}
