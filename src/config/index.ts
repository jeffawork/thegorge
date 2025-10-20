import dotenv from 'dotenv';
import Joi from 'joi';
import { RPCConfig } from '../types';

dotenv.config();

// Define the schema first
const configSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  MONITORING_INTERVAL: Joi.number().min(5000).default(30000),
  ALERT_THRESHOLD_RESPONSE_TIME: Joi.number().default(5000),
  ALERT_THRESHOLD_ERROR_RATE: Joi.number().default(10),
  ALERT_THRESHOLD_PEER_COUNT: Joi.number().default(5),
  ALERT_THRESHOLD_BLOCK_LAG: Joi.number().default(5),
  RPC_CONFIG: Joi.string().required(),
  DASHBOARD_REFRESH_INTERVAL: Joi.number().default(5000),
  MAX_HISTORY_ENTRIES: Joi.number().default(100),
  CLEANUP_INTERVAL_HOURS: Joi.number().default(24),
});

// Extract only the environment variables we need and convert types
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  LOG_LEVEL: process.env.LOG_LEVEL,
  MONITORING_INTERVAL: process.env.MONITORING_INTERVAL ? parseInt(process.env.MONITORING_INTERVAL, 10) : undefined,
  ALERT_THRESHOLD_RESPONSE_TIME: process.env.ALERT_THRESHOLD_RESPONSE_TIME ? parseInt(process.env.ALERT_THRESHOLD_RESPONSE_TIME, 10) : undefined,
  ALERT_THRESHOLD_ERROR_RATE: process.env.ALERT_THRESHOLD_ERROR_RATE ? parseInt(process.env.ALERT_THRESHOLD_ERROR_RATE, 10) : undefined,
  ALERT_THRESHOLD_PEER_COUNT: process.env.ALERT_THRESHOLD_PEER_COUNT ? parseInt(process.env.ALERT_THRESHOLD_PEER_COUNT, 10) : undefined,
  ALERT_THRESHOLD_BLOCK_LAG: process.env.ALERT_THRESHOLD_BLOCK_LAG ? parseInt(process.env.ALERT_THRESHOLD_BLOCK_LAG, 10) : undefined,
  RPC_CONFIG: process.env.RPC_CONFIG,
  DASHBOARD_REFRESH_INTERVAL: process.env.DASHBOARD_REFRESH_INTERVAL ? parseInt(process.env.DASHBOARD_REFRESH_INTERVAL, 10) : undefined,
  MAX_HISTORY_ENTRIES: process.env.MAX_HISTORY_ENTRIES ? parseInt(process.env.MAX_HISTORY_ENTRIES, 10) : undefined,
  CLEANUP_INTERVAL_HOURS: process.env.CLEANUP_INTERVAL_HOURS ? parseInt(process.env.CLEANUP_INTERVAL_HOURS, 10) : undefined,
};

const { error, value } = configSchema.validate(envVars);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Parse RPC configuration
let rpcConfigs: RPCConfig[] = [];
try {
  rpcConfigs = JSON.parse(value.RPC_CONFIG);

  // Validate RPC configs
  const rpcSchema = Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
      chainId: Joi.number().required(),
      network: Joi.string().required(),
      timeout: Joi.number().optional(),
      enabled: Joi.boolean().default(true),
      priority: Joi.number().default(1),
    }),
  );

  const { error: rpcError } = rpcSchema.validate(rpcConfigs);
  if (rpcError) {
    throw new Error(`RPC config validation error: ${rpcError.message}`);
  }
} catch (err) {
  if (err instanceof Error) {
    throw new Error(`Invalid RPC_CONFIG JSON format: ${err.message}`);
  }
  throw new Error('Invalid RPC_CONFIG JSON format');
}

export const config = {
  nodeEnv: value.NODE_ENV as string,
  port: value.PORT as number,
  logLevel: value.LOG_LEVEL as string,
  monitoringInterval: value.MONITORING_INTERVAL as number,
  dashboardRefreshInterval: value.DASHBOARD_REFRESH_INTERVAL as number,
  maxHistoryEntries: value.MAX_HISTORY_ENTRIES as number,
  cleanupIntervalHours: value.CLEANUP_INTERVAL_HOURS as number,
  alertThresholds: {
    responseTime: value.ALERT_THRESHOLD_RESPONSE_TIME as number,
    errorRate: value.ALERT_THRESHOLD_ERROR_RATE as number,
    peerCount: value.ALERT_THRESHOLD_PEER_COUNT as number,
    blockLag: value.ALERT_THRESHOLD_BLOCK_LAG as number,
  },
  rpcConfigs: rpcConfigs.filter(rpc => rpc.enabled !== false),
};

// Validate that we have at least one RPC configured
if (config.rpcConfigs.length === 0) {
  throw new Error('No enabled RPC configurations found');
}

export default config;
