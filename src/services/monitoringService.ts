import { EventEmitter } from 'events';
import { RPCConfig, RPCStatus, HealthMetrics, Alert, SystemMetrics, NetworkDistribution, PerformanceStats } from '../types';
import { Web3Service } from './web3Service';
import { AlertService } from './alertService';
import { MetricsService } from './metricsService';
import { monitorLogger } from '../utils/logger';
import { generateId, calculateUptime, calculateAverage } from '../utils/helpers';
import { config } from '../config';

export class MonitoringService extends EventEmitter {
  private web3Service: Web3Service;
  private alertService: AlertService;
  private metricsService: MetricsService;
  private rpcStatuses: Map<string, RPCStatus> = new Map();
  private healthHistory: Map<string, HealthMetrics[]> = new Map();
  private performanceStats: Map<string, PerformanceStats> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private startTime: Date = new Date();
  private isMonitoring = false;

  constructor() {
    super();
    this.web3Service = new Web3Service(config.rpcConfigs);
    this.metricsService = new MetricsService();
    this.alertService = new AlertService(this.metricsService);
    this.initializeRPCStatuses();
    this.setupCleanupInterval();
  }

  /**
   * Initialize RPC status objects
   */
  private initializeRPCStatuses(): void {
    for (const rpcConfig of config.rpcConfigs) {
      const rpcId = this.generateRPCId(rpcConfig);
      const status: RPCStatus = {
        id: rpcId,
        name: rpcConfig.name,
        url: rpcConfig.url,
        chainId: rpcConfig.chainId,
        network: rpcConfig.network,
        isOnline: false,
        responseTime: 0,
        blockNumber: null,
        gasPrice: null,
        peerCount: null,
        lastChecked: new Date(),
        errorCount: 0,
        uptime: 100
      };
      
      this.rpcStatuses.set(rpcId, status);
      this.healthHistory.set(rpcId, []);
      this.initializePerformanceStats(rpcId);
    }

    monitorLogger.info('RPC statuses initialized', { count: config.rpcConfigs.length });
  }

  /**
   * Initialize performance statistics
   */
  private initializePerformanceStats(rpcId: string): void {
    this.performanceStats.set(rpcId, {
      rpcId,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      successRate: 100,
      totalRequests: 0,
      timeframe: '1h'
    });
  }

