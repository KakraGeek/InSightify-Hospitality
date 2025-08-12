#!/usr/bin/env tsx

/**
 * Test script for Reports API endpoints
 * Run with: pnpm tsx scripts/test-reports-api.ts
 */

const API_BASE = 'http://localhost:3000/api'

async function testReportsAPI() {
  console.log('🧪 Testing Reports API endpoints...\n')

  try {
    // Test 1: GET /api/reports (should fail without auth)
    console.log('1. Testing GET /api/reports (unauthorized)...')
    const getResponse = await fetch(`${API_BASE}/reports`)
    if (getResponse.status === 401) {
      console.log('✅ GET /api/reports correctly returns 401 for unauthorized access')
    } else {
      console.log(`❌ GET /api/reports returned ${getResponse.status}, expected 401`)
    }

    // Test 2: POST /api/reports (should fail without auth)
    console.log('\n2. Testing POST /api/reports (unauthorized)...')
    const postResponse = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Report',
        department: 'Front Office',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
    })
    if (postResponse.status === 401) {
      console.log('✅ POST /api/reports correctly returns 401 for unauthorized access')
    } else {
      console.log(`❌ POST /api/reports returned ${postResponse.status}, expected 401`)
    }

    // Test 3: Test individual report endpoints
    console.log('\n3. Testing individual report endpoints (unauthorized)...')
    const testId = 'test-123'
    
    const getByIdResponse = await fetch(`${API_BASE}/reports/${testId}`)
    if (getByIdResponse.status === 401) {
      console.log('✅ GET /api/reports/[id] correctly returns 401 for unauthorized access')
    } else {
      console.log(`❌ GET /api/reports/[id] returned ${getByIdResponse.status}, expected 401`)
    }

    const patchResponse = await fetch(`${API_BASE}/reports/${testId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' })
    })
    if (patchResponse.status === 401) {
      console.log('✅ PATCH /api/reports/[id] correctly returns 401 for unauthorized access')
    } else {
      console.log(`❌ PATCH /api/reports/[id] returned ${patchResponse.status}, expected 401`)
    }

    const deleteResponse = await fetch(`${API_BASE}/reports/${testId}`, {
      method: 'DELETE'
    })
    if (deleteResponse.status === 401) {
      console.log('✅ DELETE /api/reports/[id] correctly returns 401 for unauthorized access')
    } else {
      console.log(`❌ DELETE /api/reports/[id] returned ${deleteResponse.status}, expected 401`)
    }

    console.log('\n🎉 All API tests completed!')
    console.log('Note: These tests verify that unauthorized access is properly blocked.')
    console.log('To test with authentication, you would need to include a valid session token.')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the tests
testReportsAPI()
