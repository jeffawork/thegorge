import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Server, Link, Hash, Clock, Flag, ToggleRight, Zap } from 'lucide-react'
import { useRPC } from '../contexts/RPCContext'

interface AddRPCModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AddRPCModal: React.FC<AddRPCModalProps> = ({ isOpen, onClose }) => {
  const { addRPC } = useRPC()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChainId, setShowChainId] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    network: '',
    chainId: '',
    timeout: 10000,
    priority: 2,
    enabled: true,
  })

  const handleNetworkChange = (network: string) => {
    let chainId = ''
    switch (network) {
      case 'ethereum':
        chainId = '1'
        break
      case 'polygon':
        chainId = '137'
        break
      case 'bsc':
        chainId = '56'
        break
      case 'arbitrum':
        chainId = '42161'
        break
      case 'optimism':
        chainId = '10'
        break
      case 'custom':
        chainId = ''
        break
      default:
        chainId = ''
    }
    
    setFormData(prev => ({ 
      ...prev, 
      network,
      chainId: network === 'custom' ? '' : chainId
    }))
    setShowChainId(network === 'custom')
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const testConnection = async () => {
    if (!formData.url) return
    
    // This would typically call an API endpoint to test the connection
    console.log('Testing connection to:', formData.url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Ensure chainId is provided for non-custom networks
      if (!formData.chainId && formData.network !== 'custom') {
        throw new Error('Chain ID is required for this network')
      }

      await addRPC({
        ...formData,
        chainId: formData.chainId ? parseInt(formData.chainId) : 1, // Default to 1 if empty
        timeout: parseInt(formData.timeout.toString()),
        priority: parseInt(formData.priority.toString()),
      })
      
      // Reset form and close modal
      setFormData({
        name: '',
        url: '',
        network: '',
        chainId: '',
        timeout: 10000,
        priority: 2,
        enabled: true,
      })
      setShowChainId(false)
      onClose()
    } catch (error) {
      console.error('Failed to add RPC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="glass-card p-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Add New RPC Endpoint
                    </h2>
                  </div>
                  <motion.button
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* RPC Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      RPC Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., My Ethereum Node"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* RPC URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      RPC URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://eth-mainnet.rpc.x.superfluid.dev"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Network */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Network *
                    </label>
                    <select
                      required
                      value={formData.network}
                      onChange={(e) => handleNetworkChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    >
                      <option value="">Select a network...</option>
                      <option value="ethereum">Ethereum Mainnet</option>
                      <option value="polygon">Polygon</option>
                      <option value="bsc">Binance Smart Chain</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="custom">Custom Network</option>
                    </select>
                  </div>

                  {/* Chain ID */}
                  {showChainId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Chain ID *
                      </label>
                      <input
                        type="number"
                        required={showChainId}
                        value={formData.chainId}
                        onChange={(e) => handleInputChange('chainId', e.target.value)}
                        placeholder="1 for Ethereum Mainnet"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                      />
                    </motion.div>
                  )}

                  {/* Timeout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                      min="1000"
                      max="60000"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    >
                      <option value={1}>High</option>
                      <option value={2}>Medium</option>
                      <option value={3}>Low</option>
                    </select>
                  </div>

                  {/* Enabled */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => handleInputChange('enabled', e.target.checked)}
                        className="w-4 h-4 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-400 focus:ring-2"
                      />
                      <ToggleRight className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-gray-300">
                        Enable monitoring
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      className="flex-1 glass-button px-4 py-3 flex items-center justify-center gap-2 font-medium"
                      onClick={testConnection}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Zap className="w-4 h-4" />
                      Test Connection
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Server className="w-4 h-4" />
                          Add RPC
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
