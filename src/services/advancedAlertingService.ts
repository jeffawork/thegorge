import { alertingLogger } from '../utils/logger';

export interface AlertRule {
  id: string;
  orgId: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  escalationPolicy: EscalationPolicy;
  notificationChannels: string[];
  cooldownPeriod: number; // minutes
  evaluationInterval: number; // seconds
  lastEvaluated?: Date;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  id: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte' | 'contains' | 'regex';
  threshold: number | string;
  timeWindow: number; // seconds
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'p95' | 'p99';
  tags?: Record<string, string>;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
  isActive: boolean;
}

export interface EscalationStep {
  level: number;
  delay: number; // minutes
  notificationChannels: string[];
  conditions?: {
    maxRetries?: number;
    timeWindow?: number; // minutes
  };
}

export interface Alert {
  id: string;
  orgId: string;
  ruleId: string;
  rpcId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'firing' | 'resolved' | 'acknowledged' | 'suppressed';
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: Date;
  endsAt?: Date;
  updatedAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalationLevel: number;
  notificationSent: boolean;
  metadata?: Record<string, any>;
}

export interface AlertGroup {
  id: string;
  orgId: string;
  labels: Record<string, string>;
  alerts: Alert[];
  status: 'firing' | 'resolved';
  startsAt: Date;
  endsAt?: Date;
  updatedAt: Date;
  notificationSent: boolean;
}

export interface AlertCorrelation {
  id: string;
  orgId: string;
  pattern: string;
  description: string;
  conditions: AlertCondition[];
  correlationWindow: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastMatched?: Date;
  matchCount: number;
  createdAt: Date;
}

export interface NotificationChannel {
  id: string;
  orgId: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'discord' | 'teams' | 'pagerduty';
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  template: {
    title: string;
    description: string;
    summary: string;
  };
  variables: string[];
  isSystem: boolean;
  createdAt: Date;
}

