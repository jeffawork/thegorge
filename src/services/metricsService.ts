import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { RPCConfig, HealthMetrics, Alert } from '../types';
import { metricsLogger } from '../utils/logger';

export class MetricsService {
  private registry: Registry;
  
  // Counters
  private rpcRequestsTotal!: Counter<string>;
  private rpcErrorsTotal!: Counter<string>;
  private alertsTotal!: Counter<string>;
  private healthChecksTotal!: Counter<string>;
  
  // Gauges
  private rpcStatus!: Gauge<string>;
  private rpcResponseTime!: Gauge<string>;
  private rpcBlockNumber!: Gauge<string>;
  private rpcGasPrice!: Gauge<string>;
  private rpcPeerCount!: Gauge<string>;
  private rpcUptime!: Gauge<string>;
  private rpcErrorCount!: Gauge<string>;
  private systemOnlineRPCs!: Gauge;
  private systemOfflineRPCs!: Gauge;
  private systemTotalAlerts!: Gauge;
  
  // Histograms
  private rpcResponseTimeHistogram!: Histogram<string>;
  private healthCheckDurationHistogram!: Histogram<string>;
  
  // Summaries
  private rpcResponseTimeSummary!: Summary<string>;
  private healthCheckDurationSummary!: Summary<string>;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
    metricsLogger.info('Prometheus metrics service initialized');
  }

  /**
   * Initialize all Prometheus metrics
   */
  private initializeMetrics(): void {
    // Counters
    this.rpcRequestsTotal = new Counter({
      name: 'evm_rpc_requests_total',
      help: 'Total number of RPC requests',
      labelNames: ['rpc_name', 'network', 'chain_id', 'method'],
      registers: [this.registry]
    });

    this.rpcErrorsTotal = new Counter({
      name: 'evm_rpc_errors_total',
      help: 'Total number of RPC errors',
      labelNames: ['rpc_name', 'network', 'chain_id', 'error_type'],
      registers: [this.registry]
    });

    this.alertsTotal = new Counter({
      name: 'evm_rpc_alerts_total',
      help: 'Total number of alerts generated',
      labelNames: ['rpc_name', 'network', 'chain_id', 'alert_type', 'severity'],
      registers: [this.registry]
    });

    this.healthChecksTotal = new Counter({
      name: 'evm_rpc_health_checks_total',
      help: 'Total number of health checks performed',
      labelNames: ['rpc_name', 'network', 'chain_id', 'status'],
      registers: [this.registry]
    });

    // Gauges
    this.rpcStatus = new Gauge({
      name: 'evm_rpc_status',
      help: 'Current status of RPC endpoint (1 = online, 0 = offline)',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcResponseTime = new Gauge({
      name: 'evm_rpc_response_time_ms',
      help: 'Current response time of RPC endpoint in milliseconds',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcBlockNumber = new Gauge({
      name: 'evm_rpc_block_number',
      help: 'Current block number of RPC endpoint',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcGasPrice = new Gauge({
      name: 'evm_rpc_gas_price_wei',
      help: 'Current gas price of RPC endpoint in Wei',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcPeerCount = new Gauge({
      name: 'evm_rpc_peer_count',
      help: 'Current peer count of RPC endpoint',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcUptime = new Gauge({
      name: 'evm_rpc_uptime_percentage',
      help: 'Uptime percentage of RPC endpoint',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.rpcErrorCount = new Gauge({
      name: 'evm_rpc_error_count',
      help: 'Current error count of RPC endpoint',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      registers: [this.registry]
    });

    this.systemOnlineRPCs = new Gauge({
      name: 'evm_system_online_rpcs',
      help: 'Total number of online RPC endpoints',
      registers: [this.registry]
    });

    this.systemOfflineRPCs = new Gauge({
      name: 'evm_system_offline_rpcs',
      help: 'Total number of offline RPC endpoints',
      registers: [this.registry]
    });

    this.systemTotalAlerts = new Gauge({
      name: 'evm_system_total_alerts',
      help: 'Total number of active alerts',
      registers: [this.registry]
    });

    // Histograms
    this.rpcResponseTimeHistogram = new Histogram({
      name: 'evm_rpc_response_time_histogram_ms',
      help: 'Histogram of RPC response times in milliseconds',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
      registers: [this.registry]
    });

    this.healthCheckDurationHistogram = new Histogram({
      name: 'evm_rpc_health_check_duration_histogram_ms',
      help: 'Histogram of health check durations in milliseconds',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      buckets: [100, 500, 1000, 2000, 5000, 10000, 30000],
      registers: [this.registry]
    });

    // Summaries
    this.rpcResponseTimeSummary = new Summary({
      name: 'evm_rpc_response_time_summary_ms',
      help: 'Summary of RPC response times in milliseconds',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
      registers: [this.registry]
    });

    this.healthCheckDurationSummary = new Summary({
      name: 'evm_rpc_health_check_duration_summary_ms',
      help: 'Summary of health check durations in milliseconds',
      labelNames: ['rpc_name', 'network', 'chain_id'],
      percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
      registers: [this.registry]
    });
  }

  /**
   * Record RPC request metrics
   */
  recordRPCRequest(config: RPCConfig, method: string): void {
    this.rpcRequestsTotal.inc({
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      method
    });
  }

  /**
   * Record RPC error metrics
   */
  recordRPCError(config: RPCConfig, errorType: string): void {
    this.rpcErrorsTotal.inc({
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      error_type: errorType
    });
  }

  /**
   * Record alert metrics
   */
  recordAlert(alert: Alert): void {
    this.alertsTotal.inc({
      rpc_name: alert.rpcName,
      network: alert.network || 'unknown',
      chain_id: alert.chainId?.toString() || 'unknown',
      alert_type: alert.type,
      severity: alert.severity
    });
  }

  /**
   * Record health check metrics
   */
  recordHealthCheck(config: RPCConfig, metrics: HealthMetrics): void {
    const labels = {
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    // Record health check count
    this.healthChecksTotal.inc({
      ...labels,
      status: metrics.isOnline ? 'success' : 'failure'
    });

    // Record health check duration
    const duration = metrics.responseTime;
    this.healthCheckDurationHistogram.observe(labels, duration);
    this.healthCheckDurationSummary.observe(labels, duration);

    // Update status gauges
    this.rpcStatus.set({ ...labels }, metrics.isOnline ? 1 : 0);
    this.rpcResponseTime.set({ ...labels }, metrics.responseTime);
    
    if (metrics.blockNumber !== null) {
      this.rpcBlockNumber.set({ ...labels }, metrics.blockNumber);
    }
    
    if (metrics.gasPrice !== null) {
      this.rpcGasPrice.set({ ...labels }, parseFloat(metrics.gasPrice));
    }
    
    if (metrics.peerCount !== null) {
      this.rpcPeerCount.set({ ...labels }, metrics.peerCount);
    }
  }

  /**
   * Update RPC uptime and error count
   */
  updateRPCStats(config: RPCConfig, uptime: number, errorCount: number): void {
    const labels = {
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    this.rpcUptime.set({ ...labels }, uptime);
    this.rpcErrorCount.set({ ...labels }, errorCount);
  }

  /**
   * Update system-wide metrics
   */
  updateSystemMetrics(onlineRPCs: number, offlineRPCs: number, totalAlerts: number): void {
    this.systemOnlineRPCs.set(onlineRPCs);
    this.systemOfflineRPCs.set(offlineRPCs);
    this.systemTotalAlerts.set(totalAlerts);
  }

  /**
   * Record RPC response time for histogram and summary
   */
  recordRPCResponseTime(config: RPCConfig, responseTime: number): void {
    const labels = {
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    this.rpcResponseTimeHistogram.observe(labels, responseTime);
    this.rpcResponseTimeSummary.observe(labels, responseTime);
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics();
    } catch (error) {
      metricsLogger.error('Failed to generate metrics', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get metrics registry for custom metrics
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics(): void {
    this.registry.clear();
    this.initializeMetrics();
    metricsLogger.info('All metrics have been reset');
  }

  /**
   * Get metrics metadata
   */
  getMetricsMetadata(): {
    totalMetrics: number;
    counters: number;
    gauges: number;
    histograms: number;
    summaries: number;
  } {
    const metrics = this.registry.getMetricsAsArray();
    const counters = metrics.filter(m => m instanceof Counter).length;
    const gauges = metrics.filter(m => m instanceof Gauge).length;
    const histograms = metrics.filter(m => m instanceof Histogram).length;
    const summaries = metrics.filter(m => m instanceof Summary).length;

    return {
      totalMetrics: metrics.length,
      counters,
      gauges,
      histograms,
      summaries
    };
  }
}
