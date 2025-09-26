import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Filter, Download } from 'lucide-react'
import { UsageAnalytics } from '../components/dashboard/UsageAnalytics'
import { CostAnalytics } from '../components/dashboard/CostAnalytics'

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance')

  const tabs = [
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'usage-costs', label: 'Usage & Costs', icon: DollarSign }
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
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-400">Comprehensive analytics and performance insights</p>
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
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Avg Response Time</h3>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">245ms</div>
                <div className="text-sm text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  -12% from last week
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Success Rate</h3>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">99.8%</div>
                <div className="text-sm text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +0.2% from last week
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Requests</h3>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">1.2M</div>
                <div className="text-sm text-gray-400">Last 24 hours</div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Active RPCs</h3>
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">12</div>
                <div className="text-sm text-gray-400">Online endpoints</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
              <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Performance chart would go here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage-costs' && (
          <div className="space-y-6">
            <UsageAnalytics />
            <CostAnalytics />
          </div>
        )}
      </motion.div>
    </div>
  )
}
