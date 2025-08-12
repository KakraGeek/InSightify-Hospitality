import { getDb } from '../db'
import { reports, reportItems } from '../../db/schema/reports'
import { ProcessedDataPoint } from './dataProcessor'
import { KpiCalculationResult } from '../../kpi/engine'
import { eq, and, gte, desc } from 'drizzle-orm'

export interface ReportCreationInput {
  title: string
  description?: string
  department: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
  startDate: string // Database expects YYYY-MM-DD string format
  endDate: string // Database expects YYYY-MM-DD string format
  createdBy: string
  isPublic?: boolean
}

export interface ReportItemInput {
  reportId: string
  kpiName: string
  kpiCategory: string
  value?: number
  textValue?: string
  unit: string
  date: string // Database expects YYYY-MM-DD string format
  period: string
  source: string
  sourceFile?: string
  confidence?: number
  notes?: string
  metadata?: Record<string, unknown>
}

/**
 * Report Storage Service for managing reports and KPI data
 */
export class ReportStorageService {
  /**
   * Create a new report
   */
  static async createReport(input: ReportCreationInput): Promise<string> {
    try {
      const db = getDb()
      const [report] = await db.insert(reports).values({
        title: input.title,
        description: input.description,
        department: input.department,
        reportType: input.reportType,
        startDate: input.startDate,
        endDate: input.endDate,
        createdBy: input.createdBy,
        isPublic: input.isPublic || false,
        status: 'draft',
      }).returning({ id: reports.id })

      console.log(`📊 Report created: ${report.id} for ${input.department}`)
      return report.id
    } catch (error) {
      console.error('Failed to create report:', error)
      throw error
    }
  }

  /**
   * Add KPI items to a report
   */
  static async addReportItems(items: ReportItemInput[]): Promise<number> {
    try {
      if (!items || items.length === 0) {
        console.log('📊 No items to add (empty array)')
        return 0
      }
      
      const db = getDb()
      // Convert ReportItemInput to the exact format expected by Drizzle
      const dbItems = items.map(item => ({
        reportId: item.reportId,
        kpiName: item.kpiName,
        kpiCategory: item.kpiCategory,
        value: item.value !== undefined ? item.value.toString() : null, // Convert to string for decimal field
        textValue: item.textValue,
        unit: item.unit,
        date: item.date,
        period: item.period,
        source: item.source,
        sourceFile: item.sourceFile,
        confidence: item.confidence !== undefined ? item.confidence.toString() : null, // Convert to string for decimal field
        notes: item.notes,
        metadata: item.metadata,
      }))
      
      await db.insert(reportItems).values(dbItems)
      console.log(`📊 Added ${items.length} report items`)
      return items.length
    } catch (error) {
      console.error('Failed to add report items:', error)
      throw error
    }
  }

  /**
   * Check for existing data to avoid duplicates
   */
  private static async checkForDuplicates(
    dataPoints: ProcessedDataPoint[]
  ): Promise<{ newData: ProcessedDataPoint[], duplicates: ProcessedDataPoint[], existingData: Array<{ kpiName: string; date: string; value: string | null }> }> {
    try {
      if (dataPoints.length === 0) {
        return { newData: [], duplicates: [], existingData: [] }
      }
      
      const department = dataPoints[0].department
      console.log(`🔍 checkForDuplicates: Checking ${dataPoints.length} data points for duplicates in ${department}`)
      
      const { getDb } = await import('../db')
      const db = getDb()
      
      // Get existing data for this department and date range
      const existingData = await db
        .select({
          kpiName: reportItems.kpiName,
          value: reportItems.value,
          date: reportItems.date,
          unit: reportItems.unit,
        })
        .from(reportItems)
        .innerJoin(reports, eq(reportItems.reportId, reports.id))
        .where(and(
          eq(reports.department, department),
          gte(reportItems.date, new Date().toISOString().split('T')[0])
        ))
        .orderBy(desc(reportItems.date), desc(reportItems.kpiName))
      
      const existing = existingData
      console.log(`🔍 checkForDuplicates: Found ${existing.length} existing data points`)
      
      const newData: ProcessedDataPoint[] = []
      const duplicates: ProcessedDataPoint[] = []
      
      for (const dataPoint of dataPoints) {
        const mappedKpiName = this.mapDataTypeToKPIName(dataPoint.dataType, dataPoint.department)
        const dataDate = new Date(dataPoint.date).toISOString().split('T')[0]
        
        // Check if this KPI already exists for this date and department
        const isDuplicate = existing.some((item: { kpiName: string; date: string; value: string | null }) => {
          const itemDate = new Date(item.date).toISOString().split('T')[0]
          return item.kpiName === mappedKpiName && 
                 itemDate === dataDate &&
                 Math.abs(Number(item.value) - Number(dataPoint.value)) < 0.01 // Allow small rounding differences
        })
        
        if (isDuplicate) {
          console.log(`🔍 checkForDuplicates: Duplicate found for ${mappedKpiName} on ${dataDate}`)
          duplicates.push(dataPoint)
        } else {
          console.log(`🔍 checkForDuplicates: New data for ${mappedKpiName} on ${dataDate}`)
          newData.push(dataPoint)
        }
      }
      
      console.log(`🔍 checkForDuplicates: ${newData.length} new data points, ${duplicates.length} duplicates`)
      return { newData, duplicates, existingData: existing }
      
    } catch (error) {
      console.error('❌ checkForDuplicates: Error checking for duplicates:', error)
      // If duplicate check fails, treat all data as new
      return { newData: dataPoints, duplicates: [], existingData: [] }
    }
  }

