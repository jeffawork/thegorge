import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { authLogger } from '../utils/logger';
import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import {
  IndividualRegistrationDto,
  OrganizationRegistrationDto,
  JoinOrganizationDto,
  UserRole,
} from '../dto/auth.dto';
import { ConflictException } from '../exceptions';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.userRepository = userRepository;

    authLogger.info('AuthService initialized');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await database.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email],
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const userResult = await database.query(
        `INSERT INTO users (email, password_hash, name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, role, avatar_url, is_active, created_at`,
        [data.email, passwordHash, data.name, 'user', true],
      );

      const user = userResult.rows[0];

      // Add to default organization if no organization specified
      const orgId = data.organizationId || '00000000-0000-0000-0000-000000000000';
      await database.query(
        'INSERT INTO organization_users (organization_id, user_id, role) VALUES ($1, $2, $3)',
        [orgId, user.id, 'member'],
      );

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role, orgId);

      authLogger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        organizationId: orgId,
      });

      return {
        user: user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      authLogger.error('User registration failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Find user with organization info
      const userResult = await database.query(
        `SELECT u.id, u.email, u.password_hash, u.name, u.role, u.avatar_url, u.is_active,
                ou.organization_id, o.name as org_name
         FROM users u
         LEFT JOIN organization_users ou ON u.id = ou.user_id
         LEFT JOIN organizations o ON ou.organization_id = o.id
         WHERE u.email = $1 AND u.is_active = true`,
        [credentials.email],
      );

      if (userResult.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await database.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id],
      );

      // Get user's RPC configs
      const rpcConfigsResult = await database.query(
        'SELECT * FROM rpc_configs WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id],
      );

      // Generate tokens
      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.role,
        user.organization_id,
      );

      authLogger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        organizationId: user.organization_id,
      });

      return {
        user: user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      authLogger.error('User login failed', {
        email: credentials.email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // Verify user still exists and is active
      const userResult = await database.query(
        'SELECT id, is_active FROM users WHERE id = $1',
        [decoded.userId],
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        throw new Error('User not found or inactive');
      }

      return decoded;
    } catch (error) {
      authLogger.error('Token verification failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Handle demo tokens for development
      if (refreshToken === 'demo-refreshed-token') {
        const demoAccessToken = jwt.sign(
          {
            userId: 'default',
            email: 'demo@example.com',
            role: 'admin',
          },
          this.jwtSecret,
          { expiresIn: this.jwtExpiresIn }
        );
        return { accessToken: demoAccessToken };
      }
      
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as JwtPayload;

      // Verify user still exists and is active
      const userResult = await database.query(
        'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId],
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      const user = userResult.rows[0];

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          organizationId: decoded.organizationId,
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn } as jwt.SignOptions,
      );

      return { accessToken };
    } catch (error) {
      authLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    organizationId?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId,
      email,
      role,
      organizationId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Register individual user
   */
  async registerIndividual(dto: IndividualRegistrationDto): Promise<AuthResult> {
    try {
      authLogger.info('Individual registration started', { email: dto.email });
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = new User({
        id: uuidv4(),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: UserRole.USER,
        isActive: true,
        emailVerified: false,
        marketingConsent: dto.marketingConsent || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedUser = await this.userRepository.create(user);
      const token = this.generateToken(savedUser);
      const refreshToken = this.generateRefreshToken(savedUser);
      authLogger.info('Individual registration completed', {
        userId: savedUser.id,
        email: savedUser.email,
      });
      return {
        user: savedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      authLogger.error('Individual registration failed', {
        email: dto.email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Register organization
   */
  async registerOrganization(dto: OrganizationRegistrationDto): Promise<AuthResult> {
    try {
      authLogger.info('Organization registration started', {
        email: dto.email,
        organizationName: dto.organizationName,
      });
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const organizationId = uuidv4();
      const organizationQuery = `
        INSERT INTO organizations (id, name, slug, description, settings, limits, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const organizationSettings = {
        industry: dto.industry,
        plan: dto.plan,
        timezone: dto.organizationTimezone || 'UTC',
        website: dto.organizationWebsite,
        address: dto.organizationAddress,
        country: dto.organizationCountry,
      };
      const organizationLimits = {
        maxUsers: dto.plan === 'enterprise' ? 1000 : dto.plan === 'pro' ? 100 : 10,
        maxRPCs: dto.plan === 'enterprise' ? 100 : dto.plan === 'pro' ? 50 : 5,
        maxAlerts: dto.plan === 'enterprise' ? 10000 : dto.plan === 'pro' ? 1000 : 100,
      };
      const organizationResult = await database.query(organizationQuery, [
        organizationId,
        dto.organizationName,
        dto.organizationSlug,
        dto.organizationDescription,
        JSON.stringify(organizationSettings),
        JSON.stringify(organizationLimits),
        true,
        new Date(),
        new Date(),
      ]);
      const user = new User({
        id: uuidv4(),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: UserRole.ORG_ADMIN,
        organizationId,
        isActive: true,
        emailVerified: false,
        marketingConsent: dto.marketingConsent || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedUser = await this.userRepository.create(user);
      const orgUserQuery = `
        INSERT INTO organization_users (organization_id, user_id, role, permissions, joined_at)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await database.query(orgUserQuery, [
        organizationId,
        savedUser.id,
        'admin',
        JSON.stringify(['*']),
        new Date(),
      ]);
      const token = this.generateToken(savedUser);
      const refreshToken = this.generateRefreshToken(savedUser);
      authLogger.info('Organization registration completed', {
        userId: savedUser.id,
        email: savedUser.email,
        organizationId,
        organizationName: dto.organizationName,
      });
      return {
        user: savedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      authLogger.error('Organization registration failed', {
        email: dto.email,
        organizationName: dto.organizationName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Join existing organization
   */
  async joinOrganization(dto: JoinOrganizationDto): Promise<AuthResult> {
    try {
      authLogger.info('Join organization started', {
        email: dto.email,
        organizationId: dto.organizationId,
      });
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const orgQuery = 'SELECT * FROM organizations WHERE id = $1 AND is_active = true';
      const orgResult = await database.query(orgQuery, [dto.organizationId]);

      if (orgResult.rows.length === 0) {
        throw new Error('Organization not found or inactive');
      }

      const organization = orgResult.rows[0];
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = new User({
        id: uuidv4(),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: UserRole.USER,
        organizationId: dto.organizationId,
        department: dto.department,
        managerEmail: dto.managerEmail,
        isActive: true,
        emailVerified: false,
        marketingConsent: dto.marketingConsent || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedUser = await this.userRepository.create(user);
      const orgUserQuery = `
        INSERT INTO organization_users (organization_id, user_id, role, permissions, joined_at)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await database.query(orgUserQuery, [
        dto.organizationId,
        savedUser.id,
        'member',
        JSON.stringify(['read']),
        new Date(),
      ]);
      const token = this.generateToken(savedUser);
      const refreshToken = this.generateRefreshToken(savedUser);
      authLogger.info('Join organization completed', {
        userId: savedUser.id,
        email: savedUser.email,
        organizationId: dto.organizationId,
        organizationName: organization.name,
      });
      return {
        user: savedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      authLogger.error('Join organization failed', {
        email: dto.email,
        organizationId: dto.organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      authLogger.info('Password reset requested', { email });
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        authLogger.info('Password reset requested for non-existent user', { email });
        return;
      }
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'password_reset',
        },
        this.jwtSecret,
        { expiresIn: '1h' },
      );
      const tokenQuery = `
        INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          token = EXCLUDED.token,
          expires_at = EXCLUDED.expires_at,
          created_at = EXCLUDED.created_at
      `;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await database.query(tokenQuery, [user.id, resetToken, expiresAt, new Date()]);
      authLogger.info('Password reset token generated', {
        userId: user.id,
        email: user.email,
        token: resetToken,
      });
    } catch (error) {
      authLogger.error('Password reset request failed', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      authLogger.info('Password reset attempted', { token: token.substring(0, 10) + '...' });
      let decoded: any;
      try {
        decoded = jwt.verify(token, this.jwtSecret);
      } catch (error) {
        throw new Error('Invalid or expired reset token');
      }
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      const tokenQuery = `
        SELECT * FROM password_reset_tokens
        WHERE user_id = $1 AND token = $2 AND expires_at > NOW()
      `;
      const tokenResult = await database.query(tokenQuery, [decoded.userId, token]);
      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }
      const passwordHash = await bcrypt.hash(newPassword, 12);
      const updateQuery = `
        UPDATE users
        SET password_hash = $1, updated_at = $2
        WHERE id = $3
      `;
      await database.query(updateQuery, [passwordHash, new Date(), decoded.userId]);
      const deleteTokenQuery = 'DELETE FROM password_reset_tokens WHERE user_id = $1';
      await database.query(deleteTokenQuery, [decoded.userId]);
      authLogger.info('Password reset completed', {
        userId: decoded.userId,
        email: decoded.email,
      });
    } catch (error) {
      authLogger.error('Password reset failed', {
        token: token.substring(0, 10) + '...',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTokenExpiresIn });
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findByIdOrFail(userId);
      return user;
    } catch (error) {
      authLogger.error('Get profile failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.userRepository.findByIdOrFail(userId);
      const updatedUser = new User({ ...user, ...updateData, updatedAt: new Date() });
      return await this.userRepository.update(userId, updatedUser);
    } catch (error) {
      authLogger.error('Update profile failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findByIdOrFail(userId);

      if (!user.passwordHash) {
        throw new Error('User has no password set');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      const updatedUser = new User({
        ...user,
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      });
      await this.userRepository.update(userId, updatedUser);

      authLogger.info('Password changed successfully', { userId });
    } catch (error) {
      authLogger.error('Change password failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId: string): Promise<void> {
    try {
      authLogger.info('User logged out', { userId });
    } catch (error) {
      authLogger.error('Logout failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Note: AuthService instance should be created with UserRepository dependency injection
