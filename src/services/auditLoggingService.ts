import { Organization, User } from '../types/organization';
import { auditLogger } from '../utils/logger';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  orgId: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' | 'compliance';
  outcome: 'success' | 'failure' | 'error';
  riskScore: number; // 0-100
  tags: string[];
}

export interface AuditQuery {
  orgId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  category?: string;
  severity?: string;
  outcome?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byOutcome: Record<string, number>;
  byUser: Array<{ userId: string; count: number }>;
  byAction: Array<{ action: string; count: number }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export class AuditLoggingService {
  private auditEvents: Map<string, AuditEvent> = new Map();
  private eventIndex: Map<string, Set<string>> = new Map(); // Index for fast queries
  private retentionDays: number = 90; // Keep audit logs for 90 days

  constructor() {
    this.initializeIndexes();
    this.startCleanupTimer();
    auditLogger.info('AuditLoggingService initialized');
  }

  private initializeIndexes(): void {
    // Initialize index maps
    this.eventIndex.set('orgId', new Set());
    this.eventIndex.set('userId', new Set());
    this.eventIndex.set('action', new Set());
    this.eventIndex.set('resource', new Set());
    this.eventIndex.set('category', new Set());
    this.eventIndex.set('severity', new Set());
    this.eventIndex.set('outcome', new Set());
  }

  private startCleanupTimer(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  // Log an audit event
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'riskScore'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(event)
    };

    this.auditEvents.set(auditEvent.id, auditEvent);
    this.updateIndexes(auditEvent);

    auditLogger.info('Audit event logged', {
      id: auditEvent.id,
      orgId: auditEvent.orgId,
      userId: auditEvent.userId,
      action: auditEvent.action,
      resource: auditEvent.resource,
      severity: auditEvent.severity,
      category: auditEvent.category,
      outcome: auditEvent.outcome,
      riskScore: auditEvent.riskScore
    });

    return auditEvent;
  }

