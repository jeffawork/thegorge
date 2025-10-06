import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from '../database';
import { authLogger } from '../utils/logger';
import { User } from '../types';
import { UserRepository } from '../repositories/user.repository';
import { 
  IndividualRegistrationDto,
  OrganizationRegistrationDto,
  JoinOrganizationDto 
} from '../dto/auth.dto';

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
        [data.email]
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
        [data.email, passwordHash, data.name, 'user', true]
      );

      const user = userResult.rows[0];

      // Add to default organization if no organization specified
      const orgId = data.organizationId || '00000000-0000-0000-0000-000000000000';
      await database.query(
        'INSERT INTO organization_users (organization_id, user_id, role) VALUES ($1, $2, $3)',
        [orgId, user.id, 'member']
      );

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role, orgId);

      authLogger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        organizationId: orgId
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`,
          createdAt: user.created_at,
          rpcConfigs: []
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      authLogger.error('User registration failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error)
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
        [credentials.email]
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
        [user.id]
      );

      // Get user's RPC configs
      const rpcConfigsResult = await database.query(
        'SELECT * FROM rpc_configs WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );

      // Generate tokens
      const tokens = await this.generateTokens(
        user.id, 
        user.email, 
        user.role, 
        user.organization_id
      );

      authLogger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        organizationId: user.organization_id
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`,
          createdAt: user.created_at,
          rpcConfigs: rpcConfigsResult.rows
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      authLogger.error('User login failed', {
        email: credentials.email,
        error: error instanceof Error ? error.message : String(error)
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
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        throw new Error('User not found or inactive');
      }

      return decoded;
    } catch (error) {
      authLogger.error('Token verification failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as JwtPayload;
      
      // Verify user still exists and is active
      const userResult = await database.query(
        'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
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
          organizationId: decoded.organizationId
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
      );

      return { accessToken };
    } catch (error) {
      authLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : String(error)
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
    organizationId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId,
      email,
      role,
      organizationId
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current password hash
      const userResult = await database.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await database.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, userId]
      );

      authLogger.info('Password changed successfully', { userId });
    } catch (error) {
      authLogger.error('Password change failed', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await database.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = result.rows[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at,
        rpcConfigs: [] // TODO: Load RPC configs if needed
      };
    } catch (error) {
      authLogger.error('Failed to get user profile', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.avatar !== undefined) {
        fields.push(`avatar = $${paramIndex++}`);
        values.push(updates.avatar);
      }

      if (fields.length === 0) {
        return this.getProfile(userId);
      }

      fields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      values.push(userId);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await database.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at,
        rpcConfigs: []
      };
    } catch (error) {
      authLogger.error('Failed to update user profile', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Forgot password (placeholder)
   */
  async forgotPassword(email: string): Promise<void> {
    // TODO: Implement password reset email functionality
    authLogger.info('Password reset requested', { email });
  }

  /**
   * Reset password (placeholder)
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Implement password reset with token validation
    authLogger.info('Password reset attempted', { token: token.substring(0, 10) + '...' });
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you might want to maintain
    // a blacklist of invalidated tokens. For MVP, we'll rely on short token expiry.
    authLogger.info('User logged out', { userId });
  }

  /**
   * Register individual user
   */
  async registerIndividual(dto: IndividualRegistrationDto): Promise<AuthResult> {
    // TODO: Implement individual registration
    authLogger.info('Individual registration attempted', { email: dto.email });
    throw new Error('Individual registration not implemented yet');
  }

  /**
   * Register organization
   */
  async registerOrganization(dto: OrganizationRegistrationDto): Promise<AuthResult> {
    // TODO: Implement organization registration
    authLogger.info('Organization registration attempted', { email: dto.email, organizationName: dto.organizationName });
    throw new Error('Organization registration not implemented yet');
  }

  /**
   * Join existing organization
   */
  async joinOrganization(dto: JoinOrganizationDto): Promise<AuthResult> {
    // TODO: Implement join organization
    authLogger.info('Join organization attempted', { email: dto.email, organizationId: dto.organizationId });
    throw new Error('Join organization not implemented yet');
  }
}

// Note: AuthService instance should be created with UserRepository dependency injection
