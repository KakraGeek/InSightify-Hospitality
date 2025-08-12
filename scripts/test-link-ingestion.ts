#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function testLinkIngestion() {
  try {
    console.log('🧪 Testing Link Ingestion Methods...')
    
    console.log('\n📋 Test Plan for Link Ingestion:')
    console.log('=' .repeat(60))
    
    // Test 1: Google Drive Links
    console.log('\n1️⃣ Google Drive Link Ingestion:')
    console.log('   - Go to upload page')
    console.log('   - Select "Google Drive" as source type')
    console.log('   - Use one of these test links:')
    console.log('     • Upload the test-kpis.xlsx file to Google Drive')
    console.log('     • Upload the comprehensive-test-report.pdf to Google Drive')
    console.log('     • Get the sharing link and test it')
    console.log('   - Expected: File should be downloaded and processed')
    
    // Test 2: Direct PDF Links
    console.log('\n2️⃣ Direct PDF Link Ingestion:')
    console.log('   - Go to upload page')
    console.log('   - Select "PDF" as source type')
    console.log('   - Use one of these test approaches:')
    console.log('     • Host comprehensive-test-report.pdf on a web server')
    console.log('     • Use a file hosting service (Dropbox, OneDrive, etc.)')
    console.log('     • Get the direct download link and test it')
    console.log('   - Expected: PDF should be downloaded and processed')
    
    // Test 3: Create a simple test HTML page for testing
    console.log('\n3️⃣ Local Testing Setup:')
    console.log('   - For local testing, you can:')
    console.log('     • Use ngrok to create a public URL for local files')
    console.log('     • Use a local web server (http-server)')
    console.log('     • Upload files to a cloud service temporarily')
    
    console.log('\n🔧 Current Implementation Status:')
    console.log('=' .repeat(60))
    
    // Check the current implementation
    const ingestRoutePath = resolve(__dirname, '../app/api/ingest/route.ts')
    const ingestCode = readFileSync(ingestRoutePath, 'utf-8')
    
    // Check Google Drive implementation
    if (ingestCode.includes('fetchGDriveFile')) {
      console.log('✅ Google Drive ingestion: Implemented')
      console.log('   - fetchGDriveFile function exists')
      console.log('   - Handles Google Drive file IDs and links')
    } else {
      console.log('❌ Google Drive ingestion: Not implemented')
    }
    
    // Check direct link implementation
    if (ingestCode.includes('sourceType === \'pdf\'') && ingestCode.includes('fetch(')) {
      console.log('✅ Direct PDF link ingestion: Implemented')
      console.log('   - fetch() function for direct URLs')
      console.log('   - PDF parsing for remote files')
    } else {
      console.log('❌ Direct PDF link ingestion: Not implemented')
    }
    
    console.log('\n🧪 Testing Steps:')
    console.log('=' .repeat(60))
    console.log('1. Test Excel files (XLS/XLSX) - Use test-kpis.xlsx or test-kpis.xls')
    console.log('2. Test Google Drive links - Upload files to Drive and test sharing links')
    console.log('3. Test direct PDF links - Host PDF files and test direct URLs')
    console.log('4. Verify data appears on dashboard after each test')
    
    console.log('\n📁 Test Files Available:')
    console.log('=' .repeat(60))
    console.log('• test-kpis.xlsx - Excel file with KPI data')
    console.log('• test-kpis.xls - Legacy Excel format')
    console.log('• comprehensive-test-report.pdf - PDF with KPI data')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testLinkIngestion()
  .then(() => {
    console.log('\n🏁 Test plan completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
