import { z } from 'zod'

// Base schema for common fields
const BaseSchema = z.object({
  Date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date <= new Date()
  }, 'Date must be valid and not in the future'),
})

// Front Office specific schema with business logic validation
export const FrontOfficeSchema = BaseSchema.extend({
  Check_ins: z.number().min(0).max(1000),
  Check_outs: z.number().min(0).max(1000),
  Occupancy_Rate: z.number().min(0).max(100).refine((val) => val <= 100, 'Occupancy rate cannot exceed 100%'),
  ADR: z.number().min(0).max(10000).refine((val) => val >= 50, 'ADR seems too low for a hotel'),
  RevPAR: z.number().min(0).max(10000),
  Total_Revenue: z.number().min(0).max(1000000),
  Guests_Count: z.number().min(0).max(1000),
  Reservations: z.number().min(0).max(1000),
  No_Shows: z.number().min(0).max(100),
  Cancellations: z.number().min(0).max(100),
}).refine((data) => {
  // Business logic: Check-ins + existing guests - check-outs should be reasonable
  const estimatedOccupancy = data.Check_ins - data.Check_outs + data.Guests_Count
  return estimatedOccupancy >= 0 && estimatedOccupancy <= 1000
}, 'Guest count calculation seems incorrect')

// Food & Beverage schema with meal period validation
export const FoodBeverageSchema = BaseSchema.extend({
  Meal_Period: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Late Night']),
  Covers: z.number().min(0).max(1000),
  Food_Revenue: z.number().min(0).max(100000),
  Beverage_Revenue: z.number().min(0).max(100000),
  Total_Revenue: z.number().min(0).max(100000),
  Food_Cost: z.number().min(0).max(100000),
  Beverage_Cost: z.number().min(0).max(100000),
  Total_Cost: z.number().min(0).max(100000),
  GP_Percentage: z.number().min(0).max(100),
  Average_Check: z.number().min(0).max(1000),
}).refine((data) => {
  // Business logic: Total revenue should equal food + beverage revenue
  const calculatedTotal = data.Food_Revenue + data.Beverage_Revenue
  return Math.abs(data.Total_Revenue - calculatedTotal) < 0.01
}, 'Total revenue should equal food + beverage revenue')

// Housekeeping schema with room validation
export const HousekeepingSchema = BaseSchema.extend({
  Room_Number: z.string().regex(/^\d{3,4}$/, 'Room number should be 3-4 digits'),
  Room_Type: z.enum(['Standard', 'Deluxe', 'Suite', 'Presidential']),
  Status: z.enum(['Clean', 'Dirty', 'Inspected', 'Out of Order', 'Maintenance']),
  Cleaning_Time: z.number().min(0).max(300), // Max 5 hours
  Inspected_By: z.string().min(1).max(100),
  Issues_Found: z.number().min(0).max(10),
  Maintenance_Required: z.enum(['Yes', 'No', 'Urgent']),
  Notes: z.string().max(500),
}).refine((data) => {
  // Business logic: Clean rooms should have cleaning time > 0
  if (data.Status === 'Clean' && data.Cleaning_Time === 0) {
    return false
  }
  return true
}, 'Clean rooms must have cleaning time recorded')

// Engineering schema with maintenance validation
export const EngineeringSchema = BaseSchema.extend({
  Equipment_ID: z.string().min(1).max(50),
  Equipment_Type: z.enum(['HVAC', 'Electrical', 'Plumbing', 'Kitchen', 'Elevator', 'Other']),
  Issue_Description: z.string().min(10).max(500),
  Priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  Assigned_Technician: z.string().min(1).max(100),
  Estimated_Cost: z.number().min(0).max(100000),
  Completion_Time: z.number().min(0).max(480), // Max 8 hours
  Status: z.enum(['Open', 'In Progress', 'Completed', 'Cancelled']),
}).refine((data) => {
  // Business logic: Critical issues should have completion time > 0
  if (data.Priority === 'Critical' && data.Completion_Time === 0) {
    return false
  }
  return true
}, 'Critical issues must have estimated completion time')

// Sales & Marketing schema with campaign validation
export const SalesMarketingSchema = BaseSchema.extend({
  Campaign_Name: z.string().min(1).max(100),
  Campaign_Type: z.enum(['Digital', 'Print', 'TV', 'Radio', 'Social Media', 'Direct Mail']),
  Budget: z.number().min(0).max(1000000),
  Leads_Generated: z.number().min(0).max(10000),
  Conversions: z.number().min(0).max(1000),
  Revenue_Generated: z.number().min(0).max(1000000),
  ROI: z.number().min(-100).max(1000),
  Cost_per_Lead: z.number().min(0).max(1000),
  Status: z.enum(['Active', 'Paused', 'Completed', 'Cancelled']),
}).refine((data) => {
  // Business logic: ROI calculation validation
  if (data.Budget > 0 && data.Revenue_Generated > 0) {
    const calculatedROI = ((data.Revenue_Generated - data.Budget) / data.Budget) * 100
    return Math.abs(data.ROI - calculatedROI) < 1 // Allow 1% tolerance
  }
  return true
}, 'ROI calculation seems incorrect')

