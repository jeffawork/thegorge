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
export const RPCSyncDisplay: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            RPC Sync Monitoring
          </h1>
          <p className="text-gray-400">
            Monitor synchronization status across all your RPC endpoints
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
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
              <span className="font-semibold text-green-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Syncing</span>
              <span className="font-semibold text-yellow-400">1</span>
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
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-gray-400">Ethereum Mainnet</span>
                <span className="text-sm text-white">100%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700">
                <div className="h-2 w-full rounded-full bg-green-400"></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-gray-400">Polygon</span>
                <span className="text-sm text-white">85%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700">
                <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <AlertCircle className="h-5 w-5 text-orange-400" />
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
  );
};
