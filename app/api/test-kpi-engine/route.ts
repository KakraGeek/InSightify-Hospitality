import { NextRequest, NextResponse } from 'next/server'
import { KpiEngine } from '../../../kpi/engine'
import { ReportStorageService } from '../../../lib/services/reportStorage'
import { ProcessedDataPoint } from '../../../lib/services/dataProcessor'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Testing KPI Engine...')

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
      },
      {
        dataType: 'food_beverage_metric',
        value: 180,
        textValue: 'GHS 180',
        date: new Date('2024-12-19'),
        source: 'pdf',
        sourceFile: 'test-data.pdf',
        department: 'Food & Beverage',
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

    // Test Report Storage Service
    console.log('💾 Testing Report Storage Service...')
    
    // Store processed data as report
    const dataStorageResult = await ReportStorageService.storeProcessedDataAsReport(
      mockDataPoints,
      'Front Office',
      'test-user-id',
      'test-data.pdf'
    )
    console.log(`✅ Data stored as report: ${dataStorageResult.reportId}`)

    // Store calculated KPIs
    const kpiStorageResult = await ReportStorageService.storeCalculatedKPIs(
      kpiResults,
      'Front Office',
      'test-user-id'
    )
    console.log(`✅ KPIs stored as report: ${kpiStorageResult.reportId}`)

    // Retrieve stored data
    const storedKPIs = await ReportStorageService.getKPIValues('Front Office')
    const storedReports = await ReportStorageService.getReports('Front Office', 5)

    const testResults = {
      success: true,
      message: 'KPI Engine and Report Storage Service test completed successfully',
      summary: {
        mockDataPoints: mockDataPoints.length,
        calculatedKPIs: kpiResults.length,
        dataReportId: dataStorageResult.reportId,
        kpiReportId: kpiStorageResult.reportId,
        storedKPIs: storedKPIs.length,
        storedReports: storedReports.length
      },
      kpiResults,
      storedKPIs: storedKPIs.slice(0, 3), // Show first 3 for brevity
      storedReports: storedReports.slice(0, 2) // Show first 2 for brevity
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
