import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing data processing pipeline...')
    const { processPDFData } = await import('../../../lib/services/dataProcessor')
    const { storeProcessedData, getKPIValues } = await import('../../../lib/services/dataStorage')

    const mockPDFResult = {
      text: `Daily Hotel Report - December 15, 2024
      
      Front Office Metrics:
      - Occupancy Rate: 87.5%
              - Average Daily Rate: ₵131.25
        - Revenue: ₵13,125.00
      - Guest Count: 89
      - Additional Guests: 16
      - Total Guests: 105
      
      Food & Beverage:
      - Breakfast Covers: 32.5
      - Lunch Covers: 28.1
      - Dinner Covers: 156
              - Bar Revenue: ₵28.50`,
      tables: [
        [
          ['Date', 'Occupancy', 'ADR', 'Revenue', 'Guests'],
          ['2024-12-15', '87.5%', '₵131.25', '₵13,125.00', '89']
        ]
      ],
      pageCount: 1,
      metadata: {
        title: 'Daily Hotel Report',
        author: 'System',
        creationDate: '2024-12-15'
      },
      structuredData: {}
    }

    console.log('🧪 Mock PDF data created, processing...')
    const processingResult = await processPDFData(mockPDFResult, 'Front Office', 'test-report.pdf')
    
    if (!processingResult.success) {
      console.error('❌ Processing failed:', processingResult.errors)
      return NextResponse.json({
        success: false,
        error: 'Data processing failed',
        details: processingResult.errors
      }, { status: 500 })
    }

    console.log('🧪 Processing successful, storing data...')
    console.log('🧪 Data points to store:', processingResult.dataPoints.length)
    
    const storageResult = await storeProcessedData(processingResult.dataPoints, 'Front Office')
    
    if (!storageResult.success) {
      console.error('❌ Storage failed:', storageResult.errors)
      return NextResponse.json({
        success: false,
        error: 'Data storage failed',
        details: storageResult.errors
      }, { status: 500 })
    }

    console.log('🧪 Storage successful, retrieving KPIs...')
    const kpiData = await getKPIValues('Front Office')
    console.log('🧪 Retrieved KPI data:', kpiData.length, 'KPIs')

    return NextResponse.json({
      success: true,
      message: 'Data processing pipeline test completed successfully',
      results: {
        processing: processingResult.summary,
        storage: { storedCount: storageResult.storedCount, errors: storageResult.errors },
        kpis: kpiData,
        extractedData: processingResult.dataPoints.map(point => ({
          type: point.dataType, value: point.value, date: point.date.toISOString(), source: point.source
        }))
      }
    })
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
