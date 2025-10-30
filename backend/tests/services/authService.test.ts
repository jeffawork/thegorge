import { AuthService } from '../../src/services/authService';
import { UserRepository } from '../../src/repositories/user.repository';
import { User } from '../../src/models/user.model';
import { 
  IndividualRegistrationDto, 
  OrganizationRegistrationDto, 
  JoinOrganizationDto,
  UserRole 
} from '../../src/dto/auth.dto';
import { ConflictException } from '../../src/exceptions';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the database
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

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  authLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      findByOrganization: jest.fn(),
      updateLastLogin: jest.fn()
    } as any;

    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const mockUser = {
        id: 'user-1',
        email,
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'user',
        avatar_url: null,
        is_active: true,
        organization_id: null,
        org_name: null
      };

      // Mock database queries
      const { database } = require('../../src/database');
      database.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // First query for user lookup
        .mockResolvedValueOnce({ rows: [] }); // Second query for last login update

      const result = await authService.login({ email, password });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(email);
    });

    it('should throw error for invalid email', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Mock database query to return empty result
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [] });

      await expect(authService.login({ email, password })).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 12);

      const mockUser = {
        id: 'user-1',
        email,
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'user',
        avatar_url: null,
        is_active: true,
        organization_id: null,
        org_name: null
      };

      // Mock database query to return user with different password
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [mockUser] });

      await expect(authService.login({ email, password })).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for inactive user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock database query to return empty result (inactive users are filtered out in SQL)
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [] });

      await expect(authService.login({ email, password })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('registerIndividual', () => {
    it('should register individual user successfully', async () => {
      const dto: IndividualRegistrationDto = {
        registrationType: 'individual' as any,
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        marketingConsent: true
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const mockCreatedUser = new User({
        id: 'user-2',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.USER,
        isActive: true,
        emailVerified: false,
        marketingConsent: dto.marketingConsent,
        rpcConfigs: []
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await authService.registerIndividual(dto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(dto.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const dto: IndividualRegistrationDto = {
        registrationType: 'individual' as any,
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User'
      };

      const existingUser = new User({
        id: 'user-1',
        email: dto.email,
        firstName: 'Existing',
        lastName: 'User',
        rpcConfigs: []
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.registerIndividual(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('registerOrganization', () => {
    it('should register organization successfully', async () => {
      const dto: OrganizationRegistrationDto = {
        registrationType: 'organization' as any,
        email: 'orgadmin@example.com',
        password: 'password123',
        firstName: 'Org',
        lastName: 'Admin',
        organizationName: 'Test Organization',
        organizationSlug: 'test-org',
        organizationDescription: 'Test organization',
        industry: 'defi' as any,
        plan: 'pro' as any
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const mockCreatedUser = new User({
        id: 'user-3',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.ORG_ADMIN,
        organizationId: 'org-1',
        isActive: true,
        emailVerified: false,
        rpcConfigs: []
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      // Mock database queries for organization creation
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [{ id: 'org-1' }] }); // Organization creation
      database.query.mockResolvedValueOnce({ rows: [] }); // Organization user creation

      const result = await authService.registerOrganization(dto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.role).toBe(UserRole.ORG_ADMIN);
      expect(database.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('joinOrganization', () => {
    it('should join organization successfully', async () => {
      const dto: JoinOrganizationDto = {
        registrationType: 'join_organization' as any,
        email: 'newmember@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Member',
        organizationId: 'org-1',
        department: 'Engineering'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const mockCreatedUser = new User({
        id: 'user-4',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.USER,
        organizationId: dto.organizationId,
        department: dto.department,
        isActive: true,
        emailVerified: false,
        rpcConfigs: []
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      // Mock database queries
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [{ id: 'org-1', name: 'Test Org' }] }); // Organization lookup
      database.query.mockResolvedValueOnce({ rows: [] }); // Organization user creation

      const result = await authService.joinOrganization(dto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.organizationId).toBe(dto.organizationId);
      expect(database.query).toHaveBeenCalledTimes(2);
    });

    it('should throw error if organization not found', async () => {
      const dto: JoinOrganizationDto = {
        registrationType: 'join_organization' as any,
        email: 'newmember@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Member',
        organizationId: 'nonexistent-org'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Mock database query to return no organization
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [] });

      await expect(authService.joinOrganization(dto)).rejects.toThrow('Organization not found or inactive');
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const email = 'test@example.com';
      const mockUser = new User({
        id: 'user-1',
        email,
        firstName: 'Test',
        lastName: 'User',
        rpcConfigs: []
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Mock database query for token storage
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [] });

      await authService.forgotPassword(email);

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO password_reset_tokens'),
        expect.arrayContaining([mockUser.id, expect.any(String), expect.any(Date), expect.any(Date)])
      );
    });

    it('should not reveal if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await authService.forgotPassword(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      // Should not throw error or reveal user doesn't exist
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'test@example.com', type: 'password_reset' },
        'test-jwt-secret-key',
        { expiresIn: '1h' }
      );
      const newPassword = 'newpassword123';

      // Mock database queries
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [{ user_id: 'user-1' }] }); // Token validation
      database.query.mockResolvedValueOnce({ rows: [] }); // Password update
      database.query.mockResolvedValueOnce({ rows: [] }); // Token deletion

      await authService.resetPassword(token, newPassword);

      expect(database.query).toHaveBeenCalledTimes(3);
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid-token';
      const newPassword = 'newpassword123';

      await expect(authService.resetPassword(invalidToken, newPassword)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error for expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-1', email: 'test@example.com', type: 'password_reset' },
        'test-jwt-secret-key',
        { expiresIn: '-1h' } // Expired
      );
      const newPassword = 'newpassword123';

      await expect(authService.resetPassword(expiredToken, newPassword)).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = jwt.sign(
        { userId: 'user-1', email: 'test@example.com', type: 'refresh' },
        'test-jwt-secret-key',
        { expiresIn: '7d' }
      );

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar_url: null,
        is_active: true,
        organization_id: null,
        org_name: null
      };

      // Mock database query to return user
      const { database } = require('../../src/database');
      database.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      const invalidToken = 'invalid-refresh-token';

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow('Invalid refresh token');
    });
  });
});
