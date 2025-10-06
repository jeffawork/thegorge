import { RPCConfig, RPCStatus, RPCHealthMetrics, Alert, HealthCheckResult } from '../types';
import { Web3Service } from './web3Service';
import { AlertService } from './alertService';
import { MetricsService } from './metricsService';
import { UserService } from './userService';
import { monitoringLogger } from '../utils/logger';
import { Server as SocketIOServer } from 'socket.io';

export class MonitoringService {
  private web3Service: Web3Service;
  private alertService: AlertService;
  private metricsService: MetricsService;
  private userService: UserService;
  private rpcStatuses: Map<string, RPCStatus> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private io: SocketIOServer | null = null;

  constructor(io?: SocketIOServer) {
    this.web3Service = new Web3Service();
    this.metricsService = new MetricsService();
    this.alertService = new AlertService(this.metricsService, io);
    this.userService = new UserService();
    this.io = io || null;
    
    monitoringLogger.info('MonitoringService initialized');
  }

  /**
   * Start monitoring for a specific user
   */
  async startMonitoring(userId: string): Promise<void> {
    if (this.isMonitoring) {
      monitoringLogger.warn('Monitoring is already active');
      return;
    }

    const userRPCs = this.userService.getUserRPCs(userId);
    if (userRPCs.length === 0) {
      monitoringLogger.info('No RPCs configured for user', { userId });
      return;
    }

    // Initialize RPC statuses for the user
    for (const rpcConfig of userRPCs) {
      if (rpcConfig.enabled) {
        await this.initializeRPCStatus(rpcConfig);
      }
    }

    this.isMonitoring = true;
    const interval = 30000; // 30 seconds

    monitoringLogger.info('Starting RPC monitoring', { 
      userId, 
      rpcCount: userRPCs.filter(rpc => rpc.enabled).length, 
      interval 
    });

    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks(userId);
    }, interval);

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // 1 hour

    monitoringLogger.info('Monitoring started', { interval: `${interval}ms` });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isMonitoring = false;
    monitoringLogger.info('RPC monitoring stopped');
  }

  /**
   * Initialize RPC status for a new RPC configuration
   */
  private async initializeRPCStatus(rpcConfig: RPCConfig): Promise<void> {
    const rpcId = rpcConfig.id;
    
    // Add RPC to Web3Service
    const success = await this.web3Service.addRPC(rpcConfig);
    if (!success) {
      monitoringLogger.error('Failed to add RPC to Web3Service', { 
        rpcId, 
        name: rpcConfig.name 
      });
      return;
    }

    // Create initial status
    const initialStatus: RPCStatus = {
      id: rpcId,
      rpcId: rpcId,
      isOnline: false,
      lastCheck: new Date(),
      responseTime: 0,
      blockNumber: 0,
      peerCount: 0,
      gasPrice: '0',
      isSyncing: false,
      network: rpcConfig.network,
      chainId: rpcConfig.chainId,
      history: []
    };

    this.rpcStatuses.set(rpcId, initialStatus);
    monitoringLogger.info('RPC status initialized', { 
      rpcId, 
      name: rpcConfig.name 
    });
  }

  /**
   * Perform health checks for all user RPCs
   */
  private async performHealthChecks(userId: string): Promise<void> {
    const userRPCs = this.userService.getUserRPCs(userId);
    const enabledRPCs = userRPCs.filter(rpc => rpc.enabled);

    monitoringLogger.debug('Performing health checks', { 
      userId, 
      rpcCount: enabledRPCs.length 
    });

    for (const rpcConfig of enabledRPCs) {
      try {
        const healthResult = await this.web3Service.performHealthCheck(rpcConfig.id);
        await this.updateRPCStatus(rpcConfig, healthResult);
        
        // Record metrics
        this.metricsService.recordHealthCheck(rpcConfig, healthResult);
        
        // Check for alerts
        await this.checkForAlerts(rpcConfig, healthResult);
        
      } catch (error) {
        monitoringLogger.error('Health check failed', { 
          rpcId: rpcConfig.id, 
          name: rpcConfig.name, 
          error: error instanceof Error ? error.message : String(error) 
        });
        
        // Update status as offline
        const offlineResult: HealthCheckResult = {
          isOnline: false,
          responseTime: 0,
          blockNumber: 0,
          peerCount: 0,
          gasPrice: '0',
          isSyncing: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          network: rpcConfig.network,
          chainId: rpcConfig.chainId
        };
        
        await this.updateRPCStatus(rpcConfig, offlineResult);
      }
    }
  }

  /**
   * Update RPC status with health check results
   */
  private async updateRPCStatus(rpcConfig: RPCConfig, healthResult: HealthCheckResult): Promise<void> {
    const rpcId = rpcConfig.id;
    const currentStatus = this.rpcStatuses.get(rpcId);
    
    if (!currentStatus) {
      monitoringLogger.warn('RPC status not found for update', { rpcId });
      return;
    }

    // Create health metrics entry
    const healthMetrics: RPCHealthMetrics = {
      timestamp: new Date(),
      responseTime: healthResult.responseTime,
      blockNumber: healthResult.blockNumber,
      peerCount: healthResult.peerCount,
      gasPrice: healthResult.gasPrice,
      isSyncing: healthResult.isSyncing,
      syncProgress: healthResult.syncProgress,
      errorMessage: healthResult.errorMessage || '',
      isOnline: healthResult.isOnline
    };

    // Update status
    const updatedStatus: RPCStatus = {
      ...currentStatus,
      isOnline: healthResult.isOnline,
      lastCheck: new Date(),
      responseTime: healthResult.responseTime,
      blockNumber: healthResult.blockNumber,
      peerCount: healthResult.peerCount,
      gasPrice: healthResult.gasPrice,
      isSyncing: healthResult.isSyncing,
      syncProgress: healthResult.syncProgress,
      syncCurrentBlock: healthResult.syncCurrentBlock,
      syncHighestBlock: healthResult.syncHighestBlock,
      syncStartingBlock: healthResult.syncStartingBlock,
      errorMessage: healthResult.errorMessage || '',
      history: [
        healthMetrics,
        ...currentStatus.history.slice(0, (rpcConfig.maxHistoryEntries || 100) - 1)
      ]
    };

    this.rpcStatuses.set(rpcId, updatedStatus);
    
    // Emit WebSocket event for RPC status update
    if (this.io) {
      this.io.emit('rpcStatusUpdate', rpcId, updatedStatus.isOnline ? 'online' : 'offline');
    }
    
    // Update metrics
    this.metricsService.updateRPCStats(rpcConfig, updatedStatus);
    
    monitoringLogger.debug('RPC status updated', { 
      rpcId, 
      name: rpcConfig.name, 
      isOnline: healthResult.isOnline,
      responseTime: healthResult.responseTime 
    });
  }

  /**
   * Check for alerts based on health check results
   */
  private async checkForAlerts(rpcConfig: RPCConfig, healthResult: HealthCheckResult): Promise<void> {
    const thresholds = rpcConfig.alertThresholds;
    if (!thresholds) return;

    // Check response time
    if (healthResult.responseTime > (thresholds.responseTime || 5000)) {
      await this.alertService.addAlert({
        rpcId: rpcConfig.id,
        type: 'response_time',
        severity: this.determineSeverity(healthResult.responseTime, thresholds.responseTime || 5000),
        message: `High response time: ${healthResult.responseTime}ms`,
        details: { responseTime: healthResult.responseTime, threshold: thresholds.responseTime },
        timestamp: new Date(),
        resolved: false,
        network: rpcConfig.network,
        chainId: rpcConfig.chainId
      });
    }

    // Check peer count
    if (healthResult.peerCount < (thresholds.peerCount || 5)) {
      await this.alertService.addAlert({
        rpcId: rpcConfig.id,
        type: 'peer_count',
        severity: this.determineSeverity(thresholds.peerCount || 5, healthResult.peerCount, true),
        message: `Low peer count: ${healthResult.peerCount}`,
        details: { peerCount: healthResult.peerCount, threshold: thresholds.peerCount },
        timestamp: new Date(),
        resolved: false,
        network: rpcConfig.network,
        chainId: rpcConfig.chainId
      });
    }

    // Check if offline
    if (!healthResult.isOnline) {
      await this.alertService.addAlert({
        rpcId: rpcConfig.id,
        type: 'offline',
        severity: 'critical',
        message: 'RPC endpoint is offline',
        details: { errorMessage: healthResult.errorMessage },
        timestamp: new Date(),
        resolved: false,
        network: rpcConfig.network,
        chainId: rpcConfig.chainId
      });
    }

    // Check sync status
    if (healthResult.isSyncing && healthResult.syncProgress !== undefined) {
      if (healthResult.syncProgress < 95) {
        await this.alertService.addAlert({
          rpcId: rpcConfig.id,
          type: 'sync_lag',
          severity: this.determineSeverity(100 - healthResult.syncProgress, 5),
          message: `Node is syncing: ${healthResult.syncProgress}% complete`,
          details: { 
            syncProgress: healthResult.syncProgress,
            currentBlock: healthResult.syncCurrentBlock,
            highestBlock: healthResult.syncHighestBlock
          },
          timestamp: new Date(),
          resolved: false,
          network: rpcConfig.network,
          chainId: rpcConfig.chainId
        });
      }
    }
  }

  /**
   * Determine alert severity based on threshold comparison
   */
  private determineSeverity(value: number, threshold: number, isLowerBetter: boolean = false): 'low' | 'medium' | 'high' | 'critical' {
    if (isLowerBetter) {
      // For metrics where lower is better (like peer count)
      if (value <= threshold * 0.5) return 'critical';
      if (value <= threshold * 0.7) return 'high';
      if (value <= threshold * 0.9) return 'medium';
      return 'low';
    } else {
      // For metrics where higher is better (like response time)
      if (value >= threshold * 2) return 'critical';
      if (value >= threshold * 1.5) return 'high';
      if (value >= threshold * 1.2) return 'medium';
      return 'low';
    }
  }

  /**
   * Get all RPC statuses for a user
   */
  getRPCStatuses(userId: string): RPCStatus[] {
    const userRPCs = this.userService.getUserRPCs(userId);
    return userRPCs
      .filter(rpc => rpc.enabled)
      .map(rpc => this.rpcStatuses.get(rpc.id))
      .filter((status): status is RPCStatus => status !== undefined);
  }

  /**
   * Get specific RPC status
   */
  getRPCStatus(rpcId: string): RPCStatus | undefined {
    return this.rpcStatuses.get(rpcId);
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(userId: string): {
    totalRPCs: number;
    onlineRPCs: number;
    offlineRPCs: number;
    averageResponseTime: number;
    alertsCount: number;
  } {
    const statuses = this.getRPCStatuses(userId);
    const totalRPCs = statuses.length;
    const onlineRPCs = statuses.filter(s => s.isOnline).length;
    const offlineRPCs = totalRPCs - onlineRPCs;
    
    const responseTimes = statuses
      .filter(s => s.isOnline)
      .map(s => s.responseTime);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const alertsCount = this.alertService.getActiveAlertsCount(userId);

    return {
      totalRPCs,
      onlineRPCs,
      offlineRPCs,
      averageResponseTime,
      alertsCount
    };
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [rpcId, status] of this.rpcStatuses) {
      const oldEntries = status.history.filter(
        entry => now.getTime() - entry.timestamp.getTime() > maxAge
      );
      
      if (oldEntries.length > 0) {
        status.history = status.history.filter(
          entry => now.getTime() - entry.timestamp.getTime() <= maxAge
        );
        
        monitoringLogger.debug('Cleaned up old history entries', { 
          rpcId, 
          removed: oldEntries.length 
        });
      }
    }
  }

  /**
   * Get service instances
   */
  getAlertService(): AlertService {
    return this.alertService;
  }

  getMetricsService(): MetricsService {
    return this.metricsService;
  }

  getUserService(): UserService {
    return this.userService;
  }

  getWeb3Service(): Web3Service {
    return this.web3Service;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopMonitoring();
    this.web3Service.cleanup();
    this.alertService.cleanup();
    this.metricsService.cleanup();
    this.userService.cleanup();
    this.rpcStatuses.clear();
    monitoringLogger.info('Monitoring service cleanup completed');
  }
}
