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

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'rpc',
          severity: 'critical',
          title: 'RPC Endpoint Down',
          message: 'Ethereum Mainnet RPC has been offline for 5 minutes',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isAcknowledged: false,
          metadata: {
            rpcId: 'eth-mainnet-1',
            chainId: 1,
          },
        },
        {
          id: '2',
          type: 'sync',
          severity: 'high',
          title: 'Sync Behind Threshold',
          message: 'Polygon RPC is 500 blocks behind latest block',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          isAcknowledged: false,
          metadata: {
            rpcId: 'polygon-mainnet-1',
            chainId: 137,
            value: 500,
            threshold: 100,
          },
        },
        {
          id: '3',
          type: 'wallet',
          severity: 'medium',
          title: 'Large Transaction Detected',
          message: 'Transaction of $50,000 detected in Main Trading Wallet',
          timestamp: new Date(Date.now() - 1 * 60 * 1000),
          isAcknowledged: true,
          acknowledgedBy: 'admin@example.com',
          acknowledgedAt: new Date(Date.now() - 30 * 1000),
          metadata: {
            walletId: 'wallet-1',
            value: 50000,
          },
        },
        {
          id: '4',
          type: 'security',
          severity: 'high',
          title: 'Unusual Activity Pattern',
          message: 'Multiple failed login attempts detected',
          timestamp: new Date(Date.now() - 3 * 60 * 1000),
          isAcknowledged: false,
          metadata: {
            value: 5,
            threshold: 3,
          },
        },
        {
          id: '5',
          type: 'cost',
          severity: 'low',
          title: 'Budget Warning',
          message: 'Monthly API usage is approaching 80% of budget',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isAcknowledged: false,
          metadata: {
            value: 80,
            threshold: 80,
          },
        },
        {
          id: '6',
          type: 'sla',
          severity: 'critical',
          title: 'SLA Breach',
          message: 'Uptime SLA has dropped below 99.9% threshold',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isAcknowledged: false,
          metadata: {
            value: 99.5,
            threshold: 99.9,
          },
        },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading alerts...</span>
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
          {unacknowledgedCount > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">
              {unacknowledgedCount}
            </span>
          )}
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
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/30 bg-red-500/20 p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="font-semibold text-red-400">
              {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}{' '}
              Require{criticalCount > 1 ? '' : 's'} Immediate Attention
            </span>
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)} ${
                alert.isAcknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(alert.type)}</span>
                    <h4 className="truncate font-semibold text-white">
                      {alert.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        alert.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : alert.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="mb-2 text-sm text-gray-300">{alert.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                      {alert.metadata?.rpcId && (
                        <span>RPC: {alert.metadata.rpcId}</span>
                      )}
                      {alert.metadata?.walletId && (
                        <span>Wallet: {alert.metadata.walletId}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {alert.isAcknowledged ? (
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Acknowledged</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="rounded-lg bg-green-500/20 px-3 py-1 text-xs text-green-400 transition-colors hover:bg-green-500/30"
                        >
                          Acknowledge
                        </button>
                      )}

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-gray-400 transition-colors hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
