import { motion } from 'framer-motion';
import { BarChart3, Download, Filter } from 'lucide-react';
import React from 'react';
import { UsageAnalytics } from '../atoms/UsageAnalytics';

const UsageAndCosts = () => {
  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Usage & Costs</h1>
          <p className="text-gray-400">
            Comprehensive analytics on usage and costs
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
        transition={{ duration: 0.6, delay: 0.1 }}
        className=""
      >
        <UsageAnalytics />
      </motion.div>
    </section>
  );
};

export default UsageAndCosts;
