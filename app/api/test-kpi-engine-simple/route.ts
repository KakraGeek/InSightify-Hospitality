import { NextRequest, NextResponse } from 'next/server'
import { KpiEngine } from '../../../kpi/engine'
import { ProcessedDataPoint } from '../../../lib/services/dataProcessor'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Testing KPI Engine (Simple)...')

    // Create mock data points for testing
    const mockDataPoints: ProcessedDataPoint[] = [
      {
        dataType: 'occupancy_rate',
        value: 85.5,
        textValue: '85.5%',
        date: new Date('2024-12-19'),
        source: 'pdf',
        sourceFile: 'test-data.pdf',
        department: 'Front Office',
        metadata: { confidence: 0.9 }
      },
      {
        dataType: 'revenue',
        value: 7500,
        textValue: 'GHS 7,500',
        date: new Date('2024-12-19'),
        source: 'pdf',
        sourceFile: 'test-data.pdf',
        department: 'Front Office',
        metadata: { confidence: 0.9 }
      },
      {
        dataType: 'guest_count',
        value: 120,
        textValue: '120 guests',
        date: new Date('2024-12-19'),
        source: 'pdf',
        sourceFile: 'test-data.pdf',
        department: 'Front Office',
        metadata: { confidence: 0.9 }
      }
    ]

    console.log(`📊 Mock data points created: ${mockDataPoints.length}`)

    // Test KPI Engine calculation
    const kpiInput = {
      dataPoints: mockDataPoints,
      department: 'Front Office',
      startDate: new Date('2024-12-19'),
      endDate: new Date('2024-12-19'),
      period: 'daily' as const
    }

    console.log('🔧 Calling KPI Engine...')
    const kpiResults = await KpiEngine.calculateKPIs(kpiInput)
    console.log(`✅ KPI Engine calculated ${kpiResults.length} KPIs`)

    const testResults = {
      success: true,
      message: 'KPI Engine test completed successfully (without database)',
      summary: {
        mockDataPoints: mockDataPoints.length,
        calculatedKPIs: kpiResults.length,
      },
      kpiResults,
      mockDataPoints: mockDataPoints.map(dp => ({
        dataType: dp.dataType,
        value: dp.value,
        department: dp.department,
        source: dp.source
      }))
    }

    console.log('🎉 KPI Engine test completed successfully!')
    return NextResponse.json(testResults)

  } catch (error: any) {
    console.error('❌ KPI Engine test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
