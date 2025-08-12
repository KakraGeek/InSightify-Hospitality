import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import AppShell from '../components/layout/AppShell'
import Providers from '../components/auth/Providers'

export const metadata: Metadata = {
  title: 'InSightify – Hospitality',
  description: 'Operational KPIs and reporting for hospitality, powered by InSightify.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
