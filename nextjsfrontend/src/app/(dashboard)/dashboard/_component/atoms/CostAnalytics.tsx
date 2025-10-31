import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CostData {
  category: string;
  amount: number;
  percentage: number;
  change: number;
  color: string;
  icon: string;
}

interface MonthlyCost {
  month: string;
  total: number;
  rpc: number;
  storage: number;
  bandwidth: number;
  alerts: number;
}

export const CostAnalytics: React.FC = () => {
  const [costData, setCostData] = useState<CostData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('30d');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    fetchCostData();
    const interval = setInterval(fetchCostData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockCostData: CostData[] = [
        {
          category: 'RPC Calls',
          amount: 1847.32,
          percentage: 65.2,
          change: 12.5,
          color: 'text-blue-400',
          icon: '🖥️',
        },
        {
          category: 'Data Storage',
          amount: 523.18,
          percentage: 18.5,
          change: -2.1,
          color: 'text-green-400',
          icon: '💾',
        },
        {
          category: 'Bandwidth',
          amount: 312.45,
          percentage: 11.0,
          change: 8.7,
          color: 'text-purple-400',
          icon: '🌐',
        },
        {
          category: 'Alerts & Notifications',
          amount: 89.23,
          percentage: 3.1,
          change: 15.3,
          color: 'text-yellow-400',
          icon: '🔔',
        },
        {
          category: 'API Requests',
          amount: 67.82,
          percentage: 2.4,
          change: -5.2,
          color: 'text-orange-400',
          icon: '⚡',
        },
      ];

      const mockMonthlyData: MonthlyCost[] = [
        {
          month: 'Jan',
          total: 2450,
          rpc: 1600,
          storage: 450,
          bandwidth: 300,
          alerts: 100,
        },
        {
          month: 'Feb',
          total: 2630,
          rpc: 1720,
          storage: 480,
          bandwidth: 320,
          alerts: 110,
        },
        {
          month: 'Mar',
          total: 2847,
          rpc: 1847,
          storage: 523,
          bandwidth: 312,
          alerts: 89,
        },
        {
          month: 'Apr',
          total: 2720,
          rpc: 1780,
          storage: 500,
          bandwidth: 300,
          alerts: 85,
        },
        {
          month: 'May',
          total: 2950,
          rpc: 1920,
          storage: 550,
          bandwidth: 350,
          alerts: 95,
        },
        {
          month: 'Jun',
          total: 3100,
          rpc: 2000,
          storage: 600,
          bandwidth: 380,
          alerts: 120,
        },
      ];

      setCostData(mockCostData);
      setMonthlyData(mockMonthlyData);
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);
  const totalChange =
    costData.length > 0
      ? costData.reduce((sum, item) => sum + item.change, 0) / costData.length
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-red-400' : 'text-green-400';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading cost data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center space-x-2 text-lg font-semibold text-white">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span>Cost Analytics</span>
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) =>
              setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')
            }
            className="rounded border border-white/10 bg-black/20 px-3 py-1 text-sm text-white focus:border-blue-500/50 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() =>
              setViewMode(viewMode === 'chart' ? 'table' : 'chart')
            }
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            {viewMode === 'chart' ? (
              <BarChart3 className="h-4 w-4" />
            ) : (
              <PieChart className="h-4 w-4" />
            )}
          </button>
          <Button className="p-2 text-gray-400 transition-colors hover:text-white">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-white">
              {formatCurrency(totalCost)}
            </h4>
            <p className="text-sm text-gray-400">
              Total cost this {selectedPeriod}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`flex items-center space-x-1 ${getChangeColor(totalChange)}`}
            >
              {React.createElement(getChangeIcon(totalChange), {
                className: 'w-4 h-4',
              })}
              <span className="text-sm font-semibold">
                {totalChange >= 0 ? '+' : ''}
                {totalChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-400">vs previous period</p>
          </div>
        </div>

        {/* Budget Warning */}
        {totalCost > 2500 && (
          <div className="flex items-center space-x-2 rounded-lg border border-yellow-500/30 bg-yellow-500/20 p-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Approaching monthly budget limit (${totalCost.toFixed(0)} /
              $3,000)
            </span>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      {viewMode === 'chart' ? (
        <div className="space-y-4">
          {costData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-white/10 bg-black/20 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h5 className="font-semibold text-white">
                      {item.category}
                    </h5>
                    <p className="text-sm text-gray-400">
                      {item.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(item.amount)}
                  </div>
                  <div
                    className={`flex items-center justify-end space-x-1 text-sm ${getChangeColor(item.change)}`}
                  >
                    {React.createElement(getChangeIcon(item.change), {
                      className: 'w-3 h-3',
                    })}
                    <span>
                      {item.change >= 0 ? '+' : ''}
                      {item.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-gray-700">
                <motion.div
                  className={`h-2 rounded-full ${
                    item.category === 'RPC Calls'
                      ? 'bg-blue-500'
                      : item.category === 'Data Storage'
                        ? 'bg-green-500'
                        : item.category === 'Bandwidth'
                          ? 'bg-purple-500'
                          : item.category === 'Alerts & Notifications'
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-black/20">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                  Percentage
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {costData.map((item, index) => (
                <motion.tr
                  key={item.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-white">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {item.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className={`flex items-center justify-end space-x-1 ${getChangeColor(item.change)}`}
                    >
                      {React.createElement(getChangeIcon(item.change), {
                        className: 'w-3 h-3',
                      })}
                      <span className="text-sm font-semibold">
                        {item.change >= 0 ? '+' : ''}
                        {item.change.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Trend Chart */}
      <div className="rounded-lg bg-black/20 p-6">
        <h5 className="mb-4 text-lg font-semibold text-white">
          Monthly Cost Trend
        </h5>
        <div className="flex h-48 items-end justify-between space-x-2">
          {monthlyData.map((month) => {
            const maxTotal = Math.max(...monthlyData.map((m) => m.total));
            const height = (month.total / maxTotal) * 100;
            return (
              <div
                key={month.month}
                className="flex flex-1 flex-col items-center"
              >
                <div
                  className="mb-2 w-full rounded-t bg-gray-700"
                  style={{ height: `${height}px` }}
                >
                  <div className="h-full rounded-t bg-gradient-to-t from-green-500 to-blue-500" />
                </div>
                <span className="text-xs text-gray-400">{month.month}</span>
                <span className="text-xs font-semibold text-white">
                  ${month.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Optimization Recommendations */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
        <div className="mb-3 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h5 className="font-semibold text-yellow-400">Cost Optimization</h5>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            • Consider upgrading to Enterprise plan for 30% RPC call savings
          </p>
          <p>• Reduce data retention from 90 to 30 days to save $200/month</p>
          <p>• Optimize alert frequency to reduce notification costs</p>
        </div>
      </div>
    </div>
  );
};
