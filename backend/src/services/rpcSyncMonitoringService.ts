import { rpcLogger } from '../utils/logger';

export interface RPCSyncState {
  rpcId: string;
  orgId: string;
  chainId: number;
  syncStatus: 'synced' | 'syncing' | 'behind' | 'stuck' | 'unknown';
  currentBlock: number;
  latestBlock: number;
  syncProgress: number; // 0-100
  blocksBehind: number;
  syncSpeed: number; // blocks per second
  estimatedTimeToSync: number; // seconds
  lastSyncUpdate: Date;
  syncStartTime?: Date;
  syncEndTime?: Date;
  totalSyncTime?: number; // seconds
  isHealthy: boolean;
  healthScore: number; // 0-100
  issues: string[];
  metadata: {
    nodeVersion?: string;
    networkId?: number;
    protocolVersion?: string;
    clientType?: string;
  };
}

export interface RPCType {
  id: string;
  name: string;
  description: string;
  capabilities: {
    archive: boolean; // Can query historical state
    full: boolean; // Full node with complete blockchain
    light: boolean; // Light client
    validator: boolean; // Can participate in consensus
    rpc: boolean; // Provides RPC endpoints
    websocket: boolean; // Supports WebSocket connections
    tracing: boolean; // Supports transaction tracing
    debug: boolean; // Supports debug APIs
  };
  storageRequirements: {
    minGB: number;
    recommendedGB: number;
    maxGB?: number;
  };
  performance: {
    maxRPS: number; // Requests per second
    avgResponseTime: number; // milliseconds
    maxConcurrentConnections: number;
  };
  supportedChains: number[];
  isActive: boolean;
}

