import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  getHealthColor,
  getStatusIcon,
  getSyncStateStatusColor,
} from '@/lib/utils';

export const RPCSyncOverview: React.FC = () => {
  const [syncStates, setSyncStates] = useState<RPCSyncState[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchSyncStates = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call your backend
      const mockData: RPCSyncState[] = [
        {
          id: '1',
          name: 'Ethereum Mainnet',
          url: 'https://mainnet.infura.io/v3/...',
          chainId: 1,
          syncStatus: 'synced',
          currentBlock: 18500000,
          latestBlock: 18500000,
          syncProgress: 100,
          blocksBehind: 0,
          syncSpeed: 12.5,
          healthScore: 98,
          lastUpdate: new Date(),
        },
        {
          id: '2',
          name: 'Polygon Mainnet',
          url: 'https://polygon-rpc.com',
          chainId: 137,
          syncStatus: 'syncing',
          currentBlock: 45000000,
          latestBlock: 45000150,
          syncProgress: 99.7,
          blocksBehind: 150,
          syncSpeed: 8.2,
          healthScore: 85,
          lastUpdate: new Date(),
        },
        {
          id: '3',
          name: 'BSC Mainnet',
          url: 'https://bsc-dataseed.binance.org',
          chainId: 56,
          syncStatus: 'behind',
          currentBlock: 32000000,
          latestBlock: 32000500,
          syncProgress: 99.8,
          blocksBehind: 500,
          syncSpeed: 2.1,
          healthScore: 72,
          lastUpdate: new Date(),
        },
        {
          id: '4',
          name: 'Arbitrum One',
          url: 'https://arb1.arbitrum.io/rpc',
          chainId: 42161,
          syncStatus: 'stuck',
          currentBlock: 15000000,
          latestBlock: 15001000,
          syncProgress: 99.3,
          blocksBehind: 1000,
          syncSpeed: 0,
          healthScore: 45,
          lastUpdate: new Date(),
        },
      ];
      setSyncStates(mockData);
    } catch (error) {
      console.error('Failed to fetch sync states:', error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchSyncStates();
    const interval = setInterval(fetchSyncStates, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const totalRPCs = syncStates.length;
  const syncedRPCs = syncStates.filter((s) => s.syncStatus === 'synced').length;
  const syncingRPCs = syncStates.filter(
    (s) => s.syncStatus === 'syncing'
  ).length;
  const behindRPCs = syncStates.filter((s) => s.syncStatus === 'behind').length;
  const stuckRPCs = syncStates.filter((s) => s.syncStatus === 'stuck').length;
  const averageHealth =
    syncStates.length > 0
      ? syncStates.reduce((sum, s) => sum + s.healthScore, 0) /
        syncStates.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalRPCs}</div>
          <div className="text-xs text-gray-400">Total RPCs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{syncedRPCs}</div>
          <div className="text-xs text-gray-400">Synced</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {syncingRPCs}
          </div>
          <div className="text-xs text-gray-400">Syncing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stuckRPCs}</div>
          <div className="text-xs text-gray-400">Issues</div>
        </div>
      </div>

      {/* Overall Health */}
      <div className="rounded-lg bg-black/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Health</span>
          <span
            className={`text-sm font-semibold ${getHealthColor(averageHealth)}`}
          >
            {averageHealth.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <motion.div
            className={`h-2 rounded-full ${
              averageHealth >= 90
                ? 'bg-green-400'
                : averageHealth >= 70
                  ? 'bg-yellow-400'
                  : averageHealth >= 50
                    ? 'bg-orange-400'
                    : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${averageHealth}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* RPC List */}
      <div className="space-y-3">
        {syncStates.map((rpc, index) => (
          <motion.div
            key={rpc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-4 ${getSyncStateStatusColor(rpc.syncStatus)}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(rpc.syncStatus)}
                <div>
                  <h4 className="font-semibold text-white">{rpc.name}</h4>
                  <p className="text-xs text-gray-400">
                    Chain ID: {rpc.chainId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold ${getHealthColor(rpc.healthScore)}`}
                >
                  {rpc.healthScore}%
                </div>
                <div className="text-xs text-gray-400">Health</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Blocks:</span>
                <span className="ml-2 text-white">
                  {rpc.currentBlock.toLocaleString()} /{' '}
                  {rpc.latestBlock.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Behind:</span>
                <span className="ml-2 text-white">
                  {rpc.blocksBehind.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Progress:</span>
                <span className="ml-2 text-white">
                  {rpc.syncProgress.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Speed:</span>
                <span className="ml-2 text-white">
                  {rpc.syncSpeed.toFixed(1)} blk/s
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-gray-700">
                <motion.div
                  className={`h-1.5 rounded-full ${
                    rpc.syncProgress >= 99
                      ? 'bg-green-400'
                      : rpc.syncProgress >= 95
                        ? 'bg-yellow-400'
                        : 'bg-orange-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${rpc.syncProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Update */}
      <div className="text-center text-xs text-gray-400">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
};
