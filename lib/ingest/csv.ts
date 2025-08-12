import Papa from 'papaparse'
import { getSchemaForDepartment, validateDataWithSchema } from './schemas'

function sanitizeCsvText(text: string): string {
  // Remove common markdown code-fence markers from AI-generated samples
  const withoutFences = text
    .replace(/```csv\s*/gi, '')
    .replace(/```\s*/g, '')
  // Trim BOM and surrounding whitespace
  return withoutFences.replace(/^\uFEFF/, '').trim()
}

export async function validateCsv(stream: AsyncIterable<Uint8Array>, department?: string) {
  const decoder = new TextDecoder()
  let csvText = ''
  for await (const chunk of stream) {
    csvText += decoder.decode(chunk, { stream: true })
  }
  csvText += decoder.decode()

  csvText = sanitizeCsvText(csvText)

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy' })
  if (parsed.errors?.length) {
    return {
      bytes: new Blob([csvText]).size,
      totalRows: parsed.data.length || 0,
      validRows: 0,
      invalidRows: parsed.data.length || 0,
      sampleErrors: parsed.errors.slice(0, 3).map((e: any) => `Row ${e.row}: ${e.message}`),
      warnings: [],
      metadata: {
        department: department || 'unknown',
        validationSchema: 'generic',
        dataQuality: { completeness: 0, errorRate: 100 }
      }
    }
  }

  const rows = parsed.data as any[]

  // If department is not specified (e.g., "All Departments"), accept all rows
  if (!department) {
    return {
      bytes: new Blob([csvText]).size,
      totalRows: rows.length,
      validRows: rows.length,
      invalidRows: 0,
      sampleErrors: [],
      warnings: [],
      metadata: {
        department: 'all',
        validationSchema: 'generic',
        dataQuality: { completeness: 100, errorRate: 0 }
      }
    }
  }

  // Use enhanced validation with detailed error reporting
  const schema = getSchemaForDepartment(department)
  const validationResult = validateDataWithSchema(rows, schema, department)
  
  // Convert errors and warnings to string format for API response
  const sampleErrors = validationResult.errors.slice(0, 5).map(err => 
    `Row ${err.row}, ${err.field}: ${err.message}`
  )
  
  const warnings = validationResult.warnings.slice(0, 5).map(warn => 
    `Row ${warn.row}, ${warn.field}: ${warn.message}`
  )

  // Calculate additional metadata
  const metadata = {
    department: department,
    validationSchema: 'department-specific',
    dataQuality: {
      completeness: (validationResult.validRows / validationResult.totalRows) * 100,
      errorRate: (validationResult.invalidRows / validationResult.totalRows) * 100
    },
    businessRules: validationResult.warnings.length > 0 ? 'warnings_detected' : 'passed'
  }

  return {
    bytes: new Blob([csvText]).size,
    totalRows: validationResult.totalRows,
    validRows: validationResult.validRows,
    invalidRows: validationResult.invalidRows,
    sampleErrors,
    warnings,
    metadata
  }
}
