import { BaseModel } from './base.model';
import { UserRole, Industry, OrganizationPlan } from '../dto/auth.dto';

export class User extends BaseModel {
  public email: string;
  public firstName: string;
  public lastName: string;
  public name: string; // Computed: firstName + lastName
  public role: UserRole;
  public avatar?: string;
  public phoneNumber?: string;
  public jobTitle?: string;
  public company?: string;
  public website?: string;
  public bio?: string;
  public timezone?: string;
  public organizationId?: string;
  public department?: string;
  public managerEmail?: string;
  public lastLoginAt?: Date;
  public isActive: boolean;
  public emailVerified: boolean;
  public marketingConsent: boolean;
  public twoFactorEnabled: boolean;
  public preferences: UserPreferences;

  constructor(data: Partial<User> = {}) {
    super(data);
    this.email = data.email || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.name = `${this.firstName} ${this.lastName}`.trim();
    this.role = data.role || UserRole.USER;
    this.avatar = data.avatar;
    this.phoneNumber = data.phoneNumber;
    this.jobTitle = data.jobTitle;
    this.company = data.company;
    this.website = data.website;
    this.bio = data.bio;
    this.timezone = data.timezone || 'UTC';
    this.organizationId = data.organizationId;
    this.department = data.department;
    this.managerEmail = data.managerEmail;
    this.lastLoginAt = data.lastLoginAt;
    this.isActive = data.isActive ?? true;
    this.emailVerified = data.emailVerified ?? false;
    this.marketingConsent = data.marketingConsent ?? false;
    this.twoFactorEnabled = data.twoFactorEnabled ?? false;
    this.preferences = data.preferences || new UserPreferences();
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.name,
      role: this.role,
      avatar: this.avatar,
      phoneNumber: this.phoneNumber,
      jobTitle: this.jobTitle,
      company: this.company,
      website: this.website,
      bio: this.bio,
      timezone: this.timezone,
      organizationId: this.organizationId,
      department: this.department,
      managerEmail: this.managerEmail,
      lastLoginAt: this.lastLoginAt,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      marketingConsent: this.marketingConsent,
      twoFactorEnabled: this.twoFactorEnabled,
      preferences: this.preferences
    };
  }

  // Helper methods
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  isOrgAdmin(): boolean {
    return this.role === UserRole.ORG_ADMIN || this.isAdmin();
  }

  canAccessOrganization(orgId: string): boolean {
    return this.isAdmin() || this.organizationId === orgId;
  }

  getDisplayName(): string {
    return this.name || this.email;
  }

  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
}

export class UserPreferences {
  public theme: 'light' | 'dark' | 'auto';
  public language: string;
  public notifications: NotificationPreferences;
  public dashboard: DashboardPreferences;
  public alerts: AlertPreferences;

  constructor(data: Partial<UserPreferences> = {}) {
    this.theme = data.theme || 'auto';
    this.language = data.language || 'en';
    this.notifications = data.notifications || new NotificationPreferences();
    this.dashboard = data.dashboard || new DashboardPreferences();
    this.alerts = data.alerts || new AlertPreferences();
  }
}

export class NotificationPreferences {
  public email: boolean;
  public push: boolean;
  public sms: boolean;
  public slack: boolean;
  public discord: boolean;

  constructor(data: Partial<NotificationPreferences> = {}) {
    this.email = data.email ?? true;
    this.push = data.push ?? true;
    this.sms = data.sms ?? false;
    this.slack = data.slack ?? false;
    this.discord = data.discord ?? false;
  }
}

export class DashboardPreferences {
  public defaultView: 'overview' | 'rpc' | 'alerts' | 'analytics';
  public refreshInterval: number; // seconds
  public showAdvancedMetrics: boolean;
  public compactMode: boolean;

  constructor(data: Partial<DashboardPreferences> = {}) {
    this.defaultView = data.defaultView || 'overview';
    this.refreshInterval = data.refreshInterval || 30;
    this.showAdvancedMetrics = data.showAdvancedMetrics ?? false;
    this.compactMode = data.compactMode ?? false;
  }
}

export class AlertPreferences {
  public severity: 'low' | 'medium' | 'high' | 'critical';
  public channels: string[];
  public quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };

  constructor(data: Partial<AlertPreferences> = {}) {
    this.severity = data.severity || 'medium';
    this.channels = data.channels || ['email'];
    this.quietHours = data.quietHours || {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC'
    };
  }
}