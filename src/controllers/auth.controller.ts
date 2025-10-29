import { Request, Response } from 'express';
// NextFunction removed - not used in this controller
import { BaseController } from './base.controller';
import {
  LoginDto,
  IndividualRegistrationDto,
  OrganizationRegistrationDto,
  JoinOrganizationDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { AuthService } from '../services/authService';
import { ValidationException } from '../exceptions';
// AuthenticationException removed - not currently used
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    super();
    this.authService = authService;
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginDto = plainToClass(LoginDto, req.body);
      const validationErrors = await validate(loginDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid login data', validationErrors);
      }

      const result = await this.authService.login({ email: loginDto.email, password: loginDto.password });
      this.sendSuccess(res, result, 'Login successful');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const registrationData = req.body;
      
      // Validate registration type first
      if (!registrationData.registrationType) {
        throw new ValidationException('Registration type is required');
      }
      
      let result;
      let validationErrors: any[] = [];
      
      switch (registrationData.registrationType) {
      case 'individual': {
        const individualDto = plainToClass(IndividualRegistrationDto, registrationData);
        validationErrors = await validate(individualDto);
        if (validationErrors.length === 0) {
          result = await this.authService.registerIndividual(individualDto);
        }
        break;
      }
      case 'organization': {
        const orgDto = plainToClass(OrganizationRegistrationDto, registrationData);
        validationErrors = await validate(orgDto);
        if (validationErrors.length === 0) {
          result = await this.authService.registerOrganization(orgDto);
        }
        break;
      }
      case 'join_organization': {
        const joinDto = plainToClass(JoinOrganizationDto, registrationData);
        validationErrors = await validate(joinDto);
        if (validationErrors.length === 0) {
          result = await this.authService.joinOrganization(joinDto);
        }
        break;
      }
      default:
        throw new ValidationException('Invalid registration type');
      }
      
      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid registration data', validationErrors);
      }

      this.sendCreated(res, result, 'User registered successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshDto = plainToClass(RefreshTokenDto, req.body);
      const validationErrors = await validate(refreshDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid refresh token data', validationErrors);
      }

      const result = await this.authService.refreshToken(refreshDto.refreshToken);
      this.sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const user = await this.authService.getProfile(userId);
      this.sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const result = await this.authService.updateProfile(userId, req.body);
      this.sendSuccess(res, result, 'Profile updated successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const changePasswordDto = plainToClass(ChangePasswordDto, req.body);
      const validationErrors = await validate(changePasswordDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid password change data', validationErrors);
      }

      const userId = this.getUserId(req);
      await this.authService.changePassword(
        userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      this.sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const forgotPasswordDto = plainToClass(ForgotPasswordDto, req.body);
      const validationErrors = await validate(forgotPasswordDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid email', validationErrors);
      }

      await this.authService.forgotPassword(forgotPasswordDto.email);
      this.sendSuccess(res, null, 'Password reset email sent');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const resetPasswordDto = plainToClass(ResetPasswordDto, req.body);
      const validationErrors = await validate(resetPasswordDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid reset password data', validationErrors);
      }

      await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );

      this.sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      await this.authService.logout(userId);
        res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/',
    });
      this.sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }
}
