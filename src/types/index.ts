export interface RPCConfig {
  id: string;
  name: string;
  url: string;
  network: string;
  chainId: number;
  timeout: number;
  enabled: boolean;
  priority: number;
  userId?: string; // For user-based management
  createdAt: Date;
  updatedAt: Date;
  maxHistoryEntries?: number;
  alertThresholds?: {
    responseTime: number;
    errorRate: number;
    peerCount: number;
    blockLag: number;
    syncLag: number;
  };
}

export interface RPCStatus {
  id: string;
  rpcId: string;
  isOnline: boolean;
  lastCheck: Date;
  responseTime: number;
  blockNumber: number;
  latestBlockNumber?: number; // For comparison with other RPCs
  peerCount: number;
  gasPrice: string;
  isSyncing: boolean;
  syncProgress?: number;
  syncCurrentBlock?: number;
  syncHighestBlock?: number;
  syncStartingBlock?: number;
  errorMessage?: string;
  network: string;
  chainId: number;
  history: RPCHealthMetrics[];
}

export interface RPCHealthMetrics {
  timestamp: Date;
  responseTime: number;
  blockNumber: number;
  peerCount: number;
  gasPrice: string;
  isSyncing: boolean;
  syncProgress?: number;
  errorMessage?: string;
  isOnline: boolean;
}

export interface Alert {
  id: string;
  rpcId: string;
  type: 'response_time' | 'error_rate' | 'peer_count' | 'block_lag' | 'sync_lag' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  network: string;
  chainId: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  rpcConfigs: RPCConfig[];
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  type: 'mainnet' | 'testnet' | 'devnet';
  currency: string;
  explorer: string;
  rpcUrls: string[];
}

export interface HealthCheckResult {
  isOnline: boolean;
  responseTime: number;
  blockNumber: number;
  peerCount: number;
  gasPrice: string;
  isSyncing: boolean;
  syncProgress?: number;
  syncCurrentBlock?: number;
  syncHighestBlock?: number;
  syncStartingBlock?: number;
  errorMessage?: string;
  network: string;
  chainId: number;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface SocketEvents {
  // Client to Server
  'requestRPCHistory': (rpcId: string) => void;
  'requestPerformanceStats': (rpcId: string) => void;
  'resolveAlert': (alertId: string, resolvedBy: string) => void;
  'addRPC': (rpcConfig: Omit<RPCConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  'updateRPC': (rpcId: string, updates: Partial<RPCConfig>) => void;
  'deleteRPC': (rpcId: string) => void;
  
  // Server to Client
  'initialData': (data: { rpcs: RPCStatus[], alerts: Alert[] }) => void;
  'rpcStatusUpdate': (rpcId: string, status: RPCStatus) => void;
  'systemMetricsUpdate': (metrics: any) => void;
  'newAlert': (alert: Alert) => void;
  'alertResolved': (alert: Alert) => void;
  'rpcHistory': (rpcId: string, history: RPCHealthMetrics[]) => void;
  'performanceStats': (rpcId: string, stats: any) => void;
  'monitoringStatusChanged': (isActive: boolean) => void;
  'performanceUpdate': (rpcId: string, metrics: RPCHealthMetrics) => void;
  'rpcAdded': (rpc: RPCConfig) => void;
  'rpcUpdated': (rpc: RPCConfig) => void;
  'rpcDeleted': (rpcId: string) => void;
}

// Common EVM networks
export const EVM_NETWORKS: NetworkInfo[] = [
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    type: 'mainnet',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/', 'https://mainnet.infura.io/v3/']
  },
  {
    name: 'Polygon',
    chainId: 137,
    type: 'mainnet',
    currency: 'MATIC',
    explorer: 'https://polygonscan.com',
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.matic.network']
  },
  {
    name: 'BSC',
    chainId: 56,
    type: 'mainnet',
    currency: 'BNB',
    explorer: 'https://bscscan.com',
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io']
  },
  {
    name: 'Arbitrum One',
    chainId: 42161,
    type: 'mainnet',
    currency: 'ETH',
    explorer: 'https://arbiscan.io',
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-one.publicnode.com']
  },
  {
    name: 'Optimism',
    chainId: 10,
    type: 'mainnet',
    currency: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.publicnode.com']
  },
  {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    type: 'mainnet',
    currency: 'AVAX',
    explorer: 'https://snowtrace.io',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche']
  },
  {
    name: 'Fantom',
    chainId: 250,
    type: 'mainnet',
    currency: 'FTM',
    explorer: 'https://ftmscan.com',
    rpcUrls: ['https://rpc.ftm.tools', 'https://rpc.fantom.network']
  },
  {
    name: 'Ethereum Goerli',
    chainId: 5,
    type: 'testnet',
    currency: 'ETH',
    explorer: 'https://goerli.etherscan.io',
    rpcUrls: ['https://goerli.infura.io/v3/', 'https://rpc.goerli.mudit.blog']
  },
  {
    name: 'Polygon Mumbai',
    chainId: 80001,
    type: 'testnet',
    currency: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com',
    rpcUrls: ['https://rpc-mumbai.maticvigil.com', 'https://polygon-mumbai.infura.io/v3/']
  }
];
