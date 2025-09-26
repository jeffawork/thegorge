import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Server, 
  Activity, 
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Eye,
  Settings,
  ExternalLink
} from 'lucide-react'

interface ChainData {
  id: string
  name: string
  chainId: number
  symbol: string
  status: 'online' | 'offline' | 'degraded'
  rpcCount: number
  onlineRPCs: number
  avgResponseTime: number
  totalRequests: number
  errorRate: number
  lastBlock: number
  blockTime: number
  gasPrice: number
  activeAddresses: number
  tps: number
  healthScore: number
  color: string
  icon: string
}

export const MultiChainView: React.FC = () => {
  const [chains, setChains] = useState<ChainData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchChainData()
    const interval = setInterval(fetchChainData, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchChainData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockChains: ChainData[] = [
        {
          id: 'ethereum',
          name: 'Ethereum',
          chainId: 1,
          symbol: 'ETH',
          status: 'online',
          rpcCount: 5,
          onlineRPCs: 5,
          avgResponseTime: 245,
          totalRequests: 1250000,
          errorRate: 0.12,
          lastBlock: 18500000,
          blockTime: 12.1,
          gasPrice: 25.5,
          activeAddresses: 125000,
          tps: 15.2,
          healthScore: 98,
          color: 'text-blue-400',
          icon: '⟠'
        },
        {
          id: 'polygon',
          name: 'Polygon',
          chainId: 137,
          symbol: 'MATIC',
          status: 'online',
          rpcCount: 3,
          onlineRPCs: 3,
          avgResponseTime: 180,
          totalRequests: 850000,
          errorRate: 0.08,
          lastBlock: 45000000,
          blockTime: 2.3,
          gasPrice: 0.5,
          activeAddresses: 89000,
          tps: 45.8,
          healthScore: 95,
          color: 'text-purple-400',
          icon: '⬟'
        },
        {
          id: 'bsc',
          name: 'Binance Smart Chain',
          chainId: 56,
          symbol: 'BNB',
          status: 'degraded',
          rpcCount: 4,
          onlineRPCs: 3,
          avgResponseTime: 320,
          totalRequests: 650000,
          errorRate: 0.25,
          lastBlock: 32000000,
          blockTime: 3.2,
          gasPrice: 5.2,
          activeAddresses: 67000,
          tps: 28.5,
          healthScore: 78,
          color: 'text-yellow-400',
          icon: '◈'
        },
        {
          id: 'arbitrum',
          name: 'Arbitrum One',
          chainId: 42161,
          symbol: 'ETH',
          status: 'online',
          rpcCount: 2,
          onlineRPCs: 2,
          avgResponseTime: 195,
          totalRequests: 420000,
          errorRate: 0.05,
          lastBlock: 15000000,
          blockTime: 0.25,
          gasPrice: 0.1,
          activeAddresses: 45000,
          tps: 120.5,
          healthScore: 92,
          color: 'text-cyan-400',
          icon: '◈'
        },
        {
          id: 'optimism',
          name: 'Optimism',
          chainId: 10,
          symbol: 'ETH',
          status: 'online',
          rpcCount: 2,
          onlineRPCs: 2,
          avgResponseTime: 165,
          totalRequests: 380000,
          errorRate: 0.03,
          lastBlock: 12000000,
          blockTime: 2.0,
          gasPrice: 0.05,
          activeAddresses: 32000,
          tps: 95.2,
          healthScore: 96,
          color: 'text-red-400',
          icon: '◈'
        }
      ]

      setChains(mockChains)
    } catch (error) {
      console.error('Failed to fetch chain data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Activity className="w-4 h-4 text-green-400" />
      case 'degraded':
        return <Activity className="w-4 h-4 text-yellow-400" />
      case 'offline':
        return <Activity className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'border-green-500/30 bg-green-500/10'
      case 'degraded':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'offline':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const totalRPCs = chains.reduce((sum, chain) => sum + chain.rpcCount, 0)
  const onlineRPCs = chains.reduce((sum, chain) => sum + chain.onlineRPCs, 0)
  const totalRequests = chains.reduce((sum, chain) => sum + chain.totalRequests, 0)
  const avgHealthScore = chains.length > 0 
    ? chains.reduce((sum, chain) => sum + chain.healthScore, 0) / chains.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading chain data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <span>Multi-Chain Overview</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Server className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Total RPCs</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{totalRPCs}</div>
          <div className="text-xs text-gray-400">{onlineRPCs} online</div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Total Requests</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatNumber(totalRequests)}</div>
          <div className="text-xs text-gray-400">24h volume</div>
        </div>

        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Avg Health</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{avgHealthScore.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">across all chains</div>
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Active Chains</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{chains.length}</div>
          <div className="text-xs text-gray-400">monitored</div>
        </div>
      </div>

      {/* Chains Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {chains.map((chain, index) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-lg border ${getStatusColor(chain.status)} ${
              selectedChain === chain.id ? 'ring-2 ring-blue-500/50' : ''
            }`}
            onClick={() => setSelectedChain(selectedChain === chain.id ? null : chain.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{chain.icon}</span>
                <div>
                  <h4 className="font-semibold text-white">{chain.name}</h4>
                  <p className="text-sm text-gray-400">Chain ID: {chain.chainId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(chain.status)}
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getHealthColor(chain.healthScore)}`}>
                    {chain.healthScore}%
                  </div>
                  <div className="text-xs text-gray-400">Health</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">RPCs:</span>
                <span className="ml-2 text-white">
                  {chain.onlineRPCs}/{chain.rpcCount}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Response:</span>
                <span className="ml-2 text-white">{chain.avgResponseTime}ms</span>
              </div>
              <div>
                <span className="text-gray-400">Block:</span>
                <span className="ml-2 text-white">{formatNumber(chain.lastBlock)}</span>
              </div>
              <div>
                <span className="text-gray-400">TPS:</span>
                <span className="ml-2 text-white">{chain.tps}</span>
              </div>
              <div>
                <span className="text-gray-400">Gas:</span>
                <span className="ml-2 text-white">{chain.gasPrice} Gwei</span>
              </div>
              <div>
                <span className="text-gray-400">Error Rate:</span>
                <span className="ml-2 text-white">{chain.errorRate}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Health Score</span>
                <span>{chain.healthScore}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    chain.healthScore >= 90 ? 'bg-green-400' :
                    chain.healthScore >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${chain.healthScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors">
                <ExternalLink className="w-3 h-3" />
                <span>Explorer</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors">
                <Zap className="w-3 h-3" />
                <span>Test RPC</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chain Comparison */}
      <div className="bg-black/20 rounded-lg p-6">
        <h5 className="text-lg font-semibold text-white mb-4">Chain Performance Comparison</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-300">Chain</th>
                <th className="text-right py-2 text-gray-300">Health</th>
                <th className="text-right py-2 text-gray-300">Response Time</th>
                <th className="text-right py-2 text-gray-300">TPS</th>
                <th className="text-right py-2 text-gray-300">Error Rate</th>
                <th className="text-right py-2 text-gray-300">Gas Price</th>
              </tr>
            </thead>
            <tbody>
              {chains.map((chain) => (
                <tr key={chain.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{chain.icon}</span>
                      <span className="text-white">{chain.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-2">
                    <span className={getHealthColor(chain.healthScore)}>
                      {chain.healthScore}%
                    </span>
                  </td>
                  <td className="text-right py-2 text-white">{chain.avgResponseTime}ms</td>
                  <td className="text-right py-2 text-white">{chain.tps}</td>
                  <td className="text-right py-2 text-white">{chain.errorRate}%</td>
                  <td className="text-right py-2 text-white">{chain.gasPrice} Gwei</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
