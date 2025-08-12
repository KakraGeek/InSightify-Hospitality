import { parsePDF, PDFParseResult } from '../ingest/pdf'

export interface ProcessedDataPoint {
  department: string
  dataType: string
  value: number | null
  textValue: string | null
  date: Date
  source: string
  sourceFile: string
  metadata: any
}

export interface ProcessingResult {
  success: boolean
  dataPoints: ProcessedDataPoint[]
  errors: string[]
  summary: {
    totalExtracted: number
    occupancyData: number
    revenueData: number
    guestData: number
    otherData: number
  }
}

/**
 * Process parsed PDF data to extract meaningful hospitality metrics
 */
export async function processPDFData(
  pdfResult: PDFParseResult,
  department: string,
  sourceFile: string
): Promise<ProcessingResult> {
  console.log(`🔍 processPDFData: Starting with department: ${department}`)
  console.log(`🔍 processPDFData: PDF text length: ${pdfResult.text.length}`)
  console.log(`🔍 processPDFData: PDF text preview:\n${pdfResult.text.substring(0, 200)}...`)
  
  const dataPoints: ProcessedDataPoint[] = []
  const errors: string[] = []
  
  try {
    // Extract dates from the PDF text
    const dates = extractDatesFromText(pdfResult.text)
    console.log(`🔍 processPDFData: Extracted dates: ${dates.length} dates found:`, dates)
    
    if (dates.length === 0) {
      // If no dates found, use a default date
      dates.push(new Date())
      console.log(`🔍 processPDFData: No dates found, using default date:`, dates[0])
    }
    
    // Use only the new extractOtherMetrics function which correctly assigns departments
    const otherData = extractOtherMetrics(pdfResult.text, department, dates, sourceFile)
    console.log(`🔍 processPDFData: Other metrics extracted: ${otherData.length} points`)
    
    // Process tables if any
    const tableData = processTables(pdfResult.tables, department, dates, sourceFile)
    console.log(`🔍 processPDFData: Table data extracted: ${tableData.length} points`)
    
    // Combine all data points
    dataPoints.push(...otherData, ...tableData)
    
    console.log(`🔍 processPDFData: Total data points collected: ${dataPoints.length}`)
    if (dataPoints.length > 0) {
      console.log(`🔍 processPDFData: Sample data points: [`, dataPoints.slice(0, 3).map(dp => ({
        department: dp.department,
        dataType: dp.dataType,
        value: dp.value,
        date: dp.date,
        source: dp.source,
        sourceFile: dp.sourceFile,
        metadata: dp.metadata
      })), `]`)
    }
    
    const summary = {
      totalExtracted: dataPoints.length,
      occupancyData: 0, // Disabled old function
      revenueData: 0,    // Disabled old function
      guestData: 0,      // Disabled old function
      otherData: otherData.length
    }
    
    console.log(`🔍 processPDFData: Processing summary:`, summary)
    
    return {
      success: true,
      dataPoints,
      errors,
      summary
    }
    
  } catch (error) {
    console.error('❌ Error processing PDF data:', error)
    errors.push(`Processing error: ${error instanceof Error ? error.message : String(error)}`)
    
    return {
      success: false,
      dataPoints: [],
      errors,
      summary: {
        totalExtracted: 0,
        occupancyData: 0,
        revenueData: 0,
        guestData: 0,
        otherData: 0
      }
    }
  }
}

/**
 * Extract dates from PDF text using various date formats
 */
