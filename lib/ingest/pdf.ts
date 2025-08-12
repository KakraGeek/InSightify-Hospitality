// Ensure this module only runs on the server side
let pdf: typeof import('pdf-parse') | null = null

// Dynamic import to ensure pdf-parse only loads on the server
if (typeof window === 'undefined') {
  // Server-side only
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pdf = require('pdf-parse')
  } catch (error) {
    console.warn('pdf-parse not available on server:', error)
  }
}

export interface PDFParseResult {
  text: string
  pageCount: number
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    modDate?: string
  }
  tables: Array<Array<string[]>>
  structuredData: Record<string, string[] | number[] | number>
  error?: string
}

export interface PDFExtractionOptions {
  extractTables?: boolean
  extractMetadata?: boolean
  maxPages?: number
  password?: string
}

/**
 * Parse PDF content and extract text, metadata, and structured data
 * This function only works on the server side
 */
export async function parsePDF(
  buffer: Buffer | Uint8Array,
  options: PDFExtractionOptions = {}
): Promise<PDFParseResult> {
  // Check if we're on the server side
  if (typeof window !== 'undefined') {
    throw new Error('PDF parsing is only available on the server side')
  }

  // Check if pdf-parse is available
  if (!pdf) {
    throw new Error('PDF parsing library not available')
  }

  const {
    extractTables = true,
    extractMetadata = true,
    maxPages = 50,
    password
  } = options

  try {
    // Parse PDF with options - convert Uint8Array to Buffer if needed
    const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    const data = await pdf(pdfBuffer, {
      max: maxPages
    })

    const result: PDFParseResult = {
      text: data.text || '',
      pageCount: data.numpages || 0,
      metadata: {},
      tables: [],
      structuredData: {}
    }

    // Extract metadata if available
    if (extractMetadata && data.info) {
      result.metadata = {
        title: data.info.Title,
        author: data.info.Author,
        subject: data.info.Subject,
        creator: data.info.Creator,
        producer: data.info.Producer,
        creationDate: data.info.CreationDate,
        modDate: data.info.ModDate
      }
    }

    // Extract structured data from text
    if (data.text) {
      result.structuredData = extractStructuredData(data.text)
      
      // Extract tables if requested
      if (extractTables) {
        result.tables = extractTablesFromText(data.text)
      }
    }

    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse PDF'
    return {
      text: '',
      pageCount: 0,
      metadata: {},
      tables: [],
      structuredData: {},
      error: errorMessage
    }
  }
}

/**
 * Extract structured data from PDF text using common patterns
 */
function extractStructuredData(text: string): Record<string, string[] | number[] | number> {
  const data: Record<string, string[] | number[] | number> = {}
  
  // Extract dates
  const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g
  const dates = text.match(datePattern)
  if (dates) {
    data.dates = dates.slice(0, 5) // Limit to first 5 dates
  }

  // Extract numbers (potential metrics)
  const numberPattern = /(\d+(?:,\d{3})*(?:\.\d+)?)/g
  const numbers = text.match(numberPattern)
  if (numbers) {
    data.numbers = numbers.slice(0, 20).map(n => parseFloat(n.replace(/,/g, '')))
  }

  // Extract currency values (including Ghanaian Cedi ₵)
  const currencyPattern = /[$€£¥₵](\d+(?:,\d{3})*(?:\.\d+)?)/g
  const currencies = text.match(currencyPattern)
  if (currencies) {
    data.currencies = currencies.slice(0, 10).map(c => parseFloat(c.replace(/[$€£¥₵,]/g, '')))
  }

  // Extract percentages
  const percentPattern = /(\d+(?:\.\d+)?%)/g
  const percentages = text.match(percentPattern)
  if (percentages) {
    data.percentages = percentages.slice(0, 10).map(p => parseFloat(p.replace('%', '')))
  }

  // Extract common hospitality terms
  const hospitalityTerms = [
    'occupancy', 'revenue', 'guests', 'rooms', 'bookings', 'reservations',
    'ADR', 'RevPAR', 'GOP', 'covers', 'food cost', 'beverage cost'
  ]
  
  hospitalityTerms.forEach(term => {
    const regex = new RegExp(`${term}[\\s:]*([\\d,]+)`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      data[term.replace(/\s+/g, '_')] = matches.length
    }
  })

  return data
}

/**
 * Extract table-like structures from text
 */
function extractTablesFromText(text: string): Array<Array<string[]>> {
  const tables: Array<Array<string[]>> = []
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  let currentTable: Array<string[]> = []
  let inTable = false
  
  for (const line of lines) {
    // Detect table-like patterns (multiple columns separated by spaces/tabs)
    const columns = line.split(/\s{2,}|\t+/).filter(col => col.trim().length > 0)
    
    if (columns.length >= 2) {
      // This looks like a table row
      if (!inTable) {
        inTable = true
        currentTable = []
      }
      currentTable.push(columns)
    } else if (inTable && line.trim().length > 0) {
      // End of table
      if (currentTable.length > 0) {
        tables.push(currentTable)
      }
      currentTable = []
      inTable = false
    }
  }
  
  // Don't forget the last table
  if (inTable && currentTable.length > 0) {
    tables.push(currentTable)
  }
  
  return tables
}

/**
 * Validate if a buffer contains a valid PDF
 */
export function isValidPDF(buffer: Buffer | Uint8Array): boolean {
  if (buffer.length < 4) return false
  
  // Check PDF magic number: %PDF
  const header = buffer.slice(0, 4)
  return header[0] === 0x25 && // %
         header[1] === 0x50 && // P
         header[2] === 0x44 && // D
         header[3] === 0x46     // F
}
