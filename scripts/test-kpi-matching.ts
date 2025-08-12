import { ReportStorageService } from '../lib/services/reportStorage'

async function testKPIMatching() {
  console.log('🧪 Testing KPI Matching...')
  
  try {
    // Get all KPI data from storage
    console.log('\n🔍 Getting KPI data from storage...')
    const kpiData = await ReportStorageService.getKPIValues()
    console.log(`📊 Found ${kpiData.length} KPI data points in storage`)
    
    // Show sample data
    if (kpiData.length > 0) {
      console.log('\n📊 Sample KPI data from storage:')
      kpiData.slice(0, 10).forEach((kpi, index) => {
        console.log(`  ${index + 1}. "${kpi.kpiName}" (${kpi.department}): ${kpi.value} ${kpi.unit || ''}`)
      })
    }
    
    // Check department distribution
    const byDepartment = kpiData.reduce((acc, kpi) => {
      acc[kpi.department] = (acc[kpi.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n📊 KPI data by department:')
    Object.entries(byDepartment).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} KPIs`)
    })
    
    // Test the mapping function directly
    console.log('\n🔍 Testing KPI name mapping...')
    const testMappings = [
      { csvName: 'Food Cost', department: 'Food & Beverage' },
      { csvName: 'Average Check', department: 'Food & Beverage' },
      { csvName: 'Rooms Cleaned', department: 'Housekeeping' },
      { csvName: 'Maintenance Cost', department: 'Maintenance/Engineering' },
      { csvName: 'Conversion Rate', department: 'Sales & Marketing' },
      { csvName: 'Profit Margin', department: 'Finance' },
      { csvName: 'Employee Turnover', department: 'HR' }
    ]
    
    for (const test of testMappings) {
      // Use the private method through a public interface or test it directly
      console.log(`\n🔍 Testing mapping for "${test.csvName}" in ${test.department}:`)
      
      // Check if this data exists in storage
      const matchingData = kpiData.filter(k => 
        k.department === test.department && 
        k.kpiName.toLowerCase().includes(test.csvName.toLowerCase())
      )
      
      if (matchingData.length > 0) {
        console.log(`  ✅ Found ${matchingData.length} matching data points:`)
        matchingData.forEach(dp => {
          console.log(`    - "${dp.kpiName}": ${dp.value} ${dp.unit || ''}`)
        })
      } else {
        console.log(`  ❌ No matching data found`)
        
        // Check what's actually stored for this department
        const deptData = kpiData.filter(k => k.department === test.department)
        if (deptData.length > 0) {
          console.log(`  📊 Department "${test.department}" has ${deptData.length} KPIs:`)
          deptData.slice(0, 5).forEach(dp => {
            console.log(`    - "${dp.kpiName}": ${dp.value} ${dp.unit || ''}`)
          })
        } else {
          console.log(`  📊 No data found for department "${test.department}"`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing KPI matching:', error)
  }
}

testKPIMatching().catch(console.error)
