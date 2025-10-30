import { Organization, UsageMetrics } from '../types/organization';
import { costLogger } from '../utils/logger';

export interface CostItem {
  id: string;
  orgId: string;
  userId?: string;
  resourceType: 'api' | 'storage' | 'data_transfer' | 'rpc' | 'compute' | 'bandwidth';
  resourceId?: string;
  quantity: number;
  unit: string;
  unitCost: number; // Cost per unit in USD
  totalCost: number; // Total cost in USD
  timestamp: Date;
  period: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
}

export interface CostBreakdown {
  orgId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalCost: number;
  byResourceType: Record<string, number>;
  byUser: Record<string, number>;
  byResource: Record<string, number>;
  trends: {
    daily: Array<{ date: string; cost: number }>;
    weekly: Array<{ week: string; cost: number }>;
    monthly: Array<{ month: string; cost: number }>;
  };
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

export interface CostAlert {
  id: string;
  orgId: string;
  type: 'budget_exceeded' | 'unusual_spike' | 'cost_threshold' | 'resource_inefficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentCost: number;
  threshold: number;
  resourceType?: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface Budget {
  orgId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number; // Budget amount in USD
  alertThresholds: {
    warning: number; // Percentage (e.g., 80 for 80%)
    critical: number; // Percentage (e.g., 100 for 100%)
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CostTrackingService {
  private costItems: Map<string, CostItem[]> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private costAlerts: Map<string, CostAlert[]> = new Map();
  private costRates: Map<string, number> = new Map();
  private usageData: Map<string, UsageMetrics[]> = new Map();

  constructor() {
    this.initializeCostRates();
    this.startCostMonitoring();
    costLogger.info('CostTrackingService initialized');
  }

  private initializeCostRates(): void {
    // Cost rates per unit (in USD)
    this.costRates.set('api_call', 0.0001); // $0.0001 per API call
    this.costRates.set('data_transfer_gb', 0.01); // $0.01 per GB
    this.costRates.set('storage_gb_month', 0.05); // $0.05 per GB per month
    this.costRates.set('rpc_request', 0.00005); // $0.00005 per RPC request
    this.costRates.set('compute_hour', 0.10); // $0.10 per compute hour
    this.costRates.set('bandwidth_gb', 0.02); // $0.02 per GB bandwidth
  }

  private startCostMonitoring(): void {
    // Check costs and generate alerts every hour
    setInterval(() => {
      this.checkCostAlerts();
    }, 60 * 60 * 1000);
  }

  // Record cost item
  async recordCostItem(costItem: Omit<CostItem, 'id' | 'totalCost' | 'timestamp'>): Promise<CostItem> {
    const totalCost = costItem.quantity * costItem.unitCost;
    const item: CostItem = {
      ...costItem,
      id: this.generateCostId(),
      totalCost,
      timestamp: new Date(),
    };

    const key = `${costItem.orgId}:${costItem.userId || 'global'}`;
    const existing = this.costItems.get(key) || [];
    existing.push(item);
    this.costItems.set(key, existing);

    costLogger.debug('Cost item recorded', {
      orgId: costItem.orgId,
      resourceType: costItem.resourceType,
      quantity: costItem.quantity,
      totalCost,
    });

    return item;
  }

  // Record usage and calculate costs
  async recordUsage(orgId: string, userId: string, usage: UsageMetrics): Promise<void> {
    const key = `${orgId}:${userId}`;
    const existing = this.usageData.get(key) || [];
    existing.push(usage);
    this.usageData.set(key, existing);

    // Calculate costs from usage
    await this.calculateCostsFromUsage(orgId, userId, usage);
  }

  private async calculateCostsFromUsage(orgId: string, userId: string, usage: UsageMetrics): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const periodEnd = now;

    // API call costs
    if (usage.apiCalls > 0) {
      await this.recordCostItem({
        orgId,
        userId,
        resourceType: 'api',
        quantity: usage.apiCalls,
        unit: 'calls',
        unitCost: this.costRates.get('api_call') || 0,
        period: { start: periodStart, end: periodEnd },
      });
    }

    // Data transfer costs
    if (usage.dataTransfer > 0) {
      const dataTransferGB = usage.dataTransfer / (1024 * 1024 * 1024);
      await this.recordCostItem({
        orgId,
        userId,
        resourceType: 'data_transfer',
        quantity: dataTransferGB,
        unit: 'GB',
        unitCost: this.costRates.get('data_transfer_gb') || 0,
        period: { start: periodStart, end: periodEnd },
      });
    }

    // Storage costs
    if (usage.storageUsed > 0) {
      const storageGB = usage.storageUsed / (1024 * 1024 * 1024);
      await this.recordCostItem({
        orgId,
        userId,
        resourceType: 'storage',
        quantity: storageGB,
        unit: 'GB',
        unitCost: this.costRates.get('storage_gb_month') || 0,
        period: { start: periodStart, end: periodEnd },
      });
    }

    // RPC request costs
    if (usage.rpcRequests > 0) {
      await this.recordCostItem({
        orgId,
        userId,
        resourceType: 'rpc',
        quantity: usage.rpcRequests,
        unit: 'requests',
        unitCost: this.costRates.get('rpc_request') || 0,
        period: { start: periodStart, end: periodEnd },
      });
    }
  }

  // Get cost breakdown for organization
  async getCostBreakdown(
    orgId: string,
    period: { start: Date; end: Date },
  ): Promise<CostBreakdown> {
    const allCosts: CostItem[] = [];

    // Collect all costs for the organization
    for (const [key, costs] of this.costItems.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = costs.filter(c =>
          c.timestamp >= period.start && c.timestamp <= period.end,
        );
        allCosts.push(...filtered);
      }
    }

    const totalCost = allCosts.reduce((sum, c) => sum + c.totalCost, 0);

    // Breakdown by resource type
    const byResourceType: Record<string, number> = {};
    allCosts.forEach(cost => {
      byResourceType[cost.resourceType] = (byResourceType[cost.resourceType] || 0) + cost.totalCost;
    });

    // Breakdown by user
    const byUser: Record<string, number> = {};
    allCosts.forEach(cost => {
      const userId = cost.userId || 'system';
      byUser[userId] = (byUser[userId] || 0) + cost.totalCost;
    });

    // Breakdown by resource
    const byResource: Record<string, number> = {};
    allCosts.forEach(cost => {
      const resourceKey = cost.resourceId || cost.resourceType;
      byResource[resourceKey] = (byResource[resourceKey] || 0) + cost.totalCost;
    });

    // Generate trends
    const trends = this.generateCostTrends(allCosts, period);

    // Generate projections
    const projections = this.generateCostProjections(allCosts, period);

    return {
      orgId,
      period,
      totalCost,
      byResourceType,
      byUser,
      byResource,
      trends,
      projections,
    };
  }

  private generateCostTrends(costs: CostItem[], period: { start: Date; end: Date }): CostBreakdown['trends'] {
    const daily: Array<{ date: string; cost: number }> = [];
    const weekly: Array<{ week: string; cost: number }> = [];
    const monthly: Array<{ month: string; cost: number }> = [];

    // Group costs by day
    const dailyCosts = new Map<string, number>();
    costs.forEach(cost => {
      const date = cost.timestamp.toISOString().split('T')[0];
      dailyCosts.set(date, (dailyCosts.get(date) || 0) + cost.totalCost);
    });

    // Convert to array and sort
    for (const [date, cost] of dailyCosts.entries()) {
      daily.push({ date, cost });
    }
    daily.sort((a, b) => a.date.localeCompare(b.date));

    // Group by week
    const weeklyCosts = new Map<string, number>();
    costs.forEach(cost => {
      const week = this.getWeekString(cost.timestamp);
      weeklyCosts.set(week, (weeklyCosts.get(week) || 0) + cost.totalCost);
    });

    for (const [week, cost] of weeklyCosts.entries()) {
      weekly.push({ week, cost });
    }
    weekly.sort((a, b) => a.week.localeCompare(b.week));

    // Group by month
    const monthlyCosts = new Map<string, number>();
    costs.forEach(cost => {
      const month = cost.timestamp.toISOString().substring(0, 7); // YYYY-MM
      monthlyCosts.set(month, (monthlyCosts.get(month) || 0) + cost.totalCost);
    });

    for (const [month, cost] of monthlyCosts.entries()) {
      monthly.push({ month, cost });
    }
    monthly.sort((a, b) => a.month.localeCompare(b.month));

    return { daily, weekly, monthly };
  }

  private generateCostProjections(costs: CostItem[], period: { start: Date; end: Date }): CostBreakdown['projections'] {
    const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);
    const periodDays = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    const dailyAverage = totalCost / periodDays;

    return {
      nextMonth: dailyAverage * 30,
      nextQuarter: dailyAverage * 90,
      nextYear: dailyAverage * 365,
    };
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Set budget for organization
  async setBudget(orgId: string, budget: Omit<Budget, 'orgId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const budgetData: Budget = {
      ...budget,
      orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.budgets.set(orgId, budgetData);
    costLogger.info('Budget set for organization', { orgId, amount: budget.amount, period: budget.period });
  }

  // Get budget for organization
  async getBudget(orgId: string): Promise<Budget | null> {
    return this.budgets.get(orgId) || null;
  }

  // Check cost alerts
  private async checkCostAlerts(): Promise<void> {
    for (const [orgId, budget] of this.budgets.entries()) {
      if (!budget.isActive) continue;

      const period = this.getBudgetPeriod(budget);
      const breakdown = await this.getCostBreakdown(orgId, period);
      const totalCost = breakdown.totalCost;
      const budgetAmount = budget.amount;

      const percentage = (totalCost / budgetAmount) * 100;

      // Check warning threshold
      if (percentage >= budget.alertThresholds.warning && percentage < budget.alertThresholds.critical) {
        await this.createCostAlert(orgId, 'cost_threshold', 'medium',
          `Budget warning: ${percentage.toFixed(1)}% of ${budget.period} budget used`,
          totalCost, budgetAmount);
      }

      // Check critical threshold
      if (percentage >= budget.alertThresholds.critical) {
        await this.createCostAlert(orgId, 'budget_exceeded', 'critical',
          `Budget exceeded: ${percentage.toFixed(1)}% of ${budget.period} budget used`,
          totalCost, budgetAmount);
      }

      // Check for unusual spikes
      await this.checkUnusualSpikes(orgId, breakdown);
    }
  }

  private getBudgetPeriod(budget: Budget): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (budget.period) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      end = now;
    }

