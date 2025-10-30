import { RpcService } from '../../src/services/rpc.service';
import { RpcRepository } from '../../src/repositories/rpc.repository';
import { Web3Service } from '../../src/services/web3Service';
import { MonitoringService } from '../../src/services/monitoringService';
import { RpcConfig } from '../../src/models/rpc.model';
import { CreateRpcDto, UpdateRpcDto } from '../../src/dto/rpc.dto';
import { EVM_NETWORKS } from '../../src/types';
import { ResourceNotFoundException } from '../../src/exceptions';

// Mock dependencies
jest.mock('../../src/repositories/rpc.repository');
jest.mock('../../src/services/web3Service');
jest.mock('../../src/services/monitoringService');
jest.mock('../../src/utils/logger', () => ({
  rpcLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('RpcService', () => {
  let rpcService: RpcService;
  let mockRpcRepository: jest.Mocked<RpcRepository>;
  let mockWeb3Service: jest.Mocked<Web3Service>;
  let mockMonitoringService: jest.Mocked<MonitoringService>;

  const mockRpcConfig = new RpcConfig({
    id: 'rpc-1',
    userId: 'user-1',
    name: 'Test RPC',
    url: 'https://test.example.com',
    network: EVM_NETWORKS.ETHEREUM,
    chainId: 1,
    timeout: 30000,
    enabled: true,
    priority: 1,
    isHealthy: true,
    responseTime: 100,
    errorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  beforeEach(() => {
    mockRpcRepository = new RpcRepository() as jest.Mocked<RpcRepository>;
    mockWeb3Service = new Web3Service() as jest.Mocked<Web3Service>;
    mockMonitoringService = new MonitoringService() as jest.Mocked<MonitoringService>;

    rpcService = new RpcService(mockRpcRepository, mockWeb3Service, mockMonitoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRpcConfigs', () => {
    it('should return RPC configs for user', async () => {
      const userId = 'user-1';
      const limit = 10;
      const offset = 0;

      mockRpcRepository.findByUserId.mockResolvedValue([mockRpcConfig]);

      const result = await rpcService.getRpcConfigs(userId, limit, offset);

      expect(result).toEqual([mockRpcConfig]);
      expect(mockRpcRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no RPCs', async () => {
      const userId = 'user-1';
      mockRpcRepository.findByUserId.mockResolvedValue([]);

      const result = await rpcService.getRpcConfigs(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getRpcConfig', () => {
    it('should return RPC config for user', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';

      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);

      const result = await rpcService.getRpcConfig(userId, rpcId);

      expect(result).toEqual(mockRpcConfig);
      expect(mockRpcRepository.findByUserAndId).toHaveBeenCalledWith(userId, rpcId);
    });

    it('should throw error when RPC not found', async () => {
      const userId = 'user-1';
      const rpcId = 'nonexistent-rpc';

      mockRpcRepository.findByUserAndId.mockResolvedValue(null);

      await expect(rpcService.getRpcConfig(userId, rpcId)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('createRpcConfig', () => {
    it('should create new RPC config', async () => {
      const userId = 'user-1';
      const createDto: CreateRpcDto = {
        name: 'New RPC',
        url: 'https://new.example.com',
        network: EVM_NETWORKS.POLYGON,
        chainId: 137,
        timeout: 30000,
        enabled: true,
        priority: 1
      };

      const createdRpc = new RpcConfig({
        id: 'rpc-2',
        userId,
        ...createDto,
        isHealthy: false,
        errorCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockRpcRepository.create.mockResolvedValue(createdRpc);

      const result = await rpcService.createRpcConfig(userId, createDto);

      expect(result).toEqual(createdRpc);
      expect(mockRpcRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          name: createDto.name,
          url: createDto.url,
          network: createDto.network,
          chainId: createDto.chainId
        })
      );
    });
  });

  describe('updateRpcConfig', () => {
    it('should update existing RPC config', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';
      const updateDto: UpdateRpcDto = {
        name: 'Updated RPC',
        timeout: 60000
      };

      const updatedRpc = { ...mockRpcConfig, ...updateDto };
      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);
      mockRpcRepository.update.mockResolvedValue(updatedRpc as any);

      const result = await rpcService.updateRpcConfig(userId, rpcId, updateDto);

      expect(result).toEqual(updatedRpc);
      expect(mockRpcRepository.update).toHaveBeenCalledWith(rpcId, expect.objectContaining(updateDto));
    });

    it('should throw error when RPC not found', async () => {
      const userId = 'user-1';
      const rpcId = 'nonexistent-rpc';
      const updateDto: UpdateRpcDto = { name: 'Updated RPC' };

      mockRpcRepository.findByUserAndId.mockResolvedValue(null);

      await expect(rpcService.updateRpcConfig(userId, rpcId, updateDto)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('deleteRpcConfig', () => {
    it('should delete RPC config', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';

      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);
      mockRpcRepository.delete.mockResolvedValue(true);

      await rpcService.deleteRpcConfig(userId, rpcId);

      expect(mockRpcRepository.delete).toHaveBeenCalledWith(rpcId);
    });

    it('should throw error when RPC not found', async () => {
      const userId = 'user-1';
      const rpcId = 'nonexistent-rpc';

      mockRpcRepository.findByUserAndId.mockResolvedValue(null);

      await expect(rpcService.deleteRpcConfig(userId, rpcId)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('testRpcConnection', () => {
    it('should test RPC connection successfully', async () => {
      const createDto: CreateRpcDto = {
        name: 'Test RPC',
        url: 'https://test.example.com',
        network: EVM_NETWORKS.ETHEREUM,
        chainId: 1,
        timeout: 30000
      };

      const mockHealthCheck = {
        isOnline: true,
        responseTime: 150,
        blockNumber: 12345,
        peerCount: 25,
        gasPrice: '20000000000',
        isSyncing: false,
        network: 'ethereum',
        chainId: 1
      };

      mockWeb3Service.getBlockNumber.mockResolvedValue(12345);
      mockWeb3Service.getChainId.mockResolvedValue(1);

      const result = await rpcService.testRpcConnection(createDto);

      expect(result).toEqual(expect.objectContaining({
        isHealthy: true,
        responseTime: expect.any(Number),
        blockNumber: 12345,
        chainId: 1
      }));
      expect(mockWeb3Service.getBlockNumber).toHaveBeenCalledWith(createDto.url, createDto.timeout);
    });

    it('should handle RPC connection failure', async () => {
      const createDto: CreateRpcDto = {
        name: 'Failing RPC',
        url: 'https://failing.example.com',
        network: EVM_NETWORKS.ETHEREUM,
        chainId: 1,
        timeout: 5000
      };

      mockWeb3Service.testConnection.mockRejectedValue(new Error('Connection timeout'));

      const result = await rpcService.testRpcConnection(createDto);

      expect(result.isOnline).toBe(false);
      expect(result.errorMessage).toContain('Connection timeout');
    });
  });

  describe('getRpcStatus', () => {
    it('should return RPC status', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';

      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);

      const result = await rpcService.getRpcStatus(userId, rpcId);

      expect(result).toEqual(mockRpcConfig);
    });
  });

  describe('getRpcMetrics', () => {
    it('should return RPC metrics', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';
      const timeRange = '24h';

      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);

      // Mock metrics service
      const mockMetrics = {
        responseTime: { avg: 150, min: 100, max: 300 },
        uptime: 99.5,
        errorRate: 0.1,
        totalRequests: 1000
      };

      // This would need to be implemented in the actual service
      const result = await rpcService.getRpcMetrics(userId, rpcId, timeRange);

      expect(result).toBeDefined();
    });
  });

  describe('toggleRpcStatus', () => {
    it('should enable RPC', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';
      const enabled = true;

      const updatedRpc = { ...mockRpcConfig, enabled };
      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);
      mockRpcRepository.update.mockResolvedValue(updatedRpc as any);

      const result = await rpcService.toggleRpcStatus(userId, rpcId, enabled);

      expect(result.enabled).toBe(true);
      expect(mockRpcRepository.update).toHaveBeenCalledWith(rpcId, expect.objectContaining({ enabled }));
    });

    it('should disable RPC', async () => {
      const userId = 'user-1';
      const rpcId = 'rpc-1';
      const enabled = false;

      const updatedRpc = { ...mockRpcConfig, enabled };
      mockRpcRepository.findByUserAndId.mockResolvedValue(mockRpcConfig);
      mockRpcRepository.update.mockResolvedValue(updatedRpc as any);

      const result = await rpcService.toggleRpcStatus(userId, rpcId, enabled);

      expect(result.enabled).toBe(false);
    });
  });
});
