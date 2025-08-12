'use client'

import React, { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '../../components/components/ui/navigation-menu'
import { Home, BarChart3, Target, FileText, Upload, Menu, X } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Get current path for active state
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  
  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/kpis', label: 'KPIs', icon: Target },
    { href: '/reports', label: 'Reports & Analytics', icon: FileText },
    { href: '/ingest', label: 'Upload Data', icon: Upload },
  ]
  
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-brand-light text-brand-navy">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-brand-navy"
      >
        Skip to main content
      </a>
      
      <Header />
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden px-4 py-2 border-b border-brand-gray/20 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="flex items-center gap-2 text-brand-navy hover:bg-brand-light"
        >
          <Menu className="h-4 w-4" />
          <span>Menu</span>
        </Button>
      </div>
      
      <div className="flex w-full">
        {/* Sidebar - Hidden on mobile by default, shown when toggled */}
        <aside 
          aria-label="Primary navigation" 
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-brand-gray/30 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:inset-auto md:z-auto
          `}
        >
          {/* Mobile sidebar header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-brand-gray/20">
            <h2 className="text-sm font-semibold text-brand-navy">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1 text-brand-navy hover:bg-brand-light"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <h2 className="text-sm font-semibold text-brand-navy mb-3 border-b border-brand-gray/20 pb-2 hidden md:block">
              Interface
            </h2>
            <p className="text-xs text-brand-gray mb-3 hidden md:block">Main navigation</p>
            
            <nav className="mt-3 text-sm">
              <NavigationMenu className="w-full">
                <NavigationMenuList className="grid gap-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink 
                          href={item.href} 
                          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                            currentPath === item.href 
                              ? 'bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange' 
                              : 'hover:bg-brand-light'
                          }`}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main 
          id="main" 
          role="main" 
          className="flex-1 min-w-0 px-4 py-6 md:px-6"
        >
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

// Button component for the sidebar toggle
function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  onClick, 
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm'
  className?: string
  onClick?: () => void
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
