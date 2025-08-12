import { getKPIValues } from '../../lib/services/dataStorage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TestDashboardPage() {
  console.log('🔍 Test Dashboard: Starting...')
  
  try {
    const kpiData = await getKPIValues()
    console.log('🔍 Test Dashboard: KPI data fetched:', kpiData)
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Dashboard</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">KPI Data Status:</h2>
          <p>Total KPIs: {kpiData.length}</p>
          <p>Last Updated: {kpiData.length > 0 ? new Date(kpiData[0].date).toLocaleString() : 'N/A'}</p>
        </div>
        
        {kpiData.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">KPIs:</h2>
            {kpiData.map((kpi, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-medium">{kpi.kpiName}</h3>
                <p>Department: {kpi.department}</p>
                <p>Value: {kpi.value}</p>
                <p>Date: {new Date(kpi.date).toLocaleString()}</p>
                <p>Period: {kpi.period}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-red-500">
            <p>No KPI data available!</p>
            <p>This means the dashboard won&apos;t show real data either.</p>
          </div>
        )}
        
        <div className="mt-8">
          <a href="/dashboard" className="text-blue-500 hover:underline">
            &larr; Back to Real Dashboard
          </a>
        </div>
      </div>
    )
  } catch (error: unknown) {
    console.error('🔍 Test Dashboard: Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Dashboard - Error</h1>
        <div className="text-red-500">
          <p>Error loading KPI data:</p>
          <pre>{errorMessage}</pre>
        </div>
      </div>
    )
  }
}
