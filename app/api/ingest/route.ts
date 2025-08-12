import { NextResponse } from 'next/server'
import { IngestRequestSchema, IngestReportSchema } from '../../../lib/ingest/types'
import { validateCsv } from '../../../lib/ingest/csv'
import { parseWorkbook } from '../../../lib/ingest/xlsx'
import { parsePDF, isValidPDF } from '../../../lib/ingest/pdf'

// Remove edge runtime to support Node.js modules like pdf-parse
// export const runtime = 'edge'

/**
 * Parse CSV data and convert it to the format expected by the storage service
 */
async function parseCsvForStorage(csvText: string, department: string): Promise<any[]> {
  try {
    console.log('🔍 parseCsvForStorage: Starting CSV parsing...')
    console.log('🔍 parseCsvForStorage: Input department parameter:', department)
    
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    console.log('🔍 parseCsvForStorage: Headers:', headers)
    console.log('🔍 parseCsvForStorage: Total lines:', lines.length)
    
    const dataPoints = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(',').map(v => v.trim())
      if (values.length !== headers.length) continue
      
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      
      // Validate required columns
      if (!row.Department || !row.Metric || !row.Value) {
        console.log(`⚠️ parseCsvForStorage: Skipping row ${i + 1} - missing required data:`, row)
        continue
      }
      
      // Convert to the format expected by the storage service
      // Use the EXACT metric name from CSV, don't convert to snake_case
      // ALWAYS use the Department from the CSV row, don't fall back to form parameter
      const dataPoint = {
        department: row.Department, // Always use CSV department, no fallback
        dataType: row.Metric || 'unknown_metric', // Keep original metric name
        value: parseFloat(row.Value) || null,
        textValue: row.Value || null,
        date: new Date(row.Date || new Date()),
        source: 'csv',
        sourceFile: 'comprehensive-test-report.csv',
        metadata: { 
          extractedFrom: `${row.Metric}: ${row.Value} ${row.Unit || ''}`,
          unit: row.Unit || 'unknown',
          originalRow: row
        }
      }
      
      dataPoints.push(dataPoint)
    }
    
    console.log(`🔍 parseCsvForStorage: Converted ${dataPoints.length} rows to data points`)
    console.log('🔍 parseCsvForStorage: Sample data types:', dataPoints.slice(0, 5).map(dp => dp.dataType))
    
    // Log department distribution
    const deptCount = dataPoints.reduce((acc, dp) => {
      acc[dp.department] = (acc[dp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('🔍 parseCsvForStorage: Department distribution:')
    Object.entries(deptCount).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} KPIs`)
    })
    
    console.log('🔍 parseCsvForStorage: Returning', dataPoints.length, 'data points')
    return dataPoints
    
  } catch (error) {
    console.error('❌ parseCsvForStorage: Error parsing CSV:', error)
    return []
  }
}

async function fetchGDriveFile(link: string) {
  try {
    // Accept full link or file id; produce a download URL
    const idMatch = link.match(/[-\w]{25,}/)
    const fileId = idMatch ? idMatch[0] : undefined
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : link
    const res = await fetch(downloadUrl)
    if (!res.ok) throw new Error(`fetch failed ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (_e) {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => null)

    const sourceTypeStr = (form?.get('sourceType') || '').toString()
    const department = form?.get('department') ? String(form.get('department')) : undefined
    const parse = IngestRequestSchema.safeParse({
      sourceType: sourceTypeStr,
      department,
      link: form?.get('link') ? String(form.get('link')) : undefined,
    })
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: parse.error.flatten() },
        { status: 400 }
      )
    }

    const { sourceType } = parse.data
    const file = form?.get('file') as unknown as File | undefined

    if ((sourceType === 'gdrive' || sourceType === 'pdf') && !parse.data.link && !file) {
      return NextResponse.json({ error: 'Provide a link or file' }, { status: 400 })
    }
    if (!file && sourceType !== 'gdrive' && sourceType !== 'pdf') {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    let report: any = {
      status: 'accepted',
      sourceType,
      bytes: 0,
      filename: undefined as string | undefined,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      sampleErrors: [] as string[],
    }

    if (file) {
      switch (sourceType) {
        case 'csv': {
          const text = await file.text()
          const bytes = file.size
          console.log('🔍 Ingest: Processing CSV file:', file.name, 'Size:', bytes, 'bytes')
          
          // Validate CSV format
          const res = await validateCsv(file.stream() as any, parse.data.department)
          console.log('🔍 Ingest: CSV validation result:', res)
          
          if (res.validRows > 0) {
            try {
              console.log('🔍 Ingest: CSV validation successful, storing data...')
              
              // Parse CSV data for storage
              console.log('🔍 Ingest: About to call parseCsvForStorage...')
              const csvData = await parseCsvForStorage(text, department || 'Front Office')
              console.log('🔍 Ingest: parseCsvForStorage completed, got', csvData.length, 'data points')
              
              if (csvData.length > 0) {
                // Store the processed data using the report storage service
                const { ReportStorageService } = await import('../../../lib/services/reportStorage')
                console.log('🔍 Ingest: Calling ReportStorageService.storeProcessedDataAsReport for CSV...')
                console.log('🔍 Ingest: CSV data sample:', csvData.slice(0, 3).map(dp => ({ dataType: dp.dataType, department: dp.department, value: dp.value })))
                
                // Use system user ID for automated operations
                const systemUserId = '00000000-0000-0000-0000-000000000000'
                console.log('🔍 Ingest: About to store CSV data with department:', department || 'Front Office')
                const storageResult = await ReportStorageService.storeProcessedDataAsReport(
                  csvData,
                  department || 'Front Office',
                  systemUserId,
                  file.name
                )
                console.log('✅ Ingest: CSV storage result:', storageResult)
                
                report = { 
                  ...report, 
                  ...res, 
                  filename: file.name,
                  message: `CSV processed successfully: ${res.validRows} rows stored in database`,
                  metadata: {
                    storedRows: csvData.length,
                    storageResult
                  }
                }
              } else {
                console.log('⚠️ Ingest: No valid data to store from CSV')
                report = { ...report, ...res, filename: file.name, error: 'No valid data to store' }
              }
            } catch (error) {
              console.log('❌ Ingest: CSV storage failed:', error)
              report = { ...report, ...res, filename: file.name, error: `Storage failed: ${error instanceof Error ? error.message : String(error)}` }
            }
          } else {
            console.log('⚠️ Ingest: CSV validation failed, no valid rows')
            report = { ...report, ...res, filename: file.name }
          }
          break
        }
        case 'xls':
        case 'xlsx': {
          // Parse workbook to CSV, then validate CSV text via a synthetic stream
          const ab = await file.arrayBuffer()
          const bytes = ab.byteLength
          // Reuse parseWorkbook by constructing a stream from the ArrayBuffer
          const binaryStream = (async function* () {
            yield new Uint8Array(ab)
          })()
          const res = await parseWorkbook(binaryStream)
          const csvStream = (async function* () {
            yield new TextEncoder().encode(res.csv)
          })()
          const out = await validateCsv(csvStream, parse.data.department)
          report = { ...report, ...out, bytes, filename: file.name }
          break
        }
        case 'pdf': {
          const buf = await file.arrayBuffer()
          const buffer = Buffer.from(buf)
          
          // Validate PDF format
          if (!isValidPDF(buffer)) {
            report = { ...report, bytes: buf.byteLength, filename: file.name, error: 'Invalid PDF format' }
            break
          }
          
          try {
            console.log('🔍 Ingest: Starting PDF processing for file:', file.name)
            
            // Parse PDF content
            const pdfResult = await parsePDF(buffer, {
              extractTables: true,
              extractMetadata: true,
              maxPages: 50
            })
            
            if (pdfResult.error) {
              console.log('❌ Ingest: PDF parsing failed:', pdfResult.error)
              report = { ...report, bytes: buf.byteLength, filename: file.name, error: pdfResult.error }
            } else {
              console.log('✅ Ingest: PDF parsed successfully. Pages:', pdfResult.pageCount, 'Tables:', pdfResult.tables.length)
              
                             // Process PDF data to extract meaningful metrics
               const { processPDFData } = await import('../../../lib/services/dataProcessor')
               console.log('🔍 Ingest: Calling processPDFData...')
               
               // Set a default department if none is specified
               const effectiveDepartment = department || 'Front Office'
               const processingResult = await processPDFData(pdfResult, effectiveDepartment, file.name)
              
              if (processingResult.success) {
                console.log('✅ Ingest: Data processing successful. Extracted metrics:', processingResult.summary)
                
                                 // Store the processed data using the new report storage service
                 const { ReportStorageService } = await import('../../../lib/services/reportStorage')
                 console.log('🔍 Ingest: Calling ReportStorageService.storeProcessedDataAsReport...')
                 
                 // Use system user ID for automated operations
                 const systemUserId = '00000000-0000-0000-0000-000000000000'
                 
                 const storageResult = await ReportStorageService.storeProcessedDataAsReport(
                   processingResult.dataPoints, 
                   effectiveDepartment,
                   systemUserId,
                   file.name
                 )
                console.log('✅ Ingest: Report storage result:', storageResult)
                
                const textLength = pdfResult.text.length
                const tableCount = pdfResult.tables.length
                const extractedMetrics = processingResult.summary
                
                report = {
                  ...report,
                  bytes: buf.byteLength,
                  filename: file.name,
                  totalRows: tableCount,
                  validRows: extractedMetrics.totalExtracted,
                  invalidRows: 0,
                  message: `PDF processed successfully: ${pdfResult.pageCount} pages, ${textLength} characters, ${tableCount} tables, ${extractedMetrics.totalExtracted} metrics extracted`,
                  metadata: {
                    pageCount: pdfResult.pageCount,
                    textLength,
                    tableCount,
                    extractedMetrics,
                    storageResult
                  }
                }
              } else {
                console.log('❌ Ingest: Data processing failed:', processingResult.errors)
                report = { ...report, bytes: buf.byteLength, filename: file.name, error: `Data processing failed: ${processingResult.errors.join(', ')}` }
              }
            }
          } catch (error: any) {
            console.log('❌ Ingest: PDF processing error:', error.message)
            report = { ...report, bytes: buf.byteLength, filename: file.name, error: `PDF processing failed: ${error.message}` }
          }
          break
        }
      }
    }

    if (parse.data.link && !file) {
      if (sourceType === 'gdrive') {
        const data = await fetchGDriveFile(parse.data.link)
        if (!data) {
          return NextResponse.json({ error: 'Unable to fetch Google Drive link' }, { status: 400 })
        }
        report.bytes = data.byteLength
        report.filename = parse.data.link
      } else if (sourceType === 'pdf') {
        try {
          const res = await fetch(parse.data.link)
          if (!res.ok) {
            return NextResponse.json({ error: 'Unable to fetch PDF link' }, { status: 400 })
          }
          const buf = await res.arrayBuffer()
          const buffer = Buffer.from(buf)
          
          // Validate PDF format
          if (!isValidPDF(buffer)) {
            report = { ...report, bytes: buf.byteLength, filename: parse.data.link, error: 'Invalid PDF format' }
          } else {
            // Parse PDF content
            const pdfResult = await parsePDF(buffer, {
              extractTables: true,
              extractMetadata: true,
              maxPages: 50
            })
            
            if (pdfResult.error) {
              report = { ...report, bytes: buf.byteLength, filename: parse.data.link, error: pdfResult.error }
            } else {
              const extractedData = pdfResult.structuredData
              const textLength = pdfResult.text.length
              const tableCount = pdfResult.tables.length
              
              report = {
                ...report,
                bytes: buf.byteLength,
                filename: parse.data.link,
                totalRows: tableCount,
                validRows: tableCount,
                invalidRows: 0,
                message: `PDF parsed successfully: ${pdfResult.pageCount} pages, ${textLength} characters, ${tableCount} tables detected`,
                metadata: {
                  pageCount: pdfResult.pageCount,
                  textLength,
                  tableCount,
                  extractedData
                }
              }
            }
          }
        } catch (error: any) {
          report = { ...report, bytes: 0, filename: parse.data.link, error: `PDF processing failed: ${error.message}` }
        }
      }
    }

    const ok = IngestReportSchema.safeParse(report)
    if (!ok.success) {
      return NextResponse.json({ error: 'Internal report validation failed' }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
