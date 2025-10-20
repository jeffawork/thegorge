import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Wallet,
  Activity,
  AlertTriangle,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useRPCStore } from '@/store/rpcSlice';
import { useAlertStore } from '@/store/alertSlice';
import {
  BlockchainPulse,
  NetworkTopology,
} from '../atoms/DataStreamVisualization';

const OverviewDisplay = () => {
  const { rpcs, loading } = useRPCStore();
  const { alerts } = useAlertStore();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate summary statistics
  const onlineRPCs = rpcs.filter((rpc) => rpc.status === 'online').length;
  const totalRPCs = rpcs.length;
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === 'critical' && !alert.resolved
  ).length;
  const activeAlerts = alerts.filter((alert) => !alert.resolved).length;
  const totalAlerts = alerts.length;

  // Mock data for demonstration
  const systemStats = {
    totalRequests: 1250000,
    avgResponseTime: 245,
    successRate: 99.8,
    uptime: 99.9,
    dataTransfer: 2.4, // GB
    costSavings: 15.2, // %
  };

  const recentActivity = [
    {
      id: 1,
      type: 'rpc',
      message: 'Ethereum Mainnet RPC went online',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'alert',
      message: 'High response time detected on Polygon RPC',
      time: '5 minutes ago',
      status: 'warning',
    },
    {
      id: 3,
      type: 'wallet',
      message: 'New wallet added to monitoring',
      time: '10 minutes ago',
      status: 'info',
    },
    {
      id: 4,
      type: 'sync',
      message: 'RPC sync completed for Arbitrum',
      time: '15 minutes ago',
      status: 'success',
    },
    {
      id: 5,
      type: 'cost',
      message: 'Monthly cost optimization saved $150',
      time: '1 hour ago',
      status: 'success',
    },
  ];

  const quickActions = [
    {
      id: 'add-rpc',
      title: 'Add RPC Endpoint',
      icon: Server,
      color: 'blue',
      href: '/rpc-sync',
    },
    {
      id: 'add-wallet',
      title: 'Add Wallet',
      icon: Wallet,
      color: 'green',
      href: '/portfolio',
    },
    {
      id: 'view-alerts',
      title: 'View Alerts',
      icon: AlertTriangle,
      color: 'red',
      href: '/active',
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      icon: BarChart3,
      color: 'purple',
      href: '/performance',
    },
    {
      id: 'view-settings',
      title: 'Settings',
      icon: Settings,
      color: 'gray',
      href: '/settings',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'info':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gradient mb-2 text-3xl font-bold">
            Dashboard Overview
          </h1>
          <p className="text-[#B0B3C8]">
            Welcome to The Gorge - Your RPC Monitoring Command Center
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button className="btn-primary flex items-center gap-2 px-4 py-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <BlockchainPulse className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">RPC Endpoints</h3>
            <Server className="h-5 w-5 text-[#00D4FF]" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">
            {onlineRPCs}/{totalRPCs}
          </div>
          <div className="flex items-center text-sm text-[#00FF88]">
            <ArrowUp className="mr-1 h-4 w-4" />
            {totalRPCs > 0
              ? `${Math.round((onlineRPCs / totalRPCs) * 100)}%`
              : '0%'}{' '}
            online
          </div>
        </BlockchainPulse>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-[#FF3B30]" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">
            {activeAlerts}
          </div>
          <div className="flex items-center text-sm text-[#FF3B30]">
            {criticalAlerts > 0 && (
              <>
                <AlertCircle className="mr-1 h-4 w-4" />
                {criticalAlerts} critical
              </>
            )}
            {criticalAlerts === 0 && 'All clear'}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Success Rate</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">
            {systemStats.successRate}%
          </div>
          <div className="flex items-center text-sm text-green-400">
            <ArrowUp className="mr-1 h-4 w-4" />
            +0.2% from last week
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Avg Response</h3>
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mb-2 text-3xl font-bold text-white">
            {systemStats.avgResponseTime}ms
          </div>
          <div className="flex items-center text-sm text-green-400">
            <ArrowDown className="mr-1 h-4 w-4" />
            -12% from last week
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                className={`rounded-lg border-2 border-transparent p-4 hover:border-${action.color}-500/30 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 group transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon
                    className={`h-6 w-6 text-${action.color}-400 group-hover:text-${action.color}-300`}
                  />
                  <span className="text-sm font-medium text-white">
                    {action.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-white" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Network Topology Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">
          Network Topology
        </h3>
        <div className="relative h-48">
          <NetworkTopology className="h-full w-full" />
        </div>
      </motion.div>

      {/* System Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = getStatusIcon(activity.status);
              return (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 rounded-lg bg-gray-800/30 p-3"
                >
                  <Icon
                    className={`h-4 w-4 ${getStatusColor(activity.status)}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="font-semibold text-white">
                {systemStats.uptime}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-green-400"
                style={{ width: `${systemStats.uptime}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Transfer</span>
              <span className="font-semibold text-white">
                {systemStats.dataTransfer} GB
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-400"
                style={{ width: '60%' }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Cost Savings</span>
              <span className="font-semibold text-white">
                {systemStats.costSavings}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-purple-400"
                style={{ width: `${systemStats.costSavings}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation to Detailed Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">
          Detailed Monitoring
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <Server className="h-5 w-5 text-blue-400" />
              <h4 className="font-medium text-white">RPC Sync Monitoring</h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Monitor synchronization status across all your RPC endpoints
            </p>
            <div className="flex items-center text-sm text-blue-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-green-400" />
              <h4 className="font-medium text-white">Wallet Portfolio</h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Track wallet balances and transactions across all chains
            </p>
            <div className="flex items-center text-sm text-green-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h4 className="font-medium text-white">Analytics & Insights</h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Comprehensive analytics and performance insights
            </p>
            <div className="flex items-center text-sm text-purple-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h4 className="font-medium text-white">Alert Management</h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Monitor and manage alerts across all your RPC endpoints
            </p>
            <div className="flex items-center text-sm text-red-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <Shield className="h-5 w-5 text-orange-400" />
              <h4 className="font-medium text-white">Security Monitoring</h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Monitor security threats and suspicious activities
            </p>
            <div className="flex items-center text-sm text-orange-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="cursor-pointer rounded-lg bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
            <div className="mb-2 flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-400" />
              <h4 className="font-medium text-white">
                Settings & Configuration
              </h4>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Manage your application preferences and configuration
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>View Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewDisplay;
