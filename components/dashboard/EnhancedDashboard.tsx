'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Button } from '../components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'

interface KpiDataPoint {
  kpiName: string
  value: number
  unit: string
  date: string
  department: string
  confidence: number
}

interface EnhancedDashboardProps {
  kpiData: KpiDataPoint[]
  departments: string[]
}

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'area', label: 'Area Chart', icon: BarChart3 },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon }
]

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
]

export function EnhancedDashboard({ kpiData, departments }: EnhancedDashboardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedChartType, setSelectedChartType] = useState<string>('line')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d')
  const [selectedKPI, setSelectedKPI] = useState<string>('all')

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = kpiData

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === selectedDepartment)
    }

    // Filter by time range
    const now = new Date()
    const timeRangeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }
    const daysBack = timeRangeMap[selectedTimeRange as keyof typeof timeRangeMap] || 30
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    
    filtered = filtered.filter(item => new Date(item.date) >= cutoffDate)

    // Filter by KPI if specific one selected
    if (selectedKPI !== 'all') {
      filtered = filtered.filter(item => item.kpiName === selectedKPI)
    }

    return filtered
  }, [kpiData, selectedDepartment, selectedTimeRange, selectedKPI])

  // Get unique KPIs for the filter
  const availableKPIs = useMemo(() => {
    const kpis = [...new Set(kpiData.map(item => item.kpiName))]
    const sortedKpis = kpis.sort()
    
    // Debug logging for KPI extraction
    console.log(`🔍 KPI Extraction Debug:`, {
      totalKpiDataItems: kpiData.length,
      uniqueKpiNames: kpis.length,
      allKpiNames: kpis,
      sortedKpis: sortedKpis,
      sampleKpiData: kpiData.slice(0, 3),
      firstFewKpis: sortedKpis.slice(0, 10),
      lastFewKpis: sortedKpis.slice(-10)
    })
    
    return sortedKpis
  }, [kpiData])

  // Prepare data for charts with actionable insights
  const chartData = useMemo(() => {
    if (selectedChartType === 'pie') {
      // For pie chart, show department performance distribution
      const deptTotals = filteredData.reduce((acc, item) => {
        acc[item.department] = (acc[item.department] || 0) + item.value
        return acc
      }, {} as Record<string, number>)
      
      const shortenDepartmentName = (dept: string) => {
        const shortNames: Record<string, string> = {
          'Maintenance/Engineering': 'Maintenance',
          'Food & Beverage': 'F&B',
          'Sales & Marketing': 'Sales',
          'Front Office': 'Front Office',
          'Housekeeping': 'Housekeeping',
          'Finance': 'Finance',
          'HR': 'HR'
        }
        return shortNames[dept] || dept
      }
      
      const pieData = Object.entries(deptTotals).map(([dept, total]) => ({
        name: shortenDepartmentName(dept),
        value: total,
        fullName: dept
      }))

      return pieData
    } else if (selectedChartType === 'line' || selectedChartType === 'area') {
      // For line/area charts, show KPI trends over time
      const kpisToShow = availableKPIs.slice(0, 5)
      const allDates = [...new Set(filteredData.map(item => item.date))].sort()
      
      const timeSeriesData = allDates.map(date => {
        const dataPoint: any = { date }
        kpisToShow.forEach(kpi => {
          const matchingData = filteredData.find(item => 
            item.date === date && item.kpiName === kpi
          )
          dataPoint[kpi] = matchingData ? matchingData.value : null
        })
        return dataPoint
      })
      
      return timeSeriesData
    } else if (selectedChartType === 'bar') {
      // For bar charts, show ONE KPI across all departments (much clearer!)
      if (selectedKPI === 'all') {
        // If no specific KPI selected, show the most important KPI (Occupancy Rate)
        const primaryKPI = availableKPIs.find(kpi => 
          kpi.includes('Occupancy') || kpi.includes('Rate')
        ) || availableKPIs[0]
        
        // Create simple department comparison for this KPI
        const deptComparison = departments.map(dept => {
          const kpiValues = filteredData.filter(item => 
            item.department === dept && item.kpiName === primaryKPI
          )
          
          const avgValue = kpiValues.length > 0 
            ? kpiValues.reduce((sum, item) => sum + item.value, 0) / kpiValues.length
            : 0
          
          return {
            department: dept,
            value: Math.round(avgValue * 100) / 100,
            kpiName: primaryKPI
          }
        })
        
        return deptComparison
      } else {
        // Show the selected KPI across all departments
        const deptComparison = departments.map(dept => {
          const kpiValues = filteredData.filter(item => 
            item.department === dept && item.kpiName === selectedKPI
          )
          
          const avgValue = kpiValues.length > 0 
            ? kpiValues.reduce((sum, item) => sum + item.value, 0) / kpiValues.length
            : 0
          
          return {
            department: dept,
            value: Math.round(avgValue * 100) / 100,
            kpiName: selectedKPI
          }
        })
        
        return deptComparison
      }
    }
    
    return []
  }, [filteredData, selectedChartType, availableKPIs, departments, selectedKPI])

  // Generate actionable insights
  const insights = useMemo(() => {
    if (filteredData.length === 0) return []
    
    const insights = []
    
    // Performance insights
    const deptPerformance = departments.map(dept => {
      const deptData = filteredData.filter(item => item.department === dept)
      if (deptData.length === 0) return null
      
      const avgValue = deptData.reduce((sum, item) => sum + item.value, 0) / deptData.length
      return { department: dept, avgValue, count: deptData.length }
    }).filter(Boolean)
    
    // Top performing department
    if (deptPerformance.length > 0) {
      const topDept = deptPerformance.reduce((max, curr) => 
        curr!.avgValue > max!.avgValue ? curr : max
      )
      insights.push({
        type: 'performance',
        message: `${topDept!.department} is performing best with average KPI value of ${topDept!.avgValue.toFixed(1)}`,
        priority: 'high'
      })
    }
    
    // Trend insights for line/area charts
    if (selectedChartType === 'line' || selectedChartType === 'area') {
      const kpisToShow = availableKPIs.slice(0, 5)
      kpisToShow.forEach(kpi => {
        const kpiData = filteredData.filter(item => item.kpiName === kpi)
        if (kpiData.length > 1) {
          const sortedData = kpiData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          const firstValue = sortedData[0].value
          const lastValue = sortedData[sortedData.length - 1].value
          const change = ((lastValue - firstValue) / firstValue) * 100
          
          if (Math.abs(change) > 10) {
            insights.push({
              type: 'trend',
              message: `${kpi} has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% over the selected period`,
              priority: change > 0 ? 'positive' : 'negative'
            })
          }
        }
      })
    }
    
    return insights
  }, [filteredData, selectedChartType, availableKPIs, departments])

  // Generate colors for charts
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  // Smart chart recommendation
  const recommendedChartType = useMemo(() => {
    if (selectedKPI !== 'all') {
      // If specific KPI selected, line/area charts are best for trends
      return selectedTimeRange === '7d' ? 'line' : 'area'
    }
    
    if (selectedDepartment !== 'all') {
      // If specific department selected, line/area charts show KPI trends
      return 'line'
    }
    
    if (selectedTimeRange === '7d' || selectedTimeRange === '30d') {
      // Short time periods work well with line charts
      return 'line'
    }
    
    // Default to bar chart for department comparisons
    return 'bar'
  }, [selectedKPI, selectedDepartment, selectedTimeRange])

  // Auto-switch to recommended chart type if current selection is suboptimal
  const handleChartTypeChange = (newType: string) => {
    setSelectedChartType(newType)
  }

  // Generate data summary
  const dataSummary = useMemo(() => {
    if (filteredData.length === 0) return null
    
    const totalDataPoints = filteredData.length
    const uniqueKPIs = new Set(filteredData.map(item => item.kpiName)).size
    const uniqueDepartments = new Set(filteredData.map(item => item.department)).size
    
    // Date range
    const dates = filteredData.map(item => new Date(item.date)).sort((a, b) => a.getTime() - b.getTime())
    const dateRange = dates.length > 0 ? {
      start: dates[0].toLocaleDateString(),
      end: dates[dates.length - 1].toLocaleDateString()
    } : null
    
    // Performance summary
    const avgValue = filteredData.reduce((sum, item) => sum + item.value, 0) / totalDataPoints
    const maxValue = Math.max(...filteredData.map(item => item.value))
    const minValue = Math.min(...filteredData.map(item => item.value))
    
    return {
      totalDataPoints,
      uniqueKPIs,
      uniqueDepartments,
      dateRange,
      avgValue,
      maxValue,
      minValue
    }
  }, [filteredData])

  // Generate KPI performance rankings
  const kpiRankings = useMemo(() => {
    if (filteredData.length === 0) return null
    
    // Group by KPI and calculate average performance
    const kpiPerformance = availableKPIs.map(kpi => {
      const kpiData = filteredData.filter(item => item.kpiName === kpi)
      if (kpiData.length === 0) return null
      
      const avgValue = kpiData.reduce((sum, item) => sum + item.value, 0) / kpiData.length
      const deptCount = new Set(kpiData.map(item => item.department)).size
      
      return {
        kpiName: kpi,
        avgValue,
        deptCount,
        dataPoints: kpiData.length
      }
    }).filter(Boolean)
    
    // Sort by performance (descending)
    const sortedByPerformance = [...kpiPerformance].sort((a, b) => b!.avgValue - a!.avgValue)
    
    return {
      topPerformers: sortedByPerformance.slice(0, 3),
      bottomPerformers: sortedByPerformance.slice(-3).reverse(),
      allRankings: sortedByPerformance
    }
  }, [filteredData, availableKPIs])

  // Render data summary
  const renderDataSummary = () => {
    if (!dataSummary) return null
    
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Data Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dataSummary.totalDataPoints}</div>
            <div className="text-sm text-blue-700">Total Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dataSummary.uniqueKPIs}</div>
            <div className="text-sm text-green-700">Unique KPIs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{dataSummary.uniqueDepartments}</div>
            <div className="text-sm text-purple-700">Departments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{dataSummary.avgValue.toFixed(1)}</div>
            <div className="text-sm text-orange-700">Average Value</div>
          </div>
        </div>
        {dataSummary.dateRange && (
          <div className="mt-3 text-center text-sm text-blue-600">
            📅 Data covers {dataSummary.dateRange.start} to {dataSummary.dateRange.end}
          </div>
        )}
      </div>
    )
  }

  // Render KPI rankings
  const renderKPIRankings = () => {
    if (!kpiRankings) return null
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Performers */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-green-700 mb-3">🏆 Top Performing KPIs</h3>
          <div className="space-y-2">
            {kpiRankings.topPerformers.map((kpi, index) => (
              <div key={kpi!.kpiName} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                  <span className="text-sm font-medium text-green-800">{kpi!.kpiName}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{kpi!.avgValue.toFixed(1)}</div>
                  <div className="text-xs text-green-600">{kpi!.deptCount} depts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Performers */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-red-700 mb-3">⚠️ Areas for Improvement</h3>
          <div className="space-y-2">
            {kpiRankings.bottomPerformers.map((kpi, index) => (
              <div key={kpi!.kpiName} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">#{kpiRankings.allRankings.length - index}</span>
                  <span className="text-sm font-medium text-red-800">{kpi!.kpiName}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{kpi!.avgValue.toFixed(1)}</div>
                  <div className="text-xs text-red-600">{kpi!.deptCount} depts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (selectedChartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name]}
            />
            <Legend />
            {availableKPIs.slice(0, 5).map((kpi, index) => (
              <Line
                key={kpi}
                type="monotone"
                dataKey={kpi}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={true}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name]}
            />
            <Legend />
            {availableKPIs.slice(0, 5).map((kpi, index) => (
              <Area
                key={kpi}
                type="monotone"
                dataKey={kpi}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                fillOpacity={0.3}
                connectNulls={true}
                isAnimationActive={true}
              />
            ))}
          </AreaChart>
        )
      
      case 'bar':
        // Now bar chart shows ONE KPI across departments (much clearer!)
        if (chartData.length > 0 && chartData[0].kpiName) {
          const kpiName = chartData[0].kpiName
          return (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, kpiName]}
                labelFormatter={(value) => `Department: ${value}`}
              />
              <Legend content={() => <span className="text-sm font-medium">{kpiName} by Department</span>} />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                isAnimationActive={true}
                name={kpiName}
              />
            </BarChart>
          )
        }
        return <div>No data available for bar chart</div>
      
      case 'pie':
        return (
          <PieChart width={500} height={400}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={120}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any, props: any) => [
                `${value} (${((value / chartData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                props.payload.fullName || name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={50}
              formatter={(value: any, entry: any) => (
                <span className="text-sm font-medium">
                  {value} ({(entry.payload?.percent * 100 || 0).toFixed(1)}%)
                </span>
              )}
            />
          </PieChart>
        )
      
      default:
        return <div>Select a chart type</div>
    }
  }

  // Render insights
  const renderInsights = () => {
    if (insights.length === 0) return null
    
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Key Insights</h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-md border-l-4 ${
                insight.priority === 'high' ? 'border-blue-500 bg-blue-50' :
                insight.priority === 'positive' ? 'border-green-500 bg-green-50' :
                insight.priority === 'negative' ? 'border-red-500 bg-red-50' :
                'border-gray-500 bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-700">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      {renderDataSummary()}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="min-w-0 max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <BarChart3 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="min-w-0 max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Select value={selectedKPI} onValueChange={setSelectedKPI}>
              <SelectTrigger className="min-w-0 max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KPIs</SelectItem>
                {availableKPIs.map(kpi => (
                  <SelectItem key={kpi} value={kpi}>{kpi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart Type Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Chart Type</label>
          {selectedChartType !== recommendedChartType && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                💡 Recommended: {chartTypes.find(t => t.value === recommendedChartType)?.label}
              </span>
              <button
                onClick={() => handleChartTypeChange(recommendedChartType)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Use Recommended
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {chartTypes.map((type) => {
            const Icon = type.icon
            const isRecommended = type.value === recommendedChartType
            const isSelected = selectedChartType === type.value
            
            return (
              <button
                key={type.value}
                onClick={() => handleChartTypeChange(type.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : isRecommended
                    ? 'border-blue-200 bg-blue-25 text-blue-600 hover:border-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{type.label}</span>
                {isRecommended && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border shadow-sm overflow-hidden">
        {/* Chart Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {selectedChartType === 'line' && 'Trend Analysis'}
            {selectedChartType === 'area' && 'Performance Trends'}
            {selectedChartType === 'bar' && 'Department Comparison'}
            {selectedChartType === 'pie' && 'Department Distribution'}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedChartType === 'line' && 'Track KPI performance over time to identify trends and patterns'}
            {selectedChartType === 'area' && 'Visualize cumulative performance trends across different time periods'}
            {selectedChartType === 'bar' && selectedKPI === 'all' && 'Compare department performance for the most important KPI'}
            {selectedChartType === 'bar' && selectedKPI !== 'all' && `Compare ${selectedKPI} performance across all departments`}
            {selectedChartType === 'pie' && 'See how performance is distributed across different departments'}
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm overflow-hidden">
          <h4 className="text-sm font-medium text-gray-600 break-words">Total Data Points</h4>
          <p className="text-2xl font-bold text-blue-600 break-words">{filteredData.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm overflow-hidden">
          <h4 className="text-sm font-medium text-gray-600 break-words">Average Value</h4>
          <p className="text-2xl font-bold text-green-600 break-words">
            {filteredData.length > 0 
              ? (filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length).toFixed(2)
              : '0'
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm overflow-hidden">
          <h4 className="text-sm font-medium text-gray-600 break-words">Departments</h4>
          <p className="text-2xl font-bold text-purple-600 break-words">
            {new Set(filteredData.map(item => item.department)).size}
          </p>
        </div>
      </div>

      {/* Insights */}
      {renderInsights()}

      {/* KPI Rankings */}
      {renderKPIRankings()}
    </div>
  )
}
