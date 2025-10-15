import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Filter, Download } from 'lucide-react';

export const AnalyticsDisplay: React.FC = () => {
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
            Analytics & Insights
          </h1>
          <p className="text-gray-400">
            Comprehensive analytics and performance insights
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
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex space-x-1 rounded-lg bg-gray-800/50 p-1"
      >
        <button
          className={`flex items-center space-x-2 rounded-md px-4 py-2 transition-all ${'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Performance</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Avg Response Time
                </h3>
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mb-1 text-2xl font-bold text-white">245ms</div>
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="mr-1 h-4 w-4" />
                -12% from last week
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Success Rate
                </h3>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="mb-1 text-2xl font-bold text-white">99.8%</div>
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="mr-1 h-4 w-4" />
                +0.2% from last week
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Total Requests
                </h3>
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div className="mb-1 text-2xl font-bold text-white">1.2M</div>
              <div className="text-sm text-gray-400">Last 24 hours</div>
            </div>

            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Active RPCs
                </h3>
                <BarChart3 className="h-5 w-5 text-orange-400" />
              </div>
              <div className="mb-1 text-2xl font-bold text-white">12</div>
              <div className="text-sm text-gray-400">Online endpoints</div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Performance Trends
            </h3>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-800/30">
              <p className="text-gray-400">Performance chart would go here</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