  /**
   * Start monitoring all RPCs
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      monitorLogger.warn('Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    monitorLogger.info('Starting RPC monitoring...', {
      rpcCount: config.rpcConfigs.length,
      interval: config.monitoringInterval
    });
    
    // Initial health check
    await this.performHealthChecks();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        monitorLogger.error('Error during scheduled health check', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, config.monitoringInterval);

    this.emit('monitoringStarted', {
      timestamp: new Date(),
      rpcCount: config.rpcConfigs.length
    });

    monitorLogger.info(`Monitoring started with ${config.monitoringInterval}ms interval`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      monitorLogger.warn('Monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    monitorLogger.info('RPC monitoring stopped');
    this.emit('monitoringStopped', { timestamp: new Date() });
  }

  /**
   * Perform health checks on all RPCs
   */
  private async performHealthChecks(): Promise<void> {
    const startTime = Date.now();
    monitorLogger.debug('Starting health checks', { rpcCount: config.rpcConfigs.length });

    const promises = config.rpcConfigs.map(async (rpcConfig) => {
      try {
        const metrics = await this.web3Service.performHealthCheck(rpcConfig);
        
        // Record metrics for Prometheus
        this.metricsService.recordHealthCheck(rpcConfig, metrics);
        
        this.updateRPCStatus(metrics, rpcConfig);
        this.updatePerformanceStats(metrics);
        this.checkForAlerts(metrics, rpcConfig);
        return { success: true, rpcId: metrics.rpcId };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        monitorLogger.error(`Error checking ${rpcConfig.name}`, {
          error: errorMessage,
          rpcUrl: rpcConfig.url
        });
        return { success: false, rpcId: this.generateRPCId(rpcConfig), error: errorMessage };
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    const totalTime = Date.now() - startTime;
    monitorLogger.debug('Health checks completed', {
      totalTime,
      successCount,
      totalRPCs: config.rpcConfigs.length
    });

    // Emit system metrics update
    this.emit('healthCheck', this.getSystemMetrics());
  }

  /**
   * Update RPC status based on health metrics
   */
  private updateRPCStatus(metrics: HealthMetrics, config: RPCConfig): void {
    const rpcId = metrics.rpcId;
    const currentStatus = this.rpcStatuses.get(rpcId);
    
    if (!currentStatus) {
      monitorLogger.warn('RPC status not found for update', { rpcId });
      return;
    }

    // Update health history
    const history = this.healthHistory.get(rpcId) || [];
    history.push(metrics);
    
    // Keep only recent entries
    if (history.length > (config.maxHistoryEntries || 100)) {
      history.splice(0, history.length - (config.maxHistoryEntries || 100));
    }
    this.healthHistory.set(rpcId, history);

    // Calculate statistics
    const recentHistory = history.slice(-20); // Last 20 checks for uptime calculation
    const downCount = recentHistory.filter(h => !h.isOnline).length;
    const uptime = recentHistory.length > 0 ? ((recentHistory.length - downCount) / recentHistory.length) * 100 : 100;
    
    // Update status
    const wasOnline = currentStatus.isOnline;
    const updatedStatus: RPCStatus = {
      ...currentStatus,
      isOnline: metrics.isOnline,
      responseTime: metrics.responseTime,
      blockNumber: metrics.blockNumber,
      gasPrice: metrics.gasPrice,
      peerCount: metrics.peerCount,
      lastChecked: metrics.timestamp,
      errorCount: metrics.isOnline ? currentStatus.errorCount : currentStatus.errorCount + 1,
      uptime: Math.max(0, Math.min(100, uptime)),
      errorMessage: metrics.errorMessage || '',
      syncStatus: metrics.syncStatus
    };

    this.rpcStatuses.set(rpcId, updatedStatus);

    // Emit status update event
    this.emit('statusUpdate', updatedStatus);

    // Log significant status changes
    if (wasOnline !== metrics.isOnline) {
      monitorLogger.info(`RPC status changed: ${config.name}`, {
        rpcId,
        wasOnline,
        isOnline: metrics.isOnline,
        responseTime: metrics.responseTime
      });
    }
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(metrics: HealthMetrics): void {
    const stats = this.performanceStats.get(metrics.rpcId);
    if (!stats) return;

    const history = this.healthHistory.get(metrics.rpcId) || [];
    const recentHistory = history.slice(-50); // Last 50 checks
    
    const responseTimes = recentHistory
      .filter(h => h.isOnline)
      .map(h => h.responseTime);

    const successfulRequests = recentHistory.filter(h => h.isOnline).length;
    const totalRequests = recentHistory.length;

    const updatedStats: PerformanceStats = {
      ...stats,
      avgResponseTime: responseTimes.length > 0 ? calculateAverage(responseTimes) : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100,
      totalRequests: stats.totalRequests + 1
    };

    this.performanceStats.set(metrics.rpcId, updatedStats);
  }

  /**
   * Check for alerts based on health metrics
   */
  private checkForAlerts(metrics: HealthMetrics, config: RPCConfig): void {
    // Response time alert
    if (metrics.isOnline && metrics.responseTime > (config.alertThresholds?.responseTime || 5000)) {
      this.alertService.addAlert({
        id: generateId(),
        rpcId: metrics.rpcId,
        rpcName: config.name,
        type: 'slow_response',
        message: `RPC ${config.name} has slow response time: ${metrics.responseTime}ms (threshold: ${config.alertThresholds?.responseTime || 5000}ms)`,
        severity: metrics.responseTime > (config.alertThresholds?.responseTime || 5000) * 2 ? 'high' : 'medium',
        timestamp: new Date(),
        resolved: false,
        network: config.network,
        chainId: config.chainId
      });
    }

    // Error rate alert
    const history = this.healthHistory.get(metrics.rpcId) || [];
    const recentHistory = history.slice(-20);
    if (recentHistory.length >= 5) {
      const errorCount = recentHistory.filter(h => !h.isOnline).length;
      const errorRate = (errorCount / recentHistory.length) * 100;
      
      if (errorRate >= (config.alertThresholds?.errorRate || 10) && recentHistory.length >= 5) {
        this.alertService.addAlert({
          id: generateId(),
          rpcId: metrics.rpcId,
          rpcName: config.name,
          type: 'high_error_rate',
          message: `RPC ${config.name} has high error rate: ${errorRate.toFixed(1)}% (threshold: ${config.alertThresholds?.errorRate || 10}%)`,
          severity: errorRate > 50 ? 'critical' : 'high',
          timestamp: new Date(),
          resolved: false,
          network: config.network,
          chainId: config.chainId
        });
      }
    }

    // Peer count alert
    if (metrics.peerCount !== null && metrics.peerCount < (config.alertThresholds?.peerCount || 5)) {
      this.alertService.addAlert({
        id: generateId(),
        rpcId: metrics.rpcId,
        rpcName: config.name,
        type: 'peer_count_low',
        message: `RPC ${config.name} has low peer count: ${metrics.peerCount} (threshold: ${config.alertThresholds?.peerCount || 5})`,
        severity: metrics.peerCount === 0 ? 'critical' : 'medium',
        timestamp: new Date(),
        resolved: false,
        network: config.network,
        chainId: config.chainId
      });
    }
  }

  /**
   * Setup cleanup interval for old data
   */
  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, config.cleanupIntervalHours * 60 * 60 * 1000);
  }

  /**
   * Cleanup old data
   */
  private performCleanup(): void {
    monitorLogger.info('Starting data cleanup');

    let totalCleaned = 0;

    // Clean up old health history
    for (const [rpcId, history] of this.healthHistory) {
      const originalLength = history.length;
      if (originalLength > config.maxHistoryEntries) {
        history.splice(0, originalLength - config.maxHistoryEntries);
        totalCleaned += originalLength - config.maxHistoryEntries;
      }
    }

    // Clean up old alerts
    const alertsCleaned = this.alertService.clearOldAlerts(config.cleanupIntervalHours);
    totalCleaned += alertsCleaned;

    monitorLogger.info('Data cleanup completed', { 
      totalCleaned,
      alertsCleaned
    });
  }

  /**
   * Generate RPC ID
   */
  private generateRPCId(config: RPCConfig): string {
    return `${config.network}-${config.chainId}`;
  }

  // Public getters and utility methods

  getRPCStatuses(): RPCStatus[] {
    return Array.from(this.rpcStatuses.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getRPCStatus(rpcId: string): RPCStatus | undefined {
    return this.rpcStatuses.get(rpcId);
  }

  getHealthHistory(rpcId: string, limit: number = 50): HealthMetrics[] {
    const history = this.healthHistory.get(rpcId) || [];
    return history.slice(-limit);
  }

  getPerformanceStats(rpcId?: string): PerformanceStats[] {
    if (rpcId) {
      const stats = this.performanceStats.get(rpcId);
      return stats ? [stats] : [];
    }
    return Array.from(this.performanceStats.values());
  }

  /**
   * Get alert service instance
   */
  getAlertService(): AlertService {
    return this.alertService;
  }

  /**
   * Get metrics service instance
   */
  getMetricsService(): MetricsService {
    return this.metricsService;
  }

  getSystemMetrics(): SystemMetrics {
    const statuses = this.getRPCStatuses();
    const onlineRPCs = statuses.filter(s => s.isOnline);
    const offlineRPCs = statuses.filter(s => !s.isOnline);
    
    // Calculate average response time for online RPCs
    const totalResponseTime = onlineRPCs.reduce((sum, s) => sum + s.responseTime, 0);
    const averageResponseTime = onlineRPCs.length > 0 ? totalResponseTime / onlineRPCs.length : 0;

    // Calculate network distribution
    const networkDistribution: NetworkDistribution[] = this.calculateNetworkDistribution(statuses);

    return {
      totalRPCs: statuses.length,
      onlineRPCs: onlineRPCs.length,
      offlineRPCs: offlineRPCs.length,
      averageResponseTime: Math.round(averageResponseTime),
      alertsCount: this.alertService.getActiveAlerts().length,
      lastUpdate: new Date(),
      networkDistribution
    };
  }

  /**
   * Calculate network distribution statistics
   */
  private calculateNetworkDistribution(statuses: RPCStatus[]): NetworkDistribution[] {
    const networks = new Map<string, { total: number; online: number; offline: number }>();

    for (const status of statuses) {
      const existing = networks.get(status.network) || { total: 0, online: 0, offline: 0 };
      existing.total++;
      if (status.isOnline) {
        existing.online++;
      } else {
        existing.offline++;
      }
      networks.set(status.network, existing);
    }

    return Array.from(networks.entries()).map(([network, stats]) => ({
      network,
      ...stats
    }));
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopMonitoring();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.web3Service.cleanup();
    this.removeAllListeners();
    
    monitorLogger.info('Monitoring service cleanup completed');
  }
}
