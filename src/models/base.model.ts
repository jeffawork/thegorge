export abstract class BaseModel {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<BaseModel> = {}) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
