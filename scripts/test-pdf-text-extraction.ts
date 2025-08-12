#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { parsePDF } from '../lib/ingest/pdf'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function testPDFTextExtraction() {
  try {
    console.log('🔍 Testing PDF text extraction...')
    
    // Read the test PDF file
    const pdfPath = resolve(__dirname, '../comprehensive-test-report.pdf')
    console.log('📄 PDF path:', pdfPath)
    
    const pdfBuffer = readFileSync(pdfPath)
    console.log('📊 PDF buffer size:', pdfBuffer.length, 'bytes')
    
    // Parse the PDF
    console.log('🔍 Parsing PDF...')
    const pdfResult = await parsePDF(pdfBuffer, {
      extractTables: true,
      extractMetadata: true,
      maxPages: 50
    })
    
    if (pdfResult.error) {
      console.error('❌ PDF parsing failed:', pdfResult.error)
      return
    }
    
    console.log('✅ PDF parsed successfully!')
    console.log('📊 Page count:', pdfResult.pageCount)
    console.log('📊 Text length:', pdfResult.text.length)
    console.log('📊 Tables found:', pdfResult.tables.length)
    
    // Show the first 500 characters of extracted text
    console.log('\n📝 First 500 characters of extracted text:')
    console.log('=' .repeat(80))
    console.log(pdfResult.text.substring(0, 500))
    console.log('=' .repeat(80))
    
    // Show the last 500 characters
    console.log('\n📝 Last 500 characters of extracted text:')
    console.log('=' .repeat(80))
    console.log(pdfResult.text.substring(Math.max(0, pdfResult.text.length - 500)))
    console.log('=' .repeat(80))
    
    // Look for department headers
    console.log('\n🔍 Searching for department headers...')
    const departmentHeaders = [
      'front office',
      'food & beverage',
      'housekeeping',
      'maintenance/engineering',
      'sales & marketing',
      'finance',
      'hr'
    ]
    
    departmentHeaders.forEach(header => {
      const index = pdfResult.text.toLowerCase().indexOf(header.toLowerCase())
      if (index !== -1) {
        console.log(`✅ Found "${header}" at index ${index}`)
        // Show context around the header
        const context = pdfResult.text.substring(Math.max(0, index - 50), index + 100)
        console.log(`   Context: "${context}"`)
      } else {
        console.log(`❌ "${header}" not found`)
      }
    })
    
    // Look for KPI patterns
    console.log('\n🔍 Searching for KPI patterns...')
    const kpiPatterns = [
      'occupancy rate',
      'food cost',
      'rooms cleaned',
      'maintenance cost',
      'conversion rate',
      'profit margin',
      'employee turnover'
    ]
    
    kpiPatterns.forEach(pattern => {
      const index = pdfResult.text.toLowerCase().indexOf(pattern.toLowerCase())
      if (index !== -1) {
        console.log(`✅ Found "${pattern}" at index ${index}`)
        // Show context around the KPI
        const context = pdfResult.text.substring(Math.max(0, index - 30), index + 50)
        console.log(`   Context: "${context}"`)
      } else {
        console.log(`❌ "${pattern}" not found`)
      }
    })
    
    // Show table data if any
    if (pdfResult.tables.length > 0) {
      console.log('\n📊 Table data found:')
      pdfResult.tables.forEach((table, index) => {
        console.log(`\nTable ${index + 1}:`)
        table.forEach((row, rowIndex) => {
          console.log(`  Row ${rowIndex}: [${row.join(', ')}]`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testPDFTextExtraction()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
