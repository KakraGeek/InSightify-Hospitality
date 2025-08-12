import React from 'react'
import { BarChart3, ShieldCheck, Database, FileSpreadsheet, Users, Building2, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/components/ui/card'
import { Button } from '../components/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

// Page-specific SEO metadata
export const metadata: Metadata = {
  title: 'InSightify Hospitality - Management Software & KPI Dashboard',
  description: 'Transform your hospitality operations with InSightify. Real-time KPIs, performance analytics, and operational insights for hotels, restaurants, and hospitality businesses. Track occupancy rates, ADR, RevPAR, and 50+ metrics across all departments.',
  keywords: [
    'hospitality management software',
    'hotel KPIs dashboard',
    'hospitality analytics platform',
    'hotel performance metrics',
    'hospitality business intelligence',
    'hotel operations management',
    'hospitality reporting system',
    'hotel revenue optimization',
    'hospitality data analytics',
    'hotel operational efficiency'
  ],
  openGraph: {
    title: 'InSightify Hospitality - Management Software & KPI Dashboard',
    description: 'Transform your hospitality operations with real-time KPIs, performance analytics, and operational insights. Track occupancy rates, ADR, RevPAR, and 50+ metrics across all departments.',
    images: [
      {
        url: '/InSightify_Logo-removebg-preview.png',
        width: 1200,
        height: 630,
        alt: 'InSightify Hospitality - Operational KPIs and Analytics Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InSightify Hospitality - Management Software & KPI Dashboard',
    description: 'Transform your hospitality operations with real-time KPIs, performance analytics, and operational insights.',
    images: ['/InSightify_Logo-removebg-preview.png'],
  },
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-8 md:space-y-10">
      {/* Hero Section - Mobile-first */}
      <section className="text-center md:text-left space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy leading-tight">
          InSightify – Hospitality
        </h1>
        <p className="text-slate-700 text-base md:text-lg max-w-3xl mx-auto md:mx-0 leading-relaxed">
          Turn operational data into decisions. InSightify brings together KPIs from across your
          property to give managers a clear, real‑time view of performance and the tools to act.
        </p>
        
        {/* Mobile-optimized CTA */}
        <div className="pt-4">
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/dashboard" className="flex items-center gap-2">
              Explore the Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Grid - Mobile-first */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <FeatureCard
          icon={BarChart3}
          title="KPIs & Dashboards"
          desc="Track Occupancy, ADR, RevPAR and 50+ KPIs across departments with at‑a‑glance dashboards."
        />
        <FeatureCard
          icon={Building2}
          title="Department Views"
          desc="Front Office, F&B, Housekeeping, Engineering, Sales & Marketing, Finance and HR in one place."
        />
        <FeatureCard
          icon={Database}
          title="Fast Ingestion"
          desc="Upload CSVs and documents; validate with schema checks before numbers hit your dashboards."
        />
        <FeatureCard
          icon={FileSpreadsheet}
          title="Reports & Exports"
          desc="Build, share and export reports to PDF/CSV for weekly ops, owners and leadership."
        />
        <FeatureCard
          icon={Users}
          title="Roles & Access"
          desc="Role‑based permissions keep sensitive data safe while enabling team collaboration."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Reliability & Audit"
          desc="Backed by a secure, auditable stack with clear status, logs and error handling."
        />
      </section>

      {/* Mobile-optimized secondary CTA */}
      <section className="text-center pt-4">
        <p className="text-sm text-slate-600 mb-4">
          Ready to get started? Upload your first data file or explore the KPI catalog.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/ingest">Upload Data</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/kpis">Browse KPIs</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
      <CardHeader className="space-y-3 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Icon className="mt-1 h-5 w-5 text-orange-600 flex-shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg text-brand-navy leading-tight mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-700 leading-relaxed">
              {desc}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
