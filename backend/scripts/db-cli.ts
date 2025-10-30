#!/usr/bin/env ts-node

import { Command } from 'commander';
import { MigrationRunner } from '../src/database/migrationRunner';
import { SeedRunner } from '../src/database/seedRunner';
import { database } from '../src/database';

const program = new Command();

program
  .name('db-cli')
  .description('Database management CLI')
  .version('1.0.0');

// Migration commands
program
  .command('migrate')
  .description('Run pending migrations')
  .action(async () => {
    try {
      const migrationRunner = new MigrationRunner();
      await migrationRunner.runMigrations();
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  });

program
  .command('migrate:status')
  .description('Show migration status')
  .action(async () => {
    try {
      const migrationRunner = new MigrationRunner();
      const status = await migrationRunner.getMigrationStatus();
      
      console.log('📊 Migration Status:');
      console.log(`✅ Executed: ${status.executed.length} migrations`);
      console.log(`⏳ Pending: ${status.pending.length} migrations`);
      
      if (status.pending.length > 0) {
        console.log('\nPending migrations:');
        status.pending.forEach(id => console.log(`  - ${id}`));
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      process.exit(1);
    }
  });

program
  .command('migrate:rollback <migrationId>')
  .description('Rollback a specific migration')
  .action(async (migrationId) => {
    try {
      const migrationRunner = new MigrationRunner();
      await migrationRunner.rollbackMigration(migrationId);
      console.log(`✅ Migration ${migrationId} rolled back successfully`);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  });

// Seed commands
program
  .command('seed')
  .description('Run database seeds')
  .action(async () => {
    try {
      const seedRunner = new SeedRunner();
      await seedRunner.runSeeds();
      console.log('✅ Seeds completed successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  });

program
  .command('seed:clear')
  .description('Clear seed data')
  .action(async () => {
    try {
      const seedRunner = new SeedRunner();
      await seedRunner.clearSeeds();
      console.log('✅ Seed data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear seed data:', error);
      process.exit(1);
    }
  });

// Database commands
program
  .command('db:reset')
  .description('Reset database (drop and recreate)')
  .action(async () => {
    try {
      console.log('⚠️  This will drop and recreate the database!');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // This would need to be implemented based on your database setup
      console.log('🔄 Database reset functionality not implemented yet');
      console.log('Please manually drop and recreate the database');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      process.exit(1);
    }
  });

program
  .command('db:connect')
  .description('Test database connection')
  .action(async () => {
    try {
      await database.connect();
      console.log('✅ Database connection successful');
      await database.disconnect();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  });

program.parse();
