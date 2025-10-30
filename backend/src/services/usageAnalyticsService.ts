import { UsageMetrics, Organization, OrganizationStats } from '../types/organization';
import { usageLogger } from '../utils/logger';

export interface UsageReport {
  orgId: string;
  period: {
    start: Date;
    end: Date;
  };
  apiCalls: {
    total: number;
    byEndpoint: Record<string, number>;
    byUser: Record<string, number>;
    byStatus: Record<string, number>;
  };
  dataTransfer: {
    total: number; // bytes
    inbound: number;
    outbound: number;
    byUser: Record<string, number>;
  };
  storage: {
    total: number; // bytes
    byType: Record<string, number>;
    byUser: Record<string, number>;
  };
  rpcRequests: {
    total: number;
    byRPC: Record<string, number>;
    byNetwork: Record<string, number>;
    byMethod: Record<string, number>;
  };
  alerts: {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    resolved: number;
    unresolved: number;
  };
  costs: {
    total: number; // USD
    byType: Record<string, number>;
    breakdown: {
      api: number;
      storage: number;
      dataTransfer: number;
      rpc: number;
    };
  };
}

export interface BillingInfo {
  orgId: string;
  plan: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  usage: {
    apiCalls: number;
    dataTransfer: number; // bytes
    storage: number; // bytes
    rpcRequests: number;
  };
  limits: {
    apiCalls: number;
    dataTransfer: number;
    storage: number;
    rpcRequests: number;
  };
  costs: {
    base: number;
    overage: number;
    total: number;
  };
  nextBillingDate: Date;
}

export class UsageAnalyticsService {
  private usageData: Map<string, UsageMetrics[]> = new Map();
  private billingData: Map<string, BillingInfo> = new Map();
  private costRates: Map<string, number> = new Map();

  constructor() {
    this.initializeCostRates();
    usageLogger.info('UsageAnalyticsService initialized');
  }

  private initializeCostRates(): void {
    // Cost rates per unit (in USD)
    this.costRates.set('api_call', 0.0001); // $0.0001 per API call
    this.costRates.set('data_transfer_gb', 0.01); // $0.01 per GB
    this.costRates.set('storage_gb_month', 0.05); // $0.05 per GB per month
    this.costRates.set('rpc_request', 0.00005); // $0.00005 per RPC request
  }

  // Record usage metrics
  async recordUsage(orgId: string, userId: string, usage: Partial<UsageMetrics>): Promise<void> {
    const key = `${orgId}:${userId}`;
    const existing = this.usageData.get(key) || [];

    const usageRecord: UsageMetrics = {
      orgId,
      userId,
      timestamp: new Date(),
      apiCalls: 0,
      dataTransfer: 0,
      storageUsed: 0,
      rpcRequests: 0,
      alertsGenerated: 0,
      customMetrics: 0,
      ...usage,
    };

    existing.push(usageRecord);

    // Keep only last 1000 records per user
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.usageData.set(key, existing);
    usageLogger.debug('Usage recorded', { orgId, userId, usage });
  }

  // Get usage report for an organization
  async getUsageReport(orgId: string, period: { start: Date; end: Date }): Promise<UsageReport> {
    const allUsage: UsageMetrics[] = [];

    // Collect all usage data for the organization
    for (const [key, usage] of this.usageData.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = usage.filter(u =>
          u.timestamp >= period.start && u.timestamp <= period.end,
        );
        allUsage.push(...filtered);
      }
    }

    // Aggregate data
    const apiCalls = this.aggregateAPICalls(allUsage);
    const dataTransfer = this.aggregateDataTransfer(allUsage);
    const storage = this.aggregateStorage(allUsage);
    const rpcRequests = this.aggregateRPCRequests(allUsage);
    const alerts = this.aggregateAlerts(allUsage);
    const costs = this.calculateCosts(orgId, allUsage);

