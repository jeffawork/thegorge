import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Server, 
  Wallet, 
  Bell, 
  Settings,
  Activity,
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Database,
  Palette,
  Users,
  FileText
} from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rpc-sync', label: 'RPC Sync', icon: Server },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'usage-costs', label: 'Usage & Costs', icon: DollarSign },
  { id: 'anomalies', label: 'Anomalies', icon: AlertCircle }
]

const settingsItems = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: DollarSign }
]

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const isSettingsActive = activeTab.startsWith('settings') || settingsItems.some(item => activeTab === item.id)

  return (
    <motion.nav 
      className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 fixed left-0 top-0 z-50 overflow-y-auto"
      style={{ height: '100vh' }}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4">
               <div className="flex items-center space-x-3 mb-6">
                 <div className="w-7 h-7 bg-gradient-to-br from-[#00D4FF] to-[#00FFFF] rounded-lg flex items-center justify-center blockchain-pulse">
                   <Activity className="w-4 h-4 text-[#0A0E27]" />
                 </div>
                 <div>
                   <h1 className="text-lg font-bold text-gradient">The Gorge</h1>
                   <p className="text-xs text-[#B0B3C8]">RPC Monitor</p>
                 </div>
               </div>

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                     className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                       isActive
                         ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                         : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
                     }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 bg-[#00D4FF] rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            )
          })}

          {/* Settings Dropdown */}
          <div className="mt-2">
            <motion.button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                     className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                       isSettingsActive
                         ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                         : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
                     }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`} />
                <span className="text-sm font-medium">Settings</span>
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              )}
            </motion.button>

            {/* Settings Sub-items */}
            <motion.div
              initial={false}
              animate={{ 
                height: isSettingsOpen ? 'auto' : 0,
                opacity: isSettingsOpen ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {settingsItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                             className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-left transition-all duration-200 ${
                               isActive
                                 ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                                 : 'text-[#6B7280] hover:bg-[#1A1D29]/50 hover:text-white'
                             }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-1 h-1 bg-[#00D4FF] rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
