import Web3 from 'web3';
import { RPCConfig, RPCStatus, HealthMetrics, SyncStatus } from '../types';
import { web3Logger } from '../utils/logger';

export class Web3Service {
  private connections: Map<string, Web3> = new Map();
  private connectionStatus: Map<string, boolean> = new Map();
  private lastHealthCheck: Map<string, Date> = new Map();
  private configs: RPCConfig[];

  constructor(configs: RPCConfig[]) {
    this.configs = configs;
    this.initializeConnections();
  }

  /**
   * Initialize Web3 connections for all configured RPCs
   */
  private async initializeConnections(): Promise<void> {
    for (const config of this.configs) {
      try {
        await this.createConnection(config);
      } catch (error) {
        web3Logger.error(`Failed to initialize connection for ${config.name}`, {
          url: config.url,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Create a Web3 connection for an RPC endpoint
   */
  private async createConnection(config: RPCConfig): Promise<void> {
    const connectionId = this.generateConnectionId(config);
    
    try {
      const web3 = new Web3(config.url);
      
      // Test the connection
      const isConnected = await this.testConnection(web3, config.timeout || 10000);
      
      if (isConnected) {
        this.connections.set(connectionId, web3);
        this.connectionStatus.set(connectionId, true);
        this.lastHealthCheck.set(connectionId, new Date());
        
        web3Logger.info(`Web3 connection established for ${config.name}`, {
          url: config.url,
          chainId: config.chainId
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      this.connectionStatus.set(connectionId, false);
      web3Logger.error(`Failed to create Web3 connection for ${config.name}`, {
        url: config.url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Test if a Web3 connection is working
   */
  private async testConnection(web3: Web3, timeout: number): Promise<boolean> {
    try {
      const blockNumber = await Promise.race([
        web3.eth.getBlockNumber(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeout)
        )
      ]);
      
      return typeof blockNumber === 'number' && blockNumber >= 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get connection ID for an RPC config
   */
  private generateConnectionId(config: RPCConfig): string {
    return `${config.network}_${config.chainId}_${config.name}`;
  }

  /**
   * Get Web3 instance for an RPC endpoint
   */
  getConnection(config: RPCConfig): Web3 | null {
    const connectionId = this.generateConnectionId(config);
    return this.connections.get(connectionId) || null;
  }

  /**
   * Check if a connection is active
   */
  isConnectionActive(config: RPCConfig): boolean {
    const connectionId = this.generateConnectionId(config);
    return this.connectionStatus.get(connectionId) || false;
  }

  /**
   * Perform health check for an RPC endpoint
   */
  async performHealthCheck(config: RPCConfig): Promise<HealthMetrics> {
    const startTime = Date.now();
    const connectionId = this.generateConnectionId(config);
    
    try {
      const web3 = this.getConnection(config);
      
      if (!web3) {
        throw new Error('No active connection');
      }

      // Get basic health metrics
      const [blockNumber, gasPrice, peerCount, isSyncing] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice(),
        web3.eth.net.getPeerCount(),
        this.checkSyncStatus(web3)
      ]);

      const responseTime = Date.now() - startTime;
      
      // Update connection status
      this.connectionStatus.set(connectionId, true);
      this.lastHealthCheck.set(connectionId, new Date());

      const metrics: HealthMetrics = {
        timestamp: new Date(),
        rpcId: connectionId,
        responseTime,
        isOnline: true,
        blockNumber: Number(blockNumber),
        gasPrice: gasPrice.toString(),
        peerCount: Number(peerCount),
        syncStatus: isSyncing
      };

      web3Logger.debug(`Health check completed for ${config.name}`, {
        responseTime,
        blockNumber,
        peerCount: Number(peerCount)
      });

      return metrics;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Update connection status
      this.connectionStatus.set(connectionId, false);
      
      const metrics: HealthMetrics = {
        timestamp: new Date(),
        rpcId: connectionId,
        responseTime,
        isOnline: false,
        blockNumber: null,
        gasPrice: null,
        peerCount: null,
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      web3Logger.warn(`Health check failed for ${config.name}`, {
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      });

      return metrics;
    }
  }

  /**
   * Check if the node is syncing
   */
  private async checkSyncStatus(web3: Web3): Promise<SyncStatus | undefined> {
    try {
      const syncing = await web3.eth.isSyncing();
      
      if (syncing === false) {
        return {
          isSyncing: false,
          currentBlock: 0,
          highestBlock: 0
        };
      }

      if (typeof syncing === 'object') {
        return {
          isSyncing: true,
          currentBlock: Number(syncing.currentBlock),
          highestBlock: Number(syncing.highestBlock),
          syncProgress: syncing.currentBlock && syncing.highestBlock 
            ? (Number(syncing.currentBlock) / Number(syncing.highestBlock)) * 100 
            : 0
        };
      }

      return undefined;
    } catch (error) {
      web3Logger.debug('Failed to check sync status', {
        error: error instanceof Error ? error.message : String(error)
      });
      return undefined;
    }
  }

  /**
   * Get current block number for an RPC endpoint
   */
  async getBlockNumber(config: RPCConfig): Promise<number | null> {
    try {
      const web3 = this.getConnection(config);
      if (!web3) return null;
      
      const blockNumber = await web3.eth.getBlockNumber();
      return Number(blockNumber);
    } catch (error) {
      web3Logger.error(`Failed to get block number for ${config.name}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Get gas price for an RPC endpoint
   */
  async getGasPrice(config: RPCConfig): Promise<string | null> {
    try {
      const web3 = this.getConnection(config);
      if (!web3) return null;
      
      const gasPrice = await web3.eth.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      web3Logger.error(`Failed to get gas price for ${config.name}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Get peer count for an RPC endpoint
   */
  async getPeerCount(config: RPCConfig): Promise<number | null> {
    try {
      const web3 = this.getConnection(config);
      if (!web3) return null;
      
      const peerCount = await web3.eth.net.getPeerCount();
      return Number(peerCount);
    } catch (error) {
      web3Logger.error(`Failed to get peer count for ${config.name}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Reconnect to an RPC endpoint
   */
  async reconnect(config: RPCConfig): Promise<boolean> {
    const connectionId = this.generateConnectionId(config);
    
    try {
      // Remove old connection
      this.connections.delete(connectionId);
      this.connectionStatus.delete(connectionId);
      
      // Create new connection
      await this.createConnection(config);
      
      web3Logger.info(`Successfully reconnected to ${config.name}`);
      return true;
    } catch (error) {
      web3Logger.error(`Failed to reconnect to ${config.name}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections(): Promise<void> {
    for (const [connectionId, web3] of this.connections) {
      try {
        // Web3.js doesn't have a close method, but we can clean up our references
        this.connections.delete(connectionId);
        this.connectionStatus.delete(connectionId);
        this.lastHealthCheck.delete(connectionId);
        
        web3Logger.debug(`Closed connection: ${connectionId}`);
      } catch (error) {
        web3Logger.error(`Error closing connection ${connectionId}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): { total: number; active: number; inactive: number } {
    const total = this.connections.size;
    const active = Array.from(this.connectionStatus.values()).filter(Boolean).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.closeAllConnections();
  }
}
