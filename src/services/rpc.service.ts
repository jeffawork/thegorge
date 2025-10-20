import { RpcRepository } from '../repositories/rpc.repository';
import { CreateRpcDto, UpdateRpcDto } from '../dto/rpc.dto';
import { RpcConfig } from '../models/rpc.model';
import { ResourceNotFoundException, ValidationException } from '../exceptions';
import { Web3Service } from './web3Service';
import { MonitoringService } from './monitoringService';
import { v4 as uuidv4 } from 'uuid';

export class RpcService {
  private rpcRepository: RpcRepository;
  private web3Service: Web3Service;
  private monitoringService: MonitoringService;

  constructor(
    rpcRepository: RpcRepository,
    web3Service: Web3Service,
    monitoringService: MonitoringService,
  ) {
    this.rpcRepository = rpcRepository;
    this.web3Service = web3Service;
    this.monitoringService = monitoringService;
  }

  async getRpcConfigs(userId: string, limit?: number, offset?: number): Promise<RpcConfig[]> {
    return this.rpcRepository.findByUserId(userId);
  }

  async getRpcConfig(userId: string, rpcId: string): Promise<RpcConfig> {
    const rpc = await this.rpcRepository.findByUserAndId(userId, rpcId);
    if (!rpc) {
      throw new ResourceNotFoundException(`RPC configuration with id ${rpcId} not found`);
    }
    return rpc;
  }

  async createRpcConfig(userId: string, createRpcDto: CreateRpcDto): Promise<RpcConfig> {
    // Test the connection before creating
    const testResult = await this.testRpcConnection(createRpcDto);
    if (!testResult.isHealthy) {
      throw new ValidationException('RPC endpoint is not accessible', testResult);
    }

    const rpc = new RpcConfig({
      id: uuidv4(),
      userId,
      name: createRpcDto.name,
      url: createRpcDto.url,
      network: createRpcDto.network,
      chainId: createRpcDto.chainId,
      timeout: createRpcDto.timeout || 10000,
      enabled: createRpcDto.enabled ?? true,
      priority: createRpcDto.priority || 1,
      isHealthy: testResult.isHealthy,
      responseTime: testResult.responseTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdRpc = await this.rpcRepository.create(rpc);

    // TODO: Start monitoring this RPC when MonitoringService supports it
    // this.monitoringService.addRpcConfig(createdRpc);

    return createdRpc;
  }

  async updateRpcConfig(userId: string, rpcId: string, updateRpcDto: UpdateRpcDto): Promise<RpcConfig> {
    const existingRpc = await this.getRpcConfig(userId, rpcId);

    // If URL is being updated, test the new connection
    if (updateRpcDto.url && updateRpcDto.url !== existingRpc.url) {
      const testResult = await this.testRpcConnection({
        ...updateRpcDto,
        name: updateRpcDto.name || existingRpc.name,
        network: updateRpcDto.network || existingRpc.network,
        chainId: updateRpcDto.chainId || existingRpc.chainId,
        timeout: updateRpcDto.timeout || existingRpc.timeout,
        enabled: updateRpcDto.enabled ?? existingRpc.enabled,
        priority: updateRpcDto.priority || existingRpc.priority,
      });

      if (!testResult.isHealthy) {
        throw new ValidationException('Updated RPC endpoint is not accessible', testResult);
      }
    }

    const updatedRpc = new RpcConfig({
      ...existingRpc,
      ...updateRpcDto,
      updatedAt: new Date(),
    });

    const result = await this.rpcRepository.update(rpcId, updatedRpc);

    // TODO: Update monitoring service when MonitoringService supports it
    // this.monitoringService.updateRpcConfig(result);

    return result;
  }

  async deleteRpcConfig(userId: string, rpcId: string): Promise<void> {
    await this.getRpcConfig(userId, rpcId); // Verify ownership

    const deleted = await this.rpcRepository.delete(rpcId);
    if (!deleted) {
      throw new ResourceNotFoundException(`RPC configuration with id ${rpcId} not found`);
    }

    // TODO: Remove from monitoring when MonitoringService supports it
    // this.monitoringService.removeRpcConfig(rpcId);
  }

  async getRpcStatus(userId: string, rpcId: string): Promise<any> {
    const rpc = await this.getRpcConfig(userId, rpcId);

    return {
      id: rpc.id,
      name: rpc.name,
      url: rpc.url,
      isHealthy: rpc.isHealthy,
      responseTime: rpc.responseTime,
      lastCheckedAt: rpc.lastCheckedAt,
      errorCount: rpc.errorCount,
      lastError: rpc.lastError,
      enabled: rpc.enabled,
    };
  }

  async testRpcConnection(rpcConfig: Partial<CreateRpcDto>): Promise<any> {
    try {
      const startTime = Date.now();

      // Test basic connectivity
      const blockNumber = await this.web3Service.getBlockNumber(rpcConfig.url!, rpcConfig.timeout || 10000);
      const responseTime = Date.now() - startTime;

      // Verify chain ID matches
      const chainId = await this.web3Service.getChainId(rpcConfig.url!, rpcConfig.timeout || 10000);

      if (chainId !== rpcConfig.chainId) {
        return {
          isHealthy: false,
          responseTime,
          error: `Chain ID mismatch: expected ${rpcConfig.chainId}, got ${chainId}`,
          blockNumber,
          chainId,
        };
      }

      return {
        isHealthy: true,
        responseTime,
        blockNumber,
        chainId,
        error: null,
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        blockNumber: null,
        chainId: null,
      };
    }
  }

  async getRpcMetrics(userId: string, rpcId: string, timeRange: string): Promise<any> {
    const rpc = await this.getRpcConfig(userId, rpcId);

    // This would typically query a metrics database
    // For now, return basic metrics
    return {
      rpcId: rpc.id,
      timeRange,
      metrics: {
        uptime: rpc.isHealthy ? 100 : 0,
        averageResponseTime: rpc.responseTime || 0,
        errorRate: rpc.errorCount > 0 ? (rpc.errorCount / 100) * 100 : 0,
        totalRequests: 1000, // Mock data
        successfulRequests: rpc.isHealthy ? 1000 : 950,
        failedRequests: rpc.isHealthy ? 0 : 50,
      },
      healthHistory: [], // Would contain time-series data
      alerts: [], // Would contain recent alerts
    };
  }

  async toggleRpcStatus(userId: string, rpcId: string, enabled: boolean): Promise<RpcConfig> {
    const rpc = await this.getRpcConfig(userId, rpcId);

    const updatedRpc = new RpcConfig({
      ...rpc,
      enabled,
      updatedAt: new Date(),
    });

    const result = await this.rpcRepository.update(rpcId, updatedRpc);

    // TODO: Update monitoring service when MonitoringService supports it
    // if (enabled) {
    //   this.monitoringService.addRpcConfig(result);
    // } else {
    //   this.monitoringService.removeRpcConfig(rpcId);
    // }

    return result;
  }

  async getHealthyRpcs(userId: string): Promise<RpcConfig[]> {
    return this.rpcRepository.findEnabledByUserId(userId);
  }

  async getUnhealthyRpcs(): Promise<RpcConfig[]> {
    return this.rpcRepository.findUnhealthy();
  }
}
