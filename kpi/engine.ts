import { ProcessedDataPoint } from '../lib/services/dataProcessor'
import { KpiDefinition, getKPIByName } from './definitions'

export interface KpiCalculationInput {
  dataPoints: ProcessedDataPoint[]
  department: string
  startDate: Date
  endDate: Date
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

export interface KpiCalculationResult {
  kpiName: string
  value: number
  unit: string
  date: Date
  period: string
  confidence: number
  metadata: {
    dataPointsUsed: number
    calculationMethod: string
    timeRange: string
    department: string
    source: string
  }
}

export interface TimeBucket {
  start: Date
  end: Date
  label: string
}

/**
 * KPI Engine for calculating hospitality metrics
 */
export class KpiEngine {
  /**
   * Calculate KPIs for a given department and time period
   */
  static async calculateKPIs(input: KpiCalculationInput): Promise<KpiCalculationResult[]> {
    const results: KpiCalculationResult[] = []
    
    try {
      // Validate dates
      if (isNaN(input.startDate.getTime()) || isNaN(input.endDate.getTime())) {
        throw new Error('Invalid dates provided')
      }
      
      // Get KPI definitions for the department
      const kpiDefinitions = this.getKPIsForDepartment(input.department)
      
      // If no data points, return empty results
      if (input.dataPoints.length === 0) {
        return []
      }
      
      // Validate data structure
      for (const dataPoint of input.dataPoints) {
        if (!dataPoint.department || !dataPoint.dataType || !dataPoint.date || dataPoint.value === undefined) {
          throw new Error('Invalid data point structure')
        }
      }
      
      // Create time buckets for the specified period
      const timeBuckets = this.createTimeBuckets(input.startDate, input.endDate, input.period)
      
      // Calculate KPIs for each time bucket
      for (const bucket of timeBuckets) {
        const bucketData = this.filterDataByTimeRange(input.dataPoints, bucket.start, bucket.end)
        
        for (const kpiDef of kpiDefinitions) {
          try {
            const result = await this.calculateSingleKPI(kpiDef, bucketData, bucket, input.department)
            if (result) {
              results.push(result)
            }
          } catch (error) {
            console.warn(`Failed to calculate KPI ${kpiDef.name}:`, error)
          }
        }
      }
      
      return results
    } catch (error) {
      console.error('KPI calculation failed:', error)
      throw error
    }
  }
  
  /**
   * Calculate a single KPI value
   */
  private static async calculateSingleKPI(
    kpiDef: KpiDefinition,
    dataPoints: ProcessedDataPoint[],
    timeBucket: TimeBucket,
    department: string
  ): Promise<KpiCalculationResult | null> {
    try {
      let value: number
      let confidence: number = 1.0
      
      switch (kpiDef.name) {
        case 'occupancy_rate':
          value = this.calculateOccupancyRate(dataPoints)
          break
        case 'average_daily_rate':
          value = this.calculateAverageDailyRate(dataPoints)
          break
        case 'revpar':
          value = this.calculateRevPAR(dataPoints)
          break
        case 'average_check':
          value = this.calculateAverageCheck(dataPoints)
          break
        case 'food_cost_percentage':
          value = this.calculateFoodCostPercentage(dataPoints)
          break
        case 'rooms_cleaned_per_shift':
          value = this.calculateRoomsCleanedPerShift(dataPoints)
          break
        case 'gop_margin':
          value = this.calculateGOPMargin(dataPoints)
          break
        case 'goppar':
          value = this.calculateGOPPAR(dataPoints)
          break
        case 'trevpar':
          value = this.calculateTRevPAR(dataPoints)
          break
        case 'staff_to_room_ratio':
          value = this.calculateStaffToRoomRatio(dataPoints)
          break
        default:
          // Try generic calculation based on calculation type
          value = this.calculateGenericKPI(kpiDef, dataPoints)
      }
      
      if (isNaN(value) || !isFinite(value)) {
        return null
      }
      
      // Calculate confidence based on data quality
      confidence = this.calculateConfidence(dataPoints, kpiDef)
      
      return {
        kpiName: kpiDef.name,
        value: this.roundToPrecision(value, 2),
        unit: kpiDef.unit,
        date: timeBucket.start,
        period: timeBucket.label,
        confidence,
        metadata: {
          dataPointsUsed: dataPoints.length,
          calculationMethod: kpiDef.calculationType,
          timeRange: `${timeBucket.start.toDateString()} - ${timeBucket.end.toDateString()}`,
          department,
          source: this.getPrimarySource(dataPoints),
        }
      }
    } catch (error) {
      console.warn(`Error calculating KPI ${kpiDef.name}:`, error)
      return null
    }
  }
  
