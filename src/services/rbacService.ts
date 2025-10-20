import { User, Permission, Organization } from '../types/organization';
import { rbacLogger } from '../utils/logger';

export interface Resource {
  type: string;
  id: string;
  orgId: string;
  metadata?: Record<string, any>;
}

export interface AccessRequest {
  user: User;
  resource: Resource;
  action: string;
  context?: Record<string, any>;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  expiresAt?: Date;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  canBeAssigned: boolean;
}

export class RBACService {
  private roles: Map<string, RoleDefinition> = new Map();
  private userRoles: Map<string, Set<string>> = new Map(); // userId -> Set of role names
  private resourcePolicies: Map<string, Array<{
    role: string;
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
  }>> = new Map();

  constructor() {
    this.initializeSystemRoles();
    rbacLogger.info('RBACService initialized');
  }

  private initializeSystemRoles(): void {
    // System roles
    const systemRoles: RoleDefinition[] = [
      {
        name: 'super_admin',
        description: 'Super administrator with full system access',
        permissions: [
          { resource: '*', actions: ['*'] },
        ],
        isSystemRole: true,
        canBeAssigned: false,
      },
      {
        name: 'org_admin',
        description: 'Organization administrator',
        permissions: [
          { resource: 'users', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'rpc', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'alerts', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'metrics', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'billing', actions: ['read', 'write', 'admin'] },
          { resource: 'settings', actions: ['read', 'write', 'admin'] },
        ],
        isSystemRole: true,
        canBeAssigned: true,
      },
      {
        name: 'developer',
        description: 'Developer with technical access',
        permissions: [
          { resource: 'rpc', actions: ['read', 'write'] },
          { resource: 'alerts', actions: ['read', 'write'] },
          { resource: 'metrics', actions: ['read', 'write'] },
          { resource: 'users', actions: ['read'] },
        ],
        isSystemRole: true,
        canBeAssigned: true,
      },
      {
        name: 'viewer',
        description: 'Read-only access',
        permissions: [
          { resource: 'rpc', actions: ['read'] },
          { resource: 'alerts', actions: ['read'] },
          { resource: 'metrics', actions: ['read'] },
        ],
        isSystemRole: true,
        canBeAssigned: true,
      },
      {
        name: 'billing_manager',
        description: 'Billing and cost management access',
        permissions: [
          { resource: 'billing', actions: ['read', 'write', 'admin'] },
          { resource: 'usage', actions: ['read', 'write'] },
          { resource: 'metrics', actions: ['read'] },
          { resource: 'settings', actions: ['read'] },
        ],
        isSystemRole: true,
        canBeAssigned: true,
      },
    ];

    systemRoles.forEach(role => {
      this.roles.set(role.name, role);
    });
  }

  // Check if user has access to a resource
  async checkAccess(request: AccessRequest): Promise<AccessDecision> {
    const { user, resource, action, context } = request;

    // Check if user is active
    if (!user.isActive) {
      return {
        allowed: false,
        reason: 'User account is inactive',
      };
    }

    // Check if user belongs to the same organization
    if (user.orgId !== resource.orgId) {
      return {
        allowed: false,
        reason: 'User does not belong to the resource organization',
      };
    }

    // Get user roles
    const userRoles = this.getUserRoles(user.id);
    if (userRoles.size === 0) {
      return {
        allowed: false,
        reason: 'User has no assigned roles',
      };
    }

    // Check each role for permissions
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (!role) continue;

      const hasPermission = this.checkRolePermission(role, resource, action, context);
      if (hasPermission.allowed) {
        return hasPermission;
      }
    }

    // Check resource-specific policies
    const resourcePolicy = this.resourcePolicies.get(resource.type);
    if (resourcePolicy) {
      for (const policy of resourcePolicy) {
        if (userRoles.has(policy.role) &&
            policy.resource === resource.type &&
            policy.actions.includes(action)) {

          // Check conditions if any
          if (policy.conditions && !this.evaluateConditions(policy.conditions, context)) {
            continue;
          }

          return {
            allowed: true,
            conditions: policy.conditions,
          };
        }
      }
    }

