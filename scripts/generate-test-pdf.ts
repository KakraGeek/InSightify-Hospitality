import { writeFileSync } from 'fs'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

async function generateTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 12
  const lineHeight = fontSize * 1.5
  let yPosition = 750

  // Helper function to add text
  const addText = (text: string, x: number, y: number, size: number = fontSize) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
  }

  // Helper function to add section header
  const addSectionHeader = (text: string) => {
    addText(text, 50, yPosition, 16)
    yPosition -= lineHeight * 1.5
  }

  // Helper function to add KPI line
  const addKPILine = (kpi: string, value: string) => {
    addText(`${kpi}: ${value}`, 70, yPosition, fontSize)
    yPosition -= lineHeight
  }

  // Title
  addText('InSightify Hospitality - Comprehensive KPI Test Report', 50, yPosition, 18)
  yPosition -= lineHeight * 2

  // Date
  addText('Date: December 15, 2024', 50, yPosition, fontSize)
  yPosition -= lineHeight * 2

  // Front Office Metrics
  addSectionHeader('Front Office Metrics:')
  addKPILine('Occupancy Rate', '85%')
  addKPILine('Guest Count', '127')
  addKPILine('Average Daily Rate (ADR)', 'GHS 450')
  addKPILine('Revenue per Available Room (RevPAR)', 'GHS 382.50')
  addKPILine('Booking Lead Time', '14 days')
  addKPILine('Cancellation Rate', '8.5%')
  addKPILine('No-Show Rate', '3.2%')
  addKPILine('Guest Satisfaction', '4.6/5')
  yPosition -= lineHeight

  // Food & Beverage Metrics
  addSectionHeader('Food & Beverage Metrics:')
  addKPILine('Food Cost', '32%')
  addKPILine('Beverage Cost', '28%')
  addKPILine('Covers', '156')
  addKPILine('Average Check', 'GHS 85')
  addKPILine('Table Turnover', '2.8')
  addKPILine('Waste', '4.2%')
  addKPILine('Void/Comp', '2.1%')
  addKPILine('Food Revenue', 'GHS 13,260')
  addKPILine('Beverage Revenue', 'GHS 8,450')
  addKPILine('RevPASH', 'GHS 45')
  yPosition -= lineHeight

  // Housekeeping Metrics
  addSectionHeader('Housekeeping Metrics:')
  addKPILine('Rooms Cleaned', '127')
  addKPILine('Cleaning Time', '25 minutes')
  addKPILine('Room Turnaround', '2.5 hours')
  addKPILine('Inspection Pass Rate', '96%')
  addKPILine('Out-of-Order', '2.1%')
  addKPILine('Linen Cost', 'GHS 15.50')
  addKPILine('Guest Room Defect Rate', '1.8%')
  addKPILine('Chemical Cost', 'GHS 8.75')
  addKPILine('HK Staff Efficiency', '92%')
  yPosition -= lineHeight

  // Maintenance/Engineering Metrics
  addSectionHeader('Maintenance/Engineering Metrics:')
  addKPILine('Maintenance Cost', 'GHS 45.80')
  addKPILine('Energy Consumption', '12.5 kWh')
  addKPILine('Equipment Uptime', '98.5%')
  addKPILine('Preventive Maintenance', '95%')
  addKPILine('Response Time', '18 minutes')
  addKPILine('Work Order Completion', '94%')
  addKPILine('Vendor Performance', '4.2/5')
  addKPILine('Safety Incidents', '0')
  addKPILine('Energy Efficiency', '87%')
  addKPILine('Maintenance Staff Efficiency', '89%')
  yPosition -= lineHeight

  // Sales & Marketing Metrics
  addSectionHeader('Sales & Marketing Metrics:')
  addKPILine('Conversion Rate', '23.5%')
  addKPILine('Lead Generation', '45')
  addKPILine('Customer Acquisition Cost', 'GHS 125')
  addKPILine('Email Open Rate', '34.2%')
  addKPILine('Click Through Rate', '8.7%')
  addKPILine('Social Media Engagement', '67%')
  addKPILine('Website Traffic', '1,250')
  addKPILine('Booking Conversion', '18.9%')
  addKPILine('Customer Lifetime Value', 'GHS 2,450')
  addKPILine('Marketing ROI', '320%')
  yPosition -= lineHeight

  // Finance Metrics
  addSectionHeader('Finance Metrics:')
  addKPILine('Profit Margin', '28.5%')
  addKPILine('Operating Expenses', 'GHS 45,680')
  addKPILine('Cash Flow', 'GHS 23,450')
  addKPILine('Debt to Equity', '0.45')
  addKPILine('Return on Investment', '18.7%')
  addKPILine('Accounts Receivable', 'GHS 12,340')
  addKPILine('Accounts Payable', 'GHS 8,760')
  addKPILine('Inventory Turnover', '4.2')
  addKPILine('Working Capital', 'GHS 67,890')
  addKPILine('Cost per Room', 'GHS 125.50')
  yPosition -= lineHeight

  // HR Metrics
  addSectionHeader('HR Metrics:')
  addKPILine('Employee Turnover', '12.5%')
  addKPILine('Training Completion', '87%')
  addKPILine('Employee Satisfaction', '4.3/5')
  addKPILine('Time to Hire', '18 days')
  addKPILine('Cost per Hire', 'GHS 2,450')
  addKPILine('Productivity per Employee', '94%')
  addKPILine('Absenteeism Rate', '3.8%')
  addKPILine('Training Cost', 'GHS 8,760')
  addKPILine('Performance Rating', '4.1/5')
  addKPILine('Retention Rate', '87.5%')
  yPosition -= lineHeight

  // Summary
  addSectionHeader('Summary:')
  addText('Total KPIs: 55', 70, yPosition, fontSize)
  yPosition -= lineHeight
  addText('Departments: 7', 70, yPosition, fontSize)
  yPosition -= lineHeight
  addText('Report Generated: December 15, 2024', 70, yPosition, fontSize)

  // Save the PDF
  const pdfBytes = await pdfDoc.save()
  writeFileSync('comprehensive-test-report.pdf', pdfBytes)

  console.log('✅ Comprehensive test PDF generated: comprehensive-test-report.pdf')
  console.log('📊 Contains 55 KPIs across all 7 departments')
  console.log('📁 File size:', (pdfBytes.length / 1024).toFixed(2), 'KB')
}

generateTestPDF().catch(console.error)
