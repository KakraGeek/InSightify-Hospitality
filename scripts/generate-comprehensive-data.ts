import { writeFileSync } from 'fs'
import { join } from 'path'

interface ProcessedDataPoint {
  id: string
  department: string
  metric: string
  value: number
  unit: string
  date: string
  source: string
  confidence: number
}

interface KpiData {
  kpiName: string
  department: string
  value: number
  date: string
  period: string
  unit: string
}

interface StorageData {
  dataPoints: ProcessedDataPoint[]
  kpis: KpiData[]
  lastUpdated: string
}

function generateSampleData(): StorageData {
  const now = new Date()
  const dataPoints: ProcessedDataPoint[] = []
  const kpis: KpiData[] = []

  // Generate data points for all departments
  const departments = [
    'Front Office',
    'Food & Beverage', 
    'Housekeeping',
    'Maintenance/Engineering',
    'Sales & Marketing',
    'Finance',
    'HR'
  ]

  // Generate 7 days of data for each department
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(now.getTime() - (dayOffset * 24 * 60 * 60 * 1000))
    
    departments.forEach((dept, deptIndex) => {
      // Generate 3-4 data points per department per day
      const metricsPerDept = dept === 'Front Office' ? 4 : 3
      
      for (let i = 0; i < metricsPerDept; i++) {
        const metricNames = getMetricNamesForDepartment(dept)
        const metric = metricNames[i % metricNames.length]
        
        dataPoints.push({
          id: `dp_${deptIndex}_${dayOffset}_${i}`,
          department: dept,
          metric,
          value: generateRealisticValue(metric, dept),
          unit: getUnitForMetric(metric),
          date: currentDate.toISOString(),
          source: 'sample_data',
          confidence: 0.95
        })
      }
    })
  }

  // Calculate and store KPI values for each day
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(now.getTime() - (dayOffset * 24 * 60 * 60 * 1000))
    
    // Generate KPIs for all departments
    departments.forEach(dept => {
      const deptData = dataPoints.filter(dp => 
        dp.department === dept && 
        new Date(dp.date).toDateString() === currentDate.toDateString()
      )
      
      if (deptData.length > 0) {
        // Get all metrics for this department
        const metrics = getMetricNamesForDepartment(dept)
        
        metrics.forEach(metric => {
          const metricData = deptData.find(dp => dp.metric === metric)
          if (metricData) {
            // Create KPI name from metric
            const kpiName = getKpiNameFromMetric(metric, dept)
            const unit = getUnitForMetric(metric)
            
            kpis.push({
              kpiName,
              department: dept,
              value: metricData.value,
              date: currentDate.toISOString(),
              period: 'daily',
              unit
            })
          }
        })
      }
    })
  }

  return { dataPoints, kpis, lastUpdated: now.toISOString() }
}

function getMetricNamesForDepartment(department: string): string[] {
  const metrics = {
    'Front Office': ['Room Occupancy', 'Average Daily Rate', 'Revenue per Available Room', 'Guest Satisfaction'],
    'Food & Beverage': ['Daily Covers', 'Average Check Amount', 'Food Cost Percentage'],
    'Housekeeping': ['Rooms Cleaned', 'Cleaning Time per Room', 'Inspection Score'],
    'Maintenance/Engineering': ['Maintenance Requests', 'Response Time', 'Equipment Uptime'],
    'Sales & Marketing': ['Direct Bookings', 'Website Traffic', 'Conversion Rate'],
    'Finance': ['Daily Revenue', 'Operating Costs', 'Profit Margin'],
    'HR': ['Staff Count', 'Training Hours', 'Employee Satisfaction']
  }
  return metrics[department as keyof typeof metrics] || []
}

