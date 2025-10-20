import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, authorize, authorizeOrganization, authorizeResource } from '../../src/middleware/auth';
import jwt from 'jsonwebtoken';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  authLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      params: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();

    // Set default JWT secret
    process.env.JWT_SECRET = 'test-jwt-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid JWT token', async () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'test@example.com', role: 'user' },
        'test-jwt-secret-key',
        { expiresIn: '1h' }
      );

      mockRequest.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('user-1');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authenticate demo token', async () => {
      mockRequest.headers = { authorization: 'Bearer demo-token' };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('default');
      expect(mockRequest.user?.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        timestamp: expect.any(Date)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat token' };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        timestamp: expect.any(Date)
      });
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-1', email: 'test@example.com', role: 'user' },
        'test-jwt-secret-key',
        { expiresIn: '-1h' } // Expired
      );

      mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
        timestamp: expect.any(Date)
      });
    });

    it('should reject invalid token', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('optionalAuth', () => {
    it('should set user for valid token', async () => {
      const token = 'demo-token'; // Use demo token that the middleware accepts

      mockRequest.headers = { authorization: `Bearer ${token}` };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('default');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user for invalid token', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user for no token', async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with correct role', () => {
      mockRequest.user = { userId: 'user-1', role: 'admin', email: 'test@example.com' };

      const middleware = authorize('admin', 'user');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without authentication', () => {
      mockRequest.user = undefined;

      const middleware = authorize('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        timestamp: expect.any(Date)
      });
    });

    it('should reject user with insufficient permissions', () => {
      mockRequest.user = { userId: 'user-1', role: 'user', email: 'test@example.com' };

      const middleware = authorize('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('authorizeOrganization', () => {
    it('should authorize super admin for any organization', () => {
      mockRequest.user = { userId: 'user-1', role: 'super_admin', email: 'test@example.com' };
      mockRequest.params = { organizationId: 'org-1' };

      authorizeOrganization(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should authorize user for their organization', () => {
      mockRequest.user = { 
        userId: 'user-1', 
        role: 'user', 
        email: 'test@example.com',
        organizationId: 'org-1'
      };
      mockRequest.params = { organizationId: 'org-1' };

      authorizeOrganization(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without authentication', () => {
      mockRequest.user = undefined;
      mockRequest.params = { organizationId: 'org-1' };

      authorizeOrganization(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        timestamp: expect.any(Date)
      });
    });

    it('should reject user accessing different organization', () => {
      mockRequest.user = { 
        userId: 'user-1', 
        role: 'user', 
        email: 'test@example.com',
        organizationId: 'org-1'
      };
      mockRequest.params = { organizationId: 'org-2' };

      authorizeOrganization(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied to organization',
        timestamp: expect.any(Date)
      });
    });

    it('should require organization ID', () => {
      mockRequest.user = { userId: 'user-1', role: 'user', email: 'test@example.com' };
      mockRequest.params = {};

      authorizeOrganization(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Organization ID required',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('authorizeResource', () => {
    it('should authorize super admin for any resource', async () => {
      mockRequest.user = { userId: 'user-1', role: 'super_admin', email: 'test@example.com' };
      mockRequest.params = { rpcId: 'rpc-1' };

      const middleware = authorizeResource('rpc');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without authentication', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { rpcId: 'rpc-1' };

      const middleware = authorizeResource('rpc');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        timestamp: expect.any(Date)
      });
    });

    it('should require resource ID', async () => {
      mockRequest.user = { userId: 'user-1', role: 'user', email: 'test@example.com' };
      mockRequest.params = {};

      const middleware = authorizeResource('rpc');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource ID required',
        timestamp: expect.any(Date)
      });
    });
  });
});
