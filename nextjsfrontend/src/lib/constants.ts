import { 
  LayoutDashboard, 
  Server, 
  Wallet, 
  Bell, 
  Settings,
  Activity,
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Database,
  Palette,
  Users,
  FileText
} from 'lucide-react'


const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rpc-sync', label: 'RPC Sync', icon: Server },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'usage-costs', label: 'Usage & Costs', icon: DollarSign },
  { id: 'anomalies', label: 'Anomalies', icon: AlertCircle }
]

const settingsItems = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: DollarSign }
]
