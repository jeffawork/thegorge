import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Activity,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  Filter,
  Eye
} from 'lucide-react'

interface UsageData {
  period: string
  apiCalls: number
  rpcCalls: number
  dataTransfer: number
  activeUsers: number
  cost: number
}

interface UserActivity {
  userId: string
  name: string
  role: string
  lastActive: Date
  apiCalls: number
  rpcCalls: number
  dataTransfer: number
  status: 'active' | 'inactive' | 'suspended'
}

export const UsageAnalytics: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [viewMode, setViewMode] = useState<'overview' | 'users' | 'detailed'>('overview')

  useEffect(() => {
    fetchUsageData()
    const interval = setInterval(fetchUsageData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchUsageData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockUsageData: UsageData[] = [
        {
          period: '2024-01-01',
          apiCalls: 125000,
          rpcCalls: 850000,
          dataTransfer: 2.4,
          activeUsers: 45,
          cost: 2450
        },
        {
          period: '2024-01-02',
          apiCalls: 132000,
          rpcCalls: 920000,
          dataTransfer: 2.8,
          activeUsers: 48,
          cost: 2630
        },
        {
          period: '2024-01-03',
          apiCalls: 118000,
          rpcCalls: 780000,
          dataTransfer: 2.1,
          activeUsers: 42,
          cost: 2280
        },
        {
          period: '2024-01-04',
          apiCalls: 145000,
          rpcCalls: 1050000,
          dataTransfer: 3.2,
          activeUsers: 52,
          cost: 2847
        },
        {
          period: '2024-01-05',
          apiCalls: 138000,
          rpcCalls: 980000,
          dataTransfer: 2.9,
          activeUsers: 49,
          cost: 2720
        },
        {
          period: '2024-01-06',
          apiCalls: 152000,
          rpcCalls: 1120000,
          dataTransfer: 3.5,
          activeUsers: 55,
          cost: 2950
        },
        {
          period: '2024-01-07',
          apiCalls: 148000,
          rpcCalls: 1080000,
          dataTransfer: 3.3,
          activeUsers: 53,
          cost: 3100
        }
      ]

      const mockUserActivity: UserActivity[] = [
        {
          userId: 'user-1',
          name: 'John Doe',
          role: 'Admin',
          lastActive: new Date(Date.now() - 5 * 60 * 1000),
          apiCalls: 12500,
          rpcCalls: 85000,
          dataTransfer: 0.8,
          status: 'active'
        },
        {
          userId: 'user-2',
          name: 'Jane Smith',
          role: 'Developer',
          lastActive: new Date(Date.now() - 15 * 60 * 1000),
          apiCalls: 8900,
          rpcCalls: 62000,
          dataTransfer: 0.6,
          status: 'active'
        },
        {
          userId: 'user-3',
          name: 'Mike Johnson',
          role: 'Viewer',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          apiCalls: 2100,
          rpcCalls: 15000,
          dataTransfer: 0.2,
          status: 'active'
        },
        {
          userId: 'user-4',
          name: 'Sarah Wilson',
          role: 'Developer',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
          apiCalls: 0,
          rpcCalls: 0,
          dataTransfer: 0,
          status: 'inactive'
        },
        {
          userId: 'user-5',
          name: 'David Brown',
          role: 'Billing Manager',
          lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
          apiCalls: 3200,
          rpcCalls: 22000,
          dataTransfer: 0.3,
          status: 'active'
        }
      ]

      setUsageData(mockUsageData)
      setUserActivity(mockUserActivity)
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDataTransfer = (gb: number) => {
    return `${gb.toFixed(1)} GB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20'
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20'
      case 'suspended':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const totalApiCalls = usageData.reduce((sum, day) => sum + day.apiCalls, 0)
  const totalRpcCalls = usageData.reduce((sum, day) => sum + day.rpcCalls, 0)
  const totalDataTransfer = usageData.reduce((sum, day) => sum + day.dataTransfer, 0)
  const totalCost = usageData.reduce((sum, day) => sum + day.cost, 0)
  const avgActiveUsers = usageData.length > 0 
    ? usageData.reduce((sum, day) => sum + day.activeUsers, 0) / usageData.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading usage data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Usage Analytics</span>
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1 bg-black/20 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'overview' ? 'users' : 'overview')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">API Calls</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{formatNumber(totalApiCalls)}</div>
          <div className="text-xs text-gray-400">this {selectedPeriod}</div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-300">RPC Calls</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatNumber(totalRpcCalls)}</div>
          <div className="text-xs text-gray-400">this {selectedPeriod}</div>
        </div>

        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Data Transfer</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{formatDataTransfer(totalDataTransfer)}</div>
          <div className="text-xs text-gray-400">this {selectedPeriod}</div>
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{avgActiveUsers.toFixed(0)}</div>
          <div className="text-xs text-gray-400">average</div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-white">{formatCurrency(totalCost)}</h4>
            <p className="text-sm text-gray-400">Total cost this {selectedPeriod}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Avg per day</div>
            <div className="text-lg font-semibold text-white">
              {formatCurrency(totalCost / usageData.length)}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart */}
      <div className="bg-black/20 rounded-lg p-6">
        <h5 className="text-lg font-semibold text-white mb-4">Usage Trends</h5>
        <div className="h-48 flex items-end justify-between space-x-1">
          {usageData.map((day, index) => {
            const maxApiCalls = Math.max(...usageData.map(d => d.apiCalls))
            const height = (day.apiCalls / maxApiCalls) * 100
            return (
              <div key={day.period} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-700 rounded-t mb-2" style={{ height: `${height}px` }}>
                  <div className="h-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t" />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(day.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-white font-semibold">{formatNumber(day.apiCalls)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* User Activity */}
      {viewMode === 'users' && (
        <div className="bg-black/20 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-4">User Activity</h5>
          <div className="space-y-3">
            {userActivity.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-black/10 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h6 className="font-semibold text-white">{user.name}</h6>
                    <p className="text-sm text-gray-400">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">{formatNumber(user.apiCalls)}</div>
                    <div className="text-xs text-gray-400">API Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">{formatNumber(user.rpcCalls)}</div>
                    <div className="text-xs text-gray-400">RPC Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">{formatDataTransfer(user.dataTransfer)}</div>
                    <div className="text-xs text-gray-400">Data</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">
                      {user.lastActive.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-400">Last Active</div>
                  </div>
                  <div className="text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/20 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-4">API Usage by Endpoint</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">RPC Health Checks</span>
              <span className="text-white font-semibold">45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Wallet Monitoring</span>
              <span className="text-white font-semibold">30%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Alert Management</span>
              <span className="text-white font-semibold">15%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Analytics</span>
              <span className="text-white font-semibold">10%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-4">Peak Usage Times</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">9:00 AM - 11:00 AM</span>
              <span className="text-white font-semibold">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">2:00 PM - 4:00 PM</span>
              <span className="text-white font-semibold">Peak</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">6:00 PM - 8:00 PM</span>
              <span className="text-white font-semibold">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">11:00 PM - 6:00 AM</span>
              <span className="text-white font-semibold">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
