import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import { UserNotFoundException, ConflictException } from '../exceptions';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  protected mapRowToModel(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name || row.firstName,
      lastName: row.last_name || row.lastName,
      name: row.name,
      role: row.role,
      avatar: row.avatar_url || row.avatar,
      organizationId: row.organization_id,
      lastLoginAt: row.last_login_at,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  protected getInsertFields(): string[] {
    return ['id', 'email', 'password_hash', 'first_name', 'last_name', 'name', 'role', 'avatar_url', 'organization_id', 'is_active', 'created_at', 'updated_at'];
  }

  protected getInsertValues(entity: User): any[] {
    return [
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.firstName,
      entity.lastName,
      entity.name,
      entity.role,
      entity.avatar,
      entity.organizationId,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    ];
  }

  protected getUpdateFields(entity: User): string[] {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (entity.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(entity.email);
    }
    if (entity.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramIndex++}`);
      values.push(entity.passwordHash);
    }
    if (entity.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(entity.firstName);
    }
    if (entity.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(entity.lastName);
    }
    if (entity.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(entity.name);
    }
    if (entity.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(entity.role);
    }
    if (entity.avatar !== undefined) {
      fields.push(`avatar = $${paramIndex++}`);
      values.push(entity.avatar);
    }
    if (entity.organizationId !== undefined) {
      fields.push(`organization_id = $${paramIndex++}`);
      values.push(entity.organizationId);
    }
    if (entity.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(entity.isActive);
    }
    if (entity.lastLoginAt !== undefined) {
      fields.push(`last_login_at = $${paramIndex++}`);
      values.push(entity.lastLoginAt);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    return fields;
  }

  protected getUpdateValues(entity: User): any[] {
    const values = [];

    if (entity.email !== undefined) values.push(entity.email);
    if (entity.passwordHash !== undefined) values.push(entity.passwordHash);
    if (entity.firstName !== undefined) values.push(entity.firstName);
    if (entity.lastName !== undefined) values.push(entity.lastName);
    if (entity.name !== undefined) values.push(entity.name);
    if (entity.role !== undefined) values.push(entity.role);
    if (entity.avatar !== undefined) values.push(entity.avatar);
    if (entity.organizationId !== undefined) values.push(entity.organizationId);
    if (entity.isActive !== undefined) values.push(entity.isActive);
    if (entity.lastLoginAt !== undefined) values.push(entity.lastLoginAt);

    values.push(new Date()); // updated_at

    return values;
  }

  // User-specific methods
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToModel(result.rows[0]);
  }

  async findByEmailOrFail(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async create(user: User): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const fields = this.getInsertFields();
    const values = this.getInsertValues(user);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.pool.query(query, values);
    console.log(result)
    return this.mapRowToModel(result.rows[0]);
  }

  async update(id: string, user: User): Promise<User> {
    const fields = this.getUpdateFields(user);
    const values = this.getUpdateValues(user);

    if (fields.length === 1) { // Only updated_at
      return this.findByIdOrFail(id);
    }

    const query = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await this.pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      throw new UserNotFoundException(`User with id ${id} not found`);
    }

    return this.mapRowToModel(result.rows[0]);
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE organization_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [organizationId]);
    return result.rows.map(row => this.mapRowToModel(row));
  }

  async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = $1, updated_at = $1 WHERE id = $2';
    await this.pool.query(query, [new Date(), id]);
  }
}
