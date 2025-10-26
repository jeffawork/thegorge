import { Pool } from 'pg';
import { databaseLogger } from '../utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isMockMode: boolean = false;

  constructor(config: DatabaseConfig, mockMode: boolean = false) {
    this.config = config;
    this.isMockMode = mockMode;
    
    if (!mockMode) {
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl || false,
        max: config.max || 20,
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
      });

      this.pool.on('error', (err) => {
        databaseLogger.error('Unexpected error on idle client', err);
      });
    } else {
      databaseLogger.info('Database running in mock mode for development');
    }
  }

  async connect(): Promise<void> {
    if (this.isMockMode) {
      databaseLogger.info('Database mock mode - skipping connection');
      return;
    }
    
    try {
      const client = await this.pool!.connect();
      databaseLogger.info('Database connected successfully');
      client.release();
    } catch (error) {
      databaseLogger.error('Database connection failed', {
        config: {
          database: this.config.database,
          host: this.config.host,
          port: this.config.port,
        },  
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isMockMode) {
      databaseLogger.info('Database mock mode - skipping disconnect');
      return;
    }
    
    try {
      await this.pool!.end();
      databaseLogger.info('Database disconnected successfully');
    } catch (error) {
      databaseLogger.error('Error disconnecting database', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (this.isMockMode) {
      // Return mock data for development
      databaseLogger.debug('Database mock mode - returning mock data', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      });
      
      // Return appropriate mock data based on query type
      if (text.includes('SELECT') && text.includes('users')) {
        return {
          rows: [{
            id: 'default-user',
            email: 'admin@example.com',
            password_hash: '$2a$10$mock.hash.for.development',
            name: 'Admin User',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            avatar_url: null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }],
          rowCount: 1
        };
      }
      
      if (text.includes('SELECT') && text.includes('rpc_configs')) {
        return {
          rows: [],
          rowCount: 0
        };
      }
      
      // Default mock response
      return {
        rows: [],
        rowCount: 0
      };
    }
    
    const start = Date.now();
    try {
      const result = await this.pool!.query(text, params);
      const duration = Date.now() - start;

      databaseLogger.debug('Database query executed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      databaseLogger.error('Database query failed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Create default database connection
const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'the_gorge',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

export const database = new DatabaseConnection(
  databaseConfig,
  process.env.MOCK_DATABASE === 'true'
);
