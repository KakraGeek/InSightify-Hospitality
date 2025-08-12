import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth/options'
import { ReportStorageService } from '../../../lib/services/reportStorage'
import { hasRole, ROLES } from '../../../lib/auth/guard'

// GET /api/reports - List reports (viewer+)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has viewer+ access
    const userRoles = (session.user as any).roles || []
    const hasAccess = hasRole(userRoles, ROLES.VIEWER)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const limit = parseInt(searchParams.get('limit') || '20')

    const reports = await ReportStorageService.getReports(department || undefined, limit)
    
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/reports - Create new report (analyst+)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has analyst+ access
    const userRoles = (session.user as any).roles || []
    const hasAccess = hasRole(userRoles, ROLES.ANALYST)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - Analyst access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, department, reportType, startDate, endDate, isPublic } = body

    // Validate required fields
    if (!title || !department || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, department, startDate, endDate' }, 
        { status: 400 }
      )
    }

    const reportId = await ReportStorageService.createReport({
      title,
      description,
      department,
      reportType: reportType || 'custom',
      startDate: new Date(startDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD string
      endDate: new Date(endDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD string
      createdBy: (session.user as any).id || session.user.email || 'unknown',
      isPublic: isPublic || false,
    })

    return NextResponse.json({ 
      success: true, 
      reportId,
      message: 'Report created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PATCH /api/reports/[id] - Update report (analyst+)
export async function PATCH(
  _request: NextRequest
) {
  // This route is handled by /api/reports/[id]/route.ts
  return NextResponse.json({ 
    error: 'Use PATCH /api/reports/[id] to update a report' 
  }, { status: 400 })
}

// DELETE /api/reports/[id] - Delete report (analyst+)
export async function DELETE(
  _request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has analyst+ access
    const userRoles = (session.user as any).roles || []
    const hasAccess = hasRole(userRoles, ROLES.ANALYST)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - Analyst access required' }, { status: 403 })
    }

    // This route is handled by /api/reports/[id]/route.ts
    return NextResponse.json({ 
      error: 'Use DELETE /api/reports/[id] to delete a report' 
    }, { status: 400 })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
