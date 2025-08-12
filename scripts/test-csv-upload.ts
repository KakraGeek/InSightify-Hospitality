import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

// Mock CSV data for testing
const mockCsvData = `Department,Metric,Value,Date
Front Office,Occupancy Rate,85.5,2024-01-15
Food & Beverage,Food Cost %,32.1,2024-01-15
Housekeeping,Cleanliness Score,4.8,2024-01-15
Maintenance,Preventive Maintenance %,78.3,2024-01-15
Sales & Marketing,Booking Lead Time,14.2,2024-01-15
Human Resources,Employee Turnover Rate,12.5,2024-01-15`

// Mock parseCsvForStorage function for testing
function parseCsvForStorage(csvText: string): Array<{
  dataType: string;
  value: number;
  date: string;
  department: string;
  source: string;
  sourceFile: string;
}> {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  const dataPoints: Array<{
    dataType: string;
    value: number;
    date: string;
    department: string;
    source: string;
    sourceFile: string;
  }> = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    
    if (row.Department && row.Metric && row.Value) {
      dataPoints.push({
        dataType: row.Metric,
        value: parseFloat(row.Value) || 0,
        date: row.Date || new Date().toISOString().split('T')[0],
        department: row.Department,
        source: 'test-csv',
        sourceFile: 'test-data.csv'
      })
    }
  }
  
  return dataPoints
}

async function testCsvUpload() {
  console.log('🧪 Testing CSV Upload Processing...')
  
  try {
    // Test CSV parsing
    const dataPoints = parseCsvForStorage(mockCsvData)
    console.log(`\n📊 Parsed ${dataPoints.length} data points from CSV`)
    
    // Show first 10 data points
    console.log('\n📋 Sample data points:')
    dataPoints.slice(0, 10).forEach((dp, index: number) => {
      console.log(`  ${index + 1}. ${dp.department} - ${dp.dataType}: ${dp.value}`)
    })
    
    // Show department distribution
    const deptCount = dataPoints.reduce((acc: Record<string, number>, dp) => {
      acc[dp.department] = (acc[dp.department] || 0) + 1
      return acc
    }, {})
    
    console.log('\n🏢 Department distribution:')
    Object.entries(deptCount).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} KPIs`)
    })
    
    // Show unique data types
    const uniqueDataTypes = [...new Set(dataPoints.map((dp) => dp.dataType))]
    console.log(`\n📈 Unique KPI types: ${uniqueDataTypes.length}`)
    console.log('Sample types:', uniqueDataTypes.slice(0, 10))
    
    console.log('\n✅ CSV upload test completed successfully!')
    
  } catch (error) {
    console.error('❌ CSV upload test failed:', error)
  }
}

testCsvUpload().catch(console.error)
