import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Comprehensive data generation for all departments
const STORAGE_FILE = join(process.cwd(), '.data-storage.json')

interface ProcessedDataPoint {
  department: string
  dataType: string
  value: number
  textValue: string | null
  date: string
  source: string
  sourceFile: string
  metadata: {
    extractedFrom: string
  }
}

interface KpiData {
  kpiName: string
  department: string
  value: number
  date: string
  period: string
  unit?: string
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

  // Front Office Data
  const frontOfficeData = [
    { dataType: 'occupancy_rate', value: 87.5, unit: '%' },
    { dataType: 'available_rooms', value: 50, unit: 'rooms' },
    { dataType: 'occupied_rooms', value: 43.75, unit: 'rooms' },
    { dataType: 'room_revenue', value: 13125, unit: 'GHS' },
    { dataType: 'guest_count', value: 16, unit: 'guests' },
    { dataType: 'booking_count', value: 12, unit: 'bookings' },
    { dataType: 'cancellation_count', value: 2, unit: 'cancellations' },
    { dataType: 'no_show_count', value: 1, unit: 'no-shows' }
  ]

  frontOfficeData.forEach((item, index) => {
    dataPoints.push({
      department: 'Front Office',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'pdf',
      sourceFile: 'front-office-report.pdf',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Food & Beverage Data
  const fBData = [
    { dataType: 'covers', value: 156, unit: 'guests' },
    { dataType: 'f_b_revenue', value: 23400, unit: 'GHS' },
    { dataType: 'food_cost', value: 8190, unit: 'GHS' },
    { dataType: 'beverage_cost', value: 4680, unit: 'GHS' },
    { dataType: 'table_turnover', value: 3.2, unit: 'turns/hour' },
    { dataType: 'waste_cost', value: 1170, unit: 'GHS' },
    { dataType: 'void_comp_value', value: 468, unit: 'GHS' },
    { dataType: 'available_seat_hours', value: 120, unit: 'seat-hours' }
  ]

  fBData.forEach((item, index) => {
    dataPoints.push({
      department: 'Food & Beverage',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'csv',
      sourceFile: 'f-b-daily-report.csv',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Housekeeping Data
  const housekeepingData = [
    { dataType: 'rooms_cleaned', value: 45, unit: 'rooms' },
    { dataType: 'cleaning_time_avg', value: 25, unit: 'minutes' },
    { dataType: 'inspection_pass_rate', value: 96, unit: '%' },
    { dataType: 'linen_usage', value: 180, unit: 'pieces' },
    { dataType: 'amenity_consumption', value: 135, unit: 'items' },
    { dataType: 'maintenance_requests', value: 3, unit: 'requests' },
    { dataType: 'cleaning_supplies_cost', value: 450, unit: 'GHS' },
    { dataType: 'staff_hours', value: 120, unit: 'hours' }
  ]

  housekeepingData.forEach((item, index) => {
    dataPoints.push({
      department: 'Housekeeping',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'xlsx',
      sourceFile: 'housekeeping-report.xlsx',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Maintenance/Engineering Data
  const maintenanceData = [
    { dataType: 'mttr', value: 2.5, unit: 'hours' },
    { dataType: 'mtbf', value: 168, unit: 'hours' },
    { dataType: 'pm_compliance_rate', value: 92, unit: '%' },
    { dataType: 'equipment_uptime', value: 98.5, unit: '%' },
    { dataType: 'energy_consumption', value: 1250, unit: 'kWh' },
    { dataType: 'maintenance_cost', value: 3200, unit: 'GHS' },
    { dataType: 'work_orders_completed', value: 18, unit: 'orders' },
    { dataType: 'preventive_maintenance_tasks', value: 15, unit: 'tasks' }
  ]

  maintenanceData.forEach((item, index) => {
    dataPoints.push({
      department: 'Maintenance/Engineering',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'pdf',
      sourceFile: 'maintenance-report.pdf',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Sales & Marketing Data
  const salesData = [
    { dataType: 'direct_bookings', value: 28, unit: 'bookings' },
    { dataType: 'total_bookings', value: 35, unit: 'bookings' },
    { dataType: 'website_sessions', value: 1250, unit: 'sessions' },
    { dataType: 'conversion_rate', value: 2.8, unit: '%' },
    { dataType: 'ad_spend', value: 5000, unit: 'GHS' },
    { dataType: 'attributed_revenue', value: 87500, unit: 'GHS' },
    { dataType: 'email_open_rate', value: 24.5, unit: '%' },
    { dataType: 'social_media_engagement', value: 8.7, unit: '%' }
  ]

  salesData.forEach((item, index) => {
    dataPoints.push({
      department: 'Sales & Marketing',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'csv',
      sourceFile: 'sales-marketing-report.csv',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Finance Data
  const financeData = [
    { dataType: 'total_revenue', value: 156500, unit: 'GHS' },
    { dataType: 'gross_operating_profit', value: 46950, unit: 'GHS' },
    { dataType: 'operating_expenses', value: 109550, unit: 'GHS' },
    { dataType: 'available_rooms', value: 50, unit: 'rooms' },
    { dataType: 'net_profit_margin', value: 30, unit: '%' },
    { dataType: 'debt_service_coverage', value: 2.8, unit: 'ratio' },
    { dataType: 'cash_flow', value: 35200, unit: 'GHS' },
    { dataType: 'inventory_turnover', value: 4.2, unit: 'times' }
  ]

  financeData.forEach((item, index) => {
    dataPoints.push({
      department: 'Finance',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'xlsx',
      sourceFile: 'finance-report.xlsx',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // HR Data
  const hrData = [
    { dataType: 'total_staff', value: 45, unit: 'employees' },
    { dataType: 'available_rooms', value: 50, unit: 'rooms' },
    { dataType: 'separations', value: 2, unit: 'employees' },
    { dataType: 'average_headcount', value: 43, unit: 'employees' },
    { dataType: 'unplanned_absence_hours', value: 86, unit: 'hours' },
    { dataType: 'scheduled_hours', value: 1720, unit: 'hours' },
    { dataType: 'training_hours', value: 215, unit: 'hours' },
    { dataType: 'employee_satisfaction', value: 4.2, unit: '/5' }
  ]

  hrData.forEach((item, index) => {
    dataPoints.push({
      department: 'HR',
      dataType: item.dataType,
      value: item.value,
      textValue: null,
      date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      source: 'pdf',
      sourceFile: 'hr-report.pdf',
      metadata: {
        extractedFrom: `${item.dataType}: ${item.value}${item.unit}`
      }
    })
  })

  // Calculate and store KPI values for all departments
  const calculateKPIs = () => {
    // Front Office KPIs
    const occupancyRate = (43.75 / 50) * 100
    const adr = 13125 / 43.75
    const revpar = 13125 / 50

    kpis.push(
      { kpiName: 'Occupancy Rate', department: 'Front Office', value: occupancyRate, date: new Date(now.getTime() - (0 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'Average Daily Rate (ADR)', department: 'Front Office', value: adr, date: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/room' },
      { kpiName: 'Revenue per Available Room (RevPAR)', department: 'Front Office', value: revpar, date: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/room' },
      { kpiName: 'Cancellation Rate', department: 'Front Office', value: (2 / 12) * 100, date: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'No-Show Rate', department: 'Front Office', value: (1 / 12) * 100, date: new Date(now.getTime() - (4 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' }
    )

    // Food & Beverage KPIs
    const avgCheck = 23400 / 156
    const foodCostPercent = (8190 / 23400) * 100
    const revpash = 23400 / 120

    kpis.push(
      { kpiName: 'Covers', department: 'Food & Beverage', value: 156, date: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'count' },
      { kpiName: 'Average Check', department: 'Food & Beverage', value: avgCheck, date: new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/guest' },
      { kpiName: 'Food Cost %', department: 'Food & Beverage', value: foodCostPercent, date: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'RevPASH', department: 'Food & Beverage', value: revpash, date: new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/seat-hour' },
      { kpiName: 'Table Turnover Rate', department: 'Food & Beverage', value: 3.2, date: new Date(now.getTime() - (9 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'turns/hour' }
    )

    // Housekeeping KPIs
    kpis.push(
      { kpiName: 'Rooms Cleaned per Shift', department: 'Housekeeping', value: 45, date: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'rooms' },
      { kpiName: 'Average Cleaning Time', department: 'Housekeeping', value: 25, date: new Date(now.getTime() - (11 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'minutes' },
      { kpiName: 'Inspection Pass Rate', department: 'Housekeeping', value: 96, date: new Date(now.getTime() - (12 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' }
    )

    // Maintenance KPIs
    kpis.push(
      { kpiName: 'Mean Time To Repair (MTTR)', department: 'Maintenance/Engineering', value: 2.5, date: new Date(now.getTime() - (13 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'hours' },
      { kpiName: 'Mean Time Between Failures (MTBF)', department: 'Maintenance/Engineering', value: 168, date: new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'hours' },
      { kpiName: 'PM Compliance Rate', department: 'Maintenance/Engineering', value: 92, date: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' }
    )

    // Sales & Marketing KPIs
    const directBookingRatio = (28 / 35) * 100
    const roas = 87500 / 5000

    kpis.push(
      { kpiName: 'Direct Booking Ratio', department: 'Sales & Marketing', value: directBookingRatio, date: new Date(now.getTime() - (16 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'Website Conversion Rate', department: 'Sales & Marketing', value: 2.8, date: new Date(now.getTime() - (17 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'Return on Ad Spend (ROAS)', department: 'Sales & Marketing', value: roas, date: new Date(now.getTime() - (18 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'x' }
    )

    // Finance KPIs
    const gopMargin = (46950 / 156500) * 100
    const goppar = 46950 / 50
    const trevpar = 156500 / 50

    kpis.push(
      { kpiName: 'Gross Operating Profit (GOP) Margin', department: 'Finance', value: gopMargin, date: new Date(now.getTime() - (19 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'GOPPAR', department: 'Finance', value: goppar, date: new Date(now.getTime() - (20 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/room' },
      { kpiName: 'Total RevPAR (TRevPAR)', department: 'Finance', value: trevpar, date: new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'GHS/room' }
    )

    // HR KPIs
    const staffToRoomRatio = 45 / 50
    const turnoverRate = (2 / 43) * 100
    const absenteeismRate = (86 / 1720) * 100

    kpis.push(
      { kpiName: 'Staff-to-Room Ratio', department: 'HR', value: staffToRoomRatio, date: new Date(now.getTime() - (22 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: 'staff/room' },
      { kpiName: 'Employee Turnover Rate', department: 'HR', value: turnoverRate, date: new Date(now.getTime() - (23 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' },
      { kpiName: 'Absenteeism Rate', department: 'HR', value: absenteeismRate, date: new Date(now.getTime() - (24 * 24 * 60 * 60 * 1000)).toISOString(), period: 'daily', unit: '%' }
    )
  }

  calculateKPIs()

  return {
    dataPoints,
    kpis,
    lastUpdated: now.toISOString()
  }
}

function main() {
  console.log('🚀 Generating comprehensive sample data for all departments...')
  
  const data = generateSampleData()
  
  console.log(`📊 Generated ${data.dataPoints.length} data points across all departments`)
  console.log(`📈 Generated ${data.kpis.length} KPI values across all departments`)
  
  // Save to storage file
  writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2))
  
  console.log(`💾 Data saved to ${STORAGE_FILE}`)
  console.log('✅ Comprehensive data generation complete!')
  
  // Show summary by department
  const deptSummary = data.kpis.reduce((acc, kpi) => {
    acc[kpi.department] = (acc[kpi.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n📋 KPI Summary by Department:')
  Object.entries(deptSummary).forEach(([dept, count]) => {
    console.log(`  ${dept}: ${count} KPIs`)
  })
}

if (require.main === module) {
  main()
}
