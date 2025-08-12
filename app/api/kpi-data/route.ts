import { NextRequest, NextResponse } from 'next/server'
import { getKPIValues } from '../../../lib/services/dataStorage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    
    console.log(`🔍 API: Fetching KPI data for department: ${department || 'all'}`)
    
    // Get KPI values from storage
    const kpiData = await getKPIValues(department || undefined)
    
    console.log(`📊 API: Retrieved ${kpiData.length} KPI values`)
    
    // Transform the data to match the expected format for the dashboard
    const transformedData = kpiData.map(kpi => {
      // Map KPI names to proper units for all departments
      const unitMap: Record<string, string> = {
        // Front Office
        'Occupancy Rate': '%',
        'Average Daily Rate (ADR)': 'GHS/room',
        'Revenue per Available Room (RevPAR)': 'GHS/room',
        'Cancellation Rate': '%',
        'No-Show Rate': '%',
        
        // Food & Beverage
        'Covers': 'count',
        'Average Check': 'GHS/guest',
        'Food Cost %': '%',
        'RevPASH': 'GHS/seat-hour',
        'Table Turnover Rate': 'turns/hour',
        
        // Housekeeping
        'Rooms Cleaned per Shift': 'rooms',
        'Average Cleaning Time': 'minutes',
        'Inspection Pass Rate': '%',
        
        // Maintenance/Engineering
        'Mean Time To Repair (MTTR)': 'hours',
        'Mean Time Between Failures (MTBF)': 'hours',
        'PM Compliance Rate': '%',
        
        // Sales & Marketing
        'Direct Booking Ratio': '%',
        'Website Conversion Rate': '%',
        'Return on Ad Spend (ROAS)': 'x',
        
        // Finance
        'Gross Operating Profit (GOP) Margin': '%',
        'GOPPAR': 'GHS/room',
        'Total RevPAR (TRevPAR)': 'GHS/room',
        
        // HR
        'Staff-to-Room Ratio': 'staff/room',
        'Employee Turnover Rate': '%',
        'Absenteeism Rate': '%'
      }
      
      return {
        kpiName: kpi.kpiName,
        value: kpi.value || 0,
        unit: unitMap[kpi.kpiName] || kpi.unit || '',
        date: kpi.date ? new Date(kpi.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        department: kpi.department || 'Unknown',
        confidence: 0.95 // Default confidence for now
      }
    })
    
    // Get department summary for better insights
    const departmentSummary = transformedData.reduce((acc, kpi) => {
      acc[kpi.department] = (acc[kpi.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
      departments: Object.keys(departmentSummary),
      departmentSummary,
      filters: {
        department: department || 'all'
      }
    })
    
  } catch (error: any) {
    console.error('❌ API Error fetching KPI data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch KPI data' 
      },
      { status: 500 }
    )
  }
}
