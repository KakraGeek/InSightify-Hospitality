import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function debugDepartments() {
  try {
    console.log('🔍 Debugging department matching...')
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment')
      return
    }
    
    // Test the database connection
    const { getDb } = await import('../lib/db')
    const db = getDb()
    
    console.log('✅ Database connection established successfully')
    
    // Check what departments are stored in the reports table
    const departmentsResult = await db.execute(`
      SELECT DISTINCT department, COUNT(*) as count
      FROM reports
      GROUP BY department
      ORDER BY department
    `)
    
    console.log('📊 Departments in reports table:')
    departmentsResult.rows?.forEach((row: any) => {
      console.log(`  - "${row.department}": ${row.count} reports`)
    })
    
    // Check what departments are stored in the report_items table (via join)
    const reportItemsDepartments = await db.execute(`
      SELECT DISTINCT r.department, COUNT(ri.id) as count
      FROM report_items ri
      JOIN reports r ON ri.report_id = r.id
      GROUP BY r.department
      ORDER BY r.department
    `)
    
    console.log('\n📊 Departments in report_items table (via join):')
    reportItemsDepartments.rows?.forEach((row: any) => {
      console.log(`  - "${row.department}": ${row.count} items`)
    })
    
    // Check sample KPI names and their departments
    const sampleKPIs = await db.execute(`
      SELECT ri.kpi_name, r.department, ri.value
      FROM report_items ri
      JOIN reports r ON ri.report_id = r.id
      ORDER BY r.department, ri.kpi_name
      LIMIT 20
    `)
    
    console.log('\n📊 Sample KPI data by department:')
    sampleKPIs.rows?.forEach((row: any) => {
      console.log(`  - "${row.kpi_name}" in "${row.department}": ${row.value}`)
    })
    
    // Check what the Dashboard expects vs. what's stored
    console.log('\n🔍 Dashboard Department Expectations vs. Database Reality:')
    const expectedDepartments = [
      'Front Office',
      'Food & Beverage', 
      'Housekeeping',
      'Maintenance/Engineering',
      'Sales & Marketing',
      'Finance',
      'HR'
    ]
    
    expectedDepartments.forEach(expected => {
      const found = reportItemsDepartments.rows?.find((row: any) => 
        row.department === expected
      )
      if (found) {
        console.log(`  ✅ "${expected}": ${found.count} items`)
      } else {
        console.log(`  ❌ "${expected}": No data found`)
      }
    })
    
  } catch (error) {
    console.error('❌ Department debugging failed:', error)
  }
}

// Run the debug
debugDepartments()
  .then(() => {
    console.log('🏁 Debug completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error)
    process.exit(1)
  })
