import { walletLogger } from '../utils/logger';

export interface Wallet {
  id: string;
  orgId: string;
  address: string;
  chainId: number;
  name: string;
  type: 'eoa' | 'contract' | 'multisig';
  isActive: boolean;
  tags: string[];
  metadata: {
    createdBy?: string;
    description?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    category?: 'trading' | 'staking' | 'defi' | 'nft' | 'treasury' | 'personal';
  };
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

export interface WalletBalance {
  walletId: string;
  orgId: string;
  address: string;
  chainId: number;
  tokenAddress?: string; // undefined for native token
  symbol: string;
  name: string;
  decimals: number;
  balance: string; // BigInt as string
  balanceUSD: number;
  priceUSD: number;
  timestamp: Date;
  metadata?: {
    contractAddress?: string;
    tokenType?: 'native' | 'erc20' | 'erc721' | 'erc1155';
    totalSupply?: string;
    marketCap?: number;
  };
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  orgId: string;
  address: string;
  chainId: number;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string; // BigInt as string
  gasUsed: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  type: 'send' | 'receive' | 'contract_interaction' | 'token_transfer' | 'defi' | 'nft';
  method?: string; // Contract method called
  tokens: Array<{
    tokenAddress: string;
    symbol: string;
    amount: string;
    type: 'transfer' | 'approval' | 'mint' | 'burn';
  }>;
  fees: {
    gasFee: string;
    gasFeeUSD: number;
    totalFeeUSD: number;
  };
  metadata?: Record<string, any>;
}

export interface WalletActivity {
  walletId: string;
  orgId: string;
  address: string;
  chainId: number;
  timestamp: Date;
  activityType: 'transaction' | 'balance_change' | 'token_transfer' | 'defi_interaction' | 'nft_activity';
  description: string;
  value?: number;
  valueUSD?: number;
  tokenSymbol?: string;
  transactionHash?: string;
  metadata?: Record<string, any>;
}

export interface WalletAlert {
  id: string;
  walletId: string;
  orgId: string;
  type: 'large_transaction' | 'unusual_activity' | 'balance_drop' | 'new_token' | 'defi_risk' | 'nft_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  value?: number;
  valueUSD?: number;
  threshold?: number;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface WalletPortfolio {
  walletId: string;
  orgId: string;
  address: string;
  chainId: number;
  totalValueUSD: number;
  tokens: Array<{
    symbol: string;
    name: string;
    balance: string;
    balanceUSD: number;
    percentage: number;
    priceUSD: number;
    change24h: number;
  }>;
  nfts: Array<{
    contractAddress: string;
    tokenId: string;
    name: string;
    imageUrl?: string;
    valueUSD?: number;
  }>;
  defiPositions: Array<{
    protocol: string;
    position: string;
    valueUSD: number;
    apy?: number;
  }>;
  lastUpdated: Date;
}

export class WalletMonitoringService {
  private wallets: Map<string, Wallet> = new Map();
  private walletBalances: Map<string, WalletBalance[]> = new Map();
  private walletTransactions: Map<string, WalletTransaction[]> = new Map();
  private walletActivities: Map<string, WalletActivity[]> = new Map();
  private walletAlerts: Map<string, WalletAlert[]> = new Map();
  private walletPortfolios: Map<string, WalletPortfolio> = new Map();

  constructor() {
    this.startWalletMonitoring();
    walletLogger.info('WalletMonitoringService initialized');
  }

  private startWalletMonitoring(): void {
    // Monitor wallet balances every 5 minutes
    setInterval(() => {
      this.monitorAllWallets();
    }, 5 * 60 * 1000);

    // Update portfolios every 15 minutes
    setInterval(() => {
      this.updateAllPortfolios();
    }, 15 * 60 * 1000);
  }

  // Add wallet for monitoring
  async addWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newWallet: Wallet = {
      ...wallet,
      id: this.generateWalletId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.wallets.set(newWallet.id, newWallet);
    walletLogger.info('Wallet added for monitoring', {
      walletId: newWallet.id,
      orgId: newWallet.orgId,
      address: newWallet.address,
      chainId: newWallet.chainId,
    });

    return newWallet.id;
  }

