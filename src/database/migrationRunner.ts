import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { database } from './connection';
import { databaseLogger } from '../utils/logger';

export interface Migration {
  id: string;
  name: string;
  filename: string;
  sql: string;
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor(migrationsPath: string = join(__dirname, 'migrations')) {
    this.migrationsPath = migrationsPath;
  }

  async getMigrations(): Promise<Migration[]> {
    try {
      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const migrations: Migration[] = [];

      for (const file of files) {
        const filePath = join(this.migrationsPath, file);
        const sql = readFileSync(filePath, 'utf8');
        
        // Extract migration ID from filename (e.g., "001_initial_schema.sql" -> "001")
        const id = file.split('_')[0];
        const name = file.replace('.sql', '').replace(`${id}_`, '');
        
        migrations.push({
          id,
          name,
          filename: file,
          sql
        });
      }

      return migrations;
    } catch (error) {
      databaseLogger.error('Failed to read migrations', {
        path: this.migrationsPath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      const result = await database.query(
        'SELECT migration_id FROM migrations ORDER BY migration_id'
      );

      return result.rows.map(row => row.migration_id);
    } catch (error) {
      databaseLogger.error('Failed to get executed migrations', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await database.query(createTableSQL);
  }

  async runMigrations(): Promise<void> {
    try {
      await database.connect();
      
      const migrations = await this.getMigrations();
      const executedMigrations = await this.getExecutedMigrations();

      const pendingMigrations = migrations.filter(
        migration => !executedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        databaseLogger.info('No pending migrations');
        return;
      }

      databaseLogger.info(`Running ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      databaseLogger.info('All migrations completed successfully');
    } catch (error) {
      databaseLogger.error('Migration failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async runMigration(migration: Migration): Promise<void> {
    try {
      databaseLogger.info(`Running migration: ${migration.name}`);

      await database.withTransaction(async (client) => {
        // Execute the migration SQL
        await client.query(migration.sql);

        // Record the migration as executed
        await client.query(
          'INSERT INTO migrations (migration_id, name) VALUES ($1, $2)',
          [migration.id, migration.name]
        );
      });

      databaseLogger.info(`Migration completed: ${migration.name}`);
    } catch (error) {
      databaseLogger.error(`Migration failed: ${migration.name}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async rollbackMigration(migrationId: string): Promise<void> {
    try {
      const migrations = await this.getMigrations();
      const migration = migrations.find(m => m.id === migrationId);

      if (!migration) {
        throw new Error(`Migration ${migrationId} not found`);
      }

      databaseLogger.info(`Rolling back migration: ${migration.name}`);

      // Note: This is a simple rollback. In production, you'd want more sophisticated rollback logic
      await database.query(
        'DELETE FROM migrations WHERE migration_id = $1',
        [migrationId]
      );

      databaseLogger.info(`Migration rolled back: ${migration.name}`);
    } catch (error) {
      databaseLogger.error(`Rollback failed: ${migrationId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async getMigrationStatus(): Promise<{ executed: string[]; pending: string[] }> {
    const migrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();

    const executed = migrations
      .filter(m => executedMigrations.includes(m.id))
      .map(m => m.id);

    const pending = migrations
      .filter(m => !executedMigrations.includes(m.id))
      .map(m => m.id);

    return { executed, pending };
  }
}
