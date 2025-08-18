import './app';
import logger from './utils/logger';

logger.info('Starting EVM RPC Monitor...', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000
});

// The app is imported above, which will start the server
// This file just logs the startup message
