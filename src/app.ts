import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { MonitoringService } from './services/monitoringService';
import { AlertService } from './services/alertService';
import { createApiRouter } from './routes/api';
import { logger } from './utils/logger';
import { config } from './config';
import { SocketEvents } from './types';

export function createApp(): { 
  app: express.Application; 
  server: any; 
  io: SocketIOServer;
  monitoringService: MonitoringService;
  alertService: AlertService;
} {
  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer<SocketEvents>(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Trust proxy if behind reverse proxy
  app.set('trust proxy', 1);

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Static files
  app.use(express.static(path.join(__dirname, '../public')));

  // Services
  const monitoringService = new MonitoringService();
  const alertService = monitoringService.getAlertService();

  // API Routes
  app.use('/api', createApiRouter(monitoringService, alertService, monitoringService.getMetricsService()));

  // Dashboard route
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Health check route (separate from API)
  app.get('/ping', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });

  // Socket.io connection handling
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients++;
    logger.info(`Client connected: ${socket.id} (${connectedClients} total)`);

    // Send initial data to the newly connected client
    socket.emit('initialData', {
      rpcs: monitoringService.getRPCStatuses(),
      metrics: monitoringService.getSystemMetrics(),
      alerts: alertService.getActiveAlerts(),
      timestamp: new Date()
    });

    // Handle client requests for specific data
    socket.on('requestRPCHistory', (data: { rpcId: string; limit?: number }) => {
      const history = monitoringService.getHealthHistory(data.rpcId, data.limit);
      socket.emit('rpcHistory', {
        rpcId: data.rpcId,
        history
      });
    });

    socket.on('requestPerformanceStats', (data: { rpcId?: string }) => {
      const stats = monitoringService.getPerformanceStats(data.rpcId);
      socket.emit('performanceStats', stats);
    });

    socket.on('resolveAlert', (data: { alertId: string; resolvedBy?: string }) => {
      const resolved = alertService.resolveAlert(data.alertId, data.resolvedBy || socket.id);
      if (resolved) {
        const alert = alertService.getAlerts({ rpcId: data.alertId, includeResolved: true })[0];
        if (alert) {
          socket.emit('alertResolved', alert);
        }
      }
    });

    socket.on('disconnect', (reason) => {
      connectedClients--;
      logger.info(`Client disconnected: ${socket.id} (${connectedClients} total) - ${reason}`);
    });

    // Handle client errors
    socket.on('error', (error) => {
      logger.error(`Socket error from ${socket.id}:`, error);
    });
  });

  // Set up real-time event listeners
  monitoringService.on('statusUpdate', (status) => {
    io.emit('rpcStatusUpdate', status);
  });

  monitoringService.on('healthCheck', (metrics) => {
    io.emit('systemMetricsUpdate', metrics);
  });

  monitoringService.on('alert', (alert) => {
    io.emit('newAlert', alert);
  });

  monitoringService.on('monitoringStarted', (data) => {
    io.emit('monitoringStatusChanged', { 
      status: 'started', 
      ...data 
    });
  });

  monitoringService.on('monitoringStopped', (data) => {
    io.emit('monitoringStatusChanged', { 
      status: 'stopped', 
      ...data 
    });
  });

  alertService.on('alertResolved', (alert) => {
    io.emit('alertResolved', alert);
  });

  alertService.on('newAlert', (alert) => {
    // Also emit through monitoring service events
    io.emit('newAlert', alert);
  });

  // Periodic client count logging
  setInterval(() => {
    if (connectedClients > 0) {
      logger.debug(`Active WebSocket connections: ${connectedClients}`);
    }
  }, 60000); // Log every minute

  // Periodic performance stats broadcast
  setInterval(() => {
    if (connectedClients > 0) {
      const performanceStats = monitoringService.getPerformanceStats();
      io.emit('performanceUpdate', performanceStats);
    }
  }, config.dashboardRefreshInterval);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled application error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      timestamp: new Date()
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.path}`,
      timestamp: new Date()
    });
  });

  // 404 handler for web routes - serve index.html for SPA routing
  app.use('*', (req, res) => {
    // If it's an API request that wasn't handled, return JSON error
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        timestamp: new Date()
      });
    }
    
    // For all other routes, serve the dashboard
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Start monitoring service
  monitoringService.startMonitoring().catch(error => {
    logger.error('Failed to start monitoring service:', error);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async () => {
    logger.info('Received shutdown signal, starting graceful shutdown...');
    
    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        // Stop monitoring
        monitoringService.stopMonitoring();
        
        // Cleanup services
        monitoringService.cleanup();
        alertService.cleanup();
        
        // Close socket connections
        io.close();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown();
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
  });

  return { 
    app, 
    server, 
    io, 
    monitoringService, 
    alertService 
  };
}
