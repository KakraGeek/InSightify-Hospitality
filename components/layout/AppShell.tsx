import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '../../components/components/ui/navigation-menu'
import { Home, BarChart3, Target, FileText, Upload } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Get current path for active state
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-brand-light text-brand-navy">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-brand-navy"
      >
        Skip to main content
      </a>
      <Header />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside aria-label="Primary navigation" className="order-first md:order-none">
          <div className="sticky top-4 rounded-lg border border-brand-gray/30 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-sm font-semibold text-brand-navy mb-3 border-b border-brand-gray/20 pb-2">Interface</h2>
            <p className="text-xs text-brand-gray mb-3">Main navigation</p>
            <nav className="mt-3 text-sm">
              <NavigationMenu className="w-full">
                <NavigationMenuList className="grid gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/" 
                      className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                        currentPath === '/' 
                          ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                          : 'hover:bg-brand-light'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/dashboard" 
                      className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                        currentPath === '/dashboard' 
                          ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                          : 'hover:bg-brand-light'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/kpis" 
                      className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                        currentPath === '/kpis' 
                          ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                          : 'hover:bg-brand-light'
                      }`}
                    >
                      <Target className="h-4 w-4" />
                      KPIs
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/reports" 
                      className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                        currentPath === '/reports' 
                          ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                          : 'hover:bg-brand-light'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Reports & Analytics
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/ingest" 
                      className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                        currentPath === '/ingest' 
                          ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                          : 'hover:bg-light'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Data
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
        </aside>
        <main id="main" role="main" className="min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