  /**
   * Store processed data as report with duplicate handling
   */
  static async storeProcessedDataAsReport(
    dataPoints: ProcessedDataPoint[],
    defaultDepartment: string,
    userId: string,
    sourceFile?: string
  ): Promise<{ reportId: string; storedCount: number; skippedCount: number; duplicates: ProcessedDataPoint[] }> {
    try {
      console.log(`📊 Storing ${dataPoints.length} data points as report(s)`)

      // Group data points by department
      const dataByDepartment: Record<string, ProcessedDataPoint[]> = {}
      dataPoints.forEach(dp => {
        const dept = dp.department || defaultDepartment
        if (!dataByDepartment[dept]) {
          dataByDepartment[dept] = []
        }
        dataByDepartment[dept].push(dp)
      })

      console.log(`📊 Data grouped by department:`, Object.keys(dataByDepartment).map(dept => `${dept}: ${dataByDepartment[dept].length} items`))

      let totalStored = 0
      let mainReportId = ''

      // Create separate reports for each department
      for (const [department, deptDataPoints] of Object.entries(dataByDepartment)) {
        console.log(`📊 Creating report for ${department} with ${deptDataPoints.length} data points`)

        // Check for duplicates in this department's data
        const { newData, duplicates, existingData } = await this.checkForDuplicates(deptDataPoints)
        const dataPointsToStore = newData

        if (duplicates.length > 0) {
          console.warn(`📊 Found ${duplicates.length} duplicate data points for ${department}. Skipping duplicates.`)
          console.log(`📊 Original duplicates:`, duplicates.map(dp => `${dp.dataType} on ${dp.date}`))
          console.log(`📊 Existing data for duplicates:`, existingData.map(item => `${item.kpiName} on ${item.date}`))
        }

        // Create report for this department
        const reportId = await this.createReport({
          title: `${department} Data Report - ${new Date().toLocaleDateString()}`,
          description: `Automatically generated report from ${sourceFile || 'data ingestion'}`,
          department,
          reportType: 'daily',
          startDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
          endDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
          createdBy: userId,
          isPublic: false,
        })

        // Store the first report ID as the main one for backward compatibility
        if (!mainReportId) {
          mainReportId = reportId
        }

        // Convert data points to report items for this department
        const reportItems: ReportItemInput[] = dataPointsToStore.map(dp => {
          const mappedKpiName = this.mapDataTypeToKPIName(dp.dataType, dp.department)
          console.log(`🔍 storeProcessedDataAsReport: Mapping "${dp.dataType}" → "${mappedKpiName}" for ${dp.department}`)
          
          return {
            reportId,
            kpiName: mappedKpiName, // Map to proper KPI name
            kpiCategory: this.mapDataTypeToCategory(mappedKpiName),
            value: dp.value || undefined,
            textValue: dp.textValue || undefined,
            unit: this.mapDataTypeToUnit(mappedKpiName),
            date: new Date(dp.date).toISOString().split('T')[0], // Convert to YYYY-MM-DD string
            period: 'daily',
            source: dp.source,
            sourceFile: dp.sourceFile,
            confidence: 0.9, // Default confidence for ingested data
            notes: `Ingested from ${dp.source}`,
            metadata: {
              originalDataType: dp.dataType,
              department: dp.department,
              ingestionTimestamp: new Date().toISOString(),
            }
          }
        })

        // Store report items for this department
        await this.addReportItems(reportItems)
        totalStored += dataPointsToStore.length

        console.log(`📊 Successfully stored ${dataPointsToStore.length} data points in report ${reportId} for ${department}`)
      }

      // Track total duplicates across all departments
      let totalDuplicates = 0
      let allDuplicates: ProcessedDataPoint[] = []
      
      for (const [, deptDataPoints] of Object.entries(dataByDepartment)) {
        const { duplicates } = await this.checkForDuplicates(deptDataPoints)
        totalDuplicates += duplicates.length
        allDuplicates.push(...duplicates)
      }
      
      console.log(`📊 Successfully stored ${totalStored} total data points across ${Object.keys(dataByDepartment).length} departments`)
      console.log(`📊 Skipped ${totalDuplicates} duplicate data points`)
      
      return { 
        reportId: mainReportId, 
        storedCount: totalStored, 
        skippedCount: totalDuplicates, 
        duplicates: allDuplicates 
      }
    } catch (error) {
      console.error('Failed to store processed data as report:', error)
      throw error
    }
  }

  /**
   * Store calculated KPI results
   */
  static async storeCalculatedKPIs(
    kpiResults: KpiCalculationResult[],
    department: string,
    userId: string
  ): Promise<{ reportId: string; storedCount: number }> {
    try {
      console.log(`📊 Storing ${kpiResults.length} calculated KPIs for ${department}`)

      // Create report for calculated KPIs
      const reportId = await this.createReport({
        title: `${department} KPI Report - ${new Date().toLocaleDateString()}`,
        description: 'Automatically generated KPI calculation report',
        department,
        reportType: 'daily',
        startDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
        endDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
        createdBy: userId,
        isPublic: false,
      })

      // Convert KPI results to report items
      const reportItems: ReportItemInput[] = kpiResults.map(kpi => ({
        reportId,
        kpiName: kpi.kpiName,
        kpiCategory: this.mapKpiNameToCategory(kpi.kpiName),
        value: kpi.value,
        unit: kpi.unit,
        date: typeof kpi.date === 'string' ? kpi.date : kpi.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD string
        period: kpi.period,
        source: 'calculated',
        confidence: kpi.confidence,
        notes: `Calculated using ${kpi.metadata.calculationMethod}`,
        metadata: kpi.metadata,
      }))

      // Store report items
      await this.addReportItems(reportItems)

      console.log(`📊 Successfully stored ${kpiResults.length} calculated KPIs in report ${reportId}`)
      return { reportId, storedCount: kpiResults.length }
    } catch (error) {
      console.error('Failed to store calculated KPIs:', error)
      throw error
    }
  }

