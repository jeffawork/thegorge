import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationLogger } from '../utils/logger';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[property];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      validationLogger.warn('Validation failed', {
        property,
        errors: errorDetails,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails,
        timestamp: new Date()
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(2).max(255).required(),
    organizationId: Joi.string().uuid().optional()
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // RPC configuration
  rpcConfig: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    url: Joi.string().uri().required().max(500),
    network: Joi.string().min(1).max(100).required(),
    chainId: Joi.number().integer().positive().required(),
    timeout: Joi.number().integer().min(1000).max(300000).default(30000),
    enabled: Joi.boolean().default(true),
    priority: Joi.number().integer().min(1).max(10).default(1),
    alertThresholds: Joi.object({
      responseTime: Joi.number().integer().min(100).max(30000),
      errorRate: Joi.number().min(0).max(100),
      peerCount: Joi.number().integer().min(0),
      blockLag: Joi.number().integer().min(0),
      syncLag: Joi.number().integer().min(0)
    }).default({}),
    maxHistoryEntries: Joi.number().integer().min(10).max(10000).default(100)
  }),

  // Alert creation
  alert: Joi.object({
    rpcConfigId: Joi.string().uuid().required(),
    type: Joi.string().valid('response_time', 'error_rate', 'peer_count', 'block_lag', 'sync_lag', 'offline').required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    message: Joi.string().min(1).max(1000).required(),
    details: Joi.object().default({})
  }),

  // Alert rule
  alertRule: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
    conditions: Joi.object({
      metric: Joi.string().required(),
      operator: Joi.string().valid('>', '<', '>=', '<=', '=', '!=').required(),
      threshold: Joi.number().required(),
      duration: Joi.number().integer().min(1).max(3600).default(300) // seconds
    }).required(),
    actions: Joi.array().items(Joi.object({
      type: Joi.string().valid('email', 'webhook', 'slack').required(),
      config: Joi.object().required()
    })).default([]),
    isActive: Joi.boolean().default(true)
  }),

  // Password change
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // User profile update
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    avatar: Joi.string().uri().max(500).optional()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // Organization ID parameter
  orgParam: Joi.object({
    organizationId: Joi.string().uuid().required()
  }),

  // User ID parameter
  userParam: Joi.object({
    userId: Joi.string().uuid().required()
  })
};

/**
 * Custom validation for RPC URL
 */
export const validateRPCUrl = (req: Request, res: Response, next: NextFunction): void => {
  const { url } = req.body;
  
  if (!url) {
    res.status(400).json({
      success: false,
      error: 'RPC URL is required',
      timestamp: new Date()
    });
    return;
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    
    // Check if it's HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      res.status(400).json({
        success: false,
        error: 'RPC URL must use HTTP or HTTPS protocol',
        timestamp: new Date()
      });
      return;
    }

    // Check for common RPC endpoints
    const path = urlObj.pathname.toLowerCase();
    const validPaths = ['/', '/rpc', '/api', '/v1', '/eth', '/jsonrpc'];
    
    if (!validPaths.some(validPath => path === validPath || path.startsWith(validPath + '/'))) {
      validationLogger.warn('Unusual RPC URL path', {
        url: url,
        path: path,
        ip: req.ip
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid RPC URL format',
      timestamp: new Date()
    });
  }
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would integrate with rate limiting service
  // For now, we'll just log the request
  validationLogger.debug('Rate limit check', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
  
  next();
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Basic input sanitization
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};
