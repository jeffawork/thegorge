import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react'

interface RPCSyncState {
  id: string
  name: string
  url: string
  chainId: number
  syncStatus: 'synced' | 'syncing' | 'behind' | 'stuck' | 'unknown'
  currentBlock: number
  latestBlock: number
  syncProgress: number
  blocksBehind: number
  syncSpeed: number
  healthScore: number
  lastUpdate: Date
}

export const RPCSyncOverview: React.FC = () => {
  const [syncStates, setSyncStates] = useState<RPCSyncState[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchSyncStates()
    const interval = setInterval(fetchSyncStates, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSyncStates = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, this would call your backend
      const mockData: RPCSyncState[] = [
        {
          id: '1',
          name: 'Ethereum Mainnet',
          url: 'https://mainnet.infura.io/v3/...',
          chainId: 1,
          syncStatus: 'synced',
          currentBlock: 18500000,
          latestBlock: 18500000,
          syncProgress: 100,
          blocksBehind: 0,
          syncSpeed: 12.5,
          healthScore: 98,
          lastUpdate: new Date()
        },
        {
          id: '2',
          name: 'Polygon Mainnet',
          url: 'https://polygon-rpc.com',
          chainId: 137,
          syncStatus: 'syncing',
          currentBlock: 45000000,
          latestBlock: 45000150,
          syncProgress: 99.7,
          blocksBehind: 150,
          syncSpeed: 8.2,
          healthScore: 85,
          lastUpdate: new Date()
        },
        {
          id: '3',
          name: 'BSC Mainnet',
          url: 'https://bsc-dataseed.binance.org',
          chainId: 56,
          syncStatus: 'behind',
          currentBlock: 32000000,
          latestBlock: 32000500,
          syncProgress: 99.8,
          blocksBehind: 500,
          syncSpeed: 2.1,
          healthScore: 72,
          lastUpdate: new Date()
        },
        {
          id: '4',
          name: 'Arbitrum One',
          url: 'https://arb1.arbitrum.io/rpc',
          chainId: 42161,
          syncStatus: 'stuck',
          currentBlock: 15000000,
          latestBlock: 15001000,
          syncProgress: 99.3,
          blocksBehind: 1000,
          syncSpeed: 0,
          healthScore: 45,
          lastUpdate: new Date()
        }
      ]
      setSyncStates(mockData)
    } catch (error) {
      console.error('Failed to fetch sync states:', error)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'syncing':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'behind':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'stuck':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'syncing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'behind':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'stuck':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const totalRPCs = syncStates.length
  const syncedRPCs = syncStates.filter(s => s.syncStatus === 'synced').length
  const syncingRPCs = syncStates.filter(s => s.syncStatus === 'syncing').length
  const behindRPCs = syncStates.filter(s => s.syncStatus === 'behind').length
  const stuckRPCs = syncStates.filter(s => s.syncStatus === 'stuck').length
  const averageHealth = syncStates.length > 0 
    ? syncStates.reduce((sum, s) => sum + s.healthScore, 0) / syncStates.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading sync states...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalRPCs}</div>
          <div className="text-xs text-gray-400">Total RPCs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{syncedRPCs}</div>
          <div className="text-xs text-gray-400">Synced</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{syncingRPCs}</div>
          <div className="text-xs text-gray-400">Syncing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stuckRPCs}</div>
          <div className="text-xs text-gray-400">Issues</div>
        </div>
      </div>

      {/* Overall Health */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Health</span>
          <span className={`text-sm font-semibold ${getHealthColor(averageHealth)}`}>
            {averageHealth.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              averageHealth >= 90 ? 'bg-green-400' :
              averageHealth >= 70 ? 'bg-yellow-400' :
              averageHealth >= 50 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${averageHealth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* RPC List */}
      <div className="space-y-3">
        {syncStates.map((rpc, index) => (
          <motion.div
            key={rpc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(rpc.syncStatus)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(rpc.syncStatus)}
                <div>
                  <h4 className="font-semibold text-white">{rpc.name}</h4>
                  <p className="text-xs text-gray-400">Chain ID: {rpc.chainId}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${getHealthColor(rpc.healthScore)}`}>
                  {rpc.healthScore}%
                </div>
                <div className="text-xs text-gray-400">Health</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Blocks:</span>
                <span className="ml-2 text-white">
                  {rpc.currentBlock.toLocaleString()} / {rpc.latestBlock.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Behind:</span>
                <span className="ml-2 text-white">{rpc.blocksBehind.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Progress:</span>
                <span className="ml-2 text-white">{rpc.syncProgress.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-400">Speed:</span>
                <span className="ml-2 text-white">{rpc.syncSpeed.toFixed(1)} blk/s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <motion.div
                  className={`h-1.5 rounded-full ${
                    rpc.syncProgress >= 99 ? 'bg-green-400' :
                    rpc.syncProgress >= 95 ? 'bg-yellow-400' : 'bg-orange-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${rpc.syncProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-400 text-center">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  )
}
