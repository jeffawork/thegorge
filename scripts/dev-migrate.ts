#!/usr/bin/env ts-node

import { runMigrations } from './migrate';
import * as chokidar from 'chokidar';
import * as path from 'path';

console.log('🔄 Starting development migration watcher...');

// Ensure migrations directory exists
const migrationsDir = path.join(process.cwd(), 'migrations');
if (!require('fs').existsSync(migrationsDir)) {
  console.log('📁 Creating migrations directory...');
  require('fs').mkdirSync(migrationsDir, { recursive: true });
}

// Run initial migrations
runMigrations().then(() => {
  console.log('👀 Watching for migration file changes...');
  
  // Watch for changes in migration files
  const watcher = chokidar.watch('migrations/*.sql', {
    ignored: /^\./,
    persistent: true,
    ignoreInitial: true,
    cwd: process.cwd()
  });
  
  watcher.on('change', (filePath: string) => {
    console.log(`📝 Migration file changed: ${filePath}`);
    console.log('🔄 Re-running migrations...');
    runMigrations().catch(console.error);
  });
  
  watcher.on('add', (filePath: string) => {
    console.log(`📝 New migration file added: ${filePath}`);
    console.log('🔄 Running new migration...');
    runMigrations().catch(console.error);
  });
  
  watcher.on('unlink', (filePath: string) => {
    console.log(`📝 Migration file removed: ${filePath}`);
    console.log('⚠️  Note: Removing migration files does not rollback database changes');
  });
  
  watcher.on('error', (error: Error) => {
    console.error('❌ Migration watcher error:', error.message);
  });
  
  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Stopping migration watcher...');
    watcher.close();
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  console.log('✅ Migration watcher is running. Press Ctrl+C to stop.');
  
}).catch(console.error);