  /**
   * Get KPI values for a department
   */
  static async getKPIValues(department?: string): Promise<Array<{
    kpiName: string;
    department: string;
    value: number | null;
    date: string;
    unit: string;
    period: string;
  }>> {
    try {
      console.log(`🔍 getKPIValues called for department: ${department || 'all'}`)

      const db = getDb()
      
      // First, let's check what's in the reports table
      const reportsCheck = await db.select().from(reports)
      console.log(`🔍 getKPIValues: Found ${reportsCheck.length} reports in database:`, reportsCheck.map(r => ({ id: r.id, title: r.title, department: r.department })))
      
      // Then check what's in the reportItems table
      const itemsCheck = await db.select().from(reportItems)
      console.log(`🔍 getKPIValues: Found ${itemsCheck.length} report items in database:`, itemsCheck.map(i => ({ id: i.id, reportId: i.reportId, kpiName: i.kpiName })))
      
      // Log sample KPI names to see what's actually stored
      const sampleKpiNames = itemsCheck.slice(0, 20).map(i => i.kpiName)
      console.log(`🔍 getKPIValues: Sample KPI names in database:`, sampleKpiNames)
      
      // Log unique KPI names to see the full picture
      const uniqueKpiNames = Array.from(new Set(itemsCheck.map(i => i.kpiName)))
      console.log(`🔍 getKPIValues: Unique KPI names in database (${uniqueKpiNames.length}):`, uniqueKpiNames)
      
      if (department) {
        const results = await db
          .select({
            id: reportItems.id,
            kpiName: reportItems.kpiName,
            department: reports.department,
            value: reportItems.value,
            unit: reportItems.unit,
            date: reportItems.date,
            period: reportItems.period,
            source: reportItems.source,
            confidence: reportItems.confidence,
            notes: reportItems.notes,
            createdAt: reportItems.createdAt,
          })
          .from(reportItems)
          .innerJoin(reports, eq(reportItems.reportId, reports.id))
          .where(eq(reports.department, department))
          .orderBy(desc(reportItems.createdAt))

        console.log(`🔍 getKPIValues: Query executed, got ${results.length} results`)
        
        // Apply runtime KPI name mapping to fix incorrect names and transform data
        const mappedResults = results.map(item => ({
          kpiName: this.mapStoredKPIName(item.kpiName),
          department: item.department,
          value: item.value ? parseFloat(item.value) : null,
          date: item.date,
          unit: item.unit,
          period: item.period
        }))
        
        return mappedResults
      } else {
        const results = await db
          .select({
            id: reportItems.id,
            kpiName: reportItems.kpiName,
            department: reports.department,
            value: reportItems.value,
            unit: reportItems.unit,
            date: reportItems.date,
            period: reportItems.period,
            source: reportItems.source,
            confidence: reportItems.confidence,
            notes: reportItems.notes,
            createdAt: reportItems.createdAt,
          })
          .from(reportItems)
          .innerJoin(reports, eq(reportItems.reportId, reports.id))
          .orderBy(desc(reportItems.createdAt))

        console.log(`🔍 getKPIValues: Query executed, got ${results.length} results`)
        
        // Apply runtime KPI name mapping to fix incorrect names and transform data
        const mappedResults = results.map(item => ({
          kpiName: this.mapStoredKPIName(item.kpiName),
          department: item.department,
          value: item.value ? parseFloat(item.value) : null,
          date: item.date,
          unit: item.unit,
          period: item.period
        }))
        
        return mappedResults
      }
    } catch (error) {
      console.error(`Failed to get KPI values: ${error}`)
      return []
    }
  }

  /**
   * Get recent data for a department
   */
  static async getRecentData(department: string, limit: number = 10): Promise<Array<{
    id: string;
    kpiName: string;
    value: string | null;
    unit: string;
    date: string;
    source: string;
    createdAt: Date;
  }>> {
    try {
      const db = getDb()
      const results = await db
        .select({
          id: reportItems.id,
          kpiName: reportItems.kpiName,
          value: reportItems.value,
          unit: reportItems.unit,
          date: reportItems.date,
          source: reportItems.source,
          createdAt: reportItems.createdAt,
        })
        .from(reportItems)
        .innerJoin(reports, eq(reportItems.reportId, reports.id))
        .where(eq(reports.department, department))
        .orderBy(desc(reportItems.createdAt))
        .limit(limit)

      console.log(`📊 Returning ${results.length} recent data points for ${department}`)
      return results
    } catch (error) {
      console.error(`Failed to get recent data: ${error}`)
      return []
    }
  }

  /**
   * Get reports for a department
   */
  static async getReports(department?: string, limit: number = 20): Promise<Array<{
    id: string;
    title: string;
    description: string | null;
    department: string;
    reportType: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    isPublic: boolean | null;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
    metadata?: unknown;
  }>> {
    try {
      const db = getDb()
      
      if (department) {
        const results = await db
          .select()
          .from(reports)
          .where(eq(reports.department, department))
          .orderBy(desc(reports.createdAt))
          .limit(limit)
        
        console.log(`📊 Returning ${results.length} reports`)
        return results
      } else {
        const results = await db
          .select()
          .from(reports)
          .orderBy(desc(reports.createdAt))
          .limit(limit)
        
        console.log(`📊 Returning ${results.length} reports`)
        return results
      }
    } catch (error) {
      console.error(`Failed to get reports: ${error}`)
      return []
    }
  }

