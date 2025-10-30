import type { RPCConfig, RPCHealthMetrics, Alert } from '../types';
import { metricsLogger } from '../utils/logger';

export class MetricsService {
  constructor() {
    metricsLogger.info('MetricsService initialized');
  }

  // Record RPC request metrics
  recordRPCRequest(rpcConfig: RPCConfig, success: boolean, responseTime: number): void {
    metricsLogger.debug('RPC request recorded', {
      rpcId: rpcConfig.id,
      success,
      responseTime,
    });
  }

  // Record RPC error metrics
  recordRPCError(rpcConfig: RPCConfig, errorType: string): void {
    metricsLogger.warn('RPC error recorded', {
      rpcId: rpcConfig.id,
      errorType,
    });
  }

  // Record alert metrics
  recordAlert(alert: Alert): void {
    metricsLogger.info('Alert recorded', {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
    });
  }

  // Get metrics summary
  getMetricsSummary(): any {
    return {
      timestamp: new Date().toISOString(),
      service: 'metrics',
      status: 'operational',
    };
  }

  // Cleanup method
  cleanup(): void {
    metricsLogger.info('MetricsService cleanup completed');
  }
}