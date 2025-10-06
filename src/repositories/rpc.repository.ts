import { BaseRepository } from './base.repository';
import { RpcConfig } from '../models/rpc.model';
import { ResourceNotFoundException } from '../exceptions';

export class RpcRepository extends BaseRepository<RpcConfig> {
  constructor() {
    super('rpc_configs');
  }

  protected mapRowToModel(row: any): RpcConfig {
    return new RpcConfig({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      url: row.url,
      network: row.network,
      chainId: row.chain_id,
      timeout: row.timeout,
      enabled: row.enabled,
      priority: row.priority,
      lastCheckedAt: row.last_checked_at,
      isHealthy: row.is_healthy,
      responseTime: row.response_time,
      errorCount: row.error_count,
      lastError: row.last_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  protected getInsertFields(): string[] {
    return [
      'id', 'user_id', 'name', 'url', 'network', 'chain_id', 
      'timeout', 'enabled', 'priority', 'is_healthy', 'error_count',
      'created_at', 'updated_at'
    ];
  }

  protected getInsertValues(entity: RpcConfig): any[] {
    return [
      entity.id,
      entity.userId,
      entity.name,
      entity.url,
      entity.network,
      entity.chainId,
      entity.timeout,
      entity.enabled,
      entity.priority,
      entity.isHealthy,
      entity.errorCount,
      entity.createdAt,
      entity.updatedAt
    ];
  }

  protected getUpdateFields(entity: RpcConfig): string[] {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (entity.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(entity.name);
    }
    if (entity.url !== undefined) {
      fields.push(`url = $${paramIndex++}`);
      values.push(entity.url);
    }
    if (entity.network !== undefined) {
      fields.push(`network = $${paramIndex++}`);
      values.push(entity.network);
    }
    if (entity.chainId !== undefined) {
      fields.push(`chain_id = $${paramIndex++}`);
      values.push(entity.chainId);
    }
    if (entity.timeout !== undefined) {
      fields.push(`timeout = $${paramIndex++}`);
      values.push(entity.timeout);
    }
    if (entity.enabled !== undefined) {
      fields.push(`enabled = $${paramIndex++}`);
      values.push(entity.enabled);
    }
    if (entity.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(entity.priority);
    }
    if (entity.isHealthy !== undefined) {
      fields.push(`is_healthy = $${paramIndex++}`);
      values.push(entity.isHealthy);
    }
    if (entity.responseTime !== undefined) {
      fields.push(`response_time = $${paramIndex++}`);
      values.push(entity.responseTime);
    }
    if (entity.errorCount !== undefined) {
      fields.push(`error_count = $${paramIndex++}`);
      values.push(entity.errorCount);
    }
    if (entity.lastError !== undefined) {
      fields.push(`last_error = $${paramIndex++}`);
      values.push(entity.lastError);
    }
    if (entity.lastCheckedAt !== undefined) {
      fields.push(`last_checked_at = $${paramIndex++}`);
      values.push(entity.lastCheckedAt);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    return fields;
  }

  protected getUpdateValues(entity: RpcConfig): any[] {
    const values = [];

    if (entity.name !== undefined) values.push(entity.name);
    if (entity.url !== undefined) values.push(entity.url);
    if (entity.network !== undefined) values.push(entity.network);
    if (entity.chainId !== undefined) values.push(entity.chainId);
    if (entity.timeout !== undefined) values.push(entity.timeout);
    if (entity.enabled !== undefined) values.push(entity.enabled);
    if (entity.priority !== undefined) values.push(entity.priority);
    if (entity.isHealthy !== undefined) values.push(entity.isHealthy);
    if (entity.responseTime !== undefined) values.push(entity.responseTime);
    if (entity.errorCount !== undefined) values.push(entity.errorCount);
    if (entity.lastError !== undefined) values.push(entity.lastError);
    if (entity.lastCheckedAt !== undefined) values.push(entity.lastCheckedAt);

    values.push(new Date()); // updated_at

    return values;
  }

  // RPC-specific methods
  async findByUserId(userId: string): Promise<RpcConfig[]> {
    const query = 'SELECT * FROM rpc_configs WHERE user_id = $1 ORDER BY priority ASC, created_at DESC';
    const result = await this.pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToModel(row));
  }

  async create(rpc: RpcConfig): Promise<RpcConfig> {
    const fields = this.getInsertFields();
    const values = this.getInsertValues(rpc);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.pool.query(query, values);
    
    return this.mapRowToModel(result.rows[0]);
  }

  async update(id: string, rpc: RpcConfig): Promise<RpcConfig> {
    const fields = this.getUpdateFields(rpc);
    const values = this.getUpdateValues(rpc);
    
    if (fields.length === 1) { // Only updated_at
      return this.findByIdOrFail(id);
    }

    const query = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await this.pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      throw new ResourceNotFoundException(`RPC config with id ${id} not found`);
    }
    
    return this.mapRowToModel(result.rows[0]);
  }

  async findByUserAndId(userId: string, rpcId: string): Promise<RpcConfig | null> {
    const query = 'SELECT * FROM rpc_configs WHERE user_id = $1 AND id = $2';
    const result = await this.pool.query(query, [userId, rpcId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToModel(result.rows[0]);
  }

  async findEnabledByUserId(userId: string): Promise<RpcConfig[]> {
    const query = 'SELECT * FROM rpc_configs WHERE user_id = $1 AND enabled = true ORDER BY priority ASC';
    const result = await this.pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToModel(row));
  }

  async updateHealth(id: string, isHealthy: boolean, responseTime?: number, error?: string): Promise<void> {
    const query = `
      UPDATE rpc_configs 
      SET 
        is_healthy = $1,
        response_time = $2,
        last_checked_at = $3,
        error_count = CASE WHEN $1 = false THEN error_count + 1 ELSE 0 END,
        last_error = CASE WHEN $1 = false THEN $4 ELSE NULL END,
        updated_at = $3
      WHERE id = $5
    `;
    
    await this.pool.query(query, [isHealthy, responseTime, new Date(), error, id]);
  }

  async findUnhealthy(): Promise<RpcConfig[]> {
    const query = 'SELECT * FROM rpc_configs WHERE enabled = true AND is_healthy = false';
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToModel(row));
  }
}
