import { ProcessedDataPoint } from './dataProcessor'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Use file-based storage for development to persist data across API calls
// In production, this would be replaced with database storage
const STORAGE_FILE = join(process.cwd(), '.data-storage.json')

interface StorageData {
  dataPoints: ProcessedDataPoint[]
  kpis: Array<{
    kpiName: string;
    department: string;
    value: number;
    date: Date;
    period: string;
  }>
  lastUpdated: string
}

function loadStorage(): StorageData {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load storage file:', error)
  }
  
  return {
    dataPoints: [],
    kpis: [],
    lastUpdated: new Date().toISOString()
  }
}

function saveStorage(data: StorageData): void {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2))
    console.log(`💾 Storage saved to ${STORAGE_FILE}`)
  } catch (error) {
    console.error('Failed to save storage file:', error)
  }
}

function logStorageAccess(operation: string, dataCount: number, kpiCount: number) {
  console.log(`🔧 FileStorage: ${operation} - Data: ${dataCount}, KPIs: ${kpiCount}`)
}

/**
 * Store processed data points in the database
 */
export async function storeProcessedData(
  dataPoints: ProcessedDataPoint[],
  department: string
): Promise<{ success: boolean; storedCount: number; errors: string[] }> {
  const errors: string[] = []
  let storedCount = 0

  try {
    console.log(`📊 storeProcessedData called with ${dataPoints.length} data points for ${department}`)
    
    // Load current storage
    const storage = loadStorage()
    logStorageAccess('Before storage', storage.dataPoints.length, storage.kpis.length)

    // Add new data points
    storage.dataPoints.push(...dataPoints)
    storage.lastUpdated = new Date().toISOString()
    
    // Save updated storage
    saveStorage(storage)
    logStorageAccess('After adding data', storage.dataPoints.length, storage.kpis.length)

    console.log(`📊 Storing ${dataPoints.length} data points for ${department}`)

    // Simulate successful storage
    storedCount = dataPoints.length

    // Calculate and store KPI values
    console.log(`📊 Calling calculateAndStoreKPIs...`)
    await calculateAndStoreKPIs(dataPoints, department)
    
    // Load storage again to get updated KPI count
    const updatedStorage = loadStorage()
    logStorageAccess('After KPI calculation', updatedStorage.dataPoints.length, updatedStorage.kpis.length)

    return {
      success: true,
      storedCount,
      errors
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`❌ storeProcessedData error: ${errorMessage}`)
    errors.push(`Storage failed: ${errorMessage}`)
    return {
      success: false,
      storedCount: 0,
      errors
    }
  }
}

/**
 * Calculate KPI values from stored data and save them
 */
async function calculateAndStoreKPIs(dataPoints: ProcessedDataPoint[], department: string): Promise<void> {
  try {
    console.log(`🧮 Calculating KPIs for ${department}...`)
    
    // Group data by type
    const occupancyData = dataPoints.filter(d => d.dataType === 'occupancy_rate')
    const revenueData = dataPoints.filter(d => d.dataType === 'revenue')
    
    // Calculate average occupancy rate
    if (occupancyData.length > 0) {
      const avgOccupancy = occupancyData.reduce((sum, d) => sum + (d.value || 0), 0) / occupancyData.length
      console.log(`  📈 Average Occupancy Rate: ${avgOccupancy.toFixed(2)}%`)
      
      // Store in our persistent KPI store
      const storage = loadStorage()
      storage.kpis.push({
        kpiName: 'Occupancy Rate',
        department,
        value: avgOccupancy,
        date: new Date(),
        period: 'daily'
      })
      saveStorage(storage)
    }
    
    // Calculate average daily rate (ADR)
    if (revenueData.length > 0) {
      const avgRevenue = revenueData.reduce((sum, d) => sum + (d.value || 0), 0) / revenueData.length
      console.log(`  💰 Average Daily Rate: ₵${avgRevenue.toFixed(2)}`)
      
      // Store in our persistent KPI store
      const storage = loadStorage()
      storage.kpis.push({
        kpiName: 'Average Daily Rate (ADR)',
        department,
        value: avgRevenue,
        date: new Date(),
        period: 'daily'
      })
      saveStorage(storage)
    }
    
    // Calculate RevPAR (Revenue per Available Room)
    if (revenueData.length > 0 && occupancyData.length > 0) {
      const avgRevenue = revenueData.reduce((sum, d) => sum + (d.value || 0), 0) / revenueData.length
      const avgOccupancy = occupancyData.reduce((sum, d) => sum + (d.value || 0), 0) / occupancyData.length
      const revPAR = (avgRevenue * avgOccupancy) / 100
      console.log(`  📊 RevPAR: ₵${revPAR.toFixed(2)}`)
      
      // Store in our persistent KPI store
      const storage = loadStorage()
      storage.kpis.push({
        kpiName: 'Revenue per Available Room (RevPAR)',
        department,
        value: revPAR,
        date: new Date(),
        period: 'daily'
      })
      saveStorage(storage)
    }
    
    console.log(`✅ KPI calculations completed for ${department}`)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`❌ KPI calculation failed: ${errorMessage}`)
  }
}

/**
 * Get KPI values for dashboard display
 */
export async function getKPIValues(department?: string): Promise<Array<{
  kpiName: string;
  department: string;
  value: number;
  date: Date;
  period: string;
}>> {
  try {
    console.log(`🔍 getKPIValues called for department: ${department || 'all'}`)
    
    // Load storage
    const storage = loadStorage()
    logStorageAccess('getKPIValues called', storage.dataPoints.length, storage.kpis.length)
    
    // Return real processed data from our persistent storage
    const kpiData = storage.kpis
    
    if (kpiData.length === 0) {
      console.log('📊 No KPI data available yet. Upload a PDF to see metrics.')
      return []
    }
    
    console.log(`📊 Returning ${kpiData.length} KPI values from persistent storage`)
    
    if (department) {
      const filteredData = kpiData.filter(kpi => kpi.department === department)
      console.log(`📊 Filtered to ${filteredData.length} KPIs for department: ${department}`)
      return filteredData
    }
    
    return kpiData
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Failed to get KPI values: ${errorMessage}`)
    return []
  }
}

/**
 * Get recent data points for a department
 */
export async function getRecentData(department: string, limit: number = 10): Promise<ProcessedDataPoint[]> {
  try {
    // Load storage and return real data
    const storage = loadStorage()
    
    if (storage.dataPoints.length === 0) {
      console.log('📊 No data available yet. Upload a PDF to see metrics.')
      return []
    }
    
    // Filter by department and sort by date (most recent first)
    const departmentData = storage.dataPoints
      .filter(d => d.department === department)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
    
    console.log(`📊 Returning ${departmentData.length} recent data points for ${department}`)
    return departmentData
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Failed to get recent data: ${errorMessage}`)
    return []
  }
}