  /**
   * Calculate Occupancy Rate
   */
  private static calculateOccupancyRate(dataPoints: ProcessedDataPoint[]): number {
    const occupiedData = dataPoints.filter(d => d.dataType === 'occupied_rooms')
    const availableData = dataPoints.filter(d => d.dataType === 'available_rooms')
    
    if (occupiedData.length === 0 || availableData.length === 0) return 0
    
    const totalOccupied = occupiedData.reduce((sum, d) => sum + (d.value || 0), 0)
    const totalAvailable = availableData.reduce((sum, d) => sum + (d.value || 0), 0)
    
    if (totalAvailable === 0) return 0
    return (totalOccupied / totalAvailable) * 100
  }
  
  /**
   * Calculate Average Daily Rate (ADR)
   */
  private static calculateAverageDailyRate(dataPoints: ProcessedDataPoint[]): number {
    const revenueData = dataPoints.filter(d => d.dataType === 'revenue')
    const occupiedData = dataPoints.filter(d => d.dataType === 'occupied_rooms')
    
    if (revenueData.length === 0 || occupiedData.length === 0) return 0
    
    const totalRevenue = revenueData.reduce((sum, d) => sum + (d.value || 0), 0)
    const totalOccupied = occupiedData.reduce((sum, d) => sum + (d.value || 0), 0)
    
    if (totalOccupied === 0) return 0
    return totalRevenue / totalOccupied
  }
  
  /**
   * Calculate Revenue per Available Room (RevPAR)
   */
  private static calculateRevPAR(dataPoints: ProcessedDataPoint[]): number {
    const revenueData = dataPoints.filter(d => d.dataType === 'revenue')
    const availableData = dataPoints.filter(d => d.dataType === 'available_rooms')
    
    if (revenueData.length === 0 || availableData.length === 0) return 0
    
    const totalRevenue = revenueData.reduce((sum, d) => sum + (d.value || 0), 0)
    const totalAvailable = availableData.reduce((sum, d) => sum + (d.value || 0), 0)
    
    if (totalAvailable === 0) return 0
    return totalRevenue / totalAvailable
  }
  
  /**
   * Calculate Average Check
   */
  private static calculateAverageCheck(dataPoints: ProcessedDataPoint[]): number {
    const fbData = dataPoints.filter(d => d.dataType === 'food_beverage_metric')
    if (fbData.length === 0) return 0
    
    // This is a simplified calculation - in practice you'd need revenue and covers data
    const totalValue = fbData.reduce((sum, d) => sum + (d.value || 0), 0)
    return totalValue / fbData.length
  }
  