  // Remove wallet from monitoring
  async removeWallet(walletId: string): Promise<boolean> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return false;

    this.wallets.delete(walletId);
    this.walletBalances.delete(walletId);
    this.walletTransactions.delete(walletId);
    this.walletActivities.delete(walletId);
    this.walletAlerts.delete(walletId);
    this.walletPortfolios.delete(walletId);

    walletLogger.info('Wallet removed from monitoring', { walletId });
    return true;
  }

  // Monitor all wallets
  private async monitorAllWallets(): Promise<void> {
    for (const [walletId, wallet] of this.wallets.entries()) {
      if (!wallet.isActive) continue;

      try {
        await this.monitorWallet(wallet);
      } catch (error) {
        walletLogger.error('Failed to monitor wallet', {
          walletId,
          address: wallet.address,
          error: (error as Error).message,
        });
      }
    }
  }

  // Monitor specific wallet
  private async monitorWallet(wallet: Wallet): Promise<void> {
    // Update balances
    await this.updateWalletBalances(wallet);

    // Check for new transactions
    await this.updateWalletTransactions(wallet);

    // Update activities
    await this.updateWalletActivities(wallet);

    // Check for alerts
    await this.checkWalletAlerts(wallet);

    // Update last activity time
    wallet.lastActivityAt = new Date();
    this.wallets.set(wallet.id, wallet);
  }

  // Update wallet balances
  private async updateWalletBalances(wallet: Wallet): Promise<void> {
    // Simulate balance checking - in real implementation, you'd query the blockchain
    const balances = await this.fetchWalletBalances(wallet);

    const existing = this.walletBalances.get(wallet.id) || [];
    existing.push(...balances);

    // Keep only last 1000 balance records per wallet
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.walletBalances.set(wallet.id, existing);
  }

  // Fetch wallet balances (simulated)
  private async fetchWalletBalances(wallet: Wallet): Promise<WalletBalance[]> {
    const balances: WalletBalance[] = [];
    const now = new Date();

    // Native token balance
    const nativeBalance = Math.random() * 100; // 0-100 ETH
    balances.push({
      walletId: wallet.id,
      orgId: wallet.orgId,
      address: wallet.address,
      chainId: wallet.chainId,
      symbol: this.getNativeTokenSymbol(wallet.chainId),
      name: this.getNativeTokenName(wallet.chainId),
      decimals: 18,
      balance: (nativeBalance * 1e18).toString(),
      balanceUSD: nativeBalance * 2000, // Assume $2000 per ETH
      priceUSD: 2000,
      timestamp: now,
      metadata: {
        tokenType: 'native',
      },
    });

    // ERC-20 token balances (simulated)
    const tokenCount = Math.floor(Math.random() * 10) + 1; // 1-10 tokens
    for (let i = 0; i < tokenCount; i++) {
      const tokenBalance = Math.random() * 1000;
      const tokenPrice = Math.random() * 100 + 1; // $1-$100

      balances.push({
        walletId: wallet.id,
        orgId: wallet.orgId,
        address: wallet.address,
        chainId: wallet.chainId,
        tokenAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        symbol: `TOKEN${i + 1}`,
        name: `Token ${i + 1}`,
        decimals: 18,
        balance: (tokenBalance * 1e18).toString(),
        balanceUSD: tokenBalance * tokenPrice,
        priceUSD: tokenPrice,
        timestamp: now,
        metadata: {
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          tokenType: 'erc20',
        },
      });
    }

    return balances;
  }

