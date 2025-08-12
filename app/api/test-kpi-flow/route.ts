import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Test KPI Flow: Starting test...')

    // Import and call getKPIValues exactly like the dashboard does
    const { getKPIValues } = await import('../../../lib/services/dataStorage')
    console.log('🔍 Test KPI Flow: getKPIValues imported successfully')
    
    const kpiData = await getKPIValues()
    console.log('🔍 Test KPI Flow: getKPIValues completed, data:', kpiData)
    
    // Simulate the dashboard logic
    const testKPI = {
      name: 'Occupancy Rate',
      department: 'Front Office'
    }
    
    const realData = kpiData.find(k => k.kpiName === testKPI.name && k.department === testKPI.department)
    console.log('🔍 Test KPI Flow: Looking for KPI:', testKPI)
    console.log('🔍 Test KPI Flow: Found real data:', realData)
    
    return NextResponse.json({
      success: true,
      message: 'KPI flow test completed',
      test: {
        kpiDataLength: kpiData.length,
        kpiData: kpiData,
        testKPI,
        realData,
        enhancedKPI: {
          ...testKPI,
          realValue: realData?.value,
          lastUpdated: realData?.date
        }
      }
    })
  } catch (error: any) {
    console.error(`❌ Test KPI Flow error: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