  /**
   * Find exact KPI name match for CSV metric names
   */
  private static findExactKPIMatch(dataType: string, department: string): string | null {
    // Direct mapping for CSV metric names to KPI names
    const exactMappings: Record<string, Record<string, string>> = {
      'Front Office': {
        'Occupancy Rate': 'Occupancy Rate',
        'Guest Count': 'Guest Count',
        'Average Daily Rate': 'Average Daily Rate (ADR)',
        'Revenue per Available Room': 'Revenue per Available Room (RevPAR)',
        'Booking Lead Time': 'Booking Lead Time',
        'Cancellation Rate': 'Cancellation Rate',
        'No-Show Rate': 'No-Show Rate',
        'Guest Satisfaction': 'Guest Satisfaction Score'
      },
      'Food & Beverage': {
        'Food Cost': 'Food Cost %',
        'Beverage Cost': 'Beverage Cost %',
        'Covers': 'Covers',
        'Average Check': 'Average Check',
        'Table Turnover': 'Table Turnover Rate',
        'Waste': 'Waste %',
        'Void/Comp': 'Void/Comp %',
        'Food Revenue': 'Food Revenue',
        'Beverage Revenue': 'Beverage Revenue',
        'RevPASH': 'RevPASH'
      },
      'Housekeeping': {
        'Rooms Cleaned': 'Rooms Cleaned per Shift',
        'Cleaning Time': 'Average Cleaning Time',
        'Room Turnaround': 'Room Turnaround Time',
        'Inspection Pass Rate': 'Inspection Pass Rate',
        'Out-of-Order': 'Out-of-Order %',
        'Linen Cost': 'Linen Cost per Occupied Room',
        'Guest Room Defect Rate': 'Guest Room Defect Rate',
        'Chemical Cost': 'Chemical Cost per Occupied Room',
        'HK Staff Efficiency': 'HK Staff Efficiency'
      },
      'Maintenance/Engineering': {
        'Maintenance Cost': 'Maintenance Cost per Room',
        'Energy Consumption': 'Energy Consumption (kWh)',
        'Equipment Uptime': 'Equipment Uptime %',
        'Preventive Maintenance': 'Preventive Maintenance %',
        'Response Time': 'Response Time (minutes)',
        'Work Order Completion': 'Work Order Completion %',
        'Vendor Performance': 'Vendor Performance (1-5)',
        'Safety Incidents': 'Safety Incidents',
        'Energy Efficiency': 'Energy Efficiency %',
        'Maintenance Staff Efficiency': 'Maintenance Staff Efficiency %'
      },
      'Sales & Marketing': {
        'Conversion Rate': 'Website Conversion Rate',
        'Lead Generation': 'Lead Generation',
        'Customer Acquisition Cost': 'Customer Acquisition Cost',
        'Email Open Rate': 'Email Open Rate',
        'Click Through Rate': 'Click Through Rate',
        'Social Media Engagement': 'Social Media Engagement',
        'Website Traffic': 'Website Traffic',
        'Booking Conversion': 'Booking Conversion Rate',
        'Customer Lifetime Value': 'Customer Lifetime Value',
        'Marketing ROI': 'Marketing ROI'
      },
      'Finance': {
        'Profit Margin': 'Gross Operating Profit (GOP) Margin',
        'Operating Expenses': 'Operating Expenses',
        'Cash Flow': 'Cash Flow',
        'Debt to Equity': 'Debt to Equity Ratio',
        'Return on Investment': 'Return on Investment (ROI)',
        'Accounts Receivable': 'Accounts Receivable',
        'Accounts Payable': 'Accounts Payable',
        'Inventory Turnover': 'Inventory Turnover',
        'Working Capital': 'Working Capital',
        'Cost per Room': 'Cost per Available Room'
      },
      'HR': {
        'Employee Turnover': 'Employee Turnover Rate',
        'Training Completion': 'Training Completion Rate',
        'Employee Satisfaction': 'Employee Satisfaction Score',
        'Time to Hire': 'Time to Hire',
        'Cost per Hire': 'Cost per Hire',
        'Productivity per Employee': 'Employee Productivity',
        'Absenteeism Rate': 'Absenteeism Rate',
        'Training Cost': 'Training Cost per Employee',
        'Performance Rating': 'Employee Performance Rating',
        'Retention Rate': 'Employee Retention Rate'
      }
    }

    const deptMappings = exactMappings[department]
    if (deptMappings && deptMappings[dataType]) {
      console.log(`🔍 findExactKPIMatch: Found exact match for "${dataType}" in ${department}: "${deptMappings[dataType]}"`)
      return deptMappings[dataType]
    }

    // If no exact match, try fuzzy matching for common variations
    const fuzzyMatches = this.findFuzzyKPIMatch(dataType, department)
    if (fuzzyMatches) {
      console.log(`🔍 findExactKPIMatch: Found fuzzy match for "${dataType}" in ${department}: "${fuzzyMatches}"`)
      return fuzzyMatches
    }

    console.log(`🔍 findExactKPIMatch: No match found for "${dataType}" in ${department}`)
    return null
  }