function extractDatesFromText(text: string): Date[] {
  const dates: Date[] = []
  const datePatterns = [
    // MM/DD/YYYY format
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
    // YYYY-MM-DD format
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    // Month DD, YYYY format
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/gi,
    // DD Month YYYY format
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
    // MM-DD-YYYY format
    /(\d{1,2})-(\d{1,2})-(\d{4})/g,
    // "December 15, 2024" format
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi
  ]
  
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  }
  
  datePatterns.forEach((pattern, index) => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      try {
        let date: Date
        if (index === 0 || index === 4) { // MM/DD/YYYY or MM-DD-YYYY
          const month = parseInt(match[1]) - 1
          const day = parseInt(match[2])
          const year = parseInt(match[3])
          date = new Date(year, month, day)
        } else if (index === 1) { // YYYY-MM-DD
          const year = parseInt(match[1])
          const month = parseInt(match[2]) - 1
          const day = parseInt(match[3])
          date = new Date(year, month, day)
        } else if (index === 2 || index === 5) { // Month DD, YYYY or "December 15, 2024"
          const month = monthMap[match[1].toLowerCase()]
          const day = parseInt(match[2])
          const year = parseInt(match[3])
          date = new Date(year, month, day)
        } else { // DD Month YYYY
          const day = parseInt(match[1])
          const month = monthMap[match[2].toLowerCase()]
          const year = parseInt(match[3])
          date = new Date(year, month, day)
        }
        
        if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() < 2030) {
          dates.push(date)
          console.log(`🔍 extractDatesFromText: Valid date found: ${date.toISOString().split('T')[0]}`)
        }
      } catch (_error) {
        console.log(`⚠️ extractDatesFromText: Error parsing date from match: ${match[0]}`)
      }
    }
  })
  
  // Remove duplicates and sort
  const uniqueDates = [...new Set(dates.map(d => d.toISOString().split('T')[0]))]
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime())
  
  console.log(`🔍 extractDatesFromText: Total unique dates found: ${uniqueDates.length}`)
  
  // If no dates found, use a default date
  if (uniqueDates.length === 0) {
    const defaultDate = new Date()
    console.log(`⚠️ extractDatesFromText: No dates found, using default date: ${defaultDate.toISOString().split('T')[0]}`)
    uniqueDates.push(defaultDate)
  }
  
  return uniqueDates
}

/**
 * Helper function to determine department from text context
 */
