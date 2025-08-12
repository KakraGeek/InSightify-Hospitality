import { getDb } from '../lib/db'
import { reportItems } from '../db/schema/reports'
import { inArray } from 'drizzle-orm'

/**
 * Script to fix existing KPI names in the database
 * Maps incorrect names to correct catalog KPI names
 */
async function fixKPINames() {
  try {
    console.log('🔧 Starting KPI name fix...')
    
    const db = getDb()
    
    // Get all report items to see what needs fixing
    const allItems = await db.select().from(reportItems)
    console.log(`📊 Found ${allItems.length} report items to check`)
    
    // Define the mapping from incorrect names to correct names
    const nameMappings: Record<string, string> = {
      // Front Office
      'guest_count': 'Guest Count',
      'occupancy_rate': 'Occupancy Rate',
      'revenue': 'Revenue per Available Room (RevPAR)',
      'room_revenue': 'Revenue per Available Room (RevPAR)',
      'available_rooms': 'Occupancy Rate',
      'occupied_rooms': 'Occupancy Rate',
      'rgi': 'Revenue Generation Index (RGI)',
      'alos': 'Average Length of Stay (ALOS)',
      'booking_lead_time': 'Booking Lead Time',
      'cancellation_rate': 'Cancellation Rate',
      'no_show_rate': 'No-Show Rate',
      'average_daily_rate': 'Average Daily Rate (ADR)',
      'revpar': 'Revenue per Available Room (RevPAR)',
      'revenue_generation_index': 'Revenue Generation Index (RGI)',
      'average_length_of_stay': 'Average Length of Stay (ALOS)',
      'direct_booking_ratio': 'Direct Booking Ratio',
      'website_conversion_rate': 'Website Conversion Rate',
      'cost_per_acquisition': 'Cost per Acquisition (CPA)',
      'return_on_ad_spend': 'Return on Ad Spend (ROAS)',
      'forecast_accuracy': 'Forecast Accuracy (MAPE)',
      'group_booking_conversion_rate': 'Group Booking Conversion Rate',
      'upsell_attach_rate': 'Upsell Attach Rate',
      'email_ctr': 'Email CTR',
      'social_media_engagement': 'Social Media Engagement',
      'brand_awareness_score': 'Brand Awareness Score',
      
      // Food & Beverage
      'food_beverage_metric': 'Average Check',
      'food_cost': 'Food Cost %',
      'beverage_cost': 'Beverage Cost %',
      'covers': 'Covers',
      'average_check': 'Average Check',
      'revpash': 'RevPASH',
      'table_turnover': 'Table Turnover Rate',
      'waste': 'Waste %',
      'void_comp': 'Void/Comp %',
      'food_revenue': 'Food Revenue',
      'beverage_revenue': 'Beverage Revenue',
      
      // Housekeeping
      'housekeeping_metric': 'Rooms Cleaned per Shift',
      'cleaning_time': 'Average Cleaning Time',
      'inspection_rate': 'Inspection Pass Rate',
      'rooms_cleaned': 'Rooms Cleaned per Shift',
      'room_turnaround': 'Room Turnaround Time',
      'out_of_order': 'Out-of-Order %',
      'linen_cost': 'Linen Cost per Occupied Room',
      'guest_room_defect': 'Guest Room Defect Rate',
      'chemical_cost': 'Chemical Cost per Occupied Room',
      'hk_staff_efficiency': 'HK Staff Efficiency',
      
      // Maintenance/Engineering
      'maintenance_metric': 'Mean Time To Repair (MTTR)',
      'maintenance_cost': 'Maintenance Cost per Room',
      'energy_consumption': 'Energy Consumption (kWh)',
      'equipment_uptime': 'Equipment Uptime %',
      'preventive_maintenance': 'Preventive Maintenance %',
      'response_time': 'Response Time (minutes)',
      'work_order_completion': 'Work Order Completion %',
      'vendor_performance': 'Vendor Performance (1-5)',
      'safety_incidents': 'Safety Incidents',
      'energy_efficiency': 'Energy Efficiency %',
      'maintenance_staff_efficiency': 'Maintenance Staff Efficiency %',
      
      // Sales & Marketing
      'sales_metric': 'Direct Booking Ratio',
      'conversion_rate': 'Website Conversion Rate',
      'lead_generation': 'Lead Generation',
      'customer_acquisition_cost': 'Customer Acquisition Cost',
      'email_open_rate': 'Email Open Rate',
      'click_through_rate': 'Click Through Rate',
      'website_traffic': 'Website Traffic',
      'booking_conversion': 'Booking Conversion Rate',
      'customer_lifetime_value': 'Customer Lifetime Value',
      'marketing_roi': 'Marketing ROI',
      
      // Finance
      'finance_metric': 'Gross Operating Profit (GOP) Margin',
      'profit_margin': 'Profit Margin %',
      'operating_expenses': 'Operating Expenses',
      'cash_flow': 'Cash Flow',
      'debt_to_equity': 'Debt to Equity Ratio',
      'return_on_investment': 'Return on Investment %',
      'accounts_receivable': 'Accounts Receivable',
      'accounts_payable': 'Accounts Payable',
      'working_capital': 'Working Capital',
      'cost_per_room': 'Cost per Available Room',
      
      // HR
      'hr_metric': 'Staff-to-Room Ratio',
      'employee_turnover': 'Employee Turnover Rate',
      'training_completion': 'Training Completion Rate',
      'employee_satisfaction': 'Employee Satisfaction Score',
      'time_to_hire': 'Time to Hire',
      'cost_per_hire': 'Cost per Hire',
      'productivity_per_employee': 'Employee Productivity',
      'absenteeism_rate': 'Absenteeism Rate',
      'training_cost': 'Training Cost per Employee',
      'performance_rating': 'Employee Performance Rating',
      'retention_rate': 'Employee Retention Rate',
      
      // Additional mappings for variations found in database
      'goppar': 'GOPPAR',
      'inventory_turnover': 'Inventory Turnover',
      'training_hours_per_fte': 'Training Hours per FTE',
      'revenue_per_available_room': 'Revenue per Available Room (RevPAR)',
      'no-show_rate': 'No-Show Rate',
      'guest_satisfaction': 'Guest Satisfaction Score',
      'void/comp': 'Void/Comp %',
      'guest_room_defect_rate': 'Guest Room Defect Rate',
      'inspection_pass_rate': 'Inspection Pass Rate',
      'out-of-order': 'Out-of-Order %',
      'employee_turnover_%': 'Employee Turnover Rate',
      'training_completion_%': 'Training Completion Rate',
      'employee_satisfaction_(1-5)': 'Employee Satisfaction Score',
      'time_to_hire_(days)': 'Time to Hire',
      'productivity_per_employee_%': 'Employee Productivity',
      'absenteeism_rate_%': 'Absenteeism Rate',
      'performance_rating_(1-5)': 'Employee Performance Rating',
      'retention_rate_%': 'Employee Retention Rate'
    }
    
    // Find items that need fixing
    const itemsToFix = allItems.filter(item => nameMappings[item.kpiName])
    console.log(`🔧 Found ${itemsToFix.length} items that need name fixing`)
    
    if (itemsToFix.length === 0) {
      console.log('✅ No items need fixing - all names are correct!')
      return
    }
    
    // Group items by incorrect name for batch updates
    const updatesByIncorrectName: Record<string, string[]> = {}
    itemsToFix.forEach(item => {
      if (!updatesByIncorrectName[item.kpiName]) {
        updatesByIncorrectName[item.kpiName] = []
      }
      updatesByIncorrectName[item.kpiName].push(item.id)
    })
    
    console.log('🔧 Items to fix by incorrect name:')
    Object.entries(updatesByIncorrectName).forEach(([incorrectName, itemIds]) => {
      const correctName = nameMappings[incorrectName]
      console.log(`  "${incorrectName}" → "${correctName}" (${itemIds.length} items)`)
    })
    
    // Perform the updates
    let totalUpdated = 0
    for (const [incorrectName, itemIds] of Object.entries(updatesByIncorrectName)) {
      const correctName = nameMappings[incorrectName]
      
      try {
        await db.update(reportItems)
          .set({ kpiName: correctName })
          .where(inArray(reportItems.id, itemIds))
        
        console.log(`✅ Updated ${itemIds.length} items: "${incorrectName}" → "${correctName}"`)
        totalUpdated += itemIds.length
      } catch (error) {
        console.error(`❌ Failed to update "${incorrectName}":`, error)
      }
    }
    
    console.log(`🎉 KPI name fix completed! Updated ${totalUpdated} items`)
    
    // Verify the fix
    const verificationItems = await db.select().from(reportItems)
    const stillIncorrect = verificationItems.filter(item => nameMappings[item.kpiName])
    
    if (stillIncorrect.length === 0) {
      console.log('✅ Verification passed - all names are now correct!')
    } else {
      console.log(`⚠️ Verification failed - ${stillIncorrect.length} items still have incorrect names`)
      console.log('Sample remaining incorrect names:', stillIncorrect.slice(0, 10).map(i => i.kpiName))
    }
    
  } catch (error) {
    console.error('❌ KPI name fix failed:', error)
  }
}

// Run the script
fixKPINames()
  .then(() => {
    console.log('🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
