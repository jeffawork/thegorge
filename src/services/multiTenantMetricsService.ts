import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { RPCConfig, RPCHealthMetrics, Alert } from '../types';
import type { Organization, User, UsageMetrics } from '../types/organization';
import { metricsLogger } from '../utils/logger';

export class MultiTenantMetricsService {
  private registry: Registry;
  private organizationService: any; // Will be injected
  
  // Multi-tenant RPC metrics
  private orgRPCRequestsTotal: Counter<string>;
  private orgRPCErrorsTotal: Counter<string>;
  private orgRPCResponseTime: Histogram<string>;
  private orgRPCBlockNumber: Gauge<string>;
  private orgRPCGasPrice: Gauge<string>;
  private orgRPCPeerCount: Gauge<string>;
  private orgRPCOlineStatus: Gauge<string>;
  private orgRPCSyncProgress: Gauge<string>;
  
  // User-level metrics
  private userAPICallsTotal: Counter<string>;
  private userDataTransfer: Counter<string>;
  private userStorageUsed: Gauge<string>;
  private userActiveSessions: Gauge<string>;
  
  // Organization-level metrics
  private orgActiveUsers: Gauge<string>;
  private orgTotalRPCs: Gauge<string>;
  private orgActiveRPCs: Gauge<string>;
  private orgTotalAlerts: Gauge<string>;
  private orgActiveAlerts: Gauge<string>;
  private orgUptime: Gauge<string>;
  private orgSLACompliance: Gauge<string>;
  
  // Usage and billing metrics
  private orgUsageAPI: Counter<string>;
  private orgUsageDataTransfer: Counter<string>;
  private orgUsageStorage: Gauge<string>;
  private orgUsageCost: Gauge<string>;
  
  // Alert metrics with multi-tenancy
  private orgAlertsTotal: Counter<string>;
  private orgActiveAlerts: Gauge<string>;
  private orgAlertResolutionTime: Histogram<string>;
  
  // System-wide metrics
  private systemOrganizations: Gauge<string>;
  private systemTotalUsers: Gauge<string>;
  private systemActiveUsers: Gauge<string>;
  private systemTotalRPCs: Gauge<string>;
  private systemActiveRPCs: Gauge<string>;
  private systemUptime: Gauge<string>;

  constructor(organizationService?: any) {
    this.organizationService = organizationService;
    this.registry = new Registry();
    this.initializeMetrics();
    metricsLogger.info('MultiTenantMetricsService initialized');
  }

