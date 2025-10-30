#!/usr/bin/env ts-node

import { createMigrationRunner } from '../src/utils/migrationRunner';
import * as fs from 'fs';
import * as path from 'path';

interface CLICommand {
  name: string;
  description: string;
  action: () => Promise<void>;
}

const commands: CLICommand[] = [
  {
    name: 'status',
    description: 'Show migration status',
    action: async () => {
      const runner = createMigrationRunner();
      try {
        const status = await runner.getMigrationStatus();
        console.log('📊 Migration Status:');
        console.log(`   Total migrations: ${status.total}`);
        console.log(`   Executed: ${status.executed}`);
        console.log(`   Pending: ${status.pending.length}`);
        
        if (status.pending.length > 0) {
          console.log('\n📝 Pending migrations:');
          status.pending.forEach(migration => console.log(`   - ${migration}`));
        }
      } finally {
        await runner.close();
      }
    }
  },
  {
    name: 'run',
    description: 'Run pending migrations',
    action: async () => {
      const runner = createMigrationRunner();
      try {
        const result = await runner.runMigrations();
        if (result.success) {
          console.log('✅ All migrations completed successfully!');
          if (result.executedMigrations.length > 0) {
            console.log(`📝 Executed: ${result.executedMigrations.join(', ')}`);
          }
        } else {
          console.error('❌ Migration failed!');
          result.errors.forEach(error => console.error(`   ${error}`));
          process.exit(1);
        }
      } finally {
        await runner.close();
      }
    }
  },
  {
    name: 'create',
    description: 'Create a new migration file',
    action: async () => {
      const args = process.argv.slice(3);
      if (args.length === 0) {
        console.error('❌ Please provide a migration name');
        console.log('Usage: npm run migrate:create <migration-name>');
        process.exit(1);
      }
      
      const migrationName = args[0];
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
      const filename = `${timestamp}_${migrationName}.sql`;
      
      const migrationsDir = path.join(process.cwd(), 'migrations');
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }
      
      const filePath = path.join(migrationsDir, filename);
      const template = `-- Migration: ${migrationName}
-- Description: Add your migration description here
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- CREATE TABLE example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
`;

      fs.writeFileSync(filePath, template);
      console.log(`✅ Created migration: ${filename}`);
      console.log(`📁 Location: ${filePath}`);
    }
  }
];

async function main() {
  const commandName = process.argv[2];
  
  if (!commandName) {
    console.log('🔄 Migration CLI');
    console.log('\nAvailable commands:');
    commands.forEach(cmd => {
      console.log(`   ${cmd.name.padEnd(10)} - ${cmd.description}`);
    });
    console.log('\nUsage: npm run migrate:cli <command>');
    return;
  }
  
  const command = commands.find(cmd => cmd.name === commandName);
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    console.log('Run without arguments to see available commands');
    process.exit(1);
  }
  
  try {
    await command.action();
  } catch (error) {
    console.error('❌ Command failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);