  // Log authentication events
  async logAuthentication(
    orgId: string,
    userId: string,
    userEmail: string,
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled',
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<AuditEvent> {
    const severity = this.getAuthenticationSeverity(action);
    const outcome = action.includes('failed') ? 'failure' : 'success';

    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource: 'authentication',
      details,
      ipAddress,
      userAgent,
      sessionId,
      severity,
      category: 'authentication',
      outcome,
      tags: ['auth', action]
    });
  }

  // Log authorization events
  async logAuthorization(
    orgId: string,
    userId: string,
    userEmail: string,
    action: 'access_granted' | 'access_denied' | 'permission_changed' | 'role_changed',
    resource: string,
    resourceId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditEvent> {
    const severity = action === 'access_denied' ? 'high' : 'medium';
    const outcome = action === 'access_denied' ? 'failure' : 'success';

    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity,
      category: 'authorization',
      outcome,
      tags: ['authz', action]
    });
  }

  // Log data access events
  async logDataAccess(
    orgId: string,
    userId: string,
    userEmail: string,
    action: 'read' | 'export' | 'download',
    resource: string,
    resourceId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditEvent> {
    const severity = this.getDataAccessSeverity(action, details);
    const outcome = 'success';

    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity,
      category: 'data_access',
      outcome,
      tags: ['data', action]
    });
  }

  // Log data modification events
  async logDataModification(
    orgId: string,
    userId: string,
    userEmail: string,
    action: 'create' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete',
    resource: string,
    resourceId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditEvent> {
    const severity = this.getDataModificationSeverity(action, details);
    const outcome = 'success';

    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity,
      category: 'data_modification',
      outcome,
      tags: ['data', action]
    });
  }

  // Log system events
  async logSystemEvent(
    orgId: string,
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    outcome: 'success' | 'failure' | 'error' = 'success'
  ): Promise<AuditEvent> {
    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource,
      details,
      severity,
      category: 'system',
      outcome,
      tags: ['system', action]
    });
  }

  // Log security events
  async logSecurityEvent(
    orgId: string,
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    outcome: 'success' | 'failure' | 'error' = 'failure'
  ): Promise<AuditEvent> {
    return this.logEvent({
      orgId,
      userId,
      userEmail,
      action,
      resource,
      details,
      severity,
      category: 'security',
      outcome,
      tags: ['security', action]
    });
  }

  // Query audit events
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    let events = Array.from(this.auditEvents.values());

    // Apply filters
    if (query.orgId) {
      events = events.filter(e => e.orgId === query.orgId);
    }
    if (query.userId) {
      events = events.filter(e => e.userId === query.userId);
    }
    if (query.action) {
      events = events.filter(e => e.action === query.action);
    }
    if (query.resource) {
      events = events.filter(e => e.resource === query.resource);
    }
    if (query.category) {
      events = events.filter(e => e.category === query.category);
    }
    if (query.severity) {
      events = events.filter(e => e.severity === query.severity);
    }
    if (query.outcome) {
      events = events.filter(e => e.outcome === query.outcome);
    }
    if (query.startDate) {
      events = events.filter(e => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      events = events.filter(e => e.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    events = events.slice(offset, offset + limit);

    return events;
  }

  // Get audit statistics
  async getAuditStats(orgId?: string, timeRange?: { start: Date; end: Date }): Promise<AuditStats> {
    let events = Array.from(this.auditEvents.values());

    // Filter by organization
    if (orgId) {
      events = events.filter(e => e.orgId === orgId);
    }

    // Filter by time range
    if (timeRange) {
      events = events.filter(e => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    const stats: AuditStats = {
      totalEvents: events.length,
      byCategory: {},
      bySeverity: {},
      byOutcome: {},
      byUser: [],
      byAction: [],
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      timeRange: {
        start: timeRange?.start || new Date(0),
        end: timeRange?.end || new Date()
      }
    };

    // Count by category
    events.forEach(event => {
      stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      stats.byOutcome[event.outcome] = (stats.byOutcome[event.outcome] || 0) + 1;

      // Risk distribution
      if (event.riskScore >= 80) stats.riskDistribution.critical++;
      else if (event.riskScore >= 60) stats.riskDistribution.high++;
      else if (event.riskScore >= 40) stats.riskDistribution.medium++;
      else stats.riskDistribution.low++;
    });

    // Count by user
    const userCounts = new Map<string, number>();
    events.forEach(event => {
      userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
    });
    stats.byUser = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count by action
    const actionCounts = new Map<string, number>();
    events.forEach(event => {
      actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
    });
    stats.byAction = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  // Get high-risk events
  async getHighRiskEvents(orgId?: string, limit: number = 50): Promise<AuditEvent[]> {
    let events = Array.from(this.auditEvents.values());

    if (orgId) {
      events = events.filter(e => e.orgId === orgId);
    }

    return events
      .filter(e => e.riskScore >= 70)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  // Get events by user
  async getEventsByUser(userId: string, limit: number = 100): Promise<AuditEvent[]> {
    return this.queryEvents({
      userId,
      limit
    });
  }

  // Get events by resource
  async getEventsByResource(resource: string, resourceId?: string, limit: number = 100): Promise<AuditEvent[]> {
    return this.queryEvents({
      resource,
      limit
    });
  }

  // Export audit logs
  async exportAuditLogs(query: AuditQuery, format: 'json' | 'csv' = 'json'): Promise<string> {
    const events = await this.queryEvents(query);

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // CSV format
      const headers = ['id', 'timestamp', 'orgId', 'userId', 'userEmail', 'action', 'resource', 'resourceId', 'severity', 'category', 'outcome', 'riskScore', 'ipAddress', 'userAgent'];
      const rows = events.map(event => [
        event.id,
        event.timestamp.toISOString(),
        event.orgId,
        event.userId,
        event.userEmail,
        event.action,
        event.resource,
        event.resourceId || '',
        event.severity,
        event.category,
        event.outcome,
        event.riskScore,
        event.ipAddress || '',
        event.userAgent || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  // Private helper methods
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateRiskScore(event: Omit<AuditEvent, 'id' | 'timestamp' | 'riskScore'>): number {
    let score = 0;

    // Base score by severity
    switch (event.severity) {
      case 'low': score += 10; break;
      case 'medium': score += 30; break;
      case 'high': score += 60; break;
      case 'critical': score += 90; break;
    }

    // Adjust by category
    switch (event.category) {
      case 'security': score += 20; break;
      case 'data_modification': score += 15; break;
      case 'authorization': score += 10; break;
      case 'authentication': score += 5; break;
    }

    // Adjust by outcome
    if (event.outcome === 'failure') score += 15;
    if (event.outcome === 'error') score += 10;

    // Adjust by action
    if (event.action.includes('delete')) score += 20;
    if (event.action.includes('bulk')) score += 15;
    if (event.action.includes('denied')) score += 25;

    return Math.min(100, Math.max(0, score));
  }

  private getAuthenticationSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'login_failed': return 'high';
      case 'password_reset': return 'medium';
      case 'mfa_enabled':
      case 'mfa_disabled': return 'medium';
      case 'login': return 'low';
      case 'logout': return 'low';
      default: return 'low';
    }
  }

  private getDataAccessSeverity(action: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (action === 'export' || action === 'download') {
      return details.recordCount > 1000 ? 'high' : 'medium';
    }
    return 'low';
  }

  private getDataModificationSeverity(action: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'delete': return 'high';
      case 'bulk_delete': return 'critical';
      case 'bulk_update': return 'high';
      case 'update': return 'medium';
      case 'create': return 'low';
      default: return 'medium';
    }
  }

  private updateIndexes(event: AuditEvent): void {
    this.eventIndex.get('orgId')?.add(event.orgId);
    this.eventIndex.get('userId')?.add(event.userId);
    this.eventIndex.get('action')?.add(event.action);
    this.eventIndex.get('resource')?.add(event.resource);
    this.eventIndex.get('category')?.add(event.category);
    this.eventIndex.get('severity')?.add(event.severity);
    this.eventIndex.get('outcome')?.add(event.outcome);
  }

  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, event] of this.auditEvents.entries()) {
      if (event.timestamp < cutoffDate) {
        this.auditEvents.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      auditLogger.info('Audit logs cleanup completed', { cleaned });
    }
  }

  // Get service statistics
  getServiceStats(): {
    totalEvents: number;
    retentionDays: number;
    indexSizes: Record<string, number>;
  } {
    return {
      totalEvents: this.auditEvents.size,
      retentionDays: this.retentionDays,
      indexSizes: {
        orgId: this.eventIndex.get('orgId')?.size || 0,
        userId: this.eventIndex.get('userId')?.size || 0,
        action: this.eventIndex.get('action')?.size || 0,
        resource: this.eventIndex.get('resource')?.size || 0,
        category: this.eventIndex.get('category')?.size || 0,
        severity: this.eventIndex.get('severity')?.size || 0,
        outcome: this.eventIndex.get('outcome')?.size || 0
      }
    };
  }
}
