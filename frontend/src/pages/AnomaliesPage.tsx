import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Filter, Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { AnomalyDetection } from '../components/dashboard/AnomalyDetection'

export const AnomaliesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Anomaly Detection</h1>
          <p className="text-gray-400">AI-powered anomaly detection and pattern analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Anomaly Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Anomalies</h3>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">3</div>
          <div className="text-sm text-red-400 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +1 from yesterday
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Resolved Today</h3>
            <AlertCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">7</div>
          <div className="text-sm text-green-400 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            -2 from yesterday
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Detection Accuracy</h3>
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">94.2%</div>
          <div className="text-sm text-blue-400 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +2.1% this week
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Avg Response Time</h3>
            <AlertCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">2.3s</div>
          <div className="text-sm text-purple-400 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            -0.5s improvement
          </div>
        </div>
      </motion.div>

      {/* Anomaly Detection Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnomalyDetection />
      </motion.div>

      {/* Recent Anomaly Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recent Anomaly Events</h3>
        <div className="space-y-4">
          {[
            {
              id: 1,
              type: 'Response Time Spike',
              severity: 'high',
              description: 'Ethereum Mainnet RPC response time increased by 300%',
              timestamp: '2 minutes ago',
              status: 'investigating'
            },
            {
              id: 2,
              type: 'Unusual Request Pattern',
              severity: 'medium',
              description: 'Detected unusual batch request pattern on Polygon RPC',
              timestamp: '15 minutes ago',
              status: 'resolved'
            },
            {
              id: 3,
              type: 'Memory Usage Anomaly',
              severity: 'critical',
              description: 'RPC node memory usage exceeded normal thresholds',
              timestamp: '1 hour ago',
              status: 'investigating'
            },
            {
              id: 4,
              type: 'Network Latency Spike',
              severity: 'low',
              description: 'Temporary network latency increase detected',
              timestamp: '2 hours ago',
              status: 'resolved'
            }
          ].map((anomaly) => (
            <div key={anomaly.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  anomaly.severity === 'critical' ? 'bg-red-400' :
                  anomaly.severity === 'high' ? 'bg-orange-400' :
                  anomaly.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div>
                  <h4 className="text-white font-medium">{anomaly.type}</h4>
                  <p className="text-gray-400 text-sm">{anomaly.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  anomaly.status === 'investigating' ? 'text-yellow-400' :
                  anomaly.status === 'resolved' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {anomaly.status}
                </div>
                <div className="text-gray-500 text-xs">{anomaly.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
