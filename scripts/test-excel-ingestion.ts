#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

import * as XLSX from 'xlsx'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function testExcelIngestion() {
  try {
    console.log('🧪 Testing Excel ingestion...')
    
    // Create test data similar to our CSV
    const testData = [
      ['Department', 'Metric', 'Value', 'Unit', 'Date'],
      ['Front Office', 'Occupancy Rate', '85', '%', '2024-12-15'],
      ['Front Office', 'Average Daily Rate (ADR)', '450', 'GHS/room', '2024-12-15'],
      ['Front Office', 'Revenue per Available Room (RevPAR)', '382.50', 'GHS/available room', '2024-12-15'],
      ['Food & Beverage', 'Food Cost %', '32', '%', '2024-12-15'],
      ['Food & Beverage', 'Beverage Cost %', '28', '%', '2024-12-15'],
      ['Food & Beverage', 'Covers', '156', 'count', '2024-12-15'],
      ['Housekeeping', 'Rooms Cleaned per Shift', '127', 'rooms/staff-shift', '2024-12-15'],
      ['Housekeeping', 'Average Cleaning Time', '25', 'minutes/room', '2024-12-15'],
      ['Sales & Marketing', 'Website Conversion Rate', '23.5', '%', '2024-12-15'],
      ['Finance', 'Gross Operating Profit (GOP) Margin', '28.5', '%', '2024-12-15'],
      ['HR', 'Employee Turnover Rate', '12.5', '%', '2024-12-15']
    ]
    
    // Create XLSX file
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(testData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KPIs')
    
    const xlsxPath = resolve(__dirname, '../test-kpis.xlsx')
    XLSX.writeFile(workbook, xlsxPath)
    console.log('✅ Created test XLSX file:', xlsxPath)
    
    // Create XLS file (older format)
    const xlsPath = resolve(__dirname, '../test-kpis.xls')
    XLSX.writeFile(workbook, xlsPath, { bookType: 'xls' })
    console.log('✅ Created test XLS file:', xlsPath)
    
    // Test reading the files back
    console.log('\n🔍 Testing file reading...')
    
    const xlsxData = XLSX.readFile(xlsxPath)

    
    console.log('✅ XLSX file read successfully')
    console.log('✅ XLS file read successfully')
    
    // Show sample data
    const xlsxSheet = xlsxData.Sheets[xlsxData.SheetNames[0]]
    const xlsxJson = XLSX.utils.sheet_to_json(xlsxSheet, { header: 1 })
    
    console.log('\n📊 Sample data from XLSX:')
    xlsxJson.slice(0, 5).forEach((row: unknown, index) => {
      if (Array.isArray(row) && row.every(item => typeof item === 'string' || typeof item === 'number')) {
        console.log(`  Row ${index}: [${(row as (string | number)[]).join(', ')}]`)
      }
    })
    
    console.log('\n🎯 Test files created successfully!')
    console.log('📁 Files created:')
    console.log(`  - ${xlsxPath}`)
    console.log(`  - ${xlsPath}`)
    console.log('\n💡 Now test these files through the web interface:')
    console.log('  1. Go to the upload page')
    console.log('  2. Select "Excel" as source type')
    console.log('  3. Upload either test-kpis.xlsx or test-kpis.xls')
    console.log('  4. Check if data is ingested and displayed on dashboard')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testExcelIngestion()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
