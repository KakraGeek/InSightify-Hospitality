import { processPDFData } from '../lib/services/dataProcessor'

// Test PDF text with comprehensive KPI data
const testPDFText = `
Daily Hotel Performance Report - December 15, 2024

Front Office Metrics:
Occupancy Rate: 85%
Guest Count: 127
Average Daily Rate: GHS 450
Revenue per Available Room: GHS 382.50
Booking Lead Time: 14 days
Cancellation Rate: 8.5%
No-Show Rate: 3.2%

Food & Beverage Metrics:
Food Cost: 32%
Beverage Cost: 28%
Covers: 156
Average Check: GHS 85
Table Turnover: 2.8
Waste: 4.2%
Void/Comp: 2.1%
Food Revenue: GHS 13,260
Beverage Revenue: GHS 8,450
RevPASH: GHS 45

Housekeeping Metrics:
Rooms Cleaned: 127
Cleaning Time: 25 minutes
Room Turnaround: 2.5 hours
Inspection Pass: 96%
Out-of-Order: 2.1%
Linen Cost: GHS 15.50
Guest Room Defect: 1.8%
Chemical Cost: GHS 8.75
HK Staff Efficiency: 92%
Guest Satisfaction: 4.6/5

Maintenance/Engineering Metrics:
Maintenance Cost: GHS 45.80
Energy Consumption: 12.5 kWh
Equipment Uptime: 98.5%
Preventive Maintenance: 95%
Response Time: 18 minutes
Work Order Completion: 94%
Vendor Performance: 4.2/5
Safety Incidents: 0
Energy Efficiency: 87%
Maintenance Staff Efficiency: 89%

Sales & Marketing Metrics:
Conversion Rate: 23.5%
Lead Generation: 45
Customer Acquisition Cost: GHS 125
Email Open Rate: 34.2%
Click Through Rate: 8.7%
Social Media Engagement: 67%
Website Traffic: 1,250
Booking Conversion: 18.9%
Customer Lifetime Value: GHS 2,450
Marketing ROI: 320%

Finance Metrics:
Profit Margin: 28.5%
Operating Expenses: GHS 45,680
Cash Flow: GHS 23,450
Debt to Equity: 0.45
Return on Investment: 18.7%
Accounts Receivable: GHS 12,340
Accounts Payable: GHS 8,760
Inventory Turnover: 4.2
Working Capital: GHS 67,890
Cost per Room: GHS 125.50

HR Metrics:
Employee Turnover: 12.5%
Training Completion: 87%
Employee Satisfaction: 4.3/5
Time to Hire: 18 days
Cost per Hire: GHS 2,450
Productivity per Employee: 94%
Absenteeism Rate: 3.8%
Training Cost: GHS 8,760
Performance Rating: 4.1/5
Retention Rate: 87.5%
`

async function testKPIExtraction() {
  console.log('🧪 Testing KPI Extraction for all 55 KPIs...')
  
  try {
    // Mock PDF result
    const mockPDFResult = {
      text: testPDFText,
      tables: [],
      pageCount: 1,
      error: undefined,
      metadata: {},
      structuredData: {}
    }
    
    // Process the test data
    const result = await processPDFData(mockPDFResult, 'Front Office', 'test-file.pdf')
    
    if (result.success) {
      console.log('✅ KPI extraction successful!')
      console.log(`📊 Total data points extracted: ${result.summary.totalExtracted}`)
      console.log(`📊 Occupancy data: ${result.summary.occupancyData}`)
      console.log(`📊 Revenue data: ${result.summary.revenueData}`)
      console.log(`📊 Guest data: ${result.summary.guestData}`)
      console.log(`📊 Other data: ${result.summary.otherData}`)
      
      console.log('\n🔍 Sample extracted data points:')
      result.dataPoints.slice(0, 10).forEach((point, index) => {
        console.log(`${index + 1}. ${point.dataType}: ${point.value} (${point.department})`)
      })
      
      // Check if we're getting close to 55 KPIs
      if (result.summary.totalExtracted >= 40) {
        console.log('\n🎉 SUCCESS: KPI extraction is working well!')
        console.log(`Expected: ~55 KPIs, Actual: ${result.summary.totalExtracted}`)
      } else {
        console.log('\n⚠️ WARNING: KPI extraction may need improvement')
        console.log(`Expected: ~55 KPIs, Actual: ${result.summary.totalExtracted}`)
      }
      
    } else {
      console.log('❌ KPI extraction failed:')
      console.log(result.errors)
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testKPIExtraction()
