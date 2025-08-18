import { Web3Service } from '../../src/services/web3Service';
import { RPCConfig } from '../../src/types';

describe('Web3Service', () => {
  let web3Service: Web3Service;
  const mockConfigs: RPCConfig[] = [
    {
      id: 'test-1',
      name: 'Test RPC 1',
      url: 'https://test1.example.com',
      network: 'testnet',
      chainId: 1,
      timeout: 5000,
      enabled: true,
      priority: 1,
      maxHistoryEntries: 100,
      alertThresholds: {
        responseTime: 5000,
        errorRate: 10,
        peerCount: 5,
        blockLag: 5,
        syncLag: 5
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    web3Service = new Web3Service();
  });

  afterEach(() => {
    web3Service.cleanup();
  });

  describe('constructor', () => {
    it('should initialize with empty connections', () => {
      expect(web3Service).toBeDefined();
    });
  });

  describe('addRPC', () => {
    it('should add a new RPC configuration', async () => {
      const result = await web3Service.addRPC(mockConfigs[0]);
      expect(result).toBe(true);
    });
  });

  describe('getRPCConfigs', () => {
    it('should return all RPC configurations', async () => {
      await web3Service.addRPC(mockConfigs[0]);
      const configs = web3Service.getRPCConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].id).toBe('test-1');
    });
  });
});
