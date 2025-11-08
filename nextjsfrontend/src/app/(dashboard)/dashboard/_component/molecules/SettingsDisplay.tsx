import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { User } from 'lucide-react';

interface SettingsPageProps {
  activeTab?: string;
}

const SettingsDisplay: React.FC<SettingsPageProps> = ({
  activeTab = 'general',
}) => {
  const { user } = useAuthStore();

  // const { user, updateProfile } = useAuth()

  const getSettingTitle = (tab: string) => {
    switch (tab) {
      case 'general':
        return 'General Settings';
      case 'profile':
        return 'User Profile';
      case 'notifications':
        return 'Notification Settings';
      case 'security':
        return 'Security Settings';
      case 'data-privacy':
        return 'Data & Privacy';
      case 'appearance':
        return 'Appearance Settings';
      case 'team':
        return 'Team Management';
      case 'billing':
        return 'Billing & Subscription';
      default:
        return 'Settings';
    }
  };

  const getSettingDescription = (tab: string) => {
    switch (tab) {
      case 'general':
        return 'Manage your application preferences and configuration';
      case 'profile':
        return 'Update your personal information and account details';
      case 'notifications':
        return 'Configure how and when you receive notifications';
      case 'security':
        return 'Manage your security settings and API keys';
      case 'data-privacy':
        return 'Control your data retention and privacy settings';
      case 'appearance':
        return 'Customize the look and feel of your dashboard';
      case 'team':
        return 'Manage team members and their permissions';
      case 'billing':
        return 'View and manage your subscription and billing';
      default:
        return 'Manage your application settings';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gradient mb-2 text-3xl font-bold">
            {getSettingTitle(activeTab)}
          </h1>
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
              <h3 className="mb-4 text-lg font-semibold text-white">
                General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#B0B3C8]">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Default Organization"
                    className="w-full rounded-lg border border-[#2A2D41] bg-[#1A1D29]/50 px-3 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#B0B3C8]">
                    Timezone
                  </label>
                  <select className="w-full rounded-lg border border-[#2A2D41] bg-[#1A1D29]/50 px-3 py-2 text-white focus:border-[#00D4FF] focus:outline-none">
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Auto-refresh</div>
                    <div className="text-sm text-gray-400">
                      Automatically refresh data every 30 seconds
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="glass-card p-6">
              <div className="mb-6 flex items-center space-x-4">
                <div className="blockchain-pulse flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF] to-[#00FFFF]">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-gray-400">
                    {user?.email || 'user@example.com'}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-blue-600/20 px-2 py-1 text-xs text-blue-400">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    // value={user?.name || ''}
                    // onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    // value={user?.email || ''}
                    // onChange={(e) => updateProfile({ email: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Role
                  </label>
                  <select
                    // value={user?.role || 'admin'}
                    // onChange={(e) => updateProfile({ role: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    // value={user?.avatar || ''}
                    // onChange={(e) => updateProfile({ avatar: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="pt-4">
                  <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
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
              <h3 className="mb-4 text-lg font-semibold text-white">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      Email Notifications
                    </div>
                    <div className="text-sm text-gray-400">
                      Receive alerts via email
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      Push Notifications
                    </div>
                    <div className="text-sm text-gray-400">
                      Receive browser push notifications
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">SMS Alerts</div>
                    <div className="text-sm text-gray-400">
                      Receive critical alerts via SMS
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Security Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Current Password
                  </label>
                  <input
                    title="currentPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <input
                    title="newPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    title="confirmNewPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-400">
                      Add an extra layer of security
                    </div>
                  </div>
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
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
              <h3 className="mb-4 text-lg font-semibold text-white">
                Data & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Data Retention</div>
                    <div className="text-sm text-gray-400">
                      How long to keep monitoring data
                    </div>
                  </div>
                  <select className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option>7 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Analytics</div>
                    <div className="text-sm text-gray-400">
                      Help improve the product with usage analytics
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      Error Reporting
                    </div>
                    <div className="text-sm text-gray-400">
                      Automatically report errors for debugging
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Appearance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Theme
                  </label>
                  <select className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option>Dark</option>
                    <option>Light</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Language
                  </label>
                  <select className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Compact Mode</div>
                    <div className="text-sm text-gray-400">
                      Use a more compact layout
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Team Management
              </h3>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Manage your team members and their roles.
                </p>
                <button className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                  Manage Team
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Billing & Subscription
              </h3>
              <div className="space-y-4">
                <p className="text-gray-400">
                  View your current plan, usage, and billing history.
                </p>
                <button className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                  View Billing
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsDisplay;
