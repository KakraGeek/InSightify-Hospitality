"use client"
import React from 'react'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '../../components/components/ui/button'
import { Input } from '../../components/components/ui/input'
import { Label } from '../../components/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    setLoading(false)
    if (!res?.ok) {
      setError('Invalid credentials')
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label className="text-brand-navy" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 bg-white"
          />
        </div>
        <div>
          <Label className="text-brand-navy" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 bg-white"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          variant="default"
          className="!bg-brand-navy !text-white hover:!bg-brand-navy/95 border border-brand-navy disabled:opacity-100"
          style={{ backgroundColor: '#1E293B', color: '#ffffff', borderColor: '#1E293B' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-sm text-slate-700">
        Don’t have an account?{' '}
        <Link className="text-brand-orange underline" href="/signup">Create one</Link>
      </p>
    </section>
  )
}