export interface SyncAlert {
  id: string;
  rpcId: string;
  orgId: string;
  type: 'sync_behind' | 'sync_stuck' | 'sync_slow' | 'sync_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentBlock: number;
  latestBlock: number;
  blocksBehind: number;
  syncProgress: number;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class RPCSyncMonitoringService {
  private syncStates: Map<string, RPCSyncState> = new Map();
  private rpcTypes: Map<string, RPCType> = new Map();
  private syncAlerts: Map<string, SyncAlert[]> = new Map();
  private syncHistory: Map<string, RPCSyncState[]> = new Map();

  constructor() {
    this.initializeRPCTypes();
    this.startSyncMonitoring();
    rpcLogger.info('RPCSyncMonitoringService initialized');
  }

  private initializeRPCTypes(): void {
    const types: RPCType[] = [
      {
        id: 'archive-full',
        name: 'Archive Full Node',
        description: 'Complete blockchain with all historical state',
        capabilities: {
          archive: true,
          full: true,
          light: false,
          validator: false,
          rpc: true,
          websocket: true,
          tracing: true,
          debug: true,
        },
        storageRequirements: {
          minGB: 1000,
          recommendedGB: 2000,
          maxGB: 5000,
        },
        performance: {
          maxRPS: 1000,
          avgResponseTime: 200,
          maxConcurrentConnections: 100,
        },
        supportedChains: [1, 137, 56, 42161, 10],
        isActive: true,
      },
      {
        id: 'full-node',
        name: 'Full Node',
        description: 'Complete blockchain without full historical state',
        capabilities: {
          archive: false,
          full: true,
          light: false,
          validator: false,
          rpc: true,
          websocket: true,
          tracing: false,
          debug: false,
        },
        storageRequirements: {
          minGB: 500,
          recommendedGB: 1000,
          maxGB: 2000,
        },
        performance: {
          maxRPS: 2000,
          avgResponseTime: 100,
          maxConcurrentConnections: 200,
        },
        supportedChains: [1, 137, 56, 42161, 10],
        isActive: true,
      },
      {
        id: 'light-client',
        name: 'Light Client',
        description: 'Minimal blockchain data, relies on full nodes',
        capabilities: {
          archive: false,
          full: false,
          light: true,
          validator: false,
          rpc: true,
          websocket: false,
          tracing: false,
          debug: false,
        },
        storageRequirements: {
          minGB: 10,
          recommendedGB: 50,
          maxGB: 100,
        },
        performance: {
          maxRPS: 500,
          avgResponseTime: 500,
          maxConcurrentConnections: 50,
        },
        supportedChains: [1, 137, 56, 42161, 10],
        isActive: true,
      },
      {
        id: 'validator-node',
        name: 'Validator Node',
        description: 'Participates in consensus and provides RPC',
        capabilities: {
          archive: false,
          full: true,
          light: false,
          validator: true,
          rpc: true,
          websocket: true,
          tracing: true,
          debug: true,
        },
        storageRequirements: {
          minGB: 800,
          recommendedGB: 1500,
          maxGB: 3000,
        },
        performance: {
          maxRPS: 1500,
          avgResponseTime: 150,
          maxConcurrentConnections: 150,
        },
        supportedChains: [1, 137, 56, 42161, 10],
        isActive: true,
      },
    ];

    types.forEach(type => {
      this.rpcTypes.set(type.id, type);
    });
  }

  private startSyncMonitoring(): void {
    // Monitor sync states every 30 seconds
    setInterval(() => {
      this.monitorAllSyncStates();
    }, 30 * 1000);
  }

  // Monitor sync state for an RPC
  async monitorRPCSync(rpcId: string, orgId: string, chainId: number, rpcUrl: string): Promise<RPCSyncState> {
    try {
      const syncState = await this.checkSyncState(rpcId, orgId, chainId, rpcUrl);
      this.syncStates.set(rpcId, syncState);

      // Store in history
      const history = this.syncHistory.get(rpcId) || [];
      history.push(syncState);
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      this.syncHistory.set(rpcId, history);

      // Check for alerts
      await this.checkSyncAlerts(syncState);

      rpcLogger.debug('RPC sync state monitored', {
        rpcId,
        orgId,
        syncStatus: syncState.syncStatus,
        syncProgress: syncState.syncProgress,
        blocksBehind: syncState.blocksBehind,
      });

      return syncState;
    } catch (error) {
      rpcLogger.error('Failed to monitor RPC sync', { rpcId, orgId, error: (error as Error).message });
      throw error;
    }
  }

  // Check sync state by querying the RPC
  private async checkSyncState(rpcId: string, orgId: string, chainId: number, rpcUrl: string): Promise<RPCSyncState> {
    // Simulate RPC queries - in real implementation, you'd make actual RPC calls
    const currentBlock = Math.floor(Math.random() * 1000000) + 18000000;
    const latestBlock = currentBlock + Math.floor(Math.random() * 100) - 50; // ±50 blocks
    const blocksBehind = Math.max(0, latestBlock - currentBlock);
    const syncProgress = Math.min(100, (currentBlock / latestBlock) * 100);

    let syncStatus: RPCSyncState['syncStatus'];
    if (blocksBehind === 0) {
      syncStatus = 'synced';
    } else if (blocksBehind < 10) {
      syncStatus = 'syncing';
    } else if (blocksBehind < 100) {
      syncStatus = 'behind';
    } else {
      syncStatus = 'stuck';
    }

    const syncSpeed = Math.random() * 10 + 1; // 1-11 blocks per second
    const estimatedTimeToSync = blocksBehind / syncSpeed;

    const healthScore = this.calculateHealthScore(syncStatus, blocksBehind, syncProgress);
    const issues = this.identifyIssues(syncStatus, blocksBehind, syncProgress);

    return {
      rpcId,
      orgId,
      chainId,
      syncStatus,
      currentBlock,
      latestBlock,
      syncProgress,
      blocksBehind,
      syncSpeed,
      estimatedTimeToSync,
      lastSyncUpdate: new Date(),
      isHealthy: healthScore > 70,
      healthScore,
      issues,
      metadata: {
        nodeVersion: 'v1.12.0',
        networkId: chainId,
        protocolVersion: '0x5',
        clientType: 'geth',
      },
    };
  }

  // Calculate health score based on sync status
  private calculateHealthScore(syncStatus: string, blocksBehind: number, syncProgress: number): number {
    let score = 100;

    switch (syncStatus) {
    case 'synced':
      score = 100;
      break;
    case 'syncing':
      score = 90 - (blocksBehind * 0.5);
      break;
    case 'behind':
      score = 70 - (blocksBehind * 0.3);
      break;
    case 'stuck':
      score = 30;
      break;
    case 'unknown':
      score = 0;
      break;
    }

    // Adjust based on sync progress
    if (syncProgress < 95) {
      score -= (95 - syncProgress) * 0.5;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Identify sync issues
  private identifyIssues(syncStatus: string, blocksBehind: number, syncProgress: number): string[] {
    const issues: string[] = [];

    if (syncStatus === 'stuck') {
      issues.push('RPC appears to be stuck and not syncing');
    }

    if (blocksBehind > 100) {
      issues.push(`RPC is significantly behind (${blocksBehind} blocks)`);
    }

    if (syncProgress < 90) {
      issues.push(`Sync progress is low (${syncProgress.toFixed(1)}%)`);
    }

    if (syncStatus === 'unknown') {
      issues.push('Unable to determine sync status');
    }

    return issues;
  }

  // Check for sync alerts
  private async checkSyncAlerts(syncState: RPCSyncState): Promise<void> {
    const alerts: SyncAlert[] = [];

    // Check for sync behind alert
    if (syncState.blocksBehind > 50) {
      alerts.push({
        id: `sync-behind-${syncState.rpcId}-${Date.now()}`,
        rpcId: syncState.rpcId,
        orgId: syncState.orgId,
        type: 'sync_behind',
        severity: syncState.blocksBehind > 200 ? 'critical' : 'high',
        message: `RPC is ${syncState.blocksBehind} blocks behind`,
        currentBlock: syncState.currentBlock,
        latestBlock: syncState.latestBlock,
        blocksBehind: syncState.blocksBehind,
        syncProgress: syncState.syncProgress,
        timestamp: new Date(),
        isAcknowledged: false,
      });
    }

    // Check for sync stuck alert
    if (syncState.syncStatus === 'stuck') {
      alerts.push({
        id: `sync-stuck-${syncState.rpcId}-${Date.now()}`,
        rpcId: syncState.rpcId,
        orgId: syncState.orgId,
        type: 'sync_stuck',
        severity: 'critical',
        message: 'RPC sync appears to be stuck',
        currentBlock: syncState.currentBlock,
        latestBlock: syncState.latestBlock,
        blocksBehind: syncState.blocksBehind,
        syncProgress: syncState.syncProgress,
        timestamp: new Date(),
        isAcknowledged: false,
      });
    }

    // Check for slow sync alert
    if (syncState.syncSpeed < 1 && syncState.blocksBehind > 10) {
      alerts.push({
        id: `sync-slow-${syncState.rpcId}-${Date.now()}`,
        rpcId: syncState.rpcId,
        orgId: syncState.orgId,
        type: 'sync_slow',
        severity: 'medium',
        message: `Sync speed is very slow (${syncState.syncSpeed.toFixed(2)} blocks/sec)`,
        currentBlock: syncState.currentBlock,
        latestBlock: syncState.latestBlock,
        blocksBehind: syncState.blocksBehind,
        syncProgress: syncState.syncProgress,
        timestamp: new Date(),
        isAcknowledged: false,
      });
    }

    // Store alerts
    for (const alert of alerts) {
      const key = `${syncState.orgId}:${syncState.rpcId}`;
      const existing = this.syncAlerts.get(key) || [];
      existing.push(alert);
      this.syncAlerts.set(key, existing);

      rpcLogger.warn('Sync alert created', {
        alertId: alert.id,
        rpcId: alert.rpcId,
        type: alert.type,
        severity: alert.severity,
      });
    }
  }

  // Get sync state for RPC
  getSyncState(rpcId: string): RPCSyncState | null {
    return this.syncStates.get(rpcId) || null;
  }

  // Get all sync states for organization
  getSyncStatesForOrganization(orgId: string): RPCSyncState[] {
    return Array.from(this.syncStates.values()).filter(state => state.orgId === orgId);
  }

  // Get sync history for RPC
  getSyncHistory(rpcId: string, limit: number = 100): RPCSyncState[] {
    const history = this.syncHistory.get(rpcId) || [];
    return history.slice(-limit);
  }

  // Get sync alerts for organization
  getSyncAlerts(orgId: string, rpcId?: string, limit: number = 100): SyncAlert[] {
    const allAlerts: SyncAlert[] = [];

    for (const [key, alerts] of this.syncAlerts.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        if (!rpcId || key.includes(`:${rpcId}`)) {
          allAlerts.push(...alerts);
        }
      }
    }

    return allAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Acknowledge sync alert
  async acknowledgeSyncAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    for (const [key, alerts] of this.syncAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        rpcLogger.info('Sync alert acknowledged', { alertId, acknowledgedBy });
        return true;
      }
    }
    return false;
  }

  // Get RPC types
  getRPCTypes(): RPCType[] {
    return Array.from(this.rpcTypes.values());
  }

  // Get RPC type by ID
  getRPCType(typeId: string): RPCType | null {
    return this.rpcTypes.get(typeId) || null;
  }

  // Classify RPC type based on capabilities
  classifyRPCType(rpcUrl: string, chainId: number): Promise<RPCType | null> {
    // This would make actual RPC calls to determine capabilities
    // For now, return a random type
    const types = Array.from(this.rpcTypes.values());
    const supportedTypes = types.filter(type =>
      type.supportedChains.includes(chainId) && type.isActive,
    );

    return Promise.resolve(
      supportedTypes[Math.floor(Math.random() * supportedTypes.length)] || null,
    );
  }

  // Get sync statistics
  getSyncStatistics(orgId: string): {
    totalRPCs: number;
    syncedRPCs: number;
    syncingRPCs: number;
    behindRPCs: number;
    stuckRPCs: number;
    averageHealthScore: number;
    totalAlerts: number;
    unacknowledgedAlerts: number;
  } {
    const states = this.getSyncStatesForOrganization(orgId);
    const alerts = this.getSyncAlerts(orgId);

    const stats = {
      totalRPCs: states.length,
      syncedRPCs: states.filter(s => s.syncStatus === 'synced').length,
      syncingRPCs: states.filter(s => s.syncStatus === 'syncing').length,
      behindRPCs: states.filter(s => s.syncStatus === 'behind').length,
      stuckRPCs: states.filter(s => s.syncStatus === 'stuck').length,
      averageHealthScore: states.length > 0
        ? states.reduce((sum, s) => sum + s.healthScore, 0) / states.length
        : 0,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: alerts.filter(a => !a.isAcknowledged).length,
    };

    return stats;
  }

  // Monitor all sync states
  private async monitorAllSyncStates(): Promise<void> {
    for (const [rpcId, syncState] of this.syncStates.entries()) {
      try {
        // In real implementation, you'd have the RPC URL stored
        await this.monitorRPCSync(rpcId, syncState.orgId, syncState.chainId, '');
      } catch (error) {
        rpcLogger.error('Failed to monitor sync state', { rpcId, error: (error as Error).message });
      }
    }
  }

  // Get service statistics
  getServiceStats(): {
    totalSyncStates: number;
    totalAlerts: number;
    totalHistoryRecords: number;
    averageHealthScore: number;
    } {
    let totalAlerts = 0;
    for (const alerts of this.syncAlerts.values()) {
      totalAlerts += alerts.length;
    }

    let totalHistoryRecords = 0;
    for (const history of this.syncHistory.values()) {
      totalHistoryRecords += history.length;
    }

    const allStates = Array.from(this.syncStates.values());
    const averageHealthScore = allStates.length > 0
      ? allStates.reduce((sum, s) => sum + s.healthScore, 0) / allStates.length
      : 0;

    return {
      totalSyncStates: this.syncStates.size,
      totalAlerts,
      totalHistoryRecords,
      averageHealthScore,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    let cleaned = 0;

    for (const [key, history] of this.syncHistory.entries()) {
      const filtered = history.filter(h => h.lastSyncUpdate > cutoffDate);
      if (filtered.length !== history.length) {
        this.syncHistory.set(key, filtered);
        cleaned += history.length - filtered.length;
      }
    }

    for (const [key, alerts] of this.syncAlerts.entries()) {
      const filtered = alerts.filter(a => a.timestamp > cutoffDate);
      if (filtered.length !== alerts.length) {
        this.syncAlerts.set(key, filtered);
        cleaned += alerts.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      rpcLogger.info('RPC sync monitoring cleanup completed', { cleaned });
    }
  }
}