function generateRealisticValue(metric: string, department: string): number {
  const baseValues: Record<string, number> = {
    'Room Occupancy': 85,
    'Average Daily Rate': 300,
    'Revenue per Available Room': 255,
    'Guest Satisfaction': 4.2,
    'Daily Covers': 120,
    'Average Check Amount': 45,
    'Food Cost Percentage': 28,
    'Rooms Cleaned': 25,
    'Cleaning Time per Room': 30,
    'Inspection Score': 95,
    'Maintenance Requests': 8,
    'Response Time': 2.5,
    'Equipment Uptime': 98,
    'Direct Bookings': 65,
    'Website Traffic': 1500,
    'Conversion Rate': 4.5,
    'Daily Revenue': 15000,
    'Operating Costs': 8500,
    'Profit Margin': 43,
    'Staff Count': 45,
    'Training Hours': 120,
    'Employee Satisfaction': 4.1
  }
  
  const baseValue = baseValues[metric] || 100
  const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
  return Math.round(baseValue * (1 + variation) * 100) / 100
}

function getUnitForMetric(metric: string): string {
  const unitMap: Record<string, string> = {
    'Room Occupancy': '%',
    'Average Daily Rate': 'GHS',
    'Revenue per Available Room': 'GHS',
    'Guest Satisfaction': 'rating',
    'Daily Covers': 'count',
    'Average Check Amount': 'GHS',
    'Food Cost Percentage': '%',
    'Rooms Cleaned': 'rooms',
    'Cleaning Time per Room': 'minutes',
    'Inspection Score': '%',
    'Maintenance Requests': 'count',
    'Response Time': 'hours',
    'Equipment Uptime': '%',
    'Direct Bookings': '%',
    'Website Traffic': 'visitors',
    'Conversion Rate': '%',
    'Daily Revenue': 'GHS',
    'Operating Costs': 'GHS',
    'Profit Margin': '%',
    'Staff Count': 'employees',
    'Training Hours': 'hours',
    'Employee Satisfaction': 'rating'
  }
  return unitMap[metric] || 'units'
}

function getKpiNameFromMetric(metric: string, department: string): string {
  const kpiNameMap: Record<string, string> = {
    'Room Occupancy': 'Occupancy Rate',
    'Average Daily Rate': 'Average Daily Rate (ADR)',
    'Revenue per Available Room': 'Revenue per Available Room (RevPAR)',
    'Guest Satisfaction': 'Guest Satisfaction Score',
    'Daily Covers': 'Covers',
    'Average Check Amount': 'Average Check',
    'Food Cost Percentage': 'Food Cost %',
    'Rooms Cleaned': 'Rooms Cleaned per Shift',
    'Cleaning Time per Room': 'Average Cleaning Time',
    'Inspection Score': 'Inspection Pass Rate',
    'Maintenance Requests': 'Maintenance Requests',
    'Response Time': 'Mean Time To Repair (MTTR)',
    'Equipment Uptime': 'Equipment Uptime',
    'Direct Bookings': 'Direct Booking Ratio',
    'Website Traffic': 'Website Traffic',
    'Conversion Rate': 'Website Conversion Rate',
    'Daily Revenue': 'Daily Revenue',
    'Operating Costs': 'Operating Costs',
    'Profit Margin': 'Gross Operating Profit (GOP) Margin',
    'Staff Count': 'Staff Count',
    'Training Hours': 'Training Hours',
    'Employee Satisfaction': 'Employee Satisfaction Score'
  }
  return kpiNameMap[metric] || metric
}

async function main() {
  try {
    console.log('🚀 Generating comprehensive sample data...')
    
    const sampleData = generateSampleData()
    
    // Save to data storage file
    const storagePath = join(process.cwd(), '.data-storage.json')
    writeFileSync(storagePath, JSON.stringify(sampleData, null, 2))
    
    console.log('✅ Sample data generated successfully!')
    console.log(`📊 Data Points: ${sampleData.dataPoints.length}`)
    console.log(`📈 KPIs: ${sampleData.kpis.length}`)
    console.log(`📅 Date Range: ${new Date(sampleData.kpis[0]?.date || '').toLocaleDateString()} to ${new Date(sampleData.kpis[sampleData.kpis.length - 1]?.date || '').toLocaleDateString()}`)
    console.log(`💾 Saved to: ${storagePath}`)
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error)
    process.exit(1)
  }
}

main()