  /**
   * Find fuzzy KPI name match for variations and abbreviations
   */
  private static findFuzzyKPIMatch(dataType: string, department: string): string | null {
    // Common variations and abbreviations
    const fuzzyMappings: Record<string, Record<string, string[]>> = {
      'Front Office': {
        'Average Daily Rate': ['Average Daily Rate (ADR)', 'ADR'],
        'Revenue per Available Room': ['Revenue per Available Room (RevPAR)', 'RevPAR'],
        'Revenue Generation Index': ['Revenue Generation Index (RGI)', 'RGI'],
        'Average Length of Stay': ['Average Length of Stay (ALOS)', 'ALOS'],
        'Direct Booking Ratio': ['Direct Booking Ratio', 'Direct Bookings %'],
        'Website Conversion Rate': ['Website Conversion Rate', 'Conversion Rate'],
        'Cost per Acquisition': ['Cost per Acquisition (CPA)', 'CPA'],
        'Return on Ad Spend': ['Return on Ad Spend (ROAS)', 'ROAS'],
        'Forecast Accuracy': ['Forecast Accuracy (MAPE)', 'MAPE'],
        'Group Booking Conversion Rate': ['Group Booking Conversion Rate', 'Group Conversion %'],
        'Upsell Attach Rate': ['Upsell Attach Rate', 'Upsell Rate'],
        'Email CTR': ['Email CTR', 'Email Click-Through Rate'],
        'Social Media Engagement': ['Social Media Engagement', 'Social Engagement'],
        'Brand Awareness Score': ['Brand Awareness Score', 'Brand Awareness']
      },
      'Food & Beverage': {
        'Food Cost': ['Food Cost %', 'Food Cost Percentage'],
        'Beverage Cost': ['Beverage Cost %', 'Beverage Cost Percentage'],
        'Table Turnover': ['Table Turnover Rate', 'Table Turnover'],
        'Waste': ['Waste %', 'Waste Percentage'],
        'Void/Comp': ['Void/Comp %', 'Void/Comp Percentage'],
        'RevPASH': ['RevPASH', 'Revenue per Available Seat Hour']
      },
      'Housekeeping': {
        'Rooms Cleaned': ['Rooms Cleaned per Shift', 'Rooms Cleaned'],
        'Cleaning Time': ['Average Cleaning Time', 'Cleaning Time'],
        'Room Turnaround': ['Room Turnaround Time', 'Room Turnaround'],
        'Inspection Pass Rate': ['Inspection Pass Rate', 'Inspection Rate'],
        'Out-of-Order': ['Out-of-Order %', 'Out-of-Order Percentage'],
        'Linen Cost': ['Linen Cost per Occupied Room', 'Linen Cost'],
        'Guest Room Defect Rate': ['Guest Room Defect Rate', 'Room Defect Rate'],
        'Chemical Cost': ['Chemical Cost per Occupied Room', 'Chemical Cost'],
        'HK Staff Efficiency': ['HK Staff Efficiency', 'Housekeeping Staff Efficiency']
      },
      'Maintenance/Engineering': {
        'Maintenance Cost': ['Maintenance Cost per Room', 'Maintenance Cost'],
        'Energy Consumption': ['Energy Consumption (kWh)', 'Energy Consumption'],
        'Equipment Uptime': ['Equipment Uptime %', 'Equipment Uptime'],
        'Preventive Maintenance': ['Preventive Maintenance %', 'Preventive Maintenance'],
        'Response Time': ['Response Time (minutes)', 'Response Time'],
        'Work Order Completion': ['Work Order Completion %', 'Work Order Completion'],
        'Vendor Performance': ['Vendor Performance (1-5)', 'Vendor Performance'],
        'Energy Efficiency': ['Energy Efficiency %', 'Energy Efficiency'],
        'Maintenance Staff Efficiency': ['Maintenance Staff Efficiency %', 'Maintenance Staff Efficiency']
      },
      'Sales & Marketing': {
        'Conversion Rate': ['Website Conversion Rate', 'Conversion Rate'],
        'Lead Generation': ['Lead Generation', 'Leads Generated'],
        'Customer Acquisition Cost': ['Customer Acquisition Cost', 'CAC'],
        'Email Open Rate': ['Email Open Rate', 'Email Opens %'],
        'Click Through Rate': ['Click Through Rate', 'CTR'],
        'Social Media Engagement': ['Social Media Engagement', 'Social Engagement'],
        'Website Traffic': ['Website Traffic', 'Site Visitors'],
        'Booking Conversion': ['Booking Conversion Rate', 'Booking Conversion'],
        'Customer Lifetime Value': ['Customer Lifetime Value', 'CLV'],
        'Marketing ROI': ['Marketing ROI', 'ROI']
      },
      'Finance': {
        'Profit Margin': ['Gross Operating Profit (GOP) Margin', 'GOP Margin'],
        'Operating Expenses': ['Operating Expenses', 'OpEx'],
        'Cash Flow': ['Cash Flow', 'Net Cash Flow'],
        'Debt to Equity': ['Debt to Equity Ratio', 'D/E Ratio'],
        'Return on Investment': ['Return on Investment (ROI)', 'ROI'],
        'Accounts Receivable': ['Accounts Receivable', 'AR'],
        'Accounts Payable': ['Accounts Payable', 'AP'],
        'Inventory Turnover': ['Inventory Turnover', 'Inventory Turn'],
        'Working Capital': ['Working Capital', 'Net Working Capital'],
        'Cost per Room': ['Cost per Available Room', 'Cost per Room']
      },
      'HR': {
        'Employee Turnover': ['Employee Turnover Rate', 'Turnover Rate'],
        'Training Completion': ['Training Completion Rate', 'Training Completion'],
        'Employee Satisfaction': ['Employee Satisfaction Score', 'Employee Satisfaction'],
        'Time to Hire': ['Time to Hire', 'Hiring Time'],
        'Cost per Hire': ['Cost per Hire', 'Hiring Cost'],
        'Productivity per Employee': ['Employee Productivity', 'Employee Prod'],
        'Absenteeism Rate': ['Absenteeism Rate', 'Absenteeism'],
        'Training Cost': ['Training Cost per Employee', 'Training Cost'],
        'Performance Rating': ['Employee Performance Rating', 'Performance Rating'],
        'Retention Rate': ['Employee Retention Rate', 'Retention Rate']
      }
    }

    const deptMappings = fuzzyMappings[department]
    if (deptMappings) {
      for (const [csvName, possibleMatches] of Object.entries(deptMappings)) {
        if (csvName.toLowerCase() === dataType.toLowerCase()) {
          // Return the first (most standard) match
          console.log(`🔍 findFuzzyKPIMatch: Found fuzzy match for "${dataType}" in ${department}: "${possibleMatches[0]}"`)
          return possibleMatches[0]
        }
      }
    }

    return null
  }

