import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react'
import { Alert } from '../contexts/AlertContext'
import { useAlert } from '../contexts/AlertContext'

interface AlertItemProps {
  alert: Alert
  index: number
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, index }) => {
  const { resolveAlert } = useAlert()

  const getAlertConfig = () => {
    switch (alert.type) {
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/30',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/30',
        }
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          borderColor: 'border-green-400/30',
        }
      default:
        return {
          icon: Info,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          borderColor: 'border-blue-400/30',
        }
    }
  }

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'text-red-300 bg-red-400/20 border-red-400/30'
      case 'high':
        return 'text-orange-300 bg-orange-400/20 border-orange-400/30'
      case 'medium':
        return 'text-yellow-300 bg-yellow-400/20 border-yellow-400/30'
      default:
        return 'text-blue-300 bg-blue-400/20 border-blue-400/30'
    }
  }

  const config = getAlertConfig()
  const Icon = config.icon

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(date).toLocaleDateString()
  }

  const handleResolve = async () => {
    await resolveAlert(alert.id)
  }

  return (
    <motion.div
      className={`glass-card p-4 ${config.bgColor} ${config.borderColor} border`}
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ x: 5, scale: 1.01 }}
      layout
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-white truncate">
              {alert.title}
            </h4>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Severity Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor()}`}>
                {alert.severity}
              </span>
              
              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatTime(alert.createdAt)}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {alert.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              className="glass-button px-3 py-1 text-xs font-medium flex items-center gap-1"
              onClick={handleResolve}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-3 h-3" />
              Resolve
            </motion.button>

            {alert.rpcId && (
              <span className="text-xs text-gray-400">
                RPC: {alert.rpcId}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
