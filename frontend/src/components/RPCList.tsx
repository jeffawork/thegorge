import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Eye, Download } from 'lucide-react'
import { useRPC } from '../contexts/RPCContext'
import { RPCCard } from './RPCCard'
import { EmptyState } from './EmptyState'

export const RPCList: React.FC = () => {
  const { rpcs, loading } = useRPC()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
        <p className="text-gray-300">Loading RPC endpoints...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <motion.h2
          className="text-2xl font-bold text-white flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-1 h-8 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full" />
          RPC Endpoints
        </motion.h2>

        <div className="flex items-center gap-3">
          <motion.button
            className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
            View All
          </motion.button>

          <motion.button
            className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {rpcs.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No RPC Endpoints"
          description="Add your first RPC endpoint to start monitoring"
          actionText="Add RPC"
          onAction={() => {
            // This will be handled by the header button
            document.dispatchEvent(new CustomEvent('openAddRPCModal'))
          }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {rpcs.map((rpc, index) => (
              <RPCCard key={rpc.id} rpc={rpc} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
