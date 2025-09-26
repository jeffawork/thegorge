import React from 'react'
import { motion } from 'framer-motion'
import { FileText, User, Bell, Shield, Database, Palette, Users, DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SettingsPageProps {
  activeTab?: string
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ activeTab = 'general' }) => {
  const { user, updateProfile } = useAuth()

  const getSettingTitle = (tab: string) => {
    switch (tab) {
      case 'general': return 'General Settings'
      case 'profile': return 'User Profile'
      case 'notifications': return 'Notification Settings'
      case 'security': return 'Security Settings'
      case 'data-privacy': return 'Data & Privacy'
      case 'appearance': return 'Appearance Settings'
      case 'team': return 'Team Management'
      case 'billing': return 'Billing & Subscription'
      default: return 'Settings'
    }
  }

  const getSettingDescription = (tab: string) => {
    switch (tab) {
      case 'general': return 'Manage your application preferences and configuration'
      case 'profile': return 'Update your personal information and account details'
      case 'notifications': return 'Configure how and when you receive notifications'
      case 'security': return 'Manage your security settings and API keys'
      case 'data-privacy': return 'Control your data retention and privacy settings'
      case 'appearance': return 'Customize the look and feel of your dashboard'
      case 'team': return 'Manage team members and their permissions'
      case 'billing': return 'View and manage your subscription and billing'
      default: return 'Manage your application settings'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
                 <h1 className="text-3xl font-bold text-gradient mb-2">{getSettingTitle(activeTab)}</h1>
                 <p className="text-[#B0B3C8]">{getSettingDescription(activeTab)}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-6"
      >
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#B0B3C8] mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Default Organization"
                      className="w-full px-3 py-2 bg-[#1A1D29]/50 border border-[#2A2D41] rounded-lg text-white focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B3C8] mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 bg-[#1A1D29]/50 border border-[#2A2D41] rounded-lg text-white focus:outline-none focus:border-[#00D4FF]">
                      <option>UTC</option>
                      <option>EST</option>
                      <option>PST</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Auto-refresh</div>
                      <div className="text-sm text-gray-400">Automatically refresh data every 30 seconds</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00D4FF] to-[#00FFFF] rounded-full flex items-center justify-center blockchain-pulse">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{user?.name || 'User'}</h3>
                    <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
                    <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full mt-1">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      onChange={(e) => updateProfile({ email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <select 
                      value={user?.role || 'admin'}
                      onChange={(e) => updateProfile({ role: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={user?.avatar || ''}
                      onChange={(e) => updateProfile({ avatar: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="pt-4">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Email Notifications</div>
                      <div className="text-sm text-gray-400">Receive alerts via email</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Push Notifications</div>
                      <div className="text-sm text-gray-400">Receive browser push notifications</div>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">SMS Alerts</div>
                      <div className="text-sm text-gray-400">Receive critical alerts via SMS</div>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-400">Add an extra layer of security</div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-privacy' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Data Retention</div>
                      <div className="text-sm text-gray-400">How long to keep monitoring data</div>
                    </div>
                    <select className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Analytics</div>
                      <div className="text-sm text-gray-400">Help improve the product with usage analytics</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Error Reporting</div>
                      <div className="text-sm text-gray-400">Automatically report errors for debugging</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                      <option>Dark</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Compact Mode</div>
                      <div className="text-sm text-gray-400">Use a more compact layout</div>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Team Management</h3>
                <div className="space-y-4">
                  <p className="text-gray-400">Manage your team members and their roles.</p>
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Manage Team
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Billing & Subscription</h3>
                <div className="space-y-4">
                  <p className="text-gray-400">View your current plan, usage, and billing history.</p>
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    View Billing
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
    </div>
  )
}
