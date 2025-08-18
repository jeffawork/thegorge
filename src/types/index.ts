export interface RPCConfig {
  name: string;
  url: string;
  chainId: number;
  network: string;
  timeout?: number;
  enabled?: boolean;
  priority?: number;
  maxHistoryEntries?: number;
  alertThresholds?: {
    responseTime: number;
    errorRate: number;
    peerCount: number;
    blockLag: number;
  };
}

export interface RPCStatus {
  id: string;
  name: string;
  url: string;
  chainId: number;
  network: string;
  isOnline: boolean;
  responseTime: number;
  blockNumber: number | null;
  gasPrice: string | null;
  peerCount: number | null;
  lastChecked: Date;
  errorCount: number;
  uptime: number;
  errorMessage?: string;
  syncStatus?: SyncStatus;
}

export interface SyncStatus {
  isSyncing: boolean;
  currentBlock: number;
  highestBlock: number;
  syncProgress?: number;
}

export interface HealthMetrics {
  timestamp: Date;
  rpcId: string;
  responseTime: number;
  isOnline: boolean;
  blockNumber: number | null;
  gasPrice: string | null;
  peerCount: number | null;
  errorMessage?: string;
  syncStatus?: SyncStatus;
}

export interface SystemMetrics {
  totalRPCs: number;
  onlineRPCs: number;
  offlineRPCs: number;
  averageResponseTime: number;
  alertsCount: number;
  lastUpdate: Date;
  networkDistribution: NetworkDistribution[];
}

export interface NetworkDistribution {
  network: string;
  total: number;
  online: number;
  offline: number;
}

export interface Alert {
  id: string;
  rpcId: string;
  rpcName: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  network?: string;
  chainId?: number;
}

export type AlertType = 
  | 'offline' 
  | 'slow_response' 
  | 'high_error_rate' 
  | 'chain_sync_issue' 
  | 'peer_count_low'
  | 'block_lag';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DashboardData {
  rpcs: RPCStatus[];
  metrics: SystemMetrics;
  alerts: Alert[];
  timestamp: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: Date;
}

export interface PerformanceStats {
  rpcId: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  totalRequests: number;
  timeframe: string;
}

export interface ChainInfo {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Event types for real-time updates
export interface SocketEvents {
  // Client to server events
  requestRPCHistory: (data: { rpcId: string; limit?: number }) => void;
  requestPerformanceStats: (data: { rpcId?: string }) => void;
  resolveAlert: (data: { alertId: string; resolvedBy?: string }) => void;
  
  // Server to client events
  initialData: (data: { rpcs: RPCStatus[]; metrics: SystemMetrics; alerts: Alert[]; timestamp: Date }) => void;
  rpcStatusUpdate: (status: RPCStatus) => void;
  systemMetricsUpdate: (metrics: SystemMetrics) => void;
  newAlert: (alert: Alert) => void;
  alertResolved: (alert: Alert) => void;
  rpcHistory: (data: { rpcId: string; history: HealthMetrics[] }) => void;
  performanceStats: (stats: PerformanceStats[]) => void;
  monitoringStatusChanged: (data: { status: string; timestamp: Date }) => void;
  performanceUpdate: (stats: PerformanceStats[]) => void;
}
