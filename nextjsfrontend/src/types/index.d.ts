import { registerSchema } from "@/lib/utils";

declare global {
  // Authentication types

  type AuthFormTypes =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'


  // Registeration Types
  
// Authentication Store tyoes
 interface User {
  id:string
  email: string
  name: string
  role?: string
  avatar?: string
}
  interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// AuthApi types

interface loginCredentials {
 email: string;
 password: string;
}

type registerCredentials = z.infer<typeof registerSchema>;

// RpcApi types 

interface RpcCredentials {
  name: string
  url: string
  network: string
  chainId: number
  timeout: number
  enabled: boolean
  priority: number
}
interface RpcTestCredentials {
  name: string
  url: string
  network: string
  chainId: number
  timeout: number
}

interface UpdateRpcCredentials {
  name: string
  url: string
  priority: number
}

// Alert Types
interface Alert {
 id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  severity: 'low' | 'medium' | 'high' | 'critical'
  rpcId?: string
  resolved: boolean
  createdAt: Date
  resolvedAt?: Date
}


// Dashboard
interface ActivePanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed?: boolean;
  onMenuToggle: () => void;

}

interface RPCSyncState {
  id: string
  name: string
  url: string
  chainId: number
  syncStatus: 'synced' | 'syncing' | 'behind' | 'stuck' | 'unknown'
  currentBlock: number
  latestBlock: number
  syncProgress: number
  blocksBehind: number
  syncSpeed: number
  healthScore: number
  lastUpdate: Date
}

// wllet pge
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


}


export {};