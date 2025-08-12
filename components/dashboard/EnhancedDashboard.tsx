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
    return kpis.sort()
  }, [kpiData])

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (selectedChartType === 'pie') {
      // For pie chart, aggregate by department
      const deptTotals = filteredData.reduce((acc, item) => {
        acc[item.department] = (acc[item.department] || 0) + item.value
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(deptTotals).map(([dept, total]) => ({
        name: dept,
        value: total
      }))
    } else {
      // For time-series charts (line, area, bar), create a proper multi-series structure
      const kpisToShow = availableKPIs.slice(0, 5) // Limit to 5 KPIs for readability
      
      // Create a dataset where each KPI has its own series
      // We'll use the KPI name as the dataKey and create a flat structure
      const multiSeriesData = filteredData
        .filter(item => kpisToShow.includes(item.kpiName))
        .map(item => ({
          date: item.date,
          [item.kpiName]: item.value,
          department: item.department
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return multiSeriesData
    }
  }, [filteredData, selectedChartType, availableKPIs])

  // Create separate data series for each KPI (for better line/area chart rendering)
  const kpiSeriesData = useMemo(() => {
    if (selectedChartType === 'pie') return []
    
    const kpisToShow = availableKPIs.slice(0, 5)
    
    return kpisToShow.map(kpiName => {
      const kpiData = filteredData
        .filter(item => item.kpiName === kpiName)
        .map(item => ({
          date: item.date,
          value: item.value,
          kpiName: item.kpiName
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return {
        name: kpiName,
        data: kpiData
      }
    })
  }, [filteredData, selectedChartType, availableKPIs])

  // Generate colors for charts
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

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
            {kpiSeriesData.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                data={series.data}
                dataKey="value"
                name={series.name}
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
            {kpiSeriesData.map((series, index) => (
              <Area
                key={series.name}
                type="monotone"
                data={series.data}
                dataKey="value"
                name={series.name}
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
        return (
          <BarChart {...commonProps}>
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
              <Bar
                key={kpi}
                dataKey={kpi}
                fill={colors[index % colors.length]}
                isAnimationActive={true}
              />
            ))}
          </BarChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      
      default:
        return <div>Select a chart type</div>
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedChartType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedChartType(type.value)}
            className="flex items-center gap-2 min-w-0 whitespace-nowrap"
          >
            <type.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border shadow-sm overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 break-words">
            {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
          </h3>
          {selectedKPI !== 'all' && (
            <p className="text-sm text-gray-600 mt-1 break-words">
              KPI: {selectedKPI}
            </p>
          )}
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
    </div>
  )
}
