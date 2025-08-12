import Image from 'next/image'
import Link from 'next/link'
import Logo from '../branding/InSightify_Logo-removebg-preview.png'
import { getServerSession } from 'next-auth'
import authOptions from '../lib/auth/options'
import { Button } from './components/ui/button'

export default async function Header() {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name || session?.user?.email || null

  return (
    <header className="bg-white text-brand-navy border-b border-brand-gray/30">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="InSightify Logo"
            width={56}
            height={56}
            className="object-contain"
            priority
          />
          <Link href="/" className="font-semibold tracking-wide text-lg text-brand-navy">
            InSightify – Hospitality
          </Link>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
            <Link href="/kpis">KPIs</Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
            <Link href="/reports">Reports</Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
            <Link href="/ingest">Upload Data</Link>
          </Button>
          {!name && (
            <Button asChild variant="outline" className="border-brand-gray/40">
              <Link href="/login">Login</Link>
            </Button>
          )}
          {name && (
            <form action="/api/auth/signout" method="post" className="flex items-center gap-2">
              <span className="text-brand-navy hidden sm:inline">{name}</span>
              <Button type="submit" variant="outline" size="sm" className="border-brand-gray/40">
                Sign out
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}
