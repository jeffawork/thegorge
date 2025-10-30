export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  limits: OrganizationLimits;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface OrganizationLimits {
  maxRPCs: number;
  maxUsers: number;
  dataRetentionDays: number;
  apiCallsPerMonth: number;
  maxAlerts: number;
  maxCustomMetrics: number;
  maxWebhooks: number;
}

export interface OrganizationSettings {
  timezone: string;
  alertChannels: AlertChannel[];
  customMetrics: string[];
  slaThresholds: SLASettings;
  notificationPreferences: NotificationPreferences;
  dataRetention: DataRetentionSettings;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'discord' | 'teams';
  name: string;
  config: Record<string, any>;
  isActive: boolean;
}

export interface SLASettings {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  availability: number; // percentage
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  slackAlerts: boolean;
  webhookAlerts: boolean;
  alertFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export interface DataRetentionSettings {
  metrics: number; // days
  logs: number; // days
  alerts: number; // days
  traces: number; // days
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer' | 'billing';
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface Permission {
  resource: string; // 'metrics', 'alerts', 'rpc', 'users', 'billing'
  actions: string[]; // ['read', 'write', 'delete', 'admin']
  conditions?: Record<string, any>; // Additional conditions
}

export interface UserPreferences {
  dashboardLayout: string;
  defaultTimeRange: string;
  alertLevel: 'all' | 'critical' | 'warning' | 'info';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
}

export interface UsageMetrics {
  orgId: string;
  userId?: string;
  timestamp: Date;
  apiCalls: number;
  dataTransfer: number; // bytes
  storageUsed: number; // bytes
  rpcRequests: number;
  alertsGenerated: number;
  customMetrics: number;
}

export interface OrganizationStats {
  orgId: string;
  totalRPCs: number;
  activeRPCs: number;
  totalUsers: number;
  activeUsers: number;
  totalAlerts: number;
  activeAlerts: number;
  apiCallsThisMonth: number;
  dataTransferThisMonth: number;
  uptime: number;
  lastUpdated: Date;
}
