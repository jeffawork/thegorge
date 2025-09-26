import React from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, DollarSign, Eye } from 'lucide-react'
import { WalletPortfolio } from '../components/dashboard/WalletPortfolio'

export const WalletPortfolioPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Portfolio</h1>
          <p className="text-gray-400">Monitor wallet balances and transactions across all chains</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Wallet className="w-4 h-4 mr-2 inline" />
            Add Wallet
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <WalletPortfolio />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total Value</h3>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">$12,456.78</div>
          <div className="text-sm text-green-400 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +5.2% (24h)
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Wallets</h3>
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">8</div>
          <div className="text-sm text-gray-400">Active wallets</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Chains</h3>
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">5</div>
          <div className="text-sm text-gray-400">Supported chains</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Transactions</h3>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">1,234</div>
          <div className="text-sm text-gray-400">Last 24h</div>
        </div>
      </motion.div>
    </div>
  )
}
