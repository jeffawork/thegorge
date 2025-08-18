import { EventEmitter } from 'events';
import { Alert, AlertType, AlertSeverity } from '../types';
import { MetricsService } from './metricsService';
import { alertLogger } from '../utils/logger';
import { generateId } from '../utils/helpers';

export class AlertService extends EventEmitter {
  private alerts: Alert[] = [];
  private readonly maxAlerts = 1000;
  private readonly duplicateThresholdMs = 300000; // 5 minutes
  private metricsService?: MetricsService;

  constructor(metricsService?: MetricsService) {
    super();
    this.metricsService = metricsService;
    alertLogger.info('Alert service initialized');
  }

  /**
   * Add a new alert
   */
  addAlert(alert: Alert): void {
    // Check if similar alert already exists and is not resolved
    if (this.isDuplicateAlert(alert)) {
      alertLogger.debug(`Duplicate alert skipped for ${alert.rpcName}`, {
        type: alert.type,
        rpcId: alert.rpcId
      });
      return;
    }

    // Add timestamp if not provided
    if (!alert.timestamp) {
      alert.timestamp = new Date();
    }

    // Add unique ID if not provided
    if (!alert.id) {
      alert.id = generateId();
    }

    // Insert at the beginning (most recent first)
    this.alerts.unshift(alert);
    
    // Keep only the most recent alerts
    if (this.alerts.length > this.maxAlerts) {
      const removed = this.alerts.splice(this.maxAlerts);
      alertLogger.debug(`Removed ${removed.length} old alerts due to limit`);
    }

    alertLogger.warn(`New alert: ${alert.message}`, {
      id: alert.id,
      rpcId: alert.rpcId,
      rpcName: alert.rpcName,
      type: alert.type,
      severity: alert.severity
    });

    // Record metrics for Prometheus
    if (this.metricsService) {
      this.metricsService.recordAlert(alert);
    }
    
    this.emit('newAlert', alert);
  }

  /**
   * Check if alert is a duplicate of an existing unresolved alert
   */
  private isDuplicateAlert(newAlert: Alert): boolean {
    const cutoffTime = Date.now() - this.duplicateThresholdMs;
    
    return this.alerts.some(existingAlert => 
      existingAlert.rpcId === newAlert.rpcId &&
      existingAlert.type === newAlert.type &&
      !existingAlert.resolved &&
      existingAlert.timestamp.getTime() > cutoffTime
    );
  }

  /**
   * Resolve an alert by ID
   */
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    
    if (!alert) {
      alertLogger.warn(`Alert not found for resolution: ${alertId}`);
      return false;
    }

    if (alert.resolved) {
      alertLogger.debug(`Alert already resolved: ${alertId}`);
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy || 'system';

    alertLogger.info(`Alert resolved: ${alert.message}`, {
      id: alert.id,
      rpcId: alert.rpcId,
      resolvedBy,
      duration: alert.resolvedAt.getTime() - alert.timestamp.getTime()
    });

    this.emit('alertResolved', alert);
    return true;
  }

  /**
   * Auto-resolve alerts when RPC comes back online
   */
  autoResolveAlerts(rpcId: string, alertTypes: AlertType[] = ['offline', 'chain_sync_issue']): number {
    let resolvedCount = 0;
    
    const alertsToResolve = this.alerts.filter(alert => 
      alert.rpcId === rpcId &&
      alertTypes.includes(alert.type) &&
      !alert.resolved
    );

    for (const alert of alertsToResolve) {
      if (this.resolveAlert(alert.id, 'auto-resolver')) {
        resolvedCount++;
      }
    }

    if (resolvedCount > 0) {
      alertLogger.info(`Auto-resolved ${resolvedCount} alerts for RPC ${rpcId}`);
    }

    return resolvedCount;
  }

  /**
   * Bulk resolve alerts
   */
  bulkResolveAlerts(alertIds: string[], resolvedBy?: string): number {
    let resolvedCount = 0;
    
    for (const alertId of alertIds) {
      if (this.resolveAlert(alertId, resolvedBy)) {
        resolvedCount++;
      }
    }

    alertLogger.info(`Bulk resolved ${resolvedCount} alerts`, { resolvedBy });
    return resolvedCount;
  }

  /**
   * Get all alerts with optional filters
   */
  getAlerts(options: {
    includeResolved?: boolean;
    rpcId?: string;
    type?: AlertType;
    severity?: AlertSeverity;
    limit?: number;
    offset?: number;
  } = {}): Alert[] {
    const {
      includeResolved = true,
      rpcId,
      type,
      severity,
      limit,
      offset = 0
    } = options;

    let filteredAlerts = this.alerts;

    // Apply filters
    if (!includeResolved) {
      filteredAlerts = filteredAlerts.filter(a => !a.resolved);
    }

    if (rpcId) {
      filteredAlerts = filteredAlerts.filter(a => a.rpcId === rpcId);
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === type);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
    }

    // Apply pagination
    if (limit !== undefined) {
      filteredAlerts = filteredAlerts.slice(offset, offset + limit);
    }

