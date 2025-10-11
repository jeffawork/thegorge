import {
  formatCurrency,
  getChangeColor,
  getChangeIcon,
  formatBalance,
} from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  Coins,
  ExternalLink,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

export const WalletPortfolio: React.FC = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockData: WalletData[] = [
        {
          id: '1',
          name: 'Main Trading Wallet',
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          chainId: 1,
          totalValueUSD: 125847.32,
          change24h: 5.2,
          tokens: [
            {
              symbol: 'ETH',
              name: 'Ethereum',
              balance: '12.5',
              balanceUSD: 25000,
              percentage: 19.9,
              priceUSD: 2000,
              change24h: 2.1,
            },
            {
              symbol: 'USDC',
              name: 'USD Coin',
              balance: '50000',
              balanceUSD: 50000,
              percentage: 39.7,
              priceUSD: 1,
              change24h: 0.1,
            },
            {
              symbol: 'WBTC',
              name: 'Wrapped Bitcoin',
              balance: '2.5',
              balanceUSD: 50847.32,
              percentage: 40.4,
              priceUSD: 20338.93,
              change24h: 8.3,
            },
          ],
          nfts: [
            {
              contractAddress: '0x...',
              tokenId: '1234',
              name: 'Cool NFT #1234',
              valueUSD: 500,
            },
          ],
          lastUpdated: new Date(),
        },
        {
          id: '2',
          name: 'DeFi Wallet',
          address: '0x8ba1f109551bD432803012645Hac136c',
          chainId: 1,
          totalValueUSD: 45632.18,
          change24h: -2.1,
          tokens: [
            {
              symbol: 'ETH',
              name: 'Ethereum',
              balance: '8.2',
              balanceUSD: 16400,
              percentage: 35.9,
              priceUSD: 2000,
              change24h: 2.1,
            },
            {
              symbol: 'UNI',
              name: 'Uniswap',
              balance: '1000',
              balanceUSD: 12000,
              percentage: 26.3,
              priceUSD: 12,
              change24h: -5.2,
            },
            {
              symbol: 'AAVE',
              name: 'Aave Token',
              balance: '500',
              balanceUSD: 17232.18,
              percentage: 37.8,
              priceUSD: 34.46,
              change24h: 1.8,
            },
          ],
          nfts: [],
          lastUpdated: new Date(),
        },
      ];
      setWallets(mockData);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPortfolioValue = wallets.reduce(
    (sum, wallet) => sum + wallet.totalValueUSD,
    0
  );
  const totalChange24h =
    wallets.length > 0
      ? wallets.reduce((sum, wallet) => sum + wallet.change24h, 0) /
        wallets.length
      : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading wallet data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="rounded-lg bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Portfolio Overview
          </h3>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            {showBalances ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-white">
            {showBalances ? formatCurrency(totalPortfolioValue) : '••••••'}
          </div>
          <div
            className={`flex items-center justify-center space-x-2 ${getChangeColor(totalChange24h)}`}
          >
            {React.createElement(getChangeIcon(totalChange24h), {
              className: 'w-4 h-4',
            })}
            <span className="text-sm font-semibold">
              {totalChange24h >= 0 ? '+' : ''}
              {totalChange24h.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-400">24h</span>
          </div>
        </div>
      </div>

      {/* Wallet List */}
      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border border-white/10 p-4 ${
              selectedWallet === wallet.id
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'bg-black/10'
            }`}
            onClick={() =>
              setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-5 w-5 text-blue-400" />
                <div>
                  <h4 className="font-semibold text-white">{wallet.name}</h4>
                  <p className="font-mono text-xs text-gray-400">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {showBalances
                    ? formatCurrency(wallet.totalValueUSD)
                    : '••••••'}
                </div>
                <div
                  className={`flex items-center justify-end space-x-1 ${getChangeColor(wallet.change24h)}`}
                >
                  {React.createElement(getChangeIcon(wallet.change24h), {
                    className: 'w-3 h-3',
                  })}
                  <span className="text-xs font-semibold">
                    {wallet.change24h >= 0 ? '+' : ''}
                    {wallet.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Token Breakdown */}
            {selectedWallet === wallet.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 border-t border-white/10 pt-4"
              >
                <h5 className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                  <Coins className="h-4 w-4" />
                  <span>Token Holdings</span>
                </h5>

                {wallet.tokens.map((token, tokenIndex) => (
                  <div
                    key={tokenIndex}
                    className="flex items-center justify-between rounded-lg bg-black/20 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                        <span className="text-xs font-bold text-white">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-gray-400">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {showBalances ? formatBalance(token.balance) : '••••'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {showBalances
                          ? formatCurrency(token.balanceUSD)
                          : '••••••'}
                      </div>
                      <div
                        className={`text-xs ${getChangeColor(token.change24h)}`}
                      >
                        {token.change24h >= 0 ? '+' : ''}
                        {token.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <div className="w-16">
                      <div className="mb-1 text-xs text-gray-400">
                        {token.percentage.toFixed(1)}%
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-700">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${token.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* NFTs */}
                {wallet.nfts.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2 text-sm font-semibold text-gray-300">
                      NFTs
                    </h6>
                    <div className="grid grid-cols-2 gap-2">
                      {wallet.nfts.map((nft, nftIndex) => (
                        <div
                          key={nftIndex}
                          className="rounded-lg bg-black/20 p-2"
                        >
                          <div className="text-xs font-semibold text-white">
                            {nft.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {showBalances && nft.valueUSD
                              ? formatCurrency(nft.valueUSD)
                              : '••••'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-400 transition-colors hover:bg-blue-500/30">
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">View on Explorer</span>
        </button>
        <button className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400 transition-colors hover:bg-green-500/30">
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
    </div>
  );
};
