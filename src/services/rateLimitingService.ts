import { Organization, User } from '../types/organization';
import { rateLimitLogger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
}

export interface QuotaInfo {
  orgId: string;
  userId: string;
  endpoint: string;
  current: number;
  limit: number;
  resetTime: Date;
  remaining: number;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  quota: QuotaInfo;
  reason?: string;
}

export class RateLimitingService {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private organizationLimits: Map<string, RateLimitConfig> = new Map();
  private userLimits: Map<string, RateLimitConfig> = new Map();
  private endpointLimits: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.initializeDefaultLimits();
    rateLimitLogger.info('RateLimitingService initialized');
  }

  private initializeDefaultLimits(): void {
    // Default organization limits based on plan
    this.organizationLimits.set('free', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100 // 100 requests per minute
    });

    this.organizationLimits.set('pro', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000 // 1000 requests per minute
    });

    this.organizationLimits.set('enterprise', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10000 // 10000 requests per minute
    });

    // Default user limits
    this.userLimits.set('default', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 50 // 50 requests per minute per user
    });

    // Endpoint-specific limits
    this.endpointLimits.set('/api/metrics', {
      windowMs: 60 * 1000,
      maxRequests: 10 // 10 requests per minute for metrics
    });

    this.endpointLimits.set('/api/alerts', {
      windowMs: 60 * 1000,
      maxRequests: 20 // 20 requests per minute for alerts
    });

    this.endpointLimits.set('/api/rpcs', {
      windowMs: 60 * 1000,
      maxRequests: 30 // 30 requests per minute for RPCs
    });
  }

  // Check if request is allowed
  async checkRateLimit(
    org: Organization,
    user: User,
    endpoint: string,
    ip?: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    
    // Get limits for organization, user, and endpoint
    const orgLimit = this.organizationLimits.get(org.plan) || this.organizationLimits.get('free')!;
    const userLimit = this.userLimits.get('default')!;
    const endpointLimit = this.endpointLimits.get(endpoint);

    // Create keys for different scopes
    const orgKey = `org:${org.id}`;
    const userKey = `user:${user.id}`;
    const endpointKey = `endpoint:${endpoint}`;
    const ipKey = ip ? `ip:${ip}` : null;

    // Check organization-level rate limit
    const orgResult = await this.checkLimit(orgKey, orgLimit, now);
    if (!orgResult.allowed) {
      return {
        allowed: false,
        quota: {
          orgId: org.id,
          userId: user.id,
          endpoint,
          current: orgResult.current,
          limit: orgResult.limit,
          resetTime: new Date(orgResult.resetTime),
          remaining: orgResult.remaining,
          retryAfter: orgResult.retryAfter
        },
        reason: 'Organization rate limit exceeded'
      };
    }

    // Check user-level rate limit
    const userResult = await this.checkLimit(userKey, userLimit, now);
    if (!userResult.allowed) {
      return {
        allowed: false,
        quota: {
          orgId: org.id,
          userId: user.id,
          endpoint,
          current: userResult.current,
          limit: userResult.limit,
          resetTime: new Date(userResult.resetTime),
          remaining: userResult.remaining,
          retryAfter: userResult.retryAfter
        },
        reason: 'User rate limit exceeded'
      };
    }

    // Check endpoint-specific rate limit
    if (endpointLimit) {
      const endpointResult = await this.checkLimit(endpointKey, endpointLimit, now);
      if (!endpointResult.allowed) {
        return {
          allowed: false,
          quota: {
            orgId: org.id,
            userId: user.id,
            endpoint,
            current: endpointResult.current,
            limit: endpointResult.limit,
            resetTime: new Date(endpointResult.resetTime),
            remaining: endpointResult.remaining,
            retryAfter: endpointResult.retryAfter
          },
          reason: 'Endpoint rate limit exceeded'
        };
      }
    }

    // Check IP-based rate limit if provided
    if (ipKey) {
      const ipLimit = {
        windowMs: 60 * 1000,
        maxRequests: 200 // 200 requests per minute per IP
      };
      const ipResult = await this.checkLimit(ipKey, ipLimit, now);
      if (!ipResult.allowed) {
        return {
          allowed: false,
          quota: {
            orgId: org.id,
            userId: user.id,
            endpoint,
            current: ipResult.current,
            limit: ipResult.limit,
            resetTime: new Date(ipResult.resetTime),
            remaining: ipResult.remaining,
            retryAfter: ipResult.retryAfter
          },
          reason: 'IP rate limit exceeded'
        };
      }
    }

    // All checks passed
    return {
      allowed: true,
      quota: {
        orgId: org.id,
        userId: user.id,
        endpoint,
        current: Math.min(orgResult.current, userResult.current),
        limit: Math.min(orgResult.limit, userResult.limit),
        resetTime: new Date(Math.min(orgResult.resetTime, userResult.resetTime)),
        remaining: Math.min(orgResult.remaining, userResult.remaining)
      }
    };
  }

  private async checkLimit(
    key: string,
    config: RateLimitConfig,
    now: number
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    resetTime: number;
    remaining: number;
    retryAfter?: number;
  }> {
    const existing = this.requestCounts.get(key);
    const resetTime = now + config.windowMs;

    if (!existing || existing.resetTime <= now) {
      // New window or expired window
      this.requestCounts.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        current: 1,
        limit: config.maxRequests,
        resetTime,
        remaining: config.maxRequests - 1
      };
    }

    // Existing window
    const current = existing.count + 1;
    const allowed = current <= config.maxRequests;
    
    if (allowed) {
      existing.count = current;
      this.requestCounts.set(key, existing);
    }

    const remaining = Math.max(0, config.maxRequests - current);
    const retryAfter = allowed ? undefined : Math.ceil((existing.resetTime - now) / 1000);

    return {
      allowed,
      current,
      limit: config.maxRequests,
      resetTime: existing.resetTime,
      remaining,
      retryAfter
    };
  }

  // Record a successful request
  async recordRequest(orgId: string, userId: string, endpoint: string, ip?: string): Promise<void> {
    const now = Date.now();
    const orgKey = `org:${orgId}`;
    const userKey = `user:${userId}`;
    const endpointKey = `endpoint:${endpoint}`;
    const ipKey = ip ? `ip:${ip}` : null;

    // Increment counters for all applicable limits
    this.incrementCounter(orgKey, now);
    this.incrementCounter(userKey, now);
    this.incrementCounter(endpointKey, now);
    if (ipKey) {
      this.incrementCounter(ipKey, now);
    }

    rateLimitLogger.debug('Request recorded', { orgId, userId, endpoint, ip });
  }

  private incrementCounter(key: string, now: number): void {
    const existing = this.requestCounts.get(key);
    if (existing && existing.resetTime > now) {
      existing.count++;
      this.requestCounts.set(key, existing);
    }
  }

  // Get current quota information
  async getQuotaInfo(orgId: string, userId: string, endpoint: string): Promise<QuotaInfo> {
    const now = Date.now();
    const orgKey = `org:${orgId}`;
    const userKey = `user:${userId}`;
    const endpointKey = `endpoint:${endpoint}`;

    const orgLimit = this.organizationLimits.get('free')!; // Default to free plan
    const userLimit = this.userLimits.get('default')!;
    const endpointLimit = this.endpointLimits.get(endpoint);

    const orgInfo = this.getCounterInfo(orgKey, orgLimit, now);
    const userInfo = this.getCounterInfo(userKey, userLimit, now);
    const endpointInfo = endpointLimit ? this.getCounterInfo(endpointKey, endpointLimit, now) : null;

    // Return the most restrictive quota
    const quotas = [orgInfo, userInfo, endpointInfo].filter(Boolean);
    const mostRestrictive = quotas.reduce((min, current) => 
      current.remaining < min.remaining ? current : min
    );

    return {
      orgId,
      userId,
      endpoint,
      current: mostRestrictive.current,
      limit: mostRestrictive.limit,
      resetTime: new Date(mostRestrictive.resetTime),
      remaining: mostRestrictive.remaining
    };
  }

  private getCounterInfo(
    key: string,
    config: RateLimitConfig,
    now: number
  ): {
    current: number;
    limit: number;
    resetTime: number;
    remaining: number;
  } {
    const existing = this.requestCounts.get(key);
    
    if (!existing || existing.resetTime <= now) {
      return {
        current: 0,
        limit: config.maxRequests,
        resetTime: now + config.windowMs,
        remaining: config.maxRequests
      };
    }

    return {
      current: existing.count,
      limit: config.maxRequests,
      resetTime: existing.resetTime,
      remaining: Math.max(0, config.maxRequests - existing.count)
    };
  }

  // Set custom limits for organization
  async setOrganizationLimits(orgId: string, plan: string, customLimits?: Partial<RateLimitConfig>): Promise<void> {
    const baseLimit = this.organizationLimits.get(plan) || this.organizationLimits.get('free')!;
    const customKey = `org_custom:${orgId}`;
    
    this.organizationLimits.set(customKey, {
      ...baseLimit,
      ...customLimits
    });

    rateLimitLogger.info('Organization limits updated', { orgId, plan, customLimits });
  }

  // Set custom limits for user
  async setUserLimits(userId: string, customLimits: Partial<RateLimitConfig>): Promise<void> {
    const baseLimit = this.userLimits.get('default')!;
    const customKey = `user_custom:${userId}`;
    
    this.userLimits.set(customKey, {
      ...baseLimit,
      ...customLimits
    });

    rateLimitLogger.info('User limits updated', { userId, customLimits });
  }

  // Set custom limits for endpoint
  async setEndpointLimits(endpoint: string, customLimits: Partial<RateLimitConfig>): Promise<void> {
    const baseLimit = this.endpointLimits.get(endpoint) || {
      windowMs: 60 * 1000,
      maxRequests: 100
    };
    
    this.endpointLimits.set(endpoint, {
      ...baseLimit,
      ...customLimits
    });

    rateLimitLogger.info('Endpoint limits updated', { endpoint, customLimits });
  }

  // Get rate limit statistics
  async getRateLimitStats(): Promise<{
    totalKeys: number;
    activeWindows: number;
    topOrganizations: Array<{ orgId: string; requests: number }>;
    topUsers: Array<{ userId: string; requests: number }>;
    topEndpoints: Array<{ endpoint: string; requests: number }>;
  }> {
    const now = Date.now();
    const activeWindows = Array.from(this.requestCounts.entries())
      .filter(([_, data]) => data.resetTime > now);

    const orgStats = new Map<string, number>();
    const userStats = new Map<string, number>();
    const endpointStats = new Map<string, number>();

    for (const [key, data] of activeWindows) {
      if (key.startsWith('org:')) {
        const orgId = key.replace('org:', '');
        orgStats.set(orgId, (orgStats.get(orgId) || 0) + data.count);
      } else if (key.startsWith('user:')) {
        const userId = key.replace('user:', '');
        userStats.set(userId, (userStats.get(userId) || 0) + data.count);
      } else if (key.startsWith('endpoint:')) {
        const endpoint = key.replace('endpoint:', '');
        endpointStats.set(endpoint, (endpointStats.get(endpoint) || 0) + data.count);
      }
    }

    return {
      totalKeys: this.requestCounts.size,
      activeWindows: activeWindows.length,
      topOrganizations: Array.from(orgStats.entries())
        .map(([orgId, requests]) => ({ orgId, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      topUsers: Array.from(userStats.entries())
        .map(([userId, requests]) => ({ userId, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      topEndpoints: Array.from(endpointStats.entries())
        .map(([endpoint, requests]) => ({ endpoint, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10)
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, data] of this.requestCounts.entries()) {
      if (data.resetTime <= now) {
        this.requestCounts.delete(key);
        cleaned++;
      }
    }

    rateLimitLogger.info('Rate limiting cleanup completed', { cleaned });
  }

  // Reset limits for a specific key
  async resetLimits(key: string): Promise<void> {
    this.requestCounts.delete(key);
    rateLimitLogger.info('Limits reset for key', { key });
  }

  // Get all active limits
  async getActiveLimits(): Promise<Array<{
    key: string;
    current: number;
    limit: number;
    resetTime: Date;
    remaining: number;
  }>> {
    const now = Date.now();
    const active = [];

    for (const [key, data] of this.requestCounts.entries()) {
      if (data.resetTime > now) {
        const limit = this.getLimitForKey(key);
        active.push({
          key,
          current: data.count,
          limit: limit.maxRequests,
          resetTime: new Date(data.resetTime),
          remaining: Math.max(0, limit.maxRequests - data.count)
        });
      }
    }

    return active;
  }

  private getLimitForKey(key: string): RateLimitConfig {
    if (key.startsWith('org:')) {
      return this.organizationLimits.get('free')!;
    } else if (key.startsWith('user:')) {
      return this.userLimits.get('default')!;
    } else if (key.startsWith('endpoint:')) {
      const endpoint = key.replace('endpoint:', '');
      return this.endpointLimits.get(endpoint) || {
        windowMs: 60 * 1000,
        maxRequests: 100
      };
    } else if (key.startsWith('ip:')) {
      return {
        windowMs: 60 * 1000,
        maxRequests: 200
      };
    }
    
    return {
      windowMs: 60 * 1000,
      maxRequests: 100
    };
  }
}