    return filteredAlerts;
  }

  /**
   * Get only active (unresolved) alerts
   */
  getActiveAlerts(rpcId?: string): Alert[] {
    return this.getAlerts({
      includeResolved: false,
      rpcId
    });
  }

  /**
   * Get alerts for a specific RPC
   */
  getAlertsByRPC(rpcId: string, includeResolved: boolean = true): Alert[] {
    return this.getAlerts({
      includeResolved,
      rpcId: rpcId
    });
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity, includeResolved: boolean = false): Alert[] {
    return this.getAlerts({
      includeResolved,
      severity
    });
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeRangeHours: number = 24): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
    byRPC: Record<string, number>;
  } {
    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentAlerts = this.alerts.filter(a => a.timestamp.getTime() > cutoffTime);

    const stats = {
      total: recentAlerts.length,
      active: recentAlerts.filter(a => !a.resolved).length,
      resolved: recentAlerts.filter(a => a.resolved).length,
      bySeverity: {} as Record<AlertSeverity, number>,
      byType: {} as Record<AlertType, number>,
      byRPC: {} as Record<string, number>
    };

    // Initialize counters
    const severities: AlertSeverity[] = ['low', 'medium', 'high', 'critical'];
    const types: AlertType[] = ['offline', 'slow_response', 'high_error_rate', 'chain_sync_issue', 'peer_count_low', 'block_lag'];

    severities.forEach(severity => stats.bySeverity[severity] = 0);
    types.forEach(type => stats.byType[type] = 0);

    // Count alerts
    for (const alert of recentAlerts) {
      stats.bySeverity[alert.severity]++;
      stats.byType[alert.type]++;
      
      const rpcKey = `${alert.rpcName} (${alert.rpcId})`;
      stats.byRPC[rpcKey] = (stats.byRPC[rpcKey] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear old resolved alerts
   */
  clearOldAlerts(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialCount = this.alerts.length;
    
    // Keep alerts that are either recent OR unresolved
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp.getTime() > cutoffTime || !alert.resolved
    );

    const removedCount = initialCount - this.alerts.length;
    
    if (removedCount > 0) {
      alertLogger.info(`Cleared ${removedCount} old alerts`, {
        olderThanHours,
        remainingAlerts: this.alerts.length
      });
    }

    return removedCount;
  }

  /**
   * Clear all alerts (use with caution)
   */
  clearAllAlerts(): number {
    const count = this.alerts.length;
    this.alerts = [];
    
    alertLogger.warn(`Cleared all alerts`, { count });
    this.emit('allAlertsCleared', { count, timestamp: new Date() });
    
    return count;
  }

  /**
   * Export alerts to JSON
   */
  exportAlerts(includeResolved: boolean = true): string {
    const alertsToExport = includeResolved 
      ? this.alerts 
      : this.alerts.filter(a => !a.resolved);

    return JSON.stringify(alertsToExport, null, 2);
  }

  /**
   * Import alerts from JSON
   */
  importAlerts(alertsJson: string, merge: boolean = true): number {
    try {
      const importedAlerts: Alert[] = JSON.parse(alertsJson);
      
      // Validate imported alerts
      const validAlerts = importedAlerts.filter(this.isValidAlert);
      
      if (!merge) {
        this.alerts = validAlerts;
      } else {
        // Merge with existing alerts, avoiding duplicates by ID
        const existingIds = new Set(this.alerts.map(a => a.id));
        const newAlerts = validAlerts.filter(a => !existingIds.has(a.id));
        this.alerts = [...newAlerts, ...this.alerts];
      }

      // Sort by timestamp (newest first)
      this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      alertLogger.info(`Imported ${validAlerts.length} alerts`, { merge });
      return validAlerts.length;
    } catch (error) {
      alertLogger.error('Failed to import alerts', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  /**
   * Validate alert object structure
   */
  private isValidAlert(alert: any): alert is Alert {
    return (
      typeof alert === 'object' &&
      typeof alert.id === 'string' &&
      typeof alert.rpcId === 'string' &&
      typeof alert.rpcName === 'string' &&
      typeof alert.type === 'string' &&
      typeof alert.message === 'string' &&
      typeof alert.severity === 'string' &&
      alert.timestamp instanceof Date || typeof alert.timestamp === 'string' &&
      typeof alert.resolved === 'boolean'
    );
  }

  /**
   * Get recent alert trends
   */
  getAlertTrends(hours: number = 24, intervalHours: number = 1): {
    timestamp: Date;
    count: number;
    severity: Record<AlertSeverity, number>;
  }[] {
    const now = Date.now();
    const startTime = now - (hours * 60 * 60 * 1000);
    const intervals = Math.ceil(hours / intervalHours);
    const intervalMs = intervalHours * 60 * 60 * 1000;

    const trends: {
      timestamp: Date;
      count: number;
      severity: Record<AlertSeverity, number>;
    }[] = [];

    for (let i = 0; i < intervals; i++) {
      const intervalStart = startTime + (i * intervalMs);
      const intervalEnd = intervalStart + intervalMs;
      
      const intervalAlerts = this.alerts.filter(alert => {
        const alertTime = alert.timestamp.getTime();
        return alertTime >= intervalStart && alertTime < intervalEnd;
      });

      const severityCounts: Record<AlertSeverity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };

      intervalAlerts.forEach(alert => {
        severityCounts[alert.severity]++;
      });

      trends.push({
        timestamp: new Date(intervalStart),
        count: intervalAlerts.length,
        severity: severityCounts
      });
    }

    return trends;
  }

  /**
   * Get current alert count
   */
  getAlertCount(includeResolved: boolean = false): number {
    return includeResolved 
      ? this.alerts.length 
      : this.alerts.filter(a => !a.resolved).length;
  }

  /**
   * Check if there are any critical alerts
   */
  hasCriticalAlerts(): boolean {
    return this.alerts.some(alert => 
      alert.severity === 'critical' && !alert.resolved
    );
  }

  /**
   * Get the most recent alert for an RPC
   */
  getMostRecentAlert(rpcId: string): Alert | undefined {
    return this.alerts
      .filter(alert => alert.rpcId === rpcId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.removeAllListeners();
    alertLogger.info('Alert service cleanup completed');
  }
}