  /**
   * Map data type to KPI category
   */
  private static mapDataTypeToCategory(dataType: string): string {
    const categoryMap: Record<string, string> = {
      // Legacy data types (for backward compatibility)
      'occupancy_rate': 'occupancy',
      'revenue': 'revenue',
      'guest_count': 'guest',
      'food_beverage_metric': 'operational',
      'housekeeping_metric': 'operational',
      
      // New KPI names
      'Occupancy Rate': 'occupancy',
      'Average Daily Rate (ADR)': 'revenue',
      'Revenue per Available Room (RevPAR)': 'revenue',
      'Revenue Generation Index (RGI)': 'revenue',
      'Average Length of Stay (ALOS)': 'revenue',
      'Booking Lead Time': 'sales',
      'Cancellation Rate': 'sales',
      'No-Show Rate': 'sales',
      'Average Check': 'revenue',
      'Food Cost %': 'operational',
      'Beverage Cost %': 'operational',
      'Covers': 'operational',
      'RevPASH': 'revenue',
      'Table Turnover Rate': 'operational',
      'Waste %': 'operational',
      'Void/Comp %': 'operational',
      'Food Revenue': 'revenue',
      'Beverage Revenue': 'revenue',
      'Rooms Cleaned per Shift': 'operational',
      'Average Cleaning Time': 'operational',
      'Inspection Pass Rate': 'operational',
      'Room Turnaround Time': 'operational',
      'Out-of-Order %': 'operational',
      'Linen Cost per Occupied Room': 'operational',
      'Guest Room Defect Rate': 'operational',
      'Chemical Cost per Occupied Room': 'operational',
      'HK Staff Efficiency': 'operational',
      'Guest Satisfaction Score': 'operational',
      'Mean Time To Repair (MTTR)': 'operational',
      'Mean Time Between Failures (MTBF)': 'operational',
      'PM Compliance Rate': 'operational',
      'Energy per Occupied Room (ECOR)': 'operational',
      'Water per Occupied Room (WCOR)': 'operational',
      'Work Order Closure Rate': 'operational',
      'Equipment Downtime %': 'operational',
      'Reactive:Preventive Ratio': 'operational',
      'Maintenance Cost per Room': 'operational',
      'Energy Efficiency Score': 'operational',
      'Direct Booking Ratio': 'sales',
      'Website Conversion Rate': 'sales',
      'Cost per Acquisition (CPA)': 'sales',
      'Return on Ad Spend (ROAS)': 'sales',
      'Forecast Accuracy (MAPE)': 'operational',
      'Group Booking Conversion Rate': 'sales',
      'Upsell Attach Rate': 'sales',
      'Email CTR': 'sales',
      'Social Media Engagement': 'operational',
      'Brand Awareness Score': 'operational',
      'Gross Operating Profit (GOP) Margin': 'financial',
      'GOPPAR': 'financial',
      'Total RevPAR (TRevPAR)': 'financial',
      'Payroll % of Revenue': 'hr',
      'Days Sales Outstanding (DSO)': 'financial',
      'Inventory Turnover': 'financial',
      'Budget Variance %': 'financial',
      'Break-even Occupancy': 'financial',
      'Staff-to-Room Ratio': 'hr',
      'Overtime %': 'hr',
      'Training Hours per FTE': 'hr',
      'Employee Turnover Rate': 'hr',
      'Absenteeism Rate': 'hr',
      'Employee NPS (eNPS)': 'hr',
      'Productivity per Labor Hour': 'hr',
      // Additional KPI categories
      'Energy Consumption (kWh)': 'operational',
      'Equipment Uptime %': 'operational',
      'Preventive Maintenance %': 'operational',
      'Response Time (minutes)': 'operational',
      'Work Order Completion %': 'operational',
      'Vendor Performance (1-5)': 'operational',
      'Safety Incidents': 'operational',
      'Energy Efficiency %': 'operational',
      'Maintenance Staff Efficiency %': 'operational',
      'Lead Generation': 'sales',
      'Customer Acquisition Cost': 'sales',
      'Email Open Rate': 'sales',
      'Click Through Rate': 'sales',
      'Website Traffic': 'sales',
      'Booking Conversion Rate': 'sales',
      'Customer Lifetime Value': 'sales',
      'Marketing ROI': 'sales',
      'Operating Expenses': 'financial',
      'Cash Flow': 'financial',
      'Debt to Equity Ratio': 'financial',
      'Return on Investment (ROI)': 'financial',
      'Accounts Receivable': 'financial',
      'Accounts Payable': 'financial',
      'Working Capital': 'financial',
      'Cost per Available Room': 'financial',
      'Training Completion Rate': 'hr',
      'Employee Satisfaction Score': 'hr',
      'Time to Hire': 'hr',
      'Cost per Hire': 'hr',
      'Employee Productivity': 'hr',
      'Training Cost per Employee': 'hr',
      'Employee Performance Rating': 'hr',
      'Employee Retention Rate': 'hr'
    }
    return categoryMap[dataType] || 'operational'
  }

  /**
   * Map data type to KPI name
   */
  private static mapDataTypeToKPIName(dataType: string, department: string): string {
    console.log(`🔍 mapDataTypeToKPIName: Mapping "${dataType}" for department "${department}"`)
    
    // First, try to find an exact match for the dataType
    const exactMatch = this.findExactKPIMatch(dataType, department)
    if (exactMatch) {
      console.log(`✅ mapDataTypeToKPIName: Found exact match: "${exactMatch}"`)
      return exactMatch
    }

    // If no exact match, try fuzzy matching for common variations
    const fuzzyMatches = this.findFuzzyKPIMatch(dataType, department)
    if (fuzzyMatches) {
      console.log(`✅ mapDataTypeToKPIName: Found fuzzy match: "${fuzzyMatches}"`)
      return fuzzyMatches
    }

    // If no mapping found, return the original dataType (this will help with debugging)
    console.log(`⚠️ mapDataTypeToKPIName: No mapping found, returning original: "${dataType}"`)
    return dataType
  }

