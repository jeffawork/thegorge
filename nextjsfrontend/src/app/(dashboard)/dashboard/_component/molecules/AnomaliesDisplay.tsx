import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
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
          <h1 className="mb-2 text-3xl font-bold text-white">
            Anomaly Detection
          </h1>
          <p className="text-gray-400">
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
          <div className="mb-2 text-3xl font-bold text-white">3</div>
          <div className="flex items-center text-sm text-red-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            +1 from yesterday
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Resolved Today</h3>
            <AlertCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">7</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingDown className="mr-1 h-4 w-4" />
            -2 from yesterday
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Detection Accuracy
            </h3>
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">94.2%</div>
          <div className="flex items-center text-sm text-blue-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            +2.1% this week
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Avg Response Time
            </h3>
            <AlertCircle className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">2.3s</div>
          <div className="flex items-center text-sm text-purple-400">
            <TrendingDown className="mr-1 h-4 w-4" />
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
        <h3 className="mb-4 text-xl font-semibold text-white">
          Recent Anomaly Events
        </h3>
        <div className="space-y-4">
          {[
            {
              id: 1,
              type: 'Response Time Spike',
              severity: 'high',
              description:
                'Ethereum Mainnet RPC response time increased by 300%',
              timestamp: '2 minutes ago',
              status: 'investigating',
            },
            {
              id: 2,
              type: 'Unusual Request Pattern',
              severity: 'medium',
              description:
                'Detected unusual batch request pattern on Polygon RPC',
              timestamp: '15 minutes ago',
              status: 'resolved',
            },
            {
              id: 3,
              type: 'Memory Usage Anomaly',
              severity: 'critical',
              description: 'RPC node memory usage exceeded normal thresholds',
              timestamp: '1 hour ago',
              status: 'investigating',
            },
            {
              id: 4,
              type: 'Network Latency Spike',
              severity: 'low',
              description: 'Temporary network latency increase detected',
              timestamp: '2 hours ago',
              status: 'resolved',
            },
          ].map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    anomaly.severity === 'critical'
                      ? 'bg-red-400'
                      : anomaly.severity === 'high'
                        ? 'bg-orange-400'
                        : anomaly.severity === 'medium'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                  }`}
                />
                <div>
                  <h4 className="font-medium text-white">{anomaly.type}</h4>
                  <p className="text-sm text-gray-400">{anomaly.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-medium ${
                    anomaly.status === 'investigating'
                      ? 'text-yellow-400'
                      : anomaly.status === 'resolved'
                        ? 'text-green-400'
                        : 'text-gray-400'
                  }`}
                >
                  {anomaly.status}
                </div>
                <div className="text-xs text-gray-500">{anomaly.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnomaliesDisplay;
