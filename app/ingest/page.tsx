"use client"

import React, { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../../components/components/ui/button'
import { Label } from '../../components/components/ui/label'
import { Input } from '../../components/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/components/ui/select'

const departments = [
  'All Departments',
  'Front Office',
  'Food & Beverage',
  'Housekeeping',
  'Maintenance/Engineering',
  'Sales & Marketing',
  'Finance',
  'HR',
]

const sourceTypes = [
  { value: 'csv', label: 'CSV' },
  { value: 'xls', label: 'Excel (.xls)' },
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (file or link)' },
  { value: 'gdrive', label: 'Google Drive link' },
]

export default function IngestPage() {
  const [department, setDepartment] = useState<string>('Front Office')
  const [sourceType, setSourceType] = useState<string>('csv')
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function getAccept() {
    if (sourceType === 'csv') return '.csv'
    if (sourceType === 'pdf') return 'application/pdf'
    if (sourceType === 'xls' || sourceType === 'xlsx') return '.xls,.xlsx'
    return undefined
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setReport(null)
    try {
      const form = new FormData()
      form.set('sourceType', sourceType)
      if (department && department !== 'All Departments') {
        form.set('department', department)
      }
      if (file) form.set('file', file)
      if (link) form.set('link', link)

      const res = await fetch('/api/ingest', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Ingest failed')
      setReport(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-navy">Data Ingestion</h1>
        <p className="text-slate-700">Upload CSV/Excel/PDF or provide a Google Drive link, then validate.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-brand-gray/30 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-brand-navy">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-brand-navy">Source Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {sourceTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(sourceType === 'csv' || sourceType === 'xls' || sourceType === 'xlsx' || sourceType === 'pdf') && (
          <div className="space-y-1.5">
            <Label className="text-brand-navy">File</Label>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="file-input"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md !bg-slate-900 !text-white px-4 py-2 ring-1 ring-slate-900/20 hover:!bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/60"
              >
                <Upload className="h-4 w-4" />
                Choose file
              </Label>
              <span className="text-sm text-slate-800 truncate">
                {file ? file.name : 'No file selected'}
              </span>
              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept={getAccept()}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {(sourceType === 'gdrive' || sourceType === 'pdf') && (
          <div className="space-y-1.5">
            <Label className="text-brand-navy">Link (Google Drive or PDF)</Label>
            <Input
              type="url"
              placeholder="https://drive.google.com/file/d/... or https://.../file.pdf"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="bg-white"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={busy}
          className="!bg-slate-900 !text-white ring-1 ring-slate-900/20 hover:!bg-slate-800"
        >
          {busy ? 'Validating…' : 'Validate'}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {report && (
        <div className="rounded-lg border border-brand-gray/30 bg-white p-4">
          <h2 className="text-lg font-semibold text-brand-navy">Validation Report</h2>
          
          {/* Basic Info */}
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-slate-700">Source</dt><dd className="font-medium">{report.sourceType.toUpperCase()}</dd></div>
            <div><dt className="text-slate-700">Filename/Link</dt><dd className="truncate font-medium">{report.filename || '—'}</dd></div>
            <div><dt className="text-slate-700">Bytes</dt><dd className="font-medium">{report.bytes?.toLocaleString() || '—'}</dd></div>
            <div><dt className="text-slate-700">Total Rows</dt><dd className="font-medium">{report.totalRows}</dd></div>
            <div><dt className="text-slate-700">Valid Rows</dt><dd className="font-medium text-green-600">{report.validRows}</dd></div>
            <div><dt className="text-slate-700">Invalid Rows</dt><dd className="font-medium text-red-600">{report.invalidRows}</dd></div>
          </dl>

          {/* Data Quality Metrics */}
          {report.metadata && (
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Data Quality</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Completeness:</span>
                  <span className={`ml-2 font-medium ${
                    report.metadata.dataQuality?.completeness >= 90 ? 'text-green-600' : 
                    report.metadata.dataQuality?.completeness >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {report.metadata.dataQuality?.completeness?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Error Rate:</span>
                  <span className={`ml-2 font-medium ${
                    report.metadata.dataQuality?.errorRate <= 5 ? 'text-green-600' : 
                    report.metadata.dataQuality?.errorRate <= 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {report.metadata.dataQuality?.errorRate?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Validation Schema:</span>
                  <span className="ml-2 font-medium text-slate-800">{report.metadata.validationSchema}</span>
                </div>
                <div>
                  <span className="text-slate-600">Business Rules:</span>
                  <span className={`ml-2 font-medium ${
                    report.metadata.businessRules === 'passed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {report.metadata.businessRules === 'passed' ? 'Passed' : 'Warnings Detected'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PDF Metadata */}
          {report.metadata?.pageCount && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">PDF Analysis</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-blue-700">Pages:</span> <span className="font-medium">{report.metadata.pageCount}</span></div>
                <div><span className="text-blue-700">Text Length:</span> <span className="font-medium">{report.metadata.textLength?.toLocaleString()}</span></div>
                <div><span className="text-blue-700">Tables Detected:</span> <span className="font-medium">{report.metadata.tableCount}</span></div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {report.warnings && report.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Business Rule Warnings</h3>
              <ul className="list-disc pl-5 text-sm text-yellow-700">
                {report.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Errors */}
          {report.sampleErrors && report.sampleErrors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-semibold text-red-800 mb-2">❌ Validation Errors</h3>
              <ul className="list-disc pl-5 text-sm text-red-700">
                {report.sampleErrors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {report.message && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">{report.message}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
