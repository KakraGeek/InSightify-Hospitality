import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getDb } from '../../../../lib/db'
import { users } from '../../../../db/schema/users'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

const SignupSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(100),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = SignupSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = parsed.data
    const db = getDb()

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await db.insert(users).values({ email, name, passwordHash })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


