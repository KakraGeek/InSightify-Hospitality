'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, Building2, Shield, Database, Bell, Palette, 
  Save, Camera, Trash2, Download, Upload, Key
} from 'lucide-react'
import { Button } from '../../components/components/ui/button'
import { Input } from '../../components/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/components/ui/select'

interface UserProfile {
  name: string
  email: string
  role: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      reports: boolean
    }
  }
}

interface BrandSettings {
  appName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  companyName: string
  contactEmail: string
  supportPhone: string
}

interface RetentionSettings {
  dataRetentionDays: number
  reportRetentionDays: number
  logRetentionDays: number
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupRetention: number
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: '',
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        reports: false
      }
    }
  })
  
  const [brand, setBrand] = useState<BrandSettings>({
    appName: 'InSightify',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    companyName: 'InSightify Hospitality',
    contactEmail: 'support@insightify.com',
    supportPhone: '+1 (555) 123-4567'
  })
  
  const [retention, setRetention] = useState<RetentionSettings>({
    dataRetentionDays: 365,
    reportRetentionDays: 730,
    logRetentionDays: 90,
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30
  })

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'user'
      }))
    }
  }, [session])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBrand = async () => {
    setSaving(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Brand settings updated successfully!')
    } catch (error) {
      console.error('Error updating brand settings:', error)
      alert('Error updating brand settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRetention = async () => {
    setSaving(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Retention settings updated successfully!')
    } catch (error) {
      console.error('Error updating retention settings:', error)
      alert('Error updating retention settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'brand', label: 'Brand', icon: Building2 },
    { id: 'retention', label: 'Retention', icon: Database }
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your profile, brand, and system preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="h-20 w-20 rounded-full" />
                      ) : (
                        <User className="h-10 w-10 text-gray-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Avatar
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <Input
                      value={profile.role}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Role is managed by administrators</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <Select value={profile.preferences.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      setProfile(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, theme: value } 
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <Select value={profile.preferences.language} onValueChange={(value) => 
                      setProfile(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, language: value } 
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <Select value={profile.preferences.timezone} onValueChange={(value) => 
                      setProfile(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, timezone: value } 
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.email}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              email: e.target.checked
                            }
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.push}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              push: e.target.checked
                            }
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.reports}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              reports: e.target.checked
                            }
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Report completion notifications</span>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === 'brand' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Brand Settings</h2>
              
              <div className="space-y-6">
                {/* Logo Section */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {brand.logo ? (
                        <img src={brand.logo} alt="Logo" className="h-20 w-20 object-contain" />
                      ) : (
                        <Building2 className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Logo
                    </Button>
                  </div>
                </div>

                {/* Brand Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                    <Input
                      value={brand.appName}
                      onChange={(e) => setBrand(prev => ({ ...prev, appName: e.target.value }))}
                      placeholder="Enter application name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <Input
                      value={brand.companyName}
                      onChange={(e) => setBrand(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={brand.primaryColor}
                        onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={brand.primaryColor}
                        onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={brand.secondaryColor}
                        onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={brand.secondaryColor}
                        onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={brand.contactEmail}
                      onChange={(e) => setBrand(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="support@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                    <Input
                      value={brand.supportPhone}
                      onChange={(e) => setBrand(prev => ({ ...prev, supportPhone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handleSaveBrand}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Brand Settings'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Retention Tab */}
          {activeTab === 'retention' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Retention Settings</h2>
              
              <div className="space-y-6">
                {/* Data Retention */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Retention Periods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Raw Data (days)</label>
                      <Input
                        type="number"
                        value={retention.dataRetentionDays}
                        onChange={(e) => setRetention(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))}
                        min="30"
                        max="3650"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long to keep uploaded data files</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reports (days)</label>
                      <Input
                        type="number"
                        value={retention.reportRetentionDays}
                        onChange={(e) => setRetention(prev => ({ ...prev, reportRetentionDays: parseInt(e.target.value) }))}
                        min="30"
                        max="3650"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long to keep generated reports</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">System Logs (days)</label>
                      <Input
                        type="number"
                        value={retention.logRetentionDays}
                        onChange={(e) => setRetention(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
                        min="7"
                        max="365"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long to keep system logs</p>
                    </div>
                  </div>
                </div>

                {/* Backup Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Configuration</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={retention.autoBackup}
                        onChange={(e) => setRetention(prev => ({ ...prev, autoBackup: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable automatic backups</span>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                        <Select value={retention.backupFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                          setRetention(prev => ({ ...prev, backupFrequency: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                        <Input
                          type="number"
                          value={retention.backupRetention}
                          onChange={(e) => setRetention(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
                          min="7"
                          max="365"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handleSaveRetention}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Retention Settings'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
