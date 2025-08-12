import React from 'react'
import catalog from '../../kpi/catalog.json'
import { KpiCard, type KpiAccent } from '../../components/kpi/KpiCard'
import { BarChart3, DollarSign, Utensils, ClipboardCheck, Timer, Wrench, Bed, FileText, type LucideIcon } from 'lucide-react'
import { ChipLink } from '../../components/ui/chip'
import type { Metadata } from 'next'

// Page-specific SEO metadata
export const metadata: Metadata = {
  title: 'Hospitality KPIs - Performance Metrics & Analytics',
  description: 'Explore comprehensive hospitality KPIs including occupancy rates, ADR, RevPAR, food cost percentages, and 50+ performance metrics across all departments. Get insights for your hospitality business.',
  keywords: [
    'hospitality KPIs',
    'hotel performance metrics',
    'occupancy rate',
    'ADR metrics',
    'RevPAR analytics',
    'hospitality analytics',
    'hotel KPIs',
    'performance metrics',
    'hospitality data',
    'hotel analytics'
  ],
  openGraph: {
    title: 'Hospitality KPIs - Performance Metrics & Analytics',
    description: 'Explore comprehensive hospitality KPIs including occupancy rates, ADR, RevPAR, food cost percentages, and 50+ performance metrics across all departments.',
    images: [
      {
        url: '/InSightify_Logo-removebg-preview.png',
        width: 1200,
        height: 630,
        alt: 'InSightify Hospitality KPIs - Performance Metrics and Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hospitality KPIs - Performance Metrics & Analytics',
    description: 'Explore comprehensive hospitality KPIs including occupancy rates, ADR, RevPAR, and 50+ performance metrics.',
    images: ['/InSightify_Logo-removebg-preview.png'],
  },
}

interface KpiItem {
  department: string
  name: string
  formula: string
  unit: string
}

const deptIcon: Record<string, LucideIcon> = {
  'Front Office': Bed,
  'Food & Beverage': Utensils,
  'Housekeeping': ClipboardCheck,
  'Maintenance/Engineering': Wrench,
  'Sales & Marketing': BarChart3,
  Finance: DollarSign,
  HR: Timer,
}

const accents: Record<string, KpiAccent> = {
  'Front Office': {
    topGradient: 'from-orange-500 to-orange-600',
    icon: 'text-orange-600',
    chipBg: 'bg-orange-50',
    chipBorder: 'border-orange-300',
  },
  'Food & Beverage': {
    topGradient: 'from-emerald-500 to-emerald-600',
    icon: 'text-emerald-600',
    chipBg: 'bg-emerald-50',
    chipBorder: 'border-emerald-300',
  },
  Housekeeping: {
    topGradient: 'from-sky-500 to-sky-600',
    icon: 'text-sky-600',
    chipBg: 'bg-sky-50',
    chipBorder: 'border-sky-300',
  },
  'Maintenance/Engineering': {
    topGradient: 'from-cyan-500 to-cyan-600',
    icon: 'text-cyan-600',
    chipBg: 'bg-cyan-50',
    chipBorder: 'border-cyan-300',
  },
  'Sales & Marketing': {
    topGradient: 'from-violet-500 to-violet-600',
    icon: 'text-violet-600',
    chipBg: 'bg-violet-50',
    chipBorder: 'border-violet-300',
  },
  Finance: {
    topGradient: 'from-amber-500 to-amber-600',
    icon: 'text-amber-600',
    chipBg: 'bg-amber-50',
    chipBorder: 'border-amber-300',
  },
  HR: {
    topGradient: 'from-fuchsia-500 to-fuchsia-600',
    icon: 'text-fuchsia-600',
    chipBg: 'bg-fuchsia-50',
    chipBorder: 'border-fuchsia-300',
  },
}

export default async function KpisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const rawDept = typeof params?.dept === 'string' ? params.dept : undefined
  let deptParam = rawDept
  try {
    if (deptParam && deptParam.includes('%')) {
      deptParam = decodeURIComponent(deptParam)
    }
  } catch {
    // URL decoding failed, continue with original value
  }
  deptParam = deptParam?.trim()

  // Get real KPI data from our new report storage service
  const { ReportStorageService } = await import('../../lib/services/reportStorage')
  const kpiData = await ReportStorageService.getKPIValues(deptParam) // Filter by department if specified
  
  console.log('🔍 KPI Page: Fetched KPI data:', kpiData)
  console.log('🔍 KPI Page: Department filter:', deptParam)
  console.log('🔍 KPI Page: KPI data length:', kpiData.length)

  const items = (catalog as { count: number; kpis: KpiItem[] }).kpis

  const departments = Array.from(new Set(items.map((k) => k.department))).sort()
  const filtered = deptParam ? items.filter((k) => k.department === deptParam) : items

  const preferred = new Set([
    'Occupancy Rate',
    'Average Daily Rate (ADR)',
    'Revenue per Available Room (RevPAR)',
  ])
  const ordered = [
    ...filtered.filter((k) => preferred.has(k.name)),
    ...filtered.filter((k) => !preferred.has(k.name)),
  ]
  const list = ordered

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-navy">KPIs</h1>
        <p className="text-slate-700">
          {deptParam ? `Department: ${deptParam}` : 'All Departments'} — showing {list.length}{' '}
          of {filtered.length}
        </p>
      </header>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Departments">
        <ChipLink href="/kpis" selected={!deptParam} ariaCurrent={!deptParam ? 'page' : undefined}>
          All
        </ChipLink>
        {departments.map((d) => (
          <ChipLink
            key={d}
            href={`/kpis?dept=${encodeURIComponent(d)}`}
            selected={deptParam === d}
            ariaCurrent={deptParam === d ? 'page' : undefined}
          >
            {d}
          </ChipLink>
        ))}
      </nav>

      <div className="rounded-xl border border-brand-gray/30 bg-gradient-to-br from-white to-brand-light/60 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((kpi) => {
            const Icon = deptIcon[kpi.department] ?? BarChart3
            const accent = accents[kpi.department] ?? accents['Front Office']
            
            // Find real data for this KPI
            const realData = kpiData.find(k => k.kpiName === kpi.name && k.department === kpi.department)
            console.log(`🔍 KPI Page: Looking for KPI "${kpi.name}" in department "${kpi.department}"`)
            console.log(`🔍 KPI Page: Found real data:`, realData)
            
            return (
              <KpiCard
                key={kpi.name + kpi.department}
                title={kpi.name}
                description={kpi.formula}
                unit={kpi.unit}
                icon={Icon}
                accent={accent}
                // Add real data if available
                value={realData?.value ?? undefined}
                trend="up"
                change="+12.5%"
                period="vs last month"
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
