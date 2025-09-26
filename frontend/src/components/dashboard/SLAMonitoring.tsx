import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react'

interface SLAMetric {
  id: string
  name: string
  target: number
  current: number
  unit: string
  status: 'met' | 'warning' | 'breach'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: Date
  description: string
}

interface SLABreach {
  id: string
  metricId: string
  metricName: string
  breachedAt: Date
  targetValue: number
  actualValue: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved'
  resolvedAt?: Date
  description: string
}

export const SLAMonitoring: React.FC = () => {
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([])
  const [breaches, setBreaches] = useState<SLABreach[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'breaches' | 'warnings'>('all')

  useEffect(() => {
    fetchSLAData()
    const interval = setInterval(fetchSLAData, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchSLAData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockSlaMetrics: SLAMetric[] = [
        {
          id: 'uptime',
          name: 'Uptime SLA',
          target: 99.9,
          current: 99.97,
          unit: '%',
          status: 'met',
          trend: 'up',
          lastUpdated: new Date(),
          description: 'System availability target'
        },
        {
          id: 'response_time',
          name: 'Response Time SLA',
          target: 500,
          current: 245,
          unit: 'ms',
          status: 'met',
          trend: 'down',
          lastUpdated: new Date(),
          description: 'Average API response time'
        },
        {
          id: 'error_rate',
          name: 'Error Rate SLA',
          target: 0.1,
          current: 0.12,
          unit: '%',
          status: 'warning',
          trend: 'up',
          lastUpdated: new Date(),
          description: 'Maximum allowed error rate'
        },
        {
          id: 'throughput',
          name: 'Throughput SLA',
          target: 1000,
          current: 1250,
          unit: 'req/s',
          status: 'met',
          trend: 'up',
          lastUpdated: new Date(),
          description: 'Minimum requests per second'
        },
        {
          id: 'data_availability',
          name: 'Data Availability SLA',
          target: 99.5,
          current: 98.8,
          unit: '%',
          status: 'breach',
          trend: 'down',
          lastUpdated: new Date(),
          description: 'Data availability target'
        }
      ]

      const mockBreaches: SLABreach[] = [
        {
          id: '1',
          metricId: 'data_availability',
          metricName: 'Data Availability SLA',
          breachedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          targetValue: 99.5,
          actualValue: 98.8,
          severity: 'high',
          status: 'active',
          description: 'Data availability dropped below 99.5% threshold'
        },
        {
          id: '2',
          metricId: 'error_rate',
          metricName: 'Error Rate SLA',
          breachedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          targetValue: 0.1,
          actualValue: 0.15,
          severity: 'medium',
          status: 'resolved',
          resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          description: 'Error rate exceeded 0.1% threshold'
        }
      ]

      setSlaMetrics(mockSlaMetrics)
      setBreaches(mockBreaches)
    } catch (error) {
      console.error('Failed to fetch SLA data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'breach':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met':
        return 'border-green-500/30 bg-green-500/10'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'breach':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20'
      case 'high':
        return 'text-orange-400 bg-orange-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'low':
        return 'text-blue-400 bg-blue-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const calculateCompliance = () => {
    const metCount = slaMetrics.filter(m => m.status === 'met').length
    return slaMetrics.length > 0 ? (metCount / slaMetrics.length) * 100 : 0
  }

  const activeBreaches = breaches.filter(b => b.status === 'active')
  const compliance = calculateCompliance()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading SLA data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-400" />
          <span>SLA Monitoring</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SLA Compliance Overview */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-white">{compliance.toFixed(1)}%</h4>
            <p className="text-sm text-gray-400">SLA Compliance Rate</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Active Breaches</div>
            <div className="text-xl font-bold text-red-400">{activeBreaches.length}</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${
              compliance >= 95 ? 'bg-green-400' :
              compliance >= 80 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${compliance}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="space-y-4">
        {slaMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(metric.status)}
                <div>
                  <h4 className="font-semibold text-white">{metric.name}</h4>
                  <p className="text-sm text-gray-400">{metric.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {metric.current} {metric.unit}
                  </div>
                  <div className="text-xs text-gray-400">
                    Target: {metric.target} {metric.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  metric.status === 'met' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (metric.current / metric.target) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* SLA Breaches */}
      <div className="bg-black/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-white">SLA Breaches</h5>
          <div className="flex space-x-2">
            {['all', 'breaches', 'warnings'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {breaches
            .filter(breach => {
              if (filter === 'breaches') return breach.status === 'active'
              if (filter === 'warnings') return breach.severity === 'medium' || breach.severity === 'low'
              return true
            })
            .map((breach, index) => (
              <motion.div
                key={breach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-black/10 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <h6 className="font-semibold text-white">{breach.metricName}</h6>
                      <p className="text-sm text-gray-400">{breach.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(breach.severity)}`}>
                      {breach.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      breach.status === 'active' ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'
                    }`}>
                      {breach.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Target:</span>
                    <span className="ml-2 text-white">{breach.targetValue}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Actual:</span>
                    <span className="ml-2 text-white">{breach.actualValue}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Breached:</span>
                    <span className="ml-2 text-white">{breach.breachedAt.toLocaleString()}</span>
                  </div>
                  {breach.resolvedAt && (
                    <div>
                      <span className="text-gray-400">Resolved:</span>
                      <span className="ml-2 text-white">{breach.resolvedAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {breaches.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">No SLA breaches detected</p>
          </div>
        )}
      </div>

      {/* SLA Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">
            {slaMetrics.filter(m => m.status === 'met').length}
          </div>
          <div className="text-sm text-gray-400">Metrics Met</div>
        </div>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {slaMetrics.filter(m => m.status === 'warning').length}
          </div>
          <div className="text-sm text-gray-400">Warnings</div>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">
            {slaMetrics.filter(m => m.status === 'breach').length}
          </div>
          <div className="text-sm text-gray-400">Breaches</div>
        </div>
      </div>
    </div>
  )
}
