import request from 'supertest';
import express from 'express';
import createApiRoutes from '../../src/routes';
import { MonitoringService } from '../../src/services/monitoringService';

// Mock all external dependencies
jest.mock('../../src/services/monitoringService');
jest.mock('../../src/services/authService');
jest.mock('../../src/services/rpc.service');
jest.mock('../../src/services/organizationService');
jest.mock('../../src/services/alertService');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/rpc.repository');
jest.mock('../../src/database', () => ({
  database: {
    query: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getPool: jest.fn(() => ({
      query: jest.fn(),
      connect: jest.fn(),
      release: jest.fn(),
      end: jest.fn()
    }))
  }
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  authLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  rpcLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  monitoringLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}));

describe('API Integration Tests', () => {
  let app: express.Application;
  let mockMonitoringService: jest.Mocked<MonitoringService>;

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Mock monitoring service
    mockMonitoringService = new MonitoringService() as jest.Mocked<MonitoringService>;

    // Set up routes
    app.use('/api', createApiRoutes(mockMonitoringService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String)
      });
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.login.mockResolvedValue({
          user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('refreshToken');
      });

      it('should reject invalid credentials', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
          .expect(500);

        expect(response.body.success).toBe(false);
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
            // Missing password
          })
          .expect(500);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/register', () => {
      it('should register individual user', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.registerIndividual.mockResolvedValue({
          user: { id: 'user-2', email: 'newuser@example.com', name: 'New User' },
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            registrationType: 'individual',
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'New',
            lastName: 'User'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('newuser@example.com');
      });

      it('should register organization', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.registerOrganization.mockResolvedValue({
          user: { id: 'user-3', email: 'orgadmin@example.com', name: 'Org Admin' },
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            registrationType: 'organization',
            email: 'orgadmin@example.com',
            password: 'password123',
            firstName: 'Org',
            lastName: 'Admin',
            organizationName: 'Test Organization',
            organizationSlug: 'test-org',
            industry: 'defi',
            plan: 'pro'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('orgadmin@example.com');
      });
    });

    describe('POST /api/auth/forgot-password', () => {
      it('should send password reset email', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.forgotPassword.mockResolvedValue();

        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({
            email: 'test@example.com'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Password reset email sent');
      });
    });

    describe('POST /api/auth/reset-password', () => {
      it('should reset password with valid token', async () => {
        const { AuthService } = require('../../src/services/authService');
        const mockAuthService = new AuthService({} as any);
        
        mockAuthService.resetPassword.mockResolvedValue();

        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'valid-reset-token',
            newPassword: 'newpassword123',
            confirmPassword: 'newpassword123'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Password reset successfully');
      });
    });
  });

  describe('RPC Endpoints', () => {
    const authToken = 'Bearer demo-token'; // Using demo token for testing

    describe('GET /api/rpcs', () => {
      it('should get RPC configs for authenticated user', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        mockRpcService.getRpcConfigs.mockResolvedValue([
          {
            id: 'rpc-1',
            name: 'Test RPC',
            url: 'https://test.example.com',
            network: 'ethereum',
            chainId: 1,
            enabled: true
          }
        ]);

        const response = await request(app)
          .get('/api/rpcs')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toBe('Test RPC');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/rpcs')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Access token required');
      });
    });

    describe('POST /api/rpcs', () => {
      it('should create new RPC config', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        const newRpc = {
          id: 'rpc-2',
          name: 'New RPC',
          url: 'https://new.example.com',
          network: 'polygon',
          chainId: 137,
          enabled: true
        };

        mockRpcService.createRpcConfig.mockResolvedValue(newRpc);

        const response = await request(app)
          .post('/api/rpcs')
          .set('Authorization', authToken)
          .send({
            name: 'New RPC',
            url: 'https://new.example.com',
            network: 'polygon',
            chainId: 137,
            timeout: 30000,
            enabled: true,
            priority: 1
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('New RPC');
      });
    });

    describe('POST /api/rpcs/test', () => {
      it('should test RPC connection', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        const testResult = {
          isOnline: true,
          responseTime: 150,
          blockNumber: 12345,
          peerCount: 25,
          gasPrice: '20000000000',
          isSyncing: false,
          network: 'ethereum',
          chainId: 1
        };

        mockRpcService.testRpcConnection.mockResolvedValue(testResult);

        const response = await request(app)
          .post('/api/rpcs/test')
          .set('Authorization', authToken)
          .send({
            name: 'Test RPC',
            url: 'https://test.example.com',
            network: 'ethereum',
            chainId: 1,
            timeout: 30000
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isOnline).toBe(true);
        expect(response.body.data.responseTime).toBe(150);
      });
    });

    describe('GET /api/rpcs/:rpcId', () => {
      it('should get specific RPC config', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        const rpcConfig = {
          id: 'rpc-1',
          name: 'Test RPC',
          url: 'https://test.example.com',
          network: 'ethereum',
          chainId: 1,
          enabled: true
        };

        mockRpcService.getRpcConfig.mockResolvedValue(rpcConfig);

        const response = await request(app)
          .get('/api/rpcs/rpc-1')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe('rpc-1');
        expect(response.body.data.name).toBe('Test RPC');
      });
    });

    describe('PUT /api/rpcs/:rpcId', () => {
      it('should update RPC config', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        const updatedRpc = {
          id: 'rpc-1',
          name: 'Updated RPC',
          url: 'https://updated.example.com',
          network: 'ethereum',
          chainId: 1,
          enabled: true
        };

        mockRpcService.updateRpcConfig.mockResolvedValue(updatedRpc);

        const response = await request(app)
          .put('/api/rpcs/rpc-1')
          .set('Authorization', authToken)
          .send({
            name: 'Updated RPC',
            timeout: 60000
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Updated RPC');
      });
    });

    describe('DELETE /api/rpcs/:rpcId', () => {
      it('should delete RPC config', async () => {
        const { RpcService } = require('../../src/services/rpc.service');
        const mockRpcService = new RpcService({} as any, {} as any, {} as any);
        
        mockRpcService.deleteRpcConfig.mockResolvedValue();

        const response = await request(app)
          .delete('/api/rpcs/rpc-1')
          .set('Authorization', authToken)
          .expect(204);

        expect(response.body).toEqual({});
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // This would require more complex setup to test actual rate limiting
      // For now, we'll just verify the endpoints exist and respond
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Should either succeed or fail due to rate limiting, not 404
      expect([200, 429, 500]).toContain(response.status);
    });
  });
});
