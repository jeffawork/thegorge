import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Coins,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

interface WalletData {
  id: string
  name: string
  address: string
  chainId: number
  totalValueUSD: number
  change24h: number
  tokens: Array<{
    symbol: string
    name: string
    balance: string
    balanceUSD: number
    percentage: number
    priceUSD: number
    change24h: number
    logoUrl?: string
  }>
  nfts: Array<{
    contractAddress: string
    tokenId: string
    name: string
    imageUrl?: string
    valueUSD?: number
  }>
  lastUpdated: Date
}

export const WalletPortfolio: React.FC = () => {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalances, setShowBalances] = useState(true)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  useEffect(() => {
    fetchWalletData()
    const interval = setInterval(fetchWalletData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
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
              change24h: 2.1
            },
            {
              symbol: 'USDC',
              name: 'USD Coin',
              balance: '50000',
              balanceUSD: 50000,
              percentage: 39.7,
              priceUSD: 1,
              change24h: 0.1
            },
            {
              symbol: 'WBTC',
              name: 'Wrapped Bitcoin',
              balance: '2.5',
              balanceUSD: 50847.32,
              percentage: 40.4,
              priceUSD: 20338.93,
              change24h: 8.3
            }
          ],
          nfts: [
            {
              contractAddress: '0x...',
              tokenId: '1234',
              name: 'Cool NFT #1234',
              valueUSD: 500
            }
          ],
          lastUpdated: new Date()
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
              change24h: 2.1
            },
            {
              symbol: 'UNI',
              name: 'Uniswap',
              balance: '1000',
              balanceUSD: 12000,
              percentage: 26.3,
              priceUSD: 12,
              change24h: -5.2
            },
            {
              symbol: 'AAVE',
              name: 'Aave Token',
              balance: '500',
              balanceUSD: 17232.18,
              percentage: 37.8,
              priceUSD: 34.46,
              change24h: 1.8
            }
          ],
          nfts: [],
          lastUpdated: new Date()
        }
      ]
      setWallets(mockData)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseFloat(balance)
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(decimals)
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.totalValueUSD, 0)
  const totalChange24h = wallets.length > 0 
    ? wallets.reduce((sum, wallet) => sum + wallet.change24h, 0) / wallets.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading wallet data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Overview</h3>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {showBalances ? formatCurrency(totalPortfolioValue) : '••••••'}
          </div>
          <div className={`flex items-center justify-center space-x-2 ${getChangeColor(totalChange24h)}`}>
            {React.createElement(getChangeIcon(totalChange24h), { className: "w-4 h-4" })}
            <span className="text-sm font-semibold">
              {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
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
            className={`p-4 rounded-lg border border-white/10 ${
              selectedWallet === wallet.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/10'
            }`}
            onClick={() => setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="font-semibold text-white">{wallet.name}</h4>
                  <p className="text-xs text-gray-400 font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {showBalances ? formatCurrency(wallet.totalValueUSD) : '••••••'}
                </div>
                <div className={`flex items-center justify-end space-x-1 ${getChangeColor(wallet.change24h)}`}>
                  {React.createElement(getChangeIcon(wallet.change24h), { className: "w-3 h-3" })}
                  <span className="text-xs font-semibold">
                    {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h.toFixed(2)}%
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
                className="space-y-3 mt-4 pt-4 border-t border-white/10"
              >
                <h5 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span>Token Holdings</span>
                </h5>
                
                {wallet.tokens.map((token, tokenIndex) => (
                  <div key={tokenIndex} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {showBalances ? formatBalance(token.balance) : '••••'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {showBalances ? formatCurrency(token.balanceUSD) : '••••••'}
                      </div>
                      <div className={`text-xs ${getChangeColor(token.change24h)}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="w-16">
                      <div className="text-xs text-gray-400 mb-1">{token.percentage.toFixed(1)}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${token.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* NFTs */}
                {wallet.nfts.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-semibold text-gray-300 mb-2">NFTs</h6>
                    <div className="grid grid-cols-2 gap-2">
                      {wallet.nfts.map((nft, nftIndex) => (
                        <div key={nftIndex} className="p-2 bg-black/20 rounded-lg">
                          <div className="text-xs font-semibold text-white">{nft.name}</div>
                          <div className="text-xs text-gray-400">
                            {showBalances && nft.valueUSD ? formatCurrency(nft.valueUSD) : '••••'}
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
        <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">View on Explorer</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
    </div>
  )
}
