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
      // Map KPI names to proper units
      const unitMap: Record<string, string> = {
        'Occupancy Rate': '%',
        'Average Daily Rate (ADR)': 'GHS/room',
        'Revenue per Available Room (RevPAR)': 'GHS/room',
        'Guest Satisfaction': '/5',
        'Food Cost %': '%',
        'RevPASH': 'GHS/cover'
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
    
    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
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
