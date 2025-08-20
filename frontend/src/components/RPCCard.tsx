import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Clock, Edit, Trash2, Zap } from 'lucide-react'
import { RPC } from '../contexts/RPCContext'
import { useRPC } from '../contexts/RPCContext'

interface RPCCardProps {
  rpc: RPC
  index: number
}

export const RPCCard: React.FC<RPCCardProps> = ({ rpc, index }) => {
  const { testRPC, deleteRPC } = useRPC()

  const getStatusConfig = () => {
    switch (rpc.status) {
      case 'online':
        return {
          icon: Wifi,
          text: 'Online',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          borderColor: 'border-green-400/30',
        }
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/30',
        }
      default:
        return {
          icon: Clock,
          text: 'Testing',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/30',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${rpc.name}"?`)) {
      await deleteRPC(rpc.id)
    }
  }

  const handleTest = async () => {
    await testRPC(rpc.id)
  }

  return (
    <motion.div
      className={`glass-card p-6 ${config.bgColor} ${config.borderColor} border`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {rpc.name}
          </h3>
          <p className="text-sm text-gray-300">
            {rpc.network}
            {rpc.chainId && ` (Chain ID: ${rpc.chainId})`}
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
          <Icon className="w-3 h-3 inline mr-1" />
          {config.text}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-white mb-1">
            {rpc.responseTime ? `${rpc.responseTime}ms` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Response Time
          </div>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-white mb-1">
            {rpc.uptime ? `${rpc.uptime}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Uptime
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          className="flex-1 glass-button px-3 py-2 text-xs font-medium flex items-center justify-center gap-2"
          onClick={handleTest}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={rpc.status === 'testing'}
        >
          <Zap className="w-3 h-3" />
          {rpc.status === 'testing' ? 'Testing...' : 'Test'}
        </motion.button>

        <motion.button
          className="glass-button px-3 py-2 text-xs font-medium flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Edit className="w-3 h-3" />
          Edit
        </motion.button>

        <motion.button
          className="glass-button px-3 py-2 text-xs font-medium flex items-center justify-center gap-2 text-red-400 hover:text-red-300"
          onClick={handleDelete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </motion.button>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Priority: {rpc.priority}</span>
          <span>Timeout: {rpc.timeout}ms</span>
        </div>
        {rpc.lastChecked && (
          <div className="text-xs text-gray-400 mt-1">
            Last checked: {new Date(rpc.lastChecked).toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  )
}
