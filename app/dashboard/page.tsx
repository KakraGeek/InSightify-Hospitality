import Link from 'next/link'
import catalog from '../../kpi/catalog.json'
import { KpiCard, type KpiAccent } from '../../components/kpi/KpiCard'
import { KpiGrid } from '../../components/kpi/KpiGrid'
import { DollarSign, BarChart3, Utensils, ClipboardCheck, Timer, Wrench, Bed, FileText, TrendingUp, type LucideIcon } from 'lucide-react'
import { Button } from '../../components/components/ui/button'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

const preferredByDept: Record<string, string[]> = {
  'Front Office': ['Occupancy Rate', 'Average Daily Rate (ADR)', 'Revenue per Available Room (RevPAR)'],
  'Food & Beverage': ['Average Check', 'RevPASH', 'Food Cost %'],
  Housekeeping: ['Rooms Cleaned per Shift', 'Average Cleaning Time', 'Inspection Pass Rate'],
  'Maintenance/Engineering': ['Mean Time To Repair (MTTR)', 'Mean Time Between Failures (MTBF)', 'PM Compliance Rate'],
  'Sales & Marketing': ['Direct Booking Ratio', 'Website Conversion Rate', 'Return on Ad Spend (ROAS)'],
  Finance: ['Gross Operating Profit (GOP) Margin', 'GOPPAR', 'Total RevPAR (TRevPAR)'],
  HR: ['Staff-to-Room Ratio', 'Employee Turnover Rate', 'Absenteeism Rate'],
}

export default async function DashboardPage() {
  const items = (catalog as { count: number; kpis: KpiItem[] }).kpis

  // Get real KPI data from our new report storage service
  console.log('🔍 Dashboard: About to import ReportStorageService...')
  const { ReportStorageService } = await import('../../lib/services/reportStorage')
  console.log('🔍 Dashboard: ReportStorageService imported successfully')
  
  console.log('🔍 Dashboard: About to call getKPIValues...')
  const kpiData = await ReportStorageService.getKPIValues()
  console.log('🔍 Dashboard: getKPIValues completed')
  
  // Enhanced debug logging
  console.log('🔍 Dashboard: Fetched KPI data:', kpiData)
  console.log('🔍 Dashboard: KPI data length:', kpiData.length)
  console.log('🔍 Dashboard: KPI data details:', kpiData.map(k => ({ name: k.kpiName, dept: k.department, value: k.value })))
  
  // Check if data exists but might be filtered out
  if (kpiData.length === 0) {
    console.log('⚠️ Dashboard: No KPI data found. This could mean:')
    console.log('   - No data was stored from PDF uploads')
    console.log('   - Data exists but getKPIValues() is not returning it')
    console.log('   - Database connection issues')
    
    // Try to get reports directly
    try {
      const reports = await ReportStorageService.getReports()
      console.log('🔍 Dashboard: Direct reports query result:', reports)
      console.log('🔍 Dashboard: Reports count:', reports.length)
    } catch (error) {
      console.error('❌ Dashboard: Error getting reports directly:', error)
    }
  }

  const deptToItems = new Map<string, KpiItem[]>()
  for (const k of items) {
    const arr = deptToItems.get(k.department) ?? []
    arr.push(k)
    deptToItems.set(k.department, arr)
  }

  const sections = Array.from(deptToItems.entries()).map(([dept, list]) => {
    const prefer = preferredByDept[dept] ?? []
    const preferred = list.filter((k) => prefer.includes(k.name))
    const remaining = list.filter((k) => !prefer.includes(k.name))
    // Show more KPIs per department - up to 6 instead of just 3
    const picks = [...preferred, ...remaining].slice(0, 6)
    
    // Enhance picks with real data if available
    const enhancedPicks = picks.map(kpi => {
      const realData = kpiData.find(k => k.kpiName === kpi.name && k.department === dept)
      console.log(`🔍 Dashboard: Looking for KPI "${kpi.name}" in department "${dept}"`)
      console.log(`🔍 Dashboard: Found real data:`, realData)
      
      // Convert the date string to a Date object if it exists
      const lastUpdated = realData?.date ? new Date(realData.date) : undefined
      
      console.log(`🔍 Dashboard: Enhanced KPI:`, { 
        ...kpi, 
        realValue: realData?.value, 
        lastUpdated: lastUpdated 
      })
      
      return {
        ...kpi,
        realValue: realData?.value,
        lastUpdated: lastUpdated
      }
    })
    
    return { dept, picks: enhancedPicks }
  })

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-navy">Dashboard</h1>
        <p className="text-slate-700">Key KPIs from each department with real-time data. Explore the full catalog on the KPIs page.</p>
      </header>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild className="flex items-center gap-2 bg-[#F97316] text-white hover:bg-[#EA580C] shadow-md border border-[#EA580C]/20 font-medium">
          <Link href="/reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Advanced Reports & Analytics
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
          <Link href="/kpis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View All KPIs
          </Link>
        </Button>
      </div>

      {sections.map(({ dept, picks }) => {
        const Icon = deptIcon[dept] ?? BarChart3
        const accent = accents[dept] ?? accents['Front Office']
        return (
          <section key={dept} className="rounded-xl border border-brand-gray/30 bg-gradient-to-br from-white to-brand-light/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-brand-navy ${accent.chipBg} ${accent.chipBorder}`}>
                <Icon className={`h-4 w-4 ${accent.icon}`} aria-hidden />
                {dept}
              </span>
            </div>
            <KpiGrid>
              {picks.map((kpi) => (
                <KpiCard 
                  key={kpi.name} 
                  title={kpi.name} 
                  subtitle={kpi.formula} 
                  unit={kpi.unit} 
                  icon={Icon} 
                  accent={accent}
                  // Add real data if available
                  value={kpi.realValue ?? undefined}
                  lastUpdated={kpi.lastUpdated}
                />
              ))}
            </KpiGrid>
          </section>
        )
      })}

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Need more detailed analysis? Create custom reports with interactive charts and export options.
        </p>
        <Button asChild className="bg-[#F97316] text-white hover:bg-[#EA580C] shadow-md border border-[#EA580C]/20 font-medium">
          <Link href="/reports">Go to Reports & Analytics →</Link>
        </Button>
      </div>
    </section>
  )
}
