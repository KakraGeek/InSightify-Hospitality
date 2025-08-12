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

const deptIconMap: Record<string, LucideIcon> = {
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
  
  // Group KPIs by department
  const kpisByDept = items.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = []
    }
    acc[item.department].push(item)
    return acc
  }, {} as Record<string, KpiItem[]>)

  // Get real data for each KPI
  const getRealData = (kpiName: string, department: string) => {
    return kpiData.find(k => k.kpiName === kpiName && k.department === department)
  }

  return (
    <div className="space-y-6">
      {/* Mobile-optimized header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">
          Operational Dashboard
        </h1>
        <p className="text-brand-gray text-sm md:text-base max-w-2xl mx-auto md:mx-0">
          Real-time KPIs and performance metrics across all hospitality departments
        </p>
      </div>

      {/* Quick Actions - Mobile-friendly */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/ingest">
            <TrendingUp className="h-4 w-4 mr-2" />
            Upload New Data
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/reports">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </Button>
      </div>

      {/* Department KPIs - Mobile-first grid */}
      <div className="space-y-8">
        {Object.entries(kpisByDept).map(([department, kpis]) => {
          const Icon = deptIconMap[department]
          const accent = accents[department]
          const preferredKpis = preferredByDept[department] || []
          
          return (
            <section key={department} className="space-y-4">
              {/* Department Header */}
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-6 w-6 text-brand-navy" />}
                <h2 className="text-xl font-semibold text-brand-navy">{department}</h2>
              </div>
              
              {/* Department Description */}
              <p className="text-brand-gray text-sm md:text-base">
                Key performance indicators for {department.toLowerCase()} operations
              </p>
              
              {/* KPI Cards Grid */}
              <KpiGrid>
                {kpis.slice(0, 6).map((kpi) => {
                  const realData = getRealData(kpi.name, department)
                  
                  return (
                    <KpiCard
                      key={kpi.name}
                      title={kpi.name}
                      value={realData?.value ?? undefined}
                      unit={kpi.unit}
                      icon={Icon}
                      accent={accent}
                      description={kpi.formula}
                      trend="up"
                      change="+12.5%"
                      period="vs last month"
                    />
                  )
                })}
              </KpiGrid>
              
              {/* View All Link */}
              <div className="text-center md:text-left">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/kpis?dept=${encodeURIComponent(department)}`}>
                    View all {department} KPIs →
                  </Link>
                </Button>
              </div>
            </section>
          )
        })}
      </div>

      {/* Mobile-optimized footer section */}
      <div className="mt-12 p-6 bg-white rounded-lg border border-brand-gray/20 text-center">
        <h3 className="text-lg font-semibold text-brand-navy mb-2">
          Need More Insights?
        </h3>
        <p className="text-brand-gray text-sm mb-4">
          Explore detailed analytics, generate custom reports, and track performance trends
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/kpis">Browse All KPIs</Link>
          </Button>
          <Button asChild>
            <Link href="/reports">Create Report</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
