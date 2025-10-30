import { Server as SocketIOServer } from 'socket.io';
import { dashboardLogger } from '../utils/logger';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  title: string;
  data: any;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval: number; // milliseconds
  lastUpdated: Date;
  isVisible: boolean;
}

export interface Dashboard {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'freeform';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastViewed: Date;
}

export interface RealTimeMetric {
  id: string;
  orgId: string;
  rpcId?: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }>;
}

export interface LiveAlert {
  id: string;
  orgId: string;
  rpcId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class RealTimeDashboardService {
  private io: SocketIOServer;
  private dashboards: Map<string, Dashboard> = new Map();
  private realTimeMetrics: Map<string, RealTimeMetric[]> = new Map();
  private liveAlerts: Map<string, LiveAlert[]> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // orgId -> Set of socketIds
  private widgetUpdateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
    this.startRealTimeUpdates();
    dashboardLogger.info('RealTimeDashboardService initialized');
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      dashboardLogger.info('Client connected', { socketId: socket.id });

      // Join organization room
      socket.on('join-org', (orgId: string) => {
        socket.join(`org:${orgId}`);
        if (!this.activeConnections.has(orgId)) {
          this.activeConnections.set(orgId, new Set());
        }
        this.activeConnections.get(orgId)!.add(socket.id);
        dashboardLogger.info('Client joined organization', { socketId: socket.id, orgId });
      });

      // Leave organization room
      socket.on('leave-org', (orgId: string) => {
        socket.leave(`org:${orgId}`);
        const connections = this.activeConnections.get(orgId);
        if (connections) {
          connections.delete(socket.id);
          if (connections.size === 0) {
            this.activeConnections.delete(orgId);
          }
        }
        dashboardLogger.info('Client left organization', { socketId: socket.id, orgId });
      });

      // Subscribe to dashboard updates
      socket.on('subscribe-dashboard', (dashboardId: string) => {
        socket.join(`dashboard:${dashboardId}`);
        dashboardLogger.info('Client subscribed to dashboard', { socketId: socket.id, dashboardId });
      });

      // Unsubscribe from dashboard updates
      socket.on('unsubscribe-dashboard', (dashboardId: string) => {
        socket.leave(`dashboard:${dashboardId}`);
        dashboardLogger.info('Client unsubscribed from dashboard', { socketId: socket.id, dashboardId });
      });

      // Request dashboard data
      socket.on('get-dashboard', (dashboardId: string) => {
        const dashboard = this.dashboards.get(dashboardId);
        if (dashboard) {
          socket.emit('dashboard-data', dashboard);
        }
      });

      // Request real-time metrics
      socket.on('get-metrics', (orgId: string) => {
        const metrics = this.realTimeMetrics.get(orgId) || [];
        socket.emit('metrics-data', metrics);
      });

      // Request live alerts
      socket.on('get-alerts', (orgId: string) => {
        const alerts = this.liveAlerts.get(orgId) || [];
        socket.emit('alerts-data', alerts);
      });

      // Acknowledge alert
      socket.on('acknowledge-alert', (alertId: string, userId: string) => {
        this.acknowledgeAlert(alertId, userId);
      });

      // Update widget position
      socket.on('update-widget-position', (dashboardId: string, widgetId: string, position: any) => {
        this.updateWidgetPosition(dashboardId, widgetId, position);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        dashboardLogger.info('Client disconnected', { socketId: socket.id });
        // Clean up connections
        for (const [orgId, connections] of this.activeConnections.entries()) {
          connections.delete(socket.id);
          if (connections.size === 0) {
            this.activeConnections.delete(orgId);
          }
        }
      });
    });
  }

  private startRealTimeUpdates(): void {
    // Update real-time metrics every 5 seconds
    setInterval(() => {
      this.updateRealTimeMetrics();
    }, 5000);

    // Update live alerts every 10 seconds
    setInterval(() => {
      this.updateLiveAlerts();
    }, 10000);

    // Update dashboard widgets every 30 seconds
    setInterval(() => {
      this.updateDashboardWidgets();
    }, 30000);
  }

  // Create dashboard
  async createDashboard(
    orgId: string,
    userId: string,
    name: string,
    description: string = '',
    layout: 'grid' | 'freeform' = 'grid',
  ): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: this.generateDashboardId(),
      orgId,
      userId,
      name,
      description,
      widgets: [],
      layout,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewed: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    dashboardLogger.info('Dashboard created', { dashboardId: dashboard.id, orgId, userId });

    return dashboard;
  }

  // Add widget to dashboard
  async addWidget(
    dashboardId: string,
    widget: Omit<DashboardWidget, 'id' | 'lastUpdated'>,
  ): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const newWidget: DashboardWidget = {
      ...widget,
      id: this.generateWidgetId(),
      lastUpdated: new Date(),
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    // Start widget update interval
    this.startWidgetUpdates(dashboardId, newWidget.id, newWidget.refreshInterval);

    // Notify subscribers
    this.io.to(`dashboard:${dashboardId}`).emit('widget-added', newWidget);

    dashboardLogger.info('Widget added to dashboard', { dashboardId, widgetId: newWidget.id });
    return newWidget;
  }

  // Remove widget from dashboard
  async removeWidget(dashboardId: string, widgetId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return false;

    dashboard.widgets.splice(widgetIndex, 1);
    dashboard.updatedAt = new Date();

    // Stop widget update interval
    const intervalKey = `${dashboardId}:${widgetId}`;
    const interval = this.widgetUpdateIntervals.get(intervalKey);
    if (interval) {
      clearInterval(interval);
      this.widgetUpdateIntervals.delete(intervalKey);
    }

    // Notify subscribers
    this.io.to(`dashboard:${dashboardId}`).emit('widget-removed', widgetId);

    dashboardLogger.info('Widget removed from dashboard', { dashboardId, widgetId });
    return true;
  }

  // Update widget data
  async updateWidgetData(dashboardId: string, widgetId: string, data: any): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    widget.data = data;
    widget.lastUpdated = new Date();
    dashboard.updatedAt = new Date();

    // Notify subscribers
    this.io.to(`dashboard:${dashboardId}`).emit('widget-updated', {
      widgetId,
      data,
      lastUpdated: widget.lastUpdated,
    });
  }

  // Update widget position
  private updateWidgetPosition(dashboardId: string, widgetId: string, position: any): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    widget.position = { ...widget.position, ...position };
    dashboard.updatedAt = new Date();

    // Notify other subscribers
    this.io.to(`dashboard:${dashboardId}`).emit('widget-position-updated', {
      widgetId,
      position: widget.position,
    });
  }

  // Start widget updates
  private startWidgetUpdates(dashboardId: string, widgetId: string, refreshInterval: number): void {
    const intervalKey = `${dashboardId}:${widgetId}`;

    const interval = setInterval(async() => {
      await this.updateWidgetDataInternal(dashboardId, widgetId);
    }, refreshInterval);

    this.widgetUpdateIntervals.set(intervalKey, interval);
  }

  // Update widget data based on type
  private async updateWidgetDataInternal(dashboardId: string, widgetId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    let newData: any;

    switch (widget.type) {
    case 'metric':
      newData = await this.generateMetricData(dashboard.orgId, widget.data);
      break;
    case 'chart':
      newData = await this.generateChartData(dashboard.orgId, widget.data);
      break;
    case 'table':
      newData = await this.generateTableData(dashboard.orgId, widget.data);
      break;
    case 'alert':
      newData = await this.generateAlertData(dashboard.orgId, widget.data);
      break;
    case 'status':
      newData = await this.generateStatusData(dashboard.orgId, widget.data);
      break;
    default:
      return;
    }

    await this.updateWidgetData(dashboardId, widgetId, newData);
  }

  // Generate metric data
  private async generateMetricData(orgId: string, config: any): Promise<any> {
    const metrics = this.realTimeMetrics.get(orgId) || [];
    const latestMetrics = metrics.slice(-10); // Last 10 metrics

    return {
      current: latestMetrics[latestMetrics.length - 1]?.value || 0,
      previous: latestMetrics[latestMetrics.length - 2]?.value || 0,
      trend: latestMetrics[latestMetrics.length - 1]?.trend || 'stable',
      changePercent: latestMetrics[latestMetrics.length - 1]?.changePercent || 0,
      unit: latestMetrics[latestMetrics.length - 1]?.unit || '',
      history: latestMetrics.map(m => ({
        value: m.value,
        timestamp: m.timestamp,
      })),
    };
  }

  // Generate chart data
  private async generateChartData(orgId: string, config: any): Promise<ChartData> {
    const metrics = this.realTimeMetrics.get(orgId) || [];
    const timeRange = config.timeRange || 24; // hours
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    const labels = filteredMetrics.map(m => m.timestamp.toISOString());
    const datasets = [{
      label: config.metricName || 'Value',
      data: filteredMetrics.map(m => m.value),
      backgroundColor: config.backgroundColor || 'rgba(54, 162, 235, 0.2)',
      borderColor: config.borderColor || 'rgba(54, 162, 235, 1)',
      fill: config.fill || false,
    }];

    return { labels, datasets };
  }

  // Generate table data
  private async generateTableData(orgId: string, config: any): Promise<any> {
    const alerts = this.liveAlerts.get(orgId) || [];
    const metrics = this.realTimeMetrics.get(orgId) || [];

    switch (config.dataType) {
    case 'alerts':
      return alerts.slice(-20).map(alert => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        isAcknowledged: alert.isAcknowledged,
      }));
    case 'metrics':
      return metrics.slice(-20).map(metric => ({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        trend: metric.trend,
        timestamp: metric.timestamp,
      }));
    default:
      return [];
    }
  }

  // Generate alert data
  private async generateAlertData(orgId: string, config: any): Promise<any> {
    const alerts = this.liveAlerts.get(orgId) || [];
    const unacknowledged = alerts.filter(a => !a.isAcknowledged);
    const critical = unacknowledged.filter(a => a.severity === 'critical');
    const high = unacknowledged.filter(a => a.severity === 'high');

    return {
      total: alerts.length,
      unacknowledged: unacknowledged.length,
      critical: critical.length,
      high: high.length,
      recent: alerts.slice(-5),
    };
  }

  // Generate status data
  private async generateStatusData(orgId: string, config: any): Promise<any> {
    const metrics = this.realTimeMetrics.get(orgId) || [];
    const latest = metrics[metrics.length - 1];

    return {
      status: latest ? 'online' : 'offline',
      lastUpdate: latest?.timestamp || new Date(),
      uptime: this.calculateUptime(orgId),
      health: this.calculateHealth(orgId),
    };
  }

  // Update real-time metrics
  private updateRealTimeMetrics(): void {
    for (const [orgId, connections] of this.activeConnections.entries()) {
      if (connections.size === 0) continue;

      const metrics = this.generateRealTimeMetrics(orgId);
      this.realTimeMetrics.set(orgId, metrics);

      // Emit to organization room
      this.io.to(`org:${orgId}`).emit('metrics-update', metrics);
    }
  }

  // Generate real-time metrics
  private generateRealTimeMetrics(orgId: string): RealTimeMetric[] {
    const metrics: RealTimeMetric[] = [];
    const now = new Date();

    // RPC Status metrics
    metrics.push({
      id: `rpc-status-${orgId}`,
      orgId,
      name: 'RPC Status',
      value: Math.random() > 0.1 ? 1 : 0, // 90% uptime
      unit: 'status',
      trend: 'stable',
      changePercent: 0,
      timestamp: now,
    });

    // Response Time metrics
    const responseTime = Math.random() * 1000 + 100; // 100-1100ms
    metrics.push({
      id: `response-time-${orgId}`,
      orgId,
      name: 'Response Time',
      value: responseTime,
      unit: 'ms',
      trend: responseTime > 500 ? 'up' : 'down',
      changePercent: Math.random() * 20 - 10, // -10% to +10%
      timestamp: now,
    });

    // Throughput metrics
    const throughput = Math.random() * 1000 + 100; // 100-1100 TPS
    metrics.push({
      id: `throughput-${orgId}`,
      orgId,
      name: 'Throughput',
      value: throughput,
      unit: 'TPS',
      trend: throughput > 500 ? 'up' : 'down',
      changePercent: Math.random() * 30 - 15, // -15% to +15%
      timestamp: now,
    });

    // Error Rate metrics
    const errorRate = Math.random() * 5; // 0-5%
    metrics.push({
      id: `error-rate-${orgId}`,
      orgId,
      name: 'Error Rate',
      value: errorRate,
      unit: '%',
      trend: errorRate > 2 ? 'up' : 'down',
      changePercent: Math.random() * 50 - 25, // -25% to +25%
      timestamp: now,
    });

    return metrics;
  }

  // Update live alerts
  private updateLiveAlerts(): void {
    for (const [orgId, connections] of this.activeConnections.entries()) {
      if (connections.size === 0) continue;

      const alerts = this.generateLiveAlerts(orgId);
      this.liveAlerts.set(orgId, alerts);

      // Emit to organization room
      this.io.to(`org:${orgId}`).emit('alerts-update', alerts);
    }
  }

  // Generate live alerts
  private generateLiveAlerts(orgId: string): LiveAlert[] {
    const alerts: LiveAlert[] = [];
    const now = new Date();

    // Simulate occasional alerts
    if (Math.random() < 0.1) { // 10% chance of new alert
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      alerts.push({
        id: `alert-${Date.now()}`,
        orgId,
        severity,
        message: `Simulated ${severity} alert for organization ${orgId}`,
        timestamp: now,
        isAcknowledged: false,
      });
    }

    return alerts;
  }

  // Update dashboard widgets
  private updateDashboardWidgets(): void {
    for (const [dashboardId, dashboard] of this.dashboards.entries()) {
      for (const widget of dashboard.widgets) {
        this.updateWidgetDataInternal(dashboardId, widget.id);
      }
    }
  }

  // Acknowledge alert
  private acknowledgeAlert(alertId: string, userId: string): void {
    for (const [orgId, alerts] of this.liveAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();

        // Notify organization room
        this.io.to(`org:${orgId}`).emit('alert-acknowledged', {
          alertId,
          acknowledgedBy: userId,
          acknowledgedAt: alert.acknowledgedAt,
        });

        dashboardLogger.info('Alert acknowledged', { alertId, userId, orgId });
        break;
      }
    }
  }

  // Calculate uptime
  private calculateUptime(orgId: string): number {
    const metrics = this.realTimeMetrics.get(orgId) || [];
    if (metrics.length === 0) return 0;

    const uptimeMetrics = metrics.filter(m => m.name === 'RPC Status');
    const uptimeCount = uptimeMetrics.filter(m => m.value === 1).length;
    return uptimeCount / uptimeMetrics.length * 100;
  }

  // Calculate health score
  private calculateHealth(orgId: string): number {
    const metrics = this.realTimeMetrics.get(orgId) || [];
    if (metrics.length === 0) return 0;

    let healthScore = 100;

    // Check response time
    const responseTimeMetric = metrics.find(m => m.name === 'Response Time');
    if (responseTimeMetric && responseTimeMetric.value > 1000) {
      healthScore -= 20;
    }

    // Check error rate
    const errorRateMetric = metrics.find(m => m.name === 'Error Rate');
    if (errorRateMetric && errorRateMetric.value > 5) {
      healthScore -= 30;
    }

    // Check throughput
    const throughputMetric = metrics.find(m => m.name === 'Throughput');
    if (throughputMetric && throughputMetric.value < 100) {
      healthScore -= 15;
    }

    return Math.max(0, healthScore);
  }

  // Get dashboard
  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  // Get dashboards for organization
  getDashboardsForOrganization(orgId: string): Dashboard[] {
    return Array.from(this.dashboards.values()).filter(d => d.orgId === orgId);
  }

  // Get dashboards for user
  getDashboardsForUser(orgId: string, userId: string): Dashboard[] {
    return Array.from(this.dashboards.values()).filter(d => d.orgId === orgId && d.userId === userId);
  }

  // Delete dashboard
  async deleteDashboard(dashboardId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    // Stop all widget update intervals
    for (const widget of dashboard.widgets) {
      const intervalKey = `${dashboardId}:${widget.id}`;
      const interval = this.widgetUpdateIntervals.get(intervalKey);
      if (interval) {
        clearInterval(interval);
        this.widgetUpdateIntervals.delete(intervalKey);
      }
    }

    this.dashboards.delete(dashboardId);
    dashboardLogger.info('Dashboard deleted', { dashboardId });
    return true;
  }

  // Get service statistics
  getServiceStats(): {
    totalDashboards: number;
    totalWidgets: number;
    activeConnections: number;
    totalMetrics: number;
    totalAlerts: number;
    } {
    let totalWidgets = 0;
    for (const dashboard of this.dashboards.values()) {
      totalWidgets += dashboard.widgets.length;
    }

    let totalMetrics = 0;
    for (const metrics of this.realTimeMetrics.values()) {
      totalMetrics += metrics.length;
    }

    let totalAlerts = 0;
    for (const alerts of this.liveAlerts.values()) {
      totalAlerts += alerts.length;
    }

    return {
      totalDashboards: this.dashboards.size,
      totalWidgets,
      activeConnections: Array.from(this.activeConnections.values()).reduce((sum, set) => sum + set.size, 0),
      totalMetrics,
      totalAlerts,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    let cleaned = 0;

    for (const [key, metrics] of this.realTimeMetrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoffDate);
      if (filtered.length !== metrics.length) {
        this.realTimeMetrics.set(key, filtered);
        cleaned += metrics.length - filtered.length;
      }
    }

    for (const [key, alerts] of this.liveAlerts.entries()) {
      const filtered = alerts.filter(a => a.timestamp > cutoffDate);
      if (filtered.length !== alerts.length) {
        this.liveAlerts.set(key, filtered);
        cleaned += alerts.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      dashboardLogger.info('Real-time dashboard cleanup completed', { cleaned });
    }
  }

  private generateDashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWidgetId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
