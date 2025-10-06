import { Organization, User, OrganizationLimits, OrganizationStats, UsageMetrics } from '../types/organization';
import { organizationLogger } from '../utils/logger';

export class OrganizationService {
  private organizations: Map<string, Organization> = new Map();
  private users: Map<string, User> = new Map();
  private usageMetrics: Map<string, UsageMetrics[]> = new Map();

  constructor() {
    this.initializeDefaultOrganization();
    organizationLogger.info('OrganizationService initialized');
  }

  private initializeDefaultOrganization() {
    // Create a default organization for existing users
    const defaultOrg: Organization = {
      id: 'default',
      name: 'Default Organization',
      slug: 'default',
      plan: 'free',
      limits: {
        maxRPCs: 5,
        maxUsers: 3,
        dataRetentionDays: 7,
        apiCallsPerMonth: 10000,
        maxAlerts: 50,
        maxCustomMetrics: 10,
        maxWebhooks: 2
      },
      settings: {
        timezone: 'UTC',
        alertChannels: [],
        customMetrics: [],
        slaThresholds: {
          uptime: 99.9,
          responseTime: 5000,
          errorRate: 1.0,
          availability: 99.5
        },
        notificationPreferences: {
          emailAlerts: true,
          slackAlerts: false,
          webhookAlerts: false,
          alertFrequency: 'immediate',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
            timezone: 'UTC'
          }
        },
        dataRetention: {
          metrics: 7,
          logs: 3,
          alerts: 30,
          traces: 1
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.organizations.set('default', defaultOrg);

    // Create a default user
    const defaultUser: User = {
      id: 'default-user',
      orgId: 'default',
      email: 'admin@example.com',
      name: 'Default Admin',
      role: 'admin',
      permissions: [
        { resource: 'metrics', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'alerts', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'rpc', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'users', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'billing', actions: ['read', 'write', 'admin'] }
      ],
      preferences: {
        dashboardLayout: 'default',
        defaultTimeRange: '24h',
        alertLevel: 'all',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          inApp: true,
          push: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.users.set('default-user', defaultUser);
  }

  // Organization Management
  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const org: Organization = {
      ...orgData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.organizations.set(org.id, org);
    organizationLogger.info('Organization created', { orgId: org.id, name: org.name });
    return org;
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    return this.organizations.get(orgId) || null;
  }

  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<Organization | null> {
    const org = this.organizations.get(orgId);
    if (!org) return null;

    const updatedOrg = {
      ...org,
      ...updates,
      updatedAt: new Date()
    };

    this.organizations.set(orgId, updatedOrg);
    organizationLogger.info('Organization updated', { orgId, updates: Object.keys(updates) });
    return updatedOrg;
  }

  async deleteOrganization(orgId: string): Promise<boolean> {
    if (orgId === 'default') {
      organizationLogger.warn('Cannot delete default organization');
      return false;
    }

    const deleted = this.organizations.delete(orgId);
    if (deleted) {
      // Also remove all users from this organization
      for (const [userId, user] of this.users.entries()) {
        if (user.orgId === orgId) {
          this.users.delete(userId);
        }
      }
      organizationLogger.info('Organization deleted', { orgId });
    }
    return deleted;
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Check organization limits
    const org = this.organizations.get(userData.orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const currentUsers = Array.from(this.users.values()).filter(u => u.orgId === userData.orgId).length;
    if (currentUsers >= org.limits.maxUsers) {
      throw new Error('Organization user limit exceeded');
    }

    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    organizationLogger.info('User created', { userId: user.id, orgId: user.orgId, role: user.role });
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getUsersByOrganization(orgId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.orgId === orgId);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(userId, updatedUser);
    organizationLogger.info('User updated', { userId, updates: Object.keys(updates) });
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (userId === 'default-user') {
      organizationLogger.warn('Cannot delete default user');
      return false;
    }

    const deleted = this.users.delete(userId);
    if (deleted) {
      organizationLogger.info('User deleted', { userId });
    }
    return deleted;
  }

  // Usage Tracking
  async recordUsage(orgId: string, userId: string, usage: Partial<UsageMetrics>): Promise<void> {
    const key = `${orgId}:${userId}`;
    const existing = this.usageMetrics.get(key) || [];
    
    const usageRecord: UsageMetrics = {
      orgId,
      userId,
      timestamp: new Date(),
      apiCalls: 0,
      dataTransfer: 0,
      storageUsed: 0,
      rpcRequests: 0,
      alertsGenerated: 0,
      customMetrics: 0,
      ...usage
    };

    existing.push(usageRecord);
    
    // Keep only last 1000 records per user
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.usageMetrics.set(key, existing);
  }

  async getUsageStats(orgId: string, timeRange: { start: Date; end: Date }): Promise<UsageMetrics[]> {
    const allUsage: UsageMetrics[] = [];
    
    for (const [key, usage] of this.usageMetrics.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = usage.filter(u => 
          u.timestamp >= timeRange.start && u.timestamp <= timeRange.end
        );
        allUsage.push(...filtered);
      }
    }

    return allUsage;
  }

  async getOrganizationStats(orgId: string): Promise<OrganizationStats> {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const users = await this.getUsersByOrganization(orgId);
    const usage = await this.getUsageStats(orgId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    const totalApiCalls = usage.reduce((sum, u) => sum + u.apiCalls, 0);
    const totalDataTransfer = usage.reduce((sum, u) => sum + u.dataTransfer, 0);

    return {
      orgId,
      totalRPCs: 0, // This will be populated by the RPC service
      activeRPCs: 0, // This will be populated by the RPC service
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalAlerts: 0, // This will be populated by the alert service
      activeAlerts: 0, // This will be populated by the alert service
      apiCallsThisMonth: totalApiCalls,
      dataTransferThisMonth: totalDataTransfer,
      uptime: 99.9, // This will be calculated from actual data
      lastUpdated: new Date()
    };
  }

  // Permission Checking
  hasPermission(user: User, resource: string, action: string): boolean {
    const permission = user.permissions.find(p => p.resource === resource);
    if (!permission) return false;
    
    return permission.actions.includes(action) || permission.actions.includes('admin');
  }

  canAccessOrganization(user: User, orgId: string): boolean {
    return user.orgId === orgId && user.isActive;
  }

  canAccessUser(user: User, targetUserId: string): boolean {
    if (user.role === 'admin') return true;
    return user.id === targetUserId;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