  // Get native token symbol for chain
  private getNativeTokenSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      137: 'MATIC',
      56: 'BNB',
      42161: 'ETH',
      10: 'ETH',
    };
    return symbols[chainId] || 'ETH';
  }

  // Get native token name for chain
  private getNativeTokenName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'Binance Coin',
      42161: 'Ethereum',
      10: 'Ethereum',
    };
    return names[chainId] || 'Ethereum';
  }

  // Update wallet transactions
  private async updateWalletTransactions(wallet: Wallet): Promise<void> {
    // Simulate transaction checking - in real implementation, you'd query the blockchain
    const transactions = await this.fetchWalletTransactions(wallet);

    const existing = this.walletTransactions.get(wallet.id) || [];
    existing.push(...transactions);

    // Keep only last 1000 transaction records per wallet
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.walletTransactions.set(wallet.id, existing);
  }

  // Fetch wallet transactions (simulated)
  private async fetchWalletTransactions(wallet: Wallet): Promise<WalletTransaction[]> {
    const transactions: WalletTransaction[] = [];
    const now = new Date();

    // Simulate occasional transactions
    if (Math.random() < 0.1) { // 10% chance of new transaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const value = Math.random() * 10; // 0-10 ETH
      const gasUsed = Math.floor(Math.random() * 100000) + 21000;
      const gasPrice = Math.floor(Math.random() * 100) + 20; // 20-120 gwei

      transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletId: wallet.id,
        orgId: wallet.orgId,
        address: wallet.address,
        chainId: wallet.chainId,
        txHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        transactionIndex: Math.floor(Math.random() * 100),
        from: wallet.address,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (value * 1e18).toString(),
        gasUsed: gasUsed.toString(),
        gasPrice: (gasPrice * 1e9).toString(),
        gasLimit: (gasUsed * 1.2).toString(),
        nonce: Math.floor(Math.random() * 1000),
        status: 'confirmed',
        timestamp: new Date(now.getTime() - Math.random() * 3600000), // Within last hour
        type: Math.random() > 0.5 ? 'send' : 'receive',
        fees: {
          gasFee: (gasUsed * gasPrice * 1e9).toString(),
          gasFeeUSD: (gasUsed * gasPrice * 1e9) / 1e18 * 2000, // Assume $2000 per ETH
          totalFeeUSD: (gasUsed * gasPrice * 1e9) / 1e18 * 2000,
        },
        tokens: [], // Empty array for now
      });
    }

    return transactions;
  }

  // Update wallet activities
  private async updateWalletActivities(wallet: Wallet): Promise<void> {
    const activities = await this.generateWalletActivities(wallet);

    const existing = this.walletActivities.get(wallet.id) || [];
    existing.push(...activities);

    // Keep only last 1000 activity records per wallet
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.walletActivities.set(wallet.id, existing);
  }

  // Generate wallet activities (simulated)
  private async generateWalletActivities(wallet: Wallet): Promise<WalletActivity[]> {
    const activities: WalletActivity[] = [];
    const now = new Date();

    // Simulate occasional activities
    if (Math.random() < 0.05) { // 5% chance of new activity
      const activityTypes: WalletActivity['activityType'][] = [
        'transaction', 'balance_change', 'token_transfer', 'defi_interaction', 'nft_activity',
      ];

      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const value = Math.random() * 1000;
      const valueUSD = value * 2000; // Assume $2000 per ETH

      activities.push({
        walletId: wallet.id,
        orgId: wallet.orgId,
        address: wallet.address,
        chainId: wallet.chainId,
        timestamp: new Date(now.getTime() - Math.random() * 3600000), // Within last hour
        activityType,
        description: this.generateActivityDescription(activityType, value),
        value,
        valueUSD,
        tokenSymbol: this.getNativeTokenSymbol(wallet.chainId),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      });
    }

    return activities;
  }

  // Generate activity description
  private generateActivityDescription(activityType: string, value: number): string {
    const descriptions: Record<string, string> = {
      transaction: `Transaction of ${value.toFixed(4)} ETH`,
      balance_change: `Balance changed by ${value.toFixed(4)} ETH`,
      token_transfer: `Token transfer of ${value.toFixed(4)} tokens`,
      defi_interaction: `DeFi interaction with ${value.toFixed(4)} ETH`,
      nft_activity: `NFT activity involving ${value.toFixed(4)} ETH`,
    };
    return descriptions[activityType] || 'Wallet activity detected';
  }

  // Check wallet alerts
  private async checkWalletAlerts(wallet: Wallet): Promise<void> {
    const balances = this.walletBalances.get(wallet.id) || [];
    const transactions = this.walletTransactions.get(wallet.id) || [];
    const activities = this.walletActivities.get(wallet.id) || [];

    // Check for large transactions
    const recentTransactions = transactions.filter(tx =>
      tx.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    );

    for (const tx of recentTransactions) {
      const valueUSD = parseFloat(tx.value) / 1e18 * 2000; // Convert to USD
      if (valueUSD > 10000) { // $10,000 threshold
        await this.createWalletAlert(wallet, {
          type: 'large_transaction',
          severity: 'high',
          title: 'Large Transaction Detected',
          message: `Large transaction of $${valueUSD.toFixed(2)} detected`,
          value: valueUSD,
          threshold: 10000,
          metadata: { transactionHash: tx.txHash },
        });
      }
    }

    // Check for balance drops
    if (balances.length >= 2) {
      const latest = balances[balances.length - 1];
      const previous = balances[balances.length - 2];
      const balanceChange = latest.balanceUSD - previous.balanceUSD;

      if (balanceChange < -1000) { // $1,000 drop threshold
        await this.createWalletAlert(wallet, {
          type: 'balance_drop',
          severity: 'medium',
          title: 'Significant Balance Drop',
          message: `Balance dropped by $${Math.abs(balanceChange).toFixed(2)}`,
          value: Math.abs(balanceChange),
          threshold: 1000,
        });
      }
    }

    // Check for unusual activity
    const recentActivities = activities.filter(activity =>
      activity.timestamp > new Date(Date.now() - 60 * 60 * 1000), // Last hour
    );

    if (recentActivities.length > 10) { // More than 10 activities in an hour
      await this.createWalletAlert(wallet, {
        type: 'unusual_activity',
        severity: 'medium',
        title: 'Unusual Activity Detected',
        message: `${recentActivities.length} activities in the last hour`,
        value: recentActivities.length,
        threshold: 10,
      });
    }
  }

  // Create wallet alert
  private async createWalletAlert(wallet: Wallet, alertData: {
    type: WalletAlert['type'];
    severity: WalletAlert['severity'];
    title: string;
    message: string;
    value?: number;
    threshold?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const alert: WalletAlert = {
      id: `wallet_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletId: wallet.id,
      orgId: wallet.orgId,
      type: alertData.type,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      value: alertData.value,
      valueUSD: alertData.value,
      threshold: alertData.threshold,
      timestamp: new Date(),
      isAcknowledged: false,
      metadata: alertData.metadata,
    };

    const key = `${wallet.orgId}:${wallet.id}`;
    const existing = this.walletAlerts.get(key) || [];
    existing.push(alert);
    this.walletAlerts.set(key, existing);

    walletLogger.warn('Wallet alert created', {
      alertId: alert.id,
      walletId: wallet.id,
      type: alert.type,
      severity: alert.severity,
    });
  }

  // Update all portfolios
  private async updateAllPortfolios(): Promise<void> {
    for (const [walletId, wallet] of this.wallets.entries()) {
      if (!wallet.isActive) continue;

      try {
        await this.updateWalletPortfolio(wallet);
      } catch (error) {
        walletLogger.error('Failed to update wallet portfolio', {
          walletId,
          error: (error as Error).message,
        });
      }
    }
  }

  // Update wallet portfolio
  private async updateWalletPortfolio(wallet: Wallet): Promise<void> {
    const balances = this.walletBalances.get(wallet.id) || [];
    const latestBalances = balances.filter(b =>
      b.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    );

    if (latestBalances.length === 0) return;

    const totalValueUSD = latestBalances.reduce((sum, b) => sum + b.balanceUSD, 0);

    const tokens = latestBalances.map(balance => ({
      symbol: balance.symbol,
      name: balance.name,
      balance: (parseFloat(balance.balance) / Math.pow(10, balance.decimals)).toString(),
      balanceUSD: balance.balanceUSD,
      percentage: totalValueUSD > 0 ? (balance.balanceUSD / totalValueUSD) * 100 : 0,
      priceUSD: balance.priceUSD,
      change24h: Math.random() * 20 - 10, // -10% to +10% change
    }));

    const portfolio: WalletPortfolio = {
      walletId: wallet.id,
      orgId: wallet.orgId,
      address: wallet.address,
      chainId: wallet.chainId,
      totalValueUSD,
      tokens,
      nfts: [], // Would be populated from NFT data
      defiPositions: [], // Would be populated from DeFi data
      lastUpdated: new Date(),
    };

    this.walletPortfolios.set(wallet.id, portfolio);
  }

  // Get wallet
  getWallet(walletId: string): Wallet | null {
    return this.wallets.get(walletId) || null;
  }

  // Get wallets for organization
  getWalletsForOrganization(orgId: string): Wallet[] {
    return Array.from(this.wallets.values()).filter(w => w.orgId === orgId);
  }

  // Get wallet balances
  getWalletBalances(walletId: string, limit: number = 100): WalletBalance[] {
    const balances = this.walletBalances.get(walletId) || [];
    return balances.slice(-limit);
  }

  // Get wallet transactions
  getWalletTransactions(walletId: string, limit: number = 100): WalletTransaction[] {
    const transactions = this.walletTransactions.get(walletId) || [];
    return transactions.slice(-limit);
  }

  // Get wallet activities
  getWalletActivities(walletId: string, limit: number = 100): WalletActivity[] {
    const activities = this.walletActivities.get(walletId) || [];
    return activities.slice(-limit);
  }

  // Get wallet alerts
  getWalletAlerts(orgId: string, walletId?: string, limit: number = 100): WalletAlert[] {
    const allAlerts: WalletAlert[] = [];

    for (const [key, alerts] of this.walletAlerts.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        if (!walletId || key.includes(`:${walletId}`)) {
          allAlerts.push(...alerts);
        }
      }
    }

    return allAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get wallet portfolio
  getWalletPortfolio(walletId: string): WalletPortfolio | null {
    return this.walletPortfolios.get(walletId) || null;
  }

  // Acknowledge wallet alert
  async acknowledgeWalletAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    for (const [key, alerts] of this.walletAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        walletLogger.info('Wallet alert acknowledged', { alertId, acknowledgedBy });
        return true;
      }
    }
    return false;
  }

  // Get service statistics
  getServiceStats(): {
    totalWallets: number;
    activeWallets: number;
    totalBalances: number;
    totalTransactions: number;
    totalActivities: number;
    totalAlerts: number;
    totalPortfolios: number;
    } {
    let totalBalances = 0;
    for (const balances of this.walletBalances.values()) {
      totalBalances += balances.length;
    }

    let totalTransactions = 0;
    for (const transactions of this.walletTransactions.values()) {
      totalTransactions += transactions.length;
    }

    let totalActivities = 0;
    for (const activities of this.walletActivities.values()) {
      totalActivities += activities.length;
    }

    let totalAlerts = 0;
    for (const alerts of this.walletAlerts.values()) {
      totalAlerts += alerts.length;
    }

    return {
      totalWallets: this.wallets.size,
      activeWallets: Array.from(this.wallets.values()).filter(w => w.isActive).length,
      totalBalances,
      totalTransactions,
      totalActivities,
      totalAlerts,
      totalPortfolios: this.walletPortfolios.size,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    let cleaned = 0;

    for (const [key, balances] of this.walletBalances.entries()) {
      const filtered = balances.filter(b => b.timestamp > cutoffDate);
      if (filtered.length !== balances.length) {
        this.walletBalances.set(key, filtered);
        cleaned += balances.length - filtered.length;
      }
    }

    for (const [key, transactions] of this.walletTransactions.entries()) {
      const filtered = transactions.filter(tx => tx.timestamp > cutoffDate);
      if (filtered.length !== transactions.length) {
        this.walletTransactions.set(key, filtered);
        cleaned += transactions.length - filtered.length;
      }
    }

    for (const [key, activities] of this.walletActivities.entries()) {
      const filtered = activities.filter(a => a.timestamp > cutoffDate);
      if (filtered.length !== activities.length) {
        this.walletActivities.set(key, filtered);
        cleaned += activities.length - filtered.length;
      }
    }

    for (const [key, alerts] of this.walletAlerts.entries()) {
      const filtered = alerts.filter(a => a.timestamp > cutoffDate);
      if (filtered.length !== alerts.length) {
        this.walletAlerts.set(key, filtered);
        cleaned += alerts.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      walletLogger.info('Wallet monitoring cleanup completed', { cleaned });
    }
  }

  private generateWalletId(): string {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
