import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Unlock,
  Activity,
  Clock,
  Users,
  Globe
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'api' | 'rpc' | 'wallet' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  source: string
  ipAddress?: string
  userAgent?: string
  status: 'active' | 'resolved' | 'investigating'
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  resolvedEvents: number
  activeThreats: number
  blockedIPs: number
  failedLogins: number
  suspiciousActivity: number
}

export const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'active'>('all')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchSecurityData()
    const interval = setInterval(fetchSecurityData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          description: '5 failed login attempts from IP 192.168.1.100 within 5 minutes',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          source: 'Authentication System',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'active'
        },
        {
          id: '2',
          type: 'api',
          severity: 'critical',
          title: 'Suspicious API Usage Pattern',
          description: 'Unusual API call pattern detected - 1000 requests in 1 minute',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'API Gateway',
          ipAddress: '10.0.0.50',
          status: 'investigating'
        },
        {
          id: '3',
          type: 'wallet',
          severity: 'medium',
          title: 'Large Transaction Detected',
          description: 'Transaction of $100,000 detected in monitored wallet',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          source: 'Wallet Monitor',
          status: 'resolved'
        },
        {
          id: '4',
          type: 'rpc',
          severity: 'low',
          title: 'RPC Endpoint Access from New IP',
          description: 'RPC endpoint accessed from new IP address 203.0.113.1',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: 'RPC Monitor',
          ipAddress: '203.0.113.1',
          status: 'resolved'
        },
        {
          id: '5',
          type: 'system',
          severity: 'high',
          title: 'Unauthorized Configuration Change',
          description: 'System configuration modified without proper authorization',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          source: 'System Monitor',
          status: 'active'
        }
      ]

      const mockMetrics: SecurityMetrics = {
        totalEvents: 156,
        criticalEvents: 3,
        resolvedEvents: 142,
        activeThreats: 11,
        blockedIPs: 8,
        failedLogins: 23,
        suspiciousActivity: 5
      }

      setEvents(mockEvents)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10'
      case 'high':
        return 'border-orange-500/30 bg-orange-500/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'low':
        return 'border-green-500/30 bg-green-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Users className="w-4 h-4" />
      case 'api':
        return <Activity className="w-4 h-4" />
      case 'rpc':
        return <Globe className="w-4 h-4" />
      case 'wallet':
        return <Lock className="w-4 h-4" />
      case 'system':
        return <Shield className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-400 bg-red-500/20'
      case 'investigating':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'resolved':
        return 'text-green-400 bg-green-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'critical':
        return event.severity === 'critical'
      case 'high':
        return event.severity === 'high'
      case 'active':
        return event.status === 'active'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading security data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-400" />
          <span>Security Monitor</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-gray-300">Critical Events</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{metrics.criticalEvents}</div>
          </div>

          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Active Threats</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{metrics.activeThreats}</div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{metrics.resolvedEvents}</div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Blocked IPs</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{metrics.blockedIPs}</div>
          </div>
        </div>
      )}

      {/* Security Status */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <span className="text-white font-semibold">Security Status: Heightened Alert</span>
          </div>
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-2">
          Multiple security events detected. Enhanced monitoring active.
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'critical', 'high', 'active'].map((filterType) => (
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

      {/* Security Events */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getSeverityIcon(event.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(event.type)}
                  <h4 className="font-semibold text-white">{event.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{event.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <span>Source: {event.source}</span>
                    {event.ipAddress && (
                      <span>IP: {event.ipAddress}</span>
                    )}
                  </div>
                  
                  {showDetails && (
                    <div className="text-xs text-gray-500">
                      ID: {event.id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No security events match your current filters</p>
        </div>
      )}

      {/* Security Recommendations */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h5 className="font-semibold text-blue-400">Security Recommendations</h5>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Enable two-factor authentication for all admin accounts</p>
          <p>• Review and update API rate limiting policies</p>
          <p>• Implement IP whitelisting for sensitive operations</p>
          <p>• Set up automated threat detection rules</p>
        </div>
      </div>
    </div>
  )
}
