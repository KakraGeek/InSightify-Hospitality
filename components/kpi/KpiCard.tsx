import { BarChart3, type LucideIcon } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/components/ui/card'
import { formatGHS } from '../../lib/utils'

export type KpiAccent = {
  topGradient: string
  icon: string
  chipBg: string
  chipBorder: string
}

const defaultAccent: KpiAccent = {
  topGradient: 'from-orange-500 to-orange-600',
  icon: 'text-orange-600',
  chipBg: 'bg-orange-50',
  chipBorder: 'border-orange-300',
}

export function KpiCard({
  title,
  subtitle,
  unit,
  icon: Icon = BarChart3,
  accent = defaultAccent,
  value,
  lastUpdated,
}: {
  title: string
  subtitle: string
  unit?: string
  icon?: LucideIcon
  accent?: KpiAccent
  value?: number
  lastUpdated?: Date
}) {
  // Debug logging
  console.log(`🔍 KpiCard: Rendering "${title}" with value:`, value, 'lastUpdated:', lastUpdated)
  
  return (
    <Card className="relative overflow-hidden">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.topGradient}`} />
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${accent.icon}`} aria-hidden />
            <CardTitle className="text-base font-medium text-brand-navy">{title}</CardTitle>
          </div>
          {unit ? (
            <span className={`text-xs rounded-full ${accent.chipBg} px-2 py-0.5 text-brand-navy/70 border ${accent.chipBorder}`}>
              {unit}
            </span>
          ) : null}
        </div>
        <CardDescription className="mt-1 text-sm text-slate-700">{subtitle}</CardDescription>
        
        {/* Display real value if available */}
        {value !== undefined && (
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-navy">
                {typeof value === 'number' ? (
                  // Check if this is a currency value based on the unit
                  unit && (unit.includes('GHS') || unit.includes('currency')) ? 
                    formatGHS(value) : 
                    value.toLocaleString()
                ) : value}
              </span>
              {unit && !unit.includes('GHS') && (
                <span className="text-sm text-slate-600">{unit}</span>
              )}
            </div>
            {lastUpdated && (
              <div className="text-xs text-slate-500">
                Last updated: {lastUpdated instanceof Date ? lastUpdated.toLocaleDateString() : new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
        
        {/* Show placeholder if no real data */}
        {value === undefined && (
          <div className="mt-3 text-sm text-slate-400 italic">
            No data available yet. Upload a PDF to see metrics.
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
