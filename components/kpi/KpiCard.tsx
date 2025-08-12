import { BarChart3, type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
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
  description,
  unit,
  icon: Icon = BarChart3,
  accent = defaultAccent,
  value,
  trend,
  change,
  period,
}: {
  title: string
  description?: string
  unit?: string
  icon?: LucideIcon
  accent?: KpiAccent
  value?: number
  trend?: 'up' | 'down' | 'neutral'
  change?: string
  period?: string
}) {
  // Debug logging
  console.log(`🔍 KpiCard: Rendering "${title}" with value:`, value, 'trend:', trend)
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }
  
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.topGradient}`} />
      <CardHeader className="space-y-3 p-4 md:p-6">
        {/* Header with icon, title, and unit */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon className={`h-5 w-5 flex-shrink-0 ${accent.icon}`} aria-hidden />
            <CardTitle className="text-sm md:text-base font-medium text-brand-navy leading-tight">
              {title}
            </CardTitle>
          </div>
          {unit && (
            <span className={`text-xs rounded-full ${accent.chipBg} px-2 py-0.5 text-brand-navy/70 border ${accent.chipBorder} flex-shrink-0`}>
              {unit}
            </span>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <CardDescription className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {description}
          </CardDescription>
        )}
        
        {/* Value Display */}
        {value !== undefined && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-brand-navy">
                {typeof value === 'number' ? (
                  // Check if this is a currency value based on the unit
                  unit && (unit.includes('GHS') || unit.includes('currency')) ? 
                    formatGHS(value) : 
                    value.toLocaleString()
                ) : value}
              </span>
              {unit && !unit.includes('GHS') && !unit.includes('currency') && (
                <span className="text-xs md:text-sm text-slate-600">{unit}</span>
              )}
            </div>
            
            {/* Trend indicator */}
            {(trend && change) && (
              <div className="flex items-center gap-2 text-xs">
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {change}
                </span>
                {period && (
                  <span className="text-slate-500">
                    {period}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Show placeholder if no real data */}
        {value === undefined && (
          <div className="text-xs md:text-sm text-slate-400 italic">
            No data available yet. Upload a PDF to see metrics.
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