    return {
      orgId,
      period,
      apiCalls,
      dataTransfer,
      storage,
      rpcRequests,
      alerts,
      costs,
    };
  }

  private aggregateAPICalls(usage: UsageMetrics[]): UsageReport['apiCalls'] {
    const total = usage.reduce((sum, u) => sum + u.apiCalls, 0);
    const byEndpoint: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    // This would be enhanced with actual endpoint and status data
    usage.forEach(u => {
      byUser[u.userId || 'unknown'] = (byUser[u.userId || 'unknown'] || 0) + u.apiCalls;
    });

    return {
      total,
      byEndpoint,
      byUser,
      byStatus,
    };
  }

  private aggregateDataTransfer(usage: UsageMetrics[]): UsageReport['dataTransfer'] {
    const total = usage.reduce((sum, u) => sum + u.dataTransfer, 0);
    const byUser: Record<string, number> = {};

    usage.forEach(u => {
      byUser[u.userId || 'unknown'] = (byUser[u.userId || 'unknown'] || 0) + u.dataTransfer;
    });

    return {
      total,
      inbound: total * 0.6, // Assume 60% inbound
      outbound: total * 0.4, // Assume 40% outbound
      byUser,
    };
  }

  private aggregateStorage(usage: UsageMetrics[]): UsageReport['storage'] {
    const total = usage.reduce((sum, u) => sum + u.storageUsed, 0);
    const byType: Record<string, number> = {
      metrics: total * 0.5,
      logs: total * 0.3,
      alerts: total * 0.2,
    };
    const byUser: Record<string, number> = {};

    usage.forEach(u => {
      byUser[u.userId || 'unknown'] = (byUser[u.userId || 'unknown'] || 0) + u.storageUsed;
    });

    return {
      total,
      byType,
      byUser,
    };
  }

  private aggregateRPCRequests(usage: UsageMetrics[]): UsageReport['rpcRequests'] {
    const total = usage.reduce((sum, u) => sum + u.rpcRequests, 0);
    const byRPC: Record<string, number> = {};
    const byNetwork: Record<string, number> = {};
    const byMethod: Record<string, number> = {};

    // This would be enhanced with actual RPC data
    return {
      total,
      byRPC,
      byNetwork,
      byMethod,
    };
  }

  private aggregateAlerts(usage: UsageMetrics[]): UsageReport['alerts'] {
    const total = usage.reduce((sum, u) => sum + u.alertsGenerated, 0);
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    // This would be enhanced with actual alert data
    return {
      total,
      bySeverity,
      byType,
      resolved: total * 0.8, // Assume 80% resolved
      unresolved: total * 0.2,
    };
  }

  private calculateCosts(orgId: string, usage: UsageMetrics[]): UsageReport['costs'] {
    const apiCalls = usage.reduce((sum, u) => sum + u.apiCalls, 0);
    const dataTransfer = usage.reduce((sum, u) => sum + u.dataTransfer, 0);
    const storage = usage.reduce((sum, u) => sum + u.storageUsed, 0);
    const rpcRequests = usage.reduce((sum, u) => sum + u.rpcRequests, 0);

    const apiCost = apiCalls * (this.costRates.get('api_call') || 0);
    const dataTransferCost = (dataTransfer / (1024 * 1024 * 1024)) * (this.costRates.get('data_transfer_gb') || 0);
    const storageCost = (storage / (1024 * 1024 * 1024)) * (this.costRates.get('storage_gb_month') || 0);
    const rpcCost = rpcRequests * (this.costRates.get('rpc_request') || 0);

    const total = apiCost + dataTransferCost + storageCost + rpcCost;

    return {
      total,
      byType: {
        api: apiCost,
        dataTransfer: dataTransferCost,
        storage: storageCost,
        rpc: rpcCost,
      },
      breakdown: {
        api: apiCost,
        storage: storageCost,
        dataTransfer: dataTransferCost,
        rpc: rpcCost,
      },
    };
  }

  // Generate billing information
  async generateBillingInfo(orgId: string, org: Organization): Promise<BillingInfo> {
    const currentPeriod = this.getCurrentBillingPeriod();
    const usage = await this.getUsageForPeriod(orgId, currentPeriod);

    const limits = org.limits;
    const costs = this.calculateBillingCosts(org, usage);

    return {
      orgId,
      plan: org.plan,
      currentPeriod,
      usage: {
        apiCalls: usage.apiCalls,
        dataTransfer: usage.dataTransfer,
        storage: usage.storage,
        rpcRequests: usage.rpcRequests,
      },
      limits: {
        apiCalls: limits.apiCallsPerMonth,
        dataTransfer: limits.dataRetentionDays * 1024 * 1024 * 1024, // Rough estimate
        storage: limits.dataRetentionDays * 1024 * 1024 * 1024, // Rough estimate
        rpcRequests: limits.maxRPCs * 1000, // Rough estimate
      },
      costs,
      nextBillingDate: this.getNextBillingDate(),
    };
  }

  private getCurrentBillingPeriod(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }

  private getNextBillingDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  private async getUsageForPeriod(orgId: string, period: { start: Date; end: Date }): Promise<{
    apiCalls: number;
    dataTransfer: number;
    storage: number;
    rpcRequests: number;
  }> {
    const allUsage: UsageMetrics[] = [];

    for (const [key, usage] of this.usageData.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = usage.filter(u =>
          u.timestamp >= period.start && u.timestamp <= period.end,
        );
        allUsage.push(...filtered);
      }
    }

    return {
      apiCalls: allUsage.reduce((sum, u) => sum + u.apiCalls, 0),
      dataTransfer: allUsage.reduce((sum, u) => sum + u.dataTransfer, 0),
      storage: allUsage.reduce((sum, u) => sum + u.storageUsed, 0),
      rpcRequests: allUsage.reduce((sum, u) => sum + u.rpcRequests, 0),
    };
  }

  private calculateBillingCosts(org: Organization, usage: {
    apiCalls: number;
    dataTransfer: number;
    storage: number;
    rpcRequests: number;
  }): BillingInfo['costs'] {
    const planRates = this.getPlanRates(org.plan);
    const limits = org.limits;

    // Calculate base cost
    const baseCost = planRates.base;

    // Calculate overage costs
    const apiOverage = Math.max(0, usage.apiCalls - limits.apiCallsPerMonth) * planRates.apiCall;
    const dataOverage = Math.max(0, (usage.dataTransfer / (1024 * 1024 * 1024)) - (limits.dataRetentionDays * 10)) * planRates.dataTransfer;
    const storageOverage = Math.max(0, (usage.storage / (1024 * 1024 * 1024)) - (limits.dataRetentionDays * 10)) * planRates.storage;

    const overage = apiOverage + dataOverage + storageOverage;
    const total = baseCost + overage;

    return {
      base: baseCost,
      overage,
      total,
    };
  }

  private getPlanRates(plan: string): {
    base: number;
    apiCall: number;
    dataTransfer: number;
    storage: number;
  } {
    switch (plan) {
    case 'free':
      return {
        base: 0,
        apiCall: 0.0001,
        dataTransfer: 0.01,
        storage: 0.05,
      };
    case 'pro':
      return {
        base: 29,
        apiCall: 0.00005,
        dataTransfer: 0.005,
        storage: 0.03,
      };
    case 'enterprise':
      return {
        base: 99,
        apiCall: 0.00001,
        dataTransfer: 0.001,
        storage: 0.01,
      };
    default:
      return {
        base: 0,
        apiCall: 0.0001,
        dataTransfer: 0.01,
        storage: 0.05,
      };
    }
  }

  // Check if organization is within limits
  async checkLimits(orgId: string, org: Organization): Promise<{
    withinLimits: boolean;
    violations: string[];
    warnings: string[];
  }> {
    const currentUsage = await this.getUsageForPeriod(orgId, this.getCurrentBillingPeriod());
    const limits = org.limits;
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check API call limits
    if (currentUsage.apiCalls > limits.apiCallsPerMonth) {
      violations.push(`API calls exceeded: ${currentUsage.apiCalls}/${limits.apiCallsPerMonth}`);
    } else if (currentUsage.apiCalls > limits.apiCallsPerMonth * 0.8) {
      warnings.push(`API calls approaching limit: ${currentUsage.apiCalls}/${limits.apiCallsPerMonth}`);
    }

    // Check data transfer limits (rough estimate)
    const dataTransferGB = currentUsage.dataTransfer / (1024 * 1024 * 1024);
    const dataLimitGB = limits.dataRetentionDays * 10; // Rough estimate
    if (dataTransferGB > dataLimitGB) {
      violations.push(`Data transfer exceeded: ${dataTransferGB.toFixed(2)}GB/${dataLimitGB}GB`);
    } else if (dataTransferGB > dataLimitGB * 0.8) {
      warnings.push(`Data transfer approaching limit: ${dataTransferGB.toFixed(2)}GB/${dataLimitGB}GB`);
    }

    return {
      withinLimits: violations.length === 0,
      violations,
      warnings,
    };
  }

  // Get usage trends
  async getUsageTrends(orgId: string, days: number = 30): Promise<{
    dates: string[];
    apiCalls: number[];
    dataTransfer: number[];
    storage: number[];
    costs: number[];
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const dates: string[] = [];
    const apiCalls: number[] = [];
    const dataTransfer: number[] = [];
    const storage: number[] = [];
    const costs: number[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const dayUsage = await this.getUsageForPeriod(orgId, { start: date, end: nextDate });
      const dayCosts = this.calculateCosts(orgId, [dayUsage as any]);

      dates.push(date.toISOString().split('T')[0]);
      apiCalls.push(dayUsage.apiCalls);
      dataTransfer.push(dayUsage.dataTransfer);
      storage.push(dayUsage.storage);
      costs.push(dayCosts.total);
    }

    return {
      dates,
      apiCalls,
      dataTransfer,
      storage,
      costs,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    for (const [key, usage] of this.usageData.entries()) {
      const filtered = usage.filter(u => u.timestamp > cutoffDate);
      this.usageData.set(key, filtered);
    }

    usageLogger.info('Usage analytics cleanup completed');
  }
}
