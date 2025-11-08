import { motion } from 'framer-motion';
import { Wallet, DollarSign, TrendingUp, Eye } from 'lucide-react';
import React from 'react';
import { WalletPortfolio } from '../atoms/WalletPortfolio';

const WalletPorfolioDisplay: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            Wallet Portfolio
          </h1>
          <p className="hidden text-gray-400 md:block">
            Monitor wallet balances and transactions across all chains
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            <Wallet className="mr-2 inline h-4 w-4" />
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
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Total Value</h3>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div className="mb-1 text-2xl font-bold text-white">0</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Wallets</h3>
            <Wallet className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mb-1 text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Active wallets</div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Chains</h3>
            <Eye className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mb-1 text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Supported chains</div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Transactions</h3>
            <TrendingUp className="h-5 w-5 text-orange-400" />
          </div>
          <div className="mb-1 text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Last 24h</div>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletPorfolioDisplay;