    return {
      allowed: false,
      reason: 'Insufficient permissions',
    };
  }

  private checkRolePermission(
    role: RoleDefinition,
    resource: Resource,
    action: string,
    context?: Record<string, any>,
  ): AccessDecision {
    for (const permission of role.permissions) {
      // Check if resource matches
      if (permission.resource === '*' || permission.resource === resource.type) {
        // Check if action is allowed
        if (permission.actions.includes('*') || permission.actions.includes(action)) {
          // Check conditions if any
          if (permission.conditions && !this.evaluateConditions(permission.conditions, context)) {
            continue;
          }

          return {
            allowed: true,
            conditions: permission.conditions,
          };
        }
      }
    }

    return {
      allowed: false,
      reason: 'Role does not have required permissions',
    };
  }

  private evaluateConditions(conditions: Record<string, any>, context?: Record<string, any>): boolean {
    if (!context) return true;

    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = context[key];

      if (typeof expectedValue === 'object' && expectedValue.operator) {
        // Complex condition with operator
        switch (expectedValue.operator) {
        case 'equals':
          if (actualValue !== expectedValue.value) return false;
          break;
        case 'not_equals':
          if (actualValue === expectedValue.value) return false;
          break;
        case 'greater_than':
          if (actualValue <= expectedValue.value) return false;
          break;
        case 'less_than':
          if (actualValue >= expectedValue.value) return false;
          break;
        case 'in':
          if (!expectedValue.value.includes(actualValue)) return false;
          break;
        case 'not_in':
          if (expectedValue.value.includes(actualValue)) return false;
          break;
        case 'contains':
          if (!actualValue || !actualValue.includes(expectedValue.value)) return false;
          break;
        case 'regex':
          if (!new RegExp(expectedValue.value).test(actualValue)) return false;
          break;
        default:
          return false;
        }
      } else {
        // Simple equality check
        if (actualValue !== expectedValue) return false;
      }
    }

    return true;
  }

  // Assign role to user
  async assignRole(userId: string, roleName: string): Promise<boolean> {
    const role = this.roles.get(roleName);
    if (!role) {
      rbacLogger.error('Role not found', { roleName });
      return false;
    }

    if (!role.canBeAssigned) {
      rbacLogger.error('Role cannot be assigned', { roleName });
      return false;
    }

    const userRoles = this.getUserRoles(userId);
    userRoles.add(roleName);
    this.userRoles.set(userId, userRoles);

    rbacLogger.info('Role assigned to user', { userId, roleName });
    return true;
  }

  // Remove role from user
  async removeRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = this.getUserRoles(userId);
    const removed = userRoles.delete(roleName);

    if (removed) {
      this.userRoles.set(userId, userRoles);
      rbacLogger.info('Role removed from user', { userId, roleName });
    }

    return removed;
  }

  // Get user roles
  getUserRoles(userId: string): Set<string> {
    return this.userRoles.get(userId) || new Set();
  }

  // Get all roles
  getAllRoles(): RoleDefinition[] {
    return Array.from(this.roles.values());
  }

  // Get assignable roles
  getAssignableRoles(): RoleDefinition[] {
    return Array.from(this.roles.values()).filter(role => role.canBeAssigned);
  }

  // Create custom role
  async createRole(role: Omit<RoleDefinition, 'isSystemRole' | 'canBeAssigned'>): Promise<boolean> {
    if (this.roles.has(role.name)) {
      rbacLogger.error('Role already exists', { roleName: role.name });
      return false;
    }

    const customRole: RoleDefinition = {
      ...role,
      isSystemRole: false,
      canBeAssigned: true,
    };

    this.roles.set(role.name, customRole);
    rbacLogger.info('Custom role created', { roleName: role.name });
    return true;
  }

  // Update role
  async updateRole(roleName: string, updates: Partial<RoleDefinition>): Promise<boolean> {
    const role = this.roles.get(roleName);
    if (!role) {
      rbacLogger.error('Role not found', { roleName });
      return false;
    }

    if (role.isSystemRole) {
      rbacLogger.error('Cannot modify system role', { roleName });
      return false;
    }

    const updatedRole = { ...role, ...updates };
    this.roles.set(roleName, updatedRole);
    rbacLogger.info('Role updated', { roleName });
    return true;
  }

  // Delete role
  async deleteRole(roleName: string): Promise<boolean> {
    const role = this.roles.get(roleName);
    if (!role) {
      rbacLogger.error('Role not found', { roleName });
      return false;
    }

    if (role.isSystemRole) {
      rbacLogger.error('Cannot delete system role', { roleName });
      return false;
    }

    // Check if role is assigned to any users
    for (const [userId, roles] of this.userRoles.entries()) {
      if (roles.has(roleName)) {
        rbacLogger.error('Cannot delete role that is assigned to users', { roleName, userId });
        return false;
      }
    }

    this.roles.delete(roleName);
    rbacLogger.info('Role deleted', { roleName });
    return true;
  }

  // Add resource policy
  async addResourcePolicy(
    resourceType: string,
    role: string,
    actions: string[],
    conditions?: Record<string, any>,
  ): Promise<void> {
    const policies = this.resourcePolicies.get(resourceType) || [];
    policies.push({ role, resource: resourceType, actions, conditions });
    this.resourcePolicies.set(resourceType, policies);

    rbacLogger.info('Resource policy added', { resourceType, role, actions });
  }

  // Remove resource policy
  async removeResourcePolicy(
    resourceType: string,
    role: string,
    actions: string[],
  ): Promise<void> {
    const policies = this.resourcePolicies.get(resourceType) || [];
    const filtered = policies.filter(p =>
      !(p.role === role && p.actions.length === actions.length &&
        p.actions.every(action => actions.includes(action))),
    );
    this.resourcePolicies.set(resourceType, filtered);

    rbacLogger.info('Resource policy removed', { resourceType, role, actions });
  }

  // Get user permissions
  async getUserPermissions(user: User): Promise<Permission[]> {
    const userRoles = this.getUserRoles(user.id);
    const permissions: Permission[] = [];

    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    return permissions;
  }

  // Check if user can perform action on resource type
  async canPerformAction(
    user: User,
    resourceType: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    const request: AccessRequest = {
      user,
      resource: {
        type: resourceType,
        id: '*',
        orgId: user.orgId,
      },
      action,
      context,
    };

    const decision = await this.checkAccess(request);
    return decision.allowed;
  }

  // Get accessible resources for user
  async getAccessibleResources(
    user: User,
    resourceType: string,
    action: string,
  ): Promise<string[]> {
    // This would typically query a database for resources the user can access
    // For now, we'll return a placeholder
    const permissions = await this.getUserPermissions(user);
    const hasPermission = permissions.some(p =>
      (p.resource === '*' || p.resource === resourceType) &&
      (p.actions.includes('*') || p.actions.includes(action)),
    );

    return hasPermission ? ['*'] : [];
  }

  // Get role statistics
  getRoleStatistics(): {
    totalRoles: number;
    systemRoles: number;
    customRoles: number;
    assignedRoles: number;
    unassignedRoles: number;
    } {
    const totalRoles = this.roles.size;
    const systemRoles = Array.from(this.roles.values()).filter(r => r.isSystemRole).length;
    const customRoles = totalRoles - systemRoles;

    const assignedRoles = new Set();
    for (const roles of this.userRoles.values()) {
      roles.forEach(role => assignedRoles.add(role));
    }

    return {
      totalRoles,
      systemRoles,
      customRoles,
      assignedRoles: assignedRoles.size,
      unassignedRoles: totalRoles - assignedRoles.size,
    };
  }

  // Get user role assignments
  getUserRoleAssignments(): Array<{
    userId: string;
    roles: string[];
    assignedAt: Date;
  }> {
    const assignments: Array<{
      userId: string;
      roles: string[];
      assignedAt: Date;
    }> = [];

    for (const [userId, roles] of this.userRoles.entries()) {
      assignments.push({
        userId,
        roles: Array.from(roles),
        assignedAt: new Date(), // This would be tracked in a real implementation
      });
    }

    return assignments;
  }

  // Cleanup service
  cleanup(): void {
    this.roles.clear();
    this.userRoles.clear();
    this.resourcePolicies.clear();
    rbacLogger.info('RBACService cleanup completed');
  }
}
