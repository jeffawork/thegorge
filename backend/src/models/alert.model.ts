import { BaseModel } from './base.model';

export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ACKNOWLEDGED = 'acknowledged',
  SUPPRESSED = 'suppressed'
}

export enum AlertSeverity {
  MEDIUM = 'medium',
  // LOW, HIGH, CRITICAL removed - not currently used
}

export enum AlertType {
  RPC_DOWN = 'rpc_down',
  // HIGH_LATENCY, ERROR_RATE, QUOTA_EXCEEDED, SECURITY_THREAT removed - not currently used
}

export class Alert extends BaseModel {
  public userId: string;
  public rpcId?: string;
  public type: AlertType;
  public severity: AlertSeverity;
  public status: AlertStatus;
  public title: string;
  public message: string;
  public metadata?: Record<string, any>;
  public resolvedAt?: Date;
  public acknowledgedAt?: Date;
  public acknowledgedBy?: string;

  constructor(data: Partial<Alert> = {}) {
    super(data);
    this.userId = data.userId || '';
    this.rpcId = data.rpcId;
    this.type = data.type || AlertType.RPC_DOWN;
    this.severity = data.severity || AlertSeverity.MEDIUM;
    this.status = data.status || AlertStatus.ACTIVE;
    this.title = data.title || '';
    this.message = data.message || '';
    this.metadata = data.metadata;
    this.resolvedAt = data.resolvedAt;
    this.acknowledgedAt = data.acknowledgedAt;
    this.acknowledgedBy = data.acknowledgedBy;
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      rpcId: this.rpcId,
      type: this.type,
      severity: this.severity,
      status: this.status,
      title: this.title,
      message: this.message,
      metadata: this.metadata,
      resolvedAt: this.resolvedAt,
      acknowledgedAt: this.acknowledgedAt,
      acknowledgedBy: this.acknowledgedBy,
    };
  }

  // Helper methods
  resolve(_resolvedBy?: string): void {
    this.status = AlertStatus.RESOLVED;
    this.resolvedAt = new Date();
  }

  acknowledge(acknowledgedBy: string): void {
    this.status = AlertStatus.ACKNOWLEDGED;
    this.acknowledgedAt = new Date();
    this.acknowledgedBy = acknowledgedBy;
  }

  suppress(): void {
    this.status = AlertStatus.SUPPRESSED;
  }

  isActive(): boolean {
    return this.status === AlertStatus.ACTIVE;
  }

  isResolved(): boolean {
    return this.status === AlertStatus.RESOLVED;
  }
}