// Finance schema with accounting validation
export const FinanceSchema = BaseSchema.extend({
  Account_Code: z.string().regex(/^\d{4,6}$/, 'Account code should be 4-6 digits'),
  Account_Name: z.string().min(1).max(100),
  Transaction_Type: z.enum(['Revenue', 'Expense', 'Transfer', 'Adjustment']),
  Amount: z.number().min(-1000000).max(1000000),
  Category: z.enum(['Room Revenue', 'F&B Revenue', 'Other Revenue', 'Labor Cost', 'Operating Cost', 'Other Expense']),
  Department: z.string().min(1).max(50),
  Reference: z.string().min(1).max(100),
  Notes: z.string().max(500),
}).refine((data) => {
  // Business logic: Revenue should be positive, expenses negative
  if (data.Transaction_Type === 'Revenue' && data.Amount <= 0) {
    return false
  }
  if (data.Transaction_Type === 'Expense' && data.Amount >= 0) {
    return false
  }
  return true
}, 'Revenue should be positive, expenses should be negative')

// Human Resources schema with employee validation
export const HumanResourcesSchema = BaseSchema.extend({
  Employee_ID: z.string().regex(/^EMP\d{4}$/, 'Employee ID should be EMP followed by 4 digits'),
  Employee_Name: z.string().min(1).max(100),
  Department: z.string().min(1).max(50),
  Position: z.string().min(1).max(100),
  Hire_Date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date <= new Date()
  }, 'Hire date must be valid and not in the future'),
  Salary: z.number().min(20000).max(500000),
  Hours_Worked: z.number().min(0).max(80),
  Performance_Rating: z.number().min(1).max(5),
  Status: z.enum(['Active', 'Terminated', 'On Leave', 'Probation']),
}).refine((data) => {
  // Business logic: Salary should be reasonable for position
  if (data.Position.toLowerCase().includes('manager') && data.Salary < 50000) {
    return false
  }
  return true
}, 'Salary seems too low for this position')

// Department mapping for easy access
export const DepartmentSchemas = {
  'front-office': FrontOfficeSchema,
  'food-beverage': FoodBeverageSchema,
  'housekeeping': HousekeepingSchema,
  'engineering': EngineeringSchema,
  'sales-marketing': SalesMarketingSchema,
  'finance': FinanceSchema,
  'human-resources': HumanResourcesSchema,
} as const

export type DepartmentType = keyof typeof DepartmentSchemas

// Generic schema for unknown departments
export const GenericSchema = z.record(z.string(), z.unknown())

// Function to get schema for a specific department
export function getSchemaForDepartment(department: string) {
  const normalizedDept = department.toLowerCase().replace(/\s+/g, '-')
  return DepartmentSchemas[normalizedDept as DepartmentType] || GenericSchema
}

// Enhanced validation function with detailed error reporting
export function validateDataWithSchema<T>(data: T[], schema: z.ZodSchema, department: string) {
  const results = {
    validRows: 0,
    invalidRows: 0,
    totalRows: data.length,
    errors: [] as Array<{ row: number; field: string; message: string; value: unknown }>,
    warnings: [] as Array<{ row: number; field: string; message: string; value: unknown }>
  }

  data.forEach((row, index) => {
    try {
      const validated = schema.parse(row)
      results.validRows++
      
      // Additional business logic warnings
      if (department === 'front-office') {
        const frontOfficeRow = validated as { Occupancy_Rate?: number }
        if (frontOfficeRow.Occupancy_Rate && frontOfficeRow.Occupancy_Rate > 95) {
          results.warnings.push({
            row: index + 1,
            field: 'Occupancy_Rate',
            message: 'Very high occupancy rate - verify data accuracy',
            value: frontOfficeRow.Occupancy_Rate
          })
        }
      }
      
      if (department === 'food-beverage') {
        const fbRow = validated as { GP_Percentage?: number }
        if (fbRow.GP_Percentage && fbRow.GP_Percentage < 50) {
          results.warnings.push({
            row: index + 1,
            field: 'GP_Percentage',
            message: 'Low gross profit percentage - investigate costs',
            value: fbRow.GP_Percentage
          })
        }
      }
      
    } catch (error: unknown) {
      results.invalidRows++
      
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as { errors: unknown[] }).errors)) {
        (error as { errors: Array<{ path: string[]; message: string; input: unknown }> }).errors.forEach((err) => {
          results.errors.push({
            row: index + 1,
            field: err.path.join('.'),
            message: err.message,
            value: err.input
          })
        })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed'
        results.errors.push({
          row: index + 1,
          field: 'unknown',
          message: errorMessage,
          value: row
        })
      }
    }
  })

  return results
}
