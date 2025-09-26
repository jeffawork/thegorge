import React from 'react'
import { motion } from 'framer-motion'
import { Server, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { RPCSyncOverview } from '../components/dashboard/RPCSyncOverview'

export const RPCSyncPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">RPC Sync Monitoring</h1>
          <p className="text-gray-400">Monitor synchronization status across all your RPC endpoints</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh All
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <RPCSyncOverview />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sync Status</h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Synced</span>
              <span className="text-green-400 font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Syncing</span>
              <span className="text-yellow-400 font-semibold">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Behind</span>
              <span className="text-red-400 font-semibold">0</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sync Progress</h3>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Ethereum Mainnet</span>
                <span className="text-sm text-white">100%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Polygon</span>
                <span className="text-sm text-white">85%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sync completed</span>
              <span className="text-green-400">2m ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sync started</span>
              <span className="text-blue-400">5m ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node restarted</span>
              <span className="text-yellow-400">1h ago</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