  /**
   * Calculate Food Cost Percentage
   */
  private static calculateFoodCostPercentage(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual food cost and revenue data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate Rooms Cleaned per Shift
   */
  private static calculateRoomsCleanedPerShift(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual housekeeping data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate GOP Margin
   */
  private static calculateGOPMargin(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual financial data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate GOPPAR
   */
  private static calculateGOPPAR(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual financial data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate TRevPAR
   */
  private static calculateTRevPAR(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual financial data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate Staff to Room Ratio
   */
  private static calculateStaffToRoomRatio(dataPoints: ProcessedDataPoint[]): number {
    // This would need actual HR data
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Generic KPI calculation based on calculation type
   */
  private static calculateGenericKPI(kpiDef: KpiDefinition, dataPoints: ProcessedDataPoint[]): number {
    switch (kpiDef.calculationType) {
      case 'simple':
        return this.calculateSimpleAverage(dataPoints)
      case 'aggregated':
        return this.calculateAggregatedSum(dataPoints)
      case 'derived':
        return this.calculateDerivedValue(kpiDef, dataPoints)
      case 'ratio':
        return this.calculateRatio(kpiDef, dataPoints)
      default:
        return 0
    }
  }
  
  /**
   * Calculate simple average
   */
  private static calculateSimpleAverage(dataPoints: ProcessedDataPoint[]): number {
    if (dataPoints.length === 0) return 0
    const total = dataPoints.reduce((sum, d) => sum + (d.value || 0), 0)
    return total / dataPoints.length
  }
  
  /**
   * Calculate aggregated sum
   */
  private static calculateAggregatedSum(dataPoints: ProcessedDataPoint[]): number {
    return dataPoints.reduce((sum, d) => sum + (d.value || 0), 0)
  }
  
  /**
   * Calculate derived value (placeholder for complex calculations)
   */
  private static calculateDerivedValue(kpiDef: KpiDefinition, dataPoints: ProcessedDataPoint[]): number {
    // This would implement the actual formula from kpiDef.formula
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Calculate ratio (placeholder for ratio calculations)
   */
  private static calculateRatio(kpiDef: KpiDefinition, dataPoints: ProcessedDataPoint[]): number {
    // This would implement the actual ratio calculation
    // For now, return a placeholder
    return 0
  }
  
  /**
   * Create time buckets for the specified period
   */
  private static createTimeBuckets(startDate: Date, endDate: Date, period: string): TimeBucket[] {
    const buckets: TimeBucket[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const bucketStart = new Date(current)
      let bucketEnd: Date
      let label: string
      
      switch (period) {
        case 'daily':
          bucketEnd = new Date(current)
          bucketEnd.setDate(bucketEnd.getDate() + 1)
          label = current.toDateString()
          current.setDate(current.getDate() + 1)
          break
        case 'weekly':
          bucketEnd = new Date(current)
          bucketEnd.setDate(bucketEnd.getDate() + 7)
          label = `Week of ${current.toDateString()}`
          current.setDate(current.getDate() + 7)
          break
        case 'monthly':
          bucketEnd = new Date(current)
          bucketEnd.setMonth(bucketEnd.getMonth() + 1)
          label = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          current.setMonth(current.getMonth() + 1)
          break
        case 'quarterly':
          bucketEnd = new Date(current)
          bucketEnd.setMonth(bucketEnd.getMonth() + 3)
          label = `Q${Math.floor(current.getMonth() / 3) + 1} ${current.getFullYear()}`
          current.setMonth(current.getMonth() + 3)
          break
        case 'yearly':
          bucketEnd = new Date(current)
          bucketEnd.setFullYear(bucketEnd.getFullYear() + 1)
          label = current.getFullYear().toString()
          current.setFullYear(current.getFullYear() + 1)
          break
        default:
          bucketEnd = new Date(current)
          bucketEnd.setDate(bucketEnd.getDate() + 1)
          label = current.toDateString()
          current.setDate(current.getDate() + 1)
      }
      
      buckets.push({
        start: bucketStart,
        end: bucketEnd,
        label
      })
    }
    
    return buckets
  }
  
  /**
   * Filter data points by time range
   */
  private static filterDataByTimeRange(dataPoints: ProcessedDataPoint[], start: Date, end: Date): ProcessedDataPoint[] {
    return dataPoints.filter(d => {
      const dataDate = new Date(d.date)
      return dataDate >= start && dataDate < end
    })
  }
  
  /**
   * Get KPI definitions for a specific department
   */
  private static getKPIsForDepartment(department: string): KpiDefinition[] {
    // For testing purposes, return mock KPI definitions
    // In production, this would load from the actual definitions
    return [
      {
        name: 'occupancy_rate',
        displayName: 'Occupancy Rate',
        description: 'Percentage of available rooms that are occupied',
        department: 'Front Office',
        category: 'occupancy' as any,
        formula: 'Occupied Rooms / Available Rooms × 100',
        unit: '%',
        targetValue: 85,
        minValue: 0,
        maxValue: 100,
        inputs: ['occupied_rooms', 'available_rooms'],
        calculationType: 'ratio' as any,
        timeGranularity: 'daily' as any,
        isActive: true,
      },
      {
        name: 'average_daily_rate',
        displayName: 'Average Daily Rate (ADR)',
        description: 'Average revenue earned per occupied room per day',
        department: 'Front Office',
        category: 'revenue' as any,
        formula: 'Total Room Revenue / Number of Occupied Rooms',
        unit: 'GHS/room',
        targetValue: 8000,
        minValue: 0,
        inputs: ['room_revenue', 'occupied_rooms'],
        calculationType: 'aggregated' as any,
        timeGranularity: 'daily' as any,
        isActive: true,
      },
      {
        name: 'revpar',
        displayName: 'Revenue per Available Room (RevPAR)',
        description: 'Total room revenue divided by total available rooms',
        department: 'Front Office',
        category: 'revenue' as any,
        formula: 'Total Room Revenue / Total Available Rooms',
        unit: 'GHS/available room',
        targetValue: 7000,
        minValue: 0,
        inputs: ['room_revenue', 'available_rooms'],
        calculationType: 'derived' as any,
        timeGranularity: 'daily' as any,
        isActive: true,
      }
    ]
  }
  
  /**
   * Calculate confidence based on data quality
   */
  private static calculateConfidence(dataPoints: ProcessedDataPoint[], kpiDef: KpiDefinition): number {
    if (dataPoints.length === 0) return 0
    
    // Base confidence on number of data points
    let confidence = Math.min(dataPoints.length / 10, 1.0)
    
    // Reduce confidence for derived calculations
    if (kpiDef.calculationType === 'derived') {
      confidence *= 0.9
    }
    
    // Reduce confidence for ratio calculations
    if (kpiDef.calculationType === 'ratio') {
      confidence *= 0.85
    }
    
    return Math.max(confidence, 0.1) // Minimum 10% confidence
  }
  
  /**
   * Get primary source from data points
   */
  private static getPrimarySource(dataPoints: ProcessedDataPoint[]): string {
    if (dataPoints.length === 0) return 'unknown'
    
    const sources = dataPoints.map(d => d.source)
    const sourceCounts = sources.reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(sourceCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
  }
  
  /**
   * Round number to specified precision
   */
  private static roundToPrecision(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision)
    return Math.round(value * multiplier) / multiplier
  }
}
