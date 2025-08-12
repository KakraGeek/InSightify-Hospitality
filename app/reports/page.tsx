'use client'

import { useState, useEffect } from 'react'
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard'
import { ReportBuilder } from '../../components/reports/ReportBuilder'
import { Button } from '../../components/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/components/ui/tabs'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Plus,
  Eye,
  Settings
} from 'lucide-react'

interface KpiDataPoint {
  kpiName: string
  value: number
  unit: string
  date: string
  department: string
  confidence: number
}

interface KpiDefinition {
  name: string
  displayName: string
  department: string
  category: string
  unit: string
}

interface Report {
  id: string
  title: string
  description: string
  department: string
  startDate: string
  endDate: string
  sections: any[]
  isPublic: boolean
  status: 'draft' | 'published' | 'archived'
}

export default function ReportsPage() {
  const [kpiDefinitions, setKpiDefinitions] = useState<KpiDefinition[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [_reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [isCreatingReport, setIsCreatingReport] = useState<boolean>(false)

  // Load KPI definitions from catalog
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const catalog = await import('../../kpi/catalog.json')
        const kpis = catalog.kpis || []
        
        // Transform catalog data to match ReportBuilder's expected interface
        const transformedKpis: KpiDefinition[] = kpis.map((kpi: any) => ({
          name: kpi.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: kpi.name,
          department: kpi.department,
          category: kpi.department, // Use department as category for now
          unit: kpi.unit
        }))
        
        setKpiDefinitions(transformedKpis)
        
        // Extract unique departments
        const depts = [...new Set(transformedKpis.map(k => k.department))]
        setDepartments(depts)
      } catch (error) {
        console.error('Failed to load KPI catalog:', error)
      }
    }

    loadCatalog()
  }, [])

  // Load real KPI data from the API
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>([])
  const [isLoadingKpiData, setIsLoadingKpiData] = useState(true)

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setIsLoadingKpiData(true)
        const response = await fetch('/api/kpi-data')
        const result = await response.json()
        
        if (result.success) {
          console.log(`📊 Loaded ${result.count} KPI data points from API`)
          setKpiData(result.data)
        } else {
          console.error('Failed to fetch KPI data:', result.error)
          setKpiData([])
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error)
        setKpiData([])
      } finally {
        setIsLoadingKpiData(false)
      }
    }

    fetchKpiData()
  }, [])
  
  // Mock reports data
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Monthly Front Office Report',
      description: 'Comprehensive overview of Front Office KPIs',
      department: 'Front Office',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      sections: [
        {
          title: 'Occupancy Metrics',
          kpis: ['occupancy_rate', 'average_daily_rate'],
          chartType: 'line'
        }
      ],
      isPublic: true,
      status: 'published'
    }
  ]

  const handleSaveReport = (report: Report) => {
    // Save report to database (this would integrate with your ReportStorageService)
    const newReport = { ...report, id: crypto.randomUUID() }
    setReports(prev => [...prev, newReport])
    
    // Show success message
    alert('Report saved successfully!')
  }

  const handleExportReport = async (report: Report, format: 'pdf' | 'csv') => {
    try {
      if (format === 'pdf') {
        // Import ExportService dynamically to avoid SSR issues
        const { ExportService } = await import('../../lib/services/exportService')
        await ExportService.exportToPDF({
          title: report.title,
          description: report.description,
          department: report.department,
          startDate: report.startDate,
          endDate: report.endDate,
          sections: report.sections
        })
      } else {
        const { ExportService } = await import('../../lib/services/exportService')
        ExportService.exportToCSV({
          title: report.title,
          description: report.description,
          department: report.department,
          startDate: report.startDate,
          endDate: report.endDate,
          sections: report.sections
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handleExportKPIData = async () => {
    if (kpiData.length === 0) {
      alert('No KPI data available to export. Please upload some files first.')
      return
    }
    
    try {
      // Import ExportService dynamically
      import('../../lib/services/exportService').then(({ ExportService }) => {
        ExportService.exportKPIDataToCSV(kpiData)
      })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handleCreateNewReport = () => {
    setIsCreatingReport(true)
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setActiveTab('builder')
      setIsCreatingReport(false)
      
      // Show a brief success message
      const button = document.querySelector('[data-testid="create-report-btn"]')
      if (button) {
        button.classList.add('bg-green-600')
        setTimeout(() => {
          button.classList.remove('bg-green-600')
        }, 1000)
      }
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-navy">Reports & Analytics</h1>
        <p className="text-slate-700">Create custom reports, analyze KPIs, and export data for stakeholders.</p>
      </header>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={handleCreateNewReport}
          disabled={isCreatingReport}
          data-testid="create-report-btn"
          className={`${
            isCreatingReport 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#F97316] hover:bg-[#EA580C]'
          } text-white shadow-md border border-[#EA580C]/20 transition-colors duration-200`}
        >
          {isCreatingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create New Report
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={handleExportKPIData}>
          <Download className="h-4 w-4 mr-2" />
          Export All Data
        </Button>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {isLoadingKpiData ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading KPI data...</p>
              </div>
            </div>
          ) : kpiData.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No KPI Data Available</h3>
              <p className="text-gray-600 mb-4">
                Upload PDF or CSV files to see your hospitality metrics and charts.
              </p>
              <Button 
                onClick={() => setActiveTab('builder')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Report
              </Button>
            </div>
          ) : (
            <EnhancedDashboard kpiData={kpiData} departments={departments} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {mockReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 space-y-2 overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold break-words flex-1">{report.title}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportReport(report, 'pdf')}>
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportReport(report, 'csv')}>
                      CSV
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 break-words">{report.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="break-words">{report.department}</span>
                  <span className="break-words">{report.startDate} - {report.endDate}</span>
                  <span className="capitalize break-words">{report.status}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <ReportBuilder 
            kpiDefinitions={kpiDefinitions} 
            departments={departments} 
            onSave={handleSaveReport} 
            onExport={handleExportReport} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
