#!/usr/bin/env node

import { MigrationRunner } from '../src/database/migrationRunner';
import { database } from '../src/database/connection';
import logger from '../src/utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    // Connect to database
    await database.connect();
    logger.info('Database connected successfully');
    
    // Run migrations
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();
    
    // Get migration status
    const status = await migrationRunner.getMigrationStatus();
    logger.info('Migration status', {
      executed: status.executed,
      pending: status.pending,
    });
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
