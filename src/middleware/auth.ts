import { Request, Response, NextFunction } from 'express';
// import { authServiceSimple, JwtPayload } from '../services/authServiceSimple';
import { authLogger } from '../utils/logger';

// Temporary JwtPayload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        timestamp: new Date()
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Temporary demo implementation - accept demo tokens
      if (token === 'demo-token' || token === 'demo-refreshed-token') {
        const decoded: JwtPayload = {
          userId: 'default',
          email: 'demo@example.com',
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        };
        req.user = decoded;
        next();
        return;
      }
      
      // For other tokens, reject
      throw new Error('Invalid token');
    } catch (error) {
      authLogger.error('Token verification failed', {
        error: error instanceof Error ? error.message : String(error),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date()
      });
    }
  } catch (error) {
    authLogger.error('Authentication middleware error', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      timestamp: new Date()
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Temporary demo implementation - accept demo tokens
        if (token === 'demo-token' || token === 'demo-refreshed-token') {
          const decoded: JwtPayload = {
            userId: 'default',
            email: 'demo@example.com',
            role: 'admin',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
          };
          req.user = decoded;
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        authLogger.debug('Optional auth token invalid', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    next();
  } catch (error) {
    authLogger.error('Optional authentication middleware error', {
      error: error instanceof Error ? error.message : String(error)
    });
    next(); // Continue even if there's an error
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      authLogger.warn('Access denied - insufficient permissions', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date()
      });
      return;
    }

    next();
  };
};

/**
 * Organization-based authorization middleware
 */
export const authorizeOrganization = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date()
    });
    return;
  }

  // Super admins can access any organization
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // Extract organization ID from request params or body
  const requestedOrgId = req.params.organizationId || req.body.organizationId;
  
  if (!requestedOrgId) {
    res.status(400).json({
      success: false,
      error: 'Organization ID required',
      timestamp: new Date()
    });
    return;
  }

  // Check if user belongs to the requested organization
  if (req.user.organizationId !== requestedOrgId) {
    authLogger.warn('Access denied - organization mismatch', {
      userId: req.user.userId,
      userOrgId: req.user.organizationId,
      requestedOrgId,
      path: req.path,
      method: req.method
    });
    
    res.status(403).json({
      success: false,
      error: 'Access denied to organization',
      timestamp: new Date()
    });
    return;
  }

  next();
};

/**
 * Resource ownership middleware
 */
export const authorizeResource = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }

    // Super admins can access any resource
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    const resourceId = req.params.id || req.params.rpcId || req.params.alertId;
    
    if (!resourceId) {
      res.status(400).json({
        success: false,
        error: 'Resource ID required',
        timestamp: new Date()
      });
      return;
    }

    try {
      // Check resource ownership based on type
      let query: string;
      let params: any[];

      switch (resourceType) {
        case 'rpc':
          query = 'SELECT user_id FROM rpc_configs WHERE id = $1';
          params = [resourceId];
          break;
        case 'alert':
          query = 'SELECT user_id FROM alerts WHERE id = $1';
          params = [resourceId];
          break;
        case 'user':
          query = 'SELECT id FROM users WHERE id = $1';
          params = [resourceId];
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid resource type',
            timestamp: new Date()
          });
          return;
      }

      const result = await req.app.locals.database.query(query, params);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
          timestamp: new Date()
        });
        return;
      }

      const resource = result.rows[0];
      const resourceUserId = resource.user_id || resource.id;

      // Check if user owns the resource or is an admin
      if (req.user.userId !== resourceUserId && !['admin', 'org_admin'].includes(req.user.role)) {
        authLogger.warn('Access denied - resource ownership', {
          userId: req.user.userId,
          resourceId,
          resourceType,
          resourceUserId,
          path: req.path,
          method: req.method
        });
        
        res.status(403).json({
          success: false,
          error: 'Access denied to resource',
          timestamp: new Date()
        });
        return;
      }

      next();
    } catch (error) {
      authLogger.error('Resource authorization error', {
        error: error instanceof Error ? error.message : String(error),
        resourceType,
        resourceId
      });
      
      res.status(500).json({
        success: false,
        error: 'Authorization service error',
        timestamp: new Date()
      });
    }
  };
};
