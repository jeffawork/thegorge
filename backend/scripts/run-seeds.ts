#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { database } from '../src/database/connection';
import logger from '../src/utils/logger';

export class SeedRunner {
  private seedsPath: string;

  constructor(seedsPath: string = join(__dirname, '../src/database/seeds')) {
    this.seedsPath = seedsPath;
  }

  async getSeeds(): Promise<{ filename: string; sql: string }[]> {
    try {
      const files = readdirSync(this.seedsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const seeds = [];

      for (const file of files) {
        const filePath = join(this.seedsPath, file);
        const sql = readFileSync(filePath, 'utf8');
        seeds.push({ filename: file, sql });
      }

      return seeds;
    } catch (error) {
      logger.error('Failed to read seeds', {
        path: this.seedsPath,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async runSeeds(): Promise<void> {
    try {
      await database.connect();

      const seeds = await this.getSeeds();

      if (seeds.length === 0) {
        logger.info('No seeds to run');
        return;
      }

      logger.info(`Running ${seeds.length} seed files`);

      for (const seed of seeds) {
        await this.runSeed(seed);
      }

      logger.info('All seeds completed successfully');
    } catch (error) {
      logger.error('Seeding failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async runSeed(seed: { filename: string; sql: string }): Promise<void> {
    try {
      logger.info(`Running seed: ${seed.filename}`);

      await database.withTransaction(async (client) => {
        await client.query(seed.sql);
      });

      logger.info(`Seed completed: ${seed.filename}`);
    } catch (error) {
      logger.error(`Seed failed: ${seed.filename}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

async function runSeeds() {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await database.connect();
    logger.info('Database connected successfully');
    
    // Run seeds
    const seedRunner = new SeedRunner();
    await seedRunner.runSeeds();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
