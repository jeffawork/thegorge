import { createApp } from './app';
import { logger } from './utils/logger';
import { config } from './config';

async function startServer() {
  try {
    logger.info('Starting EVM RPC Monitor...', {
      nodeEnv: config.nodeEnv,
      port: config.port,
      rpcCount: config.rpcConfigs.length
    });

    const { server, monitoringService, alertService } = createApp();

    server.listen(config.port, () => {
      logger.info(`🚀 RPC Monitor server is running on port ${config.port}`, {
        port: config.port,
        environment: config.nodeEnv,
        dashboardUrl: `http://localhost:${config.port}`,
        apiUrl: `http://localhost:${config.port}/api`,
        healthUrl: `http://localhost:${config.port}/ping`
      });

      // Log configured RPCs
      logger.info('Monitoring RPCs:', {
        rpcs: config.rpcConfigs.map(rpc => ({
          name: rpc.name,
          network: rpc.network,
          chainId: rpc.chainId
        }))
      });

      // Log monitoring configuration
      logger.info('Monitoring configuration:', {
        interval: `${config.monitoringInterval}ms`,
        alertThresholds: config.alertThresholds,
        maxHistoryEntries: config.maxHistoryEntries,
        cleanupInterval: `${config.cleanupIntervalHours}h`
      });
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
        process.exit(1);
      } else if (error.code === 'EACCES') {
        logger.error(`Permission denied to bind to port ${config.port}`);
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

// Start the server
startServer();
