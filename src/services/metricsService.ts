import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { RPCConfig, RPCHealthMetrics, Alert } from '../types';
import { metricsLogger } from '../utils/logger';

export class MetricsService {
  private registry: Registry;
  
  // RPC-specific metrics
  private rpcRequestsTotal: Counter<string>;
  private rpcErrorsTotal: Counter<string>;
  private rpcResponseTime: Histogram<string>;
  private rpcBlockNumber: Gauge<string>;
  private rpcGasPrice: Gauge<string>;
  private rpcPeerCount: Gauge<string>;
  private rpcOnlineStatus: Gauge<string>;
  private rpcSyncProgress: Gauge<string>;
  
  // Alert metrics
  private alertsTotal: Counter<string>;
  private activeAlerts: Gauge<string>;
  private alertResolutionTime: Histogram<string>;
  
  // System metrics
  private systemUptime: Gauge<string>;
  private systemRPCsTotal: Gauge<string>;
  private systemRPCsOnline: Gauge<string>;
  private systemRPCsOffline: Gauge<string>;
  private systemAlertsTotal: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
    metricsLogger.info('MetricsService initialized');
  }

  private initializeMetrics(): void {
    // RPC-specific metrics
    this.rpcRequestsTotal = new Counter({
      name: 'rpc_requests_total',
      help: 'Total number of RPC requests',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id', 'method']
    });

    this.rpcErrorsTotal = new Counter({
      name: 'rpc_errors_total',
      help: 'Total number of RPC errors',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id', 'error_type']
    });

    this.rpcResponseTime = new Histogram({
      name: 'rpc_response_time_seconds',
      help: 'RPC response time in seconds',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
    });

    this.rpcBlockNumber = new Gauge({
      name: 'rpc_block_number',
      help: 'Current block number for RPC',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.rpcGasPrice = new Gauge({
      name: 'rpc_gas_price_wei',
      help: 'Current gas price in wei for RPC',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.rpcPeerCount = new Gauge({
      name: 'rpc_peer_count',
      help: 'Current peer count for RPC',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.rpcOnlineStatus = new Gauge({
      name: 'rpc_online_status',
      help: 'Online status of RPC (1 = online, 0 = offline)',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.rpcSyncProgress = new Gauge({
      name: 'rpc_sync_progress_percent',
      help: 'Sync progress percentage for RPC',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    // Alert metrics
    this.alertsTotal = new Counter({
      name: 'alerts_total',
      help: 'Total number of alerts',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id', 'alert_type', 'severity']
    });

    this.activeAlerts = new Gauge({
      name: 'active_alerts',
      help: 'Number of active alerts',
      labelNames: ['rpc_id', 'rpc_name', 'network', 'chain_id', 'alert_type', 'severity']
    });

    this.alertResolutionTime = new Histogram({
      name: 'alert_resolution_time_seconds',
      help: 'Time to resolve alerts in seconds',
      labelNames: ['alert_type', 'severity'],
      buckets: [60, 300, 900, 1800, 3600, 7200, 14400]
    });

    // System metrics
    this.systemUptime = new Gauge({
      name: 'system_uptime_seconds',
      help: 'System uptime in seconds'
    });

    this.systemRPCsTotal = new Gauge({
      name: 'system_rpcs_total',
      help: 'Total number of RPCs in the system'
    });

    this.systemRPCsOnline = new Gauge({
      name: 'system_rpcs_online',
      help: 'Number of online RPCs'
    });

    this.systemRPCsOffline = new Gauge({
      name: 'system_rpcs_offline',
      help: 'Number of offline RPCs'
    });

    this.systemAlertsTotal = new Gauge({
      name: 'system_alerts_total',
      help: 'Total number of alerts in the system'
    });

    // Register all metrics
    this.registry.registerMetric(this.rpcRequestsTotal);
    this.registry.registerMetric(this.rpcErrorsTotal);
    this.registry.registerMetric(this.rpcResponseTime);
    this.registry.registerMetric(this.rpcBlockNumber);
    this.registry.registerMetric(this.rpcGasPrice);
    this.registry.registerMetric(this.rpcPeerCount);
    this.registry.registerMetric(this.rpcOnlineStatus);
    this.registry.registerMetric(this.rpcSyncProgress);
    this.registry.registerMetric(this.alertsTotal);
    this.registry.registerMetric(this.activeAlerts);
    this.registry.registerMetric(this.alertResolutionTime);
    this.registry.registerMetric(this.systemUptime);
    this.registry.registerMetric(this.systemRPCsTotal);
    this.registry.registerMetric(this.systemRPCsOnline);
    this.registry.registerMetric(this.systemRPCsOffline);
    this.registry.registerMetric(this.systemAlertsTotal);

    // Start uptime tracking
    this.startUptimeTracking();
  }

  private startUptimeTracking(): void {
    const startTime = Date.now();
    setInterval(() => {
      this.systemUptime.set((Date.now() - startTime) / 1000);
    }, 1000);
  }

  /**
   * Record an RPC request
   */
  recordRPCRequest(config: RPCConfig, method: string = 'health_check'): void {
    this.rpcRequestsTotal.inc({
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      method
    });
  }

  /**
   * Record an RPC error
   */
  recordRPCError(config: RPCConfig, errorType: string): void {
    this.rpcErrorsTotal.inc({
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      error_type: errorType
    });
  }

  /**
   * Record RPC health check metrics
   */
  recordHealthCheck(config: RPCConfig, healthResult: any): void {
    const labels = {
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    // Record response time
    if (healthResult.responseTime) {
      this.rpcResponseTime.observe(labels, healthResult.responseTime / 1000);
    }

    // Record block number
    if (healthResult.blockNumber) {
      this.rpcBlockNumber.set(labels, healthResult.blockNumber);
    }

    // Record gas price
    if (healthResult.gasPrice) {
      const gasPrice = BigInt(healthResult.gasPrice);
      this.rpcGasPrice.set(labels, Number(gasPrice));
    }

    // Record peer count
    if (healthResult.peerCount !== undefined) {
      this.rpcPeerCount.set(labels, healthResult.peerCount);
    }

    // Record online status
    this.rpcOnlineStatus.set(labels, healthResult.isOnline ? 1 : 0);

    // Record sync progress
    if (healthResult.syncProgress !== undefined) {
      this.rpcSyncProgress.set(labels, healthResult.syncProgress);
    }
  }

  /**
   * Record an alert
   */
  recordAlert(alert: Alert): void {
    const labels = {
      rpc_id: alert.rpcId,
      rpc_name: 'unknown', // We don't have rpcName in the new Alert interface
      network: alert.network,
      chain_id: alert.chainId.toString(),
      alert_type: alert.type,
      severity: alert.severity
    };

    this.alertsTotal.inc(labels);
    
    if (!alert.resolved) {
      this.activeAlerts.inc(labels);
    } else {
      this.activeAlerts.dec(labels);
      
      // Record resolution time if available
      if (alert.resolvedAt) {
        const resolutionTime = (alert.resolvedAt.getTime() - alert.timestamp.getTime()) / 1000;
        this.alertResolutionTime.observe({
          alert_type: alert.type,
          severity: alert.severity
        }, resolutionTime);
      }
    }
  }

  /**
   * Update RPC statistics
   */
  updateRPCStats(config: RPCConfig, status: any): void {
    const labels = {
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    // Update online status
    this.rpcOnlineStatus.set(labels, status.isOnline ? 1 : 0);

    // Update other metrics if available
    if (status.blockNumber) {
      this.rpcBlockNumber.set(labels, status.blockNumber);
    }

    if (status.peerCount !== undefined) {
      this.rpcPeerCount.set(labels, status.peerCount);
    }

    if (status.gasPrice) {
      const gasPrice = BigInt(status.gasPrice);
      this.rpcGasPrice.set(labels, Number(gasPrice));
    }
  }

  /**
   * Update system-wide metrics
   */
  updateSystemMetrics(totalRPCs: number, onlineRPCs: number, totalAlerts: number): void {
    this.systemRPCsTotal.set(totalRPCs);
    this.systemRPCsOnline.set(onlineRPCs);
    this.systemRPCsOffline.set(totalRPCs - onlineRPCs);
    this.systemAlertsTotal.set(totalAlerts);
  }

  /**
   * Record RPC response time
   */
  recordRPCResponseTime(config: RPCConfig, responseTime: number): void {
    const labels = {
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    this.rpcResponseTime.observe(labels, responseTime / 1000);
  }

  /**
   * Get all metrics as a string
   */
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  /**
   * Get the metrics registry
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.registry.clear();
    this.initializeMetrics();
    metricsLogger.info('Metrics reset');
  }

  /**
   * Get metrics metadata
   */
  getMetricsMetadata(): any {
    return {
      rpcMetrics: [
        'rpc_requests_total',
        'rpc_errors_total',
        'rpc_response_time_seconds',
        'rpc_block_number',
        'rpc_gas_price_wei',
        'rpc_peer_count',
        'rpc_online_status',
        'rpc_sync_progress_percent'
      ],
      alertMetrics: [
        'alerts_total',
        'active_alerts',
        'alert_resolution_time_seconds'
      ],
      systemMetrics: [
        'system_uptime_seconds',
        'system_rpcs_total',
        'system_rpcs_online',
        'system_rpcs_offline',
        'system_alerts_total'
      ]
    };
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    this.registry.clear();
    metricsLogger.info('MetricsService cleanup completed');
  }
}
