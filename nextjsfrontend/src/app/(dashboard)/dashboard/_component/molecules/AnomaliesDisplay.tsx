import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AnomalyDetection } from '../atoms/AnomalyDetection';

const AnomaliesDisplay: React.FC = () => {
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
            Anomaly Detection
          </h1>
          <p className="hidden text-gray-400 md:block">
            AI-powered anomaly detection and pattern analysis
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            <Filter className="mr-2 inline h-4 w-4" />
            Filter
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Download className="mr-2 inline h-4 w-4" />
            Export
          </button>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Anomaly Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Active Anomalies
            </h3>
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">0</div>
          <div className="flex items-center text-sm text-red-400">
            <TrendingUp className="mr-1 h-4 w-4" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Resolved Today</h3>
            <AlertCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">0</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingDown className="mr-1 h-4 w-4" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Detection Accuracy
            </h3>
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">0</div>
          <div className="flex items-center text-sm text-blue-400">
            <TrendingUp className="mr-1 h-4 w-4" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Avg Response Time
            </h3>
            <AlertCircle className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">0</div>
          <div className="flex items-center text-sm text-purple-400">
            <TrendingDown className="mr-1 h-4 w-4" />
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
        <h3 className="mb-4 text-xl font-semibold text-white">
          Recent Anomaly Events
        </h3>
        <div>
          <div className="flex h-64 items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
            <span className="ml-2 text-gray-400">No anomaly data...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnomaliesDisplay;
