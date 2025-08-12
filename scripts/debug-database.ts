import { getDb } from '../lib/db'
import { reports, reportItems } from '../db/schema/reports'
import { eq, desc } from 'drizzle-orm'

async function debugDatabase() {
  console.log('🔍 Debugging Database Contents...')
  
  try {
    const db = getDb()
    
    // Check reports table
    console.log('\n📊 Checking reports table...')
    const allReports = await db.select().from(reports)
    console.log(`Found ${allReports.length} reports:`)
    allReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ID: ${report.id}, Title: "${report.title}", Department: "${report.department}", Created: ${report.createdAt}`)
    })
    
    // Check reportItems table
    console.log('\n📊 Checking reportItems table...')
    const allItems = await db.select().from(reportItems)
    console.log(`Found ${allItems.length} report items:`)
    
    // Group by reportId to see structure
    const itemsByReport = allItems.reduce((acc, item) => {
      if (!acc[item.reportId]) acc[item.reportId] = []
      acc[item.reportId].push(item)
      return acc
    }, {} as Record<string, typeof allItems>)
    
    Object.entries(itemsByReport).forEach(([reportId, items]) => {
      console.log(`\n  Report ${reportId} has ${items.length} items:`)
      items.slice(0, 5).forEach((item, index) => {
        console.log(`    ${index + 1}. KPI: "${item.kpiName}", Value: ${item.value}, Category: "${item.kpiCategory}"`)
      })
      if (items.length > 5) {
        console.log(`    ... and ${items.length - 5} more items`)
      }
    })
    
    // Test the getKPIValues query directly
    console.log('\n🔍 Testing getKPIValues query directly...')
    const kpiResults = await db
      .select({
        id: reportItems.id,
        kpiName: reportItems.kpiName,
        department: reports.department,
        value: reportItems.value,
        unit: reportItems.unit,
        date: reportItems.date,
        period: reportItems.period,
        source: reportItems.source,
        confidence: reportItems.confidence,
        notes: reportItems.notes,
        createdAt: reportItems.createdAt,
      })
      .from(reportItems)
      .innerJoin(reports, eq(reportItems.reportId, reports.id))
      .orderBy(desc(reportItems.createdAt))
    
    console.log(`\n📊 Direct query returned ${kpiResults.length} results:`)
    kpiResults.slice(0, 10).forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.kpiName}" (${result.department}): ${result.value} ${result.unit || ''}`)
    })
    
    if (kpiResults.length > 10) {
      console.log(`  ... and ${kpiResults.length - 10} more results`)
    }
    
    // Check for any data type mismatches
    console.log('\n🔍 Checking for data type issues...')
    const uniqueKpiNames = [...new Set(kpiResults.map(r => r.kpiName))]
    console.log(`Unique KPI names found: ${uniqueKpiNames.length}`)
    console.log('Sample KPI names:', uniqueKpiNames.slice(0, 10))
    
    const uniqueDepartments = [...new Set(kpiResults.map(r => r.department))]
    console.log(`Unique departments found: ${uniqueDepartments.length}`)
    console.log('Departments:', uniqueDepartments)
    
  } catch (error) {
    console.error('❌ Error debugging database:', error)
  }
}

debugDatabase().catch(console.error)
