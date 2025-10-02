import { Pool, PoolConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { databaseLogger } from './logger';

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Migration record interface
export interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: Date;
}

// Migration result interface
export interface MigrationResult {
  success: boolean;
  executedMigrations: string[];
  errors: string[];
}

// Migration runner class
export class MigrationRunner {
  private pool: Pool;
  private config: DatabaseConfig;
  private readonly MIGRATION_TABLE = 'schema_migrations';

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.pool = new Pool(config as PoolConfig);
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      executedMigrations: [],
      errors: []
    };

    try {
      databaseLogger.info('Starting database migrations');
      
      const client = await this.pool.connect();
      
      try {
        // Create migrations table if it doesn't exist
        await this.createMigrationsTable(client);
        
        // Get migration files
        const migrationFiles = this.getMigrationFiles();
        databaseLogger.info(`Found ${migrationFiles.length} migration files`);
        
        // Get executed migrations
        const executedMigrations = await this.getExecutedMigrations(client);
        const executedFilenames = executedMigrations.map(row => row.filename);
        
        // Find new migrations
        const newMigrations = migrationFiles.filter(file => 
          !executedFilenames.includes(file)
        );
        
        if (newMigrations.length === 0) {
          databaseLogger.info('Database is up to date, no new migrations to run');
          return result;
        }
        
        databaseLogger.info(`Running ${newMigrations.length} new migrations`);
        
        // Execute each migration
        for (const filename of newMigrations) {
          try {
            await this.executeMigration(client, filename);
            result.executedMigrations.push(filename);
            databaseLogger.info(`Migration ${filename} executed successfully`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`${filename}: ${errorMessage}`);
            result.success = false;
            databaseLogger.error(`Migration ${filename} failed:`, { error: errorMessage });
            throw error; // Stop on first error
          }
        }
        
        databaseLogger.info('All migrations completed successfully');
        
      } finally {
        client.release();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Migration runner error: ${errorMessage}`);
      result.success = false;
      databaseLogger.error('Migration runner failed:', { error: errorMessage });
    }
    
    return result;
  }

  /**
   * Create migrations tracking table
   */
  private async createMigrationsTable(client: any): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.MIGRATION_TABLE} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        description TEXT
      )
    `);
  }

  /**
   * Get list of migration files
   */
  private getMigrationFiles(): string[] {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      databaseLogger.warn('No migrations directory found');
      return [];
    }
    
    return fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * Get executed migrations from database
   */
  private async getExecutedMigrations(client: any): Promise<MigrationRecord[]> {
    const result = await client.query(
      `SELECT filename FROM ${this.MIGRATION_TABLE} ORDER BY id`
    );
    return result.rows;
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(client: any, filename: string): Promise<void> {
    const migrationPath = path.join(process.cwd(), 'migrations', filename);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Calculate checksum for integrity
    const crypto = require('crypto');
    const checksum = crypto.createHash('sha256').update(migrationSQL).digest('hex');
    
    // Extract description from filename or SQL comments
    const description = this.extractDescription(filename, migrationSQL);
    
    await client.query('BEGIN');
    
    try {
      // Execute migration SQL
      await client.query(migrationSQL);
      
      // Record migration as executed
      await client.query(
        `INSERT INTO ${this.MIGRATION_TABLE} (filename, checksum, description) VALUES ($1, $2, $3)`,
        [filename, checksum, description]
      );
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Extract description from filename or SQL comments
   */
  private extractDescription(filename: string, sql: string): string {
    // Try to extract from SQL comments
    const commentMatch = sql.match(/--\s*Description:\s*(.+)/i);
    if (commentMatch) {
      return commentMatch[1].trim();
    }
    
    // Fallback to filename without extension and numbers
    return filename
      .replace(/^\d+_/, '') // Remove leading numbers
      .replace(/\.sql$/, '') // Remove .sql extension
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: string[];
  }> {
    const client = await this.pool.connect();
    
    try {
      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations(client);
      const executedFilenames = executedMigrations.map(row => row.filename);
      const pending = migrationFiles.filter(file => !executedFilenames.includes(file));
      
      return {
        total: migrationFiles.length,
        executed: executedMigrations.length,
        pending
      };
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Factory function to create migration runner with environment config
export function createMigrationRunner(): MigrationRunner {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'the_gorge',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  };
  
  return new MigrationRunner(config);
}
