import React from 'react'
import { BarChart3, ShieldCheck, Database, FileSpreadsheet, Users, Building2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-brand-navy">InSightify – Hospitality</h1>
        <p className="text-slate-700 text-lg max-w-3xl">
          Turn operational data into decisions. InSightify brings together KPIs from across your
          property to give managers a clear, real‑time view of performance and the tools to act.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-[#F97316] px-6 py-3 text-white font-medium shadow-md hover:bg-[#EA580C] transition-colors duration-200 border border-[#EA580C]/20"
        >
          Explore the Dashboard
        </Link>
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
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
      <CardHeader className="space-y-2">
        <div className="flex items-start gap-3">
          <Icon className="mt-1 h-5 w-5 text-brand-orange" aria-hidden />
          <div>
            <CardTitle className="text-base text-brand-navy">{title}</CardTitle>
            <CardDescription className="mt-1 text-slate-700">{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
