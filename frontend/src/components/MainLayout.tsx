import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { Navigation } from './Navigation'

interface MainLayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Animation - Disabled for cleaner look */}
      {/* <div className="fixed inset-0 pointer-events-none">
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
      </div> */}

      {/* Sidebar Navigation - Fixed */}
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      
      {/* Main Content Area - Offset for fixed navigation */}
      <div className="ml-64 flex flex-col min-h-screen relative z-10">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  )
}
