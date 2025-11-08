import React from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { RPCSyncOverview } from '../atoms/RPCSyncOverview';

const RPCSyncDisplay: React.FC = () => {
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
            RPC Sync Monitoring
          </h1>
          <p className="hidden text-gray-400 md:block">
            Monitor synchronization status across all your RPC endpoints
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 md:px-4 md:py-2">
            <RefreshCw className="mr-2 inline h-4 w-4" />
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
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Sync Status</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Synced</span>
              <span className="font-semibold text-green-400">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Syncing</span>
              <span className="font-semibold text-yellow-400">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Behind</span>
              <span className="font-semibold text-red-400">0</span>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Sync Progress</h3>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-3"></div>
        </div>
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RPCSyncDisplay;
