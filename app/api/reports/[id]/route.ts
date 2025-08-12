import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth/options'
import { ReportStorageService } from '../../../../lib/services/reportStorage'
import { hasRole, ROLES } from '../../../../lib/auth/guard'

// GET /api/reports/[id] - Get specific report (viewer+)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reportId } = await params
    
    const report = await ReportStorageService.getReportById(reportId)
    
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to fetch report:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PATCH /api/reports/[id] - Update specific report (analyst+)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if user has analyst+ access
    const userRoles = (session.user as any).roles || []
    const hasAccess = hasRole(userRoles, ROLES.ANALYST)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - Analyst access required' }, { status: 403 })
    }

    const { id: reportId } = await params
    const body = await request.json()
    const { title, description, isPublic } = body

    const success = await ReportStorageService.updateReport(reportId, {
      title,
      description,
      isPublic,
    })
    
    return NextResponse.json({ 
      success, 
      message: 'Report updated successfully',
      reportId 
    })
  } catch (error) {
    console.error('Failed to update report:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Delete specific report (analyst+)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: reportId } = await params

    const success = await ReportStorageService.deleteReport(reportId)
    
    return NextResponse.json({ 
      success, 
      message: 'Report deleted successfully',
      reportId 
    })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
