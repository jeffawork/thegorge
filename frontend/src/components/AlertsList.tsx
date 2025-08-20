import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Eye, Trash2 } from 'lucide-react'
import { useAlert } from '../contexts/AlertContext'
import { AlertItem } from './AlertItem'
import { EmptyState } from './EmptyState'

export const AlertsList: React.FC = () => {
  const { alerts, loading, clearAlerts } = useAlert()
  const activeAlerts = alerts.filter(alert => !alert.resolved)

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
        <p className="text-gray-300">Loading alerts...</p>
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
          Recent Alerts
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

          {activeAlerts.length > 0 && (
            <motion.button
              className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
              onClick={clearAlerts}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          )}
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Active Alerts"
          description="All systems are running smoothly"
        />
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {activeAlerts.slice(0, 5).map((alert, index) => (
              <AlertItem key={alert.id} alert={alert} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
