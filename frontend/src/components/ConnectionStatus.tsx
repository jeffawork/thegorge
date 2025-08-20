import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnection } from '../contexts/ConnectionContext'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export const ConnectionStatus: React.FC = () => {
  const { connectionStatus, reconnect } = useConnection()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-success-400',
          bgColor: 'bg-success-400/20',
          borderColor: 'border-success-400/30',
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'text-danger-400',
          bgColor: 'bg-danger-400/20',
          borderColor: 'border-danger-400/30',
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Connection Error',
          color: 'text-warning-400',
          bgColor: 'bg-warning-400/20',
          borderColor: 'border-warning-400/30',
        }
      default:
        return {
          icon: Wifi,
          text: 'Connecting...',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-6 left-6 z-50 ${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-full px-4 py-2 flex items-center gap-3 shadow-lg`}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        
        {connectionStatus === 'disconnected' && (
          <motion.button
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-colors"
            onClick={reconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
