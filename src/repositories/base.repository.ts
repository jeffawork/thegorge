import { Pool, PoolClient } from 'pg';
import { database } from '../database';
import { BaseModel } from '../models/base.model';
import { ResourceNotFoundException } from '../exceptions';

export abstract class BaseRepository<T extends BaseModel> {
  protected tableName: string;
  protected pool: Pool;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.pool = database.getPool();
  }

  // Generic CRUD operations
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToModel(result.rows[0]);
  }

  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new ResourceNotFoundException(`${this.tableName} with id ${id} not found`);
    }
    return entity;
  }

  async findAll(limit?: number, offset?: number): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (limit) {
      query += ' LIMIT $1';
      params.push(limit);

      if (offset) {
        query += ' OFFSET $2';
        params.push(offset);
      }
    }

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToModel(row));
  }

  async count(): Promise<number> {
    const query = `SELECT COUNT(*) FROM ${this.tableName}`;
    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count);
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Abstract methods to be implemented by subclasses
  protected abstract mapRowToModel(row: any): T;
  protected abstract getInsertFields(): string[];
  protected abstract getInsertValues(entity: T): any[];
  protected abstract getUpdateFields(entity: T): string[];
  protected abstract getUpdateValues(entity: T): any[];

  // Transaction support
  async withTransaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
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