    return { start, end };
  }

  private async checkUnusualSpikes(orgId: string, breakdown: CostBreakdown): Promise<void> {
    // Check for unusual spikes in daily costs
    const dailyCosts = breakdown.trends.daily;
    if (dailyCosts.length < 2) return;

    const recentCosts = dailyCosts.slice(-7); // Last 7 days
    const average = recentCosts.reduce((sum, day) => sum + day.cost, 0) / recentCosts.length;
    const latest = recentCosts[recentCosts.length - 1];

    if (latest.cost > average * 2) { // 200% of average
      await this.createCostAlert(orgId, 'unusual_spike', 'high',
        `Unusual cost spike detected: ${latest.cost.toFixed(2)} vs average ${average.toFixed(2)}`,
        latest.cost, average);
    }
  }

  private async createCostAlert(
    orgId: string,
    type: CostAlert['type'],
    severity: CostAlert['severity'],
    message: string,
    currentCost: number,
    threshold: number,
  ): Promise<void> {
    const alertId = `${orgId}:${type}:${Date.now()}`;
    const key = `${orgId}:${type}`;

    const existingAlerts = this.costAlerts.get(key) || [];
    const existingAlert = existingAlerts.find(a => !a.acknowledged);

    if (existingAlert) {
      // Update existing alert
      existingAlert.message = message;
      existingAlert.currentCost = currentCost;
      existingAlert.threshold = threshold;
      existingAlert.timestamp = new Date();
    } else {
      // Create new alert
      const alert: CostAlert = {
        id: alertId,
        orgId,
        type,
        severity,
        message,
        currentCost,
        threshold,
        timestamp: new Date(),
        acknowledged: false,
      };

      existingAlerts.push(alert);
    }

    this.costAlerts.set(key, existingAlerts);
    costLogger.warn('Cost alert created', { orgId, type, severity, message });
  }

