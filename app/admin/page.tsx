import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/hooks/useAuth'
import { Button } from '@/components/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/components/ui/card'
import { Badge } from '@/components/components/ui/badge'

function AdminDashboard() {
  const { user, userRoles, isAdmin, isAnalyst, isViewer, canManageUsers, canManageRoles } = useAuth()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Role-based access control demonstration</p>
        </div>
        <div className="flex gap-2">
          {userRoles.map((role: string) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            {canManageUsers ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have permission to manage users.
                </p>
                <Button className="w-full">Manage Users</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don't have permission to manage users.
                </p>
                <Button className="w-full" disabled>
                  Manage Users
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Manage roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {canManageRoles ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have permission to manage roles.
                </p>
                <Button className="w-full">Manage Roles</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don't have permission to manage roles.
                </p>
                <Button className="w-full" disabled>
                  Manage Roles
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure application settings</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have admin access to system settings.
                </p>
                <Button className="w-full">Configure Settings</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Only admins can access system settings.
                </p>
                <Button className="w-full" disabled>
                  Configure Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Role Information</CardTitle>
          <CardDescription>Current user permissions and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">User Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  <p><strong>Roles:</strong> {userRoles.join(', ') || 'None'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Role Status</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Analyst:</strong> {isAnalyst ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Viewer:</strong> {isViewer ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  )
}
