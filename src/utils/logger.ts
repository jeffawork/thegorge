import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for better log readability
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, ...meta } = info;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${service ? `[${service}] ` : ''}${message}${metaStr}`;
  }),
);

// Create the main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'rpc-monitor' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Create child loggers for different services
export const createChildLogger = (service: string) => {
  return logger.child({ service });
};

export const apiLogger = createChildLogger('api');
export const web3Logger = createChildLogger('web3');
export const metricsLogger = createChildLogger('metrics');
export const userLogger = createChildLogger('user');
export const alertLogger = createChildLogger('alert');
export const alertingLogger = createChildLogger('alerting');
export const monitoringLogger = createChildLogger('monitoring');
export const authLogger = createChildLogger('auth');
export const validationLogger = createChildLogger('validation');
export const databaseLogger = createChildLogger('database');
export const rpcLogger = createChildLogger('rpc');
export const anomalyLogger = createChildLogger('anomaly');
export const auditLogger = createChildLogger('audit');
export const costLogger = createChildLogger('cost');
export const multiChainLogger = createChildLogger('multiChain');
export const organizationLogger = createChildLogger('organization');
export const rateLimitLogger = createChildLogger('rateLimit');
export const rbacLogger = createChildLogger('rbac');
export const dashboardLogger = createChildLogger('dashboard');
export const slaLogger = createChildLogger('sla');
export const usageLogger = createChildLogger('usage');
export const walletLogger = createChildLogger('wallet');

export default logger;
