import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Filter, Search, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { RealTimeAlerts } from '../components/dashboard/RealTimeAlerts'

export const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'active', label: 'Active Alerts', icon: Bell },
    { id: 'rules', label: 'Alert Rules', icon: AlertTriangle },
    { id: 'history', label: 'Alert History', icon: CheckCircle }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alert Management</h1>
          <p className="text-gray-400">Monitor and manage alerts across all your RPC endpoints</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Filter
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {activeTab === 'active' && <RealTimeAlerts />}
        
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alert Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium text-white">High Response Time</div>
                      <div className="text-sm text-gray-400">Alert when response time &gt; 5s</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Active</span>
                    <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Low Balance</div>
                      <div className="text-sm text-gray-400">Alert when wallet balance &lt; 0.1 ETH</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alert History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium text-white">RPC Response Time High</div>
                      <div className="text-sm text-gray-400">Ethereum Mainnet • 2 hours ago</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Resolved</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Wallet Balance Low</div>
                      <div className="text-sm text-gray-400">0x1234...5678 • 4 hours ago</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
