import { Router, Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { AlertService } from '../services/alertService';
import { UserService } from '../services/userService';
import { Web3Service } from '../services/web3Service';
import { apiLogger } from '../utils/logger';
import { APIResponse, RPCConfig, EVM_NETWORKS } from '../types';

// Middleware to handle async errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to log API requests
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    apiLogger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

export function createApiRouter(monitoringService: MonitoringService, alertService: AlertService, metricsService?: any): Router {
  const router = Router();
  const userService = monitoringService.getUserService();
  const web3Service = monitoringService.getWeb3Service();

  // Apply middleware
  router.use(requestLogger);

  /**
   * GET /metrics - Prometheus metrics endpoint
   */
  router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
    if (!metricsService) {
      return res.status(503).json({
        success: false,
        error: 'Metrics service not available',
        timestamp: new Date()
      });
    }
    
    try {
      const metrics = await metricsService.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      apiLogger.error('Failed to get metrics', {
        error: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        timestamp: new Date()
      });
    }
  }));

  /**
   * GET /health - Health check endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    const response: APIResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        monitoring: monitoringService.isMonitoringActive(),
        version: process.env.npm_package_version || '1.0.0'
      },
      timestamp: new Date()
    };
    
    res.json(response);
  });

  /**
   * GET /networks - Get available EVM networks
   */
  router.get('/networks', (req: Request, res: Response) => {
    const response: APIResponse = {
      success: true,
      data: EVM_NETWORKS,
      timestamp: new Date()
    };
    
    res.json(response);
  });

  /**
   * POST /networks/detect - Detect network from RPC endpoint
   */
  router.post('/networks/detect', asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'RPC URL is required',
        timestamp: new Date()
      });
    }

    try {
      const networkInfo = await web3Service.detectNetwork(url);
      
      if (!networkInfo) {
        return res.status(400).json({
          success: false,
          error: 'Failed to detect network from RPC endpoint',
          timestamp: new Date()
        });
      }

      const response: APIResponse = {
        success: true,
        data: networkInfo,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      apiLogger.error('Network detection failed', {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Network detection failed',
        timestamp: new Date()
      });
    }
  }));

  /**
   * GET /users/:userId/rpcs - Get all RPCs for a user
   */
  router.get('/users/:userId/rpcs', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const rpcs = userService.getUserRPCs(userId);
    
    const response: APIResponse = {
      success: true,
      data: rpcs,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * POST /users/:userId/rpcs - Add new RPC for a user
   */
  router.post('/users/:userId/rpcs', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const rpcData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'url', 'network', 'chainId'];
    for (const field of requiredFields) {
      if (!rpcData[field]) {
        return res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`,
          timestamp: new Date()
        });
      }
    }

    try {
      const newRPC = await userService.addUserRPC(userId, {
        ...rpcData,
        timeout: rpcData.timeout || 10000,
        enabled: rpcData.enabled !== false,
        priority: rpcData.priority || 1,
        maxHistoryEntries: rpcData.maxHistoryEntries || 100,
        alertThresholds: rpcData.alertThresholds || {
          responseTime: 5000,
          errorRate: 10,
          peerCount: 5,
          blockLag: 5,
          syncLag: 5
        }
      });

      if (!newRPC) {
        return res.status(400).json({
          success: false,
          error: 'Failed to add RPC configuration',
          timestamp: new Date()
        });
      }

      // Start monitoring if this is the first RPC
      if (!monitoringService.isMonitoringActive()) {
        await monitoringService.startMonitoring(userId);
      }

      const response: APIResponse = {
        success: true,
        data: newRPC,
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      apiLogger.error('Failed to add RPC', {
        userId,
        rpcData,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to add RPC configuration',
        timestamp: new Date()
      });
    }
  }));

  /**
   * PUT /users/:userId/rpcs/:rpcId - Update RPC configuration
   */
  router.put('/users/:userId/rpcs/:rpcId', asyncHandler(async (req: Request, res: Response) => {
    const { userId, rpcId } = req.params;
    const updates = req.body;
    
    try {
      const updatedRPC = await userService.updateUserRPC(userId, rpcId, updates);
      
      if (!updatedRPC) {
        return res.status(404).json({
          success: false,
          error: 'RPC configuration not found',
          timestamp: new Date()
        });
      }

      const response: APIResponse = {
        success: true,
        data: updatedRPC,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      apiLogger.error('Failed to update RPC', {
        userId,
        rpcId,
        updates,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to update RPC configuration',
        timestamp: new Date()
      });
    }
  }));

  /**
   * DELETE /users/:userId/rpcs/:rpcId - Remove RPC configuration
   */
  router.delete('/users/:userId/rpcs/:rpcId', asyncHandler(async (req: Request, res: Response) => {
    const { userId, rpcId } = req.params;
    
    try {
      const success = await userService.removeUserRPC(userId, rpcId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'RPC configuration not found',
          timestamp: new Date()
        });
      }

      const response: APIResponse = {
        success: true,
        data: { message: 'RPC configuration removed successfully' },
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      apiLogger.error('Failed to remove RPC', {
        userId,
        rpcId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to remove RPC configuration',
        timestamp: new Date()
      });
    }
  }));

  /**
   * GET /users/:userId/rpcs/:rpcId/status - Get RPC status
   */
  router.get('/users/:userId/rpcs/:rpcId/status', asyncHandler(async (req: Request, res: Response) => {
    const { rpcId } = req.params;
    
    const status = monitoringService.getRPCStatus(rpcId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'RPC status not found',
        timestamp: new Date()
      });
    }

    const response: APIResponse = {
      success: true,
      data: status,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /users/:userId/rpcs/:rpcId/health - Test RPC connection
   */
  router.post('/users/:userId/rpcs/:rpcId/health', asyncHandler(async (req: Request, res: Response) => {
    const { rpcId } = req.params;
    
    try {
      const healthResult = await web3Service.performHealthCheck(rpcId);
      
      const response: APIResponse = {
        success: true,
        data: healthResult,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      apiLogger.error('Health check failed', {
        rpcId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date()
      });
    }
  }));

  /**
   * GET /users/:userId/status - Get user monitoring status
   */
  router.get('/users/:userId/status', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const stats = monitoringService.getMonitoringStats(userId);
    const userStats = userService.getUserStats(userId);
    
    const response: APIResponse = {
      success: true,
      data: {
        monitoring: stats,
        user: userStats
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /users/:userId/alerts - Get user alerts
   */
  router.get('/users/:userId/alerts', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { resolved, limit = 50 } = req.query;
    
    const alerts = userService.getUserAlerts(userId, resolved === 'true');
    const limitedAlerts = alerts.slice(0, Number(limit));
    
    const response: APIResponse = {
      success: true,
      data: {
        alerts: limitedAlerts,
        total: alerts.length,
        limit: Number(limit)
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * POST /users/:userId/alerts/:alertId/resolve - Resolve an alert
   */
  router.post('/users/:userId/alerts/:alertId/resolve', asyncHandler(async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { resolvedBy = 'user' } = req.body;
    
    try {
      const resolvedAlert = await alertService.resolveAlert(alertId, resolvedBy);
      
      if (!resolvedAlert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
          timestamp: new Date()
        });
      }

      const response: APIResponse = {
        success: true,
        data: resolvedAlert,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      apiLogger.error('Failed to resolve alert', {
        alertId,
        resolvedBy,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
        timestamp: new Date()
      });
    }
  }));

  /**
   * GET /users/:userId/alerts/stats - Get alert statistics
   */
  router.get('/users/:userId/alerts/stats', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const stats = alertService.getAlertStats(userId);
    
    const response: APIResponse = {
      success: true,
      data: stats,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /system/stats - Get system-wide statistics
   */
  router.get('/system/stats', (req: Request, res: Response) => {
    const systemStats = userService.getSystemStats();
    const connectionStats = web3Service.getConnectionStats();
    
    const response: APIResponse = {
      success: true,
      data: {
        users: systemStats,
        connections: connectionStats,
        monitoring: {
          isActive: monitoringService.isMonitoringActive()
        }
      },
      timestamp: new Date()
    };
    
    res.json(response);
  });

  return router;
}
