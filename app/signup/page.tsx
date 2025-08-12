"use client"
import React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/components/ui/button'
import { Input } from '../../components/components/ui/input'
import { Label } from '../../components/components/ui/label'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setOk(false)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || 'Sign up failed')
      setOk(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold text-brand-navy">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label className="text-brand-navy" htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-white" />
        </div>
        <div>
          <Label className="text-brand-navy" htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-white" />
        </div>
        <div>
          <Label className="text-brand-navy" htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 bg-white" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-700">Account created. You can now sign in.</p>}
        <Button
          type="submit"
          disabled={busy}
          variant="default"
          className="!bg-brand-navy !text-white hover:!bg-brand-navy/95 border border-brand-navy disabled:opacity-100"
          style={{ backgroundColor: '#1E293B', color: '#ffffff', borderColor: '#1E293B' }}
        >
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-slate-700">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-orange underline">Login</Link> instead
      </p>
    </section>
  )
}


