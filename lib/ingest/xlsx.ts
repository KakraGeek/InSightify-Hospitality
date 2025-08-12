import * as XLSX from 'xlsx'

export async function parseWorkbook(stream: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) chunks.push(chunk)
  const buffer = Buffer.concat(chunks.map((u) => Buffer.from(u)))
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  const first = wb.SheetNames[0]
  const ws = wb.Sheets[first]
  const csv = XLSX.utils.sheet_to_csv(ws)
  return { csv, bytes: buffer.byteLength, sheet: first }
}
