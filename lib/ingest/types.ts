import { z } from 'zod'

export const IngestSourceType = z.enum(['csv', 'xls', 'xlsx', 'pdf', 'gdrive'])
export type IngestSourceTypeEnum = z.infer<typeof IngestSourceType>

export const IngestRequestSchema = z.object({
  sourceType: IngestSourceType,
  department: z
    .enum([
      'Front Office',
      'Food & Beverage',
      'Housekeeping',
      'Maintenance/Engineering',
      'Sales & Marketing',
      'Finance',
      'HR',
    ])
    .optional(),
  // For file uploads we expect multipart form with a File field named 'file'. For links, a 'link' field is required.
  link: z.string().url().optional(),
})

export const IngestReportSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  sourceType: IngestSourceType,
  bytes: z.number().nonnegative(),
  filename: z.string().optional(),
  totalRows: z.number().int().nonnegative().default(0),
  validRows: z.number().int().nonnegative().default(0),
  invalidRows: z.number().int().nonnegative().default(0),
  sampleErrors: z.array(z.string()).default([]),
  message: z.string().optional(),
})
export type IngestReport = z.infer<typeof IngestReportSchema>
