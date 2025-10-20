import { Organization, SLASettings } from '../types/organization';
import { slaLogger } from '../utils/logger';

export interface SLAMetric {
  orgId: string;
  rpcId?: string;
  metricType: 'uptime' | 'response_time' | 'error_rate' | 'availability';
  value: number; // Current value
  threshold: number; // SLA threshold
  compliance: number; // Compliance percentage (0-100)
  status: 'compliant' | 'warning' | 'breach';
  timestamp: Date;
  windowStart: Date;
  windowEnd: Date;
}

export interface SLAReport {
  orgId: string;
  period: {
    start: Date;
    end: Date;
  };
  overallCompliance: number;
  metrics: {
    uptime: SLAMetric;
    responseTime: SLAMetric;
    errorRate: SLAMetric;
    availability: SLAMetric;
  };
  breaches: Array<{
    metricType: string;
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
    severity: 'minor' | 'major' | 'critical';
  }>;
  recommendations: string[];
  nextReviewDate: Date;
}

export interface SLAAlert {
  id: string;
  orgId: string;
  rpcId?: string;
  metricType: string;
  currentValue: number;
  threshold: number;
  compliance: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class SLAMonitoringService {
  private slaMetrics: Map<string, SLAMetric[]> = new Map();
  private slaAlerts: Map<string, SLAAlert[]> = new Map();
  private breachHistory: Map<string, Array<{
    metricType: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    severity: 'minor' | 'major' | 'critical';
  }>> = new Map();

  constructor() {
    this.startSLAMonitoring();
    slaLogger.info('SLAMonitoringService initialized');
  }

  private startSLAMonitoring(): void {
    // Check SLA compliance every minute
    setInterval(() => {
      this.checkSLACompliance();
    }, 60 * 1000);
  }

  // Record SLA metric data
  async recordSLAMetric(
    orgId: string,
    rpcId: string | undefined,
    metricType: 'uptime' | 'response_time' | 'error_rate' | 'availability',
    value: number,
    threshold: number,
  ): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 1000); // 1 minute window
    const windowEnd = now;

    const compliance = this.calculateCompliance(value, threshold, metricType);
    const status = this.determineStatus(compliance, metricType);

    const metric: SLAMetric = {
      orgId,
      rpcId,
      metricType,
      value,
      threshold,
      compliance,
      status,
      timestamp: now,
      windowStart,
      windowEnd,
    };

    const key = `${orgId}:${rpcId || 'global'}`;
    const existing = this.slaMetrics.get(key) || [];
    existing.push(metric);

    // Keep only last 1000 metrics per key
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.slaMetrics.set(key, existing);

    // Check for SLA breaches
    if (status === 'breach') {
      await this.handleSLABreach(orgId, rpcId, metric);
    } else if (status === 'warning') {
      await this.handleSLAWarning(orgId, rpcId, metric);
    }