  /**
   * Map data type to unit
   */
  private static mapDataTypeToUnit(dataType: string): string {
    const unitMap: Record<string, string> = {
      // Legacy data types (for backward compatibility)
      'occupancy_rate': '%',
      'revenue': 'GHS',
      'guest_count': 'count',
      'food_beverage_metric': 'GHS',
      'housekeeping_metric': 'count',
      
      // Additional extracted data types
      'revenue_metric': 'GHS',
      'guest_metric': 'count',
      'maintenance_metric': 'units',
      'sales_metric': 'units',
      'finance_metric': 'units',
      'hr_metric': 'units',
      'occupancy_metric': '%',
      'table_metric': 'units',
      'total_revenue': 'GHS',
      'daily_revenue': 'GHS',
      'monthly_revenue': 'GHS',
      'revenue_per_room': 'GHS/room',
      'rooms_occupied': 'rooms',
      'total_rooms': 'rooms',
      'guest_satisfaction': '/5',
      
      // New KPI names
      'Occupancy Rate': '%',
      'Average Daily Rate (ADR)': 'GHS/room',
      'Revenue per Available Room (RevPAR)': 'GHS/available room',
      'Revenue Generation Index (RGI)': 'index',
      'Average Length of Stay (ALOS)': 'days',
      'Booking Lead Time': 'days',
      'Cancellation Rate': '%',
      'No-Show Rate': '%',
      'Average Check': 'GHS/guest',
      'Food Cost %': '%',
      'Beverage Cost %': '%',
      'Covers': 'count',
      'RevPASH': 'GHS/seat-hour',
      'Table Turnover Rate': 'turns',
      'Waste %': '%',
      'Void/Comp %': '%',
      'Food Revenue': 'GHS',
      'Beverage Revenue': 'GHS',
      'Rooms Cleaned per Shift': 'rooms/staff-shift',
      'Average Cleaning Time': 'minutes/room',
      'Inspection Pass Rate': '%',
      'Room Turnaround Time': 'hours',
      'Out-of-Order %': '%',
      'Linen Cost per Occupied Room': 'GHS/room',
      'Guest Room Defect Rate': '%',
      'Chemical Cost per Occupied Room': 'GHS/room',
      'HK Staff Efficiency': '%',
      'Guest Satisfaction Score': '/5',
      'Mean Time To Repair (MTTR)': 'hours',
      'Mean Time Between Failures (MTBF)': 'hours',
      'PM Compliance Rate': '%',
      'Energy per Occupied Room (ECOR)': 'kWh/room',
      'Water per Occupied Room (WCOR)': 'liters/room',
      'Work Order Closure Rate': '%',
      'Equipment Downtime %': '%',
      'Reactive:Preventive Ratio': 'ratio',
      'Maintenance Cost per Room': 'GHS/room',
      'Energy Efficiency Score': '/100',
      'Direct Booking Ratio': '%',
      'Website Conversion Rate': '%',
      'Cost per Acquisition (CPA)': 'GHS',
      'Return on Ad Spend (ROAS)': 'x',
      'Forecast Accuracy (MAPE)': '%',
      'Group Booking Conversion Rate': '%',
      'Upsell Attach Rate': '%',
      'Email CTR': '%',
      'Social Media Engagement': '/10',
      'Brand Awareness Score': '/100',
      'Gross Operating Profit (GOP) Margin': '%',
      'GOPPAR': 'GHS/available room',
      'Total RevPAR (TRevPAR)': 'GHS/available room',
      'Payroll % of Revenue': '%',
      'Days Sales Outstanding (DSO)': 'days',
      'Inventory Turnover': 'turns',
      'Budget Variance %': '%',
      'Break-even Occupancy': '%',
      'Staff-to-Room Ratio': 'staff/room',
      'Overtime %': '%',
      'Training Hours per FTE': 'hours/FTE',
      'Employee Turnover Rate': '%',
      'Absenteeism Rate': '%',
      'Employee NPS (eNPS)': '/100',
      'Productivity per Labor Hour': 'output/hour',
      // New KPI units
      'Energy Consumption (kWh)': 'kWh',
      'Equipment Uptime %': '%',
      'Preventive Maintenance %': '%',
      'Response Time (minutes)': 'minutes',
      'Work Order Completion %': '%',
      'Vendor Performance (1-5)': '/5',
      'Safety Incidents': 'count',
      'Energy Efficiency %': '%',
      'Maintenance Staff Efficiency %': '%',
      'Lead Generation': 'count',
      'Customer Acquisition Cost': 'GHS',
      'Email Open Rate': '%',
      'Click Through Rate': '%',
      'Website Traffic': 'visitors',
      'Booking Conversion Rate': '%',
      'Customer Lifetime Value': 'GHS',
      'Marketing ROI': '%',
      'Profit Margin %': '%',
      'Operating Expenses': 'GHS',
      'Cash Flow': 'GHS',
      'Debt to Equity Ratio': 'ratio',
      'Return on Investment %': '%',
      'Accounts Receivable': 'GHS',
      'Accounts Payable': 'GHS',
      'Working Capital': 'GHS',
      'Cost per Room': 'GHS/room',
      'Employee Turnover %': '%',
      'Training Completion %': '%',
      'Employee Satisfaction (1-5)': '/5',
      'Time to Hire (days)': 'days',
      'Cost per Hire': 'GHS',
      'Productivity per Employee %': '%',
      'Absenteeism Rate %': '%',
      'Training Cost': 'GHS',
      'Performance Rating (1-5)': '/5',
      'Retention Rate %': '%'
    }
    return unitMap[dataType] || 'count'
  }

  /**
   * Map KPI name to category
   */
  private static mapKpiNameToCategory(kpiName: string): string {
    const categoryMap: Record<string, string> = {
      'Occupancy Rate': 'occupancy',
      'Average Daily Rate (ADR)': 'revenue',
      'Revenue per Available Room (RevPAR)': 'revenue',
      'Average Check': 'revenue',
      'Food Cost %': 'operational',
      'Rooms Cleaned per Shift': 'operational',
      'GOP Margin': 'financial',
      'GOPPAR': 'financial',
      'TRevPAR': 'financial',
      'Staff-to-Room Ratio': 'hr',
    }
    return categoryMap[kpiName] || 'operational'
  }

  /**
   * Get a specific report by ID
   */
  static async getReportById(reportId: string): Promise<{
    id: string;
    title: string;
    description: string | null;
    department: string;
    reportType: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    isPublic: boolean | null;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
    metadata?: unknown;
  } | null> {
    try {
      const db = getDb()
      const [report] = await db.select().from(reports).where(eq(reports.id, reportId))
      
      if (!report) {
        throw new Error('Report not found')
      }
      
      console.log(`📊 Retrieved report: ${reportId}`)
      return report
    } catch (error) {
      console.error('Failed to get report:', error)
      throw error
    }
  }

