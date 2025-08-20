import React from 'react'
import { motion } from 'framer-motion'
import { Server, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { useRPC } from '../contexts/RPCContext'
import { useAlert } from '../contexts/AlertContext'

export const StatusOverview: React.FC = () => {
  const { rpcs } = useRPC()
  const { alerts } = useAlert()

  const stats = [
    {
      title: 'Total RPCs',
      value: rpcs.length,
      icon: Server,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      trend: '+2.5%',
      trendType: 'positive' as const,
    },
    {
      title: 'Online',
      value: rpcs.filter(rpc => rpc.status === 'online').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      trend: '+1.2%',
      trendType: 'positive' as const,
    },
    {
      title: 'Offline',
      value: rpcs.filter(rpc => rpc.status === 'offline').length,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      trend: '-0.8%',
      trendType: 'negative' as const,
    },
    {
      title: 'Active Alerts',
      value: alerts.filter(alert => !alert.resolved).length,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      trend: '0.0%',
      trendType: 'neutral' as const,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }

  return (
    <div>
      <motion.h2
        className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full" />
        System Overview
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            className={`glass-card p-6 ${stat.bgColor} ${stat.borderColor} border`}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${
                  stat.trendType === 'positive' ? 'text-green-400' :
                  stat.trendType === 'negative' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {stat.trend}
                </span>
                {stat.trendType === 'positive' && <TrendingUp className="w-3 h-3 text-green-400 ml-1 inline" />}
                {stat.trendType === 'negative' && <TrendingDown className="w-3 h-3 text-red-400 ml-1 inline" />}
              </div>
            </div>

            <div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
