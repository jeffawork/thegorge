import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/authService';
import { User } from '../../src/models/user.model';
import { LoginDto, IndividualRegistrationDto, ChangePasswordDto, UserRole } from '../../src/dto/auth.dto';
import { ValidationException, AuthenticationException } from '../../src/exceptions';

// Mock the auth service
jest.mock('../../src/services/authService');
jest.mock('../../src/utils/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  },
  authLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockAuthService = new AuthService({} as any) as jest.Mocked<AuthService>;
    authController = new AuthController(mockAuthService);

    mockRequest = {
      body: {},
      user: { userId: 'user-1', email: 'test@example.com', role: 'user' },
      method: 'POST',
      path: '/login',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent')
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockRequest.body = loginDto;

      const mockUser = new User({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        emailVerified: true,
        rpcConfigs: []
      });

      const mockAuthResult = {
        user: mockUser,
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };

      mockAuthService.login.mockResolvedValue(mockAuthResult);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith({ email: loginDto.email, password: loginDto.password });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResult,
        message: 'Login successful',
        timestamp: expect.any(Date)
      });
    });

    it('should handle validation errors', async () => {
      const invalidDto = { email: 'invalid-email' };
      mockRequest.body = invalidDto;

      // Mock validation to throw error
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([
        { property: 'email', constraints: { isEmail: 'Please provide a valid email address' } }
      ]);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationException));
    });

    it('should handle authentication errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockRequest.body = loginDto;
      mockAuthService.login.mockRejectedValue(new AuthenticationException('Invalid credentials'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationException));
    });
  });

  describe('register', () => {
    it('should register individual user successfully', async () => {
      const registrationData: IndividualRegistrationDto = {
        registrationType: 'individual' as any,
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      mockRequest.body = registrationData;

      const mockUser = new User({
        id: 'user-2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        emailVerified: false,
        rpcConfigs: []
      });

      const mockAuthResult = {
        user: mockUser,
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };

      mockAuthService.registerIndividual.mockResolvedValue(mockAuthResult);

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.registerIndividual).toHaveBeenCalledWith(expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResult,
        message: 'User registered successfully',
        timestamp: expect.any(Date)
      });
    });

    it('should register organization successfully', async () => {
      const registrationData: any = {
        registrationType: 'organization',
        email: 'orgadmin@example.com',
        password: 'password123',
        firstName: 'Org',
        lastName: 'Admin',
        organizationName: 'Test Org',
        organizationSlug: 'test-org',
        industry: 'defi',
        plan: 'pro'
      };

      mockRequest.body = registrationData;

      const mockUser = new User({
        id: 'user-3',
        email: 'orgadmin@example.com',
        firstName: 'Org',
        lastName: 'Admin',
        role: UserRole.ORG_ADMIN,
        isActive: true,
        emailVerified: false,
        rpcConfigs: []
      });

      const mockAuthResult = {
        user: mockUser,
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };

      mockAuthService.registerOrganization.mockResolvedValue(mockAuthResult);

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.registerOrganization).toHaveBeenCalledWith(expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle invalid registration type', async () => {
      const registrationData = {
        registrationType: 'invalid-type',
        email: 'test@example.com',
        password: 'password123'
      };

      mockRequest.body = registrationData;

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationException));
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = new User({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        emailVerified: true,
        rpcConfigs: []
      });
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      await authController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'Profile retrieved successfully',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      mockRequest.body = updateData;

      const mockUpdatedUser = new User({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.USER,
        isActive: true,
        emailVerified: true,
        rpcConfigs: []
      });
      mockAuthService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-1', updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedUser,
        message: 'Profile updated successfully',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      mockRequest.body = changePasswordDto;
      mockAuthService.changePassword.mockResolvedValue();

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.changePassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user-1',
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Password changed successfully',
        timestamp: expect.any(Date)
      });
    });

    it('should handle validation errors for password change', async () => {
      const invalidDto = { currentPassword: 'old', newPassword: 'short' };
      mockRequest.body = invalidDto;

      // Mock validation to fail
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([
        { property: 'newPassword', constraints: { minLength: 'Password must be at least 8 characters long' } }
      ]);

      await authController.changePassword(mockRequest as Request, mockResponse as Response);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationException));
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };
      mockRequest.body = forgotPasswordDto;
      mockAuthService.forgotPassword.mockResolvedValue();

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto.email);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Password reset email sent',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      mockRequest.body = resetPasswordDto;
      mockAuthService.resetPassword.mockResolvedValue();

      // Mock validation to pass
      jest.spyOn(require('class-validator'), 'validate').mockResolvedValue([]);

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Password reset successfully',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAuthService.logout.mockResolvedValue();

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Logged out successfully',
        timestamp: expect.any(Date)
      });
    });
  });
});
