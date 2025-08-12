import { describe, it, expect, beforeEach } from 'vitest'
import { KpiEngine, KpiCalculationInput } from '../kpi/engine'
import { ProcessedDataPoint } from '../lib/services/dataProcessor'


// Mock data for testing
const mockDataPoints: ProcessedDataPoint[] = [
  {
    department: 'Front Office',
    dataType: 'occupancy',
    value: 75,
    textValue: null,
    date: new Date('2024-01-01'),
    source: 'test',
    sourceFile: 'test.csv',
    metadata: { room_type: 'standard' }
  },
  {
    department: 'Front Office',
    dataType: 'revenue',
    value: 8000,
    textValue: null,
    date: new Date('2024-01-01'),
    source: 'test',
    sourceFile: 'test.csv',
    metadata: { room_type: 'standard' }
  },
  {
    department: 'Front Office',
    dataType: 'available_rooms',
    value: 100,
    textValue: null,
    date: new Date('2024-01-01'),
    source: 'test',
    sourceFile: 'test.csv',
    metadata: { room_type: 'standard' }
  },
  {
    department: 'Front Office',
    dataType: 'occupied_rooms',
    value: 75,
    textValue: null,
    date: new Date('2024-01-01'),
    source: 'test',
    sourceFile: 'test.csv',
    metadata: { room_type: 'standard' }
  }
]

describe('KPI Engine', () => {
  let kpiEngine: typeof KpiEngine
  let testInput: KpiCalculationInput

  beforeEach(() => {
    kpiEngine = KpiEngine
    testInput = {
      dataPoints: mockDataPoints,
      department: 'Front Office',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-01'),
      period: 'daily'
    }
  })

  describe('Basic KPI Calculations', () => {
    it('should calculate occupancy rate correctly', async () => {
      const results = await kpiEngine.calculateKPIs(testInput)
      const occupancyResult = results.find(r => r.kpiName === 'occupancy_rate')
      
      expect(occupancyResult).toBeDefined()
      expect(occupancyResult?.value).toBe(75) // 75 occupied / 100 available = 75%
      expect(occupancyResult?.unit).toBe('%')
    })

    it('should calculate average daily rate correctly', async () => {
      const results = await kpiEngine.calculateKPIs(testInput)
      const adrResult = results.find(r => r.kpiName === 'average_daily_rate')
      
      expect(adrResult).toBeDefined()
      expect(adrResult?.value).toBe(106.67) // 8000 revenue / 75 occupied = 106.67
      expect(adrResult?.unit).toBe('GHS/room')
    })

    it('should calculate RevPAR correctly', async () => {
      const results = await kpiEngine.calculateKPIs(testInput)
      const revparResult = results.find(r => r.kpiName === 'revpar')
      
      expect(revparResult).toBeDefined()
      expect(revparResult?.value).toBe(80) // 8000 revenue / 100 available = 80
      expect(revparResult?.unit).toBe('GHS/available room')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values gracefully', async () => {
      const zeroData: ProcessedDataPoint[] = [
        {
          department: 'Front Office',
          dataType: 'occupied_rooms',
          value: 0,
          textValue: null,
          date: new Date('2024-01-01'),
          source: 'test',
          sourceFile: 'test.csv',
          metadata: {}
        },
        {
          department: 'Front Office',
          dataType: 'available_rooms',
          value: 100,
          textValue: null,
          date: new Date('2024-01-01'),
          source: 'test',
          sourceFile: 'test.csv',
          metadata: {}
        }
      ]

      const zeroInput = { ...testInput, dataPoints: zeroData }
      const results = await kpiEngine.calculateKPIs(zeroInput)
      const occupancyResult = results.find(r => r.kpiName === 'occupancy_rate')
      
      expect(occupancyResult?.value).toBe(0)
    })

    it('should handle missing data gracefully', async () => {
      const emptyInput = { ...testInput, dataPoints: [] }
      const results = await kpiEngine.calculateKPIs(emptyInput)
      
      expect(results).toEqual([])
    })

    it('should handle invalid dates gracefully', async () => {
      const invalidDateInput = {
        ...testInput,
        startDate: new Date('invalid'),
        endDate: new Date('2024-01-01')
      }
      
      await expect(kpiEngine.calculateKPIs(invalidDateInput)).rejects.toThrow()
    })
  })

  describe('Time Bucketing', () => {
    it('should create daily buckets correctly', async () => {
      const dailyInput: KpiCalculationInput = {
        ...testInput,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        period: 'daily'
      }
      
      const results = await kpiEngine.calculateKPIs(dailyInput)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should create weekly buckets correctly', async () => {
      const weeklyInput: KpiCalculationInput = {
        ...testInput,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'weekly'
      }
      
      const results = await kpiEngine.calculateKPIs(weeklyInput)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Data Validation', () => {
    it('should validate input data structure', async () => {
      const invalidData = [
        {
          department: 'Front Office',
          // Missing required fields
          date: new Date('2024-01-01')
        }
      ] as Array<{
        department: string;
        date: Date;
        dataType?: string;
        value?: number;
        textValue?: string | null;
        source?: string;
        sourceFile?: string;
        metadata?: Record<string, unknown>;
      }>

      const invalidInput = { ...testInput, dataPoints: invalidData }
      
      await expect(kpiEngine.calculateKPIs(invalidInput)).rejects.toThrow()
    })

    it('should filter data by department correctly', async () => {
      const mixedData = [
        ...mockDataPoints,
        {
          department: 'Food & Beverage',
          dataType: 'covers',
          value: 50,
          textValue: null,
          date: new Date('2024-01-01'),
          source: 'test',
          sourceFile: 'test.csv',
          metadata: {}
        }
      ]

      const mixedInput = { ...testInput, dataPoints: mixedData }
      const results = await kpiEngine.calculateKPIs(mixedInput)
      
      // Should only calculate Front Office KPIs
      const allFrontOffice = results.every(r => 
        r.metadata.department === 'Front Office'
      )
      expect(allFrontOffice).toBe(true)
    })
  })

  describe('Confidence Calculation', () => {
    it('should calculate confidence based on data quality', async () => {
      const results = await kpiEngine.calculateKPIs(testInput)
      
      results.forEach(result => {
        expect(result.confidence).toBeGreaterThan(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should handle low confidence scenarios', async () => {
      const lowQualityData = mockDataPoints.map(dp => ({
        ...dp,
        value: (dp.value || 0) * 0.5 // Reduce data quality
      }))

      const lowQualityInput = { ...testInput, dataPoints: lowQualityData }
      const results = await kpiEngine.calculateKPIs(lowQualityInput)
      
      results.forEach(result => {
        expect(result.confidence).toBeLessThan(1)
      })
    })
  })

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, () => ({
        department: 'Front Office',
        dataType: 'occupancy',
        value: Math.random() * 100,
        textValue: null,
        date: new Date('2024-01-01'),
        source: 'test',
        sourceFile: 'test.csv',
        metadata: {}
      }))

      const largeInput = { ...testInput, dataPoints: largeDataset }
      const startTime = Date.now()
      
      const results = await kpiEngine.calculateKPIs(largeInput)
      const endTime = Date.now()
      
      expect(results.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
