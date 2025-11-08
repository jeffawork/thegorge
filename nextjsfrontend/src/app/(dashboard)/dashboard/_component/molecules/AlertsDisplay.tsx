import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { AlertHistory } from '../atoms/AlertHistory';
import { AlertRules } from '../atoms/AlertRules';
import { RealTimeAlerts } from '../atoms/RealTimeAlerts';

const AlertsDisplay = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'active', label: 'Active Alerts', icon: Bell },
    { id: 'rules', label: 'Alert Rules', icon: AlertTriangle },
    { id: 'history', label: 'Alert History', icon: CheckCircle },
  ];

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            Alert Management
          </h1>
          <p className="hidden text-gray-400 md:block">
            Monitor and manage alerts across all your RPC endpoints
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Filter className="mr-2 inline h-4 w-4" />
            Filter
          </button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex space-x-1 rounded-lg bg-gray-800/50 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 rounded-md px-4 py-2 transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
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
        {activeTab === 'rules' && <AlertRules />}
        {activeTab === 'history' && <AlertHistory />}
      </motion.div>
    </section>
  );
};

export default AlertsDisplay;