  /**
   * Update an existing report
   */
  static async updateReport(reportId: string, updates: Partial<ReportCreationInput>): Promise<boolean> {
    try {
      const db = getDb()
      await db.update(reports)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(reports.id, reportId))
      
      console.log(`📊 Updated report: ${reportId}`)
      return true
    } catch (error) {
      console.error('Failed to update report:', error)
      throw error
    }
  }

  /**
   * Delete a report
   */
  static async deleteReport(reportId: string): Promise<boolean> {
    try {
      const db = getDb()
      
      // First delete report items
      await db.delete(reportItems).where(eq(reportItems.reportId, reportId))
      
      // Then delete the report
      await db.delete(reports).where(eq(reports.id, reportId))
      
      console.log(`📊 Deleted report: ${reportId}`)
      return true
    } catch (error) {
      console.error('Failed to delete report:', error)
      throw error
    }
  }

  /**
   * Map stored KPI names to correct catalog names (runtime fix)
   */
  private static mapStoredKPIName(storedName: string): string {
    // Define the mapping from incorrect names to correct names
    const nameMappings: Record<string, string> = {
      // Front Office
      'guest_count': 'Guest Count',
      'occupancy_rate': 'Occupancy Rate',
      'revenue': 'Revenue per Available Room (RevPAR)',
      'room_revenue': 'Revenue per Available Room (RevPAR)',
      'available_rooms': 'Occupancy Rate',
      'occupied_rooms': 'Occupancy Rate',
      'rgi': 'Revenue Generation Index (RGI)',
      'alos': 'Average Length of Stay (ALOS)',
      'booking_lead_time': 'Booking Lead Time',
      'cancellation_rate': 'Cancellation Rate',
      'no_show_rate': 'No-Show Rate',
      'average_daily_rate': 'Average Daily Rate (ADR)',
      'revpar': 'Revenue per Available Room (RevPAR)',
      'revenue_generation_index': 'Revenue Generation Index (RGI)',
      'average_length_of_stay': 'Average Length of Stay (ALOS)',
      'direct_booking_ratio': 'Direct Booking Ratio',
      'website_conversion_rate': 'Website Conversion Rate',
      'cost_per_acquisition': 'Cost per Acquisition (CPA)',
      'return_on_ad_spend': 'Return on Ad Spend (ROAS)',
      'forecast_accuracy': 'Forecast Accuracy (MAPE)',
      'group_booking_conversion_rate': 'Group Booking Conversion Rate',
      'upsell_attach_rate': 'Upsell Attach Rate',
      'email_ctr': 'Email CTR',
      'social_media_engagement': 'Social Media Engagement',
      'brand_awareness_score': 'Brand Awareness Score',
      
      // Food & Beverage
      'food_beverage_metric': 'Average Check',
      'food_cost': 'Food Cost %',
      'beverage_cost': 'Beverage Cost %',
      'covers': 'Covers',
      'average_check': 'Average Check',
      'revpash': 'RevPASH',
      'table_turnover': 'Table Turnover Rate',
      'waste': 'Waste %',
      'void_comp': 'Void/Comp %',
      'food_revenue': 'Food Revenue',
      'beverage_revenue': 'Beverage Revenue',
      
      // Housekeeping
      'housekeeping_metric': 'Rooms Cleaned per Shift',
      'cleaning_time': 'Average Cleaning Time',
      'inspection_rate': 'Inspection Pass Rate',
      'rooms_cleaned': 'Rooms Cleaned per Shift',
      'room_turnaround': 'Room Turnaround Time',
      'out_of_order': 'Out-of-Order %',
      'linen_cost': 'Linen Cost per Occupied Room',
      'guest_room_defect': 'Guest Room Defect Rate',
      'chemical_cost': 'Chemical Cost per Occupied Room',
      'hk_staff_efficiency': 'HK Staff Efficiency',
      
      // Maintenance/Engineering
      'maintenance_metric': 'Mean Time To Repair (MTTR)',
      'maintenance_cost': 'Maintenance Cost per Room',
      'energy_consumption': 'Energy Consumption (kWh)',
      'equipment_uptime': 'Equipment Uptime %',
      'preventive_maintenance': 'Preventive Maintenance %',
      'response_time': 'Response Time (minutes)',
      'work_order_completion': 'Work Order Completion %',
      'vendor_performance': 'Vendor Performance (1-5)',
      'safety_incidents': 'Safety Incidents',
      'energy_efficiency': 'Energy Efficiency %',
      'maintenance_staff_efficiency': 'Maintenance Staff Efficiency %',
      
      // Sales & Marketing
      'sales_metric': 'Direct Booking Ratio',
      'conversion_rate': 'Website Conversion Rate',
      'lead_generation': 'Lead Generation',
      'customer_acquisition_cost': 'Customer Acquisition Cost',
      'email_open_rate': 'Email Open Rate',
      'click_through_rate': 'Click Through Rate',
      'website_traffic': 'Website Traffic',
      'booking_conversion': 'Booking Conversion Rate',
      'customer_lifetime_value': 'Customer Lifetime Value',
      'marketing_roi': 'Marketing ROI',
      
      // Finance
      'finance_metric': 'Gross Operating Profit (GOP) Margin',
      'profit_margin': 'Profit Margin %',
      'operating_expenses': 'Operating Expenses',
      'cash_flow': 'Cash Flow',
      'debt_to_equity': 'Debt to Equity Ratio',
      'return_on_investment': 'Return on Investment %',
      'accounts_receivable': 'Accounts Receivable',
      'accounts_payable': 'Accounts Payable',
      'working_capital': 'Working Capital',
      'cost_per_room': 'Cost per Available Room',
      
      // HR
      'hr_metric': 'Staff-to-Room Ratio',
      'employee_turnover': 'Employee Turnover Rate',
      'training_completion': 'Training Completion Rate',
      'employee_satisfaction': 'Employee Satisfaction Score',
      'time_to_hire': 'Time to Hire',
      'cost_per_hire': 'Cost per Hire',
      'productivity_per_employee': 'Employee Productivity',
      'absenteeism_rate': 'Absenteeism Rate',
      'training_cost': 'Training Cost per Employee',
      'performance_rating': 'Employee Performance Rating',
      'retention_rate': 'Employee Retention Rate',
      
      // Additional mappings for variations found in database
      'goppar': 'GOPPAR',
      'inventory_turnover': 'Inventory Turnover',
      'training_hours_per_fte': 'Training Hours per FTE',
      'revenue_per_available_room': 'Revenue per Available Room (RevPAR)',
      'no-show_rate': 'No-Show Rate',
      'guest_satisfaction': 'Guest Satisfaction Score',
      'void/comp': 'Void/Comp %',
      'guest_room_defect_rate': 'Guest Room Defect Rate',
      'inspection_pass_rate': 'Inspection Pass Rate',
      'out-of-order': 'Out-of-Order %',
      'employee_turnover_%': 'Employee Turnover Rate',
      'training_completion_%': 'Training Completion Rate',
      'employee_satisfaction_(1-5)': 'Employee Satisfaction Score',
      'time_to_hire_(days)': 'Time to Hire',
      'productivity_per_employee_%': 'Employee Productivity',
      'absenteeism_rate_%': 'Absenteeism Rate',
      'performance_rating_(1-5)': 'Employee Performance Rating',
      'retention_rate_%': 'Employee Retention Rate'
    }
    
    // Return mapped name if found, otherwise return original
    const mappedName = nameMappings[storedName] || storedName
    if (mappedName !== storedName) {
      console.log(`🔧 mapStoredKPIName: Fixed "${storedName}" → "${mappedName}"`)
    }
    return mappedName
  }
}
