'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { 
  Home, 
  Settings, 
  User, 
  Palette, 
  Globe, 
  Database,
  Download,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  Monitor,
  Sun,
  Moon
} from 'lucide-react'
import Link from 'next/link'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  preferences: {
    defaultMode: 'play' | 'practical'
    autoSave: boolean
    soundEffects: boolean
    animations: boolean
  }
  accessibility: {
    reducedMotion: boolean
    largeText: boolean
  }
}

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    preferences: {
      defaultMode: 'play',
      autoSave: true,
      soundEffects: true,
      animations: true
    },
    accessibility: {
      reducedMotion: false,
      largeText: false
    }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('lab-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Error parsing saved settings:', error)
      }
    }
    
    // Apply theme settings
    applyThemeSettings()
  }, [])

  // Apply settings when they change
  useEffect(() => {
    applySettings()
  }, [settings])

  const applyThemeSettings = () => {
    const savedSettings = localStorage.getItem('lab-settings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        applyTheme(parsedSettings.theme)
      } catch (error) {
        console.error('Error applying theme settings:', error)
      }
    }
  }

  const applySettings = () => {
    // Apply theme
    applyTheme(settings.theme)
    
    // Apply animations
    if (settings.preferences.animations) {
      document.body.classList.remove('no-animations')
    } else {
      document.body.classList.add('no-animations')
    }

    // Apply reduced motion
    if (settings.accessibility.reducedMotion) {
      document.body.classList.add('reduce-motion')
    } else {
      document.body.classList.remove('reduce-motion')
    }

    // Apply large text
    if (settings.accessibility.largeText) {
      document.body.classList.add('large-text')
    } else {
      document.body.classList.remove('large-text')
    }

    // Save to localStorage
    localStorage.setItem('lab-settings', JSON.stringify(settings))
  }

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem('lab-settings', JSON.stringify(settings))
    setHasChanges(false)
    alert('Settings saved successfully!')
  }

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      theme: 'light',
      preferences: {
        defaultMode: 'play',
        autoSave: true,
        soundEffects: true,
        animations: true
      },
      accessibility: {
        reducedMotion: false,
        largeText: false
      }
    }
    setSettings(defaultSettings)
    localStorage.setItem('lab-settings', JSON.stringify(defaultSettings))
    setHasChanges(false)
    alert('Settings reset to defaults!')
  }

  const exportData = async () => {
    try {
      // This would typically fetch from your API
      const response = await fetch('/api/experiments/history')
      const data = await response.json()
      
      const exportData = {
        user: user?.emailAddresses[0]?.emailAddress,
        exportDate: new Date().toISOString(),
        experiments: data.experiments || [],
        settings: settings
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chemistry-lab-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to export data')
    }
  }

  const deleteAllData = async () => {
    try {
      const response = await fetch('/api/user/delete-all-data', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        localStorage.clear()
        alert('All data deleted successfully')
        setShowDeleteConfirm(false)
      } else {
        alert('Failed to delete data')
      }
    } catch (error) {
      alert('Failed to delete data')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe className="h-4 w-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Eye className="h-4 w-4" /> },
    { id: 'data', label: 'Data & Storage', icon: <Database className="h-4 w-4" /> }
  ]

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${settings.accessibility.largeText ? 'text-lg' : ''}`}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-black hover:text-gray-700">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-bold text-black">Settings</span>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100">
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-black">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-black mt-1">
                  Manage your {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} settings
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">{user?.fullName || 'User'}</h3>
                        <p className="text-black">{user?.emailAddresses[0]?.emailAddress}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Display Name</label>
                        <input
                          type="text"
                          defaultValue={user?.fullName || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black"
                        />
                        <p className="text-sm text-gray-500 mt-1">Managed by Clerk Authentication</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                        <input
                          type="email"
                          defaultValue={user?.emailAddresses[0]?.emailAddress || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black"
                        />
                        <p className="text-sm text-gray-500 mt-1">Managed by Clerk Authentication</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
                          { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
                          { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => {
                              setSettings(prev => ({ ...prev, theme: theme.value as 'light' | 'dark' | 'system' }))
                              setHasChanges(true)
                            }}
                            className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                              settings.theme === theme.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50 text-black'
                            }`}
                          >
                            {theme.icon}
                            <span>{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-3">Default Lab Mode</label>
                      <select
                        value={settings.preferences.defaultMode}
                        onChange={(e) => updateSetting('preferences', 'defaultMode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="play">Play Mode (Simple)</option>
                        <option value="practical">Practical Mode (Detailed)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-black">Auto-save Experiments</h4>
                        <p className="text-sm text-gray-500">Automatically save experiments when completed</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.preferences.autoSave}
                        onChange={(value) => updateSetting('preferences', 'autoSave', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-black">Sound Effects</h4>
                        <p className="text-sm text-gray-500">Play sounds for lab interactions</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.preferences.soundEffects}
                        onChange={(value) => updateSetting('preferences', 'soundEffects', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-black">Animations</h4>
                        <p className="text-sm text-gray-500">Enable smooth animations and transitions</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.preferences.animations}
                        onChange={(value) => updateSetting('preferences', 'animations', value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'accessibility' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-black">Reduced Motion</h4>
                        <p className="text-sm text-gray-500">Minimize animations and motion effects</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.accessibility.reducedMotion}
                        onChange={(value) => updateSetting('accessibility', 'reducedMotion', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-black">Large Text</h4>
                        <p className="text-sm text-gray-500">Increase text size for better readability</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.accessibility.largeText}
                        onChange={(value) => updateSetting('accessibility', 'largeText', value)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-3">Data Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage your experiment data and settings
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={exportData}
                        className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete All Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {hasChanges && (
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={saveSettings}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    
                    <button
                      onClick={resetSettings}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-black mb-4">Delete All Data</h3>
            <p className="text-black mb-6">
              This will permanently delete all your experiments, settings, and user data. This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAllData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
