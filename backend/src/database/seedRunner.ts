import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { database } from './connection';
import { databaseLogger } from '../utils/logger';

export interface Seed {
  id: string;
  name: string;
  filename: string;
  sql: string;
}

export class SeedRunner {
  private seedsPath: string;

  constructor(seedsPath: string = join(__dirname, 'seeds')) {
    this.seedsPath = seedsPath;
  }

  async getSeeds(): Promise<Seed[]> {
    try {
      const files = readdirSync(this.seedsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const seeds: Seed[] = [];

      for (const file of files) {
        const filePath = join(this.seedsPath, file);
        const sql = readFileSync(filePath, 'utf8');

        // Extract seed ID from filename (e.g., "001_users.sql" -> "001")
        const id = file.split('_')[0];
        const name = file.replace('.sql', '').replace(`${id}_`, '');

        seeds.push({
          id,
          name,
          filename: file,
          sql,
        });
      }

      return seeds;
    } catch (error) {
      databaseLogger.error('Failed to read seeds', {
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
        databaseLogger.info('No seeds found');
        return;
      }

      databaseLogger.info(`Running ${seeds.length} seeds`);

      for (const seed of seeds) {
        await this.runSeed(seed);
      }

      databaseLogger.info('All seeds completed successfully');
    } catch (error) {
      databaseLogger.error('Seeding failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async runSeed(seed: Seed): Promise<void> {
    try {
      databaseLogger.info(`Running seed: ${seed.name}`);

      await database.query(seed.sql);

      databaseLogger.info(`Seed completed: ${seed.name}`);
    } catch (error) {
      databaseLogger.error(`Seed failed: ${seed.name}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async clearSeeds(): Promise<void> {
    try {
      databaseLogger.info('Clearing seed data');

      // Clear tables in reverse dependency order
      const clearQueries = [
        'DELETE FROM refresh_tokens',
        'DELETE FROM organization_users',
        'DELETE FROM users',
        'DELETE FROM organizations',
      ];

      for (const query of clearQueries) {
        await database.query(query);
      }

      databaseLogger.info('Seed data cleared');
    } catch (error) {
      databaseLogger.error('Failed to clear seed data', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
