import { User, RPCConfig } from '../types';
import { userLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private users: Map<string, User> = new Map();
  private userRPCs: Map<string, RPCConfig[]> = new Map();

  constructor() {
    userLogger.info('UserService initialized');
    this.initializeDefaultUser();
  }

  /**
   * Initialize a default user for development
   */
  private initializeDefaultUser(): void {
    const defaultUser: User = {
      id: 'default',
      username: 'default',
      email: 'default@example.com',
      createdAt: new Date(),
      rpcConfigs: []
    };

    this.users.set(defaultUser.id, defaultUser);
    this.userRPCs.set(defaultUser.id, []);
    userLogger.info('Default user initialized');
  }

  /**
   * Create a new user
   */
  async createUser(username: string, email: string): Promise<User> {
    const userId = uuidv4();
    const user: User = {
      id: userId,
      username,
      email,
      createdAt: new Date(),
      rpcConfigs: []
    };

    this.users.set(userId, user);
    this.userRPCs.set(userId, []);

    userLogger.info('New user created', { userId, username, email });
    return user;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Add RPC configuration to a user
   */
  async addUserRPC(userId: string, rpcConfig: Omit<RPCConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RPCConfig | null> {
    const user = this.users.get(userId);
    if (!user) {
      userLogger.warn('User not found for RPC addition', { userId });
      return null;
    }

    const rpcId = uuidv4();
    const now = new Date();
    
    const newRPC: RPCConfig = {
      ...rpcConfig,
      id: rpcId,
      userId,
      createdAt: now,
      updatedAt: now
    };

    // Add to user's RPC configs
    user.rpcConfigs.push(newRPC);
    
    // Add to userRPCs map
    const userRPCs = this.userRPCs.get(userId) || [];
    userRPCs.push(newRPC);
    this.userRPCs.set(userId, userRPCs);

    userLogger.info('RPC configuration added to user', { 
      userId, 
      rpcId, 
      rpcName: newRPC.name 
    });

    return newRPC;
  }

  /**
   * Update user's RPC configuration
   */
  async updateUserRPC(userId: string, rpcId: string, updates: Partial<RPCConfig>): Promise<RPCConfig | null> {
    const user = this.users.get(userId);
    if (!user) {
      userLogger.warn('User not found for RPC update', { userId });
      return null;
    }

    const rpcIndex = user.rpcConfigs.findIndex(rpc => rpc.id === rpcId);
    if (rpcIndex === -1) {
      userLogger.warn('RPC configuration not found for update', { userId, rpcId });
      return null;
    }

    const updatedRPC = {
      ...user.rpcConfigs[rpcIndex],
      ...updates,
      updatedAt: new Date()
    };

    user.rpcConfigs[rpcIndex] = updatedRPC;

    // Update in userRPCs map
    const userRPCs = this.userRPCs.get(userId) || [];
    const userRPCIndex = userRPCs.findIndex(rpc => rpc.id === rpcId);
    if (userRPCIndex !== -1) {
      userRPCs[userRPCIndex] = updatedRPC;
      this.userRPCs.set(userId, userRPCs);
    }

    userLogger.info('RPC configuration updated', { userId, rpcId, rpcName: updatedRPC.name });
    return updatedRPC;
  }

  /**
   * Remove RPC configuration from user
   */
  async removeUserRPC(userId: string, rpcId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      userLogger.warn('User not found for RPC removal', { userId });
      return false;
    }

    const rpcIndex = user.rpcConfigs.findIndex(rpc => rpc.id === rpcId);
    if (rpcIndex === -1) {
      userLogger.warn('RPC configuration not found for removal', { userId, rpcId });
      return false;
    }

    const removedRPC = user.rpcConfigs[rpcIndex];
    user.rpcConfigs.splice(rpcIndex, 1);

    // Remove from userRPCs map
    const userRPCs = this.userRPCs.get(userId) || [];
    const userRPCIndex = userRPCs.findIndex(rpc => rpc.id === rpcId);
    if (userRPCIndex !== -1) {
      userRPCs.splice(userRPCIndex, 1);
      this.userRPCs.set(userId, userRPCs);
    }

    userLogger.info('RPC configuration removed from user', { 
      userId, 
      rpcId, 
      rpcName: removedRPC.name 
    });

    return true;
  }

  /**
   * Get all RPC configurations for a user
   */
  getUserRPCs(userId: string): RPCConfig[] {
    return this.userRPCs.get(userId) || [];
  }

  /**
   * Get all alerts for a specific user
   */
  getUserAlerts(userId: string, resolved: boolean = false): any[] {
    // For now, return empty array since alerts are managed by AlertService
    // This method should be enhanced to filter alerts by user's RPCs
    return [];
  }

  /**
   * Get a specific RPC configuration for a user
   */
  getUserRPC(userId: string, rpcId: string): RPCConfig | undefined {
    const userRPCs = this.userRPCs.get(userId);
    return userRPCs?.find(rpc => rpc.id === rpcId);
  }

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Delete user and all their RPC configurations
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      userLogger.warn('User not found for deletion', { userId });
      return false;
    }

    // Remove user's RPCs
    this.userRPCs.delete(userId);
    
    // Remove user
    this.users.delete(userId);

    userLogger.info('User deleted', { userId, username: user.username });
    return true;
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): { totalRPCs: number; enabledRPCs: number; disabledRPCs: number } {
    const userRPCs = this.userRPCs.get(userId) || [];
    const totalRPCs = userRPCs.length;
    const enabledRPCs = userRPCs.filter(rpc => rpc.enabled).length;
    const disabledRPCs = totalRPCs - enabledRPCs;

    return { totalRPCs, enabledRPCs, disabledRPCs };
  }

  /**
   * Get system statistics
   */
  getSystemStats(): { totalUsers: number; totalRPCs: number; activeUsers: number } {
    const totalUsers = this.users.size;
    let totalRPCs = 0;
    let activeUsers = 0;

    for (const user of this.users.values()) {
      totalRPCs += user.rpcConfigs.length;
      if (user.rpcConfigs.length > 0) {
        activeUsers++;
      }
    }

    return { totalUsers, totalRPCs, activeUsers };
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    this.users.clear();
    this.userRPCs.clear();
    userLogger.info('UserService cleanup completed');
  }
}
