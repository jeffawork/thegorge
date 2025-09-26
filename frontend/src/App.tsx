import { useState } from 'react'
import { RPCProvider } from './contexts/RPCContext'
import { AlertProvider } from './contexts/AlertContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MainLayout } from './components/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { EnhancedDashboard } from './pages/EnhancedDashboard'
import { RPCSyncPage } from './pages/RPCSyncPage'
import { WalletPortfolioPage } from './pages/WalletPortfolioPage'
import { AlertsPage } from './pages/AlertsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AnomaliesPage } from './pages/AnomaliesPage'
import { SettingsPage } from './pages/SettingsPage'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <EnhancedDashboard />
      case 'rpc-sync':
        return <RPCSyncPage />
      case 'portfolio':
        return <WalletPortfolioPage />
      case 'alerts':
        return <AlertsPage />
      case 'performance':
        return <AnalyticsPage />
      case 'usage-costs':
        return <AnalyticsPage />
      case 'anomalies':
        return <AnomaliesPage />
      case 'general':
      case 'profile':
      case 'notifications':
      case 'security':
      case 'data-privacy':
      case 'appearance':
      case 'team':
      case 'billing':
        return <SettingsPage activeTab={activeTab} />
      default:
        return <EnhancedDashboard />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return (
    <RPCProvider>
      <AlertProvider>
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderPage()}
        </MainLayout>
      </AlertProvider>
    </RPCProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