  private initializeMetrics(): void {
    // Multi-tenant RPC metrics
    this.orgRPCRequestsTotal = new Counter({
      name: 'org_rpc_requests_total',
      help: 'Total RPC requests per organization',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id', 'method']
    });

    this.orgRPCErrorsTotal = new Counter({
      name: 'org_rpc_errors_total',
      help: 'Total RPC errors per organization',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id', 'error_type']
    });

    this.orgRPCResponseTime = new Histogram({
      name: 'org_rpc_response_time_seconds',
      help: 'RPC response time per organization',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
    });

    this.orgRPCBlockNumber = new Gauge({
      name: 'org_rpc_block_number',
      help: 'Current block number per organization RPC',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.orgRPCGasPrice = new Gauge({
      name: 'org_rpc_gas_price_wei',
      help: 'Current gas price per organization RPC',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.orgRPCPeerCount = new Gauge({
      name: 'org_rpc_peer_count',
      help: 'Current peer count per organization RPC',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.orgRPCOlineStatus = new Gauge({
      name: 'org_rpc_online_status',
      help: 'Online status per organization RPC (1 = online, 0 = offline)',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    this.orgRPCSyncProgress = new Gauge({
      name: 'org_rpc_sync_progress_percent',
      help: 'Sync progress per organization RPC',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id']
    });

    // User-level metrics
    this.userAPICallsTotal = new Counter({
      name: 'user_api_calls_total',
      help: 'Total API calls per user',
      labelNames: ['org_id', 'user_id', 'endpoint', 'method', 'status_code']
    });

    this.userDataTransfer = new Counter({
      name: 'user_data_transfer_bytes',
      help: 'Data transfer per user in bytes',
      labelNames: ['org_id', 'user_id', 'direction'] // direction: 'in' or 'out'
    });

    this.userStorageUsed = new Gauge({
      name: 'user_storage_used_bytes',
      help: 'Storage used per user in bytes',
      labelNames: ['org_id', 'user_id', 'storage_type'] // storage_type: 'metrics', 'logs', 'alerts'
    });

    this.userActiveSessions = new Gauge({
      name: 'user_active_sessions',
      help: 'Active sessions per user',
      labelNames: ['org_id', 'user_id']
    });

    // Organization-level metrics
    this.orgActiveUsers = new Gauge({
      name: 'org_active_users',
      help: 'Active users per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgTotalRPCs = new Gauge({
      name: 'org_total_rpcs',
      help: 'Total RPCs per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgActiveRPCs = new Gauge({
      name: 'org_active_rpcs',
      help: 'Active RPCs per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgTotalAlerts = new Gauge({
      name: 'org_total_alerts',
      help: 'Total alerts per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgActiveAlerts = new Gauge({
      name: 'org_active_alerts',
      help: 'Active alerts per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgUptime = new Gauge({
      name: 'org_uptime_percent',
      help: 'Uptime percentage per organization',
      labelNames: ['org_id', 'org_name', 'plan']
    });

    this.orgSLACompliance = new Gauge({
      name: 'org_sla_compliance_percent',
      help: 'SLA compliance percentage per organization',
      labelNames: ['org_id', 'org_name', 'plan', 'sla_type'] // sla_type: 'uptime', 'response_time', 'error_rate'
    });

    // Usage and billing metrics
    this.orgUsageAPI = new Counter({
      name: 'org_usage_api_calls',
      help: 'API usage per organization',
      labelNames: ['org_id', 'org_name', 'plan', 'period'] // period: 'hour', 'day', 'month'
    });

    this.orgUsageDataTransfer = new Counter({
      name: 'org_usage_data_transfer_bytes',
      help: 'Data transfer usage per organization',
      labelNames: ['org_id', 'org_name', 'plan', 'period']
    });

    this.orgUsageStorage = new Gauge({
      name: 'org_usage_storage_bytes',
      help: 'Storage usage per organization',
      labelNames: ['org_id', 'org_name', 'plan', 'storage_type']
    });

    this.orgUsageCost = new Gauge({
      name: 'org_usage_cost_usd',
      help: 'Usage cost per organization in USD',
      labelNames: ['org_id', 'org_name', 'plan', 'cost_type'] // cost_type: 'api', 'storage', 'data_transfer'
    });

    // Alert metrics with multi-tenancy
    this.orgAlertsTotal = new Counter({
      name: 'org_alerts_total',
      help: 'Total alerts per organization',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id', 'alert_type', 'severity']
    });

    this.orgActiveAlerts = new Gauge({
      name: 'org_active_alerts',
      help: 'Active alerts per organization',
      labelNames: ['org_id', 'org_name', 'rpc_id', 'rpc_name', 'network', 'chain_id', 'alert_type', 'severity']
    });

    this.orgAlertResolutionTime = new Histogram({
      name: 'org_alert_resolution_time_seconds',
      help: 'Alert resolution time per organization',
      labelNames: ['org_id', 'org_name', 'alert_type', 'severity'],
      buckets: [60, 300, 900, 1800, 3600, 7200, 14400]
    });

    // System-wide metrics
    this.systemOrganizations = new Gauge({
      name: 'system_organizations_total',
      help: 'Total number of organizations'
    });

    this.systemTotalUsers = new Gauge({
      name: 'system_users_total',
      help: 'Total number of users'
    });

    this.systemActiveUsers = new Gauge({
      name: 'system_users_active',
      help: 'Number of active users'
    });

    this.systemTotalRPCs = new Gauge({
      name: 'system_rpcs_total',
      help: 'Total number of RPCs across all organizations'
    });

    this.systemActiveRPCs = new Gauge({
      name: 'system_rpcs_active',
      help: 'Number of active RPCs across all organizations'
    });

    this.systemUptime = new Gauge({
      name: 'system_uptime_seconds',
      help: 'System uptime in seconds'
    });

    // Register all metrics
    this.registerAllMetrics();
    
    // Start uptime tracking
    this.startUptimeTracking();
  }

  private registerAllMetrics(): void {
    const metrics = [
      this.orgRPCRequestsTotal,
      this.orgRPCErrorsTotal,
      this.orgRPCResponseTime,
      this.orgRPCBlockNumber,
      this.orgRPCGasPrice,
      this.orgRPCPeerCount,
      this.orgRPCOlineStatus,
      this.orgRPCSyncProgress,
      this.userAPICallsTotal,
      this.userDataTransfer,
      this.userStorageUsed,
      this.userActiveSessions,
      this.orgActiveUsers,
      this.orgTotalRPCs,
      this.orgActiveRPCs,
      this.orgTotalAlerts,
      this.orgActiveAlerts,
      this.orgUptime,
      this.orgSLACompliance,
      this.orgUsageAPI,
      this.orgUsageDataTransfer,
      this.orgUsageStorage,
      this.orgUsageCost,
      this.orgAlertsTotal,
      this.orgActiveAlerts,
      this.orgAlertResolutionTime,
      this.systemOrganizations,
      this.systemTotalUsers,
      this.systemActiveUsers,
      this.systemTotalRPCs,
      this.systemActiveRPCs,
      this.systemUptime
    ];

    metrics.forEach(metric => this.registry.registerMetric(metric));
  }

  private startUptimeTracking(): void {
    const startTime = Date.now();
    setInterval(() => {
      this.systemUptime.set((Date.now() - startTime) / 1000);
    }, 1000);
  }

  // RPC Metrics with Organization Context
  recordRPCRequest(orgId: string, orgName: string, config: RPCConfig, method: string = 'health_check'): void {
    this.orgRPCRequestsTotal.inc({
      org_id: orgId,
      org_name: orgName,
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      method
    });
  }

  recordRPCError(orgId: string, orgName: string, config: RPCConfig, errorType: string): void {
    this.orgRPCErrorsTotal.inc({
      org_id: orgId,
      org_name: orgName,
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString(),
      error_type: errorType
    });
  }

  recordRPCHealthCheck(orgId: string, orgName: string, config: RPCConfig, healthResult: any): void {
    const labels = {
      org_id: orgId,
      org_name: orgName,
      rpc_id: config.id,
      rpc_name: config.name,
      network: config.network,
      chain_id: config.chainId.toString()
    };

    // Record response time
    if (healthResult.responseTime) {
      this.orgRPCResponseTime.observe(labels, healthResult.responseTime / 1000);
    }

    // Record block number
    if (healthResult.blockNumber) {
      this.orgRPCBlockNumber.set(labels, healthResult.blockNumber);
    }

    // Record gas price
    if (healthResult.gasPrice) {
      const gasPrice = BigInt(healthResult.gasPrice);
      this.orgRPCGasPrice.set(labels, Number(gasPrice));
    }

    // Record peer count
    if (healthResult.peerCount !== undefined) {
      this.orgRPCPeerCount.set(labels, healthResult.peerCount);
    }

    // Record online status
    this.orgRPCOlineStatus.set(labels, healthResult.isOnline ? 1 : 0);

    // Record sync progress
    if (healthResult.syncProgress !== undefined) {
      this.orgRPCSyncProgress.set(labels, healthResult.syncProgress);
    }
  }

  // User-level Metrics
  recordUserAPICall(orgId: string, userId: string, endpoint: string, method: string, statusCode: number): void {
    this.userAPICallsTotal.inc({
      org_id: orgId,
      user_id: userId,
      endpoint,
      method,
      status_code: statusCode.toString()
    });
  }

  recordUserDataTransfer(orgId: string, userId: string, bytes: number, direction: 'in' | 'out'): void {
    this.userDataTransfer.inc({
      org_id: orgId,
      user_id: userId,
      direction
    }, bytes);
  }

  updateUserStorage(orgId: string, userId: string, storageType: string, bytes: number): void {
    this.userStorageUsed.set({
      org_id: orgId,
      user_id: userId,
      storage_type: storageType
    }, bytes);
  }

  updateUserActiveSessions(orgId: string, userId: string, sessionCount: number): void {
    this.userActiveSessions.set({
      org_id: orgId,
      user_id: userId
    }, sessionCount);
  }

  // Organization-level Metrics
  updateOrganizationStats(org: Organization, stats: any): void {
    const labels = {
      org_id: org.id,
      org_name: org.name,
      plan: org.plan
    };

    this.orgActiveUsers.set(labels, stats.activeUsers || 0);
    this.orgTotalRPCs.set(labels, stats.totalRPCs || 0);
    this.orgActiveRPCs.set(labels, stats.activeRPCs || 0);
    this.orgTotalAlerts.set(labels, stats.totalAlerts || 0);
    this.orgActiveAlerts.set(labels, stats.activeAlerts || 0);
    this.orgUptime.set(labels, stats.uptime || 0);
  }

  updateSLACompliance(orgId: string, orgName: string, plan: string, slaType: string, compliance: number): void {
    this.orgSLACompliance.set({
      org_id: orgId,
      org_name: orgName,
      plan,
      sla_type: slaType
    }, compliance);
  }

  // Usage and Billing Metrics
  recordUsage(orgId: string, orgName: string, plan: string, usage: UsageMetrics, period: string = 'hour'): void {
    this.orgUsageAPI.inc({
      org_id: orgId,
      org_name: orgName,
      plan,
      period
    }, usage.apiCalls);

    this.orgUsageDataTransfer.inc({
      org_id: orgId,
      org_name: orgName,
      plan,
      period
    }, usage.dataTransfer);

    this.orgUsageStorage.set({
      org_id: orgId,
      org_name: orgName,
      plan,
      storage_type: 'total'
    }, usage.storageUsed);
  }

  updateUsageCost(orgId: string, orgName: string, plan: string, costType: string, cost: number): void {
    this.orgUsageCost.set({
      org_id: orgId,
      org_name: orgName,
      plan,
      cost_type: costType
    }, cost);
  }

  // Alert Metrics with Organization Context
  recordAlert(orgId: string, orgName: string, alert: Alert): void {
    const labels = {
      org_id: orgId,
      org_name: orgName,
      rpc_id: alert.rpcId,
      rpc_name: 'unknown', // We don't have rpcName in the Alert interface
      network: alert.network,
      chain_id: alert.chainId.toString(),
      alert_type: alert.type,
      severity: alert.severity
    };

    this.orgAlertsTotal.inc(labels);
    
    if (!alert.resolved) {
      this.orgActiveAlerts.inc(labels);
    } else {
      this.orgActiveAlerts.dec(labels);
      
      // Record resolution time if available
      if (alert.resolvedAt) {
        const resolutionTime = (alert.resolvedAt.getTime() - alert.timestamp.getTime()) / 1000;
        this.orgAlertResolutionTime.observe({
          org_id: orgId,
          org_name: orgName,
          alert_type: alert.type,
          severity: alert.severity
        }, resolutionTime);
      }
    }
  }

  // System-wide Metrics
  updateSystemMetrics(stats: {
    totalOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    totalRPCs: number;
    activeRPCs: number;
  }): void {
    this.systemOrganizations.set(stats.totalOrganizations);
    this.systemTotalUsers.set(stats.totalUsers);
    this.systemActiveUsers.set(stats.activeUsers);
    this.systemTotalRPCs.set(stats.totalRPCs);
    this.systemActiveRPCs.set(stats.activeRPCs);
  }

  // Utility Methods
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }

  resetMetrics(): void {
    this.registry.clear();
    this.initializeMetrics();
    metricsLogger.info('MultiTenantMetricsService reset');
  }

  cleanup(): void {
    this.registry.clear();
    metricsLogger.info('MultiTenantMetricsService cleanup completed');
  }
}
