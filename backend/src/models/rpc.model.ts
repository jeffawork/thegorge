import { BaseModel } from './base.model';
import { EVM_NETWORKS } from '../types';

export class RpcConfig extends BaseModel {
  public userId: string;
  public name: string;
  public url: string;
  public network: EVM_NETWORKS;
  public chainId: number;
  public timeout: number;
  public enabled: boolean;
  public priority: number;
  public lastCheckedAt?: Date;
  public isHealthy: boolean;
  public responseTime?: number;
  public errorCount: number;
  public lastError?: string;

  constructor(data: Partial<RpcConfig> = {}) {
    super(data);
    this.userId = data.userId || '';
    this.name = data.name || '';
    this.url = data.url || '';
    this.network = data.network || EVM_NETWORKS.ETHEREUM;
    this.chainId = data.chainId || 1;
    this.timeout = data.timeout || 10000;
    this.enabled = data.enabled ?? true;
    this.priority = data.priority || 1;
    this.lastCheckedAt = data.lastCheckedAt;
    this.isHealthy = data.isHealthy ?? false;
    this.responseTime = data.responseTime;
    this.errorCount = data.errorCount || 0;
    this.lastError = data.lastError;
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      name: this.name,
      url: this.url,
      network: this.network,
      chainId: this.chainId,
      timeout: this.timeout,
      enabled: this.enabled,
      priority: this.priority,
      lastCheckedAt: this.lastCheckedAt,
      isHealthy: this.isHealthy,
      responseTime: this.responseTime,
      errorCount: this.errorCount,
      lastError: this.lastError,
    };
  }

  // Helper methods
  updateHealth(isHealthy: boolean, responseTime?: number, error?: string): void {
    this.isHealthy = isHealthy;
    this.responseTime = responseTime;
    this.lastCheckedAt = new Date();

    if (!isHealthy && error) {
      this.errorCount++;
      this.lastError = error;
    } else if (isHealthy) {
      this.errorCount = 0;
      this.lastError = undefined;
    }
  }

  isAvailable(): boolean {
    return this.enabled && this.isHealthy;
  }
}
