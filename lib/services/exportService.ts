import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ExportData {
  title: string
  description?: string
  department: string
  startDate: string
  endDate: string
  sections: ExportSection[]
}

interface ExportSection {
  title: string
  kpis: string[]
  chartType: string
  data?: any[]
}

export class ExportService {
  /**
   * Export report as PDF
   */
  static async exportToPDF(data: ExportData): Promise<void> {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(data.title, 20, 30)
    
    // Add metadata
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Department: ${data.department}`, 20, 45)
    doc.text(`Period: ${data.startDate} to ${data.endDate}`, 20, 55)
    if (data.description) {
      doc.text(`Description: ${data.description}`, 20, 65)
    }
    
    let yPosition = 85
    
    // Add sections
    data.sections.forEach((section, index) => {
      // Section title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${section.title}`, 20, yPosition)
      yPosition += 10
      
      // Section details
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Chart Type: ${section.chartType}`, 20, yPosition)
      yPosition += 7
      
      // KPIs in this section
      if (section.kpis.length > 0) {
        doc.text('Included KPIs:', 20, yPosition)
        yPosition += 7
        
        section.kpis.forEach(kpi => {
          doc.text(`• ${kpi}`, 30, yPosition)
          yPosition += 5
        })
      }
      
      yPosition += 10
      
      // Add page break if needed
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 30
      }
    })
    
    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Page ${i} of ${pageCount}`, 20, 280)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 120, 280)
    }
    
    // Save the PDF
    doc.save(`${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`)
  }
  
  /**
   * Export report as CSV
   */
  static exportToCSV(data: ExportData): void {
    // Prepare CSV data
    const csvRows: string[] = []
    
    // Header
    csvRows.push('Report Title,Department,Start Date,End Date,Description')
    csvRows.push(`"${data.title}","${data.department}","${data.startDate}","${data.endDate}","${data.description || ''}"`)
    csvRows.push('') // Empty row
    
    // Sections
    csvRows.push('Section,Chart Type,KPIs')
    data.sections.forEach(section => {
      csvRows.push(`"${section.title}","${section.chartType}","${section.kpis.join('; ')}"`)
    })
    
    csvRows.push('') // Empty row
    
    // Detailed KPI data if available
    if (data.sections.some(s => s.data && s.data.length > 0)) {
      csvRows.push('Section,Date,KPI,Value,Unit')
      data.sections.forEach(section => {
        if (section.data) {
          section.data.forEach((row: any) => {
            csvRows.push(`"${section.title}","${row.date || ''}","${row.kpi || ''}","${row.value || ''}","${row.unit || ''}"`)
          })
        }
      })
    }
    
    // Create and download CSV
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  
  /**
   * Export KPI data as Excel (CSV format for now)
   */
  static exportKPIDataToCSV(kpiData: any[]): void {
    if (kpiData.length === 0) return
    
    const headers = Object.keys(kpiData[0])
    const csvRows = [headers.join(',')]
    
    kpiData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""')
        return escaped.includes(',') ? `"${escaped}"` : escaped
      })
      csvRows.push(values.join(','))
    })
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `kpi_data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  
  /**
   * Generate chart image for PDF export
   */
  static async generateChartImage(_chartElement: HTMLElement, _chartType: string): Promise<string> {
    // This would use a library like html2canvas or dom-to-image
    // For now, return a placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }
  
  /**
   * Format data for export
   */
  static formatDataForExport(data: any[], format: 'pdf' | 'csv'): any[] {
    if (format === 'csv') {
      return data.map(item => ({
        ...item,
        date: item.date ? new Date(item.date).toLocaleDateString() : '',
        value: typeof item.value === 'number' ? item.value.toFixed(2) : item.value
      }))
    }
    
    return data
  }
}
