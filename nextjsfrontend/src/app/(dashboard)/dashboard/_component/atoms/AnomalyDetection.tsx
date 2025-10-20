import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Anomaly {
  id: string;
  type:
    | 'response_time'
    | 'error_rate'
    | 'throughput'
    | 'unusual_pattern'
    | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  confidence: number;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  source: string;
  metadata?: Record<string, any>;
}

interface AnomalyStats {
  totalAnomalies: number;
  activeAnomalies: number;
  resolvedAnomalies: number;
  falsePositives: number;
  avgConfidence: number;
  detectionAccuracy: number;
}

export const AnomalyDetection: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'critical' | 'high'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  useEffect(() => {
    fetchAnomalyData();
    const interval = setInterval(fetchAnomalyData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalyData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockAnomalies: Anomaly[] = [
        {
          id: '1',
          type: 'response_time',
          severity: 'high',
          title: 'Response Time Spike Detected',
          description:
            'Average response time increased by 300% compared to baseline',
          detectedAt: new Date(Date.now() - 5 * 60 * 1000),
          confidence: 94.5,
          metric: 'avg_response_time_ms',
          expectedValue: 245,
          actualValue: 980,
          deviation: 300.0,
          status: 'active',
          source: 'Ethereum Mainnet RPC',
        },
        {
          id: '2',
          type: 'error_rate',
          severity: 'critical',
          title: 'Error Rate Anomaly',
          description: 'Error rate spiked to 15% from normal 0.1%',
          detectedAt: new Date(Date.now() - 10 * 60 * 1000),
          confidence: 98.2,
          metric: 'error_rate_percent',
          expectedValue: 0.1,
          actualValue: 15.2,
          deviation: 15200.0,
          status: 'investigating',
          source: 'Polygon RPC',
        },
        {
          id: '3',
          type: 'throughput',
          severity: 'medium',
          title: 'Throughput Drop Detected',
          description: 'Request throughput dropped by 40% from expected levels',
          detectedAt: new Date(Date.now() - 15 * 60 * 1000),
          confidence: 87.3,
          metric: 'requests_per_second',
          expectedValue: 1250,
          actualValue: 750,
          deviation: -40.0,
          status: 'resolved',
          source: 'BSC RPC',
        },
        {
          id: '4',
          type: 'unusual_pattern',
          severity: 'low',
          title: 'Unusual Request Pattern',
          description:
            'Detected unusual request pattern with 80% GET requests vs normal 60%',
          detectedAt: new Date(Date.now() - 30 * 60 * 1000),
          confidence: 72.1,
          metric: 'request_type_distribution',
          expectedValue: 60,
          actualValue: 80,
          deviation: 33.3,
          status: 'false_positive',
          source: 'Arbitrum RPC',
        },
        {
          id: '5',
          type: 'security',
          severity: 'critical',
          title: 'Suspicious Activity Pattern',
          description: 'Multiple failed authentication attempts from single IP',
          detectedAt: new Date(Date.now() - 45 * 60 * 1000),
          confidence: 96.8,
          metric: 'failed_auth_attempts',
          expectedValue: 0,
          actualValue: 25,
          deviation: 2500.0,
          status: 'active',
          source: 'API Gateway',
        },
      ];

      const mockStats: AnomalyStats = {
        totalAnomalies: 156,
        activeAnomalies: 8,
        resolvedAnomalies: 142,
        falsePositives: 6,
        avgConfidence: 89.2,
        detectionAccuracy: 94.5,
      };

      setAnomalies(mockAnomalies);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch anomaly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-blue-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
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
      case 'response_time':
        return <Clock className="h-4 w-4" />;
      case 'error_rate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'throughput':
        return <TrendingUp className="h-4 w-4" />;
      case 'unusual_pattern':
        return <Activity className="h-4 w-4" />;
      case 'security':
        return <Brain className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-400 bg-red-500/20';
      case 'investigating':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved':
        return 'text-green-400 bg-green-500/20';
      case 'false_positive':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDeviationIcon = (deviation: number) => {
    return deviation > 0 ? TrendingUp : TrendingDown;
  };

  const getDeviationColor = (deviation: number) => {
    return deviation > 0 ? 'text-red-400' : 'text-green-400';
  };

  const filteredAnomalies = anomalies.filter((anomaly) => {
    switch (filter) {
      case 'active':
        return anomaly.status === 'active';
      case 'critical':
        return anomaly.severity === 'critical';
      case 'high':
        return anomaly.severity === 'high';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading anomaly data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center space-x-2 text-lg font-semibold text-white">
          <Brain className="h-5 w-5 text-purple-400" />
          <span>Anomaly Detection</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            {viewMode === 'list' ? (
              <BarChart3 className="h-4 w-4" />
            ) : (
              <PieChart className="h-4 w-4" />
            )}
          </button>
          <Button className="p-2 text-gray-400 transition-colors hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Anomalies
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.totalAnomalies}
            </div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-gray-300">Active</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {stats.activeAnomalies}
            </div>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">
                Accuracy
              </span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {stats.detectionAccuracy}%
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Avg Confidence
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.avgConfidence}%
            </div>
          </div>
        </div>
      )}

      {/* ML Model Status */}
      <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
            <span className="font-semibold text-white">ML Model: Active</span>
          </div>
          <div className="text-sm text-gray-400">Last trained: 2 hours ago</div>
        </div>
        <p className="mt-2 text-sm text-gray-300">
          Anomaly detection model is running with 94.5% accuracy
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'active', 'critical', 'high'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
              filter === filterType
                ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                : 'border border-gray-500/30 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {filteredAnomalies.map((anomaly, index) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg border p-4 ${getSeverityColor(anomaly.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getSeverityIcon(anomaly.severity)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  {getTypeIcon(anomaly.type)}
                  <h4 className="font-semibold text-white">{anomaly.title}</h4>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${getStatusColor(anomaly.status)}`}
                  >
                    {anomaly.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="mb-3 text-sm text-gray-300">
                  {anomaly.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="ml-2 font-semibold text-white">
                      {anomaly.confidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Deviation:</span>
                    <span
                      className={`ml-2 font-semibold ${getDeviationColor(anomaly.deviation)}`}
                    >
                      {anomaly.deviation > 0 ? '+' : ''}
                      {anomaly.deviation.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected:</span>
                    <span className="ml-2 text-white">
                      {anomaly.expectedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Actual:</span>
                    <span className="ml-2 text-white">
                      {anomaly.actualValue}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{anomaly.detectedAt.toLocaleTimeString()}</span>
                    </div>
                    <span>Source: {anomaly.source}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {React.createElement(getDeviationIcon(anomaly.deviation), {
                      className: `w-3 h-3 ${getDeviationColor(anomaly.deviation)}`,
                    })}
                    <span className={getDeviationColor(anomaly.deviation)}>
                      {anomaly.deviation > 0 ? 'Above' : 'Below'} Expected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnomalies.length === 0 && (
        <div className="py-8 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-400">
            No anomalies match your current filters
          </p>
        </div>
      )}

      {/* Model Performance */}
      <div className="rounded-lg bg-black/20 p-6">
        <h5 className="mb-4 text-lg font-semibold text-white">
          Model Performance
        </h5>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">94.5%</div>
            <div className="text-sm text-gray-400">Detection Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">89.2%</div>
            <div className="text-sm text-gray-400">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">3.8%</div>
            <div className="text-sm text-gray-400">False Positive Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