function getDepartmentFromContext(text: string, matchText: string): string {
  // Find the position of this specific match in the text
  const matchIndex = text.indexOf(matchText)
  if (matchIndex === -1) return 'Front Office'
  
  // Look for department headers in the text before AND after the match
  const beforeText = text.substring(Math.max(0, matchIndex - 500), matchIndex).toLowerCase()
  const afterText = text.substring(matchIndex, Math.min(text.length, matchIndex + 500)).toLowerCase()
  
  console.log(`🔍 getDepartmentFromContext: Looking for department around match "${matchText}"`)
  console.log(`🔍 getDepartmentFromContext: Before text preview: "${beforeText.substring(Math.max(0, beforeText.length - 200))}"`)
  console.log(`🔍 getDepartmentFromContext: After text preview: "${afterText.substring(0, Math.min(200, afterText.length))}"`)
  
  // Check for department headers in order of specificity (both with and without "Metrics:")
  // Look in both before and after text
  const searchText = beforeText + ' ' + afterText
  
  if (searchText.includes('food & beverage:') || searchText.includes('food and beverage:') || 
      searchText.includes('food & beverage metrics:') || searchText.includes('food and beverage metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Food & Beverage department`)
    return 'Food & Beverage'
  } else if (searchText.includes('housekeeping:') || searchText.includes('housekeeping metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Housekeeping department`)
    return 'Housekeeping'
  } else if (searchText.includes('maintenance/engineering:') || searchText.includes('maintenance:') || searchText.includes('engineering:') ||
             searchText.includes('maintenance/engineering metrics:') || searchText.includes('maintenance metrics:') || searchText.includes('engineering metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Maintenance/Engineering department`)
    return 'Maintenance/Engineering'
  } else if (searchText.includes('sales & marketing:') || searchText.includes('sales:') || searchText.includes('marketing:') ||
             searchText.includes('sales & marketing metrics:') || searchText.includes('sales metrics:') || searchText.includes('marketing metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Sales & Marketing department`)
    return 'Sales & Marketing'
  } else if (searchText.includes('finance:') || searchText.includes('financial:') || 
             searchText.includes('finance metrics:') || searchText.includes('financial metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Finance department`)
    return 'Finance'
  } else if (searchText.includes('hr:') || searchText.includes('human resources:') ||
             searchText.includes('hr metrics:') || searchText.includes('human resources metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found HR department`)
    return 'HR'
  } else if (searchText.includes('front office:') || searchText.includes('front office metrics:')) {
    console.log(`🔍 getDepartmentFromContext: Found Front Office department`)
    return 'Front Office'
  }
  
  console.log(`🔍 getDepartmentFromContext: No department header found, falling back to keyword detection`)
  
  // If no clear headers found, fall back to keyword-based detection
  if (searchText.includes('food & beverage') || searchText.includes('food and beverage') || 
      searchText.includes('restaurant') || searchText.includes('dining') || 
      searchText.includes('food cost') || searchText.includes('beverage cost') || 
      searchText.includes('covers') || searchText.includes('average check') || 
      searchText.includes('table turnover') || searchText.includes('revpash')) {
    return 'Food & Beverage'
  } else if (searchText.includes('housekeeping') || searchText.includes('hk') || 
             searchText.includes('rooms cleaned') || searchText.includes('cleaning time') || 
             searchText.includes('room turnaround') || searchText.includes('inspection pass') || 
             searchText.includes('out-of-order') || searchText.includes('linen cost') || 
             searchText.includes('guest room defect') || searchText.includes('chemical cost') || 
             searchText.includes('hk staff efficiency')) {
    return 'Housekeeping'
  } else if (searchText.includes('maintenance/engineering') || 
             searchText.includes('maintenance cost') || searchText.includes('energy consumption') || 
             searchText.includes('equipment uptime') || searchText.includes('preventive maintenance') || 
             searchText.includes('response time') || searchText.includes('work order completion') || 
             searchText.includes('vendor performance') || searchText.includes('safety incidents') || 
             searchText.includes('energy efficiency') || searchText.includes('maintenance staff efficiency')) {
    return 'Maintenance/Engineering'
  } else if (searchText.includes('sales & marketing') || 
             searchText.includes('conversion rate') || searchText.includes('lead generation') || 
             searchText.includes('customer acquisition cost') || searchText.includes('email open rate') || 
             searchText.includes('click through rate') || searchText.includes('social media engagement') || 
             searchText.includes('website traffic') || searchText.includes('booking conversion') || 
             searchText.includes('customer lifetime value') || searchText.includes('marketing roi')) {
    return 'Sales & Marketing'
  } else if (searchText.includes('finance') || searchText.includes('financial') || 
             searchText.includes('profit margin') || searchText.includes('operating expenses') || 
             searchText.includes('cash flow') || searchText.includes('debt to equity') || 
             searchText.includes('return on investment') || searchText.includes('accounts receivable') || 
             searchText.includes('accounts payable') || searchText.includes('inventory turnover') || 
             searchText.includes('working capital') || searchText.includes('cost per room')) {
    return 'Finance'
  } else if (searchText.includes('hr') || searchText.includes('human resources') || 
             searchText.includes('employee turnover') || searchText.includes('training completion') || 
             searchText.includes('employee satisfaction') || searchText.includes('time to hire') || 
             searchText.includes('cost per hire') || searchText.includes('productivity per employee') || 
             searchText.includes('absenteeism rate') || searchText.includes('training cost') || 
             searchText.includes('performance rating') || searchText.includes('retention rate')) {
    return 'HR'
  } else if (searchText.includes('front office') || searchText.includes('occupancy') || 
             searchText.includes('guest count') || searchText.includes('average daily rate') || 
             searchText.includes('revenue per available room') || searchText.includes('booking lead time') || 
             searchText.includes('cancellation rate') || searchText.includes('no-show rate') || 
             searchText.includes('guest satisfaction')) {
    return 'Front Office'
  }
  
  return 'Front Office'
}

/*
function extractOccupancyData(
  text: string, 
  department: string, 
  dates: Date[], 
  sourceFile: string
): ProcessedDataPoint[] {
  const dataPoints: ProcessedDataPoint[] = []
  
  // Define patterns for occupancy-related KPIs
  const patterns = [
    { pattern: /occupancy\s+rate[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Occupancy Rate', unit: '%' },
    { pattern: /room\s+utilization[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Room Utilization', unit: '%' },
    { pattern: /available\s+rooms[:\s]*(\d+)/gi, name: 'Available Rooms', unit: 'rooms' },
    { pattern: /occupied\s+rooms[:\s]*(\d+)/gi, name: 'Occupied Rooms', unit: 'rooms' },
    { pattern: /total\s+rooms[:\s]*(\d+)/gi, name: 'Total Rooms', unit: 'rooms' },
    { pattern: /out\s+of\s+order\s+rooms[:\s]*(\d+)/gi, name: 'Out of Order Rooms', unit: 'rooms' },
    { pattern: /maintenance\s+rooms[:\s]*(\d+)/gi, name: 'Maintenance Rooms', unit: 'rooms' },
    { pattern: /complementary\s+rooms[:\s]*(\d+)/gi, name: 'Complementary Rooms', unit: 'rooms' },
    { pattern: /house\s+use\s+rooms[:\s]*(\d+)/gi, name: 'House Use Rooms', unit: 'rooms' }
  ]
  
  patterns.forEach(({ pattern, name, unit }) => {
    const matches = text.match(pattern)
    if (matches) {
      console.log(`🔍 extractOccupancyData: Pattern ${pattern.source} found matches:`, matches)
      
      matches.forEach(match => {
        const valueMatch = match.match(/(\d+(?:\.\d+)?)/)
        if (valueMatch) {
          const value = parseFloat(valueMatch[1])
          if (!isNaN(value)) {
            dates.forEach(date => {
              dataPoints.push({
                department,
                dataType: name,
                value,
                textValue: null,
                date,
                source: 'PDF',
                sourceFile,
                metadata: { unit, pattern: pattern.source }
              })
            })
          }
        }
      })
    }
  })
  
  return dataPoints
}
*/

/**
 * Extract revenue-related metrics
 */
/*
function extractRevenueData(
  text: string, 
  department: string, 
  dates: Date[], 
  sourceFile: string
): ProcessedDataPoint[] {
  const dataPoints: ProcessedDataPoint[] = []
  
  const patterns = [
    /revenue per available room[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /revpar[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /average daily rate[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /adr[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /total revenue[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /daily revenue[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /monthly revenue[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi,
    /revenue per room[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi
  ]
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      console.log(`🔍 extractRevenueData: Pattern ${pattern.source} found matches:`, matches)
      matches.forEach(match => {
        const value = parseFloat(match.replace(/[^\d.]/g, ''))
        if (!isNaN(value)) {
          let metricType = 'revenue_metric'
          if (match.toLowerCase().includes('revenue per room') || match.toLowerCase().includes('revpar')) {
            metricType = 'revpar'
          } else if (match.toLowerCase().includes('average daily rate') || match.toLowerCase().includes('adr')) {
            metricType = 'average_daily_rate'
          } else if (match.toLowerCase().includes('total revenue')) {
            metricType = 'total_revenue'
          } else if (match.toLowerCase().includes('daily revenue')) {
            metricType = 'daily_revenue'
          } else if (match.toLowerCase().includes('monthly revenue')) {
            metricType = 'monthly_revenue'
          } else if (match.toLowerCase().includes('revenue per room')) {
            metricType = 'revenue_per_room'
          }
          
          const effectiveDepartment = getDepartmentFromContext(text, match.trim())
          dates.forEach(date => {
            dataPoints.push({
              department: effectiveDepartment,
              dataType: metricType,
              value: value,
              textValue: null,
              date,
              source: 'pdf',
              sourceFile,
              metadata: { extractedFrom: match.trim() }
            })
          })
        }
      })
    }
  })
  
  return dataPoints
}
*/

/**
 * Extract guest-related metrics
 */
/*
function extractGuestData(
  text: string, 
  department: string, 
  dates: Date[], 
  sourceFile: string
): ProcessedDataPoint[] {
  const dataPoints: ProcessedDataPoint[] = []
  
  // Define patterns for guest-related KPIs
  const patterns = [
    { pattern: /guest\s+satisfaction[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Guest Satisfaction', unit: 'score' },
    { pattern: /guest\s+score[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Guest Score', unit: 'score' },
    { pattern: /nps[:\s]*(-?\d+)/gi, name: 'Net Promoter Score (NPS)', unit: 'score' },
    { pattern: /net\s+promoter\s+score[:\s]*(-?\d+)/gi, name: 'Net Promoter Score (NPS)', unit: 'score' },
    { pattern: /guest\s+complaints[:\s]*(\d+)/gi, name: 'Guest Complaints', unit: 'count' },
    { pattern: /complaints[:\s]*(\d+)/gi, name: 'Guest Complaints', unit: 'count' },
    { pattern: /guest\s+feedback[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Guest Feedback Score', unit: 'score' },
    { pattern: /guest\s+experience[:\s]*(\d+(?:\.\d+)?)/gi, name: 'Guest Experience Score', unit: 'score' }
  ]
  
  patterns.forEach(({ pattern, name, unit }) => {
    const matches = text.match(pattern)
    if (matches) {
      console.log(`🔍 extractGuestData: Pattern ${pattern.source} found matches:`, matches)
      
      matches.forEach(match => {
        const valueMatch = match.match(/(\d+(?:\.\d+)?)/)
        if (valueMatch) {
          const value = parseFloat(valueMatch[1])
          if (!isNaN(value)) {
            dates.forEach(date => {
              dataPoints.push({
                department,
                dataType: name,
                value,
                textValue: null,
                date,
                source: 'PDF',
                sourceFile,
                metadata: { unit, pattern: pattern.source }
              })
            })
          }
        }
      })
    }
  })
  
  return dataPoints
}
*/

/**
 * Extract comprehensive metrics for all departments
 */
function extractOtherMetrics(
  text: string, 
  department: string, 
  dates: Date[], 
  sourceFile: string
): ProcessedDataPoint[] {
  const dataPoints: ProcessedDataPoint[] = []
  
  console.log(`🔍 extractOtherMetrics: Starting extraction for department: ${department}`)
  
  // Define department section patterns
  const departmentSections = [
    {
      name: 'Front Office',
      patterns: [
        'front office metrics?:',
        'front office:',
        'front office'
      ],
      kpiPatterns: [
        { pattern: /occupancy rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'occupancy_rate', unit: '%' },
        { pattern: /guest count[:\s]*(\d+)/gi, dataType: 'guest_count', unit: 'count' },
        { pattern: /average daily rate[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'average_daily_rate', unit: 'GHS' },
        { pattern: /revenue per available room[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'revenue_per_available_room', unit: 'GHS' },
        { pattern: /booking lead time[:\s]*(\d+)\s*days?/gi, dataType: 'booking_lead_time', unit: 'days' },
        { pattern: /cancellation rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'cancellation_rate', unit: '%' },
        { pattern: /no-?show rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'no_show_rate', unit: '%' },
        { pattern: /guest satisfaction[:\s]*(\d+(?:\.\d+)?)\/5/gi, dataType: 'guest_satisfaction', unit: '/5' }
      ]
    },
    {
      name: 'Food & Beverage',
      patterns: [
        'food & beverage metrics?:',
        'food and beverage metrics?:',
        'food & beverage:',
        'food and beverage:',
        'food & beverage'
      ],
      kpiPatterns: [
        { pattern: /food cost[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'food_cost', unit: '%' },
        { pattern: /beverage cost[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'beverage_cost', unit: '%' },
        { pattern: /covers[:\s]*(\d+)/gi, dataType: 'covers', unit: 'count' },
        { pattern: /average check[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'average_check', unit: 'GHS' },
        { pattern: /table turnover[:\s]*(\d+(?:\.\d+)?)/gi, dataType: 'table_turnover', unit: 'times' },
        { pattern: /waste[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'waste', unit: '%' },
        { pattern: /void\/comp[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'void_comp', unit: '%' },
        { pattern: /food revenue[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'food_revenue', unit: 'GHS' },
        { pattern: /beverage revenue[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'beverage_revenue', unit: 'GHS' },
        { pattern: /revpash[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'revpash', unit: 'GHS' }
      ]
    },
    {
      name: 'Housekeeping',
      patterns: [
        'housekeeping metrics?:',
        'housekeeping:',
        'housekeeping'
      ],
      kpiPatterns: [
        { pattern: /rooms cleaned[:\s]*(\d+)/gi, dataType: 'rooms_cleaned', unit: 'rooms' },
        { pattern: /cleaning time[:\s]*(\d+)\s*minutes?/gi, dataType: 'cleaning_time', unit: 'minutes' },
        { pattern: /room turnaround[:\s]*(\d+(?:\.\d+)?)\s*hours?/gi, dataType: 'room_turnaround', unit: 'hours' },
        { pattern: /inspection pass[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'inspection_pass_rate', unit: '%' },
        { pattern: /out-?of-?order[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'out_of_order', unit: '%' },
        { pattern: /linen cost[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'linen_cost', unit: 'GHS' },
        { pattern: /guest room defect[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'guest_room_defect_rate', unit: '%' },
        { pattern: /chemical cost[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'chemical_cost', unit: 'GHS' },
        { pattern: /hk staff efficiency[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'hk_staff_efficiency', unit: '%' }
      ]
    },
    {
      name: 'Maintenance/Engineering',
      patterns: [
        'maintenance/engineering metrics?:',
        'maintenance metrics?:',
        'engineering metrics?:',
        'maintenance/engineering:',
        'maintenance:',
        'engineering:',
        'maintenance/engineering',
        'maintenance',
        'engineering'
      ],
      kpiPatterns: [
        { pattern: /maintenance cost[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'maintenance_cost', unit: 'GHS' },
        { pattern: /energy consumption[:\s]*(\d+(?:\.\d+)?)\s*kwh/gi, dataType: 'energy_consumption', unit: 'kWh' },
        { pattern: /equipment uptime[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'equipment_uptime', unit: '%' },
        { pattern: /preventive maintenance[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'preventive_maintenance', unit: '%' },
        { pattern: /response time[:\s]*(\d+)\s*minutes?/gi, dataType: 'response_time', unit: 'minutes' },
        { pattern: /work order completion[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'work_order_completion', unit: '%' },
        { pattern: /vendor performance[:\s]*(\d+(?:\.\d+)?)\/5/gi, dataType: 'vendor_performance', unit: '/5' },
        { pattern: /safety incidents[:\s]*(\d+)/gi, dataType: 'safety_incidents', unit: 'count' },
        { pattern: /energy efficiency[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'energy_efficiency', unit: '%' },
        { pattern: /maintenance staff efficiency[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'maintenance_staff_efficiency', unit: '%' }
      ]
    },
    {
      name: 'Sales & Marketing',
      patterns: [
        'sales & marketing metrics?:',
        'sales metrics?:',
        'marketing metrics?:',
        'sales & marketing:',
        'sales:',
        'marketing:',
        'sales & marketing',
        'sales',
        'marketing'
      ],
      kpiPatterns: [
        { pattern: /conversion rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'conversion_rate', unit: '%' },
        { pattern: /lead generation[:\s]*(\d+)/gi, dataType: 'lead_generation', unit: 'count' },
        { pattern: /customer acquisition cost[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'customer_acquisition_cost', unit: 'GHS' },
        { pattern: /email open rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'email_open_rate', unit: '%' },
        { pattern: /click through rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'click_through_rate', unit: '%' },
        { pattern: /social media engagement[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'social_media_engagement', unit: '%' },
        { pattern: /website traffic[:\s]*([\d,]+)/gi, dataType: 'website_traffic', unit: 'visitors' },
        { pattern: /booking conversion[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'booking_conversion', unit: '%' },
        { pattern: /customer lifetime value[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'customer_lifetime_value', unit: 'GHS' },
        { pattern: /marketing roi[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'marketing_roi', unit: '%' }
      ]
    },
    {
      name: 'Finance',
      patterns: [
        'finance metrics?:',
        'financial metrics?:',
        'finance:',
        'financial:',
        'finance',
        'financial'
      ],
      kpiPatterns: [
        { pattern: /profit margin[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'profit_margin', unit: '%' },
        { pattern: /operating expenses[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'operating_expenses', unit: 'GHS' },
        { pattern: /cash flow[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'cash_flow', unit: 'GHS' },
        { pattern: /debt to equity[:\s]*(\d+(?:\.\d+)?)/gi, dataType: 'debt_to_equity', unit: 'ratio' },
        { pattern: /return on investment[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'return_on_investment', unit: '%' },
        { pattern: /accounts receivable[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'accounts_receivable', unit: 'GHS' },
        { pattern: /accounts payable[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'accounts_payable', unit: 'GHS' },
        { pattern: /inventory turnover[:\s]*(\d+(?:\.\d+)?)/gi, dataType: 'inventory_turnover', unit: 'times' },
        { pattern: /working capital[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'working_capital', unit: 'GHS' },
        { pattern: /cost per room[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'cost_per_room', unit: 'GHS' }
      ]
    },
    {
      name: 'HR',
      patterns: [
        'hr metrics?:',
        'human resources metrics?:',
        'hr:',
        'human resources:',
        'hr',
        'human resources'
      ],
      kpiPatterns: [
        { pattern: /employee turnover[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'employee_turnover', unit: '%' },
        { pattern: /training completion[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'training_completion', unit: '%' },
        { pattern: /employee satisfaction[:\s]*(\d+(?:\.\d+)?)\/5/gi, dataType: 'employee_satisfaction', unit: '/5' },
        { pattern: /time to hire[:\s]*(\d+)\s*days?/gi, dataType: 'time_to_hire', unit: 'days' },
        { pattern: /cost per hire[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'cost_per_hire', unit: 'GHS' },
        { pattern: /productivity per employee[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'productivity_per_employee', unit: '%' },
        { pattern: /absenteeism rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'absenteeism_rate', unit: '%' },
        { pattern: /training cost[:\s]*ghs\s*([\d,]+(?:\.\d+)?)/gi, dataType: 'training_cost', unit: 'GHS' },
        { pattern: /performance rating[:\s]*(\d+(?:\.\d+)?)\/5/gi, dataType: 'performance_rating', unit: '/5' },
        { pattern: /retention rate[:\s]*(\d+(?:\.\d+)?)%?/gi, dataType: 'retention_rate', unit: '%' }
      ]
    }
  ]

  // Process each department section
  for (const section of departmentSections) {
    console.log(`🔍 extractOtherMetrics: Processing ${section.name} section`)
    
    // Find the start of this section
    let sectionStart = -1
    for (const pattern of section.patterns) {
      // Remove regex syntax for indexOf search
      const searchText = pattern.replace(/[?\\\/]/g, '')
      const matchIndex = text.toLowerCase().indexOf(searchText.toLowerCase())
      if (matchIndex !== -1) {
        sectionStart = matchIndex
        console.log(`🔍 extractOtherMetrics: Found ${section.name} section at index ${sectionStart}`)
        break
      }
    }
    
    if (sectionStart === -1) {
      console.log(`🔍 extractOtherMetrics: Section ${section.name} not found`)
      continue
    }
    
    // Find the end of this section (start of next section or end of text)
    let sectionEnd = text.length
    for (const otherSection of departmentSections) {
      if (otherSection.name === section.name) continue
      
      for (const pattern of otherSection.patterns) {
        const match = text.toLowerCase().substring(sectionStart + 1).match(new RegExp(pattern, 'i'))
        if (match) {
          const nextSectionStart = sectionStart + 1 + match.index!
          if (nextSectionStart < sectionEnd) {
            sectionEnd = nextSectionStart
          }
        }
      }
    }
    
    // Extract the section text
    const sectionText = text.substring(sectionStart, sectionEnd)
    console.log(`🔍 extractOtherMetrics: ${section.name} section text preview: "${sectionText.substring(0, 200)}..."`)
    
    // Extract KPIs from this section
    for (const kpiPattern of section.kpiPatterns) {
      const matches = sectionText.matchAll(kpiPattern.pattern)
      
      for (const match of matches) {
        const value = parseFloat(match[1].replace(/,/g, ''))
        if (!isNaN(value)) {
          dates.forEach((date) => {
            dataPoints.push({
              department: section.name,
              dataType: kpiPattern.dataType,
              value: value,
              textValue: null,
              date: date,
              source: 'pdf',
              sourceFile: sourceFile,
              metadata: { extractedFrom: match[0], unit: kpiPattern.unit }
            })
          })
          
          console.log(`🔍 extractOtherMetrics: ${section.name} Pattern ${kpiPattern.dataType} found matches: [ '${match[0]}' ]`)
        }
      }
    }
  }

  console.log(`🔍 extractOtherMetrics: Total data points extracted: ${dataPoints.length}`)
  if (dataPoints.length > 0) {
    console.log(`🔍 extractOtherMetrics: Sample data points: [`, dataPoints.slice(0, 3).map(dp => ({
      department: dp.department,
      dataType: dp.dataType,
      value: dp.value,
      date: dp.date,
      source: dp.source,
      sourceFile: dp.sourceFile,
      metadata: dp.metadata
    })), `]`)
  }
  
  return dataPoints
}

/**
 * Process table data from PDF
 */
function processTables(
  tables: Array<Array<string[]>>, 
  department: string, 
  dates: Date[], 
  sourceFile: string
): ProcessedDataPoint[] {
  const dataPoints: ProcessedDataPoint[] = []
  
  tables.forEach((table, tableIndex) => {
    console.log(`🔍 processTables: Processing table ${tableIndex + 1} with ${table.length} rows`)
    
    table.forEach((row, rowIndex) => {
      if (rowIndex === 0) return // Skip header row
      
      const rowText = row.join(' ').toLowerCase()
      console.log(`🔍 processTables: Row ${rowIndex + 1}: ${rowText}`)
      
      // Look for KPI patterns in table rows
      const patterns = [
        /(\d+(?:\.\d+)?)%?/g,
        /ghs\s*([\d,]+(?:\.\d+)?)/gi,
        /(\d+)\s*days?/gi,
        /(\d+)\s*hours?/gi,
        /(\d+)\s*minutes?/gi
      ]
      
      patterns.forEach(pattern => {
        const matches = rowText.match(pattern)
        if (matches) {
          matches.forEach(match => {
            const value = parseFloat(match.replace(/[^\d.]/g, ''))
            if (!isNaN(value)) {
              dates.forEach(date => {
                dataPoints.push({
                  department,
                  dataType: 'table_metric',
                  value: value,
                  textValue: row.join(' '),
                  date,
                  source: 'pdf_table',
                  sourceFile,
                  metadata: { 
                    tableIndex, 
                    rowIndex, 
                    extractedFrom: match.trim(),
                    fullRow: row.join(' ')
                  }
                })
              })
            }
          })
        }
      })
    })
  })
  
  return dataPoints
}
