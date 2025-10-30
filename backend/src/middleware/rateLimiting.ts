import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { apiLogger } from '../utils/logger';

// Rate limiting configuration interface
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// Default rate limit configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Custom key generator that includes user ID if authenticated
const customKeyGenerator = (req: Request): string => {
  // Use the built-in IP key generator for proper IPv6 handling
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.userId || 'anonymous';
  return `${ip}:${userId}`;
};

// Create rate limiter with custom configuration
export const createRateLimiter = (config: Partial<RateLimitConfig> = {}): RateLimitRequestHandler => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return rateLimit({
    windowMs: finalConfig.windowMs,
    max: finalConfig.maxRequests,
    message: {
      success: false,
      error: finalConfig.message,
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date(),
    },
    standardHeaders: finalConfig.standardHeaders,
    legacyHeaders: finalConfig.legacyHeaders,
    skipSuccessfulRequests: finalConfig.skipSuccessfulRequests,
    skipFailedRequests: finalConfig.skipFailedRequests,
    // keyGenerator: finalConfig.keyGenerator || customKeyGenerator, // Temporarily disabled due to IPv6 validation

    // Custom handler for rate limit exceeded
    handler: (req: Request, res: Response) => {
      const key = customKeyGenerator(req);
      const userId = req.user?.userId || 'anonymous';

      apiLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userId,
        key,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        windowMs: finalConfig.windowMs,
        maxRequests: finalConfig.maxRequests,
      });

      res.status(429).json({
        success: false,
        error: finalConfig.message,
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date(),
        retryAfter: Math.ceil(finalConfig.windowMs / 1000),
      });
    },

    // Skip function for certain conditions
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      if (req.path === '/api/health') {
        return true;
      }

      // Skip for authenticated admin users (if needed)
      if (req.user?.role === 'admin' && process.env.NODE_ENV === 'development') {
        return true;
      }

      return false;
    },
  });
};

// Predefined rate limiters for different endpoints
export const generalRateLimit = createRateLimiter();

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  skipFailedRequests: true, // Don't count failed attempts
});

export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // Higher limit for API calls
  message: 'API rate limit exceeded, please try again later.',
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Very strict limit
  message: 'Too many requests, please slow down.',
});

// Rate limiter for file uploads
export const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Upload rate limit exceeded, please try again later.',
});

// Rate limiter for password reset
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later.',
});

// Dynamic rate limiter based on user role
export const createDynamicRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  let limiter: RateLimitRequestHandler;

  if (req.user?.role === 'admin') {
    limiter = createRateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 2000, // Higher limit for admins
    });
  } else if (req.user?.role === 'user') {
    limiter = createRateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 500, // Standard limit for users
    });
  } else {
    limiter = createRateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 100, // Lower limit for anonymous users
    });
  }

  limiter(req, res, next);
};

// Rate limiting middleware factory
export const createRateLimitMiddleware = (config: Partial<RateLimitConfig>): RateLimitRequestHandler => {
  return createRateLimiter(config);
};

// Export default rate limiter
export default generalRateLimit;
