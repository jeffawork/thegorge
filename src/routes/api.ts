import { Router, Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { AlertService } from '../services/alertService';
import { apiLogger } from '../utils/logger';
import { APIResponse } from '../types';

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
   * GET /api/health - Health check endpoint
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
   * GET /api/rpcs - Get all RPC statuses
   */
  router.get('/rpcs', asyncHandler(async (req: Request, res: Response) => {
    const statuses = monitoringService.getRPCStatuses();
    
    const response: APIResponse = {
      success: true,
      data: statuses,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/rpcs/:id - Get specific RPC status
   */
  router.get('/rpcs/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = monitoringService.getRPCStatus(id);
    
    if (!status) {
      const response: APIResponse = {
        success: false,
        error: `RPC with ID '${id}' not found`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: status,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/rpcs/:id/history - Get RPC health history
   */
  router.get('/rpcs/:id/history', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500); // Max 500 entries
    
    const history = monitoringService.getHealthHistory(id, limit);
    
    if (history.length === 0) {
      const response: APIResponse = {
        success: false,
        error: `No history found for RPC with ID '${id}'`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: {
        rpcId: id,
        history,
        count: history.length
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/metrics - Get system metrics
   */
  router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
    const metrics = monitoringService.getSystemMetrics();
    
    const response: APIResponse = {
      success: true,
      data: metrics,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/performance - Get performance statistics
   */
  router.get('/performance', asyncHandler(async (req: Request, res: Response) => {
    const { rpcId } = req.query;
    const stats = monitoringService.getPerformanceStats(rpcId as string);
    
    const response: APIResponse = {
      success: true,
      data: stats,
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/alerts - Get alerts with optional filters
   */
  router.get('/alerts', asyncHandler(async (req: Request, res: Response) => {
    const {
      resolved,
      rpcId,
      type,
      severity,
      limit,
      offset
    } = req.query;

    const options = {
      includeResolved: resolved !== 'false',
      rpcId: rpcId as string,
      type: type as any,
      severity: severity as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    // Remove undefined values
    Object.keys(options).forEach(key => 
      options[key as keyof typeof options] === undefined && delete options[key as keyof typeof options]
    );

    const alerts = alertService.getAlerts(options);
    
    const response: APIResponse = {
      success: true,
      data: {
        alerts,
        count: alerts.length,
        filters: options
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/alerts/stats - Get alert statistics
   */
  router.get('/alerts/stats', asyncHandler(async (req: Request, res: Response) => {
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // Max 1 week
    const stats = alertService.getAlertStats(hours);
    
    const response: APIResponse = {
      success: true,
      data: {
        ...stats,
        timeRangeHours: hours
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/alerts/trends - Get alert trends over time
   */
  router.get('/alerts/trends', asyncHandler(async (req: Request, res: Response) => {
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // Max 1 week
    const interval = Math.max(parseInt(req.query.interval as string) || 1, 1); // Min 1 hour
    
    const trends = alertService.getAlertTrends(hours, interval);
    
    const response: APIResponse = {
      success: true,
      data: {
        trends,
        timeRangeHours: hours,
        intervalHours: interval
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * PATCH /api/alerts/:id/resolve - Resolve a specific alert
   */
  router.patch('/alerts/:id/resolve', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { resolvedBy } = req.body;
    
    const resolved = alertService.resolveAlert(id, resolvedBy);
    
    if (!resolved) {
      const response: APIResponse = {
        success: false,
        error: `Alert with ID '${id}' not found or already resolved`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: {
        message: 'Alert resolved successfully',
        alertId: id,
        resolvedBy
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * POST /api/alerts/resolve - Bulk resolve alerts
   */
  router.post('/alerts/resolve', asyncHandler(async (req: Request, res: Response) => {
    const { alertIds, resolvedBy } = req.body;
    
    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      const response: APIResponse = {
        success: false,
        error: 'alertIds must be a non-empty array',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const resolvedCount = alertService.bulkResolveAlerts(alertIds, resolvedBy);
    
    const response: APIResponse = {
      success: true,
      data: {
        message: `${resolvedCount} alerts resolved successfully`,
        resolvedCount,
        totalRequested: alertIds.length,
        resolvedBy
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/dashboard - Get complete dashboard data
   */
  router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
    const rpcs = monitoringService.getRPCStatuses();
    const metrics = monitoringService.getSystemMetrics();
    const alerts = alertService.getActiveAlerts();
    const stats = alertService.getAlertStats(24);
    
    const response: APIResponse = {
      success: true,
      data: {
        rpcs,
        metrics,
        alerts,
        alertStats: stats,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * GET /api/export/alerts - Export alerts as JSON
   */
  router.get('/export/alerts', asyncHandler(async (req: Request, res: Response) => {
    const includeResolved = req.query.resolved !== 'false';
    const alertsJson = alertService.exportAlerts(includeResolved);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="rpc-alerts-${Date.now()}.json"`);
    res.send(alertsJson);
  }));

  /**
   * POST /api/import/alerts - Import alerts from JSON
   */
  router.post('/import/alerts', asyncHandler(async (req: Request, res: Response) => {
    const { alertsData, merge = true } = req.body;
    
    if (!alertsData) {
      const response: APIResponse = {
        success: false,
        error: 'alertsData is required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const importedCount = alertService.importAlerts(
      typeof alertsData === 'string' ? alertsData : JSON.stringify(alertsData),
      merge
    );
    
    const response: APIResponse = {
      success: true,
      data: {
        message: `${importedCount} alerts imported successfully`,
        importedCount,
        merge
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  /**
   * DELETE /api/alerts - Clear old alerts
   */
  router.delete('/alerts', asyncHandler(async (req: Request, res: Response) => {
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // Max 1 week
    const clearedCount = alertService.clearOldAlerts(hours);
    
    const response: APIResponse = {
      success: true,
      data: {
        message: `${clearedCount} old alerts cleared`,
        clearedCount,
        olderThanHours: hours
      },
      timestamp: new Date()
    };
    
    res.json(response);
  }));

  // Error handling middleware for this router
  router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    apiLogger.error('API error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      params: req.params,
      query: req.query
    });

    const response: APIResponse = {
      success: false,
      error: 'Internal server error',
      timestamp: new Date()
    };

    res.status(500).json(response);
  });

  return router;
}
