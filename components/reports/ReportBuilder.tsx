'use client'

import { useState, useMemo } from 'react'
// import { Button } from '../../components/ui/button'
// import { Input } from '../../components/ui/input'
// import { Label } from '../../components/ui/label'
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '../../components/ui/select'
// import { Textarea } from '../../components/ui/textarea'
// import { Checkbox } from '../../components/ui/checkbox'
import { 
  FileText, 
  Download, 
  Save, 
  Eye, 
  Plus, 
  Trash2,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'

interface KpiDefinition {
  name: string
  displayName: string
  department: string
  category: string
  unit: string
}

interface ReportSection {
  id: string
  title: string
  kpis: string[]
  chartType: 'line' | 'bar' | 'area' | 'table'
  layout: 'full' | 'half' | 'quarter'
}

interface Report {
  id: string
  title: string
  description: string
  department: string
  startDate: string
  endDate: string
  sections: ReportSection[]
  isPublic: boolean
  status: 'draft' | 'published' | 'archived'
}

interface ReportBuilderProps {
  kpiDefinitions: KpiDefinition[]
  departments: string[]
  onSave: (report: Report) => void
  onExport: (report: Report, format: 'pdf' | 'csv') => void
}

export function ReportBuilder({ 
  kpiDefinitions, 
  departments, 
  onSave, 
  onExport 
}: ReportBuilderProps) {
  const [report, setReport] = useState<Report>({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    department: undefined as any, // Use undefined instead of empty string
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    sections: [],
    isPublic: false,
    status: 'draft'
  })

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder')

  // Filter KPIs by selected department
  const availableKPIs = useMemo(() => {
    if (!report.department) return kpiDefinitions
    return kpiDefinitions.filter(kpi => kpi.department === report.department)
  }, [kpiDefinitions, report.department])

  // Group KPIs by category
  const kpisByCategory = useMemo(() => {
    if (availableKPIs.length === 0) return {}
    
    const grouped = availableKPIs.reduce((acc, kpi) => {
      const category = kpi.category || 'Other'
      if (!acc[category]) acc[category] = []
      acc[category].push(kpi)
      return acc
    }, {} as Record<string, KpiDefinition[]>)
    
    return grouped
  }, [availableKPIs])

  const addSection = () => {
    const newSection: ReportSection = {
      id: crypto.randomUUID(),
      title: `Section ${report.sections.length + 1}`,
      kpis: [],
      chartType: 'line',
      layout: 'full'
    }
    setReport(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }))
  }

  const removeSection = (sectionId: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const toggleKPIInSection = (sectionId: string, kpiName: string) => {
    updateSection(sectionId, {
      kpis: report.sections.find(s => s.id === sectionId)?.kpis.includes(kpiName)
        ? report.sections.find(s => s.id === sectionId)!.kpis.filter(k => k !== kpiName)
        : [...report.sections.find(s => s.id === sectionId)!.kpis, kpiName]
    })
  }

  const handleSave = () => {
    if (!report.title.trim()) {
      alert('Please enter a report title')
      return
    }
    if (!report.department) {
      alert('Please select a department')
      return
    }
    if (report.sections.length === 0) {
      alert('Please add at least one section to the report')
      return
    }
    
    onSave(report)
  }

  const renderBuilder = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Title *
          </label>
          <input
            type="text"
            value={report.title}
            onChange={(e) => setReport(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter report title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={report.description}
            onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter report description"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            value={report.department || ''}
            onChange={(e) => setReport(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={report.startDate}
              onChange={(e) => setReport(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={report.endDate}
              onChange={(e) => setReport(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={report.isPublic}
            onChange={(e) => setReport(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this report public
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Report Sections</h3>
          <button
            onClick={addSection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        {report.sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No sections added yet. Click "Add Section" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.sections.map((section, index) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Section title"
                    />
                    <select
                      value={section.chartType}
                      onChange={(e) => updateSection(section.id, { chartType: e.target.value as any })}
                      className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="table">Table</option>
                    </select>
                    <select
                      value={section.layout}
                      onChange={(e) => updateSection(section.id, { layout: e.target.value as any })}
                      className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full">Full Width</option>
                      <option value="half">Half Width</option>
                      <option value="quarter">Quarter Width</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="inline-flex items-center gap-2 px-3 py-1 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* KPI Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select KPIs for this section:
                  </label>
                  {Object.keys(kpisByCategory).length === 0 ? (
                    <div className="mt-2 p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <p>Please select a department first to see available KPIs</p>
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(kpisByCategory).map(([category, kpis]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                          {kpis.map(kpi => (
                            <div key={kpi.name} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${section.id}-${kpi.name}`}
                                checked={section.kpis.includes(kpi.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    toggleKPIInSection(section.id, kpi.name)
                                  } else {
                                    toggleKPIInSection(section.id, kpi.name)
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`${section.id}-${kpi.name}`} className="text-sm text-gray-700">
                                {kpi.displayName}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveTab('preview')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Eye className="h-4 w-4" />
          Preview Report
        </button>
        <button 
          onClick={handleSave} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4" />
          Save Report
        </button>
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{report.title || 'Untitled Report'}</h1>
        {report.description && (
          <p className="text-gray-600 mt-2">{report.description}</p>
        )}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {report.startDate} - {report.endDate}
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {report.department || 'All Departments'}
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {report.status}
          </div>
        </div>
      </div>

      {/* Report Sections */}
      {report.sections.map((section) => (
        <div key={section.id} className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
          
          {/* Chart Placeholder */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {section.chartType.charAt(0).toUpperCase() + section.chartType.slice(1)} Chart
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {section.kpis.length} KPIs selected • {section.layout} layout
            </p>
          </div>

          {/* Selected KPIs */}
          {section.kpis.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Included KPIs:</h4>
              <div className="flex flex-wrap gap-2">
                {section.kpis.map(kpiName => {
                  const kpi = kpiDefinitions.find(k => k.name === kpiName)
                  return (
                    <span
                      key={kpiName}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                    >
                      {kpi?.displayName || kpiName}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Export Report</h3>
        <div className="flex gap-4">
          <button
            onClick={() => onExport(report, 'pdf')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-sm font-medium rounded-md hover:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50"
          >
            <Download className="h-4 w-4" />
            Export as PDF
          </button>
          <button
            onClick={() => onExport(report, 'csv')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#475569] text-white text-sm font-medium rounded-md hover:bg-[#334155] focus:outline-none focus:ring-2 focus:ring-[#334155]/50"
          >
            <Download className="h-4 w-4" />
            Export as CSV
          </button>
        </div>
      </div>

      {/* Back to Builder */}
      <button
        onClick={() => setActiveTab('builder')}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FileText className="h-4 w-4" />
        Back to Builder
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'builder'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Report Builder
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Preview
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'builder' ? renderBuilder() : renderPreview()}
    </div>
  )
}
