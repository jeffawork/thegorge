import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Wallet, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useRPC } from '../contexts/RPCContext'
import { useAlert } from '../contexts/AlertContext'
import { DataStreamVisualization, BlockchainPulse, NetworkTopology } from '../components/DataStreamVisualization'

export const EnhancedDashboard: React.FC = () => {
  const { rpcs, loading: rpcsLoading } = useRPC()
  const { alerts, loading: alertsLoading } = useAlert()
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Calculate summary statistics
  const onlineRPCs = rpcs.filter(rpc => rpc.status === 'online').length
  const totalRPCs = rpcs.length
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length
  const activeAlerts = alerts.filter(alert => !alert.resolved).length
  const totalAlerts = alerts.length

  // Mock data for demonstration
  const systemStats = {
    totalRequests: 1250000,
    avgResponseTime: 245,
    successRate: 99.8,
    uptime: 99.9,
    dataTransfer: 2.4, // GB
    costSavings: 15.2 // %
  }

  const recentActivity = [
    { id: 1, type: 'rpc', message: 'Ethereum Mainnet RPC went online', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'alert', message: 'High response time detected on Polygon RPC', time: '5 minutes ago', status: 'warning' },
    { id: 3, type: 'wallet', message: 'New wallet added to monitoring', time: '10 minutes ago', status: 'info' },
    { id: 4, type: 'sync', message: 'RPC sync completed for Arbitrum', time: '15 minutes ago', status: 'success' },
    { id: 5, type: 'cost', message: 'Monthly cost optimization saved $150', time: '1 hour ago', status: 'success' }
  ]

  const quickActions = [
    { id: 'add-rpc', title: 'Add RPC Endpoint', icon: Server, color: 'blue', href: '/rpc-sync' },
    { id: 'add-wallet', title: 'Add Wallet', icon: Wallet, color: 'green', href: '/portfolio' },
    { id: 'view-alerts', title: 'View Alerts', icon: AlertTriangle, color: 'red', href: '/active' },
    { id: 'view-analytics', title: 'View Analytics', icon: BarChart3, color: 'purple', href: '/performance' },
    { id: 'view-settings', title: 'Settings', icon: Settings, color: 'gray', href: '/settings' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return XCircle
      case 'info': return AlertCircle
      default: return Clock
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Dashboard Overview</h1>
          <p className="text-[#B0B3C8]">Welcome to The Gorge - Your RPC Monitoring Command Center</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button className="btn-primary px-4 py-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>


      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <BlockchainPulse className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">RPC Endpoints</h3>
            <Server className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{onlineRPCs}/{totalRPCs}</div>
          <div className="text-sm text-[#00FF88] flex items-center">
            <ArrowUp className="w-4 h-4 mr-1" />
            {totalRPCs > 0 ? `${Math.round((onlineRPCs / totalRPCs) * 100)}%` : '0%'} online
          </div>
        </BlockchainPulse>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{activeAlerts}</div>
          <div className="text-sm text-[#FF3B30] flex items-center">
            {criticalAlerts > 0 && (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                {criticalAlerts} critical
              </>
            )}
            {criticalAlerts === 0 && 'All clear'}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Success Rate</h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{systemStats.successRate}%</div>
          <div className="text-sm text-green-400 flex items-center">
            <ArrowUp className="w-4 h-4 mr-1" />
            +0.2% from last week
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Avg Response</h3>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{systemStats.avgResponseTime}ms</div>
          <div className="text-sm text-green-400 flex items-center">
            <ArrowDown className="w-4 h-4 mr-1" />
            -12% from last week
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                className={`p-4 rounded-lg border-2 border-transparent hover:border-${action.color}-500/30 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 transition-all group`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className={`w-6 h-6 text-${action.color}-400 group-hover:text-${action.color}-300`} />
                  <span className="text-white text-sm font-medium">{action.title}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Network Topology Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Network Topology</h3>
        <div className="h-48 relative">
          <NetworkTopology className="w-full h-full" />
        </div>
      </motion.div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = getStatusIcon(activity.status)
              return (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                  <Icon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white font-semibold">{systemStats.uptime}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: `${systemStats.uptime}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Transfer</span>
              <span className="text-white font-semibold">{systemStats.dataTransfer} GB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Cost Savings</span>
              <span className="text-white font-semibold">{systemStats.costSavings}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${systemStats.costSavings}%` }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation to Detailed Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <Server className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-medium">RPC Sync Monitoring</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Monitor synchronization status across all your RPC endpoints</p>
            <div className="flex items-center text-blue-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-medium">Wallet Portfolio</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Track wallet balances and transactions across all chains</p>
            <div className="flex items-center text-green-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-medium">Analytics & Insights</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Comprehensive analytics and performance insights</p>
            <div className="flex items-center text-purple-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h4 className="text-white font-medium">Alert Management</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Monitor and manage alerts across all your RPC endpoints</p>
            <div className="flex items-center text-red-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-orange-400" />
              <h4 className="text-white font-medium">Security Monitoring</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Monitor security threats and suspicious activities</p>
            <div className="flex items-center text-orange-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <h4 className="text-white font-medium">Settings & Configuration</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">Manage your application preferences and configuration</p>
            <div className="flex items-center text-gray-400 text-sm">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}