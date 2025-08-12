'use client'

import Image from 'next/image'
import Link from 'next/link'
import Logo from '../branding/InSightify_Logo-removebg-preview.png'
import { Button } from './components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const name = session?.user?.name || session?.user?.email || null
  const userRole = (session?.user as { role?: string })?.role || 'viewer'

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/kpis', label: 'KPIs' },
    { href: '/reports', label: 'Reports' },
    { href: '/ingest', label: 'Upload Data' },
  ]

  // Add admin link if user has admin role
  if (userRole === 'admin') {
    navigationItems.push({ href: '/admin', label: 'Admin' })
  }

  return (
    <header className="bg-white text-brand-navy border-b border-brand-gray/30 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
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
            {navigationItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            
            {/* Settings Link - Visible to all authenticated users */}
            {name && (
              <Button asChild variant="ghost" className="text-brand-navy hover:bg-brand-light">
                <Link href="/settings">Settings</Link>
              </Button>
            )}
            
            {!name && (
              <Button asChild variant="outline" className="border-brand-gray/40">
                <Link href="/login">Login</Link>
              </Button>
            )}
            
            {name && (
              <form action="/api/auth/signout" method="post" className="flex items-center gap-2">
                <span className="text-brand-navy hidden lg:inline">{name}</span>
                <Button type="submit" variant="outline" size="sm" className="border-brand-gray/40">
                  Sign out
                </Button>
              </form>
            )}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="InSightify Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <Link href="/" className="font-semibold tracking-wide text-sm text-brand-navy">
              InSightify
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {!name && (
              <Button asChild variant="outline" size="sm" className="border-brand-gray/40 text-xs">
                <Link href="/login">Login</Link>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 text-brand-navy hover:bg-brand-light"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-brand-gray/20">
            <nav className="flex flex-col gap-1 mt-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-brand-navy hover:bg-brand-light rounded-md transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Settings Link */}
              {name && (
                <Link
                  href="/settings"
                  className="px-3 py-2 text-brand-navy hover:bg-brand-light rounded-md transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
              )}
              
              {/* User Info and Sign Out */}
              {name && (
                <div className="px-3 py-2 border-t border-brand-gray/20 mt-2 pt-2">
                  <div className="text-sm text-brand-gray mb-2">{name}</div>
                  <form action="/api/auth/signout" method="post">
                    <Button type="submit" variant="outline" size="sm" className="w-full border-brand-gray/40">
                      Sign out
                    </Button>
                  </form>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
