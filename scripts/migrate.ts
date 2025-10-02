#!/usr/bin/env ts-node

import { createMigrationRunner } from '../src/utils/migrationRunner';

async function runMigrations(): Promise<void> {
  const migrationRunner = createMigrationRunner();
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Check migration status first
    const status = await migrationRunner.getMigrationStatus();
    console.log(`📊 Migration Status: ${status.executed}/${status.total} executed, ${status.pending.length} pending`);
    
    if (status.pending.length > 0) {
      console.log(`📝 Pending migrations: ${status.pending.join(', ')}`);
    }
    
    // Run migrations
    const result = await migrationRunner.runMigrations();
    
    if (result.success) {
      console.log('🎉 All migrations completed successfully!');
      if (result.executedMigrations.length > 0) {
        console.log(`✅ Executed migrations: ${result.executedMigrations.join(', ')}`);
      }
    } else {
      console.error('💥 Migration failed!');
      result.errors.forEach(error => console.error(`❌ ${error}`));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Migration runner failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await migrationRunner.close();
  }
}

// Development mode: run migrations and exit
if (process.env.NODE_ENV === 'development') {
  runMigrations().catch(console.error);
}

export { runMigrations };
