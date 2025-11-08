import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Bell,
  BellOff,
  Search,
  RefreshCw,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'rpc' | 'wallet' | 'sync' | 'security' | 'cost' | 'sla';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: {
    rpcId?: string;
    walletId?: string;
    chainId?: number;
    value?: number;
    threshold?: number;
  };
}

export const RealTimeAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'unacknowledged' | 'critical' | 'high'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'low':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10';
      case 'high':
        return 'border-orange-500/30 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rpc':
        return '🖥️';
      case 'wallet':
        return '👛';
      case 'sync':
        return '🔄';
      case 'security':
        return '🔒';
      case 'cost':
        return '💰';
      case 'sla':
        return '📊';
      default:
        return '⚠️';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              isAcknowledged: true,
              acknowledgedBy: 'current-user',
              acknowledgedAt: new Date(),
            }
          : alert
      )
    );
  };

  const dismissAlert = async (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unacknowledged' && !alert.isAcknowledged) ||
      (filter === 'critical' && alert.severity === 'critical') ||
      (filter === 'high' && alert.severity === 'high');

    const matchesSearch =
      searchTerm === '' ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unacknowledgedCount = alerts.filter((a) => !a.isAcknowledged).length;
  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' && !a.isAcknowledged
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-orange-400" />
        <span className="ml-2 text-gray-400">No alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Real-time Alerts</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`rounded-lg p-2 transition-colors ${
              soundEnabled
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {soundEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`rounded-lg p-2 transition-colors ${
              autoRefresh
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            <RefreshCw
              className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
        >
          <option value="all">All Alerts</option>
          <option value="unacknowledged">Unacknowledged</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Critical Alerts Banner */}

      {/* Alerts List */}
      <div className="max-h-96 space-y-3 overflow-y-auto"></div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="py-8 text-center">
          <BellOff className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-400">No alerts match your current filters</p>
        </div>
      )}
    </div>
  );
};
