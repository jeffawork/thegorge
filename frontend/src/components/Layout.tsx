import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { ConnectionStatus } from './ConnectionStatus'

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />
    </div>
  )
}