  // Get cost alerts for organization
  async getCostAlerts(orgId: string): Promise<CostAlert[]> {
    const allAlerts: CostAlert[] = [];

    for (const [key, alerts] of this.costAlerts.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        allAlerts.push(...alerts);
      }
    }

    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Acknowledge cost alert
  async acknowledgeCostAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    for (const [key, alerts] of this.costAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        costLogger.info('Cost alert acknowledged', { alertId, acknowledgedBy });
        return true;
      }
    }
    return false;
  }

  // Get cost optimization recommendations
  async getCostOptimizationRecommendations(orgId: string): Promise<string[]> {
    const recommendations: string[] = [];
    const breakdown = await this.getCostBreakdown(orgId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    // Check for high API costs
    if (breakdown.byResourceType.api > breakdown.totalCost * 0.5) {
      recommendations.push('Consider implementing API caching to reduce API call costs');
      recommendations.push('Review API usage patterns and optimize unnecessary calls');
    }

    // Check for high storage costs
    if (breakdown.byResourceType.storage > breakdown.totalCost * 0.3) {
      recommendations.push('Implement data retention policies to reduce storage costs');
      recommendations.push('Consider compressing stored data to reduce storage usage');
    }

    // Check for high data transfer costs
    if (breakdown.byResourceType.data_transfer > breakdown.totalCost * 0.4) {
      recommendations.push('Optimize data transfer by implementing compression');
      recommendations.push('Consider using CDN for static content delivery');
    }

    // Check for high RPC costs
    if (breakdown.byResourceType.rpc > breakdown.totalCost * 0.6) {
      recommendations.push('Review RPC usage and implement request batching');
      recommendations.push('Consider using more cost-effective RPC providers');
    }

    return recommendations;
  }

  // Get cost trends
  async getCostTrends(orgId: string, days: number = 30): Promise<{
    dates: string[];
    costs: number[];
    cumulative: number[];
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const breakdown = await this.getCostBreakdown(orgId, { start: startDate, end: endDate });

    const dates = breakdown.trends.daily.map(day => day.date);
    const costs = breakdown.trends.daily.map(day => day.cost);

    let cumulative = 0;
    const cumulativeCosts = costs.map(cost => {
      cumulative += cost;
      return cumulative;
    });

    return {
      dates,
      costs,
      cumulative: cumulativeCosts,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    let cleaned = 0;

    for (const [key, costs] of this.costItems.entries()) {
      const filtered = costs.filter(c => c.timestamp > cutoffDate);
      if (filtered.length !== costs.length) {
        this.costItems.set(key, filtered);
        cleaned += costs.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      costLogger.info('Cost tracking cleanup completed', { cleaned });
    }
  }

  private generateCostId(): string {
    return `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
