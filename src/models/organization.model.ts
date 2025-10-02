import { BaseModel } from './base.model';
import { OrganizationPlan, Industry } from '../dto/auth.dto';

export class Organization extends BaseModel {
  public name: string;
  public slug: string;
  public description?: string;
  public plan: OrganizationPlan;
  public industry: Industry;
  public size?: string; // e.g., "1-10", "11-50", "51-200", "200+"
  public website?: string;
  public address?: string;
  public country?: string;
  public timezone: string;
  public isActive: boolean;
  public settings: OrganizationSettings;
  public limits: OrganizationLimits;
  public billing: OrganizationBilling;

  constructor(data: Partial<Organization> = {}) {
    super(data);
    this.name = data.name || '';
    this.slug = data.slug || '';
    this.description = data.description;
    this.plan = data.plan || OrganizationPlan.FREE;
    this.industry = data.industry || Industry.OTHER;
    this.size = data.size;
    this.website = data.website;
    this.address = data.address;
    this.country = data.country;
    this.timezone = data.timezone || 'UTC';
    this.isActive = data.isActive ?? true;
    this.settings = data.settings || new OrganizationSettings();
    this.limits = data.limits || new OrganizationLimits();
    this.billing = data.billing || new OrganizationBilling();
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      name: this.name,
      slug: this.slug,
      description: this.description,
      plan: this.plan,
      industry: this.industry,
      size: this.size,
      website: this.website,
      address: this.address,
      country: this.country,
      timezone: this.timezone,
      isActive: this.isActive,
      settings: this.settings,
      limits: this.limits,
      billing: this.billing
    };
  }

  // Helper methods
  isFreePlan(): boolean {
    return this.plan === OrganizationPlan.FREE;
  }

  isProPlan(): boolean {
    return this.plan === OrganizationPlan.PRO;
  }

  isEnterprisePlan(): boolean {
    return this.plan === OrganizationPlan.ENTERPRISE;
  }

  canAddMoreUsers(currentUserCount: number): boolean {
    return currentUserCount < this.limits.maxUsers;
  }

  canAddMoreRPCs(currentRpcCount: number): boolean {
    return currentRpcCount < this.limits.maxRPCs;
  }
}

export class OrganizationSettings {
  public alertChannels: AlertChannel[];
  public customMetrics: string[];
  public slaThresholds: SLASettings;
  public notificationPreferences: NotificationPreferences;
  public dataRetention: DataRetentionSettings;
  public security: SecuritySettings;

  constructor(data: Partial<OrganizationSettings> = {}) {
    this.alertChannels = data.alertChannels || [];
    this.customMetrics = data.customMetrics || [];
    this.slaThresholds = data.slaThresholds || new SLASettings();
    this.notificationPreferences = data.notificationPreferences || new NotificationPreferences();
    this.dataRetention = data.dataRetention || new DataRetentionSettings();
    this.security = data.security || new SecuritySettings();
  }
}

export class OrganizationLimits {
  public maxRPCs: number;
  public maxUsers: number;
  public dataRetentionDays: number;
  public apiCallsPerMonth: number;
  public maxCustomMetrics: number;
  public maxAlertsPerMonth: number;
  public maxWebhooks: number;
  public maxIntegrations: number;

  constructor(data: Partial<OrganizationLimits> = {}) {
    this.maxRPCs = data.maxRPCs || 5;
    this.maxUsers = data.maxUsers || 3;
    this.dataRetentionDays = data.dataRetentionDays || 30;
    this.apiCallsPerMonth = data.apiCallsPerMonth || 10000;
    this.maxCustomMetrics = data.maxCustomMetrics || 10;
    this.maxAlertsPerMonth = data.maxAlertsPerMonth || 100;
    this.maxWebhooks = data.maxWebhooks || 5;
    this.maxIntegrations = data.maxIntegrations || 3;
  }
}

export class OrganizationBilling {
  public billingEmail?: string;
  public billingAddress?: string;
  public paymentMethod?: string;
  public subscriptionId?: string;
  public nextBillingDate?: Date;
  public lastPaymentDate?: Date;
  public paymentStatus: 'active' | 'past_due' | 'canceled' | 'unpaid';

  constructor(data: Partial<OrganizationBilling> = {}) {
    this.billingEmail = data.billingEmail;
    this.billingAddress = data.billingAddress;
    this.paymentMethod = data.paymentMethod;
    this.subscriptionId = data.subscriptionId;
    this.nextBillingDate = data.nextBillingDate;
    this.lastPaymentDate = data.lastPaymentDate;
    this.paymentStatus = data.paymentStatus || 'active';
  }
}

export class AlertChannel {
  public id: string;
  public type: 'email' | 'slack' | 'webhook' | 'discord' | 'teams' | 'sms';
  public name: string;
  public config: Record<string, any>;
  public isActive: boolean;

  constructor(data: Partial<AlertChannel> = {}) {
    this.id = data.id || '';
    this.type = data.type || 'email';
    this.name = data.name || '';
    this.config = data.config || {};
    this.isActive = data.isActive ?? true;
  }
}

export class SLASettings {
  public uptime: number; // percentage
  public responseTime: number; // milliseconds
  public errorRate: number; // percentage

  constructor(data: Partial<SLASettings> = {}) {
    this.uptime = data.uptime || 99.9;
    this.responseTime = data.responseTime || 1000;
    this.errorRate = data.errorRate || 0.1;
  }
}

export class NotificationPreferences {
  public email: boolean;
  public slack: boolean;
  public webhook: boolean;
  public discord: boolean;
  public teams: boolean;
  public sms: boolean;

  constructor(data: Partial<NotificationPreferences> = {}) {
    this.email = data.email ?? true;
    this.slack = data.slack ?? false;
    this.webhook = data.webhook ?? false;
    this.discord = data.discord ?? false;
    this.teams = data.teams ?? false;
    this.sms = data.sms ?? false;
  }
}

export class DataRetentionSettings {
  public metrics: number; // days
  public logs: number; // days
  public alerts: number; // days
  public traces: number; // days

  constructor(data: Partial<DataRetentionSettings> = {}) {
    this.metrics = data.metrics || 30;
    this.logs = data.logs || 7;
    this.alerts = data.alerts || 90;
    this.traces = data.traces || 7;
  }
}

export class SecuritySettings {
  public twoFactorRequired: boolean;
  public ssoEnabled: boolean;
  public ipWhitelist: string[];
  public sessionTimeout: number; // minutes
  public passwordPolicy: PasswordPolicy;

  constructor(data: Partial<SecuritySettings> = {}) {
    this.twoFactorRequired = data.twoFactorRequired ?? false;
    this.ssoEnabled = data.ssoEnabled ?? false;
    this.ipWhitelist = data.ipWhitelist || [];
    this.sessionTimeout = data.sessionTimeout || 480; // 8 hours
    this.passwordPolicy = data.passwordPolicy || new PasswordPolicy();
  }
}

export class PasswordPolicy {
  public minLength: number;
  public requireUppercase: boolean;
  public requireLowercase: boolean;
  public requireNumbers: boolean;
  public requireSymbols: boolean;
  public maxAge: number; // days

  constructor(data: Partial<PasswordPolicy> = {}) {
    this.minLength = data.minLength || 8;
    this.requireUppercase = data.requireUppercase ?? true;
    this.requireLowercase = data.requireLowercase ?? true;
    this.requireNumbers = data.requireNumbers ?? true;
    this.requireSymbols = data.requireSymbols ?? false;
    this.maxAge = data.maxAge || 90;
  }
}