export class AdvancedAlertingService {
  private alertRules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert[]> = new Map();
  private alertGroups: Map<string, AlertGroup> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private notificationChannels: Map<string, NotificationChannel[]> = new Map();
  private alertCorrelations: Map<string, AlertCorrelation> = new Map();
  private alertTemplates: Map<string, AlertTemplate> = new Map();
  private evaluationIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultEscalationPolicies();
    this.startAlertEvaluation();
    alertingLogger.info('AdvancedAlertingService initialized');
  }

  private initializeDefaultTemplates(): void {
    const templates: AlertTemplate[] = [
      {
        id: 'rpc-down',
        name: 'RPC Down',
        description: 'RPC endpoint is down',
        severity: 'critical',
        template: {
          title: 'RPC {{rpcName}} is down',
          description: 'RPC endpoint {{rpcUrl}} has been down for {{duration}}',
          summary: 'RPC endpoint {{rpcName}} is not responding'
        },
        variables: ['rpcName', 'rpcUrl', 'duration'],
        isSystem: true,
        createdAt: new Date()
      },
      {
        id: 'high-response-time',
        name: 'High Response Time',
        description: 'RPC response time is too high',
        severity: 'high',
        template: {
          title: 'High response time for {{rpcName}}',
          description: 'Response time is {{responseTime}}ms (threshold: {{threshold}}ms)',
          summary: 'RPC {{rpcName}} response time is {{responseTime}}ms'
        },
        variables: ['rpcName', 'responseTime', 'threshold'],
        isSystem: true,
        createdAt: new Date()
      },
      {
        id: 'error-rate-spike',
        name: 'Error Rate Spike',
        description: 'Error rate has spiked',
        severity: 'high',
        template: {
          title: 'Error rate spike for {{rpcName}}',
          description: 'Error rate is {{errorRate}}% (threshold: {{threshold}}%)',
          summary: 'RPC {{rpcName}} error rate is {{errorRate}}%'
        },
        variables: ['rpcName', 'errorRate', 'threshold'],
        isSystem: true,
        createdAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.alertTemplates.set(template.id, template);
    });
  }

  private initializeDefaultEscalationPolicies(): void {
    const policies: EscalationPolicy[] = [
      {
        id: 'default-critical',
        name: 'Default Critical Escalation',
        steps: [
          {
            level: 1,
            delay: 0,
            notificationChannels: ['email', 'slack'],
            conditions: { maxRetries: 3, timeWindow: 5 }
          },
          {
            level: 2,
            delay: 15,
            notificationChannels: ['pagerduty'],
            conditions: { maxRetries: 2, timeWindow: 10 }
          },
          {
            level: 3,
            delay: 30,
            notificationChannels: ['webhook'],
            conditions: { maxRetries: 1, timeWindow: 15 }
          }
        ],
        isActive: true
      },
      {
        id: 'default-high',
        name: 'Default High Escalation',
        steps: [
          {
            level: 1,
            delay: 0,
            notificationChannels: ['email', 'slack'],
            conditions: { maxRetries: 2, timeWindow: 10 }
          },
          {
            level: 2,
            delay: 30,
            notificationChannels: ['webhook'],
            conditions: { maxRetries: 1, timeWindow: 20 }
          }
        ],
        isActive: true
      }
    ];

    policies.forEach(policy => {
      this.escalationPolicies.set(policy.id, policy);
    });
  }

  private startAlertEvaluation(): void {
    // Evaluate all alert rules every 30 seconds
    setInterval(() => {
      this.evaluateAllAlertRules();
    }, 30 * 1000);

    // Process alert correlations every minute
    setInterval(() => {
      this.processAlertCorrelations();
    }, 60 * 1000);

    // Process escalations every 5 minutes
    setInterval(() => {
      this.processEscalations();
    }, 5 * 60 * 1000);
  }

  // Create alert rule
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>): Promise<string> {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateAlertRuleId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0
    };

    this.alertRules.set(alertRule.id, alertRule);
    this.startRuleEvaluation(alertRule.id);

    alertingLogger.info('Alert rule created', { ruleId: alertRule.id, orgId: alertRule.orgId, name: alertRule.name });
    return alertRule.id;
  }

  // Start evaluating a specific rule
  private startRuleEvaluation(ruleId: string): void {
    const rule = this.alertRules.get(ruleId);
    if (!rule || !rule.enabled) return;

    const interval = setInterval(() => {
      this.evaluateAlertRule(ruleId);
    }, rule.evaluationInterval * 1000);

    this.evaluationIntervals.set(ruleId, interval);
  }

  // Stop evaluating a specific rule
  private stopRuleEvaluation(ruleId: string): void {
    const interval = this.evaluationIntervals.get(ruleId);
    if (interval) {
      clearInterval(interval);
      this.evaluationIntervals.delete(ruleId);
    }
  }

  // Evaluate all alert rules
  private async evaluateAllAlertRules(): Promise<void> {
    for (const [ruleId, rule] of this.alertRules.entries()) {
      if (!rule.enabled) continue;
      await this.evaluateAlertRule(ruleId);
    }
  }

  // Evaluate a specific alert rule
  private async evaluateAlertRule(ruleId: string): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule || !rule.enabled) return;

    try {
      const isTriggered = await this.checkAlertConditions(rule);
      
      if (isTriggered) {
        await this.triggerAlert(rule);
      } else {
        await this.resolveAlert(rule);
      }

      rule.lastEvaluated = new Date();
      this.alertRules.set(ruleId, rule);
    } catch (error) {
      alertingLogger.error('Error evaluating alert rule', { ruleId, error: error.message });
    }
  }

  // Check if alert conditions are met
  private async checkAlertConditions(rule: AlertRule): Promise<boolean> {
    // This would integrate with actual metrics data
    // For now, we'll simulate the condition checking
    const randomValue = Math.random();
    return randomValue < 0.1; // 10% chance of triggering
  }

  // Trigger an alert
  private async triggerAlert(rule: AlertRule): Promise<void> {
    const existingAlert = this.getActiveAlert(rule.orgId, rule.id);
    
    if (existingAlert) {
      // Update existing alert
      existingAlert.updatedAt = new Date();
      existingAlert.labels = { ...existingAlert.labels, ...this.generateAlertLabels(rule) };
      existingAlert.annotations = { ...existingAlert.annotations, ...this.generateAlertAnnotations(rule) };
      this.updateAlert(existingAlert);
    } else {
      // Create new alert
      const alert: Alert = {
        id: this.generateAlertId(),
        orgId: rule.orgId,
        ruleId: rule.id,
        title: this.generateAlertTitle(rule),
        description: this.generateAlertDescription(rule),
        severity: rule.severity,
        status: 'firing',
        labels: this.generateAlertLabels(rule),
        annotations: this.generateAlertAnnotations(rule),
        startsAt: new Date(),
        updatedAt: new Date(),
        escalationLevel: 1,
        notificationSent: false
      };

      this.createAlert(alert);
      rule.lastTriggered = new Date();
      rule.triggerCount++;
      this.alertRules.set(rule.id, rule);

      // Group alerts
      this.groupAlerts(alert);
    }
  }

  // Resolve an alert
  private async resolveAlert(rule: AlertRule): Promise<void> {
    const existingAlert = this.getActiveAlert(rule.orgId, rule.id);
    
    if (existingAlert) {
      existingAlert.status = 'resolved';
      existingAlert.endsAt = new Date();
      existingAlert.updatedAt = new Date();
      this.updateAlert(existingAlert);

      // Update alert group
      this.updateAlertGroup(existingAlert);
    }
  }

  // Generate alert title
  private generateAlertTitle(rule: AlertRule): string {
    const template = this.alertTemplates.get('rpc-down'); // Default template
    if (!template) return rule.name;

    return template.template.title
      .replace('{{rpcName}}', 'RPC Endpoint')
      .replace('{{duration}}', '5 minutes');
  }

  // Generate alert description
  private generateAlertDescription(rule: AlertRule): string {
    const template = this.alertTemplates.get('rpc-down'); // Default template
    if (!template) return rule.description;

    return template.template.description
      .replace('{{rpcUrl}}', 'https://example.com/rpc')
      .replace('{{duration}}', '5 minutes');
  }

  // Generate alert labels
  private generateAlertLabels(rule: AlertRule): Record<string, string> {
    return {
      alertname: rule.name,
      severity: rule.severity,
      orgId: rule.orgId,
      ruleId: rule.id
    };
  }

  // Generate alert annotations
  private generateAlertAnnotations(rule: AlertRule): Record<string, string> {
    return {
      summary: rule.description,
      description: `Alert rule "${rule.name}" has been triggered`,
      runbook_url: `https://docs.example.com/alerts/${rule.id}`
    };
  }

  // Create alert
  private createAlert(alert: Alert): void {
    const key = `${alert.orgId}:${alert.ruleId}`;
    const existing = this.alerts.get(key) || [];
    existing.push(alert);
    this.alerts.set(key, existing);

    alertingLogger.info('Alert created', {
      alertId: alert.id,
      orgId: alert.orgId,
      ruleId: alert.ruleId,
      severity: alert.severity
    });
  }

  // Update alert
  private updateAlert(alert: Alert): void {
    const key = `${alert.orgId}:${alert.ruleId}`;
    const existing = this.alerts.get(key) || [];
    const index = existing.findIndex(a => a.id === alert.id);
    
    if (index !== -1) {
      existing[index] = alert;
      this.alerts.set(key, existing);
    }
  }

  // Get active alert
  private getActiveAlert(orgId: string, ruleId: string): Alert | null {
    const key = `${orgId}:${ruleId}`;
    const alerts = this.alerts.get(key) || [];
    return alerts.find(a => a.status === 'firing') || null;
  }

  // Group alerts
  private groupAlerts(alert: Alert): void {
    const groupKey = this.generateAlertGroupKey(alert);
    let group = this.alertGroups.get(groupKey);

    if (!group) {
      group = {
        id: this.generateAlertGroupId(),
        orgId: alert.orgId,
        labels: alert.labels,
        alerts: [],
        status: 'firing',
        startsAt: alert.startsAt,
        updatedAt: new Date(),
        notificationSent: false
      };
    }

    group.alerts.push(alert);
    group.updatedAt = new Date();
    this.alertGroups.set(groupKey, group);
  }

  // Update alert group
  private updateAlertGroup(alert: Alert): void {
    const groupKey = this.generateAlertGroupKey(alert);
    const group = this.alertGroups.get(groupKey);
    
    if (group) {
      const allResolved = group.alerts.every(a => a.status === 'resolved');
      if (allResolved) {
        group.status = 'resolved';
        group.endsAt = new Date();
      }
      group.updatedAt = new Date();
      this.alertGroups.set(groupKey, group);
    }
  }

  // Generate alert group key
  private generateAlertGroupKey(alert: Alert): string {
    const labels = Object.entries(alert.labels)
      .filter(([key]) => key !== 'alertname')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return `${alert.orgId}:${labels}`;
  }

  // Process alert correlations
  private async processAlertCorrelations(): Promise<void> {
    for (const [correlationId, correlation] of this.alertCorrelations.entries()) {
      if (!correlation.isActive) continue;

      const isMatched = await this.checkCorrelationConditions(correlation);
      if (isMatched) {
        await this.triggerCorrelatedAlert(correlation);
      }
    }
  }

  // Check correlation conditions
  private async checkCorrelationConditions(correlation: AlertCorrelation): Promise<boolean> {
    // This would check if multiple alerts match the correlation pattern
    // For now, we'll simulate it
    return Math.random() < 0.05; // 5% chance of correlation match
  }

  // Trigger correlated alert
  private async triggerCorrelatedAlert(correlation: AlertCorrelation): Promise<void> {
    // Create a new alert based on the correlation
    const alert: Alert = {
      id: this.generateAlertId(),
      orgId: correlation.orgId,
      ruleId: correlation.id,
      title: `Correlated Alert: ${correlation.description}`,
      description: `Multiple alerts have been correlated: ${correlation.pattern}`,
      severity: correlation.severity,
      status: 'firing',
      labels: { correlationId: correlation.id },
      annotations: { correlation: 'true' },
      startsAt: new Date(),
      updatedAt: new Date(),
      escalationLevel: 1,
      notificationSent: false
    };

    this.createAlert(alert);
    correlation.lastMatched = new Date();
    correlation.matchCount++;
    this.alertCorrelations.set(correlationId, correlation);
  }

  // Process escalations
  private async processEscalations(): Promise<void> {
    for (const [groupKey, group] of this.alertGroups.entries()) {
      if (group.status !== 'firing' || group.notificationSent) continue;

      const firingAlerts = group.alerts.filter(a => a.status === 'firing');
      if (firingAlerts.length === 0) continue;

      const highestSeverity = this.getHighestSeverity(firingAlerts);
      const escalationPolicy = this.getEscalationPolicyForSeverity(highestSeverity);
      
      if (escalationPolicy) {
        await this.processEscalationSteps(group, escalationPolicy);
      }
    }
  }

  // Get highest severity from alerts
  private getHighestSeverity(alerts: Alert[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return alerts.reduce((highest, alert) => 
      severityOrder[alert.severity] > severityOrder[highest] ? alert.severity : highest, 
      'low' as 'low' | 'medium' | 'high' | 'critical'
    );
  }

  // Get escalation policy for severity
  private getEscalationPolicyForSeverity(severity: string): EscalationPolicy | null {
    const policyId = severity === 'critical' ? 'default-critical' : 'default-high';
    return this.escalationPolicies.get(policyId) || null;
  }

  // Process escalation steps
  private async processEscalationSteps(group: AlertGroup, policy: EscalationPolicy): Promise<void> {
    const now = new Date();
    const timeSinceStart = (now.getTime() - group.startsAt.getTime()) / (1000 * 60); // minutes

    for (const step of policy.steps) {
      if (timeSinceStart >= step.delay) {
        await this.sendNotifications(group, step.notificationChannels);
        group.notificationSent = true;
        this.alertGroups.set(this.generateAlertGroupKey(group.alerts[0]), group);
        break;
      }
    }
  }

  // Send notifications
  private async sendNotifications(group: AlertGroup, channels: string[]): Promise<void> {
    for (const channelId of channels) {
      try {
        await this.sendNotification(group, channelId);
        alertingLogger.info('Notification sent', { groupId: group.id, channelId });
      } catch (error) {
        alertingLogger.error('Failed to send notification', { groupId: group.id, channelId, error: error.message });
      }
    }
  }

  // Send notification to specific channel
  private async sendNotification(group: AlertGroup, channelId: string): Promise<void> {
    // This would integrate with actual notification services
    alertingLogger.info('Sending notification', { groupId: group.id, channelId });
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    for (const [key, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        alert.updatedAt = new Date();
        this.updateAlert(alert);
        alertingLogger.info('Alert acknowledged', { alertId, userId });
        return true;
      }
    }
    return false;
  }

  // Resolve alert
  async resolveAlert(alertId: string, userId: string): Promise<boolean> {
    for (const [key, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedBy = userId;
        alert.resolvedAt = new Date();
        alert.endsAt = new Date();
        alert.updatedAt = new Date();
        this.updateAlert(alert);
        alertingLogger.info('Alert resolved', { alertId, userId });
        return true;
      }
    }
    return false;
  }

  // Get alerts for organization
  async getAlerts(orgId: string, status?: string, limit: number = 100): Promise<Alert[]> {
    const allAlerts: Alert[] = [];
    
    for (const [key, alerts] of this.alerts.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        allAlerts.push(...alerts);
      }
    }

    let filtered = allAlerts;
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    return filtered
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
      .slice(0, limit);
  }

  // Get alert groups for organization
  async getAlertGroups(orgId: string, status?: string, limit: number = 100): Promise<AlertGroup[]> {
    const allGroups: AlertGroup[] = [];
    
    for (const [key, group] of this.alertGroups.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        allGroups.push(group);
      }
    }

    let filtered = allGroups;
    if (status) {
      filtered = filtered.filter(g => g.status === status);
    }

    return filtered
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
      .slice(0, limit);
  }

  // Get service statistics
  getServiceStats(): {
    totalRules: number;
    activeRules: number;
    totalAlerts: number;
    firingAlerts: number;
    resolvedAlerts: number;
    totalGroups: number;
    firingGroups: number;
    totalCorrelations: number;
    activeCorrelations: number;
  } {
    let totalAlerts = 0;
    let firingAlerts = 0;
    let resolvedAlerts = 0;

    for (const alerts of this.alerts.values()) {
      totalAlerts += alerts.length;
      firingAlerts += alerts.filter(a => a.status === 'firing').length;
      resolvedAlerts += alerts.filter(a => a.status === 'resolved').length;
    }

    let firingGroups = 0;
    for (const group of this.alertGroups.values()) {
      if (group.status === 'firing') firingGroups++;
    }

    return {
      totalRules: this.alertRules.size,
      activeRules: Array.from(this.alertRules.values()).filter(r => r.enabled).length,
      totalAlerts,
      firingAlerts,
      resolvedAlerts,
      totalGroups: this.alertGroups.size,
      firingGroups,
      totalCorrelations: this.alertCorrelations.size,
      activeCorrelations: Array.from(this.alertCorrelations.values()).filter(c => c.isActive).length
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    let cleaned = 0;

    for (const [key, alerts] of this.alerts.entries()) {
      const filtered = alerts.filter(a => a.startsAt > cutoffDate);
      if (filtered.length !== alerts.length) {
        this.alerts.set(key, filtered);
        cleaned += alerts.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      alertingLogger.info('Advanced alerting cleanup completed', { cleaned });
    }
  }

  private generateAlertRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
