import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Plus, RefreshCw } from 'lucide-react'
import { useConnection } from '../contexts/ConnectionContext'
import { useRPC } from '../contexts/RPCContext'
import { AddRPCModal } from './AddRPCModal'

export const Header: React.FC = () => {
  const { isConnected } = useConnection()
  const { refreshRPCs } = useRPC()
  const [showAddModal, setShowAddModal] = React.useState(false)

  const handleRefresh = async () => {
    await refreshRPCs()
  }

  return (
    <>
      <motion.header
        className="glass-card mb-8 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            
            <div>
              <motion.h1
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                The Gorge
              </motion.h1>
              <motion.p
                className="text-gray-300 text-sm lg:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Real-time blockchain infrastructure monitoring
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-medium"
              onClick={handleRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>

            <motion.button
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add RPC
            </motion.button>
          </div>
        </div>

        {/* Connection Status Indicator */}
        <motion.div
          className="flex items-center gap-2 mt-4 lg:mt-0 lg:absolute lg:top-6 lg:right-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </motion.div>
      </motion.header>

      <AddRPCModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}
