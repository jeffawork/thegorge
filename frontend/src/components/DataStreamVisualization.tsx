import React from 'react'
import { motion } from 'framer-motion'

interface DataStreamVisualizationProps {
  isActive?: boolean
  className?: string
}

export const DataStreamVisualization: React.FC<DataStreamVisualizationProps> = ({ 
  isActive = true, 
  className = '' 
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Data Stream Lines */}
      {isActive && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          <motion.div
            className="absolute top-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent opacity-60"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute top-4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-40"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 1
            }}
          />
        </>
      )}
    </div>
  )
}

export const BlockchainPulse: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        scale: [1, 1.02, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

export const NetworkTopology: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Network Nodes */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-[#00D4FF] rounded-full animate-pulse" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-[#00FFFF] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-6 left-8 w-2.5 h-2.5 bg-[#00FF88] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#FFB800] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.line
          x1="16"
          y1="16"
          x2="calc(100% - 32px)"
          y2="calc(100% - 32px)"
          stroke="url(#gradient1)"
          strokeWidth="1"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line
          x1="16"
          y1="16"
          x2="calc(100% - 32px)"
          y2="32"
          stroke="url(#gradient2)"
          strokeWidth="1"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00FFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