    slaLogger.debug('SLA metric recorded', {
      orgId,
      rpcId,
      metricType,
      value,
      threshold,
      compliance,
      status,
    });
  }

  // Check SLA compliance for all organizations
  private async checkSLACompliance(): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [key, metrics] of this.slaMetrics.entries()) {
      const [orgId, rpcId] = key.split(':');

      // Get recent metrics (last hour)
      const recentMetrics = metrics.filter(m => m.timestamp >= oneHourAgo);

      if (recentMetrics.length === 0) continue;

      // Calculate current compliance
      const uptimeMetrics = recentMetrics.filter(m => m.metricType === 'uptime');
      const responseTimeMetrics = recentMetrics.filter(m => m.metricType === 'response_time');
      const errorRateMetrics = recentMetrics.filter(m => m.metricType === 'error_rate');
      const availabilityMetrics = recentMetrics.filter(m => m.metricType === 'availability');

      // Check each metric type
      await this.checkMetricCompliance(orgId, rpcId === 'global' ? undefined : rpcId, 'uptime', uptimeMetrics);
      await this.checkMetricCompliance(orgId, rpcId === 'global' ? undefined : rpcId, 'response_time', responseTimeMetrics);
      await this.checkMetricCompliance(orgId, rpcId === 'global' ? undefined : rpcId, 'error_rate', errorRateMetrics);
      await this.checkMetricCompliance(orgId, rpcId === 'global' ? undefined : rpcId, 'availability', availabilityMetrics);
    }
  }

  private async checkMetricCompliance(
    orgId: string,
    rpcId: string | undefined,
    metricType: string,
    metrics: SLAMetric[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    // Calculate average compliance
    const avgCompliance = metrics.reduce((sum, m) => sum + m.compliance, 0) / metrics.length;
    const threshold = metrics[0]?.threshold || 0;

    // Determine status
    let status: 'compliant' | 'warning' | 'breach';
    if (avgCompliance >= 99) {
      status = 'compliant';
    } else if (avgCompliance >= 95) {
      status = 'warning';
    } else {
      status = 'breach';
    }

    // Create or update alert
    if (status !== 'compliant') {
      await this.createSLAAlert(orgId, rpcId, metricType, avgCompliance, threshold, status);
    } else {
      await this.resolveSLAAlert(orgId, rpcId, metricType);
    }
  }

  private async createSLAAlert(
    orgId: string,
    rpcId: string | undefined,
    metricType: string,
    currentValue: number,
    threshold: number,
    status: 'warning' | 'breach',
  ): Promise<void> {
    const alertId = `${orgId}:${rpcId || 'global'}:${metricType}:${Date.now()}`;
    const key = `${orgId}:${rpcId || 'global'}`;

    const existingAlerts = this.slaAlerts.get(key) || [];
    const existingAlert = existingAlerts.find(a =>
      a.metricType === metricType && !a.acknowledged,
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = currentValue;
      existingAlert.compliance = this.calculateCompliance(currentValue, threshold, metricType as any);
      existingAlert.severity = status === 'breach' ? 'critical' : 'warning';
      existingAlert.message = this.generateAlertMessage(metricType, currentValue, threshold, status);
    } else {
      // Create new alert
      const alert: SLAAlert = {
        id: alertId,
        orgId,
        rpcId,
        metricType,
        currentValue,
        threshold,
        compliance: this.calculateCompliance(currentValue, threshold, metricType as any),
        severity: status === 'breach' ? 'critical' : 'warning',
        message: this.generateAlertMessage(metricType, currentValue, threshold, status),
        timestamp: new Date(),
        acknowledged: false,
      };

      existingAlerts.push(alert);
    }

    this.slaAlerts.set(key, existingAlerts);
    slaLogger.warn('SLA alert created', { orgId, rpcId, metricType, status, currentValue, threshold });
  }

  private async resolveSLAAlert(
    orgId: string,
    rpcId: string | undefined,
    metricType: string,
  ): Promise<void> {
    const key = `${orgId}:${rpcId || 'global'}`;
    const existingAlerts = this.slaAlerts.get(key) || [];

    const alert = existingAlerts.find(a =>
      a.metricType === metricType && !a.acknowledged,
    );

    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      slaLogger.info('SLA alert resolved', { orgId, rpcId, metricType });
    }
  }

  private async handleSLABreach(orgId: string, rpcId: string | undefined, metric: SLAMetric): Promise<void> {
    const key = `${orgId}:${rpcId || 'global'}`;
    const breaches = this.breachHistory.get(key) || [];

    // Check if this is a continuation of an existing breach
    const lastBreach = breaches[breaches.length - 1];
    if (lastBreach &&
        lastBreach.metricType === metric.metricType &&
        lastBreach.endTime.getTime() > Date.now() - 5 * 60 * 1000) { // 5 minute gap
      // Extend existing breach
      lastBreach.endTime = metric.timestamp;
      lastBreach.duration = (lastBreach.endTime.getTime() - lastBreach.startTime.getTime()) / (1000 * 60);
    } else {
      // Create new breach record
      breaches.push({
        metricType: metric.metricType,
        startTime: metric.timestamp,
        endTime: metric.timestamp,
        duration: 0,
        severity: metric.compliance < 90 ? 'critical' : 'major',
      });
    }

    this.breachHistory.set(key, breaches);
    slaLogger.error('SLA breach detected', {
      orgId,
      rpcId,
      metricType: metric.metricType,
      compliance: metric.compliance,
      threshold: metric.threshold,
    });
  }

  private async handleSLAWarning(orgId: string, rpcId: string | undefined, metric: SLAMetric): Promise<void> {
    slaLogger.warn('SLA warning', {
      orgId,
      rpcId,
      metricType: metric.metricType,
      compliance: metric.compliance,
      threshold: metric.threshold,
    });
  }

  // Generate SLA report
  async generateSLAReport(orgId: string, period: { start: Date; end: Date }): Promise<SLAReport> {
    const allMetrics: SLAMetric[] = [];

    // Collect all metrics for the organization
    for (const [key, metrics] of this.slaMetrics.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = metrics.filter(m =>
          m.timestamp >= period.start && m.timestamp <= period.end,
        );
        allMetrics.push(...filtered);
      }
    }

    // Calculate overall compliance
    const overallCompliance = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.compliance, 0) / allMetrics.length
      : 100;

    // Get latest metrics for each type
    const uptimeMetrics = allMetrics.filter(m => m.metricType === 'uptime');
    const responseTimeMetrics = allMetrics.filter(m => m.metricType === 'response_time');
    const errorRateMetrics = allMetrics.filter(m => m.metricType === 'error_rate');
    const availabilityMetrics = allMetrics.filter(m => m.metricType === 'availability');

    const latestUptime = uptimeMetrics[uptimeMetrics.length - 1];
    const latestResponseTime = responseTimeMetrics[responseTimeMetrics.length - 1];
    const latestErrorRate = errorRateMetrics[errorRateMetrics.length - 1];
    const latestAvailability = availabilityMetrics[availabilityMetrics.length - 1];

    // Get breaches for the period
    const breaches = this.getBreachesForPeriod(orgId, period);

    // Generate recommendations
    const recommendations = this.generateRecommendations(allMetrics, breaches);

    return {
      orgId,
      period,
      overallCompliance,
      metrics: {
        uptime: latestUptime || this.createDefaultMetric(orgId, 'uptime', 100, 99.9),
        responseTime: latestResponseTime || this.createDefaultMetric(orgId, 'response_time', 1000, 5000),
        errorRate: latestErrorRate || this.createDefaultMetric(orgId, 'error_rate', 0.1, 1.0),
        availability: latestAvailability || this.createDefaultMetric(orgId, 'availability', 99.9, 99.5),
      },
      breaches,
      recommendations,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };
  }

  private getBreachesForPeriod(orgId: string, period: { start: Date; end: Date }): Array<{
    metricType: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    severity: 'minor' | 'major' | 'critical';
  }> {
    const allBreaches: Array<{
      metricType: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      severity: 'minor' | 'major' | 'critical';
    }> = [];

    for (const [key, breaches] of this.breachHistory.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = breaches.filter(b =>
          b.startTime >= period.start && b.startTime <= period.end,
        );
        allBreaches.push(...filtered);
      }
    }

    return allBreaches.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  private generateRecommendations(metrics: SLAMetric[], breaches: any[]): string[] {
    const recommendations: string[] = [];

    // Analyze uptime issues
    const uptimeIssues = breaches.filter(b => b.metricType === 'uptime');
    if (uptimeIssues.length > 0) {
      recommendations.push('Consider implementing redundancy for critical RPC endpoints');
      recommendations.push('Review and optimize RPC endpoint configurations');
    }

    // Analyze response time issues
    const responseTimeIssues = breaches.filter(b => b.metricType === 'response_time');
    if (responseTimeIssues.length > 0) {
      recommendations.push('Optimize RPC endpoint performance and consider load balancing');
      recommendations.push('Review network latency and consider geographic distribution');
    }

    // Analyze error rate issues
    const errorRateIssues = breaches.filter(b => b.metricType === 'error_rate');
    if (errorRateIssues.length > 0) {
      recommendations.push('Implement better error handling and retry mechanisms');
      recommendations.push('Review RPC endpoint stability and monitoring');
    }

    // General recommendations
    if (breaches.length > 5) {
      recommendations.push('Consider upgrading to a higher SLA tier for better support');
      recommendations.push('Implement proactive monitoring and alerting');
    }

    return recommendations;
  }

  private createDefaultMetric(
    orgId: string,
    metricType: 'uptime' | 'response_time' | 'error_rate' | 'availability',
    value: number,
    threshold: number,
  ): SLAMetric {
    const now = new Date();
    return {
      orgId,
      metricType,
      value,
      threshold,
      compliance: this.calculateCompliance(value, threshold, metricType),
      status: 'compliant',
      timestamp: now,
      windowStart: now,
      windowEnd: now,
    };
  }

  // Get SLA alerts for organization
  async getSLAAlerts(orgId: string, rpcId?: string): Promise<SLAAlert[]> {
    const key = `${orgId}:${rpcId || 'global'}`;
    return this.slaAlerts.get(key) || [];
  }

  // Acknowledge SLA alert
  async acknowledgeSLAAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    for (const [key, alerts] of this.slaAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        slaLogger.info('SLA alert acknowledged', { alertId, acknowledgedBy });
        return true;
      }
    }
    return false;
  }

  // Private helper methods
  private calculateCompliance(value: number, threshold: number, metricType: string): number {
    switch (metricType) {
    case 'uptime':
    case 'availability':
      return Math.min(100, (value / threshold) * 100);
    case 'response_time':
      return Math.max(0, 100 - ((value - threshold) / threshold) * 100);
    case 'error_rate':
      return Math.max(0, 100 - (value / threshold) * 100);
    default:
      return 100;
    }
  }

  private determineStatus(compliance: number, metricType: string): 'compliant' | 'warning' | 'breach' {
    if (compliance >= 99) return 'compliant';
    if (compliance >= 95) return 'warning';
    return 'breach';
  }

  private generateAlertMessage(
    metricType: string,
    currentValue: number,
    threshold: number,
    status: 'warning' | 'breach',
  ): string {
    const severity = status === 'breach' ? 'CRITICAL' : 'WARNING';
    return `SLA ${severity}: ${metricType} is ${currentValue} (threshold: ${threshold})`;
  }

  // Get service statistics
  getServiceStats(): {
    totalMetrics: number;
    totalAlerts: number;
    totalBreaches: number;
    activeAlerts: number;
    } {
    let totalMetrics = 0;
    let totalAlerts = 0;
    let totalBreaches = 0;
    let activeAlerts = 0;

    for (const [_, metrics] of this.slaMetrics.entries()) {
      totalMetrics += metrics.length;
    }

    for (const [_, alerts] of this.slaAlerts.entries()) {
      totalAlerts += alerts.length;
      activeAlerts += alerts.filter(a => !a.acknowledged).length;
    }

    for (const [_, breaches] of this.breachHistory.entries()) {
      totalBreaches += breaches.length;
    }

    return {
      totalMetrics,
      totalAlerts,
      totalBreaches,
      activeAlerts,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    let cleaned = 0;

    for (const [key, metrics] of this.slaMetrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoffDate);
      if (filtered.length !== metrics.length) {
        this.slaMetrics.set(key, filtered);
        cleaned += metrics.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      slaLogger.info('SLA monitoring cleanup completed', { cleaned });
    }
  }
}
