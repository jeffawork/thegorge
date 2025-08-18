import { Alert, RPCConfig } from '../types';
import { MetricsService } from './metricsService';
import { alertLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AlertService {
  private alerts: Map<string, Alert> = new Map();
  private metricsService?: MetricsService;

  constructor(metricsService?: MetricsService) {
    this.metricsService = metricsService;
    alertLogger.info('AlertService initialized');
  }

  /**
   * Add a new alert
   */
  async addAlert(alertData: Omit<Alert, 'id'>): Promise<Alert> {
    const alert: Alert = {
      ...alertData,
      id: uuidv4()
    };

    this.alerts.set(alert.id, alert);

    // Record metrics if available
    if (this.metricsService) {
      this.metricsService.recordAlert(alert);
    }

    alertLogger.info('New alert created', {
      alertId: alert.id,
      rpcId: alert.rpcId,
      type: alert.type,
      severity: alert.severity
    });

    return alert;
  }

  /**
   * Get all alerts for a specific user
   */
  getUserAlerts(userId: string, resolved: boolean = false): Alert[] {
    // For now, we'll return all alerts since we need to implement user filtering
    // This should be enhanced to filter by user's RPCs
    return Array.from(this.alerts.values())
      .filter(alert => alert.resolved === resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all alerts for a specific RPC
   */
  getAlertsByRPC(rpcId: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.rpcId === rpcId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get count of active alerts for a user
   */
  getActiveAlertsCount(userId: string): number {
    // For now, return total active alerts
    // This should be enhanced to filter by user's RPCs
    return this.getActiveAlerts().length;
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: Alert['type']): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<Alert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      alertLogger.warn('Alert not found for resolution', { alertId });
      return null;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy || 'system';

    this.alerts.set(alertId, alert);

    alertLogger.info('Alert resolved', {
      alertId,
      resolvedBy: alert.resolvedBy,
      rpcId: alert.rpcId
    });

    return alert;
  }

  /**
   * Get alert statistics
   */
  getAlertStats(userId: string): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<Alert['severity'], number>;
    byType: Record<Alert['type'], number>;
  } {
    const userAlerts = this.getUserAlerts(userId);
    const activeAlerts = userAlerts.filter(alert => !alert.resolved);
    const resolvedAlerts = userAlerts.filter(alert => alert.resolved);

    const bySeverity: Record<Alert['severity'], number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const byType: Record<Alert['type'], number> = {
      response_time: 0,
      error_rate: 0,
      peer_count: 0,
      block_lag: 0,
      sync_lag: 0,
      offline: 0
    };

    for (const alert of userAlerts) {
      bySeverity[alert.severity]++;
      byType[alert.type]++;
    }

    return {
      total: userAlerts.length,
      active: activeAlerts.length,
      resolved: resolvedAlerts.length,
      bySeverity,
      byType
    };
  }

  /**
   * Clear old resolved alerts
   */
  clearOldAlerts(maxAgeHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let clearedCount = 0;

    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(alertId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      alertLogger.info('Old resolved alerts cleared', { clearedCount });
    }

    return clearedCount;
  }

  /**
   * Get alerts for a specific time range
   */
  getAlertsInTimeRange(startTime: Date, endTime: Date): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= startTime && alert.timestamp <= endTime)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recent alerts (last N hours)
   */
  getRecentAlerts(hours: number = 24): Alert[] {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAlertsInTimeRange(startTime, new Date());
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      alertLogger.warn('Alert not found for deletion', { alertId });
      return false;
    }

    this.alerts.delete(alertId);
    alertLogger.info('Alert deleted', { alertId, rpcId: alert.rpcId });
    return true;
  }

  /**
   * Bulk resolve alerts
   */
  async bulkResolveAlerts(alertIds: string[], resolvedBy: string): Promise<number> {
    let resolvedCount = 0;

    for (const alertId of alertIds) {
      const result = await this.resolveAlert(alertId, resolvedBy);
      if (result) {
        resolvedCount++;
      }
    }

    alertLogger.info('Bulk alert resolution completed', { 
      total: alertIds.length, 
      resolved: resolvedCount,
      resolvedBy 
    });

    return resolvedCount;
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Check if an alert exists
   */
  hasAlert(alertId: string): boolean {
    return this.alerts.has(alertId);
  }

  /**
   * Get total alert count
   */
  getTotalAlertCount(): number {
    return this.alerts.size;
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    this.alerts.clear();
    alertLogger.info('AlertService cleanup completed');
  }
}
