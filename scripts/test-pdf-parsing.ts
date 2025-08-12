import { readFileSync } from 'fs'
import { parsePDF, isValidPDF } from '../lib/ingest/pdf'
import { processPDFData } from '../lib/services/dataProcessor'

async function testPDFParsing() {
  console.log('🧪 Testing PDF Parsing Step by Step...')
  
  try {
    // Step 1: Read the generated PDF file
    console.log('\n📖 Step 1: Reading PDF file...')
    const pdfBuffer = readFileSync('comprehensive-test-report.pdf')
    console.log(`✅ PDF file read successfully. Size: ${pdfBuffer.length} bytes`)
    
    // Step 2: Validate PDF format
    console.log('\n🔍 Step 2: Validating PDF format...')
    const isValid = isValidPDF(pdfBuffer)
    console.log(`✅ PDF format validation: ${isValid ? 'PASSED' : 'FAILED'}`)
    
    if (!isValid) {
      console.log('❌ PDF format is invalid, stopping test')
      return
    }
    
    // Step 3: Parse PDF content
    console.log('\n📄 Step 3: Parsing PDF content...')
    const pdfResult = await parsePDF(pdfBuffer, {
      extractTables: true,
      extractMetadata: true,
      maxPages: 50
    })
    
    if (pdfResult.error) {
      console.log('❌ PDF parsing failed:', pdfResult.error)
      return
    }
    
    console.log('✅ PDF parsed successfully!')
    console.log(`📊 Pages: ${pdfResult.pageCount}`)
    console.log(`📊 Text length: ${pdfResult.text.length} characters`)
    console.log(`📊 Tables: ${pdfResult.tables.length}`)
    console.log(`📊 Metadata:`, pdfResult.metadata)
    
    // Step 4: Show text preview
    console.log('\n📝 Step 4: Text preview (first 500 characters):')
    console.log(pdfResult.text.substring(0, 500))
    
    // Step 5: Process PDF data
    console.log('\n🔧 Step 5: Processing PDF data...')
    const processingResult = await processPDFData(pdfResult, 'Front Office', 'comprehensive-test-report.pdf')
    
    if (processingResult.success) {
      console.log('✅ Data processing successful!')
      console.log(`📊 Total extracted: ${processingResult.summary.totalExtracted}`)
      console.log(`📊 Other data: ${processingResult.summary.otherData}`)
      
      // Show sample data points
      if (processingResult.dataPoints.length > 0) {
        console.log('\n📊 Sample data points:')
        processingResult.dataPoints.slice(0, 5).forEach((dp, index) => {
          console.log(`${index + 1}. ${dp.dataType}: ${dp.value} (${dp.department})`)
        })
      }
    } else {
      console.log('❌ Data processing failed:', processingResult.errors)
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

testPDFParsing().catch(console.error)
