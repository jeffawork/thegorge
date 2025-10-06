import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MonitoringService } from './services/monitoringService';
import apiRoutes from './routes';
import { EVM_NETWORKS } from './types';
import { database } from './database';
import logger from './utils/logger';

logger.info('Starting EVM RPC Monitor application...');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Make database available to routes
app.locals.database = database;

// Initialize database and services
let monitoringService: MonitoringService;
let alertService: any;
let metricsService: any;
let userService: any;

async function initializeApp() {
  try {
    // Initialize database
    logger.info('Connecting to database...');
    await database.connect();
    logger.info('Database connected successfully');
    
    // Initialize services
    logger.info('Creating Web3Service...');
    monitoringService = new MonitoringService(io);
    logger.info('MonitoringService created successfully');
  
    logger.info('Getting AlertService...');
    alertService = monitoringService.getAlertService();
    logger.info('AlertService retrieved successfully');
    
    logger.info('Getting MetricsService...');
    metricsService = monitoringService.getMetricsService();
    logger.info('MetricsService retrieved successfully');
    
    logger.info('Getting UserService...');
    userService = monitoringService.getUserService();
    logger.info('UserService retrieved successfully');
    
    logger.info('All services initialized successfully');
    
    // Set up API routes after services are initialized
    app.use('/api', apiRoutes);
    
    // Start the server
    await startServer();
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// API routes will be set up after services are initialized

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  // Send initial data to the client
  const defaultUserId = 'default';
  const rpcs = monitoringService.getRPCStatuses(defaultUserId);
  const alerts = alertService.getUserAlerts(defaultUserId, false);
  
  socket.emit('initialData', { rpcs, alerts });

  // Handle client requests
  socket.on('requestRPCHistory', async (rpcId: string) => {
    const rpcStatus = monitoringService.getRPCStatus(rpcId);
    if (rpcStatus) {
      socket.emit('rpcHistory', rpcId, rpcStatus.history);
    }
  });

  socket.on('requestPerformanceStats', async (rpcId: string) => {
    const rpcStatus = monitoringService.getRPCStatus(rpcId);
    if (rpcStatus) {
      const stats = {
        avgResponseTime: rpcStatus.history.length > 0 
          ? rpcStatus.history.reduce((sum, h) => sum + h.responseTime, 0) / rpcStatus.history.length 
          : 0,
        uptime: rpcStatus.history.length > 0 
          ? (rpcStatus.history.filter(h => h.isOnline).length / rpcStatus.history.length) * 100 
          : 0,
        totalChecks: rpcStatus.history.length
      };
      socket.emit('performanceStats', rpcId, stats);
    }
  });

  socket.on('resolveAlert', async (alertId: string, resolvedBy: string) => {
    const resolvedAlert = await alertService.resolveAlert(alertId, resolvedBy);
    if (resolvedAlert) {
      socket.emit('alertResolved', resolvedAlert);
    }
  });

  socket.on('addRPC', async (rpcConfig) => {
    const defaultUserId = 'default';
    const newRPC = await userService.addUserRPC(defaultUserId, rpcConfig);
    
    if (newRPC) {
      // Start monitoring if this is the first RPC
      if (!monitoringService.isMonitoringActive()) {
        await monitoringService.startMonitoring(defaultUserId);
      }
      
      socket.emit('rpcAdded', newRPC);
      
      // Update all clients with the new RPC
      io.emit('rpcAdded', newRPC);
    }
  });

  socket.on('updateRPC', async (rpcId: string, updates) => {
    const defaultUserId = 'default';
    const updatedRPC = await userService.updateUserRPC(defaultUserId, rpcId, updates);
    
    if (updatedRPC) {
      socket.emit('rpcUpdated', updatedRPC);
      io.emit('rpcUpdated', updatedRPC);
    }
  });

  socket.on('deleteRPC', async (rpcId: string) => {
    const defaultUserId = 'default';
    const success = await userService.removeUserRPC(defaultUserId, rpcId);
    
    if (success) {
      socket.emit('rpcDeleted', rpcId);
      io.emit('rpcDeleted', rpcId);
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Start monitoring for the default user
async function startDefaultMonitoring() {
  try {
    const defaultUserId = 'default';
    const userRPCs = userService.getUserRPCs(defaultUserId);
    
    if (userRPCs.length > 0) {
      await monitoringService.startMonitoring(defaultUserId);
      logger.info('Default user monitoring started', { 
        userId: defaultUserId, 
        rpcCount: userRPCs.length 
      });
    } else {
      logger.info('No RPCs configured for default user, monitoring not started');
    }
  } catch (error) {
    logger.error('Failed to start default monitoring', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received shutdown signal, starting graceful shutdown...');
  
  // Stop monitoring
  if (monitoringService) {
    monitoringService.stopMonitoring();
  }
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close Socket.IO
  io.close(() => {
    logger.info('Socket.IO server closed');
  });
  
  // Cleanup services
  if (monitoringService) {
    monitoringService.cleanup();
  }
  
  // Disconnect database
  try {
    await database.disconnect();
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
  
  logger.info('Graceful shutdown completed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, starting graceful shutdown...');
  
  // Stop monitoring
  if (monitoringService) {
    monitoringService.stopMonitoring();
  }
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close Socket.IO
  io.close(() => {
    logger.info('Socket.IO server closed');
  });
  
  // Cleanup services
  if (monitoringService) {
    monitoringService.cleanup();
  }
  
  // Disconnect database
  try {
    await database.disconnect();
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
  
  logger.info('Graceful shutdown completed');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
async function startServer() {
  const PORT = process.env.PORT || 3000;

  logger.info('About to start server on port:', PORT);

  try {
    server.listen(PORT, () => {
      logger.info('🚀 RPC Monitor server is running on port 3000', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        dashboardUrl: `http://localhost:${PORT}`,
        apiUrl: `http://localhost:${PORT}/api`,
        healthUrl: `http://localhost:${PORT}/api/health`
      });

      // Start default monitoring after server is running
      startDefaultMonitoring();
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else if (error.code === 'EACCES') {
        logger.error(`Permission denied to bind to port ${PORT}`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize the application
initializeApp();

export default app;
