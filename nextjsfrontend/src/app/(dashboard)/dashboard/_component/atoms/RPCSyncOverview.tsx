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
import { useGetRpcs } from '@/hooks/useRpcs';

export const RPCSyncOverview: React.FC = () => {
  const { data, isLoading, error } = useGetRpcs();
  const queryRpcs: any[] = data?.data || [];

  const totalRPCs = queryRpcs.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalRPCs}</div>
          <div className="text-xs text-gray-400">Total RPCs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">0</div>
          <div className="text-xs text-gray-400">Synced</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">0</div>
          <div className="text-xs text-gray-400">Syncing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">0</div>
          <div className="text-xs text-gray-400">Issues</div>
        </div>
      </div>

      {/* Overall Health */}
      <div className="rounded-lg bg-black/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Health</span>
          <span className={`text-sm font-semibold ${getHealthColor(0)}`}>
            0%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <motion.div
            className={'h-2 rounded-full bg-red-400'}
            initial={{ width: 0 }}
            animate={{ width: `${0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* RPC List */}
      <div className="space-y-3">
        {queryRpcs.map((rpc, index) => (
          <motion.div
            key={rpc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h4 className="font-semibold text-white">{rpc.name}</h4>
                  <p className="text-xs text-gray-400">
                    Chain ID: {rpc.chainId}
                  </p>
                </div>
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
    </div>
  );
};
