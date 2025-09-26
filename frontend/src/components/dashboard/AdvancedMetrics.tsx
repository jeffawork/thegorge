import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Globe,
  Clock,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

interface MetricData {
  name: string
  value: number
  change: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface ChartData {
  timestamp: string
  value: number
}

export const AdvancedMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('response_time')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockMetrics: MetricData[] = [
        {
          name: 'Response Time',
          value: 245,
          change: -12.5,
          unit: 'ms',
          trend: 'down',
          color: 'text-green-400'
        },
        {
          name: 'Throughput',
          value: 1250,
          change: 8.3,
          unit: 'req/s',
          trend: 'up',
          color: 'text-blue-400'
        },
        {
          name: 'Error Rate',
          value: 0.12,
          change: -0.05,
          unit: '%',
          trend: 'down',
          color: 'text-green-400'
        },
        {
          name: 'Uptime',
          value: 99.97,
          change: 0.01,
          unit: '%',
          trend: 'up',
          color: 'text-green-400'
        },
        {
          name: 'Active Connections',
          value: 847,
          change: 15.2,
          unit: 'conn',
          trend: 'up',
          color: 'text-blue-400'
        },
        {
          name: 'Data Transfer',
          value: 2.4,
          change: 22.1,
          unit: 'GB/s',
          trend: 'up',
          color: 'text-purple-400'
        }
      ]

      const mockChartData: ChartData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: Math.random() * 100 + 200
      }))

      setMetrics(mockMetrics)
      setChartData(mockChartData)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400'
      case 'down':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(2)}%`
    } else if (unit === 'ms') {
      return `${value.toFixed(0)}ms`
    } else if (unit === 'req/s') {
      return `${value.toLocaleString()}/s`
    } else if (unit === 'GB/s') {
      return `${value.toFixed(1)}GB/s`
    }
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading metrics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Advanced Metrics</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-black/20 rounded-lg border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">{metric.name}</h4>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="text-2xl font-bold text-white mb-1">
              {formatValue(metric.value, metric.unit)}
            </div>
            
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
              <span className="font-semibold">
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs last hour</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-black/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Performance Trends</h4>
          <div className="flex items-center space-x-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 bg-black/20 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="response_time">Response Time</option>
              <option value="throughput">Throughput</option>
              <option value="error_rate">Error Rate</option>
              <option value="uptime">Uptime</option>
            </select>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="h-48 bg-black/10 rounded-lg p-4">
          <div className="flex items-end justify-between h-full space-x-1">
            {chartData.map((point, index) => {
              const height = (point.value / 300) * 100 // Normalize to 0-100%
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.02, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                />
              )
            })}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <span>24 hours ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Real-time Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-green-400" />
            <h5 className="font-semibold text-green-400">System Health</h5>
          </div>
          <p className="text-sm text-gray-300">
            All systems operating within normal parameters
          </p>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h5 className="font-semibold text-blue-400">Global Status</h5>
          </div>
          <p className="text-sm text-gray-300">
            Monitoring 12 regions across 5 continents
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6">
        <h5 className="text-lg font-semibold text-white mb-4">Performance Summary</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">99.97%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">245ms</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">1.25K</div>
            <div className="text-sm text-gray-400">Requests/sec</div>
          </div>
        </div>
      </div>
    </div>
  )
}
