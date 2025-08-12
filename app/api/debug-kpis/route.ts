import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking KPI data storage...')
    
    // Import our data storage service
    const { getKPIValues } = await import('../../../lib/services/dataStorage')
    const kpiData = await getKPIValues()
    
    console.log(`🔍 Debug: getKPIValues returned ${kpiData.length} KPIs`)
    
    return NextResponse.json({
      success: true,
      message: 'KPI data storage debug info',
      debug: {
        kpiCount: kpiData.length,
        kpis: kpiData,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error(`❌ Debug endpoint error: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
